/* HarnessCAD - core: modelo de dados, documento, undo/redo, eventos */
(function (G) {
  'use strict';
  var HX = G.HX = G.HX || {};
  HX.VERSION = '1.8.4';

  // Folhas (paisagem: largura x altura em mm)
  HX.SHEETS = {
    'A4': [297, 210], 'A3': [420, 297], 'A2': [594, 420], 'A1': [841, 594], 'A0': [1189, 841],
    'Letter': [279.4, 215.9], 'Legal': [355.6, 215.9], 'ANSI B (Tabloid)': [431.8, 279.4],
    'ANSI C': [558.8, 431.8], 'ANSI D': [863.6, 558.8], 'ANSI E': [1117.6, 863.6]
  };
  HX.GRID_PRESETS = [0.5, 1, 1.25, 1.27, 2, 2.5, 2.54, 5, 5.08, 10];

  HX.sheetDims = function (meta) {
    var d = HX.SHEETS[meta.size] || HX.SHEETS.A3;
    if (meta.size === 'Custom' && meta.cw) d = [meta.cw, meta.ch];
    return meta.orient === 'P' ? [d[1], d[0]] : [d[0], d[1]];
  };

  HX.newProject = function () {
    return {
      app: 'HarnessCAD', version: HX.VERSION,
      meta: {
        title: 'Nova cablagem', docNo: 'CAB-0001', rev: 'A', company: 'Empresa',
        author: '', checked: '', approved: '', date: new Date().toISOString().slice(0, 10),
        size: 'A3', orient: 'L', template: 'iso', scale: 'S/E', cage: '', cw: 0, ch: 0,
        revs: [{ rev: 'A', desc: 'Emissão inicial', date: '', by: '' }]
      },
      unit: 2.5, // unidade de símbolo (passo dos pinos = 2 unidades)
      grid: { size: 2.5, snap: true, visible: true, style: 'dots', major: 4,
        color: '#c9d1dc', majorColor: '#93a1b5' },
      view: { wireText: true, wireColor: false, pinNames: true, connStyle: 'univ' },
      defaults: { wtype: 'M22759/16', gauge: '22', color: 'WH', spliceKind: 'junction', mergeWires: false, lenEnd: 50, scrapPct: 5, connWu: 3 },
      library: { conns: {} },
      nextId: 1, eqPins: 2,
      sheets: [{ id: 's1', name: 'Folha 1', items: [] }]
    };
  };

  // ---------- Documento ----------
  function Doc(project) {
    this.p = project || HX.newProject();
    this.sheet = 0;
    this.sel = new Set();
    this.undoStack = []; this.redoStack = [];
    this.dirty = false; this.listeners = {};
    this.fileName = '';
  }
  HX.Doc = Doc;
  var D = Doc.prototype;

  D.on = function (ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); };
  D.emit = function (ev, a) { (this.listeners[ev] || []).forEach(function (f) { f(a); }); };

  D.cur = function () { return this.p.sheets[this.sheet]; };
  D.items = function () { return this.cur().items; };
  D.uid = function (pfx) { return (pfx || 'i') + (this.p.nextId++); };

  D.find = function (id) {
    var it = this.items();
    for (var i = 0; i < it.length; i++) if (it[i].id === id) return it[i];
    return null;
  };
  D.findAll = function (id) { // procura em todas as folhas
    for (var s = 0; s < this.p.sheets.length; s++) {
      var it = this.p.sheets[s].items;
      for (var i = 0; i < it.length; i++) if (it[i].id === id) return { item: it[i], sheet: s };
    }
    return null;
  };
  D.selected = function () {
    var self = this; return this.items().filter(function (i) { return self.sel.has(i.id); });
  };
  D.select = function (ids, add) {
    if (!add) this.sel.clear();
    var self = this; (ids || []).forEach(function (id) { self.sel.add(id); });
    this.emit('select');
  };
  D.toggle = function (id) { this.sel.has(id) ? this.sel.delete(id) : this.sel.add(id); this.emit('select'); };

  // Snapshot de undo (JSON completo: simples e robusto)
  D.snapshot = function () { return JSON.stringify({ p: this.p, s: this.sheet }); };
  D.checkpoint = function (label) {
    this.undoStack.push({ label: label, data: this.snapshot() });
    this.trimUndo();
    this.redoStack = [];
  };
  // Limita o histórico por quantidade (150) e por memória (~40 M caracteres ≈ 80 MB)
  HX.UNDO_MAX = 150; HX.UNDO_CHARS = 40e6;
  D.trimUndo = function () {
    var st = this.undoStack, tot = 0;
    for (var i = st.length - 1; i >= 0; i--) { tot += st[i].data.length; if (tot > HX.UNDO_CHARS && i < st.length - 1) { st.splice(0, i + 1); break; } }
    while (st.length > HX.UNDO_MAX) st.shift();
  };
  D.change = function (label, fn) {
    this.checkpoint(label);
    var r = fn.call(this);
    this.touch();
    return r;
  };
  D.touch = function () { this.dirty = true; this.emit('change'); };
  D._restore = function (data) {
    var o = JSON.parse(data); this.p = o.p; this.sheet = Math.min(o.s, this.p.sheets.length - 1);
    var self = this; this.sel.forEach(function (id) { if (!self.find(id)) self.sel.delete(id); });
    this.dirty = true; this.emit('change'); this.emit('select');
  };
  D.undo = function () {
    var u = this.undoStack.pop(); if (!u) return false;
    this.redoStack.push({ label: u.label, data: this.snapshot() }); this._restore(u.data); return true;
  };
  D.redo = function () {
    var r = this.redoStack.pop(); if (!r) return false;
    this.undoStack.push({ label: r.label, data: this.snapshot() }); this._restore(r.data); return true;
  };

  D.add = function (item) {
    if (!item.id) item.id = this.uid(item.type[0]);
    this.items().push(item); return item;
  };
  D.removeIds = function (ids) {
    var set = new Set(ids), sh = this.cur();
    sh.items = sh.items.filter(function (i) { return !set.has(i.id); });
    var self = this; ids.forEach(function (id) { self.sel.delete(id); });
  };

  D.load = function (project, name) {
    HX.migrate(project);
    this.p = project; this.sheet = 0; this.sel.clear();
    this.undoStack = []; this.redoStack = []; this.dirty = false;
    this.fileName = name || '';
    this.emit('change'); this.emit('select'); this.emit('load');
  };

  // Referência livre: menor número não usado em todo o projeto (J1, J2, SP1...)
  D.nextRef = function (prefix) {
    var used = new Set();
    this.p.sheets.forEach(function (s) {
      s.items.forEach(function (i) { if (i.ref) used.add(i.ref); if (i.num) used.add(i.num); });
    });
    for (var n = 1; ; n++) if (!used.has(prefix + n)) return prefix + n;
  };

  // Compatibilidade com versões anteriores do arquivo
  HX.migrate = function (p) {
    var d = HX.newProject();
    ['meta', 'grid', 'view', 'defaults', 'library'].forEach(function (k) {
      p[k] = Object.assign({}, d[k], p[k] || {});
    });
    if (!p.unit) p.unit = 2.5;
    if (!p.sheets || !p.sheets.length) p.sheets = d.sheets;
    if (!p.nextId) p.nextId = 1;
    if (p.eqPins !== 2 && HX.migrateEquipPins) HX.migrateEquipPins(p); // v1.3: terminais na figura
    p.eqPins = 2;
    p.library.conns = HX.sanitizeLibrary ? HX.sanitizeLibrary(p.library.conns) : (p.library.conns || {});
    return p;
  };

  // fator do texto dos pinos (Exibir › Texto dos pinos): normal / grande / extra grande
  HX.pinK = function (p) { return ({ n: 1.15, g: 1.35, x: 1.6 })[(p && p.view && p.view.pinSize) || 'n'] || 1; };
  HX.clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  HX.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
