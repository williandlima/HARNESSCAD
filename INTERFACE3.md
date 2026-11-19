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

## v1.9.0 — detalhe típico da montagem da cordoalha
* **Inserir › Detalhe típico: montagem da cordoalha** (também na faixa *Desenho físico › Chicote*): o "DETALHE B" da
  casa em traço, em 3 etapas — (1) cabo com o espaguete sobre os fios e a cordoalha recuada, cotas 5 ±1 TIP.,
  50 ±1 TIP. e 60 ±5; (2) cordoalha do adaptador (REF), barbante amarrando e a cordoalha da cablagem vestida (REF);
  (3) luva de solda unindo as duas cordoalhas. Entra num espaço livre da folha; arraste para posicionar.
* Balões com o número da lista de materiais (espaguete, adaptador, barbante, cordoalha, luva de solda) ou número
  digitado; notas em triângulo opcionais; cotas, tolerâncias, Ø do cabo, escala e título editáveis.
* Lista de materiais: **espaguete termo-retrátil sob a cordoalha** = comprimento (60) × pontas com adaptador.
