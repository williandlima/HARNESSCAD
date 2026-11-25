/* HarnessCAD - fios, emendas, exclusão, duplicação, área de transferência, renumeração */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops;

  function wiresAt(doc, pt, except) {
    return doc.items().filter(function (w) {
      return w.type === 'wire' && w !== except && (HX.same(w.pts[0], pt) || HX.same(w.pts[w.pts.length - 1], pt));
    });
  }
  function termAt(doc, pt) {
    var unit = doc.p.unit;
    return doc.items().some(function (it) {
      if (it.type === 'wire') return false;
      return HX.connPoints(it, unit).some(function (q) { return HX.same(q, pt); });
    });
  }
  ops.spliceAt = function (doc, pt) {
    return doc.items().filter(function (s) { return s.type === 'splice' && HX.same([s.x, s.y], pt); })[0] || null;
  };
  ops.newSplice = function (doc, pt, kind) {
    return doc.add({ type: 'splice', id: doc.uid('s'), ref: doc.nextRef('SP'), x: HX.r3(pt[0]), y: HX.r3(pt[1]), kind: kind || doc.p.defaults.spliceKind || 'junction', part: '' });
  };

  // Divide um fio no ponto (interior). Retorna o novo fio (segunda parte) ou null.
  ops.splitWire = function (doc, w, pt) {
    for (var i = 1; i < w.pts.length; i++) {
      if (HX.onSegInterior(pt, w.pts[i - 1], w.pts[i])) {
        var a = w.pts.slice(0, i).concat([pt]), b = [pt].concat(w.pts.slice(i));
        var la = HX.wireLength({ pts: a }), lb = HX.wireLength({ pts: b }), L = +w.len;
        w.pts = HX.cleanPts(a);
        var nw = HX.clone(w); nw.id = doc.uid('w'); nw.pts = HX.cleanPts(b); nw.num = doc.nextRef(doc.p.defaults.wirePfx || 'W');
        if (L > 0 && la + lb > 0) { w.len = Math.round(L * la / (la + lb)); nw.len = L - w.len; } else nw.len = w.len === '' ? '' : w.len;
        doc.add(nw); return nw;
      }
    }
    return null;
  };

  function sameSpec(a, b) { return a.wtype === b.wtype && String(a.gauge) === String(b.gauge) && a.color === b.color; }
  // Junção automática numa ponta de fio (regras do KiCad). Retorna o fio (pode mudar se houver fusão).
  //  - ponta no meio de outro fio: divide o fio e cria junção
  //  - ponta com ponta(s) de outros fios: junção (ou fusão num fio só, se "Unir pontas" estiver ligado)
  //  - dois ou mais fios no mesmo pino/label: junção
  ops.junctionAt = function (doc, w, end) {
    var d = doc.p.defaults, pt = end ? w.pts[w.pts.length - 1] : w.pts[0];
    if (ops.spliceAt(doc, pt)) return w;
    var host = doc.items().filter(function (o) {
      if (o.type !== 'wire' || o === w) return false;
      for (var i = 1; i < o.pts.length; i++) if (HX.onSegInterior(pt, o.pts[i - 1], o.pts[i])) return true;
      return false;
    })[0];
    if (host) { ops.splitWire(doc, host, pt); ops.newSplice(doc, pt); return w; }
    var others = wiresAt(doc, pt, w), hasTerm = termAt(doc, pt);
    if (!others.length) return w;
    if (others.length === 1 && !hasTerm && d.mergeWires === true && sameSpec(others[0], w)) {
      var o = others[0], op = HX.same(o.pts[0], pt) ? o.pts.slice().reverse() : o.pts.slice();
      var mine = HX.same(w.pts[0], pt) ? w.pts.slice() : w.pts.slice().reverse();
      o.pts = HX.cleanPts(op.concat(mine.slice(1)));
      if (+o.len > 0 || +w.len > 0) o.len = (+o.len || 0) + (+w.len || 0);
      doc.removeIds([w.id]); return o;
    }
    ops.newSplice(doc, pt);
    return w;
  };
  // Adiciona fio e aplica as junções automáticas nas duas pontas
  ops.addWire = function (doc, pts, props) {
    pts = HX.cleanPts(pts); if (pts.length < 2) return null;
    var d = doc.p.defaults;
    var w = doc.add(Object.assign({ type: 'wire', id: doc.uid('w'), pts: pts, num: doc.nextRef(d.wirePfx || 'W'),
      wtype: d.wtype, gauge: d.gauge, color: d.color, len: '', note: '' }, { lblPos: 'n' }, d.wlbl || {}, props || {})); /* fio novo: sem identificação (padrão) */
    w = ops.junctionAt(doc, w, 0);
    return ops.junctionAt(doc, w, 1);
  };

  // Coloca emenda num ponto; se cair no meio de um fio, divide-o
  ops.placeSplice = function (doc, pt, kind) {
    var ex = ops.spliceAt(doc, pt); if (ex) return ex;
    doc.items().filter(function (w) { return w.type === 'wire'; }).forEach(function (w) { ops.splitWire(doc, w, pt); });
    return ops.newSplice(doc, pt, kind);
  };

  ops.deleteSel = function (doc) {
    var ids = Array.from(doc.sel); if (!ids.length) return false;
    doc.change('Excluir', function () { doc.removeIds(ids); });
    return true;
  };

  function renew(doc, it, used) {
    it.id = doc.uid(it.type[0]);
    var pfx;
    if (it.ref && it.type !== 'label') { pfx = String(it.ref).replace(/\d+$/, ''); it.ref = nextFree(doc, pfx, used); }
    if (it.type === 'wire') it.num = nextFree(doc, String(it.num || 'W').replace(/\d+$/, '') || 'W', used);
  }
  function nextFree(doc, pfx, used) {
    var r = doc.nextRef(pfx), n = parseInt(r.slice(pfx.length), 10);
    while (used.has(pfx + n)) n++;
    used.add(pfx + n); return pfx + n;
  }
  // Clona itens com novos IDs e referências; retorna lista adicionada
  ops.pasteItems = function (doc, items, dx, dy) {
    var used = new Set(), out = [], map = {};
    items.forEach(function (src) {
      var it = HX.clone(src); renew(doc, it, used); map[src.id] = it.id; ops.translate(it, dx, dy); doc.add(it); out.push(it);
    });
    out.forEach(function (it) { if (it.type === 'face' && map[it.of]) it.of = map[it.of]; if (it.type === 'dim') { if (map[it.a]) it.a = map[it.a]; if (map[it.b]) it.b = map[it.b]; } });
    return out;
  };
  ops.copySel = function (doc) {
    var items = doc.selected().map(HX.clone);
    HX.clipboard = items;
    try { G.localStorage && G.localStorage.setItem('hx-clip', JSON.stringify(items)); } catch (e) { /* sem storage */ }
    return items.length;
  };
  ops.getClip = function () {
    try { var s = G.localStorage && G.localStorage.getItem('hx-clip'); if (s) return JSON.parse(s); } catch (e) { /* ignore */ }
    return HX.clipboard || [];
  };

  // Renumera fios: ordem por folha, depois de cima para baixo / esquerda para direita
  ops.renumberWires = function (doc, pfx, start, step) {
    var list = [];
    doc.p.sheets.forEach(function (sh, s) { sh.items.forEach(function (w) { if (w.type === 'wire') list.push({ w: w, s: s }); }); });
    list.sort(function (a, b) {
      var pa = a.w.pts[0], pb = b.w.pts[0];
      return a.s - b.s || pa[1] - pb[1] || pa[0] - pb[0];
    });
    var n = start || 1; list.forEach(function (e) { e.w.num = (pfx || 'W') + n; n += step || 1; });
  };
  ops.renumberConns = function (doc) {
    var by = {}, list = [];
    doc.p.sheets.forEach(function (sh, s) { sh.items.forEach(function (c) { if (c.type === 'conn' || c.type === 'splice') list.push({ c: c, s: s }); }); });
    list.sort(function (a, b) { return a.s - b.s || a.c.x - b.c.x || a.c.y - b.c.y; });
    list.forEach(function (e) { var p = e.c.ref.replace(/\d+$/, ''); by[p] = (by[p] || 0) + 1; e.c.ref = p + by[p]; });
  };

  // Arrasta um segmento do fio mantendo ortogonalidade (pontas presas não se movem)
  ops.dragSegment = function (base, i, dx, dy) {
    var pts = base.pts.map(function (p) { return p.slice(); }), a = pts[i - 1], b = pts[i];
    var horiz = Math.abs(a[1] - b[1]) < 0.006;
    if (horiz) dx = 0; else dy = 0;
    if (i - 1 === 0) { pts.unshift(a.slice()); i++; }
    if (i === pts.length - 1) pts.push(pts[i].slice());
    pts[i - 1] = [pts[i - 1][0] + dx, pts[i - 1][1] + dy];
    pts[i] = [pts[i][0] + dx, pts[i][1] + dy];
    return HX.cleanPts(pts);
  };

  ops.toggleLock = function (doc) {
    var s = doc.selected().filter(function (i) { return i.type === 'conn'; }); if (!s.length) return;
    var v = !s[0].locked; doc.change('Bloquear', function () { s.forEach(function (c) { c.locked = v; }); });
  };
  ops.hideUnused = function (doc, c, nl) {
    var s = doc.sheet, unit = doc.p.unit;
    var used = new Set(HX.connLayout(c, unit).pins.filter(function (p) { return nl.connected.has(s + '|' + HX.key(p.pt[0], p.pt[1])) || p.pin.name; }).map(function (p) { return p.n; }));
    c.hidden = c.pins.filter(function (p) { return !used.has(p.n); }).map(function (p) { return p.n; });
  };
})(typeof window !== 'undefined' ? window : globalThis);
/* executa fn preservando as ligações dos fios presos aos itens */
(function (G) {
  var ops = G.HX.ops;
  ops.keepWires = function (doc, ids, fn) { var att = ops.attachments(doc, ids); fn(); ops.fixAttachments(doc, att); };
})(typeof window !== 'undefined' ? window : globalThis);
