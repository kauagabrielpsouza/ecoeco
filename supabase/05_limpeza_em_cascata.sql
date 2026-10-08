-- =====================================================================
-- EcoEco · 05 · Limpeza em cascata e trava de republicação
-- Rode depois do 04 (SQL Editor > New query > colar > Run).
-- Pode rodar mais de uma vez sem problema.
--
-- 1) Quando um documento é apagado, o próprio banco apaga o que depende
--    dele (comentários, curtidas, votos...), mesmo que esses itens sejam
--    de outras pessoas. O site sozinho não consegue, porque a regra
--    docs_delete só deixa cada pessoa apagar o que é dela.
--    A limpeza é em cadeia: apagar um debate apaga os argumentos, e apagar
--    cada argumento apaga os apoios e comentários dele.
-- 2) Ninguém pode republicar a própria publicação.
-- =====================================================================

create or replace function public.docs_cascade_delete() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  case old.collection
    when 'posts' then
      delete from public.docs
       where collection in ('comments', 'likes', 'reposts', 'pollVotes')
         and data->>'post' = old.id;
    when 'comments' then
      delete from public.docs where collection = 'commentLikes' and data->>'comment' = old.id;
      delete from public.docs where collection = 'comments'     and data->>'parent'  = old.id;  -- respostas
    when 'articles' then
      delete from public.docs
       where collection in ('articleComments', 'articleLikes')
         and data->>'article' = old.id;
    when 'debates' then
      delete from public.docs
       where collection in ('votes', 'args', 'debateComments')
         and (data->>'debate' = old.id
              -- registros antigos do protótipo sem o campo "debate" eram do debate d_juros
              or (old.id = 'd_juros' and data->>'debate' is null));
    when 'args' then
      delete from public.docs
       where collection in ('ups', 'argComments')
         and data->>'arg' = old.id;
    when 'communities' then
      delete from public.docs
       where collection in ('members', 'topics')
         and data->>'comm' = old.id;
    when 'topics' then
      delete from public.docs where collection = 'topicReplies' and data->>'topic' = old.id;
    when 'events' then
      delete from public.docs where collection = 'rsvps' and data->>'event' = old.id;
    else
      null;
  end case;
  return old;
end $$;

drop trigger if exists docs_cascade on public.docs;
create trigger docs_cascade after delete on public.docs
for each row execute function public.docs_cascade_delete();

-- ---------------------------------------------------------------------
-- Trava: não republicar a própria publicação
-- ---------------------------------------------------------------------
create or replace function public.docs_block_self_repost() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.collection = 'reposts' and exists (
       select 1 from public.docs p
        where p.collection = 'posts'
          and p.id = new.data->>'post'
          and p.data->>'author' = new.data->>'user') then
    raise exception 'Não é possível republicar a própria publicação';
  end if;
  return new;
end $$;

drop trigger if exists docs_no_self_repost on public.docs;
create trigger docs_no_self_repost before insert on public.docs
for each row execute function public.docs_block_self_repost();

-- Limpa republicações da própria publicação que já existam
delete from public.docs r
 using public.docs p
 where r.collection = 'reposts'
   and p.collection = 'posts'
   and p.id = r.data->>'post'
   and p.data->>'author' = r.data->>'user';
