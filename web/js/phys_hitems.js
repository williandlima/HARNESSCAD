/* HarnessCAD - BIBLIOTECA DE ITENS DA CABLAGEM (fase de customização), organizada em ALÇAS (abas): Adaptadores, Botas,
   Cordoalhas, Luvas de solda, Transições, Capas, Kits de retenção, Espaguetes, Amarração, Etiquetas. Cada alça tem os
   itens do segmento em vários tamanhos e tipos (tabelas dos datasheets: phys_hitems3.js) e aceita item novo do usuário
   ('USR:ITEM:<id>' na biblioteca compartilhada). APLICAÇÃO de cada item (como entra na cablagem):
   bs / boot = peça desenhada no conector (HX.PDS); acc = acessório do conector (lista de materiais); cover = cobertura do
   ramo por comprimento (PSPR cat 'cov'); pacc = item num ponto do ramo (PACC); trans = transição no nó de derivação;
   hood = capa do D-Sub; tag = etiqueta de identificação. Modelo dos CADs de chicote (E3, Capital, EPLAN, Altium). */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.HGRP = [['adapt', 'Adaptadores'], ['boot', 'Botas'], ['braid', 'Cordoalhas'], ['ssl', 'Luvas de solda'], ['trans', 'Transições'], ['cap', 'Capas'],
    ['ret', 'Kits de retenção'], ['shr', 'Espaguetes'], ['tie', 'Amarração'], ['lbl', 'Etiquetas']];
  HX.HITEM_CATS = {}; HX.HGRP.forEach(function (g) { HX.HITEM_CATS[g[0]] = g[1]; });
  /* aplicações permitidas por alça (a 1ª é a padrão de item novo) */
  HX.HUSE = { adapt: ['bs', 'acc'], boot: ['boot', 'acc'], braid: ['cover', 'acc'], ssl: ['acc', 'pacc'], trans: ['trans'], cap: ['acc', 'hood'],
    ret: ['acc'], shr: ['cover', 'acc'], tie: ['pacc', 'acc'], lbl: ['tag', 'acc'] };
  HX.HUSE_N = { bs: 'Adaptador desenhado no conector', boot: 'Bota desenhada no conector', acc: 'Acessório do conector (lista de materiais)', cover: 'Cobertura do ramo (por comprimento)',
    pacc: 'Item num ponto do ramo', trans: 'Transição no nó de derivação', hood: 'Capa do D-Sub', tag: 'Etiqueta de identificação' };
  HX.HITEMS = {};
  /* registra um item e liga às estruturas existentes */
  HX.hitemAdd = function (k, it) {
    it.k = k; it.un = it.un || 'pç'; it.per = it.per || 'un'; it.use = it.use || HX.HUSE[it.grp][0]; HX.HITEMS[k] = it;
    if (it.use === 'cover' && HX.PSPR) { var id = it.spr || 'hc_' + k.replace(/[^\w]/g, '_'), b = HX.PSPR[it.cov || 'cov_shrink'] || HX.PSPR.cov_shrink;
      if (!HX.PSPR[id] && b) HX.PSPR[id] = Object.assign({}, b, { id: id, name: it.n, cat: 'cov', pn: it.pn || '', clone: 1 }); it.spr = id; }
    if (it.use === 'pacc' && HX.PACC) { var pk = it.kind || 'hp_' + k.replace(/[^\w]/g, '_'); if (!HX.PACC[pk]) HX.PACC[pk] = { n: it.n, bom: 1 };
      var SH = HX.PACC_SHAPES; if (SH && !SH[pk]) SH[pk] = SH[it.shape] || SH.marker; it.kind = pk; }
    return it;
  };
  /* ---------- itens do usuário ---------- */
  function str(v, n) { return String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, n); }
  var OLD = { conn: 'cap', shield: 'ssl', wire: 'shr', cons: 'ret', cov: 'shr', point: 'tie' }; /* categorias da v1.7.9 */
  HX.hitemSanitize = function (v) {
    v = v || {}; var grp = HX.HITEM_CATS[v.grp] ? v.grp : OLD[v.cat] || (HX.HITEM_CATS[v.cat] ? v.cat : 'cap'), U = HX.HUSE[grp], fam = str(v.fam, 20);
    var use = U.indexOf(v.use) >= 0 ? v.use : v.cat === 'cov' ? 'cover' : v.cat === 'point' ? 'pacc' : U[0];
    return { grp: grp, use: use, n: str(v.n, 80) || 'Item', pn: str(v.pn, 60), mfr: str(v.mfr, 60), desc: str(v.desc, 200),
      un: /^(pç|m|mm|g|kg|ml)$/.test(v.un) ? v.un : (use === 'cover' ? 'm' : 'pç'), per: v.per === 'pin' ? 'pin' : 'un', len: +v.len > 0 ? Math.min(1e5, +v.len) : 0,
      cov: /^cov_(shrink|braid|conduit|spiral)$/.test(v.cov) ? v.cov : (grp === 'braid' ? 'cov_braid' : 'cov_shrink'), pds: /^[\w-]{1,40}$/.test(v.pds || '') ? v.pds : '',
      fam: /^[\w-]*$/.test(fam) ? fam : '', shell: +v.shell > 0 && +v.shell < 100 ? Math.round(+v.shell) : 0, user: 1 };
  };
  HX.hitemUserKey = function (id) { return 'USR:ITEM:' + id; };
  HX.hitemsFromLib = function (lib) {
    Object.keys(lib || {}).forEach(function (k) { var m = /^USR:ITEM:([\w-]{1,40})$/.exec(k), e = lib[k]; if (m && e && e.item) HX.hitemAdd('u:' + m[1], HX.hitemSanitize(e.item)); });
  };
  var ll = HX.onLibLoad; HX.onLibLoad = function (lib) { if (ll) ll(lib); try { HX.hitemsFromLib(lib); } catch (e) { /* biblioteca inválida */ } };
  HX.hitemLabel = function (it) { return it.n + (it.mfr ? ' — ' + it.mfr : '') + (it.desc ? ' (' + it.desc.slice(0, 70) + ')' : ''); };
  /* itens das alças grps (todas se vazio) */
  HX.hitemsOf = function (grps) { return Object.keys(HX.HITEMS).filter(function (k) { return !grps || !grps.length || grps.indexOf(HX.HITEMS[k].grp) >= 0; }); };
  /* o item serve no conector c? (família e carcaça, quando o item tem) */
  HX.hitemFits = function (it, c) {
    if (!it.fam) return true; var df = c && HX.CAT.conns[c.part]; if (!df) return false;
    return String(it.fam).split(',').indexOf(df.fam) >= 0 && (!it.shell || it.shell === (HX.shellOf ? HX.shellOf(c) : 0));
  };
})(typeof window !== 'undefined' ? window : globalThis);
