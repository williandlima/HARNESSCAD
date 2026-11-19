/* HarnessCAD - CATÁLOGO DE DETALHES TÍPICOS (item 'pdetc'): o usuário escolhe um detalhe do catálogo, insere na folha
   do desenho físico e customiza (cotas, tolerâncias, textos, balões, escala). Cada detalhe é registrado em
   HX.DETC[kind] = { grp, n, desc, ref (norma/datasheet), esc (escala padrão), def {param: valor}, fields [...],
   keys {balão: [regex da chave na lista, regex da descrição]}, draw(c) , bom(it, sh, Bm, P)? }.
   No draw, c = { g, col, X, Y, k (escala), r (raio do balão), P(nome) → valor, S(nome) → texto ('-' = vazio),
   ball(chave, x, y, tx, ty, ref, nota), dim(...), ext(x, y) amplia a caixa }. Grupos em HX.DETC_GRP. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, L = HX.DL; if (!EXT || !L) return;
  HX.DETC = HX.DETC || {};
  HX.DETC_GRP = [['blind', 'Blindagem e cordoalha'], ['fio', 'Preparação de fio (decapagem, crimpagem, emenda)'], ['con', 'Conector e acessórios'], ['feixe', 'Feixe e identificação']];
  HX.DETC_KEYS = { esp: [/^cesp:/, /sob a cordoalha/i], adp: [/^d:(pre_|adp)/, /adaptador/i], barb: [/^barb:/, /barbante/i], cord: [/^u:cov_braid/, /cordoalha/i], ss: [/^ss:/, /luva de solda/i],
    fio: [/^w:/, /^fio\b/i], cont: [/^c:|contato/i, /contato/i], tamp: [/tamp/i, /tampão/i], bota: [/^d:rc_|bota/i, /bota/i], emenda: [/emenda/i, /emenda/i], term: [/termo/i, /termo-retrátil(?! transparente)/i],
    etq: [/^etq:/, /etiqueta/i], espt: [/^esp:/, /espaguete termo-retrátil transparente/i], abr: [/abraçadeira|ms3367/i, /abraçadeira/i] };
  function val(it, D, k) { var v = it[k]; return v === '' || v == null ? D.def[k] : v; }
  HX.detcBallNum = function (it, key, B) {
    var o = it['b_' + key]; if (o !== '' && o != null) return String(o); var K = HX.DETC_KEYS[key], R = (B && B.rows) || []; if (!K) return '?';
    var r = R.filter(function (q) { return K[0].test(q.k); })[0] || R.filter(function (q) { return K[1].test(q.desc || ''); })[0]; return r ? String(r.n) : '?';
  };
  HX.detcRender = function (g, it, D, col, B, ballR) {
    var k = Math.min(10, Math.max(0.05, Math.abs(+val(it, D, 'esc') || D.esc || 1))), /* escala limitada a 0,05–10: negativa/zero não trava a hachura */ X = +it.x || 0, Y = +it.y || 0, bb = { x0: X - 2, y0: Y - 2, x1: X + 10, y1: Y + 10 };
    var c = { g: g, col: col, X: X, Y: Y, k: k, r: ballR || 2.6,
      P: function (n) { var v = val(it, D, n); return v === '' || v == null || isNaN(+v) ? 0 : +v; }, S: function (n) { var v = val(it, D, n); return v === '-' || v == null ? '' : String(v); },
      ext: function (x, y) { bb.x0 = Math.min(bb.x0, x); bb.y0 = Math.min(bb.y0, y); bb.x1 = Math.max(bb.x1, x); bb.y1 = Math.max(bb.y1, y); },
      ball: function (key, x, y, tx, ty, ref, nt) { L.ball(g, HX.detcBallNum(it, key, B), x, y, tx, ty, c.r, col, ref, nt === undefined ? it['nt_' + key] : nt); c.ext(x - c.r - 6, y - c.r); c.ext(x + c.r + 6, y + c.r + 1); },
      dim: function (x0, x1, yd, yr0, yr1, vk, tk, tip) { var v = typeof vk === 'number' ? Math.round(vk * 100) / 100 : it[vk + '_txt'] || c.P(vk); v = String(v).replace('.', ','); L.dim(g, x0, x1, yd, yr0, yr1, v, c.S(tk), tip === undefined ? c.S('tip') : tip, col, +it.fs || 1.6); c.ext(Math.min(x0, x1) - 8, yd - 4); c.ext(Math.max(x0, x1) + 4, yd); }
    };
    D.draw(c);
    var lab = it.label === '' || it.label == null ? (D.label || 'DETALHE') : it.label === '-' ? '' : it.label, ty = bb.y1 + 6;
    if (lab) { g.text(lab, X, ty, { size: 3.2, bold: true, color: col }); if (it.showEsc !== false && k !== 1) g.text('ESC ' + (k >= 1 ? HX.fmtNum(k) + ':1' : '1:' + HX.fmtNum(1 / k)), X, ty + 4, { size: 1.8, color: col }); c.ext(X + HX.textW(lab, 3.2), ty + 5); }
    return bb;
  };
  EXT.pdetc = {
    draw: function (g, it, p, s, o) {
      var D = HX.DETC[it.kind]; if (!D) { HX.physHide(it, '_bb', { x0: +it.x || 0, y0: +it.y || 0, x1: (+it.x || 0) + 20, y1: (+it.y || 0) + 8 }); g.text('Detalhe "' + it.kind + '" não encontrado', +it.x || 0, (+it.y || 0) + 4, { size: 2, color: '#c00' }); return; }
      var C = HX.physCtx(p, s, o), col = C.line ? C.col : (o.theme && o.theme.txt) || '#222'; if (!o._bom) o._bom = HX.physBom(p, C.sh);
      HX.physHide(it, '_bb', HX.detcRender(g, it, D, col, o._bom, +C.sh.ballR || 2.6));
    },
    bbox: function (it) { return it._bb || { x0: +it.x || 0, y0: +it.y || 0, x1: (+it.x || 0) + 10, y1: (+it.y || 0) + 10 }; },
    fields: function (it) {
      var D = HX.DETC[it.kind] || { fields: [], keys: {} }, F = [{ type: 'head', l: 'Detalhe típico — ' + (D.n || it.kind) }, { k: 'label', l: 'Título (vazio = ' + (D.label || 'DETALHE') + ', - = sem título)' },
        { k: 'esc', l: 'Escala do detalhe (vazio = ' + (D.esc || 1) + ':1)', type: 'number', step: 0.5 }, { k: 'tip', l: 'Texto sob as cotas (vazio = ' + (D.def.tip || 'nenhum') + ', - = nenhum)' }, { k: 'fs', l: 'Tamanho do texto das cotas', type: 'number', step: 0.1 }];
      F = F.concat(D.fields || []); var K = Object.keys(D.keys || {});
      if (K.length) { F.push({ type: 'head', l: 'Balões (vazio = nº da lista de materiais)' }); K.forEach(function (q) { F.push({ k: 'b_' + q, l: D.keys[q] }); F.push({ k: 'nt_' + q, l: 'Nota (triângulo) — ' + D.keys[q] }); }); }
      if (D.ref) F.push({ type: 'head', l: 'Referência: ' + D.ref });
      return F;
    }
  };
  /* espaço livre na folha (itens já desenhados) para W × H mm */
  HX.physFreeSpot = function (sh, W, H, dm) { var B = sh.items.map(function (q) { return q._bb; }).filter(Boolean);
    for (var y = 15; y + H < dm[1] - 50; y += 10) for (var x = 15; x + W < dm[0] - 10; x += 10) if (B.every(function (b) { return b.x1 < x || b.x0 > x + W || b.y1 < y || b.y0 > y + H; })) return [x, y];
    return [20, Math.round(dm[1] * 0.42)]; };
  HX.detcAdd = function (doc, kind) {
    var D = HX.DETC[kind]; if (!D) return null; var dm = HX.sheetDims ? HX.sheetDims(doc.p.meta) : [420, 297], sz = D.size || [140, 90], at = HX.physFreeSpot(doc.cur(), sz[0], sz[1], dm);
    return doc.add({ type: 'pdetc', id: doc.uid('a'), kind: kind, x: at[0], y: at[1], label: '', esc: '' });
  };
  /* lista de materiais: o que o detalhe acrescenta (ex.: espaguete sob a cordoalha) */
  var bom = HX.physBom;
  HX.physBom = function (p, sh) {
    var Bm = bom(p, sh), add = false;
    sh.items.forEach(function (it) { var D = it.type === 'pdetc' && HX.DETC[it.kind]; if (D && D.bom) { D.bom(it, sh, Bm, function (k) { return val(it, D, k); }); add = true; } });
    if (add) Bm.rows.forEach(function (q, j) { q.n = j + 1; }); return Bm;
  };
})(typeof window !== 'undefined' ? window : globalThis);
