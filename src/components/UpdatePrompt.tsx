// Aviso "Nova versão disponível": aparece quando há atualização publicada do app.
import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw } from "lucide-react";

export function UpdatePrompt() {
  const {
    needRefresh: [temNova, setTemNova],
    updateServiceWorker,
  } = useRegisterSW({
    // Procura versão nova ao abrir o app e a cada hora
    onRegisteredSW(_url, registro) {
      if (!registro) return;
      const checar = () => registro.update().catch(() => {});
      setInterval(checar, 60 * 60 * 1000);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checar();
      });
    },
  });

  if (!temNova) return null;

  return (
    <div className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+8px)] z-[70] flex justify-center px-4">
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl bg-superficie py-2 pr-2 pl-3 shadow-flutuante">
        <span className="grid size-10 place-items-center rounded-xl bg-marca-suave text-marca-tinta">
          <RefreshCw className="size-5" />
        </span>
        <p className="flex-1 text-[15px] font-semibold">Nova versão do app</p>
        <button onClick={() => setTemNova(false)} className="h-10 rounded-xl px-3 text-[15px] font-medium text-texto-2">
          Depois
        </button>
        <button onClick={() => void updateServiceWorker(true)} className="h-10 rounded-xl bg-marca px-4 text-[15px] font-semibold text-sobre-marca">
          Atualizar
        </button>
      </div>
    </div>
  );
}
