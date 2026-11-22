/* HarnessCAD - DESENHO DO DIAGRAMA DE LIGAÇÃO (padrão da casa) a partir de HX.physDiagram (phys_table4.js): blocos dos
   conectores com cantos arredondados, pino dentro e sinal fora, fios retos; emenda = barra vertical com o ponto e o nome
   (SP1…) ligando todos os pinos da rede; jumper = "U" junto ao bloco; trança dos pares e dreno do cabo como antes. */
(function (G) {
  'use strict';
  var HX = G.HX; if (!HX.WD) return;
  HX.wiringDraw = function (g, it, p, C, col) {
    var WD = HX.WD, D = HX.physDiagram(p), R = [], rh = +it.rh || 3.0, fs = +it.fs || 1.6, x = it.x, y = it.y, W = +it.w || 170, bw = 6.5, nw = 0;
    var cl = null, cr = null; D.rows.forEach(function (r) { /* 3 linhas de folga entre blocos de conectores diferentes do mesmo lado (ref e PN não se encostam) */
      if (r.L && cl && r.L.ref !== cl || r.R && cr && r.R.ref !== cr) R.push({ gap: 1 }, { gap: 1 }, { gap: 1 }); if (r.L) cl = r.L.ref; if (r.R) cr = r.R.ref; R.push(r); });
    R.forEach(function (r) { [r.L, r.R].forEach(function (e) { if (e) nw = Math.max(nw, HX.textW(e.name, fs)); }); }); nw = Math.min(42, nw + 1.8);
    var xl = x + nw, xr = x + W - nw - bw, top = y + 4, Y = function (i) { return top + 1.5 + rh * (i + 0.5); };
    function span(side) { var S = [], cur = null; R.forEach(function (r, i) { var e = r[side], ref = e ? e.ref : null; if (ref && (!cur || cur.ref !== ref)) { cur = { ref: ref, c: e.c, i0: i, i1: i }; S.push(cur); } else if (ref && cur) cur.i1 = i; }); return S; }
    [['L', xl, 1], ['R', xr, -1]].forEach(function (s) {
      span(s[0]).forEach(function (b) {
        var y0 = Y(b.i0) - rh / 2 - 1.2, h = (b.i1 - b.i0 + 1) * rh + 2.4; WD.block(g, s[1], y0, bw, h, s[2], col);
        g.text(b.ref, s[1] + bw / 2, y0 - 1.6, { size: fs, align: 'c', color: col }); if (b.c) g.text(HX.connPN(b.c), s[1] + bw / 2, y0 + h + 2, { size: fs, align: 'c', color: col });
        var male = b.c && b.c.gender === 'P', ym = y0 + h / 2; /* divisa dentro do bloco, na face: macho aponta para fora, fêmea aberta para a face */
        if (s[2] > 0) WD.chev(g, male ? s[1] + 1.4 : s[1] + 0.3, ym, male ? -1 : 1, col); else WD.chev(g, male ? s[1] + bw - 1.4 : s[1] + bw - 0.3, ym, male ? 1 : -1, col);
      });
    });
    var xa = xl + bw, xb = xr, tl = xa + 9, tr = xb - 9, lab = function (r) { var t = []; if (r.gauge && r.gauge !== D.gauge) t.push(r.gauge); if (r.color && (r.color !== D.color || r.cable)) t.push(HX.colorAbbr(r.color)); return t.join(' - '); };
    var NX = {}, nn = 0; R.forEach(function (r) { if (r.net && NX[r.net] == null) NX[r.net] = xa + 14 + (xb - xa - 28) * (0.45 + 0.12 * ((nn++ % 5) - 2)); }); /* x da barra de cada emenda */
    R.forEach(function (r, i) {
      var yy = Y(i); g.style({ stroke: col, lw: 0.15, dash: null });
      if (r.L) { g.text(r.L.pin, xl + bw - 0.8, yy, { size: fs, align: 'r', color: col }); g.text(r.L.name, xl - 1.0, yy, { size: fs, align: 'r', color: col }); }
      if (r.R) { g.text(r.R.pin, xr + 0.8, yy, { size: fs, color: col }); g.text(r.R.name, xr + bw + 1.0, yy, { size: fs, color: col }); }
      if (r.drain) { if (r.L) g.poly([[xa, yy], [tl, yy], [tl, Y(i - 1) + 1.1]], false); if (r.R) g.poly([[xb, yy], [tr, yy], [tr, Y(i - 1) + 1.1]], false); return; }
      if (r.jmp || r.gap) return; /* pino só com jumper: o "U" é desenhado abaixo */
      var x0, x1;
      if (r.net) { var sx = NX[r.net]; x0 = r.L ? xa : sx; x1 = r.R ? xb : sx; g.line(x0, yy, x1, yy); }
      else { x0 = r.L ? xa : (x + W) / 2 - 6; x1 = r.R ? xb : (x + W) / 2 + 6; g.line(x0, yy, x1, yy);
        [[r.lo, x0, 'r'], [r.ro, x1, 'l']].forEach(function (o) { if (!o[0]) return; g.style({ fill: col }); g.circle(o[1], yy, 0.35); g.style({ fill: null }); g.text(o[0].ref, o[1] + (o[2] === 'r' ? -0.8 : 0.8), yy - 0.9, { size: fs * 0.85, align: o[2], color: col }); }); }
      var t = lab(r); if (t) g.text(t, r.L ? (xa + Math.min(x1, xa + 30)) / 2 : (Math.max(x0, xb - 30) + xb) / 2, yy - 0.75, { size: fs * 0.9, align: 'c', color: col });
    });
    Object.keys(NX).forEach(function (n) { var I = [], m = 0, sp = ''; R.forEach(function (r, i) { if (r.net === +n) { I.push(i); if (r.main) { m = i; sp = r.sp; } } });
      var sx = NX[n]; g.style({ stroke: col, lw: 0.15, dash: null }); if (I.length > 1) g.line(sx, Y(I[0]), sx, Y(I[I.length - 1]));
      g.style({ fill: col }); g.circle(sx, Y(m), 0.45); g.style({ fill: null }); if (sp) g.text(sp, sx + 0.8, Y(m) - 0.9, { size: fs * 0.85, color: col }); });
    (D.jumps || []).forEach(function (j, k) { var ia = -1, ib = -1; R.forEach(function (r, i) { var e = r[j.s]; if (e && e.ref === j.ref) { if (e.pin === j.a) ia = i; if (e.pin === j.b) ib = i; } });
      if (ia < 0 || ib < 0) return; var xe = j.s === 'L' ? xa : xb, xj = xe + (j.s === 'L' ? 1 : -1) * (3 + 1.5 * (k % 3)); g.style({ stroke: col, lw: 0.15, dash: null }); g.poly([[xe, Y(ia)], [xj, Y(ia)], [xj, Y(ib)], [xe, Y(ib)]], false); });
    var i0 = 0; R.forEach(function (r, i) { /* símbolo de trança nas duas pontas de cada par do mesmo cabo */
      var nx = R[i + 1]; if (!r.drain && nx && !nx.drain && nx.cable && nx.cable === r.cable) return;
      if (r.cable && !r.drain && i > i0) { [tl, tr].forEach(function (tx) { WD.twist(g, tx, Y(i0) - 0.4, Y(i) + 0.4, col); g.style({ stroke: col, lw: 0.15, fill: '#fff' }); g.circle(tx, Y(i) + 1.1, 0.45); g.style({ fill: null }); }); }
      i0 = i + 1;
    });
    var yb = Y(R.length - 1) + rh / 2 + 4.5, gg = D.gauge, mixed = R.some(function (r) { return !r.drain && r.gauge && r.gauge !== gg; });
    if (gg) g.text(mixed ? 'OBS: TODOS OS CABOS SÃO BITOLA ' + gg.replace(/\s+/g, '') + ', EXCETO ONDE INDICADO.' : 'TODOS OS CABOS SÃO BITOLA ' + gg + '.', x + W / 2, yb, { size: fs, align: 'c', color: col });
    if (!R.length) g.text('sem fios no esquemático', x + W / 2, top + 4, { size: fs, align: 'c', color: col });
    return { x0: x, y0: y, x1: x + W, y1: yb + 1.5 };
  };
})(typeof window !== 'undefined' ? window : globalThis);
