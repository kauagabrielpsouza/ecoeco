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

  // -------------------------------------------------------------------
  // Feed, publicações, comentários e busca
  // -------------------------------------------------------------------
  add({
    "feed.search": ["Buscar", "Search"],
    "feed.searchPh": ["Buscar pessoas, publicações, artigos, debates, vagas…", "Search people, posts, articles, debates, jobs…"],
    "feed.forYou": ["Para você", "For you"],
    "feed.following": ["Seguindo", "Following"],
    "feed.connecting": ["Conectando ao banco de dados…", "Connecting to the database…"],
    "feed.readOnly": ["Você está no modo leitura. Entre na sua conta para publicar e interagir.", "You're in read-only mode. Sign in to post and interact."],
    "feed.emptyFollowing": ["Nada por aqui ainda. Siga pessoas pelo quadro “Quem seguir” e as publicações delas aparecem nesta aba.", "Nothing here yet. Follow people from the “Who to follow” box and their posts will show up in this tab."],
    "feed.emptySearch": ["Nenhuma publicação encontrada para essa busca.", "No posts found for this search."],
    "feed.empty": ["Ainda não há publicações.", "No posts yet."],
    "feed.back": ["Voltar ao feed", "Back to feed"],

    "follow.follow": ["Seguir", "Follow"],
    "follow.following": ["Seguindo", "Following"],

    "post.title": ["Publicação", "Post"],
    "post.gone": ["Esta publicação não existe mais.", "This post no longer exists."],
    "post.attachedImage": ["Imagem anexada", "Attached image"],
    "post.file": ["Arquivo", "File"],
    "post.save": ["Salvar publicação", "Save post"],
    "post.unsave": ["Remover dos salvos", "Remove from saved"],
    "post.pin": ["Fixar no perfil", "Pin to profile"],
    "post.unpin": ["Desafixar do perfil", "Unpin from profile"],
    "post.edit": ["Editar publicação", "Edit post"],
    "post.delete": ["Excluir publicação", "Delete post"],
    "post.deleteMod": ["Excluir publicação (moderação)", "Delete post (moderation)"],
    "post.mute": ["Silenciar {name}", "Mute {name}"],
    "post.block": ["Bloquear {name}", "Block {name}"],
    "post.report": ["Denunciar publicação", "Report post"],
    "post.pinned": ["Publicação fixada", "Pinned post"],
    "post.youReposted": ["Você republicou", "You reposted"],
    "post.reposted": ["{name} republicou", "{name} reposted"],
    "post.edited": ["editado", "edited"],
    "post.saved": ["Salvo", "Saved"],
    "post.like": ["Curtir", "Like"],
    "post.comment": ["Comentar", "Comment"],
    "post.repost": ["Republicar", "Repost"],
    "post.cantRepost": ["Você não pode republicar a sua própria publicação", "You can't repost your own post"],
    "post.repostUnavailable": ["Republicar (indisponível na sua própria publicação)", "Repost (not available on your own post)"],
    "post.count_one": ["1 publicação", "1 post"],
    "post.count_other": ["{n} publicações", "{n} posts"],

    "poll.votes_one": ["1 voto", "1 vote"],
    "poll.votes_other": ["{n} votos", "{n} votes"],
    "poll.change": ["clique em outra opção para mudar seu voto", "click another option to change your vote"],
    "poll.voteToSee": ["vote para ver o resultado", "vote to see the results"],
    "poll.signInToVote": ["entre na sua conta para votar e ver o resultado", "sign in to vote and see the results"],

    "comp.new": ["Nova publicação", "New post"],
    "comp.ph": ["O que você pensa sobre economia hoje?", "What do you think about the economy today?"],
    "comp.hint": ["Use @ para mencionar alguém e # para marcar um tema.", "Use @ to mention someone and # to tag a topic."],
    "comp.attachLabel": ["Anexar foto, vídeo ou arquivo", "Attach a photo, video or file"],
    "comp.attach": ["Anexar", "Attach"],
    "comp.chart": ["Gráfico", "Chart"],
    "comp.poll": ["Votação", "Poll"],
    "comp.data": ["Dado", "Data"],
    "comp.sending": ["Enviando…", "Uploading…"],
    "comp.option": ["Opção {n}", "Option {n}"],
    "comp.addOption": ["Adicionar opção", "Add option"],
    "comp.rmDebate": ["Remover debate", "Remove debate"],
    "comp.rmShare": ["Remover texto compartilhado", "Remove shared piece"],
    "comp.rmAtt": ["Remover anexo", "Remove attachment"],
    "comp.rmChart": ["Remover gráfico", "Remove chart"],
    "comp.rmPoll": ["Remover votação", "Remove poll"],

    "comment.title": ["Comentários", "Comments"],
    "comment.write": ["Escreva um comentário", "Write a comment"],
    "comment.ph": ["Escreva um comentário…", "Write a comment…"],
    "comment.replyPh": ["Escreva sua resposta…", "Write your reply…"],
    "comment.reply": ["Responder", "Reply"],
    "comment.replyingTo": ["Respondendo a {name}", "Replying to {name}"],
    "comment.first": ["Seja a primeira pessoa a comentar.", "Be the first to comment."],
    "comment.like": ["Curtir comentário", "Like comment"],

    "search.people": ["Pessoas", "People"],
    "search.posts": ["Publicações", "Posts"],
    "search.tags": ["Hashtags", "Hashtags"],
    "search.articles": ["Artigos e projetos", "Articles and projects"],
    "search.debates": ["Debates", "Debates"],
    "search.communities": ["Comunidades", "Communities"],
    "search.jobs": ["Vagas", "Jobs"],
    "search.events": ["Eventos", "Events"],
    "search.library": ["Biblioteca", "Library"],
    "search.news": ["Notícias", "News"],
    "search.all": ["Tudo", "All"],
    "search.type": ["Tipo de resultado", "Result type"],
    "search.results": ["Resultados para “{q}”", "Results for “{q}”"],
    "search.clear": ["Limpar busca", "Clear search"],
    "search.none": ["Nada encontrado para “{q}”. Tente outra palavra.", "Nothing found for “{q}”. Try another word."],
    "search.noneIn": ["Nada encontrado em {type}.", "Nothing found in {type}."],

    "tag.postWith": ["Publicar com #{tag}", "Post with #{tag}"],
    "tag.empty": ["Nenhuma publicação com essa hashtag ainda.", "No posts with this hashtag yet."],

    "comm.members_one": ["1 membro", "1 member"],
    "comm.members_other": ["{n} membros", "{n} members"],
    "news.read": ["Ler no site ↗", "Read on site ↗"]
  });

  // -------------------------------------------------------------------
  // Perfil, seguidores e janelas (editar perfil, primeiro acesso,
  // gráfico, bloquear, denunciar)
  // -------------------------------------------------------------------
  add({
    "prof.signIn": ["Entre na sua conta para ter um perfil.", "Sign in to have a profile."],
    "prof.youBlocked": ["Você bloqueou {name}.", "You blocked {name}."],
    "prof.blockedText": ["Vocês não veem as publicações, comentários e argumentos um do outro e não podem trocar mensagens.", "You can't see each other's posts, comments and arguments, and you can't exchange messages."],
    "prof.unavailable": ["Este perfil não está disponível para você.", "This profile isn't available to you."],
    "prof.about": ["Sobre", "About"],
    "prof.role": ["Cargo ou ocupação", "Job or occupation"],
    "prof.education": ["Formação", "Education"],
    "prof.experience": ["Experiência", "Experience"],
    "prof.school": ["Instituição", "Institution"],
    "prof.city": ["Cidade", "City"],
    "prof.aboutEmptyOwn": ["Complete as informações em “Editar perfil”.", "Fill in your details in “Edit profile”."],
    "prof.aboutEmpty": ["Nenhuma informação adicional.", "No additional information."],
    "prof.noArticlesOwn": ["Você ainda não publicou textos.", "You haven't published any pieces yet."],
    "prof.writeFirst": ["Escrever o primeiro", "Write your first one"],
    "prof.noArticles": ["Nenhum texto publicado ainda.", "No pieces published yet."],
    "prof.onlyYouTab": ["Só você vê esta aba. Para mostrar, ligue a opção em Configurações › Privacidade.", "Only you can see this tab. To show it, turn on the option in Settings › Privacy."],
    "prof.noDebatesOwn": ["Você ainda não propôs nem argumentou em debates.", "You haven't proposed or argued in any debate yet."],
    "prof.noDebates": ["Nenhum debate por aqui ainda.", "No debates here yet."],
    "prof.noCommsOwn": ["Você ainda não participa de comunidades.", "You're not in any communities yet."],
    "prof.noComms": ["Nenhuma comunidade por aqui ainda.", "No communities here yet."],
    "prof.savedOnlyYou": ["Só você vê seus salvos.", "Only you can see your saved items."],
    "prof.savedEmpty": ["Nada salvo ainda. Use o menu “⋯” de uma publicação e escolha “Salvar publicação”.", "Nothing saved yet. Use a post's “⋯” menu and choose “Save post”."],
    "prof.noReposts": ["Nenhuma republicação ainda.", "No reposts yet."],
    "prof.noPosts": ["Nenhuma publicação ainda.", "No posts yet."],
    "prof.backHome": ["Voltar ao início", "Back to home"],
    "prof.unmute": ["Reativar no feed", "Unmute in feed"],
    "prof.message": ["Mensagem", "Message"],
    "prof.addHeadline": ["Adicione um título ao seu perfil em “Editar perfil”.", "Add a headline to your profile in “Edit profile”."],
    "prof.followingLbl": ["seguindo", "following"],
    "prof.follower": ["seguidor", "follower"],
    "prof.followers": ["seguidores", "followers"],
    "prof.post": ["publicação", "post"],
    "prof.posts": ["publicações", "posts"],
    "prof.demo": ["Perfil de demonstração: esta pessoa não existe e não responde mensagens.", "Demo profile: this person doesn't exist and doesn't reply to messages."],
    "prof.tabs": ["Conteúdo do perfil", "Profile content"],
    "prof.tab.posts": ["Publicações", "Posts"],
    "prof.tab.reposts": ["Republicações", "Reposts"],
    "prof.tab.articles": ["Artigos", "Articles"],
    "prof.tab.debates": ["Debates", "Debates"],
    "prof.tab.communities": ["Comunidades", "Communities"],
    "prof.tab.saved": ["Salvos", "Saved"],
    "prof.tab.about": ["Sobre", "About"],
    "prof.tab.followers": ["Seguidores", "Followers"],
    "prof.connections": ["Conexões", "Connections"],
    "prof.noFollowers": ["Ninguém segue este perfil ainda.", "No one follows this profile yet."],
    "prof.noFollowing": ["Este perfil ainda não segue ninguém.", "This profile doesn't follow anyone yet."],

    "onb.welcome": ["Bem-vindo(a) à EcoEco", "Welcome to EcoEco"],
    "onb.title": ["Crie seu perfil", "Create your profile"],
    "onb.enter": ["Entrar na rede", "Join the network"],
    "onb.note": ["Você pode completar o resto do perfil depois, em “Editar perfil”. Seu perfil fica visível para quem tem conta na EcoEco.", "You can finish the rest of your profile later in “Edit profile”. Your profile is visible to anyone with an EcoEco account."],

    "edit.name": ["Nome", "Name"],
    "edit.headline": ["Título do perfil", "Profile headline"],
    "edit.headlinePh": ["Ex.: Estudante de Economia na UEM", "E.g. Economics student at UEM"],
    "edit.changePhoto": ["Trocar foto", "Change photo"],
    "edit.addPhoto": ["Adicionar foto", "Add photo"],
    "edit.rmPhoto": ["Remover foto", "Remove photo"],
    "edit.changeCover": ["Trocar capa", "Change cover"],
    "edit.addCover": ["Adicionar capa", "Add cover"],
    "edit.rmCover": ["Remover capa", "Remove cover"],
    "edit.bio": ["Bio", "Bio"],
    "edit.bioPh": ["Conte um pouco sobre você e o que te interessa em economia", "Tell us a bit about yourself and what interests you in economics"],
    "edit.rolePh": ["Ex.: Estagiário em análise de crédito", "E.g. Credit analysis intern"],
    "edit.schoolPh": ["Ex.: Universidade Estadual de Maringá", "E.g. State University of Maringá"],
    "edit.cityPh": ["Ex.: Maringá, PR", "E.g. Maringá, PR"],
    "edit.link": ["Site ou link", "Website or link"],
    "edit.linkPh": ["Ex.: linkedin.com/in/seu-nome", "E.g. linkedin.com/in/your-name"],
    "edit.educationPh": ["Ex.: Ciências Econômicas · UEM · 2026 – em andamento", "E.g. Economics · UEM · 2026 – in progress"],
    "edit.experiencePh": ["Um item por linha", "One item per line"],

    "chart.create": ["Criar gráfico", "Create chart"],
    "chart.startWith": ["Começar com:", "Start with:"],
    "chart.ipca": ["IPCA mensal", "Monthly IPCA"],
    "chart.unemployment": ["Desemprego", "Unemployment"],
    "chart.myData": ["Meus dados", "My data"],
    "chart.title": ["Título", "Title"],
    "chart.type": ["Tipo:", "Type:"],
    "chart.bars": ["Barras", "Bars"],
    "chart.line": ["Linha", "Line"],
    "chart.unit": ["Unidade", "Unit"],
    "chart.rows": ["Dados (um por linha: rótulo; valor)", "Data (one per line: label; value)"],
    "chart.rowsPh": ["jan; 0,33&#10;fev; 0,70", "Jan; 0.33&#10;Feb; 0.70"],
    "chart.source": ["Fonte (opcional)", "Source (optional)"],
    "chart.previewHint": ["A prévia aparece quando houver dados válidos.", "The preview appears once there is valid data."],
    "chart.add": ["Adicionar ao post", "Add to post"],

    "block.title": ["Bloquear {name}?", "Block {name}?"],
    "block.l1": ["Vocês deixam de ver as publicações, comentários e argumentos um do outro.", "You stop seeing each other's posts, comments and arguments."],
    "block.l2": ["Não podem trocar mensagens.", "You can't exchange messages."],
    "block.l3": ["Se vocês se seguem, deixam de se seguir.", "If you follow each other, you'll unfollow each other."],
    "block.l4": ["{name} não recebe aviso. Você pode desbloquear quando quiser em Configurações.", "{name} won't be notified. You can unblock anytime in Settings."],
    "block.confirm": ["Bloquear", "Block"],

    "report.intro": ["Opinião e crítica a ideias são livres. Denuncie quando a publicação quebrar as regras da comunidade.", "Opinions and criticism of ideas are welcome. Report a post when it breaks the community rules."],
    "report.send": ["Enviar denúncia", "Send report"],
    "report.r0": ["Ataque pessoal ou discurso de ódio", "Personal attack or hate speech"],
    "report.r1": ["Informação falsa apresentada como fato", "False information presented as fact"],
    "report.r2": ["Recomendação de investimento irregular", "Improper investment advice"],
    "report.r3": ["Spam ou golpe", "Spam or scam"],
    "report.r4": ["Outro motivo", "Other reason"]
  });

  // -------------------------------------------------------------------
  // Debates
  // -------------------------------------------------------------------
  add({
    "deb.depends": ["Depende", "It depends"],
    "deb.noVotes": ["Sem votos ainda", "No votes yet"],
    "deb.youVoted": ["Você votou: {side}", "You voted: {side}"],
    "deb.args_one": ["1 argumento", "1 argument"],
    "deb.args_other": ["{n} argumentos", "{n} arguments"],
    "deb.feedPosts_one": ["1 post no feed", "1 post in the feed"],
    "deb.feedPosts_other": ["{n} posts no feed", "{n} posts in the feed"],
    "deb.enter": ["Entrar no debate →", "Join the debate →"],
    "deb.search": ["Buscar debates", "Search debates"],
    "deb.searchPh": ["Buscar qualquer debate, inclusive os antigos", "Search any debate, including older ones"],
    "deb.sub": ["Vote, argumente e comente. Critique ideias, nunca pessoas.", "Vote, argue and comment. Criticize ideas, never people."],
    "deb.propose": ["Propor debate", "Propose a debate"],
    "deb.found_one": ["1 debate encontrado", "1 debate found"],
    "deb.found_other": ["{n} debates encontrados", "{n} debates found"],
    "deb.noneFound": ["Nenhum debate com esse termo. Que tal propor um?", "No debates with that term. Why not propose one?"],
    "deb.top": ["Principais debates da semana", "Top debates this week"],
    "deb.topEmpty": ["Nenhum debate movimentado nesta semana.", "No active debates this week."],
    "deb.all": ["Todos os debates", "All debates"],
    "deb.allEmpty": ["Não há outros debates ainda.", "No other debates yet."],
    "deb.support": ["Apoiar", "Support"],
    "deb.comments_one": ["1 comentário", "1 comment"],
    "deb.comments_other": ["{n} comentários", "{n} comments"],
    "deb.del": ["Apagar", "Delete"],
    "deb.delLabel": ["Confirmar exclusão do argumento", "Confirm deleting the argument"],
    "deb.delAsk": ["Apagar este argumento? Os apoios e comentários dele também serão apagados.", "Delete this argument? Its supports and comments will also be deleted."],
    "deb.deleted": ["Argumento apagado", "Argument deleted"],
    "deb.noComments": ["Nenhum comentário ainda.", "No comments yet."],
    "deb.commentArg": ["Comentar argumento", "Comment on argument"],
    "deb.commentArgPh": ["Comente este argumento…", "Comment on this argument…"],
    "deb.gone": ["Este debate não existe mais.", "This debate no longer exists."],
    "deb.by": ["Proposto por {name}", "Proposed by {name}"],
    "deb.vote": ["Votar", "Vote"],
    "deb.yourVote": ["Seu voto:", "Your vote:"],
    "deb.undo": ["desfazer voto", "undo vote"],
    "deb.voteAbove": ["Vote acima. Argumentar é opcional.", "Vote above. Arguing is optional."],
    "deb.commentFeed": ["Comentar no feed", "Comment in the feed"],
    "deb.argue": ["Argumentar", "Argue"],
    "deb.yourPos": ["Sua posição:", "Your position:"],
    "deb.yourArg": ["Seu argumento", "Your argument"],
    "deb.phDepends": ["Explique do que depende: dados, contexto, condições…", "Explain what it depends on: data, context, conditions…"],
    "deb.phSide": ["Escreva um argumento para “{side}”…", "Write an argument for “{side}”…"],
    "deb.phChoose": ["Escolha sua posição acima e escreva seu argumento…", "Choose your position above and write your argument…"],
    "deb.voteGoes": ["Ao publicar, seu voto fica em “{side}”.", "When you post, your vote goes to “{side}”."],
    "deb.dependsNoVote": ["Argumentos “Depende” não mudam seu voto.", "“It depends” arguments don't change your vote."],
    "deb.publishArg": ["Publicar argumento", "Post argument"],
    "deb.argsTitle": ["Argumentos das pessoas", "People's arguments"],
    "deb.noFilter": ["Sem filtro", "No filter"],
    "deb.sorted": ["Ordenados dos mais relevantes para os menos relevantes (apoios e comentários).", "Sorted from most to least relevant (supports and comments)."],
    "deb.noArgs": ["Nenhum argumento ainda. Seja a primeira pessoa a argumentar.", "No arguments yet. Be the first to argue."],
    "deb.noArgsFilter": ["Nenhum argumento neste filtro.", "No arguments in this filter."],
    "deb.rule": ["Regra dos debates: argumente contra a ideia, nunca contra a pessoa. Cite dados e fontes quando puder.", "Debate rule: argue against the idea, never the person. Cite data and sources when you can."],
    "deb.unavailable": ["Este debate não está mais disponível.", "This debate is no longer available."],
    "deb.one": ["Debate", "Debate"]
  });

  // -------------------------------------------------------------------
  // Opções gravadas em português no banco (mostradas traduzidas)
  // -------------------------------------------------------------------
  add({
    "opt.debcat.0": ["Política monetária", "Monetary policy"],
    "opt.debcat.1": ["Política fiscal", "Fiscal policy"],
    "opt.debcat.2": ["Mercado de trabalho", "Labor market"],
    "opt.debcat.3": ["Agronegócio", "Agribusiness"],
    "opt.debcat.4": ["Mercado financeiro", "Financial markets"],
    "opt.debcat.5": ["Economia internacional", "International economics"],
    "opt.debcat.6": ["Ensino e carreira", "Education and career"],
    "opt.debcat.7": ["Outros", "Other"],
    "opt.artkind.0": ["Artigo", "Article"],
    "opt.artkind.1": ["Projeto", "Project"],
    "opt.artkind.2": ["Resenha", "Review"],
    "opt.artkind.3": ["Resumo de aula", "Lecture notes"],
    "opt.jobkind.0": ["Estágio", "Internship"],
    "opt.jobkind.1": ["Emprego", "Job"],
    "opt.jobkind.2": ["Trainee", "Trainee"],
    "opt.jobkind.3": ["Pesquisa", "Research"],
    "opt.mode.0": ["Presencial", "On-site"],
    "opt.mode.1": ["Híbrido", "Hybrid"],
    "opt.mode.2": ["Remoto", "Remote"],
    "opt.evfmt.0": ["Online", "Online"],
    "opt.evfmt.1": ["Presencial", "In person"],
    "opt.evfmt.2": ["Híbrido", "Hybrid"],
    "opt.libkind.0": ["Livro", "Book"],
    "opt.libkind.1": ["Artigo", "Paper"],
    "opt.libkind.2": ["Relatório", "Report"],
    "opt.libkind.3": ["Base de dados", "Dataset"],
    "opt.libkind.4": ["Curso", "Course"],
    "opt.libtheme.0": ["Introdução", "Introduction"],
    "opt.libtheme.1": ["Microeconomia", "Microeconomics"],
    "opt.libtheme.2": ["Macroeconomia", "Macroeconomics"],
    "opt.libtheme.3": ["Economia brasileira", "Brazilian economy"],
    "opt.libtheme.4": ["Pensamento econômico", "Economic thought"],
    "opt.libtheme.5": ["Economia comportamental", "Behavioral economics"],
    "opt.libtheme.6": ["Finanças", "Finance"],
    "opt.libtheme.7": ["Econometria e dados", "Econometrics and data"],
    "opt.libtheme.8": ["Desenvolvimento", "Development"],

    "month.0": ["jan", "Jan"], "month.1": ["fev", "Feb"], "month.2": ["mar", "Mar"], "month.3": ["abr", "Apr"],
    "month.4": ["mai", "May"], "month.5": ["jun", "Jun"], "month.6": ["jul", "Jul"], "month.7": ["ago", "Aug"],
    "month.8": ["set", "Sep"], "month.9": ["out", "Oct"], "month.10": ["nov", "Nov"], "month.11": ["dez", "Dec"],
    "week.0": ["domingo", "Sunday"], "week.1": ["segunda", "Monday"], "week.2": ["terça", "Tuesday"], "week.3": ["quarta", "Wednesday"],
    "week.4": ["quinta", "Thursday"], "week.5": ["sexta", "Friday"], "week.6": ["sábado", "Saturday"]
  });

  // -------------------------------------------------------------------
  // Explorar, comunidades e fórum
  // -------------------------------------------------------------------
  add({
    "exp.sub": ["Tudo o que existe na EcoEco.", "Everything on EcoEco."],
    "exp.newsToday_one": ["1 prévia de hoje", "1 preview from today"],
    "exp.newsToday_other": ["{n} prévias de hoje", "{n} previews from today"],
    "exp.newsRecent_one": ["1 prévia recente", "1 recent preview"],
    "exp.newsRecent_other": ["{n} prévias recentes", "{n} recent previews"],
    "exp.groups_one": ["1 grupo com fórum", "1 group with a forum"],
    "exp.groups_other": ["{n} grupos com fórum", "{n} groups with forums"],
    "exp.debates_one": ["1 debate", "1 debate"],
    "exp.debates_other": ["{n} debates", "{n} debates"],
    "exp.articles_one": ["1 texto publicado", "1 published piece"],
    "exp.articles_other": ["{n} textos publicados", "{n} published pieces"],
    "exp.jobs_one": ["1 vaga aberta", "1 open position"],
    "exp.jobs_other": ["{n} vagas abertas", "{n} open positions"],
    "exp.library_one": ["1 material", "1 resource"],
    "exp.library_other": ["{n} materiais", "{n} resources"],
    "exp.market": ["Indicadores e ativos", "Indicators and assets"],
    "exp.events_one": ["1 evento na agenda", "1 upcoming event"],
    "exp.events_other": ["{n} eventos na agenda", "{n} upcoming events"],

    "comm.one": ["Comunidade", "Community"],
    "comm.join": ["Participar", "Join"],
    "comm.joined": ["Participando", "Joined"],
    "comm.topics_one": ["1 tópico", "1 topic"],
    "comm.topics_other": ["{n} tópicos", "{n} topics"],
    "comm.sub": ["Grupos por tema, cada um com seu fórum. Entre nos que combinam com você.", "Topic groups, each with its own forum. Join the ones that suit you."],
    "comm.create": ["Criar comunidade", "Create community"],
    "comm.yours": ["Suas comunidades", "Your communities"],
    "comm.discover": ["Descobrir", "Discover"],
    "comm.all": ["Todas as comunidades", "All communities"],
    "comm.inAll": ["Você já participa de todas as comunidades.", "You're already in every community."],
    "comm.gone": ["Esta comunidade não existe mais.", "This community no longer exists."],
    "comm.rules": ["Regras:", "Rules:"],
    "comm.joinToPost": ["Participe da comunidade para abrir tópicos e responder.", "Join the community to start topics and reply."],
    "comm.topicsTitle": ["Tópicos", "Topics"],
    "comm.noTopics": ["Nenhum tópico ainda. Que tal abrir o primeiro?", "No topics yet. Why not start the first one?"],

    "topic.one": ["Tópico", "Topic"],
    "topic.gone": ["Este tópico não existe mais.", "This topic no longer exists."],
    "topic.forum": ["Fórum da comunidade", "Community forum"],
    "topic.titleLbl": ["Título do tópico", "Topic title"],
    "topic.titlePh": ["Abra um tópico: qual é a pergunta ou o tema?", "Start a topic: what's the question or subject?"],
    "topic.textLbl": ["Texto do tópico", "Topic text"],
    "topic.textPh": ["Explique o contexto (opcional)", "Explain the context (optional)"],
    "topic.open": ["Abrir tópico", "Start topic"],
    "topic.replies_one": ["1 resposta", "1 reply"],
    "topic.replies_other": ["{n} respostas", "{n} replies"],
    "topic.replyLbl": ["Responder ao tópico", "Reply to the topic"],
    "topic.replyPh": ["Escreva uma resposta…", "Write a reply…"],
    "topic.joinToReply": ["Participe da comunidade para responder.", "Join the community to reply."],
    "topic.repliesTitle": ["Respostas", "Replies"],
    "topic.noReplies": ["Ninguém respondeu ainda.", "No one has replied yet."]
  });

  // -------------------------------------------------------------------
  // Artigos, tela de escrever e anexos
  // -------------------------------------------------------------------
  add({
    "art.sub": ["Textos longos da comunidade: artigos, projetos de pesquisa, resenhas e resumos de aula.", "Long-form pieces from the community: articles, research projects, reviews and lecture notes."],
    "art.write": ["Escrever", "Write"],
    "art.edit": ["Editar texto", "Edit piece"],
    "art.allKinds": ["Todos", "All"],
    "art.emptyKind": ["Nenhum texto nessa categoria ainda.", "No pieces in this category yet."],
    "art.gone": ["Este texto não existe mais.", "This piece no longer exists."],
    "art.unavailable": ["Este texto não está mais disponível.", "This piece is no longer available."],
    "art.read": ["Ler →", "Read →"],
    "art.readMin": ["{n} min de leitura", "{n} min read"],
    "art.attCount_one": ["1 anexo", "1 attachment"],
    "art.attCount_other": ["{n} anexos", "{n} attachments"],
    "art.likes_one": ["1 curtida", "1 like"],
    "art.likes_other": ["{n} curtidas", "{n} likes"],
    "art.share": ["Compartilhar no feed", "Share in the feed"],
    "art.commentLbl": ["Comentar o texto", "Comment on the piece"],
    "art.commentPh": ["Comente este texto…", "Comment on this piece…"],
    "art.signIn": ["Entre na sua conta para escrever.", "Sign in to write."],
    "art.waitBtn": ["Aguarde o envio…", "Wait for the upload…"],
    "art.publish": ["Publicar texto", "Publish piece"],
    "art.preview": ["Pré-visualização", "Preview"],
    "art.previewSub": ["É assim que o texto vai aparecer depois de publicado.", "This is how the piece will look once published."],
    "art.previewBtn": ["Pré-visualizar", "Preview"],
    "art.untitled": ["Sem título", "Untitled"],
    "art.backEdit": ["Voltar a editar", "Back to editing"],
    "art.recovered": ["Recuperamos o seu rascunho.", "We recovered your draft."],
    "art.discard": ["Descartar rascunho", "Discard draft"],
    "art.discardConfirm": ["Confirmar: apagar rascunho e anexos", "Confirm: delete draft and attachments"],
    "art.discarded": ["Rascunho descartado", "Draft discarded"],
    "art.kind": ["Tipo:", "Type:"],
    "art.summary": ["Resumo (aparece na lista de textos)", "Summary (shown in the list of pieces)"],
    "art.text": ["Texto", "Text"],
    "art.tip": ["Dica: deixe uma linha em branco entre parágrafos e comece uma linha com ## para criar um subtítulo.", "Tip: leave a blank line between paragraphs and start a line with ## to make a subheading."],
    "art.draftSaved": ["Rascunho salvo neste navegador", "Draft saved in this browser"],
    "art.sendingFiles_one": ["Enviando 1 arquivo. Espere terminar para publicar.", "Uploading 1 file. Wait for it to finish before publishing."],
    "art.sendingFiles_other": ["Enviando {n} arquivos. Espere terminar para publicar.", "Uploading {n} files. Wait for them to finish before publishing."],
    "art.words_one": ["1 palavra", "1 word"],
    "art.words_other": ["{n} palavras", "{n} words"],
    "art.minWords": ["mínimo {n} palavras", "minimum {n} words"],
    "art.waitUpload": ["Espere os arquivos terminarem de enviar para publicar.", "Wait for the files to finish uploading before publishing."],
    "art.needTitle": ["Dê um título ao texto.", "Give your piece a title."],
    "art.tooShort": ["O texto está muito curto. Para textos curtos, use uma publicação no feed.", "The piece is too short. For short texts, post in the feed."],
    "art.updated": ["Texto atualizado", "Piece updated"],
    "art.published": ["Texto publicado", "Piece published"],
    "art.atts": ["Anexos", "Attachments"],
    "art.zoom": ["Ampliar imagem", "Enlarge image"],
    "art.zoomed": ["Imagem ampliada", "Enlarged image"],
    "art.closeImg": ["Fechar imagem", "Close image"],
    "art.imageAlt": ["Imagem do texto", "Image in the piece"],
    "art.docPdf": ["Documento.pdf", "Document.pdf"],
    "art.open": ["Abrir", "Open"],
    "art.download": ["Baixar", "Download"],

    "att.unavailable": ["O envio de arquivos não está disponível agora.", "File uploads aren't available right now."],
    "att.limitFull": ["Limite de {n} anexos por texto (arquivos e links somados). Remova um para adicionar outro.", "Limit of {n} attachments per piece (files and links combined). Remove one to add another."],
    "att.limit": ["Limite de {n} anexos por texto (arquivos e links somados).", "Limit of {n} attachments per piece (files and links combined)."],
    "att.tooMany_one": ["Você escolheu {chosen} arquivos, mas só cabe mais 1 (limite de {max} anexos). Nada foi enviado.", "You chose {chosen} files, but there's only room for 1 more (limit of {max} attachments). Nothing was uploaded."],
    "att.tooMany_other": ["Você escolheu {chosen} arquivos, mas só cabem mais {n} (limite de {max} anexos). Nada foi enviado.", "You chose {chosen} files, but there's only room for {n} more (limit of {max} attachments). Nothing was uploaded."],
    "att.badType": ["“{name}” não é aceito. Use imagens JPG, PNG, WebP ou GIF, ou PDF. Nada foi enviado.", "“{name}” isn't accepted. Use JPG, PNG, WebP or GIF images, or PDF. Nothing was uploaded."],
    "att.tooBig": ["“{name}” tem {size}. O limite é 10 MB por arquivo. Nada foi enviado.", "“{name}” is {size}. The limit is 10 MB per file. Nothing was uploaded."],
    "att.uploading": ["Enviando… {n}%", "Uploading… {n}%"],
    "att.errBig": ["“{name}” passou do limite de 10 MB.", "“{name}” is over the 10 MB limit."],
    "att.errType": ["O servidor não aceitou o tipo de “{name}”.", "The server didn't accept the type of “{name}”."],
    "att.errSend": ["Não foi possível enviar “{name}”. Tente de novo.", "Couldn't upload “{name}”. Please try again."],
    "att.pasteLink": ["Cole o endereço do link.", "Paste the link address."],
    "att.badLink": ["Esse endereço não é válido. Use um link que comece com http:// ou https://.", "That address isn't valid. Use a link that starts with http:// or https://."],
    "att.linkAdded": ["Link adicionado", "Link added"],
    "att.removed": ["Anexo removido", "Attachment removed"],
    "att.inserted": ["Imagem {n} inserida no texto", "Image {n} inserted in the text"],
    "att.captionOf": ["Legenda da imagem {n}", "Caption for image {n}"],
    "att.caption": ["Legenda (opcional)", "Caption (optional)"],
    "att.inText": ["Já está no texto", "Already in the text"],
    "att.insert": ["Inserir no texto", "Insert in the text"],
    "att.up": ["Subir {name}", "Move {name} up"],
    "att.down": ["Descer {name}", "Move {name} down"],
    "att.rm": ["Remover {name}", "Remove {name}"],
    "att.counter": ["{n} de {max} · imagens JPG, PNG, WebP ou GIF e PDF, até 10 MB cada", "{n} of {max} · JPG, PNG, WebP or GIF images and PDF, up to 10 MB each"],
    "att.linkUrl": ["Endereço do link", "Link address"],
    "att.linkTitle": ["Título (opcional)", "Title (optional)"],
    "att.addLink": ["Adicionar link", "Add link"],
    "att.addFile": ["Adicionar arquivo", "Add file"],
    "att.limitReached": ["Limite de {n} anexos atingido.", "Limit of {n} attachments reached."],
    "att.image": ["Imagem {n}", "Image {n}"],
    "att.inTextShort": ["no texto", "in the text"],
    "att.toGallery": ["vai para a galeria", "goes to the gallery"]
  });
})();
