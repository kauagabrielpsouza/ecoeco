// =====================================================================
// EcoEco · Ponte entre o site e o Supabase
//
// O protótipo foi feito para rodar dentro do Claude, usando
// window.claude.use("db" | "user" | "assets"). Este arquivo recria essas
// mesmas funções em cima do Supabase, para que o código do site continue
// praticamente igual. Também cuida da tela de entrar/criar conta e dos
// dados ao vivo (indicadores e notícias).
// =====================================================================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY, EMAIL_DOMAIN, REQUIRE_INVITE } from "../config.js";

// Textos da interface (js/i18n.js, carregado antes deste arquivo)
const I18N = window.I18N, t = I18N.t;

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

let session = null;
let me = { id: null, username: "", isAdmin: false, sanction: null };

/* ---------------------------------------------------------------------
 * Utilidades
 * ------------------------------------------------------------------- */
const cleanUser = (s) => String(s || "").trim().toLowerCase().replace(/^@/, "");
const validUser = (s) => /^[a-z0-9._]{3,24}$/.test(s);
const toEmail = (u) => cleanUser(u) + "@" + EMAIL_DOMAIN;
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function mapError(e) {
  const msg = (e && (e.message || e.error_description)) || "";
  const err = new Error(msg || "Erro");
  if (e && (e.code === "42501" || /row-level security|permission/i.test(msg))) err.code = "permission_denied";
  else if (/payload|too large|size/i.test(msg)) err.code = "invalid_argument";
  else err.code = "upstream_error";
  return err;
}

/* ---------------------------------------------------------------------
 * Banco de documentos (imita o "db" do protótipo)
 * ------------------------------------------------------------------- */
const listeners = new Map();   // coleção -> Set<{ map, cb }>
const caches = new Map();      // coleção -> Map(id -> data)
let channel = null;

function realCollection(path) {
  const m = /^data\/users\/([^/]+)$/.exec(path);
  if (m) {
    if (m[1] !== me.id) throw Object.assign(new Error(t("err.privateOnly")), { code: "permission_denied" });
    return "private";
  }
  return path;
}

function snapshotOf(map) {
  const docs = [...map.entries()].map(([id, data]) => ({ id, exists: true, data: () => data }));
  return { docs, size: docs.length, empty: docs.length === 0, metadata: { fromCache: false } };
}

const pending = new Set();
function notify(col) {
  if (pending.has(col)) return;
  pending.add(col);
  queueMicrotask(() => {
    pending.delete(col);
    const set = listeners.get(col); const map = caches.get(col);
    if (!set || !map) return;
    const snap = snapshotOf(map);
    set.forEach((l) => { try { l.cb(snap); } catch (e) { console.error(e); } });
  });
}

function applyLocal(col, id, data) {
  const map = caches.get(col); if (!map) return;
  if (data === null) map.delete(id); else map.set(id, data);
  notify(col);
}

function ensureChannel() {
  if (channel) return;
  channel = sb.channel("ecoeco-docs")
    .on("postgres_changes", { event: "*", schema: "public", table: "docs" }, (payload) => {
      const row = payload.new && payload.new.collection ? payload.new : payload.old;
      if (!row || !row.collection) return;
      if (payload.eventType === "DELETE") applyLocal(row.collection, row.id, null);
      else applyLocal(row.collection, row.id, payload.new.data || {});
    })
    .subscribe();
}

async function fetchAll(col) {
  const map = new Map();
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb.from("docs").select("id,data").eq("collection", col).range(from, from + PAGE - 1);
    if (error) throw mapError(error);
    data.forEach((r) => map.set(r.id, r.data || {}));
    if (data.length < PAGE) break;
  }
  return map;
}

function newId() {
  return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)).replace(/-/g, "").slice(0, 20);
}

