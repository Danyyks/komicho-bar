// Teclado de calculadora para digitar dinheiro, igual ao da maquininha: não abre o
// teclado do celular e tem teclas grandes. Os números entram pela direita
// (4 → R$ 0,04 → 45 → R$ 0,45 → 450 → R$ 4,50).
import { Delete } from "lucide-react";
import { reais } from "@/lib/dinheiro";
import { cn, vibrar } from "@/lib/utils";

const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "apagar"] as const;
const MAXIMO = 99_999_999; // R$ 999.999,99

interface Props {
  valor: number; // centavos
  onMudar: (centavos: number) => void;
  rotulo?: string;
}

/** Visor com o valor em reais + teclado numérico de 3 colunas. */
export function TecladoValor({ valor, onMudar, rotulo }: Props) {
  /** Aplica uma tecla: dígito empurra para a esquerda, "apagar" tira o último. */
  function tocar(tecla: (typeof TECLAS)[number]) {
    vibrar(6);
    if (tecla === "apagar") return onMudar(Math.floor(valor / 10));
    const novo = tecla === "00" ? valor * 100 : valor * 10 + Number(tecla);
    if (novo <= MAXIMO) onMudar(novo);
  }

  return (
    <div>
      {/* Visor */}
      <div className="pb-3 text-center">
        {rotulo && <p className="text-[16px] font-medium text-texto-2">{rotulo}</p>}
        <p className={cn("num mt-0.5 text-[44px] leading-tight font-bold tracking-tight", valor === 0 && "text-texto-3")}>{reais(valor)}</p>
      </div>

      {/* Teclas: segurar o "apagar" zera o valor */}
      <div className="grid grid-cols-3 gap-2">
        {TECLAS.map((t) => (
          <button
            key={t}
            type="button"
            aria-label={t === "apagar" ? "Apagar" : t}
            onClick={() => tocar(t)}
            onContextMenu={(e) => {
              // Toque longo no "apagar" limpa tudo (o celular dispara contextmenu no toque longo)
              if (t !== "apagar") return;
              e.preventDefault();
              vibrar(15);
              onMudar(0);
            }}
            className={cn(
              "num grid h-14 place-items-center rounded-2xl text-[26px] font-semibold transition-transform active:scale-95",
              t === "apagar" ? "bg-elevado text-texto-2" : "bg-elevado text-texto active:bg-marca-suave",
            )}
          >
            {t === "apagar" ? <Delete className="size-7" strokeWidth={2} /> : t}
          </button>
        ))}
      </div>
    </div>
  );
}
