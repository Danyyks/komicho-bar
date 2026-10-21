// Comanda aberta: o que o cliente pediu (substitui a comanda de papel). Cada item é
// digitado na hora (nome, valor e quantidade); no rodapé, "Pagou como?" fecha a conta.
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Banknote, BookUser, CreditCard, Minus, Pencil, Plus, QrCode } from "lucide-react";
import { useDados, type Pagamento } from "@/context/DadosContext";
import { useAviso } from "@/context/AvisoContext";
import { CabecalhoDetalhe } from "@/components/Cabecalho";
import { Confirmar } from "@/components/Confirmar";
import { Sheet } from "@/components/Sheet";
import { TecladoValor } from "@/components/Teclado";
import { Botao, BotaoEscolha, BotaoGrande, Campo, Cartao } from "@/components/ui";
import { reais, totalItens } from "@/lib/dinheiro";
import { haQuantoTempo } from "@/lib/datas";
import { uid, vibrar } from "@/lib/utils";
import { useVoltar } from "@/hooks/useVoltar";
import type { Comanda } from "@/types";
import { AjustarValor, PagarDinheiro, PendurarFiado } from "./FecharConta";

export function ComandaDetalhe() {
  const { id } = useParams();
  const { comandas, carregado, cancelarComanda, fecharComanda } = useDados();
  const avisar = useAviso();
  const voltar = useVoltar("/");
  const comanda = comandas.find((c) => c.id === id);

  const [painel, setPainel] = useState<"item" | "renomear" | "cancelar" | "dinheiro" | "fiado" | "ajuste" | null>(null);
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

      {/* Anotar um item: nome, valor e quantidade digitados na hora */}
      <div className="mt-4">
        <BotaoGrande cor="marca" icone={Plus} titulo="Adicionar item" detalhe="Nome, valor e quantidade" onClick={() => setPainel("item")} />
      </div>

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

      <NovoItem comanda={comanda} aberto={painel === "item"} onFechar={() => setPainel(null)} />
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
        Nada anotado ainda. Toque em Adicionar item.
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

/** Painel "Adicionar item": nome, valor (teclado de calculadora) e quantidade. */
function NovoItem({ comanda, aberto, onFechar }: { comanda: Comanda; aberto: boolean; onFechar: () => void }) {
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
    const nomeFinal = nome.trim() || "Item";
    // Cada item digitado vira uma linha nova, com id próprio
    mudarQtd(comanda.id, { id: `item-${uid()}`, nome: nomeFinal, preco }, qtd);
    vibrar();
    onFechar();
    avisar(`${qtd}× ${nomeFinal} na comanda`);
  }

  return (
    <Sheet
      aberto={aberto}
      onFechar={onFechar}
      titulo="Adicionar item"
      rodape={
        <Botao bloco onClick={adicionar}>
          Adicionar {preco > 0 ? reais(preco * qtd) : ""}
        </Botao>
      }
    >
      <Campo rotulo="O que foi?" placeholder="Ex.: Cerveja, pinga, torresmo" value={nome} onChange={(e) => setNome(e.target.value)} autoCapitalize="sentences" />

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
