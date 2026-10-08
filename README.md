# EcoEco · The Economy Ecosystem

Rede social para quem vive, estuda ou gosta de economia: feed, debates, comunidades, artigos, vagas, eventos, biblioteca, notícias e painel de mercado.

Esta pasta é o **ponto de partida da versão real** da EcoEco, pronta para continuar no **Claude Code**. Ela leva o protótipo feito no Claude para um site de verdade:

- login só com **nome de usuário e senha** (sem e-mail, sem dados pessoais);
- **banco de dados próprio** no Supabase (plano gratuito), com regras de segurança;
- site publicado no **GitHub Pages** (gratuito), com endereço próprio;
- **notícias e indicadores que se atualizam sozinhos** a cada 30 minutos.

> Comece pelo arquivo **[ROTEIRO.md](ROTEIRO.md)**: ele tem o passo a passo e os pedidos prontos para colar no Claude Code.

---

## O que tem em cada pasta

```
ecoeco/
├── README.md               ← você está aqui
├── ROTEIRO.md              ← passo a passo do lançamento fechado (comece aqui)
├── CLAUDE.md               ← instruções que o Claude Code lê sozinho ao abrir o projeto
├── site/                   ← o site que vai para o ar (GitHub Pages)
│   ├── index.html          ← a EcoEco inteira (interface + lógica)
│   ├── config.js           ← endereço e chave pública do seu Supabase (você preenche)
│   ├── js/ecoeco-backend.js← ponte entre o site e o Supabase (login, banco, arquivos, dados ao vivo)
│   └── js/i18n.js          ← todos os textos da interface, em português e inglês
├── supabase/               ← banco de dados (rodar no SQL Editor do Supabase, nesta ordem)
│   ├── 01_estrutura.sql
│   ├── 02_seguranca.sql
│   ├── 03_dados_iniciais.sql
│   ├── 04_tornar_admin.sql
│   ├── 05_limpeza_em_cascata.sql   ← apagar algo apaga o que depende dele
│   ├── 06_privacidade_perfil.sql   ← votos secretos e comunidades escondíveis
│   └── 07_moderacao_admin.sql      ← suspensão, banimento e painel de admin
├── scripts/                ← robôs que atualizam indicadores e notícias
│   ├── atualizar-mercado.mjs
│   ├── atualizar-noticias.mjs
│   ├── fontes.json         ← feeds de notícias e calendário do Copom
│   └── lib/supabase.mjs
├── .github/workflows/      ← automações do GitHub
│   ├── publicar-site.yml   ← publica o site quando algo muda
│   └── atualizar-dados.yml ← roda os robôs a cada 30 minutos
├── docs/                   ← documentação de apoio
│   ├── funcionalidades.md
│   ├── design-system.md
│   ├── banco-de-dados.md
│   ├── dados-e-fontes.md
│   └── seguranca-e-privacidade.md
└── prototipo/index.html    ← cópia do protótipo original (só referência, não vai para o ar)
```

## Como as peças se conectam

```
 Pessoa no navegador ──► site (GitHub Pages) ──► Supabase (login + banco + fotos)
                                                     ▲
 GitHub Actions (a cada 30 min) ──► robôs ───────────┘
      Banco Central · IBGE · brapi (Ibovespa) · RSS de notícias
```

## Custos

Tudo no plano gratuito, suficiente para o teste com cerca de 30 pessoas:

| Serviço | Plano | Limite que importa |
|---|---|---|
| Supabase | Free | 50 mil usuários/mês, 500 MB de banco, 200 conexões em tempo real; pausa após 1 semana sem uso |
| GitHub (repositório público) | Free | Pages e Actions gratuitos |
| brapi.dev | Free | 15 mil requisições/mês; cotações com atraso de até 30 min |
| Banco Central (SGS) | Público | Sem cadastro |

## Testar os robôs sem internet

```bash
cd scripts
npm run teste
```
