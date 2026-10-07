// =====================================================================
// EcoEco · Robô de Notícias
// Lê os feeds RSS listados em fontes.json e grava na tabela "news_items".
// - Fontes com licença aberta (Agência Brasil, Creative Commons): título + resumo.
// - Grandes portais (InfoMoney etc.): só título e link, nunca o texto.
// =====================================================================
import { readFileSync } from "node:fs";
import { upsert, remove, DRY } from "./lib/supabase.mjs";

const cfg = JSON.parse(readFileSync(new URL("./fontes.json", import.meta.url)));
const FIX = !!process.env.FIXTURES;
const DIAS_GUARDAR = 10;

const decode = (s) => String(s || "")
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  .replace(/\s+/g, " ").trim();
const tag = (xml, name) => { const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i").exec(xml); return m ? m[1] : ""; };
const cut = (s, n) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "…" : s);

// Classifica a notícia por palavras inteiras (evita "exportações" contar como "ações")
const CATS = [
  ["Agronegócio", ["soja", "milho", "safra*", "agro*", "boi", "café", "conab", "plantio", "rural", "fertiliza*", "colheita"]],
  ["Mercado", ["dólar", "bolsa", "ibovespa", "ações", "b3", "cripto*", "bitcoin", "investidor*", "dividendo*", "juros", "selic", "copom"]],
  ["Internacional", ["china", "chinesa*", "eua", "americano*", "fed", "europa", "petróleo", "guerra", "tarifa*", "internacional", "mundial", "exterior", "exportações", "importações"]],
  ["Empresas", ["lucro", "balanço", "empresa*", "petrobras", "vale", "varejo", "indústria"]]
];
function categoria(t) {
  const words = t.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const hit = (k) => (k.endsWith("*") ? words.some((w) => w.startsWith(k.slice(0, -1))) : words.includes(k));
  for (const [nome, chaves] of CATS) if (chaves.some(hit)) return nome;
  return "Brasil";
}

function parseRSS(xml) {
  return xml.split(/<item[\s>]/i).slice(1).map((chunk) => {
    const item = chunk.split(/<\/item>/i)[0];
    return { title: decode(tag(item, "title")), link: decode(tag(item, "link")) || decode(tag(item, "guid")), pubDate: decode(tag(item, "pubDate")), description: decode(tag(item, "description")) };
  }).filter((i) => i.title && /^https?:\/\//.test(i.link));
}

async function feed(f) {
  if (FIX) return parseRSS(fixtureXml(f.nome));
  const res = await fetch(f.url, { headers: { "User-Agent": "EcoEcoBot/1.0 (+teste fechado)", Accept: "application/rss+xml, application/xml" } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return parseRSS(await res.text());
}

const palavras = (cfg.palavras_economia || []).map((p) => p.toLowerCase());
const rows = []; let falhas = 0;
for (const f of cfg.noticias) {
  try {
    const items = await feed(f);
    let n = 0;
    for (const it of items.slice(0, 25)) {
      if (f.filtrar && !palavras.some((p) => it.title.toLowerCase().includes(p))) continue;
      const d = new Date(it.pubDate); if (isNaN(d)) continue;
      rows.push({ url: it.link, source: f.nome, category: categoria(it.title + " " + (f.resumo ? it.description : "")), title: cut(it.title, 200),
                  summary: f.resumo ? cut(it.description, 280) : null, published_at: d.toISOString(), fetched_at: new Date().toISOString() });
      n++;
    }
    console.log(`ok: ${f.nome} (${n} notícias)`);
  } catch (e) { falhas++; console.error(`falhou: ${f.nome} - ${e.message}`); }
}
const uniq = [...new Map(rows.map((r) => [r.url, r])).values()];
if (uniq.length) await upsert("news_items", uniq, "url");
await remove("news_items", "published_at=lt." + new Date(Date.now() - DIAS_GUARDAR * 864e5).toISOString());
console.log(`${uniq.length} notícias gravadas${DRY ? " (teste)" : ""}, ${falhas} fonte(s) com falha.`);
if (falhas === cfg.noticias.length) process.exit(1);

function fixtureXml(nome) {
  if (nome === "Agência Brasil") return `<?xml version="1.0"?><rss version="2.0"><channel><title>Feed Editoria</title>
<item><title>Dólar fecha abaixo de R$ 5 pela primeira vez desde maio</title><link>https://agenciabrasil.ebc.com.br/economia/noticia/2026-10/dolar-fecha-abaixo-de-r-5-pela-primeira-vez-desde-maio</link><pubDate>Tue, 06 Oct 2026 19:13:00 -0300</pubDate><description><![CDATA[<p>A moeda americana fechou a R$ 4,975, com queda de 0,55%, o menor valor desde 12 de maio.</p>]]></description></item>
<item><title>Balança comercial tem superávit de US$ 7,74 bilhões em setembro</title><link>https://agenciabrasil.ebc.com.br/economia/noticia/2026-10/balanca-comercial-tem-superavit-de-us-774-bilhoes-em-setembro</link><pubDate>Tue, 06 Oct 2026 16:25:00 -0300</pubDate><description>Exportações subiram 12,9% &amp; importações caíram 2,4%.</description></item>
</channel></rss>`;
  return `<?xml version="1.0"?><rss version="2.0"><channel><title>InfoMoney</title>
<item><title>As políticas ocultas por trás do boom das exportações da China</title><link>https://www.infomoney.com.br/exemplo-china</link><pubDate>Wed, 07 Oct 2026 08:00:00 +0000</pubDate><description>Texto que não deve ser copiado.</description></item>
<item><title>Eles têm quatro patas e paladares exigentes — e testam comida para pets</title><link>https://www.infomoney.com.br/exemplo-pets</link><pubDate>Wed, 07 Oct 2026 08:00:00 +0000</pubDate></item>
</channel></rss>`;
}
