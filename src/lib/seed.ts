// Dados fictícios do modo demo (para testar telas e tirar prints). O app real começa vazio.
import { uid } from "./utils";
import type { CategoriaGasto, Cliente, Comanda, FormaPagamento, ItemComanda, Lancamento, MovimentoFiado } from "@/types";

/** Preços usados nos itens de exemplo (centavos): o dono digita tudo na hora no app real. */
const PRECOS: Record<string, number> = {
  "Brahma 600 ml": 1200,
  "Skol 600 ml": 1100,
  "Original 600 ml": 1300,
  "Pinga (dose)": 500,
  "Coca-Cola lata": 600,
  "Guaraná lata": 500,
  Torresmo: 1500,
  "Porção de fritas": 2000,
  Amendoim: 400,
};

/** Gerador de números "aleatórios" previsível: o demo fica sempre igual. */
function sorteador(semente: number) {
  let s = semente;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Monta um banco fictício completo para o modo demo (prints e testes de tela). */
export function dadosDemo() {
  const sorte = sorteador(42);
  const agora = Date.now();
  // Item digitado na hora: cada linha tem seu próprio id
  const item = (nome: string, qtd: number): ItemComanda => ({ produtoId: uid(), nome, preco: PRECOS[nome], qtd });

  // Comandas abertas agora
  const comandas: Comanda[] = [
    { id: uid(), criadoEm: agora - 42 * 60_000, nome: "Carlão", itens: [item("Brahma 600 ml", 2), item("Torresmo", 1), item("Pinga (dose)", 1)] },
    { id: uid(), criadoEm: agora - 15 * 60_000, nome: "Seu Zé", itens: [item("Original 600 ml", 1), item("Amendoim", 1)] },
    { id: uid(), criadoEm: agora - 3 * 60_000, nome: "Marquinhos", itens: [item("Coca-Cola lata", 1)] },
  ];

  // Clientes do fiado e o histórico de cada um
  const clientes: Cliente[] = ["Seu Zé", "Dona Lúcia", "Tião"].map((nome, i) => ({ id: uid(), criadoEm: agora - (90 - i) * 86_400_000, nome }));
  const fiado: MovimentoFiado[] = [];
  const lancamentos: Lancamento[] = [];
  const dia = 86_400_000;
  const conta = (c: Cliente, dias: number, itens: ItemComanda[]) =>
    fiado.push({ id: uid(), criadoEm: agora - dias * dia, clienteId: c.id, tipo: "conta", valor: itens.reduce((s, i) => s + i.preco * i.qtd, 0), data: agora - dias * dia, descricao: "Comanda", itens });
  const pagamento = (c: Cliente, dias: number, valor: number) => {
    const lanc: Lancamento = { id: uid(), criadoEm: agora - dias * dia, tipo: "entrada", valor, data: agora - dias * dia, origem: "fiado", forma: "pix", descricao: `Fiado de ${c.nome}`, clienteId: c.id };
    lancamentos.push(lanc);
    fiado.push({ id: uid(), criadoEm: agora - dias * dia, clienteId: c.id, tipo: "pagamento", valor, data: agora - dias * dia, descricao: "Pagamento", lancamentoId: lanc.id });
  };
  conta(clientes[0], 9, [item("Brahma 600 ml", 4), item("Torresmo", 1)]);
  conta(clientes[0], 4, [item("Pinga (dose)", 3), item("Skol 600 ml", 2)]);
  conta(clientes[0], 1, [item("Original 600 ml", 3), item("Porção de fritas", 1)]);
  conta(clientes[1], 6, [item("Guaraná lata", 2), item("Porção de fritas", 1)]);
  conta(clientes[1], 2, [item("Coca-Cola lata", 2), item("Torresmo", 1)]);
  conta(clientes[2], 20, [item("Brahma 600 ml", 3)]);
  pagamento(clientes[2], 5, 3600);

  // Histórico de vendas e gastos dos últimos 14 meses (para o Balanço ter vida)
  const FREGUESES = ["Carlão", "Marquinhos", "Seu Zé", "Dona Lúcia", "Tião", "Neguinho", "Fernando", "Toninho"];
  const formas: FormaPagamento[] = ["dinheiro", "pix", "pix", "cartao"];
  const gastos: [CategoriaGasto, number, number][] = [
    ["Bebidas", 3, 52000],
    ["Gelo e carvão", 4, 9000],
    ["Petiscos", 2, 14000],
  ];
  for (let d = 425; d >= 0; d--) {
    const data = new Date(agora - d * dia);
    data.setHours(18, 0, 0, 0);
    // Hoje: as vendas caem nas últimas horas (para o "Dia" já ter movimento)
    if (d === 0) data.setTime(agora - 5 * 3_600_000);
    const fimDeSemana = data.getDay() === 5 || data.getDay() === 6;
    if (data.getDay() === 1) continue; // segunda o bar fecha
    // Vendas do dia: mais movimento na sexta e no sábado
    const vendas = Math.round((fimDeSemana ? 9 : 5) + sorte() * 5);
    for (let v = 0; v < vendas; v++) {
      const momento = +data + Math.round(sorte() * 5 * 3_600_000);
      if (momento > agora) continue;
      lancamentos.push({
        id: uid(), criadoEm: momento, tipo: "entrada", data: momento, origem: "comanda",
        valor: Math.round((1500 + sorte() * 5500) / 50) * 50,
        forma: formas[Math.floor(sorte() * formas.length)], descricao: FREGUESES[Math.floor(sorte() * FREGUESES.length)],
      });
    }
    // Compras da semana distribuídas pelos dias
    for (const [categoria, diaSemana, base] of gastos) {
      if (data.getDay() !== diaSemana) continue;
      lancamentos.push({ id: uid(), criadoEm: +data, tipo: "saida", data: +data - 6 * 3_600_000, origem: "gasto", valor: Math.round(base * (0.8 + sorte() * 0.4) / 100) * 100, categoria, descricao: categoria === "Bebidas" ? "Distribuidora" : categoria });
    }
    // Contas fixas do mês
    if (data.getDate() === 10) {
      lancamentos.push({ id: uid(), criadoEm: +data, tipo: "saida", data: +data - 8 * 3_600_000, origem: "gasto", valor: 32000 + Math.round(sorte() * 8000), categoria: "Luz e água", descricao: "Conta de luz e água" });
      lancamentos.push({ id: uid(), criadoEm: +data, tipo: "saida", data: +data - 8 * 3_600_000, origem: "gasto", valor: 120000, categoria: "Aluguel", descricao: "Aluguel do ponto" });
    }
  }

  return { comandas, clientes, fiado, lancamentos };
}
