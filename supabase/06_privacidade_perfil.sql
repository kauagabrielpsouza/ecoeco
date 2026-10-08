-- =====================================================================
-- EcoEco · 06 · Privacidade do perfil (votos e comunidades)
-- Rode depois do 05. Pode rodar mais de uma vez.
--
-- 1) Votos nos debates: cada pessoa só lê o PRÓPRIO voto (e a moderação
--    lê todos). Ninguém descobre em que lado outra pessoa votou, nem pelo
--    site nem acessando o banco "por fora".
-- 2) Participação em comunidades: se a pessoa desligar "Mostrar minhas
--    comunidades no perfil", as linhas de membro dela ficam invisíveis
--    para as outras pessoas.
-- 3) Os totais públicos (votos por lado e número de membros) continuam
--    funcionando por duas funções que devolvem só números.
--
-- A opção fica no perfil da pessoa (coleção users): showCommunities e
-- showDebates. Se não existir, vale "mostrar" (ligado).
-- =====================================================================

-- Lê uma opção do perfil (true se não existir ou se não for "false")
create or replace function public.profile_shows(uid text, flag text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select (data->>flag) is distinct from 'false'
                     from public.docs
                    where collection = 'users' and id = uid), true);
$$;

-- Regra de LEITURA dos documentos (substitui a do 02, com dois casos novos)
drop policy if exists docs_select on public.docs;
create policy docs_select on public.docs for select to authenticated using (
  case collection
    when 'private'  then owner = auth.uid()
    when 'messages' then data->>'from' = auth.uid()::text or data->>'to' = auth.uid()::text
    when 'blocks'   then data->>'from' = auth.uid()::text or data->>'to' = auth.uid()::text
    when 'reports'  then owner = auth.uid() or public.is_admin()
    when 'votes'    then owner = auth.uid() or data->>'user' = auth.uid()::text or public.is_admin()
    when 'members'  then owner = auth.uid() or data->>'user' = auth.uid()::text or public.is_admin()
                         or public.profile_shows(data->>'user', 'showCommunities')
    else true
  end
);

-- Totais de votos por debate (só números; "recent" = votos dos últimos 7 dias)
create or replace function public.debate_vote_stats()
returns table (debate text, side_a int, side_b int, recent int)
language sql stable security definer set search_path = public as $$
  select coalesce(data->>'debate', 'd_juros') as debate,
         (count(*) filter (where data->>'side' = 'A'))::int,
         (count(*) filter (where data->>'side' = 'B'))::int,
         (count(*) filter (where created_at >= now() - interval '7 days'))::int
    from public.docs
   where collection = 'votes'
   group by 1;
$$;

-- Número de membros por comunidade (conta também quem escondeu a participação)
create or replace function public.community_member_counts()
returns table (comm text, members int)
language sql stable security definer set search_path = public as $$
  select data->>'comm', count(*)::int
    from public.docs
   where collection = 'members'
   group by 1;
$$;

revoke all on function public.debate_vote_stats()       from public, anon;
revoke all on function public.community_member_counts() from public, anon;
grant execute on function public.debate_vote_stats()       to authenticated;
grant execute on function public.community_member_counts() to authenticated;
