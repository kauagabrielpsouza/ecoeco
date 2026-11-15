# Design system EcoEco

Conceitos da marca: **crescimento** (árvore, folhas), **união** (pessoas formando a estrutura), **economia** (gráficos, dourado), **ecossistema** (áreas conectadas). Sensação desejada: "plataforma séria de economia", nunca "página de banco", "rede social genérica" ou "site ecológico".

## Cores (variáveis CSS em `site/index.html`)

| Papel | Claro | Escuro | Uso |
|---|---|---|---|
| Verde profundo (`--brand`) | `#063B2E` | `#063B2E` | institucional, destaque da Selic, capa padrão, toast |
| Verde principal (`--accent`) | `#146B4F` | `#3D9672` | botões, links, abas ativas, ícones ativos |
| Verde claro (`--leaf`) | `#6FAE45` | `#6FAE45` | crescimento, minigráficos, detalhes |
| Dourado (`--gold`) | `#D4A72C` | `#D4A72C` | destaque: aba ativa, contadores, lado B dos debates, último ponto dos gráficos |
| Dourado claro (`--gold-2`) | `#E8C866` | `#E8C866` | só detalhes e gradientes sutis |
| Fundo (`--bg`) | `#F7F8F5` | `#0B1713` | página |
| Superfície (`--surface`) | `#FFFFFF` | `#11221C` | cards, menus |
| Texto (`--ink`) | `#17231F` | `#F1F5F2` | texto principal |
| Texto secundário (`--ink2`) | `#66736D` | `#A7B5AE` | metadados, datas, contagens |
| Borda (`--line`) | `#DDE4DF` | derivada | bordas discretas |
| Erro (`--down`) | `#C83E3E` | clareado | erros, excluir, ações destrutivas |
| Aviso (`--warn`) | `#C98A20` | `#E8C866` | avisos |
| Sucesso (`--ok`) | `#2E7D55` | clareado | mensagens de sucesso |
| Alta (`--num-up`) | `#1E8A5A` | clareado | **só números**: variação positiva (▲) |
| Queda (`--num-down`) | `#D14343` | clareado | **só números**: variação negativa (▼), barras negativas dos gráficos |
| Segunda série (`--series-2`) | `#2F6F8F` | clareado | segunda série em gráficos com duas séries |

Alta e queda têm cores próprias, separadas da cor da marca: o verde da marca (`--accent`) é para botões, links e a primeira série dos gráficos; `--num-up` e `--num-down` aparecem **apenas em números** (variações dos indicadores e barras negativas). Não use `--num-up`/`--num-down` em botões, textos ou avisos, nem `--accent`/`--down` para indicar alta ou queda. Em gráficos com duas séries, a primeira usa `--accent` e a segunda `--series-2` (azul petróleo), nunca dourado nem vermelho.

Proporção: ~70% neutros, ~20% verdes, 5–10% dourado. Texto dourado em fundo claro usa `--gold-ink` (dourado escurecido) para ter contraste.

## Tipografia
- **Manrope** (interface, números, botões, posts): 400 texto, 500 navegação, 600 títulos menores, 700 títulos, 800 números e destaques.
- **Lora** (só editorial): títulos de artigos, notícias e debates, corpo de artigos, citações.
- Escala: títulos de página 24px (21px no celular); títulos de leitura 34px (27px no celular); corpo 15–16px; secundário 13–14px; metadados 12px; indicador em destaque 34px.

## Componentes
- Botão principal: verde sólido, texto branco, raio 8px. Secundário: fundo branco, borda, texto verde profundo. Dourado só em casos especiais.
- Cards: brancos, borda sutil, sombra quase invisível, raio 10–14px.
- Ícones: estilo Lucide (traço 1,75px).
- Variações econômicas: seta + texto + cor (▲ alta em `--num-up`, ▼ queda em `--num-down`, • estável em cinza). A cor nunca é o único sinal: a seta sempre acompanha.
- Gráficos: eixo com valores redondos, valor escrito só no último ponto, textos legíveis no celular (o desenho usa uma largura interna menor em telas estreitas).
- Menu lateral: letras normais (sem caixa alta).
- Árvore/ramificações: só como metáfora sutil (capa padrão do perfil, cartão da Selic, tela de entrada).

## Textos e idiomas
- Todo texto de interface fica no dicionário `site/js/i18n.js`, com português e inglês lado a lado. Nada de texto fixo no código: use `tr("chave")` (ou `tr.n("chave", número)` quando tiver singular/plural).
- Valores gravados no banco (categorias, tipos, formatos, temas, status de denúncia) continuam em português e são traduzidos só na hora de mostrar (`optLabel`).
- Datas e números usam o formato do idioma (`pt-BR` ou `en-US`).
- Tom: português do Brasil simples e direto; inglês americano.

## Logo
- `prototipo/` e `site/` usam a árvore recortada da logo enviada (imagem WebP embutida).
- **Pendência:** pedir ao designer a versão vetorial (SVG) da árvore e do logotipo "EcoEco".
