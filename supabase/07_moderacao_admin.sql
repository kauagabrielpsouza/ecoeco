-- =====================================================================
-- EcoEco · 07 · Poderes de administrador
-- Rode depois do 06. Pode rodar mais de uma vez.
--
-- 1) Suspensão (por X dias) e banimento, com motivo, e como desfazer.
--    Quem está suspenso ou banido consegue entrar e ler, mas o BANCO
--    recusa publicar, comentar, votar, mandar mensagem ou enviar arquivo.
-- 2) Registro de moderação: toda exclusão feita por admin guarda uma
--    cópia do conteúdo; suspensões, convites e senhas também ficam anotados.
-- 3) Funções seguras para o painel (lista de contas, convites, senha
--    temporária). Todas conferem is_admin() por dentro. O site NUNCA usa
--    a chave secreta.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------
create table if not exists public.sanctions (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('suspensao', 'banimento')),
  until       timestamptz,                       -- fim da suspensão (nulo no banimento)
  reason      text not null default '',
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.mod_log (
  id                 bigserial primary key,
  admin_id           uuid references auth.users(id) on delete set null,
  action             text not null,              -- excluiu, suspendeu, baniu, liberou, convite, senha...
  target_user        uuid,
  target_collection  text,
  target_id          text,
  snapshot           jsonb,                      -- cópia do conteúdo excluído
  reason             text not null default '',
  created_at         timestamptz not null default now()
);

alter table public.sanctions enable row level security;
alter table public.mod_log   enable row level security;

drop policy if exists sanctions_read on public.sanctions;
create policy sanctions_read on public.sanctions for select to authenticated
using (user_id = auth.uid() or public.is_admin());          -- a pessoa vê a própria; admin vê todas

drop policy if exists mod_log_read on public.mod_log;
create policy mod_log_read on public.mod_log for select to authenticated using (public.is_admin());
-- (sem regras de escrita: só as funções abaixo escrevem nessas tabelas)

-- Está suspenso (ainda no prazo) ou banido?
create or replace function public.is_restricted(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.sanctions s
                  where s.user_id = uid
                    and (s.kind = 'banimento' or s.until > now()));
$$;

-- ---------------------------------------------------------------------
-- Trava no banco: conta suspensa/banida não cria nem edita conteúdo
-- (a coleção 'private' continua liberada: salvos e marcações de leitura)
-- ---------------------------------------------------------------------
drop policy if exists docs_insert on public.docs;
create policy docs_insert on public.docs for insert to authenticated with check (
  owner = auth.uid()
  and public.allowed_collection(collection)
  and (collection = 'private' or not public.is_restricted(auth.uid()))
  and case collection
        when 'users'   then id = auth.uid()::text
        when 'private' then true
        else public.doc_author(data) = auth.uid()::text
      end
);

drop policy if exists docs_update on public.docs;
create policy docs_update on public.docs for update to authenticated
using ( owner = auth.uid() or public.is_admin() )
with check (
  public.is_admin()
  or ( owner = auth.uid()
       and (collection = 'private' or not public.is_restricted(auth.uid()))
       and case collection
             when 'users'   then id = auth.uid()::text
             when 'private' then true
             else public.doc_author(data) = auth.uid()::text
           end )
);

drop policy if exists media_upload on storage.objects;
create policy media_upload on storage.objects for insert to authenticated
with check (bucket_id = 'media'
            and (storage.foldername(name))[1] = auth.uid()::text
            and not public.is_restricted(auth.uid()));

-- ---------------------------------------------------------------------
-- Funções para a própria pessoa
-- ---------------------------------------------------------------------
create or replace function public.my_sanction()
returns table (kind text, until timestamptz, reason text)
language sql stable security definer set search_path = public as $$
  select s.kind, s.until, s.reason from public.sanctions s
   where s.user_id = auth.uid() and (s.kind = 'banimento' or s.until > now());
$$;

-- ---------------------------------------------------------------------
-- Funções de administrador (todas conferem is_admin())
-- ---------------------------------------------------------------------
create or replace function public.admin_check() returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Somente a administração da EcoEco pode fazer isso' using errcode = '42501';
  end if;
end $$;

-- Apagar qualquer conteúdo, guardando uma cópia no registro
create or replace function public.admin_delete_doc(p_collection text, p_id text, p_reason text default '')
returns void language plpgsql security definer set search_path = public as $$
declare d public.docs%rowtype;
begin
  perform public.admin_check();
  select * into d from public.docs where collection = p_collection and id = p_id;
  if not found then return; end if;
  insert into public.mod_log (admin_id, action, target_user, target_collection, target_id, snapshot, reason)
  values (auth.uid(), 'excluiu', d.owner, p_collection, p_id, d.data, coalesce(p_reason, ''));
  delete from public.docs where collection = p_collection and id = p_id;   -- a limpeza em cascata (SQL 05) faz o resto
end $$;

