// Modelo de dados do app. Todo valor em dinheiro é guardado em CENTAVOS (inteiro)
// para evitar erros de arredondamento (ex.: 0,1 + 0,2 = 0,30000000000000004).

/** Campos comuns a todo documento salvo. */
export interface Entidade {
  id: string;
  criadoEm: number; // data de criação (timestamp em ms)
}

/** Categorias fixas do cardápio (fixas para manter o app simples). */
export const CATEGORIAS_PRODUTO = ["Cervejas", "Destilados", "Sem álcool", "Petiscos", "Diversos"] as const;
export type CategoriaProduto = (typeof CATEGORIAS_PRODUTO)[number];

/** Item do cardápio. */
export interface Produto extends Entidade {
  nome: string;
  preco: number; // centavos
  categoria: CategoriaProduto;
}

/** Linha de uma comanda. Guarda nome e preço do momento da venda:
 * mudar o preço do produto depois não altera vendas antigas. */
export interface ItemComanda {
  produtoId: string;
  nome: string;
  preco: number; // centavos
  qtd: number;
}

/** Comanda aberta no nome de uma pessoa. Ao fechar, vira lançamento ou fiado e é apagada. */
export interface Comanda extends Entidade {
  nome: string;
  itens: ItemComanda[];
}

/** Formas de pagamento registradas (a cobrança em si é feita na maquininha). */
export const FORMAS_PAGAMENTO = ["dinheiro", "pix", "cartao"] as const;
export type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number];

/** Categorias de gasto (o que sai do caixa). */
export const CATEGORIAS_GASTO = [
  "Bebidas",
  "Gelo e carvão",
  "Petiscos",
  "Luz e água",
  "Aluguel",
  "Outros",
] as const;
export type CategoriaGasto = (typeof CATEGORIAS_GASTO)[number];

/** Movimento de dinheiro do Balanço: o que entrou (venda) ou saiu (gasto). */
export interface Lancamento extends Entidade {
  tipo: "entrada" | "saida";
  valor: number; // centavos, sempre positivo
  data: number; // quando aconteceu (pode ser diferente de criadoEm)
  /** De onde veio: comanda fechada, anotação manual, pagamento de fiado ou gasto. */
  origem: "comanda" | "avulsa" | "fiado" | "gasto";
  forma?: FormaPagamento; // só nas entradas
  categoria?: CategoriaGasto; // só nas saídas
  descricao: string;
  itens?: ItemComanda[]; // itens da comanda, quando veio de uma
  clienteId?: string; // quando é pagamento de fiado
}

/** Cliente fiel que compra fiado. */
export interface Cliente extends Entidade {
  nome: string;
}

/** Movimento na conta de um cliente: compra pendurada ou pagamento recebido. */
export interface MovimentoFiado extends Entidade {
  clienteId: string;
  tipo: "conta" | "pagamento";
  valor: number; // centavos, sempre positivo
  data: number;
  descricao: string;
  itens?: ItemComanda[];
  lancamentoId?: string; // pagamento: lançamento de entrada criado junto no Balanço
}
