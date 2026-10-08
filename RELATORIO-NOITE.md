# Relatório da noite · branch `correcoes-noite`

Nada foi publicado, nada foi enviado ao GitHub (sem push) e nada foi rodado no Supabase. A branch principal (`main`) não foi alterada. Os commits não têm linha de coautoria.

**O trabalho parou antes do fim porque o limite de uso do Claude foi atingido.** Abaixo está o que ficou pronto e o que falta.

## 1. Arquivos SQL para rodar no Supabase (nesta ordem)

No Supabase → SQL Editor → New query → colar → Run:

1. `supabase/05_limpeza_em_cascata.sql`: ao excluir algo, apaga o que sobra (comentários, curtidas, votos etc.) e impede republicar a própria publicação.
2. `supabase/06_privacidade_perfil.sql`: o voto de cada pessoa fica secreto e as comunidades podem ser escondidas do perfil. Os totais de votos e membros continuam funcionando.
3. `supabase/07_moderacao_admin.sql`: traz suspensão e banimento (garantidos pelo banco), o registro de moderação e o painel de administração.

Esses arquivos **não foram testados num banco de verdade**, porque não tenho acesso ao seu Supabase. Se algum der erro, me mande a mensagem. Sem eles, o site continua funcionando, mas as partes que dependem deles não fazem efeito.

## 2. O que foi feito em cada letra

- **A. Correções da revisão:** todas as 11, feitas e testadas ontem. Guardadas num commit agrupado, porque estavam misturadas no mesmo arquivo.
- **B. Créditos:** "Criado por Kauã" no fim das Configurações.
- **C. Apagar argumento:**
  - O autor ou um admin vê "Apagar", com a pergunta de confirmação.
  - Os apoios e comentários somem junto (pelo SQL 05), e os contadores dos filtros se atualizam.
  - O voto no debate não muda.
- **E. Seguir hashtags:**
  - Botão Seguir/Seguindo na página da #.
  - As publicações com essas hashtags entram na aba "Seguindo".
  - A lista fica nas Configurações, e só você a vê.
- **F. Sininho:**
  - Janelinha com as últimas notificações, "Ver todas" e "Marcar todas como lidas".
  - Número de não lidas, também no "Avisos" do celular.
  - Tipos novos: seguiu de volta, hashtags (agrupadas), tópico novo, argumento novo.
  - Filtros por tipo e liga/desliga de cada tipo em Configurações.
- **G. Perfil:**
  - Abas Debates e Comunidades. O lado em que a pessoa votou nunca aparece.
  - Duas opções em Configurações → Privacidade, que valem no banco com o SQL 06.
- **H. Administração:**
  - Excluir qualquer conteúdo, com confirmação e cópia no registro. Isso inclui comentários, que antes não tinham opção de excluir.
  - Suspender por X dias ou banir, com motivo, e desfazer. Um admin não pode punir a si mesmo.
  - A conta punida vê um aviso, e o banco recusa as ações dela (SQL 07).
  - Moderação: abas Contas (incluindo senha temporária), Convites (criar e desativar) e Registro.
- **D. Inglês: parcial.**
  - **Pronto:**
    - o dicionário único `site/js/i18n.js`;
    - a seção Idioma, com a escolha salva para a pessoa;
    - datas e números no formato en-US;
    - menus, Configurações, notificações, entrada e cadastro (com troca de idioma ali), páginas institucionais;
    - feed, busca, perfil e janelas, debates, Explorar, comunidades, artigos e anexos, vagas, eventos e formulários de criação.
  - As categorias continuam gravadas em português no banco e são traduzidas só na tela.

## 3. O que ficou pendente

- **D. Telas ainda em português:**
  - Biblioteca, Mercado e indicadores, Notícias, Mensagens, quadro lateral ("Quem seguir").
  - Segundo passo do primeiro acesso, Moderação e painel de admin, aviso de suspensão.
  - Vários avisos curtos ao clicar (por exemplo "Republicado", "Voto registrado") e as datas das notícias.
  - O mesmo método vale para essas telas: dicionário + `tr()`.
- **I. Revisão final e atualização da pasta `docs/`:** não deu tempo.
  - Só `docs/banco-de-dados.md` foi atualizado: anexos e limpeza em cascata.
  - Falta documentar SQL 06 e 07, notificações, hashtags, idioma e administração.
- **Testes automáticos:** não rodaram. O `npm run teste` precisa do Node, que não está instalado neste computador.
- **Decisão sua:** na G, os debates que a pessoa propõe e os argumentos dela continuam aparecendo com o nome nas páginas dos debates, mesmo com "Mostrar meus debates" desligado. É conteúdo público por natureza. Se quiser anonimato, me avise.

## 4. Como conferir no site (localhost:8080)

Primeiro, rode os SQL 05, 06 e 07. Para os testes com outra pessoa, crie uma **segunda conta** com o convite `ECOECO2026`, numa janela anônima do navegador.

- **Apagar argumento:** num debate, argumente e clique em "Apagar". A confirmação aparece, e o seu voto continua.
- **Seguir hashtag:**
  1. Com a conta 1, abra uma #, como `#econometria`, e clique em "Seguir".
  2. Com a conta 2, publique algo com `#econometria`.
  3. Na conta 1, o post aparece na aba "Seguindo" e o sininho mostra "1 nova publicação em #econometria".
- **Notificações:** a conta 2 segue você, manda mensagem, comenta seu artigo e confirma presença no seu evento. O sininho mostra o número, e cada tipo pode ser desligado em Configurações.
- **Privacidade do perfil:** a conta 2 desliga "Mostrar minhas comunidades no perfil". No perfil dela, aberto pela conta 1, a aba Comunidades some, mas o total de membros da comunidade não muda.
- **Suspensão:**
  1. Configurações → Moderação → Contas: suspenda a conta 2 por 1 dia, com motivo.
  2. Na conta 2, recarregue. Aparece o aviso, e não dá para publicar, comentar, votar nem mandar mensagem.
  3. Desfaça a suspensão e confira tudo de novo.
  4. No Registro, as ações aparecem anotadas.
- **Inglês:** Configurações → Idioma → English. Na tela de entrada também há o botão "English".
