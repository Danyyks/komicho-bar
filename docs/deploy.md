# Colocar no ar (Firebase + Vercel)

Projeto Firebase: **`komicho-ce5ba`** (conta danyy.jonathan@gmail.com). O login é **só com Google** e **só o e-mail `danyy.jonathan@gmail.com`** entra.

## Já feito

- [x] Projeto criado no Firebase.
- [x] App web "Komicho Bar" registrado (config embutida em `src/lib/firebase.ts` e no `.env` local).
- [x] `.firebaserc` apontando para `komicho-ce5ba`.
- [x] Login com Google ativado e Firestore criado (Standard, `southamerica-east1`, modo de produção).
- [x] Login testado: Google vinculado à conta, e-mail verificado, login por e-mail/senha desativado.
- [x] Vercel: projeto `komicho-bar` ligado ao GitHub (push na `main` publica sozinho) em **https://komicho-bar.vercel.app**.
- [x] Regras publicadas: só o ID `NNFz46NJz2gyNk5mujUb3D2MEIh2` com o e-mail `danyy.jonathan@gmail.com` verificado lê e grava. Acesso sem login testado: `PERMISSION_DENIED`.

## 1. Ativar no console (só pelo navegador, com a conta do Dany)

1. **Login com Google:** [Authentication → Método de login](https://console.firebase.google.com/project/komicho-ce5ba/authentication/providers) → **Google** → Ativar → escolher o e-mail de suporte → Salvar.
2. **Banco de dados:** [Firestore Database](https://console.firebase.google.com/project/komicho-ce5ba/firestore) → **Criar banco de dados** → edição Standard → local `southamerica-east1 (São Paulo)` → **modo de produção** → Criar.

## 2. Publicar as regras de segurança

Depois que o Firestore existir:

```bash
firebase deploy --only firestore:rules
```

As regras (`firestore.rules`) só deixam ler e gravar a conta com o ID do Dany **e** o e-mail `danyy.jonathan@gmail.com` verificado.

**Só Google:** em [Authentication → Método de login](https://console.firebase.google.com/project/komicho-ce5ba/authentication/providers), deixe ativo apenas o **Google** (desative "E-mail/senha" e qualquer outro).

## 3. Testar local

```bash
npm run dev
```

Abra `http://localhost:5173` e entre com o Google (o `localhost` já vem autorizado no Firebase).

## 4. Publicar na Vercel (feito)

O projeto foi criado pela CLI (`vercel link --project komicho-bar` + `vercel git connect`), então cada push na `main` publica sozinho. Para publicar na mão:

```bash
vercel --prod
```

- Variáveis de ambiente **não são necessárias**: a config pública já está no código.
- O `vercel.json` define o build, manda toda rota para o `index.html` (o app cuida das telas), deixa `sw.js` e o manifesto sem cache (para as atualizações chegarem) e põe cache longo em `/assets`.

## 5. Autorizar o endereço no login

[Authentication → Configurações → Domínios autorizados](https://console.firebase.google.com/project/komicho-ce5ba/authentication/settings) → **Adicionar domínio** → o endereço da Vercel (ex.: `komicho-bar.vercel.app`). Sem isso, o login mostra "endereço não autorizado".

## 6. Instalar no celular

- **Android (Chrome/Samsung Internet):** abra o endereço → menu ⋮ → **Instalar app** (ou Produtos → Ajustes → Instalar).
- **iPhone (Safari):** **Compartilhar** → **Adicionar à Tela de Início**.

## Liberar outra pessoa no futuro

1. A pessoa entra uma vez com o Google (vai ver "sem acesso"); pegue o ID dela em Authentication → Usuários.
2. Adicione o ID e o e-mail em `firestore.rules` e rode `firebase deploy --only firestore:rules`.
3. Adicione o mesmo e-mail em `RESERVA_EMAILS` (`src/lib/firebase.ts`), faça commit e push.

## Atualizações

Cada `git push` na `main` gera um deploy novo na Vercel. Quem está com o app aberto vê o aviso **"Nova versão do app · Atualizar"**.
