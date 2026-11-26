/* HarnessCAD - LISTA DE FIAÇÃO: ligar em pino que JÁ TEM fio (ex.: J3:A > J1:A com J1:A já ligado a J2:A, ou conector novo
   "J4 = PEÇA" ligando em pinos ocupados). Quando o traçado normal (wiretext3.js) recusa a linha, tenta em ordem:
   1) DERIVAÇÃO: via nova do pino livre até um trecho do fio já existente da rede (T — a emenda/bolinha entra sozinha);
   2) LABEL de circuito com o mesmo nome nas duas pontas (toco curto + label) — liga sem cruzar nada.
   Cada tentativa passa pela mesma conferência de redes (nada de curto); r.how[linha] = 'deriv' | 'label'. */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops, E = 1e-6;
  function netMap(doc) { var nl = HX.buildNetlist(doc.p), m = {}, here = {}; doc.cur().items.forEach(function (i) { here[i.id] = 1; });
    nl.nets.forEach(function (n) { n.pins.forEach(function (t) { if (t.item && t.item.type === 'conn' && here[t.item.id]) m[t.ref + ':' + t.pin] = n; }); }); return m; }
  function ctx(doc) { var sh = doc.cur(), u = doc.p.unit, g = Math.max(u, 2.5), R = HX.wtRouter(sh, g), C = {}, B = [];
    sh.items.forEach(function (i) { if (i.type !== 'conn') return; C[i.ref] = i; var b = HX.bbox(i, u); B.push({ x0: b.x0 + 0.5, y0: b.y0 + 0.5, x1: b.x1 - 0.5, y1: b.y1 - 0.5 });
      HX.connLayout(i, u).pins.forEach(function (q) { R.PT.push(q.pt); }); });
    return { sh: sh, u: u, g: g, R: R, C: C, B: B }; }
  function pinOf(X, k) { var p = k.split(':'), c = X.C[p[0]]; if (!c) return null; var q = HX.connLayout(c, X.u).pins.filter(function (x) { return String(x.n) === p[1]; })[0]; if (!q) return null;
    var b = HX.bbox(c, X.u); return { c: c, q: q, pt: q.pt, e: q.pt[0] >= (b.x0 + b.x1) / 2 ? 1 : -1 }; }
  function clear(X, P) { if (!X.R.ok(P)) return false; for (var i = 1; i < P.length; i++) if (X.B.some(function (b) { return HX.segRect(P[i - 1], P[i], b); })) return false; return true; }
  function len(P) { var s = 0; for (var i = 1; i < P.length; i++) s += Math.abs(P[i][0] - P[i - 1][0]) + Math.abs(P[i][1] - P[i - 1][1]); return s; }
  /* caminhos do pino (saída na direção e) até um ponto interior de algum trecho dos fios da rede */
  function cands(X, A, W) { var g = X.g, s = A.pt, e = A.e, L = [];
    W.forEach(function (w) { for (var i = 1; i < w.pts.length; i++) { var a = w.pts[i - 1], b = w.pts[i], hz = Math.abs(a[1] - b[1]) < E, vt = Math.abs(a[0] - b[0]) < E; if (!hz && !vt) continue;
      var lo = hz ? Math.min(a[0], b[0]) : Math.min(a[1], b[1]), hi = hz ? Math.max(a[0], b[0]) : Math.max(a[1], b[1]);
      for (var v = HX.snap(lo, g) + g; v <= hi - g + E; v += g) {
        if (hz) { var y = a[1]; if ((v - s[0]) * e >= 2 * g - E && Math.abs(y - s[1]) > E) L.push([s, [v, s[1]], [v, y]]);
          for (var k = 2; k <= 8; k++) { var xa = HX.snap(s[0] + e * k * g, g), ym = y + (s[1] > y ? 2 : -2) * g; L.push(HX.cleanPts([s, [xa, s[1]], [xa, ym], [v, ym], [v, y]])); } }
        else { var x = a[0]; if (Math.abs(v - s[1]) < E && (x - s[0]) * e > 2 * g) L.push([s, [x, v]]);
          for (var k2 = 2; k2 <= 8; k2++) { var xb = HX.snap(s[0] + e * k2 * g, g); if ((x - xb) * e > g - E || (xb - x) * e > g - E) L.push(HX.cleanPts([s, [xb, s[1]], [xb, v], [x, v]])); } } } } });
    return L.filter(function (P) { return P.length > 1; }).sort(function (p, q) { return len(p) - len(q); }); }
  function snapS(doc) { return { s: JSON.stringify(doc.cur().items), n: doc.p.nextId }; }
  function undo(doc, S) { doc.cur().items = JSON.parse(S.s); doc.p.nextId = S.n; }
  /* rede de k + rede de j juntas e nenhuma outra junto */
  function okNets(doc, M0, ka, kb) { var M = netMap(doc), na = M[ka], nb = M[kb]; if (!na || na !== nb) return false;
    var a0 = M0[ka] && M0[ka].id, b0 = M0[kb] && M0[kb].id; return Object.keys(M).every(function (k) { if (M[k] !== na) return true; var o = M0[k] && M0[k].id; return k === ka || k === kb || o === a0 && o != null || o === b0 && o != null; }); }
  function derive(doc, ka, kb, props) { var M0 = netMap(doc), X = ctx(doc), A = pinOf(X, ka), B = pinOf(X, kb); if (!A || !B) return false;
    var free = function (k) { var n = M0[k]; return !n || !n.wires.length; };
    var tries = [[A, kb, ka], [B, ka, kb]].filter(function (t) { return free(t[2]) && M0[t[1]] && M0[t[1]].wires.length; });
    for (var i = 0; i < tries.length; i++) { var P = cands(X, tries[i][0], M0[tries[i][1]].wires).filter(function (P) { return clear(X, P); }).slice(0, 25);
      for (var j = 0; j < P.length; j++) { var S = snapS(doc), w = ops.addWire(doc, HX.cleanPts(P[j]), Object.assign({}, props)); if (w && okNets(doc, M0, ka, kb)) return true; undo(doc, S); } }
    return false; }
  /* toco + label nas duas pontas; ponta já ligada: toco vertical que sai do fio dela */
  function stub(doc, X, k, M0) { var A = pinOf(X, k), g = X.g, n = M0[k]; if (!A) return null; var L = [];
    if (!n || !n.wires.length) for (var s = 3; s <= 6; s++) L.push([A.pt, [A.pt[0] + A.e * s * g, A.pt[1]]]);
    else n.wires.forEach(function (w) { for (var i = 1; i < w.pts.length; i++) { var a = w.pts[i - 1], b = w.pts[i]; if (Math.abs(a[1] - b[1]) > E) continue;
      for (var x = HX.snap(Math.min(a[0], b[0]), g) + g; x <= Math.max(a[0], b[0]) - g + E; x += g) [-1, 1].forEach(function (d) { for (var s2 = 2; s2 <= 4; s2++) L.push([[x, a[1]], [x, a[1] + d * s2 * g]]); }); } });
    function onW(q) { return X.R.H.some(function (v) { return Math.abs(v[0] - q[1]) < E && q[0] >= v[1] - E && q[0] <= v[2] + E; }) || X.R.V.some(function (v) { return Math.abs(v[0] - q[0]) < E && q[1] >= v[1] - E && q[1] <= v[2] + E; }) || X.R.PT.some(function (p) { return Math.abs(p[0] - q[0]) < E && Math.abs(p[1] - q[1]) < E; }); }
    return L.filter(function (P) { return !onW(P[P.length - 1]) && clear(X, P); })[0] || null; }
  function viaLabel(doc, ka, kb, props) { var M0 = netMap(doc), X = ctx(doc), S = snapS(doc), nm = (M0[kb] && M0[kb].name && !/^N\$/.test(M0[kb].name)) ? M0[kb].name : (M0[ka] && M0[ka].name && !/^N\$/.test(M0[ka].name) ? M0[ka].name : '');
    var used = {}; doc.p.sheets.forEach(function (sh) { sh.items.forEach(function (i) { if (i.type === 'label') used[i.text] = 1; }); });
    if (!nm || used[nm] && !(M0[kb] && M0[kb].name === nm) && !(M0[ka] && M0[ka].name === nm)) { nm = 'L_' + kb.replace(':', '_'); for (var c = 2; used[nm]; c++) nm = 'L_' + kb.replace(':', '_') + '_' + c; }
    var ok = [ka, kb].every(function (k) { var P = stub(doc, X, k, M0); if (!P) return false; var w = ops.addWire(doc, P, Object.assign({}, props)); if (!w) return false; X.R.reg(w);
      var t = P[P.length - 1], dx = t[0] - P[0][0], dy = t[1] - P[0][1]; doc.add({ type: 'label', id: doc.uid('l'), x: t[0], y: t[1], text: nm, rot: Math.abs(dx) > E ? (dx > 0 ? 0 : 180) : (dy > 0 ? 270 : 90), style: '' }); return true; });
    if (ok && okNets(doc, M0, ka, kb)) return true; undo(doc, S); return false; }
  HX._wt4 = { derive: function (d, a, b, p) { return derive(d, a, b, p); }, netMap: netMap, ctx: ctx, pinOf: pinOf, clear: clear, okNets: okNets, snapS: snapS, undo: undo, viaLabel: function (d, a, b, p) { return viaLabel(d, a, b, p); } }; /* usado por wiretext5.js */
  HX.wtLinkOcc = function (doc, ka, kb, props) { if (derive(doc, ka, kb, props)) return 'deriv'; if (viaLabel(doc, ka, kb, props)) return 'label'; return null; };
  var ap0 = HX.wtApply;
  HX.wtApply = function (doc, P, opt) { var r = ap0.apply(this, arguments); if (!r.failed.length || (opt && opt.noFallback)) return r;
    var F = r.failed.slice(); r.failed = []; r.how = r.how || {};
    P.links.forEach(function (L) { if (F.indexOf(L.line) < 0) return; var ka = L.src.ref + ':' + L.src.pin, bad = false, h = '';
      L.dst.forEach(function (e) { var kb = e.ref + ':' + e.pin, M = netMap(doc); if (M[ka] && M[ka] === M[kb]) return;
        var one = ap0.call(HX, doc, { conns: [], links: [{ line: L.line, src: L.src, dst: [e], props: L.props }] }, Object.assign({}, opt)); /* destino a destino */
        if (!one.failed.length) { r.wires = r.wires.concat(one.wires); return; }
        var how = HX.wtLinkOcc(doc, ka, kb, L.props); if (how) { if (how === 'label' || !h) h = how; } else bad = true; });
      if (bad) { if (r.failed.indexOf(L.line) < 0) r.failed.push(L.line); } else if (h) r.how[L.line] = h; });
    return r; };
})(typeof window !== 'undefined' ? window : globalThis);
