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
| `args` | debate, side (A/B/N), author, text | author |
| `ups` | arg, user | user |
| `argComments` | arg, author, text | author |
| `communities` | name, icon, hue, desc, rules, author | author |
| `members` | comm, user | user |
| `topics`, `topicReplies` | comm/topic, author, title, text | author |
| `articles` | author, kind, title, summary, body, editedAt | author |
| `articleLikes`, `articleComments` | article, user/author | user/author |
| `jobs` | author, title, company, kind, mode, city, area, deadline, link, desc | author |
| `events` | author, title, date, time, format, place, org, link, desc | author |
| `rsvps` | event, user | user |
| `library` | author, title, authors, kind, theme, year, link, desc | author |
| `private` | salvos (post/job/lib/news), `state` (lista de ativos, leitura de mensagens) | dono (só ele lê) |

O site chama `data/users/<id>` de coleção privada; a ponte (`ecoeco-backend.js`) traduz para `private`.

## Por que uma tabela genérica?
Para a interface do protótipo funcionar quase sem mudanças. Com ~30 pessoas e alguns milhares de documentos, o desempenho é tranquilo. Se a EcoEco crescer muito (milhares de pessoas), vale migrar as coleções mais usadas (posts, comments, likes) para tabelas próprias com índices. Peça isso ao Claude Code quando chegar a hora.
