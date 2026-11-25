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
function presos() { /* J1 e J2 com pinos para o mesmo lado e já com fio: não dá para espelhar, o traçado precisa contornar */
  var d = cena(), b = d.add(HX.makeConn(d, 'D38999:13-98', 200, 40)); b.ref = 'J2'; var a = d.items()[0], P = function (c, i) { return HX.connLayout(c, 2.5).pins[i].pt; };
  d.change('w', function () { [a, b].forEach(function (c) { HX.ops.addWire(d, [P(c, 9), [P(c, 9)[0] + 5, P(c, 9)[1]]]); }); }); return d; }
test('lista: contorno com conectores que não podem ser espelhados — cada ligação na sua pista, sem curto', function () {
  var d = presos(), r; d.change('l', function () { r = HX.wtApply(d, HX.wtParse(d, 'J1:A > J2:B\nJ1:C > J2:D\nJ1:E > J2:F\nJ1:B > J2:A, J2:C')); });
  eq(r.failed, []); eq(nets(d), ['J1:A J2:B', 'J1:B J2:A J2:C', 'J1:C J2:D', 'J1:E J2:F', 'J1:K', 'J2:K']); eq(HX.buildNetlist(d.p).midTouches.length, 0);
});
test('lista: sem caminho livre a ligação é desfeita e volta como "não traçada" (nunca fica curto)', function () {
  var d = presos(), r0 = HX.wtRouter, r, n0 = nets(d), w0 = d.items().filter(function (i) { return i.type === 'wire'; }).length;
  HX.wtRouter = function () { var R = r0.apply(this, arguments); R.around = function () { return null; }; return R; };
  try { d.change('l', function () { r = HX.wtApply(d, HX.wtParse(d, 'J1:A > J2:B\nJ1:C > J2:D'), { noFallback: true }); }); } finally { HX.wtRouter = r0; }
  eq(r.failed, [1, 2]); eq(nets(d), n0, 'esquema intacto'); eq(d.items().filter(function (i) { return i.type === 'wire'; }).length, w0);
});
test('lista: # dentro de aspas, J1/J11 ambíguo, folha atual só, aviso de espelhamento', function () {
  var d = cena(), c = d.add(HX.makeConn(d, 'D38999:13-98', 40, 140)); c.ref = 'J11';
  var P = HX.wtParse(d, 'J2 = D38999:13-98\nJ1:A > J2:B | "SINAL#1"  # comentário\nJ11A > J2:C\nJ1:B > J2:D');
  eq(P.links[0].props.name, 'SINAL#1'); ok(P.errors.length === 0, JSON.stringify(P.errors));
  var Q = HX.wtParse(d, 'J1A > J11:B'); eq(Q.links.length, 1, 'J1A: só J1 tem pino A (J11 também tem A, mas "J1A" não começa com J11)');
  var e = cena(); e.p.sheets.push({ name: 'F2', items: [] }); var o = e.add(HX.makeConn(e, 'D38999:13-98', 200, 40)); o.ref = 'J2';
  e.change('x', function () { HX.wtApply(e, HX.wtParse(e, 'J1:A > J2:A')); }); e.sheet = 1; eq(HX.wtFromDoc(e), '', 'outra folha não entra'); e.sheet = 0; eq(HX.wtFromDoc(e), 'J1:A > J2:A');
  var f = cena(), r; f.change('l', function () { r = HX.wtApply(f, HX.wtParse(f, 'J2 = D38999:13-98\nJ1:A > J2:A')); }); ok(Array.isArray(r.flipped), 'lista de espelhados devolvida');
});
test('lista: "J111" com J1 e J11 de pinos numéricos é ambíguo (J1:11 ou J11:1) e pede ":"', function () {
  var d = new HX.Doc(); ['J1', 'J11', 'J2'].forEach(function (r, i) { var c = d.add(HX.makeConn(d, 'D38999:15-35', 40 + 120 * i, 40)); c.ref = r; });
  var P = HX.wtParse(d, 'J111 > J2:3\nJ1:11 > J2:4'); eq(P.links.length, 1); ok(/ambíguo/.test(P.errors[0].msg) && /J1:11/.test(P.errors[0].msg) && /J11:1/.test(P.errors[0].msg), P.errors[0].msg);
});
