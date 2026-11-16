/* HarnessCAD - desenho físico: TRANSIÇÕES RAYCHEM nas ramificações, LUVA DE SOLDA da blindagem e CAMADA INTERNA.
   • Transição moldada em Y 382A (TE "Molded Parts Visual Reference Guide": H, J, K fornecido/recuperado, P, R) no BR
     com 3 ramos: o maior feixe é a perna H; tamanho escolhido para Ø ≤ 90% do fornecido; aviso se ficar folgado.
     BR: trans '' (padrão da folha) | 'auto' | 'none'; transPN = PN manual. Folha: trans 'auto' liga em todos.
   • Item no ramo "Luva de solda (blindagem)": emenda da cordoalha geral no rabicho do adaptador (vai para a BOM).
   • Ramo: under = camada interna (ex. cordoalha sob o termorretrátil), entra na BOM pelo comprimento. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT;
  // [PN, H forn, H rec, J forn, J rec, K forn, K rec, P, R]
  HX.RC_TRANS = [['382A012', 13.2, 6.1, 6.6, 3.3, 6.6, 3.3, 22.4, 19.3], ['382A023', 26.9, 12.4, 13.2, 6.1, 13.2, 6.1, 38.1, 43.2],
    ['382A034', 38.6, 18, 26.9, 12.4, 26.9, 12.4, 65.5, 78.7], ['382A046', 55.6, 25.9, 26.9, 12.7, 26.9, 12.7, 85.1, 94]];
  HX.rcTransFor = function (h, j, k) { // Ø dos feixes (mm): h = principal; devolve {r, loose[]}
    var L = HX.RC_TRANS, r = L.filter(function (x) { return h <= x[1] * 0.9 && j <= x[3] * 0.9 && k <= x[5] * 0.9; })[0] || L[L.length - 1], lo = [];
    if (h < r[2]) lo.push('H'); if (j < r[4]) lo.push('J'); if (k < r[6]) lo.push('K'); return { r: r, loose: lo, over: h > r[1] * 0.9 || j > r[3] * 0.9 || k > r[5] * 0.9 };
  };
  HX.PACC.ssleeve = { n: 'Luva de solda (blindagem)', bom: 1, len: 18 };
  HX.isBranchNode = function (i) { return i.type === 'pnode' && (i.nkind === 'brk' || i.nkind === 'virt'); };
  if (HX.PACC_SHAPES) HX.PACC_SHAPES.ssleeve = function (g, w, col, K, Lp) {
    var h = w + 0.6, line = K.rub === '#fff'; g.style({ stroke: col, lw: 0.22, fill: line ? '#fff' : '#e8eef3', dash: null }); g.rect(-Lp / 2, -h, Lp, 2 * h);
    g.style({ fill: line ? '#fff' : '#c9a227' }); g.rect(-Lp * 0.12, -h, Lp * 0.24, 2 * h); g.style({ fill: line ? '#fff' : '#d42a2a' }); g.rect(-Lp / 2, -h, Lp * 0.1, 2 * h); g.rect(Lp * 0.4, -h, Lp * 0.1, 2 * h);
    g.style({ fill: null, lw: 0.08 }); for (var x = -Lp * 0.12; x < Lp * 0.12; x += 0.7) g.line(x, -h, x + 0.7, h);
  };
  function legs(it, C, BU) {
    var out = []; C.sh.items.forEach(function (s) {
      if (s.type !== 'pseg' || (s.a !== it.id && s.b !== it.id)) return; var P = HX.physSegPts(s, C.m); if (!P || P.length < 2) return;
      var q = s.a === it.id ? P : P.slice().reverse(), dx = q[1][0] - q[0][0], dy = q[1][1] - q[0][1], l = Math.hypot(dx, dy) || 1, od = ((BU.seg[s.id] || {}).od || 3) + 1;
      out.push({ s: s, d: [dx / l, dy / l], od: od, w: HX.bundleW(od - 1) });
    });
    return out.sort(function (a, b) { return b.od - a.od; });
  }
  HX.physTransOf = function (it, sh) { var t = it.trans || (sh && sh.trans) || ''; return t === 'none' ? '' : t; };
  HX.physTransPick = function (it, C, BU) { var L = legs(it, C, BU); if (L.length !== 3) return { L: L, pn: it.transPN || '' }; var t = HX.rcTransFor(L[0].od, L[1].od, L[2].od); return { L: L, t: t, pn: it.transPN || t.r[0] + '-25-0' }; };
  var d0 = EXT.pnode.draw;
  EXT.pnode.draw = function (g, it, p, s, o) {
    var bb = d0.apply(this, arguments); if (!HX.isBranchNode(it)) return bb;
    var C = HX.physCtx(p, s, o); if (!HX.physTransOf(it, C.sh)) return bb;
    var BU = HX.physBundleCtx(p, s, o), T = HX.physTransPick(it, C, BU), L = T.L; if (L.length < 3) return bb;
    var col = C.line ? C.col : '#111', fill = C.outline ? '#7a7a7a' : C.line ? '#fff' : '#5a5a5a', N = C.N, r = T.t ? T.t.r : [0, 0, 0, 0, 0, 0, 0, 40, 40], hub = Math.max.apply(0, L.map(function (l) { return l.w; })) * 0.8 + 0.6;
    g.style({ stroke: col, lw: 0.25, fill: fill, dash: null });
    L.forEach(function (l, i) {
      var len = Math.max(hub + 2.5, (i ? r[8] : r[7]) * 0.5 / N + hub), w0 = l.w * 0.5 + 0.9, w1 = l.w * 0.5 + 0.35, n = [-l.d[1], l.d[0]], x = it.x, y = it.y;
      g.style({ stroke: col, lw: 0.3, fill: fill }); g.poly([[x + n[0] * w0, y + n[1] * w0], [x + l.d[0] * len + n[0] * w1, y + l.d[1] * len + n[1] * w1], [x + l.d[0] * len - n[0] * w1, y + l.d[1] * len - n[1] * w1], [x - n[0] * w0, y - n[1] * w0]], true);
      var e = len - 0.7; g.style({ fill: null, lw: 0.18 }); g.line(x + l.d[0] * e + n[0] * w1, y + l.d[1] * e + n[1] * w1, x + l.d[0] * e - n[0] * w1, y + l.d[1] * e - n[1] * w1);
    });
    g.style({ stroke: col, lw: 0.3, fill: fill }); g.circle(it.x, it.y, hub); g.style({ fill: null });
    var A = L.map(function (l) { return Math.atan2(l.d[1], l.d[0]); }).sort(function (a, b) { return a - b; }), best = 0, ba = -Math.PI / 2;
    A.forEach(function (a, i) { var b = i + 1 < A.length ? A[i + 1] : A[0] + 2 * Math.PI; if (b - a > best) { best = b - a; ba = (a + b) / 2; } });
    var tr = hub + 4, tx = it.x + Math.cos(ba) * tr, ty = it.y + Math.sin(ba) * tr, al = Math.cos(ba) > 0.3 ? 'l' : Math.cos(ba) < -0.3 ? 'r' : 'c';
    g.text(T.pn || 'transição (definir PN)', tx, ty, { size: 1.5, align: al, color: col, bold: true });
    if (T.t && (T.t.loose.length || T.t.over)) g.text(T.t.over ? '⚠ feixe maior que a transição' : '⚠ folga em ' + T.t.loose.join('/'), tx, ty + 1.9, { size: 1.3, align: al, color: C.line ? col : '#c2410c' });
    return bb;
  };
  var bom = HX.physBom;
  HX.physBom = function (p, sh) {
    var B = bom(p, sh), si = p.sheets.indexOf(sh), C = HX.physCtx(p, si, {}), BU = HX.physBundleCtx(p, si, {});
    function add(k, pn, desc, q, un, it) { var r = B.key[k]; if (!r) { r = { k: k, pn: pn, desc: desc, qty: 0, un: un }; B.rows.push(r); B.key[k] = r; } r.qty = Math.round((r.qty + q) * 100) / 100;
      if (it) { B.assoc = B.assoc || {}; var a = B.assoc[it.id] = B.assoc[it.id] || []; if (a.indexOf(k) < 0) a.push(k); } }
    sh.items.forEach(function (i) {
      if (HX.isBranchNode(i) && HX.physTransOf(i, sh)) { var T = HX.physTransPick(i, C, BU); if (T.L.length >= 3) add('rcx:' + (T.pn || '?'), T.pn, T.pn ? 'Transição moldada Raychem (Y)' : 'Transição moldada ' + T.L.length + ' vias (definir PN)', 1, 'pç'); }
      if (i.type === 'pseg') { var u = i.under || sh.under; if (u && HX.PSPR[u]) add('u:' + u + ':' + (i.underTxt || sh.underTxt || ''), i.underTxt || sh.underTxt || '', HX.PSPR[u].name + ' (camada interna)', HX.physSegLen(i, C.m, C.N) / 1000, 'm', i); }
    });
    B.rows.forEach(function (r, j) { r.n = j + 1; if (r.un === 'm') r.qty = Math.round(r.qty * 100) / 100; });
    return B;
  };
  // PADRÃO MS (cablagem militar da casa): vetor, adaptador reto + cordoalha, bota Raychem, cordoalha + termorretrátil
  // em todos os ramos, transição Raychem nas ramificações e luva de solda da blindagem junto a cada conector
  HX.physApplyMS = function (doc, sh, opt) {
    opt = opt || {}; var n = { conn: 0, seg: 0, br: 0, ss: 0 }, m = HX.physIdx(sh), S = HX.physSchem(doc.p), N = +sh.scale || 1;
    sh.connDraw = 'vec'; sh.trans = 'auto'; sh.under = sh.under || 'cov_braid'; sh.underTxt = sh.underTxt || opt.braidPN || '';
    sh.items.slice().forEach(function (i) {
      if (i.type === 'pnode' && i.nkind === 'conn') { var c = S[i.of], d = c && HX.CAT.conns[c.part]; if (!d) return;
        if (d.fam === 'MS5015') i.bsKind = 'ms_ad'; if (/MS5015|MS26482|D38999/.test(d.fam)) { i.bootKind = 'rc_202K'; n.conn++; }
        sh.items.filter(function (s) { return s.type === 'pseg' && (s.a === i.id || s.b === i.id); }).forEach(function (s) {
          if (sh.items.some(function (a) { return a.type === 'pacc' && a.kind === 'ssleeve' && a.seg === s.id; })) return;
          var L = HX.physSegLen(s, m, N), it = { type: 'pacc', id: doc.uid('c'), seg: s.id, end: s.a === i.id ? 'a' : 'b', dist: Math.round(Math.min(L * 0.35, 50)), kind: 'ssleeve', text: '', pn: opt.ssPN || '', len: 18, extra: '', peso: '', x: 0, y: 8 };
          doc.add(it); n.ss++; }); }
      if (i.type === 'pseg') { if (!i.cover) { i.cover = 'cov_shrink'; i.coverTxt = i.coverTxt || opt.shrinkPN || 'DR-25'; } n.seg++; }
      if (HX.isBranchNode(i) && sh.items.filter(function (s) { return s.type === 'pseg' && (s.a === i.id || s.b === i.id); }).length >= 3) n.br++;
    });
    return n;
  };
})(typeof window !== 'undefined' ? window : globalThis);
