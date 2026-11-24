/* HarnessCAD - LISTA DE FIAÇÃO EM TEXTO (traçado): cada pino de origem ganha uma coluna própria no canal entre os
   conectores (barramento vertical com as derivações em T — a bolinha da emenda sai sozinha). A coluna nunca se sobrepõe a
   fio existente nem passa por ponta/dobra de outro fio (encostar = ligar); com pinos alinhados aos de outra rede, a saída
   desvia meia posição para fora da linha dos pinos. Conector declarado na lista entra à direita dos existentes. */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops;
  /* traçado em barramento; devolve os fios criados */
  HX.wtApply = function (doc, P, opt) {
    opt = opt || {}; var sh = doc.cur(), u = doc.p.unit, g = Math.max(u, 2.5), byRef = {}, made = [], skipped = [], conns = [];
    sh.items.forEach(function (i) { if (i.type === 'conn') byRef[i.ref] = i; });
    var bx = sh.items.filter(function (i) { return i.type === 'conn'; }).reduce(function (m, i) { var b = HX.bbox(i, u); return [Math.max(m[0], b.x1), Math.min(m[1], b.y0)]; }, [40, 40]), yy = bx[1];
    P.conns.forEach(function (c) { var it = HX.makeConn(doc, c.part, HX.snap(bx[0] + 60, g), HX.snap(yy, g)); it.ref = c.ref; if (c.gender) it.gender = c.gender; doc.add(it); byRef[c.ref] = it; conns.push(it); yy = HX.bbox(it, u).y1 + 15; });
    var V = [], PT = []; function reg(w) { w.pts.forEach(function (q) { PT.push(q); }); for (var i = 1; i < w.pts.length; i++) { var a = w.pts[i - 1], b = w.pts[i]; if (Math.abs(a[0] - b[0]) < 1e-6) V.push([a[0], Math.min(a[1], b[1]), Math.max(a[1], b[1])]); } }
    sh.items.forEach(function (w) { if (w.type === 'wire') reg(w); });
    /* coluna livre: sem fio vertical sobreposto e sem ponta/dobra de outro fio no caminho (encostar numa ponta = ligar) */
    function clearH(y, xa, xb) { var lo = Math.min(xa, xb), hi = Math.max(xa, xb); return !PT.some(function (q) { return Math.abs(q[1] - y) < 1e-6 && q[0] > lo + 1e-6 && q[0] < hi - 1e-6; }); }
    function free(x, y0, y1, s, T) { return !V.some(function (v) { return Math.abs(v[0] - x) < 0.5 && v[1] <= y1 + g * 0.5 && v[2] >= y0 - g * 0.5; }) &&
      !PT.some(function (q) { return Math.abs(q[0] - x) < 1e-6 && q[1] >= y0 - 1e-6 && q[1] <= y1 + 1e-6; }) && clearH(s[1], s[0], x + (x > s[0] ? 1e-3 : -1e-3)) && T.every(function (t) { return clearH(t.q.pt[1], x, t.q.pt[0]); }); }
    var nl = HX.buildNetlist(doc.p), si = doc.sheet, uf = {}; function f(k) { while (uf[k] && uf[k] !== k) k = uf[k]; return k; }
    function nk(c, q) { var nd = nl.nodes[si + '|' + HX.key(q.pt[0], q.pt[1])]; return nd && nd.net ? 'N' + nd.net.id : c.ref + ':' + q.n; }
    function pin(e) { var c = byRef[e.ref], q = HX.connLayout(c, u).pins.filter(function (x) { return String(x.n) === e.pin; })[0]; return { c: c, q: q }; }
    function dir(c, q) { var b = HX.bbox(c, u); return q.pt[0] >= (b.x0 + b.x1) / 2 ? 1 : -1; }
    function wire(pts, props) { var w = ops.addWire(doc, HX.cleanPts(pts), Object.assign({}, props)); if (w) { made.push(w); reg(w); } }
    P.links.forEach(function (L) {
      var S = pin(L.src); L.dst.forEach(function (d) { var T = byRef[d.ref]; if (T !== S.c && HX.pinToPinFace) HX.pinToPinFace(doc, S.c, T); }); S = pin(L.src);
      var props = Object.assign({}, L.props); if (!props.name && opt.names !== false && (S.q.name || S.q.pin.name)) props.name = S.q.name || S.q.pin.name;
      var ks = f(nk(S.c, S.q)), D = [];
      L.dst.forEach(function (e) { var t = pin(e), kt = f(nk(t.c, t.q)); if (kt === ks) return skipped.push(L.src.ref + ':' + L.src.pin + '→' + e.ref + ':' + e.pin); uf[kt] = ks; D.push(t); });
      if (!D.length) return; var s = S.q.pt, d = dir(S.c, S.q), bA = HX.bbox(S.c, u), F = [], O = [];
      D.forEach(function (t) { ((t.q.pt[0] - s[0]) * d > 0 && dir(t.c, t.q) === -d && t.c !== S.c ? F : O).push(t); });
      O.forEach(function (t) { var R = HX.pinToPinRoutes(doc, S.c, t.c, [{ a: S.q, b: t.q }])[0]; wire(R.pts, props); });
      if (!F.length) return;
      var lim = F.reduce(function (m, t) { var b = HX.bbox(t.c, u); return d > 0 ? Math.min(m, b.x0 - g) : Math.max(m, b.x1 + g); }, d > 0 ? 1e9 : -1e9);
      if (F.length === 1 && Math.abs(F[0].q.pt[1] - s[1]) < 1e-6 && clearH(s[1], s[0], F[0].q.pt[0])) return wire([s, F[0].q.pt], props);
      /* faixa junto ao conector (xa) só para desvios; barramentos a partir de xa + 2 passos */
      var xa = HX.snap(d > 0 ? bA.x1 + g : bA.x0 - g, g), pre = [s], o = s, xc = null, x, k;
      function look(o) { var ys = F.map(function (t) { return t.q.pt[1]; }).concat([o[1]]), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
        for (x = xa + 2 * d * g; d > 0 ? x <= lim : x >= lim; x += d * g) if (free(x, y0, y1, o, F)) return x; return null; }
      xc = look(o);
      if (xc == null) { /* saída reta bloqueada (pinos alinhados com os de outra rede): desvia meia posição para fora da linha dos pinos */
        var pp = HX.connLayout(S.c, u).pins.map(function (q) { return q.pt[1]; }).sort(function (a, b) { return a - b; }), pitch = 2 * g;
        for (k = 1; k < pp.length; k++) if (pp[k] - pp[k - 1] > 1e-6) { pitch = pp[k] - pp[k - 1]; break; }
        [pitch / 2, -pitch / 2].some(function (dy) { var q = [xa, s[1] + dy]; if (!clearH(s[1], s[0], xa + d * 1e-3) || PT.some(function (z) { return Math.abs(z[0] - xa) < 1e-6 && (z[1] - s[1]) * (z[1] - q[1]) <= 1e-9; })) return false;
          var c = look(q); if (c == null) return false; xc = c; o = q; pre = [s, [xa, s[1]], q]; return true; });
      }
      if (xc == null) { xc = HX.snap((xa + lim) / 2, g); }
      var dn = F.filter(function (t) { return t.q.pt[1] > o[1] + 1e-6; }).sort(function (a, b) { return b.q.pt[1] - a.q.pt[1]; }), up = F.filter(function (t) { return t.q.pt[1] < o[1] - 1e-6; }).sort(function (a, b) { return a.q.pt[1] - b.q.pt[1]; }), lv = F.filter(function (t) { return Math.abs(t.q.pt[1] - o[1]) < 1e-6; });
      var first = true; [dn, up].forEach(function (A) { if (!A.length) return; var fa = A[0], st = first ? pre.concat([[xc, o[1]]]) : [[xc, o[1]]]; wire(st.concat([[xc, fa.q.pt[1]], fa.q.pt]), props); first = false;
        A.slice(1).forEach(function (t) { wire([[xc, t.q.pt[1]], t.q.pt], props); }); });
      lv.forEach(function (t) { wire(first ? pre.concat([t.q.pt]) : [[xc, o[1]], t.q.pt], props); first = false; });
    });
    return { wires: made, conns: conns, skipped: skipped };
  };
})(typeof window !== 'undefined' ? window : globalThis);
