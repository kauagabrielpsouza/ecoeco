-- =====================================================================
-- EcoEco · 01 · Estrutura do banco de dados
-- Rode este arquivo primeiro no Supabase: SQL Editor > New query > colar > Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Documentos da plataforma
-- O protótipo guardava tudo como "documentos" (posts, comentários,
-- curtidas, debates...). Mantemos o mesmo formato para o código do site
-- funcionar quase sem mudanças. Cada linha é um documento.
-- ---------------------------------------------------------------------
create table if not exists public.docs (
  collection  text        not null,               -- ex.: 'posts', 'comments', 'likes'
  id          text        not null,               -- id do documento dentro da coleção
  data        jsonb       not null default '{}'::jsonb,
  owner       uuid        default auth.uid(),     -- quem criou (preenchido automaticamente)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (collection, id)
);

create index if not exists docs_collection_idx on public.docs (collection);
create index if not exists docs_owner_idx      on public.docs (owner);

-- Atualiza updated_at sozinho
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists docs_touch on public.docs;
create trigger docs_touch before update on public.docs
for each row execute function public.touch_updated_at();

-- Para o tempo real (Realtime) mandar o registro completo ao apagar/editar
alter table public.docs replica identity full;

-- ---------------------------------------------------------------------
-- 2. Administradores (moderação)
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- 3. Códigos de convite (cadastro fechado para o teste)
-- ---------------------------------------------------------------------
create table if not exists public.invites (
  code        text primary key,           -- ex.: 'ECOECO-TESTE'
  max_uses    int  not null default 30,   -- quantas pessoas podem usar
  uses        int  not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Configuração geral
create table if not exists public.app_config (
  key   text primary key,
  value text not null
);
insert into public.app_config (key, value) values ('require_invite', 'true')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- 4. Ao criar uma conta: confere o convite e guarda o nome de usuário
-- O site envia o convite e o usuário em raw_user_meta_data.
-- ---------------------------------------------------------------------
create table if not exists public.usernames (
  username text primary key check (username ~ '^[a-z0-9._]{3,24}$'),
  user_id  uuid not null unique references auth.users(id) on delete cascade
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(coalesce(new.raw_user_meta_data->>'invite_code', ''));
  v_user text := lower(coalesce(new.raw_user_meta_data->>'username', ''));
  v_need boolean := coalesce((select value from public.app_config where key = 'require_invite'), 'true') = 'true';
  v_ok   int;
begin
  if v_user !~ '^[a-z0-9._]{3,24}$' then
    raise exception 'Nome de usuário inválido';
  end if;
  if v_need then
    update public.invites
       set uses = uses + 1
     where code = v_code and active and uses < max_uses
    returning 1 into v_ok;
    if v_ok is null then
      raise exception 'Código de convite inválido ou esgotado';
    end if;
  end if;
  insert into public.usernames (username, user_id) values (v_user, new.id);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Ver se um nome de usuário já existe (usado na tela de cadastro)
create or replace function public.username_available(p_username text) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.usernames where username = lower(p_username));
$$;
grant execute on function public.username_available(text) to anon, authenticated;

-- Ver se um código de convite ainda vale (sem revelar a lista de códigos)
create or replace function public.invite_valid(p_code text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select value from public.app_config where key = 'require_invite'), 'true') <> 'true'
      or exists (select 1 from public.invites where code = upper(p_code) and active and uses < max_uses);
$$;
grant execute on function public.invite_valid(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 5. Dados ao vivo: indicadores e notícias
-- Preenchidos automaticamente pelo robô do GitHub (pasta scripts/).
-- ---------------------------------------------------------------------
create table if not exists public.indicators (
  key         text primary key,        -- 'selic', 'ipca12', 'ipca_mensal', 'dolar', 'ibov', 'desemprego'
  value       numeric,
  display     text,                    -- valor formatado, ex.: 'R$ 4,97'
  change_text text,                    -- ex.: '0,55% no dia'
  direction   text check (direction in ('up','dn','nt')),
  ref_date    date,                    -- data de referência do dado
  note        text,
  series      jsonb,                   -- série histórica curta (ex.: IPCA mensal 12 meses)
  source      text,
  updated_at  timestamptz not null default now()
);

create table if not exists public.news_items (
  url          text primary key,
  source       text not null,
  category     text not null default 'Brasil',
  title        text not null,
  summary      text,                   -- só para fontes com licença aberta (ex.: Agência Brasil)
  published_at timestamptz not null,
  fetched_at   timestamptz not null default now()
);
create index if not exists news_published_idx on public.news_items (published_at desc);

-- ---------------------------------------------------------------------
-- 6. Fotos e arquivos (Storage)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 10485760)   -- 10 MB por arquivo
on conflict (id) do nothing;
