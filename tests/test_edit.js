/* Testes: manipulação, netlist/ERC/BOM, PDF, tamanho de arquivos */
'use strict';
var L = require('./lib'), HX = L.HX, ops = L.ops, test = L.test, eq = L.eq, ok = L.ok, setup = L.setup, fs = L.fs, path = L.path;
console.log('Manipulação de conectores');
test('arrastar conector leva os fios junto (elástico)', function () {
  var s = setup(), d = s.d; ops.addWire(d, [s.A[0].pt, s.B[0].pt]);
  var m = ops.beginMove(d, [s.b.id], 'drag'); m.apply(10, 20);
  var nb = HX.connLayout(s.b, 2.5).pins[0].pt, w = d.items().filter(function (i) { return i.type === 'wire'; })[0];
  eq(w.pts[w.pts.length - 1], nb); eq(w.pts[0], s.A[0].pt);
  for (var i = 1; i < w.pts.length; i++) ok(w.pts[i][0] === w.pts[i - 1][0] || w.pts[i][1] === w.pts[i - 1][1], 'segmento diagonal');
  m.apply(0, 0); eq(w.pts, [s.A[0].pt, s.B[0].pt], 'cancelar restaura');
});
test('mover (M) desliga os fios', function () {
  var s = setup(), d = s.d; ops.addWire(d, [s.A[0].pt, s.B[0].pt]);
  ops.beginMove(d, [s.b.id], 'move').apply(10, 0);
  ok(HX.runERC(d.p).some(function (e) { return /solta/.test(e.msg); }));
});
test('girar/espelhar mantém ligações', function () {
  var s = setup(), d = s.d; ops.addWire(d, [s.A[0].pt, s.B[0].pt]); ops.addWire(d, [s.A[1].pt, s.B[1].pt]);
  ['rot', 'mx', 'my', 'rot'].forEach(function (k) { ops.transform(d, [s.b], k); });
  var wl = HX.wireList(d.p); eq(wl.map(function (r) { return r.to; }).sort(), ['X1:1', 'X1:2']);
});
test('girar com 4 fios ligados não cria sobreposição/curto', function () {
  var s = setup(), d = s.d;
  for (var i = 0; i < 4; i++) ops.addWire(d, [s.A[i].pt, [100 + i * 5, s.A[i].pt[1]], [100 + i * 5, s.B[i].pt[1]], s.B[i].pt]);
  ops.transform(d, [s.b], 'rot');
  var e = HX.runERC(d.p).filter(function (x) { return x.sev !== 'info'; }).map(function (x) { return x.msg; });
  ok(!e.some(function (m) { return /curto|meio do fio|solta/.test(m); }), e.join(' | '));
});
test('conector bloqueado não se move', function () {
  var s = setup(); s.b.locked = true; var x = s.b.x; ops.beginMove(s.d, [s.b.id], 'drag').apply(10, 0); eq(s.b.x, x);
});
test('alinhar à esquerda e distribuir', function () {
  var d = new HX.Doc(), c = [0, 1, 2].map(function (i) { return d.add(HX.makeConn(d, 'DT:2 vias', 10 + i * 7, 10 + i * 40)); });
  ops.align(d, c, 'l'); eq(c.map(function (x) { return x.x; }), [10, 10, 10]);
  c[2].y = 200; ops.align(d, c, 'dv'); ok(Math.abs((c[1].y - c[0].y) - (c[2].y - c[1].y)) <= 2.5);
});
test('ocultar pinos preserva fios', function () {
  var s = setup(), d = s.d; ops.addWire(d, [s.A[5].pt, s.B[0].pt]);
  var nl = HX.buildNetlist(d.p); ops.keepWires(d, [s.a.id], function () { ops.hideUnused(d, s.a, nl); });
  eq(s.a.hidden.length, 12); eq(HX.wireList(d.p)[0].from, 'J1:6');
});
test('colar gera novas referências', function () {
  var s = setup(), d = s.d, out = ops.pasteItems(d, [s.a, s.b], 0, 100);
  eq(out.map(function (i) { return i.ref; }), ['J2', 'X2']);
});
test('undo/redo', function () {
  var s = setup(), d = s.d; d.change('x', function () { s.a.ref = 'P99'; }); d.undo(); eq(d.find(s.a.id).ref, 'J1'); d.redo(); eq(d.find(s.a.id).ref, 'P99');
});
test('renumerar fios', function () {
  var s = setup(), d = s.d; ops.addWire(d, [s.A[1].pt, s.B[1].pt]); ops.addWire(d, [s.A[0].pt, s.B[0].pt]);
  ops.renumberWires(d, 'F', 10, 10); eq(HX.wireList(d.p).map(function (r) { return r.num + r.from; }), ['F10J1:1', 'F20J1:2']);
});

