/* HarnessCAD - desenho físico: operações sobre SUB-RAMOS e traçado.
   Sub-ramo de um ramo = o lado menor (nós "rio abaixo"). Girar/espelhar em torno do nó pivô mantendo comprimentos,
   selecionar sub-ramo (para copiar com acessórios), deslizar BR no tronco, redesenhar em escala, alinhar/distribuir. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function adj(sh) { var A = {}; sh.items.forEach(function (s) { if (s.type === 'pseg') { (A[s.a] = A[s.a] || []).push(s); (A[s.b] = A[s.b] || []).push(s); } }); return A; }
  function reach(A, start, block) { // nós alcançáveis sem atravessar os ramos/nós bloqueados
    var seen = {}, st = [start]; seen[start] = 1;
    while (st.length) { var u = st.pop(); (A[u] || []).forEach(function (s) { if (block[s.id]) return; var v = s.a === u ? s.b : s.a; if (!seen[v] && !block[v]) { seen[v] = 1; st.push(v); } }); }
    return seen;
  }
  // { pivot, nodes{id:1}, segs[] } do lado menor do ramo sg
  HX.physSub = function (sh, sg) {
    var A = adj(sh), bl = {}; bl[sg.id] = 1;
    var ra = reach(A, sg.a, bl), rb = reach(A, sg.b, bl), na = Object.keys(ra).length, nb = Object.keys(rb).length;
    var side = rb[sg.a] ? rb : nb <= na ? rb : ra, pivot = side === rb ? sg.a : sg.b;
    if (side[pivot]) { side = {}; side[sg.b] = 1; pivot = sg.a; } // laço: só a ponta
    var segs = sh.items.filter(function (s) { return s.type === 'pseg' && (side[s.a] || side[s.b]); });
    return { pivot: pivot, nodes: side, segs: segs };
  };
  function attached(sh, nodes) { return sh.items.filter(function (i) { return (i.type === 'pimg' && i.of && nodes[i.of]); }); }
  // gira o sub-ramo de sg em torno do pivô (graus, sentido horário na tela)
  HX.physRotateSub = function (sh, sg, deg) {
    var S = HX.physSub(sh, sg), m = HX.physIdx(sh), P = m[S.pivot], r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    function rot(x, y) { return [c * x - s * y, s * x + c * y]; }
    Object.keys(S.nodes).forEach(function (id) { var n = m[id], q = rot(n.x - P.x, n.y - P.y); n.x = HX.r3(P.x + q[0]); n.y = HX.r3(P.y + q[1]); if (n.rot !== '' && n.rot != null && isFinite(+n.rot)) n.rot = Math.round(((+n.rot + deg) % 360 + 360) % 360); });
    S.segs.forEach(function (g) { var q = rot(+g.x || 0, +g.y || 0); g.x = HX.r3(q[0]); g.y = HX.r3(q[1]); });
    attached(sh, S.nodes).forEach(function (i) { var q = rot(i.x - P.x, i.y - P.y); i.x = HX.r3(P.x + q[0]); i.y = HX.r3(P.y + q[1]); });
    return S;
  };
  // espelha o sub-ramo pelo eixo do próprio ramo (pivô → ponta)
  HX.physMirrorSub = function (sh, sg) {
    var S = HX.physSub(sh, sg), m = HX.physIdx(sh), P = m[S.pivot], Q = m[S.pivot === sg.a ? sg.b : sg.a], dx = Q.x - P.x, dy = Q.y - P.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    function ref(x, y) { var d = x * ux + y * uy; return [2 * d * ux - x, 2 * d * uy - y]; }
    Object.keys(S.nodes).forEach(function (id) { var n = m[id], q = ref(n.x - P.x, n.y - P.y); n.x = HX.r3(P.x + q[0]); n.y = HX.r3(P.y + q[1]); if (n.nkind === 'conn') n.flip = !n.flip; });
    S.segs.forEach(function (g) { var q = ref(+g.x || 0, +g.y || 0); g.x = HX.r3(q[0]); g.y = HX.r3(q[1]); });
    if (sg.x || sg.y) { var q0 = ref(+sg.x || 0, +sg.y || 0); sg.x = HX.r3(q0[0]); sg.y = HX.r3(q0[1]); }
    return S;
  };
  // ids para selecionar o sub-ramo inteiro (nós, ramos e tudo que está preso a eles) — copiar/colar leva junto
  HX.physSubIds = function (sh, sg) {
    var S = HX.physSub(sh, sg), set = {}; Object.keys(S.nodes).forEach(function (k) { set[k] = 1; }); S.segs.forEach(function (g) { set[g.id] = 1; }); set[sg.id] = 1;
    sh.items.forEach(function (i) { if ((i.of && set[i.of]) || (i.seg && set[i.seg]) || (i.type === 'pdim' && set[i.a] && set[i.b] && i.mode === 'seg')) set[i.id] = 1; });
    return Object.keys(set);
  };
  // os dois ramos mais alinhados de um BR (o tronco que passa por ele)
  HX.physTrunkAt = function (sh, nd) {
    var m = HX.physIdx(sh), ss = HX.physSegsOf(sh, nd.id), best = null, bv = 2;
    ss.forEach(function (s1, i) { ss.slice(i + 1).forEach(function (s2) {
      var a = m[s1.a === nd.id ? s1.b : s1.a], c = m[s2.a === nd.id ? s2.b : s2.a], v = ((a.x - nd.x) * (c.x - nd.x) + (a.y - nd.y) * (c.y - nd.y)) / ((Math.hypot(a.x - nd.x, a.y - nd.y) * Math.hypot(c.x - nd.x, c.y - nd.y)) || 1);
      if (v < bv) { bv = v; best = { s1: s1, s2: s2, A: a, C: c }; } }); });
    return best;
  };
  // desliza o BR no tronco: distância d (mm reais) a partir da ponta A; o que sai do BR vai junto
  HX.physSlideBR = function (sh, nd, d) {
    var t = HX.physTrunkAt(sh, nd); if (!t) return false;
    var m = HX.physIdx(sh), N = +sh.scale || 1, L1 = HX.physSegLen(t.s1, m, N), L2 = HX.physSegLen(t.s2, m, N), T = L1 + L2; d = Math.max(1, Math.min(T - 1, +d));
    if (!(d > 0)) return false;
    var typed = !HX.physSegAuto(t.s1) || !HX.physSegAuto(t.s2);
    if (typed) { t.s1.len = Math.round(d); t.s2.len = Math.round(T - d); }
    var nx = t.A.x + (t.C.x - t.A.x) * d / T, ny = t.A.y + (t.C.y - t.A.y) * d / T, dx = nx - nd.x, dy = ny - nd.y, A = adj(sh), bl = {};
    bl[t.s1.id] = 1; bl[t.s2.id] = 1; bl[t.A.id] = 1; bl[t.C.id] = 1;
    var mv = reach(A, nd.id, bl); Object.keys(mv).forEach(function (id) { var n = m[id]; n.x = HX.r3(n.x + dx); n.y = HX.r3(n.y + dy); });
    t.s1.x = t.s1.y = t.s2.x = t.s2.y = 0;
    return { from: t.A, d: d, total: T };
  };
  // redesenha em escala: cada ramo com comprimento digitado passa a medir len/N no papel (o resto do lado acompanha)
  HX.physRedrawScale = function (sh) {
    var m = HX.physIdx(sh), N = +sh.scale || 1, A = adj(sh), nodes = sh.items.filter(function (i) { return i.type === 'pnode'; }), done = {}, n = 0;
    if (!nodes.length) return 0;
    var root = nodes.filter(function (i) { return i.nkind === 'conn'; }).sort(function (a, b) { return a.x - b.x; })[0] || nodes[0], seen = {}, q = [root.id]; seen[root.id] = 1;
    while (q.length) {
      var u = q.shift();
      (A[u] || []).forEach(function (s) {
        if (done[s.id]) return; done[s.id] = 1; var v = s.a === u ? s.b : s.a; if (seen[v]) return; seen[v] = 1; q.push(v);
        if (HX.physSegAuto(s)) return;
        var P = HX.physSegPts(s, m), Lp = HX.polyLen(P) || 1, f = (+s.len / N) / Lp; if (Math.abs(f - 1) < 0.002) return;
        var U = m[u], V = m[v], dx = (V.x - U.x) * (f - 1), dy = (V.y - U.y) * (f - 1), bl = {}; bl[s.id] = 1; bl[u] = 1;
        var mv = reach(A, v, bl); Object.keys(mv).forEach(function (id) { if (seen[id] && id !== v) return; var k = m[id]; k.x = HX.r3(k.x + dx); k.y = HX.r3(k.y + dy); });
        s.x = HX.r3((+s.x || 0) * f); s.y = HX.r3((+s.y || 0) * f); n++;
      });
    }
    return n;
  };
  // alinhar / distribuir nós e itens selecionados
  HX.physAlign = function (items, how) {
    var ns = items.filter(function (i) { return i.type === 'pnode' || i.type === 'pimg'; }); if (ns.length < 2) return 0;
    if (how === 'h' || how === 'v') { var k = how === 'h' ? 'y' : 'x', v = ns.reduce(function (a, i) { return a + i[k]; }, 0) / ns.length; ns.forEach(function (i) { i[k] = HX.r3(v); }); }
    else { var kk = how === 'dv' ? 'y' : 'x', s = ns.slice().sort(function (a, b) { return a[kk] - b[kk]; }), a0 = s[0][kk], st = (s[s.length - 1][kk] - a0) / (s.length - 1); s.forEach(function (i, j) { i[kk] = HX.r3(a0 + st * j); }); }
    return ns.length;
  };
  // ímã de ângulo: ponto q visto do nó P encaixa em múltiplos de 45° (±6°), mantendo a distância
  HX.physSnapAngle = function (P, q, stepDeg, tolDeg) {
    var dx = q[0] - P[0], dy = q[1] - P[1], L = Math.hypot(dx, dy); if (L < 1e-6) return q;
    var a = Math.atan2(dy, dx) * 180 / Math.PI, st = stepDeg || 45, s = Math.round(a / st) * st;
    if (Math.abs(a - s) > (tolDeg == null ? 6 : tolDeg)) return q;
    var r = s * Math.PI / 180; return [HX.r3(P[0] + Math.cos(r) * L), HX.r3(P[1] + Math.sin(r) * L)];
  };
})(typeof window !== 'undefined' ? window : globalThis);
