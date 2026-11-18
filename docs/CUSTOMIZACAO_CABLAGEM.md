# Customização da cablagem (fase física) — como funciona e de onde veio

## Regra
O **esquemático define** (conectores, contatos, fios, emendas, equipamentos). O **físico customiza**: comprimentos e
todos os itens da cablagem. No físico, o que veio do esquema aparece **só para leitura** e conector/emenda não podem
ser apagados (apague no esquemático).

## O que foi copiado dos CADs de chicote
| Software | Ideia | No HarnessCAD |
|---|---|---|
| Zuken E3.series (Formboard) | "assembly parts" anexados ao conector; atributos do componente vindos do banco | Acessórios do conector (painel do nó) e itens desenhados (adaptador, bota, capa) |
| Siemens Capital Harness | acessórios escolhidos por regra (família/carcaça do conector); tabela de configuração do chicote | Vínculo família/carcaça (entra sozinho em folha nova) e janela "Customização da cablagem" |
| EPLAN Harness proD | coberturas e acessórios como peças da biblioteca, arrastadas para o feixe | Coberturas do ramo e itens no ponto do ramo vindos da biblioteca |
| Altium Harness Design | biblioteca com parâmetros (PN, fabricante); "adicionar à biblioteca" quando não existe | "Novo item na biblioteca" com PN, fabricante, características |
| WireViz | componentes adicionais por conector com quantidade por pino | Quantidade "por contato ligado" (ex.: espaguete na solda de cada contato) |

## Alças da biblioteca (Painel da folha física › Biblioteca de itens…)
| Alça | Itens (tamanhos/tipos) | Aplicação |
|---|---|---|
| Adaptadores | Amphenol M85049 por carcaça: Pre-Shield /109 (26482) e /115 (38999) desenhados; Shrink Boot /60-1 e /69, crimp ring /26 e /20, band lock /82 e /88 (tamanho real, traço aguardando figura) | desenhado no conector |
| Botas | TE/Raychem 202K121…185 (reta) e 222K121…185 (90°) | desenhada no conector |
| Cordoalhas | malha tubular de cobre estanhado Ø 3 a 32 mm | cobertura do ramo |
| Luvas de solda | M83519/2-1…8 (blindagem c/ fio terra), luva no ramo | acessório do conector / ponto do ramo |
| Transições | TE/Raychem 382A012…046 (Y) | nó de derivação |
| Capas | D-Sub E/A/B/C/D metálica e plástica; tampas protetoras D38999/32 e /33 e 26482 por carcaça | capa do D-Sub / acessório |
| Kits de retenção | parafuso-trava 4-40 e M3, screwlock, alívio de tensão D-Sub, clipes, tampões | acessório do conector |
| Espaguetes | RNF-100 Ø3/64"…1" preto e transparente, DR-25 Ø1/8"…2", espaguete na solda por contato | cobertura do ramo / acessório |
| Amarração | abraçadeiras 100…370 mm, com base, base adesiva, barbante de amarração, P-clip MS21919WDG3…24 | ponto do ramo |
| Etiquetas | etiqueta sob espaguete transparente, termo-retrátil impressa, bandeira, do conector | etiqueta / acessório |

**Aplicar**: selecione no desenho físico o conector, o ramo, o nó de derivação ou a etiqueta e clique em Aplicar na
linha do item. "Só o que serve no conector selecionado" filtra por família e carcaça. O PN escolhido vai para a lista.

## Item que não está na biblioteca
Na alça desejada: **Novo item nesta alça…**: nome/tipo e tamanho, PN, fabricante, características, aplicação, desenho
(figura recortada, para adaptador/bota), nome, PN, fabricante, características, unidade, quantidade (por conector ou por contato ligado),
comprimento por peça, forma (para cobertura) e vínculo à família/carcaça. Fica na biblioteca compartilhada do servidor.
