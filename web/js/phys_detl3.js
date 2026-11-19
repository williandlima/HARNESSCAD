/* HarnessCAD - LUVAS NO FORMATO DO DESENHO DO FABRICANTE (TE Customer Drawing D-200-02XX, itens 1, 3, 4, 5, 6),
   estudado ampliado: a luva é um tubo de PAREDE FINA (faixa hachurada a 45°) que INCHA por fora sobre cada anel interno
   (ombros em S arredondados) e afina entre os anéis — o furo fica constante. Anéis por dentro do bojo: inserto de
   vedação (hachura cruzada fina) e anel de solda (bojo maior, hachura cruzada densa), com linha vertical nas bordas do
   anel atravessando o furo. Linha de centro tracejada longa. Itens:
   ssleeve (3) SolderSleeve: pescoço · bojo/inserto · pescoço · bojo maior/solda · pescoço · bojo/inserto · pescoço;
   sealSleeve (5) luva de vedação: pontas retas, dois bojos com inserto, linha no ombro e na borda do inserto;
   outerSleeve (1) luva externa: pontas largas com inserto, transição cônica, corpo fino;
   crimpSplice (4) emenda crimpada: furo oculto tracejado, faixas pretas de código de cor, janela com lingueta no topo;
   meltInsert (6) inserto fundível: tubo com as paredes hachuradas. */
