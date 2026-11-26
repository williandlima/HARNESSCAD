/* HarnessCAD - desenho dos itens (independente do destino: tela ou PDF) */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.THEME = {
    body: '#8b1a1a', bodyFill: '#fffbd0', header: '#f5eaa8', pinTxt: '#7a1010', txt: '#111', wire: '#000',
    sel: '#1e6bff', open: '#c00000', splice: '#000', label: '#0b3d91', shape: '#444', cable: '#6a3d9a', grid: '#c9d1dc'
  };
  HX.MONO = { body: '#000', bodyFill: null, header: null, pinTxt: '#000', txt: '#000', wire: '#000', sel: '#000', open: '#000', splice: '#000', label: '#000', shape: '#000', cable: '#000' };

  var R90 = [0, -1, 1, 0];
  function ellipsePts(cx, cy, rx, ry) {
    var pts = []; for (var i = 0; i < 48; i++) { var a = i / 48 * Math.PI * 2; pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
    return pts;
  }
  HX.ellipsePts = ellipsePts;
  function fit(s, size, maxW) {
    s = String(s || ''); if (HX.textW(s, size) <= maxW) return s;
    while (s.length > 1 && HX.textW(s + '…', size) > maxW) s = s.slice(0, -1);
    return s + '…';
  }

  HX.drawConn = function (g, c, p, sheet, o) {
    var T = o.theme, L = HX.connLayout(c, p.unit), w = L.w, H = L.H, pp = L.p, nc = Math.max(3 * L.u, 7), F = HX.pinK(p);
    g.push(L.m);
    var st = HX.connStyle ? HX.connStyle(c, p) : 'table';
    if (st !== 'table' && (L.side !== 'B' || (HX.SYM_BOTH || {})[st]) && HX.SYMBOLS && HX.SYMBOLS[st]) { HX.SYMBOLS[st](g, c, p, sheet, o, L); g.pop(); return; }
    g.style({ stroke: T.body, lw: 0.3, fill: T.bodyFill }); g.rect(0, 0, w, L.h);
    if (T.header) { g.style({ fill: T.header, stroke: null }); g.rect(0.15, 0.15, w - 0.3, H - 0.3); }
    g.style({ stroke: T.body, lw: 0.3, fill: null }); g.line(0, H, w, H);
    g.text(c.ref || '?', w / 2, H * 0.34, { size: 2.6, align: 'c', bold: true, color: T.txt });
    g.text(fit(HX.connPN(c), 1.7, w - 1), w / 2, H * 0.74, { size: 1.7, align: 'c', color: T.txt });
    if (c.locked) { g.style({ stroke: T.body, lw: 0.2, fill: null }); g.rect(w - 2.2, 0.6, 1.6, 1.3); }
    var side = L.side;
    L.rows.forEach(function (q, i) {
      var y0 = H + i * pp, yc = y0 + pp / 2;
      if (i > 0) { g.style({ stroke: '#d8c9a0', lw: 0.12 }); if (o.mono) g.style({ stroke: '#000', lw: 0.08 }); g.line(0, y0, w, y0); }
      g.style({ stroke: T.body, lw: 0.15 });
      var nameX, align = 'l';
      if (side === 'R') { g.line(w - nc, y0, w - nc, y0 + pp); g.text(q.n, w - nc / 2, yc, { size: Math.min(2.1 * F, 3.5), align: 'c', color: T.pinTxt, bold: true }); nameX = 1; }
      else if (side === 'L') { g.line(nc, y0, nc, y0 + pp); g.text(q.n, nc / 2, yc, { size: Math.min(2.1 * F, 3.5), align: 'c', color: T.pinTxt, bold: true }); nameX = nc + 1; }
      else { g.line(nc, y0, nc, y0 + pp); g.text(q.n, nc / 2, yc, { size: Math.min(2.1 * F, 3.5), align: 'c', color: T.pinTxt, bold: true }); nameX = nc + 1; }
      if (p.view.pinNames !== false && q.name) g.text(fit(q.name, Math.min(1.9 * F, 3.3), w - nc - 2), nameX, yc, { size: Math.min(1.9 * F, 3.3), align: align, color: T.txt, bold: F > 1 });
    });
    // terminais (stubs)
    L.pins.forEach(function (pn) {
      var x0 = pn.side === 'R' ? w : 0;
      g.style({ stroke: T.body, lw: 0.25 }); g.line(x0, pn.ly, pn.lx, pn.ly);
      var k = sheet + '|' + HX.key(pn.pt[0], pn.pt[1]);
      if (o.connected && !o.connected.has(k)) { g.style({ stroke: T.open, lw: 0.15, fill: null }); g.circle(pn.lx, pn.ly, 0.45); }
    });
    g.pop();
  };

  HX.drawWire = function (g, w, p, o) {
    var T = o.theme, col = p.view.wireColor && !o.mono ? HX.colorHex(w.color) : T.wire;
    g.style({ stroke: col, lw: p.view.wireColor ? 0.35 : 0.25, fill: null }); g.poly(w.pts, false);
    if (p.view.wireColor && !o.mono && String(w.color).indexOf('-') > 0) { // listra
      g.style({ stroke: HX.colorHex(String(w.color).split('-')[1]), lw: 0.12, dash: [0.8, 0.8] }); g.poly(w.pts, false); g.style({ dash: null });
    }
    if (p.view.wireText === false) return;
    var best = 1, bl = -1;
    for (var i = 1; i < w.pts.length; i++) { var l = Math.hypot(w.pts[i][0] - w.pts[i - 1][0], w.pts[i][1] - w.pts[i - 1][1]); if (l > bl) { bl = l; best = i; } }
    var a = w.pts[best - 1], b = w.pts[best], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    var WL = HX.wireLabel(w), txt = WL.txt; // identificação configurável (wirelbl.js)
    if (!txt) return;
    var size = WL.size, tw = HX.textW(txt, size), off = WL.pos === 'b' ? size * 0.8 + 0.6 : -(size * 0.6);
    if (tw > bl - 1 && bl < 12) txt = WL.short; if (!txt) return;
    if (Math.abs(a[0] - b[0]) >= Math.abs(a[1] - b[1])) g.text(txt, mx, my + off, { size: size, align: 'c', color: T.txt });
    else { g.push([0, -1, 1, 0, mx + off, my]); g.text(txt, 0, 0, { size: size, align: 'c', color: T.txt }); g.pop(); }
  };

  HX.drawSplice = function (g, s, o) {
    var T = o.theme, x = s.x, y = s.y;
    g.style({ stroke: T.splice, fill: T.splice === null ? '#000' : T.splice, lw: 0.2 });
    switch (s.kind) {
      case 'junction': g.circle(x, y, 0.65); break;
      case 'crimp': g.circle(x, y, 1.1); break;
      case 'solder': g.style({ fill: null }); g.rect(x - 1.6, y - 0.9, 3.2, 1.8); g.style({ fill: T.splice }); g.circle(x, y, 0.4); break;
      case 'ultra': g.poly([[x, y - 1.3], [x + 1.3, y], [x, y + 1.3], [x - 1.3, y]], true); break;
      default: g.rect(x - 1.3, y - 0.7, 2.6, 1.4);
    }
    if (s.showRef === true || (o.showJunctionRef && s.showRef !== false)) g.text( /* padrão: emenda SEM identificação (liga em Propriedades) */s.ref, x + 1.4, y - 1.4, { size: 1.6, color: T.splice, bold: true });
  };

  HX.drawLabel = function (g, l, o) {
    var T = o.theme, rot = l.rot || 0, dir = rot >= 180 ? -1 : 1, m = rot % 180 ? R90 : [1, 0, 0, 1];
    g.push([m[0], m[1], m[2], m[3], l.x, l.y]);
    g.style({ stroke: T.label, lw: 0.2, fill: null });
    var tw = HX.textW(l.text, 2);
    if (l.style === 'gnd' || l.style === 'chassis') {
      g.line(0, 0, 0, 2);
      if (l.style === 'gnd') { g.line(-2, 2, 2, 2); g.line(-1.3, 2.8, 1.3, 2.8); g.line(-0.6, 3.6, 0.6, 3.6); }
      else { g.line(-2, 2, 2, 2); [-2, 0, 2].forEach(function (dx) { g.line(dx, 2, dx - 1, 3.4); }); }
      g.text(l.text, 0, 5.2, { size: 1.6, align: 'c', color: T.label });
    } else if (l.style === 'global') {
      var e = dir * (tw + 3);
      g.poly([[0, 0], [dir * 1.5, -1.5], [e, -1.5], [e, 1.5], [dir * 1.5, 1.5]], true);
      g.text(l.text, dir * 2, 0, { size: 2, align: dir > 0 ? 'l' : 'r', color: T.label, bold: true });
    } else {
      g.line(0, 0, dir * (tw + 1), 0);
      g.text(l.text, dir * 0.5, -0.8, { size: 2, align: dir > 0 ? 'l' : 'r', color: T.label, bold: true });
    }
    g.pop();
  };

  HX.drawText = function (g, t, o) {
    var s = t.size || 2.5;
    g.push(t.rot ? [0, -1, 1, 0, t.x, t.y] : [1, 0, 0, 1, t.x, t.y]);
    String(t.text).split('\n').forEach(function (ln, i) { g.text(ln, 0, i * s * 1.3, { size: s, bold: t.bold, color: t.color && !o.mono ? t.color : o.theme.txt, va: 'b' }); });
    g.pop();
  };

  HX.drawShape = function (g, s, o) {
    g.style({ stroke: o.mono ? '#000' : (s.color || o.theme.shape), lw: s.lw || 0.25, fill: null, dash: s.dash ? [1.5, 1] : null });
    if (s.kind === 'line') g.line(s.x, s.y, s.x2, s.y2);
    else if (s.kind === 'rect') g.rect(Math.min(s.x, s.x2), Math.min(s.y, s.y2), Math.abs(s.x2 - s.x), Math.abs(s.y2 - s.y));
    else g.circle(s.x, s.y, Math.hypot(s.x2 - s.x, s.y2 - s.y));
    g.style({ dash: null });
  };

  HX.drawCable = function (g, c, o) {
    var T = o.theme;
    g.style({ stroke: T.cable, lw: 0.25, fill: null, dash: c.shield ? [1.2, 0.8] : null });
    g.poly(ellipsePts(c.x + c.w / 2, c.y + c.h / 2, c.w / 2, c.h / 2), true);
    g.style({ dash: null });
    g.text(c.ref + (c.part ? ' ' + c.part : ''), c.x + c.w / 2, c.y - 1.2, { size: 1.7, align: 'c', color: T.cable, bold: true });
    if (c.shield) { var bx = c.x + c.w / 2, by = c.y + c.h; g.line(bx, by, bx, by + 2.5); g.line(bx - 1.5, by + 2.5, bx + 1.5, by + 2.5); }
  };

  // Desenha todos os itens da folha
  HX.drawSheetItems = function (g, p, s, o) {
    o.theme = o.mono ? HX.MONO : HX.THEME;
    var info = null;
    function dimInfo() { if (!info) { var nl = o.nl || HX.buildNetlist(p); info = nl._dims || (nl._dims = HX.computeLengths(p, nl)); } return info; }
    if (HX.syncDims) HX.syncDims(p);
    var items = p.sheets[s].items, order = ['pseg', 'pcov', 'pacc', 'shape', 'cable', 'wire', 'conn', 'face', 'pnode', 'pimg', 'ptag', 'pdim', 'pdimx', 'pang', 'pnote', 'pball', 'pface', 'pprep', 'ptable', 'pdetail', 'pdetc', 'pflag', 'dim', 'brk', 'splice', 'label', 'text'], X = HX.ITEM_EXT || {};
    order.forEach(function (t) {
      items.forEach(function (it) {
        if (it.type !== t) return;
        if (t === 'conn') HX.drawConn(g, it, p, s, o);
        else if (t === 'wire') HX.drawWire(g, it, p, o);
        else if (t === 'splice') HX.drawSplice(g, it, o);
        else if (t === 'label') HX.drawLabel(g, it, o);
        else if (t === 'text') HX.drawText(g, it, o);
        else if (t === 'shape') HX.drawShape(g, it, o);
        else if (t === 'cable') HX.drawCable(g, it, o);
        else if (t === 'face' && HX.drawFace) HX.drawFace(g, it, p, s, o);
        else if (t === 'dim' && HX.drawDim) { if (!o.items) { o.items = {}; o.unit = p.unit; items.forEach(function (i) { o.items[i.id] = i; }); } HX.drawDim(g, it, o, dimInfo()); }
        else if (t === 'brk' && HX.drawBrk) HX.drawBrk(g, it, o);
        else if (X[t]) X[t].draw(g, it, p, s, o);
      });
    });
    if (HX.drawOverlay) HX.drawOverlay(g, p, s, o); // marcas (par trançado, N/C) e destaque cruzado
  };
})(typeof window !== 'undefined' ? window : globalThis);
