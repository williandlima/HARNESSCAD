# Interface — novidades (continuação de `INTERFACE2.md`)

## v1.8.7 — atualização automática
* Ao abrir pelo atalho, o **HarnessCAD.exe procura uma versão mais nova** e, se achar, pergunta "Atualizar agora?". Com
  **Sim**, instala na mesma pasta em silêncio, mantém a pasta `dados` (projetos e biblioteca) e reabre o programa.
* **Onde procura** (sem internet também funciona): um `Setup_HarnessCAD*.exe` mais novo em `Downloads`, na Área de
  Trabalho, em `Área de Trabalho\GERAL` e nas pastas listadas em `dados\atualizar.txt` (uma por linha — ex.: a pasta da
  rede `\\servidor\publico\HarnessCAD` ou o pendrive). Basta copiar o Setup novo para lá; cada PC se atualiza ao abrir.
* **Com internet**: uma vez por dia confere a versão no GitHub (no máximo 5 s; sem rede, segue normal) e baixa o
  instalador de `atualizacao/Setup_HarnessCAD.exe`.
* Opções em `dados\atualizar.txt`: `perguntar=0` (atualiza sem perguntar), `internet=0` (só pastas locais/rede).
  `HarnessCAD.exe /n` abre sem procurar.
* Esta é a última vez que é preciso rodar o Setup à mão: a partir da 1.8.7 as próximas versões chegam sozinhas.

## v1.8.8 — cotas e balão da etiqueta
* **Sem conflito de cotas**: quando duas cotas TIP. da etiqueta são estreitas (ex.: margem 10 e etiqueta 20 em escala
  pequena), o texto de uma vai antes do início e o da outra depois do fim, com a linha de cota prolongada até ele.
* **Separar cotas (editar cada uma)** — botão no painel da etiqueta: as 4 cotas viram **cotas livres**, cada uma
  selecionável e editável como as outras (texto, tolerância, afastamento, deslocar o texto, tamanho, setas, "TIP." no
  campo *Texto sob o valor*). Continuam presas aos pontos da etiqueta: mudar a folga ou o comprimento leva as cotas junto.
  Cota livre estreita passa a ter setas por fora; texto deslocado para fora ganha a linha de cota até ele.
* **Balão da etiqueta**: campo *Ponto de conexão na etiqueta* — extremidade oposta (padrão) ou do lado do conector,
  linhas da etiqueta, centro, borda de cima ou de baixo.

## v1.8.9 — cotas da etiqueta editáveis por padrão
* **Toda etiqueta já nasce com as cotas separadas** (folga, espaguete, margem, etiqueta): são cotas livres presas à
  etiqueta, cada uma editável clicando nela — texto, **tolerância + / −**, afastamento, posição do texto, tamanho,
  setas, "TIP.". Valor vazio = medido (acompanha a etiqueta). Projetos antigos são convertidos ao abrir.
* **Sem conflito entre cotas e tolerâncias**: o texto (já com a tolerância) vai no meio quando cabe; senão antes do
  início ou depois do fim, desviando dos outros textos e das linhas de chamada. A cota do ramo fica por fora da pilha.
* Painel da etiqueta: **Refazer cotas (padrão)** apaga as cotas daquela etiqueta e cria de novo.
* **Exportar DXF (Solid Edge / AutoCAD)** agora aparece na tela **Arquivo** (lista à esquerda) e na faixa **Relatórios ›
  Exportar** (antes só pela busca Ctrl+K).

## v1.9.0 — catálogo de detalhes típicos (traço detalhado)
* **Inserir › Catálogo de detalhes…** (também na faixa *Desenho físico*): janela com 4 grupos e miniatura de cada
  detalhe; **Inserir** põe o detalhe num espaço livre da folha; clique nele para customizar cotas, tolerâncias, textos,
  balões, notas em triângulo, escala (ESC 6:1…) e título; arraste para posicionar.
* **Blindagem e cordoalha**: montagem da cordoalha no adaptador (DETALHE B da casa, 3 etapas), terminação da blindagem
  com luva de solda e fio terra (M83519/2), emenda de cordoalha no ramo.
* **Preparação de fio**: decapagem (comprimento +0,5/−0, filamentos íntegros, seção do condutor), crimpagem de contato
  MIL (condutor na janela de inspeção, folga da isolação 0,25–0,76 mm, alicate M22520/1), emenda crimpada com
  termo-retrátil (M81824/1) — notas pela IPC/WHMA-A-620 e NASA-STD-8739.4; valores editáveis (confira no datasheet).