(function (G) {
  'use strict';
  var HX = G.HX, L = HX.DL; if (!L) return;
  function ss(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }
  /* raio externo ao longo de x: furo rb + parede t + espessura do anel (com ombro de comprimento tr antes/depois do anel) */
  function radius(x, rb, t, R, tr) { var e = 0; R.forEach(function (r) { var u = x < r.a ? 1 - (r.a - x) / tr : x > r.b ? 1 - (x - r.b) / tr : 1; e = Math.max(e, r.th * ss(u)); }); return rb + t + e; }
  function wallSide(g, x0, x1, y, s, rb, t, R, tr, col) { var N = Math.max(24, Math.round((x1 - x0) / 0.12)), O = [], I = [], i, x, r;
    for (i = 0; i <= N; i++) { x = x0 + (x1 - x0) * i / N; r = radius(x, rb, t, R, tr); O.push([x, y + s * r]); I.push([x, y + s * (r - t)]); }
    var P = O.concat(I.reverse()); g.style({ stroke: col, lw: 0.18, fill: '#fff' }); g.poly(P, true); g.style({ fill: null, lw: 0.12 }); L.hatch(g, P, Math.max(0.32, t * 1.8), [45]); g.style({ lw: 0.25 }); g.poly(O, false); g.poly(I, false); }
  function ringSide(g, r, y, s, rb, t, col) { var P = [[r.a, y + s * rb], [r.b, y + s * rb], [r.b, y + s * (rb + r.th)], [r.a, y + s * (rb + r.th)]], st = r.sol ? 0.14 : 0.2;
    g.style({ stroke: col, lw: 0.15, fill: '#fff' }); g.poly(P, true); g.style({ fill: null, lw: r.sol ? 0.07 : 0.05 }); L.hatch(g, P, st, [45, -45]); g.style({ lw: 0.15 }); g.poly(P, true); }
  L.cline = function (g, x0, x1, y, col) { g.style({ stroke: col, lw: 0.1, dash: [3, 0.8] }); g.line(x0, y, x1, y); g.style({ dash: null }); };
  /* luva genérica pelo perfil: R = [{a, b, th, sol}] (posições absolutas), rb = raio do furo, t = parede */
  L.sleeveProf = function (g, x0, x1, y, rb, t, R, col, o) { o = o || {}; var tr = o.tr || Math.max(0.4, (rb + t) * 0.35);
    if (o.opaque) { g.style({ stroke: null, fill: '#fff' }); g.rect(x0, y - rb, x1 - x0, 2 * rb); }
    wallSide(g, x0, x1, y, -1, rb, t, R, tr, col); wallSide(g, x0, x1, y, 1, rb, t, R, tr, col);
    R.forEach(function (r) { ringSide(g, r, y, -1, rb, t, col); ringSide(g, r, y, 1, rb, t, col); g.style({ stroke: col, lw: 0.12 }); g.line(r.a, y - rb, r.a, y + rb); g.line(r.b, y - rb, r.b, y + rb);
      if (o.shoulder) { g.line(r.a - tr * 0.75, y - rb, r.a - tr * 0.75, y + rb); g.line(r.b + tr * 0.75, y - rb, r.b + tr * 0.75, y + rb); } });
    g.style({ stroke: col, lw: 0.2 }); [x0, x1].forEach(function (x) { var r = radius(x, rb, t, R, tr); g.line(x, y - r, x, y - r + t); g.line(x, y + r - t, x, y + r); });
    if (o.cline !== false) L.cline(g, x0 - 1.5, x1 + 1.5, y, col); };
  /* (3) SolderSleeve: D = Ø máximo (sobre a solda); bojos nos insertos e na solda */
  L.ssleeve = function (g, x, y, w, D, dw, col) { var rb = D * 0.36, t = D * 0.055, ti = D * 0.07, ts = D * 0.085;
    L.sleeveProf(g, x, x + w, y, rb, t, [{ a: x + w * 0.09, b: x + w * 0.19, th: ti }, { a: x + w * 0.42, b: x + w * 0.58, th: ts, sol: 1 }, { a: x + w * 0.81, b: x + w * 0.91, th: ti }], col, { tr: w * 0.035 }); };
  /* (5) luva de vedação com dois insertos */
  L.sealSleeve = function (g, x, y, w, D, col, opaque) { var rb = D * 0.4, t = D * 0.065, ti = D * 0.065;
    L.sleeveProf(g, x, x + w, y, rb, t, [{ a: x + w * 0.14, b: x + w * 0.29, th: ti }, { a: x + w * 0.71, b: x + w * 0.86, th: ti }], col, { tr: w * 0.025, shoulder: 1, opaque: opaque }); };
  /* (1) luva externa: pontas largas com inserto, transição cônica longa até o corpo fino */
  L.outerSleeve = function (g, x, y, w, D, col) { var rb = D * 0.38, t = D * 0.06, ti = D * 0.1, tr = Math.min(w * 0.03, D * 0.5);
    L.sleeveProf(g, x, x + w, y, rb, t, [{ a: x - 1, b: x + w * 0.1, th: ti }, { a: x + w * 0.9, b: x + w + 1, th: ti }], col, { tr: tr });
    [x + w * 0.1 + tr * 0.8, x + w * 0.9 - tr * 0.8].forEach(function (xv) { g.style({ stroke: col, lw: 0.12 }); g.line(xv, y - rb * 0.75, xv, y + rb * 0.75); }); };
  /* (6) inserto fundível: tubo simples com as paredes hachuradas */
  L.meltInsert = function (g, x, y, w, D, col) { L.sleeveProf(g, x, x + w, y, D * 0.37, D * 0.13, [], col); };
  /* espaguete / termo-retrátil reto (tubo de parede fina em corte) */
  L.tube = function (g, x0, x1, y, D, col, tr) { L.sleeveProf(g, x0, x1, y, D * 0.43, D * 0.07, [], col, { opaque: !tr }); };
  /* (4) emenda crimpada: L6 × ØD6 */
  L.crimpSplice = function (g, x, y, w, D, col, crimped) { var h = D / 2, X = function (f) { return x + w * f; };
    g.style({ stroke: col, lw: 0.25, fill: '#fff' });
    g.poly([[x, y - h], [X(0.357), y - h], [X(0.357), y + h * 0.1], [X(0.415), y + h * 0.1], [X(0.415), y - h * 0.35], [X(0.588), y - h * 0.35], [X(0.588), y + h * 0.1], [X(0.645), y + h * 0.1], [X(0.645), y - h], [x + w, y - h], [x + w, y + h], [x, y + h]], true); g.style({ fill: null });
    g.style({ stroke: col, lw: 0.1, dash: [0.8, 0.5] }); g.line(X(0.03), y - h * 0.78, X(0.357), y - h * 0.78); g.line(X(0.645), y - h * 0.78, X(0.97), y - h * 0.78); g.line(X(0.03), y + h * 0.78, X(0.97), y + h * 0.78);
    g.line(X(0.03), y - h * 0.78, X(0.03), y + h * 0.78); g.line(X(0.97), y - h * 0.78, X(0.97), y + h * 0.78); g.style({ dash: null });
    [0.065, 0.855].forEach(function (f) { g.style({ stroke: col, fill: col }); g.rect(X(f), y - h, w * 0.085, D); g.style({ fill: null }); }); /* código de cor */
    if (crimped) { g.style({ stroke: col, lw: 0.1 }); [0.24, 0.76].forEach(function (f) { var cx = X(f); g.poly([[cx, y - h * 0.5], [cx + h * 0.35, y], [cx, y + h * 0.5], [cx - h * 0.35, y]], true); }); }
    L.cline(g, x - 1, x + w + 1, y, col); };
})(typeof window !== 'undefined' ? window : globalThis);
