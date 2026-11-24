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
   **Comprimentos (fios, cabos, ramos) só no físico.** Periférico não se define no esquema (o campo antigo "Backshell" do conector só aparece se já tiver valor e é levado
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
  `wiretext2.js` (traçado em barramento, `HX.wtApply`), `ui_wirelist.js` (janela, Shift+L).
- Peça do usuário fora do catálogo (bota/backshell…): `ui_dsimg.js` + `ui_dsimg2.js` (diálogo) e `phys_userpart.js`
  (PN, fabricante, características, vínculo família/carcaça → `HX.PDS['u_<id>']`).
- Customização da cablagem: `phys_hitems.js` (alças `HX.HGRP`, aplicações `HX.HUSE`, itens do usuário 'USR:ITEM'),
  `phys_hitems3.js` (catálogo por alça, tamanhos dos datasheets), `phys_hitems2.js` (aplicar, `acc`, PN do adaptador/bota,
  lista de materiais, vínculo, trava de apagar), `ui_hitems*.js` (janela com alças, painel do conector, tabela).
- Catálogo de detalhes típicos (item `pdetc`): `phys_detl*.js` (primitivas de traço detalhado `HX.DL`), `phys_detc.js`
  (registro `HX.DETC`, balões pela lista), `phys_detc1..3.js` (detalhes por grupo), `ui_detc.js` (janela). Detalhe novo:
  registrar em `HX.DETC[kind]` com `ref` (norma/datasheet).
- `server/` — servidor Python (`server.py`) e Java equivalente. `dados/` — dados do usuário (não versionar).
- Documentação do usuário: `README.md`, `INTERFACE.md` + `INTERFACE2.md` + `INTERFACE3.md` (novidades por versão; novas seções no 3), `CUSTOMIZACAO.md`, `RAMIFICACAO.md`…

## Testes
- `node tests/run_tests.js` — tem que terminar com `N passaram, 0 falharam`. Testes novos: `tests/test_*.js` e um
  `require` em `tests/run_tests.js`.
- Verificar sintaxe de arquivo editado: `node -e "new (require('vm').Script)(require('fs').readFileSync('web/js/X.js','utf8'))"`.
- Cuidado: comentário `//` no meio de uma linha já quebrou o código; prefira `/* */`.
- Visual (dev): `ferramentas/dev/render_conector.py "D38999:25-35|26||boot_s" line pfx` (Playwright) gera PNG em `/tmp`.

## Versão
- `HX.VERSION` em `web/js/core.js`; a cada entrega, subir a versão e acrescentar a seção em `INTERFACE3.md`. Medidas de datasheet estudadas: `docs/datasheets/`.

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
- PN da luva de solda; dados de transição T/4 vias; significado da marca "~"; convenção macho/fêmea (chevron).
- Vetorizar as demais figuras de datasheet (`ferramentas/vetorizar.py`, requer numpy/scipy/scikit-image/Pillow no dev).
