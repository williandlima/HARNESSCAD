/* HarnessCAD - desenho físico: amarração dos ramos na LISTA DE MATERIAIS.
   Abraçadeira: 1 pç por ponto. Barbante por pontos: 3 voltas + 150 mm de nó por ponto. Costura contínua: 2,5× o ramo + 300 mm.
   Fita em espiral 19 mm com 50% de sobreposição: comprimento do ramo × π·Ø / (19 × 0,5). PN: no ramo ou padrão da folha. */
(function (G) {
  'use strict';
  var HX = G.HX;
  // lista de materiais: amarrações
  var bom = HX.physBom;
  HX.physBom = function (p, sh) {
    var B = bom(p, sh), m = HX.physIdx(sh), N = +sh.scale || 1, BU = HX.physBundle(p, sh);
    function add(k, pn, desc, q, un) { var r = B.key[k]; if (!r) { r = { k: k, pn: pn, desc: desc, qty: 0, un: un }; B.rows.push(r); B.key[k] = r; } r.qty = Math.round((r.qty + q) * 100) / 100; }
    sh.items.forEach(function (sg) {
      if (sg.type !== 'pseg') return; var bp = HX.physBindParams(sg, sh); if (!bp.kind) return;
      var D = HX.PHYS_BIND[bp.kind], L = HX.physSegLen(sg, m, N), od = (BU.seg[sg.id] || {}).od || 3, pn = sg.bindPN || sh['bindPN_' + bp.kind] || '', k = 'bind:' + bp.kind + ':' + pn;
      if (bp.kind === 'tie') add(k, pn, D.n, HX.physBindMarks(L, bp.step, bp.end).length, 'pç');
      else if (bp.kind === 'lace') add(k, pn, D.n, HX.physBindMarks(L, bp.step, bp.end).length * (3 * Math.PI * od + 150) / 1000, 'm');
      else if (bp.kind === 'lacec') add(k, pn, D.n, (L * 2.5 + 300) / 1000, 'm');
      else add(k, pn, D.n, Math.max(0, L - 2 * Math.min(bp.end, L / 2)) * Math.PI * od / (D.w * 0.5) / 1000, 'm');
    });
    B.rows.forEach(function (r, j) { r.n = j + 1; });
    return B;
  };
  // identificação do ramo (folha › segInfo, ligado por padrão): nº de fios, Ø do feixe e amarração, ao longo do ramo
  var d0 = HX.ITEM_EXT.pseg.draw;
  HX.ITEM_EXT.pseg.draw = function (g, it, p, s, o) {
    d0(g, it, p, s, o); var C = HX.physCtx(p, s, o); if (C.sh.segInfo === false || it.info === false || o._inDetail || !it._P) return;
    var b = HX.physBundleCtx(p, s, o).seg[it.id]; if (!b || !b.wires.length) return;
    var P = it._P, L = HX.polyLen(P); if (L < 18) return;
    var AC = C.sh.items.filter(function (i) { return (i.type === 'pacc' || i.type === 'ptag') && i.seg === it.id; }).map(function (i) { var A = HX.physAccAt(i, C.sh, C.m, C.N); return A && A.pt; }).filter(Boolean), tb = 0.5, bd = -1;
    [0.5, 0.4, 0.6, 0.32, 0.68, 0.25, 0.75].forEach(function (t) { var pt = HX.polyAt(P, t).pt, dm = AC.reduce(function (m, a) { return Math.min(m, Math.hypot(a[0] - pt[0], a[1] - pt[1])); }, 1e9); if (dm > bd + 4) { bd = dm; tb = t; } }); // longe das abraçadeiras/etiquetas
    if (+it.infoT > 0 && +it.infoT < 1) tb = +it.infoT; var q = HX.polyAt(P, tb), a = Math.atan2(q.d[1], q.d[0]); if (Math.cos(a) < -1e-6) a += Math.PI;
    var bk = HX.physBindOf(it, C.sh), t = b.wires.length + ' fios · Ø' + HX.fmtNum(Math.round(b.od * 10) / 10) + (bk ? ' · ' + HX.PHYS_BIND[bk].n.split(' (')[0].split(' —')[0].toLowerCase() : '');
    var off = (it.infoSide === 'o' ? -1 : 1) * ((HX.physVisW ? HX.physVisW(it, C.sh, HX.physBundleCtx(p, s, o)) : HX.bundleW(b.od)) / 2 + 2.2); var c = Math.cos(a), sn = Math.sin(a);
    g.push([c, sn, -sn, c, q.pt[0] - sn * off, q.pt[1] + c * off]); g.text(it.infoTxt || t, 0, 0.5, { size: +it.infoFs || +C.sh.lblFs || 1.5, align: 'c', color: C.line ? C.col : '#333' }); g.pop();
  };
})(typeof window !== 'undefined' ? window : globalThis);
