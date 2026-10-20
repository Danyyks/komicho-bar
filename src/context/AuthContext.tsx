// Login só com Google e só para os e-mails permitidos. No modo demo não há login:
// o app abre direto, porque os dados fictícios ficam só no aparelho.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { auth, emailsPermitidos, nuvemLigada } from "@/lib/firebase";

export interface Usuario {
  nome: string;
  email: string;
  foto: string | null;
}

interface Auth {
  usuario: Usuario | null;
  carregando: boolean;
  erro: string | null;
  entrar: () => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<Auth | null>(null);

/** Confere se o e-mail está na lista de permitidos (a lista nunca fica vazia). */
function permitido(email: string): boolean {
  return emailsPermitidos.includes(email.toLowerCase());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(nuvemLigada);
  const [erro, setErro] = useState<string | null>(null);

  // Acompanha a sessão do Firebase (continua logado entre aberturas do app)
  useEffect(() => {
    if (!nuvemLigada || !auth) return;
    return onAuthStateChanged(auth, (u) => {
      if (u?.email && permitido(u.email)) {
        setUsuario({ nome: u.displayName ?? u.email, email: u.email, foto: u.photoURL });
        setErro(null);
      } else {
        setUsuario(null);
        // Entrou com uma conta fora da lista: desloga e avisa
        if (u) {
          setErro("Esta conta não tem acesso ao Komicho Bar.");
          void signOut(auth!);
        }
      }
      setCarregando(false);
    });
  }, []);

  /** Abre o login do Google. Popup é o padrão (redirecionamento trava em PWA no celular). */
  async function entrar() {
    if (!auth) return;
    setErro(null);
    const provedor = new GoogleAuthProvider();
    // Sempre mostra a escolha de conta (evita entrar direto numa conta errada do celular)
    provedor.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(auth, provedor);
    } catch (e) {
      const code = (e as { code?: string }).code ?? "";
      // Fechou a janela: não é erro
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
      // Popup bloqueado: tenta pelo redirecionamento
      if (code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provedor).catch(() => setErro("Não deu para entrar. Tente de novo."));
        return;
      }
      setErro(
        code === "auth/unauthorized-domain"
          ? "Este endereço ainda não foi autorizado no Firebase."
          : "Não deu para entrar. Tente de novo.",
      );
    }
  }

  async function sair() {
    if (auth) await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, erro, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Dados do login em qualquer tela. */
export function useAuth(): Auth {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
