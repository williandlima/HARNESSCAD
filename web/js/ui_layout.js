/* HarnessCAD - layout da tela: painéis redimensionáveis/recolhíveis e modo foco (F9) */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, A = HX.App.prototype;
  var DEF = { lw: 230, rw: 250, dh: 170 }, MIN = { lw: 150, rw: 190, dh: 60 }, MAX = { lw: 520, rw: 560, dh: 640 }, TAB = 30;

  A.initLayout = function () {
    var app = this, root = UI.$('#app'), st = Object.assign({}, DEF, { hl: false, hr: false, hd: false }, HX.io.localGet('hx-layout') || {});
    function apply() {
      root.style.setProperty('--lw', (st.hl ? 0 : st.lw) + 'px');
      root.style.setProperty('--rw', (st.hr ? 0 : st.rw) + 'px');
      root.style.setProperty('--dh', (st.hd ? TAB : st.dh) + 'px');
      UI.$('#dock').classList.toggle('min', !!st.hd);
      root.classList.toggle('focus', st.hl && st.hr && st.hd);
      UI.$$('#toolbar .lay').forEach(function (b) { b.classList.toggle('on', !st[b.dataset.k]); });
      HX.io.localSet('hx-layout', st);
      setTimeout(function () { app.view.resize(); }, 0);
    }
    app.layout = { state: st, apply: apply };

    // arrastar os divisores
    function drag(id, key, flag, axis, sign) {
      var el = UI.$('#' + id);
      el.addEventListener('mousedown', function (e) {
        e.preventDefault();
        var start = axis === 'x' ? e.clientX : e.clientY, v0 = st[flag] ? (key === 'dh' ? TAB : 0) : st[key];
        el.classList.add('drag');
        function mv(ev) {
          var v = v0 + sign * ((axis === 'x' ? ev.clientX : ev.clientY) - start);
          st[flag] = v < MIN[key] * 0.6;
          if (!st[flag]) st[key] = Math.max(MIN[key], Math.min(MAX[key], v));
          apply();
        }
        function up() { el.classList.remove('drag'); G.removeEventListener('mousemove', mv); G.removeEventListener('mouseup', up); }
        G.addEventListener('mousemove', mv); G.addEventListener('mouseup', up);
      });
      el.addEventListener('dblclick', function () { st[flag] = !st[flag]; apply(); });
    }
    drag('splitL', 'lw', 'hl', 'x', 1);
    drag('splitR', 'rw', 'hr', 'x', -1);
    drag('splitB', 'dh', 'hd', 'y', -1);

    // botões na barra: mostrar/ocultar painéis e modo foco
    var tb = UI.$('#toolbar'), ic = {
      hl: 'M3 4h18v16H3zM9 4v16', hd: 'M3 4h18v16H3zM3 15h18', hr: 'M3 4h18v16H3zM15 4v16',
      focus: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5M9 9h6v6H9z'
    };
    function btn(k, t) { return '<button class="lay" data-k="' + k + '" title="' + t + '"><svg viewBox="0 0 24 24"><path d="' + ic[k] + '"/></svg></button>'; }
    tb.insertAdjacentHTML('beforeend', '<span class="grow"></span>' + btn('hl', 'Painel esquerdo (catálogo)') + btn('hd', 'Painel inferior (tabelas)') +
      btn('hr', 'Painel direito (propriedades)') + '<span class="sep"></span>' + btn('focus', 'Modo foco: só o desenho (F9)'));
    tb.addEventListener('click', function (e) {
      var b = e.target.closest('button.lay'); if (!b) return;
      if (b.dataset.k === 'focus') app.toggleFocus(); else { st[b.dataset.k] = !st[b.dataset.k]; apply(); }
    });
    // o botão ▾ das tabelas recolhe/expande pelo mesmo estado
    var tmin = UI.$('#tMin');
    if (tmin) tmin.onclick = function (e) { e.stopPropagation(); st.hd = !st.hd; apply(); };
    UI.$('#dockTabs').addEventListener('click', function (e) { if (e.target.closest('button[data-t]') && st.hd) { st.hd = false; apply(); } });
    var show = app.showTab; app.showTab = function (t) { if (st.hd) { st.hd = false; apply(); } show.call(app, t); };

    app.toggleFocus = function () {
      var all = st.hl && st.hr && st.hd;
      if (all) { st.hl = st.hr = st.hd = false; } else { st.hl = st.hr = st.hd = true; }
      apply(); UI.toast(all ? 'Painéis restaurados' : 'Modo foco — F9 para voltar', false, 1400);
    };
    G.addEventListener('keydown', function (e) {
      if (e.key === 'F9') { e.preventDefault(); app.toggleFocus(); }
    });
    // ao editar algo com os painéis ocultos, abre as propriedades se o usuário pedir (E / duplo clique)
    var fp = app.focusProps; app.focusProps = function () { if (st.hr) { st.hr = false; apply(); } fp.call(app); };
    var fc = app.focusCatalog; app.focusCatalog = function () { if (st.hl) { st.hl = false; apply(); } fc.call(app); };
    HX.SHORTCUTS.push(['F9', 'Modo foco (esconde painéis)']);
    apply();
  };

  // liga o layout depois que a aplicação monta a interface
  var init0 = A.init;
  A.init = function () { init0.call(this); this.initLayout(); };
})(typeof window !== 'undefined' ? window : globalThis);
