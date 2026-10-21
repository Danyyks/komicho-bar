// Componentes básicos de interface (botões, campos, chips...). Todas as telas usam
// estes blocos para manter o mesmo visual e o mesmo tamanho de toque (mínimo 48px).
import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { reaisSemSimbolo } from "@/lib/dinheiro";

// ---------- Botão ----------

type Variante = "primario" | "secundario" | "perigo" | "fantasma";

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamanho?: "g" | "m";
  icone?: LucideIcon;
  bloco?: boolean; // ocupa a largura toda
}

const ESTILO_VARIANTE: Record<Variante, string> = {
  primario: "bg-marca text-sobre-marca active:bg-marca-forte",
  secundario: "bg-elevado text-texto active:brightness-95 dark:active:brightness-125",
  perigo: "bg-negativo-suave text-negativo active:brightness-95",
  fantasma: "text-texto-2 active:bg-elevado",
};

/** Botão padrão do app. "primario" é a ação principal da tela (só um por tela). */
export function Botao({ variante = "primario", tamanho = "g", icone: Icone, bloco, className, children, ...props }: BotaoProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-[transform,background-color,filter] duration-150 active:scale-[0.97]",
        tamanho === "g" ? "h-14 px-6 text-[17px]" : "h-12 px-4 text-[16px]",
        bloco && "w-full",
        ESTILO_VARIANTE[variante],
        className,
      )}
    >
      {Icone && <Icone className="size-5 shrink-0" strokeWidth={2.2} />}
      {children}
    </button>
  );
}

/** Botão redondo só com ícone (voltar, ajustes...). Sempre com aria-label. */
export function BotaoIcone({ icone: Icone, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icone: LucideIcon }) {
  return (
    <button
      {...props}
      className={cn(
        // Sem cor de texto fixa: herda do pai ou recebe pela className (ex.: text-negativo)
        "grid size-11 shrink-0 place-items-center rounded-full bg-elevado transition-transform active:scale-90",
        className,
      )}
    >
      <Icone className="size-[22px]" strokeWidth={2} />
    </button>
  );
}

/** Botão flutuante estendido (Material 3) acima da barra de abas: a ação principal da aba.
 * Vai por portal para o <body>: a animação de entrada da tela usa transform, que prenderia o "fixed". */
export function BotaoFlutuante({ icone: Icone, children, onClick }: { icone: LucideIcon; children: ReactNode; onClick: () => void }) {
  return createPortal(
    <motion.button
      onClick={onClick}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+84px)] z-30 flex h-14 items-center gap-2 rounded-2xl bg-marca pr-6 pl-5 text-[17px] font-semibold text-sobre-marca shadow-flutuante"
    >
      <Icone className="size-[22px]" strokeWidth={2.4} />
      {children}
    </motion.button>,
    document.body,
  );
}

// ---------- Campos ----------

/** Campo de texto com rótulo em cima. */
export const Campo = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { rotulo?: string }>(
  function Campo({ rotulo, className, ...props }, ref) {
    return (
      <label className="block">
        {rotulo && <span className="mb-2 block text-[15px] font-medium text-texto-2">{rotulo}</span>}
        <input
          ref={ref}
          {...props}
          className={cn(
            "h-14 w-full rounded-2xl bg-elevado px-4 text-[17px] text-texto outline-none placeholder:text-texto-3 focus:ring-2 focus:ring-marca",
            className,
          )}
        />
      </label>
    );
  },
);

/** Campo de dinheiro estilo apps de banco: os números entram pela direita (1 → 0,01 → 0,12...). */
export function CampoValor({ valor, onMudar, rotulo, autoFocus }: { valor: number; onMudar: (centavos: number) => void; rotulo?: string; autoFocus?: boolean }) {
  return (
    <label className="block text-center">
      {rotulo && <span className="mb-1 block text-[15px] font-medium text-texto-2">{rotulo}</span>}
      <span className="flex items-baseline justify-center gap-1.5">
        <span className="text-2xl font-semibold text-texto-3">R$</span>
        <input
          inputMode="numeric"
          autoFocus={autoFocus}
          value={reaisSemSimbolo(valor)}
          // Só os dígitos importam: o valor é sempre "centavos" e a vírgula é desenhada
          onChange={(e) => onMudar(Math.min(Number(e.target.value.replace(/\D/g, "") || 0), 99_999_999))}
          // Cursor sempre no fim, como numa calculadora: se o toque cair no meio do número,
          // os dígitos entrariam na posição errada (ex.: 6,50 virando 60,50)
          onSelect={(e) => {
            const campo = e.currentTarget;
            const fim = campo.value.length;
            if (campo.selectionStart !== fim || campo.selectionEnd !== fim) campo.setSelectionRange(fim, fim);
          }}
          className="num min-w-0 bg-transparent text-left text-[44px] leading-tight font-semibold text-texto caret-marca outline-none"
          style={{ width: `${Math.max(4, reaisSemSimbolo(valor).length) + 0.5}ch` }}
        />
      </span>
    </label>
  );
}

// ---------- Escolhas ----------

/** Controle segmentado (estilo iOS) com o destaque deslizando entre as opções. */
export function Segmentado<T extends string>({ opcoes, valor, onMudar, id }: { opcoes: { valor: T; rotulo: string }[]; valor: T; onMudar: (v: T) => void; id: string }) {
  return (
    <div className="flex rounded-2xl bg-elevado p-1">
      {opcoes.map((o) => (
        <button
          key={o.valor}
          onClick={() => onMudar(o.valor)}
          className={cn("relative h-11 flex-1 rounded-xl text-[15px] font-semibold transition-colors", valor === o.valor ? "text-texto" : "text-texto-2")}
        >
          {valor === o.valor && (
            <motion.span
              layoutId={`seg-${id}`}
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
              className="absolute inset-0 rounded-xl bg-controle shadow-cartao"
            />
          )}
          <span className="relative">{o.rotulo}</span>
        </button>
      ))}
    </div>
  );
}

