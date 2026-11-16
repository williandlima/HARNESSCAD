/* HarnessCAD - PINCEL DE FORMATAÇÃO para TODOS os itens (como o pincel do Word/Excel), no esquema e no físico.
   1º clique num item copia o formato; cada clique seguinte aplica. Mesmo tipo: copia tudo que é formato daquele
   tipo (fio: tipo/bitola/cor/PN; conector: símbolo e personalização; texto: tamanho/cor; ramo: capa e camada;
   etiqueta, acessório, nó, vista...). Tipo diferente: copia só a aparência comum (cor/traço/fonte do item).
   Arrastar uma caixa aplica em todos os itens do mesmo tipo dentro dela. Alt+clique copia outro. Esc sai. Atalho P. */
(function (G) {
  'use strict';
  var HX = G.HX, T = HX.Tools.prototype;
  HX.PAINT_KEYS = ['wtype', 'gauge', 'color', 'pnOverride'];
  HX.PAINT_COMMON = ['sCol', 'sLw', 'sFs'];
  HX.PAINT_FMT = {
    wire: HX.PAINT_KEYS, conn: ['gstyle'], splice: ['stype', 'kind', 'pnOverride', 'color'], label: ['lstyle', 'color', 'size', 'bold'],
    text: ['size', 'color', 'bold', 'italic', 'align', 'font'], line: ['color', 'lw', 'dash'], rect: ['color', 'lw', 'dash', 'fill'], circle: ['color', 'lw', 'dash', 'fill'],
    cable: ['shield', 'drain', 'showRef', 'refTxt', 'part'], pnote: ['size', 'color', 'bold', 'rot'], ptag: ['style', 'len', 'pn', 'dim', 'dimOff', 'dimFrom'],
    pacc: ['pn', 'len', 'text'], pseg: ['cover', 'coverTxt', 'under', 'underTxt'], pnode: ['draw', 'bsKind', 'bootKind', 'showDims', 'dsTerm', 'dsLock', 'dsHood', 'trans', 'transPN'],
    pface: ['w', 'esc', 'fv', 'desc', 'rot'], pimg: ['w', 'rot'], pdim: ['tolP', 'tolM'], pball: [], pflag: [], ptable: ['w'], pdetail: ['k', 'shape'], pang: [], pprep: []
  };
  var NAME = { wire: 'fio', conn: 'conector', splice: 'emenda', label: 'label', text: 'texto', cable: 'cabo', pnote: 'nota', ptag: 'etiqueta', pacc: 'acessório', pseg: 'ramo', pnode: 'nó', pface: 'vista', pimg: 'imagem', pdim: 'cota', pball: 'balão' };
  T.HINTS.paint = 'Pincel: clique num item para copiar o formato, depois clique (ou arraste uma caixa) nos itens de destino | Alt+clique copia outro | Esc sai';
  function keysFor(t) { return (HX.PAINT_FMT[t] || []).concat(t === 'conn' ? HX.UNIV_KEYS || [] : [], HX.PAINT_COMMON); }
  HX.ops.pickFormat = function (it) { var d = {}; keysFor(it.type).forEach(function (k) { d[k] = it[k] === undefined ? null : HX.clone ? HX.clone(it[k]) : it[k]; }); return { type: it.type, d: d, nk: it.nkind || '' }; };
  // chaves que valem do pincel para o item (mesmo tipo: todas; outro tipo: só aparência comum)
  HX.paintKeys = function (brush, it) { if (!brush) return []; var same = brush.type === it.type && (brush.type !== 'pnode' || brush.nk === (it.nkind || '')); return same ? keysFor(it.type) : HX.PAINT_COMMON.filter(function (k) { return brush.d[k] != null; }); };
  HX.ops.applyFormat = function (doc, items, brush) {
    if (brush && !brush.d) brush = { type: 'wire', d: brush }; var n = 0; // compatível com o pincel antigo (só fio)
    doc.change('Pincel de formatação', function () {
      items.forEach(function (it) {
        var ch = false;
        HX.paintKeys(brush, it).forEach(function (k) { var v = brush.d[k]; if (v === undefined) return;
          if (v === null || v === '') { if (it[k] !== undefined && it[k] !== '') { if (brush.type === 'wire' && it.type === 'wire') it[k] = ''; else delete it[k]; ch = true; } }
          else if (JSON.stringify(it[k]) !== JSON.stringify(v)) { it[k] = typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v; ch = true; } });
        if (ch) n++;
      });
    });
    return n;
  };
  HX.brushText = function (b) {
    if (!b) return ''; if (!b.d) b = { type: 'wire', d: b }; var d = b.d;
    if (b.type === 'wire') return [d.gauge && d.gauge + ' AWG', d.color, d.wtype].filter(Boolean).join(' · ') || 'fio';
    var x = Object.keys(d).filter(function (k) { return d[k] != null && d[k] !== ''; }).slice(0, 3).map(function (k) { return k + '=' + d[k]; }).join(' · ');
    return (NAME[b.type] || b.type) + (x ? ': ' + x : '');
  };
  var set0 = T.setTool;
  T.setTool = function (t, data) {
    set0.call(this, t, data);
    if (t === 'paint') {
      var s = this.doc.selected();
      this.brush = s.length === 1 ? HX.ops.pickFormat(s[0]) : (this.brush || null);
      this.toast(this.brush ? 'Pincel: ' + HX.brushText(this.brush) + ' — clique nos itens de destino' : 'Pincel: clique no item que tem o formato desejado');
    }
  };
  T.toast = function (s) { if (HX.UI && HX.UI.toast) HX.UI.toast(s, false, 1800); };
  var down0 = T.down;
  T.down = function (e) {
    if (this.tool !== 'paint' || e.button !== 0 || this.space) return down0.call(this, e);
    this.ev(e); var h = this.view.hitTest(this.cur);
    if (h) {
      if (!this.brush || e.altKey) { this.brush = HX.ops.pickFormat(h); this.toast('Formato copiado: ' + HX.brushText(this.brush)); }
      else { var n = HX.ops.applyFormat(this.doc, [h], this.brush); if (!n && !HX.paintKeys(this.brush, h).length) this.toast('Formato de ' + (NAME[this.brush.type] || this.brush.type) + ' não se aplica a ' + (NAME[h.type] || h.type)); }
      this.view.redraw(); return;
    }
    if (this.brush) this.st = { kind: 'pbox', a: this.cur.slice() };
  };
  var up0 = T.up;
  T.up = function (e) {
    var st = this.st; if (!st || st.kind !== 'pbox') return up0.call(this, e);
    this.st = null; var r = HX.normRect(st.a, this.cur), b = this.brush, u = this.doc.p.unit;
    if (r.x1 - r.x0 > 0.5 || r.y1 - r.y0 > 0.5) {
      var its = this.doc.items().filter(function (w) {
        if (w.type !== b.type) return false;
        if (w.type === 'wire') return w.pts.some(function (q, i) { return i && HX.segRect(w.pts[i - 1], q, r); });
        var bb = HX.bbox(w, u); return bb && bb.x0 <= r.x1 && bb.x1 >= r.x0 && bb.y0 <= r.y1 && bb.y1 >= r.y0;
      });
      this.toast(HX.ops.applyFormat(this.doc, its, b) + ' item(ns) formatado(s)');
    }
    this.view.redraw();
  };
  var move0 = T.move;
  T.move = function (e) { move0.call(this, e); if (this.tool === 'paint') this.view.hover = this.view.hitTest(this.cur) || null; };
  var ov0 = T.drawOverlay;
  T.drawOverlay = function (g) {
    ov0.call(this, g); if (this.tool !== 'paint') return;
    var k = 1 / this.view.s, c = this.cur, st = this.st;
    if (st && st.kind === 'pbox') { var r = HX.normRect(st.a, c); g.style({ stroke: '#c2185b', lw: k, fill: 'rgba(194,24,91,0.07)', dash: [4 * k, 3 * k] }); g.rect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0); g.style({ dash: null }); }
    var s = this.brush ? HX.brushText(this.brush) : 'clique num item para copiar', x = c[0] + 12 * k, y = c[1] + 14 * k, sz = 11 * k, d = this.brush && this.brush.d;
    var col = d && HX.colorHex && (d.color || d.sCol) ? (HX.colorHex(d.color) || d.sCol || '#888') : '#888';
    g.style({ stroke: '#c2185b', lw: k, fill: 'rgba(255,255,255,0.94)' }); g.rect(x, y - sz * 0.8, HX.textW(s, sz) + 26 * k, sz * 1.6);
    g.style({ stroke: '#333', lw: 0.5 * k, fill: col }); g.rect(x + 4 * k, y - 4 * k, 14 * k, 8 * k);
    g.text(s, x + 22 * k, y, { size: sz, color: '#8a0f45', bold: true });
  };
  var key0 = T.key;
  T.key = function (e) {
    var tg = e.target && e.target.tagName;
    if (!(e.ctrlKey || e.metaKey || e.altKey) && (e.key === 'p' || e.key === 'P') && !/INPUT|TEXTAREA|SELECT/.test(tg || '')) { e.preventDefault(); this.setTool('paint'); return; }
    return key0.call(this, e);
  };
  HX.SHORTCUTS.push(['P', 'Pincel de formatação (qualquer item)']);
  HX.MENU_EXTRA = HX.MENU_EXTRA || [];
  HX.MENU_EXTRA.push(['Ferramentas', function (app) { return ['Pincel de formatação', function () { app.tools.setTool('paint'); }, 'P']; }]);
})(typeof window !== 'undefined' ? window : globalThis);
