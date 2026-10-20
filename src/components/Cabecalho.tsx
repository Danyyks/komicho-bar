// Cabeçalhos das telas: título grande (estilo iOS) que encolhe numa barra fixa ao rolar.
import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoltar } from "@/hooks/useVoltar";

/** true depois que a página rolou além do título grande. */
function useRolou(limite = 44): boolean {
  const [rolou, setRolou] = useState(false);
  useEffect(() => {
    const medir = () => setRolou(window.scrollY > limite);
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    return () => window.removeEventListener("scroll", medir);
  }, [limite]);
  return rolou;
}

/** Barra fixa do topo: fica translúcida e mostra o título pequeno quando a página rola. */
function BarraTopo({ titulo, esquerda, direita, sempreVisivel }: { titulo: ReactNode; esquerda?: ReactNode; direita?: ReactNode; sempreVisivel?: boolean }) {
  const rolou = useRolou();
  const mostrar = sempreVisivel || rolou;
  return (
    <div
      className={cn(
        "sticky top-0 z-20 -mx-4 px-4 pt-[env(safe-area-inset-top)] transition-[background-color,border-color] duration-200",
        rolou ? "border-b border-linha bg-fundo/85 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex justify-start">{esquerda}</div>
        <div className={cn("truncate text-center text-[17px] font-semibold transition-opacity duration-200", mostrar ? "opacity-100" : "opacity-0")}>
          {titulo}
        </div>
        <div className="flex justify-end">{direita}</div>
      </div>
    </div>
  );
}

/** Cabeçalho das abas principais: título grande + (opcional) subtítulo e ação à direita. */
export function CabecalhoAba({ titulo, subtitulo, direita }: { titulo: string; subtitulo?: ReactNode; direita?: ReactNode }) {
  return (
    <>
      <BarraTopo titulo={titulo} direita={direita} />
      <header className="px-1 pb-4">
        <h1 className="text-[34px] leading-tight font-bold tracking-tight">{titulo}</h1>
        {subtitulo && <p className="mt-0.5 text-[16px] text-texto-2">{subtitulo}</p>}
      </header>
    </>
  );
}

/** Cabeçalho das telas de detalhe: botão voltar + título central que aparece ao rolar. */
export function CabecalhoDetalhe({ titulo, direita, voltarPara }: { titulo: ReactNode; direita?: ReactNode; voltarPara: string }) {
  const voltar = useVoltar(voltarPara);
  return (
    <BarraTopo
      titulo={titulo}
      direita={direita}
      esquerda={
        <button onClick={voltar} aria-label="Voltar" className="-ml-2 flex h-11 items-center pr-3 text-marca-tinta active:opacity-60">
          <ChevronLeft className="size-7" strokeWidth={2.2} />
          <span className="text-[17px] font-medium">Voltar</span>
        </button>
      }
    />
  );
}
