/* HarnessCAD - operações de edição: mover/arrastar com elástico, girar, espelhar, alinhar,
   fios com emendas automáticas (estilo KiCad), duplicar, copiar/colar, renumerar */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops = {};

  ops.translate = function (it, dx, dy) {
    if (it.type === 'wire') it.pts = it.pts.map(function (p) { return [HX.r3(p[0] + dx), HX.r3(p[1] + dy)]; });
    else { it.x = HX.r3(it.x + dx); it.y = HX.r3(it.y + dy); if (it.type === 'shape' || it.type === 'dim') { it.x2 = HX.r3(it.x2 + dx); it.y2 = HX.r3(it.y2 + dy); } }
  };

  // Move uma ponta do fio mantendo segmentos ortogonais (comportamento "arrastar" do KiCad)
  ops.moveEnd = function (w, end, np, grid) {
    var pts = w.pts, n = pts.length, i = end ? n - 1 : 0, j = end ? n - 2 : 1;
    var old = pts[i], nb = pts[j];
    var horiz = Math.abs(old[1] - nb[1]) < 0.006, vert = Math.abs(old[0] - nb[0]) < 0.006;
    if (HX.same(old, np)) return;
    if (n === 2 && (horiz || vert) && !(horiz && vert)) {
      var other = nb, mid;
      if (horiz && Math.abs(np[1] - other[1]) > 0.006) {
        mid = HX.snap((np[0] + other[0]) / 2, grid || 0);
        pts = [np, [mid, np[1]], [mid, other[1]], other];
      } else if (vert && Math.abs(np[0] - other[0]) > 0.006) {
        mid = HX.snap((np[1] + other[1]) / 2, grid || 0);
        pts = [np, [np[0], mid], [other[0], mid], other];
      } else pts = [np, other];
      if (end) pts.reverse();
    } else {
      pts = pts.map(function (p) { return p.slice(); });
      if (n > 2 && horiz && !vert) pts[j] = [pts[j][0], np[1]];
      else if (n > 2 && vert && !horiz) pts[j] = [np[0], pts[j][1]];
      pts[i] = np.slice();
    }
    w.pts = HX.cleanPts(pts);
    if (w.pts.length < 2) w.pts = [np.slice(), np.slice()];
  };

  // Após girar/espelhar: o último trecho deve sair do pino na direção do terminal
  ops.alignExit = function (w, end, dir, len) {
    var pts = w.pts.map(function (p) { return p.slice(); }); if (end) pts.reverse();
    if (pts.length < 2) return;
    var p0 = pts[0], dx = pts[1][0] - p0[0], dy = pts[1][1] - p0[1];
    var ok = dir[0] ? (Math.abs(dy) < 0.006 && dx * dir[0] > 0) : (Math.abs(dx) < 0.006 && dy * dir[1] > 0);
    if (ok) return;
    var s = [HX.r3(p0[0] + dir[0] * len), HX.r3(p0[1] + dir[1] * len)];
    var rest = pts.length > 2 ? pts.slice(2) : [pts[1]], q = rest[0];
    var c = dir[0] ? [s[0], q[1]] : [q[0], s[1]];
    pts = HX.cleanPts([p0, s, c].concat(rest)); if (end) pts.reverse();
    w.pts = pts;
  };

  // Pontos "âncora" de um item (pinos, emendas, labels) por chave estável
  function anchors(it, unit) {
    var a = {};
    if (it.type === 'conn') {
      var L = HX.connLayout(it, unit), m = L.m;
      L.pins.forEach(function (p) { var s = p.side === 'R' ? 1 : -1, dl = p.ldir || [s, 0]; a[it.id + '/' + p.n + (it.side === 'B' ? '/' + p.side : '')] = { pt: p.pt, dir: [m[0] * dl[0] + m[2] * dl[1], m[1] * dl[0] + m[3] * dl[1]], len: p.elen || L.stub }; });
    } else if (it.type === 'splice' || it.type === 'label') a[it.id] = { pt: [it.x, it.y] };
    return a;
  }
  // Fios não selecionados presos a itens que vão se mover
  ops.attachments = function (doc, ids) {
    var set = new Set(ids), unit = doc.p.unit, A = {}, out = [];
    doc.items().forEach(function (it) { if (set.has(it.id)) Object.assign(A, anchors(it, unit)); });
    var keys = Object.keys(A);
    doc.items().forEach(function (w) {
      if (w.type !== 'wire' || set.has(w.id)) return;
      [0, 1].forEach(function (end) {
        var pt = w.pts[end ? w.pts.length - 1 : 0];
        for (var k = 0; k < keys.length; k++) if (HX.same(A[keys[k]].pt, pt)) { out.push({ w: w, end: end, key: keys[k] }); break; }
      });
    });
    return out;
  };
  ops.fixAttachments = function (doc, att) {
    var unit = doc.p.unit, A = {};
    doc.items().forEach(function (it) { Object.assign(A, anchors(it, unit)); });
    att.forEach(function (a) {
      var an = A[a.key]; if (!an) return;
      ops.moveEnd(a.w, a.end, an.pt, doc.p.grid.size);
      if (an.dir) ops.alignExit(a.w, a.end, an.dir, an.len);
    });
  };

  // Sessão de movimento (mouse/teclado): mode 'drag' mantém fios ligados, 'move' desliga
  ops.beginMove = function (doc, ids, mode) {
    var items = doc.items().filter(function (i) { return ids.indexOf(i.id) >= 0 && !i.locked; });
    var mv = items.map(function (i) { return i.id; });
    var att = mode === 'move' ? [] : ops.attachments(doc, mv);
    var base = {};
    items.forEach(function (i) { base[i.id] = HX.clone(i); });
    att.forEach(function (a) { if (!base[a.w.id]) base[a.w.id] = HX.clone(a.w); });
    return {
      ids: mv, count: items.length,
      apply: function (dx, dy) {
        doc.items().forEach(function (it) {
          var b = base[it.id]; if (!b) return;
          if (it.type === 'wire') it.pts = HX.clone(b.pts); else { it.x = b.x; it.y = b.y; if (b.x2 != null) { it.x2 = b.x2; it.y2 = b.y2; } }
          if (mv.indexOf(it.id) >= 0) ops.translate(it, dx, dy);
        });
        ops.fixAttachments(doc, att);
      },
      cancel: function () { this.apply(0, 0); }
    };
  };

  function center(items, unit) {
    var b = null;
    items.forEach(function (it) {
      var q = HX.bbox(it, unit);
      b = b ? { x0: Math.min(b.x0, q.x0), y0: Math.min(b.y0, q.y0), x1: Math.max(b.x1, q.x1), y1: Math.max(b.y1, q.y1) } : q;
    });
    return b ? [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2] : [0, 0];
  }
  function bcenter(it, unit) { var b = HX.bbox(it, unit); return [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2]; }

  // Transformação geométrica (girar 90° anti-horário ou espelhar) em torno do centro da seleção
  ops.transform = function (doc, items, kind) {
    items = items.filter(function (i) { return !i.locked; }); if (!items.length) return;
    var unit = doc.p.unit, g = doc.p.grid.size, c = center(items, unit);
    c = [HX.snap(c[0], g), HX.snap(c[1], g)];
    function tp(p) {
      var x = p[0] - c[0], y = p[1] - c[1];
      if (kind === 'rot') return [c[0] + y, c[1] - x];
      if (kind === 'mx') return [c[0] - x, c[1] + y];
      return [c[0] + x, c[1] - y];
    }
    var att = ops.attachments(doc, items.map(function (i) { return i.id; }));
    items.forEach(function (it) {
      if (it.type === 'wire') { it.pts = it.pts.map(tp); return; }
      if (it.type === 'shape') { var a = tp([it.x, it.y]), b = tp([it.x2, it.y2]); it.x = a[0]; it.y = a[1]; it.x2 = b[0]; it.y2 = b[1]; return; }
      var bc = bcenter(it, unit), nc = tp(bc);
      if (it.type === 'conn') {
        if (kind === 'rot') it.rot = ((it.rot || 0) + 90) % 360;
        else if ((it.rot || 0) % 180 === 0) it[kind] = !it[kind];
        else it[kind === 'mx' ? 'my' : 'mx'] = !it[kind === 'mx' ? 'my' : 'mx'];
      } else if (it.type === 'label' || it.type === 'text') {
        if (kind === 'rot') it.rot = ((it.rot || 0) + 90) % 360;
        else if (kind === 'mx' && it.type === 'label') it.rot = ({ 0: 180, 180: 0, 90: 90, 270: 270 })[it.rot || 0];
        else if (kind === 'my' && it.type === 'label') it.rot = ({ 90: 270, 270: 90, 0: 0, 180: 180 })[it.rot || 0];
        if (it.type === 'label') { var p = tp([it.x, it.y]); it.x = p[0]; it.y = p[1]; return; }
      } else if (it.type === 'splice') { var q = tp([it.x, it.y]); it.x = q[0]; it.y = q[1]; return; }
      else if (it.type === 'cable' && kind === 'rot') { var t = it.w; it.w = it.h; it.h = t; }
      var ac = bcenter(it, unit);
      ops.translate(it, HX.snap(it.x + nc[0] - ac[0], g) - it.x, HX.snap(it.y + nc[1] - ac[1], g) - it.y);
    });
    ops.fixAttachments(doc, att);
  };

  // Alinhar/distribuir pelos contornos
  ops.align = function (doc, items, how) {
    items = items.filter(function (i) { return !i.locked && i.type !== 'wire'; }); if (items.length < 2) return;
    var unit = doc.p.unit, att = ops.attachments(doc, items.map(function (i) { return i.id; }));
    var bb = items.map(function (i) { return HX.bbox(i, unit); });
    if (how === 'dh' || how === 'dv') {
      var ax = how === 'dh' ? ['x0', 'x1'] : ['y0', 'y1'], idx = items.map(function (_, i) { return i; });
      idx.sort(function (a, b) { return bb[a][ax[0]] - bb[b][ax[0]]; });
      var total = bb[idx[idx.length - 1]][ax[1]] - bb[idx[0]][ax[0]], sum = 0;
      idx.forEach(function (i) { sum += bb[i][ax[1]] - bb[i][ax[0]]; });
      var gap = (total - sum) / (idx.length - 1), pos = bb[idx[0]][ax[0]];
      idx.forEach(function (i) {
        var d = pos - bb[i][ax[0]], o = how === 'dh' ? items[i].x : items[i].y;
        d = HX.snap(o + d, doc.p.grid.size) - o;
        ops.translate(items[i], how === 'dh' ? d : 0, how === 'dv' ? d : 0); pos += bb[i][ax[1]] - bb[i][ax[0]] + gap;
      });
    } else {
      var ref = { l: Math.min.apply(0, bb.map(function (b) { return b.x0; })), r: Math.max.apply(0, bb.map(function (b) { return b.x1; })),
        t: Math.min.apply(0, bb.map(function (b) { return b.y0; })), b: Math.max.apply(0, bb.map(function (b) { return b.y1; })) };
      items.forEach(function (it, i) {
        var b = bb[i], dx = 0, dy = 0;
        if (how === 'l') dx = ref.l - b.x0; if (how === 'r') dx = ref.r - b.x1;
        if (how === 't') dy = ref.t - b.y0; if (how === 'b') dy = ref.b - b.y1;
        if (how === 'ch') dx = (ref.l + ref.r) / 2 - (b.x0 + b.x1) / 2;
        if (how === 'cv') dy = (ref.t + ref.b) / 2 - (b.y0 + b.y1) / 2;
        var g = doc.p.grid.size;
        ops.translate(it, HX.snap(it.x + dx, g) - it.x, HX.snap(it.y + dy, g) - it.y);
      });
    }
    ops.fixAttachments(doc, att);
  };
})(typeof window !== 'undefined' ? window : globalThis);
