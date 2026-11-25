# HarnessCAD — instruções para o Claude Code

Editor de esquemas elétricos e desenho físico de cablagens (chicotes) que roda no navegador, para a intranet da empresa.
Responda sempre em **português**.

## Restrições do ambiente de destino (não negociáveis)
- PC da empresa: **Windows 7, sem internet**, navegador Edge/Chrome, **Python 3.8 só biblioteca padrão** (ou Java 8).
- **Nenhuma biblioteca externa** no programa: HTML + CSS + JavaScript puro (ES5/ES2015 simples), PDF gerado pelo próprio código.
- **Todo arquivo-fonte < 10.000 bytes** (o teste verifica; `.exe`, `.ico` e `.png` são exceção). Se um arquivo crescer,
  divida em `nome2.js`, `nome3.js`… e registre na ordem certa.
- A transferência para a rede é feita em partes de ≤ 3.900 bytes (ver Empacotamento).

## Padrão de desenho (decisão do usuário, permanente)
- **Só desenho técnico em traço (padrão Altium)** — nada de imagens/fotos realistas nem desenho "típico".
- **Traço rico e fiel ao real** (decisão nov/2026): detalhes caprichados — trama da cordoalha, filamentos, anéis da luva,
  nós — sempre em traço (sai no PDF e no DXF), nunca foto/sombreado em tons.
- Conector/acessório/vista frontal tem que ser **exatamente como o datasheet oficial, nas mesmas proporções**. Sem
  datasheet: sai o contorno tracejado "AGUARDANDO DATASHEET" (`phys_tecnico.js`) e **pede-se o datasheet ao usuário**.
- Desenho novo tirado de datasheet: registrar em `HX.DS_OK` (`phys_tecnico.js`: `OKV` peças, `OKF` famílias).
  Os desenhos típicos antigos ficam em `HX.PHYS_VEC_TIPICO` (só os testes `[modo antigo]` os usam).

## Regras de funcionamento (fluxo de trabalho do usuário, permanente)
1. **Esquema elétrico = fase de DEFINIÇÃO do projeto**: conectores (família, arranjo, gênero, variante), contatos,
   fios (tipo, bitola, cor), emendas, equipamentos — tudo o que é pertinente ao esquema.
2. **Cablagem física = fase de CUSTOMIZAÇÃO**: periféricos e itens implementados na cablagem — adaptador, bota,
   backshell, cordoalha, luva de solda, barbante, etiquetas/espaguete, coberturas, transições, cotas, vistas, lista.
   **Comprimento do fio/cabo: esquema ⇄ físico sincronizados** (`wirelen.js`: editar no esquema muda o ramo; % a mais por fio/cabo). Periférico não se define no esquema (o campo antigo "Backshell" do conector só aparece se já tiver valor e é levado
   ao nó físico ao gerar).

## Estrutura
- `web/index.html` carrega os scripts **em ordem**; `tests/lib.js` tem a lista `FILES` na mesma ordem — todo arquivo
  novo de `web/js` entra nos dois lugares. O `index.html` está no limite: arquivo novo entra na lista do carregador
  `web/js/ui_mais.js` (último script) e, se não for `ui_*`, no fim de `FILES`.
- Namespace global `HX`. Padrão de extensão: wrapper/override (`var f0 = HX.fn; HX.fn = function(){ … f0.apply(this, arguments) }`).
- Itens do desenho: `HX.ITEM_EXT[tipo] = {draw, bbox, hit, fields}`. Físico: `pnode`, `pseg`, `pacc`, `ptag`, `pball`,
  `pdim`, `pdimx`, `ptable`, `pface`, `pdetail`.
- Desenho dos conectores (vetorial): `phys_vec.js` (peças `HX.PHYS_VEC`), `phys_vecart*.js` (traço de catálogo),
  `phys_com*.js` (comerciais), `phys_vecimg.js` + `vimg_*.js` (figuras de datasheet vetorizadas).
