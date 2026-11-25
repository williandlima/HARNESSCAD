/* HarnessCAD - COMPRIMENTO E % A MAIS na interface (lógica em wirelen.js): grupo "Comprimento" nas Propriedades do fio e
   do cabo (comprimento efetivo editável — muda o ramo no físico quando dá —, % a mais e corte) e o topo da Lista de fios
   com a % padrão do projeto. Colunas "Compr. (mm)", "% a mais" e "Corte (mm)" na própria lista (ui_tables.js). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.wireLenSet) return;
  function esc(v) { return HX.esc(String(v == null ? '' : v)); }
  var SRC = { semfisico: 'gravado no fio (ainda não há desenho físico)', fisico: 'ramo do desenho físico ajustado', manual: 'valor manual no fio (≠ físico)', auto: 'volta ao valor do físico' };
  UI.wlBar = function (app) { var d = app.doc.p.defaults; return '<div class="row" style="padding:4px 8px;gap:8px;align-items:center;font-size:12px"><b>% de cabo a mais (padrão do projeto):</b>' +
    '<input id="wlPctG" type="number" step="0.5" style="width:64px;flex:none" value="' + esc(+d.scrapPct || 0) + '"> %<span class="muted">— vale para os fios com "% a mais" vazio; trançados/cabos: digite a % na linha. ' +
    'Compr. com * = vem do desenho físico; digitar ajusta o ramo do físico. Corte = compr. × (1 + %).</span></div>'; };
  document.addEventListener('change', function (e) { if (e.target && e.target.id === 'wlPctG' && G.app) { var v = parseFloat(e.target.value) || 0, doc = G.app.doc; doc.change('% a mais padrão', function () { doc.p.defaults.scrapPct = v; }); } }, true);
  function info(app, it) { var p = app.doc.p; if (it.type === 'wire') return HX.wireLenInfo(p, it);
    var L = HX.cableLen(p, it), v = it.extraPct, pct = v === '' || v == null ? +p.defaults.scrapPct || 0 : +v; return { eff: L, pct: pct, cut: L != null ? Math.round(L * (1 + pct / 100)) : null, manual: false }; }
  var pe0 = UI.propsExtra, pb0 = UI.propsBind;
  UI.propsExtra = function (it, app) { var h = pe0 ? pe0.apply(this, arguments) : ''; if ((it.type !== 'wire' && it.type !== 'cable') || HX.isPhys(app.doc.cur())) return h;
    var I = info(app, it), d = app.doc.p.defaults;
    return h + '<div class="hxLen" style="border-top:1px solid var(--line,#ddd);margin-top:6px;padding-top:4px"><h4 style="margin:4px 0">Comprimento</h4>' +
      '<div class="row"><label>Comprimento (mm)</label><input id="lnL" type="number" step="1" style="width:90px" value="' + esc(I.eff == null ? '' : I.eff) + '" placeholder="sem físico"><span class="muted" style="font-size:11px">&nbsp;' + (I.eff == null ? '' : I.manual ? 'manual' : 'do físico') + '</span></div>' +
      '<div class="row"><label>% a mais (perda)</label><input id="lnP" type="number" step="0.5" style="width:70px" value="' + esc(it.extraPct == null ? '' : it.extraPct) + '" placeholder="' + esc(+d.scrapPct || 0) + ' (padrão)"> %</div>' +
      '<div class="row"><label>Corte (mm)</label><b id="lnC">' + esc(I.cut == null ? '—' : I.cut) + '</b></div>' +
      (it.type === 'cable' ? '<div class="muted" style="font-size:11px">Vale para todas as vias do cabo (trançado: use a % da perda).</div>' : '') + '</div>'; };
  UI.propsBind = function (it, app, root) { var r = pb0 ? pb0.apply(this, arguments) : undefined, L = root && root.querySelector('#lnL'), P = root && root.querySelector('#lnP'); if (!L) return r;
    var doc = app.doc;
    L.onchange = function () { var v = parseFloat(L.value), how; doc.change('Comprimento ' + (it.ref || it.num || ''), function () { how = it.type === 'wire' ? HX.wireLenSet(doc, it, v) : HX.cableLenSet(doc, it, v)[0]; });
      app.view.redraw(); UI.toast('Comprimento: ' + (SRC[how] || 'aplicado') + '.'); };
    P.onchange = function () { var v = P.value.trim(); doc.change('% a mais ' + (it.ref || it.num || ''), function () { it.extraPct = v === '' ? '' : parseFloat(v) || 0; }); };
    return r; };
})(typeof window !== 'undefined' ? window : globalThis);
