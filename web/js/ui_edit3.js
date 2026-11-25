/* HarnessCAD - TUDO EDITÁVEL NO ESQUEMA (v1.9.7): grupo "Posição" (X, Y em mm, fios ligados acompanham) nas Propriedades de
   todo item com posição (conector, emenda, label, cabo, texto, equipamento) e EDIÇÃO NO LUGAR com DUPLO CLIQUE: no pino =
   nome da via; no conector/emenda/cabo = referência; no fio = número (Tab: nome do circuito); no label/texto = texto.
   Enter grava (um Ctrl+Z desfaz), Esc cancela. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.App) return;
  function esc(v) { return HX.esc(String(v == null ? '' : v)); }
  var pe0 = UI.propsExtra, pb0 = UI.propsBind;
  function hasPos(it) { return it && it.type !== 'wire' && typeof it.x === 'number' && typeof it.y === 'number'; }
  UI.propsExtra = function (it, app) { var h = pe0 ? pe0.apply(this, arguments) : ''; if (!hasPos(it) || HX.isPhys(app.doc.cur())) return h;
    return h + '<div class="hxPos" style="border-top:1px solid var(--line,#ddd);margin-top:6px;padding-top:4px"><h4 style="margin:4px 0">Posição</h4>' +
      '<div class="row"><label>X (mm)</label><input id="psX" type="number" step="' + (app.doc.p.unit || 2.5) + '" style="width:90px" value="' + esc(HX.r3 ? HX.r3(it.x) : it.x) + '"></div>' +
      '<div class="row"><label>Y (mm)</label><input id="psY" type="number" step="' + (app.doc.p.unit || 2.5) + '" style="width:90px" value="' + esc(HX.r3 ? HX.r3(it.y) : it.y) + '"></div>' +
      '<div class="muted" style="font-size:11px">Os fios ligados acompanham. Dica: duplo clique no desenho edita o nome/identificação.</div></div>'; };
  UI.propsBind = function (it, app, root) { var r = pb0 ? pb0.apply(this, arguments) : undefined; if (!root || !root.querySelector('#psX')) return r; var doc = app.doc;
    ['X', 'Y'].forEach(function (k) { root.querySelector('#ps' + k).onchange = function () { var v = parseFloat(this.value); if (isNaN(v)) return; var key = k.toLowerCase();
      doc.change('Posição ' + (it.ref || ''), function () { HX.ops.keepWires(doc, [it.id], function () { it[key] = v; }); }); app.view.redraw(); }; });
    return r; };
  /* edição no lugar */
  var box = null;
  function close() { var b = box; box = null; if (b && b.parentNode) b.parentNode.removeChild(b); }
  function edit(app, x, y, val, ph, save, tab) { close(); var b = box = document.createElement('input'); b.value = val == null ? '' : val; b.placeholder = ph;
    b.style.cssText = 'position:fixed;z-index:70;left:' + (x + 8) + 'px;top:' + (y - 14) + 'px;width:160px;font:13px sans-serif;padding:2px 5px;border:2px solid #1e6bff;border-radius:4px;background:#fff;color:#000';
    document.body.appendChild(b); setTimeout(function () { b.focus(); b.select(); }, 0);
    b.onkeydown = function (e) { e.stopPropagation(); if (e.key === 'Escape') close(); else if (e.key === 'Enter' || (e.key === 'Tab' && tab)) { e.preventDefault(); var v = b.value; close(); save(v); if (e.key === 'Tab' && tab) tab(); } };
    b.onblur = function () { if (box === b) close(); }; }
  UI.inlineEdit = function (app, it, cx, cy, k) { var doc = app.doc, T = { conn: ['ref', 'Referência (ex.: J1)'], splice: ['ref', 'Referência (ex.: S1)'], cable: ['ref', 'Referência (ex.: CB1)'],
      wire: ['num', 'Número do fio (Tab: nome do circuito)'], label: ['text', 'Nome do label (circuito)'], text: ['text', 'Texto'] }[it.type]; if (!T) return false; k = k || T[0];
    edit(app, cx, cy, it[k], k === 'name' ? 'Nome do circuito' : T[1], function (v) { v = String(v).trim(); if (v === String(it[k] == null ? '' : it[k])) return;
      if (k !== 'name' && k !== 'text' && !v) return UI.toast('A identificação não pode ficar vazia.', true);
      if (k === 'ref' && doc.items().some(function (o) { return o !== it && o.ref === v; })) return UI.toast(v + ' já existe nesta folha.', true);
      doc.change('Editar ' + k, function () { it[k] = v; }); app.view.redraw(); }, it.type === 'wire' && k === 'num' ? function () { UI.inlineEdit(app, it, cx, cy, 'name'); } : null);
    return true; };
  /* ações do item (clique direito, barra Editar, Propriedades): renomear, comprimento e posição à mão */
  var ia0 = HX.itemActions;
  if (ia0) HX.itemActions = function (app, it) { var E = ia0.apply(this, arguments); if (!it || HX.isPhys(app.doc.cur())) return E; var doc = app.doc, add = [];
    var K = { conn: 'ref', splice: 'ref', cable: 'ref', wire: 'num', label: 'text' }[it.type];
    function prop(id) { return function () { doc.select([it.id]); if (app.focusProps) app.focusProps(); setTimeout(function () { var x = document.getElementById(id); if (x) { x.scrollIntoView({ block: 'center' }); x.focus(); x.select(); } }, 60); }; }
    if (K) add.push(['Renomear (' + (it[K] || '') + ')…', function () { UI.ask('Identificação', it.type === 'wire' ? 'Número do fio:' : it.type === 'label' ? 'Nome do circuito:' : 'Referência:', it[K] || '').then(function (v) {
      if (v == null || !String(v).trim()) return; v = String(v).trim(); if (K === 'ref' && doc.items().some(function (o) { return o !== it && o.ref === v; })) return UI.toast(v + ' já existe nesta folha.', true);
      doc.change('Renomear', function () { it[K] = v; }); app.view.redraw(); }); }]);
    if (it.type === 'wire' || it.type === 'cable') add.push(['Comprimento e % a mais…', prop('lnL')]);
    if (hasPos(it)) add.push(['Posição (X, Y)…', prop('psX')]);
    var i = typeof E[0] === 'string' ? 1 : 0; E.splice.apply(E, [i, 0].concat(add)); return E; };
  /* copiar não mostrava nada: avisa quantos itens foram para a área de transferência */
  var cs0 = HX.ops && HX.ops.copySel; if (cs0) HX.ops.copySel = function (doc) { var n = doc.sel ? doc.sel.size : 0, r = cs0.apply(this, arguments); if (n && G.document) UI.toast(n + ' item(ns) copiado(s) — Ctrl+V cola.', false, 1500); return r; };
  /* emenda: identificação escondida por padrão — "Mostrar identificação" nas Propriedades e nas ações do item */
  var pe1 = UI.propsExtra, pb1 = UI.propsBind;
  UI.propsExtra = function (it, app) { var h = pe1.apply(this, arguments); if (it.type !== 'splice' || HX.isPhys(app.doc.cur())) return h;
    return '<div class="row hxSpRef" style="padding:2px 8px"><label>Mostrar identificação (' + esc(it.ref || '') + ')</label><input id="spRef" type="checkbox"' + (it.showRef === true ? ' checked' : '') + '></div>' + h; };
  UI.propsBind = function (it, app, root) { var r = pb1.apply(this, arguments), c = root && root.querySelector('#spRef'); if (c) c.onchange = function () { var v = c.checked; app.doc.change('Identificação da emenda', function () { it.showRef = v; }); app.view.redraw(); }; return r; };
  var ia1 = HX.itemActions;
  if (ia1) HX.itemActions = function (app, it) { var E = ia1.apply(this, arguments); if (!it || it.type !== 'splice' || HX.isPhys(app.doc.cur())) return E; var on = it.showRef === true;
    E.splice(typeof E[0] === 'string' ? 1 : 0, 0, [(on ? 'Ocultar' : 'Mostrar') + ' identificação', function () { app.doc.change('Identificação da emenda', function () { it.showRef = !on; }); app.view.redraw(); }]); return E; };
  var A = HX.App.prototype, init0 = A.init;
  A.init = function () { init0.apply(this, arguments); var app = this, cv = app.view.cv;
    /* "Estilo dos símbolos de conector…": com painéis automáticos o painel fechava sem seleção — abre e mostra o campo */
    [].forEach.call(document.querySelectorAll('#menus .dd > div'), function (d) { if (d.firstChild && /^Estilo dos símbolos de conector/.test(d.firstChild.textContent)) d.addEventListener('click', function () {
      setTimeout(function () { if (app.layout && app.layout.peek) app.layout.peek('r', true); var x = document.getElementById('pStyle'); if (x) { x.scrollIntoView({ block: 'center' }); x.focus(); } }, 60); }); });
    cv.addEventListener('dblclick', function (e) { var t = app.tools; if (HX.isPhys(app.doc.cur()) || t.tool !== 'select') return;
      var r = cv.getBoundingClientRect(), pt = app.view.toWorld(e.clientX - r.left, e.clientY - r.top), pin = HX.pinAt && HX.pinAt(app.doc, pt, 8 / app.view.s);
      if (pin && UI.pinNameAt) { setTimeout(function () { UI.pinNameAt(app, pin.c, pin.q); }, 0); return; }
      var h = app.view.hitTest(pt); if (h) setTimeout(function () { UI.inlineEdit(app, h, e.clientX, e.clientY); }, 0); }); };
})(typeof window !== 'undefined' ? window : globalThis);
