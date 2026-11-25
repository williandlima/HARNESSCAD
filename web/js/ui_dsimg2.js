/* HarnessCAD - cadastro de peça do usuário (continuação de ui_dsimg.js): no diálogo "Recortar imagem de datasheet",
   PART NUMBER, FABRICANTE, CARACTERÍSTICAS e VÍNCULO com a família do conector (e carcaça). Com um conector selecionado
   no desenho físico, o vínculo já vem preenchido com a família e a carcaça dele. Regras em phys_userpart.js. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !UI.dsImgDialog) return;
  var s0 = HX.sanitizeDSImgs;
  HX.sanitizeDSImgs = function (lib) {
    var out = s0.apply(this, arguments);
    Object.keys(out).forEach(function (id) { var e = lib['USR:DSI:' + id]; Object.assign(out[id], HX.userPartExtra(e && e.img)); });
    return out;
  };
  var r0 = HX.dsUserRegister;
  HX.dsUserRegister = function (U) { r0.apply(this, arguments); Object.keys(U).forEach(function (id) { HX.userPartLink(id, HX.userPartExtra(U[id])); }); };
  /* campos extras lidos no "Salvar na biblioteca" */
  UI.dsExtra = function (el) {
    var v = function (s) { var i = el.querySelector(s); return i ? i.value : ''; };
    return HX.userPartExtra({ pn: v('#diPn'), mfr: v('#diMf'), desc: v('#diDs'), fam: v('#diFam'), shell: v('#diSh') });
  };
  var d0 = UI.dsImgDialog;
  UI.dsImgDialog = function (app) {
    var r = d0.apply(this, arguments), all = document.querySelectorAll('#diSrc'), src = all[all.length - 1]; if (!src) return r;
    var sel = app && app.doc.selected ? app.doc.selected() : [], n = sel.filter(function (i) { return i.type === 'pnode' && i.nkind === 'conn'; })[0];
    var c = n && HX.physSchem(app.doc.p)[n.of], df = c && HX.CAT.conns[c.part], fams = {};
    Object.keys(HX.CAT.conns).forEach(function (k) { var f = HX.CAT.conns[k].fam; if (!HX.libFamOk || HX.libFamOk(f)) fams[f] = 1; }); /* só famílias da biblioteca */
    var esc = HX.esc || function (t) { return String(t); }, row = function (l, h) { return '<div class="row"><label>' + l + '</label>' + h + '</div>'; };
    var h = row('Part number', '<input id="diPn" placeholder="ex.: 202K153-25-0">') + row('Fabricante', '<input id="diMf" placeholder="ex.: TE Connectivity / Raychem">') +
      row('Características', '<input id="diDs" placeholder="material, temperatura, Ø fornecido/recuperado…">') +
      row('Vincular à família', '<select id="diFam"><option value="">— nenhuma —</option>' + Object.keys(fams).sort().map(function (f) { return '<option' + (df && df.fam === f ? ' selected' : '') + '>' + esc(f) + '</option>'; }).join('') + '</select>') +
      row('Carcaça (vazio = todas)', '<input id="diSh" type="number" min="1" max="99" value="' + (c && HX.shellOf ? HX.shellOf(c) : '') + '">');
    var d = document.createElement('div'); d.innerHTML = h; var rw = src.closest('.row') || src.parentNode;
    while (d.firstChild) rw.parentNode.insertBefore(d.lastChild, rw.nextSibling);
    return r;
  };
})(typeof window !== 'undefined' ? window : globalThis);
