# HarnessCAD — novidades (continuação do INTERFACE3.md)

## v1.9.4 — ordem dos pinos no esquema e novo símbolo padrão
* **Trocar o pino de posição (para evitar cruzamento de vias):** no esquema, clique no pino (na perna ou no número) —
  ele fica destacado em laranja — e use **↑/↓** para trocá-lo de lugar com o vizinho (com o conector girado, **←/→**).
  Os fios ligados acompanham o pino e se refazem limpos (retos quando os pinos ficam alinhados, ou com um só degrau),
  sem encostar em outro fio. Só muda o desenho: número, nome e ligação do pino continuam os mesmos. **Esc** solta o pino.
* Painel do conector: **Voltar à ordem dos pinos do catálogo** (aparece quando a ordem foi mudada).
* **Símbolo padrão (lado arredondado):** o número/letra do contato fica **dentro** do corpo, junto ao lado das vias, e o
  **nome da via fica fora, do outro lado** (por fora da face reta), na linha do pino correspondente. Para o arranjo antigo: painel do conector (ou padrão do
  projeto) › *Números e nomes* › "Nº fora na perna, nome dentro (antigo)".
* **Formatar o nome dos sinais:** painel do conector › *Nome dos sinais: tamanho (mm)*, *estilo* (normal, negrito, itálico,
  negrito itálico) e *cor*. Vale por conector ou para o projeto inteiro ("Usar como padrão do projeto"), vai junto em
  "Aplicar em todos" e no Pincel de formatação, e sai igual no PDF e no DXF (itálico = Helvetica-Oblique no PDF e texto
  oblíquo 15° no DXF).
* **Novo padrão visual do esquema:** conector **sem preenchimento**, contorno e pinos **pretos**, textos (referência, PN,
  números e nomes) em **2,5 mm**; fios e bolinha de emenda **pretos**; **fio novo sem identificação** no desenho (ligar
  por fio, no clique direito ou na ferramenta Fio). Desenhos já existentes mantêm as identificações dos fios; cada
  conector continua personalizável (preenchimento, cores, tamanhos).
* **Barra ativa** (como no Altium): barra flutuante no topo do desenho com as ferramentas principais da folha aberta —
  Esquema: selecionar, conector, fio, emenda, label, cabo, texto, pino a pino, lista de fiação, ERC, gerar físico;
  Físico: selecionar, derivação, cotas, balão, etiqueta, detalhe, itens da cablagem, catálogo de detalhes, atualizar,
  ERC. A ferramenta atual fica destacada; passe o mouse para ver o nome e o atalho.
* **Clique direito no esquema** (sem arrastar — arrastar com o direito continua movendo a tela): ações do item sob o
  mouse — conector (pino a pino, lista de fiação, girar, espelhar, voltar à ordem dos pinos, pincel, excluir), fio
  (mostrar/ocultar identificação, selecionar o circuito, excluir), emenda (tipo), área vazia (inserir, colar, ajustar).
* Menus de contexto legíveis no tema claro (o texto saía cinza-claro sobre branco).

## v1.9.5 — mais área de desenho, fluxo guiado, ações do item e modelos de cabo
* **Painéis automáticos** (área de desenho ~80 % maior): trilho fino de ícones na esquerda (Conectores, Fios, Emendas,
  Cabos) e na direita (Propriedades). O painel abre **flutuando** sobre o desenho e fecha ao clicar fora (Esc também);
  **Propriedades abrem sozinhas** quando há algo selecionado; tabelas de baixo recolhidas (abrem ao clicar na aba e
  recolhem ao voltar ao desenho). **📍 Alfinete** fixa o painel como antes. F9 continua (modo foco).
* **Dicas no desenho:** folha vazia mostra "Por onde começar"; dicas na barra de status das ferramentas do físico.
* **Fluxo guiado** (canto inferior esquerdo): 1 Conectores → 2 Ligações → 3 Verificar → 4 Desenho físico → 5 Lista/PDF,
  com ✓, o que falta (pontas soltas, erros do ERC…) e clique que leva à ação. ✕ oculta; volta em Exibir › Fluxo guiado.
* **Ações do item** (as mesmas do clique direito): botões no topo das Propriedades e na barra ativa, à direita.
* **Faixa:** nova aba **Esquema** (Conectores, Ligações, Cabos, Verificar); aba Desenho físico ganha o grupo Conector
  (Itens da cablagem — também em Inserir).
