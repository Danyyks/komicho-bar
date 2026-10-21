// Página do cliente do fiado: quanto deve, receber pagamento, anotar compra e histórico.
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, Banknote, CreditCard, HandCoins, Pencil, Plus, QrCode, Trash2 } from "lucide-react";
import { useDados } from "@/context/DadosContext";
import { useAviso } from "@/context/AvisoContext";
import { CabecalhoDetalhe } from "@/components/Cabecalho";
import { Confirmar } from "@/components/Confirmar";
import { Sheet } from "@/components/Sheet";
import { TecladoValor } from "@/components/Teclado";
import { Avatar, Botao, BotaoEscolha, Campo, Cartao, TituloSecao } from "@/components/ui";
import { reais } from "@/lib/dinheiro";
import { dataEHora } from "@/lib/datas";
import { saldoDoCliente } from "@/lib/balanco";
import { cn } from "@/lib/utils";
import { useVoltar } from "@/hooks/useVoltar";
import type { Cliente, FormaPagamento, MovimentoFiado } from "@/types";

export function ClienteDetalhe() {
  const { id } = useParams();
  const { clientes, fiado, carregado, removerCliente } = useDados();
  const avisar = useAviso();
  const voltar = useVoltar("/fiado");
  const cliente = clientes.find((c) => c.id === id);

  const [receber, setReceber] = useState(false);
  const [anotar, setAnotar] = useState(false);
  const [renomear, setRenomear] = useState(false);
  const [apagar, setApagar] = useState(false);
  const [movimento, setMovimento] = useState<MovimentoFiado | null>(null);

  // Cliente apagado ou link antigo: volta para a lista
  useEffect(() => {
    if (carregado && !cliente) voltar();
  }, [carregado, cliente]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!cliente) return null;
  const deve = saldoDoCliente(fiado, cliente.id);
  const historico = fiado.filter((m) => m.clienteId === cliente.id);

  return (
    <>
      <CabecalhoDetalhe voltarPara="/fiado" titulo={cliente.nome} />

      {/* Identificação (toque no nome para renomear) */}
      <div className="mt-1 flex items-center gap-4 px-1">
        <Avatar nome={cliente.nome} tamanho={56} />
        <button onClick={() => setRenomear(true)} className="flex items-center gap-2 text-left active:opacity-60">
          <h1 className="text-[28px] leading-tight font-bold tracking-tight">{cliente.nome}</h1>
          <Pencil className="size-4 text-texto-3" />
        </button>
      </div>

      {/* Quanto deve + ações */}
      <Cartao className="mt-5 p-5">
        <p className="text-[15px] font-medium text-texto-2">{deve > 0 ? "Deve" : deve < 0 ? "Tem de crédito" : "Situação"}</p>
        <p className={cn("num mt-0.5 text-[40px] leading-tight font-bold", deve > 0 ? "text-negativo" : "text-positivo")}>
          {deve === 0 ? "Em dia" : reais(Math.abs(deve))}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Botao icone={HandCoins} onClick={() => setReceber(true)}>
            Recebi
          </Botao>
          <Botao variante="secundario" icone={Plus} onClick={() => setAnotar(true)}>
            Anotar
          </Botao>
        </div>
      </Cartao>

      {/* Histórico (do mais recente para o mais antigo) */}
      <TituloSecao>Histórico</TituloSecao>
      {historico.length === 0 ? (
        <p className="px-1 text-[16px] text-texto-2">Nada anotado ainda.</p>
      ) : (
        <Cartao className="divide-y divide-linha overflow-hidden">
          {historico.map((m) => (
            <button key={m.id} onClick={() => setMovimento(m)} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-elevado">
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", m.tipo === "conta" ? "bg-negativo-suave text-negativo" : "bg-positivo-suave text-positivo")}>
                {m.tipo === "conta" ? <ArrowUpRight className="size-5" /> : <ArrowDownLeft className="size-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[17px] font-semibold">{m.tipo === "conta" ? m.descricao : "Pagamento"}</span>
                <span className="block truncate text-[14px] text-texto-2">
                  {dataEHora(m.data)}
                  {m.itens?.length ? ` · ${m.itens.map((i) => `${i.qtd}× ${i.nome}`).join(", ")}` : ""}
                </span>
              </span>
              <span className={cn("num text-[17px] font-semibold", m.tipo === "conta" ? "text-negativo" : "text-positivo")}>
                {m.tipo === "conta" ? "+" : "−"} {reais(m.valor)}
              </span>
            </button>
          ))}
        </Cartao>
      )}

      {/* Apagar fica no fim da página, escrito por extenso */}
      <button onClick={() => setApagar(true)} className="mt-8 h-12 w-full rounded-2xl text-[16px] font-semibold text-negativo active:bg-negativo-suave">
        Apagar este cliente
      </button>

      <ReceberPagamento cliente={cliente} deve={deve} aberto={receber} onFechar={() => setReceber(false)} />
      <AnotarNaConta cliente={cliente} aberto={anotar} onFechar={() => setAnotar(false)} />
      <RenomearCliente cliente={cliente} aberto={renomear} onFechar={() => setRenomear(false)} />
      <DetalheMovimento movimento={movimento} onFechar={() => setMovimento(null)} />
      <Confirmar
        aberto={apagar}
        onFechar={() => setApagar(false)}
        titulo={`Apagar ${cliente.nome}?`}
        texto="O cliente e o histórico do fiado somem. Os pagamentos que já entraram continuam no Balanço."
        botao="Apagar cliente"
        onConfirmar={() => {
          const desfazer = removerCliente(cliente);
          avisar(`${cliente.nome} apagado`, { desfazer });
        }}
      />
    </>
  );
}

/** Recebe dinheiro do cliente: digita o valor e toca em como pagou (o toque já salva).
 * Abate da conta e entra no caixa ao mesmo tempo. */
function ReceberPagamento({ cliente, deve, aberto, onFechar }: { cliente: Cliente; deve: number; aberto: boolean; onFechar: () => void }) {
  const { receberFiado } = useDados();
  const avisar = useAviso();
  const [valor, setValor] = useState(0);

  // Abre já com o valor total da dívida (o caso mais comum)
  useEffect(() => {
    if (aberto) setValor(Math.max(0, deve));
  }, [aberto]); // eslint-disable-line react-hooks/exhaustive-deps

  function receber(forma: FormaPagamento) {
    if (valor <= 0) return avisar("Digite o valor recebido.");
    receberFiado(cliente, valor, forma);
    onFechar();
    avisar(`Recebido ${reais(valor)} de ${cliente.nome}`);
  }

  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo="Receber pagamento">
      <TecladoValor rotulo="Quanto pagou?" valor={valor} onMudar={setValor} />
      {deve > 0 && valor > 0 && valor !== deve && (
        <p className="mt-3 text-center text-[16px] font-medium text-texto-2">
          {valor < deve ? `Fica devendo ${reais(deve - valor)}` : `Fica com ${reais(valor - deve)} de crédito`}
        </p>
      )}

      {/* Como pagou: o toque já salva */}
      <p className="mt-5 mb-2.5 text-center text-[16px] font-semibold text-texto-2">Como pagou? Toque para salvar</p>
      <div className="grid grid-cols-3 gap-2.5">
        <BotaoEscolha icone={Banknote} rotulo="Dinheiro" cor="positivo" onClick={() => receber("dinheiro")} />
        <BotaoEscolha icone={QrCode} rotulo="Pix" cor="positivo" onClick={() => receber("pix")} />
        <BotaoEscolha icone={CreditCard} rotulo="Cartão" cor="positivo" onClick={() => receber("cartao")} />
      </div>
    </Sheet>
  );
}

