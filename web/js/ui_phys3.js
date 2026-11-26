/* HarnessCAD - interface do desenho físico como lugar da formatação do chicote:
   barra de ferramentas muda com a folha (físico: Ramo / Derivação / Cota; esquemático: sem cota e derivação),
   painel da ferramenta ativa, diálogo Gerar/Atualizar (atualizar NÃO refaz o traçado; "refazer do zero" opcional;
   cotas antigas do esquemático podem ser passadas para o físico e removidas). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI;
  var PT = { wire: ['Ramo (W) — desenhar/derivar ramo', 'Ramo'], brk: ['Derivação no ramo (B)', 'Derivação no ramo'], dim: ['Cota (D)', 'Cota do chicote'] };
  var HIDE_PHYS = ['splice', 'label', 'cable'], HIDE_SCH = ['dim', 'brk'];
  function syncBar(app) {
    var ph = HX.isPhys(app.doc.cur());
    UI.$$('#toolbar button[data-tool]').forEach(function (b) {
      var t = b.dataset.tool; if (!b.dataset.t0) b.dataset.t0 = b.title;
      b.style.display = (ph ? HIDE_PHYS : HIDE_SCH).indexOf(t) >= 0 ? 'none' : '';
      b.title = ph && PT[t] ? PT[t][0] : b.dataset.t0;
    });
    var ls = UI.$('#lblStyle'); if (ls) ls.style.display = ph ? 'none' : '';
  }
  UI.physSyncBar = syncBar;
  var tp0 = UI.toolPanel;
  UI.toolPanel = function (app, root) {
    var t = app.tools && app.tools.tool;
    if (!HX.isPhys(app.doc.cur()) || !PT[t]) return tp0(app, root);
    var sh = app.doc.cur();
    root.innerHTML = '<h4>Ferramenta: ' + PT[t][1] + '</h4><p class="muted">' + HX.esc(app.tools.status && '' || '') + ({
      wire: 'Clique num nó (conector, BR, emenda) ou sobre um ramo — ali nasce a derivação — e depois no destino: outro nó, outro ramo ou um ponto livre (novo BR). O comprimento sai do desenho (escala 1:' + sh.scale + ') até você digitar um valor no ramo.',
      brk: 'Clique sobre um ramo: cria um ponto de derivação (BR) ali. Do BR saem novos ramos (W). Del no BR junta os ramos de novo.',
      dim: 'Clique em dois nós. Se um ramo liga os dois, é a cota do ramo; senão, a cota do caminho (soma dos ramos).'
    })[t] + '</p><p class="muted">Para mudar de onde um ramo sai: Esc, selecione o ramo e arraste a alça laranja da ponta até outro nó ou ramo.</p>' +
      '<div class="row"><button id="tpExit" style="flex:1">Sair da ferramenta (Esc)</button></div>';
    UI.$('#tpExit', root).onclick = function () { app.tools.setTool('select'); };
    return true;
  };
  // diálogo Gerar / Atualizar
  UI.physDialog = function (app) {
    var doc = app.doc, p = doc.p, old = p.sheets.filter(HX.isPhys)[0], legacy = [];
    p.sheets.forEach(function (sh) { if (!HX.isPhys(sh)) sh.items.forEach(function (i) { if (i.type === 'dim' || i.type === 'brk') legacy.push(i.id); }); });
    var scl = (old ? [] : [['auto', 'Automática (maior que cabe na folha)']]).concat(HX.PHYS_SCALES.map(function (n) { return [String(n), '1:' + String(n).replace('.', ',')]; })), STY = [['line', 'Desenho técnico (traço — padrão Altium)']];
    var F = [{ k: 'scale', l: 'Escala', type: 'select', opts: scl }, { k: 'style', l: 'Modelo do desenho', type: 'select', opts: STY }];
    if (!old) F = F.concat([{ k: 'faces', l: 'Vistas frontais dos conectores', type: 'check' }, { k: 'balloons', l: 'Balões + lista de materiais', type: 'check' }, { k: 'tables', l: 'Tabelas (ligação e materiais)', type: 'check' }]);
    else F.push({ k: 'rebuild', l: 'Refazer o traçado do zero (perde ramificação e posições ajustadas)', type: 'check' });
    if (legacy.length) F.push({ k: 'drop', l: 'Apagar do esquemático as ' + legacy.length + ' cota(s)/derivação(ões) antigas (o físico passa a ser a referência)', type: 'check' });
    var v = { scale: old ? String(old.scale) : 'auto', style: 'line', faces: true, balloons: true, tables: true, rebuild: false, drop: !old };
    UI.modal(old ? 'Atualizar desenho físico' : 'Gerar desenho físico',
      '<p class="muted">' + (old ? 'Traz do esquemático só o que é elétrico: conectores e emendas novos entram num ramo novo (ajuste depois), removidos saem, referências e fios atualizados. <b>O traçado, as derivações, as posições e as cotas do desenho físico são mantidos.</b>'
        : 'Cria a folha "Desenho físico" com os conectores ligados pelos circuitos' + (legacy.length ? ' e as cotas antigas do esquemático' : '') + '. A partir daí a <b>formatação e as cotas do chicote são feitas no desenho físico</b>: Ramo (W), Derivação (B), Cota (D) e arrastando nós e ramos.') + '</p>' + UI.form(F, v),
      [{ t: 'Cancelar' }, { t: old ? 'Atualizar' : 'Gerar', pri: true, fn: function (d) {
        var o = UI.readForm(F, d.el, {}), r;
        doc.change('Desenho físico', function () {
          r = HX.applyPhysical(doc, { scale: o.scale === 'auto' ? 'auto' : +o.scale, style: o.style, faces: old ? undefined : !!o.faces, balloons: old ? undefined : !!o.balloons, tables: old ? undefined : !!o.tables, keepPos: true, rebuild: !!o.rebuild });
          if (!r.error && o.drop && legacy.length) p.sheets.forEach(function (sh) { if (!HX.isPhys(sh)) sh.items = sh.items.filter(function (i) { return legacy.indexOf(i.id) < 0; }); });
        });
        if (r.error) return UI.toast(r.error, true);
        app.view.nl = null; if (doc.sheet === r.index) { doc.sel.clear(); doc.emit('change'); doc.emit('select'); } else app.setSheet(r.index); app.view.fit();
        if (r.warn.length) UI.modal('Desenho físico — avisos', '<ul>' + r.warn.map(function (w) { return '<li>' + HX.esc(w) + '</li>'; }).join('') + '</ul>', [{ t: 'OK', pri: true }]);
        else UI.toast(old ? 'Desenho físico atualizado.' : 'Desenho físico gerado em 1:' + String(r.sheet.scale).replace('.', ',') + (r.autoScale ? ' (escala automática)' : ''));
      } }]);
  };
  var A = HX.App.prototype, init0 = A.init;
  A.init = function () { init0.call(this); var app = this, go = function () { syncBar(app); }; app.doc.on('change', go); app.doc.on('load', go); go(); };
})(typeof window !== 'undefined' ? window : globalThis);
