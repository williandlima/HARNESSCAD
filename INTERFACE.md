# Interface (v1.5)

Visual no padrão dos CADs de cablagem (E3.series, Capital, SolidWorks Electrical).

## Faixa de opções (ribbon)
* **Arquivo** abre a tela de arquivo: novo, abrir, salvar, importar/exportar, PDF, página/carimbo, backups.
* **Início**: área de transferência, desenhar (fio, emenda, label, cabo, formas), transformar, pincel, grade, exibir, ERC/PDF e painéis.
* **Inserir · Editar · Exibir · Ferramentas · Relatórios · Ajuda**: todos os comandos dos antigos menus, com ícone e nome.
* **Desenho físico** (aba laranja): aparece sozinha ao entrar numa folha física — cota, derivação, detalhe, etiqueta, alinhar/distribuir e gerar.
* Barra de acesso rápido (salvar, desfazer, refazer) ao lado do nome.
* **Duplo clique numa aba** recolhe/expande a faixa (mais área de desenho). Em telas de 1366 px os botões pequenos ficam só com ícone (o nome aparece ao parar o mouse).

## Busca de comandos — Ctrl+K
Digite parte do nome: `bom`, `pdf`, `renumerar`, `J1`, `W12`. Mostra comandos (com atalho), tabelas e itens do projeto; Enter executa ou leva até o item no desenho. Aceita palavras sem acento.

## Tela inicial
Abre ao iniciar: novo projeto, abrir do servidor, importar .json, recuperar rascunho e **Recentes** (projetos abertos/salvos no servidor). Esc ou "Voltar ao desenho" fecha.

## Grade de propriedades
Painel direito em duas colunas (propriedade | valor), com categorias recolhíveis (o estado fica lembrado) e **filtro** para achar uma propriedade.

## Tema claro / escuro
Botão da lua no topo, em Exibir › Aparência ou na tela inicial. A escolha fica salva no navegador.

## v1.6.13 — teclado voltando a funcionar
* Corrigido: depois de um diálogo que abria outro (ex.: gerar o desenho físico → avisos), o diálogo antigo continuava "segurando" o teclado e **Del, R, X, Y, setas e demais atalhos paravam** até recarregar a página. Agora cada diálogo só segura o teclado enquanto está aberto, e o segundo diálogo não some mais.

## v1.6.15 — pino a pino em conectores de muitas vias
* **Pino a pino com 39 vias (MIL 38999/26482)**: minúscula e maiúscula são pinos diferentes (a ≠ A). Antes o "a" ligava no "A", o "b" no "B"… e os fios subiam em escada, deixando os pinos minúsculos sem ligação. Agora casa exato primeiro; sem diferenciar maiúscula/minúscula só no que sobrar e sem ambiguidade.
* Se os dois conectores têm os pinos virados para o mesmo lado, o que ainda não tem fio é **espelhado** para ficar de frente: fios retos, sem contornar por baixo da folha.
* Cota livre e Balão em qualquer item também na aba **Inserir › Desenho físico**.

## v1.6.16 — desenho dos conectores em traço de catálogo (padrão Altium Harness)
* Todas as famílias passaram a ser desenhadas como **desenho técnico de fabricante**, nítido em qualquer zoom e no PDF:
  rosca com perfil em dente nas bordas e filetes inclinados, porca recartilhada com serrilha, porca sextavada com faces e
  furos de frenagem, flange com furos ocultos tracejados, anel de vedação, faixas de cor (vermelha/azul no D38999),
  linha de centro traço-ponto.
* **D38999 / MS**: plugue (porca de acoplamento), receptáculo porca de painel (jam nut — como a figura de referência),
  flange de parede, em linha; alívio de tensão com braçadeira e parafusos de fenda; bota com nervuras.
* **Comerciais**: M8/M12/M23 (recartilhado, corpo com sulcos, bota com nervuras), BNC/TNC (baioneta com rasgo em L e
  sextavado), DT/AT/Superseal (trava, cunha laranja, anéis de vedação), Micro-Fit/JST (rampa de trava, janelas e
  terminais), borne MSTB (parafusos de fenda), Han (capô, alavanca, prensa-cabo PG), XLR (botão de trava), RJ45
  (lingueta), USB (carcaça metálica), terminal olhal (anilha e marcas de crimpagem).
