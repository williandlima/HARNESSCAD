/* HarnessCAD - desenho físico: DETALHAMENTO DOS RAMOS.
   • Feixe com capa desenhado como um corpo único: contorno contínuo nas derivações (Y arredondado), fim da capa marcado.
   • Feixe sem capa ("fios aparentes"): phys_loose.js (quantidade real, curvas nas derivações).
   • Amarração do ramo: abraçadeira de nylon (tipo Hellermann), barbante por pontos, barbante em costura contínua ou fita
     em espiral — passo e distância das pontas em mm reais; entram na lista de materiais.
   Ramo: bind ('' = padrão da folha, 'none', 'tie', 'lace', 'lacec', 'tape'), bindStep, bindEnd, bindPN, loose ('' padrão, 'jacket', 'wires').
   Folha: bind, bindStep, bindEnd, loose (padrões). */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, hide = HX.physHide;
  HX.PHYS_BIND = {
    tie: { n: 'Abraçadeira de nylon (tipo Hellermann)', step: 150, end: 40, un: 'pç' },
    lace: { n: 'Barbante encerado — amarração por pontos', step: 75, end: 25, un: 'm' },
    lacec: { n: 'Barbante encerado — costura contínua', step: 20, end: 15, un: 'm' },
    tape: { n: 'Fita em espiral (50% sobreposição)', step: 0, end: 10, un: 'm', w: 19 }
  };
  function shOf(p, sg) { return p.sheets.filter(function (s) { return s.items.indexOf(sg) >= 0; })[0]; }
  HX.physBindOf = function (sg, sh) { var b = sg.bind || (sh && sh.bind) || ''; return b === 'none' || !HX.PHYS_BIND[b] ? '' : b; };
  HX.physLooseOf = function (sg, sh) { var v = sg.loose || (sh && sh.loose) || 'wires'; /* padrão: sem capa, fios aparentes */ return v === 'wires' && !sg.cover; };
  HX.physBindParams = function (sg, sh) { var k = HX.physBindOf(sg, sh), B = HX.PHYS_BIND[k] || {}; return { kind: k, step: +sg.bindStep || +(sh && sh.bindStep) || B.step, end: sg.bindEnd !== '' && sg.bindEnd != null ? +sg.bindEnd : +(sh && sh.bindEnd) || B.end }; };
  // posições (mm reais a partir da ponta a) das amarrações por pontos
  HX.physBindMarks = function (L, step, end) {
    var e = Math.min(end, L / 2), out = []; if (!(step > 0) || L <= 0) return out;
    for (var x = e; x <= L - e + 1e-6; x += step) out.push(x);
    if (out.length && L - e - out[out.length - 1] > step * 0.4) out.push(L - e);
    if (!out.length) out.push(L / 2);
    return out;
  };
  function trimFor(C, sg, BU) { // mesmo recorte do desenho base (leque dos fios nos conectores)
    var F = HX.PHYS_FAN, A = C.m[sg.a], B = C.m[sg.b], f = function (N) { return N && N.nkind === 'conn' && (C.line || (BU.node[N.id] || []).length) ? (HX.physConnTrim ? HX.physConnTrim(N, C) : F) : 0; };
    return [f(A), f(B)];
  }
  function trimmed(P, tA, tB) { var L0 = HX.polyLen(P); return (tA || tB) && L0 > tA + tB + 1 ? HX.physTrim(P, tA / L0, 1 - tB / L0) : P; }
  function offset(P, off, nSamp, taperA, taperB) {
    var L = HX.polyLen(P) || 1, out = [], n = Math.max(8, nSamp || Math.ceil(L / 1.2));
    for (var i = 0; i <= n; i++) {
      var t = i / n, q = HX.polyAt(P, t), s = t * L, k = 1;
      if (taperA) k = Math.min(k, ss(s / taperA)); if (taperB) k = Math.min(k, ss((L - s) / taperB));
      var o = typeof off === 'function' ? off(s, t) : off; out.push([q.pt[0] - q.d[1] * o * k, q.pt[1] + q.d[0] * o * k]);
    }
    return out;
  }
  function ss(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  // corpo único dos feixes com capa (desenhado antes dos itens): contorno, miolo e juntas redondas nas derivações
  function bodyPass(g, p, s, o) {
    var C = HX.physCtx(p, s, o), BU = HX.physBundleCtx(p, s, o), sh = C.sh, segs = [], joints = {};
    sh.items.forEach(function (sg) {
      if (sg.type !== 'pseg' || sg.cover || HX.physLooseOf(sg, sh)) return; var P = HX.physSegPts(sg, C.m); if (!P) return;
      var bw = HX.bundleW(BU.seg[sg.id] && BU.seg[sg.id].od), t = trimFor(C, sg, BU); segs.push({ sg: sg, P: trimmed(P, t[0], t[1]), bw: bw, t: t });
      [sg.a, sg.b].forEach(function (id) { var n = C.m[id]; if (n && n.nkind !== 'conn') joints[id] = Math.max(joints[id] || 0, bw); });
    });
    if (!segs.length) return;
    var ol = C.line ? 0.25 : 0, col = C.line ? C.col : '#1d1d1d', mid = C.line ? '#fff' : '#6a6a6a';
    function pass(stroke, wk, add) {
      segs.forEach(function (x) { g.style({ stroke: stroke, lw: x.bw * wk + add, fill: null, dash: null }); g.poly(x.P, false); });
      Object.keys(joints).forEach(function (id) { var n = C.m[id], r = (joints[id] * wk + add) / 2; g.style({ stroke: null, fill: stroke }); g.circle(n.x, n.y, r); });
    }
    pass(col, 1, 2 * ol);
    pass(mid, C.line ? 1 : 0.4, 0);
    segs.forEach(function (x) {
      if (!C.line) { g.style({ stroke: '#9a9a9a', lw: x.bw * 0.12, fill: null }); g.poly(offset(x.P, x.bw * 0.18, Math.max(2, x.P.length * 2)), false); return; }
      g.style({ stroke: col, lw: 0.25, fill: null }); var L = HX.polyLen(x.P); // fim da capa junto ao conector
      [[x.t[0], 0], [x.t[1], 1]].forEach(function (e) { if (!e[0]) return; var q = HX.polyAt(x.P, e[1]), J = x.bw / 2; g.line(q.pt[0] - q.d[1] * J, q.pt[1] + q.d[0] * J, q.pt[0] + q.d[1] * J, q.pt[1] - q.d[0] * J); });
      void L;
    });
  }
  // amarração ao longo do ramo
  function bindDraw(g, sg, P, C, BU) {
    var bp = HX.physBindParams(sg, C.sh); if (!bp.kind) return;
    var bw = (HX.physVisW ? HX.physVisW(sg, C.sh, BU) : HX.bundleW((BU.seg[sg.id] || {}).od)) * (HX.physPinchK ? HX.physPinchK(sg, C.sh, 'b_' + bp.kind) : 1), L = HX.physSegLen(sg, C.m, C.N), Lp = HX.polyLen(P) || 1, col = C.line ? C.col : '#151515', h = bw / 2 + 0.35, TS = HX.PACC_SHAPES && HX.PACC_SHAPES.tie;
    if (bp.kind === 'tape') { var e = Math.min(bp.end, L / 2) / L, Q = HX.physTrim(P, e, 1 - e), Lq = HX.polyLen(Q), k = Math.max(1, Math.round(Lq / 1.3)); g.style({ stroke: col, lw: 0.14, fill: null, dash: null });
      for (var i = 0; i < k; i++) { var a = HX.polyAt(Q, i / k), c = HX.polyAt(Q, Math.min(1, (i + 0.8) / k)); g.line(a.pt[0] - a.d[1] * h, a.pt[1] + a.d[0] * h, c.pt[0] + c.d[1] * h, c.pt[1] - c.d[0] * h); } return; }
    var M = HX.physBindMarks(L, bp.step, bp.end);
    M.forEach(function (x) {
      var q = HX.polyAt(P, Math.max(0, Math.min(1, x / L))); g.push([q.d[0], q.d[1], -q.d[1], q.d[0], q.pt[0], q.pt[1]]);
      if (bp.kind === 'tie' && TS) TS(g, h - 0.3, col, { ny: C.line ? '#fff' : '#1f1f1f' });
      else if (bp.kind === 'tie') { g.style({ stroke: C.line ? col : '#000', lw: 0.12, fill: C.line ? '#fff' : '#111' }); g.rect(-0.35, -h, 0.7, 2 * h); g.rect(-0.6, -h - 0.9, 1.2, 0.9); g.style({ fill: null }); g.line(0, -h - 0.9, 0.9, -h - 2.2); }
      else if (bp.kind === 'lace') { g.style({ stroke: C.line ? col : '#c9b37a', lw: 0.22, fill: null }); g.line(-0.5, -h, 0.5, h); g.line(0.5, -h, -0.5, h); g.line(-0.2, -h, -0.2, h); g.style({ stroke: col, lw: 0.1 }); g.line(0.4, -h, 1.3, -h - 1.1); }
      else { g.style({ stroke: C.line ? col : '#c9b37a', lw: 0.2, fill: null }); g.line(-0.6, -h, 0.6, h); g.line(0.6, -h, 0.6, h); }
      g.pop();
    });
    void Lp;
  }
  HX.physBranchDraw = { body: bodyPass, bind: bindDraw };
  var d0 = EXT.pseg.draw;
  EXT.pseg.draw = function (g, it, p, s, o) {
    var C = HX.physCtx(p, s, o), P = HX.physSegPts(it, C.m); if (!P) return; var BU = HX.physBundleCtx(p, s, o);
    if (it.cover) d0(g, it, p, s, o);
    else { hide(it, '_P', P); var bw = HX.bundleW(BU.seg[it.id] && BU.seg[it.id].od); if (it.brk) hide(it, '_brk', bw); if (HX.physLooseOf(it, C.sh)) HX.physLooseDraw(g, it, P, C, BU); }
    bindDraw(g, it, P, C, BU);
    if (!it.cover) HX.physBrk(g, it, P, HX.physVisW ? HX.physVisW(it, C.sh, BU) : HX.bundleW(BU.seg[it.id] && BU.seg[it.id].od), C.line ? C.col : '#1d1d1d');
  };
  var dr = HX.drawSheetItems;
  HX.drawSheetItems = function (g, p, s, o) { var sh = p.sheets[s]; if (sh && HX.isPhys(sh) && !Object.prototype.hasOwnProperty.call(o, '_bodyDone')) { o._bodyDone = 1; bodyPass(g, p, s, o); } return dr(g, p, s, o); };
  void shOf;
})(typeof window !== 'undefined' ? window : globalThis);
