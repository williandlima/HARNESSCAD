/* HarnessCAD - desenho físico: CONECTOR EM DESENHO TÉCNICO (vetor) com as medidas reais do datasheet.
   Mesma montagem (conector + backshell + bota) e mesmas medidas por tamanho de carcaça de phys_ds.js, mas desenhada em
   linhas: porca de acoplamento recartilhada, corpo, rosca traseira, faixa vermelha (acoplamento total) e azul
   (contatos de remoção traseira), flange quadrado com furos (ocultos), porca sextavada, alívio de tensão com
   abraçadeira e parafusos, bota termo-retrátil reta/90°. Opção: cotas do conector (comprimento e Ø).
   Folha: connDraw 'vec' (desenho técnico) | '' (imagem do datasheet). Nó: draw '' (folha) | 'img' | 'vec';
   cL / cD (mm) = comprimento / Ø do corpo próprios (customização); showDims = mostrar cotas. */
(function (G) {
  'use strict';
  var HX = G.HX, D2R = Math.PI / 180, ST = null;
  function R(g, x, y, w, h, f) { g.style({ stroke: ST.col, lw: 0.22, fill: f || ST.metal, dash: null }); g.rect(x, y, w, h); g.style({ fill: null }); }
  function L(g, x0, y0, x1, y1, lw, dash) { g.style({ stroke: ST.col, lw: lw || 0.12, dash: dash || null }); g.line(x0, y0, x1, y1); g.style({ dash: null }); }
  function band(g, x, y, w, h, c) { R(g, x, y, w, h, ST.line ? '#fff' : c); if (ST.line) { L(g, x + w / 2, y, x + w / 2, y + h, 0.3); } }
  function knurl(g, x, y, w, h) { var n = Math.max(4, Math.round(w / 0.9)); for (var i = 1; i < n; i++) L(g, x + w * i / n, y + 0.15, x + w * i / n, y + h - 0.15, 0.08); }
  function thread(g, x, y, w, h) { R(g, x, y, w, h); var n = Math.max(3, Math.round(w / 0.7)); for (var i = 0; i < n; i++) L(g, x + w * i / n, y, x + w * (i + 0.6) / n, y + h, 0.07); }
  // cada peça na sua caixa (x0,y0,W,H): esquerda = lado do conector/face, direita = lado do cabo
  var V = {
    d38_26: function (g, x, y, W, H) { var c = y + H / 2; R(g, x, y, W * 0.55, H); knurl(g, x + W * 0.04, y, W * 0.47, H); L(g, x + W * 0.02, y, x + W * 0.02, y + H, 0.2);
      R(g, x + W * 0.55, c - H * 0.4, W * 0.3, H * 0.8); band(g, x + W * 0.76, c - H * 0.4, W * 0.025, H * 0.8, '#2b6fd6'); thread(g, x + W * 0.85, c - H * 0.31, W * 0.15, H * 0.62); },
    d38_24: function (g, x, y, W, H) { var c = y + H / 2; thread(g, x, c - H * 0.33, W * 0.3, H * 0.66); band(g, x + W * 0.3, c - H * 0.33, W * 0.03, H * 0.66, '#d42a2a'); R(g, x + W * 0.33, y, W * 0.07, H);
      R(g, x + W * 0.4, c - H * 0.46, W * 0.14, H * 0.92); L(g, x + W * 0.4, c - H * 0.23, x + W * 0.54, c - H * 0.23); L(g, x + W * 0.4, c + H * 0.23, x + W * 0.54, c + H * 0.23);
      R(g, x + W * 0.54, c - H * 0.33, W * 0.32, H * 0.66); band(g, x + W * 0.8, c - H * 0.33, W * 0.025, H * 0.66, '#2b6fd6'); thread(g, x + W * 0.86, c - H * 0.28, W * 0.14, H * 0.56); },
    d38_20: function (g, x, y, W, H) { var c = y + H / 2; thread(g, x, c - H * 0.36, W * 0.35, H * 0.72); band(g, x + W * 0.35, c - H * 0.36, W * 0.03, H * 0.72, '#d42a2a'); R(g, x + W * 0.38, y, W * 0.07, H);
      [-0.4, 0.4].forEach(function (k) { L(g, x + W * 0.38, c + H * k - H * 0.04, x + W * 0.45, c + H * k - H * 0.04, 0.1, [0.6, 0.4]); L(g, x + W * 0.38, c + H * k + H * 0.04, x + W * 0.45, c + H * k + H * 0.04, 0.1, [0.6, 0.4]); });
      R(g, x + W * 0.45, c - H * 0.36, W * 0.41, H * 0.72); band(g, x + W * 0.8, c - H * 0.36, W * 0.025, H * 0.72, '#2b6fd6'); thread(g, x + W * 0.86, c - H * 0.3, W * 0.14, H * 0.6); },
    tv01: function (g, x, y, W, H) { var c = y + H / 2; thread(g, x, c - H * 0.37, W * 0.38, H * 0.74); band(g, x + W * 0.38, c - H * 0.37, W * 0.03, H * 0.74, '#d42a2a'); R(g, x + W * 0.41, y, W * 0.45, H);
      L(g, x + W * 0.41, c - H * 0.3, x + W * 0.86, c - H * 0.3); L(g, x + W * 0.41, c + H * 0.3, x + W * 0.86, c + H * 0.3); thread(g, x + W * 0.86, c - H * 0.3, W * 0.14, H * 0.6); },
    sr_s: function (g, x, y, W, H) { var c = y + H / 2; R(g, x, y, W * 0.3, H); knurl(g, x + W * 0.03, y, W * 0.24, H);
      g.style({ stroke: ST.col, lw: 0.22, fill: ST.metal }); g.poly([[x + W * 0.3, c - H * 0.42], [x + W * 0.55, c - H * 0.3], [x + W * 0.55, c + H * 0.3], [x + W * 0.3, c + H * 0.42]], true); g.style({ fill: null });
      R(g, x + W * 0.55, c - H * 0.3, W * 0.45, H * 0.6); [-1, 1].forEach(function (s) { R(g, x + W * 0.62, c + s * H * 0.3 - (s > 0 ? 0 : H * 0.16), W * 0.32, H * 0.16, ST.line ? '#fff' : '#9aa0a6'); g.style({ stroke: ST.col, lw: 0.12, fill: '#fff' }); g.circle(x + W * 0.7, c + s * H * 0.38, H * 0.045); g.circle(x + W * 0.86, c + s * H * 0.38, H * 0.045); g.style({ fill: null }); });
      L(g, x + W * 0.55, c - H * 0.12, x + W, c - H * 0.12, 0.08, [0.8, 0.5]); L(g, x + W * 0.55, c + H * 0.12, x + W, c + H * 0.12, 0.08, [0.8, 0.5]); },
    boot_s: function (g, x, y, W, H) { var c = y + H / 2, P = [[x, y + H * 0.02], [x + W * 0.08, y + H * 0.02]], k;
      for (k = 0; k <= 10; k++) { var t = k / 10, u = 1 - t, h = 0.48 * u * u + 2 * u * t * 0.22 + t * t * 0.21; P.push([x + W * (0.08 + 0.6 * t), c - H * h]); } P.push([x + W, c - H * 0.21], [x + W, c + H * 0.21]);
      var Q = P.slice(1).map(function (q) { return [q[0], 2 * c - q[1]]; }).reverse(); g.style({ stroke: ST.col, lw: 0.22, fill: ST.boot, dash: null }); g.poly(P.concat(Q, [[x, y + H * 0.98]]), true); g.style({ fill: null });
      L(g, x + W * 0.08, y + H * 0.04, x + W * 0.08, y + H * 0.96, 0.1); },
    boot_90: function (g, x, y, W, H) { var P = [], k, r0 = 0.12, cy = 0.235;
      P.push([x + W * 0.02, y + H], [x + W * 0.02, y + H * 0.5]); for (k = 0; k <= 8; k++) { var a = Math.PI - k / 8 * Math.PI / 2; P.push([x + W * (0.4 + 0.38 * Math.cos(a)), y + H * (0.5 - 0.38 * Math.sin(a) * 0.72)]); }
      P.push([x + W, y + H * (cy - r0)], [x + W, y + H * (cy + r0)]); for (k = 8; k >= 0; k--) { var b = Math.PI - k / 8 * Math.PI / 2; P.push([x + W * (0.4 + 0.02 * Math.cos(b)), y + H * (0.5 - 0.15 * Math.sin(b))]); }
      P.push([x + W * 0.38, y + H]); g.style({ stroke: ST.col, lw: 0.22, fill: ST.boot, dash: null }); g.poly(P, true); g.style({ fill: null }); }
  };
  HX.PHYS_VEC = V; HX.physVecST = function () { return ST; };
  HX.physVecOn = function (nd, sh) { return nd.draw ? nd.draw === 'vec' : sh.connDraw !== 'img'; }; // padrão: desenho técnico
  function wpt(M, q) { return [M[4] + M[0] * q[0] + M[2] * q[1], M[5] + M[1] * q[0] + M[3] * q[1]]; }
  function dimW(g, a, b, off, t) { // cota em coordenadas do papel, texto sempre em pé
    var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy * off, ny = ux * off, A = [a[0] + nx, a[1] + ny], B = [b[0] + nx, b[1] + ny];
    L(g, a[0], a[1], A[0] + nx * 0.15, A[1] + ny * 0.15, 0.1); L(g, b[0], b[1], B[0] + nx * 0.15, B[1] + ny * 0.15, 0.1); L(g, A[0], A[1], B[0], B[1], 0.14);
    [[A, 1], [B, -1]].forEach(function (e) { var p = e[0], s = e[1]; g.style({ fill: ST.col }); g.poly([p, [p[0] + ux * 1.2 * s - uy * 0.35, p[1] + uy * 1.2 * s + ux * 0.35], [p[0] + ux * 1.2 * s + uy * 0.35, p[1] + uy * 1.2 * s - ux * 0.35]], true); g.style({ fill: null }); });
    var ta = Math.atan2(uy, ux); if (Math.cos(ta) < -1e-6) ta += Math.PI; var mx = (A[0] + B[0]) / 2 + nx / Math.abs(off || 1) * 1.6 * Math.sign(off), my = (A[1] + B[1]) / 2 + ny / Math.abs(off || 1) * 1.6 * Math.sign(off);
    g.push([Math.cos(ta), Math.sin(ta), -Math.sin(ta), Math.cos(ta), mx, my]); g.text(t, 0, 0, { size: 1.8, align: 'c', color: ST.col }); g.pop();
  }
  var da = HX.physDrawAssembly;
  HX.physDrawAssembly = function (g, E, x, y, ang, N, k, flip) {
    var M0 = ST; if (!M0) return da.apply(this, arguments);
    var gi = Object.create(g), cur = null, conn = E[E.length - 1]; // intercepta g.image das peças com desenho vetorial
    gi.push = function (M) { cur = M; return g.push.call(g, M); }; gi.pop = function () { return g.pop.call(g); };
    gi.image = function (im, x0, y0, W, H) { var e = E.filter(function (q) { return q.im === im; })[0]; if (e === conn) ST.box = { M: cur, x0: x0, y0: y0, W: W, H: H }; if (!e || !V[e.id] || !ST.vec) return g.image ? g.image.apply(g, arguments) : false; V[e.id](g, x0, y0, W, H); return true; };
    var bb = da.call(this, gi, E, x, y, ang, N, k, flip);
    if (ST.dims && ST.box) { var B = ST.box, M = B.M, p0 = wpt(M, [B.x0, B.y0 + B.H]), p1 = wpt(M, [B.x0 + B.W, B.y0 + B.H]), q0 = wpt(M, [B.x0, B.y0]), q1 = wpt(M, [B.x0, B.y0 + B.H]);
      dimW(g, p0, p1, 3.5, String(Math.round(conn.L * 10) / 10).replace('.', ',')); dimW(g, q1, q0, -3.5, 'Ø' + String(Math.round(conn.H * 10) / 10).replace('.', ','));
      bb = { x0: bb.x0 - 6, y0: bb.y0 - 6, x1: bb.x1 + 6, y1: bb.y1 + 6, inner: bb.inner }; }
    return bb;
  };
  // conector: liga o modo vetor, medidas próprias (cL/cD) e cotas
  var EXT = HX.ITEM_EXT, d0 = EXT.pnode.draw, as0 = HX.physAssembly;
  HX.physAssembly = function (nd, c, line) {
    var E = as0(nd, c, line); if (!E || !ST || !ST.vec) return E; var e = E[E.length - 1];
    if (+nd.cL > 0) { e.L = +nd.cL; } if (+nd.cD > 0) e.H = +nd.cD; return E;
  };
  EXT.pnode.draw = function (g, it, p, s, o) {
    if (it.nkind !== 'conn') return d0.apply(this, arguments);
    var C = HX.physCtx(p, s, o), vec = HX.physVecOn(it, C.sh), on = vec; // cotas do conector: só na consulta (ui_conndims.js)
    ST = on ? { vec: vec, col: C.line ? C.col : (o.theme && o.theme.txt) || '#222', line: C.line, metal: C.line ? '#fff' : '#cfd3d8', boot: C.line ? '#fff' : '#2f2f2f', dims: false } : null;
    if (ST && !C.line && vec) ST.col = '#1d1d1d';
    var cc = C.S[it.of]; if (vec && cc && HX.isDsub && HX.isDsub(cc) && HX.physDrawDsubNode) { ST = null; return HX.physDrawDsubNode(g, it, cc, C, HX.physBundleCtx(p, s, o)); }
    try { return d0.apply(this, arguments); } finally { ST = null; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
