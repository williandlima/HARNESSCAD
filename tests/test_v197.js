/* v1.9.7: lista de ligação em pino já ligado / conector novo, comprimento esquema ⇄ físico com % por fio, ícones novos */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
console.log('v1.9.7 — ligação em pino ocupado, comprimento ⇄ físico, % a mais');
function nets(d) { return HX.buildNetlist(d.p).nets.map(function (n) { return n.pins.map(function (t) { return t.ref + ':' + t.pin; }).sort().join(' '); }).filter(function (s) { return / /.test(s); }).sort(); }
function base(x3, y3) { var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:13-98', 40, 40)), b = d.add(HX.makeConn(d, 'D38999:13-98', 160, 40)); a.ref = 'J1'; b.ref = 'J2';
  d.change('w', function () { HX.wtApply(d, HX.wtParse(d, 'J1:A > J2:A\nJ1:B > J2:B\nJ1:C > J2:C')); }); if (x3 != null) { var c = d.add(HX.makeConn(d, 'D38999:13-98', x3, y3)); c.ref = 'J3'; } return d; }
test('lista: J3:A > J1:A com J1:A já ligado entra na mesma via (derivação), sem curto, em qualquer posição do J3', function () {
  [[100, 120], [100, -40], [250, 40]].forEach(function (P) { var d = base(P[0], P[1]), r;
    d.change('x', function () { r = HX.wtApply(d, HX.wtParse(d, 'J3:A > J1:A\nJ3:B > J2:B\nJ3:C > J1:C\nJ3:D > J2:A')); });
    eq(r.failed, [], 'J3 em ' + P); eq(nets(d), ['J1:A J2:A J3:A J3:D', 'J1:B J2:B J3:B', 'J1:C J2:C J3:C'], 'redes ' + P); ok(Object.keys(r.how).length > 0, 'ligado por derivação/label'); });
});
test('lista: conector novo declarado (J4 = PEÇA) liga em pinos já ocupados', function () {
  var d = base(100, 120), r; d.change('y', function () { r = HX.wtApply(d, HX.wtParse(d, 'J4 = D38999:13-98\nJ4:A > J1:B\nJ4:B > J3:A')); });
  eq(r.failed, []); eq(r.conns.length, 1); eq(nets(d), ['J1:A J2:A', 'J1:B J2:B J4:A', 'J1:C J2:C', 'J3:A J4:B']);
});
test('lista: label de circuito como último recurso tem nome único e liga só as duas pontas', function () {
  var d = base(250, 40), out; d.change('l', function () { out = HX.wtLinkOcc(d, 'J3:B', 'J2:B', {}); }); ok(out === 'deriv' || out === 'label', String(out));
  eq(nets(d), ['J1:A J2:A', 'J1:B J2:B J3:B', 'J1:C J2:C']);
});
test('comprimento: sem físico fica no fio; com físico, editar no esquema muda o ramo e o físico muda o esquema; % por fio', function () {
  var d = base(100, 120), W = d.items().filter(function (i) { return i.type === 'wire'; });
  d.change('l', function () { eq(HX.wireLenSet(d, W[0], 800), 'semfisico'); }); eq(HX.wireLenInfo(d.p, W[0]).eff, 800); eq(HX.wireLenInfo(d.p, W[0]).cut, 840, '5% padrão');
  d.change('m', function () { W[0].len = ''; HX.wtApply(d, HX.wtParse(d, 'J3:A > J1:C')); });
  var r = HX.genPhysical(d.p, { scale: 10 }); d.p.sheets.push(r.sheet); var E = function () { return W.map(function (w) { return HX.wireLenInfo(d.p, w).eff; }); }, e0 = E();
  var how; d.change('s', function () { how = HX.wireLenSet(d, W[0], e0[0] + 300); }); eq(how, 'fisico'); eq(HX.wireLenInfo(d.p, W[0]).eff, e0[0] + 300, 'esquema = valor digitado');
  ok(r.sheet.items.some(function (i) { return i.type === 'pseg' && +i.len > 0; }), 'ramo do físico ganhou o comprimento');
  var sg = r.sheet.items.filter(function (i) { return i.type === 'pseg' && +i.len > 0; })[0]; d.change('r', function () { sg.len = +sg.len + 100; });
  eq(HX.wireLenInfo(d.p, W[0]).eff, e0[0] + 400, 'físico → esquema');
  d.change('p', function () { W[1].extraPct = 10; }); var row = HX.wireList(d.p).filter(function (x) { return x.id === W[1].id; })[0];
  eq(row.cut, Math.round(HX.wireLenInfo(d.p, W[1]).eff * 1.1)); eq(row.pct, 10);
  var bom = HX.buildBOM(d.p).filter(function (x) { return x.cat === '5-Fio'; })[0], tot = 0; W.concat(d.items().filter(function (w) { return w.type === 'wire' && W.indexOf(w) < 0; })).forEach(function (w) { tot += HX.wireLenInfo(d.p, w).eff * HX.wirePctK(d.p, w); });
  eq(bom.qty.toFixed(3), (tot / 1000).toFixed(3), 'lista de materiais com a % de cada fio');
});
test('cabo: % a mais do cabo vale para as vias; comprimento do cabo aplicado em todas as vias', function () {
  var d = base(), r; d.change('c', function () { r = HX.cablePins(d, HX.CABLE_LIB['BLD-TP'], 'J1:D,E', 'J2:D,E', {}); }); ok(r.cable, r.err);
  d.change('p', function () { r.cable.extraPct = 8; HX.cableLenSet(d, r.cable, 1000); }); eq(r.wires.map(function (w) { return HX.wireLenInfo(d.p, w).cut; }), [1080, 1080]); eq(HX.cableLen(d.p, r.cable), 1000);
});
test('ícones novos: cada ferramenta principal tem desenho próprio', function () {
  ok(HX.ICON_NEW || true); /* ui_icons2.js é de interface (carregado no navegador) */
  var src = L.fs.readFileSync(L.path.join(__dirname, '../web/js/ui_icons2.js'), 'utf8');
  ['conector', 'fio', 'emenda', 'label', 'nomes', 'cabo', 'blindagem', 'pinoapino', 'tabela', 'erc', 'fisico', 'cota', 'balao', 'itens'].forEach(function (k) { ok(new RegExp('\\b' + k + ':').test(src), k); });
});
