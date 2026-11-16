/* HarnessCAD - tema claro/escuro (lembra a escolha) e BUSCA DE COMANDOS (Ctrl+K): qualquer comando dos menus e da
   faixa de opções, tabelas e itens do projeto (conectores, fios, emendas...) — Enter executa ou leva até o item. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, A = HX.App.prototype;
  A.initTheme = function () {
    var app = this;
    app.setTheme = function (t) {
      document.body.classList.toggle('light', t === 'light'); HX.WS_BG = t === 'light' ? '#c3c9d2' : '#5c6470';
      HX.io.localSet('hx-theme', t); app.theme = t; app.view.redraw();
    };
    app.toggleTheme = function () { app.setTheme(app.theme === 'light' ? 'dark' : 'light'); UI.toast(app.theme === 'light' ? 'Tema claro' : 'Tema escuro', false, 1000); };
    app.setTheme(HX.io.localGet('hx-theme') || 'light');
  };
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  HX.cmdMatch = function (q, list) { // filtra e ordena: todas as palavras presentes; começo do rótulo primeiro
    var w = norm(q).split(/\s+/).filter(Boolean);
    return list.map(function (c) { var t = norm(c.t), all = t + ' ' + norm(c.g) + ' ' + norm(c.k), s = 0;
      if (!w.every(function (x) { return all.indexOf(x) >= 0; })) return null;
      if (w.length && t.indexOf(w[0]) === 0) s -= 10; if (w.length && t.indexOf(w.join(' ')) >= 0) s -= 5; if (c.item) s += 2; return { c: c, s: s }; })
      .filter(Boolean).sort(function (a, b) { return a.s - b.s || (a.c.t < b.c.t ? -1 : 1); }).map(function (x) { return x.c; });
  };
  var KIND = { conn: 'Conector', wire: 'Fio', splice: 'Emenda', label: 'Label', cable: 'Cabo', text: 'Texto', pnode: 'Nó físico', pseg: 'Ramo' };
  A.initPalette = function () {
    var app = this, doc = app.doc, box = UI.h('div', { id: 'cmdk' }, '<div class="ck"><div class="ckq"><svg viewBox="0 0 24 24"><path d="' + HX.uiIcon('busca') +
      '"/></svg><input id="ckIn" placeholder="Digite um comando, J1, W12, BOM, PDF…" autocomplete="off"><kbd>Esc</kbd></div><div class="ckl" id="ckL"></div><div class="ckf">↑↓ navegar · Enter executar · itens do projeto levam até o desenho</div></div>');
    document.body.appendChild(box);
    var inp = UI.$('#ckIn', box), L = UI.$('#ckL', box), res = [], at = 0;
    function sources() {
      var out = [], seen = {};
      app.commands().forEach(function (c) { var k = norm(c.t); if (seen[k]) return; seen[k] = 1; out.push({ t: c.t.replace(/…$/, ''), g: c.tab, k: c.k, ic: c.t, run: function () { c.el.click(); } }); });
      UI.$$('#toolbar .rpanel button').forEach(function (b) { var s = b.querySelector('span'), t = s && s.textContent; if (!t || seen[norm(t)]) return; seen[norm(t)] = 1;
        out.push({ t: t, g: 'Faixa · ' + (b.closest('.rpanel').dataset.tab), k: (b.title.match(/\(([^)]+)\)$/) || [])[1] || '', ic: b.dataset.tool || b.dataset.cmd || t, run: function () { b.click(); } }); });
      UI.$$('#dockTabs button[data-t]').forEach(function (d) { out.push({ t: 'Tabela: ' + d.firstChild.textContent, g: 'Relatórios', k: '', ic: 'tab_' + d.dataset.t, run: function () { d.click(); } }); });
      out.push({ t: 'Alternar tema claro/escuro', g: 'Exibir', k: '', ic: 'tema', run: app.toggleTheme }, { t: 'Tela inicial / Arquivo', g: 'Arquivo', k: '', ic: 'abrir', run: function () { app.startScreen(true); } });
      doc.p.sheets.forEach(function (sh, si) { sh.items.forEach(function (i) {
        var n = i.type === 'wire' ? (i.num || i.name) : i.ref; if (!n || !KIND[i.type] || (i.type === 'pnode' && i.nkind !== 'conn')) return;
        out.push({ t: String(n), g: KIND[i.type] + ' · ' + sh.name, k: i.part || i.pnOverride || '', ic: i.type === 'pnode' ? 'conector' : ({ conn: 'conector', wire: 'fio', splice: 'emenda', label: 'label', cable: 'cabo', text: 'texto' })[i.type], item: 1,
          run: function () { app.gotoItem(i.id, si); } }); }); });
      return out;
    }
    var all = [];
    function draw() {
      res = HX.cmdMatch(inp.value, all).slice(0, 60); at = Math.min(at, Math.max(0, res.length - 1));
      L.innerHTML = res.length ? res.map(function (c, i) { return '<div class="cki' + (i === at ? ' on' : '') + '" data-i="' + i + '"><svg viewBox="0 0 24 24"><path d="' + HX.uiIcon(c.ic) + '"/></svg><span>' + HX.esc(c.t) +
        '</span><small>' + HX.esc(c.g) + '</small>' + (c.k ? '<kbd>' + HX.esc(c.k) + '</kbd>' : '') + '</div>'; }).join('') : '<div class="ckn">Nada encontrado</div>';
      var on = L.querySelector('.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' });
    }
    function close() { box.classList.remove('show'); UI.$('#cv').focus(); }
    function run(i) { var c = res[i]; if (!c) return; close(); setTimeout(c.run, 0); }
    app.palette = function () { all = sources(); inp.value = ''; at = 0; box.classList.add('show'); draw(); inp.focus(); };
    inp.oninput = function () { at = 0; draw(); };
    inp.onkeydown = function (e) {
      if (e.key === 'ArrowDown') { at = Math.min(res.length - 1, at + 1); draw(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { at = Math.max(0, at - 1); draw(); e.preventDefault(); }
      else if (e.key === 'Enter') { run(at); e.preventDefault(); } else if (e.key === 'Escape') { close(); e.preventDefault(); }
      e.stopPropagation();
    };
    L.onclick = function (e) { var d = e.target.closest('.cki'); if (d) run(+d.dataset.i); };
    box.onmousedown = function (e) { if (e.target === box) close(); };
    G.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); e.stopPropagation(); box.classList.contains('show') ? close() : app.palette(); }
    }, true);
    HX.SHORTCUTS.push(['Ctrl+K', 'Buscar comando ou item do projeto']);
  };
})(typeof window !== 'undefined' ? window : globalThis);
