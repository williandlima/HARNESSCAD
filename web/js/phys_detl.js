/* HarnessCAD - PRIMITIVAS DE TRAÇO DETALHADO para os detalhes típicos (catálogo de detalhes): desenho técnico em
   traço, mas fiel ao real — trama tecida da cordoalha (cestinha), fio com isolação e filamentos torcidos, termo-retrátil
   com as pontas contraídas, luva de solda (anel de solda + anéis de vedação), amarração com voltas e nó, contato com
   barril crimpado e janela de inspeção, cotas com tolerância e balões. Tudo em mm do papel. HX.DL.* */
(function (G) {
  'use strict';
  var HX = G.HX, L = HX.DL = {};
  L.arrow = function (g, x, y, ux, uy, col, a) { a = a || 1.2; var w = a * 0.3; g.style({ fill: col, stroke: col }); g.poly([[x, y], [x - ux * a - uy * w, y - uy * a + ux * w], [x - ux * a + uy * w, y - uy * a - ux * w]], true); g.style({ fill: null }); };
  L.inPoly = function (P, x, y) { var c = false; for (var i = 0, j = P.length - 1; i < P.length; j = i++) { var a = P[i], b = P[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  L.rect = function (x, y, w, h) { return [[x, y - h / 2], [x + w, y - h / 2], [x + w, y + h / 2], [x, y + h / 2]]; };
  L.zig = function (x, y, w, h, amp) { var P = [], n = Math.max(3, Math.round(w / 2.2)), m = Math.max(2, Math.round(h / 2.2)), i;
    for (i = 0; i <= n; i++) P.push([x + w * i / n, y - h / 2 - (i % 2 ? amp : 0)]); for (i = 1; i <= m; i++) P.push([x + w + (i % 2 ? amp : 0), y - h / 2 + h * i / m]);
    for (i = n - 1; i >= 0; i--) P.push([x + w * i / n, y + h / 2 + ((n - i) % 2 ? amp : 0)]); for (i = m - 1; i >= 1; i--) P.push([x - (i % 2 ? amp : 0), y - h / 2 + h * i / m]); return P; };
  /* hachura recortada no polígono (ângulos em graus, passo st) */
  L.hatch = function (g, P, st, angs) { if (!(st > 0.02)) return;
    (angs || [45, -45]).forEach(function (an) { var a = an * Math.PI / 180, v = [Math.cos(a), Math.sin(a)], n = [-v[1], v[0]], ns = P.map(function (p) { return p[0] * n[0] + p[1] * n[1]; }), lo = Math.min.apply(null, ns), hi = Math.max.apply(null, ns);
      for (var c = lo + st / 2; c < hi; c += st) { var U = [];
        for (var i = 0; i < P.length; i++) { var p = P[i], q = P[(i + 1) % P.length], s1 = ns[i] - c, s2 = ns[(i + 1) % P.length] - c; if (s1 * s2 < 0) { var t = s1 / (s1 - s2), x = p[0] + (q[0] - p[0]) * t, y = p[1] + (q[1] - p[1]) * t; U.push([x * v[0] + y * v[1], x, y]); } }
        U.sort(function (A, B) { return A[0] - B[0]; }); for (var j = 0; j + 1 < U.length; j += 2) g.line(U[j][1], U[j][2], U[j + 1][1], U[j + 1][2]); } });
  };
  /* trama tecida da cordoalha: células alternadas com feixes de 3 fios em "/" e "\" (aspecto de cesta, como nas pranchas) */
  L.weave = function (g, P, col, p, lw) {
    p = p || 1.1; var xs = P.map(function (q) { return q[0]; }), ys = P.map(function (q) { return q[1]; }), x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    g.style({ stroke: col, lw: lw || 0.25, fill: '#fff' }); g.poly(P, true); g.style({ fill: null, lw: 0.09 });
    for (var i = 0; x0 + i * p < x1; i++) for (var j = 0; y0 + j * p < y1; j++) {
      var cx = x0 + (i + 0.5) * p, cy = y0 + (j + 0.5) * p, s = (i + j) % 2 ? 1 : -1, h = p * 0.46; if (!L.inPoly(P, cx, cy)) continue;
      var v = [0.7071, s * 0.7071], nv = [-v[1], v[0]];
      for (var k = -1; k <= 1; k++) { var o = k * p * 0.26, ax = cx + nv[0] * o - v[0] * h, ay = cy + nv[1] * o - v[1] * h, bx = cx + nv[0] * o + v[0] * h, by = cy + nv[1] * o + v[1] * h;
        if (L.inPoly(P, ax, ay) && L.inPoly(P, bx, by)) g.line(ax, ay, bx, by); } }
    g.style({ lw: lw || 0.25 }); g.poly(P, true);
  };
  /* faixa escura (barbante enrolado / anel de solda): hachura densa */
  L.band = function (g, x, y, w, h, col, st) { var P = L.rect(x, y, w, h); g.style({ stroke: col, lw: 0.22, fill: '#fff' }); g.poly(P, true); g.style({ fill: null, lw: 0.08 }); L.hatch(g, P, st || 0.3, [70]); g.style({ lw: 0.22 }); g.poly(P, true); };
  /* filamentos do condutor (torcidos): linhas paralelas + traços de passo */
  L.cond = function (g, x0, x1, y, dc, col) { var n = 5, i; g.style({ stroke: col, lw: 0.1, fill: null }); for (i = 0; i < n; i++) { var yy = y - dc / 2 + dc * i / (n - 1); g.line(x0, yy, x1, yy); }
    for (var x = x0 + dc * 0.6; x < x1 - 0.2; x += dc * 0.9) g.line(x, y - dc / 2, Math.min(x1, x + dc * 0.45), y + dc / 2); };
  /* fio com isolação: corpo, ponta cortada (c0/c1 = 'cut' | 'none') */
  L.wire = function (g, x0, x1, y, d, col, c0, c1) { g.style({ stroke: col, lw: 0.22, fill: '#fff' }); g.rect(x0, y - d / 2, x1 - x0, d); g.style({ fill: null }); g.style({ stroke: '#fff', lw: 0.3 }); if (c0 === 'none') g.line(x0, y - d / 2 + 0.15, x0, y + d / 2 - 0.15); if (c1 === 'none') g.line(x1, y - d / 2 + 0.15, x1, y + d / 2 - 0.15);
    g.style({ stroke: col, lw: 0.07 }); g.line(x0 + 0.3, y - d * 0.28, x1 - 0.3, y - d * 0.28); g.style({ lw: 0.22 }); };
  /* fios expostos (feixe de n fios finos, sem capa) */
  L.wires = function (g, x0, x1, y, w, n, col) { g.style({ stroke: col, lw: 0.12, fill: null }); for (var i = 0; i < n; i++) { var yy = y - w / 2 + w * i / Math.max(1, n - 1); g.line(x0, yy, x1, yy); } };
  /* termo-retrátil contraído: corpo D, pontas afinando até dw; brilho (2 linhas finas) */
  L.shrink = function (g, x0, x1, y, D, dw, col, tr) { var t = Math.min((x1 - x0) / 4, D * 0.5), P = [[x0, y - dw / 2], [x0 + t, y - D / 2], [x1 - t, y - D / 2], [x1, y - dw / 2], [x1, y + dw / 2], [x1 - t, y + D / 2], [x0 + t, y + D / 2], [x0, y + dw / 2]];
    g.style({ stroke: col, lw: 0.25, fill: tr ? null : '#fff' }); g.poly(P, true); g.style({ fill: null, lw: 0.07 }); g.line(x0 + t, y - D * 0.32, x1 - t, y - D * 0.32); g.line(x0 + t * 1.5, y - D * 0.22, x1 - t * 1.5, y - D * 0.22); g.style({ lw: 0.25 }); return P; };
  /* luva de solda: tubo transparente, anel de solda no meio (hachura densa) e anéis de vedação nas pontas */
  L.ssleeve = function (g, x, y, w, D, dw, col) { L.shrink(g, x, x + w, y, D, dw, col, true); /* tubo transparente: vê-se a cordoalha */ L.band(g, x + w * 0.44, y, w * 0.12, D * 0.82, col, 0.22);
    [0.2, 0.8].forEach(function (f) { g.style({ stroke: col, lw: 0.2, fill: '#fff' }); g.rect(x + w * f - w * 0.035, y - D * 0.43, w * 0.07, D * 0.86); g.style({ fill: null, lw: 0.07 }); g.line(x + w * f, y - D * 0.43, x + w * f, y + D * 0.43); }); };
  /* amarração: n voltas cruzadas sobre o feixe e o nó com as pontas cortadas */
  L.tie = function (g, x, y, D, col, n) { n = n || 3; var w = D * 0.28 * n; g.style({ stroke: col, lw: 0.18, fill: null });
    for (var i = 0; i < n; i++) { var a = x - w / 2 + w * i / Math.max(1, n - 1) * 0.9; g.line(a - D * 0.12, y - D / 2 - 0.1, a + D * 0.12, y + D / 2 + 0.1); g.line(a + D * 0.05, y - D / 2 - 0.1, a + D * 0.29, y + D / 2 + 0.1); }
    var ky = y - D / 2 - 0.9; g.circle(x - 0.45, ky, 0.55); g.circle(x + 0.45, ky, 0.55); g.line(x + 0.8, ky - 0.3, x + 2.2, ky - 1.6); g.line(x + 0.6, ky - 0.5, x + 1.6, ky - 1.9); };
  /* contato fechado (MIL) com barril crimpado (indentações de 4 pontos) e janela de inspeção; x = boca do barril */
  L.contact = function (g, x, y, D, Lb, Lp, dp, col, crimped) { var h = D / 2;
    g.style({ stroke: col, lw: 0.25, fill: '#fff' }); g.rect(x, y - h, Lb, D); g.style({ fill: null }); g.rect(x + Lb, y - h * 1.25, D * 0.5, h * 2.5); g.rect(x + Lb + D * 0.5, y - h * 0.8, D * 0.9, h * 1.6);
    g.poly([[x + Lb + D * 1.4, y - dp / 2], [x + Lb + D * 1.4 + Lp, y - dp / 2], [x + Lb + D * 1.4 + Lp + dp * 0.4, y], [x + Lb + D * 1.4 + Lp, y + dp / 2], [x + Lb + D * 1.4, y + dp / 2]], true);
    g.circle(x + Lb * 0.72, y - h * 0.15, Math.min(h * 0.32, Lb * 0.12)); /* janela de inspeção */
    if (crimped) { g.style({ lw: 0.1 }); [0.3, 0.5].forEach(function (f) { var cx = x + Lb * f; g.poly([[cx, y - h * 0.55], [cx + h * 0.35, y], [cx, y + h * 0.55], [cx - h * 0.35, y]], true); }); g.style({ lw: 0.25 }); }
    return x + Lb + D * 1.4 + Lp + dp * 0.4; };
  /* cotas, balões e notas: phys_detl2.js */
})(typeof window !== 'undefined' ? window : globalThis);
