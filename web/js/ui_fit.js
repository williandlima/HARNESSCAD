/* HarnessCAD - TELA (v1.9.12): "Ajustar à folha" desconta a barra ativa (topo) e o fluxo guiado (embaixo) — a folha não
   fica escondida atrás deles; e a FAIXA que não cabe na largura (aba Desenho físico) entra em modo compacto: botões menores
   e, se ainda faltar espaço, só ícone nos botões pequenos (o nome aparece ao passar o mouse) — nada cortado. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.App) return;
  var CSS = '.rpanel.rc1 .rb{max-width:66px;min-width:38px;font-size:10.5px;padding:4px 1px 1px}.rpanel.rc1 .rb svg{width:21px;height:21px}.rpanel.rc1 .rs{font-size:10.5px;padding:0 4px 0 2px}' +
    '.rpanel.rc1 .rg{padding:0 2px}.rpanel.rc2 .rs span,.rpanel.rc2 .rs .bl{display:none}.rpanel.rc2 .rcol{gap:1px}';
  function over(app) { var d = { t: 0, b: 0 }, cv = app.view.cv, cr = cv.getBoundingClientRect(), ab = document.getElementById('hxAB'), fl = document.getElementById('hxFlow');
    if (ab && ab.offsetParent && !ab.classList.contains('min')) { var r = ab.getBoundingClientRect(); if (r.top - cr.top < 90 && r.bottom > cr.top) d.t = r.bottom - cr.top + 4; }
    if (fl && fl.offsetParent) { var q = fl.getBoundingClientRect(); if (cr.bottom - q.bottom < 90 && q.top < cr.bottom) d.b = cr.bottom - q.top + 4; }
    return d; }
  function compact() { [].forEach.call(document.querySelectorAll('#toolbar .rpanel'), function (p) { if (p.style.display === 'none') return; p.classList.remove('rc1', 'rc2');
    if (p.scrollWidth > p.clientWidth + 2) { p.classList.add('rc1'); if (p.scrollWidth > p.clientWidth + 2) p.classList.add('rc2'); } }); }
  var A = HX.App.prototype, init0 = A.init;
  A.init = function () { init0.apply(this, arguments); var app = this, v = app.view;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    v.fit = function (bb) { var d = HX.sheetDims(app.doc.p.meta), o = over(app), H = v.H - o.t - o.b; if (H < v.H * 0.5) { H = v.H; o = { t: 0, b: 0 }; }
      bb = bb || { x0: 0, y0: 0, x1: d[0], y1: d[1] }; var w = Math.max(bb.x1 - bb.x0, 10), h = Math.max(bb.y1 - bb.y0, 10);
      v.s = Math.min((v.W - 40) / w, (H - 30) / h); v.ox = (v.W - w * v.s) / 2 - bb.x0 * v.s; v.oy = o.t + (H - h * v.s) / 2 - bb.y0 * v.s; v.redraw(); };
    var rt = app.ribbonTab; if (rt) app.ribbonTab = function () { var r = rt.apply(this, arguments); setTimeout(compact, 0); return r; };
    G.addEventListener('resize', function () { setTimeout(compact, 50); }); setTimeout(compact, 0); };
  UI.ribbonCompact = compact;
})(typeof window !== 'undefined' ? window : globalThis);