function collection(path) {
  const col = realCollection(path);
  return {
    onSnapshot(cb, errCb) {
      ensureChannel();
      let set = listeners.get(col);
      if (!set) { set = new Set(); listeners.set(col, set); }
      const entry = { cb };
      set.add(entry);
      (async () => {
        try {
          if (!caches.has(col)) caches.set(col, await fetchAll(col));
          cb(snapshotOf(caches.get(col)));
        } catch (e) { if (errCb) errCb(e); else console.error(e); }
      })();
      return () => set.delete(entry);
    },
    async add(data) {
      const id = newId();
      const { error } = await sb.from("docs").insert({ collection: col, id, data });
      if (error) throw mapError(error);
      applyLocal(col, id, data);
      return { id };
    },
    doc(id) {
      return {
        id,
        async get() {
          const { data, error } = await sb.from("docs").select("data").eq("collection", col).eq("id", id).maybeSingle();
          if (error) throw mapError(error);
          return { id, exists: !!data, data: () => (data ? data.data : undefined) };
        },
        async set(data) {
          const { error } = await sb.from("docs").upsert({ collection: col, id, data }, { onConflict: "collection,id" });
          if (error) throw mapError(error);
          applyLocal(col, id, data);
        },
        async update(patch) {
          let cur = caches.has(col) ? caches.get(col).get(id) : undefined;
          if (cur === undefined) {
            const { data, error } = await sb.from("docs").select("data").eq("collection", col).eq("id", id).maybeSingle();
            if (error) throw mapError(error);
            cur = data ? data.data : {};
          }
          const next = Object.assign({}, cur);
          Object.entries(patch || {}).forEach(([k, v]) => {
            if (v && typeof v === "object" && v.__delete__ === true) delete next[k]; else next[k] = v;
          });
          const { data: rows, error } = await sb.from("docs").update({ data: next }).eq("collection", col).eq("id", id).select("id");
          if (error) throw mapError(error);
          if (!rows || !rows.length) throw Object.assign(new Error(t("err.noEdit")), { code: "permission_denied" });
          applyLocal(col, id, next);
        },
        async delete() {
          const { data: rows, error } = await sb.from("docs").delete().eq("collection", col).eq("id", id).select("id");
          if (error) throw mapError(error);
          if (!rows || !rows.length) throw Object.assign(new Error(t("err.noDelete")), { code: "permission_denied" });
          applyLocal(col, id, null);
        }
      };
    }
  };
}

const db = Object.freeze({ collection, doc: (p) => { const i = p.lastIndexOf("/"); return collection(p.slice(0, i)).doc(p.slice(i + 1)); } });

/* ---------------------------------------------------------------------
 * Usuário (imita o "user" do protótipo)
 * ------------------------------------------------------------------- */
const user = Object.freeze({
  me: async () => ({ id: me.id, name: me.username, email: null, avatarUrl: "", color: "#146B4F", isOwner: me.isAdmin, canEdit: me.isAdmin }),
  id: async () => me.id,
  name: async () => me.username,
  isOwner: async () => me.isAdmin,
  canEdit: async () => me.isAdmin,
  // Conta suspensa ou banida não escreve (o banco também recusa: SQL 07)
  can: async (what) => (what === "data.write" ? !me.sanction : true),
  profiles: async (ids) => Object.fromEntries([].concat(ids).map((i) => [i, { id: i, name: "", avatarUrl: "", color: "#146B4F", email: null, isMe: i === me.id, guest: false }])),
  search: async () => []
});

/* ---------------------------------------------------------------------
 * Arquivos (imita o "assets" do protótipo) -> Supabase Storage
 * ------------------------------------------------------------------- */
const uploadError = (msg) => {
  const e = new Error(msg || "Erro no envio");
  e.code = /size|large|413/i.test(msg) ? "too_large" : /mime|type/i.test(msg) ? "unsupported_type" : "upstream_error";
  return e;
};

// Envio direto pela API do Storage, para poder informar o progresso (0 a 1)
async function uploadWithProgress(path, blob, contentType, onProgress) {
  const { data } = await sb.auth.getSession();
  const token = data.session ? data.session.access_token : SUPABASE_ANON_KEY;
  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", SUPABASE_URL + "/storage/v1/object/media/" + path.split("/").map(encodeURIComponent).join("/"));
    xhr.setRequestHeader("apikey", SUPABASE_ANON_KEY);
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) onProgress(ev.loaded / ev.total); };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(uploadError(xhr.status + " " + xhr.responseText)));
    xhr.onerror = () => reject(uploadError("Falha de rede"));
    xhr.send(blob);
  });
}

const PUBLIC_MEDIA = SUPABASE_URL + "/storage/v1/object/public/media/";

const assets = Object.freeze({
  // opts: { type, onProgress(fração) } — ambos opcionais
  async upload(blob, opts) {
    const name = (blob.name || "arquivo").normalize("NFD").replace(/[^\w.-]+/g, "_").slice(-60);
    const path = me.id + "/" + Date.now() + "-" + name;
    const contentType = (opts && opts.type) || blob.type || "application/octet-stream";
    if (opts && typeof opts.onProgress === "function") {
      await uploadWithProgress(path, blob, contentType, opts.onProgress);
    } else {
      const { error } = await sb.storage.from("media").upload(path, blob, { contentType, upsert: false });
      if (error) throw uploadError(error.message);
    }
    const url = sb.storage.from("media").getPublicUrl(path).data.publicUrl;
    return { id: url, url, sizeBytes: blob.size, contentType };
  },
  async list() { return { assets: [], usage: { files: 0, bytes: 0, maxFiles: 0, maxBytes: 0 } }; },
  // Apaga um arquivo do bucket "media" a partir do endereço público dele.
  // As regras do Storage só deixam apagar arquivos da própria pasta (ou admin).
  async delete(url) {
    url = String(url || "");
    if (!url.startsWith(PUBLIC_MEDIA)) return { deleted: false };
    const path = decodeURIComponent(url.slice(PUBLIC_MEDIA.length).split("?")[0]);
    const { data, error } = await sb.storage.from("media").remove([path]);
    if (error) throw mapError(error);
    return { deleted: !!(data && data.length) };
  }
});

