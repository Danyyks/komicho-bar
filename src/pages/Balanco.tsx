// Aba Balanço: quanto entrou, saiu e sobrou por dia, semana, mês ou ano,
// com gráfico, resumo por forma/categoria e a lista de lançamentos.
import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  ReceiptText,
  BookUser,
  Trash2,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useDados } from "@/context/DadosContext";
import { useAviso } from "@/context/AvisoContext";
import { CabecalhoAba } from "@/components/Cabecalho";
import { Sheet } from "@/components/Sheet";
import { Botao, BotaoFlutuante, Cartao, Segmentado, TituloSecao } from "@/components/ui";
import { reais, reaisCompacto } from "@/lib/dinheiro";
import { dataEHora, deslocar, periodoDe, type Escala } from "@/lib/datas";
import { resumir, type ResumoBalanco } from "@/lib/balanco";
import { cn } from "@/lib/utils";
import type { Lancamento } from "@/types";
import { AnotarLancamento } from "./AnotarLancamento";

const NOMES_FORMA = { dinheiro: "Dinheiro", pix: "Pix", cartao: "Cartão" } as const;

export function Balanco() {
  const { lancamentos } = useDados();
  const [escala, setEscala] = useState<Escala>("dia");
  const [ref, setRef] = useState(() => new Date());
  const [anotar, setAnotar] = useState<{ aberto: boolean; editar?: Lancamento }>({ aberto: false });
  const [detalhe, setDetalhe] = useState<Lancamento | null>(null);
  const [verTodos, setVerTodos] = useState(false);

  // Período escolhido e o resumo calculado (só recalcula quando algo muda)
  const periodo = useMemo(() => periodoDe(escala, ref), [escala, ref]);
  const resumo = useMemo(() => resumir(lancamentos, periodo), [lancamentos, periodo]);
  const ehAtual = Date.now() >= periodo.inicio && Date.now() < periodo.fim;

  /** Troca a escala voltando para o período de hoje. */
  function mudarEscala(e: Escala) {
    setEscala(e);
    setRef(new Date());
    setVerTodos(false);
  }

  /** Toque numa barra do gráfico: abre o dia (ou o mês, no gráfico do ano). */
  function abrirFatia(inicio: number) {
    setEscala(escala === "ano" ? "mes" : "dia");
    setRef(new Date(inicio));
    setVerTodos(false);
  }

  /** Toque num lançamento: vendas avulsas e gastos abrem para editar; o resto mostra o detalhe. */
  function abrirLancamento(l: Lancamento) {
    if (l.origem === "avulsa" || l.origem === "gasto") setAnotar({ aberto: true, editar: l });
    else setDetalhe(l);
  }

  const lista = verTodos ? resumo.lancamentos : resumo.lancamentos.slice(0, 15);

  return (
    <>
      <CabecalhoAba titulo="Balanço" />

      {/* Escala: Hoje / Semana / Mês / Ano */}
      <Segmentado
        id="escala"
        valor={escala}
        onMudar={mudarEscala}
        opcoes={[
          { valor: "dia", rotulo: "Dia" },
          { valor: "semana", rotulo: "Semana" },
          { valor: "mes", rotulo: "Mês" },
          { valor: "ano", rotulo: "Ano" },
        ]}
      />

      {/* Navegação entre períodos: ‹ Outubro 2026 › */}
      <div className="mt-3 flex items-center justify-between">
        <button aria-label="Período anterior" onClick={() => {
            setRef(deslocar(escala, ref, -1));
            setVerTodos(false);
          }} className="grid size-11 place-items-center rounded-full text-texto-2 active:bg-elevado">
          <ChevronLeft className="size-6" />
        </button>
        <button onClick={() => setRef(new Date())} className="text-[17px] font-semibold" aria-label="Voltar para o período atual">
          {periodo.titulo}
        </button>
        <button
          aria-label="Próximo período"
          onClick={() => {
            setRef(deslocar(escala, ref, +1));
            setVerTodos(false);
          }}
          className={cn("grid size-11 place-items-center rounded-full text-texto-2 active:bg-elevado", ehAtual && "invisible")}
        >
          <ChevronRight className="size-6" />
        </button>
      </div>

      {/* Resultado principal: quanto sobrou (ou faltou) */}
      <motion.div key={periodo.inicio + escala} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
        <div className="pt-3 pb-5 text-center">
          <p className="text-[16px] font-medium text-texto-2">{resumo.sobrou >= 0 ? "Sobrou" : "Faltou"}</p>
          <p className={cn("num mt-1 text-[46px] leading-none font-bold tracking-tight", resumo.sobrou > 0 ? "text-positivo" : resumo.sobrou < 0 ? "text-negativo" : "text-texto")}>
            {reais(Math.abs(resumo.sobrou))}
          </p>
        </div>

        {/* Entrou x Saiu */}
        <div className="grid grid-cols-2 gap-3">
          <Total icone={ArrowDownLeft} rotulo="Entrou" valor={resumo.entrou} cor="positivo" />
          <Total icone={ArrowUpRight} rotulo="Saiu" valor={resumo.saiu} cor="negativo" />
        </div>

        {escala !== "dia" && <Grafico resumo={resumo} onTocar={abrirFatia} />}

        {/* De onde veio e para onde foi o dinheiro */}
        {resumo.entrou > 0 && (
          <>
            <TituloSecao>Como entrou</TituloSecao>
            <Cartao className="px-4 py-2">
              {(Object.keys(NOMES_FORMA) as (keyof typeof NOMES_FORMA)[])
                .filter((f) => resumo.porForma[f] > 0)
                .map((f) => (
                  <Barrinha key={f} rotulo={NOMES_FORMA[f]} valor={resumo.porForma[f]} total={resumo.entrou} cor="bg-positivo" />
                ))}
              {resumo.fiadoRecebido > 0 && <p className="pb-2 text-[14px] text-texto-2">Inclui {reais(resumo.fiadoRecebido)} de fiado recebido.</p>}
            </Cartao>
          </>
        )}
        {resumo.saiu > 0 && (
          <>
            <TituloSecao>Para onde foi</TituloSecao>
            <Cartao className="px-4 py-2">
              {resumo.porCategoria.map((c) => (
                <Barrinha key={c.categoria} rotulo={c.categoria} valor={c.valor} total={resumo.saiu} cor="bg-negativo" />
              ))}
            </Cartao>
          </>
        )}

        {/* Lançamentos do período */}
        <TituloSecao>Lançamentos</TituloSecao>
        {resumo.lancamentos.length === 0 ? (
          <Cartao className="px-5 py-8 text-center">
            <Wallet className="mx-auto mb-3 size-8 text-texto-3" strokeWidth={1.8} />
            <p className="text-[16px] text-texto-2">Nada neste período. As contas fechadas aparecem aqui sozinhas; gastos você anota no botão Anotar.</p>
          </Cartao>
        ) : (
          <Cartao className="divide-y divide-linha overflow-hidden">
            {lista.map((l) => (
              <LinhaLancamento key={l.id} l={l} onClick={() => abrirLancamento(l)} />
            ))}
            {!verTodos && resumo.lancamentos.length > lista.length && (
              <button onClick={() => setVerTodos(true)} className="h-14 w-full text-[16px] font-semibold text-marca-tinta active:bg-elevado">
                Ver todos ({resumo.lancamentos.length})
              </button>
            )}
          </Cartao>
        )}
      </motion.div>

      <BotaoFlutuante icone={Plus} onClick={() => setAnotar({ aberto: true })}>
        Anotar
      </BotaoFlutuante>

      <AnotarLancamento aberto={anotar.aberto} editar={anotar.editar} onFechar={() => setAnotar({ aberto: false, editar: anotar.editar })} />
      <DetalheLancamento lancamento={detalhe} onFechar={() => setDetalhe(null)} />
    </>
  );
}

