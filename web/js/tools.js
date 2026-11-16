/* HarnessCAD - ferramentas de mouse: seleção, arrastar (elástico), fio estilo KiCad, colocar */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops;

  function Tools(doc, view, ui) {
    this.doc = doc; this.view = view; this.ui = ui || {};
    this.tool = 'select'; this.st = null; this.wpts = []; this.posture = 'H';
    this.cur = [0, 0]; this.snapPt = [0, 0]; this.magnet = null; this.lastLabel = 'SINAL1';
    var self = this; view.overlay = function (g) { self.drawOverlay(g); };
  }
  HX.Tools = Tools;
  var T = Tools.prototype;
  T.HINTS = {
    select: 'Clique: selecionar | Arraste: mover mantendo fios (Alt: desligar) | Caixa: esq→dir janela, dir→esq cruzando',
    wire: 'Fio: clique para cantos, termina ao clicar em pino/fio/emenda | / alterna H-V | Shift: livre | Backspace desfaz canto | Esc cancela',
    splice: 'Emenda: clique sobre fio ou ponto', label: 'Label de circuito: clique para posicionar', text: 'Texto: clique para posicionar',
    place: 'Posicionar: clique coloca (Shift mantém) | R girar | X/Y espelhar | Esc cancela',
    line: 'Linha: clique início e fim', rect: 'Retângulo: dois cliques', circle: 'Círculo: centro e raio',
    cable: 'Cabo/blindagem: dois cliques definem a elipse sobre os fios', measure: 'Medir: dois cliques', follow: 'Movendo: clique confirma | R/X/Y | Esc cancela'
  };

  T.setTool = function (t, data) {
    if (this.st && this.st.kind === 'follow') this.cancelFollow();
    this.tool = t; this.st = null; this.wpts = []; this.ghost = null; this.p0 = null;
    if (t === 'place') this.ghost = data;
    this.ui.onTool && this.ui.onTool(t); this.status(); this.view.redraw();
  };
  T.status = function () {
    var k = this.st && this.st.kind === 'follow' ? 'follow' : this.tool;
    this.ui.status && this.ui.status({ x: this.snapPt[0], y: this.snapPt[1], tool: k, hint: this.HINTS[k] || '' });
  };

  // Snap: grade + ímã para pontos de conexão
  T.snap = function (raw, e) {
    var gr = this.doc.p.grid, p = raw.slice(), noGrid = e && e.altKey && this.tool !== 'select';
    if (gr.snap && !noGrid) p = [HX.r3(HX.snap(raw[0], gr.size)), HX.r3(HX.snap(raw[1], gr.size))];
    this.magnet = null;
    if (this.tool !== 'select' || (this.st && (this.st.kind === 'vertex'))) {
      var tol = 8 / this.view.s, best = tol, skip = this.st && this.st.w;
      this.view.connPts().forEach(function (c) {
        if (c.it === skip) return;
        var d = Math.hypot(c.pt[0] - raw[0], c.pt[1] - raw[1]); if (d < best) { best = d; p = c.pt.slice(); this.magnet = c; }
      }, this);
    }
    return p;
  };
  T.ev = function (e) {
    var r = this.view.cv.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
    this.screen = [sx, sy]; this.cur = this.view.toWorld(sx, sy); this.snapPt = this.snap(this.cur, e);
    return this.snapPt;
  };
  T.ask = function (title, label, def) {
    return HX.UI && HX.UI.ask ? HX.UI.ask(title, label, def) : Promise.resolve(this.ui.prompt ? this.ui.prompt(label, def) : def);
  };
  // Durante o arraste a netlist é recalculada no máximo a cada 150 ms (projetos grandes)
  T.live = function () {
    var now = Date.now();
    if (!this._nlT || now - this._nlT > 150) { this.view.nl = null; this._nlT = now; }
    this.view._pts = null; this.view.redraw();
  };

  T.down = function (e) {
    var p = this.ev(e), doc = this.doc;
    if (e.button === 1 || e.button === 2 || (e.button === 0 && this.space)) {
      this.st = { kind: 'pan', sx: e.clientX, sy: e.clientY, ox: this.view.ox, oy: this.view.oy, prev: this.st }; return;
    }
    if (e.button !== 0) return;
    if (this.st && this.st.kind === 'follow') { this.st = null; doc.touch(); this.status(); return; }
    switch (this.tool) {
      case 'select': return this.downSelect(e, p);
      case 'wire': return this.clickWire(p, e);
      case 'splice': doc.change('Emenda', function () { ops.placeSplice(doc, p); }); return;
      case 'place': return this.place(e);
      case 'label': return this.addLabel(p);
      case 'text':
        this.ask('Texto', 'Texto:', '').then(function (t) {
          if (t) doc.change('Texto', function () { doc.add({ type: 'text', id: doc.uid('t'), x: p[0], y: p[1], text: t, size: 2.5, rot: 0 }); });
        }); return;
      case 'measure': if (!this.p0 || this.p1) { this.p0 = p; this.p1 = null; } else this.p1 = p; this.view.redraw(); return;
      default: // line, rect, circle, cable
        if (!this.p0) { this.p0 = p; return; }
        var a = this.p0, kind = this.tool; this.p0 = null;
        if (HX.same(a, p)) return;
        doc.change('Desenho', function () {
          if (kind === 'cable') {
            var r = HX.normRect(a, p);
            doc.add({ type: 'cable', id: doc.uid('k'), ref: doc.nextRef('CB'), x: r.x0, y: r.y0, w: r.x1 - r.x0, h: r.y1 - r.y0, part: '', desc: 'Cabo blindado', shield: true, len: '' }); if (HX.cableFit) HX.cableFit(doc.cur().items[doc.cur().items.length - 1], doc.cur());
          } else doc.add({ type: 'shape', id: doc.uid('g'), kind: kind, x: a[0], y: a[1], x2: p[0], y2: p[1], dash: false });
        });
    }
  };

  T.downSelect = function (e, p) {
    var doc = this.doc, hit = this.view.hitTest(this.cur);
    if (hit && hit.type === 'wire' && doc.sel.has(hit.id) && doc.sel.size === 1) {
      var tol = 6 / this.view.s, n = hit.pts.length;
      var end = Math.hypot(hit.pts[0][0] - this.cur[0], hit.pts[0][1] - this.cur[1]) < tol ? 0
        : Math.hypot(hit.pts[n - 1][0] - this.cur[0], hit.pts[n - 1][1] - this.cur[1]) < tol ? 1 : -1;
      if (end >= 0) { this.st = { kind: 'vertex', w: hit, end: end, base: HX.clone(hit), label: 'Mover ponta' }; return; }
      for (var i = 1; i < n; i++) if (HX.distSeg(this.cur, hit.pts[i - 1], hit.pts[i]) < tol) {
        this.st = { kind: 'seg', w: hit, i: i, base: HX.clone(hit), start: p, label: 'Mover segmento' }; return;
      }
    }
    if (hit) {
      if (e.ctrlKey || e.shiftKey) doc.toggle(hit.id);
      else if (!doc.sel.has(hit.id)) doc.select([hit.id]);
      this.st = { kind: 'press', start: p, sx: e.clientX, sy: e.clientY, alt: e.altKey };
    } else {
      if (!e.ctrlKey && !e.shiftKey) doc.select([]);
      this.st = { kind: 'box', a: this.cur.slice(), add: e.ctrlKey || e.shiftKey };
    }
  };

  T.move = function (e) {
    var p = this.ev(e), st = this.st, doc = this.doc;
    if (st) switch (st.kind) {
      case 'pan': this.view.ox = st.ox + e.clientX - st.sx; this.view.oy = st.oy + e.clientY - st.sy; this.view.redraw(); return;
      case 'press':
        if (Math.hypot(e.clientX - st.sx, e.clientY - st.sy) > 4) {
          doc.checkpoint('Mover');
          this.st = { kind: 'drag', start: st.start, sess: ops.beginMove(doc, Array.from(doc.sel), st.alt ? 'move' : 'drag') };
        } return;
      case 'drag': case 'follow': st.sess.apply(p[0] - st.start[0], p[1] - st.start[1]); this.live(); break;
      case 'vertex': case 'seg':
        if (!st.moved) { if (HX.same(p, st.kind === 'seg' ? st.start : st.w.pts[st.end ? st.w.pts.length - 1 : 0])) break; st.moved = true; doc.checkpoint(st.label); }
        if (st.kind === 'seg') { st.w.pts = ops.dragSegment(st.base, st.i, p[0] - st.start[0], p[1] - st.start[1]); this.live(); break; }
        st.w.pts = HX.clone(st.base.pts); ops.moveEnd(st.w, st.end, p, doc.p.grid.size); this.live(); break;
    }
    if (this.tool === 'place' && this.ghost) this.posGhost(p);
    if (this.tool === 'select' && !st) {
      var h = this.view.hitTest(this.cur); if (h !== this.view.hover) { this.view.hover = h; }
    }
    this.status(); this.view.redraw();
  };

  T.up = function (e) {
    var st = this.st, doc = this.doc; if (!st) return;
    if (st.kind === 'pan') { this.st = st.prev && st.prev.kind === 'follow' ? st.prev : null; return; }
    if (st.kind === 'box') {
      var r = HX.normRect(st.a, this.cur), win = this.cur[0] >= st.a[0], unit = doc.p.unit, ids = [];
      if (r.x1 - r.x0 > 0.5 || r.y1 - r.y0 > 0.5) {
        doc.items().forEach(function (it) {
          var b = HX.bbox(it, unit), ok;
          if (win) ok = HX.rectInside(b, r);
          else if (it.type === 'wire') ok = it.pts.some(function (q, i) { return i && HX.segRect(it.pts[i - 1], q, r); });
          else ok = HX.rectsOverlap(b, r);
          if (ok) ids.push(it.id);
        });
        doc.select(ids, st.add);
      }
    } else if (st.kind === 'drag' || ((st.kind === 'vertex' || st.kind === 'seg') && st.moved)) {
      if (st.kind === 'vertex') this.autoJoin(st.w);
      doc.touch();
    }
    if (st.kind !== 'follow') this.st = null;
    this.view.redraw();
  };

  // ao soltar a ponta de um fio: junção automática (T, ponta com ponta, 2+ fios no pino)
  T.autoJoin = function (w) {
    w = HX.ops.junctionAt(this.doc, w, 0); HX.ops.junctionAt(this.doc, w, 1);
  };

  T.startFollow = function (ids, mode, label, skipCk) {
    if (!ids.length) return;
    if (!skipCk) this.doc.checkpoint(label || 'Mover');
    this.tool = 'select';
    this.st = { kind: 'follow', start: this.snapPt.slice(), sess: ops.beginMove(this.doc, ids, mode) };
    this.status();
  };
  T.cancelFollow = function () { this.st = null; this.doc.undo(); this.doc.redoStack.pop(); };
})(typeof window !== 'undefined' ? window : globalThis);
