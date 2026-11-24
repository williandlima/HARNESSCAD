/* Lista de fiação em texto → esquema (wiretext*.js): leitura, erros por linha, conectores declarados, emendas, pinos alinhados */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function nets(d) { return HX.buildNetlist(d.p).nets.map(function (n) { return n.pins.map(function (t) { return t.ref + ':' + t.pin; }).sort(HX.natCmp).join(' '); }).sort(); }
function cena() { var d = new HX.Doc(), c = d.add(HX.makeConn(d, 'D38999:13-98', 40, 40)); c.ref = 'J1'; return d; }
console.log('Lista de fiação em texto');
test('lista: formas das pontas (J1:A, J1-A, J1A, pino herdado), seta, atributos e erros por linha', function () {
  var d = cena(), P = HX.wtParse(d, 'J2 = D38999:13-98\nJ3 = D38999:13-98 P   # macho\nJ1:A > J2:B, J2:C\nJ1B -> J3:D,E | 22 PR "SINAL_X"\nJ1-C → J2-A e J3.F\nJ9:A > J1:D\nJ1:Z > J2:A\nJ1:A J2:B\nJ5 = NAO:EXISTE');
  eq(P.conns.map(function (c) { return c.ref + '/' + c.gender; }), ['J2/', 'J3/P']);
  eq(P.links.map(function (l) { return l.src.ref + ':' + l.src.pin + '>' + l.dst.map(function (e) { return e.ref + ':' + e.pin; }).join(','); }), ['J1:A>J2:B,J2:C', 'J1:B>J3:D,J3:E', 'J1:C>J2:A,J3:F']);
  eq(P.links[1].props, { gauge: '22', color: 'BK', name: 'SINAL_X' }, 'PR = preto, nome entre aspas');
  eq(P.errors.map(function (e) { return e.line; }), [6, 7, 8, 9]); ok(/J9/.test(P.errors[0].msg) && /pino "Z"/.test(P.errors[1].msg) && /origem > destino/.test(P.errors[2].msg) && /catálogo/.test(P.errors[3].msg));
});
test('lista: desenha conectores declarados e as redes exatamente como escritas (pinos alinhados não se encostam)', function () {
  var d = cena(), P = HX.wtParse(d, 'J2 = D38999:13-98\nJ3 = D38999:13-98\nJ1:A > J2:B, J2:C\nJ1B > J3:D,E\nJ1:C > J2:A\nJ1:D > J2:D, J3:A\nJ1:E > J2:E'), r;
  eq(P.errors, []); d.change('l', function () { r = HX.wtApply(d, P); });
  eq(r.conns.map(function (c) { return c.ref; }), ['J2', 'J3']);
  eq(nets(d), ['J1:A J2:B J2:C', 'J1:B J3:D J3:E', 'J1:C J2:A', 'J1:D J2:D J3:A', 'J1:E J2:E']);
  eq(HX.buildNetlist(d.p).midTouches.length, 0, 'nenhuma ponta encostando no meio de outro fio');
  ok(d.items().some(function (i) { return i.type === 'splice'; }), 'emenda (bolinha) nas derivações');
});
test('lista: ligação já existente é pulada; texto gerado do esquema volta à mesma ligação', function () {
  var d = cena(), r; d.change('l', function () { HX.wtApply(d, HX.wtParse(d, 'J2 = D38999:13-98\nJ1:A > J2:B, C')); });
  d.change('l2', function () { r = HX.wtApply(d, HX.wtParse(d, 'J1:A > J2:C\nJ1:B > J2:A')); });
  eq(r.skipped, ['J1:A→J2:C']); var t = HX.wtFromDoc(d); eq(t, 'J1:A > J2:B, C\nJ1:B > J2:A');
  var e = cena(); e.change('x', function () { HX.wtApply(e, HX.wtParse(e, 'J2 = D38999:13-98\n' + t)); }); eq(nets(e), nets(d), 'reaplicar o texto gerado reproduz o esquema');
});
