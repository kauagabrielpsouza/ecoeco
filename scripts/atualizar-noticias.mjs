// =====================================================================
// EcoEco · Robô de Notícias
// Lê os feeds RSS listados em fontes.json e grava na tabela "news_items".
// - Fontes com licença aberta (Agência Brasil, Creative Commons): título + resumo.
// - Grandes portais (InfoMoney etc.): só título e link, nunca o texto.
// As regras (limpeza do texto, categorias, duplicadas) ficam em lib/noticias.mjs.
// =====================================================================
import { readFileSync } from "node:fs";
import { upsert, remove, select, DRY, TESTE } from "./lib/supabase.mjs";
import { parseRSS, resumo, cortar, categoria, temPalavra, foraDoTema, juntarDuplicadas, revisarAntigas } from "./lib/noticias.mjs";

const cfg = JSON.parse(readFileSync(new URL("./fontes.json", import.meta.url)));
const FIX = !!process.env.FIXTURES || TESTE;
const DIAS_GUARDAR = 10;

async function feed(f) {
  if (FIX) return parseRSS(fixtureXml(f.nome));
  const res = await fetch(f.url, { headers: { "User-Agent": "EcoEcoBot/1.0 (+teste fechado)", Accept: "application/rss+xml, application/xml" } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return parseRSS(await res.text());
}

const rows = []; let falhas = 0, ignoradas = 0;
for (const f of cfg.noticias) {
  try {
    const items = await feed(f);
    let n = 0;
    for (const it of items.slice(0, 25)) {
      if (foraDoTema(it, cfg)) { ignoradas++; continue; }                                   // esportes, entretenimento...
      if (f.filtrar && !temPalavra(it.title, cfg.palavras_economia || [])) { ignoradas++; continue; }
      const d = new Date(it.pubDate); if (isNaN(d)) continue;
      const texto = f.resumo ? resumo(it.description) : null;                               // resumo só de fonte com licença aberta
      rows.push({ url: it.link, source: f.nome, category: categoria(it.title, texto), title: cortar(it.title, 200),
                  summary: texto, published_at: d.toISOString(), fetched_at: new Date().toISOString() });
      n++;
    }
    console.log(`ok: ${f.nome} (${n} notícias)`);
  } catch (e) { falhas++; console.error(`falhou: ${f.nome} - ${e.message}`); }
}
const novas = [...new Map(rows.map((r) => [r.url, r])).values()];

// Revisão do que já está gravado: as regras atuais também valem para as notícias antigas
// (limpa resumo com HTML, corrige categoria, tira o que é fora do tema).
const CAMPOS = "url,source,category,title,summary,published_at,fetched_at";
let antigas = [];
try {
  antigas = FIX ? fixtureAntigas() : await select("news_items", "select=" + CAMPOS + "&order=published_at.desc&limit=1000");
} catch (e) { console.error("revisão das antigas não feita -", e.message); }
const urlsNovas = new Set(novas.map((r) => r.url));
antigas = antigas.filter((r) => !urlsNovas.has(r.url));
const { corrigidas, apagar } = revisarAntigas(antigas, cfg);
const urlsMexidas = new Set([...corrigidas, ...apagar].map((r) => r.url));
const intactas = antigas.filter((r) => !urlsMexidas.has(r.url));

// Duplicadas: compara as novas com tudo o que vai ficar no banco
const { manter, descartar } = juntarDuplicadas([...novas, ...corrigidas, ...intactas]);
const gravar = manter.filter((r) => urlsNovas.has(r.url) || corrigidas.includes(r));
const urlsApagar = [...apagar, ...descartar.filter((r) => !urlsNovas.has(r.url))].map((r) => r.url);

if (gravar.length) await upsert("news_items", gravar, "url");
for (let i = 0; i < urlsApagar.length; i += 20) {   // em grupos, para o endereço do pedido não ficar grande demais
  await remove("news_items", "url=in.(" + urlsApagar.slice(i, i + 20).map((u) => encodeURIComponent('"' + u.replace(/"/g, '\\"') + '"')).join(",") + ")");
}
await remove("news_items", "published_at=lt." + new Date(Date.now() - DIAS_GUARDAR * 864e5).toISOString());
if (DRY && (corrigidas.length || apagar.length || descartar.length)) {
  console.log("[teste] antigas corrigidas:"); corrigidas.forEach((r) => { const a = antigas.find((x) => x.url === r.url); console.log("  ", a.category, "->", r.category, "|", r.title.slice(0, 80), a.summary !== r.summary ? "| resumo limpo" : ""); });
  console.log("[teste] antigas apagadas (fora do tema):"); apagar.forEach((r) => console.log("  ", r.title.slice(0, 100)));
  console.log("[teste] repetidas juntadas:"); descartar.forEach((r) => console.log("  ", r.title.slice(0, 100)));
}
console.log(`${gravar.length} notícias gravadas${DRY ? " (teste)" : ""} (${corrigidas.length} antigas corrigidas), ${descartar.length} repetida(s) juntada(s), ${apagar.length} antiga(s) fora do tema apagada(s), ${ignoradas} do feed fora do tema, ${falhas} fonte(s) com falha.`);
if (falhas === cfg.noticias.length) process.exit(1);

// Exemplo do que já estaria no banco (para "npm run teste")
function fixtureAntigas() {
  const base = { fetched_at: "2026-11-12T12:00:00.000Z" };
  return [
    { ...base, url: "https://agenciabrasil.ebc.com.br/economia/noticia/2026-11/inflacao-perde-forca", source: "Agência Brasil", category: "Agronegócio", title: "Inflação perde força e fica em 0,14% em outubro; conta de luz cai", summary: '<p><p style="text-align:center;"><a class="" href="https://agenciabrasil.ebc.com.br/economia/noticia/2026-11/inflacao-perde-forca"> <img…', published_at: "2026-11-12T12:00:00.000Z" },
    { ...base, url: "https://www.infomoney.com.br/esportes/final-onde-assistir", source: "InfoMoney", category: "Brasil", title: "Final da Liga: onde assistir", summary: null, published_at: "2026-11-12T12:00:00.000Z" },
    { ...base, url: "https://www.infomoney.com.br/mercados/lucro-jhsf-versao-antiga", source: "InfoMoney", category: "Empresas", title: "Lucro da JHSF cresce quase 30% no 3º trimestre", summary: null, published_at: "2026-11-13T20:00:00.000Z" }
  ];
}

// ---------------------------------------------------------------------
// Dados de exemplo para "npm run teste" (sem internet). Incluem os casos que
// já deram problema: HTML escapado no resumo, esportes, título repetido.
// ---------------------------------------------------------------------
function fixtureXml(nome) {
  if (nome === "Agência Brasil") return `<?xml version="1.0"?><rss version="2.0"><channel><title>Feed Editoria</title>
<item><title>Dólar dispara 1,58% e fecha a R$ 5,65, maior nível em 17 meses</title><link>https://agenciabrasil.ebc.com.br/economia/noticia/2026-11/dolar-dispara</link><pubDate>Thu, 12 Nov 2026 19:13:00 -0300</pubDate><description>&lt;p&gt;&lt;p style="text-align:center;"&gt;&lt;a class="" href="https://agenciabrasil.ebc.com.br/economia/noticia/2026-11/dolar-dispara"&gt; &lt;img src="https://imagens.ebc.com.br/logo-agencia.svg" alt="Logo da Agência Brasil" /&gt;&lt;/a&gt;&lt;/p&gt;&lt;p&gt;A moeda americana fechou a R$ 5,65, com alta de 1,58%, o maior valor em 17 meses, em dia de tensão no mercado &amp;amp; expectativa pelo pacote fiscal.&lt;/p&gt;&lt;/p&gt;</description></item>
<item><title>Confiança da indústria atinge menor nível desde maio de 2020</title><link>https://agenciabrasil.ebc.com.br/economia/noticia/2026-11/confianca-da-industria</link><pubDate>Fri, 13 Nov 2026 11:00:00 -0300</pubDate><description><![CDATA[<p>Índice da CNI recuou pelo terceiro mês seguido.</p>]]></description></item>
<item><title>Governo não renova subsídio de R$ 1,40 ao diesel importado</title><link>https://agenciabrasil.ebc.com.br/economia/noticia/2026-11/subsidio-diesel</link><pubDate>Fri, 13 Nov 2026 16:25:00 -0300</pubDate><description>Subvenção venceu nesta sexta-feira.</description></item>
<item><title>BB aponta recusa de produtores em renegociar dívidas do agro</title><link>https://agenciabrasil.ebc.com.br/economia/noticia/2026-11/bb-aponta-recusa-1</link><pubDate>Thu, 12 Nov 2026 09:10:00 -0300</pubDate><description>Primeira versão.</description></item>
<item><title>BB aponta recusa de parte dos produtores em renegociar dívidas do agro</title><link>https://agenciabrasil.ebc.com.br/economia/noticia/2026-11/bb-aponta-recusa-2</link><pubDate>Thu, 12 Nov 2026 10:40:00 -0300</pubDate><description>Versão corrigida.</description></item>
</channel></rss>`;
  return `<?xml version="1.0"?><rss version="2.0"><channel><title>InfoMoney</title>
<item><title>As políticas ocultas por trás do boom das exportações da China</title><link>https://www.infomoney.com.br/mundo/exemplo-china</link><pubDate>Wed, 11 Nov 2026 08:00:00 +0000</pubDate><description>Texto que não deve ser copiado.</description></item>
<item><title>Japão x Brasil: Veja onde assistir, horário e escalações</title><link>https://www.infomoney.com.br/esportes/japao-x-brasil</link><pubDate>Sat, 14 Nov 2026 08:00:00 +0000</pubDate></item>
<item><title>Federação Portuguesa de Futebol muda grafia de número 7</title><link>https://www.infomoney.com.br/mercados/federacao-portuguesa</link><pubDate>Sat, 14 Nov 2026 19:50:00 +0000</pubDate></item>
<item><title>Eles têm quatro patas e paladares exigentes — e testam comida para pets</title><link>https://www.infomoney.com.br/business/exemplo-pets</link><pubDate>Wed, 11 Nov 2026 08:00:00 +0000</pubDate></item>
<item><title>Lucro da JHSF cresce quase 30% no 3º tri</title><link>https://www.infomoney.com.br/mercados/lucro-jhsf</link><pubDate>Fri, 13 Nov 2026 21:00:00 +0000</pubDate></item>
</channel></rss>`;
}
