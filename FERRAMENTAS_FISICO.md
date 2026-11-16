# HarnessCAD — ferramentas do modo físico

## Ferramentas do chicote (painel da folha e propriedades)
**Edição**
* Ímã de ângulo: ao arrastar um nó ou desenhar um ramo, encaixa em 0°/45°/90° (±6°). Shift = livre.
* Ramo selecionado: **girar o sub-ramo** (↺/↻ 15° e 90°) ou **espelhar** em torno do nó do tronco, mantendo os comprimentos; **Selecionar sub-ramo** para copiar/colar com acessórios.
* BR: **Deslizar no tronco** (distância a partir de uma ponta; a derivação vai junto e os comprimentos digitados se ajustam).
* **Redesenhar em escala**: os ramos com comprimento digitado passam a medir len/escala no papel.
* Editar › Alinhar/Distribuir nós (horizontal/vertical).

**Itens no ramo** (ramo › "+ Item no ramo"): abraçadeira, P-clip, fita, ilhós/passa-fio, marcador de identificação (texto), folga de serviço e laço de gotejamento. Posição = distância real a partir de uma ponta, cotada no rótulo. Folga e laço somam "extra" no corte dos fios do ramo. Peças entram na lista de materiais; marcadores também na tabela Marcadores. Conector: backshell, boot e alívio de tensão (PN) na lista de materiais e nos balões.

**Verificação** (ERC): ocupação da cobertura (Ø interno no ramo/cobertura; não cabe = erro, folgada = info; termo-retrátil: Ø recuperado = Ø/razão maior que o feixe = não aperta) e emendas não escalonadas (distância mínima no painel, padrão 25 mm). Contato × bitola e tampões já estavam no ERC. **Peso** estimado no painel e na tabela de ramos (fios por g/m da bitola, coberturas g/m, peças pelo peso informado).

**Revisões**: "Congelar revisão" guarda um retrato; "Comparar" lista ramos, comprimentos, conectores, itens e cortes alterados e destaca em laranja na tela.

**Documentação**: vista de detalhe (região ampliada 1,5:1 a 10:1, recortada na tela e no PDF), notas com bandeira (triângulo numerado preso a um item) e tabelas novas: ramos, notas, crimpagem (contato, ferramenta e posicionador típicos — sobrescreva no conector), lista de corte e marcadores.

**Saídas**: lista de corte em CSV (Excel/máquina de corte e decapagem) e gabarito em DXF 1:1 (mm; camadas RAMOS, NOS, PINOS, ITENS, TEXTO).

**Variantes**: painel › Variantes "A,B"; item › "Variantes onde existe". Exibir uma variante filtra desenho, seleção, feixe, comprimentos e lista de materiais (e escreve VARIANTE X na folha).


## Fase 2 — imagens reais e montagem do conector
* **Imagens de datasheet**: D38999/26, /24, /20 e TV01 (Amphenol) e bota reta/90° e alívio 620-048 (Glenair), recortados dos catálogos sem cotas nem textos, em tamanho real pela carcaça. Modelo Traço = desenho de linha; Imagens = foto real do conector. Nó do conector › *Imagem real (datasheet)*: automático, escolher ou não usar.
* **Montagem**: nó › Backshell/alívio e Bota (reta ou 90°). A bota 90° gira o conector. Entram na lista de materiais (definir PN).
* **Escala dos conectores** (painel): ampliados automático, tamanho real ou 2×/3×/5×. **Tolerância geral** e **Texto mínimo** da folha.
* **Recortar imagem de datasheet…**: cole um print/abra o PNG/JPEG, recorte, fundo branco vira transparente, gire/espelhe, informe o tamanho real e o tipo (conector, backshell, bota, item). Vai para a biblioteca compartilhada e para a paleta "Datasheet (real)".
* **Botão direito** no desenho físico: ações do ramo (derivar aqui, novo ramo, itens no ponto clicado, girar/espelhar sub-ramo), do conector (girar, bota, backshell, balão, nota, tabela) e do BR (novo ramo, juntar, deslizar).
* **Arrastar** um item do ramo desliza ao longo do ramo (Shift move só o rótulo); **Alt + arrastar** um BR desliza no tronco.
* **Organizar rótulos**: tira sobreposições. Rótulo e balão do conector ficam automaticamente fora da montagem.
* **ERC novo**: bota/alívio × Ø do feixe (faixas dos catálogos), derivação colada no conector, item fora da moldura/sobre o carimbo.
* Análise de uma cablagem criada: **ANALISE_REALISMO.md**.

## Ramos: detalhamento, amarração e fios aparentes
* **Feixe com capa** desenhado como um corpo só: contorno contínuo e junta arredondada nas derivações, fim da capa marcado junto ao conector.
* **Sem capa — fios aparentes**: um traço por fio do esquemático (a quantidade real, sem limite), na cor do fio. Cada fio é um traço contínuo que faz uma curva suave do ramo de origem para o ramo de destino na derivação; ramos curvos (arraste o ramo) levam os fios junto. A ordem lateral é escolhida para os fios não se cruzarem; no conector eles afunilam até a saída. Par trançado ondulado. Passo entre fios automático ou no painel › Ramos. Por ramo (Propriedades › Feixe) ou para a folha toda.
* **Amarração**: abraçadeira de nylon (tipo Hellermann), barbante encerado por pontos, barbante em costura contínua ou fita em espiral. Passo e distância das pontas em mm reais; padrão da folha com exceção por ramo (inclusive "Sem amarração"). Botão direito no ramo tem os atalhos.
* **Lista de materiais**: abraçadeiras em peças (1 por ponto), barbante em metros (3 voltas + 150 mm de nó por ponto; contínua 2,5× o ramo + 300 mm), fita em metros (19 mm, 50% de sobreposição). PN padrão por tipo no painel.
* **Identificação do ramo** (ligada por padrão): "12 fios · Ø6,3 · abraçadeira de nylon" ao longo de cada ramo.

