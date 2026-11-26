# HarnessCAD — novidades da interface (parte 5)

Continuação de `INTERFACE4.md`.

## v1.9.11 — biblioteca só com o que tem datasheet; catálogo por família
* O catálogo agora tem **só as famílias com vista frontal e desenho tirados do datasheet oficial** — as que a empresa usa:
  **D38999** (53 arranjos; estilos /26 plugue, /20 flange, /24 porca), **MS3470/MS3471/MS3474/MS3476** (34 arranjos),
  **D-Sub** (M24308, comercial e combinado) e **M80 Harwin** (18). Equipamentos e componentes discretos continuam.
  As demais saíram do catálogo, da pesquisa e da lista de fiação (projeto antigo que usa uma delas continua abrindo e
  mostra "FORA DA BIBLIOTECA" nas Propriedades). D38999 herméticos (/21 /23 /25 /27) saíram até chegar o datasheet.
* Cada peça mostra os selos **VISTA ✓** e **DESENHO ✓**; cada família diz de onde vêm a vista e o desenho.
* Filtro por **família** (no lugar de Militar/Comercial) e pesquisa por arranjo (`13-35`), nº de vias (`9 vias`) e apelidos
  (`db25`, `3476`, `harwin`, `38999 15-19`) — o mais parecido vem primeiro.

## v1.9.12 — melhorias da revisão (1º lote)
* **Desenho físico:** escala **Automática** (padrão ao gerar): a maior escala da norma em que o chicote cabe na área
  livre — acima da lista de materiais e do diagrama — sem um conector encostar no outro; chicote centralizado e nunca
  fora da moldura; vistas frontais (VISTA A/B/C) em fila sem cair em cima das tabelas. **Traço preto** (antes azul).
* **Esquema:** pino livre **sem a bolinha** de ponta solta (liga em Exibir › Marcar pinos livres); **Ocultar pinos sem uso /
  Mostrar todos** nas ações do conector; **Número dos fios na impressão** (Exibir) — tela limpa, PDF/DXF com o nº.
  Conector novo da lista de fiação nasce **num lugar livre dentro da área útil** (não cai mais no carimbo).
* **Tela:** "Ajustar" deixa a folha **entre a barra ativa e o fluxo guiado**; faixa que não cabe fica compacta (nada cortado —
  a aba Desenho físico mostra agora todos os grupos, inclusive "Padrão da casa").
* **Relatórios de produção:** **Lista de corte e montagem** (por fio: De/Para, contato e decapagem de cada ponta, fio, compr.,
  % a mais e corte) e **Lista de teste de continuidade** (ponto a ponto por circuito) — no PDF (seções) e em CSV
  (Arquivo / Relatórios › Exportar).
* Mantido o seu padrão: textos do conector em **2,5 mm** (a sugestão de referência 3,5 mm não foi aplicada).

## v1.9.13 — medida entre conectores no esquemático
* **Como colocar:** tecla **D** (ou barra ativa › **Medida**): clique no conector A, no conector B, clique onde fica a linha
  de cota e digite os mm. Ou clique direito no conector › **Medida até outro conector…** (escolhe o outro e digita).
* A medida é o comprimento do chicote entre os dois: os fios entre eles passam a ter essa medida (+ folgas) e, ao gerar o
  desenho físico, o ramo nasce com ela. **Com o físico já feito, fica sincronizado:** mudar a medida no esquema muda o
  ramo no físico, e mudar o ramo no físico muda a medida do esquema (Ctrl+Z desfaz). Cota em preto, texto 2,5 mm.
* Derivação (B) continua sendo do desenho físico.