/** Pendura um valor na conta sem passar por comanda (ex.: levou um maço pra casa). */
function AnotarNaConta({ cliente, aberto, onFechar }: { cliente: Cliente; aberto: boolean; onFechar: () => void }) {
  const { anotarNoFiado } = useDados();
  const avisar = useAviso();
  const [valor, setValor] = useState(0);
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    if (aberto) {
      setValor(0);
      setDescricao("");
    }
  }, [aberto]);

  const salvar = () => {
    if (valor <= 0) return avisar("Digite o valor.");
    anotarNoFiado(cliente.id, valor, descricao);
    onFechar();
    avisar(`${reais(valor)} na conta de ${cliente.nome}`);
  };

  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo="Anotar na conta" rodape={<Botao bloco onClick={salvar}>Anotar</Botao>}>
      <TecladoValor rotulo="Quanto vai na conta?" valor={valor} onMudar={setValor} />
      <div className="mt-4">
        <Campo rotulo="O que foi (opcional)" placeholder="Ex.: 2 cervejas para viagem" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      </div>
    </Sheet>
  );
}

/** Troca o nome do cliente. */
function RenomearCliente({ cliente, aberto, onFechar }: { cliente: Cliente; aberto: boolean; onFechar: () => void }) {
  const { renomearCliente } = useDados();
  const [nome, setNome] = useState(cliente.nome);
  useEffect(() => {
    if (aberto) setNome(cliente.nome);
  }, [aberto, cliente.nome]);

  const salvar = () => {
    if (nome.trim()) renomearCliente(cliente.id, nome);
    onFechar();
  };

  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo="Nome do cliente" rodape={<Botao bloco onClick={salvar}>Salvar</Botao>}>
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

/** Detalhe de um movimento do histórico, com a opção de apagar (lançado errado). */
function DetalheMovimento({ movimento, onFechar }: { movimento: MovimentoFiado | null; onFechar: () => void }) {
  const { removerMovimento } = useDados();
  const avisar = useAviso();
  // Guarda o último movimento para o conteúdo não sumir durante a animação de fechar
  const ultimo = useRef(movimento);
  if (movimento) ultimo.current = movimento;
  const m = ultimo.current;

  return (
    <Sheet
      aberto={!!movimento}
      onFechar={onFechar}
      titulo={m?.tipo === "pagamento" ? "Pagamento" : "Compra no fiado"}
      rodape={
        m && (
          <Botao
            variante="perigo"
            bloco
            icone={Trash2}
            onClick={() => {
              const desfazer = removerMovimento(m);
              onFechar();
              avisar("Apagado", { desfazer });
            }}
          >
            Apagar
          </Botao>
        )
      }
    >
      {m && (
        <>
          <p className="num text-[36px] leading-tight font-bold">{reais(m.valor)}</p>
          <p className="text-[16px] text-texto-2">
            {m.descricao} · {dataEHora(m.data)}
          </p>
          {/* Itens da comanda que gerou a conta */}
          {m.itens && m.itens.length > 0 && (
            <div className="mt-5 divide-y divide-linha rounded-2xl bg-elevado px-4">
              {m.itens.map((i) => (
                <div key={i.produtoId} className="flex justify-between py-3 text-[16px]">
                  <span>
                    {i.qtd}× {i.nome}
                  </span>
                  <span className="num text-texto-2">{reais(i.preco * i.qtd)}</span>
                </div>
              ))}
            </div>
          )}
          {m.tipo === "pagamento" && <p className="mt-4 text-[15px] text-texto-2">Apagar este pagamento também tira a entrada do Balanço.</p>}
        </>
      )}
    </Sheet>
  );
}
