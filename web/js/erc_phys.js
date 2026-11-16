/* HarnessCAD - ERC: regras do desenho físico — fio não roteado pelos ramos, ramo sem fios e raio de curvatura
   mínimo (k × Ø do feixe, k = p.erc.bendK, padrão 6; raio medido na curva do ramo × escala da folha). */
(function (G) {
  'use strict';
  var HX = G.HX;
  function bendRadius(P) { // menor raio da curva amostrada (mm de papel)
    var m = Infinity;
    for (var i = 1; i < P.length - 1; i++) {
      var a = P[i - 1], b = P[i], c = P[i + 1], ab = Math.hypot(b[0] - a[0], b[1] - a[1]), bc = Math.hypot(c[0] - b[0], c[1] - b[1]), ca = Math.hypot(a[0] - c[0], a[1] - c[1]);
      var ar = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) / 2; if (ar > 1e-9) m = Math.min(m, ab * bc * ca / (4 * ar));
    }
    return m;
  }
  HX.physBendRadius = bendRadius;
  HX.ercPhys = function (p, nl, add) {
    var ph = p.sheets.filter(function (sh) { return HX.isPhys && HX.isPhys(sh); })[0];
    if (ph && HX.physBundle) {
      var si = p.sheets.indexOf(ph), B = HX.physBundle(p, ph), m = HX.physIdx(ph), N = +ph.scale || 1, k = +HX.ercCfg(p).bendK || 6;
      B.orphan.forEach(function (w) { add('orphan', 'aviso', 'Fio ' + (w.num || '') + ' não roteado pelo desenho físico', si, w.id); });
      ph.items.forEach(function (sg) {
        if (sg.type !== 'pseg') return; var b = B.seg[sg.id];
        if (b && !b.wires.length) add('emptyBundle', 'aviso', 'Ramo ' + ((m[sg.a] || {}).ref || '') + '–' + ((m[sg.b] || {}).ref || '') + ' sem fios', si, sg.id);
        if ((+sg.x || +sg.y || (sg.bends && sg.bends.length)) && b && b.od) { var P = HX.physSegPts(sg, m), r = bendRadius(P) * N; if (r < k * b.od) add('bend', 'aviso', 'Ramo ' + ((m[sg.a] || {}).ref || '') + '–' + ((m[sg.b] || {}).ref || '') + ': raio ≈ ' + Math.round(r) + ' mm < ' + k + '×Ø (' + Math.round(k * b.od) + ' mm)', si, sg.id); }
      });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
