/* Itens da cablagem (customização no físico): alças, tamanhos, itens do usuário, aplicar, lista de materiais, trava */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function folha(a, b) {
  var d = new HX.Doc(), P = d.add(HX.makeConn(d, a || 'D38999:21-39', 40, 30)), J = d.add(HX.makeConn(d, b || 'D38999:21-39', 200, 30)); J.mx = true;
  var LP = HX.connLayout(P, 2.5).pins, LJ = HX.connLayout(J, 2.5).pins; d.change('w', function () { HX.ops.addWire(d, [LP[0].pt, LJ[0].pt]); HX.ops.addWire(d, [LP[1].pt, LJ[1].pt]); });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line' }); }); var sh = d.p.sheets[r.index], S = HX.physSchem(d.p);
  return { d: d, P: P, r: r, sh: sh, n: sh.items.filter(function (i) { return i.type === 'pnode' && i.nkind === 'conn' && S[i.of] === P; })[0], sg: sh.items.filter(function (i) { return i.type === 'pseg'; })[0] };
}
test('10 alças na ordem pedida, cada uma com vários tamanhos/tipos', function () {
  eq(HX.HGRP.map(function (g) { return g[1]; }), ['Adaptadores', 'Botas', 'Cordoalhas', 'Luvas de solda', 'Transições', 'Capas', 'Kits de retenção', 'Espaguetes', 'Amarração', 'Etiquetas']);
  HX.HGRP.forEach(function (g) { ok(HX.hitemsOf([g[0]]).length >= 4, g[1] + ': ' + HX.hitemsOf([g[0]]).length); });
  eq(HX.HITEMS['h:adapt:pre_j:20'].pn, 'M85049/109-20TW11-6'); eq(HX.HITEMS['h:adapt:adp88:21'].pn, 'M85049/88-21W03'); eq(HX.PDS.adp88.H(21), 41.68, 'Ø A da tabela');
  eq(HX.HITEMS['h:boot:202K142'].pn, '202K142-25-0'); eq(HX.HITEMS['h:tie:pclip:8'].pn, 'MS21919WDG8'); ok(/3,18 \/ recuperado 1,59/.test(HX.HITEMS['h:shr:RNF-100:p:1/8'].desc));
});
test('aplicar: adaptador/bota no conector (com PN escolhido na lista), cobertura e amarração no ramo, encaixe por família/carcaça', function () {
  var F = folha(), d = F.d, n = F.n;
  ok(/não serve/.test(HX.hitemApply(d, 'h:adapt:pre_j:20', n)), 'Pre-Shield J não serve no D38999');
  eq(HX.hitemApply(d, 'h:adapt:adp88:21', n), ''); eq(n.bsKind, 'adp88'); eq(HX.hitemApply(d, 'h:boot:202K163', n), ''); eq(n.bootPN, '202K163-25-0');
  eq(HX.hitemApply(d, 'h:shr:DR-25:p:1/2', F.sg), ''); eq([F.sg.cover, F.sg.coverTxt], ['cov_shrink', 'DR-25-1/2']);
  var na = F.sh.items.length; eq(HX.hitemApply(d, 'h:tie:pclip:8', F.sg), ''); eq(F.sh.items.length, na + 1);
  ok(/ramo/.test(HX.hitemApply(d, 'h:braid:10', n)), 'cordoalha pede ramo');
  var B = HX.physBom(d.p, F.sh); ok(B.rows.some(function (r) { return r.pn === 'M85049/88-21W03'; }) && B.rows.some(function (r) { return r.pn === '202K163-25-0'; }), 'PN escolhidos na lista');
  ok(B.rows.some(function (r) { return r.pn === 'MS21919WDG8'; }));
});
test('item do usuário numa alça: saneado, USR:ITEM, vínculo entra sozinho na folha nova; categoria antiga migra', function () {
  HX.hitemsFromLib({ 'USR:ITEM:capa-x': { item: { grp: 'cap', n: 'Tampa c/ corrente', pn: 'DC-21<x>', mfr: 'ACME', fam: 'D38999', shell: 21 } },
    'USR:ITEM:velho': { item: { cat: 'cov', n: 'Tubo silicone', pn: 'SIL-12' } }, 'USR:ITEM:../x': { item: { n: 'mau' } } });
  var a = HX.HITEMS['u:capa-x'], v = HX.HITEMS['u:velho']; eq(a.grp, 'cap'); eq(a.use, 'acc'); eq([v.grp, v.use], ['shr', 'cover']); ok(HX.PSPR[v.spr], 'cobertura nova'); ok(!HX.HITEMS['u:../x']);
  var F = folha(); ok((F.n.acc || []).some(function (x) { return x.k === 'u:capa-x'; }), 'vinculado entra sozinho');
  F.n.acc.push({ k: 'h:solsl', q: '', pn: 'RNF-3/32' }); var r = HX.physBom(F.d.p, F.sh).rows.filter(function (q) { return q.pn === 'RNF-3/32'; })[0];
  ok(r && r.qty === 20 && r.un === 'mm', 'espaguete na solda = 2 contatos × 10 mm');
});
test('trava: no físico não se apaga conector/emenda (definido no esquema); item de customização apaga', function () {
  var F = folha(), d = F.d; d.sheet = F.r.index; var t = F.sh.items.filter(function (i) { return i.type === 'ptag'; })[0];
  ok(HX.physLocked(d, F.n)); d.sel = new Set([F.n.id, t.id]); HX.ops.deleteSel(d);
  ok(F.sh.items.indexOf(F.n) >= 0, 'conector continua'); ok(F.sh.items.indexOf(t) < 0, 'etiqueta apagada');
});
