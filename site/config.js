// =====================================================================
// EcoEco · Configuração
// Cole aqui os dados do SEU projeto Supabase:
// Supabase > Project Settings > API (ou "Data API" / "API Keys")
//   - Project URL           -> SUPABASE_URL
//   - anon / public key     -> SUPABASE_ANON_KEY
// A chave "anon" pode ficar pública: quem protege os dados são as regras
// do arquivo supabase/02_seguranca.sql. NUNCA cole aqui a "service_role".
// =====================================================================
export const SUPABASE_URL = "https://srddgxpnckswxmwpvfnn.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_iVHQr-4r063DX1fEB8J_xQ_AsT0o-6w";

// As pessoas entram só com usuário e senha. Por baixo, o Supabase exige um
// e-mail, então montamos um e-mail fictício: usuario@ecoeco.example
// (o domínio .example é reservado e nunca recebe e-mails de verdade).
export const EMAIL_DOMAIN = "ecoeco.example";

// Exigir código de convite na tela de cadastro (o banco também confere)
export const REQUIRE_INVITE = true;
