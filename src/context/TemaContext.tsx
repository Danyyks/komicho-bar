// Tema claro/escuro: "automático" segue o celular; a escolha fica salva no aparelho.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Tema = "auto" | "claro" | "escuro";

interface TemaCtx {
  tema: Tema;
  escuro: boolean; // tema efetivo neste momento
  setTema: (t: Tema) => void;
}

const TemaContext = createContext<TemaCtx | null>(null);
const CHAVE = "komicho:tema";
const consultaEscuro = window.matchMedia("(prefers-color-scheme: dark)");

/** Lê a preferência salva (protegido: em aba anônima o localStorage pode falhar). */
function lerSalvo(): Tema {
  try {
    const v = localStorage.getItem(CHAVE);
    return v === "claro" || v === "escuro" ? v : "auto";
  } catch {
    return "auto";
  }
}

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTemaEstado] = useState<Tema>(lerSalvo);
  const [sistemaEscuro, setSistemaEscuro] = useState(consultaEscuro.matches);

  // Acompanha a troca de tema do celular (ex.: modo escuro automático à noite)
  useEffect(() => {
    const ouvir = (e: MediaQueryListEvent) => setSistemaEscuro(e.matches);
    consultaEscuro.addEventListener("change", ouvir);
    return () => consultaEscuro.removeEventListener("change", ouvir);
  }, []);

  const escuro = tema === "escuro" || (tema === "auto" && sistemaEscuro);

  // Aplica a classe no <html> e pinta a barra do sistema com a cor do fundo
  useEffect(() => {
    document.documentElement.classList.toggle("dark", escuro);
    const cor = escuro ? "#1B1815" : "#FBF8F3";
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", cor));
  }, [escuro]);

  function setTema(t: Tema) {
    setTemaEstado(t);
    try {
      localStorage.setItem(CHAVE, t);
    } catch {
      /* sem armazenamento: vale só nesta sessão */
    }
  }

  return <TemaContext.Provider value={{ tema, escuro, setTema }}>{children}</TemaContext.Provider>;
}

export function useTema(): TemaCtx {
  const ctx = useContext(TemaContext);
  if (!ctx) throw new Error("useTema precisa estar dentro de <TemaProvider>");
  return ctx;
}
