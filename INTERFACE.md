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
