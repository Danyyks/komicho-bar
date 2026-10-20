# Changelog

Mudanças do Komicho Bar, da mais recente para a mais antiga.

## Não publicado

- Firebase ligado ao projeto `komicho-ce5ba` (config pública embutida, `.firebaserc`).
- Login só com Google e só `danyy.jonathan@gmail.com`; a lista de permitidos nunca fica vazia.
- Escolha de conta Google sempre aparece ao entrar.
- Regras do Firestore publicadas: exigem o ID da conta do dono e o e-mail verificado.
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
