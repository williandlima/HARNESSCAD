# HarnessCAD – símbolos, equipamentos e componentes

## Equipamentos de bancada
Catálogo › *Equipamentos e acessórios* (busque "fonte", "osciloscopio", "usb", "banana"…): bancada (fontes 1 e 2 canais, osciloscópios de bancada e portátil, multímetro portátil e de bancada, alicate amperímetro, geradores de funções, carga eletrônica, analisador de espectro, estação de solda, DAQ USB), conversores USB-RS232/RS485/TTL/CAN e USB-RS422/485 isolado (borne 5 vias), fonte AC/DC, informática e rede (notebook, desktop, monitor, impressora, switch, roteador, patch panel) e acessórios (pinos e bornes banana, garras jacaré, ponta de prova, bateria, tomada AC). Desenho realista genérico (painel frontal com display, knobs, bornes e BNCs, sem marcas). A figura é o próprio símbolo: cada **conexão nasce no borne, BNC, porta USB/RJ45 ou parafuso desenhado**, com o fio saindo na direção natural (projetos antigos são convertidos sem soltar fios) e **terminais ligáveis** (bornes banana na cor real); conversores têm USB de um lado e a serial do outro. Informe o modelo em Propriedades › *Modelo / PN* (ex.: Keysight E3634A). Entram na BOM como "Equipamento (referência)".

## Símbolos gráficos dos conectores
Escolha o estilo por conector (painel Propriedades › Símbolo) ou o padrão do projeto (clique na folha vazia › Símbolo padrão):
* **Tabela (EPLAN)** – caixa com cabeçalho, nº do pino e sinal (lista de pinos).
* **KiCad** – corpo estreito estilo *Connector_Generic*, nº sobre o pino, contato macho (barra cheia) ou fêmea (arco), referência e valor acima.
* **Harness (Siemens Capital / EPLAN Harness)** – carcaça com face de engate destacada, uma cavidade por contato e símbolo de engate: macho = seta cheia, fêmea = chevron aberto.
* **IEC 60617** – plugue (barra) / tomada (semicírculo) com contorno tracejado.
* **ANSI/IEEE 315**, **MIL** (contato em círculo), **Régua de bornes** (parafuso nas duas pontas), **Compacto**, **Circular** (mini-vista da face), **Altium Designer** (corpo amarelo, nº sobre o terminal, seta de engate dentro do corpo, do lado oposto aos fios: **saindo = macho (pino)**, **entrando = fêmea (soquete)** — padrão de projeto novo, largura 3), **Altium (símbolo único > <)** (uma só seta grande no centro do corpo, mesma regra) e **OrCAD Capture**. Régua de bornes, Altium e OrCAD aceitam pinos nos dois lados.

Os pinos ficam na mesma posição em todos os estilos: trocar o estilo **não desliga fios**. O gênero (pino/soquete) muda o desenho do contato.

**Vista frontal** (Propriedades › *Inserir vista frontal*): a **imagem do datasheet** do conector, idêntica ao catálogo (sem redesenho, sem espelhar), com legenda da fonte e a tabela de pinagem (pino, sinal, fio, bitola, cor) ao lado. *Largura da imagem (mm)* ajusta o tamanho; a proporção é mantida. Conector sem imagem: aparece o aviso "sem imagem do datasheet" — cadastre em Biblioteca › *Imagem do datasheet…* (veja CATALOGOS.md).

## Componentes discretos
Catálogo › *Componentes discretos* (busque "resistor", "fusivel", "diodo"…): resistor (zigue-zague ou IEC), NTC, capacitor, eletrolítico, indutor, ferrite, fusível, diodo, zener, LED, TVS, chave, botão, lâmpada e bateria. Dois terminais (pino 1 / ânodo / + à esquerda), ligam fios como qualquer conector e acompanham giro e espelho. Propriedades › **Valor** (ex.: 120 Ω, 2 A) aparece no desenho e na BOM ("Resistor 120 Ω"); *PN do fabricante* substitui.


## Fio: ferramenta e identificação

Com a ferramenta **Fio** ligada (W), a aba Propriedades mostra os ajustes dos **próximos fios**: tipo, bitola, cor, prefixo do número, nome (opcional) e a identificação no desenho. As outras ferramentas também mostram ali a dica de uso e os ajustes que tiverem (Emenda: tipo de emenda). Esc sai da ferramenta.
Cada fio é configurável em Propriedades: **número**, **nome**, e o que aparece no desenho — *Mostrar número / nome / bitola / cor*, *Texto extra*, *Posição* (acima, abaixo ou **sem identificação**) e *Tamanho do texto*. Mudar o padrão não altera fios já desenhados. A lista de fios tem a coluna **Nome**.