console.log('Netlist, ERC, BOM');
test('labels conectam entre folhas', function () {
  var s = setup(), d = s.d; d.add({ type: 'label', x: s.A[0].pt[0], y: s.A[0].pt[1], text: 'VCC', style: 'local' });
  d.p.sheets.push({ id: 's2', name: 'F2', items: [] }); d.sheet = 1;
  var c = d.add(HX.makeConn(d, 'DT:2 vias', 0, 0)), p = HX.connLayout(c, 2.5).pins[0].pt;
  d.add({ type: 'label', x: p[0], y: p[1], text: 'VCC', style: 'global' });
  var net = HX.buildNetlist(d.p).nets.filter(function (n) { return n.name === 'VCC'; })[0]; eq(net.pins.length, 2);
});
test('ERC detecta curto, bitola, duplicado', function () {
  var s = setup(), d = s.d; s.a.pins[0].name = '+28V'; s.b.pins[0].name = 'GND'; s.b.ref = 'J1';
  ops.addWire(d, [s.A[0].pt, s.B[0].pt], { gauge: '22' });
  var m = HX.runERC(d.p).map(function (e) { return e.msg; }).join('|');
  ok(/curto/.test(m), 'curto'); ok(/fora da faixa do contato/.test(m), 'bitola'); ok(/duplicada/.test(m), 'dup');
});
test('BOM com contatos e comprimento', function () {
  var s = setup(), d = s.d; d.p.defaults.scrapPct = 0; ops.addWire(d, [s.A[0].pt, s.B[0].pt], { len: 1500, gauge: '20' });
  var bom = HX.buildBOM(d.p), w = bom.filter(function (r) { return r.cat === '5-Fio'; })[0];
  eq(w.qty, 1.5); eq(bom.filter(function (r) { return r.cat === '3-Contato'; }).length, 2);
});
test('CSV com BOM UTF-8 e ;', function () { var c = HX.toCSV([{ a: 'x;y', b: 1 }], [['a', 'A'], ['b', 'B']]); ok(c.charCodeAt(0) === 0xfeff && c.indexOf('"x;y"') > 0); });

console.log('PDF');
test('PDF válido com xref correto em todos os formatos', function () {
  var s = setup(); ops.addWire(s.d, [s.A[0].pt, s.B[0].pt]); s.a.pins[0].name = 'Ação ç ã → Ω';
  Object.keys(HX.SHEETS).forEach(function (sz) {
    ['iso', 'ansi', 'simple', 'none'].forEach(function (t) {
      s.d.p.meta.size = sz; s.d.p.meta.template = t;
      var b = HX.exportPDF(s.d.p, { pinout: true }), str = Buffer.from(b).toString('latin1');
      ok(str.indexOf('%PDF-1.4') === 0 && /%%EOF$/.test(str));
      var xr = +str.match(/startxref\n(\d+)/)[1]; ok(str.substr(xr, 4) === 'xref', 'xref ' + sz);
      var offs = str.slice(xr).split('\n').slice(3).filter(function (l) { return / n $/.test(l); }).map(function (l) { return +l.slice(0, 10); });
      offs.forEach(function (o, i) { ok(str.substr(o, String(i + 1).length + 6) === (i + 1) + ' 0 obj', 'obj ' + (i + 1)); });
    });
  });
});

console.log('Restrição de transferência (< 10 KB por arquivo)');
test('todos os arquivos do projeto < 10.000 bytes', function () {
  if (!fs) return; // no navegador não há acesso ao disco
  var big = [];
  (function walk(dir) {
    fs.readdirSync(dir).forEach(function (f) {
      var p = path.join(dir, f); if (/node_modules|\.git|dados|__pycache__|\.class$|\.exe$|\.ico$/.test(p)) return; // executáveis/ícone: binários do instalador
      if (fs.statSync(p).isDirectory()) return walk(p);
      if (fs.statSync(p).size >= 10000) big.push(path.relative(path.join(__dirname, '..'), p) + ' ' + fs.statSync(p).size);
    });
  })(path.join(__dirname, '..'));
  eq(big, []);
});

