<div align="center">

<img src="brand/icone.png" width="110" alt="Ícone do Komicho Bar" />

# Komicho Bar

**Comandas, fiado e balanço do boteco na palma da mão.**

O caderninho do bar no celular: comanda, caixa (o que entrou e o que saiu) e fiado, com botões grandes, poucos toques e cores pastel, pensado para quem não tem intimidade com tecnologia.

<br />

[![No ar na Vercel](https://img.shields.io/badge/Vercel-No_ar-F8CF94?style=for-the-badge&logo=vercel&logoColor=2B2620&labelColor=2B2620)](https://komicho-bar.vercel.app)

<sub>Uso interno do Komicho Bar: só a conta Google do dono entra.</sub>

<br />

![React](https://img.shields.io/badge/React_19-F8CF94?style=flat-square&logo=react&logoColor=2B2620)
![TypeScript](https://img.shields.io/badge/TypeScript-F8CF94?style=flat-square&logo=typescript&logoColor=2B2620)
![Vite](https://img.shields.io/badge/Vite-F8CF94?style=flat-square&logo=vite&logoColor=2B2620)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-F8CF94?style=flat-square&logo=tailwindcss&logoColor=2B2620)
![Firebase](https://img.shields.io/badge/Firebase-F8CF94?style=flat-square&logo=firebase&logoColor=2B2620)
![Motion](https://img.shields.io/badge/Motion-F8CF94?style=flat-square&logo=framer&logoColor=2B2620)
![PWA](https://img.shields.io/badge/PWA-instalável-2B2620?style=flat-square&logo=pwa&logoColor=F8CF94)
![Versão](https://img.shields.io/badge/versão-0.4-2B2620?style=flat-square)

</div>

<br />

## Sobre o projeto

Todo boteco pequeno tem o mesmo caderno: a comanda anotada no guardanapo, o fiado do cliente fiel numa página rabiscada e, no fim do mês, a dúvida de sempre: **sobrou dinheiro ou não?**

O Komicho Bar troca esse caderno por um app que qualquer pessoa consegue usar, inclusive quem nunca mexeu em sistema. A tela inicial tem só três botões grandes: **Nova comanda**, **Entrou dinheiro** e **Saiu dinheiro**. Na comanda não há cardápio para cadastrar: o item é **digitado na hora** (o que foi, quanto custa e quantos), como no papel, e a conta fecha com **um toque** em Pix ou Cartão. Valores são digitados num **teclado de calculadora**, igual ao da maquininha, e escolher "com o quê saiu" já salva o gasto.

A simplicidade veio de pesquisa: apps de caixa usados por comércios (venda rápida por valor, como na maquininha) e estudos de usabilidade com pessoas mais velhas (botões grandes, texto com palavras em vez de ícones soltos, nada de gestos escondidos, tempo para desfazer). O visual usa **tons pastel** em claro e escuro, com acabamento de app nativo: painéis que sobem de baixo, vibração leve ao tocar e modo offline.

<br />

## Telas

<div align="center">

<table>
  <tr>
    <td align="center"><img src="docs/prints/01-hoje.png" width="220" /><br /><sub><b>Hoje</b> · caixa do dia e os 3 botões</sub></td>
    <td align="center"><img src="docs/prints/02-comanda.png" width="220" /><br /><sub><b>Comanda</b> · item digitado na hora</sub></td>
    <td align="center"><img src="docs/prints/03-troco.png" width="220" /><br /><sub><b>Dinheiro</b> · teclado e troco</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/prints/04-saiu-dinheiro.png" width="220" /><br /><sub><b>Saiu dinheiro</b> · o toque no motivo salva</sub></td>
    <td align="center"><img src="docs/prints/05-balanco-mes.png" width="220" /><br /><sub><b>Balanço</b> · entrou, saiu e sobrou</sub></td>
    <td align="center"><img src="docs/prints/06-cliente.png" width="220" /><br /><sub><b>Fiado</b> · o caderno de cada cliente</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/prints/07-hoje-escuro.png" width="220" /><br /><sub><b>Modo escuro</b> · tela Hoje</sub></td>
    <td align="center"><img src="docs/prints/08-comanda-escuro.png" width="220" /><br /><sub><b>Modo escuro</b> · comanda aberta</sub></td>
    <td></td>
  </tr>
</table>

<sub>Prints do modo demonstração, com dados fictícios.</sub>

</div>

<br />

## Funcionalidades

- 🏠 **Tela Hoje**: quanto tem no caixa hoje + 3 botões grandes (Nova comanda, Entrou dinheiro, Saiu dinheiro) + comandas abertas
- 🍺 **Comandas** no nome do cliente, com aviso se já houver uma aberta para a mesma pessoa
- ✏️ **Adicionar item** digitado na hora: o que foi, valor no teclado e quantidade (sem cadastro de produtos), com − / + na lista para repetir
- 💵 **Pagou como?** no rodapé da comanda: Pix e Cartão fecham com um toque; Dinheiro mostra o troco; Fiado pendura na conta; ajuste de valor opcional
- 🔢 **Teclado de calculadora** próprio para valores (igual à maquininha), sem abrir o teclado do celular
- 🟩🟥 **Entrou e Saiu dinheiro**: digita o valor e toca em como entrou ou com o quê saiu; o toque já salva (com opção "Ontem")
- 📒 **Fiado**: saldo de cada cliente, histórico com os itens de cada comanda, receber pagamento (total ou parcial) e anotar valor avulso
- 📊 **Balanço** por dia, semana, mês e ano: entrou, saiu e sobrou, gráfico de barras (toque numa barra para abrir o dia ou o mês), entradas por forma de pagamento e gastos por categoria
- ↩️ **Desfazer** em tudo que apaga ou fecha (o aviso fica 8 segundos)
- 🎨 **Tons pastel** no tema claro, escuro ou automático
- 📲 **Instalável** no Android e no iPhone, abre sem internet e avisa quando há versão nova
- 🔒 **Login só com Google**, liberado apenas para a conta do dono (app e regras do banco)

<br />

## Tecnologias

| Camada | Stack |
|---|---|
| Interface | React 19 · TypeScript · Tailwind CSS v4 · Motion (animações) · Lucide (ícones) · fonte Geist |
| Navegação | React Router 7 |
| App instalável | vite-plugin-pwa (Workbox) · ícones gerados com @vite-pwa/assets-generator |
| Dados | Firebase Firestore com cache offline persistente · modo demo com localStorage |
| Login | Firebase Auth, só Google e só o e-mail do dono |
| Build | Vite 8 (Rolldown) |
| Hospedagem | Vercel (deploy automático a cada push na `main`) |

<br />

## Arquitetura

```
komicho-bar/
├── brand/                  # ícone usado no README
├── docs/                   # arquitetura, padrões, deploy, manual de uso e prints
├── public/                 # favicon e ícones do PWA (gerados por `npm run icones`)
├── src/
│   ├── components/         # blocos de interface (ui, Teclado, Sheet, Cabecalho, Layout...)
│   ├── context/            # Dados, Auth, Tema e Avisos (estado global)
│   ├── hooks/              # useVoltar, useInstalar
│   ├── lib/                # repo (Firestore/localStorage), balanco, datas, dinheiro, seed
│   ├── pages/              # uma tela por arquivo (Hoje, ComandaDetalhe, Balanco, Fiado...)
│   ├── types.ts            # modelo de dados (valores sempre em centavos)
│   └── App.tsx             # provedores e rotas
├── firestore.rules         # só e-mails autorizados leem e gravam
└── vite.config.ts          # PWA, manifesto e divisão do bundle
```

O mesmo repositório genérico grava no **Firestore** quando o Firebase está configurado e no **localStorage** quando não está, então as telas não sabem (nem precisam saber) onde os dados moram. Fechar uma conta é uma gravação única e atômica:

```ts
// Fecha a conta: vira entrada no Balanço ou conta no fiado, e a comanda some.
gravarJuntos([registro, { tipo: "remove", colecao: "comandas", id: c.id }]);
```

E as regras do Firestore liberam o banco só para as contas autorizadas:

```js
function autorizado() {
  return request.auth != null
    && request.auth.token.email_verified == true
    && request.auth.token.email in ['danyy.jonathan@gmail.com'];
}
```

Detalhes em [`docs/arquitetura.md`](docs/arquitetura.md).

<br />

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Rode em **modo demonstração** (dados fictícios, sem login):
   ```bash
   npm run dev:demo
   ```
3. Ou rode o **app real** (Firebase, login com Google):
   ```bash
   npm run dev
   ```
4. Configuração do Firebase e da Vercel em [`docs/deploy.md`](docs/deploy.md).
5. Build de produção:
   ```bash
   npm run build
   ```

<br />

## Roadmap

- [x] Comandas, fechar conta com troco e desconto
- [x] Fiado com histórico e pagamento parcial
- [x] Balanço por dia, semana, mês e ano com gráfico
- [x] Tema claro/escuro, PWA instalável e offline
- [x] Projeto Firebase e app web configurados
- [x] Firestore, login Google e regras de segurança no ar
- [x] Publicado na Vercel ([komicho-bar.vercel.app](https://komicho-bar.vercel.app))
- [x] Redesign "caderninho": tela Hoje, fechar em um toque, teclado de calculadora e cores pastel
- [x] Sem cadastro de produtos: itens digitados na hora (v0.4)
- [ ] Acesso do funcionário (login próprio ou celular do bar)
- [ ] Exportar o balanço do mês (PDF ou planilha)

<br />

## Autor

Feito por **Dany Jonathan Bueno** — estudante de Análise e Desenvolvimento de Sistemas e desenvolvedor em formação.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/danyyjonathan)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/danyyjonathan)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](https://mail.google.com/mail/?view=cm&fs=1&to=danyy.jonathan@gmail.com)

<br />

<div align="center">
<sub>Komicho Bar · feito com cuidado para o balcão de um bar de vila.</sub>
</div>
