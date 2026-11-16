/* HarnessCAD - desenho físico: PREPARAÇÃO DA PONTA do cabo (pprep) — detalhe "sem escala" como nos desenhos de chicote.
   Capa cortada (A = comprimento sem capa), malha dobrada sobre a capa (B), fio dreno, condutores nas cores do
   esquemático abrindo em leque, decape do condutor (C) e contato crimpado; ao lado de cada fio: nº do fio · pino.
   Campos: of (nó do conector), A, B, C (mm), jacket, shield, drain (sim/não), contact (PN do contato), title. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, hide = HX.physHide;
  HX.HITPR.pprep = 5;
  function pinsOf(p, nd, ws) { // pino de cada fio no conector deste nó
    var out = {}, c = null; p.sheets.forEach(function (S) { if (!HX.isPhys(S)) S.items.forEach(function (i) { if (i.id === nd.of) c = i; }); });
    if (!c || c.type !== 'conn') return out; var L = HX.connLayout(c, p.unit);
    ws.forEach(function (w) { L.pins.forEach(function (q) { if (HX.same(q.pt, w.pts[0]) || HX.same(q.pt, w.pts[w.pts.length - 1])) out[w.id] = q.n; }); });
    return out;
  }
  function hatch(g, x0, y0, w, h, st, sgn) { // trama da malha (diagonais recortadas no retângulo)
    for (var k = -h; k < w; k += st) {
      var u0 = Math.max(0, -k / h), u1 = Math.min(1, (w - k) / h); if (u1 <= u0) continue;
      var X = function (u) { return x0 + k + h * u; }, Y = function (u) { return sgn > 0 ? y0 + h - h * u : y0 + h * u; };
      g.line(X(u0), Y(u0), X(u1), Y(u1));
    }
  }
  function dim(g, x0, x1, y, t, col, up) {
    g.style({ stroke: col, lw: 0.15, fill: null, dash: null }); g.line(x0, y, x1, y); g.line(x0, y - 1.2, x0, y + 1.2); g.line(x1, y - 1.2, x1, y + 1.2);
    [[x0, 1], [x1, -1]].forEach(function (e) { g.style({ fill: col }); g.poly([[e[0], y], [e[0] + 1.3 * e[1], y - 0.4], [e[0] + 1.3 * e[1], y + 0.4]], true); g.style({ fill: null }); });
    g.text(t, (x0 + x1) / 2, y + (up ? -1.6 : 1.9), { size: 1.9, align: 'c', color: col });
  }
  EXT.pprep = {
    draw: function (g, it, p, s, o) {
      var C = HX.physCtx(p, s, o), nd = C.m[it.of]; if (!nd) return;
      var BU = HX.physBundleCtx(p, s, o), ws = (BU.node[nd.id] || []).slice(0, 40), n = Math.max(1, ws.length), PIN = pinsOf(p, nd, ws);
      var col = C.line ? C.col : (o.theme && o.theme.txt) || '#222', x = +it.x || 0, y = +it.y || 0, pit = 3, H = Math.max(5, Math.min(14, n * 0.9 + 3)), cy = y + Math.max(H / 2 + 6, (n - 1) * pit / 2 + 6);
      var xj = x + 28, xf = xj + 12, xe = xf + 40, jk = it.jacket !== false, sh = !!it.shield, A = +it.A || 40, B = +it.B || 10, Cc = +it.C || 4;
      if (jk) { // capa
        g.style({ stroke: col, lw: 0.3, fill: C.line ? '#fff' : '#d6d6d2', dash: null }); g.rect(x, cy - H / 2, xj - x, H); g.style({ fill: null });
        g.style({ lw: 0.15 }); g.line(x + 2, cy - H / 2 + 0.8, xj - 1, cy - H / 2 + 0.8); // brilho
        g.style({ stroke: col, lw: 0.2, dash: [1, 0.8] }); g.line(x - 3, cy, x - 0.5, cy); g.style({ dash: null }); // continua
      }
      if (sh) { // malha dobrada para trás sobre a capa
        var b0 = xj - 10, h2 = H / 2 + 0.7; g.style({ stroke: col, lw: 0.25, fill: C.line ? '#fff' : '#bfc3c7' }); g.rect(b0, cy - h2, 10, 2 * h2); g.style({ fill: null, lw: 0.1 });
        hatch(g, b0, cy - h2, 10, 2 * h2, 1.1, 1); hatch(g, b0, cy - h2, 10, 2 * h2, 1.1, -1);
        dim(g, b0, xj, cy - H / 2 - 4, 'B = ' + B, col, true);
      }
      if (it.drain) { g.style({ stroke: '#8a8f94', lw: 0.5 }); g.poly([[xj, cy + H / 2 - 1], [xf, cy + H / 2 + 3], [xe - 8, cy + H / 2 + 3]], false); g.text('dreno', xe - 6, cy + H / 2 + 3, { size: 1.6, color: col }); }
      var top = cy, bot = cy;
      ws.forEach(function (w, i) {
        var yi = cy + (i - (n - 1) / 2) * pit, y0 = cy + (i - (n - 1) / 2) * Math.min(pit, (H - 2) / n), hex = HX.wireHex(w);
        var P = [[xj, y0], [xj + 4, y0], [xf, yi], [xe - Cc / 2 - 7, yi]];
        g.style({ stroke: '#111', lw: 1.15, fill: null }); g.poly(P, false); g.style({ stroke: hex, lw: 0.95 }); g.poly(P, false);
        var xc = xe - Cc / 2 - 7; g.style({ stroke: '#b87333', lw: 0.5 }); g.line(xc, yi, xc + 2, yi); // cobre exposto
        if (it.contact !== false) { g.style({ stroke: col, lw: 0.2, fill: C.line ? '#fff' : '#c9ccd0' }); g.rect(xc + 1, yi - 0.8, 6, 1.6); g.style({ fill: null }); g.line(xc + 3, yi - 0.8, xc + 3, yi + 0.8); g.style({ lw: 0.35 }); g.line(xc + 7, yi, xe, yi); }
        g.text(String(w.num || '') + (PIN[w.id] ? ' · ' + PIN[w.id] : ''), xe + 1.5, yi, { size: 1.7, color: col });
        top = Math.min(top, yi); bot = Math.max(bot, yi);
      });
      dim(g, xj, xe, Math.min(cy - H / 2, top) - (sh ? 9 : 4), 'A = ' + A, col, true);
      var xs = xe - Cc / 2 - 7; dim(g, xs, xs + 2, bot + 4, 'C = ' + Cc, col, false);
      var ty = Math.max(cy + H / 2, bot) + 9, lb = (nd.ref || '') + (it.title ? ' — ' + it.title : '');
      g.text('PREPARAÇÃO DA PONTA ' + lb + ' (SEM ESCALA)', x, ty, { size: 2.2, bold: true, color: col });
      g.text('A: tirar a capa · ' + (sh ? 'B: dobrar a malha sobre a capa · ' : '') + 'C: decapar o condutor' + (it.contact !== false ? ' e crimpar o contato ' + (it.contactPN || '') : ''), x, ty + 3, { size: 1.6, color: col });
      hide(it, '_bb', { x0: x - 4, y0: Math.min(cy - H / 2, top) - (sh ? 13 : 8), x1: xe + 14, y1: ty + 4.5 });
    },
    bbox: function (it) { return it._bb || { x0: +it.x, y0: +it.y, x1: +it.x + 10, y1: +it.y + 10 }; },
    hit: function (it, pt) { var b = it._bb; return b && pt[0] >= b.x0 && pt[0] <= b.x1 && pt[1] >= b.y0 && pt[1] <= b.y1 ? 0.5 : 1e9; }
  };
  HX.physAddPrep = function (doc, nd) { // lugar livre perto do conector (sem cobrir outros itens)
    var sh = doc.cur(), BU = HX.physBundle(doc.p, sh), n = Math.max(1, (BU.node[nd.id] || []).length), W = 100, H = Math.max(26, n * 3 + 26), B = nd._bb || { x0: nd.x - 10, y0: nd.y - 10, x1: nd.x + 10, y1: nd.y + 10 };
    var boxes = sh.items.filter(function (i) { return i._bb && i.type !== 'ptable'; }).map(function (i) { return i._bb; }), pg = HX.sheetDims ? HX.sheetDims(doc.p.meta) : [420, 297], best = null;
    for (var gy = 20; gy < pg[1] - 40 - H; gy += 8) for (var gx = 20; gx < pg[0] - 20 - W; gx += 8) {
      var ov = 0; boxes.forEach(function (b) { var w = Math.min(gx + W, b.x1) - Math.max(gx, b.x0), h = Math.min(gy + H, b.y1) - Math.max(gy, b.y0); if (w > 0 && h > 0) ov += w * h; });
      var sc = ov * 50 + Math.hypot(gx + W / 2 - (B.x0 + B.x1) / 2, gy + H / 2 - (B.y0 + B.y1) / 2); if (!best || sc < best.sc) best = { sc: sc, x: gx + 4, y: gy };
    }
    best = best || { x: B.x0, y: B.y1 + 25 };
    return doc.add({ type: 'pprep', id: doc.uid('r'), of: nd.id, x: HX.r3(best.x), y: HX.r3(best.y), A: 40, B: 10, C: 4, jacket: true, shield: false, drain: false, contact: true, contactPN: '', title: '' });
  };
})(typeof window !== 'undefined' ? window : globalThis);
