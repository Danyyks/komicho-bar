# Colocar no ar (Firebase + Vercel)

Sem estes passos o app funciona em **modo local** (dados só no aparelho). Com eles, os dados ficam na nuvem, protegidos por login Google, e não se perdem se o celular for trocado.

## 1. Criar o projeto no Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com) e crie um projeto (ex.: `komicho-bar`). O Google Analytics pode ficar desligado.
2. **Authentication** → Começar → **Google** → ativar → salvar.
3. **Firestore Database** → Criar banco → modo de produção → região `southamerica-east1` (São Paulo).
4. **Configurações do projeto** → Seus apps → **Web** (`</>`) → registrar o app (sem Hosting) e copiar o objeto `firebaseConfig`.

## 2. Configurar as chaves

1. Copie `.env.example` para `.env` e preencha com os valores do `firebaseConfig`.
2. Em `VITE_ALLOWED_EMAILS`, coloque os e-mails Google que podem entrar, separados por vírgula.
3. Rode `npm run dev` e teste o login em `http://localhost:5173` (o `localhost` já vem autorizado no Firebase).

## 3. Publicar as regras de segurança

As regras ficam em `firestore.rules`. Confira se a lista de e-mails lá é a mesma do `.env` e publique por um destes caminhos:

- **Pelo console:** Firestore → Regras → colar o conteúdo de `firestore.rules` → Publicar.
- **Pela linha de comando** (precisa do Firebase CLI instalado e logado):
  ```bash
  firebase deploy --only firestore:rules --project SEU_PROJECT_ID
  ```

## 4. Publicar na Vercel

1. Na [Vercel](https://vercel.com), **Add New → Project** e importe o repositório `komicho-bar`.
2. Framework: **Vite** (detectado sozinho). Build: `npm run build`. Saída: `dist`.
3. Em **Environment Variables**, cadastre as mesmas variáveis do `.env` (uma por uma, sem espaços nem quebras de linha).
4. Deploy. O `vercel.json` já cuida das rotas do app e do cache do service worker.

## 5. Autorizar o endereço no login

No Firebase: **Authentication → Configurações → Domínios autorizados → Adicionar domínio** e cole o endereço da Vercel (ex.: `komicho-bar.vercel.app`). Sem isso, o login dá erro de "endereço não autorizado".

## 6. Instalar no celular

- **Android (Chrome/Samsung Internet):** abra o endereço → menu ⋮ → **Instalar app** (ou pelo botão em Produtos → Ajustes).
- **iPhone (Safari):** abra o endereço → **Compartilhar** → **Adicionar à Tela de Início**.

## Liberar outra pessoa (ex.: a mãe)

1. Adicione o e-mail Google dela em `firestore.rules` e publique as regras.
2. Adicione o mesmo e-mail em `VITE_ALLOWED_EMAILS` na Vercel e faça um novo deploy.

## Atualizações

Cada `git push` na `main` gera um deploy novo na Vercel. Quem está com o app aberto vê o aviso **"Nova versão do app · Atualizar"**.

## Dados do modo local

Os dados usados em modo local (antes de ligar a nuvem) ficam no navegador e **não** sobem sozinhos para o Firebase. Se você usar o app de verdade antes de ligar a nuvem, avise antes de trocar, para migrarmos os dados.