## Cotas, detalhe e etiqueta
* **Cotas com nº de fios**: abaixo da linha de cota aparece "10 fios" (cota do ramo = fios do ramo; cota do caminho = fios que vão de uma ponta à outra). Cota › "Ocultar nº de fios".
* **A cota define o ramo**: na cota, *Valor (mm)* — o ramo passa a ter esse comprimento (cota do caminho: os ramos do caminho são reescalados). Com "Cota redesenha em escala" (padrão) os nós andam; desligado, só o valor muda (fica sublinhado = fora de escala). Corte dos fios e lista de materiais acompanham.
* **Vista de detalhe = zoom de área** (V ou botão lupa): arraste sobre a área; nasce uma vista em círculo (ou retângulo — opção da ferramenta) com a maior ampliação que cabe (até 10:1), num lugar livre, com letra, linha de chamada e "DETALHE A / ESCALA 3:1". Dentro da vista a geometria cresce e as linhas finas e os textos ficam no tamanho normal; cotas e balões ficam de fora (opção mostrar). Detalhe selecionado: arraste a borda tracejada para mover a região, o quadradinho laranja para mudar o tamanho, e a vista para mudar o lugar. Recorte circular também no PDF.
* **Etiqueta de identificação** (I ou botão etiqueta, ou botão direito no ramo): clique no ramo. Tipos: luva termo-retrátil impressa (texto na luva), etiqueta bandeira e luva num fio só (feixe sem capa: fica sobre o fio escolhido). Posição medida do conector mais próximo, com **cota da posição** (liga/desliga, afastamento, lado, tolerância). Arrastar desliza no ramo em passos de 5 mm; Shift move só a bandeira. Entra na lista de materiais (por tipo e PN) e na tabela Marcadores. Padrões da ferramenta: tipo, PN, com cota.
* **Ponto de derivação só onde deriva**: com 2 conectores o desenho nasce com um ramo direto (sem BR). O centro automático da estrela (3 ou mais conectores sem cotas) só existe se tiver 3 ramos; ao atualizar, se ficar com 2 ele some e os ramos se unem. BR antigo com só 2 ramos: botão direito na área livre (ou painel › Ramos) › **Remover derivações sem ramificação** — une os ramos e mantém cotas, etiquetas e itens no mesmo lugar.

## Edição livre (v1.2)
* **Ramo maleável**: duplo clique no ramo cria um ponto de curva; arraste as bolinhas laranja; botão direito no ponto remove ou endireita. A curva passa por todos os pontos e acompanha os nós. Dividir/juntar ramos mantém o traçado.
* **Girar em qualquer ângulo**: conector, imagem, rótulo e vista frontal selecionados mostram uma alça redonda — arraste (passo 15°, Shift = livre) ou digite o ângulo.
* **Cota angular**: botão direito numa derivação › + Cota angular. Digitar o ângulo gira o ramo (e o que vem depois dele) em torno do nó. Arraste o texto.
* **Aparência por item**: cor, espessura das linhas e tamanho do texto (Propriedades › Aparência).
* **Camadas**: painel da folha › Camadas — cotas, rótulos, balões, tabelas, acessórios, vistas, imagens e coberturas podem ser ocultadas (somem da tela, do PDF e da seleção).
* **Preparação da ponta** (botão direito no conector): detalhe sem escala com capa, malha dobrada, dreno, condutores nas cores com nº do fio e pino, contato crimpado e cotas A/B/C.
* **Esquemático**: mover um conector mantém o espaçamento dos fios (degraus escalonados, sem encavalar).

## Realismo (v1.3)
* **Conector em desenho técnico** (painel da folha › Conectores › Desenho técnico, ou por conector): porca de acoplamento recartilhada, corpo, roscas, faixa vermelha (acoplamento total) e azul (contatos de remoção traseira), flange quadrado com furos, porca sextavada, alívio de tensão com abraçadeira e parafusos, bota termo-retrátil reta/90° — com as medidas reais do datasheet pela carcaça. Por conector: comprimento e Ø próprios e **medidas do conector para consulta** (botão direito › Consultar medidas do conector…), fora do desenho da cablagem.
* **Vista frontal vetorial**: contatos numerados na posição real do inserto (MIL-STD-1560), tamanho de cada contato, chaveta mestra, contatos ligados preenchidos com a cor do fio; face de soquetes espelhada. Ao trocar o desenho, rótulos e vistas que encostam são afastados.
* **Acessórios com forma real**: abraçadeira (cor escolhida), P-clip com almofada e furo, fita em espiral, ilhós no painel, luva marcadora arredondada, folga de serviço e laço de gotejamento com a largura do feixe.
