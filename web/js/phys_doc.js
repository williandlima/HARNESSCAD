/* HarnessCAD - desenho físico: DOCUMENTAÇÃO.
   pdetail = vista de detalhe: phys_detail.js (zoom de área, círculo ou retângulo);
   pflag   = nota com bandeira (triângulo numerado), presa a um item (of) ou livre; a tabela 'notes' lista as notas;
   ptable  kinds novos: 'segs' (tabela de ramos), 'notes', 'crimp' (crimpagem), 'cut' (lista de corte), 'markers'. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, hide = HX.physHide;
  function f3(v) { return String(Math.round(v * 1000) / 1000); }
  if (HX.CanvasG) HX.CanvasG.prototype.clip = function (x, y, w, h) { this.c.beginPath(); this.c.rect(x, y, w, h); this.c.clip(); };
  if (HX.Pdf) { var PG = Object.getPrototypeOf(new HX.Pdf().addPage(10, 10)); PG.clip = function (x, y, w, h) { this.ops.push([x, y, w, h].map(f3).join(' ') + ' re W n'); }; }
  HX.HITPR.pflag = 0.2; HX.HITPR.pdetail = 7;
  function colOf(C, o) { return C.line ? C.col : (o.theme && o.theme.txt) || '#222'; }
  EXT.pflag = {
    draw: function (g, it, p, s, o) {
      var C = HX.physCtx(p, s, o), col = colOf(C, o), a = it.of ? HX.physAnchor(C.m[it.of], C.m) : null, x = (a ? a[0] : 0) + (+it.x || 0), y = (a ? a[1] : 0) + (+it.y || 0), r = 2.4;
      if (a) { g.style({ stroke: col, lw: 0.15, fill: null, dash: null }); g.line(a[0], a[1], x, y + r * 0.5); }
      g.style({ stroke: col, lw: 0.3, fill: '#fff', dash: null }); g.poly([[x, y - r], [x + r * 0.95, y + r * 0.65], [x - r * 0.95, y + r * 0.65]], true); g.style({ fill: null });
      g.text(String(it.n || '?'), x, y + 0.5, { size: 1.8, bold: true, align: 'c', color: col });
      hide(it, '_c', [x, y]); hide(it, '_bb', { x0: x - r, y0: y - r, x1: x + r, y1: y + r });
    },
    bbox: function (it) { return it._bb || { x0: 0, y0: 0, x1: 0, y1: 0 }; },
    hit: function (it, pt) { var c = it._c; return c ? Math.hypot(pt[0] - c[0], pt[1] - c[1]) - 2.4 : 1e9; }
  };
  HX.physAddFlag = function (doc, of) { var sh = doc.cur(), n = 0; sh.items.forEach(function (i) { if (i.type === 'pflag') n = Math.max(n, +i.n || 0); }); return doc.add({ type: 'pflag', id: doc.uid('f'), of: of ? of.id : '', x: of ? 6 : 0, y: of ? -8 : 0, n: n + 1, text: '' }); };
  // tabela genérica em grade
  function grid(g, it, title, cols, rows, col, foot) {
    var x = +it.x || 0, y = +it.y || 0, fs = 1.6, rh = 3.2, w = cols.map(function (c) { return c[1]; }), W = w.reduce(function (a, b) { return a + b; }, 0);
    g.text(title, x, y - 2.2, { size: 2.2, bold: true, color: col });
    g.style({ stroke: col, lw: 0.25, fill: null, dash: null }); g.rect(x, y, W, rh * (rows.length + 1)); g.line(x, y + rh, x + W, y + rh);
    var cx = x; cols.forEach(function (c, i) { g.text(c[0], cx + 0.6, y + rh / 2, { size: fs, bold: true, color: col }); cx += w[i]; if (i < cols.length - 1) g.line(cx, y, cx, y + rh * (rows.length + 1)); });
    rows.forEach(function (r, j) {
      var yy = y + rh * (j + 1.5), xx = x; g.style({ stroke: col, lw: 0.1 }); if (j) g.line(x, y + rh * (j + 1), x + W, y + rh * (j + 1));
      r.forEach(function (v, i) { var s = String(v == null ? '' : v); while (s.length > 1 && HX.textW(s, fs) > w[i] - 1.2) s = s.slice(0, -1); g.text(s, xx + 0.6, yy, { size: fs, color: col }); xx += w[i]; });
    });
    if (foot) g.text(foot, x, y + rh * (rows.length + 1) + 3, { size: 1.8, color: col });
    return { x0: x, y0: y - 4.5, x1: x + W, y1: y + rh * (rows.length + 1) + (foot ? 4 : 0.5) };
  }
  HX.physGrid = grid;
  var KINDS = {
    segs: function (p, sh) {
      var m = HX.physIdx(sh), N = +sh.scale || 1, B = HX.physBundle(p, sh), Wt = HX.physWeight ? HX.physWeight(p, sh) : null;
      var rows = sh.items.filter(function (i) { return i.type === 'pseg'; }).map(function (s) { var b = B.seg[s.id] || { wires: [], od: 0 }; return [((m[s.a] || {}).ref || '') + '–' + ((m[s.b] || {}).ref || ''), HX.physSegLen(s, m, N) + (HX.physSegAuto(s) ? '*' : ''), s.tolP || s.tolM ? '+' + (s.tolP || 0) + '/-' + (s.tolM || 0) : '', b.wires.length, HX.fmtNum(b.od), (HX.PSPR[s.cover] || {}).name || '', Wt ? HX.fmtNum(Math.round(Wt.seg[s.id] || 0)) : '']; });
      return ['TABELA DE RAMOS', [['Ramo', 26], ['Compr.', 14], ['Tol.', 14], ['Fios', 9], ['Ø mm', 11], ['Cobertura', 30], ['Peso g', 12]], rows, (Wt ? 'Peso total ~ ' + HX.fmtNum(Wt.total) + ' g (fios ' + HX.fmtNum(Wt.wires) + ' + coberturas ' + HX.fmtNum(Wt.covers) + ' + peças ' + HX.fmtNum(Wt.parts) + ')   ' : '') + '* medido no desenho'];
    },
    notes: function (p, sh) { var rows = sh.items.filter(function (i) { return i.type === 'pflag'; }).sort(function (a, b) { return (+a.n || 0) - (+b.n || 0); }).map(function (f) { return [f.n, f.text || '']; }); return ['NOTAS', [['Nº', 8], ['Nota', 150]], rows]; },
    crimp: function (p) { return ['TABELA DE CRIMPAGEM', [['Conector', 16], ['Pino', 9], ['Fio', 12], ['Bitola', 13], ['Contato', 28], ['Ferramenta', 30], ['Posicionador / matriz', 34], ['Decap.', 14]], (HX.physCrimp ? HX.physCrimp(p) : []).map(function (r) { return [r.ref, r.pin, r.num, r.gauge, r.contact, r.tool, r.pos, r.strip]; }), 'Ferramentas típicas — confirme no datasheet do contato.']; },
    cut: function (p) { return ['LISTA DE CORTE', [['Fio', 12], ['Part number', 34], ['Bitola', 13], ['Cor', 9], ['Corte mm', 15], ['Decap. A', 14], ['Decap. B', 14], ['De', 18], ['Para', 18]], (HX.physCutList ? HX.physCutList(p) : []).map(function (r) { return [r.num, r.pn, r.gauge, r.color, r.len, r.stripA, r.stripB, r.from, r.to]; })]; },
    markers: function (p, sh) { return ['MARCADORES DE IDENTIFICAÇÃO', [['Texto', 40], ['PN', 30], ['Posição', 40]], (HX.physMarkers ? HX.physMarkers(sh) : []).map(function (r) { return [r.text, r.pn, r.dist + ' mm de ' + r.from]; })]; }
  };
  HX.PTABLE_KINDS = { segs: 'Tabela de ramos', notes: 'Notas (bandeiras)', crimp: 'Tabela de crimpagem', cut: 'Lista de corte', markers: 'Marcadores' };
  var d0 = EXT.ptable.draw, f0 = EXT.ptable.fields;
  EXT.ptable.draw = function (g, it, p, s, o) {
    var K = KINDS[it.kind]; if (!K) return d0(g, it, p, s, o);
    var C = HX.physCtx(p, s, o), t = K(p, C.sh); hide(it, '_bb', grid(g, it, t[0], t[1], t[2], colOf(C, o), t[3]));
  };
  EXT.ptable.fields = function (it, doc) { return HX.PTABLE_KINDS[it.kind] ? [{ type: 'head', l: HX.PTABLE_KINDS[it.kind] }] : f0(it, doc); };
})(typeof window !== 'undefined' ? window : globalThis);
