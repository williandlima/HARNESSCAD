/* HarnessCAD - interface dos MODELOS DE CABO: aba "Cabos" no catálogo, janela do cabo (modelo, nº de vias, bitola, trança
   em pares, blindagem, dreno, PN) e as duas formas de uso: inserir (clique no esquema onde o cabo vai ficar — as vias
   nascem prontas para ligar) e transformar fios já desenhados em cabo (clique direito / ações do item). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.CABLE_LIB) return;
  function esc(t) { return HX.esc(String(t == null ? '' : t)); }
  UI.cableDialog = function (app, wires, cab, key) {
    var doc = app.doc; if (HX.isPhys(doc.cur())) return UI.toast('Use no esquema.', true); wires = wires || []; var L = HX.CABLE_LIB, k0 = key || (cab && cab.model) || 'BLD';
    var mode = cab ? 'edit' : wires.length ? 'apply' : 'insert', d = doc.p.defaults;
    var h = '<div class="row"><label>Modelo</label><select id="cbM">' + Object.keys(L).map(function (k) { return '<option value="' + k + '"' + (k === k0 ? ' selected' : '') + '>' + esc(L[k].n) + '</option>'; }).join('') + '</select></div>' +
      '<div class="row"><label>Nº de vias</label><input id="cbN" type="number" min="1" max="48" style="width:70px"' + (wires.length ? ' value="' + wires.length + '" disabled' : '') + '></div>' +
      '<div class="row"><label>Bitola</label><input id="cbG" style="width:70px" value="' + esc(d.gauge || '') + '"><span class="muted">&nbsp;(tipo de fio: ' + esc(d.wtype || '') + ')</span></div>' +
      '<div class="row"><label>Pares trançados</label><input id="cbT" type="checkbox"></div><div class="row"><label>Blindado</label><input id="cbS" type="checkbox"></div>' +
      '<div class="row"><label>Dreno</label><select id="cbD"><option value="">Ponto de ligação (fio de dreno)</option><option value="gnd">Símbolo de terra</option><option value="none">Nenhum</option></select></div>' +
      '<div class="row"><label>Part number</label><input id="cbP" style="flex:1" value="' + esc(cab ? cab.part : '') + '"></div><div id="cbI" class="muted" style="font-size:12px;max-width:520px"></div>';
    var dlg = UI.modal(mode === 'insert' ? 'Cabo do catálogo' : mode === 'apply' ? 'Transformar ' + wires.length + ' fio(s) em cabo' : 'Cabo ' + cab.ref, h,
      [{ t: 'Cancelar' }, { t: mode === 'insert' ? 'Inserir (clique no esquema)' : mode === 'apply' ? 'Transformar em cabo' : 'Aplicar', pri: true, fn: go }]), el = dlg.el;
    function $(q) { return UI.$(q, el); }
    function fill() { var m = L[$('#cbM').value]; if (!wires.length) $('#cbN').value = cab && cab.model === $('#cbM').value ? cab.vias || m.vias : m.vias; $('#cbT').checked = !!m.tw; $('#cbS').checked = m.shield !== false; $('#cbD').value = m.drain || '';
      $('#cbI').innerHTML = m.ok ? '' : '⚠ <b>Aguardando datasheet</b>' + (m.need ? ': ' + esc(m.need) : '') + '. Até lá o PN é digitado e as vias usam a bitola/cor padrão do projeto (edite por fio). Nada é inventado.'; }
    $('#cbM').onchange = fill; fill();
    function go() { var m = L[$('#cbM').value], o = { model: $('#cbM').value, vias: +$('#cbN').value || m.vias, gauge: $('#cbG').value.trim(), tw: $('#cbT').checked, shield: $('#cbS').checked, drain: $('#cbD').value, pn: $('#cbP').value.trim() };
      if (mode === 'insert') { app.tools._cabPend = { m: m, o: o }; UI.toast('Clique no esquema onde o cabo vai ficar (Esc cancela).'); return; }
      var r; doc.change(mode === 'apply' ? 'Transformar em cabo' : 'Modelo do cabo', function () { r = HX.cableApply(doc, mode === 'edit' ? HX.cableWires(doc, cab) : wires, m, cab || null, o); });
      if (r && r.err) { doc.undoStack.pop(); UI.toast(r.err, true); return false; }
      if (r) { doc.select([r.cable.id]); app.view.redraw(); UI.toast('Cabo ' + r.cable.ref + ' com ' + r.wires.length + ' via(s).'); } }
  };
  /* colocar o cabo com um clique */
  var T = HX.Tools.prototype, down0 = T.down, key0 = T.key;
  T.down = function (e) { var pd = this._cabPend; if (!pd || e.button !== 0 || HX.isPhys(this.doc.cur())) return down0.apply(this, arguments);
    this.ev(e); this._cabPend = null; var doc = this.doc, p = this.cur, r; doc.change('Inserir cabo', function () { r = HX.cableInsert(doc, pd.m, p, pd.o); });
    doc.select(r.wires.map(function (w) { return w.id; }).concat([r.cable.id])); this.view.redraw(); UI.toast('Cabo ' + r.cable.ref + ' com ' + r.wires.length + ' via(s): ligue as pontas nos pinos (fio, pino a pino ou lista de fiação).'); };
  T.key = function (e) { if (e.key === 'Escape' && this._cabPend) { this._cabPend = null; UI.toast('Inserir cabo cancelado.'); } return key0.apply(this, arguments); };
  /* aba "Cabos" no catálogo */
  var A = HX.App.prototype, init0 = A.init;
  A.init = function () { init0.apply(this, arguments); var app = this, tabs = UI.$('#leftTabs'), left = UI.$('#left'); if (!tabs || UI.$('#pCable')) return;
    var b = document.createElement('button'); b.dataset.p = 'pCable'; b.textContent = 'Cabos'; var pin = tabs.querySelector('.hxPin'); tabs.insertBefore(b, pin || null);
    var pane = document.createElement('div'); pane.className = 'pane'; pane.id = 'pCable'; pane.style.display = 'none'; left.appendChild(pane);
    pane.innerHTML = '<div class="muted" style="padding:6px 8px;font-size:12px">Cabos blindados e pares trançados: clique em <b>Inserir</b> e depois no esquema — as vias nascem prontas, com a blindagem e o dreno. Para fios já desenhados: selecione-os › clique direito › <b>Transformar em cabo</b>.</div>' +
      Object.keys(HX.CABLE_LIB).map(function (k) { var m = HX.CABLE_LIB[k]; return '<div class="row" style="padding:4px 8px;border-top:1px solid var(--line,#ddd)"><div style="flex:1"><b>' + esc(m.n) + '</b><br><span class="muted" style="font-size:11px">' + m.vias + ' vias' + (m.tw ? ', pares trançados' : '') + (m.shield ? ', blindado' : '') + (m.ok ? '' : ' · aguardando datasheet') + '</span></div><button data-cab="' + k + '">Inserir…</button></div>'; }).join('');
    pane.addEventListener('click', function (e) { var x = e.target.closest('[data-cab]'); if (x) UI.cableDialog(app, null, null, x.dataset.cab); });
    tabs.addEventListener('click', function (e) { var t = e.target.closest('button[data-p]'); if (!t) return; pane.style.display = t.dataset.p === 'pCable' ? '' : 'none';
      if (t.dataset.p === 'pCable') { ['pConn', 'pWire', 'pSplice'].forEach(function (p) { var q = UI.$('#' + p); if (q) q.style.display = 'none'; }); UI.$$('#leftTabs button').forEach(function (x) { x.classList.toggle('on', x === t); }); } });
    if (app.layout && app.layout.refresh) app.layout.refresh(); };
  HX.MENU_EXTRA = HX.MENU_EXTRA || []; HX.MENU_EXTRA.push(['Inserir', function (app) { return ['Cabo do catálogo (blindado, pares)…', function () { UI.cableDialog(app); }, '']; }]);
})(typeof window !== 'undefined' ? window : globalThis);
