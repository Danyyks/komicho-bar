// Comanda aberta: o que já foi pedido, a grade de produtos para somar e o "Fechar conta".
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { useDados } from "@/context/DadosContext";
import { useAviso } from "@/context/AvisoContext";
import { CabecalhoDetalhe } from "@/components/Cabecalho";
import { Confirmar } from "@/components/Confirmar";
import { Sheet } from "@/components/Sheet";
import { Botao, BotaoIcone, Campo, CampoValor, Cartao, Chip, TituloSecao } from "@/components/ui";
import { reais, totalItens } from "@/lib/dinheiro";
import { haQuantoTempo } from "@/lib/datas";
import { cn, uid, vibrar } from "@/lib/utils";
import { useVoltar } from "@/hooks/useVoltar";
import { CATEGORIAS_PRODUTO, type CategoriaProduto, type Comanda } from "@/types";
import { FecharConta } from "./FecharConta";

export function ComandaDetalhe() {
  const { id } = useParams();
  const { comandas, carregado, cancelarComanda } = useDados();
  const avisar = useAviso();
  const voltar = useVoltar("/");
  const comanda = comandas.find((c) => c.id === id);

  const [renomear, setRenomear] = useState(false);
  const [cancelar, setCancelar] = useState(false);
  const [fechar, setFechar] = useState(false);
  const [saindo, setSaindo] = useState(false);

  // Comanda sumiu (fechada, cancelada ou link antigo): volta para a lista
  useEffect(() => {
    if (carregado && !comanda && !saindo) voltar();
  }, [carregado, comanda, saindo]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!comanda) return null;
  const total = totalItens(comanda.itens);

  return (
    <>
      <CabecalhoDetalhe
        voltarPara="/"
        titulo={comanda.nome}
        direita={<BotaoIcone icone={Trash2} aria-label="Cancelar comanda" onClick={() => setCancelar(true)} className="text-negativo" />}
      />

      {/* Nome grande (toque para renomear) e há quanto tempo está aberta */}
      <button onClick={() => setRenomear(true)} className="mt-1 flex items-center gap-2 px-1 text-left active:opacity-60">
        <h1 className="text-[30px] leading-tight font-bold tracking-tight">{comanda.nome}</h1>
        <Pencil className="size-4 text-texto-3" />
      </button>
      <p className="px-1 text-[15px] text-texto-2">Aberta {haQuantoTempo(comanda.criadoEm)}</p>

      <ListaItens comanda={comanda} />
      <GradeProdutos comanda={comanda} />

      {/* Rodapé fixo: total e o botão de fechar a conta */}
      <div className="h-32" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-linha bg-fundo/90 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center gap-4 px-4 pt-3">
          <div className="flex-1">
            <p className="text-[14px] font-medium text-texto-2">Total</p>
            <p className="num text-[28px] leading-tight font-bold">{reais(total)}</p>
          </div>
          <Botao
            onClick={() => (comanda.itens.length ? setFechar(true) : avisar("Adicione algum item antes de fechar."))}
            className="px-8"
          >
            Fechar conta
          </Botao>
        </div>
      </div>

      <Renomear comanda={comanda} aberto={renomear} onFechar={() => setRenomear(false)} />

      <Confirmar
        aberto={cancelar}
        onFechar={() => setCancelar(false)}
        titulo="Cancelar comanda?"
        texto="Ela some da lista e nada entra no Balanço. Use quando a comanda foi aberta por engano."
        botao="Cancelar comanda"
        onConfirmar={() => {
          setSaindo(true);
          const desfazer = cancelarComanda(comanda);
          avisar(`${comanda.nome} cancelada`, { desfazer });
          voltar();
        }}
      />

      <FecharConta
        comanda={comanda}
        aberto={fechar}
        onFechar={() => setFechar(false)}
        onFechada={() => {
          setSaindo(true);
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
        Toque nos produtos abaixo para adicionar à comanda.
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
                <p className="truncate text-[17px] font-semibold">{i.nome}</p>
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
                  className="grid size-10 place-items-center rounded-full bg-superficie active:scale-90 dark:bg-[#3a332c]"
                >
                  <Minus className="size-[18px]" strokeWidth={2.6} />
                </button>
                <span className="num w-8 text-center text-[18px] font-bold">{i.qtd}</span>
                <button
                  aria-label={`Somar um ${i.nome}`}
                  onClick={() => {
                    vibrar();
                    mudarQtd(comanda.id, { id: i.produtoId, nome: i.nome, preco: i.preco }, +1);
                  }}
                  className="grid size-10 place-items-center rounded-full bg-superficie active:scale-90 dark:bg-[#3a332c]"
                >
                  <Plus className="size-[18px]" strokeWidth={2.6} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </Cartao>
  );
}

/** Grade de produtos por categoria: cada toque soma 1 na comanda. */
function GradeProdutos({ comanda }: { comanda: Comanda }) {
  const { produtos, mudarQtd } = useDados();

  // Só mostra categorias que têm produto cadastrado
  const categorias = useMemo(() => CATEGORIAS_PRODUTO.filter((c) => produtos.some((p) => p.categoria === c)), [produtos]);
  const [categoria, setCategoria] = useState<CategoriaProduto | undefined>(undefined);
  const atual = categoria && categorias.includes(categoria) ? categoria : categorias[0];
  const visiveis = produtos.filter((p) => p.categoria === atual);

  // Quantas unidades de cada produto já estão na comanda (bolinha no canto do botão)
  const naComanda = new Map(comanda.itens.map((i) => [i.produtoId, i.qtd]));
  const [avulso, setAvulso] = useState(false);

  // Botão de item digitado na hora (nome e valor livres), sempre visível no título
  const botaoAvulso = (
    <button
      onClick={() => setAvulso(true)}
      className="flex h-10 items-center gap-1.5 rounded-full bg-marca-suave pr-4 pl-3 text-[15px] font-semibold text-marca-tinta active:scale-95"
    >
      <Plus className="size-[18px]" strokeWidth={2.6} /> Outro item
    </button>
  );
  const painelAvulso = <ItemAvulso comanda={comanda} aberto={avulso} onFechar={() => setAvulso(false)} />;

  if (produtos.length === 0) {
    return (
      <>
        <TituloSecao acao={botaoAvulso}>Adicionar</TituloSecao>
        <p className="mt-2 text-center text-[16px] text-texto-2">Use Outro item ou cadastre produtos na aba Produtos.</p>
        {painelAvulso}
      </>
    );
  }

  return (
    <>
      <TituloSecao acao={botaoAvulso}>Adicionar</TituloSecao>

      {/* Chips de categoria (rolagem lateral) */}
      <div className="sem-barra -mx-4 flex gap-2 overflow-x-auto px-4 pb-3">
        {categorias.map((c) => (
          <Chip key={c} ativo={c === atual} onClick={() => setCategoria(c)}>
            {c}
          </Chip>
        ))}
      </div>

      {/* Botões grandes de produto */}
      <div className="grid grid-cols-2 gap-3">
        {visiveis.map((p) => {
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
                "relative flex min-h-[92px] flex-col justify-between rounded-3xl p-4 text-left shadow-cartao transition-colors",
                qtd > 0 ? "bg-marca-suave" : "bg-superficie",
              )}
            >
              <span className="line-clamp-2 pr-7 text-[17px] leading-snug font-semibold">{p.nome}</span>
              <span className="num mt-2 text-[15px] font-medium text-texto-2">{reais(p.preco)}</span>
              {/* Bolinha com a quantidade já pedida */}
              <AnimatePresence>
                {qtd > 0 && (
                  <motion.span
                    key={qtd}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 700, damping: 26 }}
                    className="num absolute top-3 right-3 grid h-7 min-w-7 place-items-center rounded-full bg-marca px-1.5 text-[14px] font-bold text-sobre-marca"
                  >
                    {qtd}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      {painelAvulso}
    </>
  );
}

/** Painel "Outro item": adiciona à comanda algo fora do cardápio, com nome e valor digitados. */
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
      <Campo rotulo="Nome do item" placeholder="Ex.: Salgado, cigarro" value={nome} onChange={(e) => setNome(e.target.value)} autoCapitalize="sentences" />

      <div className="py-6">
        <CampoValor rotulo="Valor de cada um" valor={preco} onMudar={setPreco} />
      </div>

      {/* Quantidade com − e + */}
      <div className="flex items-center justify-between rounded-2xl bg-elevado py-2 pr-2 pl-4">
        <span className="text-[17px] font-medium">Quantidade</span>
        <div className="flex items-center gap-1">
          <button
            aria-label="Diminuir quantidade"
            onClick={() => setQtd((q) => Math.max(1, q - 1))}
            className="grid size-11 place-items-center rounded-full bg-superficie active:scale-90 dark:bg-[#3a332c]"
          >
            <Minus className="size-5" strokeWidth={2.6} />
          </button>
          <span className="num w-10 text-center text-[20px] font-bold">{qtd}</span>
          <button
            aria-label="Aumentar quantidade"
            onClick={() => setQtd((q) => Math.min(99, q + 1))}
            className="grid size-11 place-items-center rounded-full bg-superficie active:scale-90 dark:bg-[#3a332c]"
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
