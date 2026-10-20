// Formatação de dinheiro. Os valores circulam em centavos e só viram "R$" na tela.

const formatoReal = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatoCurto = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 4650 → "R$ 46,50" */
export function reais(centavos: number): string {
  // Intl usa espaço não separável; troca por espaço comum para quebrar bem
  return formatoReal.format(centavos / 100).replace(/ /g, " ");
}

/** 4650 → "46,50" (sem o "R$", para quando o símbolo é desenhado à parte) */
export function reaisSemSimbolo(centavos: number): string {
  return formatoCurto.format(centavos / 100);
}

/** Valor compacto para gráficos: 123456 → "1,2 mil" */
export function reaisCompacto(centavos: number): string {
  const valor = centavos / 100;
  if (Math.abs(valor) >= 1000) {
    return `${(valor / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  }
  return Math.round(valor).toLocaleString("pt-BR");
}

/** Soma o total de uma lista de itens (preço × quantidade). */
export function totalItens(itens: { preco: number; qtd: number }[]): number {
  return itens.reduce((soma, i) => soma + i.preco * i.qtd, 0);
}
