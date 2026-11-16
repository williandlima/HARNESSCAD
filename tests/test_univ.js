/* HarnessCAD - símbolo UNIVERSAL: cantos arredondados do lado das vias, face reta, > macho / < fêmea na face */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
test('universal: contorno arredondado só do lado das vias', function () {
  var P = HX.univOutline(10, 0, 30, false, 2); // vias à esquerda: face reta em x = 10
  eq(P[0], [10, 0], 'começa na face reta'); eq(P[P.length - 1], [10, 30], 'termina na face reta');
  ok(P.some(function (q) { return q[0] > 0 && q[0] < 2 && q[1] > 0 && q[1] < 2; }), 'canto curvo do lado das vias');
  ok(!P.some(function (q) { return q[0] > 8 && q[0] < 10; }), 'face reta sem curva');
  var R = HX.univOutline(10, 0, 30, true, 2); eq(R[0], [0, 0], 'vias à direita: face reta em x = 0');
});
test('universal: macho aponta para fora da face, fêmea abre para a face (igual ao desenho)', function () {
  var m = HX.univChevron(10, 15, 4, false, true), f = HX.univChevron(10, 15, 4, false, false);
  eq(m[1], [10, 15], 'macho: ponta encostada na face'); ok(m[0][0] < 10, 'macho: pernas para dentro  >');
  eq(f[0][0], 10, 'fêmea: pernas na face'); ok(f[1][0] < 10, 'fêmea: ponta para dentro  <');
  var m2 = HX.univChevron(10, 15, 4, true, true); eq(m2[1], [0, 15], 'vias à direita: macho com ponta na face x = 0');
});
test('universal: desenha com letras ou números, em qualquer família', function () {
  ok(HX.CONN_STYLES.some(function (s) { return s[0] === 'univ'; }), 'estilo na lista');
  ['M24308:DE-9', 'D38999:11-35'].forEach(function (part) {
    var d = new HX.Doc(), c = d.add(HX.makeConn(d, part, 0, 0)); c.gstyle = 'univ'; c.gender = 'P';
    var log = [], g = { style: function () {}, rect: function () {}, line: function () {}, circle: function () {}, push: function () {}, pop: function () {}, poly: function (P, cl) { log.push(['poly', P.length, cl]); }, text: function (t) { log.push(['T', String(t)]); } };
    HX.drawConn(g, c, d.p, 0, { theme: HX.THEME });
    ok(log.some(function (l) { return l[0] === 'poly' && l[1] > 10 && l[2]; }), part + ': corpo arredondado');
    ok(log.some(function (l) { return l[0] === 'poly' && l[1] === 3; }), part + ': chevron');
    ok(log.some(function (l) { return l[0] === 'T' && l[1] === String(c.pins[0].n); }), part + ': nº/letra do pino');
  });
});
test('universal customizável: letras/números nos contatos e volta ao catálogo', function () {
  var d = new HX.Doc(), c = d.add(HX.makeConn(d, 'M24308:DE-9', 0, 0)), n0 = c.pins.map(function (p) { return p.n; });
  HX.univRelabel(c, 'let'); eq(c.pins.slice(0, 9).map(function (p) { return p.n; }).join(''), 'ABCDEFGHJ', 'letras sem I');
  HX.univRelabel(c, 'num'); eq(c.pins[8].n, '9'); HX.univRelabel(c, ''); eq(c.pins.map(function (p) { return p.n; }), n0, 'catálogo de volta');
  eq(HX.univLetter(22), 'Z'); eq(HX.univLetter(23), 'a'); eq(HX.univLetter(45), 'AA'); ok(['I', 'O', 'Q'].every(function (x) { for (var i = 0; i < 23; i++) if (HX.univLetter(i) === x) return false; return true; }), 'sem I, O, Q');
});
test('universal customizável: padrão do projeto, cor, branco/sem fundo e aterramento', function () {
  var d = new HX.Doc(), c = d.add(HX.makeConn(d, 'M24308:DE-9', 0, 0)); c.gstyle = 'univ';
  d.p.view.univ = { uFill: '#ffffff', uGnd: 'earth' }; eq(HX.univGet(c, d.p, 'uFill'), '#ffffff', 'herda do projeto'); c.uFill = 'none'; eq(HX.univGet(c, d.p, 'uFill'), 'none', 'conector manda');
  var fills = [], lines = 0, txt = [], g = { style: function (s) { if ('fill' in s) fills.push(s.fill); }, rect: function () {}, circle: function () {}, push: function () {}, pop: function () {}, poly: function () {}, line: function () { lines++; }, text: function (t) { txt.push(t); } };
  c.uGndTxt = 'GND'; HX.drawConn(g, c, d.p, 0, { theme: HX.THEME }); ok(fills.indexOf(null) >= 0 && fills.indexOf('#ffffff') < 0, 'sem preenchimento'); ok(txt.indexOf('GND') >= 0, 'texto do terra');
  var l0 = lines; lines = 0; c.uGnd = 'none'; HX.drawConn(g, c, d.p, 0, { theme: HX.THEME }); ok(lines < l0, 'sem terra desenha menos linhas');
  delete c.uFill; fills = []; HX.drawConn(g, c, d.p, 0, { theme: HX.THEME }); ok(fills.indexOf('#ffffff') >= 0, 'branco do projeto');
});
