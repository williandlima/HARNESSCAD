/* HarnessCAD - painel de propriedades: pinos do conector e detalhes do fio */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, ops = HX.ops;
  var COLORS = function () { return Object.keys(HX.COLORS).map(function (k) { return [k, k + ' ' + HX.COLORS[k][0]]; }); };
  // comprimento calculado pelas cotas (caminho e folgas)
  function lenInfo(app, it) {
    var nl = app.view.netlist(), LL = nl._dims || (nl._dims = HX.computeLengths(app.doc.p, nl)), w = LL.wires[it.id] || {};
    if (w.manual) return '<br>Comprimento: <b>' + it.len + ' mm</b> (manual; apague para calcular pelo desenho físico)';
    if (w.auto == null) return '<br><span style="color:#f0a020">Sem caminho no desenho físico entre as pontas</span> — gere/atualize o desenho físico e ligue os ramos (W)';
    var n = w.path.length, ph = LL.phys;
    return '<br>Comprimento calculado: <b>' + Math.round(w.auto) + ' mm</b> (' + n + (ph ? ' ramo' : ' cota') + (n === 1 ? '' : 's') + (ph ? ' do desenho físico' : '') + ' + folgas das pontas)';
  }
  UI.propsExtra = function (it, app) {
    var doc = app.doc;
      var h = '';
      if (it.type === 'conn') {
        h += '<div class="muted">PN: <b>' + HX.esc(HX.connPN(it)) + '</b><br>' + HX.esc((HX.getConnDef(it.part, doc.p) || {}).desc || it.part) + '</div>';
        h += '<div class="row"><button id="pHide">Ocultar não usados</button><button id="pShow">Mostrar todos</button></div>';
        h += '<div class="row"><button id="pImp" style="flex:1">Colar pinagem (pino;sinal)</button></div>';
        if (!it.eq && !it.disc) h += HX.faceImgFor(it.part, it.gender) ? '<div class="row"><button id="pFace" class="hasFace" style="flex:1">▣ Inserir vista frontal (imagem do datasheet)</button></div>' :
          '<div class="row"><button id="pFace" class="noFace" style="flex:1" title="Sem imagem do datasheet cadastrada">Vista frontal: não disponível</button></div>';
        h += '<h4>Pinos (' + it.pins.length + ')</h4><table class="t pins"><tr><th>Pino</th><th>Sinal</th><th>Cont.</th><th>Vis.</th></tr>' + it.pins.map(function (p, i) {
          return '<tr><td>' + HX.esc(p.n) + '</td><td><input data-i="' + i + '" value="' + HX.esc(p.name) + '"></td><td>' + HX.esc(p.sz || '') + '</td><td><input type="checkbox" data-v="' + i + '"' + ((it.hidden || []).indexOf(p.n) < 0 ? ' checked' : '') + '></td></tr>';
        }).join('') + '</table>';
      }
      if (it.type === 'wire') {
        var row = HX.wireList(doc.p, app.view.netlist()).filter(function (r) { return r.id === it.id; })[0] || {};
        var res = HX.wireRes(it);
        h += '<div class="row"><label>Listra</label><select id="pStripe"><option value="">(nenhuma)</option>' + COLORS().map(function (c) { return '<option value="' + c[0] + '"' + (String(it.color).split('-')[1] === c[0] ? ' selected' : '') + '>' + HX.esc(c[1]) + '</option>'; }).join('') + '</select></div>';
        h += '<div class="muted">PN: <b>' + HX.esc(HX.wirePN(it)) + '</b><br>De <b>' + HX.esc(row.from || '?') + '</b> para <b>' + HX.esc(row.to || '?') + '</b><br>Circuito: <b>' + HX.esc(row.signal || '') + '</b>' + (row.cable ? ' · Cabo ' + HX.esc(row.cable) : '') +
          lenInfo(app, it) + (res != null ? '<br>Resistência estimada: ' + (res * 1000).toFixed(1) + ' mΩ' : '') + '</div>';
        // contatos nas pontas: faixa de bitola aceita; aviso em vermelho se o fio está fora
        var nl = app.view.netlist(), cts = [];
        [it.pts[0], it.pts[it.pts.length - 1]].forEach(function (q) {
          var nd = nl.nodes[doc.sheet + '|' + HX.key(q[0], q[1])];
          (nd ? nd.terms : []).forEach(function (t) { var ct = t.kind === 'pin' && HX.contactFor(t.item, t.pinObj, HX.gaugeAWG(it)); if (ct && ct.awg) cts.push(t.ref + ':' + t.pin + ' #' + ct.size + ' ' + ct.pn + ' (' + ct.rtxt + (ct.a ? ', ' + ct.a + ' A' : '') + ')'); });
        });
        var bad = (HX.gaugeIssues(doc.p, nl)[it.id] || []);
        if (cts.length) h += '<div class="muted">Contatos: ' + HX.esc(cts.join(' · ')) + '</div>';
        if (bad.length) h += '<div class="gaugeBad">⚠ ' + bad.map(function (x) { return HX.esc(HX.gaugeLabel(it) + ' fora da faixa de ' + x.ref + ':' + x.pin + ' (#' + x.size + ': ' + x.awg[0] + '–' + x.awg[1] + ' AWG)'); }).join('<br>⚠ ') + '</div>';
      }
      if (it.type === 'splice') h += '<datalist id="splParts">' + HX.SPLICE_PARTS.map(function (p) { return '<option value="' + HX.esc(p[0]) + '">' + HX.esc(p[1]) + '</option>'; }).join('') + '</datalist>';
      return h;
  };
  UI.propsBind = function (it, app, root, set) {
    var doc = app.doc;
      if (it.type === 'conn') {
        UI.$$('input[data-i]', root).forEach(function (inp) {
          inp.onchange = function () { var p = it.pins[+inp.dataset.i]; doc.change('Sinal do pino', function () { p.name = inp.value; }); };
        });
        UI.$$('input[data-v]', root).forEach(function (cb) {
          cb.onchange = function () {
            var n = it.pins[+cb.dataset.v].n;
            doc.change('Visibilidade do pino', function () { ops.keepWires(doc, [it.id], function () { var h = (it.hidden || []).filter(function (x) { return x !== n; }); if (!cb.checked) h.push(n); it.hidden = h; }); });
          };
        });
        UI.$('#pHide').onclick = function () { var nl = app.view.netlist(); doc.change('Ocultar pinos', function () { ops.keepWires(doc, [it.id], function () { ops.hideUnused(doc, it, nl); }); }); };
        if (UI.$('#pFace')) UI.$('#pFace').onclick = function () {
          if (!HX.faceImgFor(it.part, it.gender)) return UI.toast('Este conector não tem vista frontal cadastrada. Para incluir: Biblioteca › Imagem do datasheet…');
          var b = HX.bbox(it, doc.p.unit), f = HX.makeFace(doc, it, 0, 0), g = doc.p.grid.size || 1;
          f.x = HX.snap(b.x0 - f.d / 2 - 8, g); f.y = HX.snap((b.y0 + b.y1) / 2, g);
          doc.change('Vista frontal', function () { doc.add(f); }); doc.select([f.id]);
        };
        UI.$('#pShow').onclick = function () { doc.change('Mostrar pinos', function () { ops.keepWires(doc, [it.id], function () { it.hidden = []; }); }); };
        UI.$('#pImp').onclick = function () {
          UI.modal('Colar pinagem de ' + it.ref, '<p class="muted">Uma linha por pino: <b>pino;sinal</b> (pode colar colunas do Excel). Pinos existentes recebem o sinal; pinos novos são adicionados.</p><textarea id="pinTxt" rows="12" style="width:100%"></textarea>', [{ t: 'Cancelar' }, {
            t: 'Aplicar', pri: true, fn: function (d) {
              var rows = HX.io.parsePinCSV(UI.$('#pinTxt', d.el).value);
              doc.change('Importar pinagem', function () {
                ops.keepWires(doc, [it.id], function () {
                  rows.forEach(function (r) { var p = it.pins.filter(function (q) { return q.n === r.n; })[0]; if (p) p.name = r.name; else it.pins.push({ n: r.n, name: r.name, sz: r.sz }); });
                });
              });
            } }]);
        };
      }
      if (it.type === 'wire') {
        UI.$('#pStripe').onchange = function () { var b = String(it.color).split('-')[0], v = UI.$('#pStripe').value; set(it, 'color', b + (v ? '-' + v : '')); };
        var wt = UI.$('#f_wtype', root);
        wt.onchange = function () { var t = HX.wireType(wt.value); doc.change('Tipo de fio', function () { it.wtype = wt.value; if (t && t.gauges.indexOf(it.gauge) < 0) it.gauge = t.gauges[Math.floor(t.gauges.length / 2)]; }); };
      }
  };
})(typeof window !== 'undefined' ? window : globalThis);