* **Modelos de cabo** (aba **Cabos** do catálogo, barra ativa, Inserir › Cabo do catálogo): escolher o modelo, nº de
  vias, bitola, pares trançados, blindagem, dreno e PN; **Inserir** e clicar no esquema cria as vias prontas (passo dos
  pinos), com o oval da blindagem e o dreno. **Transformar em cabo**: selecione fios › clique direito. ERC avisa nº de
  fios ≠ nº de vias. M27500, LiYCY e STP estão **aguardando datasheet** (PN digitado até chegarem os documentos).

## v1.9.6 — faixa sem repetição, nome das vias, barra recolhível, cabo direto nos pinos, dreno ligável
* **Faixa organizada:** cada ferramenta aparece em **uma aba só**. Início = edição e exibição; **Esquema** = Conectores,
  Ligações, Cabos, Desenho e Verificar; Desenho físico (contextual) = tudo da cablagem. Nada sumiu: tudo continua nos
  menus e na busca (Ctrl+K).
* **Nome das vias** (tecla **N**, faixa Esquema › Conectores, barra ativa, clique direito do conector): clique no pino e
  digite o nome do sinal (ex.: VCC). **Enter** grava e passa ao pino de baixo, **↑** volta, **Esc** sai. O nome vai
  também para o pino da **outra ponta da mesma via** (inclusive passando por emendas). **Tabela de nomes das vias:** todos
  os pinos do conector numa janela; aceita colar uma coluna do Excel ou linhas "pino [TAB] nome". Um Ctrl+Z desfaz.
* **Barra ativa recolhível:** botão **«** no início da barra recolhe para um ☰ no canto (mais espaço para o desenho);
  clique no ☰ para mostrar de novo. O fluxo guiado também recolhe (« deixa só a próxima etapa). O estado fica gravado.
* **Cabo nos pinos** (faixa Esquema › Cabos, barra ativa, clique direito): escolha o modelo e digite **De** `J1:1,2` e
  **Para** `J2:1,2` — ou clique em **Escolher clicando nos pinos** (pinos de origem, Enter, pinos de destino, Enter). As
  vias são traçadas sem curto, um pino para um, e o cabo já nasce com o oval da blindagem, pares trançados na ordem,
  bitola e PN. **Dreno no pino** (ex.: `J1:9`) liga o dreno da blindagem a esse pino.
* **Dreno da blindagem aceita fio:** a ferramenta Fio encaixa e termina no ponto do dreno; a ligação aparece nas listas
  (CB1:SH).

## v1.9.7 — ligação em pino já ligado, tudo editável, comprimento ⇄ físico com %, ícones novos
* **Lista de ligação:** agora liga em pino que **já tem fio** (ex.: `J3:A > J1:A` com J1:A já ligado a J2:A) e
  conector novo (`J4 = PEÇA`) em pinos ocupados. A via nova deriva do fio existente (T com a bolinha); se não houver
  caminho livre, liga por **label de circuito** com nome único nas duas pontas. Nunca fica curto.
* **Barra de ferramentas móvel:** arraste pela alça **⋮⋮**; a posição fica gravada (duplo clique na alça volta ao topo).
* **Ícones novos com o nome embaixo** (conector, fio, emenda, label, nomes, cabo, blindagem, pino a pino, lista, ERC…),
  iguais na faixa e na barra.
* **Ferramentas do item à mão:** com um item selecionado, a barra mostra **"Editar conector J1"** (fio, cabo…) com
  as ações dele — Renomear, Posição, Comprimento e % a mais, Nomes das vias, Girar, Espelhar, Excluir…
* **Tudo editável:** duplo clique no desenho edita no lugar — no **pino** = nome da via; no **conector/emenda/cabo** =
  referência; no **fio** = número (Tab: nome do circuito); no **label/texto** = texto. Propriedades com **Posição X/Y**
  (os fios acompanham).
* **Comprimento no esquema, sincronizado com o físico:** fio e cabo têm **Comprimento (mm)** nas Propriedades e na
  Lista de fios. Digitar no esquema ajusta o ramo do desenho físico (os fios do mesmo ramo acompanham); mudar o ramo no
  físico muda o esquema. **% a mais** (perda em trançados) por fio ou por cabo, com a % padrão no topo da Lista de fios;
  coluna **Corte (mm)** = comprimento × (1 + %). A lista de materiais usa a % de cada um.
* **Botões revisados** (auditoria automática `ferramentas/dev/auditar_botoes.js`): Catálogo e Propriedades da faixa
  voltaram a abrir o painel no modo automático; "Estilo dos símbolos" abre o painel no campo certo; Copiar avisa.

## v1.9.8 — "Por onde começar" some com um clique
* O quadro de dicas **"Por onde começar"** da folha vazia desaparece no primeiro clique no desenho e não volta mais
  durante o uso (o fluxo guiado embaixo continua, e também pode ser recolhido ou fechado).
