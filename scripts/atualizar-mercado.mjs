// =====================================================================
// EcoEco · Robô do Mercado
// Busca Selic, IPCA, dólar e desemprego no Banco Central (API SGS, grátis)
// e o Ibovespa na brapi.dev. Grava tudo na tabela "indicators".
// Roda sozinho pelo GitHub Actions (.github/workflows/atualizar-dados.yml).
// =====================================================================
import { readFileSync } from "node:fs";
import { upsert, DRY } from "./lib/supabase.mjs";

const cfg = JSON.parse(readFileSync(new URL("./fontes.json", import.meta.url)));
const FIX = !!process.env.FIXTURES;
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const nf = (v, d = 2) => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const pct = (v, d = 2) => nf(Math.abs(v), d) + "%";
const sig = (v, d = 2) => (v < 0 ? "−" : "") + nf(Math.abs(v), d);
const dir = (v) => (v > 0 ? "up" : v < 0 ? "dn" : "nt");
const parseBR = (s) => { const [d, m, y] = s.split("/").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const iso = (d) => d.toISOString().slice(0, 10);
const ddmm = (d) => String(d.getUTCDate()) + "/" + String(d.getUTCMonth() + 1);
const mesAno = (d) => MESES[d.getUTCMonth()] + "/" + String(d.getUTCFullYear()).slice(2);

// ---------------------------------------------------------------------
// API SGS do Banco Central: https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados/ultimos/{n}?formato=json
// ---------------------------------------------------------------------
async function sgs(code, n) {
  if (FIX) return fixture(code, n);
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados/ultimos/${n}?formato=json`;
  for (let tent = 1; tent <= 3; tent++) {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const rows = await res.json();
      return rows.map((r) => ({ date: parseBR(r.data), value: Number(String(r.valor).replace(",", ".")) }));
    } catch (e) {
      if (tent === 3) throw new Error(`SGS ${code}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 2000 * tent));
    }
  }
}

const out = [];
const now = new Date().toISOString();
const add = (row) => out.push(Object.assign({ updated_at: now }, row));

async function selic() {
  const rows = await sgs(432, 400);                    // Meta Selic definida pelo Copom (diária)
  const last = rows[rows.length - 1];
  let since = last.date, prev = null;
  for (let i = rows.length - 2; i >= 0; i--) { if (rows[i].value !== last.value) { prev = rows[i].value; break; } since = rows[i].date; }
  const hoje = iso(new Date());
  const next = (cfg.copom || []).find((d) => d >= hoje);
  const nextTxt = next ? ddmm(new Date(next + "T00:00:00Z")) : null;
  let move = "mantida desde " + ddmm(since);
  if (prev !== null) {
    const diff = last.value - prev;
    const dias = (Date.now() - since.getTime()) / 864e5;
    if (dias <= 50) move = (diff < 0 ? "corte de " : "alta de ") + nf(Math.abs(diff)) + " p.p. em " + ddmm(since);
  }
  add({ key: "selic", value: last.value, display: nf(last.value) + "%", change_text: move + (nextTxt ? " · Copom " + nextTxt : ""), direction: "nt",
        note: "ao ano · " + move + (nextTxt ? " · próximo Copom em " + nextTxt : ""), ref_date: iso(last.date), source: "Banco Central (SGS 432)" });
}

async function ipca() {
  const mensal = await sgs(433, 12);                   // IPCA variação mensal
  const doze = await sgs(13522, 1);                    // IPCA acumulado em 12 meses
  const ult = mensal[mensal.length - 1];
  add({ key: "ipca_mensal", value: ult.value, display: sig(ult.value) + "%", direction: dir(ult.value), ref_date: iso(ult.date),
        series: mensal.map((r) => ({ label: mesAno(r.date), value: r.value })), source: "IBGE via Banco Central (SGS 433)" });
  const d = doze[doze.length - 1];
  add({ key: "ipca12", value: d.value, display: nf(d.value) + "%", change_text: MESES[ult.date.getUTCMonth()] + ": " + (ult.value < 0 ? "−" : "") + pct(ult.value),
        direction: dir(ult.value), ref_date: iso(d.date), source: "IBGE via Banco Central (SGS 13522)" });
}

