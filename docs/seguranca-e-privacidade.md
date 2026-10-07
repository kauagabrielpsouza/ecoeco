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

Essas regras foram testadas num Postgres local simulando o Supabase (cadastro com convite errado recusado, usuário duplicado recusado, tentativa de editar/apagar post alheio recusada, mensagens invisíveis para terceiros). Repita os testes da Etapa 7 do ROTEIRO no Supabase de verdade.

## Dados pessoais (LGPD)
- Não coletamos e-mail, telefone, CPF ou documentos. A conta é usuário + senha (senha guardada criptografada pelo Supabase; ninguém consegue ler).
- O que a pessoa escreve no perfil é opcional e público para quem tem conta.
- Pedido de exclusão de conta: apague no Supabase (Authentication → Users → excluir) e rode `delete from public.docs where owner = '<id>';`.
- Termos de uso e Política de privacidade estão como **rascunho** nas páginas institucionais. Revise com um advogado antes de abrir ao público.

## Moderação
- Torne-se admin com `supabase/04_tornar_admin.sql`.
- Denúncias chegam em Configurações → Moderação. Remover guarda uma cópia do conteúdo para registro.

## Senhas esquecidas
Sem e-mail não existe recuperação automática. O admin define uma senha temporária pelo SQL do arquivo `04_tornar_admin.sql`, e a pessoa troca em Configurações → Senha.
