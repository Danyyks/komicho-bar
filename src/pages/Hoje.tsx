// Tela inicial "Hoje": o caderninho do dia. Mostra quanto tem no caixa hoje, os três
// botões principais (Nova comanda, Entrou dinheiro, Saiu dinheiro) e as comandas abertas.
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, ChevronRight, ReceiptText, Settings } from "lucide-react";
import { useDados } from "@/context/DadosContext";
import { CabecalhoAba } from "@/components/Cabecalho";
import { Sheet } from "@/components/Sheet";
import { Botao, BotaoGrande, BotaoIcone, Campo, Cartao, TituloSecao } from "@/components/ui";
import { reais, totalItens } from "@/lib/dinheiro";
import { haQuantoTempo, hojePorExtenso, periodoDe } from "@/lib/datas";
import { resumir } from "@/lib/balanco";
import { cn } from "@/lib/utils";
import { EntrouDinheiro, SaiuDinheiro } from "./EntradaSaida";
import { Ajustes } from "./Ajustes";

/** Atualiza a tela a cada minuto (para o "há 15 min" andar sozinho). */
function useRelogio(): number {
  const [agora, setAgora] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  return agora;
}

export function Hoje() {
  const { comandas, lancamentos } = useDados();
  const agora = useRelogio();
  const [painel, setPainel] = useState<"comanda" | "entrou" | "saiu" | "ajustes" | null>(null);

  // Caixa de hoje: tudo que entrou menos tudo que saiu desde a meia-noite
  const caixa = useMemo(() => resumir(lancamentos, periodoDe("dia", new Date(agora))), [lancamentos, agora]);

  return (
    <>
      <CabecalhoAba
        titulo="Hoje"
        subtitulo={hojePorExtenso()}
        direita={<BotaoIcone icone={Settings} aria-label="Ajustes" onClick={() => setPainel("ajustes")} className="text-texto-2" />}
      />

      {/* Caixa do dia (toque abre o Balanço) */}
      <Link to="/balanco" className="block transition-transform active:scale-[0.98]">
        <Cartao className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-[16px] font-medium text-texto-2">No caixa hoje</p>
            <ChevronRight className="size-5 text-texto-3" />
          </div>
          <p className={cn("num mt-0.5 text-[38px] leading-tight font-bold tracking-tight", caixa.sobrou < 0 && "text-negativo")}>
            {caixa.sobrou < 0 ? "− " : ""}
            {reais(Math.abs(caixa.sobrou))}
          </p>
          <div className="mt-2 flex gap-5 text-[16px]">
            <span className="text-positivo">
              Entrou <span className="num font-semibold">{reais(caixa.entrou)}</span>
            </span>
            <span className="text-negativo">
              Saiu <span className="num font-semibold">{reais(caixa.saiu)}</span>
            </span>
          </div>
        </Cartao>
      </Link>

      {/* Os três botões principais */}
      <div className="mt-4 flex flex-col gap-3">
        <BotaoGrande cor="marca" icone={ReceiptText} titulo="Nova comanda" detalhe="Anotar o que o cliente pediu" onClick={() => setPainel("comanda")} />
        <BotaoGrande cor="positivo" icone={ArrowDownLeft} titulo="Entrou dinheiro" detalhe="Venda no balcão, sem comanda" onClick={() => setPainel("entrou")} />
        <BotaoGrande cor="negativo" icone={ArrowUpRight} titulo="Saiu dinheiro" detalhe="Compra de mercadoria e contas" onClick={() => setPainel("saiu")} />
      </div>

      {/* Comandas abertas (a mais antiga primeiro, como uma fila) */}
      <TituloSecao>{comandas.length ? `Comandas abertas (${comandas.length})` : "Comandas abertas"}</TituloSecao>
      {comandas.length === 0 ? (
        <p className="px-1 text-[16px] text-texto-2">Nenhuma comanda aberta agora.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comandas.map((c) => {
            const qtd = c.itens.reduce((s, i) => s + i.qtd, 0);
            return (
              <li key={c.id}>
                <Link to={`/comanda/${c.id}`} className="block transition-transform active:scale-[0.98]">
                  <Cartao className="flex items-center gap-3 p-5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[20px] font-semibold">{c.nome}</p>
                      <p className="mt-0.5 text-[15px] text-texto-2">
                        {qtd === 0 ? "Sem itens" : `${qtd} ${qtd === 1 ? "item" : "itens"}`} · {haQuantoTempo(c.criadoEm, agora)}
                      </p>
                    </div>
                    <p className="num text-[20px] font-semibold">{reais(totalItens(c.itens))}</p>
                    <ChevronRight className="-mr-1 size-5 text-texto-3" />
                  </Cartao>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <NovaComanda aberto={painel === "comanda"} onFechar={() => setPainel(null)} />
      <EntrouDinheiro aberto={painel === "entrou"} onFechar={() => setPainel(null)} />
      <SaiuDinheiro aberto={painel === "saiu"} onFechar={() => setPainel(null)} />
      <Ajustes aberto={painel === "ajustes"} onFechar={() => setPainel(null)} />
    </>
  );
}

/** Painel "Nova comanda": digita o nome da pessoa e abre (o bar não tem mesas numeradas). */
function NovaComanda({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const { comandas, abrirComanda } = useDados();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");

  // Avisa se já existe comanda aberta com o mesmo nome (evita duas para a mesma pessoa)
  const repetida = comandas.find((c) => c.nome.toLowerCase() === nome.trim().toLowerCase());

  /** Cria a comanda e já entra nela. */
  function abrir() {
    if (!nome.trim()) return;
    const c = abrirComanda(nome);
    setNome("");
    onFechar();
    navigate(`/comanda/${c.id}`);
  }

  return (
    <Sheet
      aberto={aberto}
      onFechar={onFechar}
      titulo="Nova comanda"
      rodape={
        <Botao bloco onClick={abrir} disabled={!nome.trim()} className="disabled:opacity-40">
          Abrir comanda
        </Botao>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          abrir();
        }}
      >
        <Campo
          rotulo="Nome do cliente"
          placeholder="Ex.: Seu Zé"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          autoCapitalize="words"
          enterKeyHint="go"
          autoFocus
        />
      </form>

      {/* Aviso de nome repetido, com atalho para a comanda que já está aberta */}
      {repetida && (
        <button
          onClick={() => {
            setNome("");
            onFechar();
            navigate(`/comanda/${repetida.id}`);
          }}
          className="mt-3 w-full rounded-2xl bg-marca-suave px-4 py-3 text-left text-[15px] text-marca-tinta active:scale-[0.98]"
        >
          {repetida.nome} já tem uma comanda aberta. <span className="font-semibold">Abrir a dela</span>
        </button>
      )}
    </Sheet>
  );
}
