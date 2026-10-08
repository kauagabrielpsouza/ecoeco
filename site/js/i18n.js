// =====================================================================
// EcoEco · Textos da interface (português e inglês)
//
// Todos os textos de menus, botões, avisos e mensagens ficam aqui.
// Para ajustar um texto, mude só neste arquivo.
//   - {nome} é trocado por um valor (ex.: {n} = número, {name} = nome).
//   - Chaves terminadas em _one / _other são o singular / plural
//     (usadas com t.n("chave", número)).
// O que as pessoas escrevem e as notícias NÃO passam por aqui.
// =====================================================================
(function () {
  "use strict";

  var DICT = { pt: {}, en: {} };

  // Acrescenta textos: add({ chave: ["português", "english"], ... })
  function add(obj) {
    Object.keys(obj).forEach(function (k) { DICT.pt[k] = obj[k][0]; DICT.en[k] = obj[k][1]; });
  }

  var KEY = "eco-lang";
  var lang = "pt";
  try { if (localStorage.getItem(KEY) === "en") lang = "en"; } catch (e) {}

  function t(key, vars) {
    var s = DICT[lang][key];
    if (s == null) s = DICT.pt[key];
    if (s == null) return key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  }
  // Singular/plural: t.n("followers", 3) -> "3 seguidores" / "3 followers"
  t.n = function (key, n, vars) {
    var v = { n: num(n) };
    if (vars) Object.keys(vars).forEach(function (k) { v[k] = vars[k]; });
    return t(key + (Number(n) === 1 ? "_one" : "_other"), v);
  };

  function locale() { return lang === "en" ? "en-US" : "pt-BR"; }
  function num(v, opts) { var x = Number(v); return isFinite(x) ? x.toLocaleString(locale(), opts || { maximumFractionDigits: 2 }) : String(v); }
  // Números que já vêm escritos em português (ex.: "13,75%", "205.835", "R$ 4,97"):
  // em inglês, troca vírgula decimal por ponto e ponto de milhar por vírgula.
  function numText(s) {
    s = String(s == null ? "" : s);
    if (lang !== "en") return s;
    return s.replace(/\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+,\d+/g, function (m) {
      return m.replace(/\./g, "\u0001").replace(/,/g, ".").replace(/\u0001/g, ",");
    });
  }
  function date(v, opts) { try { return new Date(v).toLocaleDateString(locale(), opts); } catch (e) { return ""; } }
  function time(v, opts) { try { return new Date(v).toLocaleTimeString(locale(), opts); } catch (e) { return ""; } }
  function dateTime(v) {
    if (!v) return "—";
    var d = new Date(v);
    return date(d, { day: "2-digit", month: "2-digit", year: "numeric" }) + t("time.at") + time(d, { hour: "2-digit", minute: "2-digit" });
  }

  function setLang(l) {
    lang = l === "en" ? "en" : "pt";
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
  }
  document.documentElement.lang = lang === "en" ? "en" : "pt-BR";

  window.I18N = {
    DICT: DICT, add: add, t: t, num: num, numText: numText, date: date, time: time, dateTime: dateTime,
    locale: locale, setLang: setLang,
    get lang() { return lang; }
  };


  // -------------------------------------------------------------------
  // Geral
  // -------------------------------------------------------------------
  add({
    "lang.title": ["Idioma", "Language"],
    "lang.desc": ["Muda menus, botões e avisos. O que as pessoas escrevem e as notícias continuam no idioma original.", "Changes menus, buttons and messages. What people write and the news stay in their original language."],
    "lang.pt": ["Português", "Português"],
    "lang.en": ["English", "English"],
    "lang.changed": ["Idioma: português", "Language: English"],

    "time.now": ["agora", "now"],
    "time.min": ["{n} min", "{n} min"],
    "time.h": ["{n} h", "{n} h"],
    "time.d": ["{n} d", "{n} d"],
    "time.at": [" às ", " at "],

    "common.back": ["Voltar", "Back"],
    "common.cancel": ["Cancelar", "Cancel"],
    "common.close": ["Fechar", "Close"],
    "common.save": ["Salvar", "Save"],
    "common.saveChanges": ["Salvar alterações", "Save changes"],
    "common.send": ["Enviar", "Send"],
    "common.delete": ["Excluir", "Delete"],
    "common.confirmDelete": ["Confirmar exclusão", "Confirm deletion"],
    "common.remove": ["Remover", "Remove"],
    "common.edit": ["Editar", "Edit"],
    "common.open": ["abrir", "open"],
    "common.loading": ["Carregando…", "Loading…"],
    "common.choose": ["Escolha…", "Choose…"],
    "common.optional": ["(opcional)", "(optional)"],
    "common.seeAll": ["Ver todos", "See all"],
    "common.excluded": ["Excluído", "Deleted"],
    "common.you": ["Você", "You"],
    "common.visitor": ["Visitante", "Visitor"],
    "common.readOnly": ["Modo leitura", "Read-only mode"],
    "common.moreOptions": ["Mais opções", "More options"],
    "common.publish": ["Publicar", "Post"],

    "err.signIn": ["Entre na sua conta para interagir.", "Sign in to interact."],
    "err.noDb": ["Sem conexão com o banco de dados nesta visualização.", "No database connection in this view."],
    "err.dbFull": ["O banco de dados está cheio. Avise a administração da EcoEco.", "The database is full. Please tell the EcoEco team."],
    "err.tooBig": ["Não foi possível salvar. Se anexou uma imagem, tente uma menor.", "Couldn't save. If you attached an image, try a smaller one."],
    "err.save": ["Não deu para salvar agora. Tente de novo.", "Couldn't save right now. Please try again."],
    "err.connect": ["Não foi possível conectar ao servidor da EcoEco. Confira o arquivo config.js.", "Couldn't connect to the EcoEco server. Check the config.js file."]
  });

  // -------------------------------------------------------------------
  // Menu, barra do celular e menu da conta
  // -------------------------------------------------------------------
  add({
    "nav.home": ["Início", "Home"],
    "nav.notifications": ["Notificações", "Notifications"],
    "nav.alerts": ["Avisos", "Alerts"],
    "nav.news": ["Notícias", "News"],
    "nav.communities": ["Comunidades", "Communities"],
    "nav.debates": ["Debates", "Debates"],
    "nav.articles": ["Artigos", "Articles"],
    "nav.jobs": ["Vagas", "Jobs"],
    "nav.events": ["Eventos", "Events"],
    "nav.library": ["Biblioteca", "Library"],
    "nav.market": ["Mercado", "Market"],
    "nav.messages": ["Mensagens", "Messages"],
    "nav.profile": ["Perfil", "Profile"],
    "nav.explore": ["Explorar", "Explore"],
    "nav.publish": ["Publicar", "Post"],
    "nav.menu": ["Menu", "Menu"],
    "nav.mainMenu": ["Menu principal", "Main menu"],
    "nav.highlights": ["Destaques", "Highlights"],
    "nav.goHome": ["EcoEco, ir para o início", "EcoEco, go to home"],
    "nav.new_one": ["1 nova", "1 new"],
    "nav.new_other": ["{n} novas", "{n} new"],
    "acct.menu": ["Conta", "Account"],
    "acct.viewProfile": ["Ver meu perfil", "View my profile"],
    "acct.theme": ["Tema do site", "Site theme"],
    "acct.settings": ["Configurações", "Settings"],
    "acct.signOut": ["Sair da conta", "Sign out"],
    "acct.completeProfile": ["Complete seu perfil", "Complete your profile"],
    "theme.light": ["Claro", "Light"],
    "theme.dark": ["Escuro", "Dark"],
    "theme.auto": ["Automático", "Automatic"]
  });

  // -------------------------------------------------------------------
  // Configurações
  // -------------------------------------------------------------------
  add({
    "set.title": ["Configurações", "Settings"],
    "set.account": ["Conta", "Account"],
    "set.noUsername": ["Sem nome de usuário", "No username"],
    "set.editProfile": ["Editar perfil", "Edit profile"],
    "set.theme": ["Tema do site", "Site theme"],
    "set.themeDesc": ["Automático segue o tema do seu computador ou celular.", "Automatic follows your computer or phone theme."],
    "set.sidebar": ["Barra lateral", "Sidebar"],
    "set.sidebarDesc": ["No modo compacto, a barra lateral mostra só os ícones e o conteúdo ganha mais espaço.", "In compact mode the sidebar shows only icons and the content gets more room."],
    "set.compact": ["Abas compactas (só ícones)", "Compact tabs (icons only)"],
    "set.compactOn": ["Abas compactas ligadas.", "Compact tabs on."],
    "set.compactOff": ["Abas compactas desligadas.", "Compact tabs off."],
    "set.notifs": ["Notificações", "Notifications"],
    "set.notifsDesc": ["Escolha o que aparece no sininho e na aba Notificações.", "Choose what shows up in the bell and on the Notifications page."],
    "set.notifOn": ["Ligado: {name}", "On: {name}"],
    "set.notifOff": ["Desligado: {name}", "Off: {name}"],
    "set.tags": ["Hashtags que sigo", "Hashtags I follow"],
    "set.tagsDesc": ["As publicações com essas hashtags aparecem na aba Seguindo do feed. Só você vê esta lista.", "Posts with these hashtags show up in the Following tab of your feed. Only you can see this list."],
    "set.tagsEmpty": ["Você ainda não segue nenhuma hashtag. Abra uma # e toque em “Seguir”.", "You don't follow any hashtags yet. Open a # and tap “Follow”."],
    "set.unfollow": ["Deixar de seguir", "Unfollow"],
    "set.blocked": ["Pessoas bloqueadas", "Blocked people"],
    "set.blockedDesc": ["Vocês não veem o conteúdo um do outro e não podem trocar mensagens.", "You can't see each other's content or exchange messages."],
    "set.blockedEmpty": ["Ninguém bloqueado.", "No one blocked."],
    "set.unblock": ["Desbloquear", "Unblock"],
    "set.muted": ["Pessoas silenciadas", "Muted people"],
    "set.mutedDesc": ["As publicações delas não aparecem no seu feed. Elas não são avisadas.", "Their posts don't show up in your feed. They aren't notified."],
    "set.mutedEmpty": ["Ninguém silenciado.", "No one muted."],
    "set.unmute": ["Reativar", "Unmute"],
    "set.privacy": ["Privacidade", "Privacy"],
    "set.showDebates": ["Mostrar meus debates no perfil", "Show my debates on my profile"],
    "set.showCommunities": ["Mostrar minhas comunidades no perfil", "Show my communities on my profile"],
    "set.privNote": ["O lado em que você vota nos debates nunca aparece para outras pessoas. Debates que você propõe e argumentos que você publica continuam visíveis nas páginas dos debates.", "The side you vote for in debates is never shown to other people. Debates you propose and arguments you post stay visible on the debate pages."],
    "set.privText": ["Seu perfil, publicações, argumentos e comentários ficam visíveis para quem tem conta na EcoEco. Mensagens aparecem só para você e a outra pessoa na tela, e publicações salvas e vagas salvas são privadas.", "Your profile, posts, arguments and comments are visible to anyone with an EcoEco account. Messages are shown only to you and the other person, and saved posts and saved jobs are private."],
    "set.privShown": ["Agora aparece no seu perfil.", "It now shows on your profile."],
    "set.privHidden": ["Agora só você vê isso no seu perfil.", "Now only you can see this on your profile."],
    "set.moderation": ["Moderação", "Moderation"],
    "set.moderationDesc": ["Você administra a EcoEco beta.", "You manage EcoEco beta."],
    "set.openModeration": ["Abrir painel de moderação", "Open moderation panel"],
    "set.about": ["Sobre a EcoEco", "About EcoEco"],
    "set.password": ["Senha", "Password"],
    "set.passwordDesc": ["Escolha uma senha com pelo menos 8 caracteres.", "Choose a password with at least 8 characters."],
    "set.newPassword": ["Nova senha", "New password"],
    "set.repeatPassword": ["Repita a senha", "Repeat password"],
    "set.changePassword": ["Trocar senha", "Change password"],
    "set.session": ["Sessão", "Session"],
    "set.footer": ["EcoEco · The Economy Ecosystem · versão beta", "EcoEco · The Economy Ecosystem · beta version"],
    "set.credits": ["Criado por Kauã", "Created by Kauã"]
  });

  // -------------------------------------------------------------------
  // Notificações
  // -------------------------------------------------------------------
  add({
    "notif.k.all": ["Todas", "All"],
    "notif.k.likes": ["Curtidas e apoios", "Likes and supports"],
    "notif.k.comments": ["Comentários e respostas", "Comments and replies"],
    "notif.k.mentions": ["Menções", "Mentions"],
    "notif.k.follows": ["Novos seguidores", "New followers"],
    "notif.k.messages": ["Mensagens", "Messages"],
    "notif.k.tags": ["Hashtags que sigo", "Hashtags I follow"],
    "notif.k.topics": ["Tópicos nas minhas comunidades", "Topics in my communities"],
    "notif.k.args": ["Argumentos nos meus debates", "Arguments in my debates"],
    "notif.k.events": ["Presenças nos meus eventos", "RSVPs to my events"],
    "notif.k.other": ["Outras", "Other"],
    "notif.title": ["Notificações", "Notifications"],
    "notif.markAll": ["Marcar todas como lidas", "Mark all as read"],
    "notif.markedAll": ["Todas as notificações foram marcadas como lidas.", "All notifications marked as read."],
    "notif.seeAll": ["Ver todas", "See all"],
    "notif.none": ["Nenhuma notificação ainda.", "No notifications yet."],
    "notif.emptyAll": ["Ainda não há notificações. Quando alguém curtir, comentar, votar, republicar, seguir você ou mandar mensagem, aparece aqui.", "No notifications yet. When someone likes, comments, votes, reposts, follows you or sends a message, it shows up here."],
    "notif.emptyType": ["Nenhuma notificação deste tipo.", "No notifications of this type."],
    "notif.signIn": ["Entre na sua conta para ver suas notificações.", "Sign in to see your notifications."],
    "notif.newPrefix": ["Nova: ", "New: "],
    "notif.likedPost": ["curtiu sua publicação.", "liked your post."],
    "notif.repostedPost": ["republicou sua publicação.", "reposted your post."],
    "notif.commented": ["comentou: {text}", "commented: {text}"],
    "notif.votedPoll": ["votou na sua votação.", "voted in your poll."],
    "notif.repliedComment": ["respondeu seu comentário: {text}", "replied to your comment: {text}"],
    "notif.likedComment": ["curtiu seu comentário.", "liked your comment."],
    "notif.mentionPost": ["mencionou você numa publicação.", "mentioned you in a post."],
    "notif.mentionComment": ["mencionou você num comentário.", "mentioned you in a comment."],
    "notif.supportedArg": ["apoiou seu argumento.", "supported your argument."],
    "notif.commentedArg": ["comentou seu argumento: {text}", "commented on your argument: {text}"],
    "notif.mentionDebate": ["mencionou você num debate.", "mentioned you in a debate."],
    "notif.debateFeed": ["comentou seu debate no feed.", "commented on your debate in the feed."],
    "notif.debateReply": ["respondeu ao seu debate: {text}", "replied to your debate: {text}"],
    "notif.topicReply": ["respondeu seu tópico: {text}", "replied to your topic: {text}"],
    "notif.mentionForum": ["mencionou você num fórum.", "mentioned you in a forum."],
    "notif.joinedComm": ["entrou na sua comunidade {name}.", "joined your community {name}."],
    "notif.likedArticle": ["curtiu seu texto “{title}”.", "liked your piece “{title}”."],
    "notif.commentedArticle": ["comentou seu texto: {text}", "commented on your piece: {text}"],
    "notif.rsvp": ["vai participar do seu evento “{title}”.", "is going to your event “{title}”."],
    "notif.followedBack": ["seguiu você de volta.", "followed you back."],
    "notif.followed": ["começou a seguir você.", "started following you."],
    "notif.message": ["mandou uma mensagem: {text}", "sent you a message: {text}"],
    "notif.tagPosts_one": ["1 nova publicação em #{tag}", "1 new post in #{tag}"],
    "notif.tagPosts_other": ["{n} novas publicações em #{tag}", "{n} new posts in #{tag}"],
    "notif.newTopic": ["criou o tópico “{title}” em {name}.", "started the topic “{title}” in {name}."],
    "notif.aCommunity": ["uma comunidade", "a community"],
    "notif.newArg": ["argumentou no debate “{title}”.", "posted an argument in the debate “{title}”."],
    "notif.newCount_one": ["1 nova", "1 new"],
    "notif.newCount_other": ["{n} novas", "{n} new"]
  });

  // -------------------------------------------------------------------
  // Rótulos fixos da página
  // -------------------------------------------------------------------
  add({
    "static.publish": ["Publicar", "Post"],
    "static.account": ["Conta", "Account"],
    "static.mainMenu": ["Menu principal", "Main menu"],
    "static.highlights": ["Destaques", "Highlights"],
    "static.menu": ["Menu", "Menu"],
    "static.goHome": ["EcoEco, ir para o início", "EcoEco, go to home"]
  });

  // -------------------------------------------------------------------
  // Páginas institucionais (Sobre, Regras, Termos, Privacidade)
  // -------------------------------------------------------------------
  add({
    "page.notFound": ["Página não encontrada.", "Page not found."],
    "page.page": ["Página", "Page"],
    "page.draft": ["Rascunho: revisar com advogado antes de abrir ao público.", "Draft: to be reviewed by a lawyer before opening to the public."],

    "page.about.title": ["Sobre a EcoEco", "About EcoEco"],
    "page.about.1.h": ["A EcoEco", "EcoEco"],
    "page.about.1.t": ["A EcoEco (The Economy Ecosystem) é uma rede social feita para quem vive, estuda ou gosta de economia. Aqui estudantes, professores, pesquisadores e profissionais publicam análises, debatem ideias, dividem materiais de estudo e encontram oportunidades.", "EcoEco (The Economy Ecosystem) is a social network for people who live, study or love economics. Students, professors, researchers and professionals post analyses, debate ideas, share study materials and find opportunities here."],
    "page.about.2.h": ["O que você encontra", "What you will find"],
    "page.about.2.t": ["Um feed com publicações, gráficos e votações; debates com votos e argumentos; comunidades por tema com fórum; artigos e projetos; vagas de estágio, emprego e pesquisa; eventos; uma biblioteca de materiais e um painel de mercado.", "A feed with posts, charts and polls; debates with votes and arguments; topic communities with forums; articles and projects; internship, job and research openings; events; a library of materials and a market dashboard."],
    "page.about.3.h": ["Nossa ideia", "Our idea"],
    "page.about.3.t": ["Pessoas geram conhecimento, o conhecimento cria conexões e as conexões fazem todo mundo crescer. É isso que a árvore da nossa marca representa.", "People create knowledge, knowledge creates connections, and connections help everyone grow. That is what the tree in our logo stands for."],
    "page.about.4.h": ["Status", "Status"],
    "page.about.4.t": ["A EcoEco está em teste fechado (versão beta). Conteúdos de demonstração, quando houver, estão marcados como tal.", "EcoEco is in a closed test (beta version). Demo content, if any, is labeled as such."],

    "page.rules.title": ["Regras da comunidade", "Community rules"],
    "page.rules.1.h": ["1. Critique ideias, não pessoas", "1. Criticize ideas, not people"],
    "page.rules.1.t": ["Discordar faz parte da economia. Ataques pessoais, xingamentos e discurso de ódio não são aceitos.", "Disagreeing is part of economics. Personal attacks, insults and hate speech are not allowed."],
    "page.rules.2.h": ["2. Traga dados e fontes", "2. Bring data and sources"],
    "page.rules.2.t": ["Sempre que citar números, diga de onde vêm (IBGE, Banco Central, IPEA, artigos). Separe fato de opinião.", "Whenever you quote numbers, say where they come from (IBGE, Central Bank, IPEA, papers). Keep facts apart from opinions."],
    "page.rules.3.h": ["3. Nada de recomendação de investimento", "3. No investment advice"],
    "page.rules.3.t": ["Discutir mercado é livre, mas não publique indicações de compra ou venda de ativos como se fossem orientação profissional.", "Discussing markets is fine, but do not post buy or sell calls as if they were professional advice."],
    "page.rules.4.h": ["4. Sem informação falsa", "4. No false information"],
    "page.rules.4.t": ["Não publique dados inventados ou notícias falsas apresentadas como fato.", "Do not post made-up data or fake news presented as fact."],
    "page.rules.5.h": ["5. Sem spam nem golpes", "5. No spam or scams"],
    "page.rules.5.t": ["Não divulgue promessas de ganho fácil, pirâmides ou links suspeitos. Vagas precisam ser reais e nunca podem cobrar do candidato.", "Do not promote easy-money promises, pyramid schemes or suspicious links. Job posts must be real and can never charge candidates."],
    "page.rules.6.h": ["6. Respeite a privacidade", "6. Respect privacy"],
    "page.rules.6.t": ["Não publique dados pessoais de outras pessoas sem autorização.", "Do not post other people's personal data without permission."],
    "page.rules.7.h": ["Denúncias", "Reports"],
    "page.rules.7.t": ["Use o menu “⋯” de uma publicação e escolha “Denunciar”. A moderação analisa e pode remover o conteúdo.", "Use a post's “⋯” menu and choose “Report”. The moderators review it and may remove the content."],

    "page.terms.title": ["Termos de uso", "Terms of use"],
    "page.terms.1.h": ["1. Aceitação", "1. Acceptance"],
    "page.terms.1.t": ["Ao usar a EcoEco você concorda com estes termos e com as Regras da comunidade.", "By using EcoEco you agree to these terms and to the Community rules."],
    "page.terms.2.h": ["2. Sua conta", "2. Your account"],
    "page.terms.2.t": ["Você é responsável pelas informações do seu perfil e por tudo o que publica. Mantenha seus dados de acesso em segurança.", "You are responsible for your profile information and for everything you post. Keep your sign-in details safe."],
    "page.terms.3.h": ["3. Conteúdo", "3. Content"],
    "page.terms.3.t": ["O conteúdo que você publica continua sendo seu. Ao publicar, você autoriza a EcoEco a exibi-lo na plataforma. Não publique material de terceiros sem permissão.", "The content you post remains yours. By posting, you allow EcoEco to display it on the platform. Do not post third-party material without permission."],
    "page.terms.4.h": ["4. Moderação", "4. Moderation"],
    "page.terms.4.t": ["A EcoEco pode remover conteúdo que viole as regras e suspender contas em caso de violações graves ou repetidas.", "EcoEco may remove content that breaks the rules and suspend accounts for serious or repeated violations."],
    "page.terms.5.h": ["5. Conteúdo educativo", "5. Educational content"],
    "page.terms.5.t": ["Análises e discussões na EcoEco têm caráter educativo e de opinião. Não constituem recomendação de investimento.", "Analyses and discussions on EcoEco are educational and opinion-based. They are not investment advice."],
    "page.terms.6.h": ["6. Alterações", "6. Changes"],
    "page.terms.6.t": ["Estes termos podem mudar. Avisaremos sobre mudanças importantes.", "These terms may change. We will let you know about important changes."],

    "page.privacy.title": ["Política de privacidade", "Privacy policy"],
    "page.privacy.1.h": ["Quais dados coletamos", "What data we collect"],
    "page.privacy.1.t": ["Os dados do seu perfil (nome, nome de usuário, foto, bio e informações profissionais que você escolher preencher), o que você publica e suas interações (curtidas, votos, comentários, mensagens).", "Your profile data (name, username, photo, bio and any professional information you choose to add), what you post and your interactions (likes, votes, comments, messages)."],
    "page.privacy.2.h": ["Para que usamos", "How we use it"],
    "page.privacy.2.t": ["Para exibir seu perfil e suas publicações, montar seu feed, enviar notificações e manter a segurança da comunidade.", "To show your profile and posts, build your feed, send notifications and keep the community safe."],
    "page.privacy.3.h": ["O que é público e o que é privado", "What is public and what is private"],
    "page.privacy.3.t": ["Perfil, publicações, argumentos e comentários são visíveis para quem usa a plataforma. O lado em que você vota nos debates, publicações salvas, vagas salvas, notícias salvas, sua lista de ativos e suas marcações de leitura são privados.", "Profile, posts, arguments and comments are visible to people using the platform. The side you vote for in debates, saved posts, saved jobs, saved news, your watchlist and your read markers are private."],
    "page.privacy.4.h": ["Seus direitos (LGPD)", "Your rights (LGPD)"],
    "page.privacy.4.t": ["Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).", "You can request access to, correction of or deletion of your data at any time, under Brazil's General Data Protection Law (Law No. 13,709/2018)."],
    "page.privacy.5.h": ["Fase de teste", "Test phase"],
    "page.privacy.5.t": ["A EcoEco está em teste fechado. Não pedimos e-mail nem documentos: a conta usa só nome de usuário e senha, guardada de forma criptografada. Mensagens só ficam visíveis para quem participa da conversa.", "EcoEco is in a closed test. We do not ask for email or documents: your account uses only a username and a password, stored encrypted. Messages are visible only to the people in the conversation."]
  });

  // -------------------------------------------------------------------
  // Entrar e criar conta
  // -------------------------------------------------------------------
  add({
    "auth.tagline": ["A rede de quem vive e estuda economia.", "The network for people who live and study economics."],
    "auth.pitch": ["Debata ideias, acompanhe as notícias e os indicadores do dia e conecte-se com quem entende do assunto.", "Debate ideas, follow the day's news and indicators, and connect with people who know the subject."],
    "auth.signIn": ["Entrar", "Sign in"],
    "auth.signUp": ["Criar conta", "Create account"],
    "auth.signInHint": ["Use seu nome de usuário e senha.", "Use your username and password."],
    "auth.signUpHint": ["Só precisamos de um nome de usuário e uma senha. Nada de e-mail ou dados pessoais.", "All we need is a username and a password. No email, no personal data."],
    "auth.username": ["Nome de usuário", "Username"],
    "auth.usernamePh": ["ex.: kaua.economia", "e.g. kaua.economics"],
    "auth.password": ["Senha", "Password"],
    "auth.password2": ["Repita a senha", "Repeat password"],
    "auth.invite": ["Código de convite", "Invite code"],
    "auth.invitePh": ["Peça para quem te convidou", "Ask the person who invited you"],
    "auth.terms": ["Li e aceito as Regras da comunidade e os Termos de uso. Entendo que a EcoEco está em fase de teste.", "I have read and accept the Community rules and the Terms of use. I understand EcoEco is in a test phase."],
    "auth.createAccount": ["Criar minha conta", "Create my account"],
    "auth.toSignUp": ["Ainda não tem conta? Criar conta", "Don't have an account yet? Create one"],
    "auth.toSignIn": ["Já tem conta? Entrar", "Already have an account? Sign in"],
    "auth.forgot": ["Esqueceu a senha? Fale com a administração da EcoEco para redefinir.", "Forgot your password? Ask the EcoEco team to reset it."],
    "auth.wait": ["Aguarde…", "Please wait…"],
    "auth.err.username": ["O nome de usuário precisa ter de 3 a 24 caracteres: letras minúsculas, números, ponto ou _.", "Usernames must have 3 to 24 characters: lowercase letters, numbers, dot or _."],
    "auth.err.short": ["A senha precisa ter pelo menos 8 caracteres.", "Passwords must have at least 8 characters."],
    "auth.err.wrong": ["Usuário ou senha incorretos.", "Wrong username or password."],
    "auth.err.mismatch": ["As senhas não são iguais.", "The passwords don't match."],
    "auth.err.terms": ["Para criar a conta, aceite as Regras e os Termos.", "To create your account, accept the Rules and the Terms."],
    "auth.err.taken": ["Esse nome de usuário já está em uso.", "That username is already taken."],
    "auth.err.invite": ["Código de convite inválido ou esgotado.", "Invalid or used-up invite code."],
    "auth.err.signup": ["Não foi possível criar a conta. Confira o convite e tente outro nome de usuário.", "Couldn't create the account. Check the invite code and try another username."],
    "auth.err.confirm": ["Conta criada, mas o login automático não aconteceu. No Supabase, desligue “Confirm email” (veja o ROTEIRO) e tente entrar.", "Account created, but automatic sign-in didn't happen. In Supabase, turn off “Confirm email” (see ROTEIRO) and try signing in."],
    "auth.err.network": ["Sem conexão com o servidor. Tente de novo.", "No connection to the server. Please try again."],
    "err.privateOnly": ["Somente seus próprios dados privados", "Only your own private data"],
    "err.noEdit": ["Sem permissão para editar", "You don't have permission to edit this"],
    "err.noDelete": ["Sem permissão para apagar", "You don't have permission to delete this"]
  });
})();
