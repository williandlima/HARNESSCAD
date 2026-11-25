/* HarnessCAD - FAIXA DE OPÇÕES (ribbon), como nos CADs de cablagem (E3.series, Capital, SolidWorks Electrical):
   abas Arquivo/Início/Inserir/Editar/Exibir/Ferramentas/Relatórios/Ajuda, aba contextual "Desenho físico",
   botões grandes e pequenos com rótulo, grupos com legenda, barra de acesso rápido. Os comandos vêm dos menus e
   da barra antigos (continuam existindo, ocultos), então tudo que outros módulos acrescentam aparece aqui. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, A = HX.App.prototype;
  var LBL = HX.RIBBON_LBL;
  function svg(n) { return '<svg viewBox="0 0 24 24"><path d="' + HX.uiIcon(n) + '"/></svg>'; }
  function lab(t) { return String(t || '').replace(/\s*\(.*$/, '').replace(/\s*[—:].*$/, '').replace(/…$/, ''); }
  A.initRibbon = function () {
    var app = this, doc = app.doc, tb = UI.$('#toolbar'), mb = UI.$('#menubar'), menus = {}, used = {};
    UI.$$('#menus .menu').forEach(function (m) { var t = m.firstChild.textContent; menus[t] = UI.$$('.dd > div', m).map(function (d) { return { t: d.firstChild.textContent, k: d.lastChild.textContent, el: d, tab: t }; }); });
    app.commands = function () { var L = []; Object.keys(menus).forEach(function (t) { L = L.concat(menus[t]); }); return L; };
    function findM(q) { var p = q.split('/'), tabs = p.length > 1 ? [p[0]] : Object.keys(menus), s = p[p.length - 1], r = null;
      tabs.some(function (t) { return (menus[t] || []).some(function (c) { if (c.t.indexOf(s) === 0) { r = c; return true; } }); }); return r; }
    function btn(big, ic, text, fn, tip) {
      var b = UI.h('button', { class: big ? 'rb' : 'rs', title: tip || text }, svg(ic) + '<span>' + HX.esc(text) + '</span>');
      b.onclick = function (e) { e.stopPropagation(); fn(); }; return b;
    }
    var old = UI.h('div', { class: 'rold' }); Array.prototype.slice.call(tb.childNodes).forEach(function (n) { old.appendChild(n); });
    function grab(sel) { var e = old.querySelector('[data-tool="' + sel + '"],[data-cmd="' + sel + '"],[data-k="' + sel + '"]') || (sel[0] === '#' ? old.querySelector(sel) : null); if (!e) return null;
      if (e.tagName === 'INPUT' || e.tagName === 'SELECT') e = e.closest('label') || e; return e; }
    var seen = {}, RK = HX.ribbonKey || function (t) { return t; }; /* cada comando numa aba só: repetido pelo nome é pulado */
    function dup(t) { var q = RK(t); if (!q || /^#/.test(q)) return false; if (seen[q]) return true; seen[q] = 1; return false; }
    function entry(s) {
      var big = s[0] === '*'; if (big) s = s.slice(1); var k = s.slice(0, 2), v = s.slice(2);
      if (k === 'e:') { var e = grab(v); if (!e) return null; used[v] = 1; if (v[0] !== '#' && dup(LBL[v] || lab(e.title))) return null;
        if (e.tagName === 'BUTTON') { var key = e.dataset.tool || e.dataset.cmd || e.dataset.k || e.id; e.classList.add(big ? 'rb' : 'rs'); e.innerHTML = (e.querySelector('svg') || { outerHTML: svg(key) }).outerHTML + '<span class="bl">' + (LBL[key] || lab(e.title)) + '</span>'; }
        else e.classList.add('rf'); return e; }
      if (k === 'm:') { var c = findM(v); if (!c) return null; c.used = 1; if (dup(lab(c.t))) return null; return btn(big, c.t, lab(c.t), function () { c.el.click(); }, c.t + (c.k ? ' (' + c.k + ')' : '')); }
      if (k === 'u:') return v === 'theme' ? btn(big, 'tema', 'Tema claro/escuro', function () { app.toggleTheme(); }) : btn(big, 'busca', 'Buscar comando', function () { app.palette(); }, 'Buscar comando ou item (Ctrl+K)');
      return null;
    }
    function group(name, list) {
      var g = UI.h('div', { class: 'rg', 'data-g': name }, '<div class="rgb"></div><div class="rgt">' + HX.esc(name) + '</div>'), body = g.firstChild, col = null;
      list.forEach(function (s) {
        if (s === 'd:*') { UI.$$('#dockTabs button[data-t]').forEach(function (d) { body.appendChild(btn(true, 'tab_' + d.dataset.t, lab(d.firstChild.textContent), function () { d.click(); })); }); return; }
        var e = entry(s); if (!e) return;
        if (s[0] === '*') { body.appendChild(e); col = null; return; }
        if (!col || col.children.length >= 3) { col = UI.h('div', { class: 'rcol' }); body.appendChild(col); } col.appendChild(e);
      });
      return body.children.length ? g : null;
    }
    var tabs = UI.h('div', { id: 'rtabs' }), panels = {};
    var file = UI.h('button', { class: 'rt file' }, 'Arquivo'); file.onclick = function () { app.startScreen(true); }; tabs.appendChild(file);
    HX.RIBBON.forEach(function (T) {
      var p = UI.h('div', { class: 'rpanel', 'data-tab': T[0] }); T[1].forEach(function (g) { var e = group(g[0], g[1]); if (e) p.appendChild(e); });
      panels[T[0]] = p; tb.appendChild(p);
      var b = UI.h('button', { class: 'rt' + (T[2] ? ' ctx' : ''), 'data-tab': T[0] }, T[0]); tabs.appendChild(b);
      b.onclick = function () { app.ribbonTab(T[0], true); }; b.ondblclick = function () { app.ribbonMin(); };
    });
    // o que sobrou (comandos acrescentados por outros módulos) entra em "Mais", para nada se perder
    var rest = Array.prototype.filter.call(old.children, function (e) { return !/sep|grow/.test(e.className) && !used[e.dataset.tool || e.dataset.cmd || e.dataset.k] && !e.closest('.rg') && ['undo', 'redo', 'save'].indexOf(e.dataset.cmd) < 0 && !seen[RK(LBL[e.dataset.tool || e.dataset.cmd] || lab(e.title))]; });
    if (rest.length) { var gm = UI.h('div', { class: 'rg' }, '<div class="rgb"></div><div class="rgt">Mais</div>'); rest.forEach(function (e) { e.classList.add('rs'); gm.firstChild.appendChild(e); }); panels['Início'].appendChild(gm); }
    Object.keys(menus).forEach(function (t) { var L = menus[t].filter(function (c) { return !c.used && !seen[RK(lab(c.t))]; }), p = panels[t === 'Arquivo' ? 'Ferramentas' : t]; if (!L.length || !p || t === 'Arquivo') return;
      var g = group('Mais', L.map(function (c) { return 'm:' + t + '/' + c.t; })); if (g) p.appendChild(g); });
    old.style.display = 'none'; tb.appendChild(old);
    // barra de acesso rápido + busca + tema
    var qat = UI.h('div', { id: 'qat' }); [['save', 'Salvar (Ctrl+S)'], ['undo', 'Desfazer (Ctrl+Z)'], ['redo', 'Refazer (Ctrl+Y)']].forEach(function (q) {
      var o = old.querySelector('[data-cmd="' + q[0] + '"]'); qat.appendChild(btn(false, q[0], '', function () { if (o) o.click(); }, q[1])); });
    var brand = UI.$('.brand', mb); brand.insertAdjacentElement('afterend', qat); qat.insertAdjacentElement('afterend', tabs); UI.$('#menus').style.display = 'none';
    var srch = UI.h('div', { id: 'rsearch' }, svg('busca') + '<span>Buscar comando ou item…</span><kbd>Ctrl+K</kbd>'); srch.onclick = function () { app.palette(); };
    var th = btn(false, 'tema', '', function () { app.toggleTheme(); }, 'Tema claro/escuro'); th.id = 'bTheme';
    UI.$('#docTitle').insertAdjacentElement('beforebegin', srch); srch.insertAdjacentElement('afterend', th);
    var cur = HX.io.localGet('hx-rtab') || 'Início', mini = !!HX.io.localGet('hx-rmin'), lastPh = null;
    app.ribbonTab = function (t, user) {
      if (!panels[t]) t = 'Início'; cur = t; if (user && mini) { UI.$('#app').classList.add('rpeek'); }
      UI.$$('#rtabs .rt[data-tab]').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === t); });
      Object.keys(panels).forEach(function (k) { panels[k].style.display = k === t ? '' : 'none'; });
      if (user) HX.io.localSet('hx-rtab', t); setTimeout(function () { app.view.resize(); }, 0);
    };
    app.ribbonMin = function () { mini = !mini; HX.io.localSet('hx-rmin', mini); UI.$('#app').classList.toggle('rmin', mini); UI.$('#app').classList.remove('rpeek'); setTimeout(function () { app.view.resize(); }, 0); };
    UI.$('#app').classList.toggle('rmin', mini);
    document.addEventListener('mousedown', function (e) { if (UI.$('#app').classList.contains('rpeek') && !e.target.closest('#toolbar,#rtabs')) { UI.$('#app').classList.remove('rpeek'); setTimeout(function () { app.view.resize(); }, 0); } });
    function sync() {
      var ph = HX.isPhys(doc.cur()), cb = UI.$('#rtabs .rt.ctx'); cb.style.display = ph ? '' : 'none';
      if (ph !== lastPh) { if (lastPh !== null || ph) app.ribbonTab(ph ? 'Desenho físico' : (cur === 'Desenho físico' ? 'Início' : cur)); lastPh = ph; }
      UI.$$('#toolbar .rpanel .rb, #toolbar .rpanel .rs').forEach(function (b) { var t = b.dataset.tool; if (t && LBL[t]) { var s = b.querySelector('.bl'); if (s) s.textContent = ph && t === 'wire' ? 'Ramo' : LBL[t]; } });
      UI.$$('#toolbar .rg').forEach(function (g) { var v = Array.prototype.some.call(g.querySelectorAll('.rb,.rs,.rf'), function (b) { return b.style.display !== 'none' && (!b.closest('label') || b.closest('label').style.display !== 'none'); }); g.style.display = v ? '' : 'none'; });
    }
    doc.on('change', function () { setTimeout(sync, 0); }); doc.on('load', function () { setTimeout(sync, 0); });
    app.ribbonTab(cur); sync();
  };
  var init0 = A.init;
  A.init = function () { init0.call(this); this.initRibbon(); if (this.initTheme) this.initTheme(); if (this.initPalette) this.initPalette(); if (this.initPgrid) this.initPgrid(); if (this.initStart) this.initStart(); };
})(typeof window !== 'undefined' ? window : globalThis);
