/* HarnessCAD - BIBLIOTECA DE ITENS DA CABLAGEM (janela com ALÇAS): uma aba por alça (Adaptadores, Botas, Cordoalhas, Luvas
   de solda, Transições, Capas, Kits de retenção, Espaguetes, Amarração, Etiquetas) com os itens em vários tamanhos/tipos;
   "Aplicar" põe o item no que está selecionado no desenho físico; "Só o que serve" filtra pelo conector selecionado;
   "Novo item nesta alça…" cadastra o que falta e salva na biblioteca compartilhada ('USR:ITEM:<id>'). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.HITEMS) return;
  function esc(t) { return HX.esc ? HX.esc(t) : String(t); }
  function opts(L, v) { return L.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(v || '') ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join(''); }
  var UN = [['pç', 'peça (pç)'], ['mm', 'milímetro (mm)'], ['m', 'metro (m)'], ['g', 'grama (g)'], ['ml', 'mililitro (ml)']];
  var COV = [['cov_shrink', 'Termo-retrátil / fita'], ['cov_braid', 'Malha / trança'], ['cov_conduit', 'Conduíte / tubo'], ['cov_spiral', 'Espiral']];
  function selConn(app) { var t = app && app.doc.selected()[0], c = t && t.type === 'pnode' && t.nkind === 'conn' && HX.physSchem(app.doc.p)[t.of]; return c || null; }
  /* formulário "Novo item" (pre.grp = alça) */
  UI.hitemForm = function (app, pre, done) {
    pre = pre || {}; var grp = HX.HITEM_CATS[pre.grp] ? pre.grp : 'cap', fams = {}; Object.keys(HX.CAT.conns).forEach(function (k) { fams[HX.CAT.conns[k].fam] = 1; });
    var c = selConn(app), df = c && HX.CAT.conns[c.part], row = function (l, h) { return '<div class="row"><label>' + l + '</label>' + h + '</div>'; };
    var kind = { adapt: 'bs', boot: 'boot' }[grp], pds = kind ? [['', 'Aguardando datasheet (contorno)']].concat(Object.keys(HX.PDS).filter(function (k) { return HX.PDS[k].kind === kind; }).map(function (k) { return [k, HX.PDS[k].n]; })) : null;
    var h = '<p class="muted">Item que não está na biblioteca — fica salvo na biblioteca compartilhada, na alça <b>' + esc(HX.HITEM_CATS[grp]) + '</b>.</p>' +
      row('Nome / tipo e tamanho', '<input id="hiN" placeholder="ex.: Bota reta 202K153 Viton">') + row('Part number', '<input id="hiP">') + row('Fabricante', '<input id="hiM">') +
      row('Características', '<input id="hiD" placeholder="Ø, material, temperatura, cor…">') + row('Aplicação', '<select id="hiA">' + opts(HX.HUSE[grp].map(function (u) { return [u, HX.HUSE_N[u]]; }), HX.HUSE[grp][0]) + '</select>') +
      (pds ? row('Desenho', '<select id="hiG">' + opts(pds, '') + '</select>') : '') + row('Unidade', '<select id="hiU">' + opts(UN, /braid|shr/.test(grp) ? 'm' : 'pç') + '</select>') +
      row('Quantidade', '<select id="hiQ">' + opts([['un', 'por conector / ponto'], ['pin', 'por contato ligado']], 'un') + '</select>') + row('Comprimento por peça (mm/m)', '<input id="hiL" type="number" step="0.5">') +
      row('Forma (cobertura)', '<select id="hiF">' + opts(COV, grp === 'braid' ? 'cov_braid' : 'cov_shrink') + '</select>') +
      row('Vincular à família', '<select id="hiFa"><option value="">— serve em todos —</option>' + opts(Object.keys(fams).sort().map(function (f) { return [f, f]; }), df && df.fam) + '</select>') +
      row('Carcaça (vazio = todas)', '<input id="hiS" type="number" min="1" max="99" value="' + esc(c && HX.shellOf ? HX.shellOf(c) : '') + '">') +
      (pds ? '<p class="muted">Figura do datasheet: "Recortar imagem de datasheet…" no painel da folha; depois escolha-a em Desenho.</p>' : '');
    UI.modal('Novo item — ' + HX.HITEM_CATS[grp], h, [{ t: 'Cancelar' }, { t: 'Salvar na biblioteca', pri: true, fn: function (api) {
      var v = function (s) { var e = api.el.querySelector(s); return e ? e.value : ''; };
      if (!v('#hiN').trim()) return UI.toast('Informe o nome do item.', true), false;
      var it = HX.hitemSanitize({ grp: grp, use: v('#hiA'), pds: v('#hiG') || (kind === 'bs' ? 'ms_ad' : ''), n: v('#hiN'), pn: v('#hiP'), mfr: v('#hiM'), desc: v('#hiD'), un: v('#hiU'), per: v('#hiQ'), len: v('#hiL'), cov: v('#hiF'), fam: v('#hiFa'), shell: v('#hiS') });
      if ((it.use === 'boot' || it.use === 'bs') && !it.pds) it.use = 'acc';
      var id = it.n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) + '-' + Date.now().toString(36).slice(-4);
      HX.hitemAdd('u:' + id, it); HX.io.saveLibEntry({ key: HX.hitemUserKey(id), item: it }).catch(function (e) { UI.toast('Biblioteca compartilhada: ' + e.message, true); });
      UI.toast('"' + it.n + '" salvo em ' + HX.HITEM_CATS[grp] + '.'); if (done) done('u:' + id);
    } }]);
  };
  /* janela da biblioteca com as alças */
  UI.hitemsDialog = function (app, grp0) {
    var cur = grp0 || 'adapt', h = '<div id="hlTabs" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">' + HX.HGRP.map(function (g) { return '<button data-g="' + g[0] + '">' + esc(g[1]) + '</button>'; }).join('') + '</div>' +
      '<div class="row"><input id="hlF" placeholder="Filtrar (nome, PN, tamanho)…" style="flex:1"><label style="flex:none"><input type="checkbox" id="hlS"> só o que serve no conector selecionado</label><button id="hlN">Novo item nesta alça…</button></div>' +
      '<div id="hlT" style="height:400px;overflow:auto;min-width:760px"></div>';
    var dlg = UI.modal('Biblioteca de itens da cablagem', h, [{ t: 'Fechar' }]), el = dlg.el;
    function list() {
      [].forEach.call(el.querySelectorAll('[data-g]'), function (b) { b.className = b.dataset.g === cur ? 'pri' : ''; b.style.fontWeight = b.dataset.g === cur ? 'bold' : ''; });
      var f = el.querySelector('#hlF').value.toLowerCase(), c = el.querySelector('#hlS').checked ? selConn(app) : null;
      var K = HX.hitemsOf([cur]).filter(function (k) { var it = HX.HITEMS[k]; return (!f || (it.n + ' ' + it.pn + ' ' + (it.mfr || '') + ' ' + (it.desc || '')).toLowerCase().indexOf(f) >= 0) && (!c || HX.hitemFits(it, c)); });
      el.querySelector('#hlT').innerHTML = '<table class="tbl" style="width:100%"><tr><th>Item</th><th>PN</th><th>Características</th><th>Aplicação</th><th>Serve em</th><th></th></tr>' + K.map(function (k) {
        var it = HX.HITEMS[k]; return '<tr><td>' + esc(it.n) + (it.user ? ' <i>(usuário)</i>' : '') + '</td><td>' + esc(it.pn || '—') + '</td><td>' + esc([it.mfr, it.desc].filter(Boolean).join(' · ')) + '</td><td>' + esc(HX.HUSE_N[it.use]) +
          '</td><td>' + esc(it.fam ? it.fam.replace(/,/g, ', ') + (it.shell ? ' carc. ' + it.shell : '') : 'todos') + '</td><td><button data-k="' + esc(k) + '">Aplicar</button></td></tr>'; }).join('') + '</table>' + (K.length ? '' : '<p class="muted">Nenhum item.</p>');
      [].forEach.call(el.querySelectorAll('[data-k]'), function (b) { b.onclick = function () { var t = app.doc.selected()[0], msg;
        app.doc.change('Aplicar item da biblioteca', function () { msg = HX.hitemApply(app.doc, b.dataset.k, t); }); UI.toast(msg || 'Aplicado: ' + HX.HITEMS[b.dataset.k].n, !!msg); app.view.redraw(); }; });
    }
    [].forEach.call(el.querySelectorAll('[data-g]'), function (b) { b.onclick = function () { cur = b.dataset.g; list(); }; });
    el.querySelector('#hlF').oninput = list; el.querySelector('#hlS').onchange = list;
    el.querySelector('#hlN').onclick = function () { UI.hitemForm(app, { grp: cur }, list); };
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
