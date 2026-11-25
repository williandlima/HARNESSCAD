/* HarnessCAD - janela CABO NOS PINOS (barra ativa, faixa Esquema › Cabos, clique direito do conector): modelo, De, Para,
   bitola, pares trançados, blindagem, dreno no pino, PN. Duas formas: digitar "J1:1,2" / "J2:1,2" ou ESCOLHER CLICANDO
   (a janela some; clique nos pinos de origem, Enter, clique nos de destino, Enter — volta com os campos preenchidos).
   Quem faz o trabalho: HX.cablePins (cat_cable2.js). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, T = HX.Tools && HX.Tools.prototype; if (!UI || !T || !HX.cablePins) return;
  function esc(t) { return HX.esc(String(t == null ? '' : t)); }
  var HL = '#ff7a00', HL2 = '#1e6bff';
  UI.cablePinsDialog = function (app, st) {
    var doc = app.doc, L = HX.CABLE_LIB; if (HX.isPhys(doc.cur())) return UI.toast('Use no esquema.', true);
    st = st || { m: 'BLD-TP', de: '', para: '', g: doc.p.defaults.gauge || '', tw: null, sh: true, dr: '', pn: '' };
    if (!st.de && !st.para) { var c = doc.selected().filter(function (i) { return i.type === 'conn'; }); if (c[0]) st.de = c[0].ref + ':'; if (c[1]) st.para = c[1].ref + ':'; }
    var h = '<div class="row"><label>Modelo</label><select id="cpM">' + Object.keys(L).map(function (k) { return '<option value="' + k + '"' + (k === st.m ? ' selected' : '') + '>' + esc(L[k].n) + '</option>'; }).join('') + '</select></div>' +
      '<div class="row"><label>De (pinos)</label><input id="cpA" style="flex:1" placeholder="J1:1,2" value="' + esc(st.de) + '"></div>' +
      '<div class="row"><label>Para (pinos)</label><input id="cpB" style="flex:1" placeholder="J2:1,2" value="' + esc(st.para) + '"></div>' +
      '<div class="row"><label></label><button id="cpPick">Escolher clicando nos pinos…</button><span class="muted" style="font-size:11px">&nbsp;1º pino de De liga no 1º de Para, e assim por diante</span></div>' +
      '<div class="row"><label>Bitola</label><input id="cpG" style="width:70px" value="' + esc(st.g) + '"></div>' +
      '<div class="row"><label>Pares trançados</label><input id="cpT" type="checkbox"></div><div class="row"><label>Blindado</label><input id="cpS" type="checkbox"' + (st.sh ? ' checked' : '') + '></div>' +
      '<div class="row"><label>Dreno no pino</label><input id="cpD" style="width:110px" placeholder="ex.: J1:9 (opcional)" value="' + esc(st.dr) + '"></div>' +
      '<div class="row"><label>Part number</label><input id="cpP" style="flex:1" value="' + esc(st.pn) + '"></div><div id="cpI" class="muted" style="font-size:12px;max-width:520px"></div>';
    var dlg = UI.modal('Cabo nos pinos (trançado / blindado)', h, [{ t: 'Cancelar' }, { t: 'Colocar o cabo', pri: true, fn: go }]), el = dlg.el;
    function $(q) { return UI.$(q, el); }
    function read() { st.m = $('#cpM').value; st.de = $('#cpA').value; st.para = $('#cpB').value; st.g = $('#cpG').value.trim(); st.tw = $('#cpT').checked; st.sh = $('#cpS').checked; st.dr = $('#cpD').value.trim(); st.pn = $('#cpP').value.trim(); }
    function info() { var m = L[$('#cpM').value], a = HX.cablePinList($('#cpA').value).length, b = HX.cablePinList($('#cpB').value).length;
      $('#cpI').innerHTML = (a || b ? (a === b ? '✓ ' + a + ' via(s)' : '⚠ De tem ' + a + ' pino(s), Para tem ' + b) + '. ' : '') + (m.ok ? '' : '⚠ <b>Aguardando datasheet</b>' + (m.need ? ': ' + esc(m.need) : '') + '. PN digitado; nada inventado.'); }
    $('#cpM').onchange = function () { $('#cpT').checked = !!L[$('#cpM').value].tw; info(); }; $('#cpT').checked = st.tw == null ? !!L[st.m].tw : st.tw;
    $('#cpA').oninput = $('#cpB').oninput = info; info();
    $('#cpPick').onclick = function () { read(); dlg.close(); app.tools._cpPick = { st: st, ph: 'de', A: [], B: [] }; app.view.redraw();
      UI.toast('Clique nos pinos de ORIGEM (De) na ordem. Enter = passar para o destino. Esc = voltar à janela.'); };
    function go() { read(); var m = L[st.m], r, o = { model: st.m, gauge: st.g, tw: st.tw, shield: st.sh, pn: st.pn, dreno: st.dr };
      doc.change('Cabo nos pinos', function () { r = HX.cablePins(doc, m, st.de, st.para, o); });
      if (!r || r.err) { if (r && !r.cable) doc.undoStack.pop(); UI.toast((r && r.err) || 'Erro.', true); return false; }
      doc.select([r.cable.id]); app.view.redraw();
      UI.toast('Cabo ' + r.cable.ref + ' com ' + r.wires.length + ' via(s) nos pinos' + (r.drainWire ? ', dreno ligado em ' + st.dr : '') + '.' + (r.failed.length ? ' Não traçado: ' + r.failed.join(', ') : '') + (r.drainErr ? ' ' + r.drainErr : ''), !!(r.failed.length || r.drainErr)); }
  };
  /* escolher clicando */
  var down0 = T.down, key0 = T.key, ov0 = T.drawOverlay;
  T.down = function (e) { var k = this._cpPick; if (!k || e.button !== 0 || HX.isPhys(this.doc.cur())) return down0.apply(this, arguments);
    this.ev(e); var h = HX.pinAt(this.doc, this.cur, 8 / this.view.s); if (!h) return; var id = h.c.ref + ':' + h.n, L = k.ph === 'de' ? k.A : k.B, i = L.indexOf(id);
    if (i >= 0) L.splice(i, 1); else L.push(id); this.view.redraw(); UI.toast((k.ph === 'de' ? 'De' : 'Para') + ': ' + (L.join(', ') || '—') + (k.ph === 'de' ? '  (Enter = destino)' : '  (Enter = concluir; ' + k.A.length + ' em De)')); };
  function list(L) { var out = [], last = ''; L.forEach(function (x) { var p = x.split(':'); out.push(p[0] === last ? p.slice(1).join(':') : x); last = p[0]; }); return out.join(','); }
  T.key = function (e) { var k = this._cpPick, tg = (e.target || {}).tagName || ''; if (!k || /INPUT|SELECT|TEXTAREA/.test(tg)) return key0.apply(this, arguments);
    if (e.key === 'Enter') { e.preventDefault(); if (k.ph === 'de') { k.ph = 'para'; this.view.redraw(); UI.toast('Agora clique nos pinos de DESTINO (Para), na mesma ordem. Enter = concluir.'); return; } }
    if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); this._cpPick = null; this.view.redraw(); if (k.A.length) k.st.de = list(k.A); if (k.B.length) k.st.para = list(k.B); UI.cablePinsDialog(G.app, k.st); return; }
    return key0.apply(this, arguments); };
  T.drawOverlay = function (g) { ov0.apply(this, arguments); var k = this._cpPick; if (!k) return; var doc = this.doc, u = doc.p.unit, s = this.view.s;
    [[k.A, HL], [k.B, HL2]].forEach(function (P) { P[0].forEach(function (id, i) { var p = id.split(':'), c = doc.items().filter(function (x) { return x.type === 'conn' && x.ref === p[0]; })[0]; if (!c) return;
      var q = HX.connLayout(c, u).pins.filter(function (x) { return String(x.n) === p.slice(1).join(':'); })[0]; if (!q) return;
      g.style({ stroke: P[1], lw: 2 / s, fill: P[1] === HL ? 'rgba(255,122,0,0.35)' : 'rgba(30,107,255,0.35)', dash: null }); g.circle(q.pt[0], q.pt[1], 4 / s);
      if (g.text) g.text(String(i + 1), q.pt[0], q.pt[1] - 7 / s, { size: 10 / s, align: 'c', bold: true, color: P[1] }); }); }); g.style({ fill: null }); };
  HX.MENU_EXTRA = HX.MENU_EXTRA || []; HX.MENU_EXTRA.push(['Inserir', function (app) { return ['Cabo nos pinos (De/Para, trançado, blindado)…', function () { UI.cablePinsDialog(app); }, '']; }]);
})(typeof window !== 'undefined' ? window : globalThis);
