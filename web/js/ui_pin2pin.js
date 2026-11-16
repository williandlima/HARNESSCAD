/* HarnessCAD - interface do CONECTAR PINO A PINO: Ferramentas › Conectar pino a pino… (tecla P) e botão no painel quando
   dois conectores estão selecionados. Mostra a prévia (pares, pinos sem par, pinos já ligados) antes de criar os fios. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI;
  function conns(doc) { return doc.items().filter(function (i) { return i.type === 'conn' && !i.eq && !(HX.CAT.conns[i.part] || {}).disc; }); }
  UI.pinToPinDialog = function (app) {
    var doc = app.doc; if (HX.isPhys(doc.cur())) return UI.toast('Use no esquemático.', true);
    var C = conns(doc); if (C.length < 2) return UI.toast('A folha precisa de pelo menos dois conectores.', true);
    var sel = doc.selected().filter(function (i) { return i.type === 'conn'; }).sort(function (a, b) { return a.x - b.x; });
    var A = sel[0] || C[0], B = sel[1] || C.filter(function (c) { return c !== A; })[0];
    var opt = function (cur) { return C.map(function (c) { return '<option value="' + c.id + '"' + (c === cur ? ' selected' : '') + '>' + HX.esc(c.ref + ' — ' + ((HX.CAT.conns[c.part] || {}).label || c.part)) + '</option>'; }).join(''); };
    var h = '<div class="row"><label>De</label><select id="ppA">' + opt(A) + '</select></div><div class="row"><label>Para</label><select id="ppB">' + opt(B) + '</select></div>' +
      '<div class="row"><label>Casar por</label><select id="ppBy"><option value="pin">Número/letra do pino (A→A, 1→1)</option><option value="signal">Nome do sinal do pino</option><option value="order">Ordem dos pinos (1º→1º)</option></select></div>' +
      '<div class="row"><label>Pular pinos que já têm fio</label><input id="ppSk" type="checkbox" checked></div><div class="row"><label>Nome do fio = sinal do pino</label><input id="ppNm" type="checkbox" checked></div>' +
      '<div id="ppPv" class="muted" style="max-height:220px;overflow:auto;margin-top:6px"></div>';
    var dlg = UI.modal('Conectar pino a pino', h, [{ t: 'Cancelar' }, { t: 'Conectar', pri: true, fn: go }]), el = dlg.el;
    function cur() { var m = {}; C.forEach(function (c) { m[c.id] = c; }); return { A: m[UI.$('#ppA', el).value], B: m[UI.$('#ppB', el).value], o: { by: UI.$('#ppBy', el).value, skipBusy: UI.$('#ppSk', el).checked, names: UI.$('#ppNm', el).checked } }; }
    function pv() {
      var s = cur(), box = UI.$('#ppPv', el); if (s.A === s.B) { box.innerHTML = '<b style="color:#f0a020">Escolha dois conectores diferentes.</b>'; return; }
      var P = HX.pinToPinPlan(doc, s.A, s.B, s.o), li = function (a) { return a.slice(0, 40).map(HX.esc).join(', ') + (a.length > 40 ? '…' : ''); };
      box.innerHTML = '<b>' + P.pairs.length + ' fio(s)</b>: ' + li(P.pairs.map(function (r) { return s.A.ref + ':' + r.a.n + ' → ' + s.B.ref + ':' + r.b.n; })) +
        (P.busy.length ? '<br>Já ligados (pulados): ' + li(P.busy) : '') + (P.onlyA.length ? '<br>Sem par em ' + HX.esc(s.B.ref) + ': ' + li(P.onlyA) : '') + (P.onlyB.length ? '<br>Sem par em ' + HX.esc(s.A.ref) + ': ' + li(P.onlyB) : '');
    }
    ['#ppA', '#ppB', '#ppBy', '#ppSk'].forEach(function (q) { UI.$(q, el).onchange = pv; }); pv();
    function go() {
      var s = cur(), r; if (s.A === s.B) return UI.toast('Escolha dois conectores diferentes.', true), false;
      doc.change('Conectar pino a pino', function () { r = HX.pinToPin(doc, s.A, s.B, s.o); });
      if (!r.wires.length) return UI.toast('Nenhum par de pinos para ligar.', true);
      doc.select(r.wires.map(function (w) { return w.id; })); app.view.nl = null;
      UI.toast(r.wires.length + ' fio(s) criados: ' + s.A.ref + ' ↔ ' + s.B.ref + (r.plan.onlyA.length + r.plan.onlyB.length ? ' (' + (r.plan.onlyA.length + r.plan.onlyB.length) + ' pino(s) sem par)' : '') + (r.flipped ? ' ' + r.flipped + ' espelhado para ficar de frente.' : '') + '.');
    }
  };
  HX.MENU_EXTRA = HX.MENU_EXTRA || [];
  HX.MENU_EXTRA.push(['Ferramentas', function (app) { return ['Conectar pino a pino…', function () { UI.pinToPinDialog(app); }, 'Shift+P']; }]);
  var T = HX.Tools.prototype, key0 = T.key;
  T.key = function (e) {
    if ((e.key === 'p' || e.key === 'P') && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && !/INPUT|SELECT|TEXTAREA/.test((e.target || {}).tagName || '') && this.doc && !HX.isPhys(this.doc.cur()) && G.app) { e.preventDefault(); UI.pinToPinDialog(G.app); return; }
    return key0.call(this, e);
  };
  // botão no painel quando 2 conectores estão selecionados
  var A0 = HX.App.prototype, init0 = A0.init;
  A0.init = function () {
    init0.call(this); var app = this, doc = app.doc;
    var add = function () {
      var s = doc.selected(), cs = s.filter(function (i) { return i.type === 'conn'; }), root = UI.$('#props');
      if (!root || cs.length !== 2 || HX.isPhys(doc.cur()) || root.querySelector('#ppBtn')) return;
      var d = document.createElement('div'); d.className = 'row'; d.innerHTML = '<button id="ppBtn" style="flex:1">Conectar pino a pino (' + HX.esc(cs[0].ref) + ' ↔ ' + HX.esc(cs[1].ref) + ') — P</button>';
      d.firstChild.onclick = function () { UI.pinToPinDialog(app); }; root.insertBefore(d, root.children[1] || null);
    };
    doc.on('select', function () { setTimeout(add, 0); }); doc.on('change', function () { setTimeout(add, 0); });
  };
})(typeof window !== 'undefined' ? window : globalThis);
