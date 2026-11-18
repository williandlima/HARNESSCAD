/* HarnessCAD - interface do desenho físico: gerar/atualizar (modelo Imagens ou Traço estilo Altium), painel da folha
   (escala, modelo, cor do traço) e propriedades de todos os itens (nó, ramo, cota, rótulo, balão, vista, tabela, item). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, EXT = HX.ITEM_EXT;
  function sprOpts(cats, none) {
    var o = none ? [['', none]] : [];
    Object.keys(HX.PSPR_CATS).forEach(function (c) { if (cats.indexOf(c) < 0) return; Object.keys(HX.PSPR).forEach(function (k) { var s = HX.PSPR[k]; if (s.cat === c) o.push([k, HX.PSPR_CATS[c] + ' — ' + s.name]); }); });
    return o;
  }
  HX.physSprOpts = sprOpts;
  var scl = function () { return HX.PHYS_SCALES.map(function (n) { return [String(n), '1:' + String(n).replace('.', ',')]; }); };
  var STY = [['line', 'Desenho técnico (traço — padrão Altium)']];
  EXT.pnode.fields = function (it) {
    if (it.nkind !== 'conn') return [{ type: 'head', l: it.nkind === 'brk' ? 'Ponto de derivação' : it.nkind === 'splice' ? 'Emenda' : 'Nó' }, { k: 'ref', l: 'Referência' }, { k: 'locked', l: 'Bloqueado', type: 'check' }];
    return [{ type: 'head', l: 'Conector ' + it.ref + ' (desenho físico)' },
      { k: 'sprite', l: 'Imagem / forma', type: 'select', opts: sprOpts(['conn', 'cable', 'coax', 'term', 'face'], '(sem imagem)') },
      { k: 'size', l: 'Comprimento real (mm)', type: 'number', step: 1, tip: 'Vazio = nominal. Desenhado em escala (mín. 12 mm no papel).' },
      { k: 'rot', l: 'Ângulo (°)', tip: 'Vazio = automático (saída do cabo para o ramo). R gira 90°.' },
      { k: 'flip', l: 'Espelhar', type: 'check' }, { k: 'folga', l: 'Folga de terminação (mm)', type: 'number', step: 1, tip: 'Somada ao corte de cada fio deste conector. Vazio = padrão do projeto' }, { k: 'showPN', l: 'Mostrar PN no rótulo', type: 'check' }, { k: 'note', l: 'Texto extra no rótulo' }, { k: 'locked', l: 'Bloqueado', type: 'check' }];
  };
  EXT.pseg.fields = function () {
    return [{ type: 'head', l: 'Ramo do chicote' }, { k: 'len', l: 'Comprimento real (mm)', type: 'number', step: 1, tip: 'Vazio = medido no desenho (traçado × escala); arrastar os nós muda. Digitado = cota fixa.' }, { k: 'tolP', l: 'Tolerância + (mm)' }, { k: 'tolM', l: 'Tolerância − (mm)' },
      { k: 'cover', l: 'Cobertura', type: 'select', opts: sprOpts(['cov'], '(nenhuma)') }, { k: 'coverTxt', l: 'Texto / PN da cobertura', tip: 'Ex.: conduíte Ø13 mm PN …' },
      { k: 'brk', l: 'Símbolo de quebra (fora de escala)', type: 'check' }];
  };
  EXT.pdim.fields = function () {
    return [{ type: 'head', l: 'Cota' }, { k: 'mode', l: 'Valor', type: 'select', opts: [['seg', 'Comprimento do ramo'], ['path', 'Caminho entre os nós (soma)'], ['free', 'Medida no desenho × escala']] },
      { k: 'text', l: 'Texto (opcional)', tip: 'Substitui o valor. Ex.: xxxx mm' }, { k: 'tolP', l: 'Tolerância + (mm)' }, { k: 'tolM', l: 'Tolerância − (mm)' },
      { k: 'off', l: 'Afastamento (mm)', type: 'number', step: 0.5, tip: 'Ou arraste a cota' }];
  };
  EXT.pnote.fields = function () { return [{ type: 'head', l: 'Rótulo' }, { k: 'text', l: 'Texto', tip: 'Vazio = automático (ref., PN). Use | para quebrar linha.' }, { k: 'along', l: 'Alinhar ao ramo (rótulo de feixe)', type: 'check' }]; };
  if (EXT.pcov) EXT.pcov.fields = function (it, doc) {
    var ns = doc.cur().items.filter(function (i) { return i.type === 'pnode'; }).map(function (n) { return [n.id, n.ref || n.id]; });
    return [{ type: 'head', l: 'Cobertura parcial / estendida' }, { k: 'sprite', l: 'Tipo', type: 'select', opts: sprOpts(['cov']) }, { k: 'txt', l: 'Texto / PN' },
      { k: 'a', l: 'Do nó', type: 'select', opts: ns }, { k: 'b', l: 'Até o nó', type: 'select', opts: ns },
      { k: 'd0', l: 'Recuo no início (mm reais)', type: 'number', step: 5 }, { k: 'd1', l: 'Recuo no fim (mm reais)', type: 'number', step: 5 }];
  };
  EXT.pball.fields = function () { return [{ type: 'head', l: 'Balão' }, { k: 'n', l: 'Número', tip: 'Vazio = automático (item da lista de materiais)' }, { k: 'assoc', l: 'Mostrar peças associadas (contatos, tampões)', type: 'check' }]; };
  EXT.pface.fields = function () { return [{ type: 'head', l: 'Vista frontal' }, { k: 'esc', l: 'Escala de detalhe (D-Sub)', type: 'select', opts: [['', 'Automática'], ['1', '1:1'], ['2', '2:1'], ['3', '3:1'], ['4', '4:1'], ['5', '5:1']] }, { k: 'w', l: 'Largura (mm, circular)', type: 'number', step: 1 }]; };
  EXT.ptable.fields = function (it) { return [{ type: 'head', l: it.kind === 'bom' ? 'Lista de materiais' : 'Tabela de ligação' }].concat(it.kind === 'bom' ? [{ k: 'bstyle', l: 'Formato', type: 'select', opts: [['', 'Sobre o carimbo, item 1 embaixo (padrão da casa)'], ['tabela', 'Tabela (formato antigo)']] }] : [{ k: 'wstyle', l: 'Formato', type: 'select', opts: [['', 'Diagrama de ligação (padrão da casa)'], ['tabela', 'Tabela (formato antigo)']] }, { k: 'w', l: 'Largura (mm)', type: 'number', step: 5 }]); };
  EXT.pimg.fields = function () {
    return [{ type: 'head', l: 'Item (imagem)' }, { k: 'sprite', l: 'Imagem', type: 'select', opts: sprOpts(Object.keys(HX.PSPR_CATS)) }, { k: 'pn', l: 'Part number' },
      { k: 'size', l: 'Comprimento real (mm)', type: 'number', step: 1 }, { k: 'rot', l: 'Ângulo (°)', type: 'number', step: 15 }, { k: 'flip', l: 'Espelhar', type: 'check' }, { k: 'label', l: 'Rótulo' }];
  };

  // UI.physDialog (Gerar/Atualizar): ui_phys3.js
  UI.sheetExtra = function (app, root, sh) {
    if (!HX.isPhys(sh)) return;
    var doc = app.doc, d = document.createElement('div'), sel = function (id, opts, cur) { return '<select id="' + id + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(cur) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; };
    d.innerHTML = '<h4>Desenho físico</h4><div class="row"><label>Escala</label>' + sel('phScale', scl(), sh.scale) + '</div><div class="row"><label>Modelo</label>' + sel('phSty', STY, 'line') + '</div>' +
      (sh.pstyle === 'line' || sh.pstyle === 'outline' ? '<div class="row"><label>Cor do traço</label><input id="phCol" type="color" value="' + (sh.lineColor || HX.PHYS_LINE_COLOR) + '"></div>' : '') +
      '<div class="row"><button id="phUpd" style="flex:1">Atualizar do esquemático</button></div><div class="row"><button id="phPal" style="flex:1">Inserir item (imagem)…</button></div>' +
      '<div class="row"><button id="phTw">+ Tabela de ligação</button><button id="phTb">+ Lista de materiais</button></div>' +
      '<div class="row"><button id="phFb" style="flex:1">Gabarito de montagem 1:1 (PDF)…</button></div>' +
      '<p class="muted">A formatação do chicote é feita aqui: <b>W</b> ramo/derivação, <b>B</b> BR sobre o ramo, <b>D</b> cota. Arraste nós (ramo sem valor mede o desenho), ramos (curvam), cotas, rótulos, balões, vistas e tabelas. Ramo selecionado: alças laranja religam a ponta. R gira, X/Y espelha, Del apaga (Del num BR junta os ramos).</p>';
    root.insertBefore(d, root.children[2] || null);
    UI.$('#phScale', d).onchange = function () { var n = +this.value; doc.change('Escala 1:' + n, function () { HX.physRescale(sh, n); }); };
    UI.$('#phSty', d).onchange = function () { var v = this.value; doc.change('Modelo do desenho', function () { sh.pstyle = v; }); };
    if (UI.$('#phCol', d)) UI.$('#phCol', d).onchange = function () { var v = this.value; doc.change('Cor do traço', function () { sh.lineColor = v; }); };
    UI.$('#phUpd', d).onclick = function () { UI.physDialog(app); };
    UI.$('#phPal', d).onclick = function () { UI.physPalette(app); };
    function tab(kind) { var v = app.view, c = [(v.W / 2 - v.ox) / v.s, (v.H / 2 - v.oy) / v.s], it; doc.change('Tabela', function () { it = doc.add({ type: 'ptable', id: doc.uid('a'), kind: kind, x: HX.r3(c[0] - 60), y: HX.r3(c[1]), w: 170 }); }); doc.select([it.id]); }
    UI.$('#phFb', d).onclick = function () { UI.formboardDialog(app); };
    UI.$('#phTw', d).onclick = function () { tab('wiring'); }; UI.$('#phTb', d).onclick = function () { tab('bom'); };
  };
})(typeof window !== 'undefined' ? window : globalThis);
