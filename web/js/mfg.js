/* HarnessCAD - dados de fabricação:
   - decapagem por contato (faixa típica por família/tamanho; valor manual por ponta do fio: stripA / stripB);
   - folga por conector (nó do desenho físico: folga, mm) somada no comprimento de corte de cada fio que termina nele;
   - lista de fios com par trançado, decapagem de cada ponta e N/C;
   - lista de materiais do desenho físico com contatos e tampões de cada conector (balões mostram as peças associadas). */
(function (G) {
  'use strict';
  var HX = G.HX;
  // faixas típicas de decapagem (mm) — confirme no datasheet do contato
  HX.STRIP = {
    MIL: { '22D': [3.2, 4.0], '22': [3.2, 4.0], '20': [4.0, 4.8], '16': [6.4, 7.1], '12': [6.4, 7.9], '10': [7.9, 8.7], '8': [9.5, 11.1] },
    DT: { '16': [6.35, 7.92], '14': [6.35, 7.92], '12': [6.35, 7.92] }, DTM: { '20': [3.96, 5.54], '16': [3.96, 5.54] }, DTP: { '12': [6.35, 7.92] }
  };
  var MILF = /^(D38999|MS3476|MS26482|MS5015|M24308|M83513)$/;
  function generic(g) { g = +g; return g >= 24 ? [3.0, 4.0] : g >= 18 ? [4.0, 5.0] : g >= 14 ? [5.0, 6.5] : [6.5, 8.0]; }
  HX.stripFor = function (c, pin, g, manual) {
    if (manual !== undefined && manual !== '' && manual !== null) return { txt: String(manual).replace('.', ','), src: 'manual' };
    if (!c) return null;
    var fam = (c.part || '').split(':')[0], ct = HX.contactFor ? HX.contactFor(c, pin, g) : null, sz = ct && ct.size, r = null, src = 'típico';
    if (/^DT/.test(fam) && HX.STRIP[fam]) r = HX.STRIP[fam][sz] || HX.STRIP[fam][Object.keys(HX.STRIP[fam])[0]];
    else if (MILF.test(fam)) r = HX.STRIP.MIL[sz];
    if (!r) { if (g == null) return null; r = generic(g); src = 'genérico por bitola'; }
    var f2 = function (v) { return String(+(+v).toFixed(2)).replace('.', ','); };
    return { txt: f2(r[0]) + '–' + f2(r[1]), src: src, min: r[0], max: r[1] };
  };
  // folga por conector (no desenho físico) no comprimento automático
  HX.endAllowance = function (p) {
    var f = {}; p.sheets.forEach(function (sh) { if (sh.kind === 'phys') sh.items.forEach(function (i) { if (i.type === 'pnode' && i.of && i.folga !== '' && i.folga != null && isFinite(+i.folga)) f[i.of] = +i.folga; }); });
    return f;
  };
  function termAt(nl, s, pt) { var nd = nl.nodes[s + '|' + HX.key(pt[0], pt[1])]; return nd && nd.terms.filter(function (t) { return t.kind === 'pin'; })[0]; }
  var wl = HX.wireList;
  HX.wireList = function (p, nl) {
    nl = nl || HX.buildNetlist(p);
    var rows = wl(p, nl);
    rows.forEach(function (r) {
      var w = r.w, g = HX.gaugeAWG(w), a = termAt(nl, r.sheet, w.pts[0]), b = termAt(nl, r.sheet, w.pts[w.pts.length - 1]);
      var sa = HX.stripFor(a && a.item, a && a.pinObj, g, w.stripA), sb = HX.stripFor(b && b.item, b && b.pinObj, g, w.stripB);
      r.twist = w.twist || ''; r.stripA = w.ncA ? 'N/C' : sa ? sa.txt : ''; r.stripB = w.ncB ? 'N/C' : sb ? sb.txt : '';
    });
    return rows;
  };
  // lista de materiais do desenho físico: + contatos e tampões por conector; assoc[nó] = chaves das peças associadas
  var bom = HX.physBom;
  HX.physBom = function (p, sh) {
    var B = bom(p, sh), nl = HX.buildNetlist(p), sheetOf = {}, assoc = {};
    p.sheets.forEach(function (S, si) { if (S.kind !== 'phys') S.items.forEach(function (i) { sheetOf[i.id] = si; }); });
    var S = HX.physSchem(p);
    function add(k, pn, desc, qty, nd) {
      var r = B.key[k]; if (!r) { r = { k: k, pn: pn, desc: desc, qty: 0, un: 'pç' }; B.rows.push(r); B.key[k] = r; } r.qty += qty;
      var a = assoc[nd] = assoc[nd] || []; if (a.indexOf(k) < 0) a.push(k);
    }
    sh.items.forEach(function (n) {
      if (n.type !== 'pnode' || n.nkind !== 'conn') return; var c = S[n.of]; if (!c || c.eq || c.disc) return;
      var si = sheetOf[c.id], f = HX.CAT.fams[(c.part || '').split(':')[0]] || {};
      HX.connLayout(c, p.unit).pins.forEach(function (q) {
        var nd = nl.nodes[si + '|' + HX.key(q.pt[0], q.pt[1])], w = nd && nd.wireEnds[0] && nd.wireEnds[0].w;
        if (w) { var ct = HX.contactFor && HX.contactFor(c, q.pin, HX.gaugeAWG(w)); if (ct && ct.pn && ct.pn !== 'integral') add('k:' + ct.pn, ct.pn, 'Contato #' + ct.size + ' ' + (c.gender === 'P' ? 'pino' : 'soquete'), 1, n.id); }
        else if (f.sealed && HX.plugFor) { var pl = HX.plugFor(c, q.pin); if (pl) add('p:' + pl, pl, 'Tampão de vedação', 1, n.id); }
      });
    });
    B.rows.forEach(function (r, i) { r.n = i + 1; }); B.assoc = assoc;
    return B;
  };
})(typeof window !== 'undefined' ? window : globalThis);
