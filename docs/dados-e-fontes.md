# Dados ao vivo: fontes e regras

Os robôs rodam no GitHub Actions a cada 30 minutos (`.github/workflows/atualizar-dados.yml`). Se uma fonte falhar, as outras continuam e o site mantém o último valor bom.

## Indicadores (`scripts/atualizar-mercado.mjs`)
API SGS do Banco Central, gratuita e sem cadastro:
`https://api.bcb.gov.br/dados/serie/bcdata.sgs.{código}/dados/ultimos/{n}?formato=json`

Atenção: `ultimos/{n}` aceita **no máximo 20 valores**. Para mais (a Selic usa ~400 dias para saber desde quando está mantida), o robô pede por intervalo de datas: `.../dados?formato=json&dataInicial=dd/mm/aaaa&dataFinal=dd/mm/aaaa`. Na série 432 o Banco Central publica também dias futuros (até o próximo Copom); o robô ignora datas depois de hoje.

| Indicador | Código SGS | Frequência real |
|---|---|---|
| Meta Selic (Copom) | 432 | muda nas reuniões do Copom |
| IPCA mensal (série de 12 meses do gráfico) | 433 | mensal (IBGE) |
| IPCA acumulado em 12 meses | 13522 | mensal |
| Dólar comercial (venda) | 1 | diária |
| Taxa de desocupação (PNAD Contínua) | 24369 | mensal (trimestre móvel) |

Ibovespa: **brapi.dev** (`GET https://brapi.dev/api/quote/%5EBVSP`, token no cabeçalho `Authorization: Bearer`). Plano grátis: 15 mil requisições/mês e atualização a cada 30 min. A cobertura do índice no plano grátis precisa ser confirmada na Etapa 6; alternativa: ETF BOVA11 como aproximação.

Calendário do Copom (para "próximo Copom"): `scripts/fontes.json` → `copom`. Datas de 2026: 3–4/11 e 8–9/12. Atualize no fim do ano com o calendário de 2027 publicado pelo Banco Central.

## Notícias (`scripts/atualizar-noticias.mjs`)
| Fonte | Feed | O que guardamos |
|---|---|---|
| Agência Brasil (economia) | `https://agenciabrasil.ebc.com.br/rss/economia/feed.xml` | título, link e **resumo** (conteúdo Creative Commons; cite a fonte) |
| InfoMoney | `https://www.infomoney.com.br/feed/` | **só título e link**, filtrado por palavras de economia |

Para incluir outra fonte, adicione em `fontes.json` (`"resumo": false` para portais comerciais). Regra de ouro: **nunca copiar o texto da matéria** de quem não autoriza; a prévia leva o leitor para o site original.

Categorias automáticas: Agronegócio, Mercado, Internacional, Empresas, Brasil (por palavras-chave inteiras). Notícias com mais de 10 dias são apagadas.

## Idioma dos dados
Os textos gerados pelos robôs (ex.: "0,55% no dia", "mantida desde 16/9") são gravados em português. Em inglês, o site troca só o formato dos números e das datas; as palavras continuam em português. Para traduzir também essas frases, os robôs precisariam gravar valores separados (número, variação, data) em vez de frases prontas.

## Limites e cuidados
- O GitHub pode atrasar execuções agendadas em alguns minutos em horários de pico.
- Repositórios sem commits por 60 dias têm os agendamentos pausados.
- Dados oficiais podem ser revisados pelas fontes; o site mostra sempre a data/hora da última atualização.
- Conteúdo educativo: nada é recomendação de investimento.
