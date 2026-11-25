/* HarnessCAD - COMPRIMENTO NO ESQUEMA ⇄ FÍSICO + % A MAIS (v1.9.7). Uma fonte só: HX.computeLengths (phys_len.js).
   Mostrar: comprimento efetivo do fio (físico ou manual). Editar no esquema (HX.wireLenSet):
   - com desenho físico: muda o ramo do caminho do fio menos compartilhado (o exclusivo dele, se houver) — os fios que
     passam pelo mesmo ramo acompanham, como no chicote real; ramo não pode ficar < 1 mm → valor manual no fio;
   - sem desenho físico → valor manual no fio. Editar o ramo no físico muda o efetivo → o esquema mostra o novo valor.
   % A MAIS (perda em trançados etc.): por fio (w.extraPct) ou pelo cabo (c.extraPct), senão o padrão do projeto
   (p.defaults.scrapPct). Corte = efetivo × (1 + %). Lista de fios, lista de materiais e PDF usam a % de cada um. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function num(v) { return v === '' || v == null || isNaN(+v) ? null : +v; }
  function sheetOf(p, it) { for (var s = 0; s < p.sheets.length; s++) if (p.sheets[s].items.indexOf(it) >= 0) return p.sheets[s]; return null; }
  HX.wirePct = function (p, w) { var v = num(w.extraPct); if (v != null) return v; var sh = sheetOf(p, w), c = sh && HX.cableOf ? HX.cableOf(sh, w) : null;
    if (c && num(c.extraPct) != null) return +c.extraPct; return +p.defaults.scrapPct || 0; };
  HX.wirePctK = function (p, w) { return 1 + HX.wirePct(p, w) / 100; };
  HX.pctK = function (p, it) { if (it.type === 'wire') return HX.wirePctK(p, it); var v = num(it.extraPct); return 1 + (v != null ? v : +p.defaults.scrapPct || 0) / 100; };
  HX.wireLenInfo = function (p, w, LL) { LL = LL || HX.computeLengths(p); var x = LL.wires[w.id] || {}, eff = x.eff != null ? Math.round(x.eff) : (num(w.len) || null), pct = HX.wirePct(p, w);
    return { eff: eff, auto: x.auto != null ? Math.round(x.auto) : null, manual: !!x.manual || (num(w.len) > 0 && x.eff == null), path: x.path || null, pct: pct, cut: eff != null ? Math.round(eff * (1 + pct / 100)) : null, LL: LL }; };
  HX.wireLenSet = function (doc, w, L) {
    var p = doc.p; L = num(L); if (L == null || L <= 0) { w.len = ''; return 'auto'; }
    var ph = HX.physSheet && HX.physSheet(p), I = HX.wireLenInfo(p, w);
    if (!ph) { w.len = L; return 'semfisico'; }
    if (!I.path || !I.path.length || I.auto == null) { w.len = L; return 'manual'; }
    var m = HX.physIdx(ph), N = +ph.scale || 1, D = I.LL.dims, segs = I.path.map(function (id) { return ph.items.filter(function (i) { return i.id === id; })[0]; }).filter(Boolean);
    var sg = null; segs.forEach(function (s) { if (!sg || (D[s.id] ? D[s.id].count : 1) <= (D[sg.id] ? D[sg.id].count : 1)) sg = s; }); /* o ramo menos compartilhado (empate: o mais perto da ponta) */
    if (!sg) { w.len = L; return 'manual'; }
    var cur = HX.physSegLen(sg, m, N), nv = Math.round(cur + (L - I.auto));
    if (nv < 1) { w.len = L; return 'manual'; }
    sg.len = nv; w.len = ''; return 'fisico';
  };
  HX.cableLen = function (p, c, LL) { var sh = sheetOf(p, c); if (!sh) return null; LL = LL || HX.computeLengths(p); var m = null;
    sh.items.forEach(function (w) { if (w.type === 'wire' && HX.cableOf(sh, w) === c) { var e = HX.wireLenInfo(p, w, LL).eff; if (e != null && (m == null || e > m)) m = e; } });
    return m != null ? m : num(c.len); };
  HX.cableLenSet = function (doc, c, L) { var sh = sheetOf(doc.p, c), r = []; if (!sh) return r; sh.items.filter(function (w) { return w.type === 'wire' && HX.cableOf(sh, w) === c; }).forEach(function (w) { r.push(HX.wireLenSet(doc, w, L)); }); if (!r.length) c.len = num(L) || ''; return r; };
  /* lista de fios: comprimento efetivo (número), % e corte */
  var wl0 = HX.wireList;
  HX.wireList = function (p, nl) { var R = wl0.apply(this, arguments); if (!HX.computeLengths) return R; nl = nl || HX.buildNetlist(p); var LL = nl._dims || (nl._dims = HX.computeLengths(p, nl));
    R.forEach(function (r) { var I = HX.wireLenInfo(p, r.w, LL); r.len = I.eff == null ? '' : I.eff + (I.manual ? '' : '*'); /* * = vem do físico */ r.pct = r.w.extraPct === '' || r.w.extraPct == null ? '' : r.w.extraPct; r.pctEff = I.pct; r.cut = I.cut == null ? '' : I.cut; r.lenSrc = I.manual ? 'manual' : I.eff != null ? 'físico' : ''; });
    return R; };
})(typeof window !== 'undefined' ? window : globalThis);
