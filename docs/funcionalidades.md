# Funcionalidades da EcoEco (estado atual)

Tudo abaixo já funciona no protótipo e foi levado para `site/index.html`.

## Conta e perfil
- Cadastro e login com **usuário + senha** (versão real), convite opcional, aceite de Regras/Termos.
- Primeiro acesso em 2 passos: perfil (nome, @usuário, título, foto) e escolha de comunidades e pessoas para seguir.
- Perfil: foto, capa, nome, @usuário, título, bio, cargo, instituição, cidade, link, formação, experiência.
- Abas do perfil: Publicações (com **post fixado**), Republicações, Artigos, Salvos (só o dono vê), Sobre.
- Listas clicáveis de seguidores e seguindo.
- Menu da conta (canto inferior esquerdo): tema do site, Configurações, Sair.

## Início (feed)
- Abas Para você / Seguindo; busca com abas Publicações, Pessoas e Hashtags.
- Publicar texto com **@menções**, **#hashtags** e **$ativos** (ex.: $VALE3 vira link para a página do ativo).
- Ferramentas: anexar foto/vídeo/arquivo, criar gráfico (barras/linha), votação (2–4 opções), inserir dado ($SELIC, $IPCA, $DOLAR, $IBOV).
- Curtir, comentar (com respostas e curtidas em comentários), republicar, salvar, editar (marca "editado"), excluir, fixar no perfil, silenciar, bloquear, denunciar.
- Cartões especiais no feed: artigo compartilhado e debate compartilhado.

## Notificações
- Curtidas, comentários, respostas, menções, seguidores, mensagens, apoios em argumentos, respostas em fóruns, inscrições em eventos e novos membros em comunidades.
- Filtros por tipo e "Marcar todas como lidas".

## Notícias
- Prévia com fonte, categoria e data; link "Ler no site ↗"; filtro por categoria; salvar notícia; "Discutir no feed".
- **Versão real:** atualização automática a cada 30 min (robô `scripts/atualizar-noticias.mjs`).

## Comunidades
- Grupos por tema com fórum: participar, criar comunidade, abrir tópicos, responder.

## Debates
- Lista com busca (inclusive antigos), "Principais debates da semana" (por atividade em 7 dias) e "Todos".
- Dentro do debate: barra de votos, "Comentar no feed", argumentar escolhendo posição (lado A, lado B ou imparcial; o lado escolhido registra o voto), lista única de argumentos com filtros e ordem por relevância (apoio = 2 pontos, comentário = 1), apoiar e comentar cada argumento.
- Propor debate (pergunta, tema, dois lados, contexto).

## Artigos e projetos
- Editor de texto longo (tipos: Artigo, Projeto, Resenha, Resumo de aula; subtítulos com `##`), leitura com tempo estimado, curtidas, comentários, editar, excluir, compartilhar no feed.

## Vagas
- Filtros por tipo (estágio, emprego, trainee, pesquisa/IC), formato e busca; salvar vagas; prazo com aviso; divulgar vaga.

## Eventos
- Próximos, Minha agenda, Anteriores; "Vou participar"; divulgar evento; próximos eventos na coluna direita.

## Biblioteca
- Livros, artigos, relatórios, bases de dados e cursos; filtros por tipo e tema; busca; salvar; indicar material.

## Mercado
- Indicadores (Selic, IPCA 12m, dólar, Ibovespa, desemprego, juro real), gráfico do IPCA mensal, ativos mais comentados, "Minha lista" privada com link para cotação.
- **Versão real:** indicadores atualizados a cada 30 min (robô `scripts/atualizar-mercado.mjs`).

## Mensagens
- Conversas diretas, busca de conversas, contador de não lidas.

## Configurações
- Conta, tema (claro/escuro/automático), barra lateral compacta (só ícones), pessoas bloqueadas, pessoas silenciadas, privacidade, moderação (só admin), páginas institucionais, **trocar senha** (versão real), sair.

## Moderação (admin)
- Denúncias pendentes e resolvidas; manter ou remover publicação (guarda cópia do conteúdo removido).

## Páginas institucionais
- Sobre a EcoEco, Regras da comunidade, Termos de uso (rascunho), Política de privacidade (rascunho, cita LGPD). **Revisar com advogado antes de abrir ao público.**

## Responsividade e acessibilidade
- Desktop (3 colunas), tablet (2), celular (barra inferior + aba Explorar + barra superior com a marca).
- Contraste conferido, foco visível, navegação por teclado, rótulos acessíveis, variações com seta e texto (não só cor).
