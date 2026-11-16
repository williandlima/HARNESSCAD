/* HarnessCAD - desenho físico: ORGANIZAR RÓTULOS e posicionar tabelas em área livre.
   Usa as caixas do último desenho (_bb). Rótulos (pnote, pball, rótulo de item do ramo, bandeiras) que se sobrepõem
   a outro rótulo, a uma montagem de conector ou a uma tabela são deslocados para a primeira posição livre ao redor. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function over(a, b, pad) { return a.x0 < b.x1 + pad && a.x1 > b.x0 - pad && a.y0 < b.y1 + pad && a.y1 > b.y0 - pad; }
  function mv(b, dx, dy) { return { x0: b.x0 + dx, y0: b.y0 + dy, x1: b.x1 + dx, y1: b.y1 + dy }; }
  var LBL = { pnote: 1, pball: 1, pflag: 1, pacc: 1, pface: 1 };
  // devolve quantos rótulos foram deslocados
  HX.physArrangeLabels = function (sh, pad) {
    pad = pad == null ? 0.8 : pad;
    var fixed = [], placed = [], n = 0, m = HX.physIdx(sh);
    sh.items.forEach(function (i) { if (i._bb && (i.type === 'pnode' && i.nkind === 'conn' || i.type === 'ptable' || i.type === 'pface' || i.type === 'pdetail' || i.type === 'pimg')) fixed.push(i._bb); });
    var segP = sh.items.filter(function (s) { return s.type === 'pseg'; }).map(function (s) { return s._P || HX.physSegPts(s, m); }).filter(Boolean);
    function hitsSeg(b) { return segP.some(function (P) { for (var k = 1; k < P.length; k++) { var a = P[k - 1], c = P[k], st = Math.max(2, Math.ceil(Math.hypot(c[0] - a[0], c[1] - a[1]) / 1.5)); for (var j = 0; j <= st; j++) { var x = a[0] + (c[0] - a[0]) * j / st, y = a[1] + (c[1] - a[1]) * j / st; if (x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1) return true; } } return false; }); }
    function free(b, self) { return !fixed.some(function (f) { return f !== self && over(b, f, pad); }) && !placed.some(function (f) { return over(b, f, pad); }) && !hitsSeg(b); }
    var L = sh.items.filter(function (i) { return LBL[i.type] && i._bb; });
    L.forEach(function (it) {
      var b = it.type === 'pacc' && it._lp ? { x0: it._bb.x0, y0: it._lp[1] - 2.4, x1: it._bb.x1, y1: it._lp[1] + 3 } : it._bb;
      if (free(b, it._bb)) { placed.push(b); return; }
      var w = b.x1 - b.x0, h = b.y1 - b.y0, st = Math.max(2, Math.min(w, h) * 0.6), best = null;
      for (var r = 1; r <= 10 && !best; r++) for (var a = 0; a < 16 && !best; a++) {
        var dx = Math.cos(a * Math.PI / 8) * st * r, dy = Math.sin(a * Math.PI / 8) * st * r, nb = mv(b, dx, dy);
        if (free(nb, it._bb)) best = [dx, dy, nb];
      }
      if (!best) { placed.push(b); return; }
      it.x = HX.r3((+it.x || 0) + best[0]); it.y = HX.r3((+it.y || 0) + best[1]); placed.push(best[2]); n++;
    });
    return n;
  };
})(typeof window !== 'undefined' ? window : globalThis);
