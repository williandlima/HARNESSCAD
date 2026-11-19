/* HarnessCAD - DETALHE TÍPICO DA MONTAGEM DA CORDOALHA (padrão da casa, item 'pcord'): 3 etapas em traço —
   1) cabo com o espaguete (16) sobre os fios e a cordoalha recuada; cotas 5 ±1 TIP., 50 ±1 TIP., 60 ±5;
   2) cordoalha do adaptador (5 REF), barbante (20) amarrando e a cordoalha da cablagem vestida (14 REF);
   3) luva de solda (8) unindo a cordoalha do adaptador à da cablagem.
   Balões pelo número da lista de materiais (ou número digitado); notas em triângulo opcionais. Na lista entra o
   espaguete sob a cordoalha (comprimento × pontas com adaptador). Posição x, y (arrastar); escala de detalhe 'esc'. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT; if (!EXT) return;
  var num = HX.cordNum = function (v, d) { return v === '' || v == null || isNaN(+v) ? d : +v; };
  function arrow(g, x, y, ux, uy, col, a) { a = a || 1.3; var w = a * 0.3; g.style({ fill: col, stroke: col }); g.poly([[x, y], [x - ux * a - uy * w, y - uy * a + ux * w], [x - ux * a + uy * w, y - uy * a - ux * w]], true); g.style({ fill: null }); }
  /* hachura cruzada recortada num polígono qualquer (cordoalha) */
  function hatch(g, P, st) {
    [45, -45].forEach(function (an) { var a = an * Math.PI / 180, v = [Math.cos(a), Math.sin(a)], n = [-v[1], v[0]], ns = P.map(function (p) { return p[0] * n[0] + p[1] * n[1]; }), lo = Math.min.apply(null, ns), hi = Math.max.apply(null, ns);
      for (var c = lo + st / 2; c < hi; c += st) { var U = [];
        for (var i = 0; i < P.length; i++) { var p = P[i], q = P[(i + 1) % P.length], s1 = ns[i] - c, s2 = ns[(i + 1) % P.length] - c; if (s1 * s2 < 0) { var t = s1 / (s1 - s2), x = p[0] + (q[0] - p[0]) * t, y = p[1] + (q[1] - p[1]) * t; U.push([x * v[0] + y * v[1], x, y]); } }
        U.sort(function (A, B) { return A[0] - B[0]; }); for (var j = 0; j + 1 < U.length; j += 2) g.line(U[j][1], U[j][2], U[j + 1][1], U[j + 1][2]); } });
  }
  function rect(x, y, w, h) { return [[x, y - h / 2], [x + w, y - h / 2], [x + w, y + h / 2], [x, y + h / 2]]; }
  function zig(x, y, w, h, amp) { var P = [], n = Math.max(3, Math.round(w / 2.2)), m = Math.max(2, Math.round(h / 2.2)), i;
    for (i = 0; i <= n; i++) P.push([x + w * i / n, y - h / 2 - (i % 2 ? amp : 0)]); for (i = 1; i <= m; i++) P.push([x + w + (i % 2 ? amp : 0), y - h / 2 + h * i / m]);
    for (i = n - 1; i >= 0; i--) P.push([x + w * i / n, y + h / 2 + ((n - i) % 2 ? amp : 0)]); for (i = m - 1; i >= 1; i--) P.push([x - (i % 2 ? amp : 0), y - h / 2 + h * i / m]); return P; }
  function braid(g, P, col, st) { g.style({ stroke: col, lw: 0.25, fill: '#fff' }); g.poly(P, true); g.style({ fill: null, lw: 0.1 }); hatch(g, P, st); g.style({ lw: 0.25 }); g.poly(P, true); }
  /* número do balão pela lista de materiais */
  var KEYS = { n16: [/^cesp:/, /sob a cordoalha/i], n5: [/^d:(pre_|adp)/, /adaptador/i], n20: [/^barb:/, /barbante/i], n14: [/^u:cov_braid/, /cordoalha \(blindagem/i], n8: [/^ss:/, /luva de solda/i] };
  function bnum(it, k, B) { if (it[k] !== '' && it[k] != null) return String(it[k]); var R = (B && B.rows) || [], r = R.filter(function (q) { return KEYS[k][0].test(q.k); })[0] || R.filter(function (q) { return KEYS[k][1].test(q.desc || ''); })[0]; return r ? String(r.n) : '?'; }
  EXT.pcord = {
    draw: function (g, it, p, s, o) {
      var C = HX.physCtx(p, s, o), col = C.line ? C.col : (o.theme && o.theme.txt) || '#222', k = num(it.esc, 1), X = +it.x || 0, Y = +it.y || 0, d = num(it.dia, 6) * k, fs = 1.6, r = +C.sh.ballR || 2.6;
      if (!o._bom) o._bom = HX.physBom(p, C.sh); var B = o._bom, tip = it.tip == null ? 'TIP.' : it.tip;
      var a1 = num(it.d1, 5) * k, a2 = num(it.d2, 50) * k, a3 = num(it.d3, 60) * k, y1 = Y + 14, y2 = y1 + d * 1.1 + 22, y3 = y2 + d * 1.3 + 20, bb = { x0: X - 4, y0: Y, x1: X, y1: y3 + 22 };
      function ball(k2, x, y, tx, ty, ref, nt) { var n = bnum(it, k2, B), dx = tx - x, dy = ty - (y - r), L = Math.hypot(dx, dy) || 1; g.style({ stroke: col, lw: 0.22, fill: null }); g.line(x, y - r, tx, ty); arrow(g, tx, ty, dx / L, dy / L, col);
        g.style({ fill: '#fff' }); g.circle(x, y, r); g.style({ fill: null }); g.text(n, x, y, { size: r * 0.85, align: 'c', color: col });
        if (ref) g.text('REF', ref < 0 ? x - r - 0.8 : x + r + 0.8, y, { size: 1.4, align: ref < 0 ? 'r' : 'l', color: col });
        if (nt) { var nx = x - r - 4.2; g.poly([[nx, y + 1.6], [nx + 3.4, y + 1.6], [nx + 1.7, y - 1.5]], true); g.text(String(nt), nx + 1.7, y + 0.5, { size: 1.3, align: 'c', color: col }); }
        bb.x1 = Math.max(bb.x1, x + r + 6); }
      function dim(x0, x1, yd, v, tl, tp, yt) { g.style({ stroke: col, lw: 0.15, fill: null, dash: null }); g.line(x0, yt, x0, yd - 1); g.line(x1, yt, x1, yd - 1); g.line(x0 - (x1 - x0 < 4 ? 3 : 0), yd, x1, yd);
        var nar = x1 - x0 < 4; arrow(g, x0, yd, nar ? 1 : -1, 0, col, 1); arrow(g, x1, yd, nar ? -1 : 1, 0, col, 1); if (nar) g.line(x1, yd, x1 + 2.5, yd);
        var cx = nar ? x0 - 2 - HX.textW(String(v), fs) / 2 : (x0 + x1) / 2; var yv = yd - (tp ? 3.1 : 1.6); g.text(String(v), cx, yv, { size: fs, align: 'c', color: col }); if (tl) g.text(tl, cx + HX.textW(String(v), fs) / 2 + 0.3, yv - 0.8, { size: 1.1, color: col });
        if (tp) g.text(tp, cx, yd - 1.1, { size: 1.1, align: 'c', color: col }); }
      /* etapa 1: cabo com espaguete (16) e cordoalha recuada */
      var x = X, wl = d * 0.62; g.style({ stroke: col, lw: 0.25, fill: null }); braid(g, rect(x, y1, a1, d * 0.7), col, 0.45);
      var xe = x + a1 + a2 + a3 + 6 * k; for (var i = 0; i < 4; i++) { var yy = y1 - wl / 2 + wl * i / 3; g.style({ stroke: col, lw: 0.12 }); g.line(x + a1, yy, xe, yy); }
      g.style({ stroke: col, lw: 0.25, fill: '#fff' }); g.rect(x + a1 + a2, y1 - d / 2, a3, d); g.style({ fill: null });
      braid(g, zig(xe, y1, 16 * k, d * 1.9, 0.9), col, 0.55);
      var t1 = it.t1 == null ? '±1' : it.t1, t2 = it.t2 == null ? '±1' : it.t2, t3 = it.t3 == null ? '±5' : it.t3, yt = y1 - d / 2 - 0.6;
      dim(x, x + a1, Y + 6, num(it.d1, 5), t1, tip, y1 - d * 0.35 - 0.6); dim(x + a1, x + a1 + a2, Y + 6, num(it.d2, 50), t2, tip, yt + d * 0.15); dim(x + a1 + a2, x + a1 + a2 + a3, Y + 6, num(it.d3, 60), t3, '', yt);
      ball('n16', x + a1 + a2 + a3 * 0.45, y1 + d / 2 + 9, x + a1 + a2 + a3 * 0.55, y1 + d / 2, 0, it.nt16); bb.x1 = Math.max(bb.x1, xe + 18 * k);
      /* etapa 2: cordoalha do adaptador (5), barbante (20), cordoalha da cablagem (14) */
      var hb = d * 1.25, xa = X + 1, wz = 18 * k; braid(g, zig(xa, y2, wz, d * 1.9, 0.9), col, 0.55);
      var xw = xa + wz, xb = xw + 7 * k; for (i = 0; i < 4; i++) { yy = y2 - wl / 2 + wl * i / 3; g.style({ stroke: col, lw: 0.12 }); g.line(xw, yy, xb + 2, yy); }
      var Lb = num(it.lb, 85) * k; braid(g, [[xb, y2 - hb / 2], [xb + Lb * 0.3, y2 - hb / 2], [xb + Lb * 0.36, y2 - hb * 0.62], [xb + Lb, y2 - hb * 0.62], [xb + Lb, y2 + hb * 0.62], [xb + Lb * 0.36, y2 + hb * 0.62], [xb + Lb * 0.3, y2 + hb / 2], [xb, y2 + hb / 2]], col, 0.6);
      braid(g, rect(xb, y2, 4 * k, hb + 0.4), col, 0.25); /* barbante amarrando a ponta da cordoalha */
      ball('n5', xa + wz * 0.5, y2 + d + 9, xa + wz * 0.35, y2 + d * 0.95, -1); ball('n20', xb + 6, y2 + d + 9, xb + 2 * k, y2 + hb / 2 + 0.2); ball('n14', xb + Lb - 2, y2 + d + 9, xb + Lb - 4, y2 + hb * 0.62, 1);
      /* etapa 3: luva de solda (8) unindo as cordoalhas */
      var xc = X + 9 * k, L3 = num(it.l3, 80) * k, hs = d * 1.3, sx = xc + L3 * 0.36, sw = 22 * k; braid(g, rect(xc, y3, L3, hs), col, 0.6); braid(g, rect(xc + L3 - 6 * k, y3, 6 * k, hs + 0.3), col, 0.25);
      g.style({ stroke: col, lw: 0.25, fill: null }); g.rect(sx, y3 - hs * 0.68, sw, hs * 1.36);
      [[0.22, 0.09], [0.5, 0.14], [0.78, 0.09]].forEach(function (q) { g.style({ stroke: col, lw: 0.25, fill: '#fff' }); g.rect(sx + sw * q[0] - sw * q[1] / 2, y3 - hs * 0.68, sw * q[1], hs * 1.36); g.style({ fill: null }); }); /* anéis de solda e de vedação */
      ball('n8', sx + sw * 0.62, y3 + d + 8, sx + sw * 0.62, y3 + hs * 0.68, 0, null); if (it.nt8) { var nx = sx + sw * 0.62 + r + 0.8, ny = y3 + d + 8; g.style({ stroke: col, lw: 0.22 }); g.poly([[nx, ny + 1.6], [nx + 3.4, ny + 1.6], [nx + 1.7, ny - 1.5]], true); g.text(String(it.nt8), nx + 1.7, ny + 0.5, { size: 1.3, align: 'c', color: col }); }
      var lab = it.label === '' || it.label == null ? 'DETALHE B' : it.label === '-' ? '' : it.label; if (lab) g.text(lab, X, y3 + d + 19, { size: 3.2, bold: true, color: col });
      bb.x1 = Math.max(bb.x1, xb + Lb + 8, xc + L3 + 2); HX.physHide(it, '_bb', bb);
    },
    bbox: function (it) { return it._bb || { x0: +it.x || 0, y0: +it.y || 0, x1: (+it.x || 0) + 10, y1: (+it.y || 0) + 10 }; }
  };
  /* campos, inserir e lista de materiais: phys_cord2.js */
})(typeof window !== 'undefined' ? window : globalThis);
