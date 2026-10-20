# Changelog

Mudanças do Komicho Bar, da mais recente para a mais antiga.

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
