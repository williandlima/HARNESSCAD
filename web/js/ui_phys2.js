/* HarnessCAD - desenho físico: paleta de imagens e ações por item no painel de propriedades
   (novo ramo, dividir/endireitar ramo, balão, vista frontal, cotar até outro nó, foto real do conector). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI;
  function center(app) { var v = app.view; return [(v.W / 2 - v.ox) / v.s, (v.H / 2 - v.oy) / v.s]; }
  UI.physPalette = function (app) {
    var h = Object.keys(HX.PSPR_CATS).filter(function (c) { return c !== 'cov'; }).map(function (c) {
      return '<h5 class="fhead">' + HX.PSPR_CATS[c] + '</h5><div class="pgrid">' + Object.keys(HX.PSPR).filter(function (k) { return HX.PSPR[k].cat === c; }).map(function (k) {
        var s = HX.PSPR[k]; return '<button class="pcell" data-spr="' + k + '" title="' + HX.esc(s.name) + '"><img src="' + ((G.HX_IMG && G.HX_IMG[s.url]) || s.url) + '" alt=""><small>' + HX.esc(s.name) + '</small></button>';
      }).join('') + '</div>';
    }).join('') + '<p class="muted">Coberturas (conduíte, malha, termo, espiral): selecione o ramo e escolha em Propriedades › Cobertura.</p>';
    var dlg = UI.modal('Inserir item no desenho físico', h, [{ t: 'Fechar' }]);
    dlg.el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-spr]'); if (!b) return;
      var doc = app.doc, c = center(app), it;
      doc.change('Inserir item', function () { it = doc.add({ type: 'pimg', id: doc.uid('m'), sprite: b.dataset.spr, x: HX.r3(c[0]), y: HX.r3(c[1]), size: '', rot: 0, flip: false, label: '', pn: '' }); });
      doc.select([it.id]); dlg.close(); UI.toast('Item inserido no centro da tela — arraste para posicionar.');
    });
  };
  var ACT = {
    pnode: function (it) { return (it.nkind === 'conn' ? [['face', 'Adicionar vista frontal'], ['ctab', 'Tabela de conexão deste conector'], ['photo', 'Foto real do conector…']] : []).concat([['branch', 'Novo ramo a partir daqui'], ['dimto', 'Cotar até outro nó…'], ['ball', 'Adicionar balão']]); },
    pseg: function () { return [['split', 'Dividir ramo (novo BR no meio)'], ['straight', 'Endireitar ramo'], ['label', 'Rótulo do feixe (fios e Ø)'], ['pcov', 'Cobertura parcial / estendida'], ['ball', 'Adicionar balão']]; },
    pcov: function () { return [['ball', 'Adicionar balão']]; },
    pimg: function () { return [['ball', 'Adicionar balão']]; },
    pdim: function () { return [['reset', 'Voltar posição padrão']]; }, pnote: function () { return [['reset', 'Voltar posição padrão']]; }
  };
  var ex0 = UI.propsExtra, bind0 = UI.propsBind;
  UI.propsExtra = function (it, app) {
    var A = ACT[it.type]; if (!HX.ITEM_EXT[it.type]) return ex0(it, app); if (!A) return '';
    var h = A(it).map(function (a) { return '<div class="row"><button data-pact="' + a[0] + '" style="flex:1">' + a[1] + '</button></div>'; }).join('');
    if (it.type === 'pseg') { var bu = HX.physBundle(app.doc.p, app.doc.cur()).seg[it.id] || { wires: [], od: 0 }; var sh0 = app.doc.cur(), Lx = HX.physSegLen(it, HX.physIdx(sh0), +sh0.scale || 1); h = '<div class="muted">Comprimento: <b>' + Lx + ' mm</b> ' + (HX.physSegAuto(it) ? '(medido no desenho)' : '(digitado)') + '<br>Feixe: <b>' + bu.wires.length + ' fio(s)</b> · Ø ≈ <b>' + HX.fmtNum(bu.od) + ' mm</b><br>' + HX.esc(bu.wires.map(function (w) { return w.num; }).join(', ') || '—') + '</div>' + h + '<p class="muted">Arraste o ramo para curvar e os nós para mudar o traçado. As alças laranja perto das pontas religam o ramo em outro nó ou ramo (muda a derivação).</p>'; }
    if (it.type === 'pdim') h += '<p class="muted">Arraste a cota: perpendicular muda o afastamento, ao longo move o texto.</p>';
    return h;
  };
  UI.propsBind = function (it, app, root, set) {
    if (!HX.ITEM_EXT[it.type]) return bind0(it, app, root, set);
    var doc = app.doc;
    [].slice.call(root.querySelectorAll('[data-pact]')).forEach(function (b) {
      b.onclick = function () {
        var a = b.dataset.pact, out;
        if (a === 'photo') { var c = HX.physSchem(doc.p)[it.of]; if (c) UI.physImgDialog(app, c.part); return; }
        if (a === 'dimto') { UI.physHook(app); app._physDimFrom = it.id; UI.toast('Clique no outro nó (conector ou BR) para criar a cota do caminho.'); return; }
        doc.change('Desenho físico: ' + b.textContent, function () {
          if (a === 'branch') out = HX.physAddBranch(doc, it);
          else if (a === 'split') out = HX.physSplitSeg(doc, it);
          else if (a === 'straight') { it.x = 0; it.y = 0; delete it.bends; }
          else if (a === 'ball') out = HX.physAddBalloon(doc, it);
          else if (a === 'ctab') out = doc.add({ type: 'ptable', id: doc.uid('a'), kind: 'conn', of: it.id, x: HX.r3(it.x - 50), y: HX.r3(it.y + 25) });
          else if (a === 'pcov') out = doc.add({ type: 'pcov', id: doc.uid('a'), a: it.a, b: it.b, d0: 0, d1: 0, sprite: 'cov_shrink', txt: '' });
          else if (a === 'label') out = doc.add({ type: 'pnote', id: doc.uid('a'), of: it.id, x: 0, y: -9, text: '' });
          else if (a === 'face') { var d = HX.physDirAt(it, doc.cur(), HX.physIdx(doc.cur())) || [1, 0], L = it._L || 14; out = doc.add({ type: 'pface', id: doc.uid('a'), of: it.id, x: HX.r3(-d[0] * (L + 14)), y: HX.r3(-d[1] * (L + 14)), w: 14 }); }
          else if (a === 'reset') { it.x = 0; it.y = 0; if (it.type === 'pnote') it.y = 6; }
        });
        if (out) doc.select([out.id]);
      };
    });
  };
  UI.formboardDialog = function (app) {
    var F = [{ k: 'paper', l: 'Papel', type: 'select', opts: [['A4', 'A4'], ['A3', 'A3']] }, { k: 'orient', l: 'Orientação', type: 'select', opts: [['port', 'Retrato'], ['land', 'Paisagem']] }, { k: 'overlap', l: 'Sobreposição para colar (mm)', type: 'number', step: 1 }], v = { paper: 'A4', orient: 'land', overlap: 15 };
    var L0 = HX.formboardLayout(app.doc.p, v);
    UI.modal('Gabarito de montagem 1:1', '<p class="muted">O desenho físico em <b>tamanho real</b>, dividido em folhas para colar sobre a mesa de montagem. ' + (L0 ? 'Tamanho do chicote: ' + Math.round(L0.b.x1 - L0.b.x0) + ' × ' + Math.round(L0.b.y1 - L0.b.y0) + ' mm.' : '') + '</p>' + UI.form(F, v),
      [{ t: 'Cancelar' }, { t: 'Gerar PDF', pri: true, fn: function (d) {
        var o = UI.readForm(F, d.el, {}), L = HX.formboardLayout(app.doc.p, o); if (!L) return UI.toast('Gere o desenho físico primeiro.', true);
        var bytes = HX.exportFormboard(app.doc.p, o); HX.io.download((app.doc.p.meta.number || 'cablagem') + '_gabarito_1-1.pdf', bytes, 'application/pdf');
        UI.toast('Gabarito: ' + (L.cols * L.rows) + ' folha(s) ' + o.paper + ' + índice.');
      } }]);
  };
  // modo "cotar até": a próxima seleção de outro nó cria a cota do caminho
  var hooked = false;
  UI.physHook = function (app) {
    if (hooked) return; hooked = true;
    app.doc.on('select', function () {
      var from = app._physDimFrom; if (!from) return;
      var s = app.doc.selected(); if (s.length !== 1 || s[0].type !== 'pnode' || s[0].id === from) return;
      var a = app.doc.find(from), b = s[0], d; app._physDimFrom = null; if (!a) return;
      app.doc.change('Cota do caminho', function () { d = HX.physAddDim(app.doc, a, b, 'path'); });
      app.doc.select([d.id]); UI.toast('Cota criada — arraste para posicionar.');
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
