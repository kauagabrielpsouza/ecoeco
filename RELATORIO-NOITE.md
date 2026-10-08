# Relatório da noite · branch `correcoes-noite`

Nada foi publicado, nada foi enviado ao GitHub (sem push) e nada foi rodado no Supabase. A branch principal (`main`) não foi alterada. Os commits não têm linha de coautoria.

O trabalho foi feito em duas sessões: a primeira parou no limite de uso do Claude, e a segunda terminou o que faltava (inglês completo, revisão final e documentação).

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
- **D. Inglês: completo.**
  - Dicionário único `site/js/i18n.js`, com mais de mil textos em português e inglês lado a lado. Nenhum texto de interface ficou fixo no código.
  - Seção Idioma em Configurações, com a escolha salva no navegador e na conta. A tela de entrada tem o botão "English / Português".
  - Datas e números no formato en-US.
  - Todas as telas, janelas, formulários, avisos e mensagens de erro: menus, entrada e cadastro, feed, busca, perfil, debates, comunidades, artigos e anexos, vagas, eventos, biblioteca, mercado, notícias, mensagens, notificações, Moderação e painel de admin, aviso de suspensão e páginas institucionais.
  - As categorias, tipos e status continuam gravados em português no banco e são traduzidos só na tela.
  - **Fica em português de propósito:** o que as pessoas escrevem, as notícias e as frases que o robô de indicadores grava (ex.: "0,55% no dia"). Nessas frases, os números já aparecem no formato en-US. As mensagens de erro que vêm das funções do banco (SQL 07) também estão em português.
- **I. Revisão final:**
  - Testei todas as telas em inglês e em português, no computador e no celular (375 px). Nenhuma passa da largura da tela, e nenhuma chave do dicionário aparece crua.
  - No celular, o perfil agora tem 7 abas. Abas que não cabem ganharam um esmaecido na borda, para mostrar que dá para rolar.
  - O aviso de arquivo grande no feed dizia "20 MB", e o limite real é 10 MB. Corrigido.
  - Revisei de novo os SQL 05, 06 e 07 (tipos, nomes, permissões).
  - Rodei um teste de regressão de todas as letras depois da tradução: tudo passou, sem erros no console.
  - A pasta `docs/` foi atualizada (funcionalidades, banco de dados, segurança e privacidade, design system, dados), além de README, ROTEIRO e CLAUDE.md. O CLAUDE.md ganhou a regra do dicionário de textos e a de commits sem coautoria.

## 3. O que ficou pendente

- **Testes automáticos dos robôs:** não rodaram. O `npm run teste` precisa do Node, que não está instalado neste computador, e não instalei programas sem você pedir. Se quiser, instale o Node 20 (https://nodejs.org) e rode `cd scripts` e depois `npm run teste`.
- **SQL 05, 06 e 07:** revisados, mas ainda sem teste num banco de verdade.
- **Frases do robô de indicadores em inglês:** para traduzir também "no dia", "mantida desde" etc., o robô teria que gravar os valores separados em vez de frases prontas. É uma mudança nos `scripts/`. Me peça se quiser.
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
