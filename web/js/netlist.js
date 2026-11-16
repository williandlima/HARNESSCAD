/* HarnessCAD - conectividade (netlist) e lista De-Para */
(function (G) {
  'use strict';
  var HX = G.HX;

  function UF() { this.p = {}; }
  UF.prototype.find = function (a) {
    if (!(a in this.p)) this.p[a] = a;
    while (this.p[a] !== a) { this.p[a] = this.p[this.p[a]]; a = this.p[a]; }
    return a;
  };
  UF.prototype.union = function (a, b) { a = this.find(a); b = this.find(b); if (a !== b) this.p[a] = b; };

  // ponto de ligação do fio de dreno da blindagem (embaixo do oval), relativo ao canto do cabo: fica na grade
  HX.cableDrainPt = function (c) {
    if (!c.shield || (c.drain && c.drain !== 'node')) return null;
    var x = c.ddx != null && c.ddx !== '' ? c.x + +c.ddx : Math.round((c.x + c.w / 2) / 2.5) * 2.5;
    return [HX.r3(x), HX.r3(Math.ceil((c.y + c.h) / 2.5 - 1e-6) * 2.5 + 2.5)];
  };
  // Constrói netlist completa do projeto
  HX.buildNetlist = function (p) {
    var uf = new UF(), unit = p.unit;
    var nodes = {};      // chave -> {terms:[], wireEnds:[], sheet}
    var labelGroups = {};
    var midTouches = []; // pontas de fio no meio de outro fio sem emenda
    function node(s, pt) {
      var k = s + '|' + HX.key(pt[0], pt[1]);
      uf.find(k);
      return nodes[k] || (nodes[k] = { k: k, sheet: s, pt: pt, terms: [], wireEnds: [] });
    }
    p.sheets.forEach(function (sh, s) {
      var wires = sh.items.filter(function (i) { return i.type === 'wire' && i.pts.length > 1; });
      sh.items.forEach(function (it) {
        if (it.type === 'conn') {
          HX.connLayout(it, unit).pins.forEach(function (pp) {
            node(s, pp.pt).terms.push({ kind: 'pin', id: it.id, ref: it.ref, pin: pp.n, name: pp.pin.name, side: pp.side, item: it, pinObj: pp.pin });
          });
        } else if (it.type === 'wire' && it.pts.length > 1) {
          var a = node(s, it.pts[0]), b = node(s, it.pts[it.pts.length - 1]);
          a.wireEnds.push({ w: it, end: 0 }); b.wireEnds.push({ w: it, end: 1 });
          uf.union(a.k, b.k);
        } else if (it.type === 'splice') {
          node(s, [it.x, it.y]).terms.push({ kind: 'splice', id: it.id, ref: it.ref, item: it });
        } else if (it.type === 'cable' && HX.cableDrainPt(it)) {
          node(s, HX.cableDrainPt(it)).terms.push({ kind: 'drain', id: it.id, ref: it.ref, pin: 'SH', item: it });
        } else if (it.type === 'label') {
          var n = node(s, [it.x, it.y]);
          n.terms.push({ kind: 'label', id: it.id, ref: it.text, item: it });
          (labelGroups[it.text] = labelGroups[it.text] || []).push(n.k);
        }
      });
      // Ponta de fio tocando o interior de outro fio (KiCad conecta e marca junção).
      // Pontas indexadas por linha (y) e coluna (x): trechos H/V consultam só as pontas alinhadas.
      var byY = new Map(), byX = new Map(), ends = [];
      function idx(m, k, v) { var l = m.get(k); if (l) l.push(v); else m.set(k, [v]); }
      wires.forEach(function (w) {
        [w.pts[0], w.pts[w.pts.length - 1]].forEach(function (e, ei) {
          var v = { e: e, w: w, ei: ei }; ends.push(v);
          idx(byY, Math.round(e[1] * 1000), v); idx(byX, Math.round(e[0] * 1000), v);
        });
      });
      var seen = new Set();
      function touch(v, o) {
        var k = v.w.id + '/' + v.ei + '/' + o.id; if (seen.has(k)) return; seen.add(k);
        var n = node(s, v.e), on = node(s, o.pts[0]);
        uf.union(n.k, on.k);
        if (!n.terms.some(function (t) { return t.kind === 'splice'; })) midTouches.push({ sheet: s, pt: v.e, wire: v.w, other: o });
      }
      wires.forEach(function (o) {
        for (var i = 1; i < o.pts.length; i++) {
          var a = o.pts[i - 1], b = o.pts[i], list, lo, hi, ax;
          if (Math.abs(a[1] - b[1]) < 0.001) { list = byY.get(Math.round(a[1] * 1000)); ax = 0; }
          else if (Math.abs(a[0] - b[0]) < 0.001) { list = byX.get(Math.round(a[0] * 1000)); ax = 1; }
          else { ends.forEach(function (v) { if (v.w !== o && HX.onSegInterior(v.e, a, b)) touch(v, o); }); continue; }
          if (!list) continue;
          lo = Math.min(a[ax], b[ax]) + 0.001; hi = Math.max(a[ax], b[ax]) - 0.001;
          for (var j = 0; j < list.length; j++) { var v = list[j]; if (v.w !== o && v.e[ax] > lo && v.e[ax] < hi) touch(v, o); }
        }
        for (var q = 1; q < o.pts.length - 1; q++) (byY.get(Math.round(o.pts[q][1] * 1000)) || []).forEach(function (v) { if (v.w !== o && HX.same(v.e, o.pts[q])) touch(v, o); }); // ponta na dobra
      });
    });
    Object.keys(labelGroups).forEach(function (t) {
      var g = labelGroups[t]; for (var i = 1; i < g.length; i++) uf.union(g[0], g[i]);
    });

    // Agrupa em nets
    var nets = {}, list = [];
    Object.keys(nodes).forEach(function (k) {
      var r = uf.find(k), n = nets[r];
      if (!n) { n = nets[r] = { id: r, terms: [], wires: new Set(), nodes: [] }; list.push(n); }
      n.nodes.push(nodes[k]);
      nodes[k].terms.forEach(function (t) { n.terms.push(t); });
      nodes[k].wireEnds.forEach(function (we) { n.wires.add(we.w); });
      nodes[k].net = n;
    });
    var auto = 1;
    list.forEach(function (n) {
      var lab = n.terms.filter(function (t) { return t.kind === 'label'; })[0];
      var named = n.terms.filter(function (t) { return t.kind === 'pin' && t.name; })[0];
      n.name = lab ? lab.ref : named ? named.name : '';
      n.pins = n.terms.filter(function (t) { return t.kind === 'pin'; });
      n.wires = Array.from(n.wires);
    });
    list.sort(function (a, b) { return (a.name || '~').localeCompare(b.name || '~'); });
    list.forEach(function (n) { if (!n.name && (n.wires.length || n.pins.length > 1)) n.name = 'N$' + (auto++); });

    var connected = new Set();
    Object.keys(nodes).forEach(function (k) {
      var n = nodes[k];
      if (n.wireEnds.length || n.terms.length > 1) connected.add(k);
    });
    var touchByWire = {}; midTouches.forEach(function (m) { (touchByWire[m.wire.id] = touchByWire[m.wire.id] || []).push(m); });
    return { touchByWire: touchByWire, nodes: nodes, nets: list.filter(function (n) { return n.wires.length || n.pins.length > 1; }), connected: connected, midTouches: midTouches, uf: uf };
  };

  // Descreve o que existe na ponta de um fio
  function endDesc(nl, s, pt, w) {
    var n = nl.nodes[s + '|' + HX.key(pt[0], pt[1])];
    if (!n) return { txt: '?', kind: 'none' };
    var pin = n.terms.filter(function (t) { return t.kind === 'pin'; })[0];
    if (pin) return { txt: pin.ref + ':' + pin.pin, kind: 'pin', ref: pin.ref, pin: pin.pin, term: pin };
    var sp = n.terms.filter(function (t) { return t.kind === 'splice'; })[0];
    if (sp) return { txt: sp.ref, kind: 'splice', ref: sp.ref, term: sp };
    var dr = n.terms.filter(function (t) { return t.kind === 'drain'; })[0];
    if (dr) return { txt: dr.ref + ':SH', kind: 'drain', ref: dr.ref, pin: 'SH', term: dr };
    var lb = n.terms.filter(function (t) { return t.kind === 'label'; })[0];
    if (lb) return { txt: '→' + lb.ref, kind: 'label', ref: lb.ref };
    if (n.wireEnds.length > 1) return { txt: '(nó)', kind: 'node' };
    var mt = (nl.touchByWire[w.id] || []).filter(function (m) { return HX.same(m.pt, pt); })[0];
    if (mt) return { txt: '(T em ' + (mt.other.num || '?') + ')', kind: 'tee' };
    return { txt: '— solto', kind: 'open' };
  }

  // Membros de cabo: fios que cruzam a região do cabo
  HX.cableOf = function (sheet, w) {
    var r = null;
    sheet.items.forEach(function (c) {
      if (c.type !== 'cable' || r) return;
      var b = HX.bbox(c);
      for (var i = 1; i < w.pts.length; i++) if (HX.segRect(w.pts[i - 1], w.pts[i], b)) { r = c; return; }
    });
    return r;
  };

  // Lista De-Para (From-To)
  HX.wireList = function (p, nl) {
    nl = nl || HX.buildNetlist(p);
    var rows = [], LL = HX.computeLengths ? (nl._dims || (nl._dims = HX.computeLengths(p, nl))) : null;
    p.sheets.forEach(function (sh, s) {
      sh.items.forEach(function (w) {
        if (w.type !== 'wire' || w.pts.length < 2) return;
        var a = endDesc(nl, s, w.pts[0], w), b = endDesc(nl, s, w.pts[w.pts.length - 1], w);
        var n = nl.nodes[s + '|' + HX.key(w.pts[0][0], w.pts[0][1])];
        var cab = HX.cableOf(sh, w);
        rows.push({
          id: w.id, sheet: s, sheetName: sh.name, num: w.num || '', name: w.name || '', from: a.txt, to: b.txt, fromEnd: a, toEnd: b,
          signal: n && n.net ? n.net.name : '', wtype: w.wtype || '', gauge: HX.gaugeLabel(w), color: w.color || '',
          pn: HX.wirePN(w), len: w.len || (LL && LL.wires[w.id] && LL.wires[w.id].eff != null ? Math.round(LL.wires[w.id].eff) + '*' : ''), cable: cab ? cab.ref : '', note: w.note || '', w: w
        });
      });
    });
    rows.sort(function (x, y) { return natCmp(x.num, y.num); });
    return rows;
  };

  function natCmp(a, b) { return String(a).localeCompare(String(b), undefined, { numeric: true }); }
  HX.natCmp = natCmp;
})(typeof window !== 'undefined' ? window : globalThis);
