// Cálculos do Balanço: quanto entrou, saiu e sobrou num período.
import { fatiasDe, type Periodo } from "./datas";
import type { CategoriaGasto, FormaPagamento, Lancamento, MovimentoFiado } from "@/types";

export interface ResumoBalanco {
  entrou: number;
  saiu: number;
  sobrou: number;
  /** Entradas separadas por forma de pagamento. */
  porForma: Record<FormaPagamento, number>;
  /** Quanto das entradas veio de fiado recebido. */
  fiadoRecebido: number;
  /** Saídas por categoria, da maior para a menor. */
  porCategoria: { categoria: CategoriaGasto; valor: number }[];
  /** Barras do gráfico: entrada e saída de cada fatia do período. */
  barras: { inicio: number; rotulo: string; entrou: number; saiu: number; atual: boolean }[];
  /** Lançamentos do período, do mais recente para o mais antigo. */
  lancamentos: Lancamento[];
}

/** Resume os lançamentos que caem dentro do período. */
export function resumir(todos: Lancamento[], periodo: Periodo): ResumoBalanco {
  const doPeriodo = todos
    .filter((l) => l.data >= periodo.inicio && l.data < periodo.fim)
    .sort((a, b) => b.data - a.data);

  // Totais e quebras por forma/categoria em uma única passada
  const porForma: Record<FormaPagamento, number> = { dinheiro: 0, pix: 0, cartao: 0 };
  const categorias = new Map<CategoriaGasto, number>();
  let entrou = 0;
  let saiu = 0;
  let fiadoRecebido = 0;
  for (const l of doPeriodo) {
    if (l.tipo === "entrada") {
      entrou += l.valor;
      if (l.forma) porForma[l.forma] += l.valor;
      if (l.origem === "fiado") fiadoRecebido += l.valor;
    } else {
      saiu += l.valor;
      const cat = l.categoria ?? "Outros";
      categorias.set(cat, (categorias.get(cat) ?? 0) + l.valor);
    }
  }

  // Barras do gráfico (a fatia de "agora" fica destacada)
  const agora = Date.now();
  const barras = fatiasDe(periodo).map((f) => {
    let e = 0;
    let s = 0;
    for (const l of doPeriodo) {
      if (l.data < f.inicio || l.data >= f.fim) continue;
      if (l.tipo === "entrada") e += l.valor;
      else s += l.valor;
    }
    return { inicio: f.inicio, rotulo: f.rotulo, entrou: e, saiu: s, atual: agora >= f.inicio && agora < f.fim };
  });

  return {
    entrou,
    saiu,
    sobrou: entrou - saiu,
    porForma,
    fiadoRecebido,
    porCategoria: [...categorias.entries()]
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor),
    barras,
    lancamentos: doPeriodo,
  };
}

/** Quanto um cliente deve hoje: tudo que pendurou menos o que já pagou. */
export function saldoDoCliente(movimentos: MovimentoFiado[], clienteId: string): number {
  return movimentos
    .filter((m) => m.clienteId === clienteId)
    .reduce((saldo, m) => saldo + (m.tipo === "conta" ? m.valor : -m.valor), 0);
}
