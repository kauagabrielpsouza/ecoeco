# Roteiro do lançamento fechado da EcoEco

Objetivo: colocar a EcoEco no ar com endereço próprio, login só com **usuário e senha**, notícias e indicadores **atualizando sozinhos**, e testar com cerca de **30 pessoas ao mesmo tempo**.

Cada etapa tem três partes:
- **Você faz**: o que só você pode fazer (criar contas, clicar em painéis).
- **Peça ao Claude Code**: texto pronto para copiar e colar.
- **Deu certo se…**: como conferir antes de seguir.

Tempo total estimado: 2 a 4 horas, que podem ser divididas em vários dias.

---

## Etapa 0 · Preparação (≈ 20 min)

**Você faz**
1. Crie uma conta gratuita no **GitHub**: https://github.com/signup
2. Crie uma conta gratuita no **Supabase**: https://supabase.com (pode entrar com a conta do GitHub).
3. Crie uma chave gratuita na **brapi.dev** (para o Ibovespa): https://brapi.dev → "Criar chave". Guarde o token.
4. Abra o **Claude Code** (no app do Claude, aba Code, ou no terminal) e abra esta pasta `ecoeco`.

**Deu certo se…** você tem as três contas e o Claude Code está aberto nesta pasta.

---

## Etapa 1 · Apresentar o projeto ao Claude Code (≈ 5 min)

**Peça ao Claude Code**
```
Leia o CLAUDE.md, o README.md e este ROTEIRO.md. Depois me explique em poucas linhas,
em português simples, como o projeto está organizado e o que vamos fazer em cada etapa.
Não altere nenhum arquivo ainda.
```

**Deu certo se…** ele resume o projeto sem mexer em nada.

---

## Etapa 2 · Repositório no GitHub (≈ 15 min)

**Peça ao Claude Code**
```
Quero guardar este projeto no GitHub num repositório PÚBLICO chamado "ecoeco"
(o GitHub Pages gratuito exige repositório público). Me guie passo a passo:
inicialize o git, faça o primeiro commit e envie para o GitHub.
Antes, confira se não existe nenhuma chave secreta nos arquivos.
```

> Por que público? O código fica visível, mas **os dados não**: eles ficam no Supabase, protegidos pelas regras de segurança. As chaves secretas nunca entram no repositório.

**Deu certo se…** você abre `github.com/SEU-USUARIO/ecoeco` e vê as pastas.

---

## Etapa 3 · Banco de dados no Supabase (≈ 20 min)

**Você faz**
1. No Supabase, clique em **New project**. Nome: `ecoeco`. Região: **South America (São Paulo)**. Crie uma senha forte para o banco e guarde.
2. Quando o projeto terminar de criar, abra **SQL Editor** → **New query**.
3. Cole e rode (**Run**), **nessa ordem**, o conteúdo de:
   - `supabase/01_estrutura.sql`
   - `supabase/02_seguranca.sql`
   - `supabase/03_dados_iniciais.sql`
4. Vá em **Authentication** → **Sign In / Providers** → **Email** e **desligue "Confirm email"**. Salve.
   (Sem isso, o cadastro tenta mandar um e-mail de confirmação para um endereço que não existe.)
5. Vá em **Project Settings** → **API Keys** e copie:
   - **Project URL**
   - a chave **anon** (ou **publishable**), que é pública
   - a chave **service_role** (aba "Legacy API keys") ou **secret**, que é **secreta**: não cole no site nem no chat.

**Peça ao Claude Code**
```
Vou te passar a Project URL e a chave anon do Supabase. Coloque as duas em site/config.js.
NÃO me peça a chave service_role. Depois me diga como conferir no painel do Supabase
se as tabelas docs, indicators, news_items, invites e usernames foram criadas.
```

**Deu certo se…** em **Table Editor** aparecem as tabelas e a tabela `docs` tem as comunidades, debates e livros iniciais.

---

## Etapa 4 · Testar no seu computador (≈ 20 min)

**Peça ao Claude Code**
```
Abra o site da pasta site/ num servidor local e me diga o endereço para abrir no navegador.
Quero testar: criar conta com o convite ECOECO2026, completar o perfil, publicar um post,
curtir, comentar, entrar num debate e argumentar. Se aparecer erro, investigue e corrija.
```

**Você faz**
1. Crie a sua conta no site local (usuário e senha, convite `ECOECO2026`).
2. No Supabase → SQL Editor, abra `supabase/04_tornar_admin.sql`, troque `seu_usuario` pelo seu usuário e rode. Isso libera o painel de **Moderação** para você.
3. Recarregue o site: em Configurações deve aparecer "Moderação".

**Deu certo se…** você consegue publicar, sair da conta e entrar de novo, e o post continua lá.