/** Cartão pequeno de total (Entrou ou Saiu). */
function Total({ icone: Icone, rotulo, valor, cor }: { icone: LucideIcon; rotulo: string; valor: number; cor: "positivo" | "negativo" }) {
  return (
    <Cartao className="p-4">
      <p className="flex items-center gap-1.5 text-[15px] font-medium text-texto-2">
        <span className={cn("grid size-6 place-items-center rounded-full", cor === "positivo" ? "bg-positivo-suave text-positivo" : "bg-negativo-suave text-negativo")}>
          <Icone className="size-4" strokeWidth={2.4} />
        </span>
        {rotulo}
      </p>
      <p className="num mt-1.5 text-[22px] font-bold">{reais(valor)}</p>
    </Cartao>
  );
}

/** Gráfico de barras: entrada (âmbar) e saída (cinza) de cada dia ou mês. Toque abre a fatia. */
function Grafico({ resumo, onTocar }: { resumo: ResumoBalanco; onTocar: (inicio: number) => void }) {
  const maior = Math.max(1, ...resumo.barras.flatMap((b) => [b.entrou, b.saiu]));
  const agora = Date.now();
  const denso = resumo.barras.length > 12; // mês: barras finas e rótulos salteados

  return (
    <Cartao className="mt-3 px-3 pt-4 pb-3">
      {/* Legenda */}
      <div className="mb-3 flex gap-4 px-1 text-[13px] font-medium text-texto-2">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-marca" />Entrou</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-texto-3" />Saiu</span>
        <span className="ml-auto num">máx. {reaisCompacto(maior)}</span>
      </div>

      {/* Barras */}
      <div className="flex h-36 items-end" style={{ gap: denso ? 2 : 6 }}>
        {resumo.barras.map((b, i) => {
          const futuro = b.inicio > agora;
          return (
            <button
              key={i}
              disabled={futuro}
              onClick={() => onTocar(b.inicio)}
              aria-label={`${b.rotulo}: entrou ${reais(b.entrou)}, saiu ${reais(b.saiu)}`}
              className={cn("flex h-full min-w-0 flex-1 items-end justify-center rounded-md active:bg-elevado", futuro && "opacity-30")}
              style={{ gap: denso ? 1 : 3 }}
            >
              <motion.span
                className="w-full max-w-4 rounded-t-[4px] bg-marca"
                initial={{ height: 0 }}
                animate={{ height: `${(b.entrou / maior) * 100}%` }}
                transition={{ type: "spring", stiffness: 260, damping: 30, delay: i * 0.012 }}
              />
              <motion.span
                className="w-full max-w-4 rounded-t-[4px] bg-texto-3/70"
                initial={{ height: 0 }}
                animate={{ height: `${(b.saiu / maior) * 100}%` }}
                transition={{ type: "spring", stiffness: 260, damping: 30, delay: i * 0.012 }}
              />
            </button>
          );
        })}
      </div>

      {/* Rótulos (no mês, só alguns dias para não embolar) */}
      <div className="mt-1.5 flex" style={{ gap: denso ? 2 : 6 }}>
        {resumo.barras.map((b, i) => {
          const mostrar = !denso || [1, 5, 10, 15, 20, 25, 30].includes(Number(b.rotulo));
          return (
            <span key={i} className={cn("min-w-0 flex-1 text-center text-[12px] whitespace-nowrap", b.atual ? "font-bold text-texto" : "text-texto-2")}>
              {mostrar ? b.rotulo : ""}
            </span>
          );
        })}
      </div>
    </Cartao>
  );
}

