// Utilitários pequenos usados em todo o app.
import { clsx, type ClassValue } from "clsx";

/** Junta classes CSS condicionais: cn("a", cond && "b") */
export function cn(...classes: ClassValue[]): string {
  return clsx(classes);
}

/** Gera um id único curto para documentos novos. */
export function uid(): string {
  // getRandomValues funciona até em http (ex.: testar no celular pela rede local)
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Vibração curtinha de confirmação ao tocar (Android; o iPhone ignora). */
export function vibrar(ms = 8) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* navegador sem suporte: ignora */
  }
}

/** Ordena textos em português (acentos e maiúsculas no lugar certo). */
export function porNome<T extends { nome: string }>(a: T, b: T): number {
  return a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
}