/** Chip selecionável (categorias, atalhos de valor...). */
export function Chip({ ativo, children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { ativo?: boolean }) {
  return (
    <button
      {...props}
      className={cn(
        "h-11 shrink-0 rounded-full px-4 text-[15px] font-semibold whitespace-nowrap transition-[transform,background-color] active:scale-95",
        ativo ? "bg-marca text-sobre-marca" : "bg-elevado text-texto",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Linha grande e tocável com ícone (formas de pagamento, opções de menu). */
export function Opcao({ icone: Icone, titulo, detalhe, onClick, cor = "marca" }: { icone: LucideIcon; titulo: string; detalhe?: string; onClick: () => void; cor?: "marca" | "positivo" | "negativo" }) {
  const corIcone = { marca: "bg-marca-suave text-marca-tinta", positivo: "bg-positivo-suave text-positivo", negativo: "bg-negativo-suave text-negativo" }[cor];
  return (
    <button onClick={onClick} className="flex min-h-[68px] w-full items-center gap-4 rounded-2xl bg-elevado px-4 text-left transition-transform active:scale-[0.98]">
      <span className={cn("grid size-11 place-items-center rounded-xl", corIcone)}>
        <Icone className="size-[22px]" strokeWidth={2.2} />
      </span>
      <span className="flex-1">
        <span className="block text-[17px] font-semibold">{titulo}</span>
        {detalhe && <span className="block text-[14px] text-texto-2">{detalhe}</span>}
      </span>
    </button>
  );
}

/** Cores pastel dos botões grandes: fundo suave + texto/ícone escuro do mesmo tom. */
const CORES_GRANDE = {
  marca: { fundo: "bg-marca text-sobre-marca", icone: "bg-white/45 dark:bg-black/15" },
  positivo: { fundo: "bg-positivo-suave text-positivo", icone: "bg-white/60 dark:bg-white/10" },
  negativo: { fundo: "bg-negativo-suave text-negativo", icone: "bg-white/60 dark:bg-white/10" },
  lilas: { fundo: "bg-lilas-suave text-lilas-tinta", icone: "bg-white/60 dark:bg-white/10" },
} as const;
export type CorGrande = keyof typeof CORES_GRANDE;

/** Botão grande da tela inicial: ícone + título + uma linha explicando o que faz. */
export function BotaoGrande({ icone: Icone, titulo, detalhe, cor, onClick }: { icone: LucideIcon; titulo: string; detalhe?: string; cor: CorGrande; onClick: () => void }) {
  const c = CORES_GRANDE[cor];
  return (
    <button onClick={onClick} className={cn("flex min-h-[80px] w-full items-center gap-4 rounded-3xl px-5 text-left transition-transform active:scale-[0.97]", c.fundo)}>
      <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", c.icone)}>
        <Icone className="size-7" strokeWidth={2.2} />
      </span>
      <span>
        <span className="block text-[20px] leading-tight font-bold">{titulo}</span>
        {detalhe && <span className="block text-[15px] font-medium opacity-80">{detalhe}</span>}
      </span>
    </button>
  );
}

/** Botão de escolha em grade (forma de pagamento, motivo do gasto): um toque e pronto. */
export function BotaoEscolha({ icone: Icone, rotulo, cor, onClick }: { icone?: LucideIcon; rotulo: string; cor: CorGrande; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn("flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[16px] font-bold transition-transform active:scale-95", CORES_GRANDE[cor].fundo)}
    >
      {Icone && <Icone className="size-6" strokeWidth={2.2} />}
      <span className="leading-tight">{rotulo}</span>
    </button>
  );
}

// ---------- Estrutura ----------

/** Cartão branco (ou café, no escuro) que agrupa conteúdo. */
export function Cartao({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn("rounded-3xl bg-superficie shadow-cartao", className)}>
      {children}
    </div>
  );
}

/** Título de seção pequeno, acima de uma lista. */
export function TituloSecao({ children, acao }: { children: ReactNode; acao?: ReactNode }) {
  return (
    <div className="mt-7 mb-2.5 flex items-center justify-between px-1">
      <h2 className="text-[15px] font-semibold tracking-wide text-texto-2 uppercase">{children}</h2>
      {acao}
    </div>
  );
}

/** Estado vazio: ícone, frase-convite e (opcional) uma ação. */
export function Vazio({ icone: Icone, titulo, texto, children }: { icone: LucideIcon; titulo: string; texto: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-8 pt-16 pb-8 text-center">
      <div className="mb-5 grid size-20 place-items-center rounded-[28px] bg-marca-suave text-marca-tinta">
        <Icone className="size-9" strokeWidth={1.8} />
      </div>
      <p className="text-[20px] font-semibold">{titulo}</p>
      <p className="mt-1.5 max-w-[17rem] text-[16px] text-texto-2">{texto}</p>
      {children && <div className="mt-6 flex w-full max-w-xs flex-col gap-3">{children}</div>}
    </div>
  );
}

/** Bolinha com as iniciais do nome (clientes do fiado). */
export function Avatar({ nome, tamanho = 44 }: { nome: string; tamanho?: number }) {
  const iniciais = nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-marca-suave font-semibold text-marca-tinta"
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.38 }}
    >
      {iniciais || "?"}
    </span>
  );
}