-- Suspender por X dias ou banir
create or replace function public.admin_set_sanction(p_user uuid, p_kind text, p_days int, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_check();
  if p_user = auth.uid() then raise exception 'Você não pode suspender nem banir a si mesmo'; end if;
  if p_kind not in ('suspensao', 'banimento') then raise exception 'Tipo inválido'; end if;
  if p_kind = 'suspensao' and (p_days is null or p_days < 1 or p_days > 3650) then raise exception 'Informe de 1 a 3650 dias'; end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Informe o motivo'; end if;
  insert into public.sanctions (user_id, kind, until, reason, created_by)
  values (p_user, p_kind, case when p_kind = 'suspensao' then now() + make_interval(days => p_days) end, trim(p_reason), auth.uid())
  on conflict (user_id) do update
     set kind = excluded.kind, until = excluded.until, reason = excluded.reason,
         created_by = excluded.created_by, created_at = now();
  insert into public.mod_log (admin_id, action, target_user, reason)
  values (auth.uid(), case when p_kind = 'banimento' then 'baniu' else 'suspendeu por ' || p_days || ' dia(s)' end, p_user, trim(p_reason));
end $$;

-- Desfazer suspensão ou banimento
create or replace function public.admin_lift_sanction(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_check();
  delete from public.sanctions where user_id = p_user;
  insert into public.mod_log (admin_id, action, target_user) values (auth.uid(), 'liberou a conta', p_user);
end $$;

-- Lista de contas para o painel
create or replace function public.admin_list_users()
returns table (user_id uuid, username text, created_at timestamptz, last_sign_in_at timestamptz,
               is_admin boolean, kind text, until timestamptz, reason text)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.admin_check();
  return query
    select u.id, n.username, u.created_at, u.last_sign_in_at,
           exists (select 1 from public.admins a where a.user_id = u.id),
           s.kind, s.until, s.reason
      from auth.users u
      left join public.usernames n on n.user_id = u.id
      left join public.sanctions s on s.user_id = u.id
     order by u.created_at desc;
end $$;

-- Convites
create or replace function public.admin_list_invites()
returns table (code text, max_uses int, uses int, active boolean, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.admin_check();
  return query select i.code, i.max_uses, i.uses, i.active, i.created_at from public.invites i order by i.created_at desc;
end $$;

create or replace function public.admin_create_invite(p_code text, p_max_uses int)
returns void language plpgsql security definer set search_path = public as $$
declare c text := upper(trim(coalesce(p_code, '')));
begin
  perform public.admin_check();
  if c !~ '^[A-Z0-9-]{4,30}$' then raise exception 'O código deve ter de 4 a 30 letras, números ou hífen'; end if;
  if p_max_uses is null or p_max_uses < 1 or p_max_uses > 10000 then raise exception 'O limite de usos deve ser de 1 a 10000'; end if;
  insert into public.invites (code, max_uses) values (c, p_max_uses);
  insert into public.mod_log (admin_id, action, target_id) values (auth.uid(), 'criou convite (' || p_max_uses || ' usos)', c);
end $$;

create or replace function public.admin_set_invite_active(p_code text, p_active boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_check();
  update public.invites set active = p_active where code = upper(p_code);
  insert into public.mod_log (admin_id, action, target_id)
  values (auth.uid(), case when p_active then 'reativou convite' else 'desativou convite' end, upper(p_code));
end $$;

-- Senha temporária para quem esqueceu (a senha não é guardada no registro)
create or replace function public.admin_set_password(p_user uuid, p_password text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.admin_check();
  if length(coalesce(p_password, '')) < 8 then raise exception 'A senha precisa ter pelo menos 8 caracteres'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')), updated_at = now()
   where id = p_user;
  if not found then raise exception 'Conta não encontrada'; end if;
  insert into public.mod_log (admin_id, action, target_user) values (auth.uid(), 'definiu senha temporária', p_user);
end $$;

-- Registro de moderação (mais recentes primeiro)
create or replace function public.admin_list_log(p_limit int default 100)
returns table (id bigint, admin_id uuid, action text, target_user uuid, target_collection text,
               target_id text, snapshot jsonb, reason text, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.admin_check();
  return query select l.id, l.admin_id, l.action, l.target_user, l.target_collection, l.target_id, l.snapshot, l.reason, l.created_at
                 from public.mod_log l order by l.created_at desc limit least(greatest(coalesce(p_limit, 100), 1), 500);
end $$;

-- Permissões: ninguém de fora (anon) chama; o site chama como pessoa logada
do $$
declare f text;
begin
  foreach f in array array[
    'my_sanction()', 'admin_check()', 'admin_delete_doc(text,text,text)', 'admin_set_sanction(uuid,text,int,text)',
    'admin_lift_sanction(uuid)', 'admin_list_users()', 'admin_list_invites()', 'admin_create_invite(text,int)',
    'admin_set_invite_active(text,boolean)', 'admin_set_password(uuid,text)', 'admin_list_log(int)', 'is_restricted(uuid)'
  ] loop
    execute 'revoke all on function public.' || f || ' from public, anon';
    execute 'grant execute on function public.' || f || ' to authenticated';
  end loop;
end $$;
