# Arquitetura

Visão técnica do Komicho Bar: como os dados são guardados, como as telas se organizam e as decisões que não são óbvias.

## Visão geral

```
Telas (pages/)  ──usam──▶  DadosContext (ações + listas)  ──usa──▶  repo.ts
                                                                     ├── Firestore (nuvem ligada)
                                                                     └── localStorage (modo local/demo)
```

- **As telas nunca falam direto com o banco.** Elas leem listas e chamam ações do `useDados()` (`abrirComanda`, `fecharComanda`, `receberFiado`, `salvarLancamento`...).
- **`repo.ts`** tem a mesma API para os dois armazenamentos. Quem decide qual usar é `lib/firebase.ts` (`nuvemLigada`: sempre ligada, menos no modo demo).
- **Gravações compostas** (ex.: fechar conta = criar lançamento + apagar comanda) usam `gravarJuntos()`, que vira um `writeBatch` atômico no Firestore.

## Modos de funcionamento

| Modo | Quando | Login | Onde ficam os dados |
|---|---|---|---|
| **Nuvem** | `npm run dev`, build e produção | Google, só `danyy.jonathan@gmail.com` | Firestore do projeto `komicho-ce5ba` (com cache offline no aparelho) |
| **Demo** | `npm run dev:demo` | nenhum | localStorage (prefixo `komicho-demo:`) com dados fictícios |

A config pública do Firebase fica embutida em `lib/firebase.ts` como reserva (o `.env` pode sobrescrever), então a Vercel não precisa de variáveis de ambiente. Com o cardápio vazio, a aba Produtos oferece "Usar cardápio de exemplo".

## Modelo de dados

Todo valor em dinheiro é **inteiro em centavos** (`4650` = R$ 46,50). Só vira texto com `R$` na hora de mostrar (`lib/dinheiro.ts`). Isso evita erros de arredondamento de ponto flutuante.

Coleções (uma por tipo, todas na raiz do Firestore):

| Coleção | Tipo | O que guarda |
|---|---|---|
| `produtos` | `Produto` | nome, preço, categoria (categorias fixas em `CATEGORIAS_PRODUTO`) |
| `comandas` | `Comanda` | nome + itens. **Só existem enquanto abertas**: ao fechar, viram lançamento ou fiado e são apagadas |
| `clientes` | `Cliente` | clientes do fiado (só o nome) |
| `fiado` | `MovimentoFiado` | `conta` (pendurou) ou `pagamento` (pagou). Saldo = soma das contas − soma dos pagamentos |
| `lancamentos` | `Lancamento` | o Balanço: `entrada` (venda) ou `saida` (gasto), com `origem`, forma ou categoria e data |

### Regras de negócio importantes

- **Preço congelado na venda:** cada `ItemComanda` copia nome e preço do produto. Mudar o preço depois não altera vendas antigas.
- **Fiado só entra no Balanço quando é pago.** Pendurar uma comanda cria `MovimentoFiado(conta)`, não lançamento. Receber cria **ao mesmo tempo** um `Lancamento(entrada, origem: "fiado")` e um `MovimentoFiado(pagamento)` ligados por `lancamentoId`.
- **Apagar um lado apaga o outro:** remover o pagamento no fiado remove a entrada do Balanço, e vice-versa (`removerMovimento` / `removerLancamento`).
- **Apagar cliente** remove o histórico do fiado, mas os pagamentos já recebidos continuam no Balanço (o dinheiro entrou de verdade).
- **Sobrou = Entrou − Saiu** no período. Não há controle de estoque (decisão do dono: só dinheiro).
- **Semana começa na segunda-feira** (`lib/datas.ts`).

## Telas e rotas

| Rota | Tela | Observação |
|---|---|---|
| `/` | `Comandas` | lista de abertas + "Nova comanda" |
| `/comanda/:id` | `ComandaDetalhe` | esconde a barra de abas; rodapé com total e "Fechar conta" |
| `/fiado` | `Fiado` | total a receber + clientes |
| `/fiado/:id` | `ClienteDetalhe` | saldo, Recebi, Anotar, histórico |
| `/balanco` | `Balanco` | escala Dia/Semana/Mês/Ano, gráfico e lançamentos |
| `/produtos` | `Produtos` | cardápio + Ajustes (tema, instalar, conta) |

Painéis (bottom sheets) não são rotas: são componentes `Sheet` abertos por estado local da tela.

## Decisões de interface

- **`Sheet` e `BotaoFlutuante` usam portal no `<body>`.** A animação de entrada das telas usa `transform`, que "prende" elementos `position: fixed` dentro dela.
- **Gravações sem `await`.** Com o Firestore offline, a promessa só termina quando a internet volta; a tela já atualiza na hora pelo cache local. Falhas viram aviso na tela (`definirAvisoDeErro`).
- **`comandasRef` no DadosContext:** toques rápidos seguidos no mesmo produto leem sempre a versão mais recente da comanda, sem perder nenhum.
- **Teclado:** `interactive-widget=resizes-content` no Android e medição do `visualViewport` no iPhone mantêm o painel acima do teclado.
- **Regras CSS base dentro de `@layer base`** para as classes do Tailwind conseguirem sobrescrever (ex.: tamanho do campo de valor).
- **Bundle dividido** em `firebase`, `react` e o código do app (`vite.config.ts`): atualizações do app baixam só o que mudou.

## Segurança

- A config web do Firebase é pública por natureza; a proteção real está em `firestore.rules` (allowlist de e-mails verificados) + domínios autorizados no Firebase Auth.
- `.env` fica fora do Git (`.gitignore`). Só `.env.example` vai para o repositório.
- A allowlist existe em **dois lugares** que precisam bater: `emailsPermitidos` em `lib/firebase.ts` (reserva fixa com o e-mail do Dany, ou `VITE_ALLOWED_EMAILS`) e `firestore.rules` (proteção real). A lista da interface **nunca fica vazia**: sem `.env`, vale a reserva.
- O login pede sempre a escolha de conta (`prompt: select_account`) e qualquer conta fora da lista é deslogada na hora.
