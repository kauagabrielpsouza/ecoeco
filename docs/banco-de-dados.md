# Banco de dados

## Tabelas
| Tabela | Para que serve | Quem escreve |
|---|---|---|
| `docs` | Todo o conteúdo da plataforma, como "documentos" (`collection`, `id`, `data` em JSON, `owner`) | Site (cada pessoa só o que é seu) |
| `usernames` | Nome de usuário ↔ conta | Cadastro (automático) |
| `invites` | Códigos de convite e quantos usos restam | Você (SQL Editor) |
| `admins` | Quem pode moderar | Você (SQL Editor) |
| `app_config` | Configurações (ex.: `require_invite`) | Você |
| `indicators` | Selic, IPCA, dólar, Ibovespa, desemprego | Robô (GitHub Actions) |
| `news_items` | Notícias automáticas | Robô (GitHub Actions) |
| `storage.objects` (bucket `media`) | Fotos, vídeos e arquivos | Site (pasta da própria pessoa) |

## Coleções dentro de `docs`
O campo que identifica o autor varia: `author`, `user`, `from` ou `by`. A regra de segurança exige que ele seja a própria pessoa.

| Coleção | Principais campos | Autor |
|---|---|---|
| `users` | name, username, headline, bio, role, school, city, link, education, experience, photo, cover, hue, pinned | id do documento = id da conta |
| `posts` | author, text, media, chart, poll, article, debate, editedAt, createdAt | author |
| `comments` | post, author, text, parent | author |
| `likes`, `reposts` | post, user | user |
| `commentLikes` | comment, user | user |
| `pollVotes` | post, user, opt | user |
| `follows` | from, to | from |
| `messages` | from, to, text | from (só remetente e destinatário leem) |
| `blocks` | from, to | from (só os dois leem) |
| `reports` | post, by, reason, status, snapshot | by (só quem denunciou e admins leem) |
| `debates` | author, title, cat, sideA, sideB, desc | author |
| `votes` | debate, side, user | user |
| `args` | debate, side (A/B/N — N aparece como "Depende"), author, text | author |
| `ups` | arg, user | user |
| `argComments` | arg, author, text | author |
| `communities` | name, icon, hue, desc, rules, author | author |
| `members` | comm, user | user |
| `topics`, `topicReplies` | comm/topic, author, title, text | author |
| `articles` | author, kind, title, summary, body, attachments, editedAt | author |
| `articleLikes`, `articleComments` | article, user/author | user/author |
| `jobs` | author, title, company, kind, mode, city, area, deadline, link, desc | author |
| `events` | author, title, date, time, format, place, org, link, desc | author |
| `rsvps` | event, user | user |
| `library` | author, title, authors, kind, theme, year, link, desc | author |
| `private` | salvos (post/job/lib/news), `state` (lista de ativos, leitura de mensagens) | dono (só ele lê) |

O site chama `data/users/<id>` de coleção privada; a ponte (`ecoeco-backend.js`) traduz para `private`.

## Anexos dos artigos (`articles.attachments`)
Lista com até **5** itens (arquivos e links somados). Cada item:

| Campo | Tipos | O que é |
|---|---|---|
| `type` | todos | `"image"`, `"pdf"` ou `"link"` |
| `url` | todos | Imagem/PDF: endereço público no bucket `media`. Link: endereço `http(s)://` validado |
| `name` | todos | Nome do arquivo, ou título opcional do link |
| `size` | image, pdf | Tamanho em bytes (máximo 10 MB, o mesmo limite do bucket) |
| `caption` | image | Legenda opcional |
| `n` | image | Número fixo da imagem. No texto, um parágrafo só com `[imagem N]` mostra a imagem ali; as que não forem inseridas aparecem numa galeria no fim |

