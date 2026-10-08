-- =====================================================================
-- EcoEco · 08 · Senha mínima de 6 caracteres
-- Rode depois do 07. Pode rodar mais de uma vez.
--
-- A única regra de senha da EcoEco é ter pelo menos 6 caracteres (o
-- mínimo do próprio Supabase). Sem exigir letras, números ou símbolos.
-- Este arquivo recria a função da senha temporária do painel de admin,
-- que no 07 exigia 8 caracteres.
-- =====================================================================

create or replace function public.admin_set_password(p_user uuid, p_password text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.admin_check();
  if length(coalesce(p_password, '')) < 6 then raise exception 'A senha precisa ter pelo menos 6 caracteres'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')), updated_at = now()
   where id = p_user;
  if not found then raise exception 'Conta não encontrada'; end if;
  insert into public.mod_log (admin_id, action, target_user) values (auth.uid(), 'definiu senha temporária', p_user);
end $$;

-- Mesmas permissões do 07: só quem está logado chama (e a função confere se é admin)
revoke all on function public.admin_set_password(uuid, text) from public, anon;
grant execute on function public.admin_set_password(uuid, text) to authenticated;
