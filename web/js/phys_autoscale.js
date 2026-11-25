/* HarnessCAD - ESCALA AUTOMÁTICA do desenho físico (v1.9.12): ao GERAR com escala "auto", escolhe a MAIOR escala da
   norma (HX.PHYS_SCALES: 1:1, 1:2, 1:2,5, 1:5, 1:10…) em que o chicote cabe na ÁREA LIVRE da folha — dentro da moldura,
   acima da lista de materiais e do diagrama de ligação — e centraliza o chicote nessa área. Atualizar (folha já existe)
   não mexe na posição que o usuário ajustou. */
(function (G) {
  'use strict';
  var HX = G.HX; if (!HX.applyPhysical || !HX.physRescale) return;
  var NOOP = function () {}, CHI = { pnode: 1, pseg: 1, pacc: 1, pball: 1, ptag: 1, pdim: 1, pdimx: 1, pnote: 1, pcov: 1, pimg: 1 };
  function fake() { var g = {}; ['rect', 'line', 'push', 'pop', 'style', 'poly', 'circle', 'text'].forEach(function (k) { g[k] = NOOP; }); g.image = function () { return false; }; return g; }
  function boxes(p, s) { try { HX.drawSheetItems(fake(), p, s, {}); } catch (e) { /* só para medir */ } }
  function uni(L) { var b = null; L.forEach(function (r) { if (!r || r.x1 - r.x0 <= 0 && r.y1 - r.y0 <= 0) return; b = b ? { x0: Math.min(b.x0, r.x0), y0: Math.min(b.y0, r.y0), x1: Math.max(b.x1, r.x1), y1: Math.max(b.y1, r.y1) } : { x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1 }; }); return b; }
  function bbOf(it) { var E = HX.ITEM_EXT[it.type]; try { return E && E.bbox ? E.bbox(it) : null; } catch (e) { return null; } }
  /* área livre: área útil da folha menos a faixa das tabelas (lista de materiais / diagrama) embaixo */
  HX.physFreeArea = function (p, sh) { var A = HX.usableArea(p), top = A.y1;
    sh.items.forEach(function (i) { if (i.type === 'ptable') { var b = bbOf(i); if (b && b.y1 - b.y0 > 0 && b.y0 > A.y0 + (A.y1 - A.y0) * 0.35) top = Math.min(top, b.y0); } });
    return { x0: A.x0 + 4, y0: A.y0 + 14, x1: A.x1 - 4, y1: top - 6 }; };
  HX.physChiBox = function (sh) { return uni(sh.items.filter(function (i) { return CHI[i.type]; }).map(bbOf)); };
  HX.physAutoFit = function (p, sh, si) {
    boxes(p, si); var R = HX.physFreeArea(p, sh), B = HX.physChiBox(sh); if (!B || R.x1 <= R.x0 || R.y1 <= R.y0) return sh.scale;
    var S0 = +sh.scale || 5, ok = null;
    function fits(b) { return b && b.x1 - b.x0 <= (R.x1 - R.x0) * 0.95 && b.y1 - b.y0 <= (R.y1 - R.y0) * 0.95; }
    function clash() { var C = sh.items.filter(function (i) { return i.type === 'pnode' && i.nkind === 'conn'; }).map(bbOf);
      for (var i = 0; i < C.length; i++) for (var j = i + 1; j < C.length; j++) { var a = C[i], c = C[j]; if (a && c && a.x0 < c.x1 && c.x0 < a.x1 && a.y0 < c.y1 && c.y0 < a.y1) return true; } return false; }
    /* da maior escala para a menor: a primeira que cabe e em que um conector não encosta no outro (conector não encolhe com a escala) */
    HX.PHYS_SCALES.slice().sort(function (a, b) { return a - b; }).some(function (N) { HX.physRescale(sh, N); boxes(p, si); if (fits(HX.physChiBox(sh)) && !clash()) { ok = N; return true; } return false; });
    if (ok == null) { HX.physRescale(sh, S0); boxes(p, si); }
    B = HX.physChiBox(sh) || B;
    /* centraliza; se não couber, encosta no topo/esquerda da área (nunca sai da moldura) */
    var dx = B.x1 - B.x0 <= R.x1 - R.x0 ? (R.x0 + R.x1) / 2 - (B.x0 + B.x1) / 2 : R.x0 - B.x0, dy = B.y1 - B.y0 <= R.y1 - R.y0 ? (R.y0 + R.y1) / 2 - (B.y0 + B.y1) / 2 : R.y0 - B.y0;
    sh.items.forEach(function (i) { if (i.type === 'pnode' || i.type === 'pimg') { i.x = HX.r3(i.x + dx); i.y = HX.r3(i.y + dy); } });
    boxes(p, si);
    /* vistas frontais que caíram em cima da lista de materiais/diagrama: em fila, da esquerda, na mesma altura */
    var T = sh.items.filter(function (i) { return i.type === 'ptable'; }).map(bbOf).filter(Boolean), F = sh.items.filter(function (i) { return i.type === 'pface'; });
    function hit(b) { return T.some(function (t) { return b.x0 < t.x1 && t.x0 < b.x1 && b.y0 < t.y1 && t.y0 < b.y1; }); }
    if (F.some(function (f) { var b = bbOf(f); return b && hit(b); })) { var x = R.x0 + 6; F.map(function (f) { return [f, bbOf(f)]; }).filter(function (e) { return e[1]; }).sort(function (a, c) { return a[1].x0 - c[1].x0; })
      .forEach(function (e) { var w = e[1].x1 - e[1].x0; e[0].x = HX.r3(e[0].x + x - e[1].x0); x += w + 8; }); boxes(p, si); }
    return sh.scale; };
  var ap0 = HX.applyPhysical;
  HX.applyPhysical = function (doc, opt) { opt = opt || {}; var auto = opt.scale === 'auto' || opt.scale === 0, old = doc.p.sheets.filter(HX.isPhys)[0];
    var sync = old && !opt.rebuild && old.items.some(function (i) { return i.type === 'pseg'; }); /* atualizar: mantém escala e posições */
    var r = ap0.call(this, doc, auto ? Object.assign({}, opt, { scale: sync ? +old.scale || 5 : 5 }) : opt);
    if (auto && r && !r.error && r.sheet && !r.synced) { r.autoScale = HX.physAutoFit(doc.p, r.sheet, r.index); }
    return r; };
})(typeof window !== 'undefined' ? window : globalThis);