- Padrão das pranchas da casa (modelos de traço): `phys_table2.js` + `phys_table4.js` (dados: pinos, emendas, jumpers,
  lado dos conectores) + `phys_table5.js` (desenho) do diagrama de ligação, `phys_table3.js` (lista de
  materiais sobre o carimbo), `phys_lines.js` (feixe em linhas), `phys_ball2.js` (balões em cadeia), `phys_face3.js`
  (faixa de vistas, VISTA A/B, etiquetas automáticas). Folha: `wstyle`/`bstyle`/`bundleLook`/`ballStyle` voltam ao antigo.
- Vistas frontais oficiais vetorizadas: `vimg_f<arranjo>N.js`, carregadas por `vimg_faces.js` (lista única; o
  `index.html` tem só o carregador e `tests/lib.js` lista os arquivos). Regerar: `ferramentas/vetorizar.py` (opções
  no cabeçalho) + `vetorizar_js.py`.
- Lista de fiação em texto (`J1:A > J2:B, J2:C` → esquema): `wiretext.js` (leitura, `HX.wtParse`, `HX.wtFromDoc`),
  `wiretext2.js` (roteador `HX.wtRouter`: caminho livre, contorno), `wiretext3.js` (`HX.wtApply`: barramento,
  conferência das redes a cada ligação — desfaz o que daria curto), `ui_wirelist.js` (janela, Shift+L).
- Emendas pelo datasheet TE (só fonte oficial): `cat_splice.js` (séries `HX.SPLICE_LIB`, CMA, série padrão por tipo),
  `splice_tab.js` (tabelas A/B/C transcritas do PDF), `splice_sel.js` (PN pelas bitolas, lista de materiais, ERC), `ui_splice.js` (painel).
- Ordem dos pinos no esquema: `pinorder.js` (`HX.pinMove` troca com o vizinho e leva os fios, `HX.pinOrderReset`,
  `HX.pinAt`), `ui_pinorder.js` (clique no pino + setas). Símbolo padrão `univ` (`symbols4.js`): nº dentro, nome fora (`uNumPos`).
- Interface tipo Altium: `ui_active.js` (barra ativa no topo do desenho por tipo de folha + menu de contexto do esquema;
  o do físico é `ui_phys6.js`). Padrão visual: `symbols4.js` (preto, sem preenchimento, 2,5 mm), `HX.THEME.wire` preto,
  fio novo com `lblPos: 'n'` (`edit2.js`).
- Interface (v1.9.5): `ui_layout2.js` (painéis automáticos/trilhos, alfinete), `ui_flow.js` (dicas na folha vazia e fluxo
  guiado `HX.flowState`), `ui_actions.js` (`HX.itemActions`/`HX.selActions`: clique direito, topo das Propriedades e barra
  ativa; aba Esquema da faixa). Cabos: `cat_cable.js` (`HX.CABLE_LIB`, `HX.cableInsert`, `HX.cableApply`, ERC de vias),
  `ui_cable.js` (aba Cabos, janela), `cat_cable2.js` (`HX.cablePins`: cabo direto nos pinos De/Para + dreno no pino) e
  `ui_cable2.js` (janela "Cabo nos pinos", escolher clicando). M27500/LiYCY/STP aguardando datasheet. Dreno = ponto de
  ligação (`HX.connPoints` em `geom.js`).
- Nome das vias (sinal no pino, leva à outra ponta pela netlist): `pinname.js` (`HX.pinNameSet`, `HX.pinNamesBulk`,
  `HX.pinNamesParse`), `ui_pinname.js` (tecla N, caixa sobre o pino, tabela). Faixa: `ui_ribbon_def.js` — cada ferramenta
  em UMA aba só (`HX.ribbonKey`). v1.9.7: `wiretext4.js`+`wiretext5.js` (pino já ligado: derivação, pente, contorno), `ui_active2.js`
  (barra móvel, nome nos ícones, grupo Editar), `ui_icons2.js`, `ui_edit3.js` (duplo clique, Posição), `ui_wirelen.js`, `ui_cabspec.js` (bitola do cabo).
  Auditoria de botões: `ferramentas/dev/auditar_botoes.js`.
- Peça do usuário fora do catálogo (bota/backshell…): `ui_dsimg.js` + `ui_dsimg2.js` (diálogo) e `phys_userpart.js`
  (PN, fabricante, características, vínculo família/carcaça → `HX.PDS['u_<id>']`).
