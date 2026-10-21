// Datas e períodos do Balanço (dia, semana, mês e ano), sempre no horário local.

export type Escala = "dia" | "semana" | "mes" | "ano";

/** Intervalo de tempo [inicio, fim) com o título que aparece na tela. */
export interface Periodo {
  escala: Escala;
  inicio: number;
  fim: number; // exclusivo
  titulo: string;
}

/** Fatia do período usada nas barras do gráfico. */
export interface Fatia {
  inicio: number;
  fim: number;
  rotulo: string;
}

const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** Meia-noite do dia da data informada. */
export function inicioDoDia(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Segunda-feira da semana da data (a semana do bar vai de segunda a domingo). */
function inicioDaSemana(d: Date): Date {
  const dia = inicioDoDia(d);
  const desdeSegunda = (dia.getDay() + 6) % 7;
  dia.setDate(dia.getDate() - desdeSegunda);
  return dia;
}

/** Monta o período (dia, semana, mês ou ano) que contém a data de referência. */
export function periodoDe(escala: Escala, ref: Date): Periodo {
  // Dia: de meia-noite a meia-noite
  if (escala === "dia") {
    const ini = inicioDoDia(ref);
    const fim = new Date(ini);
    fim.setDate(fim.getDate() + 1);
    return { escala, inicio: +ini, fim: +fim, titulo: tituloDia(ini) };
  }
  // Semana: segunda a domingo
  if (escala === "semana") {
    const ini = inicioDaSemana(ref);
    const fim = new Date(ini);
    fim.setDate(fim.getDate() + 7);
    const ultimo = new Date(fim);
    ultimo.setDate(ultimo.getDate() - 1);
    return { escala, inicio: +ini, fim: +fim, titulo: tituloSemana(ini, ultimo) };
  }
  // Mês: do dia 1 ao último dia
  if (escala === "mes") {
    const ini = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const fim = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
    return { escala, inicio: +ini, fim: +fim, titulo: `${MESES[ini.getMonth()]} ${ini.getFullYear()}` };
  }
  // Ano: janeiro a dezembro
  const ini = new Date(ref.getFullYear(), 0, 1);
  const fim = new Date(ref.getFullYear() + 1, 0, 1);
  return { escala, inicio: +ini, fim: +fim, titulo: String(ini.getFullYear()) };
}

/** Anda para o período anterior (-1) ou seguinte (+1). */
export function deslocar(escala: Escala, ref: Date, passos: number): Date {
  const d = new Date(ref);
  if (escala === "dia") d.setDate(d.getDate() + passos);
  if (escala === "semana") d.setDate(d.getDate() + 7 * passos);
  if (escala === "mes") d.setMonth(d.getMonth() + passos, 1);
  if (escala === "ano") d.setFullYear(d.getFullYear() + passos, 0, 1);
  return d;
}

/** Divide o período em fatias para o gráfico (dias da semana, dias do mês ou meses). */
export function fatiasDe(p: Periodo): Fatia[] {
  const fatias: Fatia[] = [];
  const ini = new Date(p.inicio);

  // Semana e mês: uma barra por dia
  if (p.escala === "semana" || p.escala === "mes") {
    for (let d = new Date(ini); +d < p.fim; d.setDate(d.getDate() + 1)) {
      const prox = new Date(d);
      prox.setDate(prox.getDate() + 1);
      const rotulo = p.escala === "semana" ? DIAS_SEMANA[d.getDay()] : String(d.getDate());
      fatias.push({ inicio: +d, fim: +prox, rotulo });
    }
  }
  // Ano: uma barra por mês
  if (p.escala === "ano") {
    for (let m = 0; m < 12; m++) {
      const a = new Date(ini.getFullYear(), m, 1);
      const b = new Date(ini.getFullYear(), m + 1, 1);
      fatias.push({ inicio: +a, fim: +b, rotulo: MESES_CURTOS[m] });
    }
  }
  return fatias;
}

/** "Hoje", "Ontem" ou "seg, 13 de out" */
function tituloDia(d: Date): string {
  const hoje = inicioDoDia(new Date());
  const dif = Math.round((+hoje - +d) / 86_400_000);
  if (dif === 0) return "Hoje";
  if (dif === 1) return "Ontem";
  return `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES_CURTOS[d.getMonth()]}`;
}

/** "13 – 19 out" ou "29 set – 5 out" */
function tituloSemana(a: Date, b: Date): string {
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} – ${b.getDate()} ${MESES_CURTOS[b.getMonth()]}`;
  return `${a.getDate()} ${MESES_CURTOS[a.getMonth()]} – ${b.getDate()} ${MESES_CURTOS[b.getMonth()]}`;
}

/** Hora no formato 21:40 */
export function hora(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** "Hoje, 21:40", "Ontem, 18:02" ou "13 out, 10:00" */
export function dataEHora(ms: number): string {
  const d = new Date(ms);
  const dif = Math.round((+inicioDoDia(new Date()) - +inicioDoDia(d)) / 86_400_000);
  const dia = dif === 0 ? "Hoje" : dif === 1 ? "Ontem" : `${d.getDate()} ${MESES_CURTOS[d.getMonth()]}`;
  return `${dia}, ${hora(ms)}`;
}

/** Só o dia: "Hoje", "Ontem" ou "13 de out" */
export function dataCurta(ms: number): string {
  const d = new Date(ms);
  const dif = Math.round((+inicioDoDia(new Date()) - +inicioDoDia(d)) / 86_400_000);
  if (dif === 0) return "Hoje";
  if (dif === 1) return "Ontem";
  return `${d.getDate()} de ${MESES_CURTOS[d.getMonth()]}`;
}

/** Tempo desde que algo começou: "agora", "há 15 min", "há 1 h 20" */
export function haQuantoTempo(ms: number, agora = Date.now()): string {
  const min = Math.floor((agora - ms) / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return resto ? `há ${h} h ${String(resto).padStart(2, "0")}` : `há ${h} h`;
}

/** Converte uma data para o valor de um <input type="date"> (AAAA-MM-DD). */
export function paraInputData(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Lê o valor de um <input type="date">, mantendo a hora atual quando é hoje. */
export function deInputData(valor: string): number {
  const [a, m, d] = valor.split("-").map(Number);
  const agora = new Date();
  const escolhido = new Date(a, m - 1, d, agora.getHours(), agora.getMinutes());
  // Dia passado sem hora definida: registra ao meio-dia para não cair no dia errado
  if (+inicioDoDia(escolhido) !== +inicioDoDia(agora)) escolhido.setHours(12, 0, 0, 0);
  return +escolhido;
}

/** Data de hoje por extenso para o topo da tela inicial: "Terça-feira, 21 de outubro" */
export function hojePorExtenso(): string {
  const texto = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return texto.charAt(0).toUpperCase() + texto.slice(1); // só a primeira letra maiúscula
}