/** Linha com rótulo, valor e uma barrinha de proporção. */
function Barrinha({ rotulo, valor, total, cor }: { rotulo: string; valor: number; total: number; cor: string }) {
  const pct = Math.round((valor / total) * 100);
  return (
    <div className="py-2.5">
      <div className="flex items-baseline justify-between text-[16px]">
        <span className="font-medium">{rotulo}</span>
        <span className="num font-semibold">
          {reais(valor)} <span className="text-[14px] font-medium text-texto-3">{pct}%</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-elevado">
        <motion.div className={cn("h-full rounded-full", cor)} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 200, damping: 30 }} />
      </div>
    </div>
  );
}

/** Uma linha da lista de lançamentos. */
function LinhaLancamento({ l, onClick }: { l: Lancamento; onClick: () => void }) {
  const entrada = l.tipo === "entrada";
  // Ícone conforme a origem: comanda, fiado, venda avulsa ou gasto
  const Icone = l.origem === "comanda" ? ReceiptText : l.origem === "fiado" ? BookUser : entrada ? ArrowDownLeft : ArrowUpRight;
  const detalhe = entrada ? (l.forma ? NOMES_FORMA[l.forma] : "") : (l.categoria ?? "Gasto");
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-elevado">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", entrada ? "bg-positivo-suave text-positivo" : "bg-negativo-suave text-negativo")}>
        <Icone className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px] font-semibold">{l.descricao || detalhe}</span>
        {/* Sem observação, o título já é a categoria/forma: não repete no subtítulo */}
        <span className="block truncate text-[14px] text-texto-2">{l.descricao ? `${detalhe} · ${dataEHora(l.data)}` : dataEHora(l.data)}</span>
      </span>
      <span className={cn("num text-[17px] font-semibold", entrada ? "text-positivo" : "text-texto")}>
        {entrada ? "+" : "−"} {reais(l.valor)}
      </span>
    </button>
  );
}

/** Detalhe de um lançamento de comanda ou de fiado (não editável, só apagar). */
function DetalheLancamento({ lancamento, onFechar }: { lancamento: Lancamento | null; onFechar: () => void }) {
  const { removerLancamento } = useDados();
  const avisar = useAviso();
  // Mantém o conteúdo visível durante a animação de fechar
  const ultimo = useRef(lancamento);
  if (lancamento) ultimo.current = lancamento;
  const l = ultimo.current;

  return (
    <Sheet
      aberto={!!lancamento}
      onFechar={onFechar}
      titulo={l?.origem === "fiado" ? "Fiado recebido" : "Conta fechada"}
      rodape={
        l && (
          <Botao
            variante="perigo"
            bloco
            icone={Trash2}
            onClick={() => {
              const desfazer = removerLancamento(l);
              onFechar();
              avisar("Lançamento apagado", { desfazer });
            }}
          >
            Apagar lançamento
          </Botao>
        )
      }
    >
      {l && (
        <>
          <p className="num text-[36px] leading-tight font-bold text-positivo">{reais(l.valor)}</p>
          <p className="text-[16px] text-texto-2">
            {l.descricao} · {l.forma ? NOMES_FORMA[l.forma] : ""} · {dataEHora(l.data)}
          </p>
          {l.itens && l.itens.length > 0 && (
            <div className="mt-5 divide-y divide-linha rounded-2xl bg-elevado px-4">
              {l.itens.map((i) => (
                <div key={i.produtoId} className="flex justify-between py-3 text-[16px]">
                  <span>
                    {i.qtd}× {i.nome}
                  </span>
                  <span className="num text-texto-2">{reais(i.preco * i.qtd)}</span>
                </div>
              ))}
            </div>
          )}
          {l.origem === "fiado" && <p className="mt-4 text-[15px] text-texto-2">Apagar também devolve o valor para a conta do cliente no fiado.</p>}
        </>
      )}
    </Sheet>
  );
}
