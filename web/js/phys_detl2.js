/* HarnessCAD - primitivas dos detalhes (2): cota com tolerância e TIP., balão com REF e nota em triângulo, nota com chamada. */
(function (G) {
  'use strict';
  var HX = G.HX, L = HX.DL; if (!L) return;
  /* cota horizontal: linhas de chamada desde yr0/yr1 até a linha yd, valor + tolerância + texto (TIP.) */
  L.dim = function (g, x0, x1, yd, yr0, yr1, v, tol, tip, col, fs) { fs = fs || 1.6; var nar = x1 - x0 < 4, up = yd < Math.min(yr0, yr1) ? 1 : -1;
    g.style({ stroke: col, lw: 0.13, fill: null, dash: null }); g.line(x0, yr0 - up * 0.6, x0, yd - up * 1); g.line(x1, yr1 - up * 0.6, x1, yd - up * 1); g.line(x0 - (nar ? 3 : 0), yd, x1 + (nar ? 3 : 0), yd);
    L.arrow(g, x0, yd, nar ? 1 : -1, 0, col, 1); L.arrow(g, x1, yd, nar ? -1 : 1, 0, col, 1);
    var tw = HX.textW(String(v), fs), cx = nar ? x0 - 3.5 - tw / 2 : (x0 + x1) / 2, yv = yd - (tip ? 3.1 : 1.6); g.text(String(v), cx, yv, { size: fs, align: 'c', color: col });
    if (tol) { var T = String(tol).split('/'); if (T.length > 1) { g.text(T[0], cx + tw / 2 + 0.3, yv - 0.6, { size: 1.05, color: col }); g.text(T[1], cx + tw / 2 + 0.3, yv + 0.6, { size: 1.05, color: col }); } else g.text(T[0], cx + tw / 2 + 0.3, yv - 0.8, { size: 1.1, color: col }); }
    if (tip) g.text(tip, cx, yd - 1.1, { size: 1.1, align: 'c', color: col }); };
  /* balão com seta até (tx, ty); ref = -1/1 escreve REF à esquerda/direita; nt = nota em triângulo */
  L.ball = function (g, n, x, y, tx, ty, r, col, ref, nt) { var dx = tx - x, dy = ty - (y - r), Lr = Math.hypot(dx, dy) || 1; g.style({ stroke: col, lw: 0.2, fill: null }); g.line(x + dx / Lr * r * 0.2, y - r, tx, ty); L.arrow(g, tx, ty, dx / Lr, dy / Lr, col);
    g.style({ fill: '#fff' }); g.circle(x, y, r); g.style({ fill: null }); g.text(String(n), x, y, { size: r * 0.85, align: 'c', color: col });
    if (ref) g.text('REF', ref < 0 ? x - r - 0.8 : x + r + 0.8, y, { size: 1.4, align: ref < 0 ? 'r' : 'l', color: col });
    if (nt) { var nx = (ref || 0) < 0 ? x + r + 0.8 : x - r - 4.2; g.poly([[nx, y + 1.6], [nx + 3.4, y + 1.6], [nx + 1.7, y - 1.5]], true); g.text(String(nt), nx + 1.7, y + 0.5, { size: 1.3, align: 'c', color: col }); } };
  /* nota de texto com chamada */
  L.note = function (g, t, x, y, tx, ty, col) { g.style({ stroke: col, lw: 0.13, fill: null }); if (tx != null) { g.line(x, y, tx, ty); L.arrow(g, tx, ty, (tx - x) / (Math.hypot(tx - x, ty - y) || 1), (ty - y) / (Math.hypot(tx - x, ty - y) || 1), col, 0.9); }
    String(t).split('\n').forEach(function (l, i) { g.text(l, x + 0.6, y - 0.9 + i * 1.6, { size: 1.25, color: col }); }); };
})(typeof window !== 'undefined' ? window : globalThis);
/* formatos reais (foto do kit de emendas, DETALHE B da casa, desenho TE S01/S02): tubo RETO transparente com cantos
   levemente arredondados (sem afinar nas pontas), dois anéis de vedação perto das pontas (centro a ~24 % e 76 %,
   largura ~7,5 %) e o anel de solda no meio (~15 %, um pouco mais alto, cilindro metálico com sombreado de linhas). */
(function (G) {
  'use strict';
  var HX = G.HX, L = HX.DL; if (!L) return;
  L.rrect = function (x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); var P = [], c = [[x + w - r, y - h / 2 + r, -90], [x + w - r, y + h / 2 - r, 0], [x + r, y + h / 2 - r, 90], [x + r, y - h / 2 + r, 180]];
    c.forEach(function (q) { for (var i = 0; i <= 4; i++) { var a = (q[2] + i * 22.5) * Math.PI / 180; P.push([q[0] + Math.cos(a) * r, q[1] + Math.sin(a) * r]); } }); return P; };
  /* tubo reto (espaguete / termo-retrátil antes de contrair), transparente ou opaco, com reflexo */
  L.tube = function (g, x0, x1, y, D, col, tr) { var P = L.rrect(x0, y, x1 - x0, D, D * 0.12); g.style({ stroke: col, lw: 0.25, fill: tr ? null : '#fff' }); g.poly(P, true);
    g.style({ fill: null, lw: 0.07 }); g.line(x0 + D * 0.3, y - D * 0.3, x1 - D * 0.3, y - D * 0.3); g.line(x0 + D * 0.5, y - D * 0.21, x1 - D * 0.5, y - D * 0.21); g.style({ lw: 0.25 }); return P; };
  function ring(g, x, y, w, h, col, solder) { g.style({ stroke: col, lw: 0.22, fill: '#fff' }); g.poly(L.rrect(x, y, w, h, Math.min(w, h) * 0.18), true); g.style({ fill: null, lw: 0.07 });
    if (solder) { [0.1, 0.2, 0.8, 0.9].forEach(function (f) { g.line(x + w * f, y - h * 0.44, x + w * f, y + h * 0.44); }); g.line(x + w * 0.3, y - h * 0.3, x + w * 0.7, y - h * 0.3); } /* cilindro de solda: linhas de sombra nas bordas */
    else { g.line(x + w * 0.5, y - h * 0.46, x + w * 0.5, y + h * 0.46); } g.style({ lw: 0.22 }); }
  /* luva de solda (SolderSleeve): x = início, w = comprimento, D = Ø do tubo */
  L.ssleeve = function (g, x, y, w, D, dw, col) { L.tube(g, x, x + w, y, D, col, true);
    ring(g, x + w * 0.2, y, w * 0.075, D * 0.94, col); ring(g, x + w * 0.725, y, w * 0.075, D * 0.94, col); ring(g, x + w * 0.425, y, w * 0.15, D * 1.06, col, true); };
})(typeof window !== 'undefined' ? window : globalThis);
