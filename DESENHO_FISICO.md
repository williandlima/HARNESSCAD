# Desenho físico da cablagem (fase 2)

**Ferramentas › Gerar desenho físico…**: escala (1:1 a 1:50), **modelo** e o que incluir (vistas frontais, balões + lista de materiais, tabelas). Cria a folha **Desenho físico** a partir do esquemático.

## Modelos
* **Traço — estilo Altium**: tudo em linha numa cor (azul padrão, ajustável): conector em vista lateral, **leque de fios** até a capa do cabo, cabo em **contorno duplo** (reto ou curvo), **vista frontal** ao lado (D-Sub/Micro-D com as fileiras de contatos; circular com a imagem do datasheet, se cadastrada), **balões** com seta, **cota**, **tabela de ligação** (J1:1 — sinal — cor/bitola — J2:1) e **lista de materiais**.
* **Imagens**: imagens do painel de referência ou **fotos reais** cadastradas por part number.
O modelo pode ser trocado a qualquer momento no painel da folha.

## Como é montado
* **Ramos e comprimentos** vêm das cotas do chicote (ferramenta D) entre conectores, BRs e emendas. O maior caminho com cota vira o tronco; ramos a 90° alternando os lados. Comprimento no papel = real / N.
* Conector sem cota entra ligado pelo fio (ramo "sem cota", vermelho). Sem nenhuma cota: estrela, com aviso.
* **Cotas**: uma por ramo (comprimento do ramo) e uma **total** entre os conectores mais distantes (soma do caminho).
* **Balões**: número = item da lista de materiais (conectores agrupados por PN, fios por PN em metros, coberturas, acessórios).

## Tudo manuseável (arrastar com o mouse)
| Item | Arrastar | Propriedades / ações |
|---|---|---|
| Conector / BR | posição — ramos, rótulo, balão e vista acompanham | imagem/forma, comprimento real, ângulo, espelhar, PN no rótulo, texto · novo ramo · cotar até outro nó · vista frontal · balão · **foto real** |
| Ramo | **curva** o ramo | comprimento, tolerâncias, cobertura (conduíte, malha, termo, espiral) · dividir (novo BR) · endireitar · balão |
| Cota | perpendicular = afastamento; ao longo = posição do texto | valor: ramo / caminho (soma) / medida × escala; texto livre (ex.: "xxxx mm"); tolerâncias |
| Rótulo, balão, vista frontal | posição (relativa ao item) | texto (use \| para quebrar linha), número do balão, largura da vista |
| Tabelas | posição | largura (ligação) · "+ Tabela de ligação" / "+ Lista de materiais" no painel da folha |
| Itens (paleta) | posição | imagem, PN, tamanho, ângulo, espelhar, rótulo, balão |

R gira, X/Y espelha, Del apaga (leva junto ramos, cotas, rótulos, balões e vistas do item). Mover um grupo não deforma o que acompanha os nós. **Atualizar do esquemático** refaz a topologia e mantém tudo o que foi ajustado (imagens, curvas, coberturas, posições e textos de rótulos/balões/cotas/vistas/tabelas e itens extras).

## Fotos reais
Biblioteca › conector › **Foto real…** ou, no desenho, conector › **Foto real do conector…**: cole (Ctrl+V) ou abra a foto lateral (PNG/JPEG). Posição esperada: engate à esquerda, cabo saindo à direita (ou marque *Espelhar*). Ajuste a altura da saída do cabo (ponto vermelho) e o comprimento real. A foto fica na biblioteca compartilhada do servidor (`USR:PHYS:<part>`), exatamente como veio, e tem prioridade sobre a imagem do painel. No PDF os pixels entram sem alteração.

## Precisão
* **Feixe real**: cada fio do esquemático é roteado pelos ramos; o ramo mostra quais fios leva, a contagem e o **Ø estimado** (1,15·√Σd², d = Ø externo do fio — ref. M22759/16 por AWG). A largura desenhada do feixe e o **leque** (um traço por fio real; no modelo Imagens, na **cor** do fio) seguem esses dados. *Rótulo do feixe* (ramo › botão) mostra fios e Ø. Fios cuja ponta não está no desenho são avisados como "não roteados".
* **D-Sub / Micro-D**: vista frontal com as medidas nominais da série (MIL-DTL-24308: passo 2,77 × 2,84 mm, HD 2,41 × 1,98; MIL-DTL-83513: 1,27 × 1,09), carcaça trapezoidal a 10°, flange (A) e furação (B) por tamanho de carcaça (E, A, B, C, D), numeração dos contatos e face de pinos/soquetes (espelhada), em **escala de detalhe** (1:1 padrão; 2:1 no Micro-D; ajustável). Medidas nominais — confira no datasheet do fabricante.
* **Cotas ABNT (NBR 10126)**: tolerâncias empilhadas à direita do valor; cota **fora de escala = valor sublinhado**.
* **Carimbo**: a folha física mostra a sua escala (1:N) no campo ESCALA.
* Conector circular em traço: altura proporcional ao tamanho da carcaça (ilustrativa).