- Imagens aceitas: JPG, PNG, WebP e GIF. Documentos: PDF.
- Os arquivos ficam em `media/<id-da-pessoa>/...`. Ao remover um anexo, salvar uma edição sem ele ou excluir o artigo, o site apaga o arquivo do Storage (a regra `media_delete` só permite isso ao dono ou a um admin).
- O rascunho de um texto novo (incluindo os anexos já enviados) fica salvo no navegador da pessoa (`localStorage`, chave `eco-artdraft-<id>`), não no banco.
- Artigos antigos sem `attachments` continuam funcionando normalmente.

## Limpeza em cascata (`supabase/05_limpeza_em_cascata.sql`)
Quando um documento é apagado, o banco apaga sozinho o que depende dele, mesmo que seja de outras pessoas:

| Ao apagar | Também apaga |
|---|---|
| `posts` | `comments`, `likes`, `reposts`, `pollVotes` |
| `comments` | `commentLikes` e respostas (`comments` com `parent`) |
| `articles` | `articleComments`, `articleLikes` |
| `debates` | `votes`, `args`, `debateComments` |
| `args` | `ups`, `argComments` |
| `communities` | `members`, `topics` |
| `topics` | `topicReplies` |
| `events` | `rsvps` |

Os arquivos no Storage (foto da publicação, anexos do artigo) são apagados pelo site. O mesmo arquivo também impede republicar a própria publicação.

## Privacidade do perfil (`supabase/06_privacidade_perfil.sql`)
- Opções no documento `users` da pessoa: `showDebates` e `showCommunities` (sem o campo, vale "mostrar").
- `votes`: cada pessoa lê só o próprio voto (admin lê todos). Totais por debate: `debate_vote_stats()` → `debate, side_a, side_b, recent` (recent = votos dos últimos 7 dias).
- `members`: escondidos dos outros quando `showCommunities = false`. Total por comunidade: `community_member_counts()` → `comm, members`.
- O site chama essas funções por `EcoBackend.rpc` e atualiza os totais a cada minuto e quando a pessoa vota ou entra numa comunidade. Sem o SQL 06, o site conta pelas linhas que consegue ler.

## Moderação (`supabase/07_moderacao_admin.sql`)
| Tabela | Campos | Quem lê |
|---|---|---|
| `sanctions` | user_id, kind (`suspensao`/`banimento`), until, reason, created_by, created_at | a própria pessoa e admins |
| `mod_log` | admin_id, action, target_user, target_collection, target_id, snapshot (cópia), reason, created_at | só admins |

Funções (todas conferem `is_admin()`, menos `my_sanction`):

| Função | O que faz |
|---|---|
| `my_sanction()` | punição ativa da própria conta (o site mostra o aviso) |
| `admin_delete_doc(coleção, id, motivo)` | guarda cópia no registro e apaga |
| `admin_set_sanction(conta, tipo, dias, motivo)` / `admin_lift_sanction(conta)` | suspender/banir e desfazer (não vale para si mesmo) |
| `admin_list_users()` | contas com usuário, cadastro, último acesso, status |
| `admin_list_invites()`, `admin_create_invite(código, usos)`, `admin_set_invite_active(código, ativo)` | convites |
| `admin_set_password(conta, senha)` | senha temporária (mín. 8 caracteres) |
| `admin_list_log(limite)` | registro de moderação |

## Estado privado (`private` / `data/users/<id>/state`)
Além dos salvos, lista de ativos e leituras: `tags` (hashtags seguidas), `tagSeen` (desde quando segue cada uma), `notifOff` (tipos de notificação desligados) e `lang` (idioma: `pt` ou `en`).

## Por que uma tabela genérica?
Para a interface do protótipo funcionar quase sem mudanças. Com ~30 pessoas e alguns milhares de documentos, o desempenho é tranquilo. Se a EcoEco crescer muito (milhares de pessoas), vale migrar as coleções mais usadas (posts, comments, likes) para tabelas próprias com índices. Peça isso ao Claude Code quando chegar a hora.
