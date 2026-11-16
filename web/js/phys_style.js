/* HarnessCAD - desenho físico: CUSTOMIZAÇÃO VISUAL e CAMADAS.
   Por item: sCol (cor das linhas e textos), sLw (espessura × fator), sFs (texto × fator); rótulo, vista frontal e
   textos aceitam rot (graus, em torno do centro). Por folha: layers = { cotas: false, ... } esconde a camada (não
   desenha, não imprime, não seleciona). Tudo por um "pincel" que troca cor/espessura/tamanho na hora de desenhar. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT;
  HX.PHYS_LAYERS = { cotas: ['Cotas', ['pdim', 'pdimx', 'pang']], notas: ['Rótulos e notas', ['pnote', 'pflag']], baloes: ['Balões', ['pball']],
    tabelas: ['Tabelas', ['ptable']], acess: ['Acessórios e etiquetas', ['pacc', 'ptag']], vistas: ['Vistas frontais e detalhes', ['pface', 'pdetail', 'pprep']],
    imagens: ['Imagens soltas', ['pimg']], cober: ['Coberturas parciais', ['pcov']] };
  HX.physHiddenTypes = function (sh) {
    var L = (sh && sh.layers) || {}, out = {};
    Object.keys(HX.PHYS_LAYERS).forEach(function (k) { if (L[k] === false) HX.PHYS_LAYERS[k][1].forEach(function (t) { out[t] = 1; }); });
    return out;
  };
  function pen(g, it) { // g com a cor/espessura/tamanho do item
    var col = it.sCol, kw = +it.sLw || 1, kf = +it.sFs || 1; if (!col && kw === 1 && kf === 1) return g;
    var q = Object.create(g);
    q.style = function (s) {
      var t = {}; for (var a in s) t[a] = s[a];
      if (col && t.stroke && !/^#?f{3,6}$/i.test(t.stroke.replace('#', '')) && t.stroke !== '#fff') t.stroke = col;
      if (col && t.fill && t.fill === s.stroke) t.fill = col;
      if (t.lw != null) t.lw = t.lw * kw; return g.style.call(this, t);
    };
    q.text = function (s, x, y, o) { var t = {}; o = o || {}; for (var a in o) t[a] = o[a]; if (col) t.color = col; t.size = (o.size || 2.5) * kf; return g.text.call(this, s, x, y, t); };
    return q;
  }
  var ROTC = { pnote: 1, pface: 1 };
  function wrap(type) {
    var E = EXT[type]; if (!E || E._styled) return; var d0 = E.draw;
    E.draw = function (g, it, p, s, o) {
      var g2 = pen(g, it), r = +it.rot || 0, b = it._bb;
      if (ROTC[type] && r && b) { var cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, a = r * Math.PI / 180, c = Math.cos(a), n = Math.sin(a); g.push([c, n, -n, c, cx - c * cx + n * cy, cy - n * cx - c * cy]); }
      try { return d0.call(this, g2, it, p, s, o); } finally {
        if (ROTC[type] && r && b) { g.pop(); var B = it._bb; if (B) { var R = Math.max(B.x1 - B.x0, B.y1 - B.y0) / 2, X = (B.x0 + B.x1) / 2, Y = (B.y0 + B.y1) / 2; HX.physHide(it, '_bbR', { x0: X - R, y0: Y - R, x1: X + R, y1: Y + R }); } }
      }
    };
    E._styled = true;
  }
  HX.physStyleWrap = function (L) { (L || ['pseg', 'pnode', 'pdim', 'pnote', 'pball', 'pface', 'ptable', 'pcov', 'pimg', 'pacc', 'ptag', 'pflag', 'pdetail', 'pang', 'pprep']).forEach(wrap); };
  HX.physStyleWrap();
  // camadas escondidas: fora do desenho, da impressão e da seleção
  var dr = HX.drawSheetItems;
  HX.drawSheetItems = function (g, p, s, o) {
    var sh = p.sheets[s]; if (!sh || !HX.isPhys(sh)) return dr(g, p, s, o);
    var H = HX.physHiddenTypes(sh); if (!o._inDetail) HX._layerHide = H; if (!Object.keys(H).length) return dr(g, p, s, o);
    var items = sh.items; sh.items = items.filter(function (i) { return !H[i.type]; });
    try { return dr(g, p, s, o); } finally { sh.items = items; }
  };
  var hd = HX.hitDist;
  HX.hitDist = function (it, pt, unit) { if (HX._layerHide && HX._layerHide[it.type]) return 1e9; return hd(it, pt, unit); };
})(typeof window !== 'undefined' ? window : globalThis);
