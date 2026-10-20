// Painel "Anotar": registra um gasto (compra) ou uma venda sem comanda.
// Também serve para editar ou apagar um lançamento anotado à mão.
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useDados } from "@/context/DadosContext";
import { useAviso } from "@/context/AvisoContext";
import { Sheet } from "@/components/Sheet";
import { Botao, Campo, CampoValor, Chip, Segmentado } from "@/components/ui";
import { deInputData, inicioDoDia, paraInputData } from "@/lib/datas";
import { reais } from "@/lib/dinheiro";
import { CATEGORIAS_GASTO, type CategoriaGasto, type FormaPagamento, type Lancamento } from "@/types";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  editar?: Lancamento; // quando vem preenchido, o painel edita em vez de criar
}

type Quando = "hoje" | "ontem" | "outro";

export function AnotarLancamento({ aberto, onFechar, editar }: Props) {
  const { salvarLancamento, removerLancamento } = useDados();
  const avisar = useAviso();

  const [tipo, setTipo] = useState<"saida" | "entrada">("saida");
  const [valor, setValor] = useState(0);
  const [categoria, setCategoria] = useState<CategoriaGasto>("Bebidas");
  const [forma, setForma] = useState<FormaPagamento>("dinheiro");
  const [descricao, setDescricao] = useState("");
  const [quando, setQuando] = useState<Quando>("hoje");
  const [dataOutra, setDataOutra] = useState(paraInputData(Date.now()));

  // Ao abrir: limpa o formulário (novo) ou carrega o lançamento (edição)
  useEffect(() => {
    if (!aberto) return;
    if (editar) {
      setTipo(editar.tipo);
      setValor(editar.valor);
      setCategoria(editar.categoria ?? "Outros");
      setForma(editar.forma ?? "dinheiro");
      setDescricao(editar.descricao);
      const dias = Math.round((+inicioDoDia(new Date()) - +inicioDoDia(new Date(editar.data))) / 86_400_000);
      setQuando(dias === 0 ? "hoje" : dias === 1 ? "ontem" : "outro");
      setDataOutra(paraInputData(editar.data));
    } else {
      setTipo("saida");
      setValor(0);
      setCategoria("Bebidas");
      setForma("dinheiro");
      setDescricao("");
      setQuando("hoje");
      setDataOutra(paraInputData(Date.now()));
    }
  }, [aberto, editar]);

  /** Converte a escolha "Hoje / Ontem / Outra data" em data real. */
  function dataEscolhida(): number {
    // Na edição, se o dia não mudou, mantém o horário original
    if (editar && paraInputData(editar.data) === paraInputData(dataDoDia())) return editar.data;
    return dataDoDia();
  }
  function dataDoDia(): number {
    if (quando === "hoje") return Date.now();
    if (quando === "ontem") return deInputData(paraInputData(Date.now() - 86_400_000));
    return deInputData(dataOutra);
  }

  function salvar() {
    if (valor <= 0) return avisar("Digite o valor.");
    salvarLancamento({
      id: editar?.id,
      tipo,
      valor,
      data: dataEscolhida(),
      categoria: tipo === "saida" ? categoria : undefined,
      forma: tipo === "entrada" ? forma : undefined,
      descricao: descricao.trim(),
    });
    onFechar();
    avisar(editar ? "Lançamento atualizado" : tipo === "saida" ? `Gasto de ${reais(valor)} anotado` : `Venda de ${reais(valor)} anotada`);
  }

  return (
    <Sheet
      aberto={aberto}
      onFechar={onFechar}
      titulo={editar ? "Editar lançamento" : "Anotar"}
      rodape={
        <div className="flex gap-2.5">
          {editar && (
            <Botao
              variante="perigo"
              aria-label="Apagar lançamento"
              className="px-5"
              onClick={() => {
                const desfazer = removerLancamento(editar);
                onFechar();
                avisar("Lançamento apagado", { desfazer });
              }}
            >
              <Trash2 className="size-5" />
            </Botao>
          )}
          <Botao bloco onClick={salvar}>
            Salvar
          </Botao>
        </div>
      }
    >
      {/* Gasto ou venda */}
      <Segmentado
        id="tipo-lancamento"
        valor={tipo}
        onMudar={setTipo}
        opcoes={[
          { valor: "saida", rotulo: "Gasto" },
          { valor: "entrada", rotulo: "Venda" },
        ]}
      />

      {/* Valor */}
      <div className="py-6">
        <CampoValor rotulo={tipo === "saida" ? "Quanto você pagou?" : "Quanto vendeu?"} valor={valor} onMudar={setValor} />
      </div>

      {/* Gasto: categoria / Venda: forma de pagamento */}
      <p className="mb-2.5 text-[15px] font-medium text-texto-2">{tipo === "saida" ? "Com o quê" : "Como recebeu"}</p>
      {tipo === "saida" ? (
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS_GASTO.map((c) => (
            <Chip key={c} ativo={categoria === c} onClick={() => setCategoria(c)}>
              {c}
            </Chip>
          ))}
        </div>
      ) : (
        <Segmentado
          id="forma-venda"
          valor={forma}
          onMudar={setForma}
          opcoes={[
            { valor: "dinheiro", rotulo: "Dinheiro" },
            { valor: "pix", rotulo: "Pix" },
            { valor: "cartao", rotulo: "Cartão" },
          ]}
        />
      )}

      {/* Quando aconteceu */}
      <p className="mt-6 mb-2.5 text-[15px] font-medium text-texto-2">Quando</p>
      <div className="flex flex-wrap items-center gap-2">
        <Chip ativo={quando === "hoje"} onClick={() => setQuando("hoje")}>Hoje</Chip>
        <Chip ativo={quando === "ontem"} onClick={() => setQuando("ontem")}>Ontem</Chip>
        <Chip ativo={quando === "outro"} onClick={() => setQuando("outro")}>Outro dia</Chip>
      </div>
      {quando === "outro" && (
        <input
          type="date"
          value={dataOutra}
          max={paraInputData(Date.now())}
          onChange={(e) => e.target.value && setDataOutra(e.target.value)}
          className="mt-3 h-14 w-full rounded-2xl bg-elevado px-4 text-[17px] text-texto outline-none focus:ring-2 focus:ring-marca"
        />
      )}

      {/* Observação opcional */}
      <div className="mt-6">
        <Campo
          rotulo="Observação (opcional)"
          placeholder={tipo === "saida" ? "Ex.: Distribuidora" : "Ex.: Cigarro no balcão"}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>
    </Sheet>
  );
}
