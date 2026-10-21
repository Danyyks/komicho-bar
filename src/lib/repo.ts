// Repositório genérico: a mesma API funciona com o Firestore (nuvem) ou com o
// localStorage (modo demo), e as telas não precisam saber qual está em uso.
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db, modoDemo, nuvemLigada } from "./firebase";
import { uid } from "./utils";
import type { Entidade } from "@/types";

/** Operação para gravar várias coisas de uma vez (tudo ou nada). */
export type Operacao =
  | { tipo: "set"; colecao: string; item: Entidade }
  | { tipo: "remove"; colecao: string; id: string };

// Prefixo das chaves no localStorage (o demo usa outro para não misturar com dados reais)
const PREFIXO = modoDemo ? "komicho-demo:" : "komicho:";

/** Erros de gravação na nuvem vão para quem assinar (o app mostra um aviso). */
let aoFalhar: (e: unknown) => void = (e) => console.error(e);
export function definirAvisoDeErro(fn: (e: unknown) => void) {
  aoFalhar = fn;
}

// ---------- Modo demo (localStorage) ----------

function lerLocal<T>(colecao: string): T[] {
  try {
    const bruto = localStorage.getItem(PREFIXO + colecao);
    return bruto ? (JSON.parse(bruto) as T[]) : [];
  } catch {
    return [];
  }
}

function escreverLocal<T>(colecao: string, itens: T[]) {
  try {
    localStorage.setItem(PREFIXO + colecao, JSON.stringify(itens));
  } catch (e) {
    aoFalhar(e);
  }
  // Avisa as telas abertas que a coleção mudou
  window.dispatchEvent(new CustomEvent(`repo:${colecao}`));
}

// ---------- API pública ----------

/** Cria o repositório de uma coleção (ex.: "comandas"). */
export function criarRepo<T extends Entidade>(colecao: string) {
  /** Escuta a coleção em tempo real; devolve a função para parar de escutar. */
  function assinar(cb: (itens: T[]) => void): () => void {
    // Nuvem: o Firestore avisa a cada mudança (inclusive gravações ainda offline)
    if (nuvemLigada && db) {
      return onSnapshot(
        collection(db, colecao),
        (snap) => cb(snap.docs.map((d) => d.data() as T)),
        aoFalhar,
      );
    }
    // Local: lê agora e de novo a cada evento de mudança
    const emitir = () => cb(lerLocal<T>(colecao));
    emitir();
    window.addEventListener(`repo:${colecao}`, emitir);
    window.addEventListener("storage", emitir);
    return () => {
      window.removeEventListener(`repo:${colecao}`, emitir);
      window.removeEventListener("storage", emitir);
    };
  }

  /** Cria ou substitui um item inteiro (também usado para "desfazer" exclusões). */
  function salvar(item: T) {
    if (nuvemLigada && db) {
      // Sem await de propósito: offline a promessa só termina quando a internet volta,
      // mas a tela já é atualizada na hora pelo cache local do Firestore.
      setDoc(doc(db, colecao, item.id), limparUndefined(item)).catch(aoFalhar);
      return;
    }
    const itens = lerLocal<T>(colecao).filter((i) => i.id !== item.id);
    escreverLocal(colecao, [...itens, item]);
  }

  /** Cria um item novo e devolve o item completo (com id e data). */
  function criar(dados: Omit<T, "id" | "criadoEm">): T {
    const item = { ...dados, id: uid(), criadoEm: Date.now() } as T;
    salvar(item);
    return item;
  }

  /** Altera só alguns campos de um item. */
  function atualizar(id: string, mudancas: Partial<T>) {
    if (nuvemLigada && db) {
      updateDoc(doc(db, colecao, id), limparUndefined(mudancas) as Record<string, unknown>).catch(aoFalhar);
      return;
    }
    escreverLocal(
      colecao,
      lerLocal<T>(colecao).map((i) => (i.id === id ? { ...i, ...mudancas } : i)),
    );
  }

  /** Apaga um item. */
  function remover(id: string) {
    if (nuvemLigada && db) {
      deleteDoc(doc(db, colecao, id)).catch(aoFalhar);
      return;
    }
    escreverLocal(
      colecao,
      lerLocal<T>(colecao).filter((i) => i.id !== id),
    );
  }

  return { colecao, assinar, salvar, criar, atualizar, remover };
}

/** Grava várias operações juntas, em coleções diferentes (ex.: fechar comanda =
 * criar lançamento + apagar comanda). Na nuvem é atômico: ou grava tudo ou nada. */
export function gravarJuntos(operacoes: Operacao[]) {
  // Nuvem: um único "batch" do Firestore
  if (nuvemLigada && db) {
    const lote = writeBatch(db);
    for (const op of operacoes) {
      const ref = doc(db, op.colecao, op.tipo === "set" ? op.item.id : op.id);
      if (op.tipo === "set") lote.set(ref, limparUndefined(op.item));
      else lote.delete(ref);
    }
    lote.commit().catch(aoFalhar);
    return;
  }
  // Local: aplica coleção por coleção e avisa as telas uma vez por coleção
  const porColecao = new Map<string, Operacao[]>();
  for (const op of operacoes) porColecao.set(op.colecao, [...(porColecao.get(op.colecao) ?? []), op]);
  for (const [colecao, ops] of porColecao) {
    let itens = lerLocal<Entidade>(colecao);
    for (const op of ops) {
      if (op.tipo === "set") itens = [...itens.filter((i) => i.id !== op.item.id), op.item];
      else itens = itens.filter((i) => i.id !== op.id);
    }
    escreverLocal(colecao, itens);
  }
}

/** O Firestore recusa campos `undefined`; removemos antes de gravar. */
function limparUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

/** Diz se a coleção local ainda está vazia (usado para criar os dados do modo demo). */
export function colecaoLocalVazia(colecao: string): boolean {
  return localStorage.getItem(PREFIXO + colecao) === null;
}
