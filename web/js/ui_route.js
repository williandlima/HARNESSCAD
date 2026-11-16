/* HarnessCAD - comandos da RAMIFICAÇÃO (aba Desenho físico › Ramificação, menu Ferramentas e painel da folha):
   traçado livre / ângulos retos / curvas suaves, levar o ramo junto ao arrastar um nó, endireitar todos os ramos. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, EXT = HX.ITEM_EXT;
  function sheet(app) { var c = app.doc.cur(); if (HX.isPhys(c)) return c; UI.toast('Abra a folha do desenho físico', true); return null; }
  HX.uiRoute = function (app, mode) {
    var sh = sheet(app); if (!sh) return; var n = 0;
    app.doc.change('Traçado dos ramos', function () { sh.route = mode; sh.items.forEach(function (s) {
      if (s.type === 'pseg' && s.route) { delete s.route; n++; }
      if (mode === 'ortho' && s.type === 'pnode' && s.nkind === 'conn' && s.rot !== '' && s.rot != null && !isNaN(+s.rot)) s.rot = ((Math.round(+s.rot / 90) * 90) % 360 + 360) % 360; // conectores em 0/90/180/270°
    }); });
    UI.toast('Ramos: ' + HX.ROUTE_MODES.filter(function (r) { return r[0] === mode; })[0][1] + (n ? ' (' + n + ' ramo(s) com traçado próprio voltaram ao da folha)' : ''));
  };
  var CMDS = [['Traçado livre dos ramos', function (a) { HX.uiRoute(a, 'free'); }], ['Ramos em ângulo reto', function (a) { HX.uiRoute(a, 'ortho'); }], ['Ramos em curva suave', function (a) { HX.uiRoute(a, 'smooth'); }],
    ['Levar ramo junto ao arrastar', function (a) { var sh = sheet(a); if (!sh) return; a.doc.change('Levar ramo junto', function () { sh.dragTree = !sh.dragTree; }); UI.toast(sh.dragTree ? 'Arrastar um nó leva o ramo inteiro (Ctrl inverte)' : 'Arrastar um nó move só o nó (Ctrl+arrastar leva o ramo)'); }],
    ['Endireitar todos os ramos', function (a) { var sh = sheet(a); if (!sh) return; var n = 0; a.doc.change('Endireitar ramos', function () { sh.items.forEach(function (s) { if (s.type === 'pseg' && ((s.bends && s.bends.length) || +s.x || +s.y)) { s.bends = []; s.x = 0; s.y = 0; n++; } }); }); UI.toast(n + ' ramo(s) endireitado(s)'); }]];
  HX.MENU_EXTRA = HX.MENU_EXTRA || [];
  CMDS.forEach(function (c) { HX.MENU_EXTRA.push(['Ferramentas', function (app) { return [c[0], function () { c[1](app); }, '']; }]); });
  if (HX.RIBBON) HX.RIBBON.forEach(function (T) { if (T[0] === 'Desenho físico') T[1].splice(1, 0, ['Ramificação', ['*m:Ferramentas/Traçado livre', '*m:Ferramentas/Ramos em ângulo reto', '*m:Ferramentas/Ramos em curva', 'm:Ferramentas/Levar ramo', 'm:Ferramentas/Endireitar todos']]); });
  var sf = EXT.pseg.fields;
  EXT.pseg.fields = function (it, doc) { return sf(it, doc).concat([{ k: 'route', l: 'Traçado', type: 'select', opts: [['', 'Padrão da folha']].concat(HX.ROUTE_MODES) }]); };
  var se0 = UI.sheetExtra;
  UI.sheetExtra = function (app, root, sh) {
    if (se0) se0(app, root, sh); if (!HX.isPhys(sh)) return;
    var d = document.createElement('div');
    d.innerHTML = '<h4>Ramificação</h4><div class="row"><label>Traçado dos ramos</label><select id="rtMode">' + HX.ROUTE_MODES.map(function (r) { return '<option value="' + r[0] + '"' + ((sh.route || 'free') === r[0] ? ' selected' : '') + '>' + r[1] + '</option>'; }).join('') + '</select></div>' +
      '<div class="row"><label>Arrastar nó</label><select id="rtTree"><option value="">Move só o nó (Ctrl leva o ramo)</option><option value="1"' + (sh.dragTree ? ' selected' : '') + '>Leva o ramo inteiro</option></select></div>';
    root.appendChild(d);
    d.querySelector('#rtMode').onchange = function () { HX.uiRoute(app, this.value); };
    d.querySelector('#rtTree').onchange = function () { var v = !!this.value; app.doc.change('Levar ramo junto', function () { sh.dragTree = v; }); };
  };
})(typeof window !== 'undefined' ? window : globalThis);
