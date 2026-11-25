/* HarnessCAD - gerador de PDF vetorial próprio (sem bibliotecas externas) */
(function (G) {
  'use strict';
  var HX = G.HX;
  // Larguras Helvetica (AFM) caracteres 32..126
  var HW = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556,
    278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611,
    722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
    556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
  HX.pdfTextWidth = function (s, size, bold) {
    var w = 0; s = String(s);
    for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); w += (c >= 32 && c <= 126) ? HW[c - 32] : 556; }
    return w * size / 1000 * (bold ? 1.07 : 1);
  };
  var MAP = { '…': 0x85, '—': 0x97, '–': 0x96, '•': 0x95, '€': 0x80, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94 };
  var SUB = { '→': '->', '←': '<-', 'Ω': 'Ohm', '≥': '>=', '≤': '<=', 'Ø': 'Ø' };
  function enc(s) {
    var o = '';
    String(s).split('').forEach(function (ch) {
      if (SUB[ch]) ch = SUB[ch];
      for (var i = 0; i < ch.length; i++) {
        var c = ch.charCodeAt(i), b = MAP[ch[i]] || (c < 256 ? c : 63);
        var x = String.fromCharCode(b);
        o += (x === '(' || x === ')' || x === '\\') ? '\\' + x : x;
      }
    });
    return o;
  }
  function n(v) { var s = (+v).toFixed(3); return s.indexOf('.') >= 0 ? s.replace(/\.?0+$/, '') : s; }
  function rgb(h) {
    h = String(h || '#000').replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    var v = parseInt(h, 16); return n(((v >> 16) & 255) / 255) + ' ' + n(((v >> 8) & 255) / 255) + ' ' + n((v & 255) / 255);
  }

  // Backend de desenho para uma página (coordenadas em mm, y para baixo)
  function Page(wmm, hmm) {
    this.w = wmm; this.h = hmm; this.k = 72 / 25.4;
    this.ops = [n(this.k) + ' 0 0 ' + n(-this.k) + ' 0 ' + n(hmm * this.k) + ' cm', '1 J 1 j'];
    this.st = { stroke: '#000', lw: 0.25, fill: null, dash: null };
  }
  HX.PdfPage = Page;
  var P = Page.prototype;
  P.style = function (s) { for (var k in s) this.st[k] = s[k]; };
  P._apply = function () {
    var s = this.st;
    this.ops.push(n(s.lw) + ' w ' + (s.stroke ? rgb(s.stroke) + ' RG ' : '') + (s.fill ? rgb(s.fill) + ' rg ' : '') +
      (s.dash ? '[' + s.dash.map(n).join(' ') + '] 0 d' : '[] 0 d'));
  };
  P._paint = function (closed) {
    var s = this.st;
    this.ops.push(s.fill && s.stroke ? (closed ? 'b' : 'B') : s.fill ? 'f' : s.stroke ? (closed ? 's' : 'S') : 'n');
  };
  P.line = function (x1, y1, x2, y2) {
    if (!this.st.stroke) return; this._apply();
    this.ops.push(n(x1) + ' ' + n(y1) + ' m ' + n(x2) + ' ' + n(y2) + ' l S');
  };
  P.poly = function (pts, closed) {
    if (!pts.length) return; this._apply();
    var o = n(pts[0][0]) + ' ' + n(pts[0][1]) + ' m';
    for (var i = 1; i < pts.length; i++) o += ' ' + n(pts[i][0]) + ' ' + n(pts[i][1]) + ' l';
    this.ops.push(o); this._paint(closed);
  };
  P.rect = function (x, y, w, h) { this._apply(); this.ops.push(n(x) + ' ' + n(y) + ' ' + n(w) + ' ' + n(h) + ' re'); this._paint(true); };
  P.circle = function (x, y, r) {
    var c = 0.5523 * r; this._apply();
    this.ops.push(n(x + r) + ' ' + n(y) + ' m ' +
      [[x + r, y + c, x + c, y + r, x, y + r], [x - c, y + r, x - r, y + c, x - r, y], [x - r, y - c, x - c, y - r, x, y - r], [x + c, y - r, x + r, y - c, x + r, y]]
        .map(function (b) { return b.map(n).join(' ') + ' c'; }).join(' '));
    this._paint(true);
  };
  P.text = function (s, x, y, o) {
    o = o || {}; s = String(s); if (!s) return;
    var size = o.size || 2.5, w = HX.pdfTextWidth(s, size, o.bold);
    var dx = o.align === 'c' ? -w / 2 : o.align === 'r' ? -w : 0, dy = o.va === 'b' ? 0 : size * 0.36;
    this.ops.push('BT ' + rgb(o.color || '#000') + ' rg /F' + ((o.bold ? 2 : 1) + (o.italic ? 2 : 0)) + ' ' + n(size) + ' Tf 1 0 0 -1 ' + n(x + dx) + ' ' + n(y + dy) + ' Tm (' + enc(s) + ') Tj ET');
  };
  P.push = function (m) { this.ops.push('q ' + m.map(n).join(' ') + ' cm'); };
  // imagem raster do datasheet: pixels exatos (sem recompressão), lidos do <img> carregado no navegador
  P.image = function (im, x, y, w, h) {
    var px = HX.imgPixels && HX.imgPixels(im); if (!px) return false;
    this.imgs = this.imgs || []; var i = this.imgs.indexOf(px); if (i < 0) { this.imgs.push(px); i = this.imgs.length - 1; }
    this.ops.push('q ' + [w, 0, 0, -h, x, y + h].map(n).join(' ') + ' cm /Im' + (i + 1) + ' Do Q'); return true;
  };
  P.pop = function () { this.ops.push('Q'); };

  // Documento PDF
  function Pdf(info) { this.pages = []; this.info = info || {}; }
  HX.Pdf = Pdf;
  Pdf.prototype.addPage = function (wmm, hmm) { var p = new Page(wmm, hmm); this.pages.push(p); return p; };
  Pdf.prototype.build = function () {
    var objs = [], k = 72 / 25.4;
    objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    objs[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
    objs[5] = '<< /Title (' + enc(this.info.title || '') + ') /Author (' + enc(this.info.author || '') + ') /Producer (HarnessCAD ' + HX.VERSION + ') >>';
    objs[6] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>';
    objs[7] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-BoldOblique /Encoding /WinAnsiEncoding >>';
    var kids = [], id = 8;
    this.pages.forEach(function (pg) {
      var content = pg.ops.join('\n');
      objs[id + 1] = '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream';
      var nx = id + 2, xo = (pg.imgs || []).map(function (px, i) { // fundo transparente: /SMask (alfa)
        var oid = nx++, sm = ''; if (px.mask) { var mid = nx++; objs[mid] = '<< /Type /XObject /Subtype /Image /Width ' + px.w + ' /Height ' + px.h + ' /ColorSpace /DeviceGray /BitsPerComponent 8 /Length ' + px.mask.length + ' >>\nstream\n' + px.mask + '\nendstream'; sm = ' /SMask ' + mid + ' 0 R'; }
        objs[oid] = '<< /Type /XObject /Subtype /Image /Width ' + px.w + ' /Height ' + px.h + ' /ColorSpace /Device' + (px.gray ? 'Gray' : 'RGB') +
          ' /BitsPerComponent 8' + sm + ' /Length ' + px.bytes.length + ' >>\nstream\n' + px.bytes + '\nendstream';
        return '/Im' + (i + 1) + ' ' + oid + ' 0 R';
      });
      objs[id] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + n(pg.w * k) + ' ' + n(pg.h * k) + '] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 6 0 R /F4 7 0 R >>' + (xo.length ? ' /XObject << ' + xo.join(' ') + ' >>' : '') + ' >> /Contents ' + (id + 1) + ' 0 R >>';
      kids.push(id + ' 0 R'); id = nx;
    });
    objs[2] = '<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + kids.length + ' >>';
    var out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n', offs = [];
    for (var i = 1; i < objs.length; i++) { offs[i] = out.length; out += i + ' 0 obj\n' + objs[i] + '\nendobj\n'; }
    var xref = out.length;
    out += 'xref\n0 ' + objs.length + '\n0000000000 65535 f \n';
    for (var j = 1; j < objs.length; j++) out += ('0000000000' + offs[j]).slice(-10) + ' 00000 n \n';
    out += 'trailer\n<< /Size ' + objs.length + ' /Root 1 0 R /Info 5 0 R >>\nstartxref\n' + xref + '\n%%EOF';
    var b = new Uint8Array(out.length);
    for (var q = 0; q < out.length; q++) b[q] = out.charCodeAt(q) & 255;
    return b;
  };
})(typeof window !== 'undefined' ? window : globalThis);
