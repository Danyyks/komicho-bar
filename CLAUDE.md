# Komicho Bar — guia para o Claude

App PWA do Komicho Bar (boteco de vila do Dany): comandas, fiado e balanço de entradas e saídas. Usado no celular (Galaxy S24 Ultra) pelo Dany e pela mãe dele, então **simplicidade e botões grandes vêm antes de qualquer recurso**.

## Comandos

```bash
npm run dev        # app real: Firebase komicho-ce5ba, login só com o Google do Dany
npm run dev:demo   # dados fictícios, sem login (para testar telas e tirar prints)
npm run build      # checa tipos (tsc -b) e gera dist/
npm run icones     # regenera os ícones do PWA a partir de public/favicon.svg
```

## Regras do projeto

- **Escopo do MVP fechado:** Comandas, Fiado, Balanço, Produtos. **Fora:** WhatsApp, QR Code Pix (a maquininha já faz), impressão, página do cliente e **controle de estoque** (o Balanço é só dinheiro: vendido × comprado).
- **Dinheiro sempre em centavos** (inteiro). Formatar só na tela com `reais()`.
- **Comentários curtos em PT-BR em cada bloco**, seguindo [`docs/padroes.md`](docs/padroes.md).
- **Design nível app nativo** (Apple/Google): usar os componentes de `src/components/ui.tsx` e os tokens de cor de `src/index.css`. Sem emoji na interface (ícones Lucide).
- **Documentação no mesmo commit da feature:** `docs/arquitetura.md`, este arquivo, `CHANGELOG.md` e README quando mudar algo visível.
- **Commit e push só quando o Dany pedir.** Ao terminar uma alteração, lembrar que falta commit/push.

## Onde está cada coisa

- `src/context/DadosContext.tsx`: todas as ações de negócio (abrir/fechar comanda, fiado, lançamentos).
- `src/lib/repo.ts`: Firestore ou localStorage com a mesma API; `gravarJuntos()` para gravações atômicas.
- `src/lib/balanco.ts`: cálculos do Balanço e saldo do fiado.
- `src/lib/datas.ts`: períodos (semana começa na segunda).
- `src/components/Sheet.tsx`: painel inferior (sempre via portal).
- Detalhes e decisões: [`docs/arquitetura.md`](docs/arquitetura.md). Deploy: [`docs/deploy.md`](docs/deploy.md). Manual de uso: [`docs/manual.md`](docs/manual.md).

## Armadilhas conhecidas

- Elementos `fixed` dentro da tela animada quebram: use portal (como `Sheet` e `BotaoFlutuante`).
- CSS próprio fora de `@layer base`/`@utility` vence as classes do Tailwind.
- Login **só com Google e só `danyy.jonathan@gmail.com`** (ID `NNFz46NJz2gyNk5mujUb3D2MEIh2`): `firestore.rules` exige ID + e-mail verificado; a interface usa `RESERVA_EMAILS`/`VITE_ALLOWED_EMAILS` (`src/lib/firebase.ts`). Nunca deixar a lista vazia. Mudou as regras? `firebase deploy --only firestore:rules`.
- Firebase CLI já logado na conta do Dany; `.firebaserc` aponta para `komicho-ce5ba`.
- O Git do projeto é **isolado nesta pasta** (a home `C:\Users\danyy` também é um repositório; nunca commitar lá).
