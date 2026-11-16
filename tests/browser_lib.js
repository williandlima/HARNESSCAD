/* HarnessCAD - adaptador para rodar os testes no navegador (tests/testes.html), sem Node */
(function () {
  'use strict';
  var out = document.getElementById('out'), R = { pass: 0, fail: 0 }, HX = window.HX;
  function log(t, cls) { var d = document.createElement('div'); d.textContent = t; if (cls) d.className = cls; out.appendChild(d); }
  var origLog = console.log; console.log = function (t) { log(String(t), /^[A-ZÁ-Ú]/.test(String(t)) ? 'h' : ''); origLog.apply(console, arguments); };
  function test(name, fn) {
    try { fn(); R.pass++; log('  ok   ' + name, 'ok'); } catch (e) { R.fail++; log('  FALHA ' + name + ' — ' + e.message, 'err'); }
  }
  function eq(a, b, m) { var A = JSON.stringify(a), B = JSON.stringify(b); if (A !== B) throw new Error((m || '') + ' esperado ' + B + ' obtido ' + A); }
  function ok(v, m) { if (!v) throw new Error(m || 'falso'); }
  function setup() {
    var d = new HX.Doc(); d.p.defaults.connWu = 0; // largura automática (geometria de referência dos testes)
  var a = d.add(HX.makeConn(d, 'D38999:11-35', 50, 50)), b = d.add(HX.makeConn(d, 'DT:4 vias', 150, 50));
    b.mx = true; return { d: d, a: a, b: b, A: HX.connLayout(a, 2.5).pins, B: HX.connLayout(b, 2.5).pins };
  }
  // Buffer mínimo para o teste de PDF
  window.Buffer = { from: function (u8) { return { toString: function () { var s = ''; for (var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return s; } }; } };
  var lib = { HX: HX, ops: HX.ops, test: test, eq: eq, ok: ok, setup: setup, R: R, fs: null, path: null };
  window.require = function () { return lib; };
  window.addEventListener('load', function () { log('\n' + R.pass + ' passaram, ' + R.fail + ' falharam', R.fail ? 'err' : 'ok'); document.title = (R.fail ? '✗ ' : '✓ ') + document.title; });
})();
