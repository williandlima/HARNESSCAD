/* HarnessCAD - desenho físico: SÍMBOLOS DOS CONECTORES COMERCIAIS (vista de cima em desenho técnico + vista frontal
   numerada). Classes: carcaça retangular de fio-placa (Molex Micro/Mini-Fit, JST, KK, Pico, IDC, bornes), vedado tipo
   Deutsch (DT/DTM/DTP/AT/Superseal), industrial com capô (Han), circular rosqueado (M8/M12/M16/M23/7/8"/XLR/RCA/BNC/
   J1939) e plugues (RJ, USB, OBD, Anderson) e terminal olhal. Medidas TÍPICAS de catálogo (passo real da família);
   usado no modo desenho técnico e sempre que a família não tem imagem. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, D2R = Math.PI / 180;
  // [classe, passo, fileiras, profundidade] (rect) | [classe, largura/Ø, comprimento]
  var R = function (p, rows, d) { return ['rect', p, rows, d]; };
  HX.COM_SHAPE = { MicroFit: R(3, 2, 9.9), MiniFit: R(4.2, 2, 13), 'JST-XH': R(2.5, 1, 9.8), 'JST-PH': R(2, 1, 6), 'JST-VH': R(3.96, 1, 10.5), 'JST-SH': R(1, 1, 4.2),
    'JST-GH': R(1.25, 1, 4.8), 'JST-ZH': R(1.5, 1, 4.5), 'JST-EH': R(2.5, 1, 6.6), 'JST-PA': R(2, 1, 8), KK254: R(2.54, 1, 12.4), PICO: R(1.25, 1, 5.6), HDR: R(2.54, 1, 14),
    IDC: R(2.54, 2, 9), MSTB: ['screw', 5.08, 1, 15], BORNE: ['screw', 5.0, 1, 14], DIN41612: R(2.54, 2, 9),
    DT: ['sealed', 20, 38], DTM: ['sealed', 14, 28], DTP: ['sealed', 30, 46], AT: ['sealed', 20, 38], SUPERSEAL: ['sealed', 14, 34], HAN: ['hood', 44, 70],
    M8: ['circ', 10, 40], M12: ['circ', 20, 52], M12X: ['circ', 20, 55], M16: ['circ', 20, 50], M23: ['circ', 26, 62], MINI78: ['circ', 31, 66], J1939: ['circ', 30, 50],
    XLR: ['xlr', 19, 52], AV: ['xlr', 8, 32], COAX: ['circ', 14.5, 32], RJ: ['plug', 11.7, 22], USB: ['plug', 12, 30], OBD: ['plug', 42, 26], POWER: ['plug', 16, 25], TERM: ['term', 8, 22] };
  HX.comShape = function (c) {
    var d = c && HX.CAT.conns[c.part], s = d && HX.COM_SHAPE[d.fam]; if (!s) return null; var n = (c.pins || []).length || 1, o = { cls: s[0], n: n, fam: d.fam };
    if (s[0] === 'rect' || s[0] === 'screw') { var m = /(\d+)\s*x\s*(\d+)/.exec(d.label || ''), rows = m ? +m[1] : (s[2] === 2 && n >= 4 ? 2 : 1), cols = Math.ceil(n / rows);
      o.p = s[1]; o.rows = rows; o.cols = cols; o.W = cols * s[1] + 2.4; o.L = s[3]; o.H = rows * s[1] + 2; }
    else if (s[0] === 'sealed') { o.W = Math.max(s[1], 8 + Math.ceil(n / (n >= 4 ? 2 : 1)) * (s[1] / 4.5)); o.L = s[2]; }
    else { o.W = s[1]; o.L = s[2]; }
    return o;
  };
  function R4(g, x, y, w, h, col, f) { g.style({ stroke: col, lw: 0.22, fill: f, dash: null }); g.rect(x, y, w, h); g.style({ fill: null }); }
  function Ln(g, a, b, c, d, col, lw) { g.style({ stroke: col, lw: lw || 0.1, dash: null }); g.line(a, b, c, d); }
  function knurl(g, x0, x1, h, col) { for (var x = x0 + 0.8; x < x1 - 0.3; x += 0.9) Ln(g, x, -h / 2 + 0.2, x, h / 2 - 0.2, col, 0.07); }
  // desenha no referencial local (x < 0 = conector, x = 0 saída do cabo); s = mm de papel por mm real
  HX.physComDraw = function (g, o, s, col, line, bw) {
    var L = o.L * s, W = o.W * s, F = line ? '#fff' : '#f2f2ee', M = line ? '#fff' : '#cfd3d8', K = line ? '#fff' : '#2f2f2f', c = o.cls;
    if (c === 'rect' || c === 'screw') {
      R4(g, -L, -W / 2, L, W, col, F); var p = o.p * s;
      if (c === 'rect') { R4(g, -L * 0.85, -W * 0.18, L * 0.42, W * 0.36, col, null); Ln(g, -L * 0.85, 0, -L * 0.43, 0, col); }
      for (var i = 0; i < o.cols; i++) { var y = -W / 2 + 1.2 * s + p * (i + 0.5);
        if (c === 'screw') { g.style({ stroke: col, lw: 0.15, fill: M }); g.circle(-L * 0.55, y, p * 0.32); g.style({ fill: null }); Ln(g, -L * 0.55 - p * 0.22, y, -L * 0.55 + p * 0.22, y, col); }
        R4(g, -Math.min(1.2 * s, L * 0.2), y - p * 0.3, Math.min(1.2 * s, L * 0.2), p * 0.6, col, null); }
    } else if (c === 'sealed') {
      R4(g, -L, -W / 2, L * 0.65, W, col, F); R4(g, -L, -W * 0.38, L * 0.1, W * 0.76, col, line ? '#fff' : '#e58b2a');
      R4(g, -L * 0.72, -W * 0.15, L * 0.3, W * 0.3, col, null); R4(g, -L * 0.35, -W * 0.42, L * 0.35, W * 0.84, col, line ? '#fff' : '#9a9a9a');
      for (var r = 1; r < 4; r++) Ln(g, -L * 0.35 + L * 0.35 * r / 4, -W * 0.42, -L * 0.35 + L * 0.35 * r / 4, W * 0.42, col, 0.1);
    } else if (c === 'hood') {
      R4(g, -L, -W / 2, L * 0.62, W, col, M); g.style({ stroke: col, lw: 0.25, fill: null }); g.poly([[-L * 0.92, -W / 2], [-L * 0.75, -W * 0.72], [-L * 0.55, -W * 0.72], [-L * 0.45, -W / 2]], false);
      g.style({ stroke: col, lw: 0.22, fill: M }); g.poly([[-L * 0.38, -W * 0.3], [0, -W * 0.2], [0, W * 0.2], [-L * 0.38, W * 0.3]], true); g.style({ fill: null });
      Ln(g, -L * 0.3, -W * 0.28, -L * 0.3, W * 0.28, col); Ln(g, -L * 0.22, -W * 0.27, -L * 0.22, W * 0.27, col);
    } else if (c === 'circ') {
      R4(g, -L, -W / 2, L * 0.42, W, col, M); knurl(g, -L, -L * 0.58, W, col); R4(g, -L * 0.58, -W * 0.4, L * 0.42, W * 0.8, col, line ? '#fff' : '#3a3a3a');
      g.style({ stroke: col, lw: 0.22, fill: K }); g.poly([[-L * 0.16, -W * 0.4], [0, -Math.max(bw, W * 0.2) / 2], [0, Math.max(bw, W * 0.2) / 2], [-L * 0.16, W * 0.4]], true); g.style({ fill: null });
    } else if (c === 'xlr') {
      R4(g, -L, -W / 2, L * 0.75, W, col, M); R4(g, -L * 0.85, -W / 2 - 0.8 * s, L * 0.2, 0.8 * s, col, M);
      g.style({ stroke: col, lw: 0.22, fill: K }); g.poly([[-L * 0.25, -W * 0.42], [0, -Math.max(bw, W * 0.22) / 2], [0, Math.max(bw, W * 0.22) / 2], [-L * 0.25, W * 0.42]], true); g.style({ fill: null });
    } else if (c === 'plug') {
      R4(g, -L, -W / 2, L * 0.6, W, col, o.fam === 'USB' ? M : F); if (o.fam === 'RJ') { Ln(g, -L * 0.9, -W * 0.25, -L * 0.45, -W * 0.25, col, 0.15); Ln(g, -L * 0.9, W * 0.25, -L * 0.45, W * 0.25, col, 0.15); }
      g.style({ stroke: col, lw: 0.22, fill: K }); g.poly([[-L * 0.4, -W * 0.45], [0, -Math.max(bw, W * 0.3) / 2], [0, Math.max(bw, W * 0.3) / 2], [-L * 0.4, W * 0.45]], true); g.style({ fill: null });
    } else { var rr = W / 2; g.style({ stroke: col, lw: 0.25, fill: M }); g.circle(-L + rr, 0, rr); g.style({ fill: '#fff' }); g.circle(-L + rr, 0, rr * 0.42); g.style({ fill: null });
      R4(g, -L + rr * 1.7, -rr * 0.45, L - rr * 1.7, rr * 0.9, col, line ? '#fff' : '#d9a441'); }
    return { x0: -L, x1: 0, y0: -W / 2 - (c === 'hood' ? W * 0.25 : 1 * s), y1: W / 2 + 1 * s };
  };
  var d0 = EXT.pnode.draw;
  EXT.pnode.draw = function (g, it, p, s, o) {
    if (it.nkind !== 'conn') return d0.apply(this, arguments);
    var C = HX.physCtx(p, s, o), c = C.S[it.of], O = c && HX.comShape(c); if (!O || HX.isDsub(c)) return d0.apply(this, arguments);
    var vec = HX.physVecOn ? HX.physVecOn(it, C.sh) : false; if (!vec && HX.physImgOf(it, c) && !C.line) return d0.apply(this, arguments);
    var BU = HX.physBundleCtx(p, s, o), k = HX.physConnK(C.sh, Math.max(O.L, O.W), C.N, C.line), sc = k / C.N, ang = HX.physAngle(it, C.sh.items), r = ang * D2R, cs = Math.cos(r), sn = Math.sin(r), fl = it.flip ? -1 : 1;
    var col = C.line ? C.col : '#1d1d1d', ws = BU.node[it.id] || [], sg = C.sh.items.filter(function (q) { return q.type === 'pseg' && (q.a === it.id || q.b === it.id); })[0], bw = HX.bundleW(sg && BU.seg[sg.id] ? BU.seg[sg.id].od : 0);
    g.push([cs, sn, -sn * fl, cs * fl, it.x, it.y]); var b = HX.physComDraw(g, O, sc, col, C.line, bw); g.pop();
    if (HX.physFan) HX.physFan(g, it.x, it.y, cs, sn, ws, Math.min(3, bw * 1.2), bw);
    var P = [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]].map(function (q) { return [it.x + cs * q[0] - sn * fl * q[1], it.y + sn * q[0] + cs * fl * q[1]]; });
    var xs = P.map(function (q) { return q[0]; }), ys = P.map(function (q) { return q[1]; }), bb = { x0: Math.min.apply(0, xs), y0: Math.min.apply(0, ys), x1: Math.max.apply(0, xs), y1: Math.max.apply(0, ys) };
    HX.physHide(it, '_bb', bb); HX.physHide(it, '_L', Math.hypot(bb.x1 - bb.x0, bb.y1 - bb.y0)); HX.physHide(it, '_k', k);
    return bb;
  };
})(typeof window !== 'undefined' ? window : globalThis);
