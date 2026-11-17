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
- Conector/acessório/vista frontal tem que ser **exatamente como o datasheet oficial, nas mesmas proporções**. Sem
  datasheet: sai o contorno tracejado "AGUARDANDO DATASHEET" (`phys_tecnico.js`) e **pede-se o datasheet ao usuário**.
- Desenho novo tirado de datasheet: registrar em `HX.DS_OK` (`phys_tecnico.js`: `OKV` peças, `OKF` famílias).
  Os desenhos típicos antigos ficam em `HX.PHYS_VEC_TIPICO` (só os testes `[modo antigo]` os usam).

## Estrutura
- `web/index.html` carrega os scripts **em ordem**; `tests/lib.js` tem a lista `FILES` na mesma ordem — todo arquivo
  novo de `web/js` entra nos dois lugares.
- Namespace global `HX`. Padrão de extensão: wrapper/override (`var f0 = HX.fn; HX.fn = function(){ … f0.apply(this, arguments) }`).
- Itens do desenho: `HX.ITEM_EXT[tipo] = {draw, bbox, hit, fields}`. Físico: `pnode`, `pseg`, `pacc`, `ptag`, `pball`,
  `pdim`, `pdimx`, `ptable`, `pface`, `pdetail`.
- Desenho dos conectores (vetorial): `phys_vec.js` (peças `HX.PHYS_VEC`), `phys_vecart*.js` (traço de catálogo),
  `phys_com*.js` (comerciais), `phys_vecimg.js` + `vimg_*.js` (figuras de datasheet vetorizadas).
- Padrão das pranchas da casa (modelos de traço): `phys_table2.js` (diagrama de ligação), `phys_table3.js` (lista de
  materiais sobre o carimbo), `phys_lines.js` (feixe em linhas), `phys_ball2.js` (balões em cadeia), `phys_face3.js`
  (faixa de vistas, VISTA A/B, etiquetas automáticas). Folha: `wstyle`/`bstyle`/`bundleLook`/`ballStyle` voltam ao antigo.
- Vistas frontais oficiais vetorizadas: `vimg_f<arranjo>N.js`, carregadas por `vimg_faces.js` (lista única; o
  `index.html` tem só o carregador e `tests/lib.js` lista os arquivos). Regerar: `ferramentas/vetorizar.py` (opções
  no cabeçalho) + `vetorizar_js.py`.
- `server/` — servidor Python (`server.py`) e Java equivalente. `dados/` — dados do usuário (não versionar).
- Documentação do usuário: `README.md`, `INTERFACE.md` + `INTERFACE2.md` (novidades por versão; novas seções no 2), `CUSTOMIZACAO.md`, `RAMIFICACAO.md`…

## Testes
- `node tests/run_tests.js` — tem que terminar com `N passaram, 0 falharam`. Testes novos: `tests/test_*.js` e um
  `require` em `tests/run_tests.js`.
- Verificar sintaxe de arquivo editado: `node -e "new (require('vm').Script)(require('fs').readFileSync('web/js/X.js','utf8'))"`.
- Cuidado: comentário `//` no meio de uma linha já quebrou o código; prefira `/* */`.
- Visual (dev): `ferramentas/dev/render_conector.py "D38999:25-35|26||boot_s" line pfx` (Playwright) gera PNG em `/tmp`.

## Versão
- `HX.VERSION` em `web/js/core.js`; a cada entrega, subir a versão e acrescentar a seção em `INTERFACE2.md`. Medidas de datasheet estudadas: `docs/datasheets/`.

## Empacotamento / entrega (a partir da raiz do repositório)
1. `python3 ferramentas/pacote/empacotar.py` → `../HarnessCAD.zip` (sem os PNG de `web/img`, que já vão em `web/js/imgpack`).
2. `python3 ferramentas/dividir.py ../HarnessCAD.zip ../HarnessCAD_4k --tam 3900`
3. `python3 ferramentas/pacote/lotes.py ../HarnessCAD_4k ..` → `HarnessCAD_lote1de4.zip` … `4de4`
4. `sh ferramentas/pacote/testar_montagem.sh ../HarnessCAD_4k` (confere a remontagem)
5. Instalador: `instalador/compilar.sh` (mingw-w64 i686) → `Setup_HarnessCAD.exe`.

## Instalação no PC de casa do usuário
Preferência permanente: quando houver nova versão e o PC "willian" estiver conectado, atualizar
`C:\Users\willi\HarnessCAD` sem perguntar, **preservando `dados\`**, e deixar instalador e lotes em
`C:\Users\willi\Desktop\GERAL`.

## Pendências conhecidas (aguardando dados do usuário)
- Datasheet do adaptador de cordoalha (candidato: M85049/88-25W02/W03 + cinta AS85049/128 para D38999/26 tamanho 25).
- PN da luva de solda; dados de transição T/4 vias; significado da marca "~"; convenção macho/fêmea (chevron).
- Vetorizar as demais figuras de datasheet (`ferramentas/vetorizar.py`, requer numpy/scipy/scikit-image/Pillow no dev).
