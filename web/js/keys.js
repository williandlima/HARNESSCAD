/* HarnessCAD - atalhos de teclado e ligação de eventos da tela */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops, T = HX.Tools.prototype;

  HX.SHORTCUTS = [
    ['Esc', 'Cancelar / ferramenta seleção'], ['W', 'Desenhar fio'], ['J', 'Emenda (splice)'], ['L', 'Label de circuito'],
    ['T', 'Texto'], ['C', 'Cabo / blindagem'], ['A', 'Abrir catálogo de conectores'], ['R', 'Girar 90°'], ['X', 'Espelhar horizontal'],
    ['Y', 'Espelhar vertical'], ['G', 'Arrastar mantendo fios'], ['M', 'Mover desligando fios'], ['E', 'Editar propriedades'],
    ['Del', 'Excluir'], ['Ctrl+D', 'Duplicar'], ['Ctrl+C / Ctrl+V', 'Copiar / colar'], ['Ctrl+Z / Ctrl+Y', 'Desfazer / refazer'],
    ['Ctrl+A', 'Selecionar tudo'], ['Ctrl+L', 'Bloquear/desbloquear conector'], ['Setas', 'Mover 1 passo de grade (Shift: 10)'],
    ['/', 'Fio: alterna canto H/V'], ['Backspace', 'Fio: remove último canto'], ['Enter', 'Fio: terminar'],
    ['F ou Home', 'Ajustar à folha'], ['Z', 'Zoom na seleção'], ['+ / -', 'Zoom'], ['Espaço+arrastar / botão do meio', 'Panorâmica'],
    ['Alt (durante fio)', 'Ignora a grade'], ['Ctrl+S', 'Salvar'], ['Ctrl+P', 'Exportar PDF'], ['F2', 'Verificação elétrica (ERC)']
  ];

  T.key = function (e) {
    var tg = e.target && e.target.tagName;
    if (tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT' || (e.target && e.target.isContentEditable)) return;
    var doc = this.doc, k = e.key, ctrl = e.ctrlKey || e.metaKey, ui = this.ui, self = this;
    function stop() { e.preventDefault(); e.stopPropagation(); }
    if (ctrl) {
      var kl = k.toLowerCase();
      if (kl === 'z' && !e.shiftKey) { stop(); doc.undo(); return; }
      if (kl === 'y' || (kl === 'z' && e.shiftKey)) { stop(); doc.redo(); return; }
      if (kl === 'c') { stop(); ops.copySel(doc); return; }
      if (kl === 'x') { stop(); if (ops.copySel(doc)) ops.deleteSel(doc); return; }
      if (kl === 'v') { stop(); this.paste(); return; }
      if (kl === 'd') { stop(); this.duplicate(); return; }
      if (kl === 'a') { stop(); doc.select(doc.items().map(function (i) { return i.id; })); return; }
      if (kl === 'l') { stop(); ops.toggleLock(doc); return; }
      if (kl === 's') { stop(); ui.save && ui.save(); return; }
      if (kl === 'p') { stop(); ui.pdf && ui.pdf(); return; }
      return;
    }
    if (k === ' ') { this.space = true; stop(); return; }
    if (k === 'Shift') { this.shift = true; this.view.redraw(); }
    switch (k) {
      case 'Escape':
        stop();
        if (this.st && this.st.kind === 'follow') { this.cancelFollow(); this.status(); return; }
        if (this.tool === 'wire' && this.wpts.length) { this.wpts = []; this.view.redraw(); return; }
        if (this.p0) { this.p0 = null; this.view.redraw(); return; }
        if (this.tool !== 'select') { this.setTool('select'); return; }
        doc.select([]); return;
      case 'Enter': if (this.tool === 'wire') { stop(); this.finishWire(); } return;
      case 'Backspace':
        if (this.tool === 'wire' && this.wpts.length) { stop(); this.wpts.pop(); this.view.redraw(); return; }
        stop(); ops.deleteSel(doc); return;
      case 'Delete': stop(); ops.deleteSel(doc); return;
      case '/': this.posture = this.posture === 'H' ? 'V' : 'H'; this.view.redraw(); return;
      case 'ArrowLeft': case 'ArrowRight': case 'ArrowUp': case 'ArrowDown': {
        stop(); var m = e.shiftKey ? 10 : 1;
        this.nudge(k === 'ArrowLeft' ? -m : k === 'ArrowRight' ? m : 0, k === 'ArrowUp' ? -m : k === 'ArrowDown' ? m : 0); return;
      }
      case 'F2': stop(); ui.erc && ui.erc(); return;
      case 'Home': stop(); this.view.fit(); return;
      case '+': case '=': this.view.zoomAt(1.25, this.view.W / 2, this.view.H / 2); return;
      case '-': this.view.zoomAt(0.8, this.view.W / 2, this.view.H / 2); return;
    }
    switch (k.toLowerCase()) {
      case 'w': this.setTool('wire'); break;
      case 'j': this.setTool('splice'); break;
      case 'l': this.setTool('label'); break;
      case 't': this.setTool('text'); break;
      case 'c': this.setTool('cable'); break;
      case 'a': ui.focusCatalog && ui.focusCatalog(); break;
      case 'r': this.xform('rot'); break;
      case 'x': this.xform('mx'); break;
      case 'y': this.xform('my'); break;
      case 'f': this.view.fit(); break;
      case 'z': {
        var s = doc.selected(); if (!s.length) return;
        var b = s.map(function (i) { return HX.bbox(i, doc.p.unit); }).reduce(function (a, q) { return { x0: Math.min(a.x0, q.x0), y0: Math.min(a.y0, q.y0), x1: Math.max(a.x1, q.x1), y1: Math.max(a.y1, q.y1) }; });
        this.view.fit({ x0: b.x0 - 10, y0: b.y0 - 10, x1: b.x1 + 10, y1: b.y1 + 10 }); break;
      }
      case 'g': case 'm': {
        var t = this.targets(); if (!t.length) return;
        if (!doc.selected().length) doc.select([t[0].id]);
        this.startFollow(t.map(function (i) { return i.id; }), k.toLowerCase() === 'g' ? 'drag' : 'move'); break;
      }
      case 'e': { var it = this.targets()[0]; if (it) { doc.select([it.id]); ui.focusProps && ui.focusProps(); } break; }
      default: return;
    }
    stop();
    void self;
  };
  T.keyup = function (e) { if (e.key === ' ') this.space = false; if (e.key === 'Shift') { this.shift = false; this.view.redraw(); } };

  T.bind = function () {
    var cv = this.view.cv, self = this;
    cv.addEventListener('mousedown', function (e) { cv.focus(); self.down(e); });
    G.addEventListener('mousemove', function (e) { if (e.target === cv || self.st) self.move(e); });
    G.addEventListener('mouseup', function (e) { self.up(e); });
    cv.addEventListener('dblclick', function (e) {
      if (self.tool === 'wire') { self.finishWire(); return; }
      var h = self.view.hitTest(self.cur); if (h) { self.doc.select([h.id]); self.ui.focusProps && self.ui.focusProps(); }
    });
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    cv.addEventListener('wheel', function (e) {
      e.preventDefault(); var r = cv.getBoundingClientRect();
      if (e.shiftKey) { self.view.ox -= e.deltaY; self.view.redraw(); return; }
      self.view.zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    cv.addEventListener('mouseleave', function () { self.view.hover = null; self.view.redraw(); });
    G.addEventListener('keydown', function (e) { self.key(e); });
    G.addEventListener('keyup', function (e) { self.keyup(e); });
  };
})(typeof window !== 'undefined' ? window : globalThis);
