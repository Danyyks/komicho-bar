// Voltar de verdade (como o gesto do Android) quando há histórico; senão vai para a tela-mãe.
import { useNavigate } from "react-router-dom";

export function useVoltar(telaMae: string) {
  const navigate = useNavigate();
  return () => {
    // O React Router guarda a posição no histórico em history.state.idx
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(telaMae, { replace: true });
  };
}
