// Escrita no Supabase usando a chave de serviço (só no robô do GitHub, nunca no site).
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const DRY = !!process.env.DRY_RUN;

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
  const res = await fetch(`${URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: "POST", headers: headers({ Prefer: "resolution=merge-duplicates,return=minimal" }), body: JSON.stringify(rows)
  });
  if (!res.ok) throw new Error(`Supabase ${table}: ${res.status} ${await res.text()}`);
}

export async function remove(table, filter) {
  if (DRY) { console.log(`[teste] delete ${table} where ${filter}`); return; }
  const res = await fetch(`${URL}/rest/v1/${table}?${filter}`, { method: "DELETE", headers: headers() });
  if (!res.ok) throw new Error(`Supabase delete ${table}: ${res.status} ${await res.text()}`);
}
