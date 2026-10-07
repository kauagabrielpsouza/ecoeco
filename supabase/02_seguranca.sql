-- =====================================================================
-- EcoEco · 02 · Regras de segurança (Row Level Security)
-- Rode depois do 01. Estas regras valem mesmo que alguém tente acessar
-- o banco "por fora" do site: o próprio banco recusa o que não é permitido.
-- =====================================================================

-- Coleções que o site usa (qualquer outra é recusada)
create or replace function public.allowed_collection(c text) returns boolean
language sql immutable as $$
  select c = any (array[
    'users','posts','comments','likes','reposts','follows','votes','args','ups',
    'messages','pollVotes','commentLikes','communities','members','topics',
    'topicReplies','articles','articleLikes','articleComments','jobs','events',
    'rsvps','debates','debateComments','argComments','blocks','library',
    'reports','private'
  ]);
$$;

-- Quem o documento diz que é o autor (o campo muda conforme a coleção)
create or replace function public.doc_author(d jsonb) returns text
language sql immutable as $$
  select coalesce(d->>'author', d->>'user', d->>'from', d->>'by');
$$;

alter table public.docs        enable row level security;
alter table public.admins      enable row level security;
alter table public.invites     enable row level security;
alter table public.app_config  enable row level security;
alter table public.usernames   enable row level security;
alter table public.indicators  enable row level security;
alter table public.news_items  enable row level security;

-- ---------------------------------------------------------------------
-- LER
-- ---------------------------------------------------------------------
drop policy if exists docs_select on public.docs;
create policy docs_select on public.docs for select to authenticated using (
  case collection
    when 'private'  then owner = auth.uid()                                         -- salvos, lista de ativos, leituras
    when 'messages' then data->>'from' = auth.uid()::text or data->>'to' = auth.uid()::text
    when 'blocks'   then data->>'from' = auth.uid()::text or data->>'to' = auth.uid()::text
    when 'reports'  then owner = auth.uid() or public.is_admin()                    -- denúncias: quem fez e a moderação
    else true                                                                       -- o resto é público para quem tem conta
  end
);

-- ---------------------------------------------------------------------
-- CRIAR
-- ---------------------------------------------------------------------
drop policy if exists docs_insert on public.docs;
create policy docs_insert on public.docs for insert to authenticated with check (
  owner = auth.uid()
  and public.allowed_collection(collection)
  and case collection
        when 'users'   then id = auth.uid()::text           -- só o próprio perfil
        when 'private' then true
        else public.doc_author(data) = auth.uid()::text     -- ninguém publica em nome de outra pessoa
      end
);

-- ---------------------------------------------------------------------
-- EDITAR
-- ---------------------------------------------------------------------
drop policy if exists docs_update on public.docs;
create policy docs_update on public.docs for update to authenticated
using ( owner = auth.uid() or public.is_admin() )
with check (
  public.is_admin()
  or ( owner = auth.uid()
       and case collection
             when 'users'   then id = auth.uid()::text
             when 'private' then true
             else public.doc_author(data) = auth.uid()::text
           end )
);

-- ---------------------------------------------------------------------
-- APAGAR
-- ---------------------------------------------------------------------
drop policy if exists docs_delete on public.docs;
create policy docs_delete on public.docs for delete to authenticated
using ( owner = auth.uid() or public.is_admin() );

-- ---------------------------------------------------------------------
-- Outras tabelas
-- ---------------------------------------------------------------------
drop policy if exists admins_self on public.admins;
create policy admins_self on public.admins for select to authenticated using (user_id = auth.uid());

drop policy if exists config_read on public.app_config;
create policy config_read on public.app_config for select to anon, authenticated using (true);

drop policy if exists usernames_read on public.usernames;
create policy usernames_read on public.usernames for select to authenticated using (true);

-- Indicadores e notícias: todo mundo lê; só o robô (chave de serviço) escreve
drop policy if exists indicators_read on public.indicators;
create policy indicators_read on public.indicators for select to anon, authenticated using (true);
drop policy if exists news_read on public.news_items;
create policy news_read on public.news_items for select to anon, authenticated using (true);

-- invites: nenhuma regra = ninguém lê pelo site (só o cadastro, por dentro do banco)

-- ---------------------------------------------------------------------
-- Fotos e arquivos: cada pessoa envia para a própria pasta (media/<id>/...)
-- ---------------------------------------------------------------------
drop policy if exists media_read on storage.objects;
create policy media_read on storage.objects for select to anon, authenticated using (bucket_id = 'media');

drop policy if exists media_upload on storage.objects;
create policy media_upload on storage.objects for insert to authenticated
with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists media_delete on storage.objects;
create policy media_delete on storage.objects for delete to authenticated
using (bucket_id = 'media' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ---------------------------------------------------------------------
-- Tempo real: avisa o site quando algo muda
-- ---------------------------------------------------------------------
do $$
begin
  begin alter publication supabase_realtime add table public.docs;       exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.indicators; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.news_items; exception when duplicate_object then null; end;
end $$;
