// Painéis "Entrou dinheiro" e "Saiu dinheiro" da tela Hoje: substituem o caderno do caixa.
// Digita o valor no teclado de calculadora e toca em como entrou (ou com o quê saiu):
// esse toque já salva, sem botão "Salvar".
import { useEffect, useState } from "react";
import { Banknote, CreditCard, QrCode } from "lucide-react";
import { useDados } from "@/context/DadosContext";
import { useAviso } from "@/context/AvisoContext";
import { Sheet } from "@/components/Sheet";
import { TecladoValor } from "@/components/Teclado";
import { BotaoEscolha, Chip } from "@/components/ui";
import { reais } from "@/lib/dinheiro";
import { CATEGORIAS_GASTO, type CategoriaGasto, type FormaPagamento } from "@/types";

const ONTEM_MEIO_DIA = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(12, 0, 0, 0);
  return +d;
};

/** Escolha simples de dia: quase tudo é "Hoje"; "Ontem" cobre a compra esquecida. */
function QuandoFoi({ ontem, onMudar }: { ontem: boolean; onMudar: (ontem: boolean) => void }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <Chip ativo={!ontem} onClick={() => onMudar(false)}>
        Hoje
      </Chip>
      <Chip ativo={ontem} onClick={() => onMudar(true)}>
        Ontem
      </Chip>
    </div>
  );
}

/** Painel "Entrou dinheiro": venda de balcão, sem comanda. */
export function EntrouDinheiro({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const { salvarLancamento, removerLancamento } = useDados();
  const avisar = useAviso();
  const [valor, setValor] = useState(0);
  const [ontem, setOntem] = useState(false);

  // Cada vez que abre, começa zerado e em "Hoje"
  useEffect(() => {
    if (!aberto) return;
    setValor(0);
    setOntem(false);
  }, [aberto]);

  /** Salva a entrada com a forma tocada e oferece "Desfazer". */
  function salvar(forma: FormaPagamento, nome: string) {
    if (valor <= 0) return avisar("Digite o valor primeiro.");
    const criado = salvarLancamento({ tipo: "entrada", valor, data: ontem ? ONTEM_MEIO_DIA() : Date.now(), forma, descricao: "Venda no balcão" });
    onFechar();
    avisar(`Entrou ${reais(valor)} no ${nome}`, { desfazer: criado ? () => removerLancamento(criado) : undefined });
  }

  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo="Entrou dinheiro">
      <TecladoValor rotulo="Quanto entrou?" valor={valor} onMudar={setValor} />
      <QuandoFoi ontem={ontem} onMudar={setOntem} />

      {/* Como recebeu: o toque já salva */}
      <p className="mt-5 mb-2.5 text-center text-[16px] font-semibold text-texto-2">Como recebeu? Toque para salvar</p>
      <div className="grid grid-cols-3 gap-2.5">
        <BotaoEscolha icone={Banknote} rotulo="Dinheiro" cor="positivo" onClick={() => salvar("dinheiro", "dinheiro")} />
        <BotaoEscolha icone={QrCode} rotulo="Pix" cor="positivo" onClick={() => salvar("pix", "Pix")} />
        <BotaoEscolha icone={CreditCard} rotulo="Cartão" cor="positivo" onClick={() => salvar("cartao", "cartão")} />
      </div>
    </Sheet>
  );
}

/** Painel "Saiu dinheiro": compra de mercadoria e contas do bar. */
export function SaiuDinheiro({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const { salvarLancamento, removerLancamento } = useDados();
  const avisar = useAviso();
  const [valor, setValor] = useState(0);
  const [ontem, setOntem] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    setValor(0);
    setOntem(false);
  }, [aberto]);

  /** Salva o gasto com o motivo tocado e oferece "Desfazer". */
  function salvar(categoria: CategoriaGasto) {
    if (valor <= 0) return avisar("Digite o valor primeiro.");
    const criado = salvarLancamento({ tipo: "saida", valor, data: ontem ? ONTEM_MEIO_DIA() : Date.now(), categoria, descricao: "" });
    onFechar();
    avisar(`Saiu ${reais(valor)} em ${categoria}`, { desfazer: criado ? () => removerLancamento(criado) : undefined });
  }

  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo="Saiu dinheiro">
      <TecladoValor rotulo="Quanto saiu?" valor={valor} onMudar={setValor} />
      <QuandoFoi ontem={ontem} onMudar={setOntem} />

      {/* Com o quê: o toque já salva */}
      <p className="mt-5 mb-2.5 text-center text-[16px] font-semibold text-texto-2">Com o quê? Toque para salvar</p>
      <div className="grid grid-cols-2 gap-2.5">
        {CATEGORIAS_GASTO.map((c) => (
          <BotaoEscolha key={c} rotulo={c} cor="negativo" onClick={() => salvar(c)} />
        ))}
      </div>
    </Sheet>
  );
}