* **Conector e acessórios**: bota sobre o adaptador (lábio na ranhura, adesivo S1125), tampão de vedação nas cavidades.
* **Feixe e identificação**: amarração com barbante (espaçamento, nós), etiqueta sob espaguete transparente.
* **Traço mais rico**: trama tecida da cordoalha, fios com isolação e filamentos torcidos, termo-retrátil e luva de
  solda transparentes (anel de solda e anéis de vedação), voltas e nó do barbante, barril com indentações.
* Balões com o número da lista de materiais; o detalhe da cordoalha põe na lista o espaguete sob a cordoalha.
* **Luvas no formato do desenho do fabricante** (TE Customer Drawing D-200-02XX): tubo de parede fina hachurada que
  incha sobre cada anel interno (ombros em S) e afina entre eles; SolderSleeve com bojo maior na solda e bojos nos
  insertos; luva de vedação com dois insertos; luva externa com pontas largas e transição cônica; emenda crimpada com
  furo oculto, faixas de código de cor e janela no topo; inserto fundível; linha de centro tracejada.
* Novo: **Emenda com luva de solda** (antes e depois de aquecer), tamanhos Ø 1,7 × 26 (branco), 2,7 × 40 (vermelho),
  4,5 × 40 (azul), 6 × 40 (amarelo).
* **DETALHE B igual à prancha da casa**: proporções medidas na prancha (sanfonas escuras, espaguete com linha dupla,
  cordoalha trançada com degrau e ponta inclinada, trama em cesto, luva de solda com os 3 anéis brancos estreito/largo/
  estreito, faixa do barbante); trama recortada no contorno, sem faixas vazias. Detalhe típico fora de escala: as cotas
  5/50/60 e as tolerâncias são editáveis. Nas cotas dos detalhes o **TIP.** fica abaixo da linha de cota, como na prancha.
* Escala do detalhe limitada a 0,05–10 (valor negativo ou zero não trava mais o desenho).

## v1.9.1 — diagrama de ligação igual ao esquema com emendas e jumpers
* Cada pino aparece **uma vez** no bloco do seu conector (antes, com emendas, o J1/J2 se repetiam e os fios das
  emendas ficavam soltos).
* **Emenda** (SP1, SP2…): linha principal de um conector ao outro com o ponto e o nome da emenda, e uma barra vertical
  descendo até os pinos derivados (ex.: J1-5 → J2-5 com SP1 levando a J3-2).
* **Jumper** no mesmo conector: "U" junto ao bloco, entre os dois pinos.
* Lado de cada conector (esquerda/direita) decidido pelas ligações — não importa o sentido em que o fio foi desenhado.
* Folga entre blocos de conectores diferentes do mesmo lado (referência e PN não se encostam mais).
* Emendas que se cruzam no diagrama ficam sempre em colunas diferentes (nunca parecem ligadas), juntas perto do centro.
* Ponta sem conector (equipamento, terra) ligada numa emenda entra na mesma rede (o pino não se repete); par trançado
  com emenda mantém a trança; o dreno fica colado ao seu cabo.

## v1.9.2 — lista de fiação em texto (escrever a ligação e o esquema é desenhado)
* **Ferramentas › Lista de fiação (texto)…** (Shift+L; também um botão na janela *Conectar pino a pino*). Uma ligação
  por linha: `J1:A > J2:B, J2:C` (o A do J1 vai no B e no C do J2); `J1B > J3:D,E` (pino sem conector herda o anterior).
* Conector novo direto na lista: `J4 = D38999:13-98` (P/S no fim = macho/fêmea). Depois de `|`: bitola, cor (PR, VM,
  AZ… ou BK, RD…) e nome do sinal entre aspas — ex.: `J1:C > J2:A | 22 PR "SINAL_X"`. Comentário com `#`.
* Prévia com erro por linha (conector ou pino inexistente) antes de desenhar; ligação que já existe é pulada.
* Traçado automático: coluna própria por pino de origem com as derivações em T (emenda automática), sem encostar em
  outros fios; com pinos alinhados aos de outra rede, a saída faz um pequeno desvio.
* **Carregar do esquema** escreve a lista das ligações atuais; o texto fica salvo no projeto.
