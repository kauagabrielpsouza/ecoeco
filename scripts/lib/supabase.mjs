// Escrita no Supabase usando a chave de serviço (só no robô do GitHub, nunca no site).
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Modo de teste: "node robo.mjs --teste" (ou as variáveis DRY_RUN/FIXTURES) não grava nada
// no banco e usa dados de exemplo. O argumento funciona igual no Windows, Mac e Linux.
export const TESTE = process.argv.includes("--teste");
export const DRY = !!process.env.DRY_RUN || TESTE;

function headers(extra) {
  // Chave antiga (service_role, formato JWT "eyJ...") vai também no Authorization.
  // Chave nova (sb_secret_...) vai só no apikey.
  const h = { apikey: KEY, "Content-Type": "application/json" };
  if (String(KEY).startsWith("eyJ")) h.Authorization = "Bearer " + KEY;
  return Object.assign(h, extra || {});
}

export async function upsert(table, rows, onConflict) {
  if (DRY) { console.log(`[teste] upsert ${table}:`, JSON.stringify(rows, null, 2)); return; }
  if (!URL || !KEY) throw new Error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY");
  // O Supabase exige que todas as linhas de um mesmo envio tenham os mesmos campos.
  // Por isso agrupamos as linhas pelo conjunto de campos e enviamos um grupo de cada vez.
  const groups = new Map();
  rows.forEach((r) => { const sig = Object.keys(r).sort().join(","); if (!groups.has(sig)) groups.set(sig, []); groups.get(sig).push(r); });
  for (const group of groups.values()) {
    const res = await fetch(`${URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
      method: "POST", headers: headers({ Prefer: "resolution=merge-duplicates,return=minimal" }), body: JSON.stringify(group)
    });
    if (!res.ok) throw new Error(`Supabase ${table}: ${res.status} ${await res.text()}`);
  }
}

export async function remove(table, filter) {
  if (DRY) { console.log(`[teste] delete ${table} where ${filter}`); return; }
  const res = await fetch(`${URL}/rest/v1/${table}?${filter}`, { method: "DELETE", headers: headers() });
  if (!res.ok) throw new Error(`Supabase delete ${table}: ${res.status} ${await res.text()}`);
}

// Leitura (usada pelo robô de notícias para revisar o que já está gravado)
export async function select(table, query) {
  if (!URL || !KEY) { if (DRY) return []; throw new Error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY"); }
  const res = await fetch(`${URL}/rest/v1/${table}?${query}`, { headers: headers() });
  if (!res.ok) throw new Error(`Supabase select ${table}: ${res.status} ${await res.text()}`);
  return res.json();
}
