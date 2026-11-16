# Ramificação — traçado e manipulação dos ramos (v1.6.4)

Aba **Desenho físico › Ramificação** (também em *Ferramentas* e no painel da folha física):

| Comando | O que faz |
|---|---|
| **Traçado livre** (padrão) | Retas entre os nós e os pontos de curva, com cantos arredondados — não dá laço nem volta para trás |
| **Ângulo reto** | Só trechos horizontais/verticais, cotovelo automático; conectores saem e chegam na horizontal (ou na vertical se girados 90°) e ficam em 0/90/180/270° |
| **Curva suave** | Curva passando pelos pontos (como era antes) |
| **Levar ramo junto** | Arrastar um nó leva o ramo inteiro (tudo do lado oposto ao tronco). Sem a opção: **Ctrl+arrastar** faz o mesmo |
| **Endireitar todos** | Tira os pontos de curva de todos os ramos |

* Cada ramo pode ter traçado próprio (campo *Traçado* do ramo); escolher o modo da folha volta todos ao padrão.
* Ao arrastar um nó: em ângulo reto ele **alinha** com o vizinho (H/V); no livre ele encaixa em 0°/45°/90° (Shift solta). Alt+arrastar uma ramificação desliza no tronco. Duplo clique no ramo cria ponto de curva (vira cotovelo no modo ângulo reto).
* O conector acompanha a direção do primeiro trecho do ramo. Tudo tem Ctrl+Z.

## Fios sem capa no conector (v1.6.5)
Quando o ramo é "fios soltos" (sem capa), os fios saem **direto do conector já na ordem do ramo** e seguem **paralelos e justos** — não há mais um leque separado que cruzava com os fios cinza. O leque normal continua nos ramos com capa/espaguete.

## v1.6.8 — feixe sem capa padrão e conector sempre preso ao ramo
* **Padrão = sem capa (fios aparentes)**: cada fio na sua cor, com vão entre os fios para enxergar um a um. "Com capa" ou uma cobertura só quando escolhidos (ramo › Feixe, ou painel da folha).
* Pares trançados com fase própria por par (não viram uma "salsicha" escura).
* **Conector nunca se solta do ramo** (como o ponto de conexão do Altium Harness): se o conector for girado à mão, o ramo sai pela saída do conector, no eixo dele, pelo comprimento do leque, e faz uma curva suave até o traçado.
* Cotas de comprimento se afastam do feixe largo; a identificação do ramo fica no meio do ramo.

## v1.6.9 — feixe compacto, amarração e etiquetas
* Feixe sem capa **compacto** (largura de feixe real, fios sobrepostos como cabo redondo, os do meio por cima) e **estrangulado** onde há amarração: abraçadeira, P-clip e ilhós apertam ~40%; fita e luva da etiqueta apertam ao longo do comprimento. A abraçadeira é desenhada na largura apertada.
* **Etiqueta = só luva termo-retrátil impressa** (bandeira e luva no fio saíram; as antigas viram luva). O texto vai dentro da luva.
* **Cota da etiqueta**: da borda da etiqueta mais próxima até a borda do conector; linhas de chamada saem da borda do feixe (não cruzam o desenho); cotas de várias etiquetas ficam escalonadas acima do ramo e a cota de comprimento do ramo vai por fora delas. Campo "Distância borda da etiqueta → conector", valor customizado da cota e tolerância.
* A identificação do ramo ("15 fios · Ø…") fica num trecho livre, longe das abraçadeiras e etiquetas.

## v1.6.10 — junções do esquemático e posição dos conectores
* **Junção/emenda no meio dos fios do esquemático não vira ponto nem ramo no desenho físico**: os fios do circuito são roteados até o nó onde os conectores do circuito se encontram (a emenda fica dentro do feixe). Pontos de emenda soltos criados antes saem ao atualizar.
* **Conector novo que compartilha circuitos com 2 ou mais conectores** (ex.: derivado por junções) entra numa derivação no **meio do caminho** entre eles, do mesmo lado em que está no esquemático. Antes ia pendurado num conector.
* Geração nova: a posição relativa dos conectores segue o esquemático (esquerda/direita, cima/baixo).
* Detalhe: clicar em qualquer lugar da vista seleciona o detalhe (Delete apaga); botão direito › Excluir o detalhe.

## v1.6.11 — disposição do esquemático, amarração e desenho técnico padrão
* **Desenho físico na mesma disposição do esquemático**: conectores na posição relativa do esquemático; derivações no tronco, na altura das junções; direções do esquemático (alinhadas a 15°), comprimento digitado em escala. Automático ao gerar; para um desenho existente: Ferramentas › **Posicionar como no esquemático** (aba Desenho físico › Ramificação). A tabela de ligação desce para baixo do desenho.
* **Amarração do ramo aperta o feixe** como a abraçadeira: pontos (abraçadeira, barbante) estrangulam; costura contínua e fita apertam ao longo do ramo. Abraçadeiras da amarração com forma real.
* **Conectores em desenho técnico por padrão** (painel da folha › Conectores › Imagem do datasheet para voltar às fotos). Vistas sem desenho vetorial usam a imagem do datasheet. Linhas de centro do D-Sub curtas (não atravessam o desenho).

## v1.6.12 — gerar/atualizar respeita o esquemático
* Ao **atualizar** um desenho físico existente, se a disposição estiver contrária ao esquemático (em pé × deitado, ou lados trocados) ele é reposicionado como no esquemático; ajustes que já seguem o esquemático são mantidos.
* Pontos de ramificação que sobram (sem ramo ou na ponta de um ramo sem conector) são removidos ao gerar/atualizar.
* O desenho fica dentro das margens, abaixo do título e da lista de materiais; vistas frontais atrás de cada conector, no eixo dele.
