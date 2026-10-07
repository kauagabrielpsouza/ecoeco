-- =====================================================================
-- EcoEco · 04 · Tornar você administrador (moderação)
-- Rode DEPOIS de criar a sua conta no site.
-- Troque 'seu_usuario' pelo nome de usuário que você escolheu.
-- =====================================================================
insert into public.admins (user_id)
select user_id from public.usernames where username = 'seu_usuario'
on conflict do nothing;

-- Conferir quem é administrador:
-- select u.username from public.admins a join public.usernames u using (user_id);

-- ---------------------------------------------------------------------
-- Outras tarefas úteis de administração
-- ---------------------------------------------------------------------
-- Criar mais um código de convite:
--   insert into public.invites (code, max_uses) values ('AMIGOS-UEM', 20);
-- Ver quantas vezes cada convite foi usado:
--   select code, uses, max_uses, active from public.invites;
-- Abrir o cadastro para qualquer pessoa (sem convite):
--   update public.app_config set value = 'false' where key = 'require_invite';
-- Redefinir a senha de alguém que esqueceu (não há e-mail para recuperação):
--   update auth.users set encrypted_password = crypt('SenhaTemporaria123', gen_salt('bf'))
--   where id = (select user_id from public.usernames where username = 'usuario_da_pessoa');
--   Depois peça para a pessoa entrar e trocar a senha em Configurações.
