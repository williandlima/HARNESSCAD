/* HarnessCAD - PAINÉIS AUTOMÁTICOS (estilo Altium) para ganhar área de desenho, sem tirar o layout antigo (ui_layout.js):
   - trilho fino de ícones na borda esquerda (catálogo: Conectores, Fios, Emendas, Cabos…) e na direita (Propriedades);
   - o painel abre FLUTUANDO sobre o desenho (o desenho não se mexe) e fecha ao clicar fora ou com Esc;
   - Propriedades abrem sozinhas quando há algo selecionado e fecham sem seleção;
   - tabelas de baixo começam recolhidas (só as abas) e voltam a recolher ao clicar no desenho;
   - ALFINETE (📌) fixa o painel como era antes (encaixado, redimensionável). F9 e os botões antigos continuam. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, A = HX.App.prototype; if (!A.initLayout) return;
  var RAIL = 30, CSS = '.hxRail{position:absolute;top:0;bottom:0;width:' + RAIL + 'px;z-index:25;display:flex;flex-direction:column;gap:2px;padding:6px 2px;background:var(--panel,#fff);border:1px solid var(--line,#c8cdd6)}' +
    '.hxRail.l{left:0;border-left:0}.hxRail.r{right:0;border-right:0}.hxRail button{width:26px;height:26px;padding:0;border:1px solid transparent;border-radius:5px;background:transparent;color:var(--txt,#222);cursor:pointer;display:flex;align-items:center;justify-content:center}' +
    '.hxRail button:hover,.hxRail button.on{background:var(--hov,#e8eef9);border-color:var(--line,#c8cdd6)}.hxRail svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}' +
    '#layout>#left{grid-column:1;grid-row:1}#layout>#splitL{grid-column:2;grid-row:1}#layout>#center{grid-column:3;grid-row:1}#layout>#splitR{grid-column:4;grid-row:1}#layout>#right{grid-column:5;grid-row:1}' +
    'aside.hxPeek{position:fixed!important;z-index:60;box-shadow:0 6px 24px rgba(0,0,0,.25);border:1px solid var(--line,#c8cdd6)}.hxPin{margin-left:auto;border:0;background:transparent;cursor:pointer;opacity:.7;font-size:13px;padding:0 6px}.hxPin:hover{opacity:1}';
  function svg(n) { return '<svg viewBox="0 0 24 24"><path d="' + HX.uiIcon(n) + '"/></svg>'; }
  var ICO = { pConn: 'conector', pWire: 'fio', pSplice: 'emenda', pCable: 'cabo' };
  var il0 = A.initLayout;
  A.initLayout = function () {
    il0.apply(this, arguments); var app = this, L = app.layout, st = L.state, wrap = UI.$('#canvasWrap') || app.view.cv.parentElement, left = UI.$('#left'), right = UI.$('#right');
    if (!wrap || !left || !right) return;
    var s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);
    if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
    /* 1ª vez com esta versão: modo automático ligado (catálogo e tabelas recolhidos, propriedades automáticas) */
    if (st.auto === undefined) { st.auto = true; st.pinL = st.pinR = st.pinD = false; }
    var fm = false; function rails() { return st.auto && !fm; }
    function sync() { if (!st.auto) return; st.hl = !st.pinL; st.hr = !st.pinR; if (!st.pinD && st.hd === undefined) st.hd = true; }
    var rl = document.createElement('div'), rr = document.createElement('div'); rl.className = 'hxRail l'; rr.className = 'hxRail r'; wrap.appendChild(rl); wrap.appendChild(rr);
    function peek(el, on, side) { el.classList.toggle('hxPeek', !!on); if (!on) { el.style.left = el.style.top = el.style.width = el.style.height = el.style.right = ''; return; }
      var r = wrap.getBoundingClientRect(), w = side === 'l' ? st.lw : st.rw; el.style.top = r.top + 'px'; el.style.height = r.height + 'px'; el.style.width = w + 'px';
      el.style.left = (side === 'l' ? r.left + RAIL : r.right - RAIL - w) + 'px'; }
    function isPeek(el) { return el.classList.contains('hxPeek'); }
    function buildL() { rl.innerHTML = UI.$$('#leftTabs button').map(function (b) { return '<button data-p="' + b.dataset.p + '" title="' + HX.esc(b.textContent) + '">' + svg(ICO[b.dataset.p] || b.textContent) + '</button>'; }).join('');
      UI.$$('button', rl).forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); var t = UI.$('#leftTabs button[data-p="' + b.dataset.p + '"]'); if (t) t.click();
        var open = isPeek(left) && b.classList.contains('on'); peek(left, !open, 'l'); UI.$$('button', rl).forEach(function (x) { x.classList.toggle('on', !open && x === b); }); }; }); }
    rr.innerHTML = '<button title="Propriedades (E)">' + svg('hr') + '</button>'; rr.firstChild.onclick = function (e) { e.stopPropagation(); peek(right, !isPeek(right), 'r'); };
    function pins() { [[UI.$('#leftTabs'), 'pinL'], [UI.$('.tabs', right), 'pinR'], [UI.$('#dockTabs'), 'pinD']].forEach(function (x) { if (!x[0]) return; var b = x[0].querySelector('.hxPin');
      if (!b) { b = document.createElement('button'); b.className = 'hxPin'; x[0].appendChild(b); b.onclick = function (e) { e.stopPropagation(); setPin(x[1], !st[x[1]]); }; }
      b.textContent = st[x[1]] ? '📌' : '📍'; b.title = st[x[1]] ? 'Painel fixo — clique para voltar ao automático' : 'Fixar o painel (deixar aberto e encaixado)'; }); }
    function setPin(k, v) { st.auto = true; st[k] = v; if (k === 'pinD') st.hd = !v; peek(left, false); peek(right, false); refresh(); }
    function refresh() { sync(); L.apply(); rl.style.display = rr.style.display = 'none'; if (rails()) { if (!st.pinL) rl.style.display = 'flex'; if (!st.pinR) rr.style.display = 'flex'; } pins(); buildL(); autoProps(); }
    function autoProps() { if (!st.auto || st.pinR || !rails()) return peek(right, false); peek(right, app.doc.selected().length > 0, 'r'); }
    app.doc.on('select', function () { setTimeout(autoProps, 0); });
    /* clicar fora fecha o catálogo flutuante; clicar no desenho recolhe as tabelas (se não fixadas) */
    document.addEventListener('mousedown', function (e) {
      if (isPeek(left) && !left.contains(e.target) && !rl.contains(e.target) && !e.target.closest('#modal,.ctxmenu')) { peek(left, false); UI.$$('button', rl).forEach(function (x) { x.classList.remove('on'); }); }
      if (st.auto && !st.pinD && !st.hd && app.view.cv.contains(e.target)) { st.hd = true; L.apply(); }
    }, true);
    G.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isPeek(left) && !document.querySelector('#modal.show')) peek(left, false); });
    G.addEventListener('resize', function () { if (isPeek(left)) peek(left, true, 'l'); if (isPeek(right)) peek(right, true, 'r'); });
    /* comandos que abrem painéis: no automático abrem flutuando */
    var fp = app.focusProps, fc = app.focusCatalog;
    app.focusProps = function () { if (st.auto && !st.pinR) { peek(right, true, 'r'); var f = UI.$('#props input,#props select'); if (f) f.focus(); return; } fp.apply(app, arguments); };
    app.focusCatalog = function () { if (st.auto && !st.pinL) { var t = UI.$('#leftTabs button[data-p="pConn"]'); if (t) t.click(); peek(left, true, 'l'); var q = UI.$('#cq'); if (q) q.focus(); return; } fc.apply(app, arguments); };
    /* botões antigos de painel (faixa) e F9 continuam: mudar um painel pelo jeito antigo desliga o automático daquele lado */
    UI.$$('#toolbar .lay, button[data-k="hl"], button[data-k="hr"], button[data-k="hd"]').forEach(function (b) { b.addEventListener('click', function () { var k = b.dataset.k; if (k === 'hl') st.pinL = !st.hl; if (k === 'hr') st.pinR = !st.hr; if (k === 'hd') st.pinD = !st.hd; setTimeout(refresh, 0); }); });
    /* F9 no automático: esconde trilhos, painéis e tabelas; F9 de novo volta ao automático */
    var tf = app.toggleFocus; app.toggleFocus = function () { if (!st.auto || st.pinL || st.pinR || st.pinD) { fm = false; return tf.apply(app, arguments); }
      fm = !fm; peek(left, false); peek(right, false); st.hd = true; refresh(); UI.$('#app').classList.toggle('focus', fm); UI.toast(fm ? 'Modo foco — F9 para voltar' : 'Painéis automáticos', false, 1400); };
    /* o layout antigo marca "foco" quando os 3 painéis estão recolhidos; no automático isso é o normal — foco só com F9 */
    var root = UI.$('#app'); if (G.MutationObserver) new MutationObserver(function () { if (st.auto && root.classList.contains('focus') !== fm) root.classList.toggle('focus', fm); }).observe(root, { attributes: true, attributeFilter: ['class'] });
    app.layout.refresh = refresh; app.layout.peek = function (side, on) { peek(side === 'l' ? left : right, on, side); };
    if (st.hd === undefined || (st.auto && !st.pinD)) st.hd = true;
    refresh();
  };
})(typeof window !== 'undefined' ? window : globalThis);
