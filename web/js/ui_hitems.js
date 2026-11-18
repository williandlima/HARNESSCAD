/* HarnessCAD - BIBLIOTECA DE ITENS DA CABLAGEM (janela): itens comuns por categoria + itens do usuário; "Novo item" cadastra
   o que não está na biblioteca (categoria, nome, PN, fabricante, características, unidade, quantidade por unidade ou por
   contato ligado, comprimento por peça, forma da cobertura, vínculo à família/carcaça) e salva na biblioteca
   compartilhada do servidor ('USR:ITEM:<id>'). No painel da folha física: Biblioteca de itens / Customização. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.HITEMS) return;
  function esc(t) { return HX.esc ? HX.esc(t) : String(t); }
  function opts(L, v) { return L.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(v || '') ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join(''); }
  var UN = [['pç', 'peça (pç)'], ['mm', 'milímetro (mm)'], ['m', 'metro (m)'], ['g', 'grama (g)'], ['ml', 'mililitro (ml)']];
  var COV = [['cov_shrink', 'Termo-retrátil / fita'], ['cov_braid', 'Malha / trança'], ['cov_conduit', 'Conduíte / tubo'], ['cov_spiral', 'Espiral']];
  /* formulário "Novo item na biblioteca" (pre = valores iniciais; done(k) depois de salvar) */
  UI.hitemForm = function (app, pre, done) {
    pre = pre || {}; var fams = {}; Object.keys(HX.CAT.conns).forEach(function (k) { fams[HX.CAT.conns[k].fam] = 1; });
    var cats = Object.keys(HX.HITEM_CATS).map(function (c) { return [c, HX.HITEM_CATS[c]]; });
    var row = function (l, h) { return '<div class="row"><label>' + l + '</label>' + h + '</div>'; };
    var h = '<p class="muted">Item que não está na biblioteca: fica salvo na biblioteca compartilhada e aparece para todos os projetos.</p>' +
      row('Categoria', '<select id="hiC">' + opts(cats, pre.cat || 'conn') + '</select>') + row('Nome / descrição', '<input id="hiN" value="' + esc(pre.n || '') + '" placeholder="ex.: Tampa protetora com corrente">') +
      row('Part number', '<input id="hiP" placeholder="PN do fabricante">') + row('Fabricante', '<input id="hiM">') +
      row('Características', '<input id="hiD" placeholder="material, temperatura, Ø, cor…">') + row('Unidade', '<select id="hiU">' + opts(UN, 'pç') + '</select>') +
      row('Quantidade', '<select id="hiQ">' + opts([['un', 'por conector / ponto'], ['pin', 'por contato ligado']], 'un') + '</select>') +
      row('Comprimento por peça (mm ou m)', '<input id="hiL" type="number" step="0.5" placeholder="só para unidade mm / m">') +
      row('Forma (cobertura)', '<select id="hiF">' + opts(COV, 'cov_shrink') + '</select>') +
      row('Vincular à família', '<select id="hiFa"><option value="">— nenhuma —</option>' + opts(Object.keys(fams).sort().map(function (f) { return [f, f]; }), pre.fam) + '</select>') +
      row('Carcaça (vazio = todas)', '<input id="hiS" type="number" min="1" max="99" value="' + esc(pre.shell || '') + '">') +
      '<p class="muted">Figura do datasheet (bota, backshell…): use "Recortar imagem de datasheet…" — ela é desenhada na montagem do conector.</p>';
    UI.modal('Novo item na biblioteca', h, [{ t: 'Cancelar' }, { t: 'Salvar na biblioteca', pri: true, fn: function (api) {
      var v = function (s) { return api.el.querySelector(s).value; };
      var it = HX.hitemSanitize({ cat: v('#hiC'), n: v('#hiN'), pn: v('#hiP'), mfr: v('#hiM'), desc: v('#hiD'), un: v('#hiU'), per: v('#hiQ'), len: v('#hiL'), cov: v('#hiF'), fam: v('#hiFa'), shell: v('#hiS') });
      if (!v('#hiN').trim()) return UI.toast('Informe o nome do item.', true), false;
      var id = it.n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) + '-' + Date.now().toString(36).slice(-4), key = HX.hitemUserKey(id);
      HX.hitemAdd('u:' + id, it); HX.io.saveLibEntry({ key: key, item: it }).catch(function (e) { UI.toast('Biblioteca compartilhada: ' + e.message, true); });
      UI.toast('"' + it.n + '" salvo na biblioteca (' + HX.HITEM_CATS[it.cat] + ').'); if (done) done('u:' + id); if (app) { app.view.redraw(); app.doc.emit('select'); }
    } }]);
  };
  /* janela da biblioteca: filtro por categoria, itens comuns e do usuário */
  UI.hitemsDialog = function (app) {
    var cats = [['', 'Todas as categorias']].concat(Object.keys(HX.HITEM_CATS).map(function (c) { return [c, HX.HITEM_CATS[c]]; }));
    var h = '<div class="row"><select id="hlC">' + opts(cats, '') + '</select><input id="hlF" placeholder="Filtrar…" style="flex:1"><button id="hlN">Novo item…</button></div>' +
      '<div id="hlT" style="max-height:420px;overflow:auto;min-width:640px"></div>';
    var dlg = UI.modal('Biblioteca de itens da cablagem', h, [{ t: 'Fechar' }]), el = dlg.el;
    function list() {
      var c = el.querySelector('#hlC').value, f = el.querySelector('#hlF').value.toLowerCase(), K = HX.hitemsOf(c ? [c] : Object.keys(HX.HITEM_CATS));
      K = K.filter(function (k) { var it = HX.HITEMS[k]; return !f || (it.n + ' ' + it.pn + ' ' + (it.mfr || '')).toLowerCase().indexOf(f) >= 0; });
      el.querySelector('#hlT').innerHTML = '<table class="tbl" style="width:100%"><tr><th>Categoria</th><th>Item</th><th>PN</th><th>Un</th><th>Por</th><th>Origem</th></tr>' + K.map(function (k) {
        var it = HX.HITEMS[k]; return '<tr><td>' + esc(HX.HITEM_CATS[it.cat]) + '</td><td>' + esc(HX.hitemLabel(it)) + '</td><td>' + esc(it.pn || '—') + '</td><td>' + esc(it.un) + '</td><td>' + (it.per === 'pin' ? 'contato' : 'unid.') +
          '</td><td>' + (it.user ? 'usuário' + (it.fam ? ' · ' + esc(it.fam) + (it.shell ? ' ' + it.shell : '') : '') : 'biblioteca') + '</td></tr>'; }).join('') + '</table>';
    }
    el.querySelector('#hlC').onchange = list; el.querySelector('#hlF').oninput = list;
    el.querySelector('#hlN').onclick = function () { UI.hitemForm(app, { cat: el.querySelector('#hlC').value || 'conn' }, list); };
    list();
  };
  var se0 = UI.sheetExtra;
  UI.sheetExtra = function (app, root, sh) {
    if (se0) se0(app, root, sh); if (!HX.isPhys(sh)) return;
    var d = document.createElement('div'); d.className = 'row'; d.innerHTML = '<button style="flex:1">Customização da cablagem…</button><button style="flex:1">Biblioteca de itens…</button>';
    var b = d.querySelectorAll('button'); b[0].onclick = function () { if (UI.harnessCustom) UI.harnessCustom(app); }; b[1].onclick = function () { UI.hitemsDialog(app); };
    root.insertBefore(d, root.querySelector('h4') ? root.querySelector('h4').nextSibling : null);
  };
})(typeof window !== 'undefined' ? window : globalThis);
