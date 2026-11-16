/* HarnessCAD - painel da folha física: ferramentas do chicote (redesenhar em escala, tabelas novas, vista de detalhe,
   exportar lista de corte CSV e gabarito DXF, peso, revisões, variantes, emendas escalonadas) e menu Editar › Alinhar. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI;
  function center(app) { var v = app.view; return [(v.W / 2 - v.ox) / v.s, (v.H / 2 - v.oy) / v.s]; }
  var se0 = UI.sheetExtra;
  UI.sheetExtra = function (app, root, sh) {
    if (se0) se0(app, root, sh); if (!HX.isPhys(sh)) return;
    var doc = app.doc, p = doc.p, d = document.createElement('div'), W = HX.physWeight ? HX.physWeight(p, sh) : null, V = HX.physVarList(sh), R = p.physRevs || [];
    var opt = function (a, cur) { return a.map(function (o) { return '<option value="' + HX.esc(o[0]) + '"' + (String(o[0]) === String(cur) ? ' selected' : '') + '>' + HX.esc(o[1]) + '</option>'; }).join(''); };
    d.innerHTML = '<h4>Ferramentas do chicote</h4>' +
      '<div class="row"><label>Conectores</label><select id="p5CS">' + opt([['', 'Ampliados (automático)'], ['real', 'Tamanho real (datasheet)'], ['2', 'Ampliados 2×'], ['3', 'Ampliados 3×'], ['5', 'Ampliados 5×']], sh.connScale || '') + '</select></div>' +
      '<div class="row"><label>Tolerância geral (mm)</label><input id="p5GT" placeholder="ex.: +25/-0" value="' + HX.esc(sh.gTol || '') + '"></div>' +
      '<div class="row"><label>Texto mínimo (mm)</label><select id="p5TM">' + opt([['', 'Como desenhado'], ['2', '2,0'], ['2.5', '2,5 (impressão A3)'], ['3.5', '3,5']], sh.textMin || '') + '</select></div>' +
      '<div class="row"><button id="p5Scale" style="flex:1">Redesenhar em escala (ramos digitados)</button></div>' +
      '<div class="row"><select id="p5Tab">' + opt(Object.keys(HX.PTABLE_KINDS).map(function (k) { return [k, HX.PTABLE_KINDS[k]]; })) + '</select><button id="p5AddT">+ Tabela</button></div>' +
      '<div class="row"><button id="p5Det" style="flex:1">+ Vista de detalhe (região no centro da tela)</button></div>' +
      '<div class="row"><button id="p5Csv">Lista de corte (CSV)</button><button id="p5Dxf">Gabarito (DXF 1:1)</button></div>' +
      (W ? '<div class="muted">Peso estimado: <b>' + HX.fmtNum(W.total) + ' g</b> (fios ' + HX.fmtNum(W.wires) + ' · coberturas ' + HX.fmtNum(W.covers) + ' · peças ' + HX.fmtNum(W.parts) + ')</div>' : '') +
      '<div class="row"><label>Emendas: distância mín. (mm)</label><input id="p5Stg" type="number" step="5" value="' + (HX.ercCfg(p).stagger || 25) + '"></div>' +
      '<h4>Revisões</h4><div class="row"><button id="p5Frz" style="flex:1">Congelar revisão atual (' + HX.esc(p.meta.rev || 'A') + ')</button></div>' +
      (R.length ? '<div class="row"><select id="p5Rev">' + opt(R.map(function (r) { return [r.rev, 'Rev. ' + r.rev + ' — ' + r.date]; })) + '</select><button id="p5Cmp">Comparar</button></div>' : '') +
      (app._revDiff ? '<div class="row"><button id="p5Clr" style="flex:1">Limpar destaque da comparação</button></div>' : '') +
      '<h4>Variantes</h4><div class="row"><label>Variantes</label><input id="p5Vars" value="' + HX.esc(sh.variants || '') + '" placeholder="A,B,C"></div>' +
      (V.length ? '<div class="row"><label>Exibir</label><select id="p5Var">' + opt([['', 'Todas (completo)']].concat(V.map(function (v) { return [v, 'Variante ' + v]; })), sh.variant || '') + '</select></div>' : '') +
      '<p class="muted">Itens com "Variantes onde existe" vazio entram em todas. A lista de materiais e os comprimentos seguem a variante exibida.</p>';
    var ref = [].slice.call(root.children).filter(function (c) { return c.querySelector && c.querySelector('#phFb'); })[0];
    if (ref) root.insertBefore(d, ref.nextSibling); else root.appendChild(d);
    var $ = function (id) { return d.querySelector('#' + id); };
    $('p5CS').onchange = function () { var v = this.value; doc.change('Escala dos conectores', function () { sh.connScale = v; }); };
    $('p5GT').onchange = function () { var v = this.value.trim(); doc.change('Tolerância geral', function () { sh.gTol = v; }); };
    $('p5TM').onchange = function () { var v = this.value; doc.change('Texto mínimo', function () { sh.textMin = v; }); };
    $('p5Scale').onclick = function () { var n; doc.change('Redesenhar em escala', function () { n = HX.physRedrawScale(sh); }); UI.toast(n ? n + ' ramo(s) redesenhado(s) em 1:' + sh.scale + '.' : 'Nada a ajustar: os ramos digitados já estão em escala.'); };
    $('p5AddT').onclick = function () { var c = center(app), it, k = $('p5Tab').value; doc.change('Tabela', function () { it = doc.add({ type: 'ptable', id: doc.uid('a'), kind: k, x: HX.r3(c[0] - 60), y: HX.r3(c[1]), w: 170 }); }); doc.select([it.id]); };
    $('p5Det').onclick = function () { app.tools.setTool('pdet'); UI.toast('Detalhe: arraste sobre a área a ampliar (V).'); };
    var nm = (p.meta.number || 'cablagem') + '_rev' + (p.meta.rev || 'A');
    $('p5Csv').onclick = function () { HX.io.download(nm + '_lista_de_corte.csv', HX.physCutCSV(p), 'text/csv'); };
    $('p5Dxf').onclick = function () { var t = HX.physDXF(p); if (!t) return UI.toast('Sem ramos no desenho físico.', true); HX.io.download(nm + '_gabarito_1-1.dxf', t, 'application/dxf'); UI.toast('DXF em milímetros, tamanho real (camadas RAMOS, NOS, PINOS, ITENS, TEXTO).'); };
    $('p5Stg').onchange = function () { var v = +this.value; doc.change('Emendas escalonadas', function () { HX.ercCfg(p).stagger = v > 0 ? v : 25; }); };
    $('p5Frz').onclick = function () { var r = p.meta.rev || 'A'; doc.change('Congelar revisão ' + r, function () { HX.physFreeze(p, r); }); UI.toast('Revisão ' + r + ' congelada. Depois de mudar o desenho, compare com ela.'); };
    if ($('p5Cmp')) $('p5Cmp').onclick = function () {
      var D = HX.physDiff(p, $('p5Rev').value); if (!D) return; app._revDiff = D; app.view.redraw();
      UI.modal('Comparação com a revisão ' + D.rev.rev + ' (' + D.rev.date + ')', D.list.length ? '<table class="tbl"><tr><th>Tipo</th><th>Mudança</th></tr>' + D.list.map(function (x) { return '<tr><td>' + HX.esc(x.kind) + '</td><td>' + HX.esc(x.txt) + '</td></tr>'; }).join('') + '</table><p class="muted">Ramos e conectores alterados ficam destacados em laranja na tela.</p>' : '<p>Nenhuma diferença.</p>', [{ t: 'OK', pri: true }]);
      doc.emit('select');
    };
    if ($('p5Clr')) $('p5Clr').onclick = function () { app._revDiff = null; app.view.redraw(); doc.emit('select'); };
    $('p5Vars').onchange = function () { var v = this.value.trim(); doc.change('Variantes', function () { sh.variants = v; if (sh.variant && HX.physVarList(sh).indexOf(sh.variant) < 0) sh.variant = ''; }); };
    if ($('p5Var')) $('p5Var').onchange = function () { var v = this.value; doc.change('Variante exibida', function () { sh.variant = v; }); app.view.hover = null; doc.sel.clear(); doc.emit('select'); };
  };
  // Editar › alinhar / distribuir (nós e itens do desenho físico)
  HX.MENU_EXTRA = HX.MENU_EXTRA || [];
  [['h', 'Alinhar nós na horizontal'], ['v', 'Alinhar nós na vertical'], ['dh', 'Distribuir nós na horizontal'], ['dv', 'Distribuir nós na vertical']].forEach(function (x) {
    HX.MENU_EXTRA.push(['Editar', function (app) { return [x[1] + ' (desenho físico)', function () { var n; app.doc.change(x[1], function () { n = HX.physAlign(app.doc.selected(), x[0]); }); if (!n) UI.toast('Selecione 2 ou mais nós/itens do desenho físico.', true); }, '']; }]);
  });
})(typeof window !== 'undefined' ? window : globalThis);
