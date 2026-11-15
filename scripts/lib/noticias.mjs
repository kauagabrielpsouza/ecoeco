// Funções do robô de notícias que não dependem de internet nem do banco
// (ficam aqui para poderem ser testadas em teste-noticias.mjs).

// ---------------------------------------------------------------------
// Texto limpo: sem tags HTML, com entidades (&amp; etc.) decodificadas.
// Alguns feeds mandam o HTML "escapado" (&lt;p&gt;...), às vezes mais de uma vez,
// por isso repetimos decodificar + remover tags até o texto parar de mudar.
// ---------------------------------------------------------------------
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", hellip: "…", laquo: "«", raquo: "»",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", ordm: "º", ordf: "ª", deg: "°", euro: "€" };
const cp = (n) => { try { return String.fromCodePoint(n); } catch (e) { return " "; } };
const decodeEntities = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => cp(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, n) => cp(Number(n)))
  .replace(/&([a-z]+);/gi, (m, name) => (ENT[name.toLowerCase()] != null ? ENT[name.toLowerCase()] : m));
const stripTags = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, " ")
  .replace(/<!--[\s\S]*?-->/g, " ")
  .replace(/<\/?[a-z][^>]*>/gi, " ");

export function limparTexto(s) {
  let t = String(s == null ? "" : s);
  for (let i = 0; i < 5; i++) {
    const antes = t;
    t = decodeEntities(stripTags(t));
    if (t === antes) break;
  }
  // sobra de tag cortada no meio (ex.: resumo antigo gravado pela metade: '<a href="...')
  t = t.replace(/<[a-z!\/][^>]*$/i, " ");
  return t.replace(/\s+/g, " ").trim();
}

export const cortar = (s, n) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "").replace(/[\s,;:.–—-]+$/, "") + "…" : s);

// Resumo para gravar: texto limpo e curto; vazio vira null
export const TAMANHO_RESUMO = 240;
export function resumo(html) {
  const t = limparTexto(html);
  return t ? cortar(t, TAMANHO_RESUMO) : null;
}

// ---------------------------------------------------------------------
// Palavras: comparamos palavras inteiras, nunca pedaços ("escalações" não é "ações",
// "federação" não é "fed"). Uma chave terminada em * vale como começo de palavra.
// ---------------------------------------------------------------------
export const palavrasDe = (t) => String(t || "").toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
const bate = (words, k) => (k.endsWith("*") ? words.some((w) => w.startsWith(k.slice(0, -1))) : words.includes(k));
export const temPalavra = (texto, chaves) => { const w = palavrasDe(texto); return chaves.some((k) => bate(w, k.toLowerCase())); };

// ---------------------------------------------------------------------
// Fora do tema: esportes, entretenimento etc. (pelo endereço ou pelo título)
// ---------------------------------------------------------------------
export function foraDoTema(item, cfg) {
  const url = String(item.link || "").toLowerCase(), titulo = String(item.title || "").toLowerCase();
  if ((cfg.ignorar_url || []).some((p) => url.includes(p.toLowerCase()))) return true;
  if ((cfg.ignorar_titulo || []).some((p) => titulo.includes(p.toLowerCase()))) return true;
  return false;
}

// ---------------------------------------------------------------------
// Categoria: a primeira regra que bater vale, por isso a ORDEM importa.
// 1) Agronegócio e Mercado vêm antes porque são os assuntos mais específicos
//    ("Dólar sobe com dados dos EUA" é Mercado, não Internacional).
// 2) Empresas: resultados e negócios de companhias.
// 3) Internacional: outros países e comércio exterior.
// 4) Economia brasileira: juros, inflação, contas públicas, indústria, emprego.
// 5) O que sobrar fica em "Brasil".
// ---------------------------------------------------------------------
export const CATEGORIAS = [
  ["Agronegócio", ["soja", "milho", "trigo", "safra*", "agro", "agronegócio", "agropecuária", "agrícola*", "boi", "gado", "café", "conab", "plantio", "rural", "rurais", "fertilizante*", "colheita", "pecuária", "suína", "frango", "produtores"]],
  ["Mercado", ["dólar", "minidólar", "câmbio", "bolsa", "bolsas", "ibovespa", "ações", "b3", "cripto*", "bitcoin", "investidor*", "dividendo*", "nasdaq", "dow", "cdb", "cdbs", "fii", "fiis", "fidc", "fidcs"]],
  ["Empresas", ["lucro", "prejuízo", "balanço", "balanços", "empresa", "empresas", "petrobras", "aquisição", "fusão", "recompra", "ipo", "tri", "trimestre", "3t", "4t", "1t", "2t"]],
  ["Internacional", ["china", "chinesa*", "chinês", "eua", "americano*", "fed", "europa", "europeu*", "ue", "trump", "ásia", "rússia", "ucrânia", "argentina", "paraguai", "japão", "filipinas", "guerra", "tarifaço", "internacional", "internacionais", "mundial", "global", "exterior", "exportação", "exportações", "importação", "importações", "payroll", "opep"]],
  ["Economia brasileira", ["juro", "juros", "selic", "copom", "inflação", "ipca", "inpc", "pib", "fiscal", "fiscais", "orçamento", "dívida*", "receita", "mei", "meis", "tribut*", "imposto*", "iva", "reforma", "tesouro", "emprego", "desemprego", "salário*", "indústria", "industrial", "confiança", "comércio", "varejo", "serviços", "ibge", "cni", "poupança", "subsídio*", "subvenção", "diesel", "gasolina", "combustíve*", "desoneração", "superávit", "déficit", "arcabouço", "bndes", "ajuste", "gastos", "econômic*", "fgts", "pix", "ipva", "produção", "veículos", "energia", "luz", "aneel"]]
];
export function categoria(titulo, textoExtra) {
  // O título decide; o resumo só é consultado se o título não disser nada
  for (const texto of [titulo, textoExtra]) {
    if (!texto) continue;
    const w = palavrasDe(texto);
    for (const [nome, chaves] of CATEGORIAS) if (chaves.some((k) => bate(w, k))) return nome;
  }
  return "Brasil";
}