async function dolar() {
  const rows = await sgs(1, 2);                        // Dólar comercial (venda), diário
  const [a, b] = rows.slice(-2);
  const ch = a ? (b.value / a.value - 1) * 100 : 0;
  add({ key: "dolar", value: b.value, display: "R$ " + nf(b.value), change_text: pct(ch) + " em " + ddmm(b.date), direction: dir(ch), ref_date: iso(b.date), source: "Banco Central (SGS 1)" });
}

async function desemprego() {
  const rows = await sgs(24369, 2);                    // Taxa de desocupação, PNAD Contínua (trimestre móvel)
  const [a, b] = rows.slice(-2);
  const diff = a ? b.value - a.value : 0;
  const txt = "tri até " + MESES[b.date.getUTCMonth()] + (diff === 0 ? " · estável" : " · " + (diff < 0 ? "−" : "+") + nf(Math.abs(diff), 1) + " p.p.");
  add({ key: "desemprego", value: b.value, display: nf(b.value, 1) + "%", change_text: txt, direction: "nt", ref_date: iso(b.date), source: "IBGE via Banco Central (SGS 24369)" });
}

async function ibovespa() {
  const token = process.env.BRAPI_TOKEN;
  let q;
  if (FIX) q = { regularMarketPrice: 205835.29, regularMarketChangePercent: -0.52, regularMarketTime: "2026-10-06T20:07:00.000Z" };
  else {
    if (!token) { console.warn("BRAPI_TOKEN não definido: Ibovespa não atualizado."); return; }
    const res = await fetch("https://brapi.dev/api/quote/%5EBVSP", { headers: { Authorization: "Bearer " + token } });
    if (!res.ok) throw new Error("brapi HTTP " + res.status);
    const j = await res.json();
    q = j.results && j.results[0];
    if (!q || q.regularMarketPrice == null) throw new Error("brapi: resposta sem preço");
  }
  const t = q.regularMarketTime ? new Date(q.regularMarketTime) : new Date();
  add({ key: "ibov", value: q.regularMarketPrice, display: nf(q.regularMarketPrice, 0), change_text: pct(q.regularMarketChangePercent) + " no dia",
        direction: dir(q.regularMarketChangePercent), ref_date: iso(t), source: "B3 via brapi.dev" });
}

// ---------------------------------------------------------------------
const tarefas = { selic, ipca, dolar, desemprego, ibovespa };
let falhas = 0;
for (const [nome, fn] of Object.entries(tarefas)) {
  try { await fn(); console.log("ok:", nome); }
  catch (e) { falhas++; console.error("falhou:", nome, "-", e.message); }   // um indicador com problema não derruba os outros
}
if (out.length) await upsert("indicators", out, "key");
console.log(`${out.length} indicadores gravados${DRY ? " (teste)" : ""}, ${falhas} falha(s).`);
if (falhas === Object.keys(tarefas).length) process.exit(1);

// ---------------------------------------------------------------------
// Dados de exemplo para "npm run teste" (sem internet)
// ---------------------------------------------------------------------
function fixture(code, n) {
  const mk = (pairs) => pairs.map(([d, v]) => ({ date: parseBR(d), value: v })).slice(-n);
  if (code === 432) {
    const r = []; const start = Date.UTC(2026, 6, 1);
    for (let i = 0; i < 100; i++) { const d = new Date(start + i * 864e5); r.push({ date: d, value: d < new Date(Date.UTC(2026, 8, 17)) ? 14.0 : 13.75 }); }
    return r.slice(-n);
  }
  if (code === 433) return mk([["01/09/2025", 0.48], ["01/10/2025", 0.09], ["01/11/2025", 0.18], ["01/12/2025", 0.33], ["01/01/2026", 0.33], ["01/02/2026", 0.70], ["01/03/2026", 0.88], ["01/04/2026", 0.67], ["01/05/2026", 0.58], ["01/06/2026", 0.16], ["01/07/2026", 0.07], ["01/08/2026", -0.32]]);
  if (code === 13522) return mk([["01/08/2026", 4.22]]);
  if (code === 1) return mk([["05/10/2026", 5.0022], ["06/10/2026", 4.9745]]);
  if (code === 24369) return mk([["01/07/2026", 5.3], ["01/08/2026", 5.3]]);
  return [];
}
