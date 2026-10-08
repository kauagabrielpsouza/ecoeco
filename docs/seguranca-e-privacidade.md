# Segurança e privacidade

## Chaves
| Chave | Onde fica | Pode ser pública? |
|---|---|---|
| Project URL + `anon`/`publishable` | `site/config.js` | Sim. Sozinha não dá acesso a nada além do que as regras permitem. |
| `service_role`/`secret` | **Só** nos Secrets do GitHub (robôs) | **Nunca.** Ignora todas as regras. Se vazar, gere outra no painel do Supabase. |
| Token da brapi | Secrets do GitHub | Não. |

## O que as regras do banco garantem (`supabase/02_seguranca.sql`)
- Só quem tem conta lê o conteúdo; visitantes sem login não veem nada além da tela de entrada.
- Ninguém publica, curte ou vota em nome de outra pessoa (o autor do documento precisa ser quem está logado).
- Cada pessoa só edita e apaga o que é seu; administradores podem moderar.
- Mensagens diretas e bloqueios: só os dois envolvidos leem.
- Denúncias: só quem denunciou e a moderação leem.
- Salvos, lista de ativos e leituras de mensagens: só o dono lê.
- Fotos e arquivos: cada pessoa envia só para a própria pasta; limite de 10 MB por arquivo.
- Cadastro exige convite válido (configurável) e nome de usuário único.

## Regras novas (arquivos 05, 06 e 07)
- **05 · Limpeza em cascata:** ao apagar algo, o banco apaga o que depende dele (comentários, curtidas, votos, argumentos, apoios, membros, tópicos, respostas, presenças), mesmo de outras pessoas. Também recusa republicar a própria publicação.
- **06 · Privacidade:** cada pessoa só lê o **próprio voto** nos debates (admin lê todos). Se a pessoa desligar "Mostrar minhas comunidades no perfil", as linhas de membro dela ficam invisíveis para os outros. Os totais públicos vêm de duas funções que devolvem só números (`debate_vote_stats`, `community_member_counts`).
- **07 · Moderação:** quem está suspenso (no prazo) ou banido não cria nem edita conteúdo e não envia arquivos — o banco recusa (`is_restricted` nas regras `docs_insert`, `docs_update` e `media_upload`). A coleção `private` (salvos, leituras) continua liberada.
- Funções de administrador (`admin_*`) são `security definer` e conferem `is_admin()` por dentro; pessoas sem conta não podem chamá-las. O site **nunca** usa a chave secreta.
- Toda exclusão feita por admin em conteúdo de outra pessoa guarda uma cópia em `mod_log`, que só admins leem.
- Os debates que a pessoa propõe e os argumentos dela continuam públicos nas páginas dos debates (é conteúdo publicado). "Mostrar meus debates no perfil" esconde só a aba do perfil.

Essas regras foram testadas num Postgres local simulando o Supabase (cadastro com convite errado recusado, usuário duplicado recusado, tentativa de editar/apagar post alheio recusada, mensagens invisíveis para terceiros). Repita os testes da Etapa 7 do ROTEIRO no Supabase de verdade.

## Dados pessoais (LGPD)
- Não coletamos e-mail, telefone, CPF ou documentos. A conta é usuário + senha (senha guardada criptografada pelo Supabase; ninguém consegue ler). A única regra de senha é ter pelo menos 6 caracteres, o mínimo do Supabase.
- O que a pessoa escreve no perfil é opcional e público para quem tem conta.
- Pedido de exclusão de conta: apague no Supabase (Authentication → Users → excluir) e rode `delete from public.docs where owner = '<id>';`.
- Termos de uso e Política de privacidade estão como **rascunho** nas páginas institucionais. Revise com um advogado antes de abrir ao público.

## Moderação
- Torne-se admin com `supabase/04_tornar_admin.sql`.
- Configurações → Moderação: denúncias, contas (suspender, banir, desfazer), convites e registro. Precisa do SQL 07.

## Senhas esquecidas
Sem e-mail não existe recuperação automática. O admin define uma senha temporária em Configurações → Moderação → Contas → "Senha temporária" (ou pelo SQL do arquivo `04_tornar_admin.sql`), passa para a pessoa por um canal seguro, e ela troca em Configurações → Senha. A senha não fica guardada no registro.
