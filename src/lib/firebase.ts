// Conexão com o Firebase (login Google + banco Firestore) do projeto komicho-ce5ba.
// O modo demo (`npm run dev:demo`) não usa a nuvem: salva tudo no próprio aparelho.
import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

/**
 * Config pública do app web (a config do Firebase é pública por natureza: quem protege
 * os dados são as regras do Firestore + a lista de e-mails). Fica embutida como reserva
 * para o app funcionar mesmo sem .env ou com variável colada com lixo na Vercel.
 */
const RESERVA = {
  apiKey: "AIzaSyDwy1Hqw9lVqTFNQ7sT7Fme5D8Vz6YMqVg",
  authDomain: "komicho-ce5ba.firebaseapp.com",
  projectId: "komicho-ce5ba",
  storageBucket: "komicho-ce5ba.firebasestorage.app",
  messagingSenderId: "159789631592",
  appId: "1:159789631592:web:a76e9c8c2d751b69c2d3dd",
};

/** Tira espaços e lixo de copiar/colar do valor do .env; vazio usa a reserva. */
function limpa(valor: unknown, reserva: string): string {
  return String(valor ?? "").trim().split(/\s+/)[0] || reserva;
}

const config = {
  apiKey: limpa(import.meta.env.VITE_FIREBASE_API_KEY, RESERVA.apiKey),
  authDomain: limpa(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, RESERVA.authDomain),
  projectId: limpa(import.meta.env.VITE_FIREBASE_PROJECT_ID, RESERVA.projectId),
  storageBucket: limpa(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, RESERVA.storageBucket),
  messagingSenderId: limpa(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, RESERVA.messagingSenderId),
  appId: limpa(import.meta.env.VITE_FIREBASE_APP_ID, RESERVA.appId),
};

/** `npm run dev:demo`: dados fictícios só no aparelho, sem login (para testar a interface). */
export const modoDemo = import.meta.env.MODE === "demo";

/** Nuvem ligada sempre, menos no modo demo. */
export const nuvemLigada = !modoDemo;

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

/** Únicos e-mails que podem entrar. Precisa bater com a lista de firestore.rules. */
const RESERVA_EMAILS = ["danyy.jonathan@gmail.com"];

// O .env pode trocar a lista; se vier vazio ou inválido, vale a reserva (nunca fica liberado)
const doEnv = String(import.meta.env.VITE_ALLOWED_EMAILS ?? "")
  .split(/[\s,]+/)
  .map((e) => e.trim().toLowerCase())
  .filter((e) => e.includes("@"));

export const emailsPermitidos: string[] = doEnv.length > 0 ? doEnv : RESERVA_EMAILS;
