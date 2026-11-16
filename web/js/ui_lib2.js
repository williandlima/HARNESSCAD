/* HarnessCAD - painel esquerdo: fios padrão (tabelas AWG/mm²) e emendas */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI;
  UI.initWirePane = function (app) {
    var doc = app.doc, pw = UI.$('#pWire');
    function opts(list, v) { return list.map(function (o) { return '<option value="' + HX.esc(o[0]) + '"' + (o[0] === v ? ' selected' : '') + '>' + HX.esc(o[1]) + '</option>'; }).join(''); }
    function render() {
      var d = doc.p.defaults, t = HX.wireType(d.wtype) || HX.CAT.wires['M22759/16'];
      var types = Object.keys(HX.CAT.wires).map(function (k) { return [k, (HX.CAT.wires[k].std === 'MIL' ? '[MIL] ' : '') + k]; });
      var cols = Object.keys(HX.COLORS).map(function (k) { return [k, k + ' - ' + HX.COLORS[k][0]]; });
      var base = String(d.color).split('-');
      pw.innerHTML = '<h4>Padrão para novos fios</h4>' +
        '<div class="row"><label>Tipo</label><select id="wt">' + opts(types, d.wtype) + '</select></div>' +
        '<div class="muted">' + HX.esc(t.desc) + '</div>' +
        '<div class="row"><label>Bitola</label><select id="wg">' + opts(t.gauges.map(function (g) { return [g, g + (t.unit === 'mm2' ? ' mm²' : t.unit === 'coax' ? '' : ' AWG')]; }), d.gauge) + '</select></div>' +
        '<div class="row"><label>Cor</label><select id="wc">' + opts(cols, base[0]) + '</select></div>' +
        '<div class="row"><label>Listra</label><select id="ws"><option value="">(nenhuma)</option>' + opts(cols, base[1] || '') + '</select></div>' +
        '<div class="row"><label>Prefixo nº</label><input id="wp" value="' + HX.esc(d.wirePfx || 'W') + '"></div>' +
        '<div class="row"><label>Unir pontas</label><input type="checkbox" id="wm"' + (d.mergeWires === true ? ' checked' : '') + '> <span class="muted">ponta com ponta vira um fio só (desligado = junção)</span></div>' +
        '<div class="row"><button id="wapply" style="flex:1">Aplicar aos fios selecionados</button></div>' +
        '<h4>Comprimento pelas cotas</h4><div class="row"><label>Folga por ponta</label><input id="wle" type="number" value="' + (+d.lenEnd || 0) + '"> mm</div>' +
        '<div class="row"><label>Perda / sobra</label><input id="wsc" type="number" value="' + (+d.scrapPct || 0) + '"> %</div>' +
        '<div class="muted">PN resultante: <b>' + HX.esc(HX.wirePN(d)) + '</b></div>' +
        '<h4>Tabela AWG (cobre, 20 °C)</h4><table class="t"><tr><th>AWG</th><th>Ø mm</th><th>mm²</th><th>Ω/km</th><th>A*</th></tr>' +
        HX.AWG.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td><td>' + r[4] + '</td></tr>'; }).join('') +
        '</table><h4>Métrico IEC 60228 cl.5</h4><table class="t"><tr><th>mm²</th><th>Ω/km</th><th>≈AWG</th><th>A*</th></tr>' +
        HX.MM2.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td></tr>'; }).join('') +
        '</table><p class="muted">*Corrente indicativa p/ fio isolado ao ar. Dimensione por AS50881 / NBR 5410 / dados do fabricante.</p>';
      function upd() {
        d.wtype = UI.$('#wt').value; var nt = HX.wireType(d.wtype);
        d.gauge = nt.gauges.indexOf(UI.$('#wg').value) >= 0 ? UI.$('#wg').value : nt.gauges[Math.floor(nt.gauges.length / 2)];
        d.color = UI.$('#wc').value + (UI.$('#ws').value ? '-' + UI.$('#ws').value : '');
        d.wirePfx = UI.$('#wp').value || 'W'; d.mergeWires = UI.$('#wm').checked; render();
      }
      ['#wt', '#wg', '#wc', '#ws', '#wp', '#wm'].forEach(function (s) { UI.$(s).onchange = upd; });
      UI.$('#wle').onchange = function () { var v = +this.value || 0; doc.change('Folga', function () { d.lenEnd = v; }); };
      UI.$('#wsc').onchange = function () { var v = +this.value || 0; doc.change('Perda', function () { d.scrapPct = v; }); };
      UI.$('#wapply').onclick = function () {
        var ws = doc.selected().filter(function (i) { return i.type === 'wire'; }); if (!ws.length) return UI.toast('Selecione fios', true);
        doc.change('Especificar fios', function () { ws.forEach(function (w) { w.wtype = d.wtype; w.gauge = d.gauge; w.color = d.color; }); });
      };
    }
    app.refreshWire = render; render();
  };

  UI.initSplicePane = function (app) {
    var doc = app.doc, ps = UI.$('#pSplice'), d = doc.p.defaults;
    var kinds = Object.keys(HX.CAT.splices);
    ps.innerHTML = '<h4>Emenda padrão (ferramenta J e T automáticos)</h4>' +
      kinds.map(function (k) { return '<div class="row"><input type="radio" name="sk" value="' + k + '"' + ((d.spliceKind || 'junction') === k ? ' checked' : '') + '> ' + HX.esc(HX.CAT.splices[k].d) + '</div>'; }).join('') +
      '<div class="row"><button id="sapply" style="flex:1">Aplicar tipo às emendas selecionadas</button></div>' +
      '<h4>Peças de emenda</h4><div class="list">' + HX.SPLICE_PARTS.map(function (p) { return '<div class="it" data-pn="' + HX.esc(p[0]) + '">' + HX.esc(p[0]) + '<small>' + HX.esc(p[1]) + '</small></div>'; }).join('') + '</div>' +
      '<p class="muted">Clique numa peça para atribuí-la às emendas selecionadas. Como no KiCad: ponta de fio sobre outro fio cria emenda automaticamente; 3 ou mais pontas no mesmo ponto também.</p>';
    UI.$$('input[name=sk]', ps).forEach(function (r) { r.onchange = function () { doc.p.defaults.spliceKind = r.value; }; });
    function selSp() { return doc.selected().filter(function (i) { return i.type === 'splice'; }); }
    UI.$('#sapply').onclick = function () {
      var s = selSp(), k = doc.p.defaults.spliceKind || 'junction'; if (!s.length) return UI.toast('Selecione emendas', true);
      doc.change('Tipo de emenda', function () { s.forEach(function (x) { x.kind = k; }); });
    };
    UI.$$('.it[data-pn]', ps).forEach(function (it) {
      it.onclick = function () { var s = selSp(); if (!s.length) return UI.toast('Selecione emendas', true); doc.change('Peça de emenda', function () { s.forEach(function (x) { x.part = it.dataset.pn; if (x.kind === 'junction') x.kind = 'crimp'; }); }); };
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
