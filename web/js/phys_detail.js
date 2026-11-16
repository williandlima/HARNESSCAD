/* HarnessCAD - desenho físico: VISTA DE DETALHE = ZOOM DE UMA ÁREA do chicote.
   pdetail: shape 'circle' (padrão, como no desenho técnico) ou 'rect'; região sx,sy,sw,sh (círculo: Ø = sw);
   ampliação k; vista em x,y (canto superior esquerdo). Dentro da vista a geometria é ampliada k vezes, mas as linhas
   finas e os textos voltam ao tamanho normal (cotas e rótulos legíveis). Recorte em retângulo ou círculo (tela e PDF).
   Cotas e balões ficam fora do detalhe (annot = mostrar). Linha de chamada da região até a vista (leader). Arrastar a borda da região move a região; o canto redimensiona. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, hide = HX.physHide, K = 0.5523;
  function f3(v) { return String(Math.round(v * 1000) / 1000); }
  if (HX.CanvasG) HX.CanvasG.prototype.clipCircle = function (x, y, r) { this.c.beginPath(); this.c.arc(x, y, r, 0, 7); this.c.clip(); };
  if (HX.Pdf) {
    var PG = Object.getPrototypeOf(new HX.Pdf().addPage(10, 10));
    PG.clipCircle = function (x, y, r) {
      var k = r * K, o = [[x + r, y, 'm']], c = function (a) { o.push(a.concat(['c'])); };
      c([x + r, y + k, x + k, y + r, x, y + r]); c([x - k, y + r, x - r, y + k, x - r, y]); c([x - r, y - k, x - k, y - r, x, y - r]); c([x + k, y - r, x + r, y - k, x + r, y]);
      this.ops.push(o.map(function (a) { return a.slice(0, -1).map(f3).join(' ') + ' ' + a[a.length - 1]; }).join(' ') + ' h W n');
    };
  }
  // geometria da região e da vista
  HX.physDetGeom = function (it) {
    var k = +it.k || 2, circ = it.shape === 'circle', sw = +it.sw || 40, sh = circ ? sw : +it.sh || 30, x = +it.x || 0, y = +it.y || 0;
    return { k: k, circ: circ, sx: +it.sx, sy: +it.sy, sw: sw, sh: sh, cx: +it.sx + sw / 2, cy: +it.sy + sh / 2, r: sw / 2, x: x, y: y, W: sw * k, H: sh * k };
  };
  // "lente": a geometria cresce k vezes; traço fino e texto voltam ao tamanho normal
  function lens(g, k) {
    var q = Object.create(g), f = Math.min(1, 1.5 / k);
    q.style = function (s) { var t = {}; for (var a in s) t[a] = s[a]; if (t.lw != null && t.lw < 0.3) t.lw = t.lw * f; if (t.dash) t.dash = t.dash.map(function (d) { return d * f; }); return g.style.call(this, t); };
    q.text = function (s, x, y, o) { var t = {}; o = o || {}; for (var a in o) t[a] = o[a]; t.size = (o.size || 2.5) * f; return g.text.call(this, s, x, y, t); };
    return q;
  }
  var SKIP = { pdetail: 1, ptable: 1, pflag: 1 };
  function edgePt(D, view, tx, ty) { // ponto da borda (região ou vista) na direção de (tx,ty)
    var cx = view ? D.x + D.W / 2 : D.cx, cy = view ? D.y + D.H / 2 : D.cy, w = view ? D.W : D.sw, h = view ? D.H : D.sh, dx = tx - cx, dy = ty - cy, l = Math.hypot(dx, dy) || 1;
    if (D.circ) { var r = w / 2; return [cx + dx / l * r, cy + dy / l * r]; }
    var s = Math.min(Math.abs(w / 2 / (dx || 1e-9)), Math.abs(h / 2 / (dy || 1e-9))); return [cx + dx * s, cy + dy * s];
  }
  HX.HITPR.pdetail = 0;
  EXT.pdetail = {
    draw: function (g, it, p, s, o) {
      if (o._inDetail) return;
      var C = HX.physCtx(p, s, o), col = C.line ? C.col : (o.theme && o.theme.txt) || '#222', D = HX.physDetGeom(it), lb = it.label || 'A';
      // região na peça
      g.style({ stroke: col, lw: 0.3, fill: null, dash: [2, 1] });
      if (D.circ) g.circle(D.cx, D.cy, D.r); else g.rect(D.sx, D.sy, D.sw, D.sh); g.style({ dash: null });
      var lp = D.circ ? [D.cx + D.r * 0.72, D.cy - D.r * 0.72 - 2.2] : [D.sx + D.sw + 1.6, D.sy - 1.6];
      g.style({ stroke: col, lw: 0.25, fill: '#fff' }); g.circle(lp[0], lp[1], 2); g.style({ fill: null }); g.text(lb, lp[0], lp[1], { size: 2.4, bold: true, align: 'c', color: col });
      // linha de chamada
      if (it.leader !== false) {
        var a = edgePt(D, false, D.x + D.W / 2, D.y + D.H / 2), b = edgePt(D, true, D.cx, D.cy);
        if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 3) { g.style({ stroke: col, lw: 0.15, dash: [1.2, 0.8] }); g.line(a[0], a[1], b[0], b[1]); g.style({ dash: null }); }
      }
      // vista ampliada
      g.style({ stroke: col, lw: 0.45, fill: '#fff' }); if (D.circ) g.circle(D.x + D.W / 2, D.y + D.H / 2, D.W / 2); else g.rect(D.x, D.y, D.W, D.H); g.style({ fill: null });
      g.push([1, 0, 0, 1, 0, 0]);
      if (D.circ ? g.clipCircle : g.clip) { if (D.circ) g.clipCircle(D.x + D.W / 2, D.y + D.H / 2, D.W / 2 - 0.2); else g.clip(D.x + 0.2, D.y + 0.2, D.W - 0.4, D.H - 0.4); }
      g.push([D.k, 0, 0, D.k, D.x - D.sx * D.k, D.y - D.sy * D.k]);
      var o2 = Object.create(o); o2._inDetail = true; o2.theme = o.theme; o2._pc = null; o2._bun = null;
      var sh = C.sh, items = sh.items; sh.items = items.filter(function (i) { return !SKIP[i.type] && (it.annot || (i.type !== 'pdim' && i.type !== 'pball')); });
      try { HX.drawSheetItems(lens(g, D.k), p, s, o2); } finally { sh.items = items; }
      g.pop(); g.pop();
      g.style({ stroke: col, lw: 0.45, fill: null }); if (D.circ) g.circle(D.x + D.W / 2, D.y + D.H / 2, D.W / 2); else g.rect(D.x, D.y, D.W, D.H);
      var ty = D.y + D.H + 3.2, kt = String(D.k).replace('.', ',');
      g.text('DETALHE ' + lb, D.x + D.W / 2, ty, { size: 2.6, bold: true, align: 'c', color: col }); g.text('ESCALA ' + kt + ':1' + (it.title ? ' — ' + it.title : ''), D.x + D.W / 2, ty + 3, { size: 1.8, align: 'c', color: col });
      g.style({ stroke: col, lw: 0.2 }); var tw = HX.textW('DETALHE ' + lb, 2.6); g.line(D.x + D.W / 2 - tw / 2, ty + 1.4, D.x + D.W / 2 + tw / 2, ty + 1.4);
      hide(it, '_bb', { x0: D.x, y0: D.y, x1: D.x + D.W, y1: ty + 4.5 }); hide(it, '_src', D); hide(it, '_lp', lp);
    },
    bbox: function (it) { return it._bb || { x0: +it.x, y0: +it.y, x1: +it.x + 10, y1: +it.y + 10 }; },
    hit: function (it, pt) {
      var b = it._bb; if (b && pt[0] >= b.x0 && pt[0] <= b.x1 && pt[1] >= b.y0 && pt[1] <= b.y1) return 0.05; // a vista inteira seleciona o detalhe (Delete apaga)
      var e = HX.physDetSrcHit(it, pt); return e ? 0.4 : 1e9;
    }
  };
  // clique na borda da região (move) ou no canto/alça (redimensiona)
  HX.physDetSrcHit = function (it, pt, tol) {
    var D = HX.physDetGeom(it), t = tol || 1.2, lp = it._lp;
    if (lp && Math.hypot(pt[0] - lp[0], pt[1] - lp[1]) < 2.2) return 'move';
    if (D.circ) { var d = Math.hypot(pt[0] - D.cx, pt[1] - D.cy); var hx = D.cx + D.r * 0.7071, hy = D.cy + D.r * 0.7071; if (Math.hypot(pt[0] - hx, pt[1] - hy) < t * 1.5) return 'size'; return Math.abs(d - D.r) < t ? 'move' : ''; }
    if (Math.hypot(pt[0] - D.sx - D.sw, pt[1] - D.sy - D.sh) < t * 1.5) return 'size';
    var inX = pt[0] > D.sx - t && pt[0] < D.sx + D.sw + t, inY = pt[1] > D.sy - t && pt[1] < D.sy + D.sh + t;
    return inX && inY && (Math.abs(pt[0] - D.sx) < t || Math.abs(pt[0] - D.sx - D.sw) < t || Math.abs(pt[1] - D.sy) < t || Math.abs(pt[1] - D.sy - D.sh) < t) ? 'move' : '';
  };
  // ampliação automática: a maior que cabe em ~110 × 80 mm
  HX.physDetAutoK = function (w, h) { var L = [10, 8, 5, 4, 3, 2.5, 2, 1.5]; for (var i = 0; i < L.length; i++) if (w * L[i] <= 110 && h * L[i] <= 80) return L[i]; return 1.5; };
  // posição livre para a vista: ao lado da região, onde não cobre outros itens nem sai da folha
  HX.physDetPlace = function (doc, it) {
    var sh = doc.cur(), D = HX.physDetGeom(it), pg = HX.sheetDims ? HX.sheetDims(doc.p.meta) : null, PW = pg ? pg[0] : 420, PH = pg ? pg[1] : 297, gap = 14, best = null;
    var boxes = sh.items.filter(function (i) { return i !== it && i._bb; }).map(function (i) { return i._bb; });
    var cand = [[D.sx + D.sw + gap, D.cy - D.H / 2], [D.sx - gap - D.W, D.cy - D.H / 2], [D.cx - D.W / 2, D.sy - gap - D.H - 7], [D.cx - D.W / 2, D.sy + D.sh + gap],
      [D.sx + D.sw + gap, D.sy - gap - D.H], [D.sx + D.sw + gap, D.sy + D.sh + gap], [D.sx - gap - D.W, D.sy - gap - D.H], [D.sx - gap - D.W, D.sy + D.sh + gap]];
    cand.forEach(function (c, j) {
      var x0 = c[0], y0 = c[1], x1 = x0 + D.W, y1 = y0 + D.H + 7, ov = 0;
      boxes.forEach(function (b) { var w = Math.min(x1, b.x1) - Math.max(x0, b.x0), h = Math.min(y1, b.y1) - Math.max(y0, b.y0); if (w > 0 && h > 0) ov += w * h; });
      var out = Math.max(0, 12 - x0) + Math.max(0, 12 - y0) + Math.max(0, x1 - PW + 12) + Math.max(0, y1 - PH + 40), sc = ov + out * 400 + j;
      if (!best || sc < best.sc) best = { sc: sc, x: x0, y: y0 };
    });
    it.x = HX.r3(best.x); it.y = HX.r3(best.y); return it;
  };
  HX.physAddDetail = function (doc, r, shape) {
    var sh = doc.cur(), n = sh.items.filter(function (i) { return i.type === 'pdetail'; }).length, circ = shape !== 'rect';
    var w = Math.max(6, r.w), h = Math.max(6, r.h); if (circ) { var d = Math.max(w, h); r = { x: r.x + r.w / 2 - d / 2, y: r.y + r.h / 2 - d / 2 }; w = h = d; }
    var it = { type: 'pdetail', id: doc.uid('a'), label: String.fromCharCode(65 + n % 26), shape: circ ? 'circle' : 'rect', k: HX.physDetAutoK(w, h), sx: HX.r3(r.x), sy: HX.r3(r.y), sw: HX.r3(w), sh: HX.r3(h), x: 0, y: 0, leader: true, title: '' };
    HX.physDetPlace(doc, it); return doc.add(it);
  };
})(typeof window !== 'undefined' ? window : globalThis);
