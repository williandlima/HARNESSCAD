/* HarnessCAD - MONTAGEM MIL DA CASA (3): BARBANTE DO ENGATE RÁPIDO (prancha de referência: o laço desenhado junto do
   conector não é lâmpada, é o barbante preso no anel de engate rápido, puxado para trás ao longo do cabo, com cota
   "TIP."). Nó do conector: lany = comprimento do barbante em mm (vazio/0 = sem). Entra na lista junto do barbante de
   amarração da cordoalha (mesmo material, em metros). Folha nova da casa com adaptador: cordoalha como camada interna
   dos ramos (item da lista pelo comprimento). */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT; if (!EXT.pnode || !HX.physMilCasa) return;
  function arrow(g, x, y, ux, uy, col) { var a = 1.4, w = 0.4; g.style({ fill: col, stroke: col }); g.poly([[x, y], [x - ux * a - uy * w, y - uy * a + ux * w], [x - ux * a + uy * w, y - uy * a - ux * w]], true); g.style({ fill: null }); }
  /* papel por mm real no ramo que sai do nó (ramos podem estar encurtados) */
  function kOf(C, it) {
    var sg = C.sh.items.filter(function (q) { return q.type === 'pseg' && (q.a === it.id || q.b === it.id); })[0], P = sg && (sg._P || HX.physSegPts(sg, C.m)), L = sg && HX.physSegLen(sg, C.m, C.N);
    return P && L ? HX.polyLen(P) / L : 1 / C.N;
  }
  var nd0 = EXT.pnode.draw;
  EXT.pnode.draw = function (g, it, p, s, o) {
    var r = nd0.apply(this, arguments), Lr = +it.lany; if (it.nkind !== 'conn' || !(Lr > 0)) return r;
    var C = HX.physCtx(p, s, o), A = it._asm || [], K = A.filter(function (a) { return a.conn; })[0], b = it._bb; if (!K && !b) return r;
    var a = HX.physAngle(it, C.sh.items) * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    if (ny > 1e-6 || (Math.abs(ny) <= 1e-6 && nx > 0)) { nx = -nx; ny = -ny; } /* normal para cima na tela */
    var S = K ? K.top : [(b.x0 + b.x1) / 2, b.y0], col = C.line ? C.col : (o.theme && o.theme.txt) || '#222', Lp = Lr * kOf(C, it), rl = 1.6, h = 2.2;
    var P = function (t, d) { return [S[0] + ux * t + nx * d, S[1] + uy * t + ny * d]; }, Q = [S, P(1.5, h)];
    for (var i = 1; i <= 16; i++) { var t = 1.5 + (Lp - 1.5 - 2 * rl) * i / 16; Q.push(P(t, h + Math.sin(i * Math.PI / 2) * 0.25)); } /* cordão levemente torcido */
    g.style({ stroke: col, lw: 0.25, fill: null, dash: null }); g.poly(Q, false);
    var E = P(Lp - rl, h); g.circle(E[0], E[1], rl); /* laço na ponta */
    var d = h + 11, a0 = P(0, d), a1 = P(Lp, d), sg = [ux, uy];
    g.style({ stroke: col, lw: 0.15 }); g.line(a0[0], a0[1], a1[0], a1[1]);
    [[0, a0], [Lp, a1]].forEach(function (e) { var q0 = P(e[0], e[0] ? h + rl + 0.8 : 0.8); g.line(q0[0], q0[1], e[1][0] + nx, e[1][1] + ny); });
    arrow(g, a0[0], a0[1], -sg[0], -sg[1], col); arrow(g, a1[0], a1[1], sg[0], sg[1], col);
    var ta = Math.atan2(uy, ux); if (Math.cos(ta) < -1e-6) ta += Math.PI; var m = P(Lp / 2, d);
    [[String(Math.round(Lr)), 2.6, 1.6], ['TIP.', 1.1, 1.1]].forEach(function (q) { g.push([Math.cos(ta), Math.sin(ta), -Math.sin(ta), Math.cos(ta), m[0] + nx * q[1], m[1] + ny * q[1]]); g.text(q[0], 0, 0, { size: q[2], align: 'c', color: col }); g.pop(); });
    return r;
  };
  /* lista: barbante do engate rápido soma no barbante (m) */
  var bom = HX.physBom;
  HX.physBom = function (p, sh) {
    var B = bom(p, sh), t = 0; B.rows.forEach(function (q) { if (/^u:cov_braid:/.test(q.k) && sh.under === 'cov_braid') q.desc = 'Cordoalha (blindagem geral do feixe)'; }); sh.items.forEach(function (i) { if (i.type === 'pnode' && i.nkind === 'conn' && +i.lany > 0) t += +i.lany / 1000; }); if (!t) return B;
    var k = 'barb:' + (sh.barbPN || ''), r = B.key[k]; if (!r) { r = { k: k, pn: sh.barbPN || '', desc: 'Barbante sintético (amarração da cordoalha)', qty: 0, un: 'm' }; B.rows.push(r); B.key[k] = r; }
    r.qty = Math.round((r.qty + t) * 100) / 100; r.desc = 'Barbante sintético (amarração da cordoalha / engate rápido)'; B.rows.forEach(function (q, j) { q.n = j + 1; }); return B;
  };
  /* folha nova da casa: com adaptador de cordoalha, a cordoalha vai como camada interna dos ramos */
  var mc0 = HX.physMilCasa;
  HX.physMilCasa = function (doc, sh) { var n = mc0.apply(this, arguments); if (n && !sh.under && HX.PSPR && HX.PSPR.cov_braid) sh.under = 'cov_braid'; return n; };
})(typeof window !== 'undefined' ? window : globalThis);
