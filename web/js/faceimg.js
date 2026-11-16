/* HarnessCAD - imagens da vista frontal recortadas do datasheet (sem redesenho: pixel a pixel como no catálogo).
   Oficiais: web/img/face/<família>/<arranjo>.png. Do usuário: biblioteca compartilhada, chave 'USR:FACE:<part>'
   (imagem colada/aberta pelo usuário, guardada sem recompressão). A do usuário tem prioridade sobre a oficial. */
(function (G) {
  'use strict';
  var HX = G.HX;
  var SRC = {
    A: 'Amphenol Aerospace, catálogo MIL-DTL-38999 Séries I LJT / II JT / III TV, "Insert Arrangements"',
    G: 'Glenair, catálogo MIL-DTL-38999 (herméticos), "Insert Arrangements (IAW MIL-STD-1560)"'
  };
  var NOTE = { A: 'face frontal do inserto de pinos (nota do catálogo: "Front face of pin inserts illustrated")', G: 'face do inserto (o catálogo não indica a face nesta página)' };
  var PGL = { G26: 'B-2', G27: 'B-3' };
  // arranjo: fonte+página do PDF : largura x altura (px)
  var D38999 = '9-35:A8:96x97 9-98:A8:94x93 11-2:A8:126x125 11-4:A8:162x161 11-5:A8:154x154 11-35:A8:152x152 11-98:A8:153x154 ' +
    '11-99:A8:151x150 13-4:A8:160x161 13-8:A8:160x160 13-35:A8:160x160 13-98:A8:160x160 15-5:A8:192x191 15-15:A8:185x185 15-18:A8:188x187 ' +
    '15-19:A8:192x191 15-35:A8:201x201 15-97:A8:193x193 17-6:A9:217x218 17-8:A9:218x218 17-26:A9:220x221 17-35:A9:219x219 17-99:A9:262x261 ' +
    '19-11:A9:278x278 19-28:A9:304x304 19-30:A9:292x292 19-32:A9:309x309 19-35:A9:310x310 19-45:G26:287x288 21-11:A10:277x277 21-16:A10:260x260 ' +
    '21-24:G27:272x271 21-25:A10:281x281 21-27:A10:313x314 21-35:A10:275x275 21-39:A10:277x277 21-41:A10:290x290 23-21:A11:299x299 23-32:A11:287x287 ' +
    '23-34:A11:333x333 23-35:A11:332x331 23-36:G27:299x299 23-53:A11:342x341 23-55:A11:356x356 23-97:A11:399x399 23-99:A11:399x399 25-4:A12:384x383 ' +
    '25-19:A12:420x420 25-24:A12:418x419 25-29:A12:420x420 25-35:A12:312x312 25-43:A13:435x435 25-61:A13:397x397';
  HX.FACE_IMG = {};
  D38999.split(' ').forEach(function (t) {
    var a = t.split(':'), s = a[1][0], pg = +a[1].slice(1), wh = a[2].split('x');
    HX.FACE_IMG['D38999:' + a[0]] = { pin: { url: 'img/face/D38999/' + a[0] + '.png', w: +wh[0], h: +wh[1], view: 'pin',
      src: SRC[s] + ', pág. ' + (PGL[a[1]] || pg - 1) + ' (pág. ' + pg + ' do PDF)', note: NOTE[s] } };
  });
  HX.FACE_USER = {};
  var VIEW = { pin: 'face frontal do inserto de pinos', socket: 'face frontal do inserto de soquetes' };
  HX.faceViewTxt = function (im) { return im.note || VIEW[im.view] || ''; };
  // imagem a usar: do usuário (se houver) ou oficial; gênero do conector escolhe a face, senão a única que o datasheet traz
  HX.faceImgFor = function (part, gender) {
    var e = HX.FACE_USER[part] || HX.FACE_IMG[part]; if (!e) return null;
    var want = gender === 'P' ? 'pin' : 'socket';
    return e[want] || e.pin || e.socket || null;
  };
  // carrega o elemento <img> uma vez (redesenha ao chegar)
  HX.imgEl = function (im) {
    if (!im || typeof G.Image === 'undefined') return null;
    var src = im.data || (G.HX_IMG && G.HX_IMG[im.url]) || im.url;
    if (!im._el || (im._el._src !== src && src.slice(0, 5) === 'data:')) { // imagem embutida chegou depois: troca
      var el = new G.Image();
      el.onload = function () { if (HX.onImgLoad) HX.onImgLoad(); };
      el.src = src; el._src = src;
      Object.defineProperty(im, '_el', { value: el, writable: true, configurable: true, enumerable: false });
      Object.defineProperty(im, '_px', { value: null, writable: true, configurable: true, enumerable: false });
    }
    return im._el;
  };
  HX.imgReady = function (el) { return !!(el && el.complete && el.naturalWidth); };
  // tela: desenha sem filtro de cor nem recorte (só a escala do zoom)
  if (HX.CanvasG) HX.CanvasG.prototype.image = function (im, x, y, w, h) {
    var el = HX.imgEl(im); if (!HX.imgReady(el)) return false;
    var c = this.c; c.save(); c.imageSmoothingEnabled = true; if ('imageSmoothingQuality' in c) c.imageSmoothingQuality = 'high';
    c.drawImage(el, x, y, w, h); c.restore(); return true;
  };
  // PDF: pixels do tamanho natural da imagem (sem reamostrar). Tons de cinza → 1 byte/pixel; fundo transparente → branco
  HX.imgPixels = function (im) {
    if (!im) return null; if (im._px) return im._px;
    var el = HX.imgEl(im); if (!HX.imgReady(el) || !G.document) { if (HX.imgMiss) HX.imgMiss.push((im.url || im.name || im.id || 'imagem') + ' (não carregada)'); return null; }
    var w = el.naturalWidth, h = el.naturalHeight, cv = G.document.createElement('canvas'); cv.width = w; cv.height = h;
    var ctx = cv.getContext('2d'), d; ctx.drawImage(el, 0, 0);
    try { d = ctx.getImageData(0, 0, w, h).data; } catch (e) { HX.imgBlocked = true; if (HX.imgMiss) HX.imgMiss.push((im.url || 'imagem') + ' (bloqueada)'); return null; } // arquivo local sem imagens embutidas
    var gray = true, i, a = [], al = false, m = [];
    for (i = 3; i < d.length && !al; i += 4) al = d[i] < 250; // tem transparência → /SMask no PDF
    for (i = 0; i < d.length; i += 4) if (!d[i + 3] || !al && d[i + 3] < 255) { var f = d[i + 3] / 255; d[i] = d[i] * f + 255 * (1 - f); d[i + 1] = d[i + 1] * f + 255 * (1 - f); d[i + 2] = d[i + 2] * f + 255 * (1 - f); }
    for (i = 0; i < d.length && gray; i += 4) gray = d[i] === d[i + 1] && d[i] === d[i + 2];
    for (i = 0; i < d.length; i += 4) { a.push(String.fromCharCode(d[i])); if (!gray) a.push(String.fromCharCode(d[i + 1]), String.fromCharCode(d[i + 2])); if (al) m.push(String.fromCharCode(d[i + 3])); }
    var px = { w: w, h: h, gray: gray, bytes: a.join(''), mask: al ? m.join('') : null };
    Object.defineProperty(im, '_px', { value: px, writable: true, configurable: true, enumerable: false });
    return px;
  };
  // biblioteca compartilhada: só aceita PNG/JPEG em data URL
  var RX = /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/;
  function str(v, n) { return String(v == null ? '' : v).slice(0, n); }
  HX.sanitizeFaceImg = function (v, view) {
    if (!v || typeof v.data !== 'string' || v.data.length > 6e6 || !RX.test(v.data)) return null;
    var w = Math.round(+v.w), h = Math.round(+v.h); if (!(w > 0 && h > 0 && w < 20000 && h < 20000)) return null;
    return { data: v.data, w: w, h: h, view: view, src: str(v.src, 200), note: str(v.note, 160) };
  };
  HX.sanitizeFaces = function (lib) {
    var out = {}; if (!lib || typeof lib !== 'object') return out;
    Object.keys(lib).forEach(function (k) {
      var e = lib[k]; if (!e || !/^USR:FACE:/.test(k) || e.key !== k) return;
      var pin = HX.sanitizeFaceImg(e.pin, 'pin'), soc = HX.sanitizeFaceImg(e.socket, 'socket'); if (!pin && !soc) return;
      var o = {}; if (pin) o.pin = pin; if (soc) o.socket = soc; out[k.slice(9)] = o;
    });
    return out;
  };
  HX.onLibLoad = function (lib) { HX.FACE_USER = HX.sanitizeFaces(lib); if (HX.sanitizePhysImgs) HX.PHYS_USER = HX.sanitizePhysImgs(lib); };
  HX.faceEntry = function (part, imgs) { var e = { key: 'USR:FACE:' + part }; if (imgs.pin) e.pin = imgs.pin; if (imgs.socket) e.socket = imgs.socket; return e; };
  // pré-carrega as imagens oficiais (o PDF só usa imagem já decodificada)
  HX.imgPreload = function () { [HX.FACE_IMG, HX.PDS_IMG, HX.PSPR].forEach(function (L) { Object.keys(L || {}).forEach(function (k) { var o = L[k]; if (o && o.url) HX.imgEl(o); else if (o) Object.keys(o).forEach(function (v) { if (o[v] && o[v].url) HX.imgEl(o[v]); }); }); }); };
  if (G.addEventListener && G.document) G.addEventListener('load', function () { setTimeout(HX.imgPreload, 300); });
})(typeof window !== 'undefined' ? window : globalThis);
