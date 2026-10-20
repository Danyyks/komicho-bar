// Painel que sobe de baixo (bottom sheet), como nos apps nativos do iOS e Android.
// Fecha tocando fora, no X ou arrastando a alça para baixo.
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { X } from "lucide-react";

interface SheetProps {
  aberto: boolean;
  onFechar: () => void;
  titulo?: string;
  children: ReactNode;
  /** Área fixa no rodapé do painel (geralmente o botão de confirmar). */
  rodape?: ReactNode;
}

/** Altura do teclado no iPhone (no Android o viewport já encolhe sozinho). */
function useAlturaTeclado(): number {
  const [altura, setAltura] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const medir = () => setAltura(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    vv.addEventListener("resize", medir);
    vv.addEventListener("scroll", medir);
    return () => {
      vv.removeEventListener("resize", medir);
      vv.removeEventListener("scroll", medir);
    };
  }, []);
  return altura;
}

export function Sheet({ aberto, onFechar, titulo, children, rodape }: SheetProps) {
  const arraste = useDragControls();
  const teclado = useAlturaTeclado();

  // Trava a rolagem da página de trás enquanto o painel está aberto
  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [aberto]);

  // Portal no <body>: evita que transformações das páginas prendam o painel "fixed"
  return createPortal(
    <AnimatePresence>
      {aberto && (
        <div className="fixed inset-0 z-50">
          {/* Fundo escurecido: tocar fora fecha */}
          <motion.div
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onFechar}
          />

          {/* O painel em si: desliza de baixo com efeito de mola */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[92dvh] max-w-lg flex-col rounded-t-[28px] bg-superficie shadow-flutuante"
            style={{ marginBottom: teclado }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 40 }}
            drag="y"
            dragListener={false}
            dragControls={arraste}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            // Arrastou bastante ou rápido para baixo: fecha
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onFechar();
            }}
          >
            {/* Alça + título: a área onde o dedo "pega" para arrastar */}
            <div className="shrink-0 touch-none px-5 pt-2.5" onPointerDown={(e) => arraste.start(e)}>
              <div className="mx-auto h-1.5 w-10 rounded-full bg-texto-3/50" />
              <div className="flex min-h-14 items-center justify-between gap-3 pt-2">
                <h2 className="text-[22px] font-bold tracking-tight">{titulo}</h2>
                <button
                  onClick={onFechar}
                  aria-label="Fechar"
                  className="grid size-9 place-items-center rounded-full bg-elevado text-texto-2 active:scale-90"
                >
                  <X className="size-5" strokeWidth={2.4} />
                </button>
              </div>
            </div>

            {/* Conteúdo rolável */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-5">{children}</div>

            {/* Rodapé fixo com a ação principal */}
            {rodape && <div className="shrink-0 px-5 pt-1 pb-[calc(env(safe-area-inset-bottom)+16px)]">{rodape}</div>}
            {!rodape && <div className="h-[env(safe-area-inset-bottom)] shrink-0" />}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
