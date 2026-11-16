/* HarnessCAD - desenho físico: ramos (pseg, reto ou curvo), nós (pnode: conector, BR, emenda) e acessórios (pimg).
   Dois modelos (folha.pstyle): 'img' = imagens (painel de referência ou FOTO do usuário por PN) e 'line' = traço
   estilo Altium (phys_line.js). A saída do cabo fica no nó e o corpo do conector aponta para fora do ramo. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT = HX.ITEM_EXT || {}, D2R = Math.PI / 180;
  function hide(o, k, v) { Object.defineProperty(o, k, { value: v, writable: true, configurable: true, enumerable: false }); }
  HX.physHide = hide;
  HX.physCtx = function (p, s, o) {
    if (!o._pc || o._pcs !== s) { var sh = p.sheets[s]; o._pcs = s; o._pc = { sh: sh, m: HX.physIdx(sh), N: +sh.scale || 1, line: sh.pstyle === 'line' || sh.pstyle === 'outline', outline: sh.pstyle === 'outline', col: sh.lineColor || HX.PHYS_LINE_COLOR, S: HX.physSchem(p) }; }
    return o._pc;
  };
  HX.physPaperLen = function (spr, size, N, min) { return Math.max(min || 12, (+size || (spr ? spr.len : 20)) / N); };
  // imagem do conector: foto do usuário (por PN) > imagem do painel
  HX.physImgOf = function (nd, c) { var u = c && HX.PHYS_USER && HX.PHYS_USER[c.part]; return u || HX.PSPR[nd.sprite] || null; };
  // ângulo (graus) da saída do cabo: tangente do ramo no nó, ou o definido pelo usuário
  HX.physAngle = function (nd, items) {
    if (nd.rot !== '' && nd.rot != null && !isNaN(+nd.rot)) return +nd.rot;
    var sh = { items: items }, d = HX.physDirAt(nd, sh, HX.physIdx(sh));
    return d ? Math.atan2(d[1], d[0]) / D2R : 0;
  };
  // imagem com a saída (ou o centro) em (x, y), girada; mantém "em pé"
  function sprite(g, spr, x, y, ang, Lp, flip, center) {
    var Hp = Lp * spr.h / spr.w, r = ang * D2R, c = Math.cos(r), s = Math.sin(r), f = (c < -1e-6) !== !!flip ? -1 : 1, mx = spr.mirror ? -1 : 1;
    g.push([c * mx, s * mx, -s * f, c * f, x, y]);
    var ey = spr.ey == null ? 0.5 : spr.ey, x0 = center ? -Lp / 2 : (mx < 0 ? 0 : -Lp), y0 = center ? -Hp / 2 : -ey * Hp, ok = g.image ? g.image(spr, x0, y0, Lp, Hp) : false;
    if (!ok) { g.style({ stroke: '#888', lw: 0.2, fill: null, dash: [0.8, 0.6] }); g.rect(x0, y0, Lp, Hp); g.style({ dash: null }); }
    g.pop();
    var pts = [[x0, y0], [x0 + Lp, y0], [x0, y0 + Hp], [x0 + Lp, y0 + Hp]].map(function (q) { return [x + c * q[0] * mx - s * f * q[1], y + s * q[0] * mx + c * f * q[1]]; });
    return box(pts);
  }
  function box(pts) { return { x0: Math.min.apply(0, pts.map(function (q) { return q[0]; })), y0: Math.min.apply(0, pts.map(function (q) { return q[1]; })), x1: Math.max.apply(0, pts.map(function (q) { return q[0]; })), y1: Math.max.apply(0, pts.map(function (q) { return q[1]; })) }; }
  HX.physSprite = sprite;
  function trim(P, a, b) { var out = [], N = Math.max(2, P.length * 2); for (var i = 0; i <= N; i++) out.push(HX.polyAt(P, a + (b - a) * i / N).pt); return out; }
  HX.physTrim = trim;
  // símbolo de quebra (ramo fora de escala): vão branco com dois zigue-zagues
  function brk(g, it, P, bw, col) {
    if (!it.brk) return; var q = HX.polyAt(P, 0.5), h = bw / 2 + 1.6;
    g.push([q.d[0], q.d[1], -q.d[1], q.d[0], q.pt[0], q.pt[1]]);
    g.style({ stroke: '#fff', fill: '#fff', lw: 0 }); g.rect(-1.4, -h, 2.8, 2 * h);
    g.style({ stroke: col, fill: null, lw: 0.25 }); [-1.4, 1.4].forEach(function (x) { g.poly([[x, -h], [x - 0.8, -h / 3], [x + 0.8, h / 3], [x, h]], false); });
    g.pop();
  }
  HX.physBrk = brk;
  function segAt(nd, sh) { return sh.items.filter(function (i) { return i.type === 'pseg' && (i.a === nd.id || i.b === nd.id); })[0]; }
  // leque colorido (modelo Imagens): um fio por cor real, da saída do conector até o feixe
  HX.physFan = function (g, x, y, ux, uy, ws, hExit, bw) { fan(g, x, y, ux, uy, ws, hExit, bw); };
  function fan(g, x, y, ux, uy, ws, hExit, bw) {
    var F = HX.PHYS_FAN, n = Math.min(16, ws.length); if (!n) return;
    g.push([ux, uy, -uy, ux, x, y]);
    for (var i = 0; i < n; i++) {
      var f = n === 1 ? 0 : i / (n - 1) - 0.5, y0 = f * hExit, y1 = f * bw * 0.75, P = [];
      for (var t = 0; t <= 8; t++) { var s = t / 8, e = s * s * (3 - 2 * s); P.push([F * s, y0 + (y1 - y0) * e]); }
      g.style({ stroke: '#222', lw: 0.42, fill: null }); g.poly(P, false); g.style({ stroke: HX.wireHex(ws[i]), lw: 0.3 }); g.poly(P, false);
    }
    g.pop();
  }

  EXT.pseg = {
    draw: function (g, it, p, s, o) {
      var C = HX.physCtx(p, s, o), P = HX.physSegPts(it, C.m); if (!P) return;
      hide(it, '_P', P);
      var cov = it.cover && HX.PSPR[it.cover], A = C.m[it.a], B = C.m[it.b], bu = HX.physBundleCtx(p, s, o).seg[it.id], bw = HX.bundleW(bu && bu.od), F = HX.PHYS_FAN;
      var Bn = HX.physBundleCtx(p, s, o).node, fanAt = function (N) { return N && N.nkind === 'conn' && (C.line || (Bn[N.id] || []).length) ? (HX.physConnTrim ? HX.physConnTrim(N, C) : F) : 0; }, tA = fanAt(A), tB = fanAt(B);
      if (it.brk) hide(it, '_brk', bw);
      if (C.line) { HX.physLineJacket(g, P, C.col, tA, tB, !!cov, bw); brk(g, it, P, bw, C.col); return; }
      var L0 = HX.polyLen(P), Pt = (tA || tB) && L0 > tA + tB + 1 ? trim(P, tA / L0, 1 - tB / L0) : P;
      if (cov) { // cobertura: imagem repetida ao longo do ramo (de trás para frente, cobrindo as pontas)
        var H = bw + 2.2, L = HX.polyLen(Pt), tl = H * cov.w / cov.h, n = Math.max(1, Math.round(L / tl)), w = L / n;
        for (var i = n - 1; i >= 0; i--) { var q = HX.polyAt(Pt, (i + 0.5) / n), wo = i === n - 1 ? w : w * 1.24; g.push([q.d[0], q.d[1], -q.d[1], q.d[0], q.pt[0], q.pt[1]]); if (!(g.image && g.image(cov, -w / 2, -H / 2, wo, H))) { g.style({ stroke: '#333', lw: H, fill: null }); g.line(-w / 2, 0, w / 2, 0); } g.pop(); }
      } else { g.style({ stroke: '#1d1d1d', lw: bw, fill: null, dash: null }); g.poly(Pt, false); g.style({ stroke: '#6a6a6a', lw: bw * 0.4 }); g.poly(Pt, false); g.style({ stroke: '#9a9a9a', lw: bw * 0.12 }); g.poly(Pt.map(function (q, i) { var d = HX.polyAt(Pt, i / Math.max(1, Pt.length - 1)).d; return [q[0] - d[1] * bw * 0.18, q[1] + d[0] * bw * 0.18]; }), false); }
      brk(g, it, P, bw, '#1d1d1d');
    },
    bbox: function (it) { return it._P ? box(it._P) : { x0: 0, y0: 0, x1: 0, y1: 0 }; },
    hit: function (it, pt) { var P = it._P; if (!P) return 1e9; var m = 1e9; for (var i = 1; i < P.length; i++) m = Math.min(m, HX.distSeg(pt, P[i - 1], P[i])); return m - 1.2; }
  };
  EXT.pnode = {
    draw: function (g, it, p, s, o) {
      var C = HX.physCtx(p, s, o), T = o.theme, col = C.line ? C.col : '#1d1d1d';
      if (it.nkind !== 'conn') {
        g.style({ stroke: col, fill: it.nkind === 'virt' || C.line ? col : '#fff', lw: 0.35 }); g.circle(it.x, it.y, it.nkind === 'virt' ? 0.8 : C.line ? 0.9 : 1.6);
        hide(it, '_bb', { x0: it.x - 2, y0: it.y - 2, x1: it.x + 2, y1: it.y + 2 }); return;
      }
      var c = C.S[it.of], spr = HX.physImgOf(it, c), ang = HX.physAngle(it, C.sh.items), r = ang * D2R, ux = Math.cos(r), uy = Math.sin(r), bb;
      var Lp = HX.physPaperLen(spr, it.size || (spr && spr.len), C.N, C.line ? 28 : 16);
      var BU = HX.physBundleCtx(p, s, o), ws = BU.node[it.id] || [], sg = segAt(it, C.sh), bw = HX.bundleW(sg && BU.seg[sg.id] ? BU.seg[sg.id].od : 0);
      if (C.line) bb = HX.physLineConn(g, it.sprite || (spr && spr.id), it.x, it.y, ux, uy, Lp, ws, C.col, c, bw);
      else if (spr) { bb = sprite(g, spr, it.x, it.y, ang, Lp, it.flip); fan(g, it.x, it.y, ux, uy, ws, Lp * spr.h / spr.w * 0.22, bw); }
      else { // sem imagem: moldura simples com aviso
        var w = 18, h = 9, cx = it.x - ux * w / 2, cy = it.y - uy * w / 2;
        g.style({ stroke: T.body, lw: 0.25, fill: '#f4f4f4', dash: [1, 0.7] }); g.rect(cx - w / 2, cy - h / 2, w, h); g.style({ dash: null, fill: null });
        g.text('sem imagem', cx, cy, { size: 1.6, align: 'c', color: T.txt }); bb = { x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2 };
      }
      hide(it, '_bb', bb); hide(it, '_L', Lp);
    },
    bbox: function (it) { return it._bb || { x0: it.x - 2, y0: it.y - 2, x1: it.x + 2, y1: it.y + 2 }; }
  };
  EXT.pimg = {
    draw: function (g, it, p, s, o) {
      var C = HX.physCtx(p, s, o), spr = HX.PSPR[it.sprite], Lp = HX.physPaperLen(spr, it.size, C.N, 6);
      var bb = spr ? sprite(g, spr, it.x, it.y, +it.rot || 0, Lp, it.flip, true) : { x0: it.x - 3, y0: it.y - 3, x1: it.x + 3, y1: it.y + 3 };
      if (it.label) g.text(it.label, it.x, bb.y1 + 2, { size: 1.8, align: 'c', color: o.theme.txt });
      hide(it, '_bb', bb);
    },
    bbox: function (it) { return it._bb || { x0: it.x - 3, y0: it.y - 3, x1: it.x + 3, y1: it.y + 3 }; }
  };
  if (!HX.fmtNum) HX.fmtNum = function (v) { return String(Math.round(v * 10) / 10).replace('.', ','); };
})(typeof window !== 'undefined' ? window : globalThis);
