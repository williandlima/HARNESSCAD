/* HarnessCAD - CONECTORES COMERCIAIS em traço de catálogo (mesmo padrão do D38999/MS de phys_vecart.js):
   M8/M12/M23 com porca recartilhada, anel de vedação, corpo com sulcos de pega e bota com nervuras; BNC/TNC com
   baioneta (rasgo em L); DT/AT/Superseal com trava, cunha laranja e anéis de vedação; Molex/JST com rampa de trava,
   janelas e terminais; borne com parafuso de fenda; Han com capô, alavanca e prensa-cabo; XLR com botão de trava;
   RJ/USB com lingueta, carcaça metálica e alívio; terminal olhal com anilha e marcas de crimpagem. */
(function (G) {
  'use strict';
  var HX = G.HX; if (!HX.physComDraw || !HX.vaBody) return;
  var C0 = '#222', LINE = false;
  function st(g, lw, f, dash) { g.style({ stroke: C0, lw: lw, fill: f === undefined ? null : f, dash: dash || null }); }
  function ln(g, a, b, c, d, lw, dash) { st(g, lw || 0.1, null, dash); g.line(a, b, c, d); g.style({ dash: null }); }
  function poly(g, P, f, lw) { st(g, lw || 0.22, f); g.poly(P, true); g.style({ fill: null }); }
  function fl(f) { return LINE ? '#fff' : f; }
  var B = function () { return HX.vaBody.apply(null, arguments); };
  // alívio de tensão cônico com nervuras (borracha)
  function boot(g, x0, x1, r0, r1, f) {
    var n = Math.max(3, Math.round((x1 - x0) / Math.max(0.9, r0 * 0.5))), P = [], Q = [], i;
    for (i = 0; i <= n; i++) { var t = i / n, x = x0 + (x1 - x0) * t, r = r0 + (r1 - r0) * t * t * (3 - 2 * t) ; P.push([x, -r]); Q.push([x, r]); }
    poly(g, P.concat(Q.reverse()), fl(f || '#2f2f2f'));
    for (i = 1; i < n; i++) { var p = P[i]; ln(g, p[0], p[1] * 0.92, p[0], -p[1] * 0.92, 0.08); }
  }
  function slot(g, x, y, w, h) { st(g, 0.12, fl('#f6f6f6')); g.rect(x, y, w, h); g.style({ fill: null }); }
  var D = {};
  D.circ = function (g, o, L, W, bw) {
    var r = W / 2, M = o.fam === 'M8' ? 0.4 : 0.42;
    if (o.fam === 'COAX') { // BNC/TNC: luva de baioneta com rasgo em L e pino-guia
      B(g, -L, -L * 0.62, 0, r * 0.95, null, r * 0.1); HX.vaKnurl(g, -L * 0.88, -L * 0.66, 0, r);
      ln(g, -L * 0.98, -r * 0.2, -L * 0.8, -r * 0.2, 0.12); ln(g, -L * 0.8, -r * 0.2, -L * 0.8, r * 0.25, 0.12); ln(g, -L * 0.98, r * 0.02, -L * 0.84, r * 0.02, 0.12); ln(g, -L * 0.84, r * 0.02, -L * 0.84, r * 0.25, 0.12);
      HX.vaRing(g, -L * 0.62, -L * 0.6, 0, r * 0.8); B(g, -L * 0.6, -L * 0.3, 0, r * 0.62); HX.vaHex(g, -L * 0.5, -L * 0.36, 0, r * 0.7);
      HX.vaBody(g, -L * 0.3, -L * 0.18, 0, r * 0.5, null, r * 0.05); for (var cx = -L * 0.28; cx < -L * 0.19; cx += L * 0.03) ln(g, cx, -r * 0.45, cx, r * 0.45, 0.07);
      boot(g, -L * 0.18, 0, r * 0.48, Math.max(bw / 2, r * 0.26)); return;
    }
    HX.vaKnurl(g, -L, -L * (1 - M), 0, r); ln(g, -L, -r * 0.7, -L * 0.985, -r * 0.7, 0.1);
    HX.vaRing(g, -L * (1 - M), -L * (0.98 - M), 0, r * 0.82);
    B(g, -L * (0.98 - M), -L * 0.22, 0, r * 0.78, fl('#3a3d42'), r * 0.12);
    for (var x = -L * 0.5; x < -L * 0.25; x += Math.max(0.6, L * 0.035)) ln(g, x, -r * 0.7, x, r * 0.7, 0.07, null);
    boot(g, -L * 0.22, 0, r * 0.7, Math.max(bw / 2, r * 0.3));
  };
  D.sealed = function (g, o, L, W, bw) {
    var r = W / 2;
    B(g, -L, -L * 0.3, 0, r, fl('#3b3b3b'), r * 0.12); // corpo
    poly(g, [[-L * 0.86, -r], [-L * 0.82, -r * 1.25], [-L * 0.5, -r * 1.25], [-L * 0.44, -r]], fl('#4a4a4a')); // trava
    for (var x = -L * 0.78; x < -L * 0.52; x += L * 0.05) ln(g, x, -r * 1.22, x, -r * 1.02, 0.08);
    B(g, -L, -L * 0.93, 0, r * 0.78, fl('#e58b2a'), 0.2); // cunha
    ln(g, -L * 0.92, -r * 0.55, -L * 0.36, -r * 0.55, 0.08); ln(g, -L * 0.92, r * 0.55, -L * 0.36, r * 0.55, 0.08);
    for (var i = 0; i < 3; i++) { var a = -L * (0.3 - i * 0.07); B(g, a, a + L * 0.06, 0, r * (0.86 - i * 0.04), fl('#8f8f8f'), r * 0.15); } // vedações
    boot(g, -L * 0.09, 0, r * 0.62, Math.max(bw / 2, r * 0.35), '#8f8f8f');
  };
  D.rect = function (g, o, L, W, bw, s) {
    var r = W / 2, p = o.p * s;
    B(g, -L, -L * 0.12, 0, r, fl('#f2f2ee'), Math.min(r * 0.12, 0.5));
    poly(g, [[-L * 0.95, -r], [-L * 0.9, -r - Math.max(0.5, p * 0.55)], [-L * 0.55, -r - Math.max(0.5, p * 0.55)], [-L * 0.45, -r]], fl('#f2f2ee'), 0.18); // rampa de trava
    ln(g, -L * 0.88, -r - Math.max(0.5, p * 0.55) * 0.5, -L * 0.6, -r - Math.max(0.5, p * 0.55) * 0.5, 0.07);
    for (var i = 0; i < o.cols; i++) { var y = -r + 1.2 * s + p * (i + 0.5); slot(g, -L * 0.98, y - p * 0.28, L * 0.08, p * 0.56); ln(g, -L * 0.8, y, -L * 0.2, y, 0.06, [0.6, 0.4]); slot(g, -L * 0.12, y - p * 0.22, L * 0.12, p * 0.44); }
    ln(g, -L * 0.85, -r, -L * 0.85, r, 0.1); ln(g, -L * 0.3, -r, -L * 0.3, r, 0.1);
  };
  D.screw = function (g, o, L, W, bw, s) {
    var r = W / 2, p = o.p * s;
    poly(g, [[-L, -r], [-L * 0.35, -r], [-L * 0.35, -r * 0.8], [0, -r * 0.8], [0, r], [-L, r]], fl('#2f7a3a'));
    for (var i = 0; i < o.cols; i++) { var y = -r + 1.2 * s + p * (i + 0.5), rr = p * 0.32;
      st(g, 0.14, fl('#cfd3d8')); g.circle(-L * 0.62, y, rr); g.style({ fill: null }); ln(g, -L * 0.62 - rr * 0.75, y - rr * 0.2, -L * 0.62 + rr * 0.75, y + rr * 0.2, 0.14);
      slot(g, -L * 0.25, y - p * 0.3, L * 0.25, p * 0.6); if (i) ln(g, -L, y - p * 0.5, -L * 0.35, y - p * 0.5, 0.07); }
  };
  D.hood = function (g, o, L, W, bw) {
    var r = W / 2;
    B(g, -L, -L * 0.42, 0, r, null, r * 0.15); ln(g, -L * 0.94, -r, -L * 0.94, r, 0.1); ln(g, -L * 0.5, -r * 0.95, -L * 0.5, r * 0.95, 0.1);
    st(g, 0.25); g.line(-L * 0.95, -r, -L * 0.82, -r * 1.42); g.line(-L * 0.82, -r * 1.42, -L * 0.55, -r * 1.42); g.line(-L * 0.55, -r * 1.42, -L * 0.48, -r); // alavanca
    st(g, 0.14, fl('#cfd3d8')); g.circle(-L * 0.9, -r * 0.82, r * 0.07); g.circle(-L * 0.5, -r * 0.82, r * 0.07); g.style({ fill: null });
    HX.vaThread(g, -L * 0.42, -L * 0.34, 0, r * 0.36); HX.vaHex(g, -L * 0.34, -L * 0.24, 0, r * 0.45); // prensa-cabo PG
    HX.vaKnurl(g, -L * 0.24, -L * 0.08, 0, r * 0.4); HX.vaCone(g, -L * 0.08, 0, 0, r * 0.38, Math.max(bw / 2, r * 0.22));
  };
  D.xlr = function (g, o, L, W, bw) {
    var r = W / 2; B(g, -L, -L * 0.32, 0, r, null, r * 0.1);
    for (var x = -L * 0.9; x < -L * 0.4; x += L * 0.08) ln(g, x, -r * 0.94, x, r * 0.94, 0.06);
    B(g, -L * 0.82, -L * 0.66, -r - 0.5, 0.5, null, 0.4); // botão de trava
    boot(g, -L * 0.32, 0, r * 0.82, Math.max(bw / 2, r * 0.25));
  };
  D.plug = function (g, o, L, W, bw) {
    var r = W / 2;
    if (o.fam === 'USB') { B(g, -L, -L * 0.62, 0, r * 0.4, null, 0.15); slot(g, -L * 0.9, -r * 0.25, L * 0.08, r * 0.14); slot(g, -L * 0.9, r * 0.11, L * 0.08, r * 0.14);
      B(g, -L * 0.62, -L * 0.25, 0, r, fl('#2f2f2f'), r * 0.2); for (var x = -L * 0.5; x < -L * 0.3; x += L * 0.04) ln(g, x, -r * 0.85, x, r * 0.85, 0.06);
      boot(g, -L * 0.25, 0, r * 0.7, Math.max(bw / 2, r * 0.3)); return; }
    if (o.fam === 'RJ') { B(g, -L, -L * 0.35, 0, r, fl('#eef3f7'), 0.3); for (var k = 0; k < 4; k++) ln(g, -L * 0.98, -r * 0.6 + k * r * 0.4, -L * 0.7, -r * 0.6 + k * r * 0.4, 0.07);
      poly(g, [[-L * 0.88, -r], [-L * 0.4, -r * 1.35], [-L * 0.36, -r * 1.25], [-L * 0.7, -r]], fl('#eef3f7'), 0.18); ln(g, -L * 0.6, -r, -L * 0.6, r, 0.1);
      boot(g, -L * 0.35, 0, r * 0.85, Math.max(bw / 2, r * 0.32)); return; }
    B(g, -L, -L * 0.4, 0, r, fl('#f2f2ee'), r * 0.12); ln(g, -L * 0.85, -r, -L * 0.85, r, 0.1); for (var j = -L * 0.75; j < -L * 0.45; j += L * 0.06) ln(g, j, -r * 0.9, j, r * 0.9, 0.06);
    boot(g, -L * 0.4, 0, r * 0.8, Math.max(bw / 2, r * 0.3));
  };
  D.term = function (g, o, L, W, bw) {
    var r = W / 2; st(g, 0.25, fl('#d9a441')); g.circle(-L + r, 0, r); g.style({ fill: '#fff' }); g.circle(-L + r, 0, r * 0.45); g.style({ fill: null });
    poly(g, [[-L + r * 1.6, -r * 0.4], [-L * 0.45, -r * 0.4], [-L * 0.45, r * 0.4], [-L + r * 1.6, r * 0.4]], fl('#d9a441'));
    for (var k = 0; k < 2; k++) { var x = -L * (0.62 - k * 0.1); ln(g, x, -r * 0.4, x, r * 0.4, 0.12); }
    B(g, -L * 0.45, 0, 0, r * 0.5, fl('#d22'), r * 0.15); ln(g, -L * 0.38, -r * 0.5, -L * 0.38, r * 0.5, 0.08);
  };
  var d0 = HX.physComDraw;
  HX.physComDraw = function (g, o, s, col, line, bw) {
    var f = D[o.cls]; if (!f) return d0.apply(this, arguments);
    var b = d0.call(this, { push: function () {}, pop: function () {}, style: function () {}, rect: function () {}, line: function () {}, poly: function () {}, circle: function () {}, text: function () {} }, o, s, col, line, bw);
    var st0 = HX.physVecST; C0 = col; LINE = !!line; HX.physVecST = function () { return { col: col, metal: '#cfd3d8', boot: '#2f2f2f', line: !!line }; };
    try { f(g, o, o.L * s, o.W * s, bw || 0, s); } finally { HX.physVecST = st0; }
    if (o.cls === 'circ' || o.cls === 'hood') HX.vaAxis && (C0 = col, HX.physVecST = function () { return { col: col, line: !!line }; }, HX.vaAxis(g, -o.L * s - 1, 1, 0), HX.physVecST = st0);
    if (o.cls === 'sealed' || o.cls === 'hood' || o.cls === 'rect' || o.cls === 'xlr') b.y0 = Math.min(b.y0, -o.W * s * (o.cls === 'hood' ? 0.72 : 0.68) - 0.6);
    return b;
  };
})(typeof window !== 'undefined' ? window : globalThis);
