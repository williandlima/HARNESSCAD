/* HarnessCAD - GRADE DE PROPRIEDADES (estilo E3/AutoCAD): o painel direito vira uma grade de 2 colunas com
   categorias recolhíveis (lembra o que ficou recolhido), cabeçalho com o tipo do item e filtro de propriedades. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, A = HX.App.prototype;
  HX.pgridWrap = function (root, closed) { // agrupa linhas soltas por título (h4/h5); devolve nº de seções
    var kids = Array.prototype.slice.call(root.childNodes), sec = null, n = 0, first = true;
    function open(t, el) {
      sec = document.createElement('div'); sec.className = 'pgs' + (closed[t] ? ' off' : ''); sec.dataset.t = t;
      var hd = document.createElement('div'); hd.className = 'pgh'; hd.innerHTML = '<i></i>' + HX.esc(t); sec.appendChild(hd); root.insertBefore(sec, el); n++;
    }
    kids.forEach(function (k) {
      if (k.nodeType !== 1) { if (sec && !/\S/.test(k.textContent)) k.remove(); return; }
      if (k.classList.contains('pgs') || k.classList.contains('pgtop')) { sec = null; return; }
      var head = k.tagName === 'H4' || k.tagName === 'H5';
      if (head && first && k.tagName === 'H4') { k.classList.add('pgtitle'); first = false; return; }
      first = false;
      if (head) { open(k.textContent.trim(), k); k.remove(); return; }
      if (!sec) open('Geral', k);
      if (k.classList.contains('row') && k.firstElementChild && k.firstElementChild.tagName === 'LABEL' && k.children.length === 2) k.classList.add('pgr');
      sec.appendChild(k);
    });
    return n;
  };
  A.initPgrid = function () {
    var app = this, root = UI.$('#props'), closed = HX.io.localGet('hx-pgclosed') || {}, busy = false, q = '';
    root.classList.add('pgrid2');
    function filt() { UI.$$('.pgr', root).forEach(function (r) { r.style.display = !q || r.firstElementChild.textContent.toLowerCase().indexOf(q) >= 0 ? '' : 'none'; }); }
    function wrap() {
      if (busy) return; busy = true;
      try {
        if (HX.pgridWrap(root, closed) && !UI.$('.pgtop', root)) {
          var t = UI.$('.pgtitle', root), f = UI.h('div', { class: 'pgtop' }, '<input placeholder="Filtrar propriedades…" value="' + HX.esc(q) + '">');
          if (t) t.insertAdjacentElement('afterend', f); else root.insertBefore(f, root.firstChild);
          f.firstChild.oninput = function () { q = this.value.toLowerCase(); filt(); };
        }
        filt();
      } finally { setTimeout(function () { busy = false; }, 0); }
    }
    new MutationObserver(function () { if (!busy) wrap(); }).observe(root, { childList: true });
    root.addEventListener('click', function (e) {
      var h = e.target.closest('.pgh'); if (!h) return; var s = h.parentNode; s.classList.toggle('off');
      closed[s.dataset.t] = s.classList.contains('off'); HX.io.localSet('hx-pgclosed', closed);
    });
    wrap();
  };
})(typeof window !== 'undefined' ? window : globalThis);
