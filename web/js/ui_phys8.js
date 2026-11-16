/* HarnessCAD - interface do desenho físico (8): ramo maleável (duplo clique cria ponto, botão direito remove/endireita),
   cota angular (valor digitado gira o ramo), preparação da ponta, APARÊNCIA por item (cor, espessura, texto, ângulo)
   e CAMADAS da folha (mostrar/ocultar). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, EXT = HX.ITEM_EXT;
  EXT.pang.fields = function (it, doc) {
    var V = HX.physAngValue(it, HX.physIdx(doc.cur())); HX.physHide(it, '_val', V ? Math.round(V.deg * 10) / 10 : '');
    return [{ type: 'head', l: 'Cota angular' }, { k: '_val', l: 'Ângulo (°) — gira o ramo', type: 'number', step: 5, tip: 'Digite: o lado do 2º ramo gira em torno do nó' },
      { k: 'text', l: 'Texto (opcional)' }, { k: 'tol', l: 'Tolerância ± (°)' }, { k: 'r', l: 'Raio do arco (mm)', type: 'number', step: 1 }];
  };
  EXT.pprep.fields = function () {
    return [{ type: 'head', l: 'Preparação da ponta (sem escala)' }, { k: 'title', l: 'Título' }, { k: 'A', l: 'A — sem capa (mm)', type: 'number', step: 1 }, { k: 'B', l: 'B — malha dobrada (mm)', type: 'number', step: 1 },
      { k: 'C', l: 'C — decape do condutor (mm)', type: 'number', step: 0.5 }, { k: 'jacket', l: 'Cabo com capa', type: 'check' }, { k: 'shield', l: 'Malha (blindagem)', type: 'check' }, { k: 'drain', l: 'Fio dreno', type: 'check' },
      { k: 'contact', l: 'Contato crimpado', type: 'check' }, { k: 'contactPN', l: 'PN do contato', tip: 'Ex.: M39029/58-360' }];
  };
  var ROTF = { pnote: 1, pface: 1 }, FS = [['', 'Normal'], ['0.8', 'Menor'], ['1.25', 'Maior'], ['1.6', 'Bem maior']], LW = [['', 'Normal'], ['0.6', 'Fina'], ['1.6', 'Grossa'], ['2.5', 'Bem grossa']];
  var ex0 = UI.propsExtra, bd0 = UI.propsBind;
  UI.propsExtra = function (it, app) {
    var h = ex0(it, app) || '', sh = app.doc.cur(); if (!HX.isPhys(sh) || !EXT[it.type] || it.type === 'pseg' && false) return h;
    var sel = function (id, o, v) { return '<select id="' + id + '">' + o.map(function (x) { return '<option value="' + x[0] + '"' + (String(x[0]) === String(v || '') ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select>'; };
    if (it.type === 'pseg') h += '<h4>Forma do ramo</h4><p class="muted">Duplo clique no ramo cria um ponto de curva; arraste as bolinhas laranja; botão direito no ponto remove.</p><div class="row"><button id="p8Bend" style="flex:1">+ Ponto de curva no meio</button></div>';
    if (it.type === 'pnode' && it.nkind === 'conn') h += '<div class="row"><button id="p8Prep" style="flex:1">+ Preparação da ponta (detalhe)</button></div>';
    h += '<h4>Aparência</h4><div class="row"><label>Cor</label><input id="p8Col" type="color" value="' + (it.sCol || '#1d1d1d') + '"><button id="p8ColX" title="Cor padrão">×</button></div>' +
      '<div class="row"><label>Espessura das linhas</label>' + sel('p8Lw', LW, it.sLw) + '</div><div class="row"><label>Tamanho do texto</label>' + sel('p8Fs', FS, it.sFs) + '</div>' +
      (ROTF[it.type] ? '<div class="row"><label>Ângulo (°)</label><input id="p8Rot" type="number" step="15" value="' + HX.esc(it.rot || '') + '"></div>' : '');
    return h;
  };
  UI.propsBind = function (it, app, root, set) {
    bd0(it, app, root, set); var doc = app.doc, sh = doc.cur(); if (!HX.isPhys(sh) || !EXT[it.type]) return;
    var q = function (id) { return root.querySelector('#' + id); }, ch = function (lbl, fn) { doc.change(lbl, fn); };
    var v = q('f__val');
    if (v && it.type === 'pang') root.addEventListener('change', function (e) { if (e.target !== v) return; e.stopPropagation(); var msg = ''; ch('Ângulo da cota', function () { msg = HX.physAngSet(sh, it, v.value); }); if (msg) UI.toast(msg, true); }, true);
    if (q('p8Bend')) q('p8Bend').onclick = function () { ch('Ponto de curva', function () { var m = HX.physIdx(sh), P = HX.physSegPts(it, m); HX.physAddBend(it, m, HX.polyAt(P, 0.5).pt); }); };
    if (q('p8Str')) q('p8Str').onclick = function () { ch('Endireitar ramo', function () { HX.physStraighten(it); }); };
    if (q('p8Prep')) q('p8Prep').onclick = function () { var r; ch('Preparação da ponta', function () { r = HX.physAddPrep(doc, it); }); if (r) doc.select([r.id]); };
    if (q('p8Col')) q('p8Col').onchange = function () { var c = this.value; ch('Cor', function () { it.sCol = c; }); };
    if (q('p8ColX')) q('p8ColX').onclick = function () { ch('Cor padrão', function () { delete it.sCol; }); };
    if (q('p8Lw')) q('p8Lw').onchange = function () { var c = this.value; ch('Espessura', function () { if (c) it.sLw = +c; else delete it.sLw; }); };
    if (q('p8Fs')) q('p8Fs').onchange = function () { var c = this.value; ch('Tamanho do texto', function () { if (c) it.sFs = +c; else delete it.sFs; }); };
    if (q('p8Rot')) q('p8Rot').onchange = function () { var c = this.value; ch('Ângulo', function () { it.rot = c === '' ? '' : ((+c % 360) + 360) % 360; }); };
  };
  // camadas da folha
  var se0 = UI.sheetExtra;
  UI.sheetExtra = function (app, root, sh) {
    if (se0) se0(app, root, sh); if (!HX.isPhys(sh)) return;
    var doc = app.doc, d = document.createElement('div'), L = sh.layers || {};
    d.innerHTML = '<h4>Camadas (mostrar / ocultar)</h4>' + Object.keys(HX.PHYS_LAYERS).map(function (k) { return '<div class="row"><label>' + HX.PHYS_LAYERS[k][0] + '</label><input type="checkbox" data-ly="' + k + '"' + (L[k] === false ? '' : ' checked') + '></div>'; }).join('') +
      '<p class="muted">Camada oculta não aparece na tela nem no PDF e não é selecionada.</p>';
    d.querySelectorAll('[data-ly]').forEach(function (e) { e.onchange = function () { var k = e.getAttribute('data-ly'), on = e.checked; doc.change('Camada', function () { sh.layers = sh.layers || {}; if (on) delete sh.layers[k]; else sh.layers[k] = false; }); }; });
    root.appendChild(d);
  };
  // duplo clique no ramo selecionado = ponto de curva; botão direito no ponto = menu
  var A = HX.App.prototype, init0 = A.init;
  A.init = function () {
    init0.call(this); var app = this, cv = UI.$('#cv');
    cv.addEventListener('dblclick', function (e) {
      var t = app.tools, doc = app.doc, sh = doc.cur(); if (!HX.isPhys(sh) || t.tool !== 'select') return; t.ev(e);
      var s = doc.selected(), pk = HX.physPick(sh, t.cur, 8 / app.view.s); if (!pk || !pk.seg || (s.length === 1 && s[0] !== pk.seg)) return;
      e.stopImmediatePropagation(); doc.select([pk.seg.id]); var p = t.cur.slice(); doc.change('Ponto de curva', function () { HX.physAddBend(pk.seg, HX.physIdx(sh), p); });
    }, true);
    cv.addEventListener('contextmenu', function (e) {
      var t = app.tools, doc = app.doc, sh = doc.cur(); if (!HX.isPhys(sh) || !HX.physBendAt) return; t.ev(e); var b = HX.physBendAt(t, t.cur); if (!b) return;
      e.preventDefault(); e.stopImmediatePropagation();
      UI.ctxMenu(e.clientX, e.clientY, [['Remover este ponto de curva', function () { doc.change('Remover ponto de curva', function () { HX.physDelBend(b.sg, b.i); }); }], ['Endireitar o ramo (tirar todos)', function () { doc.change('Endireitar ramo', function () { HX.physStraighten(b.sg); }); }]]);
    }, true);
    HX.SHORTCUTS.push(['Duplo clique no ramo', 'Desenho físico: novo ponto de curva (ramo maleável)'], ['Alça redonda', 'Desenho físico: girar conector/imagem/rótulo (Shift = livre)']);
  };
})(typeof window !== 'undefined' ? window : globalThis);
