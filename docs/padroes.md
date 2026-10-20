# Padrões de código

Convenções do Komicho Bar. Valem também como modelo para os próximos projetos.

## Comentários

Todo código leva **comentários curtos e diretos, em português**, explicando o que cada bloco faz. A ideia é que alguém abra qualquer arquivo e entenda a intenção sem precisar ler linha por linha.

**1. Topo do arquivo:** uma ou duas linhas dizendo o papel do arquivo.

```ts
// Cálculos do Balanço: quanto entrou, saiu e sobrou num período.
```

**2. Funções, componentes e tipos exportados:** JSDoc curto (`/** ... */`) com o que fazem.

```ts
/** Quanto um cliente deve hoje: tudo que pendurou menos o que já pagou. */
export function saldoDoCliente(movimentos: MovimentoFiado[], clienteId: string): number {
```

**3. Blocos lógicos dentro do código:** uma linha `//` antes de cada bloco (estado, efeito, cálculo). No JSX, `{/* ... */}` antes de cada seção da tela.

```tsx
// Soma de tudo que está em aberto agora
const totalAberto = comandas.reduce((s, c) => s + totalItens(c.itens), 0);

{/* Rodapé fixo: total e o botão de fechar a conta */}
```

**4. O porquê, quando a decisão não é óbvia.** Esse é o comentário mais valioso.

```ts
// Sem await de propósito: offline a promessa só termina quando a internet volta,
// mas a tela já é atualizada na hora pelo cache local do Firestore.
```

**Evitar:**
- Comentário que repete o código (`// incrementa i`).
- Narrar linha por linha.
- Comentário desatualizado: mudou o código, ajusta o comentário junto.

## Nomes

- **Português** para nomes do domínio (`comanda`, `lancamento`, `fiado`, `abrirComanda`, `CampoValor`), que é a língua do negócio.
- APIs de bibliotecas mantêm o nome original (`useState`, `onSnapshot`).
- Componentes em `PascalCase`, funções e variáveis em `camelCase`, constantes fixas em `MAIUSCULAS`.

## Organização

- `pages/`: uma tela por arquivo; painéis exclusivos da tela ficam no mesmo arquivo, abaixo do componente principal.
- `components/`: blocos reutilizáveis (`ui.tsx` reúne os pequenos: Botao, Campo, Chip...).
- `lib/`: lógica pura sem React (cálculos, datas, dinheiro, banco).
- `context/`: estado global (dados, login, tema, avisos).

## Interface

- **Dinheiro em centavos** (inteiro) em todo o código; formatar só na tela com `reais()`.
- **Toque mínimo de 48px** e textos a partir de 15px (o app precisa ser fácil para qualquer pessoa).
- **Uma ação principal por tela** (botão âmbar). O resto usa `secundario` ou `fantasma`.
- **Nada some sem confirmação ou "Desfazer".**
- **Sem emoji na interface:** ícones de traço (Lucide).
- **Cores sempre pelos tokens** (`bg-superficie`, `text-texto-2`, `text-positivo`...) definidos em `index.css`, para funcionar no claro e no escuro.

## Documentação

Toda feature nova atualiza a documentação **no mesmo commit**: `docs/arquitetura.md` (modelo de dados e decisões), `CLAUDE.md`, `CHANGELOG.md` e o README quando mudar algo visível.
