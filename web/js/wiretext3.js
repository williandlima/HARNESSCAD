/* HarnessCAD - LISTA DE FIAÇÃO EM TEXTO (desenho, HX.wtApply): ligação por ligação — barramento vertical com derivações
   em T (emenda automática) no canal entre os conectores; pinos alinhados aos de outra rede: desvio de meia posição;
   destino que não está de frente (ou canal cheio): contorno em pista própria. SEGURANÇA: depois de cada ligação as redes
   são conferidas; se o desenho juntou redes que a lista não pede (curto) ou não ligou o pedido, a ligação é desfeita e
   volta como "não traçada" com o nº da linha — nunca fica curto escondido no esquema. */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops;
  HX.wtApply = function (doc, P, opt) {
    opt = opt || {}; var sh = doc.cur(), u = doc.p.unit, g = Math.max(u, 2.5), si = doc.sheet, byRef = {}, made = [], skipped = [], failed = [], flipped = [], conns = [];
    function refs() { byRef = {}; sh.items.forEach(function (i) { if (i.type === 'conn') byRef[i.ref] = i; }); } refs();
    var bx = sh.items.filter(function (i) { return i.type === 'conn'; }).reduce(function (m, i) { var b = HX.bbox(i, u); return [Math.max(m[0], b.x1), Math.min(m[1], b.y0)]; }, [40, 40]), yy = bx[1];
    P.conns.forEach(function (c) { var it = HX.makeConn(doc, c.part, HX.snap(bx[0] + 60, g), HX.snap(yy, g)); it.ref = c.ref; if (c.gender) it.gender = c.gender; doc.add(it); byRef[c.ref] = it; conns.push(it); yy = HX.bbox(it, u).y1 + 15; });
    var R = HX.wtRouter(sh, g);
    function netOf() { var nl = HX.buildNetlist(doc.p), m = {}, here = {}; sh.items.forEach(function (i) { here[i.id] = 1; }); nl.nets.forEach(function (n) { n.pins.forEach(function (t) { if (t.item && t.item.type === 'conn' && here[t.item.id]) m[t.ref + ':' + t.pin] = n.id; }); }); return m; }
    function nid(m, k) { return m[k] != null ? 'N' + m[k] : 'P' + k; }
    function pin(e) { var c = byRef[e.ref], q = HX.connLayout(c, u).pins.filter(function (x) { return String(x.n) === e.pin; })[0]; return { c: c, q: q, k: e.ref + ':' + e.pin }; }
    function dir(c, q) { var b = HX.bbox(c, u); return q.pt[0] >= (b.x0 + b.x1) / 2 ? 1 : -1; }
    var mine, NB = netOf(), PINS = {}; sh.items.forEach(function (c) { if (c.type === 'conn') HX.connLayout(c, u).pins.forEach(function (q) { PINS[HX.key(q.pt[0], q.pt[1])] = 1; }); });
    function wire(pts, props) { var w = ops.addWire(doc, HX.cleanPts(pts), Object.assign({}, props)); if (w) { mine.push(w); R.reg(w); } return !!w; }
    P.links.forEach(function (L) {
      var snap = JSON.stringify(sh.items), nid0 = doc.p.nextId; mine = [];
      var S = pin(L.src), fl = []; L.dst.forEach(function (d) { var T = byRef[d.ref]; if (T !== S.c && HX.pinToPinFace) { var f = HX.pinToPinFace(doc, S.c, T); if (f) fl.push(f.ref); } }); S = pin(L.src);
      var props = Object.assign({}, L.props); if (!props.name && opt.names !== false && (S.q.name || S.q.pin.name)) props.name = S.q.name || S.q.pin.name;
      var ns = nid(NB, S.k), D = [], allow = {}; allow[ns] = 1;
      L.dst.forEach(function (e) { var t = pin(e), nt = nid(NB, t.k); if (allow[nt]) return skipped.push(L.src.ref + ':' + L.src.pin + '→' + e.ref + ':' + e.pin); allow[nt] = 1; D.push(t); });
      if (!D.length) return; var s = S.q.pt, d = dir(S.c, S.q), bA = HX.bbox(S.c, u), F = [], O = [], bad = false;
      /* pino que já tem fio: a via nova NUNCA corre por cima dele — encosta na vertical no meio do trecho de entrada (emenda
         com bolinha) e dali segue uma via só até o pino; com origem e destino na mesma altura, liga-se na dobra do fio existente */
      function entry(pt, k) { if (NB[k] == null) return null; var x = pt[0], y = pt[1]; return R.H.filter(function (v) { return Math.abs(v[0] - y) < 1e-6 && (Math.abs(v[1] - x) < 1e-6 || Math.abs(v[2] - x) < 1e-6) && v[2] - v[1] > 2 * g; })[0] || null; }
      D.forEach(function (t) { var h = entry(t.q.pt, t.k); if (!h) return; var x = t.q.pt[0], y = t.q.pt[1], far = Math.abs(h[1] - x) < 1e-6 ? h[2] : h[1];
        if (Math.abs(y - s[1]) < 1e-6 && !PINS[HX.key(far, y)]) t.q = Object.assign({}, t.q, { pt: [far, y] }); else t.vj = [h[1], h[2]]; });
      var sh0 = entry(s, S.k);
      D.forEach(function (t) { ((t.q.pt[0] - s[0]) * d > 0 && dir(t.c, t.q) === -d && t.c !== S.c ? F : O).push(t); });
      var lim = F.reduce(function (m, t) { var b = HX.bbox(t.c, u), q = t.vj ? (d > 0 ? t.vj[1] : t.vj[0]) : t.q.pt[0]; return d > 0 ? Math.min(m, b.x0 - g, q - g) : Math.max(m, b.x1 + g, q + g); }, d > 0 ? 1e9 : -1e9);
      if (!sh0 && F.length === 1 && !F[0].vj && Math.abs(F[0].q.pt[1] - s[1]) < 1e-6 && R.clearH(s[1], s[0], F[0].q.pt[0])) { wire([s, F[0].q.pt], props); F = []; }
      if (F.length) {
        var xa = HX.snap(d > 0 ? bA.x1 + g : bA.x0 - g, g), pre = [s], o = s, xc = null, x, k;
        var look = function (o) { var ys = F.map(function (t) { return t.q.pt[1]; }).concat([o[1]]), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
          for (var st = 2; st >= 1; st--) for (x = xa + st * d * g; d > 0 ? x <= lim : x >= lim; x += d * g) if (sh0 && o === s ? x > sh0[1] + g - 1e-6 && x < sh0[2] - g + 1e-6 && R.free(x, y0, y1, null, F) : R.free(x, y0, y1, o, F)) return x; return null; }; /* espaço curto até a emenda: usa também a faixa junto ao conector */
        xc = look(o); if (sh0 && xc != null) pre = []; /* origem já ligada: o barramento sai do meio do seu trecho (T com bolinha) */
        if (xc == null && !sh0) { /* saída reta bloqueada (pinos alinhados com os de outra rede): desvio de meia posição */
          var pp = HX.connLayout(S.c, u).pins.map(function (q) { return q.pt[1]; }).sort(function (a, b) { return a - b; }), pitch = 2 * g;
          for (k = 1; k < pp.length; k++) if (pp[k] - pp[k - 1] > 1e-6) { pitch = pp[k] - pp[k - 1]; break; }
          [pitch / 2, -pitch / 2].some(function (dy) { var q = [xa, s[1] + dy]; if (!R.clearH(s[1], s[0], xa + d * 1e-3) || R.PT.some(function (z) { return Math.abs(z[0] - xa) < 1e-6 && (z[1] - s[1]) * (z[1] - q[1]) <= 1e-9; })) return false;
            var c = look(q); if (c == null) return false; xc = c; o = q; pre = [s, [xa, s[1]], q]; return true; });
        }
        if (xc == null) O = O.concat(F); /* canal cheio: contorno em pista própria */
        else {
          var dn = F.filter(function (t) { return t.q.pt[1] > o[1] + 1e-6; }).sort(function (a, b) { return b.q.pt[1] - a.q.pt[1]; }), up = F.filter(function (t) { return t.q.pt[1] < o[1] - 1e-6; }).sort(function (a, b) { return a.q.pt[1] - b.q.pt[1]; }), lv = F.filter(function (t) { return Math.abs(t.q.pt[1] - o[1]) < 1e-6; });
          /* cada parada do barramento é ponta de fio (bolinha); a derivação sai dali como via única até o pino */
          var first = true; [dn, up].forEach(function (A) { if (!A.length) return; var prev = first ? pre.concat([[xc, o[1]]]) : [[xc, o[1]]]; first = false;
            A.slice().reverse().forEach(function (t, i, B) { var p = [xc, t.q.pt[1]]; if (i === B.length - 1 && !t.vj) wire(prev.concat([p, t.q.pt]), props); else { wire(prev.concat([p]), props); if (!t.vj) wire([p, t.q.pt], props); } prev = [p]; }); });
          lv.forEach(function (t) { if (t.vj) { if (first) wire(pre.concat([[xc, o[1]]]), props); } else wire(first ? pre.concat([t.q.pt]) : [[xc, o[1]], t.q.pt], props); first = false; });
        }
      }
      var org = s; O.forEach(function (t) { var Pt = R.around(org, d, bA, t.q.pt, dir(t.c, t.q), HX.bbox(t.c, u)); if (!Pt) bad = true; else { wire(Pt, props); if (org === s && Pt.length > 2) org = Pt[1]; } }); /* 2º destino deriva do 1º contorno */
      /* conferência: o pedido ficou ligado e nenhuma outra rede foi junto */
      var NA = bad ? null : netOf(), ok = !bad && D.every(function (t) { return NA[S.k] != null && NA[t.k] === NA[S.k]; });
      if (ok) { var grp = {}; Object.keys(NA).forEach(function (pk) { var a = NA[pk], b = nid(NB, pk); (grp[a] = grp[a] || {})[b] = 1; });
        ok = Object.keys(grp).every(function (a) { var B = Object.keys(grp[a]); return B.length < 2 || B.every(function (b) { return allow[b]; }); }); }
      if (ok) { made = made.concat(mine); NB = NA; fl.forEach(function (r) { if (flipped.indexOf(r) < 0) flipped.push(r); }); return; }
      sh.items = JSON.parse(snap); doc.p.nextId = nid0; refs(); R = HX.wtRouter(sh, g); failed.push(L.line);
    });
    return { wires: made, conns: conns, skipped: skipped, failed: failed, flipped: flipped };
  };
})(typeof window !== 'undefined' ? window : globalThis);
