/* HarnessCAD - deixar o programa mais INTUITIVO:
   (1) DICAS NO DESENHO: folha vazia mostra "por onde começar" (esquema: conector, fio, lista de fiação, pino a pino, cabo;
       físico: gerar a partir do esquema); dicas da barra de status para as ferramentas que não tinham;
   (2) FLUXO GUIADO DO CHICOTE: faixa de etapas no canto inferior esquerdo do desenho —
       1 Conectores → 2 Ligações → 3 Verificar → 4 Desenho físico → 5 Lista/PDF — com ✓/○, o que falta e clique que leva
       à ação. HX.flowState(app) calcula as etapas (testável). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, T = HX.Tools && HX.Tools.prototype; if (!UI || !T) return;
  Object.assign(T.HINTS, { pdimx: 'Cota livre: clique no 1º ponto e no 2º (encaixa em qualquer item) | Alt = ponto livre | Esc cancela',
    pballx: 'Balão: clique no item, no ponto onde vai a seta', ptag: 'Etiqueta: clique no ramo onde vai a etiqueta de identificação',
    pdet: 'Detalhe: clique e arraste a área a ampliar no desenho físico' });
  function cmd(app, t) { var c = (app.commands ? app.commands() : []).filter(function (x) { return x.t.indexOf(t) === 0; })[0]; if (c) c.el.click(); return !!c; }
  HX.flowState = function (app) {
    var p = app.doc.p, sch = p.sheets.filter(function (s) { return !HX.isPhys(s); }), C = 0, W = 0, free = 0, nl = HX.buildNetlist(p);
    sch.forEach(function (s, si) { var k = p.sheets.indexOf(s); s.items.forEach(function (i) { if (i.type === 'conn' && !i.eq) { C++; } if (i.type === 'wire') W++; });
      s.items.forEach(function (c) { if (c.type !== 'conn' || c.eq) return; HX.connLayout(c, p.unit).pins.forEach(function (q) { if (q.name && !nl.connected.has(k + '|' + HX.key(q.pt[0], q.pt[1]))) free++; }); }); });
    var erc = app.ercData ? app.ercData() : [], er = erc.filter(function (e) { return e.sev === 'erro'; }).length, ph = p.sheets.some(HX.isPhys), loose = erc.filter(function (e) { return e.rule === 'loose' || /^Ponta de fio solta/.test(e.msg || ''); }).length;
    return [{ k: 'conn', n: 'Conectores', ok: C >= 2, t: C ? C + ' conector(es)' : 'coloque os conectores (A)' },
      { k: 'wire', n: 'Ligações', ok: W > 0 && !free && !loose, t: !W ? 'ligue os pinos (fio, pino a pino ou lista de fiação)' : loose ? loose + ' ponta(s) de fio solta(s)' : free ? free + ' pino(s) com sinal sem ligação' : W + ' fio(s)' },
      { k: 'erc', n: 'Verificar', ok: W > 0 && !er, t: er ? 'ERC: ' + er + ' erro(s)' : W ? 'sem erros' : 'depois das ligações' },
      { k: 'phys', n: 'Desenho físico', ok: ph, t: ph ? 'gerado' : 'gerar a partir do esquema' },
      { k: 'pdf', n: 'Lista/PDF', ok: false, t: 'relatórios, PDF e DXF' }];
  };
  var CSS = '#hxFlow{position:absolute;left:40px;bottom:8px;z-index:24;display:flex;gap:2px;padding:3px;border-radius:7px;background:var(--panel,#fff);border:1px solid var(--line,#c8cdd6);box-shadow:0 2px 8px rgba(0,0,0,.15);font:12px sans-serif}' +
    '#hxFlow button{border:0;background:transparent;color:var(--txt,#222);padding:3px 8px;border-radius:5px;cursor:pointer;white-space:nowrap}#hxFlow button:hover{background:var(--hov,#e8eef9)}#hxFlow .ok{color:#2a8a3a}#hxFlow .nx{background:var(--acc,#1e6bff);color:#fff}' +
    '#hxFlow .x{opacity:.5;padding:3px 6px}#hxHint{position:absolute;left:50%;top:45%;transform:translate(-50%,-50%);z-index:20;pointer-events:none;text-align:center;color:var(--mut,#667);font:14px sans-serif;line-height:1.9;background:rgba(255,255,255,.9);padding:16px 26px;border-radius:10px;border:1px dashed var(--line,#c8cdd6)}' +
    '#hxHint b{color:var(--txt,#222)}#hxHint kbd{border:1px solid #bbb;border-radius:3px;padding:0 4px;font-size:12px;background:#f6f6f6}';
  var A = HX.App.prototype, init0 = A.init;
  A.init = function () {
    init0.apply(this, arguments); var app = this, wrap = app.view.cv.parentElement; if (!wrap || document.getElementById('hxFlow')) return;
    var s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);
    var fl = document.createElement('div'), hi = document.createElement('div'); fl.id = 'hxFlow'; hi.id = 'hxHint'; wrap.appendChild(fl); wrap.appendChild(hi);
    var hide = HX.io && HX.io.localGet ? HX.io.localGet('hx-flow-off') : false;
    var hiOff = false; /* "Por onde começar" some no primeiro clique no desenho e não volta mais nesta sessão */
    app.view.cv.addEventListener('mousedown', function () { if (!hiOff) { hiOff = true; hi.style.display = 'none'; } }, true);
    var ACT = { conn: function () { app.focusCatalog(); }, wire: function () { UI.wireListDialog ? UI.wireListDialog(app) : app.tools.setTool('wire'); }, erc: function () { app.erc(); },
      phys: function () { var i = app.doc.p.sheets.findIndex(HX.isPhys); if (i >= 0) { app.doc.sheet = i; app.doc.touch(); app.view.fit && app.view.fit(); } else cmd(app, 'Gerar desenho físico'); }, pdf: function () { cmd(app, 'Imprimir') || app.showTab('bom'); } };
    function draw() {
      var it = app.doc.items(), ph = HX.isPhys(app.doc.cur());
      hi.style.display = it.length || hiOff ? 'none' : ''; hi.innerHTML = ph ? '<b>Desenho físico vazio</b><br>Gere a partir do esquema: barra ativa › <b>Atualizar a partir do esquema</b> (ou Ferramentas › Gerar desenho físico)' :
        '<b>Por onde começar</b><br><kbd>A</kbd> conector do catálogo &nbsp;·&nbsp; <kbd>W</kbd> fio &nbsp;·&nbsp; <kbd>Shift</kbd>+<kbd>L</kbd> lista de fiação em texto<br><kbd>Shift</kbd>+<kbd>P</kbd> pino a pino &nbsp;·&nbsp; Cabos: aba <b>Cabos</b> do catálogo &nbsp;·&nbsp; clique direito = ações';
      if (hide) { fl.style.display = 'none'; return; } fl.style.display = 'flex'; var S = HX.flowState(app), nx = S.filter(function (x) { return !x.ok; })[0];
      var mn = !!(HX.io && HX.io.localGet && HX.io.localGet('hx-flow-min'));
      fl.innerHTML = '<button class="x" data-k="min" title="' + (mn ? 'Mostrar todas as etapas' : 'Recolher (só a próxima etapa)') + '">' + (mn ? '»' : '«') + '</button>' + S.filter(function (x) { return !mn || x === nx; }).map(function (x) { var i = S.indexOf(x); return '<button data-k="' + x.k + '" class="' + (x.ok ? 'ok' : x === nx ? 'nx' : '') + '" title="' + HX.esc(x.t) + '">' + (x.ok ? '✓' : (i + 1)) + ' ' + x.n + '</button>'; }).join('<span class="x">›</span>') +
        '<button class="x" data-k="off" title="Ocultar o fluxo guiado (volta em Exibir)">✕</button>';
    }
    fl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; e.stopPropagation(); if (b.dataset.k === 'off') { hide = true; HX.io && HX.io.localSet && HX.io.localSet('hx-flow-off', true); draw(); return; } if (b.dataset.k === 'min') { HX.io.localSet('hx-flow-min', !HX.io.localGet('hx-flow-min')); draw(); return; } ACT[b.dataset.k] && ACT[b.dataset.k](); });
    var tm; app.doc.on('change', function () { clearTimeout(tm); tm = setTimeout(draw, 300); }); draw();
    app.showFlow = function () { hide = false; HX.io && HX.io.localSet && HX.io.localSet('hx-flow-off', false); draw(); };
  };
  HX.MENU_EXTRA = HX.MENU_EXTRA || []; HX.MENU_EXTRA.push(['Exibir', function (app) { return ['Fluxo guiado do chicote', function () { app.showFlow && app.showFlow(); }, '']; }]);
})(typeof window !== 'undefined' ? window : globalThis);
