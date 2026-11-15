-- =====================================================================
-- EcoEco · 10 · Texto do debate inicial sobre juros
-- A descrição do debate "Juros altos: remédio necessário ou freio
-- excessivo?" citava números do dia em que foi escrita (Selic, inflação
-- e desemprego), que ficam desatualizados. Este arquivo troca o texto
-- por uma versão sem números. Os números atuais já aparecem no quadro
-- de Indicadores do site.
--
-- Como rodar: Supabase > SQL Editor > New query > colar > Run.
-- Pode rodar mais de uma vez sem problema. Não mexe em votos,
-- argumentos nem comentários do debate.
-- =====================================================================

-- 1) Para conferir ANTES: mostra o texto atual
select id, data->>'desc' as texto_atual
  from public.docs
 where collection = 'debates' and id = 'd_juros';

-- 2) Troca só o campo "desc" do debate
update public.docs
   set data = jsonb_set(
         data,
         '{desc}',
         to_jsonb('Com os juros brasileiros entre os mais altos do mundo, o Banco Central deveria cortar a Selic mais rápido ou manter a cautela até a inflação voltar para a meta? Veja os números atuais no quadro de Indicadores. #juros #copom'::text)
       )
 where collection = 'debates' and id = 'd_juros';

-- 3) Para conferir DEPOIS: deve mostrar o texto novo
select id, data->>'desc' as texto_novo
  from public.docs
 where collection = 'debates' and id = 'd_juros';