- Customização da cablagem: `phys_hitems.js` (alças `HX.HGRP`, aplicações `HX.HUSE`, itens do usuário 'USR:ITEM'),
  `phys_hitems3.js` (catálogo por alça, tamanhos dos datasheets), `phys_hitems2.js` (aplicar, `acc`, PN do adaptador/bota,
  lista de materiais, vínculo, trava de apagar), `ui_hitems*.js` (janela com alças, painel do conector, tabela).
- Catálogo de detalhes típicos (item `pdetc`): `phys_detl*.js` (primitivas de traço detalhado `HX.DL`), `phys_detc.js`
  (registro `HX.DETC`, balões pela lista), `phys_detc1..3.js` (detalhes por grupo), `ui_detc.js` (janela). Detalhe novo:
  registrar em `HX.DETC[kind]` com `ref` (norma/datasheet).
- `server/` — servidor Python (`server.py`) e Java equivalente. `dados/` — dados do usuário (não versionar).
- Documentação do usuário: `README.md`, `INTERFACE.md` + `INTERFACE2.md` + `INTERFACE3.md` + `INTERFACE4.md` (novidades por versão; novas seções no 4), `CUSTOMIZACAO.md`, `RAMIFICACAO.md`…

## Testes
- `node tests/run_tests.js` — tem que terminar com `N passaram, 0 falharam`. Testes novos: `tests/test_*.js` e um
  `require` em `tests/run_tests.js`.
- Verificar sintaxe de arquivo editado: `node -e "new (require('vm').Script)(require('fs').readFileSync('web/js/X.js','utf8'))"`.
- Cuidado: comentário `//` no meio de uma linha já quebrou o código; prefira `/* */`.
- Visual (dev): `ferramentas/dev/render_conector.py "D38999:25-35|26||boot_s" line pfx` (Playwright) gera PNG em `/tmp`.

## Versão
- `HX.VERSION` em `web/js/core.js`; a cada entrega, subir a versão e acrescentar a seção em `INTERFACE4.md`. Medidas de datasheet estudadas: `docs/datasheets/`.

## Empacotamento / entrega (a partir da raiz do repositório)
1. `python3 ferramentas/pacote/empacotar.py` → `../HarnessCAD.zip` (sem os PNG de `web/img`, que já vão em `web/js/imgpack`).
2. `python3 ferramentas/dividir.py ../HarnessCAD.zip ../HarnessCAD_4k --tam 3900`
3. `python3 ferramentas/pacote/lotes.py ../HarnessCAD_4k ..` → `HarnessCAD_lote1de4.zip` … `4de4`
4. `sh ferramentas/pacote/testar_montagem.sh ../HarnessCAD_4k` (confere a remontagem)
5. Instalador: `instalador/compilar.sh` (mingw-w64 i686) → `Setup_HarnessCAD.exe` + cópia em `atualizacao/` (commitar:
   é de lá que o HarnessCAD.exe se atualiza pela internet — `instalador/atualiza.c`).

## Instalação no PC de casa do usuário
Preferência permanente: quando houver nova versão e o PC "willian" estiver conectado, atualizar
`C:\Users\willi\HarnessCAD` sem perguntar, **preservando `dados\`**, e deixar instalador e lotes em
`C:\Users\willi\Desktop\GERAL`.

## Pendências conhecidas (aguardando dados do usuário)
- **Roteiro da biblioteca 100%**: `docs/PLANO_BIBLIOTECA_100.md` (passos 0–10, critério de pronto por tipo de item).
- Adaptador de cordoalha = Amphenol Pre-Shield M85049/109 (J) / /115 (L) — feito (`phys_preshield.js`). Faltam: vistas frontais
  MS3476, MS26482/MS5015 (desenho e adaptador), perfil exato da bota 202K (cotas R/U/Y/HW/JW já em `docs/datasheets/`).
- Datasheets de cabo: folha MIL-DTL-27500 e datasheets LiYCY/STP usados (para o construtor de PN e os modelos).
- PN da luva de solda; dados de transição T/4 vias; significado da marca "~"; convenção macho/fêmea (chevron).
- Vetorizar as demais figuras de datasheet (`ferramentas/vetorizar.py`).
