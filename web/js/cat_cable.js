/* HarnessCAD - MODELOS DE CABO (blindados, 1 a N vias, pares trançados) e as operações:
   HX.cableInsert(doc, mod, pt) cria as N vias (passo dos pinos), trança em pares, o oval da blindagem e o dreno;
   HX.cableApply(doc, fios, mod, cabo?) transforma fios já desenhados em cabo (aplica bitola/trança, oval por cima);
   HX.cableWires(doc, cabo) = fios dentro do cabo; ERC avisa nº de fios ≠ nº de vias do modelo.
   REGRA DO PROJETO: dado de catálogo só de datasheet oficial. M27500 (construtor de PN), LiYCY e STP ficam como
   "aguardando datasheet" (vias, blindagem, trança e dreno configuráveis; PN digitado) até chegarem os documentos —
   nenhuma letra de código, cor de via ou diâmetro inventado. Cor das vias = cor padrão do projeto (editar por fio). */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.CABLE_LIB = {
    'BLD': { n: 'Cabo blindado genérico', vias: 2, tw: false, shield: true, drain: '', ok: false, need: '' },
    'BLD-TP': { n: 'Par trançado blindado genérico', vias: 2, tw: true, shield: true, drain: '', ok: false, need: '' },
    'M27500': { n: 'MIL-DTL-27500 (M27500) — blindado, 1 a 4+ vias', vias: 2, tw: true, shield: true, drain: '', ok: false,
      need: 'folha MIL-DTL-27500 (códigos do tipo de fio, nº de condutores, blindagem e capa) para montar o PN sozinho' },
    'LiYCY': { n: 'LiYCY — controle blindado (malha), n × mm²', vias: 4, tw: false, shield: true, drain: 'none', ok: false,
      need: 'datasheet do fabricante usado (seções, nº de vias, Ø externo, cores das vias)' },
    'STP': { n: 'Par trançado blindado 120 Ω (RS-485/CAN)', vias: 2, tw: true, shield: true, drain: '', ok: false,
      need: 'datasheet do fabricante usado (PN, bitola, Ø externo, cores, dreno)' }
  };
  function sh0(doc) { return doc.cur(); }
  HX.cableWires = function (doc, c) { var sh = sh0(doc); return sh.items.filter(function (w) { return w.type === 'wire' && HX.cableOf(sh, w) === c; }); };
  function setup(doc, c, mod, o) { c.model = o.model || ''; c.vias = o.vias; c.shield = mod.shield !== false && o.shield !== false; if (o.drain != null) c.drain = o.drain; else if (mod.drain) c.drain = mod.drain;
    c.part = o.pn || c.part || ''; c.desc = o.desc || mod.n; }
  function wireSpec(doc, W, mod, o) { var d = doc.p.defaults, k = 0, tg = {};
    W.forEach(function (w, i) { if (o.gauge) w.gauge = String(o.gauge); if (o.wtype) w.wtype = o.wtype;
      if (o.tw) { var g = Math.floor(i / 2); if (!tg[g]) tg[g] = (o.twPfx || 'TP') + (++k + (doc.p._twN || 0)); w.twist = (W.length - i === 1 && i % 2 === 0) ? '' : tg[g]; } });
    if (o.tw) doc.p._twN = (doc.p._twN || 0) + k; }
  /* insere o cabo: N vias horizontais a partir de pt (comprimento 40 mm), oval no meio */
  HX.cableInsert = function (doc, mod, pt, o) {
    o = Object.assign({ vias: mod.vias, tw: mod.tw }, o || {}); var u = doc.p.unit || 2.5, p = 2 * u, Lw = 16 * u, W = [], n = Math.max(1, Math.min(48, +o.vias || 1));
    var x0 = HX.snap(pt[0], u), y0 = HX.snap(pt[1], u);
    for (var i = 0; i < n; i++) { var w = HX.ops.addWire(doc, [[x0, y0 + i * p], [x0 + Lw, y0 + i * p]], {}); if (w) W.push(w); }
    wireSpec(doc, W, mod, o);
    var c = doc.add({ type: 'cable', id: doc.uid('k'), ref: doc.nextRef('CB'), x: x0 + Lw / 2 - 2, y: y0 - u, w: 4, h: (n - 1) * p + 2 * u, part: '', desc: '', shield: true, len: '' });
    setup(doc, c, mod, Object.assign({}, o, { vias: n })); HX.cableFit(c, sh0(doc));
    return { cable: c, wires: W };
  };
  /* transforma fios em cabo: o oval atravessa todos os fios num trecho comum (horizontal ou vertical) */
  HX.cableApply = function (doc, W, mod, c, o) {
    o = Object.assign({ vias: W.length, tw: mod.tw }, o || {}); if (!W.length) return null; var u = doc.p.unit || 2.5;
    function segs(w, hz) { var S = []; for (var i = 1; i < w.pts.length; i++) { var a = w.pts[i - 1], b = w.pts[i]; if (hz ? Math.abs(a[1] - b[1]) < 1e-6 : Math.abs(a[0] - b[0]) < 1e-6) S.push(hz ? [Math.min(a[0], b[0]), Math.max(a[0], b[0]), a[1]] : [Math.min(a[1], b[1]), Math.max(a[1], b[1]), a[0]]); } return S; }
    var best = null; [true, false].forEach(function (hz) { var L = W.map(function (w) { return segs(w, hz); }); if (L.some(function (s) { return !s.length; })) return;
      var lo = -1e9, hi = 1e9, pos = []; L.forEach(function (S) { var s = S.reduce(function (m, x) { return x[1] - x[0] > m[1] - m[0] ? x : m; }); lo = Math.max(lo, s[0]); hi = Math.min(hi, s[1]); pos.push(s[2]); });
      if (hi - lo > u && (!best || hi - lo > best.hi - best.lo)) best = { hz: hz, lo: lo, hi: hi, a: Math.min.apply(0, pos), b: Math.max.apply(0, pos), pos: pos }; });
    if (!best) return { err: 'Os fios não têm um trecho reto em comum por onde passar o oval do cabo — alinhe um trecho dos fios e tente de novo.' };
    var m = HX.snap((best.lo + best.hi) / 2, u), ord = W.map(function (w, i) { return [best.pos[i], w]; }).sort(function (x, y) { return x[0] - y[0]; }).map(function (x) { return x[1]; });
    wireSpec(doc, ord, mod, o);
    if (!c) c = doc.add({ type: 'cable', id: doc.uid('k'), ref: doc.nextRef('CB'), x: 0, y: 0, w: 4, h: 4, part: '', desc: '', shield: true, len: '' });
    if (best.hz) { c.x = m - 2; c.w = 4; c.y = best.a - u; c.h = best.b - best.a + 2 * u; } else { c.y = m - 2; c.h = 4; c.x = best.a - u; c.w = best.b - best.a + 2 * u; }
    setup(doc, c, mod, Object.assign({}, o, { vias: W.length })); HX.cableFit(c, sh0(doc)); return { cable: c, wires: ord };
  };
  /* ERC: nº de fios dentro do cabo diferente do nº de vias do modelo */
  if (HX.ERC_RULES) HX.ERC_RULES.push(['cableVias', 'Cabo × nº de vias', 'aviso']);
  var erc0 = HX.runERC; HX.runERC = function (p, nl) { var out = erc0.apply(this, arguments), cfg = HX.ercCfg ? HX.ercCfg(p) : { rules: {}, waived: {} }; if (cfg.rules.cableVias === 'off') return out;
    p.sheets.forEach(function (S, si) { if (HX.isPhys && HX.isPhys(S)) return; S.items.forEach(function (c) { if (c.type !== 'cable' || !(+c.vias > 0)) return;
      var n = S.items.filter(function (w) { return w.type === 'wire' && HX.cableOf(S, w) === c; }).length; if (n === +c.vias) return;
      var e = { sev: cfg.rules.cableVias || 'aviso', msg: 'Cabo ' + c.ref + ': ' + n + ' fio(s) passando pelo cabo, mas o modelo tem ' + c.vias + ' via(s)', sheet: si, id: c.id, pt: [c.x, c.y], rule: 'cableVias', ruleName: 'Cabo × nº de vias' };
      e.key = 'cableVias|' + c.id + '|' + e.msg; if (!cfg.waived[e.key]) out.push(e); }); });
    return out; };
})(typeof window !== 'undefined' ? window : globalThis);
