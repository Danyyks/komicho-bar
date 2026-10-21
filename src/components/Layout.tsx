// Moldura do app: conteúdo da tela atual + barra de abas fixa no rodapé.
import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { BookUser, ChartNoAxesColumn, Beer, House, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpdatePrompt } from "./UpdatePrompt";

const ABAS: { para: string; rotulo: string; icone: LucideIcon }[] = [
  { para: "/", rotulo: "Hoje", icone: House },
  { para: "/fiado", rotulo: "Fiado", icone: BookUser },
  { para: "/balanco", rotulo: "Balanço", icone: ChartNoAxesColumn },
  { para: "/produtos", rotulo: "Produtos", icone: Beer },
];

export function Layout() {
  const { pathname } = useLocation();
  // A comanda aberta usa o rodapé para o total, então esconde as abas
  const mostrarAbas = !pathname.startsWith("/comanda/");

  // Cada tela nova começa do topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4">
      {/* Entrada suave de cada tela (fade + leve subida) */}
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        className={mostrarAbas ? "pb-[calc(env(safe-area-inset-bottom)+168px)]" : ""}
      >
        <Outlet />
      </motion.main>

      {mostrarAbas && <BarraAbas />}
      <UpdatePrompt />
    </div>
  );
}

/** Barra de abas (Material 3): ícone com "pílula" de destaque na aba ativa + rótulo. */
function BarraAbas() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-linha bg-fundo/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto grid h-[72px] max-w-lg grid-cols-4">
        {ABAS.map(({ para, rotulo, icone: Icone }) => (
          <NavLink key={para} to={para} end={para === "/"} replace className="flex flex-col items-center justify-center gap-1">
            {({ isActive }) => (
              <>
                <span className="relative grid h-8 w-16 place-items-center">
                  {isActive && (
                    <motion.span
                      layoutId="aba-ativa"
                      transition={{ type: "spring", stiffness: 500, damping: 36 }}
                      className="absolute inset-0 rounded-full bg-marca-suave"
                    />
                  )}
                  <Icone className={cn("relative size-6 transition-colors", isActive ? "text-marca-tinta" : "text-texto-2")} strokeWidth={isActive ? 2.3 : 1.9} />
                </span>
                <span className={cn("text-[13px] transition-colors", isActive ? "font-semibold text-texto" : "font-medium text-texto-2")}>{rotulo}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
