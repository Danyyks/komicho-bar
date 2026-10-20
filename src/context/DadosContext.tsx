// Fonte única dos dados do app: escuta as coleções e expõe as ações (abrir comanda,
// fechar conta, anotar gasto...). As telas só leem daqui e chamam as ações.
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { colecaoLocalVazia, criarRepo, gravarJuntos, type Operacao } from "@/lib/repo";
import { modoDemo, nuvemLigada } from "@/lib/firebase";
import { cardapioExemplo, dadosDemo } from "@/lib/seed";
import { totalItens } from "@/lib/dinheiro";
import { uid } from "@/lib/utils";
import type {
  CategoriaGasto,
  Cliente,
  Comanda,
  Entidade,
  FormaPagamento,
  Lancamento,
  MovimentoFiado,
  Produto,
} from "@/types";

// Um repositório por coleção do banco
const repos = {
  produtos: criarRepo<Produto>("produtos"),
  comandas: criarRepo<Comanda>("comandas"),
  clientes: criarRepo<Cliente>("clientes"),
  fiado: criarRepo<MovimentoFiado>("fiado"),
  lancamentos: criarRepo<Lancamento>("lancamentos"),
};

/** Como a conta foi paga ao fechar uma comanda. */
export type Pagamento = { forma: FormaPagamento } | { fiado: string /* clienteId */ };

/** Função devolvida pelas ações que apagam algo: chamada pelo botão "Desfazer". */
export type Desfazer = () => void;

