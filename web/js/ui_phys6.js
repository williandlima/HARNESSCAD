/* HarnessCAD - desenho físico: MENU DE CONTEXTO (botão direito) com as ações do item sob o cursor
   (ramo, conector, BR/emenda, item do ramo ou área livre). Esc ou clique fora fecha. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, menu = null;
  function close() { if (menu) { menu.remove(); menu = null; } }
  function show(x, y, entries) {
    close(); menu = document.createElement('div'); menu.className = 'ctxmenu';
    menu.style.cssText = 'position:fixed;z-index:9999;left:' + x + 'px;top:' + y + 'px;min-width:220px;background:var(--panel,#262a33);color:var(--fg,#e8e8e8);border:1px solid var(--line,#444);border-radius:6px;box-shadow:0 6px 24px rgba(0,0,0,.45);padding:4px 0;font-size:13px';
    entries.forEach(function (e) {
      if (e === '-') { var hr = document.createElement('div'); hr.style.cssText = 'border-top:1px solid var(--line,#444);margin:4px 0'; menu.appendChild(hr); return; }
      if (typeof e === 'string') { var h = document.createElement('div'); h.textContent = e; h.style.cssText = 'padding:4px 12px;opacity:.6;font-size:11px;text-transform:uppercase'; menu.appendChild(h); return; }
      var b = document.createElement('div'); b.textContent = e[0]; b.style.cssText = 'padding:5px 14px;cursor:pointer;white-space:nowrap';
      b.onmouseenter = function () { b.style.background = 'rgba(80,140,255,.25)'; }; b.onmouseleave = function () { b.style.background = ''; };
      b.onclick = function () { close(); e[1](); }; menu.appendChild(b);
    });
    document.body.appendChild(menu);
    var r = menu.getBoundingClientRect(); if (r.right > innerWidth) menu.style.left = (innerWidth - r.width - 4) + 'px'; if (r.bottom > innerHeight) menu.style.top = (innerHeight - r.height - 4) + 'px';
  }
  HX.UI.ctxMenu = show;
  function entriesFor(app, pt) {
    var doc = app.doc, sh = doc.cur(), t = app.tools, pk = HX.physPick(sh, pt, 10 / app.view.s), hit = app.view.hitTest ? app.view.hitTest(pt) : null, E = [];
    function ch(label, fn) { return [label, function () { var out; doc.change(label, function () { out = fn(); }); if (out && out.id) doc.select([out.id]); }]; }
    if (hit && hit.type === 'ptag') { doc.select([hit.id]); E.push('Etiqueta ' + (hit.text || ''), ch(hit.dim ? 'Tirar a cota' : 'Mostrar cota da posição', function () { hit.dim = !hit.dim; }), ch('Cota do outro lado', function () { hit.dimOff = -(hit.dimOff === '' || hit.dimOff == null ? -8 : +hit.dimOff); }), ch('Medir a partir da outra ponta', function () { var mm = HX.physIdx(sh), L = HX.physSegLen(mm[hit.seg], mm, +sh.scale || 1); hit.end = hit.end === 'b' ? 'a' : 'b'; hit.dist = Math.round(L - (+hit.dist || 0)); }), ch('Bandeira na posição padrão', function () { hit.x = ''; hit.y = ''; }), '-', ['Excluir', function () { doc.select([hit.id]); HX.ops.deleteSel(doc); }]); return E; }
    if (hit && hit.type === 'pdetail') { doc.select([hit.id]); E.push('Detalhe ' + (hit.label || ''), ch('Excluir o detalhe', function () { doc.removeIds([hit.id]); })); }
    if (hit && hit.type === 'pacc') { doc.select([hit.id]); E.push((HX.PACC[hit.kind] || {}).n || 'Item do ramo', ch('Medir a partir da outra ponta', function () { var sg = HX.physIdx(sh)[hit.seg], L = HX.physSegLen(sg, HX.physIdx(sh), +sh.scale || 1); hit.end = hit.end === 'b' ? 'a' : 'b'; hit.dist = Math.round(L - (+hit.dist || 0)); }), ch('Adicionar balão', function () { return HX.physAddBalloon(doc, hit); }), ch('Nota com bandeira', function () { return HX.physAddFlag(doc, hit); }), '-', ['Excluir', function () { doc.select([hit.id]); HX.ops.deleteSel(doc); }]); return E; }
    if (pk && pk.node) {
      var n = pk.node; doc.select([n.id]);
      if (n.nkind === 'conn') {
        E.push('Conector ' + (n.ref || ''), ch('Girar 90°', function () { n.rot = ((+n.rot || HX.physAngle(n, sh.items)) + 90) % 360; }), ch('Espelhar', function () { n.flip = !n.flip; }));
        E.push(ch('Bota reta', function () { n.bootKind = 'boot_s'; }), ch('Bota 90°', function () { n.bootKind = 'boot_90'; }), ch('Sem bota', function () { n.bootKind = ''; }), ch(n.bsKind ? 'Sem backshell' : 'Backshell / alívio reto', function () { n.bsKind = n.bsKind ? '' : 'sr_s'; }));
        E.push(ch('+ Preparação da ponta (detalhe)', function () { return HX.physAddPrep(doc, n); }));
        E.push(ch(HX.physVecOn(n, sh) ? 'Mostrar imagem do datasheet' : 'Desenho técnico (vetor)', function () { n.draw = HX.physVecOn(n, sh) ? 'img' : 'vec'; }), ['Consultar medidas do conector…', function () { HX.uiConnDims && HX.uiConnDims(app, n); }]);
        E.push(ch(n.dsImg === 'off' ? 'Usar imagem de datasheet' : 'Usar imagem do painel', function () { n.dsImg = n.dsImg === 'off' ? '' : 'off'; }), '-', ch('Balão', function () { return HX.physAddBalloon(doc, n); }), ch('Nota com bandeira', function () { return HX.physAddFlag(doc, n); }), ch('Tabela de conexões', function () { return doc.add({ type: 'ptable', id: doc.uid('a'), kind: 'conn', of: n.id, x: HX.r3(n.x + 10), y: HX.r3(n.y + 25), w: 120 }); }));
      } else {
        E.push((n.nkind === 'splice' ? 'Emenda ' : 'Derivação ') + (n.ref || ''), ['Novo ramo daqui (W)', function () { t.setTool('wire'); t.pA = { node: n }; app.view.redraw(); }]);
        if (HX.physSegsOf(sh, n.id).length === 2) E.push(ch('Juntar os ramos (remover ' + (n.ref || 'BR') + ')', function () { HX.physMergeBR(doc, n); }));
        if (HX.physTrunkAt(sh, n)) E.push(['Deslizar no tronco… (ou Alt + arrastar)', function () { var T = HX.physTrunkAt(sh, n); UI.ask('Deslizar ' + (n.ref || 'BR'), 'Distância de ' + (T.A.ref || 'ponta') + ' (mm reais):', String(HX.physSegLen(T.s1, HX.physIdx(sh), +sh.scale || 1))).then(function (v) { if (v) doc.change('Deslizar', function () { HX.physSlideBR(sh, n, parseFloat(String(v).replace(',', '.'))); }); }); }]);
        E.push(ch('Nota com bandeira', function () { return HX.physAddFlag(doc, n); }));
        if (HX.physSegsOf(sh, n.id).length >= 2) E.push(ch('+ Cota angular aqui', function () { return HX.physAddAng(doc, n); }));
      }
      return E;
    }
    if (pk && pk.seg) {
      var s = pk.seg; doc.select([s.id]);
      E.push('Ramo', ch('Derivar aqui (BR)', function () { return HX.physSplitAt(doc, s, pk.t); }), ['Novo ramo a partir daqui', function () { t.setTool('wire'); t.pA = pk; app.view.redraw(); }], '-');
      E.push(ch('+ Etiqueta de identificação aqui', function () { return HX.physAddTag(doc, s, pk.t); }));
      Object.keys(HX.PACC).forEach(function (k) { E.push(ch('+ ' + HX.PACC[k].n + ' aqui', function () { var a = HX.physAddAcc(doc, s, k), L = HX.physSegLen(s, HX.physIdx(sh), +sh.scale || 1); a.dist = Math.round(pk.t * L); return a; })); });
      E.push('-'); Object.keys(HX.PHYS_BIND || {}).forEach(function (k) { E.push(ch('Amarração: ' + HX.PHYS_BIND[k].n, function () { s.bind = k; })); });
      E.push(ch('Sem amarração', function () { s.bind = 'none'; }), ch(HX.physLooseOf && HX.physLooseOf(s, sh) ? 'Feixe com capa' : 'Feixe sem capa (fios aparentes)', function () { s.loose = HX.physLooseOf(s, sh) ? 'jacket' : 'wires'; }));
      E.push('-', ch('Girar sub-ramo 90°', function () { HX.physRotateSub(sh, s, 90); }), ch('Girar sub-ramo −90°', function () { HX.physRotateSub(sh, s, -90); }), ch('Espelhar sub-ramo', function () { HX.physMirrorSub(sh, s); }), ['Selecionar sub-ramo', function () { doc.select(HX.physSubIds(sh, s)); }], ch('Endireitar (tirar curva)', function () { s.x = 0; s.y = 0; }), ch('Nota com bandeira', function () { return HX.physAddFlag(doc, s); }));
      return E;
    }
    E.push('Desenho físico', ch('Organizar rótulos', function () { var k = HX.physArrangeLabels(sh); UI.toast(k ? k + ' rótulo(s) reposicionado(s).' : 'Nenhum rótulo sobreposto.'); }), ch('Redesenhar em escala', function () { HX.physRedrawScale(sh); }), ch('Remover derivações sem ramificação', function () { var k = HX.physCleanBR(doc, sh, false); UI.toast(k ? k + ' derivação(ões) sem ramificação removida(s); os ramos foram unidos.' : 'Todas as derivações têm ramificação.'); }), ch('+ Vista de detalhe aqui', function () { return HX.physAddDetail(doc, { x: pt[0] - 15, y: pt[1] - 15, w: 30, h: 30 }, sh.detShape || 'circle'); }), ['Vista de detalhe: arrastar a área (V)', function () { t.setTool('pdet'); }], ch('+ Nota com bandeira aqui', function () { var f = HX.physAddFlag(doc, null); f.x = HX.r3(pt[0]); f.y = HX.r3(pt[1]); return f; }), '-', ['Ajustar à tela', function () { app.view.fit(); }]);
    return E;
  }
  var A = HX.App.prototype, init0 = A.init;
  A.init = function () {
    init0.call(this); var app = this, cv = app.view.cv;
    cv.addEventListener('contextmenu', function (e) {
      if (!HX.isPhys(app.doc.cur())) return; e.preventDefault();
      var r = cv.getBoundingClientRect(), v = app.view, pt = [(e.clientX - r.left - v.ox) / v.s, (e.clientY - r.top - v.oy) / v.s];
      show(e.clientX, e.clientY, entriesFor(app, pt));
    });
    document.addEventListener('mousedown', function (e) { if (menu && !menu.contains(e.target)) close(); }, true);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); }, true);
  };
})(typeof window !== 'undefined' ? window : globalThis);
