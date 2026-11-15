-- =====================================================================
-- EcoEco · 09 · Segurança das funções e desempenho das regras
-- Resolve os alertas do próprio Supabase (Advisors > Security e Performance).
-- Não muda nenhuma permissão de quem usa o site: só fecha portas que não
-- eram usadas e deixa as regras mais rápidas.
--
-- Como rodar: Supabase > SQL Editor > New query > colar tudo > Run.
-- Pode rodar mais de uma vez sem problema. Se der erro no meio, nada é
-- aplicado (tudo roda dentro de uma transação: begin ... commit).
-- Rode depois do 08.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- PARTE 1 · Funções que visitantes (sem conta) não precisam chamar
--
-- Funções "security definer" rodam com poder de dono do banco. Por padrão
-- o Postgres deixa QUALQUER UM chamá-las pela API, inclusive quem não
-- entrou na conta (papel "anon"). Aqui tiramos essa permissão.
--
-- "from public, anon": "public" é o grupo de todos os papéis; se tirássemos
-- só de "anon", ele continuaria podendo chamar por fazer parte de "public".
-- Por isso tiramos dos dois e devolvemos só para quem precisa.
--
-- is_admin e profile_shows continuam liberadas para quem está logado
-- ("authenticated"), porque as regras de leitura/edição da tabela docs
-- usam essas duas funções.
-- ---------------------------------------------------------------------
revoke all on function public.is_admin()                  from public, anon;
revoke all on function public.profile_shows(text, text)   from public, anon;
grant execute on function public.is_admin()                to authenticated, service_role;
grant execute on function public.profile_shows(text, text) to authenticated, service_role;

-- ---------------------------------------------------------------------
-- PARTE 2 · Funções de gatilho: ninguém chama pela API
--
-- Estas três funções são "gatilhos": o próprio banco as dispara quando
-- algo acontece (apagar um documento, republicar, criar uma conta).
-- Ninguém deveria chamá-las diretamente, nem visitante nem pessoa logada.
-- Os gatilhos continuam funcionando normalmente: o banco não confere essa
-- permissão na hora de disparar um gatilho.
-- ---------------------------------------------------------------------
revoke all on function public.docs_block_self_repost() from public, anon, authenticated;
revoke all on function public.docs_cascade_delete()    from public, anon, authenticated;
revoke all on function public.handle_new_user()        from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- PARTE 3 · O que continua aberto para visitantes (de propósito)
--
-- A tela de "Criar conta" consulta estas duas funções ANTES de a pessoa
-- ter conta (ver site/js/ecoeco-backend.js: username_available e
-- invite_valid). Sem elas o cadastro para de funcionar. Elas só respondem
-- "sim" ou "não" e não revelam a lista de usuários nem de convites.
-- (As linhas abaixo só reafirmam o que já vale desde o SQL 01.)
-- ---------------------------------------------------------------------
grant execute on function public.username_available(text) to anon, authenticated;
grant execute on function public.invite_valid(text)       to anon, authenticated;

-- ---------------------------------------------------------------------
-- PARTE 4 · search_path fixo
--
-- "search_path" é a lista de lugares onde o banco procura tabelas e
-- funções pelo nome. Quando uma função não fixa essa lista, alguém mal-
-- intencionado poderia, em tese, criar um objeto com o mesmo nome em
-- outro lugar e desviar a função. Fixando a lista vazia, a função só
-- enxerga o que é do próprio Postgres. As três funções abaixo não usam
-- nenhuma tabela do projeto, então nada muda no comportamento.
-- ---------------------------------------------------------------------
alter function public.allowed_collection(text) set search_path = '';
alter function public.doc_author(jsonb)        set search_path = '';
alter function public.touch_updated_at()       set search_path = '';

-- ---------------------------------------------------------------------
-- PARTE 5 · Regras (RLS) mais rápidas: auth.uid() -> (select auth.uid())
--
-- auth.uid() devolve "quem está logado". Escrito direto na regra, o banco
-- recalcula isso para CADA linha conferida. Escrito como
-- (select auth.uid()), ele calcula uma vez por consulta e reaproveita.
-- O resultado é exatamente o mesmo; só fica mais rápido conforme a tabela
-- cresce. As regras abaixo são cópias fiéis das que estão valendo
-- (docs_select do SQL 06; docs_insert e docs_update do SQL 07;
-- docs_delete e admins_self do SQL 02; sanctions_read do SQL 07),
-- só com essa troca.
-- ---------------------------------------------------------------------

-- LER documentos
drop policy if exists docs_select on public.docs;
create policy docs_select on public.docs for select to authenticated using (
  case collection
    when 'private'  then owner = (select auth.uid())
    when 'messages' then data->>'from' = (select auth.uid())::text or data->>'to' = (select auth.uid())::text
    when 'blocks'   then data->>'from' = (select auth.uid())::text or data->>'to' = (select auth.uid())::text
    when 'reports'  then owner = (select auth.uid()) or public.is_admin()
    when 'votes'    then owner = (select auth.uid()) or data->>'user' = (select auth.uid())::text or public.is_admin()
    when 'members'  then owner = (select auth.uid()) or data->>'user' = (select auth.uid())::text or public.is_admin()
                         or public.profile_shows(data->>'user', 'showCommunities')
    else true
  end
);

-- CRIAR documentos
drop policy if exists docs_insert on public.docs;
create policy docs_insert on public.docs for insert to authenticated with check (
  owner = (select auth.uid())
  and public.allowed_collection(collection)
  and (collection = 'private' or not public.is_restricted((select auth.uid())))
  and case collection
        when 'users'   then id = (select auth.uid())::text
        when 'private' then true
        else public.doc_author(data) = (select auth.uid())::text
      end
);

-- EDITAR documentos
drop policy if exists docs_update on public.docs;
create policy docs_update on public.docs for update to authenticated
using ( owner = (select auth.uid()) or public.is_admin() )
with check (
  public.is_admin()
  or ( owner = (select auth.uid())
       and (collection = 'private' or not public.is_restricted((select auth.uid())))
       and case collection
             when 'users'   then id = (select auth.uid())::text
             when 'private' then true
             else public.doc_author(data) = (select auth.uid())::text
           end )
);

-- APAGAR documentos
drop policy if exists docs_delete on public.docs;
create policy docs_delete on public.docs for delete to authenticated
using ( owner = (select auth.uid()) or public.is_admin() );

-- Administradores: cada pessoa só vê a própria linha
drop policy if exists admins_self on public.admins;
create policy admins_self on public.admins for select to authenticated
using (user_id = (select auth.uid()));

-- Suspensões/banimentos: a pessoa vê a própria; admin vê todas
drop policy if exists sanctions_read on public.sanctions;
create policy sanctions_read on public.sanctions for select to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

commit;

-- ---------------------------------------------------------------------
-- CONFERÊNCIA (opcional): rode depois, para ver como ficou.
-- Esperado na coluna "anon_pode": true só em invite_valid e username_available.
-- Esperado na coluna "logado_pode": false nas três funções de gatilho.
-- ---------------------------------------------------------------------
select p.proname as funcao,
       has_function_privilege('anon', p.oid, 'execute')          as anon_pode,
       has_function_privilege('authenticated', p.oid, 'execute') as logado_pode,
       p.proconfig                                               as search_path
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname in ('is_admin', 'profile_shows', 'docs_block_self_repost', 'docs_cascade_delete',
                     'handle_new_user', 'invite_valid', 'username_available',
                     'allowed_collection', 'doc_author', 'touch_updated_at')
 order by 1;
