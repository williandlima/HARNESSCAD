/* HarnessCAD - RELATÓRIOS DE PRODUÇÃO (v1.9.12):
   - LISTA DE CORTE E MONTAGEM: por fio, na ordem de montagem (conector de origem, depois nº do fio): De/Para, contato de
     cada ponta (pela bitola), decapagem de cada ponta, fio (PN), comprimento, % a mais e COMPRIMENTO DE CORTE, par trançado
     e cabo. HX.cutList(p, nl).
   - LISTA DE TESTE DE CONTINUIDADE: rede por rede, cada ponto ligado ao seguinte (ponta a ponta) para o testador de
     cablagem; redes de um ponto só ficam fora. HX.testList(p, nl).
   Entram no PDF (Imprimir / PDF › seções) e em CSV pelo menu Relatórios. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function ct(e, w) { var t = e && e.term; if (!t || t.kind !== 'pin' || !t.item || !HX.contactFor) return ''; var c = HX.contactFor(t.item, t.pinObj, HX.gaugeAWG ? HX.gaugeAWG(w) : null); return c && c.pn && c.pn !== 'integral' ? c.pn : ''; }
  HX.cutList = function (p, nl) { nl = nl || HX.buildNetlist(p); var R = HX.wireList(p, nl).map(function (r) { return r; });
    R.sort(function (a, b) { var fa = (a.fromEnd && a.fromEnd.ref) || '~', fb = (b.fromEnd && b.fromEnd.ref) || '~'; return HX.natCmp(fa, fb) || HX.natCmp(a.num, b.num); });
    return R.map(function (r, i) { return { ord: i + 1, num: r.num, from: r.from, ctA: ct(r.fromEnd, r.w), stripA: r.stripA || '', to: r.to, ctB: ct(r.toEnd, r.w), stripB: r.stripB || '',
      pn: r.pn, gauge: r.gauge, color: r.color, len: String(r.len == null ? '' : r.len).replace('*', ''), pct: r.pctEff != null ? r.pctEff : '', cut: r.cut == null ? '' : r.cut, twist: r.twist || '', cable: r.cable || '', id: r.id, sheet: r.sheet }; }); };
  HX.testList = function (p, nl) { nl = nl || HX.buildNetlist(p); var out = [], k = 0;
    nl.nets.slice().sort(function (a, b) { return HX.natCmp(a.name || '', b.name || ''); }).forEach(function (n) {
      var P = (n.terms || n.pins).filter(function (t) { return t.kind === 'pin' || t.kind === 'drain'; }).map(function (t) { return t.ref + ':' + t.pin; });
      P = P.filter(function (x, i) { return P.indexOf(x) === i; }).sort(HX.natCmp); if (P.length < 2) return;
      for (var i = 1; i < P.length; i++) out.push({ n: ++k, net: n.name || '', from: P[i - 1], to: P[i], kind: 'Continuidade', ok: '' }); });
    return out; };
  HX.CUT_COLS = [{ k: 'ord', t: 'Ord.', w: 5 }, { k: 'num', t: 'Fio', w: 7 }, { k: 'from', t: 'De', w: 10 }, { k: 'ctA', t: 'Contato De', w: 16 }, { k: 'stripA', t: 'Decap. De', w: 9 },
    { k: 'to', t: 'Para', w: 10 }, { k: 'ctB', t: 'Contato Para', w: 16 }, { k: 'stripB', t: 'Decap. Para', w: 9 }, { k: 'pn', t: 'Fio (PN)', w: 20 }, { k: 'len', t: 'Compr. mm', w: 8 },
    { k: 'pct', t: '% a mais', w: 7 }, { k: 'cut', t: 'Corte mm', w: 8 }, { k: 'twist', t: 'Par', w: 5 }, { k: 'cable', t: 'Cabo', w: 6 }];
  HX.TEST_COLS = [{ k: 'n', t: 'Nº', w: 6 }, { k: 'net', t: 'Circuito', w: 18 }, { k: 'from', t: 'Ponto A', w: 16 }, { k: 'to', t: 'Ponto B', w: 16 }, { k: 'kind', t: 'Teste', w: 14 }, { k: 'ok', t: 'OK / Visto', w: 14 }];
  if (HX.PRINT_SECTIONS) HX.PRINT_SECTIONS.push(
    { id: 'cutlist', t: 'LISTA DE CORTE E MONTAGEM', name: 'Lista de corte e montagem (por fio)', cols: HX.CUT_COLS, rows: function (p, nl) { return HX.cutList(p, nl); } },
    { id: 'testlist', t: 'LISTA DE TESTE DE CONTINUIDADE', name: 'Lista de teste de continuidade (ponto a ponto)', cols: HX.TEST_COLS, rows: function (p, nl) { return HX.testList(p, nl); } });
  /* CSV: menu Arquivo e faixa Relatórios › Exportar */
  function csv(app, nome, rows, cols) { if (!rows.length) return HX.UI && HX.UI.toast('Nada para exportar.', true);
    HX.io.download(HX.io.safeName(app.doc.p.meta.docNo + '_' + nome) + '.csv', HX.toCSV(rows, cols.map(function (c) { return [c.k, c.t]; })), 'text/csv;charset=utf-8'); }
  HX.MENU_EXTRA = HX.MENU_EXTRA || [];
  HX.MENU_EXTRA.push(['Arquivo', function (app) { return ['Lista de corte e montagem (CSV)', function () { csv(app, 'corte', HX.cutList(app.doc.p), HX.CUT_COLS); }, '']; }],
    ['Arquivo', function (app) { return ['Lista de teste de continuidade (CSV)', function () { csv(app, 'teste', HX.testList(app.doc.p), HX.TEST_COLS); }, '']; }]);
})(typeof window !== 'undefined' ? window : globalThis);
