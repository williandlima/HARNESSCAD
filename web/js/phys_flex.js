/* HarnessCAD - desenho físico: RAMOS MALEÁVEIS.
   pseg.bends = [[t, n], ...]: pontos de curva relativos à corda A→B (t = 0..1 ao longo da corda, n = afastamento
   perpendicular em mm do papel). A curva passa por todos os pontos (Catmull-Rom centrípeta), então ao mover os nós o
   ramo estica/gira mantendo a forma. Com bends, x,y do ramo desloca todos os pontos (arrastar o ramo).
   Sem bends vale a curva antiga (x,y = meio deslocado). Dividir e juntar ramos preservam o traçado. */
(function (G) {
  'use strict';
  var HX = G.HX, seg0 = HX.physSegPts;
  function frame(A, B) { var dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1e-9; return { dx: dx, dy: dy, L: L, nx: -dy / L, ny: dx / L }; }
  HX.physBendWorld = function (sg, m) { // pontos de curva em coordenadas do papel
    var A = m[sg.a], B = m[sg.b]; if (!A || !B || !sg.bends || !sg.bends.length) return [];
    var F = frame(A, B), ox = +sg.x || 0, oy = +sg.y || 0;
    return sg.bends.map(function (b) { return [A.x + F.dx * b[0] + F.nx * b[1] + ox, A.y + F.dy * b[0] + F.ny * b[1] + oy]; });
  };
  HX.physBendFrom = function (sg, m, p) { // ponto do papel → [t, n] (sem o deslocamento x,y)
    var A = m[sg.a], B = m[sg.b], F = frame(A, B), px = p[0] - (+sg.x || 0) - A.x, py = p[1] - (+sg.y || 0) - A.y;
    return [HX.r3((px * F.dx + py * F.dy) / (F.L * F.L)), HX.r3(px * F.nx + py * F.ny)];
  };
  function cr(P) { // Catmull-Rom centrípeta pelos pontos
    var out = [P[0]], Q = [P[0]].concat(P, [P[P.length - 1]]);
    for (var i = 1; i < Q.length - 2; i++) {
      var p0 = Q[i - 1], p1 = Q[i], p2 = Q[i + 1], p3 = Q[i + 2];
      var d = function (a, b) { return Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]) || 1e-4, 0.5); }, t1 = d(p0, p1), t2 = t1 + d(p1, p2), t3 = t2 + d(p2, p3);
      for (var k = 1; k <= 12; k++) {
        var t = t1 + (t2 - t1) * k / 12, L = function (a, b, ta, tb) { var u = (tb - t) / (tb - ta || 1e-9); return [a[0] * u + b[0] * (1 - u), a[1] * u + b[1] * (1 - u)]; };
        var A1 = L(p0, p1, 0, t1), A2 = L(p1, p2, t1, t2), A3 = L(p2, p3, t2, t3), B1 = L(A1, A2, 0, t2), B2 = L(A2, A3, t1, t3);
        out.push(L(B1, B2, t1, t2));
      }
    }
    return out;
  }
  HX.physSegPts = function (sg, m) {
    if (!sg.bends || !sg.bends.length) return seg0(sg, m);
    var A = m[sg.a], B = m[sg.b]; if (!A || !B) return null;
    return cr([[A.x, A.y]].concat(HX.physBendWorld(sg, m), [[B.x, B.y]]));
  };
  function setWorld(sg, m, W) { // grava pontos do papel como bends
    sg.x = 0; sg.y = 0; sg.bends = W.map(function (p) { return HX.physBendFrom(sg, m, p); }); // na ordem do traçado
  }
  HX.physBendSet = setWorld;
  HX.physAddBend = function (sg, m, p) {
    var W = HX.physBendWorld(sg, m);
    if (!W.length && (+sg.x || +sg.y)) { var P = seg0(sg, m); W = [HX.polyAt(P, 0.5).pt]; } // curva antiga vira 1 ponto
    var A = m[sg.a], B = m[sg.b], all = [[A.x, A.y]].concat(W, [[B.x, B.y]]), best = 0, bd = Infinity;
    for (var i = 1; i < all.length; i++) { var d = HX.distSeg(p, all[i - 1], all[i]); if (d < bd) { bd = d; best = i; } }
    W.splice(best - 1, 0, p.slice()); sg.x = 0; sg.y = 0;
    sg.bends = W.map(function (q) { return HX.physBendFrom(sg, m, q); }); return best - 1;
  };
  HX.physDelBend = function (sg, i) { if (sg.bends) sg.bends.splice(i, 1); if (sg.bends && !sg.bends.length) delete sg.bends; };
  HX.physStraighten = function (sg) { delete sg.bends; sg.x = 0; sg.y = 0; };
  // dividir: cada metade fica com os pontos do seu lado; o traçado não muda
  var split0 = HX.physSplitAt;
  HX.physSplitAt = function (doc, sg, t) {
    var sh = doc.cur(), m = HX.physIdx(sh); if (!sg.bends || !sg.bends.length) return split0(doc, sg, t);
    var P = HX.physSegPts(sg, m), q = HX.polyAt(P, Math.max(0.02, Math.min(0.98, t == null ? 0.5 : t))).pt, W = HX.physBendWorld(sg, m), oldB = sg.b, nd = split0(doc, sg, t);
    if (!nd) return nd; m = HX.physIdx(sh); var s2 = sh.items.filter(function (s) { return s.type === 'pseg' && s.a === nd.id && s.b === oldB; })[0];
    var A = m[sg.a], d0 = Math.hypot(q[0] - A.x, q[1] - A.y), w1 = [], w2 = [];
    W.forEach(function (p) { (Math.hypot(p[0] - A.x, p[1] - A.y) < d0 ? w1 : w2).push(p); });
    setWorld(sg, m, w1); if (s2) setWorld(s2, m, w2); [sg, s2].forEach(function (s) { if (s && !s.bends.length) delete s.bends; });
    return nd;
  };
  // juntar (tirar BR sem ramificação): o BR vira um ponto de curva
  var merge0 = HX.physMergeBR;
  HX.physMergeBR = function (doc, nd, sh0) {
    var sh = sh0 || doc.cur(), m = HX.physIdx(sh), ss = sh.items.filter(function (s) { return s.type === 'pseg' && (s.a === nd.id || s.b === nd.id); });
    if (ss.length !== 2) return merge0(doc, nd, sh0);
    var W = [], s1 = ss[0], s2 = ss[1];
    function interior(s, fromNd) { var P = HX.physSegPts(s, m), w = HX.physBendWorld(s, m); if (!w.length && (+s.x || +s.y)) w = [HX.polyAt(P, 0.5).pt]; return (s.a === nd.id) === fromNd ? w : w.slice().reverse(); }
    W = interior(s1, false).concat([[nd.x, nd.y]], interior(s2, true));
    var ok = merge0(doc, nd, sh0); if (!ok) return ok; m = HX.physIdx(sh);
    var straight = W.length === 1 && HX.distSeg(W[0], [m[s1.a].x, m[s1.a].y], [m[s1.b].x, m[s1.b].y]) < 0.5;
    if (!straight) setWorld(s1, m, W); if (s1.bends && !s1.bends.length) delete s1.bends;
    return ok;
  };
  // espelhar sub-ramo: o lado da curva troca
  var mir0 = HX.physMirrorSub;
  HX.physMirrorSub = function (sh, sg) { var S = mir0(sh, sg); S.segs.forEach(function (g) { if (g.bends) g.bends = g.bends.map(function (b) { return [b[0], -b[1]]; }); }); return S; };
})(typeof window !== 'undefined' ? window : globalThis);
