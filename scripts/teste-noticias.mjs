// Testes das regras de notícias (rodam sem internet): node teste-noticias.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { limparTexto, resumo, TAMANHO_RESUMO, categoria, temPalavra, foraDoTema, titulosParecidos, juntarDuplicadas, revisarAntigas } from "./lib/noticias.mjs";

const cfg = JSON.parse(readFileSync(new URL("./fontes.json", import.meta.url)));
let n = 0;
const t = (nome, fn) => { fn(); n++; console.log("ok:", nome); };

t("resumo sem HTML (inclusive escapado duas vezes)", () => {
  const bruto = '&lt;p&gt;&lt;p style="text-align:center;"&gt;&lt;a href="https://x"&gt; &lt;img src="l.svg" /&gt;&lt;/a&gt;&lt;/p&gt;Dólar sobe &amp;amp; bolsa cai&amp;nbsp;hoje.&lt;/p&gt;';
  assert.equal(limparTexto(bruto), "Dólar sobe & bolsa cai hoje.");
  assert.equal(limparTexto("<![CDATA[<p>Texto <b>limpo</b></p>]]>"), "Texto limpo");
  assert.equal(limparTexto("R$ 5 &lt; R$ 6 &#8211; ok &#x2014; fim"), "R$ 5 < R$ 6 – ok — fim");
});
t("resumo antigo cortado no meio da tag fica vazio", () => {
  assert.equal(resumo('<p><p style="text-align:center;"><a class="" href="https://agenciabrasil.ebc.com.br/economia/noticia/x"> <img…'), null);
  assert.equal(resumo(""), null);
});
t("resumo tem tamanho limitado", () => {
  const r = resumo("palavra ".repeat(200));
  assert.ok(r.length <= TAMANHO_RESUMO + 1 && r.endsWith("…"));
});
t("palavras inteiras: 'escalações' não é 'ações', 'federação' não é 'fed'", () => {
  assert.equal(temPalavra("Japão x Brasil: Veja onde assistir, horário e escalações", cfg.palavras_economia), false);
  assert.equal(temPalavra("Federação Portuguesa de Futebol muda grafia de número 7", cfg.palavras_economia), false);
  assert.equal(temPalavra("Fed mantém juros nos EUA", cfg.palavras_economia), true);
  assert.equal(temPalavra("Exportações brasileiras crescem em outubro", cfg.palavras_economia), true);
});
t("esportes e entretenimento são ignorados", () => {
  assert.equal(foraDoTema({ link: "https://www.infomoney.com.br/esportes/japao-x-brasil/", title: "Japão x Brasil" }, cfg), true);
  assert.equal(foraDoTema({ link: "https://www.infomoney.com.br/mercados/x/", title: "Final da Copa: onde assistir" }, cfg), true);
  assert.equal(foraDoTema({ link: "https://www.infomoney.com.br/mercados/x/", title: "Ibovespa Hoje Ao Vivo: Bolsa sobe" }, cfg), false);
});
t("categorias", () => {
  const casos = {
    "Dólar dispara 1,58% e fecha a R$ 5,65, maior nível em 17 meses": "Mercado",
    "Dólar sobe para R$ 5,51, com dados de emprego nos EUA": "Mercado",
    "Confiança da indústria atinge menor nível desde maio de 2020": "Economia brasileira",
    "Governo não renova subsídio de R$ 1,40 ao diesel importado": "Economia brasileira",
    "Inflação perde força e fica em 0,14% em outubro; conta de luz cai": "Economia brasileira",
    "Ata do Copom indica que desaceleração da economia não conteve inflação": "Economia brasileira",
    "Três estados aceleram plantio de soja 2026/27": "Agronegócio",
    "Lucro da JHSF cresce quase 30% no 3º tri": "Empresas",
    "Trump vai se reunir com Xi e Putin na China": "Internacional",
    "Exportações brasileiras para os EUA crescem 87,0% em outubro": "Internacional",
    "Caixa apresenta nova identidade visual após quase 30 anos": "Brasil"
  };
  for (const [titulo, esperado] of Object.entries(casos)) assert.equal(categoria(titulo), esperado, titulo);
  // o resumo só decide quando o título não diz nada
  assert.equal(categoria("Caixa apresenta nova identidade visual", "Banco muda a marca; soja não tem relação"), "Agronegócio");
  assert.equal(categoria("Dólar dispara", "tensão com a China e safra de soja"), "Mercado");
});
t("duplicadas: mesma fonte, mesmo dia, títulos quase iguais", () => {
  assert.equal(titulosParecidos("BB aponta recusa de produtores em renegociar dívidas do agro", "BB aponta recusa de parte dos produtores em renegociar dívidas do agro"), true);
  assert.equal(titulosParecidos("Dólar sobe 1,46% e fecha no maior valor em 15 meses", "Dólar cai 0,42% e fecha a R$ 5,56 com foco em pacote fiscal"), false);
  const base = { source: "Agência Brasil", title: "BB aponta recusa de produtores em renegociar dívidas do agro" };
  const a = { ...base, url: "u1", published_at: "2026-11-12T12:10:00.000Z" };
  const b = { ...base, url: "u2", title: "BB aponta recusa de parte dos produtores em renegociar dívidas do agro", published_at: "2026-11-12T13:40:00.000Z" };
  const outroDia = { ...base, url: "u3", published_at: "2026-11-13T13:40:00.000Z" };
  const outraFonte = { ...base, url: "u4", source: "InfoMoney", published_at: "2026-11-12T13:00:00.000Z" };
  const r = juntarDuplicadas([a, b, outroDia, outraFonte]);
  assert.deepEqual(r.descartar.map((x) => x.url), ["u1"]);          // fica a versão mais recente
  assert.deepEqual(r.manter.map((x) => x.url).sort(), ["u2", "u3", "u4"]);
  // título reescrito com link novo, publicado na mesma hora
  const v1 = { source: "Agência Brasil", url: "v1", title: "Lula vê oportunidades na Ásia para explorar minerais críticos", published_at: "2026-11-15T16:30:00+00:00", fetched_at: "2026-11-15T17:00:00Z" };
  const v2 = { source: "Agência Brasil", url: "v2", title: "Lula busca investimentos da Ásia para exploração de minerais críticos", published_at: "2026-11-15T16:30:00.000Z", fetched_at: "2026-11-15T19:00:00Z" };
  assert.deepEqual(juntarDuplicadas([v1, v2]).manter.map((x) => x.url), ["v2"]);   // fica a que o robô leu por último
});
t("revisão das notícias já gravadas", () => {
  const antigas = [
    { url: "https://agenciabrasil.ebc.com.br/a", source: "Agência Brasil", category: "Agronegócio", title: "Dólar dispara 1,58% e fecha a R$ 5,65", summary: '<p><a href="https://x"> <img…' },
    { url: "https://www.infomoney.com.br/esportes/x", source: "InfoMoney", category: "Brasil", title: "Japão x Brasil: Veja onde assistir", summary: null },
    { url: "https://www.infomoney.com.br/mercados/y", source: "InfoMoney", category: "Mercado", title: "Ibovespa sobe com bancos", summary: null }
  ];
  const r = revisarAntigas(antigas, cfg);
  assert.deepEqual(r.apagar.map((x) => x.url), ["https://www.infomoney.com.br/esportes/x"]);
  assert.equal(r.corrigidas.length, 1);
  assert.equal(r.corrigidas[0].category, "Mercado");
  assert.equal(r.corrigidas[0].summary, null);
});
console.log(`${n} testes de notícias passaram.`);
