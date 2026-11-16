/* HarnessCAD - controles rápidos de visualização na barra: tamanho do texto dos pinos e rastro do fio */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, A = HX.App.prototype;
  var SIZES = [['n', 'Normal'], ['g', 'Grande'], ['x', 'Extra grande']];
  HX.MENU_EXTRA = HX.MENU_EXTRA || [];
  HX.MENU_EXTRA.push(['Exibir', function (app) { return ['Rastro do fio (guias até o pino)', function () { app.setTrace(!HX.trace.on); }, 'K']; }]);

  A.initView = function () {
    var app = this, doc = app.doc, tb = UI.$('#toolbar'), gr = tb.querySelector('.grow');
    var h = '<span class="sep"></span><label title="Tamanho do texto dos pinos (números e nomes)">Texto <select id="pinSz">' +
      SIZES.map(function (s) { return '<option value="' + s[0] + '">' + s[1] + '</option>'; }).join('') + '</select></label>' +
      '<button id="bTrace" title="Rastro do fio: guias até o pino (K)"><svg viewBox="0 0 24 24"><path d="M2 12h20M12 2v20M17 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"/></svg></button>';
    if (gr) gr.insertAdjacentHTML('beforebegin', h); else tb.insertAdjacentHTML('beforeend', h);
    var bk = tb.querySelector('[data-tool="brk"]'); // pincel de formatação ao lado das ferramentas de desenho
    if (bk) bk.insertAdjacentHTML('afterend', '<button data-tool="paint" title="Pincel de formatação de fios (P)"><svg viewBox="0 0 24 24"><path d="M18 3l3 3-9 9-3-3zM9 12l-4 1-2 6 6-2 1-4"/></svg></button>');
    var sel = UI.$('#pinSz'), bt = UI.$('#bTrace');
    function sync() { sel.value = doc.p.view.pinSize || 'n'; bt.classList.toggle('on', HX.trace.on); }
    sel.onchange = function () { doc.change('Texto dos pinos', function () { doc.p.view.pinSize = sel.value; }); UI.$('#cv').focus(); };
    app.setTrace = function (v) { HX.trace.set(v); sync(); app.view.redraw(); UI.toast('Rastro do fio ' + (v ? 'ligado' : 'desligado'), false, 1200); };
    bt.onclick = function () { app.setTrace(!HX.trace.on); UI.$('#cv').focus(); };
    G.addEventListener('keydown', function (e) {
      var t = e.target; if (e.ctrlKey || e.altKey || e.metaKey || (t && /INPUT|SELECT|TEXTAREA/.test(t.tagName))) return;
      if (e.key === 'k' || e.key === 'K') { e.preventDefault(); app.setTrace(!HX.trace.on); }
    });
    doc.on('change', sync); doc.on('load', sync); sync();
    HX.SHORTCUTS.push(['K', 'Rastro do fio (guias até o pino)']);
  };
  var init0 = A.init;
  A.init = function () { init0.call(this); this.initView(); };
})(typeof window !== 'undefined' ? window : globalThis);
