// Painéis do fechamento da comanda. Pix e Cartão fecham direto pelo rodapé da comanda;
// só três casos abrem painel: Dinheiro (troco), Fiado (escolher cliente) e Ajustar valor.
import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { useDados, type Pagamento } from "@/context/DadosContext";
import { useAviso } from "@/context/AvisoContext";
import { Sheet } from "@/components/Sheet";
import { TecladoValor } from "@/components/Teclado";
import { Avatar, Botao, Campo, Chip } from "@/components/ui";
import { reais } from "@/lib/dinheiro";
import { saldoDoCliente } from "@/lib/balanco";
import { cn, porNome } from "@/lib/utils";

/** Fecha a comanda com a forma escolhida (função vinda da tela da comanda). */
export type Fechar = (pagamento: Pagamento, texto: string) => void;

interface PainelBase {
  aberto: boolean;
  onFechar: () => void;
  valor: number; // valor a cobrar (já com ajuste, se houver)
  nome: string; // nome da comanda, para os avisos
}

/** Dinheiro: digita (ou toca na nota) quanto o cliente deu e o app mostra o troco. */
export function PagarDinheiro({ aberto, onFechar, valor, nome, fechar }: PainelBase & { fechar: Fechar }) {
  const avisar = useAviso();
  const [recebido, setRecebido] = useState(0);

  useEffect(() => {
    if (aberto) setRecebido(0);
  }, [aberto]);

  const troco = recebido - valor;
  // Atalhos das notas mais comuns (só as maiores que a conta)
  const notas = [2000, 5000, 10000, 20000].filter((n) => n > valor).slice(0, 3);

  function confirmar() {
    if (recebido > 0 && troco < 0) return avisar(`Faltam ${reais(-troco)}. Confira o valor dado.`);
    onFechar();
    fechar({ forma: "dinheiro" }, `${nome} pagou em dinheiro${recebido > 0 && troco > 0 ? ` · troco ${reais(troco)}` : ""}`);
  }

  return (
    <Sheet
      aberto={aberto}
      onFechar={onFechar}
      titulo={`Dinheiro · ${reais(valor)}`}
      rodape={
        <Botao bloco onClick={confirmar}>
          {recebido === 0 ? "Confirmar sem troco" : troco >= 0 ? `Confirmar · troco ${reais(troco)}` : "Valor menor que a conta"}
        </Botao>
      }
    >
      <TecladoValor rotulo="Quanto o cliente deu?" valor={recebido} onMudar={setRecebido} />

      {/* Notas comuns em um toque */}
      {notas.length > 0 && (
        <div className="mt-3 flex justify-center gap-2">
          {notas.map((n) => (
            <Chip key={n} ativo={recebido === n} onClick={() => setRecebido(n)}>
              {reais(n).replace(",00", "")}
            </Chip>
          ))}
        </div>
      )}

      {/* Troco em destaque */}
      {recebido > 0 && (
        <div className={cn("mt-4 rounded-3xl px-5 py-3 text-center", troco >= 0 ? "bg-positivo-suave" : "bg-negativo-suave")}>
          <p className="text-[15px] font-medium text-texto-2">{troco >= 0 ? "Troco" : "Falta"}</p>
          <p className={cn("num text-[34px] leading-tight font-bold", troco >= 0 ? "text-positivo" : "text-negativo")}>{reais(Math.abs(troco))}</p>
        </div>
      )}
    </Sheet>
  );
}

/** Fiado: toca no cliente e a conta vai para a página dele (ou cadastra um novo). */
export function PendurarFiado({ aberto, onFechar, valor, fechar }: PainelBase & { fechar: Fechar }) {
  const { clientes, fiado, criarCliente } = useDados();
  const [novo, setNovo] = useState("");

  useEffect(() => {
    if (aberto) setNovo("");
  }, [aberto]);

  /** Pendura no cliente escolhido. */
  function pendurar(clienteId: string, nomeCliente: string) {
    onFechar();
    fechar({ fiado: clienteId }, `${reais(valor)} na conta de ${nomeCliente}`);
  }

  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo={`Fiado · ${reais(valor)}`}>
      <p className="mb-3 text-[16px] font-medium text-texto-2">Na conta de quem?</p>
      <div className="flex flex-col gap-2.5">
        {[...clientes].sort(porNome).map((c) => {
          const deve = saldoDoCliente(fiado, c.id);
          return (
            <button key={c.id} onClick={() => pendurar(c.id, c.nome)} className="flex min-h-[68px] items-center gap-4 rounded-2xl bg-lilas-suave px-4 text-left active:scale-[0.98]">
              <Avatar nome={c.nome} />
              <span className="flex-1">
                <span className="block text-[18px] font-semibold">{c.nome}</span>
                <span className="block text-[15px] text-texto-2">{deve > 0 ? `Já deve ${reais(deve)}` : "Em dia"}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Cliente novo direto daqui */}
      <form
        className="mt-4 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!novo.trim()) return;
          const c = criarCliente(novo);
          pendurar(c.id, c.nome);
        }}
      >
        <div className="flex-1">
          <Campo rotulo={clientes.length ? "Ou um cliente novo" : "Nome do cliente"} placeholder="Nome" value={novo} onChange={(e) => setNovo(e.target.value)} autoCapitalize="words" />
        </div>
        <button type="submit" aria-label="Cadastrar cliente e pendurar" className="grid size-14 place-items-center rounded-2xl bg-marca text-sobre-marca active:scale-95">
          <UserPlus className="size-6" />
        </button>
      </form>
    </Sheet>
  );
}

/** Ajustar valor: desconto ou arredondamento antes de cobrar. */
export function AjustarValor({ aberto, onFechar, total, valor, onUsar }: { aberto: boolean; onFechar: () => void; total: number; valor: number; onUsar: (v: number | null) => void }) {
  const [novo, setNovo] = useState(valor);

  useEffect(() => {
    if (aberto) setNovo(valor);
  }, [aberto, valor]);

  return (
    <Sheet
      aberto={aberto}
      onFechar={onFechar}
      titulo="Ajustar valor"
      rodape={
        <div className="flex flex-col gap-2">
          <Botao
            bloco
            onClick={() => {
              onUsar(novo === total ? null : novo);
              onFechar();
            }}
          >
            Cobrar {reais(novo)}
          </Botao>
          {valor !== total && (
            <Botao
              variante="fantasma"
              bloco
              onClick={() => {
                onUsar(null);
                onFechar();
              }}
            >
              Voltar para o total ({reais(total)})
            </Botao>
          )}
        </div>
      }
    >
      <TecladoValor rotulo={`Total da comanda: ${reais(total)}`} valor={novo} onMudar={setNovo} />
    </Sheet>
  );
}
