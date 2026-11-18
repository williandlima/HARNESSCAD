/* HarnessCAD - IDENTIFICAÇÃO NO PADRÃO DA CASA (ptag style 'etiqtr'): ETIQUETA (lab 20 mm) sob ESPAGUETE TERMO-RETRÁTIL
   TRANSPARENTE (len 30 mm), etiqueta centrada (5 mm de espaguete de cada lado), a 'gap' mm (padrão 10) do fim da montagem
   do conector (bota). Cotas em cadeia "TIP.": folga, 5, etiqueta e espaguete, como na prancha de referência. Na lista de
   materiais: etiqueta (pç, labPN) e espaguete transparente (mm, pn); balão em cadeia etiqueta + espaguete. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT; if (!EXT.ptag || !HX.PTAG) return;
  HX.PTAG.etiqtr = 'Etiqueta sob espaguete transparente';
  function arrow(g, x, y, ux, uy, col) { var a = 1.4, w = 0.4; g.style({ fill: col, stroke: col }); g.poly([[x, y], [x - ux * a - uy * w, y - uy * a + ux * w], [x - ux * a + uy * w, y - uy * a - ux * w]], true); g.style({ fill: null }); }
  /* cota paralela ao ramo entre as distâncias s0 e s1 (papel, ao longo de u a partir de O), afastada d; texto "v" + "TIP." */
  function dim(g, O, u, s0, s1, d, v, col, tip, fz) {
    if (v === '-') return null; tip = tip == null ? 'TIP.' : tip; fz = fz || 1.6;
    var nx = -u[1], ny = u[0], a = [O[0] + u[0] * s0 + nx * d, O[1] + u[1] * s0 + ny * d], b = [O[0] + u[0] * s1 + nx * d, O[1] + u[1] * s1 + ny * d], sg = d < 0 ? -1 : 1;
    g.style({ stroke: col, lw: 0.15, fill: null, dash: null }); g.line(a[0], a[1], b[0], b[1]);
    [[s0, a], [s1, b]].forEach(function (e) { var p0 = [O[0] + u[0] * e[0] + nx * sg * 0.8, O[1] + u[1] * e[0] + ny * sg * 0.8]; g.line(p0[0], p0[1], e[1][0] + nx * sg * 1, e[1][1] + ny * sg * 1); });
    var L = Math.abs(s1 - s0), sgn = Math.sign(s1 - s0) || 1, tw = Math.max(HX.textW(String(v), fz), tip ? HX.textW(tip, fz * 0.69) : 0) + 0.6, narrow = L < tw + 0.8;
    if (!narrow) { arrow(g, a[0], a[1], -u[0] * sgn, -u[1] * sgn, col); arrow(g, b[0], b[1], u[0] * sgn, u[1] * sgn, col); }
    else { /* cota estreita: setas por fora e o texto antes do início */
      g.line(a[0] - u[0] * sgn * 2.2, a[1] - u[1] * sgn * 2.2, a[0], a[1]); g.line(b[0], b[1], b[0] + u[0] * sgn * 2.2, b[1] + u[1] * sgn * 2.2);
      arrow(g, a[0], a[1], u[0] * sgn, u[1] * sgn, col); arrow(g, b[0], b[1], -u[0] * sgn, -u[1] * sgn, col); }
    var ta = Math.atan2(u[1], u[0]); if (Math.cos(ta) < -1e-6) ta += Math.PI; var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    if (narrow) { mx = a[0] - u[0] * sgn * (2.4 + tw / 2); my = a[1] - u[1] * sgn * (2.4 + tw / 2); }
    [[String(v), fz * 1.62, fz], [tip, fz * 0.69, fz * 0.69]].forEach(function (t) { if (!t[0]) return; g.push([Math.cos(ta), Math.sin(ta), -Math.sin(ta), Math.cos(ta), mx + nx * sg * t[1], my + ny * sg * t[1]]); g.text(t[0], 0, 0, { size: t[2], align: 'c', color: col }); g.pop(); });
    return { x0: Math.min(a[0], b[0]) - 2, y0: Math.min(a[1], b[1], my + ny * sg * 4) - 2, x1: Math.max(a[0], b[0]) + 2, y1: Math.max(a[1], b[1], my + ny * sg * 4) + 2 };
  }
  var d0 = EXT.ptag.draw;
  EXT.ptag.draw = function (g, it, p, s, o) {
    if (it.style !== 'etiqtr') return d0.apply(this, arguments);
    var C = HX.physCtx(p, s, o), sg = C.m[it.seg]; if (!sg) return;
    var Ls = +it.len || 30, Ll = Math.min(+it.lab || 20, Ls), gap = it.gap === '' || it.gap == null ? null : +it.gap, it2 = Object.assign({}, it), A = HX.physAccAt(it2, C.sh, C.m, C.N); if (!A) return;
    var P = sg._P || HX.physSegPts(sg, C.m), pl = P ? HX.polyLen(P) : 1, k = pl / (A.L || 1); /* papel por mm real */
    var e0 = A.from && A.from.nkind === 'conn' ? HX.physEdgeOff(A.from, A.pt) : 0, eo = e0 / k;
    if (gap != null) { it2.dist = eo + gap + Ls / 2; A = HX.physAccAt(it2, C.sh, C.m, C.N); }
    var col = C.line ? C.col : (o.theme && o.theme.txt) || '#222', BU = HX.physBundleCtx(p, s, o), W = HX.physVisW(sg, C.sh, BU), h = +it.alt > 0 ? Math.max(0.3, +it.alt / 2 - 0.4) : W / 2 + 0.15; /* altura editável; vazio = espessura do feixe */
    var u = A.d, cx = A.pt[0], cy = A.pt[1], ang = Math.atan2(u[1], u[0]), flip = Math.cos(ang) < -1e-6, ps = Ls * k, plb = Ll * k, txt = it.text || '';
    g.push([u[0], u[1], -u[1], u[0], cx, cy]);
    g.style({ stroke: col, lw: 0.25, fill: C.line ? '#fff' : '#f4f7f8' }); g.rect(-ps / 2, -h - 0.4, ps, 2 * h + 0.8); g.style({ fill: null }); /* espaguete transparente (contorno) */
    g.style({ stroke: col, lw: 0.2 }); g.line(-plb / 2, -h - 0.4, -plb / 2, h + 0.4); g.line(plb / 2, -h - 0.4, plb / 2, h + 0.4); /* etiqueta = trecho do meio, mesma altura (como na prancha) */
    g.pop();
    if (txt) { var fs = Math.min(1.8, h * 0.95), a2 = flip ? ang + Math.PI : ang, lines = String(txt).split(/\s*\/\s*|\n/); if (lines.length > 1) lines = lines.map(function (l, i) { return i < lines.length - 1 ? l + '/' : l; });
      g.push([Math.cos(a2), Math.sin(a2), -Math.sin(a2), Math.cos(a2), cx, cy]);
      lines.forEach(function (l, i) { g.text(l, 0, (i - (lines.length - 1) / 2) * fs * 1.15, { size: lines.length > 1 ? fs * 0.85 : fs, bold: true, align: 'c', color: col }); }); g.pop(); }
    var B = { x0: cx - ps / 2 - 1, y0: cy - h - 1, x1: cx + ps / 2 + 1, y1: cy + h + 1 };
    if (it.dim !== false && A.from) { /* cotas em cadeia a partir do fim da montagem do conector */
      var dir = [cx - A.from.x, cy - A.from.y], dl = Math.hypot(dir[0], dir[1]) || 1, uu = [dir[0] / dl, dir[1] / dl], O = [A.from.x, A.from.y], c0 = dl;
      var side = (uu[0] >= 0 ? -1 : 1) * (+it.dimOff > 0 ? -1 : 1); /* normal (-u.y, u.x): cotas acima do feixe na tela; dimOff > 0 = embaixo */
      var s0 = c0 - ps / 2, sl = c0 - plb / 2, L1 = side * (h + (+it.dimD1 > 0 ? +it.dimD1 : 11)), L2 = side * (h + (+it.dimD2 > 0 ? +it.dimD2 : 5)), tp = it.dimTip === '' || it.dimTip == null ? 'TIP.' : it.dimTip === '-' ? '' : it.dimTip, fz = +it.dimSz > 0 ? +it.dimSz : 1.6, tx = function (k, v) { var t = it[k]; return t === '' || t == null ? v : t; }; /* fora: folga e espaguete; dentro: 5 e etiqueta (como na prancha) */
      var D = [dim(g, O, uu, e0, s0, L1, tx('dimT1', Math.round(Math.max(0, (s0 - e0) / k))), col, tp, fz), dim(g, O, uu, s0, s0 + ps, L1, tx('dimT2', Math.round(Ls)), col, tp, fz),
        dim(g, O, uu, s0, sl, L2, tx('dimT3', Math.round((Ls - Ll) / 2)), col, tp, fz), dim(g, O, uu, sl, sl + plb, L2, tx('dimT4', Math.round(Ll)), col, tp, fz)].filter(Boolean);
      D.forEach(function (q) { B = { x0: Math.min(B.x0, q.x0), y0: Math.min(B.y0, q.y0), x1: Math.max(B.x1, q.x1), y1: Math.max(B.y1, q.y1) }; });
    }
    var dsg = A.from && (u[0] * (cx - A.from.x) + u[1] * (cy - A.from.y)) < 0 ? -1 : 1; HX.physHide(it, '_bb', B); HX.physHide(it, '_pt', [cx + u[0] * dsg * ps / 2, cy + u[1] * dsg * ps / 2]); /* balão na linha de extremidade */ HX.physHide(it, '_lp', null); HX.physHide(it, '_lb', null); HX.physHide(it, '_dim', null);
  };
  /* lista de materiais: etiqueta (pç) + espaguete transparente (mm); balão do item = etiqueta, associado = espaguete */
  var bom = HX.physBom;
  HX.physBom = function (p, sh) {
    var Bm = bom(p, sh), T = sh.items.filter(function (i) { return i.type === 'ptag' && i.style === 'etiqtr'; }); if (!T.length) return Bm;
    Bm.rows = Bm.rows.filter(function (r) { return !/^tag:etiqtr:/.test(r.k); }); Object.keys(Bm.key).forEach(function (k) { if (/^tag:etiqtr:/.test(k)) delete Bm.key[k]; });
    Bm.assoc = Bm.assoc || {};
    T.forEach(function (i) {
      var kl = 'etq:' + (i.labPN || ''), ks = 'esp:' + (i.pn || ''), rl = Bm.key[kl], rs = Bm.key[ks];
      if (!rl) { rl = { k: kl, pn: i.labPN || '', desc: 'Etiqueta de identificação', qty: 0, un: 'pç' }; Bm.rows.push(rl); Bm.key[kl] = rl; }
      if (!rs) { rs = { k: ks, pn: i.pn || '', desc: 'Espaguete termo-retrátil transparente', qty: 0, un: 'mm' }; Bm.rows.push(rs); Bm.key[ks] = rs; }
      rl.qty += 1; rs.qty += +i.len || 30; Bm.assoc[i.id] = [ks];
    });
    Bm.rows.forEach(function (r, j) { r.n = j + 1; }); return Bm;
  };
  var ik = HX.physItemKey;
  HX.physItemKey = function (p, it, m) { return it && it.type === 'ptag' && it.style === 'etiqtr' ? 'etq:' + (it.labPN || '') : ik(p, it, m); };
})(typeof window !== 'undefined' ? window : globalThis);