---

## Etapa 5 · Colocar o site no ar (≈ 15 min)

**Você faz**
1. No repositório do GitHub: **Settings** → **Pages** → em "Build and deployment", **Source: GitHub Actions**.

**Peça ao Claude Code**
```
Envie as mudanças para o GitHub (commit + push). O workflow publicar-site.yml deve publicar
a pasta site/ no GitHub Pages. Acompanhe a aba Actions e me passe o endereço final do site
quando terminar. Se o workflow falhar, leia o erro e corrija.
```

**Deu certo se…** o site abre em `https://SEU-USUARIO.github.io/ecoeco/` no computador e no celular.

---

## Etapa 6 · Notícias e mercado sempre atualizados (≈ 20 min)

**Você faz**
1. No GitHub: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Crie três:
   - `SUPABASE_URL`: a Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: a chave **service_role/secret** (é aqui, e só aqui, que ela fica)
   - `BRAPI_TOKEN`: o token da brapi
2. Aba **Actions** → "Atualizar mercado e notícias" → **Run workflow**.

**Peça ao Claude Code**
```
Rodei o workflow "Atualizar mercado e notícias". Me ajude a ler o resultado na aba Actions.
Confira se as tabelas indicators e news_items foram preenchidas e se o site mostra
"atualizado em" com a hora de hoje. Se a brapi não aceitar o Ibovespa (^BVSP) no plano
grátis, proponha uma alternativa e me pergunte antes de trocar.
```

**Deu certo se…** a aba Notícias mostra matérias de hoje e o card de Indicadores mostra "atualizado em" com a data e hora recentes. A partir daí, o robô roda sozinho a cada 30 minutos.

> O IPCA e o desemprego só mudam quando o IBGE divulga (uma vez por mês); a Selic, nas reuniões do Copom. Dólar e notícias mudam todo dia útil.

---

## Etapa 7 · Teste piloto com 2 ou 3 amigos (1 a 2 dias)

**Você faz**
1. Mande o endereço do site e o convite `ECOECO2026` para 2 ou 3 pessoas.
2. Peça para testarem no celular e no computador: criar conta, postar, comentar, debater, mandar mensagem, entrar numa comunidade, salvar uma vaga.
3. Anote tudo o que der errado ou ficar confuso.

**Peça ao Claude Code** (para cada problema)
```
Um amigo testou e aconteceu isto: [descreva o que aconteceu, em que aba, no celular ou PC].
Investigue a causa, corrija e me explique o que mudou.
```

**Checklist do piloto**
- [ ] Criar conta com convite e sem convite (sem convite deve ser recusado)
- [ ] Duas pessoas veem os posts uma da outra **sem recarregar a página**
- [ ] Mensagem direta só aparece para quem participa da conversa
- [ ] Ninguém consegue editar ou apagar post de outra pessoa
- [ ] Denúncia aparece no seu painel de Moderação
- [ ] Bloquear e desbloquear funcionam
- [ ] Foto de perfil e foto em post funcionam
- [ ] Trocar senha em Configurações funciona

---

## Etapa 8 · Abrir para as 30 pessoas

**Você faz**
1. Se quiser um convite separado para essa turma, rode no SQL Editor:
   `insert into public.invites (code, max_uses) values ('TURMA-UEM', 30);`
2. Divulgue o endereço e o convite.
3. Acompanhe no Supabase: **Authentication → Users** (quantas contas) e **Reports/Logs** se algo travar.

**Situações comuns**
- *Alguém esqueceu a senha*: use o comando no fim de `supabase/04_tornar_admin.sql` para definir uma senha temporária.
- *Site parou de carregar depois de dias sem uso*: o Supabase gratuito pausa o projeto após 1 semana parado. Entre no painel e clique em **Restore**.
- *Robô parou*: o GitHub desliga agendamentos de repositórios sem nenhum commit por 60 dias. Faça qualquer commit ou rode o workflow manualmente.

---

## Etapa 9 · Melhorias depois do teste (opcional)

Peça uma de cada vez:

```
Na aba Mercado, quero mostrar a cotação dos ativos da "Minha lista" usando a brapi,
com atraso informado e respeitando o limite do plano grátis. Mostre o plano antes de fazer.
```
```
Quero separar o site/index.html em arquivos menores (estilos, telas, utilidades) sem mudar
nada do visual nem das funções. Faça em etapas pequenas e teste cada uma.
```
```
Quero que as notificações mostrem um aviso no navegador quando chegar mensagem nova
(só com permissão da pessoa). Me explique as opções antes.
```
```
Antes de abrir ao público: revise segurança, desempenho com 500 pessoas, LGPD e o que
precisa mudar no plano do Supabase. Faça uma lista priorizada.
```