## Formatação e cotas: no desenho físico
O esquemático é só elétrico. **Ramificação, posições e comprimentos do chicote são do desenho físico** (as ferramentas Cota e Derivação no esquemático levam para lá; ao gerar, as cotas antigas do esquemático são importadas e podem ser apagadas).
* **W – Ramo**: clique num nó (conector, BR, emenda) ou sobre um ramo (deriva ali) e depois no destino: nó, ramo ou ponto livre (novo BR).
* **B – Derivação**: clique sobre o ramo cria um BR naquele ponto (comprimento digitado é dividido na proporção).
* **D – Cota**: dois nós; ramo direto = cota do ramo, senão cota do caminho.
* **Mudar de onde um ramo sai**: selecione o ramo e arraste a alça laranja da ponta até outro nó ou ramo.
* **Del num BR** com dois ramos junta os ramos (soma os comprimentos).
* **Comprimento do ramo**: vazio = medido no desenho (traçado × escala) — arrastar os nós muda a cota; digitado = cota fixa (sublinhada se fora de escala).
* **Fios**: comprimento = caminho pelos ramos + folgas das pontas (aba Fios, Quantidade de fio, BOM, ERC).
* **Atualizar do esquemático** não mexe no traçado: conector/emenda novo entra num ramo novo ligado ao nó com circuitos em comum; removido sai (emenda intermediária vira BR). "Refazer o traçado do zero" é opcional.

## Ferramentas do chicote
Itens no ramo, sub-ramos, revisões, variantes, vista de detalhe (V), etiqueta de identificação (I), cotas com nº de fios, fios aparentes, notas, crimpagem, lista de corte e DXF: ver **FERRAMENTAS_FISICO.md**.

## Verificação (ERC) severa
Aba **Verificação (ERC)**: cada linha tem a regra e o botão **Aceitar** (waiver, guardado no projeto; "Mostrar aceitos" lista e permite reverter). **Regras do ERC…** muda a severidade de cada regra (erro / aviso / desligada) e o fator do raio de curvatura. Regras novas: corrente acima da capacidade do fio (`Corrente (A)` no fio) e do contato, fio órfão / ponta solta, ramo físico vazio, conector sem fios, fio não roteado, **raio de curvatura** do ramo menor que k·Ø do feixe.

## Fabricação
* **Gabarito 1:1** (painel da folha física › *Gabarito 1:1…*): PDF com página-índice e folhas lado a lado em A4/A3, sobreposição, cruzes de alinhamento e régua de 100 mm — imprima em tamanho real e confira a régua.
* **Folga e decapagem por ponta**: `Folga A/B` no nó físico e `Decapar A/B` no fio (padrão pela bitola). O comprimento do fio = caminho + folgas das duas pontas. Colunas na lista De-Para.
* **Tabela de conexões** por conector (paleta › Tabela de conexões): pino, sinal, fio, cor/bitola, destino e decapagem.
* **Balões com itens associados**: contatos, tampões e acessórios do conector aparecem como círculos menores ao lado do balão e entram na lista de materiais.

## Modelagem
* **Par trançado**: mesmo nome em `Trança` em dois ou mais fios (ex. TP1) → símbolo de trança no esquema e oval na tabela de ligação.
* **Ponta não conectada**: `N/C A` / `N/C B` no fio → X na ponta, sem erro de ponta solta.
* **Derivação (tap)**: emenda tipo *tap* (catálogo de emendas).
* **Cobertura parcial** (paleta › Cobertura): entre dois nós, com início/fim em mm, atravessando vários ramos.
* **Símbolo de quebra** no ramo (`Quebra` nas propriedades): ramo encurtado com a cota real.
* **Rótulo alinhado ao ramo** (rótulo › *Ao longo do ramo*).
* **Destaque cruzado**: selecionar fios no esquema destaca o caminho no desenho físico, e selecionar um ramo destaca os fios no esquema (laranja, só na tela).

## D-SUB em desenho técnico (v1.4)
Com *Desenho técnico (vetor)*, o D-SUB (MIL-DTL-24308 / DIN 41652) sai em vista de cima com as medidas do datasheet Amphenol D-Sub: flange A e furação B por carcaça (E/A/B/C/D, furo Ø3,10), carcaça D frontal, isolador e caçapas. Campos do nó (seção *D-SUB*):
* **Terminação**: solda (caçapa 7,75 máx.) ou crimpagem série 8656 (A máx.: pino 17,19 p/ 9-15 vias e 17,35 p/ 25-50; soquete 17,44).
* **Fixação**: furo passante, L (inserto M3), O (inserto 4-40) ou V (parafuso fêmea sextavado 4-40).
* **Capa**: pela imagem, com capa ou sem capa. A capa usa comprimento típico — confira no catálogo da capa usada.
* **Medidas do conector**: só para consulta (conector › Consultar medidas do conector), nunca no desenho da cablagem. Vistas e rótulos são afastados sozinhos ao mudar os campos do D-Sub.

## Correções v1.6.2
* Conectores **comerciais** (Molex, JST, KK, Pico, IDC, bornes, Deutsch DT/DTM/DTP, Superseal, Han, M8/M12/M16/M23, 7/8", XLR, RCA, BNC, RJ, USB, OBD, Anderson, terminal olhal) agora têm símbolo no físico e vista frontal numerada (medidas típicas).
* Folha física não aceita símbolos do esquema (conector, fio, emenda, label, cabo) — aviso na tela.
* Teclado: depois de mexer em lista/caixa/campo do painel, os atalhos (Del, R…) voltam a funcionar ao passar o mouse no desenho.
* Etiqueta: a cota parte da **borda do conector** (opção *Cota a partir de*) e é **arrastável** para afastar do ramo.
* Vista frontal: **sem descrição** por padrão (*Descrição* liga) e gira com **R** ou no campo *Rotação*.
