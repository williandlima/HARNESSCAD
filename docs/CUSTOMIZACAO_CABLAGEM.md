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

## Onde se anexa cada item
* **Conector** (painel do nó › Acessórios do conector): tampa protetora, cordão da tampa, O-ring, porca de painel, junta,
  etiqueta do conector; terminação de blindagem (luva de solda, anel de crimpagem, cinta, fio dreno); por fio/contato
  (anilha, espaguete na solda, ponteira); consumíveis (adesivo da bota, fita isolante, selante).
* **Desenhados no conector**: adaptador/backshell, bota, capa do D-Sub, barbante do engate rápido (janela de customização
  ou painel do nó). Peça fora do catálogo com figura: "Recortar imagem de datasheet…".
* **Ramo, por comprimento** (cobertura): termo-retrátil, malha de blindagem, malha PET, conduíte, espiral, fita, tubo,
  luva anti-abrasão.
* **Ponto do ramo**: abraçadeira, abraçadeira com base, barbante de amarração, P-clip, base adesiva, passa-fio,
  marcador, luva de solda no ramo, folga de serviço, laço de gotejamento.

## Item que não está na biblioteca
Painel da folha física › **Biblioteca de itens…** › **Novo item…** (ou no painel do conector › Novo item na biblioteca):
categoria, nome, PN, fabricante, características, unidade, quantidade (por conector ou por contato ligado),
comprimento por peça, forma (para cobertura) e vínculo à família/carcaça. Fica na biblioteca compartilhada do servidor.
