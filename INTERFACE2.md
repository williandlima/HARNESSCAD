# Interface — novidades (continuação de `INTERFACE.md`)

## v1.7.4 — plugue MS3476 pelo datasheet oficial
* **MS3476 (MIL-DTL-26482 Série 2, Amphenol MB16)** deixa de "aguardar datasheet": o desenho é o traço vetorial
  oficial do catálogo Amphenol *Matrix MIL-DTL-26482 Series 2*, p. 10 — face, corpo com furos, porca recartilhada,
  faixa azul, indicador de acoplamento, rosca de acessório com filetes e gromete com os 3 dentes.
* Cotas da tabela do catálogo por carcaça (8 a 24): comprimento 1,420 máx (36,07 mm), Ø A máx sobre o recartilhado,
  Ø B máx do gromete e rosca H; extensão do gromete 0,190 (máx da faixa 0,130–0,190).
* Ainda aguardando: o adaptador de cordoalha (confirmar o tipo — Amphenol "Pre-Shield" M85049/109 ou "Shrink Boot"
  M85049/60-1 para a família J) e as vistas frontais dos arranjos MS3476.

## v1.7.5 — adaptador Pre-Shield (cordoalha) pelo datasheet oficial
* O adaptador da prancha da casa é o **Amphenol Pre-Shield** reto: **M85049/109** no MS3476 (MIL-DTL-26482 Sér. 2) e
  **M85049/115** no D38999 série III. Sai de fábrica com a cordoalha de cobre, que é soldada na cordoalha do cabo com a
  luva de solda; a bota Raychem 202K agarra na ranhura do corpo e cobre a emenda.
* Desenho = traço vetorial oficial do catálogo Amphenol Backshells M85049 (pp. 546 e 501), **vista externa** (sem corte),
  a mesma figura em todas as carcaças, só a proporção muda: corpo 1,19 máx (30,2 mm), Ø A da porca pela carcaça, Ø Z/W
  da cordoalha pela entrada (padrão: a maior entrada permitida na carcaça).
* A porca rosqueia sobre a rosca de acessório do conector (cobre rosca e gromete, sem linhas aparecendo por baixo).
* Lista de materiais: PN completo, ex. M85049/109-20TW11-6 (spin, cordoalha estanhada, cádmio oliva, 6"); a bota 202K
  é escolhida pelo Ø do corpo do adaptador.
* Folha nova da casa: MS3476 recebe /109 e D38999 recebe /115 automaticamente (MS26482/MS5015 seguem aguardando).

## v1.7.6 — duas fases de trabalho
1. **Esquema elétrico = definição do projeto**: conectores, contatos, fios, emendas, equipamentos.
2. **Cablagem física = customização**: periféricos e itens da cablagem (adaptador, bota, backshell, cordoalha, luva de
   solda, barbante, etiquetas, coberturas, transições, cotas, vistas, lista de materiais).
* O campo "Backshell" saiu das propriedades do conector no esquema (periférico é da fase física). Em projetos antigos
  ele ainda aparece como "Backshell (antigo)" se tiver valor, e é levado ao nó do conector ao gerar a folha física.

## v1.7.7 — comprimento é definido no físico
* O comprimento dos fios e dos cabos vem só do **desenho físico**: caminho pelos ramos (cotas) + folga das pontas
  + comprimento extra dos itens no ramo; lista de materiais com a % de perda.
* Saíram do esquema: o campo "Compr. (mm)" do fio e do cabo/blindagem, e a edição do comprimento na lista de fios e
  na tabela de cotas (agora só leitura, "Compr. mm (físico)").
* Cabo na lista de materiais = o maior fio dele pelo físico.
* Projetos antigos: um comprimento digitado no esquema ainda vale e aparece como "Compr. manual (antigo)"; apague
  para usar o físico.

## v1.7.8 — peça fora do catálogo (bota, backshell, adaptador…)
* Desenho físico › painel da folha › **Recortar imagem de datasheet…**: cole o print do datasheet, recorte, informe
  tipo (bota, backshell/alívio…), tamanho real e agora também **Part number, Fabricante, Características** e
  **Vincular à família** (+ carcaça; vazio = todas). Com um conector selecionado, família e carcaça já vêm preenchidas.
* Salva na biblioteca compartilhada do servidor. A peça aparece nas opções do nó do conector, sai na lista de materiais
  com o PN, fabricante e características, e numa **folha física nova** os conectores da família/carcaça vinculada já a
  recebem (troque no nó se quiser outra).
* A figura recortada é o datasheet do usuário: conta como desenho oficial (não "aguardando").
