# Funcionalidades da EcoEco (estado atual)

Tudo abaixo está em `site/index.html`. Os textos da interface ficam em `site/js/i18n.js` (português e inglês).

## Conta, idioma e perfil
- Cadastro e login com **usuário + senha**, convite, aceite de Regras/Termos. A tela de entrada tem o botão "English / Português".
- Primeiro acesso em 2 passos: perfil (nome, @usuário, título, foto) e escolha de comunidades e pessoas para seguir.
- Perfil: foto, capa, nome, @usuário, título, bio, cargo, instituição, cidade, link, formação, experiência.
- Abas do perfil: Publicações (com post fixado), Republicações, Artigos, **Debates** (os que a pessoa propôs ou em que argumentou; nunca mostra o lado em que votou), **Comunidades**, Salvos (só o dono vê), Sobre. Debates e Comunidades podem ser escondidas em Configurações › Privacidade.
- Listas clicáveis de seguidores e seguindo.
- **Idioma:** Configurações › Idioma (Português / English). A escolha fica salva no navegador e na conta. Datas e números seguem o idioma. O que as pessoas escrevem, as notícias e os textos do robô de indicadores continuam no idioma original.

## Início (feed)
- Abas Para você / Seguindo. A aba Seguindo mostra pessoas seguidas, republicações delas e **publicações com as hashtags que você segue**.
- Busca em tudo: pessoas, publicações, hashtags, artigos, debates, comunidades, vagas, eventos, biblioteca e notícias, com uma seção por tipo (ignora acentos e maiúsculas).
- Publicar texto com @menções, #hashtags e $ativos; anexar foto/vídeo/arquivo; gráfico; votação (as porcentagens só aparecem depois de votar); inserir dado.
- Curtir, comentar, republicar (não vale na própria publicação), salvar, editar, **excluir com confirmação** (apaga também a foto do armazenamento), fixar, silenciar, bloquear, denunciar.

## Hashtags
- Página de cada # com botão **Seguir / Seguindo** e "Publicar com #".
- Lista das hashtags seguidas em Configurações (só você vê), com "Deixar de seguir".

## Notificações
- **Sininho:** abre uma janelinha com as últimas notificações, "Marcar todas como lidas" e "Ver todas" (aba Notificações). Número de não lidas no menu e no "Avisos" do celular.
- Tipos: curtidas e apoios, comentários e respostas, menções, novos seguidores (e "seguiu você de volta"), mensagens, hashtags que sigo (agrupadas: "3 novas publicações em #econometria"), tópicos novos nas minhas comunidades, argumentos novos nos debates em que votei ou argumentei, presenças nos meus eventos, outras.
- Filtros por tipo na aba completa; liga/desliga de cada tipo em Configurações.

## Notícias
- Prévia com fonte, categoria e data; "Ler no site ↗"; filtro por categoria; salvar; "Discutir no feed". Atualização automática a cada 30 min.

## Comunidades
- Grupos por tema com fórum: participar, criar, abrir tópicos, responder. O número de membros conta também quem escondeu a participação.

## Debates
- Lista com busca, principais da semana e todos.
- Votar direto nos dois botões abaixo da barra (trocar de lado e "desfazer voto"); argumentar é opcional, com posição lado A, lado B ou "Depende". Argumento no lado A/B registra o voto; "Depende" não muda o voto.
- Filtros Sem filtro / lado A / lado B / Depende; ordem por relevância; apoiar e comentar argumentos.
- **Apagar argumento:** o autor (ou admin) vê "Apagar", com confirmação. Apoios e comentários somem junto; o voto não muda.

## Artigos e projetos
- Editor com tipos, dica de formatação abaixo do Texto, contador ("mínimo 30 palavras" até atingir), **rascunho automático** no navegador e **pré-visualização**.
- **Anexos** (até 5): imagens JPG/PNG/WebP/GIF e PDF de até 10 MB, e links. Imagens com legenda e "Inserir no texto" (marcador `[imagem N]` na posição do cursor); as não inseridas vão para a galeria no fim. PDFs com "Abrir" e "Baixar". Reordenar, remover, barra de progresso. Ao remover ou excluir, o arquivo é apagado do armazenamento.

## Vagas
- Filtros por tipo, formato, busca e salvas; prazo não pode estar no passado; link inválido mostra erro (aceita e-mail).

## Eventos
- Próximos, Minha agenda, Anteriores; "Vou participar"; divulgar evento (formato obrigatório, data não pode estar no passado).

## Biblioteca
- Filtros por tipo e tema; busca; salvar; indicar material (link validado).

## Mercado
- Indicadores (Selic, IPCA 12m, dólar, Ibovespa, desemprego, juro real), gráfico do IPCA, ativos mais comentados, "Minha lista" privada com link para cotação.

## Mensagens
- Conversas diretas, busca, contador de não lidas.

## Configurações
- Conta, Idioma, tema, barra lateral compacta, pessoas bloqueadas e silenciadas, Notificações (liga/desliga por tipo), Hashtags que sigo, Privacidade (mostrar debates / comunidades no perfil), Moderação (só admin), páginas institucionais, trocar senha, sair. No fim: "Criado por Kauã".

## Moderação e administração (só quem está na tabela `admins`)
- Excluir qualquer conteúdo (publicações, comentários, argumentos, debates, artigos, comunidades, tópicos, vagas, eventos, biblioteca) direto da tela, com confirmação; uma cópia vai para o **Registro**.
- Abas: Denúncias, Resolvidas, **Contas** (status, suspender por X dias, banir, desfazer, senha temporária), **Convites** (criar com limite de usos, desativar, reativar), **Registro** (tudo o que a moderação fez).
- Conta suspensa ou banida: entra e lê, vê um aviso e não consegue publicar, comentar, votar nem mandar mensagem (garantido pelo banco, SQL 07). Um admin não pode punir a si mesmo.

## Páginas institucionais
- Sobre, Regras, Termos de uso e Política de privacidade (rascunho: revisar com advogado antes de abrir ao público). Em português e inglês.

## Responsividade e acessibilidade
- Desktop (3 colunas; a coluna da direita traz Indicadores, **Notícias agora**, Debate da semana, Em alta, Próximos eventos e Quem seguir), tablet (2), celular (barra inferior + Explorar). Abas que não cabem rolam para o lado, com esmaecido na borda.
- Contraste conferido, foco visível, navegação por teclado, rótulos acessíveis, variações com seta e texto.
