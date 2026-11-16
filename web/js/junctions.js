/* HarnessCAD - emendas (bolinhas) automáticas em TODOS os casos de junção, conferidas ao fim de cada edição
   (desenhar, mover, arrastar ponta, colar, duplicar, girar, apagar), no mesmo passo de desfazer:
   - ponta de fio no meio de outro fio (inclusive quando o fio novo passa pela ponta de um existente)
     ou na dobra (canto) de outro fio: o outro fio é dividido ali e recebe a emenda;
   - duas ou mais pontas de fios no mesmo ponto (solto, pino ou label): emenda;
   - emenda automática que ficou com menos de 2 fios (fio apagado/movido): removida.
   Emendas postas pelo usuário (ferramenta Emenda) nunca são removidas. */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops, R = function (v) { return Math.round(v * 1000); };

  function splitAt(doc, w, pt) { // divide no ponto (interior de trecho ou dobra)
    var nw = ops.splitWire(doc, w, pt); if (nw) return nw;
    for (var i = 1; i < w.pts.length - 1; i++) if (HX.same(w.pts[i], pt)) {
      var a = w.pts.slice(0, i + 1), b = w.pts.slice(i), la = HX.wireLength({ pts: a }), lb = HX.wireLength({ pts: b }), L = +w.len;
      w.pts = a; nw = HX.clone(w); nw.id = doc.uid('w'); nw.pts = b; nw.num = doc.nextRef(doc.p.defaults.wirePfx || 'W');
      if (L > 0 && la + lb > 0) { w.len = Math.round(L * la / (la + lb)); nw.len = L - w.len; }
      doc.add(nw); return nw;
    }
    return null;
  }
  // primeira ponta de fio que cai no interior (trecho ou dobra) de outro fio
  function findTouch(items) {
    var wires = items.filter(function (w) { return w.type === 'wire' && w.pts.length > 1; }), byY = new Map(), byX = new Map(), diag = new Map(), vert = new Map();
    function cell(v) { return Math.floor(v / 10); }
    function idx(m, k, v) { var l = m.get(k); if (l) l.push(v); else m.set(k, [v]); }
    wires.forEach(function (w) {
      for (var i = 1; i < w.pts.length; i++) {
        var a = w.pts[i - 1], b = w.pts[i];
        if (R(a[1]) === R(b[1])) idx(byY, R(a[1]), [w, a, b]); else if (R(a[0]) === R(b[0])) idx(byX, R(a[0]), [w, a, b]);
        else for (var cx = cell(Math.min(a[0], b[0])); cx <= cell(Math.max(a[0], b[0])); cx++) for (var cy = cell(Math.min(a[1], b[1])); cy <= cell(Math.max(a[1], b[1])); cy++) idx(diag, cx + ',' + cy, [w, a, b]); // diagonal: grade de 10 mm
        if (i < w.pts.length - 1) idx(vert, R(b[0]) + ',' + R(b[1]), w);
      }
    });
    for (var j = 0; j < wires.length; j++) {
      var w = wires[j], E = [w.pts[0], w.pts[w.pts.length - 1]];
      for (var e = 0; e < 2; e++) {
        var p = E[e], L3 = [byY.get(R(p[1])), byX.get(R(p[0])), diag.get(cell(p[0]) + ',' + cell(p[1]))];
        for (var li = 0; li < 3; li++) { var c = L3[li] || []; for (var k = 0; k < c.length; k++) if (c[k][0] !== w && HX.onSegInterior(p, c[k][1], c[k][2])) return { host: c[k][0], pt: p }; }
        var v = (vert.get(R(p[0]) + ',' + R(p[1])) || []).filter(function (o) { return o !== w; })[0];
        if (v) return { host: v, pt: p };
      }
    }
    return null;
  }

  ops.normalizeJunctions = function (doc) {
    var changed = false, guard = 0, t;
    while ((t = findTouch(doc.items())) && guard++ < 500) { if (!splitAt(doc, t.host, t.pt)) break; changed = true; }
    var ends = new Map(), sp = [];
    doc.items().forEach(function (it) {
      if (it.type === 'wire' && it.pts.length > 1) [it.pts[0], it.pts[it.pts.length - 1]].forEach(function (p, i) {
        if (i && it.pts.length === 2 && HX.same(it.pts[0], it.pts[1])) return;
        var k = R(p[0]) + ',' + R(p[1]), o = ends.get(k) || { pt: p, n: 0, w: new Set() }; o.n++; o.w.add(it.id); ends.set(k, o);
      });
      else if (it.type === 'splice') sp.push(it);
    });
    var has = new Set(sp.map(function (s) { return R(s.x) + ',' + R(s.y); }));
    ends.forEach(function (o, k) { if (o.n >= 2 && o.w.size >= 2 && !has.has(k)) { ops.newSplice(doc, o.pt).auto = true; changed = true; } });
    var drop = sp.filter(function (s) { var o = ends.get(R(s.x) + ',' + R(s.y)); return s.auto && (!o || o.w.size < 2); }).map(function (s) { return s.id; });
    if (drop.length) { doc.removeIds(drop); changed = true; }
    return changed;
  };
  // emendas criadas pela junção automática ficam marcadas (podem sumir sozinhas); as do usuário não
  var nj = ops.junctionAt;
  ops.junctionAt = function (doc, w, end) {
    var before = new Set(doc.items().filter(function (i) { return i.type === 'splice'; }).map(function (i) { return i.id; }));
    var r = nj(doc, w, end);
    doc.items().forEach(function (i) { if (i.type === 'splice' && !before.has(i.id)) i.auto = true; });
    return r;
  };
  // ao fim de cada edição (doc.change, soltar arraste, confirmar colagem/movimento)
  var tc = HX.Doc.prototype.touch;
  HX.Doc.prototype.touch = function () {
    if (!this._nj && HX.autoJunctions !== false) { this._nj = true; try { ops.normalizeJunctions(this); } finally { this._nj = false; } }
    return tc.apply(this, arguments);
  };
})(typeof window !== 'undefined' ? window : globalThis);
