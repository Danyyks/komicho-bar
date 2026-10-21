// Comanda aberta: o que o cliente pediu (substitui a comanda de papel), os produtos para
// somar e, no rodapé, "Pagou como?": Pix e Cartão fecham com um toque.
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Banknote, BookUser, CreditCard, Minus, Pencil, Plus, QrCode } from "lucide-react";
import { useDados, type Pagamento } from "@/context/DadosContext";
import { useAviso } from "@/context/AvisoContext";
import { CabecalhoDetalhe } from "@/components/Cabecalho";
import { Confirmar } from "@/components/Confirmar";
import { Sheet } from "@/components/Sheet";
import { TecladoValor } from "@/components/Teclado";
import { Botao, BotaoEscolha, Campo, Cartao, TituloSecao } from "@/components/ui";
import { reais, totalItens } from "@/lib/dinheiro";
import { haQuantoTempo } from "@/lib/datas";
import { cn, uid, vibrar } from "@/lib/utils";
import { useVoltar } from "@/hooks/useVoltar";
import { CATEGORIAS_PRODUTO, type Comanda, type Produto } from "@/types";
import { AjustarValor, PagarDinheiro, PendurarFiado } from "./FecharConta";

export function ComandaDetalhe() {
  const { id } = useParams();
  const { comandas, carregado, cancelarComanda, fecharComanda } = useDados();
  const avisar = useAviso();
  const voltar = useVoltar("/");
  const comanda = comandas.find((c) => c.id === id);

  const [painel, setPainel] = useState<"renomear" | "cancelar" | "dinheiro" | "fiado" | "ajuste" | null>(null);
  const [ajustado, setAjustado] = useState<number | null>(null); // valor com desconto (null = total)
  const [saindo, setSaindo] = useState(false);

  // Comanda sumiu (fechada, cancelada ou link antigo): volta para a tela Hoje
  useEffect(() => {
    if (carregado && !comanda && !saindo) voltar();
  }, [carregado, comanda, saindo]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!comanda) return null;
  const total = totalItens(comanda.itens);
  const cobrar = ajustado ?? total;

  /** Fecha a conta, volta para a tela Hoje e mostra o aviso com "Desfazer". */
  function fechar(pagamento: Pagamento, texto: string) {
    if (!comanda) return;
    setSaindo(true);
    const desfazer = fecharComanda(comanda, pagamento, cobrar);
    voltar();
    avisar(texto, { desfazer });
  }

  /** Toque numa forma de pagamento: Pix/Cartão fecham na hora; Dinheiro e Fiado abrem painel. */
  function pagar(forma: "dinheiro" | "pix" | "cartao" | "fiado") {
    if (!comanda?.itens.length) return avisar("Adicione algum item antes de fechar.");
    if (forma === "pix") return fechar({ forma: "pix" }, `${comanda.nome} pagou no Pix`);
    if (forma === "cartao") return fechar({ forma: "cartao" }, `${comanda.nome} pagou no cartão`);
    setPainel(forma);
  }

  return (
    <>
      <CabecalhoDetalhe voltarPara="/" titulo={comanda.nome} />

      {/* Nome grande (toque para renomear) e há quanto tempo está aberta */}
      <button onClick={() => setPainel("renomear")} className="mt-1 flex items-center gap-2 px-1 text-left active:opacity-60">
        <h1 className="text-[30px] leading-tight font-bold tracking-tight">{comanda.nome}</h1>
        <Pencil className="size-4 text-texto-3" />
      </button>
      <p className="px-1 text-[15px] text-texto-2">Aberta {haQuantoTempo(comanda.criadoEm)}</p>

      <ListaItens comanda={comanda} />
      <GradeProdutos comanda={comanda} />

      {/* Cancelar fica no fim da página, escrito por extenso (nada de ícone solto) */}
      <button onClick={() => setPainel("cancelar")} className="mt-8 h-12 w-full rounded-2xl text-[16px] font-semibold text-negativo active:bg-negativo-suave">
        Cancelar esta comanda
      </button>

      {/* Espaço para o rodapé fixo não cobrir o fim da lista */}
      <div className="h-56" />

      {/* Rodapé fixo: total + "Pagou como?" */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-linha bg-fundo/92 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur-xl">
        <div className="mx-auto max-w-lg px-4 pt-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[15px] font-medium text-texto-2">Total</p>
              <p className="num text-[30px] leading-tight font-bold">
                {reais(cobrar)}
                {ajustado !== null && <span className="num ml-2 text-[16px] font-medium text-texto-3 line-through">{reais(total)}</span>}
              </p>
            </div>
            <button onClick={() => setPainel("ajuste")} className="mb-1 h-10 rounded-full bg-elevado px-4 text-[15px] font-semibold text-texto-2 active:scale-95">
              Ajustar valor
            </button>
          </div>
          <p className="mt-2 mb-2 text-[15px] font-semibold text-texto-2">Pagou como?</p>
          <div className="grid grid-cols-4 gap-2">
            <BotaoEscolha icone={Banknote} rotulo="Dinheiro" cor="positivo" onClick={() => pagar("dinheiro")} />
            <BotaoEscolha icone={QrCode} rotulo="Pix" cor="positivo" onClick={() => pagar("pix")} />
            <BotaoEscolha icone={CreditCard} rotulo="Cartão" cor="positivo" onClick={() => pagar("cartao")} />
            <BotaoEscolha icone={BookUser} rotulo="Fiado" cor="lilas" onClick={() => pagar("fiado")} />
          </div>
        </div>
      </div>

      <Renomear comanda={comanda} aberto={painel === "renomear"} onFechar={() => setPainel(null)} />
      <PagarDinheiro aberto={painel === "dinheiro"} onFechar={() => setPainel(null)} valor={cobrar} nome={comanda.nome} fechar={fechar} />
      <PendurarFiado aberto={painel === "fiado"} onFechar={() => setPainel(null)} valor={cobrar} nome={comanda.nome} fechar={fechar} />
      <AjustarValor aberto={painel === "ajuste"} onFechar={() => setPainel(null)} total={total} valor={cobrar} onUsar={setAjustado} />
      <Confirmar
        aberto={painel === "cancelar"}
        onFechar={() => setPainel(null)}
        titulo="Cancelar comanda?"
        texto="Ela some da lista e nada entra no caixa. Use quando a comanda foi aberta por engano."
        botao="Cancelar comanda"
        onConfirmar={() => {
          setSaindo(true);
          const desfazer = cancelarComanda(comanda);
          avisar(`${comanda.nome} cancelada`, { desfazer });
          voltar();
        }}
      />
    </>
  );
}

/** Itens já pedidos, com botões de − e + para corrigir a quantidade. */
function ListaItens({ comanda }: { comanda: Comanda }) {
  const { mudarQtd } = useDados();

  if (comanda.itens.length === 0) {
    return (
      <div className="mt-5 rounded-3xl border-2 border-dashed border-linha px-6 py-7 text-center text-[16px] text-texto-2">
        Toque nos produtos abaixo para anotar o que o cliente pediu.
      </div>
    );
  }

  return (
    <Cartao className="mt-5 divide-y divide-linha px-4">
      <AnimatePresence initial={false}>
        {comanda.itens.map((i) => (
          <motion.div
            key={i.produtoId}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[18px] font-semibold">{i.nome}</p>
                <p className="num text-[15px] text-texto-2">{reais(i.preco * i.qtd)}</p>
              </div>
              {/* Contador − qtd + */}
              <div className="flex items-center gap-1 rounded-full bg-elevado p-1">
                <button
                  aria-label={`Tirar um ${i.nome}`}
                  onClick={() => {
                    vibrar();
                    mudarQtd(comanda.id, { id: i.produtoId, nome: i.nome, preco: i.preco }, -1);
                  }}
                  className="grid size-11 place-items-center rounded-full bg-controle active:scale-90"
                >
                  <Minus className="size-5" strokeWidth={2.6} />
                </button>
                <span className="num w-8 text-center text-[19px] font-bold">{i.qtd}</span>
                <button
                  aria-label={`Somar um ${i.nome}`}
                  onClick={() => {
                    vibrar();
                    mudarQtd(comanda.id, { id: i.produtoId, nome: i.nome, preco: i.preco }, +1);
                  }}
                  className="grid size-11 place-items-center rounded-full bg-controle active:scale-90"
                >
                  <Plus className="size-5" strokeWidth={2.6} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </Cartao>
  );
}

/** Produtos para tocar e somar: "Mais pedidos" primeiro e depois cada categoria,
 * tudo em lista para baixo (sem rolar para o lado, como um cardápio de papel). */
function GradeProdutos({ comanda }: { comanda: Comanda }) {
  const { produtos, lancamentos, fiado } = useDados();
  const [avulso, setAvulso] = useState(false);

  // Os 6 produtos que mais saíram nas comandas já fechadas (pagas ou penduradas)
  const maisPedidos = useMemo(() => {
    const contagem = new Map<string, number>();
    for (const registro of [...lancamentos, ...fiado]) {
      for (const i of registro.itens ?? []) contagem.set(i.produtoId, (contagem.get(i.produtoId) ?? 0) + i.qtd);
    }
    return produtos
      .filter((p) => contagem.has(p.id))
      .sort((a, b) => (contagem.get(b.id) ?? 0) - (contagem.get(a.id) ?? 0))
      .slice(0, 6);
  }, [produtos, lancamentos, fiado]);

  // Quantas unidades de cada produto já estão na comanda (bolinha no canto do botão)
  const naComanda = new Map(comanda.itens.map((i) => [i.produtoId, i.qtd]));

  const botaoAvulso = (
    <button
      onClick={() => setAvulso(true)}
      className="flex h-11 items-center gap-1.5 rounded-full bg-marca-suave pr-4 pl-3 text-[16px] font-semibold text-marca-tinta active:scale-95"
    >
      <Plus className="size-5" strokeWidth={2.6} /> Outro item
    </button>
  );

  return (
    <>
      <TituloSecao acao={botaoAvulso}>Adicionar</TituloSecao>
      {produtos.length === 0 && <p className="mt-2 text-center text-[16px] text-texto-2">Use Outro item ou cadastre produtos na aba Produtos.</p>}

      {/* Mais pedidos (só aparece depois de algumas vendas) */}
      {maisPedidos.length >= 3 && <GrupoProdutos titulo="Mais pedidos" produtos={maisPedidos} comanda={comanda} naComanda={naComanda} />}

      {/* Cardápio completo por categoria */}
      {CATEGORIAS_PRODUTO.map((cat) => {
        const daCategoria = produtos.filter((p) => p.categoria === cat);
        return daCategoria.length ? <GrupoProdutos key={cat} titulo={cat} produtos={daCategoria} comanda={comanda} naComanda={naComanda} /> : null;
      })}

      <ItemAvulso comanda={comanda} aberto={avulso} onFechar={() => setAvulso(false)} />
    </>
  );
}

/** Um bloco do cardápio: subtítulo + botões grandes de produto em 2 colunas. */
function GrupoProdutos({ titulo, produtos, comanda, naComanda }: { titulo: string; produtos: Produto[]; comanda: Comanda; naComanda: Map<string, number> }) {
  const { mudarQtd } = useDados();
  return (
    <section>
      <h3 className="mt-5 mb-2.5 px-1 text-[16px] font-bold text-texto-2">{titulo}</h3>
      <div className="grid grid-cols-2 gap-3">
        {produtos.map((p) => {
          const qtd = naComanda.get(p.id) ?? 0;
          return (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 600, damping: 30 }}
              onClick={() => {
                vibrar();
                mudarQtd(comanda.id, p, +1);
              }}
              className={cn(
                "relative flex min-h-[88px] flex-col justify-between rounded-3xl p-4 text-left shadow-cartao transition-colors",
                qtd > 0 ? "bg-marca-suave" : "bg-superficie",
              )}
            >
              <span className="line-clamp-2 pr-7 text-[17px] leading-snug font-semibold">{p.nome}</span>
              <span className="num mt-2 text-[16px] font-medium text-texto-2">{reais(p.preco)}</span>
              {/* Bolinha com a quantidade já pedida */}
              <AnimatePresence>
                {qtd > 0 && (
                  <motion.span
                    key={qtd}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 700, damping: 26 }}
                    className="num absolute top-3 right-3 grid h-8 min-w-8 place-items-center rounded-full bg-marca px-1.5 text-[16px] font-bold text-sobre-marca"
                  >
                    {qtd}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

/** Painel "Outro item": algo fora do cardápio, com nome e valor digitados na hora. */
function ItemAvulso({ comanda, aberto, onFechar }: { comanda: Comanda; aberto: boolean; onFechar: () => void }) {
  const { mudarQtd } = useDados();
  const avisar = useAviso();
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState(0);
  const [qtd, setQtd] = useState(1);

  // Cada vez que abre, começa limpo
  useEffect(() => {
    if (!aberto) return;
    setNome("");
    setPreco(0);
    setQtd(1);
  }, [aberto]);

  function adicionar() {
    if (preco <= 0) return avisar("Digite o valor do item.");
    const nomeFinal = nome.trim() || "Item avulso";
    // Id próprio com prefixo "avulso-": não se mistura com os produtos do cardápio
    mudarQtd(comanda.id, { id: `avulso-${uid()}`, nome: nomeFinal, preco }, qtd);
    vibrar();
    onFechar();
    avisar(`${qtd}× ${nomeFinal} na comanda`);
  }

  return (
    <Sheet
      aberto={aberto}
      onFechar={onFechar}
      titulo="Outro item"
      rodape={
        <Botao bloco onClick={adicionar}>
          Adicionar {preco > 0 ? reais(preco * qtd) : ""}
        </Botao>
      }
    >
      <Campo rotulo="Nome do item (opcional)" placeholder="Ex.: Salgado, cigarro" value={nome} onChange={(e) => setNome(e.target.value)} autoCapitalize="sentences" />

      <div className="mt-5">
        <TecladoValor rotulo="Valor de cada um" valor={preco} onMudar={setPreco} />
      </div>

      {/* Quantidade com − e + */}
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-elevado py-2 pr-2 pl-4">
        <span className="text-[17px] font-medium">Quantidade</span>
        <div className="flex items-center gap-1">
          <button
            aria-label="Diminuir quantidade"
            onClick={() => setQtd((q) => Math.max(1, q - 1))}
            className="grid size-11 place-items-center rounded-full bg-controle active:scale-90"
          >
            <Minus className="size-5" strokeWidth={2.6} />
          </button>
          <span className="num w-10 text-center text-[20px] font-bold">{qtd}</span>
          <button
            aria-label="Aumentar quantidade"
            onClick={() => setQtd((q) => Math.min(99, q + 1))}
            className="grid size-11 place-items-center rounded-full bg-controle active:scale-90"
          >
            <Plus className="size-5" strokeWidth={2.6} />
          </button>
        </div>
      </div>
    </Sheet>
  );
}

/** Painel para trocar o nome da comanda. */
function Renomear({ comanda, aberto, onFechar }: { comanda: Comanda; aberto: boolean; onFechar: () => void }) {
  const { renomearComanda } = useDados();
  const [nome, setNome] = useState(comanda.nome);
  useEffect(() => {
    if (aberto) setNome(comanda.nome);
  }, [aberto, comanda.nome]);

  const salvar = () => {
    if (nome.trim()) renomearComanda(comanda.id, nome);
    onFechar();
  };

  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo="Nome da comanda" rodape={<Botao bloco onClick={salvar}>Salvar</Botao>}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          salvar();
        }}
      >
        <Campo value={nome} onChange={(e) => setNome(e.target.value)} autoCapitalize="words" enterKeyHint="done" />
      </form>
    </Sheet>
  );
}
