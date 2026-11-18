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

## v1.7.9 — customização da cablagem (biblioteca de itens)
* Painel da folha física: **Customização da cablagem…** (tabela: por conector adaptador/backshell, bota, capa do D-Sub,
  barbante e acessórios; por ramo cobertura e PN) e **Biblioteca de itens…** (itens comuns por categoria + do usuário).
* Painel do conector no físico: bloco **Definido no esquemático** (só leitura) e **Acessórios do conector**: adicionar
  da biblioteca, quantidade, PN, remover, ou **Novo item na biblioteca…** (PN, fabricante, características, unidade,
  quantidade por contato ligado, vínculo família/carcaça).
* Itens comuns: tampa protetora, cordão, O-ring, porca de painel, junta, etiqueta, luva de solda, anel de crimpagem,
  cinta, fio dreno, anilha, espaguete na solda, ponteira, adesivo, fita, selante; coberturas novas (malha PET, fita, tubo,
  luva anti-abrasão); itens de ramo novos (abraçadeira com base, barbante de amarração, base adesiva).
* Trava: no físico não se apaga conector nem emenda (vêm do esquemático). Detalhes: `docs/CUSTOMIZACAO_CABLAGEM.md`.

## v1.8.0 — biblioteca em alças
* **Biblioteca de itens** organizada em alças (abas): **Adaptadores, Botas, Cordoalhas, Luvas de solda, Transições,
  Capas, Kits de retenção, Espaguetes, Amarração, Etiquetas** — cada uma com vários tamanhos e tipos (tabelas Amphenol
  M85049, TE/Raychem 202K/222K/382A, RNF-100/DR-25, MS21919, M83519/2…). Lista completa: `docs/CUSTOMIZACAO_CABLAGEM.md`.
* **Aplicar** põe o item no que está selecionado (conector, ramo, nó de derivação, etiqueta); "só o que serve no
  conector selecionado" filtra por família/carcaça; o PN escolhido (ex.: adaptador M85049/88-21W03, bota 202K163-25-0)
  vai para a lista de materiais.
* **Novo item nesta alça…** cadastra o que falta (PN, fabricante, características, aplicação, desenho, vínculo).
* Adaptadores Amphenol além do Pre-Shield entram com o tamanho real da tabela e traço "aguardando datasheet".

## v1.8.1 — MIL-DTL-26482 Série 2 (MS34): 34 arranjos e vistas frontais exatas
* Catálogo com os **34 arranjos de inserto** da Amphenol Matrix (antes 11), cada contato com letra e **tamanho**
  (#20, #16, #12 — arranjos mistos como 14-9, 22-41 e 22-95 corretos; contatos e tampões por tamanho na lista).
* **Vista frontal exata**: carcaça e posição de cada contato tiradas do PDF vetorial do catálogo; contatos pela legenda
  (#20 aberto, #16 cheio, #12 meio cheio) e letras na posição do catálogo; face de soquetes espelhada.

## v1.8.2 — luvas de solda pela tabela TE
* Alça **Luvas de solda** com a tabela exata do catálogo TE/Raychem (p. 52): 5 tamanhos (Ø máx. da capa / Ø mín. da
  blindagem) × sem fio terra (M83519/1, S01), com fio terra 20/22/24/26 AWG (M83519/2-1…20, S02) e com tira de malha
  estanhada ou niquelada (M83519/3, S03). Substitui a lista anterior, que não vinha de datasheet.

## v1.8.3 — receptáculos MS34 pelo datasheet
* **MS3470** (flange estreito), **MS3471** (de cabo, variante nova "71") e **MS3474** (porca) desenhados pelo traço
  vetorial do catálogo Amphenol Matrix (pp. 8–9), sem as cotas. Medidas da tabela por carcaça: corpo Ø C, flange A
  (espessura F exata), porca K e rosca de fixação J (MS3474), rosca H, gromete D, comprimento 1,405 / 1,465.
* Saem do "aguardando datasheet". O adaptador Pre-Shield rosqueia na rosca de acessório de cada um.

## v1.8.4 — kits de retenção Metaltex
* Alça **Kits de retenção**: **KF** (fêmea — espaçador sextavado 4-40 UNC, porca, arruelas) e **KM** (macho — parafuso
  4-40 UNC com presilha) da Metaltex, com as medidas da folha do fabricante; servem só em D-Sub. Aplicar o **KF** num
  D-Sub já põe a fixação "V — parafuso fêmea sextavado 4-40" no desenho.

## v1.8.5 — adaptadores e bota pelo datasheet
* **Adaptadores Amphenol** que estavam "aguardando": /60-1 e /69 (para bota), /26 e /20 (anel de crimpagem), /82 e /88
  (band lock) agora desenhados pela vista externa do catálogo Backshells M85049 (traço vetorial, metade sem corte).
  Medidas da tabela: porca Ø A, traseira pelo Ø de saída de cada tipo, comprimento; a porca rosqueia no conector.
* **Bota Raychem 202K** com o perfil exato da tabela TE (corpo R, transição até P−Y, pescoço Y, 2/3 lábios na zona U);
  o tamanho escolhido na biblioteca (PN) passa a valer também no desenho.
