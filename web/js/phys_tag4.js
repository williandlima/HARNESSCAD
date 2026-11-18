/* HarnessCAD - ETIQUETA (padrão da casa, ptag 'etiqtr') — complementos:
   * pontos da etiqueta (_kp, calculados em phys_tag3.js) usados como âncora: cota livre presa a {of: etiqueta, k: ponto}
     acompanha a etiqueta quando ela muda de lugar ou de tamanho;
   * HX.tagSplitDims: as cotas TIP. da etiqueta viram 4 COTAS LIVRES (pdimx), cada uma editável como as outras
     (texto, tolerância, afastamento, posição do texto, tamanho, setas) — é o PADRÃO (toda alteração e ao abrir);
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
  /* separa as cotas da etiqueta em cotas livres (texto vazio = medido, posição do texto vazia = automática, sem conflito) */
  HX.tagSplitDims = function (doc, t) {
    var K = t && t._kp, si = doc.p.sheets.findIndex(function (q) { return q.items.indexOf(t) >= 0; }); if (!K || si < 0) return []; var s0 = doc.sheet; doc.sheet = si;
    var tp = t.dimTip === '' || t.dimTip == null ? 'TIP.' : t.dimTip === '-' ? '' : t.dimTip, fs = +t.dimSz > 0 ? +t.dimSz : 1.6, out = [];
    [['e0', 's0', 'dimT1', 'o1'], ['s0', 's1', 'dimT2', 'o1'], ['s0', 'sl', 'dimT3', 'o2'], ['sl', 'sl2', 'dimT4', 'o2']].forEach(function (d) {
      var tx = t[d[2]]; if (tx === '-') return;
      out.push(doc.add({ type: 'pdimx', id: doc.uid('a'), a: { of: t.id, k: d[0], dx: 0, dy: 0 }, b: { of: t.id, k: d[1], dx: 0, dy: 0 }, orient: 'a', off: HX.r3 ? HX.r3(K[d[3]]) : K[d[3]], x: 0, y: 0,
        tx: '', text: tx == null ? '' : String(tx), sub: tp, fs: fs, tolP: '', tolM: '', arrows: true, ext: true }));
    });
    t.dim = false; doc.sheet = s0; return out;
  };
  /* cota livre presa a 2 pontos da etiqueta: valor medido na escala da etiqueta e texto (com a tolerância) posto sem
     conflito com as outras cotas da mesma etiqueta na mesma linha */
  function lab(it, v) { return v + (it.tolP || it.tolM ? ' +' + (it.tolP || 0) + '/-' + (it.tolM || 0) : ''); }
  function tagDim(it, C) { var t = it.a && it.b && it.a.k && it.b.k && it.a.of === it.b.of && C.m[it.a.of]; return t && t.type === 'ptag' && t._kp ? t : null; }
  HX.tagDimPlace = function (it, C) {
    var t = tagDim(it, C); if (!t) return null; var K = t._kp, w0 = [K.s1[0] - K.e0[0], K.s1[1] - K.e0[1]], wl = Math.hypot(w0[0], w0[1]) || 1, W = [w0[0] / wl, w0[1] / wl], res = null, Q = [], L = [];
    var sOf = function (P) { return (P[0] - K.e0[0]) * W[0] + (P[1] - K.e0[1]) * W[1]; }, off = +it.off || 0;
    C.sh.items.forEach(function (q) { if (q.type !== 'pdimx' || tagDim(q, C) !== t) return; var A = HX.physAnchorPt(q.a, C.m), B = HX.physAnchorPt(q.b, C.m); if (!A || !B) return;
      var o = +q.off || 0; if (Math.abs(o - off) <= 0.05) L.push([q, sOf(A), sOf(B)]); else if (o * off > 0 && Math.abs(o) > Math.abs(off)) { Q.push([sOf(A) - 0.3, sOf(A) + 0.3]); Q.push([sOf(B) - 0.3, sOf(B) + 0.3]); } }); /* linhas de chamada das cotas mais afastadas cruzam esta linha */
    L.forEach(function (e) {
      if (res) return; var q = e[0], lo = Math.min(e[1], e[2]), hi = Math.max(e[1], e[2]), sg = e[2] >= e[1] ? 1 : -1, mid = (lo + hi) / 2;
      var v = q.text === '' || q.text == null ? String(Math.round((hi - lo) / (K.k || 1))) : String(q.text), fs = +q.fs || +C.sh.dimFs || 2.5, w = HX.textW(lab(q, v), fs) + 0.6, c;
      var fr = function (x) { return Q.every(function (z) { return x + w / 2 + 0.5 <= z[0] || x - w / 2 - 0.5 >= z[1]; }); }, slide = function (x, d) { for (var n = 0; n < 600 && !fr(x); n++) x += d * 0.5; return x; };
      if (q.tx !== '' && q.tx != null) c = mid + sg * (+q.tx || 0);
      else if (hi - lo >= w + 0.8 && fr(mid)) c = mid;
      else { var a0 = lo - 2.4 - w / 2, b0 = hi + 2.4 + w / 2, a = slide(a0, -1), b = slide(b0, 1); c = a0 - a <= 1.5 * w ? a : b - b0 <= 1.5 * w ? b : a0 - a <= b - b0 ? a : b; } /* fora: antes do início (ou depois do fim), afastado só o preciso para ficar livre */
      Q.push([c - w / 2, c + w / 2]); if (q === it) res = { text: v, tx: HX.r3 ? HX.r3(sg * (c - mid)) : sg * (c - mid) };
    });
    return res;
  };
  /* a cota do ramo fica por fora da pilha de cotas da etiqueta separada */
  var td0 = HX.physTagDims;
  if (td0) HX.physTagDims = function (sh, segId) { var n = td0.apply(this, arguments);
    return sh.items.some(function (t) { return t.type === 'ptag' && t.style === 'etiqtr' && t.seg === segId && t.dim === false && !(+t.dimOff > 0) && sh.items.some(function (q) { return q.type === 'pdimx' && q.a && q.a.of === t.id && q.a.k; }); }) ? Math.max(n, 3) : n; };
  var xd0 = EXT.pdimx.draw;
  EXT.pdimx.draw = function (g, it, p, s, o) {
    var C = HX.physCtx(p, s, o), P = HX.tagDimPlace(it, C); if (!P) return xd0.apply(this, arguments);
    var t0 = it.text, x0 = it.tx; it.text = P.text; it.tx = P.tx; try { return xd0.apply(this, arguments); } finally { it.text = t0; it.tx = x0; }
  };
  /* PADRÃO: toda etiqueta (padrão da casa) já nasce com as cotas separadas — editáveis uma a uma, com tolerância.
     Feito dentro da mesma alteração (desfazer junto) e ao abrir projetos antigos. */
  function pend(sh) { return sh.items.filter(function (t) { return t.type === 'ptag' && t.style === 'etiqtr' && t.dim !== false && !t._nosplit; }); }
  HX.tagSplitAll = function (doc) {
    var n = 0, nop = typeof Proxy !== 'undefined' ? new Proxy({}, { get: function () { return f; } }) : { push: f, pop: f, style: f, line: f, poly: f, rect: f, circle: f, text: f, image: f, arc: f, path: f, ellipse: f }; function f() { return false; }
    doc.p.sheets.forEach(function (sh, si) { if (!HX.isPhys(sh) || !pend(sh).length) return; var o = {}; pend(sh).forEach(function (t) { try { EXT.ptag.draw(nop, t, doc.p, si, o); } catch (e) { /* sem posição: fica para depois */ } }); /* só as etiquetas (pontos _kp) */
      pend(sh).forEach(function (t) { var r = HX.tagSplitDims(doc, t); if (r.length) n += r.length; else HX.physHide(t, '_nosplit', 1); }); });
    return n;
  };
  HX.tagResetDims = function (doc, t) { var sh = doc.p.sheets.filter(function (q) { return q.items.indexOf(t) >= 0; })[0]; if (!sh) return;
    sh.items = sh.items.filter(function (q) { return !(q.type === 'pdimx' && q.a && q.a.of === t.id && q.a.k); }); t.dim = true; HX.physHide(t, '_nosplit', 0); };
  var D = HX.Doc && HX.Doc.prototype;
  if (D) { var ch0 = D.change, ld0 = D.load;
    D.change = function () { var self = this, a = arguments, f = a[1]; return ch0.call(this, a[0], function () { var r = f.apply(this, arguments); if (HX.TAG_AUTO_SPLIT !== false) HX.tagSplitAll(self); return r; }); };
    if (ld0) D.load = function () { var r = ld0.apply(this, arguments); if (HX.TAG_AUTO_SPLIT !== false) HX.tagSplitAll(this); return r; }; }
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
