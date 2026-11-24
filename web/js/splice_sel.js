/* HarnessCAD - SELEÇÃO DO PN DA EMENDA pelo datasheet (biblioteca cat_splice.js): CMA de cada fio (tabela TE p.15;
   mm² × 1973,5), lados da emenda pela direção dos fios (emenda de topo: lado A à esquerda/em cima, B à direita/embaixo),
   regra da série (soma da CMA, barril por lado ou faixa AWG 1:1). Lista de materiais (esquema e prancha física) usa o PN
   escolhido — o MIL equivalente quando existe (ex.: M81824/1-2 = TE D-436-37); ERC avisa quando nenhum PN serve. */
(function (G) {
  'use strict';
  var HX = G.HX; if (!HX.SPLICE_LIB) return;
  HX.wireCMA = function (w) { var t = HX.wireType ? HX.wireType(w.wtype) : null, g = parseFloat(w.gauge);
    if (t && t.unit === 'mm2') return isNaN(g) ? 0 : Math.round(g * 1973.5);
    if (HX.SPLICE_CMA[g]) return HX.SPLICE_CMA[g]; var a = HX.AWG.filter(function (r) { return +r[0] === g; })[0]; return a ? Math.round(a[2] * 1973.5) : 0; };
  /* fios na emenda, separados por lado */
  HX.spliceSides = function (p, s, it, nl) { nl = nl || HX.buildNetlist(p); var nd = nl.nodes[s + '|' + HX.key(it.x, it.y)], A = [], B = [];
    (nd ? nd.wireEnds : []).forEach(function (we) { var P = we.w.pts, q = we.end ? P[P.length - 2] : P[1]; if (!q) return; var dx = q[0] - it.x, dy = q[1] - it.y;
      (dx < -1e-6 || Math.abs(dx) < 1e-6 && dy < 0 ? A : B).push({ w: we.w, cma: HX.wireCMA(we.w), awg: HX.gaugeAWG(we.w) }); });
    return { A: A, B: B }; };
  function sum(L) { return L.reduce(function (s, x) { return s + x.cma; }, 0); }
  /* escolhe o PN da série para os fios dos lados A e B; devolve {pn, q, why} ou {err} */
  HX.spliceSelect = function (ser, A, B) {
    var S = HX.SPLICE_LIB[ser]; if (!S) return { err: 'série desconhecida' }; var n = A.length + B.length, W = A.concat(B), q, i;
    if (n < 2) return { err: 'menos de 2 fios na emenda' };
    if (W.some(function (x) { return !x.cma; })) return { err: 'fio sem bitola definida' };
    if (S.sel === 'total' && HX.spliceTable) { var tb = HX.spliceTable(ser, A, B); if (tb && tb.pn) { tb.q = S.p.filter(function (z) { return z[0] === tb.pn; })[0]; return tb; } if (tb && tb.err) return tb; }
    if (S.sel === 'total') { var t = sum(W); if (S.kind === 'closed' && n > 10) return { err: 'mais de 10 fios (máx. da SolderGrip)' };
      for (i = 0; i < S.p.length; i++) { q = S.p[i]; if (t >= q[2] && t <= q[3]) return { pn: q[0], q: q, why: 'CMA total ' + t + ' (faixa ' + q[2] + '–' + q[3] + ', ' + (S.kind === 'closed' ? 'Tabela A p.14' : 'Tabela E p.12') + ')', warn: q[5] ? 'confira o Ø externo dos fios: ' + q[4] + '–' + q[5] + ' mm' : '' }; }
      return { err: 'CMA total ' + t + ' fora das faixas da ' + ser + ' (' + S.p[0][2] + '–' + S.p[S.p.length - 1][3] + ')' }; }
    if (S.sel === 'awg') { if (A.length !== 1 || B.length !== 1) return { err: 'a ' + ser + ' é emenda de topo 1:1 (1 fio de cada lado); aqui há ' + A.length + ':' + B.length };
      for (i = 0; i < S.p.length; i++) { q = S.p[i]; var x = q[6]; if ([A[0].awg, B[0].awg].every(function (g) { return g != null && g <= x[1] && g >= x[0]; })) return { pn: q[0], q: q, why: 'AWG ' + A[0].awg + ' × ' + B[0].awg + ' (faixa ' + x[1] + '–' + x[0] + ')' }; }
      return { err: 'bitolas ' + A[0].awg + ' × ' + B[0].awg + ' AWG sem PN comum na ' + ser }; }
    /* barril por lado: emenda de topo (fios dos dois lados) ou de ponta (todos do mesmo lado) */
    var a = sum(A), b = sum(B), top = A.length && B.length, one = top ? null : A.length ? A : B;
    for (i = 0; i < S.p.length; i++) { q = S.p[i]; var y = q[6], fit = function (c) { return c >= q[2] && c <= q[3]; };
      if (top && y[0] === 'topo' && fit(a) && fit(b) && (A.length <= y[1] && B.length <= y[2] || A.length <= y[2] && B.length <= y[1])) return { pn: q[0], q: q, why: 'CMA lado A ' + a + ' / lado B ' + b + ' (barril ' + q[2] + '–' + q[3] + ')' };
      if (!top && y[0] === 'ponta' && fit(sum(one)) && one.length <= y[1]) return { pn: q[0], q: q, why: 'emenda de ponta, CMA ' + sum(one) + ' (barril ' + q[2] + '–' + q[3] + ')' }; }
    return { err: top ? 'CMA lado A ' + a + ' / lado B ' + b + ' (' + A.length + ' × ' + B.length + ' fio/s) sem barril comum — use emenda de ponta ou outra série' : 'nenhum barril de ponta para ' + one.length + ' fio(s)' };
  };
  /* PN final da emenda do esquema: manual (campo PN) > série escolhida > série padrão do tipo */
  HX.splicePN = function (p, s, it, nl) {
    if (!it || it.type !== 'splice' || it.kind === 'junction') return null;
    var ser = it.series || HX.SPLICE_DEF[it.kind], S = HX.SPLICE_LIB[ser];
    if (it.part) return { pn: it.part, manual: true, ser: ser, desc: (S ? S.d.split(' — ')[0] + ' — ' : '') + (HX.CAT.splices[it.kind] || {}).d };
    if (!S) return null; var sd = HX.spliceSides(p, s, it, nl), r = HX.spliceSelect(ser, sd.A, sd.B); r.ser = ser; r.sides = sd;
    if (r.pn) { var x = r.q[6] || [], mil = [x[5], x[2]].filter(function (v) { return /^M8/.test(v || ''); })[0];
      r.te = r.pn; if (mil) r.pn = mil; var dd = S.d.split(' — ')[1]; r.desc = dd.charAt(0).toUpperCase() + dd.slice(1) + (r.q[1] ? ' ' + r.q[1].toLowerCase() : '') + ' — TE ' + r.te + (mil ? ' (' + mil + ')' : ''); }
    return r; };
  /* lista de materiais da prancha física: emendas do esquema com o PN do datasheet */
  var pb0 = HX.physBom; if (pb0) HX.physBom = function (p, sh) { var B = pb0.apply(this, arguments), nl = HX.buildNetlist(p);
    p.sheets.forEach(function (S, si) { if (HX.isPhys(S)) return; S.items.forEach(function (it) { var r = HX.splicePN(p, si, it, nl); if (!r || !r.pn) return; var k = 'sp:' + r.pn;
      if (!B.key[k]) { var o = { k: k, pn: r.pn, desc: 'Emenda — ' + (r.desc || ''), qty: 0, un: 'pç' }; B.rows.push(o); B.key[k] = o; } B.key[k].qty += 1; }); });
    return B; };
  /* ERC: nenhum PN da série serve para os fios da emenda */
  if (HX.ERC_RULES) HX.ERC_RULES.push(['spliceSel', 'Emenda × bitolas (datasheet)', 'aviso']);
  var erc0 = HX.runERC; HX.runERC = function (p, nl) { nl = nl || HX.buildNetlist(p); var out = erc0.call(this, p, nl), cfg = HX.ercCfg ? HX.ercCfg(p) : { rules: {}, waived: {} }, o = cfg.rules.spliceSel;
    if (o === 'off') return out;
    p.sheets.forEach(function (S, si) { if (HX.isPhys && HX.isPhys(S)) return; S.items.forEach(function (it) { var r = HX.splicePN(p, si, it, nl); if (!r || !r.err || /menos de 2/.test(r.err)) return; /* <2 fios: regra 'splice' já avisa */
      var e = { sev: o || 'aviso', msg: 'Emenda ' + it.ref + ' (' + r.ser + '): nenhuma peça serve — ' + r.err, sheet: si, id: it.id, pt: [it.x, it.y], rule: 'spliceSel', ruleName: 'Emenda × bitolas (datasheet)' };
      e.key = 'spliceSel|' + it.id + '|' + e.msg; if (!cfg.waived[e.key]) out.push(e); }); });
    return out; };
})(typeof window !== 'undefined' ? window : globalThis);
