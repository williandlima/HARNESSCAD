/* HarnessCAD - gerador de DXF R12 (AC1009) próprio, sem bibliotecas: mesmo "backend de desenho" do PDF (style, line,
   poly, rect, circle, text, push/pop), em mm de papel 1:1, eixo Y para cima. Abre no Solid Edge (Arquivo › Abrir ›
   .dxf › salvar como .dft), AutoCAD, DraftSight, LibreCAD...
   Camadas pela espessura do traço (FINO < 0,18 ≤ MEDIO < 0,32 ≤ GROSSO), TEXTO e PREENCHIMENTO; tracejado e
   traço-ponto como tipos de linha; regiões cheias trianguladas em SOLID; fundo branco não é exportado (no CAD não
   "tampa"). Texto em ANSI 1252 (acentos, Ø, —). Imagens raster não vão para o DXF. */
(function (G) {
  'use strict';
  var HX = G.HX;
  var ACI = [[1, 255, 0, 0], [2, 255, 255, 0], [3, 0, 255, 0], [4, 0, 255, 255], [5, 0, 0, 255], [6, 255, 0, 255], [7, 0, 0, 0], [8, 128, 128, 128], [9, 192, 192, 192], [30, 255, 127, 0]];
  function rgb(h) { h = String(h || '#000').replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1'); var v = parseInt(h, 16); return isNaN(v) ? [0, 0, 0] : [(v >> 16) & 255, (v >> 8) & 255, v & 255]; }
  function white(h) { var c = rgb(h); return c[0] > 235 && c[1] > 235 && c[2] > 235; }
  HX.dxfColor = function (h) { var c = rgb(h), b = 7, best = 1e9; ACI.forEach(function (a) { var d = (a[1] - c[0]) * (a[1] - c[0]) + (a[2] - c[1]) * (a[2] - c[1]) + (a[3] - c[2]) * (a[3] - c[2]); if (d < best) { best = d; b = a[0]; } }); return b; };
  var MAP = { '…': 0x85, '—': 0x97, '–': 0x96, '•': 0x95, '€': 0x80, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94 }, SUB = { '→': '->', '←': '<-', 'Ω': 'Ohm', '≥': '>=', '≤': '<=', '⊕': '+', '⊖': '-' };
  HX.dxfText = function (s) { var o = ''; String(s).replace(/[\r\n]+/g, ' ').split('').forEach(function (ch) { if (SUB[ch]) ch = SUB[ch]; for (var i = 0; i < ch.length; i++) { var c = ch.charCodeAt(i); o += String.fromCharCode(MAP[ch[i]] || (c < 256 ? c : 63)); } }); return o; };
  function n(v) { var s = (+v).toFixed(4); return s.indexOf('.') >= 0 ? s.replace(/\.?0+$/, '') : s; }
  function Dxf(wmm, hmm, opt) { this.w = wmm; this.h = hmm; this.o = opt || {}; this.out = []; this.M = [1, 0, 0, 1, 0, 0]; this.stk = []; this.st = { stroke: '#000', lw: 0.25, fill: null, dash: null }; this.box = [1e9, 1e9, -1e9, -1e9]; }
  HX.DxfPage = Dxf;
  var P = Dxf.prototype;
  P.style = function (s) { for (var k in s) this.st[k] = s[k]; };
  P.push = function (m) { var M = this.M; this.stk.push(M); this.M = [M[0] * m[0] + M[2] * m[1], M[1] * m[0] + M[3] * m[1], M[0] * m[2] + M[2] * m[3], M[1] * m[2] + M[3] * m[3], M[0] * m[4] + M[2] * m[5] + M[4], M[1] * m[4] + M[3] * m[5] + M[5]]; };
  P.pop = function () { if (this.stk.length) this.M = this.stk.pop(); };
  P.T = function (x, y) { var M = this.M, X = M[0] * x + M[2] * y + M[4], Y = this.h - (M[1] * x + M[3] * y + M[5]); var b = this.box; if (X < b[0]) b[0] = X; if (Y < b[1]) b[1] = Y; if (X > b[2]) b[2] = X; if (Y > b[3]) b[3] = Y; return [X, Y]; };
  P.g = function () { for (var i = 0; i < arguments.length; i += 2) this.out.push(arguments[i], typeof arguments[i + 1] === 'number' ? n(arguments[i + 1]) : arguments[i + 1]); };
  P.col = function (h) { return this.o.mono ? 7 : HX.dxfColor(h); };
  P.layer = function () { var w = (+this.st.lw || 0.25) * Math.sqrt(Math.abs(this.M[0] * this.M[3] - this.M[1] * this.M[2])); return w < 0.18 ? 'FINO' : w < 0.32 ? 'MEDIO' : 'GROSSO'; };
  P.lt = function () { var d = this.st.dash; return !d || !d.length ? 'CONTINUOUS' : d.length >= 4 ? 'TRACOPONTO' : 'TRACEJADA'; };
  P.head = function (type, layer, col, lt) { this.g('0', type, '8', layer); if (lt && lt !== 'CONTINUOUS') this.g('6', lt); this.g('62', String(col)); };
  P.pl = function (Q, closed) { /* Q já transformado */
    if (Q.length < 2) return; var s = this.st; if (!s.stroke || white(s.stroke)) return;
    if (Q.length === 2 && !closed) { this.head('LINE', this.layer(), this.col(s.stroke), this.lt()); this.g('10', Q[0][0], '20', Q[0][1], '30', '0', '11', Q[1][0], '21', Q[1][1], '31', '0'); return; }
    this.head('POLYLINE', this.layer(), this.col(s.stroke), this.lt()); this.g('66', '1', '70', closed ? '1' : '0', '10', '0', '20', '0', '30', '0');
    var L = this.layer(); Q.forEach(function (q) { this.g('0', 'VERTEX', '8', L, '10', q[0], '20', q[1], '30', '0'); }, this); this.g('0', 'SEQEND', '8', L);
  };
  P.fillQ = function (Q) { /* triangulação por orelhas -> SOLID */
    var s = this.st; if (!s.fill || white(s.fill) || Q.length < 3) return; var c = this.col(s.fill), V = Q.slice(), A = 0, i;
    for (i = 0; i < V.length; i++) { var a = V[i], b = V[(i + 1) % V.length]; A += a[0] * b[1] - b[0] * a[1]; } if (A < 0) V.reverse();
    function cross(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    function inT(p, a, b, c2) { return cross(a, b, p) >= -1e-12 && cross(b, c2, p) >= -1e-12 && cross(c2, a, p) >= -1e-12; }
    var guard = 0; while (V.length > 3 && guard++ < 5000) {
      var cut = false; for (i = 0; i < V.length; i++) { var p0 = V[(i + V.length - 1) % V.length], p1 = V[i], p2 = V[(i + 1) % V.length]; if (cross(p0, p1, p2) <= 1e-12) continue;
        var ok = true; for (var j = 0; j < V.length && ok; j++) { var q = V[j]; if (q !== p0 && q !== p1 && q !== p2 && inT(q, p0, p1, p2)) ok = false; }
        if (ok) { this.solid(p0, p1, p2, c); V.splice(i, 1); cut = true; break; } }
      if (!cut) break; }
    if (V.length === 3) this.solid(V[0], V[1], V[2], c);
  };
  P.solid = function (a, b, c, col) { this.g('0', 'SOLID', '8', 'PREENCHIMENTO', '62', String(col), '10', a[0], '20', a[1], '30', '0', '11', b[0], '21', b[1], '31', '0', '12', c[0], '22', c[1], '32', '0', '13', c[0], '23', c[1], '33', '0'); };
  P.line = function (x1, y1, x2, y2) { this.pl([this.T(x1, y1), this.T(x2, y2)], false); };
  P.poly = function (pts, closed) { if (!pts || !pts.length) return; var Q = pts.map(function (q) { return this.T(q[0], q[1]); }, this); if (closed) this.fillQ(Q); this.pl(Q, closed); };
  P.rect = function (x, y, w, h) { this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true); };
  P.circle = function (x, y, r) {
    var M = this.M, sx = Math.hypot(M[0], M[1]), sy = Math.hypot(M[2], M[3]), s = this.st;
    if (s.fill && !white(s.fill) || Math.abs(sx - sy) > 1e-6) { var Q = []; for (var k = 0; k < 48; k++) { var a = k / 48 * 2 * Math.PI; Q.push([x + r * Math.cos(a), y + r * Math.sin(a)]); } return this.poly(Q, true); }
    if (!s.stroke || white(s.stroke)) return; var c = this.T(x, y); this.head('CIRCLE', this.layer(), this.col(s.stroke), this.lt()); this.g('10', c[0], '20', c[1], '30', '0', '40', r * sx);
  };
  P.text = function (str, x, y, o) {
    o = o || {}; var t = HX.dxfText(str); if (!t.trim()) return; var M = this.M, sc = Math.hypot(M[0], M[1]), h = (o.size || 2.5) * 0.72 * sc, c = this.T(x, y);
    var rot = -Math.atan2(M[1], M[0]) * 180 / Math.PI, hj = o.align === 'c' ? 1 : o.align === 'r' ? 2 : 0;
    this.g('0', 'TEXT', '8', 'TEXTO', '62', String(this.col(o.color || '#000')), '10', c[0], '20', c[1], '30', '0', '40', h, '1', t);
    if (Math.abs(rot) > 1e-6) this.g('50', rot); if (o.italic) this.g('51', '15'); this.g('7', 'HXFONTE', '72', String(hj), '11', c[0], '21', c[1], '31', '0', '73', o.va === 'b' ? '0' : '2');
  };
  P.image = function () { return false; };
  P.build = function () {
    var W = this.w, H = this.h, b = this.box[0] < 1e8 ? this.box : [0, 0, W, H], o = [];
    function g() { for (var i = 0; i < arguments.length; i++) o.push(typeof arguments[i] === 'number' ? n(arguments[i]) : arguments[i]); }
    g('0', 'SECTION', '2', 'HEADER', '9', '$ACADVER', '1', 'AC1009', '9', '$DWGCODEPAGE', '3', 'ANSI_1252', '9', '$INSBASE', '10', 0, '20', 0, '30', 0,
      '9', '$EXTMIN', '10', b[0], '20', b[1], '30', 0, '9', '$EXTMAX', '10', b[2], '20', b[3], '30', 0, '9', '$LIMMIN', '10', 0, '20', 0, '9', '$LIMMAX', '10', W, '20', H,
      '9', '$MEASUREMENT', '70', '1', '9', '$LUNITS', '70', '2', '9', '$LUPREC', '70', '3', '9', '$LTSCALE', '40', 1, '0', 'ENDSEC');
    g('0', 'SECTION', '2', 'TABLES', '0', 'TABLE', '2', 'LTYPE', '70', '3',
      '0', 'LTYPE', '2', 'CONTINUOUS', '70', '0', '3', 'Continua', '72', '65', '73', '0', '40', 0,
      '0', 'LTYPE', '2', 'TRACEJADA', '70', '0', '3', '__ __ __', '72', '65', '73', '2', '40', 1.6, '49', 1.0, '49', -0.6,
      '0', 'LTYPE', '2', 'TRACOPONTO', '70', '0', '3', '__ . __ .', '72', '65', '73', '4', '40', 2.75, '49', 1.6, '49', -0.45, '49', 0.25, '49', -0.45, '0', 'ENDTAB',
      '0', 'TABLE', '2', 'LAYER', '70', '5');
    [['FINO', 7], ['MEDIO', 7], ['GROSSO', 7], ['TEXTO', 7], ['PREENCHIMENTO', 7]].forEach(function (l) { g('0', 'LAYER', '2', l[0], '70', '0', '62', String(l[1]), '6', 'CONTINUOUS'); });
    g('0', 'ENDTAB', '0', 'TABLE', '2', 'STYLE', '70', '1', '0', 'STYLE', '2', 'HXFONTE', '70', '0', '40', 0, '41', 1, '50', 0, '71', '0', '42', 2.5, '3', 'arial.ttf', '4', '', '0', 'ENDTAB', '0', 'ENDSEC');
    g('0', 'SECTION', '2', 'BLOCKS', '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES'); o = o.concat(this.out); g('0', 'ENDSEC', '0', 'EOF');
    return o.join('\r\n') + '\r\n';
  };
  HX.dxfBytes = function (s) { var u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u; };
})(typeof window !== 'undefined' ? window : globalThis);
