/* HarnessCAD - ferramentas e campos de CUSTOMIZAÇÃO do desenho físico.
   Cota livre (Shift+D): clique no 1º ponto e no 2º — encaixa em canto/borda/centro de QUALQUER item, nó ou ponta de
   ramo (marca laranja); Alt = ponto livre. Balão (Shift+B): clique em qualquer item, no ponto onde vai a seta.
   Campos: cota livre, balão, tabelas (larguras/títulos de colunas, altura de linha, fontes, título), rótulo de item
   do ramo e identificação do ramo (mostrar, texto, posição, lado, tamanho), estilo da folha. */
(function (G) {
  'use strict';
  var HX = G.HX, T = HX.Tools.prototype, EXT = HX.ITEM_EXT, UI = HX.UI, down0 = T.down, ov0 = T.drawOverlay, key0 = T.key, HL = '#ff7a00';
  function phys(self) { return self.doc && HX.isPhys(self.doc.cur()); }
  function snap(self, e) { var sh = self.doc.cur(), tol = 9 / self.view.s; return e && e.altKey ? null : HX.physSnapAt(sh, self.cur, tol); }
  T.down = function (e) {
    if (!phys(this) || (this.tool !== 'pdimx' && this.tool !== 'pballx') || e.button !== 0) return down0.call(this, e);
    this.ev(e); var doc = this.doc, sh = doc.cur(), self = this;
    if (this.tool === 'pdimx') {
      var sp = snap(this, e), an = HX.physMakeAnchor(sh, this.cur, sp);
      if (!this.dx1) { this.dx1 = an; this.dx1p = sp ? [sp[0], sp[1]] : this.cur.slice(); this.view.redraw(); return; }
      var a = this.dx1, p0 = this.dx1p, p1 = sp ? [sp[0], sp[1]] : this.cur, ori = Math.abs(p1[1] - p0[1]) < 0.15 * Math.abs(p1[0] - p0[0]) ? 'h' : Math.abs(p1[0] - p0[0]) < 0.15 * Math.abs(p1[1] - p0[1]) ? 'v' : 'a', it;
      this.dx1 = null; doc.change('Cota livre', function () { it = doc.add({ type: 'pdimx', id: doc.uid('a'), a: a, b: an, orient: ori, off: 6, x: 0, y: 0, text: '', tolP: '', tolM: '', arrows: true, ext: true }); });
      doc.select([it.id]); this.setTool('select'); UI.toast('Cota livre criada: ' + HX.fmtNum(Math.round(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) * (+sh.scale || 1))) + ' mm. Arraste para afastar; edite no painel.'); return;
    }
    var h = this.view.hitTest(this.cur); if (!h || h.type === 'pball') { UI.toast('Clique sobre um item (conector, ramo, acessório, etiqueta, tabela, vista…).', true); return; }
    var m = HX.physIdx(sh), R = HX.physRefPt(m[h.id] || h, m) || this.cur, b;
    doc.change('Balão', function () { b = doc.add({ type: 'pball', id: doc.uid('a'), of: h.id, ax: HX.r3(self.cur[0] - R[0]), ay: HX.r3(self.cur[1] - R[1]), x: 8, y: -10, n: '' }); });
    doc.select([b.id]); this.setTool('select'); UI.toast('Balão criado. Arraste para mover; número/tamanho no painel.');
  };
  T.drawOverlay = function (g, c) {
    ov0.call(this, g, c); if (!phys(this) || (this.tool !== 'pdimx' && this.tool !== 'pballx')) return;
    var s = this.view.s, sp = this.tool === 'pdimx' ? HX.physSnapAt(this.doc.cur(), this.cur, 9 / s) : null;
    if (sp) { g.style({ stroke: HL, lw: 2 / s, fill: 'rgba(255,122,0,0.25)', dash: null }); g.circle(sp[0], sp[1], 4 / s); g.style({ fill: null }); }
    if (this.dx1p) { var q = sp ? [sp[0], sp[1]] : this.cur; g.style({ stroke: HL, lw: 1.5 / s, dash: [4 / s, 3 / s] }); g.line(this.dx1p[0], this.dx1p[1], q[0], q[1]); g.style({ dash: null }); g.text(HX.fmtNum(Math.round(Math.hypot(q[0] - this.dx1p[0], q[1] - this.dx1p[1]) * (+this.doc.cur().scale || 1))), (this.dx1p[0] + q[0]) / 2, (this.dx1p[1] + q[1]) / 2 - 8 / s, { size: 12 / s, align: 'c', color: HL }); }
  };
  T.key = function (e) {
    var tg = e.target && e.target.tagName; if (!/INPUT|TEXTAREA|SELECT/.test(tg || '') && phys(this) && e.shiftKey && !e.ctrlKey && !e.metaKey) {
      var k = (e.key || '').toLowerCase(); if (k === 'd' || k === 'b') { e.preventDefault(); this.dx1 = null; this.dx1p = null; this.setTool(k === 'd' ? 'pdimx' : 'pballx'); UI.toast(k === 'd' ? 'Cota livre: clique no 1º e no 2º ponto (encaixa em qualquer item; Alt = livre).' : 'Balão: clique no item, no ponto onde vai a seta.'); return; }
    }
    if (e.key === 'Escape') { this.dx1 = null; this.dx1p = null; }
    return key0.call(this, e);
  };
  HX.SHORTCUTS.push(['Shift+D', 'Desenho físico: cota livre entre quaisquer pontos'], ['Shift+B', 'Desenho físico: balão em qualquer item']);
  // ---- campos ----
  EXT.pdimx.fields = function () {
    return [{ type: 'head', l: 'Cota livre' }, { k: 'orient', l: 'Direção', type: 'select', opts: [['a', 'Alinhada aos pontos'], ['h', 'Horizontal'], ['v', 'Vertical']] },
      { k: 'text', l: 'Texto próprio (vazio = medido)' }, { k: 'tolP', l: 'Tolerância +' }, { k: 'tolM', l: 'Tolerância −' }, { k: 'off', l: 'Afastamento (mm)', type: 'number', step: 1 },
      { k: 'tx', l: 'Deslocar o texto ao longo (mm)', type: 'number', step: 1 }, { k: 'fs', l: 'Tamanho do texto (vazio = da folha)', type: 'number', step: 0.1 },
      { k: 'arrows', l: 'Setas', type: 'check' }, { k: 'ext', l: 'Linhas de chamada', type: 'check' }];
  };
  var bf0 = EXT.pball.fields;
  function dft(it, k) { if (it[k] === undefined) it[k] = true; } // caixas que valem 'sim' quando nunca mexidas
  EXT.pball.fields = function (it, doc) { dft(it, 'lead');
    return bf0(it, doc).concat([{ k: 'r', l: 'Raio do balão (mm, vazio = da folha)', type: 'number', step: 0.2 }, { k: 'fs', l: 'Tamanho do número', type: 'number', step: 0.1 },
      { k: 'lead', l: 'Seta até o item', type: 'check' }, { k: 'ax', l: 'Ponta da seta: desloc. X no item (mm)', type: 'number', step: 0.5 }, { k: 'ay', l: 'Ponta da seta: desloc. Y no item (mm)', type: 'number', step: 0.5 }]);
  };
  var tf0 = EXT.ptable.fields;
  EXT.ptable.fields = function (it, doc) {
    var D = HX.PTABLE_COLS && HX.PTABLE_COLS[it.kind], base = tf0 ? tf0(it, doc) : [];
    return base.concat([{ type: 'head', l: 'Tamanho e formato da tabela' }, { k: 'title', l: 'Título (vazio = padrão; - esconde)' }, { k: 'tfs', l: 'Tamanho do título', type: 'number', step: 0.1 },
      { k: 'rh', l: 'Altura da linha (mm)', type: 'number', step: 0.2 }, { k: 'fs', l: 'Tamanho do texto', type: 'number', step: 0.1 }, { k: 'w', l: 'Largura total (tabela de ligação, mm)', type: 'number', step: 5 }].concat(D ? [
      { k: 'cw', l: 'Larguras das colunas (mm, vírgula; 0 esconde)', tip: 'Padrão: ' + D.map(function (c) { return c[1]; }).join(', ') },
      { k: 'ch', l: 'Títulos das colunas (vírgula)', tip: 'Padrão: ' + D.map(function (c) { return c[0]; }).join(', ') }] : []));
  };
  var af0 = EXT.pacc.fields;
  EXT.pacc.fields = function (it, doc) { dft(it, 'showLbl'); return af0(it, doc).concat([{ type: 'head', l: 'Rótulo' }, { k: 'showLbl', l: 'Mostrar rótulo', type: 'check' }, { k: 'lblTxt', l: 'Texto do rótulo (vazio = padrão)' }, { k: 'lblSub', l: '2ª linha (vazio = distância)' }]); };
  var sf0 = EXT.pseg.fields;
  EXT.pseg.fields = function (it, doc) { dft(it, 'info'); return sf0(it, doc).concat([{ type: 'head', l: 'Identificação do ramo' }, { k: 'info', l: 'Mostrar identificação', type: 'check' }, { k: 'infoTxt', l: 'Texto (vazio = nº de fios · Ø)' },
    { k: 'infoT', l: 'Posição ao longo (0 a 1, vazio = automática)', type: 'number', step: 0.05 }, { k: 'infoSide', l: 'Lado', type: 'select', opts: [['', 'Padrão'], ['o', 'Oposto']] }, { k: 'infoFs', l: 'Tamanho do texto', type: 'number', step: 0.1 }]); };
  HX.uiDrawStyle = function (app) { // estilo do desenho (folha)
    var sh = app.doc.cur(); if (!HX.isPhys(sh)) return UI.toast('Abra a folha do desenho físico.', true);
    var F = [['dimFs', 'Tamanho do texto das cotas (mm)', 2.5], ['ballR', 'Raio dos balões (mm)', 2.6], ['lblFs', 'Tamanho da identificação dos ramos (mm)', 1.5]], box = UI.h('div');
    box.innerHTML = F.map(function (f) { return '<div class="row"><label style="flex:1">' + f[1] + '</label><input type="number" step="0.1" id="ds_' + f[0] + '" value="' + (sh[f[0]] || f[2]) + '" style="width:80px"></div>'; }).join('') +
      '<div class="row"><label><input type="checkbox" id="ds_seg"' + (sh.segInfo === false ? '' : ' checked') + '> Identificação dos ramos ("15 fios · Ø…")</label></div><div class="row"><label><input type="checkbox" id="ds_acc"' + (sh.accLbl === false ? '' : ' checked') + '> Rótulos dos itens do ramo (abraçadeiras, fitas…)</label></div>';
    UI.modal('Estilo do desenho', box, [{ t: 'Aplicar', pri: true, fn: function () { app.doc.change('Estilo do desenho', function () { F.forEach(function (f) { var v = +UI.$('#ds_' + f[0], box).value; sh[f[0]] = v > 0 && v !== f[2] ? v : ''; }); sh.segInfo = UI.$('#ds_seg', box).checked; sh.accLbl = UI.$('#ds_acc', box).checked; }); app.view.redraw(); } }, { t: 'Cancelar' }]);
  };
  HX.MENU_EXTRA = HX.MENU_EXTRA || [];
  // ---- menu / faixa ----
  HX.MENU_EXTRA.push(['Exibir', function (app) { return ['Estilo do desenho físico…', function () { HX.uiDrawStyle(app); }, '']; }]);
  HX.MENU_EXTRA = HX.MENU_EXTRA || [];
  HX.MENU_EXTRA.push(['Inserir', function (app) { return ['Cota livre (qualquer item)', function () { app.tools.setTool('pdimx'); UI.toast('Cota livre: clique no 1º e no 2º ponto (Shift+D).'); }, 'Shift+D']; }]);
  HX.MENU_EXTRA.push(['Inserir', function (app) { return ['Balão em qualquer item', function () { app.tools.setTool('pballx'); UI.toast('Balão: clique no item (Shift+B).'); }, 'Shift+B']; }]);
  if (HX.RIBBON) HX.RIBBON.forEach(function (Tb) { if (Tb[0] === 'Inserir') Tb[1].forEach(function (gr) { if (gr[0] === 'Desenho físico') gr[1].push('m:Inserir/Cota livre', 'm:Inserir/Balão em qualquer item'); }); });
  if (HX.RIBBON) HX.RIBBON.forEach(function (Tb) { if (Tb[0] === 'Desenho físico') Tb[1].splice(1, 0, ['Anotar', ['*m:Inserir/Cota livre', '*m:Inserir/Balão em qualquer item', 'm:Exibir/Estilo do desenho físico']]); });
})(typeof window !== 'undefined' ? window : globalThis);
