// Conexão com o Firebase (login Google + banco Firestore).
// Sem as chaves no .env o app roda em "modo local": salva tudo no próprio aparelho.
import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

/** Tira espaços e lixo de copiar/colar dos valores do .env (ex.: quebra de linha no fim). */
function limpa(valor: unknown): string {
  return String(valor ?? "").trim().split(/\s+/)[0] ?? "";
}

const config = {
  apiKey: limpa(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: limpa(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: limpa(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: limpa(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: limpa(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: limpa(import.meta.env.VITE_FIREBASE_APP_ID),
};

/** `npm run dev:demo`: força o modo local com dados de exemplo (para testar a interface). */
export const modoDemo = import.meta.env.MODE === "demo";

/** Nuvem ligada quando há chaves e não estamos no modo demo. */
export const nuvemLigada = !modoDemo && Boolean(config.apiKey && config.projectId);

let auth: Auth | undefined;
let db: Firestore | undefined;

if (nuvemLigada) {
  const app = initializeApp(config);
  auth = getAuth(app);
  // Cache persistente: o app abre e grava mesmo se a internet piscar,
  // e sincroniza sozinho quando a conexão volta.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
}

export { auth, db };

/** E-mails que podem entrar no app (separados por vírgula no .env). */
export const emailsPermitidos: string[] = String(import.meta.env.VITE_ALLOWED_EMAILS ?? "")
  .split(/[\s,]+/)
  .map((e) => e.trim().toLowerCase())
  .filter((e) => e.includes("@"));
