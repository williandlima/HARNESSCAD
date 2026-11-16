/* HarnessCAD - ERC severo (interface): aceitar/reativar aviso por linha, ver aceitos, regras (severidade por regra e
   fator do raio de curvatura). Configuração e aceites ficam no projeto (p.erc). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI;
  UI.ercShowWaived = false;
  UI.ercList = function (list) {
    if (!UI.ercShowWaived) return list;
    return list.concat((list.waived || []).map(function (e) { return Object.assign({}, e, { sev: 'aceito', msg: e.msg + (e.waived && e.waived.nota ? ' — ' + e.waived.nota : '') }); }));
  };
  UI.ercAct = function (r) { return r.key ? '<button class="mini" data-ercw="' + HX.esc(r.key) + '">' + (r.sev === 'aceito' ? 'Reativar' : 'Aceitar') + '</button>' : ''; };
  UI.ercBar = function (app) {
    var n = (app.ercWaivedCount || 0);
    return '<div class="row" style="padding:4px 6px;gap:6px"><button class="mini" data-ercrules="1">Regras do ERC…</button>' +
      '<label style="display:flex;gap:4px;align-items:center"><input type="checkbox" data-ercshow="1"' + (UI.ercShowWaived ? ' checked' : '') + '> Mostrar aceitos (' + n + ')</label></div>';
  };
  UI.ercRules = function (app) {
    var p = app.doc.p, cfg = HX.ercCfg(p), S = [['', 'padrão'], ['erro', 'erro'], ['aviso', 'aviso'], ['info', 'info'], ['off', 'desligada']];
    var h = '<table class="t"><thead><tr><th>Regra</th><th>Padrão</th><th>Severidade</th></tr></thead><tbody>' + HX.ERC_RULES.map(function (r) {
      return '<tr><td>' + HX.esc(r[1]) + '</td><td>' + r[2] + '</td><td><select data-rule="' + r[0] + '">' + S.map(function (o) { return '<option value="' + o[0] + '"' + ((cfg.rules[r[0]] || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></td></tr>';
    }).join('') + '</tbody></table><div class="row"><label>Raio de curvatura mínimo (× Ø do feixe)</label><input id="ercK" type="number" step="1" value="' + (cfg.bendK || 6) + '"></div>' +
      '<p class="muted">Típico: 4 a 10 × o diâmetro externo (cabos blindados e coaxiais pedem mais). Avisos aceitos: ' + Object.keys(cfg.waived).length + '.</p>';
    UI.modal('Regras do ERC', h, [{ t: 'Limpar aceites', fn: function () { app.doc.change('ERC: limpar aceites', function () { cfg.waived = {}; }); app.erc(); } }, { t: 'Cancelar' }, { t: 'Salvar', pri: true, fn: function (d) {
      app.doc.change('Regras do ERC', function () { [].slice.call(d.el.querySelectorAll('[data-rule]')).forEach(function (s) { if (s.value) cfg.rules[s.dataset.rule] = s.value; else delete cfg.rules[s.dataset.rule]; }); cfg.bendK = +UI.$('#ercK', d.el).value || 6; });
      app.erc();
    } }]);
  };
  if (typeof document !== 'undefined') {
    document.addEventListener('click', function (e) {
      var app = G.app; if (!app) return;
      var b = e.target.closest && e.target.closest('[data-ercw]');
      if (b) {
        e.stopPropagation(); var key = b.dataset.ercw, cfg = HX.ercCfg(app.doc.p);
        if (cfg.waived[key]) app.doc.change('ERC: reativar', function () { HX.ercUnwaive(app.doc.p, key); });
        else { var nota = G.prompt ? G.prompt('Aceitar este aviso. Justificativa (opcional):', '') : ''; if (nota === null) return; app.doc.change('ERC: aceitar', function () { cfg.waived[key] = { em: new Date().toISOString().slice(0, 10), nota: nota || '' }; }); }
        app.erc(); return;
      }
      if (e.target.closest && e.target.closest('[data-ercrules]')) UI.ercRules(app);
    }, true);
    document.addEventListener('change', function (e) { if (e.target.dataset && e.target.dataset.ercshow && G.app) { UI.ercShowWaived = e.target.checked; G.app.erc(); } });
  }
})(typeof window !== 'undefined' ? window : globalThis);