// ---------------------------------------------------------------------
// Duplicadas: a mesma fonte publica a mesma notícia duas vezes (título corrigido,
// link novo). Juntamos títulos quase iguais da mesma fonte no mesmo dia (horário
// de Brasília), ficando com a versão mais recente.
// ---------------------------------------------------------------------
const semAcento = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const tokens = (t) => new Set(palavrasDe(semAcento(String(t || ""))));
function semelhanca(a, b) {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let comuns = 0; A.forEach((w) => { if (B.has(w)) comuns++; });
  return comuns / (A.size + B.size - comuns);
}
export const titulosParecidos = (a, b) => semelhanca(a, b) >= 0.7;   // 70% das palavras em comum
export const diaSP = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

// Devolve { manter, descartar }: "descartar" são as linhas repetidas (para apagar do banco)
export function juntarDuplicadas(rows) {
  // mais recente primeiro; no empate, a que o robô leu por último
  const ordem = rows.slice().sort((x, y) => (Date.parse(y.published_at) - Date.parse(x.published_at)) || (Date.parse(y.fetched_at) - Date.parse(x.fetched_at)) || 0);
  const manter = [], descartar = [];
  for (const r of ordem) {
    // Quando a fonte reescreve o título e troca o link, a hora de publicação continua a mesma:
    // nesse caso basta um terço das palavras em comum.
    const mesmaHora = (m) => Math.abs(Date.parse(m.published_at) - Date.parse(r.published_at)) < 60000;
    const igual = manter.find((m) => m.source === r.source && diaSP(m.published_at) === diaSP(r.published_at) &&
      (titulosParecidos(m.title, r.title) || (mesmaHora(m) && semelhanca(m.title, r.title) >= 0.33)));
    if (igual) descartar.push(r); else manter.push(r);
  }
  return { manter, descartar };
}

// ---------------------------------------------------------------------
// Leitura do RSS
// ---------------------------------------------------------------------
const tag = (xml, name) => { const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i").exec(xml); return m ? m[1] : ""; };
export function parseRSS(xml) {
  return xml.split(/<item[\s>]/i).slice(1).map((chunk) => {
    const item = chunk.split(/<\/item>/i)[0];
    return { title: limparTexto(tag(item, "title")), link: limparTexto(tag(item, "link")) || limparTexto(tag(item, "guid")), pubDate: limparTexto(tag(item, "pubDate")), description: limparTexto(tag(item, "description")) };
  }).filter((i) => i.title && /^https?:\/\//.test(i.link));
}

// ---------------------------------------------------------------------
// Revisão do que já está no banco: aplica as regras atuais às notícias gravadas
// em rodadas anteriores (resumo com HTML, categoria errada, fora do tema).
// Devolve { corrigidas, apagar }. Linhas que já estão certas não aparecem.
// ---------------------------------------------------------------------
export function revisarAntigas(antigas, cfg) {
  const fontes = new Map((cfg.noticias || []).map((f) => [f.nome, f]));
  const corrigidas = [], apagar = [];
  for (const r of antigas) {
    const f = fontes.get(r.source) || {};
    if (foraDoTema({ link: r.url, title: r.title }, cfg) || (f.filtrar && !temPalavra(r.title, cfg.palavras_economia || []))) { apagar.push(r); continue; }
    const summary = f.resumo && r.summary ? resumo(r.summary) : null;
    const category = categoria(r.title, summary);
    if (summary !== (r.summary == null ? null : r.summary) || category !== r.category) corrigidas.push(Object.assign({}, r, { summary, category }));
  }
  return { corrigidas, apagar };
}
