/* HarnessCAD - desenho físico: FEIXE SEM CAPA (fios aparentes) com a QUANTIDADE REAL de fios do esquemático.
   • Um traço por fio que passa no ramo (sem limite), na cor do fio, com passo legível igual em toda a folha
     (folha.wirePitch em mm de papel; vazio = automático pelo ramo mais cheio).
   • Ordem lateral dos fios sem cruzamento: phys_loose2.js.
   • Na derivação (BR) cada fio faz uma CURVA suave do ramo de origem para o ramo de destino; ramo curvo acompanha a curva.
   • No conector os fios afunilam até a largura da saída (backshell/bota). Par trançado ondulado. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function nd(C, id) { return C.m[id]; }
  function isConn(n) { return n && n.nkind === 'conn'; }
  function segsAt(sh, id) { return sh.items.filter(function (s) { return s.type === 'pseg' && (s.a === id || s.b === id); }); }
  // direção (unitária) saindo do nó id para dentro do ramo
  function dirOut(sg, id, m) { var P = sg._P || HX.physSegPts(sg, m); if (!P) return [1, 0]; if (sg.b === id) P = P.slice().reverse(); var q = HX.polyAt(P, Math.min(0.5, 2 / (HX.polyLen(P) || 1))).pt, dx = q[0] - P[0][0], dy = q[1] - P[0][1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; }
  HX.physWirePitch = function (sh, BU) {
    if (+sh.wirePitch > 0) return +sh.wirePitch;
    if (BU._pitch) return BU._pitch; var mx = 1; Object.keys(BU.seg).forEach(function (k) { mx = Math.max(mx, BU.seg[k].wires.length); });
    return (BU._pitch = Math.max(0.42, Math.min(0.7, 7.5 / mx))); // fios distintos (traço + vão), feixe compacto
  };
  // largura visual do ramo no papel (sem capa = nº de fios × passo)
  HX.physVisW = function (sg, sh, BU) {
    var b = BU.seg[sg.id] || { wires: [] };
    return HX.physLooseOf(sg, sh) ? Math.max(1, b.wires.length) * HX.physWirePitch(sh, BU) : HX.bundleW(b.od);
  };
  HX.physWireLW = function (sh, BU) { return Math.max(0.2, HX.physWirePitch(sh, BU) * 0.6); };
  function order(sg, sh, C, BU) { return HX.physLooseOrder(sg, sh, C, BU); }
  function ss(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function offsetPts(P, off, kf, st) {
    var L = HX.polyLen(P) || 1, n = Math.max(8, Math.ceil(L / (st || 1))), out = [];
    for (var i = 0; i <= n; i++) { var t = i / n, q = HX.polyAt(P, t), s = t * L, o = (typeof off === 'function' ? off(s) : off) * kf(s, L); out.push([q.pt[0] - q.d[1] * o, q.pt[1] + q.d[0] * o]); }
    return out;
  }
  function trimmed(P, tA, tB) { var L0 = HX.polyLen(P); if (!(tA || tB) || L0 <= tA + tB + 0.5) return P; return HX.physTrim(P, tA / L0, 1 - tB / L0); }
  function junR(sh, id, C, BU) { var r = 0; segsAt(sh, id).forEach(function (s) { r = Math.max(r, HX.physVisW(s, sh, BU)); }); return Math.max(2.5, r * 0.9 + 1.2); }
  function stroke(g, Q, w, lw) { g.style({ stroke: '#111111', lw: lw + 0.06, fill: null, dash: null }); g.poly(Q, false); g.style({ stroke: HX.wireHex(w), lw: lw }); g.poly(Q, false); }
  function bez(a, c1, c2, b) { var out = []; for (var i = 0; i <= 16; i++) { var t = i / 16, u = 1 - t; out.push([u * u * u * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * b[0], u * u * u * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * b[1]]); } return out; }
  // geometria de um ramo sem capa: traçado recortado, ordem, passo e afunilamento no conector
  function segGeo(sg, sh, C, BU) {
    var P = sg._P || HX.physSegPts(sg, C.m); if (!P) return null; var ws = order(sg, sh, C, BU), n = ws.length, p = HX.physWirePitch(sh, BU), A = nd(C, sg.a), B = nd(C, sg.b), F = HX.PHYS_FAN || 7;
    var xA = HX.physDsubExposed && HX.physDsubExposed(A, C), xB = HX.physDsubExposed && HX.physDsubExposed(B, C), rA = xA ? HX.physConnTrim(A, C) : isConn(A) ? 0 : junR(sh, sg.a, C, BU), rB = xB ? HX.physConnTrim(B, C) : isConn(B) ? 0 : junR(sh, sg.b, C, BU), cA = isConn(A) && !xA, cB = isConn(B) && !xB;
    // os fios saem do próprio conector já na ordem do ramo (sem leque separado): abrem suave e seguem PARALELOS
    var kc = Math.min(1, Math.max(0.6, HX.bundleW((BU.seg[sg.id] || {}).od) * 0.9) / Math.max(1e-6, n * p));
    if (cA) HX._looseConn[A.id] = 1; if (cB) HX._looseConn[B.id] = 1;
    var Pt = trimmed(P, rA, rB), pz = HX.physPinchFn ? HX.physPinchFn(sg, Pt, C, BU) : null;
    return { sg: sg, ws: ws, n: n, p: p, r: { a: rA, b: rB }, Pt: Pt,
      kf: function (s, L) { var tl = Math.min(F, L * 0.3), k = 1; if (cA) k = Math.min(k, kc + (1 - kc) * ss(s / tl)); if (cB) k = Math.min(k, kc + (1 - kc) * ss((L - s) / tl)); return pz ? k * pz(s) : k; } };
  }
  function wirePts(S, w) { // pontos do fio no ramo (sentido a→b)
    var i = S.ws.indexOf(w), n = S.n, p = S.p, off = (i - (n - 1) / 2) * p, pr = w.twist && S.ws.filter(function (v) { return v.twist === w.twist; });
    if (pr && pr.length === 2) { var j = pr.indexOf(w), mc = (S.ws.indexOf(pr[0]) + S.ws.indexOf(pr[1]) - (n - 1)) / 2 * p, per = Math.max(2.2, p * 7), ph = (S.ws.indexOf(pr[0]) * 0.618 % 1) * 2 * Math.PI; off = function (s) { return mc + (j ? 1 : -1) * Math.cos(s / per * 2 * Math.PI + ph) * p * 0.45; }; }
    return offsetPts(S.Pt, off, S.kf, typeof off === 'function' ? 0.3 : 1);
  }
  function unit(a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; }
  // todos os fios aparentes da folha, cada um como UM traço contínuo pelos ramos sem capa (curvas nas derivações)
  function loosePass(g, p, s, o) {
    var C = HX.physCtx(p, s, o), sh = C.sh, BU = HX.physBundleCtx(p, s, o), geo = {}, any = false; HX._looseConn = {};
    sh.items.forEach(function (sg) { if (sg.type === 'pseg' && HX.physLooseOf(sg, sh)) { var S = segGeo(sg, sh, C, BU); if (S) { geo[sg.id] = S; any = true; } } });
    HX._looseNodes = sh.items.filter(function (i) { return i.type === 'pnode' && HX._looseConn[i.id]; }); if (!any) return; var lw = HX.physWireLW(sh, BU), seen = [];
    Object.keys(geo).forEach(function (id) { geo[id].ws.forEach(function (w) { if (seen.indexOf(w) < 0) seen.push(w); }); });
    if (HX.physLooseSort) seen = HX.physLooseSort(seen, geo);
    seen.forEach(function (w) {
      var segs = sh.items.filter(function (x) { return x.type === 'pseg' && (BU.seg[x.id] || { wires: [] }).wires.indexOf(w) >= 0; }), deg = {};
      segs.forEach(function (x) { deg[x.a] = (deg[x.a] || 0) + 1; deg[x.b] = (deg[x.b] || 0) + 1; });
      var start = segs.filter(function (x) { return deg[x.a] === 1 || deg[x.b] === 1; })[0] || segs[0], node = deg[start.a] === 1 ? start.a : start.b, cur = start, used = {}, piece = null, out = [];
      while (cur && !used[cur.id]) {
        used[cur.id] = 1; var far = cur.a === node ? cur.b : cur.a, S = geo[cur.id];
        var nxt = segs.filter(function (x) { return !used[x.id] && (x.a === far || x.b === far); })[0];
        if (S) {
          var Q = wirePts(S, w), fw = cur.a === node, d1 = HX.polyAt(S.Pt, 0).d, d2 = HX.polyAt(S.Pt, 1).d, dS = fw ? d1 : [-d2[0], -d2[1]], dE = fw ? d2 : [-d1[0], -d1[1]]; if (!fw) Q = Q.reverse();
          if (piece) { var a = piece[piece.length - 1], da = piece.dE, b = Q[0], db = dS, r = S.r[node === cur.a ? 'a' : 'b'] || 3; piece = piece.concat(bez(a, [a[0] + da[0] * r * 0.55, a[1] + da[1] * r * 0.55], [b[0] - db[0] * r * 0.55, b[1] - db[1] * r * 0.55], b).slice(1, -1)); }
          else { piece = []; var N0 = nd(C, node), rr = S.r[node === cur.a ? 'a' : 'b']; if (rr && N0) { var d0 = dS; piece = bez([N0.x, N0.y], [N0.x, N0.y], [Q[0][0] - d0[0] * rr * 0.4, Q[0][1] - d0[1] * rr * 0.4], Q[0]).slice(0, -1); } }
          piece = piece.concat(Q); piece.dE = dE;
          var rf = S.r[far === cur.a ? 'a' : 'b'], NF = nd(C, far);
          if (rf && NF && !(nxt && geo[nxt.id])) { var e = piece[piece.length - 1], de = dE, v = nxt ? dirOut(nxt, far, C.m) : de; piece = piece.concat(bez(e, [e[0] + de[0] * rf * 0.55, e[1] + de[1] * rf * 0.55], [NF.x - v[0] * rf * 0.3, NF.y - v[1] * rf * 0.3], [NF.x, NF.y]).slice(1)); }
          if (!(nxt && geo[nxt.id])) { out.push(piece); piece = null; }
        }
        node = far; cur = nxt;
      }
      if (piece) out.push(piece);
      out.forEach(function (Q) { stroke(g, Q, w, lw); });
    });
  }
  // o ramo sem capa só marca o traçado; os fios saem do passe da folha (loosePass)
  function looseDraw(g, sg, P, C, BU) {
    HX.physHide(sg, '_P', P); if ((BU.seg[sg.id] || { wires: [] }).wires.length) return;
    g.style({ stroke: '#888', lw: 0.2, dash: [1, 1] }); g.poly(P, false); g.style({ dash: null });
  }
  HX.physLoosePass = loosePass;
  var dr = HX.drawSheetItems;
  HX.drawSheetItems = function (g, p, s, o) {
    var sh = p.sheets[s];
    if (sh && HX.isPhys(sh) && !Object.prototype.hasOwnProperty.call(o, '_looseDone')) {
      o._looseDone = 1; var m = HX.physIdx(sh); sh.items.forEach(function (i) { if (i.type === 'pseg') HX.physHide(i, '_P', HX.physSegPts(i, m)); });
      if (!Object.prototype.hasOwnProperty.call(o, '_bodyDone') && HX.physBranchDraw) { o._bodyDone = 1; HX.physBranchDraw.body(g, p, s, o); } loosePass(g, p, s, o);
    }
    return dr(g, p, s, o);
  };
  var fan0 = HX.physFan; HX._looseConn = {};
  HX.physFan = function (g, x, y) { var k = HX._looseConn, hit = false; if (HX._looseNodes) HX._looseNodes.forEach(function (n) { if (k[n.id] && Math.abs(n.x - x) < 1e-6 && Math.abs(n.y - y) < 1e-6) hit = true; }); if (hit) return; return fan0.apply(this, arguments); };
  HX.physLooseDraw = looseDraw;
  if (HX.physBranchDraw) HX.physBranchDraw.loose = looseDraw;
})(typeof window !== 'undefined' ? window : globalThis);
