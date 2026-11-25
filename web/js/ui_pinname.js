/* HarnessCAD - ferramenta NOME DAS VIAS (tecla N, faixa Esquema › Conectores, barra ativa, clique direito do conector):
   clique no pino → caixa de texto sobre o pino; Enter grava e passa ao pino de baixo, Shift+Enter/↑ sobe, Esc sai.
   O nome vai também para a outra ponta da mesma via (pode desligar). TABELA do conector: pino × nome, aceita colar a coluna
   do Excel (ou "pino<TAB>nome"). Tudo com desfazer (Ctrl+Z). Lógica em pinname.js. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, T = HX.Tools && HX.Tools.prototype; if (!UI || !T || !HX.pinNameSet) return;
  var ed = null, prop = true;
  function sch(t) { return t.doc && !HX.isPhys(t.doc.cur()); }
  function close(t) { if (ed) { ed.remove(); ed = null; } if (t) { t._pinName = false; t.pinSel = null; t.view.redraw(); } }
  function openAt(t, c, q) {
    var L = HX.connLayout(c, t.doc.p.unit), v = t.view, r = v.cv.getBoundingClientRect(), P = v.toScreen(q.pt[0], q.pt[1]), right = q.side === 'R';
    if (!ed) { ed = document.createElement('input'); ed.style.cssText = 'position:fixed;z-index:70;width:150px;font:13px sans-serif;padding:2px 5px;border:2px solid #ff7a00;border-radius:4px;background:#fff;color:#000'; document.body.appendChild(ed); }
    ed.style.left = (r.left + P[0] + (right ? 6 : -156)) + 'px'; ed.style.top = (r.top + P[1] - 12) + 'px';
    ed.value = q.pin.name || ''; ed.placeholder = c.ref + ':' + q.n + ' — nome da via'; ed.focus(); ed.select(); var e0 = ed; setTimeout(function () { if (ed === e0) { e0.focus(); e0.select(); } }, 0); /* o mousedown do canvas puxa o foco de volta */
    t.pinSel = { id: c.id, n: q.n, side: q.side }; t.doc.select([c.id]); t.view.redraw();
    ed.onkeydown = function (e) { e.stopPropagation();
      if (e.key === 'Escape') { close(t); return; }
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Tab') { e.preventDefault(); var val = ed.value, i = L.pins.map(function (x) { return String(x.n); }).indexOf(String(q.n)), up = e.shiftKey || e.key === 'ArrowUp';
        if ((q.pin.name || '') !== val.trim()) t.doc.change('Nome da via ' + c.ref + ':' + q.n, function () { HX.pinNameSet(t.doc, c, q.n, val, prop); });
        var L2 = HX.connLayout(c, t.doc.p.unit), nx = L2.pins[i + (up ? -1 : 1)]; if (nx && nx.side === q.side) openAt(t, c, nx); else close(t); } };
  }
  UI.pinNameTool = function (app, on) { var t = app.tools; if (HX.isPhys(app.doc.cur())) return UI.toast('Use no esquema.', true); t.setTool('select'); t._pinName = on !== false;
    UI.toast('Nome das vias: clique no pino e digite. Enter = próximo pino, ↑ = anterior, Esc = sair. O nome vai também para a outra ponta da via.'); };
  var down0 = T.down, key0 = T.key;
  T.down = function (e) { if (!this._pinName || !sch(this) || e.button !== 0) return down0.apply(this, arguments);
    this.ev(e); var h = HX.pinAt(this.doc, this.cur, 8 / this.view.s); if (!h) { close(this); return down0.apply(this, arguments); } this._pinName = true; if (e.preventDefault) e.preventDefault(); openAt(this, h.c, h.q); };
  T.key = function (e) { var tg = (e.target || {}).tagName || '';
    if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && !/INPUT|SELECT|TEXTAREA/.test(tg) && sch(this) && G.app) { e.preventDefault(); UI.pinNameTool(G.app); return; }
    if (e.key === 'Escape' && this._pinName) close(this);
    return key0.apply(this, arguments); };
  /* tabela de nomes do conector */
  UI.pinNameTable = function (app, c) {
    var doc = app.doc; c = c || doc.selected().filter(function (i) { return i.type === 'conn'; })[0]; if (!c) return UI.toast('Selecione um conector.', true);
    var hid = new Set(c.hidden || []), P = c.pins.filter(function (q) { return !hid.has(q.n); });
    var h = '<div class="muted" style="font-size:12px">Digite os nomes ou cole uma coluna do Excel (na ordem dos pinos) ou linhas "pino [TAB] nome".</div>' +
      '<div style="max-height:330px;overflow:auto;min-width:360px"><table class="tbl" style="width:100%">' + P.map(function (q, i) { return '<tr><td style="width:60px"><b>' + HX.esc(q.n) + '</b></td><td><input data-i="' + i + '" style="width:100%" value="' + HX.esc(q.name || '') + '"></td></tr>'; }).join('') + '</table></div>' +
      '<div class="row"><label>Levar o nome à outra ponta da via</label><input id="pnProp" type="checkbox" checked></div>';
    var dlg = UI.modal('Nome das vias — ' + c.ref, h, [{ t: 'Cancelar' }, { t: 'Aplicar', pri: true, fn: go }]), el = dlg.el;
    UI.$$('input[data-i]', el).forEach(function (inp) { inp.addEventListener('paste', function (e) { var tx = (e.clipboardData || G.clipboardData).getData('text'); if (!/\n|\t|;/.test(tx)) return; e.preventDefault();
      var L = HX.pinNamesParse(tx, c), two = /\t|;/.test(tx), i0 = two ? 0 : +inp.dataset.i; L.forEach(function (nm, k) { var t = UI.$('input[data-i="' + (two ? k : i0 + k) + '"]', el); if (t && nm != null) t.value = nm; }); }); });
    function go() { var pr = UI.$('#pnProp', el).checked, V = UI.$$('input[data-i]', el).map(function (x) { return x.value; }), n = 0;
      doc.change('Nome das vias ' + c.ref, function () { var nl = pr ? HX.buildNetlist(doc.p) : null; V.forEach(function (v, i) { if ((P[i].name || '') !== v.trim()) { HX.pinNameSet(doc, c, P[i].n, v, pr, nl); n++; } }); });
      app.view.redraw(); UI.toast(n + ' nome(s) de via alterado(s)' + (pr ? ' (levados à outra ponta)' : '') + '.'); }
  };
  HX.MENU_EXTRA = HX.MENU_EXTRA || [];
  HX.MENU_EXTRA.push(['Ferramentas', function (app) { return ['Nome das vias (clicar no pino)', function () { UI.pinNameTool(app); }, 'N']; }],
    ['Ferramentas', function (app) { return ['Tabela de nomes das vias…', function () { UI.pinNameTable(app); }, '']; }]);
  if (HX.SHORTCUTS) HX.SHORTCUTS.push(['N', 'Esquema: nome das vias — clique no pino e digite (Enter = próximo)']);
})(typeof window !== 'undefined' ? window : globalThis);
