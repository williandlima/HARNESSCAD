/* HarnessCAD - desenho físico: itens de anotação, todos arrastáveis e editáveis.
   pdim  cota entre dois nós: do ramo (comprimento do ramo), do caminho (soma até o outro nó) ou livre (medida × escala);
         arrastar muda o afastamento (perpendicular) e a posição do texto (ao longo).
   pnote rótulo de um nó (ref, PN, texto) — x,y relativos ao nó.
   pball balão numerado (nº do item na lista de materiais) com seta até o item — x,y relativos à âncora.
   pface vista frontal do conector — x,y relativos ao nó. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, hide = HX.physHide;
  function colOf(C, T) { return C.line ? C.col : T.txt || '#000'; }
  function arrow(g, x, y, ux, uy, col, a) { a = a || 1.6; var w = a * 0.28; g.style({ fill: col, stroke: col }); g.poly([[x, y], [x - ux * a - uy * w, y - uy * a + ux * w], [x - ux * a + uy * w, y - uy * a - ux * w]], true); g.style({ fill: null }); }
  function tbox(lines, x, y, al) { // caixa de um bloco de texto
    var w = 0, h = 0; lines.forEach(function (l) { w = Math.max(w, HX.textW(String(l[0]), l[1])); h += l[1] * 1.35; });
    var x0 = al === 'c' ? x - w / 2 : al === 'r' ? x - w : x; return { x0: x0 - 0.5, y0: y - 0.5, x1: x0 + w + 0.5, y1: y + h + 0.5 };
  }
  HX.physDimValue = function (it, C, p) {
    var tolP = it.tolP, tolM = it.tolM, v = null, miss = false, fora = false, sg = it.seg && C.m[it.seg];
    if (it.mode === 'seg' && sg) { v = HX.physSegLen(sg, C.m, C.N); if (!tolP && !tolM) { tolP = sg.tolP; tolM = sg.tolM; } var P = sg._P || HX.physSegPts(sg, C.m); if (v > 0 && P && !HX.physSegAuto(sg)) fora = Math.abs(HX.polyLen(P) * C.N - v) / v > 0.03; }
    else if (it.mode === 'path') { var r = HX.physPathLen(C.sh, it.a, it.b); if (r) { v = r.len; miss = r.missing; } }
    else { var A = C.m[it.a], B = C.m[it.b]; if (A && B) v = Math.round(Math.hypot(B.x - A.x, B.y - A.y) * C.N); }
    var main = it.text ? it.text : v == null ? 'sem cota' : HX.fmtNum(v) + (miss ? ' (+ramo sem cota)' : ''), tol = !it.text && v != null && (tolP || tolM) ? ['+' + (tolP || 0), (String(tolM || 0) === '0' ? '' : '-') + (tolM || 0)] : null;
    var txt = main + (tol ? ' ' + tol[0] + '/' + tol[1] : '');
    return { v: v, txt: txt, main: main, tol: tol, fora: fora, bad: v == null && !it.text };
  };
  EXT.pdim = {
    draw: function (g, it, p, s, o) {
      var C = HX.physCtx(p, s, o), A = C.m[it.a], B = C.m[it.b]; if (!A || !B) return;
      var col = colOf(C, o.theme), dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = uy, ny = -ux;
      if (ny > 0 || (Math.abs(ny) < 1e-9 && nx < 0)) { nx = -nx; ny = -ny; }
      var ox = +it.x || 0, oy = +it.y || 0, d = (it.off == null ? 6 : +it.off) + ox * nx + oy * ny, t = ox * ux + oy * uy, sw = C.m[it.seg] && HX.physVisW ? HX.physVisW(C.m[it.seg], C.sh, HX.physBundleCtx(p, s, o)) : 0;
      if (sw) d += (d >= 0 ? 1 : -1) * Math.max(0, sw / 2 - 2.5); var nt = it.seg && HX.physTagDims ? HX.physTagDims(C.sh, it.seg) : 0; if (nt) d = (d >= 0 ? 1 : -1) * Math.max(Math.abs(d), sw / 2 + 5.5 + 4.5 * nt); // por fora da pilha de cotas das etiquetas
      var ax = A.x + nx * d, ay = A.y + ny * d, bx = B.x + nx * d, by = B.y + ny * d, sg = d >= 0 ? 1 : -1;
      g.style({ stroke: col, lw: 0.18, fill: null, dash: null }); g.line(ax, ay, bx, by);
      g.line(A.x + nx * 1.2 * sg, A.y + ny * 1.2 * sg, ax + nx * 1.2 * sg, ay + ny * 1.2 * sg); g.line(B.x + nx * 1.2 * sg, B.y + ny * 1.2 * sg, bx + nx * 1.2 * sg, by + ny * 1.2 * sg);
      arrow(g, ax, ay, -ux, -uy, col); arrow(g, bx, by, ux, uy, col);
      var V = HX.physDimValue(it, C, p), ta = Math.atan2(uy, ux); if (Math.cos(ta) < -1e-6 || (Math.abs(Math.cos(ta)) < 1e-6 && Math.sin(ta) > 0)) ta += Math.PI;
      var mx = (ax + bx) / 2 + ux * t + nx * 1.7, my = (ay + by) / 2 + uy * t + ny * 1.7, ca = Math.cos(ta), sa = Math.sin(ta);
      // ABNT NBR 10126: tolerâncias empilhadas à direita do valor; cota fora de escala = valor SUBLINHADO
      var DF = +C.sh.dimFs || 2.5, mw = HX.textW(V.main, DF), tw2 = V.tol ? Math.max(HX.textW(V.tol[0], 1.5), HX.textW(V.tol[1], 1.5)) + 0.6 : 0, x0 = -(mw + tw2) / 2;
      g.push([ca, sa, -sa, ca, mx, my]); g.text(V.main, x0 + mw / 2, 0, { size: DF, align: 'c', color: V.bad ? '#c00' : col });
      if (V.tol) { g.text(V.tol[0], x0 + mw + 0.6, -0.75, { size: 1.5, color: col }); g.text(V.tol[1], x0 + mw + 0.6, 0.85, { size: 1.5, color: col }); }
      if (V.fora) { g.style({ stroke: col, lw: 0.18 }); g.line(x0, 1.45, x0 + mw, 1.45); }
      if (V.sub) g.text(V.sub, 0, -2.9, { size: 1.6, align: 'c', color: col });
      g.pop();
      var tw = (mw + tw2) / 2 + 1;
      hide(it, '_seg', [ax, ay, bx, by]); hide(it, '_bb', HX.normRect([Math.min(ax, bx, mx - tw) - 1, Math.min(ay, by, my - tw) - 1], [Math.max(ax, bx, mx + tw) + 1, Math.max(ay, by, my + tw) + 1]));
    },
    bbox: function (it) { return it._bb || { x0: 0, y0: 0, x1: 0, y1: 0 }; },
    hit: function (it, pt) { var q = it._seg; if (!q) return 1e9; var b = it._bb, inT = b && pt[0] >= b.x0 && pt[0] <= b.x1 && pt[1] >= b.y0 && pt[1] <= b.y1; return Math.min(HX.distSeg(pt, [q[0], q[1]], [q[2], q[3]]) - 0.6, inT ? 1.5 : 1e9); }
  };
  HX.physNoteLines = function (it, nd, c, bu) {
    if (!it.text && nd.type === 'pseg') { // rótulo de feixe (como o "layout label" do Altium)
      var ws = bu ? bu.wires : [], nums = ws.map(function (w) { return w.num; }).filter(Boolean);
      return [[nums.length ? (nums.length > 6 ? nums[0] + '…' + nums[nums.length - 1] : nums.join(', ')) : 'feixe', 1.8, true], [ws.length + ' fio(s) · Ø ' + HX.fmtNum(bu ? bu.od : 0) + ' mm (estim.)', 1.5, false]];
    }
    if (it.text) return String(it.text).split(/\n|\|/).map(function (l, i) { return [l, i ? 1.6 : 2.5, !i]; });
    var L = [[nd.ref || '', 2.5, true]];
    if (c && nd.nkind === 'conn') { if (nd.showPN !== false) L.push([HX.connPN(c), 1.6, false]); if (nd.note) L.push([nd.note, 1.6, false]); }
    return L;
  };
  // posição automática (pos:'auto'): rótulo abaixo e balão acima da montagem desenhada do conector
  HX.physAutoAt = function (it, nd) { var b = it.pos === 'auto' && nd && nd._bb; if (!b) return null; var cx = (b.x0 + b.x1) / 2; return it.type === 'pball' ? [cx, b.y0 - 4] : [cx, b.y1 + 2.5]; };
  EXT.pnote = {
    draw: function (g, it, p, s, o) {
      var C = HX.physCtx(p, s, o), nd = C.m[it.of], A = HX.physAutoAt(it, nd) || HX.physAnchor(nd, C.m); if (!A) return;
      var col = colOf(C, o.theme), x = A[0] + (+it.x || 0), y = A[1] + (+it.y || 0), bu = nd.type === 'pseg' ? HX.physBundleCtx(p, s, o).seg[nd.id] : null, lines = HX.physNoteLines(it, nd, C.S[nd.of], bu), yy = y;
      var rot = 0; if (it.along && nd.type === 'pseg') { var P = nd._P || HX.physSegPts(nd, C.m); if (P) { var d = HX.polyAt(P, 0.5).d; rot = Math.atan2(d[1], d[0]); if (Math.cos(rot) < -1e-6) rot += Math.PI; } }
      if (rot) { g.push([Math.cos(rot), Math.sin(rot), -Math.sin(rot), Math.cos(rot), x, y]); x = 0; y = 0; yy = 0; }
      lines.forEach(function (l) { g.text(l[0], x, yy + l[1] * 0.4, { size: l[1], bold: l[2], align: 'c', color: col }); yy += l[1] * 1.35; });
      if (rot) { g.pop(); x = A[0] + (+it.x || 0); y = A[1] + (+it.y || 0); }
      hide(it, '_bb', tbox(lines, x, y, 'c'));
    },
    bbox: function (it) { return it._bb || { x0: 0, y0: 0, x1: 0, y1: 0 }; }
  };
  EXT.pball = {
    draw: function (g, it, p, s, o) {
      var C = HX.physCtx(p, s, o), tg = C.m[it.of], A = HX.physAutoAt(it, tg) || HX.physAnchor(tg, C.m); if (!A) return;
      if (!o._bom) o._bom = HX.physBom(p, C.sh);
      var col = colOf(C, o.theme), r = +C.sh.ballR || 2.6, cx = A[0] + (+it.x || 0), cy = A[1] + (+it.y || 0), k = HX.physItemKey(p, tg, C.m), row = k && o._bom.key[k];
      var num = it.n !== '' && it.n != null ? String(it.n) : row ? String(row.n) : '?', dx = A[0] - cx, dy = A[1] - cy, L = Math.hypot(dx, dy);
      g.style({ stroke: col, lw: 0.22, fill: '#fff', dash: null }); g.circle(cx, cy, r); g.style({ fill: null });
      if (L > r + 1) { var ux = dx / L, uy = dy / L; g.line(cx + ux * r, cy + uy * r, A[0], A[1]); arrow(g, A[0], A[1], ux, uy, col, 1.4); }
      g.text(num, cx, cy, { size: r * 0.92, bold: true, align: 'c', color: col });
      var as = it.assoc === false ? [] : ((o._bom.assoc || {})[tg.id] || []).map(function (k2) { return o._bom.key[k2]; }).filter(Boolean), r2 = 1.9, x2 = cx + r; // peças associadas (contatos, tampões)
      as.forEach(function (row) { g.style({ stroke: col, lw: 0.18, fill: '#fff' }); g.circle(x2 + r2, cy, r2); g.style({ fill: null }); g.text(String(row.n), x2 + r2, cy, { size: 1.7, align: 'c', color: col }); x2 += 2 * r2; });
      hide(it, '_bb', { x0: cx - r, y0: cy - r, x1: x2, y1: cy + r });
    },
    bbox: function (it) { return it._bb || { x0: 0, y0: 0, x1: 0, y1: 0 }; }
  };
  EXT.pface = {
    draw: function (g, it, p, s, o) {
      var C = HX.physCtx(p, s, o), nd = C.m[it.of], c = nd && C.S[nd.of]; if (!c) return;
      var col = colOf(C, o.theme), x = nd.x + (+it.x || 0), y = nd.y + (+it.y || 0), w = +it.w || 14, ds = HX.isDsub(c), k = +it.esc || HX.physFaceK(c);
      var bb = HX.physLineFace(g, c, x, y, w, col, true, k), im = !ds && HX.faceImgFor && HX.faceImgFor(c.part, c.gender);
      var l1 = 'VISTA FRONTAL ' + (nd.ref || '') + (ds ? ' — ESC. ' + k + ':1' : ''), l2 = ds ? (c.gender === 'S' ? 'face de soquetes' : 'face de pinos') + ' · carcaça ' + bb.geom.shell : im ? 'imagem do datasheet' : '';
      if (it.desc === 'on') { g.text(l1, x, bb.y1 + 2, { size: 1.5, align: 'c', color: col }); if (l2) g.text(l2, x, bb.y1 + 3.9, { size: 1.2, align: 'c', color: col }); }
      hide(it, '_bb', { x0: bb.x0, y0: bb.y0, x1: bb.x1, y1: bb.y1 + (it.desc === 'on' ? 5 : 0.5) });
    },
    bbox: function (it) { return it._bb || { x0: 0, y0: 0, x1: 0, y1: 0 }; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
