/* HarnessCAD - VISTAS no padrão das pranchas da casa (modelos de traço): as vistas frontais ficam numa faixa abaixo do
   desenho do chicote, cada uma sob o seu conector, com a legenda "VISTA A", "VISTA B"...; no conector, uma seta com a
   mesma letra aponta para a face (sentido de quem olha a face). Sem o título "DESENHO FÍSICO DA CABLAGEM" no topo
   (a escala já está no carimbo). Vista: letter = letra própria (vazio = ordem na folha). */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, D2R = Math.PI / 180; if (!EXT.pface || !HX.physAnnotate) return;
  function casa(sh) { return !!sh && (sh.pstyle === 'line' || sh.pstyle === 'outline') && sh.viewStyle !== 'antigo'; }
  HX.physViewLetter = function (sh, it) { if (it.letter) return String(it.letter); var L = sh.items.filter(function (i) { return i.type === 'pface'; }); return String.fromCharCode(65 + Math.max(0, L.indexOf(it))); };
  /* faixa das vistas abaixo do desenho e tabela de ligação depois dela (só na folha nova: ajustes do usuário ficam) */
  HX.physViewsBand = function (p, sh) {
    var m = HX.physIdx(sh), S = HX.physSchem(p), ys = sh.items.filter(function (i) { return i.type === 'pnode'; }).map(function (n) { return n.y; }), y1 = Math.max.apply(0, ys.concat([0]));
    var d = HX.sheetDims(p.meta), M = HX.frameMargins(p), top = y1 + 24, hMax = 0, nop = function () {}, G0 = { style: nop, rect: nop, line: nop, poly: nop, circle: nop, text: nop, push: nop, pop: nop, image: function () { return false; } };
    sh.items.forEach(function (a) { var n = m[a.of], c = n && S[n.of]; if (a.type !== 'pface' || !c) return; a.w = 24;
      var b = HX.physLineFace(G0, c, 0, 0, a.w, '#000', true, +a.esc || (HX.physFaceK ? HX.physFaceK(c) : 1)) || { y0: -12, y1: 12 }, h = b.y1 - b.y0;
      a.x = 0; a.y = HX.r3(top - b.y0 - n.y); hMax = Math.max(hMax, h); }); /* topo de todas as vistas na mesma linha */
    sh.items.forEach(function (a) { if (a.type === 'ptable' && (a.kind || 'wiring') === 'wiring') a.y = HX.r3(Math.min(top + hMax + 14, d[1] - M.b - 75)); });
  };
  var ap0 = HX.applyPhysical;
  HX.applyPhysical = function (doc, opt) {
    var had = doc.p.sheets.some(HX.isPhys), r = ap0.apply(this, arguments), sh = r && r.index != null && doc.p.sheets[r.index];
    if (sh && casa(sh)) {
      sh.items = sh.items.filter(function (i) { return !(i.type === 'text' && /^DESENHO FÍSICO DA CABLAGEM|^Cotas em mm \(comprimento real\)/.test(i.text || '')); });
      if (!had) { HX.physViewsBand(doc.p, sh); sh.segInfo = false; } /* ramos sem o nº de fios e o diâmetro, como nas pranchas */
    }
    return r;
  };
  function arrow(g, x, y, ux, uy, col) { var a = 1.8, w = 0.5; g.style({ fill: col, stroke: col }); g.poly([[x, y], [x - ux * a - uy * w, y - uy * a + ux * w], [x - ux * a + uy * w, y - uy * a - ux * w]], true); g.style({ fill: null }); }
  var fd0 = EXT.pface.draw;
  EXT.pface.draw = function (g, it, p, s, o) {
    fd0.apply(this, arguments);
    var C = HX.physCtx(p, s, o); if (!casa(C.sh) || !it._bb) return;
    var nd = C.m[it.of], col = C.line ? C.col : (o.theme && o.theme.txt) || '#222', L = HX.physViewLetter(C.sh, it), b = it._bb;
    g.text('VISTA ' + L, (b.x0 + b.x1) / 2, b.y1 + 3.2, { size: 2.4, align: 'c', color: col });
    HX.physHide(it, '_bb', { x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 + 4.6 });
    var nb = nd && nd._bb; if (!nb || nd.nkind !== 'conn') return;
    var a = HX.physAngle(nd, C.sh.items) * D2R, ux = Math.cos(a), uy = Math.sin(a), cx = (nb.x0 + nb.x1) / 2, cy = (nb.y0 + nb.y1) / 2;
    var hx = ((nb.x1 - nb.x0) * Math.abs(ux) + (nb.y1 - nb.y0) * Math.abs(uy)) / 2, fx = cx - ux * (hx + 1), fy = cy - uy * (hx + 1); /* face = lado oposto à saída do cabo */
    g.style({ stroke: col, lw: 0.22, dash: null }); g.line(fx - ux * 9, fy - uy * 9, fx, fy); arrow(g, fx, fy, ux, uy, col);
    g.text(L, fx - ux * 11.2, fy - uy * 11.2 + 0.1, { size: 2.6, align: 'c', color: col });
  };
})(typeof window !== 'undefined' ? window : globalThis);