/* ---------------------------------------------------------------------
 * Dados ao vivo: indicadores e notícias (preenchidos pelo robô do GitHub)
 * ------------------------------------------------------------------- */
async function loadLive() {
  const [ind, news] = await Promise.all([
    sb.from("indicators").select("*"),
    sb.from("news_items").select("*").order("published_at", { ascending: false }).limit(40)
  ]);
  const live = { indicators: {}, news: [] };
  (ind.data || []).forEach((r) => { live.indicators[r.key] = r; });
  live.news = news.data || [];
  if (typeof window.__ecoApplyLive === "function") window.__ecoApplyLive(live);
  return live;
}
function watchLive() {
  sb.channel("ecoeco-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "indicators" }, () => loadLive())
    .on("postgres_changes", { event: "*", schema: "public", table: "news_items" }, () => loadLive())
    .subscribe();
}

/* ---------------------------------------------------------------------
 * Tela de entrar / criar conta
 * ------------------------------------------------------------------- */
function authScreen() {
  return new Promise((resolve) => {
    const box = document.createElement("div");
    box.id = "ecoauth";
    document.body.appendChild(box);
    let mode = "login";
    const vals = {};
    const keep = () => box.querySelectorAll("input").forEach((i) => { vals[i.id] = i.type === "checkbox" ? i.checked : i.value; });
    // msg = chave do dicionário (assim a mensagem também muda de idioma)
    const draw = (msg) => {
      if (box.querySelector("#authForm")) keep();
      const login = mode === "login";
      box.innerHTML =
        '<div class="login"><section class="l"><div class="logo-lg"><span class="tile"><img data-logo alt=""></span><span><b>Eco<span class="g">Eco</span></b><small>The Economy Ecosystem</small></span></div>' +
        '<h1>' + t("auth.tagline") + '</h1><p style="margin:0;font-size:17px;opacity:.92;max-width:440px">' + t("auth.pitch") + '</p></section>' +
        '<section class="r"><form class="box" id="authForm" novalidate>' +
        '<button type="button" class="linkname" id="au-lang" lang="' + (I18N.lang === "en" ? "pt-BR" : "en") + '" style="align-self:flex-end;font-size:13px;color:var(--accent)">' + (I18N.lang === "en" ? "Português" : "English") + '</button>' +
        '<h2 style="margin:0;font-size:30px">' + t(login ? "auth.signIn" : "auth.signUp") + '</h2>' +
        '<p class="muted" style="margin:0">' + t(login ? "auth.signInHint" : "auth.signUpHint") + '</p>' +
        '<label class="field" for="au-user">' + t("auth.username") + '<input id="au-user" autocomplete="username" maxlength="24" placeholder="' + t("auth.usernamePh") + '" required></label>' +
        '<label class="field" for="au-pass">' + t("auth.password") + '<input id="au-pass" type="password" autocomplete="' + (login ? "current-password" : "new-password") + '" minlength="6" required></label>' +
        (!login ? '<label class="field" for="au-pass2">' + t("auth.password2") + '<input id="au-pass2" type="password" autocomplete="new-password" minlength="6" required></label>' +
          (REQUIRE_INVITE ? '<label class="field" for="au-invite">' + t("auth.invite") + '<input id="au-invite" autocomplete="off" placeholder="' + t("auth.invitePh") + '" required></label>' : '') +
          '<label style="display:flex;gap:8px;align-items:flex-start;font-size:13.5px"><input type="checkbox" id="au-terms" style="margin-top:3px"> <span>' + t("auth.terms") + '</span></label>' : '') +
        (msg ? '<p role="alert" style="margin:0;color:var(--down);font-weight:600;font-size:14px">' + esc(t(msg)) + '</p>' : '') +
        '<button class="btn" type="submit" style="height:46px;font-size:15px">' + t(login ? "auth.signIn" : "auth.createAccount") + '</button>' +
        '<button type="button" class="linkname" id="au-switch" style="color:var(--accent);text-align:left">' + t(login ? "auth.toSignUp" : "auth.toSignIn") + '</button>' +
        '<p class="muted" style="margin:0;font-size:12.5px;line-height:1.5">' + t("auth.forgot") + '</p>' +
        '</form></section></div>';
      box.querySelectorAll("img[data-logo]").forEach((i) => { if (window.__ECO_LOGO) i.src = window.__ECO_LOGO; });
      box.querySelectorAll("input").forEach((i) => { if (vals[i.id] === undefined || i.type === "password") return; if (i.type === "checkbox") i.checked = !!vals[i.id]; else i.value = vals[i.id]; });
      const firstEmpty = [...box.querySelectorAll("input")].find((i) => i.type !== "checkbox" && !i.value);
      if (msg && firstEmpty) firstEmpty.focus();
      box.querySelector("#au-switch").onclick = () => { mode = mode === "login" ? "signup" : "login"; draw(); };
      box.querySelector("#au-lang").onclick = () => { I18N.setLang(I18N.lang === "en" ? "pt" : "en"); draw(msg); const b = box.querySelector("#au-lang"); if (b) b.focus(); };
      box.querySelector("#authForm").onsubmit = async (ev) => {
        ev.preventDefault();
        const btn = box.querySelector('button[type="submit"]');
        const u = cleanUser(box.querySelector("#au-user").value);
        const p = box.querySelector("#au-pass").value;
        if (!validUser(u)) return draw("auth.err.username");
        if (p.length < 6) return draw("auth.err.short");
        btn.disabled = true; btn.textContent = t("auth.wait");
        try {
          if (mode === "login") {
            const { data, error } = await sb.auth.signInWithPassword({ email: toEmail(u), password: p });
            if (error) return draw("auth.err.wrong");
            session = data.session;
          } else {
            if (p !== box.querySelector("#au-pass2").value) return draw("auth.err.mismatch");
            if (!box.querySelector("#au-terms").checked) return draw("auth.err.terms");
            const code = REQUIRE_INVITE ? box.querySelector("#au-invite").value.trim() : "";
            const avail = await sb.rpc("username_available", { p_username: u });
            if (avail.data === false) return draw("auth.err.taken");
            const inv = await sb.rpc("invite_valid", { p_code: code });
            if (inv.data === false) return draw("auth.err.invite");
            const { data, error } = await sb.auth.signUp({ email: toEmail(u), password: p, options: { data: { username: u, invite_code: code } } });
            if (error) return draw("auth.err.signup");
            if (!data.session) return draw("auth.err.confirm");
            session = data.session;
          }
          box.remove();
          resolve(session);
        } catch (e) {
          draw("auth.err.network");
        }
      };
    };
    draw();
  });
}

/* ---------------------------------------------------------------------
 * Inicialização
 * ------------------------------------------------------------------- */
async function start() {
  const { data } = await sb.auth.getSession();
  session = data.session;
  if (!session) session = await authScreen();
  me.id = session.user.id;
  me.username = (session.user.user_metadata && session.user.user_metadata.username) || session.user.email.split("@")[0];
  const adm = await sb.from("admins").select("user_id").eq("user_id", me.id).maybeSingle();
  me.isAdmin = !!(adm && adm.data);
  try {
    const { data: sc } = await sb.rpc("my_sanction");
    me.sanction = Array.isArray(sc) && sc.length ? sc[0] : null;
  } catch (e) { me.sanction = null; }   // SQL 07 ainda não rodado
  loadLive().catch(() => {});
  watchLive();
  return {
    use: async (name) => (name === "db" ? db : name === "user" ? user : name === "assets" ? assets : null)
  };
}

window.EcoBackend = {
  async signOut() { await sb.auth.signOut(); location.reload(); },
  async changePassword(newPass) {
    if (!newPass || newPass.length < 6) throw new Error(t("auth.err.short"));
    const { error } = await sb.auth.updateUser({ password: newPass });
    if (error) throw new Error(error.message);
  },
  reloadLive: loadLive,
  // Chama uma função do banco (SQL). As funções conferem as permissões por dentro.
  async rpc(name, args) {
    const { data, error } = await sb.rpc(name, args || {});
    if (error) throw Object.assign(mapError(error), { detail: error.message || "" });
    return data;
  },
  // Suspensão/banimento da própria conta ({ kind, until, reason } ou null)
  mySanction: () => me.sanction,
  // Admin apaga conteúdo de outra pessoa: o banco guarda uma cópia no registro (SQL 07)
  async adminDelete(col, id, reason) {
    const { error } = await sb.rpc("admin_delete_doc", { p_collection: realCollection(col), p_id: id, p_reason: reason || "" });
    if (error) throw mapError(error);
    applyLocal(realCollection(col), id, null);
  }
};

start().then((api) => window.__ecoResolve(api)).catch((e) => {
  console.error(e);
  document.body.insertAdjacentHTML("afterbegin", '<p role="alert" style="padding:16px;background:#C83E3E;color:#fff;margin:0">' + t("err.connect") + '</p>');
});
