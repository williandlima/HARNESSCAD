/* HarnessCAD - vista frontal do conector: a IMAGEM DO DATASHEET, sem redesenho nem marcação sobre ela
   (faceimg.js). Ao lado, a tabela de pinagem (pino, sinal, fio, bitola, cor). Sem imagem cadastrada:
   aviso + tabela. A imagem não é espelhada nem trocada de gênero: aparece a face que o datasheet traz. */
(function (G) {
  'use strict';
  var HX = G.HX;

  HX.makeFace = function (doc, c, x, y) {
    var d = Math.round(Math.max(40, Math.min(70, 30 + Math.sqrt(c.pins.length) * 3))); // inserto denso = imagem maior
    return { type: 'face', id: doc.uid('v'), of: c.id, part: c.part, x: x, y: y, d: d, table: true };
  };
  function connOf(p, it) {
    var r = { c: null, s: 0 };
    p.sheets.forEach(function (sh, si) { sh.items.forEach(function (x) { if (x.id === it.of) { r.c = x; r.s = si; } }); });
    return r;
  }
  // imagem e tamanho na folha (largura = d mm, altura pela proporção da imagem)
  HX.faceImgBox = function (it, p) {
    var c = p ? connOf(p, it).c : null, im = HX.faceImgFor(it.part || (c && c.part), c ? c.gender : 'P');
    var w = Math.max(10, +it.d || 40), h = im ? w * im.h / im.w : 14;
    return { im: im, w: w, h: h, x0: it.x - w / 2, y0: it.y - h / 2 };
  };
  HX.faceBBox = function (it, p) {
    var B = HX.faceImgBox(it, p || it._p), t = it._tb;
    var b = { x0: B.x0, y0: B.y0, x1: B.x0 + B.w, y1: B.y0 + B.h + 8.5 };
    if (t && it.table !== false) { b.x1 = B.x0 + B.w + 3 + t[0]; b.y1 = Math.max(b.y1, B.y0 + t[1]); }
    return b;
  };
  // tabela de pinagem ao lado da vista: pino, sinal, fio, bitola, cor (pinos com fio ou com nome)
  var TC = [['Pino', 7], ['Sinal', 17], ['Fio', 9], ['Bitola', 11], ['Cor', 10]];
  function pinTable(g, it, c, cs, p, o, x0, y0) {
    var nl = o.nl || HX.buildNetlist(p), rows = [], free = 0, T = o.theme, rh = 3, fs = 1.6;
    HX.connLayout(c, p.unit).pins.forEach(function (pn) {
      var nd = nl.nodes[cs + '|' + HX.key(pn.pt[0], pn.pt[1])], w = nd && nd.wireEnds[0] && nd.wireEnds[0].w;
      if (!w && !pn.pin.name) { free++; return; }
      rows.push([pn.n, pn.pin.name || '', w ? w.num || '' : '', w ? HX.gaugeLabel(w) : '', w ? w.color || '' : '']);
    });
    var W = TC.reduce(function (a, c2) { return a + c2[1]; }, 0), H = (rows.length + 1) * rh + (free ? rh : 0);
    Object.defineProperty(it, '_tb', { value: [W, H + 2], writable: true, configurable: true, enumerable: false });
    g.style({ stroke: T.body, lw: 0.2, fill: o.mono ? null : '#f3efd6', dash: null }); g.rect(x0, y0, W, rh);
    g.style({ fill: null }); g.rect(x0, y0, W, (rows.length + 1) * rh);
    var x = x0; TC.forEach(function (c2) { g.text(c2[0], x + 0.8, y0 + rh / 2, { size: fs, bold: true, color: T.txt }); x += c2[1]; });
    rows.forEach(function (r, i) {
      var y = y0 + (i + 1.5) * rh; g.style({ stroke: '#bbb', lw: 0.1 }); g.line(x0, y0 + (i + 1) * rh, x0 + W, y0 + (i + 1) * rh);
      var xx = x0; r.forEach(function (v, j) { var t2 = String(v); while (t2.length > 1 && HX.textW(t2, fs) > TC[j][1] - 1.4) t2 = t2.slice(0, -1); g.text(t2, xx + 0.8, y, { size: fs, bold: j === 0, color: j === 0 ? T.pinTxt : T.txt }); xx += TC[j][1]; });
    });
    if (free) g.text(free + ' pino(s) livre(s)', x0, y0 + (rows.length + 1.6) * rh, { size: 1.4, color: T.txt });
  }
  HX.facePinTable = pinTable;
  function cut(s, size, w) { s = String(s); if (HX.textW(s, size) <= w) return [s]; var a = [], cur = ''; s.split(' ').forEach(function (t) { var n = cur ? cur + ' ' + t : t; if (cur && HX.textW(n, size) > w) { a.push(cur); cur = t; } else cur = n; }); a.push(cur); return a; }

  HX.drawFace = function (g, it, p, s, o) {
    var T = o.theme, r = connOf(p, it), c = r.c, B = HX.faceImgBox(it, p), im = B.im;
    Object.defineProperty(it, '_p', { value: p, writable: true, configurable: true, enumerable: false });
    var drawn = im && g.image ? g.image(im, B.x0, B.y0, B.w, B.h) : false;
    if (!drawn) { // sem imagem (ou ainda carregando): só a moldura com o aviso, nada inventado
      g.style({ stroke: T.body, lw: 0.2, fill: null, dash: [1, 0.8] }); g.rect(B.x0, B.y0, B.w, B.h); g.style({ dash: null });
      g.text(im ? 'carregando imagem do datasheet…' : 'sem imagem do datasheet', it.x, it.y - (im ? 0 : 1.2), { size: 1.6, align: 'c', color: T.txt });
      if (!im) g.text('Biblioteca › Imagem do datasheet…', it.x, it.y + 1.6, { size: 1.2, align: 'c', color: T.txt });
    }
    var by = B.y0 + B.h + 2;
    g.text('VISTA FRONTAL ' + (c ? c.ref : '?') + (c ? (c.gender === 'P' ? ' — conector de pinos' : ' — conector de soquetes') : ''), it.x, by, { size: 1.6, align: 'c', bold: true, color: T.txt });
    if (im) {
      var ln = [('Imagem do datasheet: ' + HX.faceViewTxt(im))].concat(im.src ? cut('Fonte: ' + im.src, 1.1, Math.max(B.w, 60)) : []);
      ln.forEach(function (t, i) { g.text(t, it.x, by + 1.9 + i * 1.5, { size: 1.1, align: 'c', color: T.txt }); });
    }
    if (c && it.table !== false) pinTable(g, it, c, r.s, p, o, B.x0 + B.w + 3, B.y0);
  };
})(typeof window !== 'undefined' ? window : globalThis);