function useDadosInterno() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fiado, setFiado] = useState<MovimentoFiado[]>([]);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [carregado, setCarregado] = useState(false);
  // Cópia sempre atual das comandas, lida nas ações (o estado do React chega um render depois)
  const comandasRef = useRef<Comanda[]>([]);

  // Primeira abertura no modo local: cria o cardápio de exemplo (ou o banco demo inteiro)
  useEffect(() => {
    if (nuvemLigada || !colecaoLocalVazia("produtos")) return;
    if (modoDemo) {
      const demo = dadosDemo();
      const ops: Operacao[] = [];
      for (const [colecao, itens] of Object.entries(demo)) {
        for (const item of itens as Entidade[]) ops.push({ tipo: "set", colecao, item });
      }
      gravarJuntos(ops);
    } else {
      gravarJuntos(cardapioExemplo().map((item) => ({ tipo: "set", colecao: "produtos", item })));
    }
  }, []);

  // Escuta todas as coleções em tempo real
  useEffect(() => {
    const parar = [
      repos.produtos.assinar((p) => {
        setProdutos(p.sort((a, b) => a.criadoEm - b.criadoEm));
        setCarregado(true);
      }),
      repos.comandas.assinar((c) => {
        const ordenadas = c.sort((a, b) => a.criadoEm - b.criadoEm);
        comandasRef.current = ordenadas;
        setComandas(ordenadas);
      }),
      repos.clientes.assinar(setClientes),
      repos.fiado.assinar((f) => setFiado(f.sort((a, b) => b.data - a.data))),
      repos.lancamentos.assinar(setLancamentos),
    ];
    return () => parar.forEach((fn) => fn());
  }, []);

  // ---------- Produtos ----------

  const salvarProduto = (p: Omit<Produto, "id" | "criadoEm"> & { id?: string }) => {
    if (p.id) repos.produtos.atualizar(p.id, p);
    else repos.produtos.criar(p);
  };

  const removerProduto = (p: Produto): Desfazer => {
    repos.produtos.remover(p.id);
    return () => repos.produtos.salvar(p);
  };

  const usarCardapioExemplo = () =>
    gravarJuntos(cardapioExemplo().map((item) => ({ tipo: "set", colecao: "produtos", item })));

  // ---------- Comandas ----------

  const abrirComanda = (nome: string): Comanda => repos.comandas.criar({ nome: nome.trim(), itens: [] });

  const renomearComanda = (id: string, nome: string) => repos.comandas.atualizar(id, { nome: nome.trim() });

  /** Soma (+1) ou tira (-1) um produto da comanda; com zero, o item sai da lista. */
  const mudarQtd = (comandaId: string, produto: Pick<Produto, "id" | "nome" | "preco">, delta: number) => {
    // Usa a versão mais recente (ref) para não perder toques rápidos seguidos
    const comanda = comandasRef.current.find((c) => c.id === comandaId);
    if (!comanda) return;
    const existente = comanda.itens.find((i) => i.produtoId === produto.id);
    const itens = existente
      ? comanda.itens
          .map((i) => (i.produtoId === produto.id ? { ...i, qtd: i.qtd + delta } : i))
          .filter((i) => i.qtd > 0)
      : delta > 0
        ? [...comanda.itens, { produtoId: produto.id, nome: produto.nome, preco: produto.preco, qtd: delta }]
        : comanda.itens;
    comandasRef.current = comandasRef.current.map((c) => (c.id === comandaId ? { ...c, itens } : c));
    repos.comandas.atualizar(comandaId, { itens });
  };

  /** Cancela a comanda sem registrar venda (ex.: aberta por engano). */
  const cancelarComanda = (c: Comanda): Desfazer => {
    repos.comandas.remover(c.id);
    return () => repos.comandas.salvar(c);
  };

  /** Fecha a conta: vira entrada no Balanço ou conta no fiado, e a comanda some. */
  const fecharComanda = (c: Comanda, pagamento: Pagamento, valorFinal?: number): Desfazer => {
    const valor = valorFinal ?? totalItens(c.itens);
    const agora = Date.now();
    const base = { id: uid(), criadoEm: agora, valor, data: agora, itens: c.itens };
    const registro: Operacao =
      "forma" in pagamento
        ? { tipo: "set", colecao: "lancamentos", item: { ...base, tipo: "entrada", origem: "comanda", forma: pagamento.forma, descricao: c.nome } as Lancamento }
        : { tipo: "set", colecao: "fiado", item: { ...base, tipo: "conta", clienteId: pagamento.fiado, descricao: c.nome } as MovimentoFiado };
    gravarJuntos([registro, { tipo: "remove", colecao: "comandas", id: c.id }]);
    // Desfazer: devolve a comanda e apaga o registro criado
    return () =>
      gravarJuntos([
        { tipo: "remove", colecao: registro.colecao, id: base.id },
        { tipo: "set", colecao: "comandas", item: c },
      ]);
  };

  // ---------- Fiado ----------

  const criarCliente = (nome: string): Cliente => repos.clientes.criar({ nome: nome.trim() });

  const renomearCliente = (id: string, nome: string) => repos.clientes.atualizar(id, { nome: nome.trim() });

  /** Apaga o cliente e todo o histórico dele (os pagamentos já recebidos continuam no Balanço). */
  const removerCliente = (c: Cliente): Desfazer => {
    const historico = fiado.filter((m) => m.clienteId === c.id);
    gravarJuntos([
      { tipo: "remove", colecao: "clientes", id: c.id },
      ...historico.map((m): Operacao => ({ tipo: "remove", colecao: "fiado", id: m.id })),
    ]);
    return () =>
      gravarJuntos([
        { tipo: "set", colecao: "clientes", item: c },
        ...historico.map((m): Operacao => ({ tipo: "set", colecao: "fiado", item: m })),
      ]);
  };

  /** Pendura um valor avulso na conta do cliente (sem comanda). */
  const anotarNoFiado = (clienteId: string, valor: number, descricao: string) =>
    repos.fiado.criar({ clienteId, tipo: "conta", valor, data: Date.now(), descricao: descricao.trim() || "Anotado" });

  /** Recebe um pagamento do fiado: abate da conta e entra no Balanço ao mesmo tempo. */
  const receberFiado = (cliente: Cliente, valor: number, forma: FormaPagamento) => {
    const agora = Date.now();
    const lancamento: Lancamento = { id: uid(), criadoEm: agora, tipo: "entrada", valor, data: agora, origem: "fiado", forma, descricao: `Fiado de ${cliente.nome}`, clienteId: cliente.id };
    const movimento: MovimentoFiado = { id: uid(), criadoEm: agora, clienteId: cliente.id, tipo: "pagamento", valor, data: agora, descricao: "Pagamento", lancamentoId: lancamento.id };
    gravarJuntos([
      { tipo: "set", colecao: "lancamentos", item: lancamento },
      { tipo: "set", colecao: "fiado", item: movimento },
    ]);
  };

  /** Apaga um movimento do fiado (e o lançamento ligado a ele, se for pagamento). */
  const removerMovimento = (m: MovimentoFiado): Desfazer => {
    const ligado = m.lancamentoId ? lancamentos.find((l) => l.id === m.lancamentoId) : undefined;
    gravarJuntos([
      { tipo: "remove", colecao: "fiado", id: m.id },
      ...(ligado ? [{ tipo: "remove", colecao: "lancamentos", id: ligado.id } as Operacao] : []),
    ]);
    return () =>
      gravarJuntos([
        { tipo: "set", colecao: "fiado", item: m },
        ...(ligado ? [{ tipo: "set", colecao: "lancamentos", item: ligado } as Operacao] : []),
      ]);
  };

  // ---------- Balanço ----------

  /** Anota uma venda avulsa ou um gasto (ou edita um lançamento existente). */
  const salvarLancamento = (dados: {
    id?: string;
    tipo: "entrada" | "saida";
    valor: number;
    data: number;
    forma?: FormaPagamento;
    categoria?: CategoriaGasto;
    descricao: string;
  }) => {
    if (dados.id) {
      repos.lancamentos.atualizar(dados.id, dados);
      return;
    }
    repos.lancamentos.criar({ ...dados, origem: dados.tipo === "entrada" ? "avulsa" : "gasto" });
  };

  /** Apaga um lançamento (se for pagamento de fiado, a dívida volta para o cliente). */
  const removerLancamento = (l: Lancamento): Desfazer => {
    const movimento = fiado.find((m) => m.lancamentoId === l.id);
    gravarJuntos([
      { tipo: "remove", colecao: "lancamentos", id: l.id },
      ...(movimento ? [{ tipo: "remove", colecao: "fiado", id: movimento.id } as Operacao] : []),
    ]);
    return () =>
      gravarJuntos([
        { tipo: "set", colecao: "lancamentos", item: l },
        ...(movimento ? [{ tipo: "set", colecao: "fiado", item: movimento } as Operacao] : []),
      ]);
  };

  return {
    carregado,
    produtos,
    comandas,
    clientes,
    fiado,
    lancamentos,
    salvarProduto,
    removerProduto,
    usarCardapioExemplo,
    abrirComanda,
    renomearComanda,
    mudarQtd,
    cancelarComanda,
    fecharComanda,
    criarCliente,
    renomearCliente,
    removerCliente,
    anotarNoFiado,
    receberFiado,
    removerMovimento,
    salvarLancamento,
    removerLancamento,
  };
}

type Dados = ReturnType<typeof useDadosInterno>;
const DadosContext = createContext<Dados | null>(null);

/** Provedor: monte uma vez no topo do app (depois do login). */
export function DadosProvider({ children }: { children: ReactNode }) {
  const dados = useDadosInterno();
  return <DadosContext.Provider value={dados}>{children}</DadosContext.Provider>;
}

/** Acesso aos dados e ações em qualquer tela. */
export function useDados(): Dados {
  const ctx = useContext(DadosContext);
  if (!ctx) throw new Error("useDados precisa estar dentro de <DadosProvider>");
  return ctx;
}
