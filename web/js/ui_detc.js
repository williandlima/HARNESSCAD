/* HarnessCAD - janela CATÁLOGO DE DETALHES: grupos em abas, cartão com miniatura desenhada (o próprio traço do
   detalhe), descrição e referência (norma/datasheet); Inserir põe o detalhe num espaço livre da folha física e
   seleciona para customizar no painel de propriedades. Menu Inserir › Catálogo de detalhes… e faixa Desenho físico. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.DETC) return;
  function esc(t) { return HX.esc ? HX.esc(t) : String(t); }
  function thumb(cv, kind) {
    var D = HX.DETC[kind], ctx = cv.getContext('2d'), it = { kind: kind, x: 0, y: 0, label: '-' }, sz = D.size || [140, 90];
    var dry = { style: f, line: f, poly: f, rect: f, circle: f, text: f, push: f, pop: f }; function f() {}
    var bb = HX.detcRender(dry, it, D, '#1f3fa6', null, 2.6), w = bb.x1 - bb.x0 || sz[0], h = bb.y1 - bb.y0 || sz[1], s = Math.min(cv.width / (w + 4), cv.height / (h + 4));
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.setTransform(s, 0, 0, s, (cv.width - w * s) / 2 - bb.x0 * s, (cv.height - h * s) / 2 - bb.y0 * s);
    HX.detcRender(new HX.CanvasG(ctx, { s: s }), it, D, '#1f3fa6', null, 2.6);
  }
  UI.detcDialog = function (app, grp) {
    var doc = app.doc; if (!HX.isPhys(doc.cur())) return UI.toast('Abra a folha do desenho físico.', true);
    var cur = grp || HX.DETC_GRP[0][0], dlg = UI.modal('Catálogo de detalhes', '<div id="dcTabs" class="row" style="flex-wrap:wrap;gap:4px"></div><div id="dcList" style="display:grid;grid-template-columns:repeat(2,minmax(300px,1fr));gap:10px;max-height:470px;overflow:auto;min-width:660px"></div>' +
      '<p class="muted">Depois de inserir: clique no detalhe e ajuste cotas, tolerâncias, textos, balões e escala no painel de propriedades. Arraste para posicionar.</p>', [{ t: 'Fechar', pri: true }]);
    function draw() {
      dlg.el.querySelector('#dcTabs').innerHTML = HX.DETC_GRP.map(function (g) { var n = Object.keys(HX.DETC).filter(function (k) { return HX.DETC[k].grp === g[0]; }).length;
        return '<button data-g="' + g[0] + '"' + (g[0] === cur ? ' class="pri"' : '') + '>' + esc(g[1]) + ' (' + n + ')</button>'; }).join('');
      var K = Object.keys(HX.DETC).filter(function (k) { return HX.DETC[k].grp === cur; });
      dlg.el.querySelector('#dcList').innerHTML = K.map(function (k) { var D = HX.DETC[k];
        return '<div style="border:1px solid var(--line,#999);border-radius:6px;padding:8px"><canvas data-t="' + k + '" width="640" height="280" style="width:100%;background:#fff;border-radius:4px"></canvas>' +
          '<b>' + esc(D.n) + '</b><div class="muted" style="font-size:12px">' + esc(D.desc || '') + '</div><div class="muted" style="font-size:11px">' + esc(D.ref || '') + '</div>' +
          '<div class="row"><button data-k="' + k + '" class="pri" style="flex:1">Inserir</button></div></div>'; }).join('') || '<p class="muted">Nenhum detalhe neste grupo.</p>';
      [].forEach.call(dlg.el.querySelectorAll('[data-g]'), function (b) { b.onclick = function () { cur = b.dataset.g; draw(); }; });
      [].forEach.call(dlg.el.querySelectorAll('canvas[data-t]'), function (cv) { try { thumb(cv, cv.dataset.t); } catch (e) { /* miniatura opcional */ } });
      [].forEach.call(dlg.el.querySelectorAll('[data-k]'), function (b) { b.onclick = function () { var it; doc.change('Inserir detalhe típico', function () { it = HX.detcAdd(doc, b.dataset.k); });
        dlg.close(); if (it) { doc.select([it.id]); app.view.redraw(); UI.toast('Detalhe inserido — ajuste no painel de propriedades.'); } }; });
    }
    draw();
  };
  if (HX.MENU_EXTRA) HX.MENU_EXTRA.push(['Inserir', function (app) { return ['Catálogo de detalhes…', function () { UI.detcDialog(app); }, '']; }]);
})(typeof window !== 'undefined' ? window : globalThis);
