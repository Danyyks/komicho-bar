// Painel "Fechar conta": escolhe a forma de pagamento; dinheiro calcula o troco
// e fiado escolhe o cliente. Ao confirmar, a venda vai para o Balanço (ou para o fiado).
import { useEffect, useState } from "react";
import { ArrowLeft, Banknote, BookUser, CreditCard, QrCode, UserPlus } from "lucide-react";
import { useDados, type Pagamento } from "@/context/DadosContext";
import { useAviso } from "@/context/AvisoContext";
import { Sheet } from "@/components/Sheet";
import { Avatar, Botao, Campo, CampoValor, Chip, Opcao } from "@/components/ui";
import { reais, totalItens } from "@/lib/dinheiro";
import { saldoDoCliente } from "@/lib/balanco";
import { cn, porNome } from "@/lib/utils";
import type { Comanda } from "@/types";

type Etapa = "forma" | "dinheiro" | "fiado" | "ajuste";

interface Props {
  comanda: Comanda;
  aberto: boolean;
  onFechar: () => void;
  onFechada: () => void; // depois de confirmar (a tela volta para a lista)
}

export function FecharConta({ comanda, aberto, onFechar, onFechada }: Props) {
  const { clientes, fiado, fecharComanda, criarCliente } = useDados();
  const avisar = useAviso();
  const totalOriginal = totalItens(comanda.itens);

  const [etapa, setEtapa] = useState<Etapa>("forma");
  const [valor, setValor] = useState(totalOriginal); // pode mudar com desconto
  const [recebido, setRecebido] = useState(0); // dinheiro entregue pelo cliente
  const [novoCliente, setNovoCliente] = useState("");

  // Sempre que abrir, começa do início com o total atual
  useEffect(() => {
    if (!aberto) return;
    setEtapa("forma");
    setValor(totalOriginal);
    setRecebido(0);
    setNovoCliente("");
  }, [aberto, totalOriginal]);

  /** Registra o fechamento, mostra o aviso com "Desfazer" e sai da comanda. */
  function concluir(pagamento: Pagamento, texto: string) {
    const desfazer = fecharComanda(comanda, pagamento, valor);
    onFechar();
    onFechada();
    avisar(texto, { desfazer });
  }

  const troco = recebido - valor;
  const titulos: Record<Etapa, string> = { forma: "Fechar conta", dinheiro: "Pagamento em dinheiro", fiado: "Pendurar no fiado", ajuste: "Ajustar valor" };

  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo={titulos[etapa]} rodape={rodape()}>
      {/* Voltar para a escolha da forma (nas etapas internas) */}
      {etapa !== "forma" && (
        <button onClick={() => setEtapa("forma")} className="-mt-1 mb-3 flex h-10 items-center gap-1.5 text-[16px] font-medium text-marca-tinta">
          <ArrowLeft className="size-5" /> Formas de pagamento
        </button>
      )}

      {/* Etapa 1: total + formas de pagamento */}
      {etapa === "forma" && (
        <>
          <div className="mb-5 rounded-3xl bg-elevado px-5 py-5 text-center">
            <p className="text-[15px] font-medium text-texto-2">{comanda.nome}</p>
            <p className="num mt-1 text-[40px] leading-none font-bold">{reais(valor)}</p>
            {valor !== totalOriginal && <p className="num mt-2 text-[14px] text-texto-2 line-through">{reais(totalOriginal)}</p>}
            <button onClick={() => setEtapa("ajuste")} className="mt-3 h-9 rounded-full px-3 text-[15px] font-semibold text-marca-tinta active:bg-marca-suave">
              Dar desconto ou ajustar
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            <Opcao icone={Banknote} titulo="Dinheiro" detalhe="Calcula o troco" onClick={() => setEtapa("dinheiro")} />
            <Opcao icone={QrCode} titulo="Pix" onClick={() => concluir({ forma: "pix" }, `${comanda.nome} paga no Pix`)} />
            <Opcao icone={CreditCard} titulo="Cartão" onClick={() => concluir({ forma: "cartao" }, `${comanda.nome} paga no cartão`)} />
            <Opcao icone={BookUser} titulo="Fiado" detalhe="Pendura na conta do cliente" onClick={() => setEtapa("fiado")} cor="negativo" />
          </div>
        </>
      )}

      {/* Etapa: ajustar o valor final (desconto, arredondamento) */}
      {etapa === "ajuste" && (
        <div className="py-4">
          <CampoValor rotulo="Valor que o cliente vai pagar" valor={valor} onMudar={setValor} autoFocus />
          <p className="mt-3 text-center text-[15px] text-texto-2">Total da comanda: {reais(totalOriginal)}</p>
        </div>
      )}

      {/* Etapa: dinheiro, com cálculo de troco */}
      {etapa === "dinheiro" && (
        <div>
          <p className="text-center text-[16px] text-texto-2">
            Total <span className="num font-semibold text-texto">{reais(valor)}</span>
          </p>
          <div className="mt-4">
            <CampoValor rotulo="Quanto o cliente deu?" valor={recebido} onMudar={setRecebido} />
          </div>
          {/* Atalhos das notas mais comuns */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[valor, 2000, 5000, 10000, 20000].filter((v, i, a) => (i === 0 || v > valor) && a.indexOf(v) === i).map((v, i) => (
              <Chip key={v} ativo={recebido === v} onClick={() => setRecebido(v)}>
                {i === 0 ? "Valor certo" : reais(v).replace(",00", "")}
              </Chip>
            ))}
          </div>
          {/* Troco em destaque */}
          <div className={cn("mt-6 rounded-3xl px-5 py-4 text-center", recebido === 0 ? "bg-elevado" : troco >= 0 ? "bg-positivo-suave" : "bg-negativo-suave")}>
            <p className="text-[15px] font-medium text-texto-2">{troco >= 0 || recebido === 0 ? "Troco" : "Falta"}</p>
            <p className={cn("num text-[36px] leading-tight font-bold", recebido === 0 ? "text-texto-3" : troco >= 0 ? "text-positivo" : "text-negativo")}>
              {recebido === 0 ? "—" : reais(Math.abs(troco))}
            </p>
          </div>
        </div>
      )}

      {/* Etapa: fiado, escolhendo (ou criando) o cliente */}
      {etapa === "fiado" && (
        <div className="flex flex-col gap-2.5">
          {[...clientes].sort(porNome).map((c) => {
            const deve = saldoDoCliente(fiado, c.id);
            return (
              <button
                key={c.id}
                onClick={() => concluir({ fiado: c.id }, `${reais(valor)} na conta de ${c.nome}`)}
                className="flex min-h-[68px] items-center gap-4 rounded-2xl bg-elevado px-4 text-left active:scale-[0.98]"
              >
                <Avatar nome={c.nome} />
                <span className="flex-1">
                  <span className="block text-[17px] font-semibold">{c.nome}</span>
                  <span className="block text-[14px] text-texto-2">{deve > 0 ? `Deve ${reais(deve)}` : "Em dia"}</span>
                </span>
              </button>
            );
          })}
          {/* Cliente novo direto daqui */}
          <form
            className="mt-2 flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!novoCliente.trim()) return;
              const c = criarCliente(novoCliente);
              concluir({ fiado: c.id }, `${reais(valor)} na conta de ${c.nome}`);
            }}
          >
            <div className="flex-1">
              <Campo rotulo={clientes.length ? "Ou um cliente novo" : "Nome do cliente"} placeholder="Nome" value={novoCliente} onChange={(e) => setNovoCliente(e.target.value)} autoCapitalize="words" />
            </div>
            <button type="submit" aria-label="Criar cliente e pendurar" className="grid size-14 place-items-center rounded-2xl bg-marca text-sobre-marca active:scale-95">
              <UserPlus className="size-6" />
            </button>
          </form>
        </div>
      )}
    </Sheet>
  );

  /** Botão fixo do rodapé conforme a etapa. */
  function rodape() {
    if (etapa === "dinheiro") {
      return (
        <Botao bloco onClick={() => concluir({ forma: "dinheiro" }, `${comanda.nome} paga em dinheiro`)}>
          Confirmar pagamento
        </Botao>
      );
    }
    if (etapa === "ajuste") {
      return (
        <Botao bloco onClick={() => setEtapa("forma")}>
          Usar {reais(valor)}
        </Botao>
      );
    }
    return undefined;
  }
}
