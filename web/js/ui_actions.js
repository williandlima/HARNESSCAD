/* HarnessCAD - AÇÕES DO ITEM (lista única): as mesmas ações aparecem no clique direito (ui_active.js), no topo do painel de
   Propriedades (botões) e na barra ativa (ícones à direita, para o item selecionado). Esquema: conector, fio, vários fios
   (Transformar em cabo), emenda, cabo e área vazia. Desenho físico: reaproveita o menu do físico (ui_phys6.js). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI) return;
  function btn(sel) { return function () { var e = document.querySelector('[data-cmd="' + sel + '"]'); if (e) e.click(); }; }
  HX.itemActions = function (app, it) {
    var doc = app.doc, E = [], sel = doc.selected();
    function ch(l, f) { return [l, function () { doc.change(l, f); app.view.redraw(); }]; }
    function tool(t) { return function () { app.tools.setTool(t); }; }
    var del = ['Excluir', function () { HX.ops.deleteSel(doc); }];
    if (sel.length > 1 && sel.every(function (i) { return i.type === 'wire'; })) { E.push(sel.length + ' fios', ['Transformar em cabo…', function () { UI.cableDialog && UI.cableDialog(app, sel); }], '-', del); return E; }
    if (!it) { E.push('Esquema', ['Conector do catálogo', function () { app.focusCatalog(); }], ['Cabo nos pinos (trançado/blindado)…', function () { UI.cablePinsDialog && UI.cablePinsDialog(app); }], ['Fio', tool('wire')], ['Emenda', tool('splice')],
      ['Label de circuito', tool('label')], ['Texto', tool('text')], '-', ['Lista de fiação (texto)…', function () { UI.wireListDialog(app); }], ['Colar', function () { app.tools.paste(); }], ['Ajustar à folha', function () { app.view.fit(); }]); return E; }
    if (it.type === 'conn') { E.push('Conector ' + (it.ref || ''), ['Nome das vias (clicar no pino)', function () { UI.pinNameTool && UI.pinNameTool(app); }], ['Tabela de nomes das vias…', function () { UI.pinNameTable && UI.pinNameTable(app, it); }],
      ['Cabo nos pinos (trançado/blindado)…', function () { UI.cablePinsDialog && UI.cablePinsDialog(app); }], ['Conectar pino a pino…', function () { UI.pinToPinDialog(app); }], ['Lista de fiação (texto)…', function () { UI.wireListDialog(app); }], '-',
      ['Girar 90°', btn('rot')], ['Espelhar', btn('mx')]);
      if (HX.pinOrderChanged && HX.pinOrderChanged(doc, it)) E.push(ch('Voltar à ordem dos pinos do catálogo', function () { HX.pinOrderReset(doc, it); }));
      E.push(['Dica: clique num pino e use ↑/↓ para mudar a posição dele', function () {}], '-', ['Pincel de formatação (copiar aparência)', tool('paint')], del); return E; }
    if (it.type === 'wire') { var hid = HX.wireLblOpts(it).lblPos === 'n';
      E.push('Fio ' + (it.num || ''), ch(hid ? 'Mostrar identificação do fio' : 'Ocultar identificação do fio', function () { it.lblPos = hid ? 'a' : 'n'; }),
        ['Selecionar o circuito inteiro', function () { var nl = HX.buildNetlist(doc.p), nd = nl.nodes[doc.sheet + '|' + HX.key(it.pts[0][0], it.pts[0][1])], W = nd && nd.net ? nd.net.wires : [it]; doc.select(W.map(function (w) { return w.id; })); }],
        ['Transformar em cabo… (com os fios selecionados)', function () { UI.cableDialog && UI.cableDialog(app, doc.selected().filter(function (w) { return w.type === 'wire'; })); }], '-', del); return E; }
    if (it.type === 'splice') { E.push('Emenda ' + (it.ref || '')); Object.keys(HX.CAT.splices).forEach(function (k) { E.push(ch((it.kind === k ? '✓ ' : '') + HX.CAT.splices[k].d, function () { it.kind = k; })); }); E.push('-', del); return E; }
    if (it.type === 'cable') { E.push('Cabo ' + (it.ref || ''), ['Trocar o modelo do cabo…', function () { UI.cableDialog && UI.cableDialog(app, HX.cableWires ? HX.cableWires(doc, it) : [], it); }], '-', del); return E; }
    return [((HX.RIBBON_LBL || {})[it.type] || it.type), del];
  };
  /* físico: o menu do físico depende do ponto; usa o centro do item e não deixa a montagem da lista mudar a seleção */
  function physActs(app, it) { if (!HX.physActions) return []; var sh = app.doc.cur(), pt = null;
    if (it.type === 'pnode') pt = [it.x, it.y]; else if (it.type === 'pseg' && HX.physSegPts) { var P = HX.physSegPts(it, HX.physIdx(sh)); pt = P && P[Math.floor(P.length / 2)]; } else if (it.x != null) pt = [it.x, it.y];
    if (!pt) return []; var s0 = app.doc.select; app.doc.select = function () {}; try { return HX.physActions(app, pt); } finally { app.doc.select = s0; } }
  function acts(app) { var s = app.doc.selected(), it = s[0]; if (!s.length) return []; return HX.isPhys(app.doc.cur()) ? physActs(app, it) : HX.itemActions(app, s.length > 1 ? null : it).filter(function () { return s.length === 1 || s.every(function (i) { return i.type === 'wire'; }); }); }
  HX.selActions = function (app) { return acts(app).filter(function (e) { return Array.isArray(e) && !/^Dica/.test(e[0]); }); };
  /* topo do painel de Propriedades: botões das ações */
  var pb0 = UI.propsBind;
  if (pb0) UI.propsBind = function (it, app, root) { var r = pb0.apply(this, arguments); if (!root || root.querySelector('.hxAct')) return r; var A = HX.selActions(app); if (!A.length) return r;
    var d = document.createElement('div'); d.className = 'hxAct'; d.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;padding:6px 8px;border-bottom:1px solid var(--line,#c8cdd6)';
    A.slice(0, 10).forEach(function (a) { var b = document.createElement('button'); b.textContent = a[0].replace(/…$/, '').replace(/\s*\(.*\)$/, ''); b.title = a[0]; b.style.cssText = 'font-size:11px;padding:3px 7px';
      b.onclick = function () { a[1](); }; d.appendChild(b); });
    var h = root.querySelector('h4'); if (h && h.nextSibling) root.insertBefore(d, h.nextSibling); else root.insertBefore(d, root.firstChild); return r; };
  /* "Itens da cablagem" no menu Inserir (a faixa, em ui_ribbon_def.js, põe na aba Desenho físico) */
  HX.MENU_EXTRA = HX.MENU_EXTRA || []; HX.MENU_EXTRA.push(['Inserir', function (app) { return ['Itens da cablagem (adaptador, bota, luva…)', function () { UI.hitemsDialog && UI.hitemsDialog(app); }, '']; }]);
})(typeof window !== 'undefined' ? window : globalThis);
