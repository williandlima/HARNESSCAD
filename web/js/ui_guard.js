/* HarnessCAD - folha de DESENHO FÍSICO não aceita símbolos do esquemático (conector do catálogo, equipamento, fio,
   emenda, label, cabo/blindagem): ferramenta, atalho, duplo clique no catálogo e colar são barrados com um aviso.
   Conectores, fios e emendas entram no físico pelo esquema (Gerar / Sincronizar desenho físico). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, D = HX.Doc.prototype, T = HX.Tools.prototype;
  HX.SCH_ONLY_TYPES = { conn: 1, wire: 1, splice: 1, label: 1, cable: 1, junction: 1 };
  HX.SCH_ONLY_TOOLS = { place: 1, splice: 1, label: 1, cable: 1 };
  HX.schBlocked = function (doc, type) { return !!HX.SCH_ONLY_TYPES[type] && HX.isPhys(doc.cur()); };
  var warned = 0;
  function warn() { var t = Date.now(); if (t - warned < 1500) return; warned = t; if (UI && UI.toast) UI.toast('Símbolos do esquemático não entram no desenho físico — insira no esquema e use Gerar/Sincronizar desenho físico', true); }
  var add0 = D.add;
  D.add = function (item) {
    if (HX.guardPhys && item && HX.schBlocked(this, item.type)) { warn(); if (!item.id) item.id = this.uid(item.type[0]); return item; }
    return add0.call(this, item);
  };
  var st0 = T.setTool;
  T.setTool = function (t, data) {
    if (HX.guardPhys && HX.SCH_ONLY_TOOLS[t] && this.doc && HX.isPhys(this.doc.cur())) { warn(); return st0.call(this, 'select'); }
    return st0.call(this, t, data);
  };
  var i0 = HX.App.prototype.init;
  HX.App.prototype.init = function () { i0.call(this); HX.guardPhys = true; };
})(typeof window !== 'undefined' ? window : globalThis);