## Vista frontal disponível

Conector com imagem do datasheet tem a etiqueta **VISTA** na lista da biblioteca e o botão *▣ Inserir vista frontal* em Propriedades. Sem imagem, o botão aparece como "Vista frontal: não disponível" e mostra só uma mensagem — nada é inserido no esquema.

## Emendas automáticas (bolinhas)

Conferidas ao fim de cada edição — desenhar, mover, arrastar ponta, colar, duplicar, girar, apagar — no mesmo passo de desfazer:
ponta de fio no meio de outro (inclusive fio novo passando pela ponta de um existente) ou na dobra de outro fio → o fio é dividido e recebe a emenda;
duas ou mais pontas no mesmo ponto (solto, pino ou label) → emenda; cruzamento simples e um fio só no pino → sem emenda.
Emenda automática que fica com menos de 2 fios some sozinha; emenda posta com a ferramenta Emenda nunca é removida.

## Universal — lado arredondado (v1.5.1)
Serve para qualquer padrão (MIL-DTL-38999, 5015, 24308 D-Sub, Molex, JST, Deutsch…), com contatos em letras ou números (mostra o que estiver no catálogo). Corpo com os **cantos arredondados do lado das vias** e o **lado oposto reto** (face de engate). Um chevron no meio, encostado na face reta, indica o gênero:
* **Macho (pino)**: ponta encostada na face, apontando para fora — `>` com as vias à esquerda.
* **Fêmea (soquete)**: aberto para a face, ponta para dentro — `<` com as vias à esquerda.
Escolha em *Símbolo padrão* (painel da folha) ou no campo *Símbolo* de cada conector.
**Personalização (v1.5.2)** — selecione o conector; seção *Símbolo universal* no painel de propriedades (vazio = padrão do projeto):
* Contatos: como no catálogo, **números** (1, 2, 3…) ou **letras** (A, B, C… sem I, O, Q, como MIL). Muda o nome do contato em todo o projeto (lista de fios, BOM, vista frontal).
* Preenchimento: **amarelo, branco**, sem, cinza, azul ou verde claro, ou cor livre (#hex). Contorno: vinho, preto, azul, verde, cinza ou cor livre; espessura; raio dos cantos (0 = canto vivo); cor dos números dos contatos.
* Macho/fêmea: no meio, em cima, embaixo ou oculto; tamanho do > <.
* **Aterramento embaixo**: terra, chassi/carcaça ou blindagem, no centro, do lado das vias ou do lado reto, com texto (GND, CARCAÇA, PE…).
* Mostrar/ocultar nome dos sinais e part number; referência acima ou abaixo.
* **Usar como padrão do projeto** (vale para todos sem personalização própria), **Aplicar em todos** e **Limpar**.

## Par trançado e blindagem (v1.5.3)
* **Par trançado**: mesmo nome em *Trança* (ex. TP1) em dois ou mais fios → um **"8"** cruzando os fios, com o nome ao lado. Se os fios não correm lado a lado, volta à marca em cada fio. *Exibir › Par trançado: símbolo 8 / senoide* troca o estilo.
* **Blindagem** (ferramenta Cabo, C): **elipse** tracejada atravessando os fios — arraste sobre **dois fios ou o chicote todo** e ela se ajusta sozinha (botão *Ajustar elipse aos fios* refaz) — com **ponto cheio embaixo** e o **fio de dreno** saindo dele. A ponta do dreno é um ponto de ligação: desenhe um fio dali até o pino de carcaça — na lista de fios sai **CB1:SH → J1:F**. No cabo: *Dreno* = ponto de ligação, símbolo de terra ou nenhum, e a posição do dreno ao longo do oval.
* **Identificação** (v1.5.5): no cabo, *Identificação* = com identificação (ref + PN), só a referência ou **sem identificação**; *Texto da identificação* troca CB1 por outro nome (BLINDAGEM, SH1…). Par trançado: *Exibir › Par trançado: com / sem identificação (TP1)*.

## v1.6.3
* O símbolo **Padrão** (antes "Universal") é o símbolo de conector dos projetos novos. Projetos antigos mantêm o estilo que já tinham; para trocar: painel do projeto › *Símbolo padrão*.
* **Pincel de formatação (P)** vale para qualquer item, no esquema e no físico: mesmo tipo copia todo o formato (conector: símbolo e personalização; fio; texto; cabo; ramo: capa e camada; etiqueta; acessório; nó; vista…), tipo diferente copia só a aparência (cor/traço/fonte). *Conectar pino a pino* passou para **Shift+P**.
