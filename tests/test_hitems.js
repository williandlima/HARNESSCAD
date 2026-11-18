/* Itens da cablagem (customização no físico): biblioteca, itens do usuário, acessórios no conector, trava do esquema */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function folha() {
  var d = new HX.Doc(), P = d.add(HX.makeConn(d, 'D38999:21-39', 40, 30)), J = d.add(HX.makeConn(d, 'D38999:21-39', 200, 30)); J.mx = true;
  var LP = HX.connLayout(P, 2.5).pins, LJ = HX.connLayout(J, 2.5).pins; d.change('w', function () { HX.ops.addWire(d, [LP[0].pt, LJ[0].pt]); HX.ops.addWire(d, [LP[1].pt, LJ[1].pt]); });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line' }); }); return { d: d, P: P, r: r, sh: d.p.sheets[r.index] };
}
test('biblioteca: categorias e itens comuns ligados a cobertura (PSPR), item no ramo (PACC) e campos do nó', function () {
  ['conn', 'shield', 'wire', 'cons', 'cov', 'point'].forEach(function (c) { ok(HX.hitemsOf([c]).length >= 3, c); });
  eq(HX.HITEMS['h:cov_shrink'].spr, 'cov_shrink'); eq(HX.PSPR[HX.HITEMS['h:cov_pet'].spr].cat, 'cov', 'nova cobertura entra no seletor do ramo');
  eq(HX.HITEMS['h:tie'].kind, 'tie'); ok(HX.PACC[HX.HITEMS['h:tiemount'].kind], 'novo item de ramo'); eq(HX.HITEMS['h:boot'].node, 'bootKind');
});
test('item do usuário (fora da biblioteca): saneado, salvo como USR:ITEM e usável como cobertura / ponto / acessório', function () {
  var lib = { 'USR:ITEM:capa-x': { item: { cat: 'conn', n: 'Tampa c/ corrente', pn: 'DC-21<x>', mfr: 'ACME', un: 'pç', fam: 'D38999', shell: 21 } },
    'USR:ITEM:tubo-y': { item: { cat: 'cov', n: 'Tubo silicone Ø12', pn: 'SIL-12', cov: 'cov_conduit' } }, 'USR:ITEM:../x': { item: { n: 'mau' } } };
  HX.hitemsFromLib(lib); var a = HX.HITEMS['u:capa-x'], t = HX.HITEMS['u:tubo-y'];
  eq(a.pn, 'DC-21 x '.trim()); ok(a.user && a.fam === 'D38999' && a.shell === 21); eq(HX.PSPR[t.spr].name, 'Tubo silicone Ø12'); ok(!HX.HITEMS['u:../x'], 'chave inválida ignorada');
});
test('acessórios no conector: lista de materiais, quantidade por contato ligado, balão do conector e vínculo', function () {
  var F = folha(), n = F.sh.items.filter(function (i) { return i.type === 'pnode' && i.nkind === 'conn' && HX.physSchem(F.d.p)[i.of] === F.P; })[0];
  ok((n.acc || []).some(function (a) { return a.k === 'u:capa-x'; }), 'item vinculado à família/carcaça entra sozinho na folha nova');
  n.acc.push({ k: 'h:solsl', q: '', pn: 'RNF-3/32' }); eq(HX.connWiredPins(F.d.p, F.P), 2);
  var B = HX.physBom(F.d.p, F.sh), r = B.rows.filter(function (q) { return q.pn === 'RNF-3/32'; })[0];
  ok(r && r.qty === 20 && r.un === 'mm', 'espaguete na solda = 2 contatos × 10 mm: ' + JSON.stringify(r)); ok(B.assoc[n.id].indexOf(r.k) >= 0, 'no balão do conector');
  ok(B.rows.some(function (q) { return /Tampa c\/ corrente — ACME/.test(q.desc); }));
});
test('trava: no físico não se apaga conector/emenda (definido no esquema); item de customização apaga', function () {
  var F = folha(), d = F.d; d.sheet = F.r.index; var n = F.sh.items.filter(function (i) { return i.type === 'pnode' && i.nkind === 'conn'; })[0], t = F.sh.items.filter(function (i) { return i.type === 'ptag'; })[0];
  ok(HX.physLocked(d, n)); d.sel = new Set([n.id, t.id]); HX.ops.deleteSel(d);
  ok(F.sh.items.indexOf(n) >= 0, 'conector continua'); ok(F.sh.items.indexOf(t) < 0, 'etiqueta (customização) apagada');
});
