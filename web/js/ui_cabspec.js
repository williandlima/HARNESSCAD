/* HarnessCAD - BITOLA DO CABO À MÃO (v1.9.9): ao selecionar o CABO, as Propriedades mostram no topo "Vias do cabo (N)"
   com Bitola, Tipo de fio, Cor e Pares trançados aplicados na hora a TODAS as vias; num FIO que está dentro de um cabo,
   "Bitola para todas as vias do CB1"; com VÁRIOS FIOS selecionados, Tipo/Bitola/Cor em lote. Ação "Bitola…" na barra
   "Editar" e no clique direito. Lógica em HX.cableSpecSet (cat_cable2.js). Um Ctrl+Z desfaz cada mudança. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.cableSpecSet) return;
  function esc(v) { return HX.esc(String(v == null ? '' : v)); }
  function sel(id, opts, cur, mixed) { return '<select id="' + id + '">' + (cur == null ? '<option value="">' + (mixed || '(misto)') + '</option>' : '') +
    opts.map(function (o) { var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(v) + '"' + (String(v) === String(cur) ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select>'; }
  function gauges(W) { var t = HX.wireType(HX.specCommon(W, 'wtype') || (W[0] && W[0].wtype)); return t ? t.gauges.map(function (g) { return [g, g + ' AWG']; }) : []; }
  function colors() { return Object.keys(HX.COLORS).map(function (k) { return [k, k + ' ' + HX.COLORS[k][0]]; }); }
  function block(W, title, tw) { return '<div class="hxSpec" style="border:1px solid var(--acc,#1e6bff);border-radius:6px;margin:6px 6px 8px;padding:4px 8px"><h4 style="margin:4px 0;color:var(--acc,#1e6bff)">' + title + '</h4>' +
    '<div class="row"><label>Bitola</label>' + sel('csG', gauges(W), HX.specCommon(W, 'gauge')) + '</div>' +
    '<div class="row"><label>Tipo de fio</label>' + sel('csT', Object.keys(HX.CAT.wires), HX.specCommon(W, 'wtype')) + '</div>' +
    '<div class="row"><label>Cor</label>' + sel('csC', colors(), HX.specCommon(W, 'color'), '(cores diferentes — manter)') + '</div>' +
    (tw ? '<div class="row"><label>Pares trançados</label><input id="csW" type="checkbox"' + (W.length > 1 && W.every(function (w, i) { return w.twist || (i === W.length - 1 && i % 2 === 0); }) ? ' checked' : '') + '></div>' : '') +
    '<div class="muted" style="font-size:11px">Vale para as ' + W.length + ' vias de uma vez (Ctrl+Z desfaz).</div></div>'; }
  function bind(app, root, W, label) { var doc = app.doc;
    function ap(s) { doc.change(label, function () { HX.cableSpecSet(doc, W, s); }); app.view.redraw(); UI.toast(label + ': ' + W.length + ' via(s) atualizada(s).', false, 1500); }
    var g = root.querySelector('#csG'), t = root.querySelector('#csT'), c = root.querySelector('#csC'), w = root.querySelector('#csW');
    if (g) g.onchange = function () { if (g.value) ap({ gauge: g.value }); }; if (t) t.onchange = function () { if (t.value) ap({ wtype: t.value }); };
    if (c) c.onchange = function () { if (c.value) ap({ color: c.value }); }; if (w) w.onchange = function () { ap({ tw: w.checked }); }; }
  function cabOf(app, w) { return HX.cableOf ? HX.cableOf(app.doc.cur(), w) : null; }
  var pe0 = UI.propsExtra, pb0 = UI.propsBind;
  UI.propsExtra = function (it, app) { var h = pe0 ? pe0.apply(this, arguments) : ''; if (HX.isPhys(app.doc.cur())) return h;
    if (it.type === 'cable') { var W = HX.cableWires(app.doc, it); return W.length ? block(W, 'Vias do cabo ' + (it.ref || '') + ' (' + W.length + ')', true) + h : h; }
    if (it.type === 'wire') { var c = cabOf(app, it); if (c) { var V = HX.cableWires(app.doc, c); return h + '<div class="hxSpec1" style="border-top:1px solid var(--line,#ddd);margin-top:6px;padding-top:4px"><h4 style="margin:4px 0">Este fio está no cabo ' + esc(c.ref) + '</h4>' +
      '<div class="row"><label>Bitola (todas as vias)</label>' + sel('csG', gauges(V), HX.specCommon(V, 'gauge')) + '</div><div class="row"><button id="csSel" style="flex:1">Selecionar o cabo ' + esc(c.ref) + '</button></div></div>'; } }
    return h; };
  UI.propsBind = function (it, app, root) { var r = pb0 ? pb0.apply(this, arguments) : undefined; if (!root || HX.isPhys(app.doc.cur())) return r;
    if (it.type === 'cable' && root.querySelector('.hxSpec')) { bind(app, root, HX.cableWires(app.doc, it), 'Vias do cabo ' + (it.ref || '')); var b = root.querySelector('.hxSpec'), h4 = root.querySelector('h4'); if (h4 && b !== h4.nextSibling) h4.parentNode.insertBefore(b, h4.nextSibling); }
    if (it.type === 'wire' && root.querySelector('.hxSpec1')) { var c = cabOf(app, it); bind(app, root, HX.cableWires(app.doc, c), 'Bitola do cabo ' + c.ref); root.querySelector('#csSel').onclick = function () { app.doc.select([c.id]); }; }
    return r; };
  /* vários fios selecionados: especificação em lote no painel */
  var A = HX.App.prototype, init0 = A.init;
  A.init = function () { init0.apply(this, arguments); var app = this, root = document.getElementById('props'); if (!root) return;
    function multi() { var s = app.doc.selected(); if (s.length < 2 || !s.every(function (i) { return i.type === 'wire'; }) || HX.isPhys(app.doc.cur()) || root.querySelector('.hxSpec')) return;
      var p = [].filter.call(root.querySelectorAll('p.muted'), function (x) { return /aba Fios/.test(x.textContent); })[0], d = document.createElement('div'); d.innerHTML = block(s, s.length + ' fios selecionados — especificação', false);
      if (p) p.parentNode.replaceChild(d, p); else root.appendChild(d); bind(app, root, s, 'Especificação de ' + s.length + ' fios'); }
    app.doc.on('select', function () { setTimeout(multi, 0); }); app.doc.on('change', function () { setTimeout(multi, 0); }); };
  /* ação "Bitola…" no cabo e no fio (barra Editar, clique direito, Propriedades) */
  var ia0 = HX.itemActions;
  if (ia0) HX.itemActions = function (app, it) { var E = ia0.apply(this, arguments); if (!it || (it.type !== 'cable' && it.type !== 'wire') || HX.isPhys(app.doc.cur())) return E;
    var f = ['Bitola…', function () { app.doc.select([it.id]); if (app.focusProps) app.focusProps(); setTimeout(function () { var x = it.type === 'cable' ? document.getElementById('csG') : document.getElementById('f_gauge'); if (x) { x.scrollIntoView({ block: 'center' }); x.focus(); } }, 60); }];
    E.splice(typeof E[0] === 'string' ? 1 : 0, 0, f); return E; };
})(typeof window !== 'undefined' ? window : globalThis);
