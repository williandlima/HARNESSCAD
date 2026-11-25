/* HarnessCAD - BARRA ATIVA (inspirada no Altium "Active Bar"): barra flutuante no topo da área de desenho com as
   ferramentas principais do tipo de folha aberta (esquema ou desenho físico), ícone + dica com atalho, ferramenta atual
   destacada. MENU DE CONTEXTO DO ESQUEMA (clique direito sem arrastar): ações do item sob o mouse — conector, fio,
   emenda ou área vazia. O desenho físico mantém o seu menu (ui_phys6.js). Nada antigo sai: faixa, menus e atalhos ficam. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.App) return;
  function cmd(app, t) { var c = (app.commands ? app.commands() : []).filter(function (x) { return x.t.indexOf(t) === 0; })[0]; return c ? function () { c.el.click(); } : null; }
  function btn(sel) { return function () { var e = document.querySelector('[data-cmd="' + sel + '"]'); if (e) e.click(); }; }
  function tool(t) { return function (app) { app.tools.setTool(t); }; }
  /* [rótulo, ícone, atalho, ação(app) | nome da ferramenta] ; '|' = separador */
  var SCH = [['Selecionar', 'select', 'Esc', 'select'], ['Conector do catálogo', 'conector', 'A', function (app) { app.focusCatalog(); }], ['Fio', 'wire', 'W', 'wire'], ['Emenda', 'splice', 'J', 'splice'],
    ['Label de circuito', 'label', 'L', 'label'], ['Nome das vias (clicar no pino)', 'nomes', 'N', function (app) { UI.pinNameTool && UI.pinNameTool(app); }], ['Cabo nos pinos (De/Para, trançado, blindado)', 'cabo', '', function (app) { UI.cablePinsDialog && UI.cablePinsDialog(app); }], ['Blindagem sobre fios (oval)', 'cable', 'C', 'cable'], ['Texto', 'texto', 'T', 'text'], '|',
    ['Conectar pino a pino', 'pinoapino', 'Shift+P', function (app) { UI.pinToPinDialog && UI.pinToPinDialog(app); }], ['Lista de fiação (texto)', 'tabela', 'Shift+L', function (app) { UI.wireListDialog && UI.wireListDialog(app); }], '|',
    ['Verificação elétrica (ERC)', 'erc', 'F2', function (app) { app.erc(); }], ['Gerar desenho físico', 'fisico', '', function (app) { var f = cmd(app, 'Gerar desenho físico'); if (f) f(); }]];
  var PHY = [['Selecionar', 'select', 'Esc', 'select'], ['Derivação', 'brk', 'B', 'brk'], ['Cota do chicote', 'dim', 'D', 'dim'], ['Cota livre', 'cota', 'Shift+D', 'pdimx'], ['Balão', 'circuito', 'Shift+B', 'pballx'],
    ['Etiqueta', 'ptag', '', 'ptag'], ['Detalhe', 'pdet', '', 'pdet'], '|',
    ['Itens da cablagem (adaptador, bota, luva…)', 'conector', '', function (app) { UI.hitemsDialog && UI.hitemsDialog(app); }], ['Catálogo de detalhes', 'detalhe', '', function (app) { UI.detcDialog && UI.detcDialog(app); }], '|',
    ['Atualizar a partir do esquema', 'fisico', '', function (app) { var f = cmd(app, 'Gerar desenho físico'); if (f) f(); }], ['Verificação elétrica (ERC)', 'erc', 'F2', function (app) { app.erc(); }]];
  var CSS = '#hxAB{position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:30;display:flex;gap:2px;align-items:center;padding:3px 5px;border-radius:7px;' +
    'background:var(--panel,#fff);border:1px solid var(--line,#c8cdd6);box-shadow:0 2px 8px rgba(0,0,0,.18);user-select:none}' +
    '#hxAB button{width:30px;height:28px;padding:0;border:1px solid transparent;border-radius:5px;background:transparent;color:var(--txt,#222);cursor:pointer;display:flex;align-items:center;justify-content:center}' +
    '#hxAB button:hover{background:var(--hov,#e8eef9);border-color:var(--line,#c8cdd6)}#hxAB button.on{background:var(--acc,#1e6bff);color:#fff}' +
    '#hxAB svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}#hxAB i{width:1px;height:20px;background:var(--line,#c8cdd6);margin:0 4px}' +
    '#hxAB b{font:600 11px sans-serif;color:var(--mut,#667);padding:0 6px 0 2px;white-space:nowrap}#hxAB.min{left:8px;transform:none;padding:2px}#hxAB.min>*:not(.abm){display:none!important}';
  function svg(n) { return '<svg viewBox="0 0 24 24"><path d="' + HX.uiIcon(n) + '"/></svg>'; }
  var A = HX.App.prototype, init0 = A.init;
  A.init = function () {
    init0.apply(this, arguments); var app = this, host = app.view.cv.parentElement; if (!host || document.getElementById('hxAB')) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var bar = document.createElement('div'); bar.id = 'hxAB'; host.appendChild(bar); var kind = null;
    function build() { var ph = HX.isPhys(app.doc.cur()); if (ph === kind) return mark(); kind = ph; var L = ph ? PHY : SCH;
      bar.innerHTML = '<b>' + (ph ? 'Físico' : 'Esquema') + '</b>' + L.map(function (x, i) { return x === '|' ? '<i></i>' : '<button data-i="' + i + '" title="' + HX.esc(x[0] + (x[2] ? ' (' + x[2] + ')' : '')) + '">' + svg(x[1]) + '</button>'; }).join('');
      [].forEach.call(bar.querySelectorAll('button'), function (b) { var x = L[+b.dataset.i]; b.onclick = function (e) { e.stopPropagation(); if (typeof x[3] === 'string') tool(x[3])(app); else x[3](app); mark(); app.view.cv.focus && app.view.cv.focus(); }; });
      var m = document.createElement('button'); m.className = 'abm'; bar.insertBefore(m, bar.firstChild); m.onclick = function (e) { e.stopPropagation(); amin(!bar.classList.contains('min')); }; amin(); mark(); }
    function amin(v) { if (v == null) { try { v = !!HX.io.localGet('hx-ab-min'); } catch (e) { v = false; } } else HX.io.localSet('hx-ab-min', v ? 1 : ''); bar.classList.toggle('min', v);
      var m = bar.querySelector('.abm'); if (m) { m.textContent = v ? '☰' : '«'; m.title = v ? 'Mostrar a barra de ferramentas' : 'Recolher a barra (mais espaço para o desenho)'; } }
    app.abMin = amin;
    function mark() { var L = kind ? PHY : SCH; [].forEach.call(bar.querySelectorAll('button[data-i]'), function (b) { var x = L[+b.dataset.i]; b.classList.toggle('on', typeof x[3] === 'string' && app.tools.tool === x[3]); }); }
    var T = app.tools, st0 = T.setTool; T.setTool = function () { var r = st0.apply(this, arguments); mark(); return r; };
    app.doc.on('change', function () { setTimeout(build, 0); }); build(); app._abBuild = build;
    /* ações do item selecionado (as mesmas do clique direito e do painel), à direita da barra */
    var sb = document.createElement('span'); sb.style.cssText = 'display:flex;gap:2px;align-items:center'; bar.appendChild(sb);
    function selActs() { var A = HX.selActions ? HX.selActions(app).slice(0, 14) : []; sb.innerHTML = A.length ? '<i></i>' + A.map(function (a, k) { var ic = HX.uiIcon(a[0]) !== HX.uiIcon('dot'), t = a[0].replace(/…$/, '').replace(/\s*\(.*\)$/, ''); return '<button data-a="' + k + '" title="' + HX.esc(a[0]) + '"' + (ic ? '>' + svg(a[0]) : ' style="width:auto;padding:0 6px;font-size:11px">' + HX.esc(t.length > 14 ? t.slice(0, 13) + '…' : t)) + '</button>'; }).join('') : '';
      [].forEach.call(sb.querySelectorAll('button'), function (b) { b.onclick = function (e) { e.stopPropagation(); A[+b.dataset.a][1](); }; }); }
    app.doc.on('select', function () { setTimeout(selActs, 0); });
    var b0 = build; build = function () { b0(); if (sb.parentNode !== bar) bar.appendChild(sb); selActs(); }; app._abBuild = build;
    /* ---- menu de contexto do esquema ---- */
    var cv = app.view.cv, rd = null;
    /* o menu só abre num clique direito SEM arrastar (arrastar com o direito continua movendo a tela); no Windows o evento vem ao
       soltar o botão, em outros sistemas ao apertar — aí espera o botão ser solto */
    var pend = null;
    cv.addEventListener('mousedown', function (e) { if (e.button === 2) { rd = [e.clientX, e.clientY]; pend = null; } }, true);
    G.addEventListener('mouseup', function (e) { if (e.button === 2 && pend) { var q = pend; pend = null; if (Math.hypot(e.clientX - rd[0], e.clientY - rd[1]) <= 5) open(q); } }, true);
    cv.addEventListener('contextmenu', function (e) {
      if (HX.isPhys(app.doc.cur()) || !UI.ctxMenu || !rd) return; e.preventDefault(); var q = { clientX: e.clientX, clientY: e.clientY };
      if (e.buttons & 2) { pend = q; return; } if (Math.hypot(e.clientX - rd[0], e.clientY - rd[1]) <= 5) open(q); });
    function open(e) {
      var doc = app.doc;
      var r = cv.getBoundingClientRect(), pt = app.view.toWorld(e.clientX - r.left, e.clientY - r.top), hit = app.view.hitTest(pt), E = [];
      if (hit && !(doc.sel.size > 1 && doc.sel.has(hit.id))) doc.select([hit.id]); /* clique direito num item de uma seleção múltipla mantém a seleção */
      E = HX.itemActions ? HX.itemActions(app, hit) : []; /* lista única: ui_actions.js */
      UI.ctxMenu(e.clientX, e.clientY, E);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
