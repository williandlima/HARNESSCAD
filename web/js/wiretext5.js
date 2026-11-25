/* HarnessCAD - LISTA DE FIAÇÃO: ligar DUAS REDES QUE JÁ TÊM FIO sem label e sem empilhar (v1.9.10).
   Ex.: "J3:B > J1:C,D,E,F" — depois de J3:B→J1:C, J1:D já tem a via dele até J2:D. Em vez de label, liga TRECHO A TRECHO:
   um toco reto entre um trecho do fio de uma rede e um trecho do fio da outra, na faixa comum, o mais perto do conector de
   destino e sem cruzar outros fios (pinos vizinhos viram um "pente" com bolinha em cada fio). Mesma conferência de redes
   de wiretext4.js; só se nada servir cai no label. */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops, E = 1e-6, W4 = HX._wt4; if (!W4) return;
  function segs(W) { var S = []; W.forEach(function (w) { for (var i = 1; i < w.pts.length; i++) { var a = w.pts[i - 1], b = w.pts[i];
    if (Math.abs(a[1] - b[1]) < E) S.push({ h: 1, k: a[1], lo: Math.min(a[0], b[0]), hi: Math.max(a[0], b[0]) }); else if (Math.abs(a[0] - b[0]) < E) S.push({ h: 0, k: a[0], lo: Math.min(a[1], b[1]), hi: Math.max(a[1], b[1]) }); } }); return S; }
  /* quantos trechos alheios o toco cruza; toco vertical em x entre y0..y1 (ou horizontal) */
  function cross(R, h, c, a, b) { var lo = Math.min(a, b), hi = Math.max(a, b); return (h ? R.H : R.V).filter(function (v) { return v[0] > lo + E && v[0] < hi - E && c > v[1] + E && c < v[2] - E; }).length; }
  function near(R, h, c, a, b, g) { var lo = Math.min(a, b), hi = Math.max(a, b); return (h ? R.V : R.H).some(function (v) { return Math.abs(v[0] - c) < g - E && Math.abs(v[0] - c) > E && v[2] > lo + E && v[1] < hi - E; }); }
  function bridge(doc, ka, kb, props) {
    var M0 = W4.netMap(doc), na = M0[ka], nb = M0[kb]; if (!na || !nb || na === nb || !na.wires.length || !nb.wires.length) return false;
    var X = W4.ctx(doc), R = X.R, g = X.g, B = W4.pinOf(X, kb), A = W4.pinOf(X, ka), SA = segs(na.wires), SB = segs(nb.wires), C = [];
    SA.forEach(function (s) { SB.forEach(function (t) { if (s.h !== t.h || Math.abs(s.k - t.k) < E) return; var lo = Math.max(s.lo, t.lo) + g, hi = Math.min(s.hi, t.hi) - g;
      for (var c = HX.snap(lo, g); c <= hi + E; c += g) { if (c < lo - E) continue; var P = s.h ? [[c, s.k], [c, t.k]] : [[s.k, c], [t.k, c]], x = cross(R, s.h, c, s.k, t.k);
        var ref = B ? (s.h ? Math.abs(c - B.pt[0]) : Math.abs(c - B.pt[1])) : 0, refA = A ? (s.h ? Math.abs(c - A.pt[0]) : Math.abs(c - A.pt[1])) : 0;
        C.push({ P: P, sc: x * 1000 + Math.min(ref, refA) + Math.abs(s.k - t.k) * 2 + (near(R, s.h, c, s.k, t.k, g) ? 500 : 0) }); } }); });
    C.sort(function (p, q) { return p.sc - q.sc; });
    for (var i = 0, n = 0; i < C.length && n < 30; i++) { var P = C[i].P; if (!W4.clear(X, P)) continue; n++;
      var S = W4.snapS(doc), w = ops.addWire(doc, P, Object.assign({}, props)); if (w && W4.okNets(doc, M0, ka, kb)) return true; W4.undo(doc, S); }
    return false; }
  /* o roteador enxerga os CONECTORES: nenhum trecho atravessa o corpo de um conector nem passa por cima de um pino alheio
     (antes a via reta podia atravessar o J2 para chegar ao J3 — ficava "um por cima do outro") */
  var rt0 = HX.wtRouter;
  HX.wtRouter = function (sh, g) { var R = rt0.apply(this, arguments), B = [], u = HX._wtUnit || 2.5; /* unidade do projeto (posta pelos chamadores abaixo) */
    sh.items.forEach(function (c) { if (c.type !== 'conn') return; var b = HX.bbox(c, u); B.push({ x0: b.x0 + 0.5, y0: b.y0 + 0.5, x1: b.x1 - 0.5, y1: b.y1 - 0.5 }); });
    function hitB(a, b) { return B.some(function (r) { return HX.segRect(a, b, r); }); }
    var cH = R.clearH, fr = R.free, ok = R.ok, rb = R.rebuild;
    function pins() { sh.items.forEach(function (c) { if (c.type === 'conn') HX.connLayout(c, u).pins.forEach(function (q) { R.PT.push(q.pt); }); }); }
    R.rebuild = function () { rb.apply(R, arguments); pins(); }; pins();
    R.clearH = function (y, xa, xb) { return cH.apply(R, arguments) && !hitB([Math.min(xa, xb), y], [Math.max(xa, xb), y]); };
    R.free = function (x, y0, y1) { return fr.apply(R, arguments) && !hitB([x, y0], [x, y1]); };
    R.ok = function (P) { if (!ok.apply(R, arguments)) return false; for (var i = 1; i < P.length; i++) if (hitB(P[i - 1], P[i])) return false; return true; };
    /* contorno: tenta por cima E por baixo e fica com o mais curto (antes ia sempre por baixo, até passando no carimbo) */
    R.around = function (s, d, bA, t, e, bB) { var best = null, bl = 1e18;
      for (var side = 1; side >= -1; side -= 2) for (var k = 0; k < 40; k++) { var off = g * (2 + k), ea = HX.snap(s[0] + d * off, g), eb = HX.snap(t[0] + e * off, g);
        var ym = side > 0 ? HX.snap(Math.max(bA.y1, bB.y1) + off, g) : HX.snap(Math.min(bA.y0, bB.y0) - off, g), P = HX.cleanPts([s, [ea, s[1]], [ea, ym], [eb, ym], [eb, t[1]], t]);
        if (R.ok(P)) { var L = out(ym) ? 1e9 : 0; for (var i = 1; i < P.length; i++) L += Math.abs(P[i][0] - P[i - 1][0]) + Math.abs(P[i][1] - P[i - 1][1]); if (L < bl) { bl = L; best = P; } break; } }
      return best; };
    return R; };
  /* linha fora da área útil da folha (moldura/carimbo): só se não houver outra */
  function out(y) { var A = HX._wtArea; return !!A && (y < A.y0 || y > A.y1); }
  /* derivação POR FORA: pino livre atrás de outro conector — sai, contorna por cima/baixo de TODOS os conectores e desce
     (ou sobe) até um trecho do fio da rede, com T e bolinha */
  function around(doc, kf, kw, props) { var M0 = W4.netMap(doc), X = W4.ctx(doc), g = X.g, A = W4.pinOf(X, kf); if (!A || !M0[kw]) return false;
    var y0 = 1e9, y1 = -1e9; doc.cur().items.forEach(function (c) { if (c.type === 'conn') { var b = HX.bbox(c, X.u); y0 = Math.min(y0, b.y0); y1 = Math.max(y1, b.y1); } });
    var C = [], s = A.pt; segs(M0[kw].wires).forEach(function (t) { if (!t.h) return;
      for (var v = HX.snap(t.lo, g) + g; v <= t.hi - g + E; v += g) for (var k = 2; k <= 7; k++) [HX.snap(y0, g) - k * g, HX.snap(y1, g) + k * g].forEach(function (ym) {
        for (var j = 2; j <= 5; j++) { var xa = HX.snap(s[0] + A.e * j * g, g); C.push(HX.cleanPts([s, [xa, s[1]], [xa, ym], [v, ym], [v, t.k]])); } }); });
    C.sort(function (p, q) { var l = function (P) { var z = 0; for (var i = 1; i < P.length; i++) z += Math.abs(P[i][0] - P[i - 1][0]) + Math.abs(P[i][1] - P[i - 1][1]); return z; }; return l(p) + (out(p[2] ? p[2][1] : 0) ? 1e9 : 0) - l(q) - (out(q[2] ? q[2][1] : 0) ? 1e9 : 0); });
    for (var i = 0, n = 0; i < C.length && n < 60; i++) { if (!W4.clear(X, C[i])) continue; n++; var S = W4.snapS(doc), w = ops.addWire(doc, C[i], Object.assign({}, props));
      if (w && W4.okNets(doc, M0, kf, kw)) return true; W4.undo(doc, S); }
    return false; }
  /* unidade e área útil da folha para o roteador, em toda chamada da lista de fiação */
  function env(doc) { HX._wtUnit = doc.p.unit || 2.5; HX._wtArea = HX.usableArea && !HX.isPhys(doc.cur()) && doc.p.meta.template !== 'none' ? HX.usableArea(doc.p) : null; }
  var ap5 = HX.wtApply; HX.wtApply = function (doc) { env(doc); return ap5.apply(this, arguments); };
  HX.wtBridge = bridge;
  var lo0 = HX.wtLinkOcc;
  HX.wtLinkOcc = function (doc, ka, kb, props) { env(doc); var M = W4.netMap(doc), a = M[ka], b = M[kb];
    var wa = a && a.wires.length, wb = b && b.wires.length;
    if (wa && wb && bridge(doc, ka, kb, props)) return 'deriv';
    if (!!wa !== !!wb) { var f = wa ? kb : ka, w = wa ? ka : kb; if (W4.derive(doc, ka, kb, props) || around(doc, f, w, props)) return 'deriv'; if (W4.viaLabel(doc, ka, kb, props)) return 'label'; return null; }
    return lo0.apply(this, arguments); };
})(typeof window !== 'undefined' ? window : globalThis);
