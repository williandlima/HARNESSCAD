# HarnessCAD — análise de realismo de uma cablagem criada (fase 2)

## Cablagem de referência
Criada no próprio programa (esquemático → desenho físico, escala 1:5, modelo Traço):
* **J1** D38999/26 plugue reto, carcaça 13 (13-35) + alívio de tensão Glenair 620-048 + bota reta 770-001.
* **J2** D38999/24 receptáculo jam nut, carcaça 13 + bota 90° 770-001 A.
* **J3** D38999/20 receptáculo de parede, carcaça 11 + alívio 620-048 + bota reta.
* Tronco J1–BR1 660 mm (+25/−0), BR1–J2 540 mm (+25/−0), ramo BR1–J3 400 mm; 16 fios 22 AWG; abraçadeiras a cada 150 mm,
  P-clip, marcadores W1-J1 e W1-J3, tabela de ramos e de crimpagem.

Medido no desenho (ERC + caixas do desenho + feixe calculado):

| Item | Valor |
|---|---|
| Ø do feixe (1,15·√Σd²) | J1–BR1 6,30 mm (16 fios) · BR1–J2 4,98 · BR1–J3 3,86 |
| Montagem J1 (real) | bota 55,0 + alívio 22,9 + plugue 31,9 mm (Ø 29,4) |
| Ampliação dos conectores | ×3,7 a ×3,8 (automático: conector ≥ 24 mm no papel) |
| Largura do feixe no papel | 4,45 mm para Ø 6,3 real (≈ ×3,5) — coerente com a ampliação dos conectores |
| Textos | 89 % entre 1,5 e 1,7 mm (tabelas, rótulos, cotas) |
| Peso estimado | 85,8 g (só fios; conectores sem peso informado) |

## Achados e o que foi feito

| # | Achado (antes) | Situação |
|---|---|---|
| 1 | Conectores e acessórios eram imagens ilustrativas do painel | **Corrigido**: desenhos de linha idênticos aos catálogos (Amphenol pp. 49, 50, 52, 53; Glenair H-5, H-6, H-24), só a geometria — cotas, textos e linhas de chamada removidos. Fotos reais dos 4 conectores no modo Imagens |
| 2 | Tamanho do conector sem relação com a carcaça | **Corrigido**: comprimento e Ø reais por carcaça, das tabelas dos mesmos catálogos (ex.: plugue 13 = 31,9 × 29,4 mm; bota reta 13 = 55 mm) |
| 3 | Conector, backshell e bota não existiam como conjunto | **Corrigido**: montagem encadeada (conector → backshell → bota) com sobreposição real das peças; bota 90° gira o conector 90°, como na montagem real |
| 4 | Escala dos conectores incoerente com o feixe | **Corrigido/opcional**: ampliação única para a montagem, coerente com o feixe; nota "fora de escala (ampliados)" na folha; opção *Tamanho real* ou fator fixo |
| 5 | No PDF, imagem com fundo transparente viraria retângulo branco sobre o feixe | **Corrigido**: transparência gravada como /SMask |
| 6 | Bota/alívio sem relação com o Ø do feixe | **Nova verificação (ERC)**: J2 (bota 90°, carcaça 13: aperta até Ø 5,5) com feixe 4,98 e J3 (bota reta 11: Ø 6,0; alívio 11: faixa 3,9–5,9) com feixe 3,86 → avisos "precisa de enchimento/fita ou tamanho menor" — a mesma recomendação da nota de aplicação 2 do catálogo Glenair |
| 7 | Derivação podia ficar colada na saída da bota | **Nova verificação**: primeiro BR/emenda a < 25 mm da montagem gera aviso |
| 8 | Peças fora da folha passavam despercebidas | **Nova verificação**: J3 invadindo o carimbo e a tabela de crimpagem (20 linhas) saindo da moldura → avisos. Recomendação: tabelas longas numa folha própria |
| 9 | Tampões de vedação | Já verificado no ERC (J1 6, J2 12, J3 7 cavidades vazias → MS27488-22-2) |
| 10 | Cota total inclinada cruzando o desenho (entre conectores não alinhados) | **Corrigido**: cota total só entre conectores alinhados pelo tronco; os ramos têm cota própria |
| 11 | Rótulos e balões sobre a imagem do conector | **Corrigido**: posição automática (rótulo abaixo, balão acima da montagem) + **Organizar rótulos** |
| 12 | Ramo BR1–J3 sem tolerância (desenho real sempre indica) | **Novo campo**: Tolerância geral da folha (nota impressa); ou preencher a tolerância do ramo |
| 13 | Textos de 1,5–1,7 mm ficam pequenos impressos em A3 | **Opção**: Texto mínimo (2,0 / 2,5 / 3,5 mm). Desligada por padrão para não estourar as tabelas; para A3 use 2,0 mm ou imprima em A2 |
| 14 | Peso só dos fios | Informe o peso do conector montado (campo Peso do nó) — as páginas usadas dos catálogos não trazem peso |
| 15 | Imagens de datasheet só para D38999 Série III e 3 acessórios Glenair | **Limitação**: não há datasheet dos demais itens aqui (D-Sub, Deutsch, abraçadeiras, P-clip, terminais, termo-retrátil comum). A ferramenta **Recortar imagem de datasheet** inclui qualquer item a partir de um print/PDF do datasheet |
| 16 | Fotos reais têm ~130 px (como no catálogo) | No PDF ficam suavizadas — para impressão use o modelo Traço (desenho vetorial recortado em alta resolução) |
| 17 | Plugue 90°, receptáculos PCB, tampas de proteção | Não recortados nesta fase (vista com saída lateral ou sem uso no chicote); podem ser incluídos pelo recorte |

## Conclusão
Com as imagens de datasheet em tamanho real, a montagem conector + backshell + bota e as novas verificações, o desenho
físico passa a ter a aparência e as informações de um desenho de chicote de fabricação: geometria real das peças, cotas
por ramo com tolerância, itens posicionados por distância, lista de materiais com acessórios e avisos de montagem que um
projetista experiente faria (bota folgada, derivação colada, peça fora da folha). O que ainda depende do usuário: PN
definitivo dos acessórios, pesos, tolerância geral e imagens dos itens que não são D38999.
