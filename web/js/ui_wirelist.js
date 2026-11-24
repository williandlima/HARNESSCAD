/* HarnessCAD - janela LISTA DE FIAÇÃO (texto → esquema): Ferramentas › Lista de fiação (texto)… (Shift+L) e botão na
   janela Conectar pino a pino. Escreve-se "J1:A > J2:B, J2:C"; a prévia mostra erros por linha e o que será criado;
   Desenhar cria os conectores declarados e os fios (emendas automáticas). O texto fica guardado no projeto. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.wtParse) return;
  var EX = '# Lista de fiação — uma ligação por linha\n# J4 = D38999:13-98        (declara conector novo; P/S no fim = macho/fêmea)\n# J1:A > J2:B, J2:C        (A do J1 vai no B e no C do J2)\n# J1B > J3:D,E | 22 PR "SINAL"   (bitola, cor e nome do sinal depois de |)\n';
  UI.wireListDialog = function (app) {
    var doc = app.doc; if (HX.isPhys(doc.cur())) return UI.toast('Use no esquemático.', true);
    var h = '<div class="muted" style="font-size:12px">Pontas: <b>J1:A</b>, J1-A ou J1A · vários destinos separados por vírgula (<b>J2:B,C</b> = B e C do J2) · setas &gt; -&gt; → · comentário com #</div>' +
      '<textarea id="wlTx" spellcheck="false" style="width:100%;min-width:620px;height:260px;font-family:Consolas,monospace;font-size:13px"></textarea>' +
      '<div class="row"><button id="wlLoad">Carregar do esquema</button><label style="margin-left:12px">Nome do fio = sinal do pino</label><input id="wlNm" type="checkbox" checked></div>' +
      '<div id="wlPv" class="muted" style="max-height:170px;overflow:auto;margin-top:6px"></div>';
    var dlg = UI.modal('Lista de fiação (texto → esquema)', h, [{ t: 'Fechar' }, { t: 'Desenhar no esquema', pri: true, fn: go }]), el = dlg.el, tx = UI.$('#wlTx', el);
    tx.value = doc.p.wtext || EX;
    function pv() {
      var P = HX.wtParse(doc, tx.value), box = UI.$('#wlPv', el), n = P.links.reduce(function (s, l) { return s + l.dst.length; }, 0);
      box.innerHTML = '<b>' + P.links.length + ' ligação(ões), ' + n + ' destino(s)</b>' + (P.conns.length ? ' · conectores novos: ' + P.conns.map(function (c) { return HX.esc(c.ref + ' = ' + c.part); }).join(', ') : '') +
        (P.errors.length ? '<div style="color:#d33">' + P.errors.slice(0, 30).map(function (e) { return 'Linha ' + e.line + ': ' + HX.esc(e.msg); }).join('<br>') + '</div>' : '<div style="color:#2a2">Sem erros.</div>');
      return P;
    }
    var tm; tx.oninput = function () { clearTimeout(tm); tm = setTimeout(pv, 250); }; pv();
    UI.$('#wlLoad', el).onclick = function () { var t = HX.wtFromDoc(doc); tx.value = (t ? '# Ligações atuais do esquema\n' + t + '\n' : EX); pv(); };
    function go() {
      var P = pv(); if (P.errors.length) return UI.toast('Corrija as linhas com erro antes de desenhar.', true), false;
      if (!P.links.length && !P.conns.length) return UI.toast('Nenhuma ligação na lista.', true), false;
      var r; doc.change('Lista de fiação', function () { doc.p.wtext = tx.value; r = HX.wtApply(doc, P, { names: UI.$('#wlNm', el).checked }); });
      doc.select(r.wires.map(function (w) { return w.id; }).concat(r.conns.map(function (c) { return c.id; }))); app.view.nl = null; if (app.view.redraw) app.view.redraw();
      var msg = r.wires.length + ' fio(s) desenhado(s), ' + r.conns.length + ' conector(es) novo(s)' + (r.skipped.length ? '; já ligados (pulados): ' + r.skipped.slice(0, 6).join(', ') + (r.skipped.length > 6 ? '…' : '') : '') +
        (r.flipped.length ? '; espelhado(s) para ficar de frente: ' + r.flipped.join(', ') : '') + '.';
      if (r.failed.length) { UI.toast('Linha(s) ' + r.failed.join(', ') + ' NÃO traçada(s): sem caminho livre sem encostar em outro fio. Afaste os conectores e desenhe de novo (o resto foi desenhado). ' + msg, true);
        var box = UI.$('#wlPv', el); if (box) box.innerHTML += '<div style="color:#d33"><b>Não traçadas (sem curto): linha(s) ' + r.failed.join(', ') + '</b></div>'; return false; }
      UI.toast(msg);
    }
  };
  HX.MENU_EXTRA = HX.MENU_EXTRA || [];
  HX.MENU_EXTRA.push(['Ferramentas', function (app) { return ['Lista de fiação (texto)…', function () { UI.wireListDialog(app); }, 'Shift+L']; }]);
  var T = HX.Tools.prototype, key0 = T.key;
  T.key = function (e) {
    if ((e.key === 'l' || e.key === 'L') && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && !/INPUT|SELECT|TEXTAREA/.test((e.target || {}).tagName || '') && this.doc && !HX.isPhys(this.doc.cur()) && G.app) { e.preventDefault(); UI.wireListDialog(G.app); return; }
    return key0.call(this, e);
  };
  /* atalho dentro da janela Conectar pino a pino */
  var pp0 = UI.pinToPinDialog; if (pp0) UI.pinToPinDialog = function (app) { var r = pp0.apply(this, arguments), box = document.querySelector('#modal #ppPv');
    if (box && !document.querySelector('#modal #ppWl')) { var d = document.createElement('div'); d.className = 'row';
      d.innerHTML = '<button id="ppWl" style="flex:1">Escrever lista de ligação (J1:A &gt; J2:B, J2:C)…</button>'; d.firstChild.onclick = function () { UI.wireListDialog(app); }; box.parentNode.insertBefore(d, box); }
    return r; };
})(typeof window !== 'undefined' ? window : globalThis);
