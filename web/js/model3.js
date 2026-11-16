/* HarnessCAD - modelagem: par trançado (w.twist = grupo), ponta não conectada (w.ncA / w.ncB), derivação (tap) e
   destaque cruzado esquema ↔ desenho físico (somente na tela): selecionar fios/conectores no esquema destaca o caminho
   deles nos ramos; selecionar um ramo/conector no físico destaca os fios no esquema. */
(function (G) {
  'use strict';
  var HX = G.HX, HL = '#ff7a00';
  if (HX.CAT && HX.CAT.splices && !HX.CAT.splices.tap) HX.CAT.splices.tap = { d: 'Derivação (tap) — sem cortar o fio principal', pn: '' };
  function mid(w) { return HX.polyAt(w.pts, 0.25); } // 1/4 do fio: longe do rótulo central
  function twistMark(g, w, col) { // duas senoides cruzadas + nome do grupo
    var q = mid(w), ux = q.d[0], uy = q.d[1];
    g.push([ux, uy, -uy, ux, q.pt[0], q.pt[1]]); g.style({ stroke: col, lw: 0.18, fill: null, dash: null });
    [1, -1].forEach(function (s) { var P = []; for (var i = 0; i <= 16; i++) { var t = i / 16; P.push([-3 + 6 * t, s * 0.9 * Math.sin(t * 2 * Math.PI)]); } g.poly(P, false); });
    if (G.HX.twistNameOn !== false) g.text(w.twist, 3.6, -0.5, { size: 1.4, align: 'l', bold: true, color: col }); g.pop();
  }
  function ncMark(g, pt, col) { var r = 1.1; g.style({ stroke: col, lw: 0.3, fill: null, dash: null }); g.line(pt[0] - r, pt[1] - r, pt[0] + r, pt[1] + r); g.line(pt[0] - r, pt[1] + r, pt[0] + r, pt[1] - r); }
  // conjunto destacado a partir da seleção atual (na outra folha)
  HX.crossHL = function (p, s, app) {
    app = app || G.app; if (!app || !app.doc || !app.doc.sel || !app.doc.sel.size) return null;
    var phys = HX.isPhys(p.sheets[s]), selW = {}, selC = {}, any = false, PH = p.sheets.filter(HX.isPhys)[0];
    app.doc.sel.forEach(function (id) {
      var f = app.doc.findAll(id); if (!f) return; var it = f.item || f.it || f, sh = p.sheets[f.sheet];
      if (!it || !sh) return;
      if (!HX.isPhys(sh)) { if (it.type === 'wire') { selW[it.id] = 1; any = true; } else if (it.type === 'conn') { selC[it.id] = 1; any = true; } }
      else if (PH && HX.physBundle) {
        var B = HX.physBundle(p, PH);
        if (it.type === 'pseg' && B.seg[it.id]) B.seg[it.id].wires.forEach(function (w) { selW[w.id] = 1; any = true; });
        if (it.type === 'pnode') { (B.node[it.id] || []).forEach(function (w) { selW[w.id] = 1; any = true; }); if (it.of) selC[it.of] = 1; }
      }
    });
    if (!any) return null;
    if (phys && Object.keys(selC).length && HX.physBundle) { var B2 = HX.physBundle(p, p.sheets[s]); Object.keys(B2.node).forEach(function (nid) { var n = p.sheets[s].items.filter(function (i) { return i.id === nid; })[0]; if (n && selC[n.of]) B2.node[nid].forEach(function (w) { selW[w.id] = 1; }); }); }
    return { w: selW, c: selC };
  };
  HX.drawOverlay = function (g, p, s, o) {
    var sh = p.sheets[s], col = (o.theme && o.theme.txt) || '#000', screen = HX.CanvasG && g instanceof HX.CanvasG;
    var H = screen ? HX.crossHL(p, s) : null;
    if (!HX.isPhys(sh)) {
      var TG = {}, sine = p.view.twistSym === 'sine' || !HX.twistGroupMark;
      sh.items.forEach(function (w) { if (w.type === 'wire' && w.twist && w.pts.length > 1) (TG[w.twist] = TG[w.twist] || []).push(w); });
      var tn = p.view.twistName !== false; Object.keys(TG).forEach(function (k) { if (!sine && HX.twistGroupMark(g, TG[k], col, tn ? k : '')) TG[k].done = 1; });
      sh.items.forEach(function (w) {
        if (w.type !== 'wire' || w.pts.length < 2) return;
        if (H && H.w[w.id]) { g.style({ stroke: HL, lw: 0.9, fill: null, dash: [1.2, 0.8] }); g.poly(w.pts, false); g.style({ dash: null }); }
        if (w.twist && !TG[w.twist].done) { HX.twistNameOn = tn; twistMark(g, w, col); }
        if (w.ncA) ncMark(g, w.pts[0], col); if (w.ncB) ncMark(g, w.pts[w.pts.length - 1], col);
      });
    } else if (H && HX.physBundle) {
      var B = HX.physBundle(p, sh), m = HX.physIdx(sh);
      sh.items.forEach(function (sg) {
        if (sg.type !== 'pseg' || !B.seg[sg.id] || !B.seg[sg.id].wires.some(function (w) { return H.w[w.id]; })) return;
        var P = HX.physSegPts(sg, m); if (P) { g.style({ stroke: HL, lw: 1.1, fill: null, dash: [1.5, 1] }); g.poly(P, false); g.style({ dash: null }); }
      });
      sh.items.forEach(function (n) { if (n.type === 'pnode' && H.c[n.of]) { g.style({ stroke: HL, lw: 0.6, fill: null }); g.circle(n.x, n.y, 3.5); } });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
