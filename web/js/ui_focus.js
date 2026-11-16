/* HarnessCAD - FOCO DO TECLADO volta para o desenho: depois de mexer numa lista, caixa de marcar, botão ou campo do
   painel/faixa, os atalhos (Del, R, X, Y, setas...) paravam de funcionar até clicar no desenho — e uma tecla podia
   até trocar o valor da lista. Agora: lista/caixa perdem o foco ao mudar; Enter/Esc confirmam o campo de texto; ao
   passar o mouse no desenho o foco sai do painel (um campo de texto só sai se você parou de digitar há 1,5 s). */
(function (G) {
  'use strict';
  var HX = G.HX, A = HX.App.prototype, lastType = 0;
  function formEl(e) { return e && /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.tagName); }
  function texty(e) { return e && (e.tagName === 'TEXTAREA' || (e.tagName === 'INPUT' && /^(text|number|search|)$/.test(e.type || ''))); }
  HX.shouldReleaseFocus = function (el, now, last) { // regra (testável): solta lista/caixa/botão sempre; texto só parado
    if (!formEl(el)) return false; if (el.tagName === 'TEXTAREA') return false; if (texty(el)) return now - last > 1500; return true;
  };
  function inModal(el) { return el && el.closest && el.closest('#modal, #cmdk, #start'); }
  A.initFocus = function () {
    var cv = document.getElementById('cv');
    document.addEventListener('change', function (e) { var t = e.target; if (!inModal(t) && t && (t.tagName === 'SELECT' || (t.tagName === 'INPUT' && /checkbox|radio|color|range/.test(t.type)))) setTimeout(function () { if (document.activeElement === t) t.blur(); }, 0); }, true);
    document.addEventListener('keydown', function (e) {
      var t = e.target; if (!texty(t) || inModal(t)) return; lastType = Date.now();
      if (((e.key === 'Enter' && t.tagName !== 'TEXTAREA') || e.key === 'Escape') && t.closest('#props, #toolbar')) setTimeout(function () { t.blur(); if (cv) cv.focus({ preventScroll: true }); }, 0);
    }, true);
    if (cv) cv.addEventListener('mousemove', function () {
      var a = document.activeElement; if (a && a !== cv && !inModal(a) && HX.shouldReleaseFocus(a, Date.now(), lastType)) { a.blur(); cv.focus({ preventScroll: true }); }
    });
  };
  var i0 = A.init; A.init = function () { i0.call(this); this.initFocus(); };
})(typeof window !== 'undefined' ? window : globalThis);
