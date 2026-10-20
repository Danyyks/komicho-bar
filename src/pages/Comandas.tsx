// Aba Comandas: lista das comandas abertas e o botão para abrir uma nova.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Plus, ReceiptText } from "lucide-react";
import { useDados } from "@/context/DadosContext";
import { CabecalhoAba } from "@/components/Cabecalho";
import { Sheet } from "@/components/Sheet";
import { Botao, BotaoFlutuante, Campo, Cartao, Chip, Vazio } from "@/components/ui";
import { reais, totalItens } from "@/lib/dinheiro";
import { haQuantoTempo } from "@/lib/datas";

/** Atualiza a tela a cada minuto (para o "há 15 min" andar sozinho). */
function useRelogio(): number {
  const [agora, setAgora] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  return agora;
}

export function Comandas() {
  const { comandas } = useDados();
  const agora = useRelogio();
  const [novaAberta, setNovaAberta] = useState(false);

  // Soma de tudo que está em aberto agora
  const totalAberto = comandas.reduce((s, c) => s + totalItens(c.itens), 0);
  const subtitulo =
    comandas.length === 0
      ? "Nenhuma aberta agora"
      : `${comandas.length} ${comandas.length === 1 ? "aberta" : "abertas"} · ${reais(totalAberto)}`;

  return (
    <>
      <CabecalhoAba titulo="Comandas" subtitulo={subtitulo} />

      {/* Lista de comandas abertas (a mais antiga primeiro, como uma fila) */}
      {comandas.length > 0 ? (
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
      ) : (
        <Vazio icone={ReceiptText} titulo="Tudo fechado por aqui" texto="Quando alguém chegar, toque em Nova comanda." />
      )}

      <BotaoFlutuante icone={Plus} onClick={() => setNovaAberta(true)}>
        Nova comanda
      </BotaoFlutuante>

      <NovaComanda aberto={novaAberta} onFechar={() => setNovaAberta(false)} />
    </>
  );
}

/** Painel "Nova comanda": um toque num atalho já abre; ou digita um nome. */
function NovaComanda({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const { comandas, clientes, abrirComanda } = useDados();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");

  // Atalhos: mesas e balcão livres + clientes do fiado (sem repetir o que já está aberto)
  const abertos = new Set(comandas.map((c) => c.nome.toLowerCase()));
  const atalhos = [...["Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4", "Mesa 5", "Mesa 6", "Balcão"], ...clientes.map((c) => c.nome)].filter(
    (n) => !abertos.has(n.toLowerCase()),
  );

  /** Cria a comanda e já entra nela. */
  function abrir(n: string) {
    if (!n.trim()) return;
    const c = abrirComanda(n);
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
        <Botao bloco onClick={() => abrir(nome)} disabled={!nome.trim()} className="disabled:opacity-40">
          Abrir comanda
        </Botao>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          abrir(nome);
        }}
      >
        <Campo rotulo="Nome ou mesa" placeholder="Ex.: Mesa 3 ou Seu Zé" value={nome} onChange={(e) => setNome(e.target.value)} autoCapitalize="words" enterKeyHint="go" />
      </form>

      {/* Atalhos de um toque */}
      {atalhos.length > 0 && (
        <>
          <p className="mt-6 mb-3 text-[15px] font-medium text-texto-2">Ou toque para abrir</p>
          <div className="flex flex-wrap gap-2">
            {atalhos.map((a) => (
              <Chip key={a} onClick={() => abrir(a)}>
                {a}
              </Chip>
            ))}
          </div>
        </>
      )}
    </Sheet>
  );
}
