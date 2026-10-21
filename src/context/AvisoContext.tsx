// Avisos rápidos no rodapé ("Conta fechada · Desfazer"), no estilo dos apps do Google.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { definirAvisoDeErro } from "@/lib/repo";

interface Aviso {
  id: number;
  texto: string;
  desfazer?: () => void;
  erro?: boolean;
}

type Avisar = (texto: string, opcoes?: { desfazer?: () => void; erro?: boolean }) => void;

const AvisoContext = createContext<Avisar | null>(null);

export function AvisoProvider({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const timer = useRef<number>(undefined);

  /** Mostra um aviso por alguns segundos. Com "Desfazer" fica 8 s: tempo de ler com calma. */
  const avisar = useCallback<Avisar>((texto, opcoes) => {
    window.clearTimeout(timer.current);
    setAviso({ id: Date.now(), texto, ...opcoes });
    timer.current = window.setTimeout(() => setAviso(null), opcoes?.desfazer ? 8000 : 3500);
  }, []);

  // Falhas de gravação na nuvem viram aviso na tela
  useEffect(() => {
    definirAvisoDeErro((e) => {
      console.error(e);
      avisar("Não deu para salvar. Confira a internet.", { erro: true });
    });
  }, [avisar]);

  return (
    <AvisoContext.Provider value={avisar}>
      {children}
      {/* Fica acima da barra de abas e do botão flutuante, respeitando a área de gestos */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+152px)] z-[60] flex justify-center px-4">
        <AnimatePresence>
          {aviso && (
            <motion.div
              key={aviso.id}
              role="status"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              className="pointer-events-auto flex min-h-14 w-full max-w-md items-center gap-3 rounded-2xl bg-[#2b2620] py-2 pr-2 pl-4 text-[16px] font-medium text-[#f4efe8] shadow-flutuante dark:bg-[#3d3631]"
            >
              <span className={aviso.erro ? "flex-1 text-[#ffb4ab]" : "flex-1"}>{aviso.texto}</span>
              {aviso.desfazer && (
                <button
                  onClick={() => {
                    aviso.desfazer?.();
                    setAviso(null);
                  }}
                  className="h-11 rounded-xl bg-white/10 px-4 font-semibold text-[#f8cf94] active:bg-white/20"
                >
                  Desfazer
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AvisoContext.Provider>
  );
}

/** Função para mostrar avisos de qualquer tela. */
export function useAviso(): Avisar {
  const ctx = useContext(AvisoContext);
  if (!ctx) throw new Error("useAviso precisa estar dentro de <AvisoProvider>");
  return ctx;
}
