# Changelog

Mudanças do Komicho Bar, da mais recente para a mais antiga.

## 0.3.0 — 21/10/2026

Redesign "caderninho": o mais simples possível, com menos toques, para um funcionário mais velho. Baseado em pesquisa de apps de caixa de comércio e de usabilidade para pessoas mais velhas. 44 testes de ponta a ponta passando.

- Nova tela inicial **Hoje**: quanto tem no caixa hoje + 3 botões grandes (Nova comanda, Entrou dinheiro, Saiu dinheiro) + comandas abertas. A aba "Comandas" virou "Hoje".
- **Entrou dinheiro / Saiu dinheiro**: teclado de calculadora + toque em como entrou ou com o quê saiu, que já salva (com "Ontem" e "Desfazer").
- Comanda: rodapé **"Pagou como?"** com Dinheiro, Pix, Cartão e Fiado; Pix e Cartão fecham com 1 toque (antes eram 2). "Ajustar valor" no rodapé.
- Comanda: produtos em **lista para baixo** com **Mais pedidos** no topo (acabou a fileira de categorias para o lado).
- **Teclado de calculadora** próprio em troco, outro item, ajustar valor, receber e anotar fiado.
- Fiado: "Recebi" salva no toque da forma de pagamento.
- "Cancelar esta comanda" e "Apagar este cliente" escritos por extenso no fim da página (saíram os ícones de lixeira).
- Aviso com "Desfazer" maior e por 8 segundos (antes 5).
- Balanço sem o botão "Anotar" (entradas e saídas ficam na tela Hoje); lançamentos continuam corrigíveis pelo toque.
- **Paleta pastel** (damasco, menta, rosa, lilás) no claro e no escuro.
- Prints, README, manual e arquitetura atualizados.

## 0.2.0 — 20/10/2026

Checagem final: 38 testes de ponta a ponta (comandas, outro item, fechar conta, fiado, balanço, produtos, desfazer, tema) passando, sem erros no console.

- Corrigido: abrir ou recarregar direto uma comanda ou um cliente podia voltar sozinho para a lista (o app se dava por carregado antes de todas as coleções chegarem da nuvem).
- Balanço: "Ver todos" volta a recolher ao trocar de período pelas setas.

- Firebase ligado ao projeto `komicho-ce5ba` (config pública embutida, `.firebaserc`).
- Login só com Google e só `danyy.jonathan@gmail.com`; a lista de permitidos nunca fica vazia.
- Escolha de conta Google sempre aparece ao entrar.
- Regras do Firestore publicadas: exigem o ID da conta do dono e o e-mail verificado.
- Corrigido: tocar no meio do valor em qualquer campo de dinheiro fazia os dígitos entrarem no lugar errado (6,50 virava 60,50); agora o cursor fica sempre no fim.
- Comanda aceita **Outro item**: nome, valor e quantidade digitados na hora, além dos produtos do cardápio.
- Publicado na Vercel em https://komicho-bar.vercel.app, com deploy automático a cada push.
- `vercel.json` corrigido (JSON inválido) e com cache certo para service worker, manifesto e assets.
- Nova comanda só pelo nome da pessoa (o bar não tem mesas numeradas): saíram os atalhos de mesas e balcão; o app avisa se o nome já tem comanda aberta.
- O app real sempre usa a nuvem; o armazenamento local ficou só para o modo demo.

## 0.1.0 — 20/10/2026

Primeira versão (MVP).

- Comandas: abrir por nome ou mesa com atalhos de um toque, grade de produtos por categoria, ajuste de quantidade, renomear e cancelar.
- Fechar conta em Dinheiro (com troco), Pix, Cartão ou Fiado, com desconto opcional e "Desfazer".
- Fiado: saldo por cliente, histórico com itens, receber pagamento total ou parcial, anotar valor avulso.
- Balanço por dia, semana, mês e ano: entrou, saiu, sobrou, gráfico com toque para abrir o período, entradas por forma e gastos por categoria.
- Anotar gastos e vendas avulsas, com edição e exclusão.
- Cardápio editável com cardápio de exemplo.
- PWA instalável (Android e iPhone), offline, aviso de nova versão, tema claro/escuro/automático.
- Modo nuvem (Firebase com login Google e allowlist), modo local e modo demonstração.
