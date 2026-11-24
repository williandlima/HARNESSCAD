/* HarnessCAD - painel da EMENDA (propriedades): série do datasheet TE conforme o tipo, PN escolhido automaticamente pelas
   bitolas dos fios (com o motivo: tabela/página do datasheet), dados da peça (ambiente, temperatura, norma, material,
   ferramenta, procedimento, cor, medidas) e a fonte. PN digitado no campo "Part number" tem prioridade. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.splicePN || !UI.propsExtra) return;
  function esc(t) { return HX.esc(String(t == null ? '' : t)); }
  function dims(S, q) { var x = q && q[6]; if (!x) return '';
    if (S.sel === 'awg' && x.length > 6) return 'ØA ' + x[4] + ' · ØB ' + x[5] + ' · comprimento ' + x[6] + ' · D ' + x[7] + ' mm (máx.) · PN TE ' + x[3];
    if (S.sel === 'awg') return 'ØA mín. ' + x[2] + ' · comprimento ' + x[3] + ' mm (nom.) · isolação do fio Ø ' + q[4] + '–' + q[5] + ' mm';
    if (x[0] === 'topo' || x[0] === 'ponta') return (x[0] === 'topo' ? 'Topo (em linha)' : 'Ponta (paralela)') + ' · lado 1: até ' + x[1] + ' fios, vedação Ø ' + x[3] + ' · lado 2: até ' + x[2] + ' fios, Ø ' + x[4] + ' mm';
    return 'Comprimento ' + x[0] + ' · ØA ' + x[1] + ' mm (mín.)'; }
  var pe0 = UI.propsExtra; UI.propsExtra = function (it, app) { var h = pe0.apply(this, arguments); if (it.type !== 'splice' || it.kind === 'junction') return h;
    var doc = app.doc, sers = Object.keys(HX.SPLICE_LIB).filter(function (k) { return HX.SPLICE_LIB[k].kind === it.kind; }); if (!sers.length) return h;
    var def = HX.SPLICE_DEF[it.kind], r = HX.splicePN(doc.p, doc.sheet, it, app.view.netlist ? app.view.netlist() : null) || {}, S = HX.SPLICE_LIB[r.ser] || {};
    h += '<div class="row"><label>Série (datasheet)</label><select id="pSpSer"><option value="">Padrão da casa: ' + esc(def) + '</option>' + sers.map(function (k) { return '<option value="' + k + '"' + (it.series === k ? ' selected' : '') + '>' + esc(k + ' — ' + HX.SPLICE_LIB[k].d.split(' — ')[1]) + '</option>'; }).join('') + '</select></div>';
    h += '<div class="muted" style="font-size:12px">';
    if (r.manual) h += 'PN manual: <b>' + esc(r.pn) + '</b> (apague o campo Part number para escolher pelo datasheet)';
    else if (r.pn) h += 'PN pelo datasheet: <b>' + esc(r.pn) + '</b>' + (r.te && r.te !== r.pn ? ' = TE ' + esc(r.te) : '') + (r.q && r.q[1] ? ' · cor ' + esc(r.q[1]) : '') + '<br>Motivo: ' + esc(r.why) + (r.warn ? '<br><span style="color:#d80">⚠ ' + esc(r.warn) + '</span>' : '');
    else if (r.err) h += '<span style="color:#d33">⚠ Nenhuma peça da ' + esc(r.ser) + ' serve: ' + esc(r.err) + '</span>';
    if (S.d) h += '<br>' + esc(S.d) + '<br>Ambiente: ' + esc(S.env) + ' · ' + esc(S.temp) + (S.wmin ? ' · ' + esc(S.wmin) : '') + '<br>Norma: ' + esc(S.spec) + '<br>Material: ' + esc(S.mat) +
      '<br>Ferramenta: ' + esc(S.tool) + (S.proc ? ' · procedimento ' + esc(S.proc) : '') + (r.q && dims(S, r.q) ? '<br>Medidas: ' + esc(dims(S, r.q)) : '') + (S.note ? '<br>Obs.: ' + esc(S.note) : '') +
      '<br><i>Fonte: ' + esc(HX.SPLICE_SRC) + ', p. ' + esc(S.pg) + '</i>';
    return h + '</div>'; };
  var pb0 = UI.propsBind; UI.propsBind = function (it, app, root) { var r = pb0.apply(this, arguments), sel = it.type === 'splice' && root && root.querySelector('#pSpSer');
    if (sel) sel.onchange = function () { app.doc.change('Série da emenda', function () { if (sel.value) it.series = sel.value; else delete it.series; }); };
    return r; };
})(typeof window !== 'undefined' ? window : globalThis);
