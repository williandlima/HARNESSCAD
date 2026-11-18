/* HarnessCAD - BIBLIOTECA DE ITENS DA CABLAGEM (fase de customização), no modelo dos CADs de chicote (E3.series
   "assembly parts", Capital "harness components/accessories", EPLAN Harness "coverings/accessories", Altium Harness):
   cada item tem CATEGORIA e o lugar onde se anexa — no CONECTOR (acessórios, terminação de blindagem, por fio/contato,
   consumíveis), no RAMO por comprimento (coberturas) ou num PONTO do ramo (abraçadeira, P-clip, passa-fio…).
   Itens do usuário (fora da biblioteca): 'USR:ITEM:<id>' na biblioteca compartilhada, com PN, fabricante, características,
   unidade, quantidade por (unidade / contato ligado) e vínculo à família/carcaça do conector. */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.HITEM_CATS = { conn: 'Acessório do conector', shield: 'Terminação de blindagem', wire: 'Por fio / contato', cons: 'Consumível',
    cov: 'Cobertura do ramo (por comprimento)', point: 'Item num ponto do ramo' };
  /* onde: 'acc' = lista de acessórios do nó do conector (lista de materiais); 'pacc' = item no ramo; 'cov' = cobertura
     do ramo; 'node' = campo do nó com desenho (bsKind, bootKind, dsHood, lany). per: 'un' | 'pin' (contato ligado). */
  var B = [
    ['bs', 'conn', 'Adaptador / backshell (desenhado)', { node: 'bsKind' }], ['boot', 'conn', 'Bota termo-retrátil (desenhada)', { node: 'bootKind' }],
    ['hood', 'conn', 'Capa do D-Sub (desenhada)', { node: 'dsHood' }], ['lany', 'conn', 'Barbante do engate rápido (desenhado)', { node: 'lany' }],
    ['dustcap', 'conn', 'Tampa protetora (dust cap)'], ['capcord', 'conn', 'Cordão / corrente da tampa'], ['oring', 'conn', 'Anel de vedação (O-ring) de painel'],
    ['jamnut', 'conn', 'Porca de painel'], ['gasket', 'conn', 'Junta de vedação do flange'], ['cnlabel', 'conn', 'Etiqueta do conector'],
    ['ssleeve', 'shield', 'Luva de solda (blindagem)'], ['cring', 'shield', 'Anel de crimpagem da blindagem'], ['band', 'shield', 'Cinta de blindagem (band strap)'],
    ['drain', 'shield', 'Fio dreno / pigtail', { un: 'mm', len: 100 }],
    ['wmark', 'wire', 'Anilha / marcador de fio', { per: 'pin' }], ['solsl', 'wire', 'Espaguete na solda do contato', { per: 'pin', un: 'mm', len: 10 }],
    ['ferrule', 'wire', 'Terminal / ponteira', { per: 'pin' }],
    ['adh', 'cons', 'Adesivo para bota', { un: 'g' }], ['etape', 'cons', 'Fita isolante', { un: 'm', len: 0.5 }], ['seal', 'cons', 'Selante', { un: 'g' }],
    ['cov_shrink', 'cov', 'Termo-retrátil (espaguete)', { cov: 1 }], ['cov_braid', 'cov', 'Malha de blindagem (cordoalha)', { cov: 1 }],
    ['cov_pet', 'cov', 'Malha expansível (PET)', { cov: 'cov_braid' }], ['cov_conduit', 'cov', 'Conduíte corrugado', { cov: 1 }], ['cov_spiral', 'cov', 'Espiral', { cov: 1 }],
    ['cov_tape', 'cov', 'Fita enrolada (tecido / PVC / Kapton)', { cov: 'cov_shrink' }], ['cov_tube', 'cov', 'Tubo / mangueira', { cov: 'cov_conduit' }],
    ['cov_abr', 'cov', 'Luva anti-abrasão (Nomex)', { cov: 'cov_braid' }],
    ['tie', 'point', 'Abraçadeira', { pacc: 1 }], ['tiemount', 'point', 'Abraçadeira com base', { pacc: 1 }], ['lacing', 'point', 'Barbante de amarração (lacing)', { pacc: 1 }],
    ['pclip', 'point', 'P-clip / braçadeira', { pacc: 1 }], ['admount', 'point', 'Base adesiva', { pacc: 1 }], ['grommet', 'point', 'Ilhós / passa-fio', { pacc: 1 }],
    ['marker', 'point', 'Marcador de identificação', { pacc: 1 }], ['ssleeve_p', 'point', 'Luva de solda no ramo', { pacc: 'ssleeve' }],
    ['loop', 'point', 'Folga de serviço', { pacc: 1 }], ['drip', 'point', 'Laço de gotejamento', { pacc: 1 }]
  ];
  HX.HITEMS = {};
  function base(cov) { return HX.PSPR && (HX.PSPR[cov] || HX.PSPR.cov_shrink); }
  /* registra um item: liga às estruturas existentes (cobertura = PSPR cat 'cov'; ponto = PACC; nó = campo do conector) */
  HX.hitemAdd = function (k, it) {
    it.k = k; it.un = it.un || 'pç'; it.per = it.per || 'un'; HX.HITEMS[k] = it;
    if (it.cat === 'cov' && HX.PSPR) { var id = it.cov === 1 ? k.slice(2) : 'hc_' + k.replace(/[^\w]/g, '_'), b = base(it.cov === 1 ? id : it.cov || 'cov_shrink');
      if (b && !HX.PSPR[id]) HX.PSPR[id] = Object.assign({}, b, { id: id, name: it.n, cat: 'cov', pn: it.pn || '', clone: 1 }); else if (HX.PSPR[id] && it.cov !== 1) HX.PSPR[id].name = it.n; it.spr = id; }
    if (it.cat === 'point' && HX.PACC) { var pk = it.pacc === 1 ? k.slice(2) : typeof it.pacc === 'string' ? it.pacc : 'hp_' + k.replace(/[^\w]/g, '_');
      if (!HX.PACC[pk]) HX.PACC[pk] = { n: it.n, bom: 1 }; var SH = HX.PACC_SHAPES; if (SH && !SH[pk]) SH[pk] = SH[it.shape] || SH[{ tiemount: 'tie', lacing: 'tie', admount: 'pclip' }[pk]] || SH.marker; if (it.pn) HX.PACC[pk].pn = it.pn; it.kind = pk; }
    return it;
  };
  B.forEach(function (b) { HX.hitemAdd('h:' + b[0], Object.assign({ cat: b[1], n: b[2], pn: '' }, b[3] || {})); });
  /* ---------- itens do usuário ---------- */
  function str(v, n) { return String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, n); }
  HX.hitemSanitize = function (v) {
    v = v || {}; var cat = HX.HITEM_CATS[v.cat] ? v.cat : 'conn', fam = str(v.fam, 20);
    return { cat: cat, n: str(v.n, 80) || 'Item', pn: str(v.pn, 60), mfr: str(v.mfr, 60), desc: str(v.desc, 200),
      un: /^(pç|m|mm|g|kg|ml)$/.test(v.un) ? v.un : 'pç', per: v.per === 'pin' ? 'pin' : 'un', len: +v.len > 0 ? Math.min(1e5, +v.len) : 0,
      cov: /^cov_(shrink|braid|conduit|spiral)$/.test(v.cov) ? v.cov : 'cov_shrink', fam: /^[\w-]*$/.test(fam) ? fam : '', shell: +v.shell > 0 && +v.shell < 100 ? Math.round(+v.shell) : 0, user: 1 };
  };
  HX.hitemUserKey = function (id) { return 'USR:ITEM:' + id; };
  HX.hitemsFromLib = function (lib) {
    Object.keys(lib || {}).forEach(function (k) { var m = /^USR:ITEM:([\w-]{1,40})$/.exec(k), e = lib[k]; if (m && e && e.item) HX.hitemAdd('u:' + m[1], HX.hitemSanitize(e.item)); });
  };
  var ll = HX.onLibLoad; HX.onLibLoad = function (lib) { if (ll) ll(lib); try { HX.hitemsFromLib(lib); } catch (e) { /* biblioteca inválida */ } };
  HX.hitemLabel = function (it) { return it.n + (it.mfr ? ' — ' + it.mfr : '') + (it.desc ? ' (' + it.desc.slice(0, 60) + ')' : ''); };
  /* itens por categoria (biblioteca + usuário), para os seletores */
  HX.hitemsOf = function (cats) { return Object.keys(HX.HITEMS).filter(function (k) { return cats.indexOf(HX.HITEMS[k].cat) >= 0; }); };
})(typeof window !== 'undefined' ? window : globalThis);
