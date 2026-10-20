// Instalação do PWA: guarda o convite do navegador (Android/Chrome) para usar num botão.
import { useEffect, useState } from "react";

interface ConviteInstalacao extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// O evento chega cedo (antes da tela de ajustes abrir), então fica guardado aqui
let conviteGuardado: ConviteInstalacao | null = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  conviteGuardado = e as ConviteInstalacao;
});

/** true quando o app já está aberto como app instalado (tela cheia). */
const rodandoInstalado = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;

export function useInstalar() {
  const [convite, setConvite] = useState(conviteGuardado);
  const [instalado, setInstalado] = useState(rodandoInstalado);

  // Acompanha o convite chegando depois e a instalação concluída
  useEffect(() => {
    const aoConvite = () => setConvite(conviteGuardado);
    const aoInstalar = () => setInstalado(true);
    window.addEventListener("beforeinstallprompt", aoConvite);
    window.addEventListener("appinstalled", aoInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", aoConvite);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  /** Abre a janela de instalação do navegador. */
  async function instalar() {
    if (!convite) return;
    await convite.prompt();
    const { outcome } = await convite.userChoice;
    if (outcome === "accepted") setInstalado(true);
    conviteGuardado = null;
    setConvite(null);
  }

  return { podeInstalar: !!convite, instalar, instalado };
}
