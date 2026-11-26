/* HarnessCAD - ESQUEMA MAIS LIMPO (v1.9.12):
   - pino livre SEM a bolinha de ponta solta por padrão (liga em Exibir › Marcar pinos livres: p.view.openPins);
   - NÚMERO DOS FIOS NA IMPRESSÃO: a tela fica limpa (fio novo sem identificação) e o PDF/DXF sai com o nº de cada fio
     quando p.view.printWireNums (Exibir › Número dos fios na impressão);
   - conector novo declarado na lista de fiação ("J4 = PEÇA") é posto num LUGAR LIVRE DENTRO DA ÁREA ÚTIL da folha
     (nunca sobre o carimbo/moldura nem em cima de outro item). */
(function (G) {
  'use strict';
  var HX = G.HX;
  var dsi = HX.drawSheetItems;
  if (dsi) HX.drawSheetItems = function (g, p, s, o) { var sh = p.sheets[s];
    if (o && o.connected && sh && !HX.isPhys(sh) && !(p.view && p.view.openPins)) { o = Object.assign({}, o, { connected: null }); }
    return dsi.call(this, g, p, s, o); };
  var wlo = HX.wireLblOpts;
  if (wlo) HX.wireLblOpts = function (w) { var r = wlo.apply(this, arguments); if (HX._printWN && r && r.lblPos === 'n') { r = Object.assign({}, r, { lblPos: 'a' }); } return r; };
  function printing(f) { return function (p) { var on = !!(p && p.view && p.view.printWireNums), old = HX._printWN; HX._printWN = on; try { return f.apply(this, arguments); } finally { HX._printWN = old; } }; }
  if (HX.exportPDF) HX.exportPDF = printing(HX.exportPDF);
  if (HX.exportDXF) HX.exportDXF = printing(HX.exportDXF);
  /* lugar livre para um conector novo: dentro da área útil, longe dos outros itens, de preferência à direita dos existentes */
  HX.placeFree = function (doc, it) { var u = doc.p.unit || 2.5, g = Math.max(u, 2.5), A = HX.usableArea ? HX.usableArea(doc.p) : { x0: 20, y0: 20, x1: 400, y1: 270 };
    var B = doc.cur().items.filter(function (i) { return i !== it && i.type !== 'wire'; }).map(function (i) { try { return HX.bbox(i, u); } catch (e) { return null; } }).filter(Boolean);
    it.x = 0; it.y = 0; var b0 = HX.bbox(it, u), w = b0.x1 - b0.x0, h = b0.y1 - b0.y0, M = 8;
    var rx = B.length ? Math.max.apply(0, B.map(function (b) { return b.x1; })) + 40 : A.x0 + 20, ry = B.length ? Math.min.apply(0, B.map(function (b) { return b.y0; })) : A.y0 + 20, best = null, bd = 1e18;
    for (var y = A.y0 + 4; y + h <= A.y1 - 4; y += 5 * g) for (var x = A.x0 + 4; x + w <= A.x1 - 4; x += 5 * g) {
      var r = { x0: x, y0: y, x1: x + w, y1: y + h }; if (B.some(function (b) { return r.x0 < b.x1 + M && b.x0 < r.x1 + M && r.y0 < b.y1 + M && b.y0 < r.y1 + M; })) continue;
      var d = Math.abs(x - rx) + Math.abs(y - ry) * 0.7; if (d < bd) { bd = d; best = [x, y]; } }
    if (!best) best = [A.x0 + 4, A.y0 + 4];
    it.x = HX.snap(best[0] - b0.x0, g); it.y = HX.snap(best[1] - b0.y0, g); return it; };
  var ap = HX.wtApply;
  if (ap) HX.wtApply = function (doc, P, opt) { if (!P || !P.conns || !P.conns.length || HX.isPhys(doc.cur())) return ap.apply(this, arguments);
    var made = P.conns.map(function (c) { var it = HX.makeConn(doc, c.part, 0, 0); it.ref = c.ref; if (c.gender) it.gender = c.gender; HX.placeFree(doc, it); doc.add(it); return it; });
    var r = ap.call(this, doc, Object.assign({}, P, { conns: [] }), opt); r.conns = made.concat(r.conns || []); return r; };
})(typeof window !== 'undefined' ? window : globalThis);
