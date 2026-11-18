/* HarnessCAD - ETIQUETA (padrão da casa, ptag 'etiqtr') — complementos:
   * pontos da etiqueta (_kp, calculados em phys_tag3.js) usados como âncora: cota livre presa a {of: etiqueta, k: ponto}
     acompanha a etiqueta quando ela muda de lugar ou de tamanho;
   * HX.tagSplitDims: as cotas TIP. da etiqueta viram 4 COTAS LIVRES (pdimx), cada uma editável como as outras
     (texto, tolerância, afastamento, posição do texto, tamanho, setas);
   * balão da etiqueta: ponto de conexão escolhido (campo 'at' do balão);
   * lista de materiais: etiqueta (pç) + espaguete transparente (mm). */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT; if (!EXT.ptag || !EXT.pdimx) return;
  var ap0 = HX.physAnchorPt;
  HX.physAnchorPt = function (q, m) { var t = q && q.k && q.of && m[q.of], P = t && t._kp && t._kp[q.k]; return P && P.length ? [P[0] + (+q.dx || 0), P[1] + (+q.dy || 0)] : ap0.apply(this, arguments); };
  HX.TAG_BALL_AT = [['', 'Extremidade oposta ao conector (padrão)'], ['near', 'Extremidade do lado do conector'], ['labF', 'Linha da etiqueta (lado oposto)'], ['labN', 'Linha da etiqueta (lado do conector)'],
    ['c', 'Centro da etiqueta'], ['top', 'Borda de cima (meio)'], ['bot', 'Borda de baixo (meio)']];
  var bd0 = EXT.pball.draw;
  EXT.pball.draw = function (g, it, p, s, o) {
    var C = HX.physCtx(p, s, o), tg = C.m[it.of], P = it.at && tg && tg.type === 'ptag' && tg._kp && tg._kp[it.at]; if (!P) return bd0.apply(this, arguments);
    var p0 = tg._pt; HX.physHide(tg, '_pt', P); try { return bd0.apply(this, arguments); } finally { HX.physHide(tg, '_pt', p0); }
  };
  var bf0 = EXT.pball.fields;
  EXT.pball.fields = function (it, doc) {
    var F = bf0 ? bf0(it, doc) : [], tg = doc.cur().items.filter(function (q) { return q.id === it.of; })[0];
    return tg && tg.type === 'ptag' && tg.style === 'etiqtr' ? F.slice(0, 1).concat([{ k: 'at', l: 'Ponto de conexão na etiqueta', type: 'select', opts: HX.TAG_BALL_AT }], F.slice(1)) : F;
  };
  var xf0 = EXT.pdimx.fields;
  EXT.pdimx.fields = function (it, doc) { var F = xf0(it, doc); return F.slice(0, 3).concat([{ k: 'sub', l: 'Texto sob o valor (ex.: TIP.)' }], F.slice(3)); };
  /* separa as cotas da etiqueta em cotas livres; devolve as cotas criadas (ou [] se a etiqueta ainda não foi desenhada) */
  HX.tagSplitDims = function (doc, t) {
    var K = t && t._kp, si = doc.p.sheets.findIndex(function (q) { return q.items.indexOf(t) >= 0; }); if (!K || si < 0) return []; doc.sheet = si; var tp = t.dimTip === '' || t.dimTip == null ? 'TIP.' : t.dimTip === '-' ? '' : t.dimTip, fs = +t.dimSz > 0 ? +t.dimSz : 1.6, sOf = function (k) { return Math.hypot(K[k][0] - K.e0[0], K[k][1] - K.e0[1]); };
    var L = [['e0', 's0', 'dimT1', 'o1', Math.round(sOf('s0') / (K.k || 1))], ['s0', 's1', 'dimT2', 'o1', t.len || 30], ['s0', 'sl', 'dimT3', 'o2', ((+t.len || 30) - Math.min(+t.lab || 20, +t.len || 30)) / 2], ['sl', 'sl2', 'dimT4', 'o2', Math.min(+t.lab || 20, +t.len || 30)]];
    var lv = { o1: [], o2: [] }, out = [];
    L.forEach(function (d) {
      var tx = t[d[2]]; if (tx === '-') return; var v = tx === '' || tx == null ? String(Math.round(+d[4])) : String(tx), a = sOf(d[0]), b = sOf(d[1]), lo = Math.min(a, b), hi = Math.max(a, b), w = HX.textW(v, fs) + 0.6, Q = lv[d[3]];
      var fr = function (c) { return Q.every(function (q) { return c + w / 2 + 0.6 <= q[0] || c - w / 2 - 0.6 >= q[1]; }); }, C0 = hi - lo < w + 0.8 ? [lo - 2.4 - w / 2, hi + 2.4 + w / 2] : [(lo + hi) / 2], c = C0.filter(fr)[0];
      if (c == null) { c = hi + 2.4 + w / 2; Q.forEach(function (q) { if (q[1] + 0.8 + w / 2 > c) c = q[1] + 0.8 + w / 2; }); } Q.push([c - w / 2, c + w / 2]);
      out.push(doc.add({ type: 'pdimx', id: doc.uid('a'), a: { of: t.id, k: d[0], dx: 0, dy: 0 }, b: { of: t.id, k: d[1], dx: 0, dy: 0 }, orient: 'a', off: HX.r3 ? HX.r3(K[d[3]]) : K[d[3]], x: 0, y: 0,
        tx: HX.r3 ? HX.r3(c - (lo + hi) / 2) : c - (lo + hi) / 2, text: v, sub: tp, fs: fs, tolP: '', tolM: '', arrows: true, ext: true }));
    });
    t.dim = false; return out;
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
