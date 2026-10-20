# Colocar no ar (Firebase + Vercel)

Projeto Firebase: **`komicho-ce5ba`** (conta danyy.jonathan@gmail.com). O login é **só com Google** e **só o e-mail `danyy.jonathan@gmail.com`** entra.

## Já feito

- [x] Projeto criado no Firebase.
- [x] App web "Komicho Bar" registrado (config embutida em `src/lib/firebase.ts` e no `.env` local).
- [x] `.firebaserc` apontando para `komicho-ce5ba`.

## 1. Ativar no console (só pelo navegador, com a conta do Dany)

1. **Login com Google:** [Authentication → Método de login](https://console.firebase.google.com/project/komicho-ce5ba/authentication/providers) → **Google** → Ativar → escolher o e-mail de suporte → Salvar.
2. **Banco de dados:** [Firestore Database](https://console.firebase.google.com/project/komicho-ce5ba/firestore) → **Criar banco de dados** → edição Standard → local `southamerica-east1 (São Paulo)` → **modo de produção** → Criar.

## 2. Publicar as regras de segurança

Depois que o Firestore existir:

```bash
firebase deploy --only firestore:rules
```

As regras (`firestore.rules`) só deixam ler e gravar quem estiver logado com `danyy.jonathan@gmail.com` e com e-mail verificado.

## 3. Testar local

```bash
npm run dev
```

Abra `http://localhost:5173` e entre com o Google (o `localhost` já vem autorizado no Firebase).

## 4. Publicar na Vercel

1. Na [Vercel](https://vercel.com), **Add New → Project** e importe o repositório `Danyyks/komicho-bar`.
2. Framework: **Vite** (detectado sozinho). Build: `npm run build`. Saída: `dist`.
3. Variáveis de ambiente **não são obrigatórias**: a config pública já está no código. Se cadastrar, use as mesmas do `.env`.
4. Deploy. O `vercel.json` cuida das rotas do app e do cache do service worker.

## 5. Autorizar o endereço no login

[Authentication → Configurações → Domínios autorizados](https://console.firebase.google.com/project/komicho-ce5ba/authentication/settings) → **Adicionar domínio** → o endereço da Vercel (ex.: `komicho-bar.vercel.app`). Sem isso, o login mostra "endereço não autorizado".

## 6. Instalar no celular

- **Android (Chrome/Samsung Internet):** abra o endereço → menu ⋮ → **Instalar app** (ou Produtos → Ajustes → Instalar).
- **iPhone (Safari):** **Compartilhar** → **Adicionar à Tela de Início**.

## Liberar outra pessoa no futuro

1. Adicione o e-mail em `firestore.rules` e rode `firebase deploy --only firestore:rules`.
2. Adicione o mesmo e-mail em `RESERVA_EMAILS` (`src/lib/firebase.ts`), faça commit e push.

## Atualizações

Cada `git push` na `main` gera um deploy novo na Vercel. Quem está com o app aberto vê o aviso **"Nova versão do app · Atualizar"**.