* Modo **traço** = só contorno na cor da caneta; modo **cor** = metal com brilho, borracha escura e as faixas coloridas.
* A foto do datasheet continua disponível: propriedades da folha › Conectores › Desenho = "Imagem do datasheet" (ou por conector, em Desenho do conector).

## v1.6.17 — plugue circular igual ao catálogo
* D38999/26 e MS plugue: nariz com degraus, porca de acoplamento com recartilhado em 4 quadrantes (faixa lisa no meio e
  faixa fresada vertical de pontas arredondadas), rosca traseira com dentes de catraca na face, como no desenho Amphenol.

## v1.6.18 — figura do datasheet vetorizada (sem perda de qualidade)
* O plugue D38999/26 usa a **própria figura do catálogo** (porca com estrias axiais e faixas lisas, rosca, catraca),
  convertida traço a traço em linhas: igual ao datasheet, nítida em qualquer zoom/PDF e na cor da caneta.
* Vista frontal 25-35 (128 contatos) também vetorizada da figura do catálogo, com os números.
* Ferramenta: ferramentas/vetorizar.py + vetorizar_js.py para converter outras figuras do datasheet.

## v1.6.19 — servidor, salvar e transferência mais seguros
* **Salvar como** com um nome que já existe no servidor agora pergunta antes de substituir (o projeto antigo fica nos backups).
* Abrir do servidor um arquivo que não é projeto não "troca" mais o nome do projeto aberto (o Ctrl+S seguinte não sobrescreve o arquivo errado).
* Erros ao excluir (sem permissão) e ao sobrescrever depois de um conflito agora aparecem na tela.
* Servidor 1.2.0 (Python e Java): backups de `CAB` não se misturam mais com os de `CAB__v2`; nomes reservados do Windows
  (CON, NUL, COM1…) são recusados; o Java não aceita mais JSON inválido na biblioteca (um item ruim derrubava a biblioteca de todos).
* Pacote de transferência: não leva mais a pasta `.git` nem os dados de `dados\` (cerca de 60% menor); o `.sha256` tem o hash
  de **todas** as partes (continua em `.sha256-2.txt`… se preciso), então o montar aponta exatamente qual recopiar; aceita mais de 999 partes.

## v1.7.0 — prancha no padrão da casa e desenhos dos datasheets oficiais
* **Diagrama de ligação** como nas pranchas: bloco de cada conector com cantos arredondados, nº do pino dentro, sinal
  fora, referência em cima e PN embaixo; par do cabo com o símbolo de trança e o dreno até o seu pino; cor/bitola só
  nas exceções e a nota "TODOS OS CABOS SÃO BITOLA xx AWG". Formato antigo: propriedades da tabela › Formato.
* **Lista de materiais** sobre o carimbo, item 1 embaixo, QTD com unidade ("2.800 mm"), descrição em maiúsculas e código.
* Modelos de traço: **feixe em linhas finas**, **balões em cadeia** com seta, **vistas frontais numa faixa** com
  "VISTA A/B" e a seta com a letra no conector, **etiquetas de identificação** (P3, J3…) no feixe, sem o título no topo.
* **Desenhos dos datasheets oficiais vetorizados**: D38999 /24, /20, TV01 (Amphenol), alívio de tensão e botas reta/90°
  (Glenair) e as **53 vistas frontais** do D38999 — iguais ao catálogo e nítidos no PDF.
* **Harwin Datamate L-Tek (M80)** no catálogo, desenhada pela figura oficial (lado dos terminais voltado para o cabo).

## v1.7.1 — exportação DXF (Solid Edge / AutoCAD)
* **Arquivo › Exportar DXF (Solid Edge / AutoCAD)…**: folha atual ou todas (um arquivo por folha), tudo em preto ou nas
  cores do desenho. DXF R12 em mm, escala 1:1 da folha, com moldura e carimbo — o mesmo desenho do PDF.
* No Solid Edge: Arquivo › Abrir › escolha o .dxf e salve como .dft. Camadas FINO / MEDIO / GROSSO (espessura do traço),
  TEXTO e PREENCHIMENTO; tracejado e traço-ponto como tipos de linha; acentos, Ø e — preservados.
* Cotas, balões e tabelas chegam como linhas e textos (não como objetos nativos do Solid Edge); fundos brancos e
  imagens raster não vão para o DXF.
