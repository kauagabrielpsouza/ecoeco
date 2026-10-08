# Instruções para o Claude Code · Projeto EcoEco

## Quem é o dono do projeto
- Kauã, estudante de Ciências Econômicas. **Não é programador**: explique em português simples, sem jargão, e diga sempre o que vai fazer antes de fazer.
- **Responda sempre em português do Brasil.**
- Faça perguntas antes de mudanças grandes ou que apaguem algo. Prefira passos pequenos e testáveis.

## O que é a EcoEco
Rede social de economia (feed, debates, comunidades, artigos, vagas, eventos, biblioteca, notícias e mercado). Nasceu como protótipo dentro do Claude e agora vira site real para um **teste fechado com ~30 pessoas**.

## Arquitetura (não mude sem conversar)
- `site/` é estático (HTML + JS puro, sem build). Publicado no GitHub Pages pelo workflow `publicar-site.yml`.
- `site/index.html` contém a interface inteira. Ela foi escrita para a API `window.claude.use("db" | "user" | "assets")` do protótipo.
- `site/js/ecoeco-backend.js` **reimplementa essa API em cima do Supabase** (tabela genérica `docs`), cuida do login por usuário+senha e dos dados ao vivo. Se algo de banco falhar, o problema quase sempre está aqui ou nas regras SQL, não no index.html.
- Login: o Supabase exige e-mail, então usamos `usuario@ecoeco.example` (ver `config.js`). "Confirm email" precisa estar **desligado** no Supabase.
- Banco: `supabase/*.sql`. Toda permissão é garantida por Row Level Security em `02_seguranca.sql`. **Nunca** confie só no front-end para segurança.
- Robôs: `scripts/*.mjs` (Node 20, sem dependências) rodam no GitHub Actions a cada 30 min e gravam nas tabelas `indicators` e `news_items` com a chave de serviço.

## Regras importantes
1. **Nunca** coloque a `service_role key` no site, em commits ou em mensagens. Ela só existe nos Secrets do GitHub.
2. A chave `anon` pode ficar em `site/config.js` (é pública por design).
3. Notícias: de grandes portais, só **título e link**. Resumo só de fontes com licença aberta (Agência Brasil, CC BY). Nunca copie o texto das matérias.
4. Mercado: nada de recomendação de investimento. Mostre a data/hora de atualização dos números.
5. Mantenha o design system (`docs/design-system.md`): Manrope na interface, Lora só em conteúdo editorial, verde como cor principal, dourado só em detalhes (5–10%).
6. Toda mudança de banco vira um novo arquivo SQL numerado (o próximo é `09_...sql`), nunca edite o que já foi rodado em produção sem avisar.
7. Ao terminar uma etapa, rode os testes e explique como o Kauã confere que funcionou.
8. Textos da interface ficam **só** em `site/js/i18n.js` (português e inglês). No código use `tr("chave")` ou `tr.n("chave", n)`; nunca escreva texto fixo. Valores gravados no banco (categorias, tipos) continuam em português e são traduzidos na exibição (`optLabel`).
9. Commits deste projeto **não** levam linha de coautoria do Claude.

## Comandos úteis
- Ver o site no computador: `npx serve site` (ou `python3 -m http.server 8080 --directory site`) e abrir o endereço mostrado.
- Testar robôs sem internet: `cd scripts && npm run teste`.
- Rodar robôs de verdade (precisa das variáveis): `cd scripts && SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... BRAPI_TOKEN=... npm run tudo`.

## Onde está cada coisa
- Funcionalidades por aba: `docs/funcionalidades.md`
- Coleções e campos do banco: `docs/banco-de-dados.md`
- APIs e fontes de dados: `docs/dados-e-fontes.md`
- Segurança e privacidade: `docs/seguranca-e-privacidade.md`
- Passo a passo do lançamento: `ROTEIRO.md`
