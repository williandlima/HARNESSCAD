/* HarnessCAD - detalhe típico da cordoalha (2): campos, comando Inserir e espaguete sob a cordoalha na lista. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT; if (!EXT || !EXT.pcord) return; var num = HX.cordNum;
  EXT.pcord.fields = function () {
      return [{ type: 'head', l: 'Detalhe típico — montagem da cordoalha' }, { k: 'label', l: 'Título (vazio = DETALHE B, - = sem título)' }, { k: 'esc', l: 'Escala do detalhe (1 = real)', type: 'number', step: 0.1 }, { k: 'dia', l: 'Ø do cabo (mm)', type: 'number', step: 0.5 },
        { type: 'head', l: 'Cotas (etapa 1)' }, { k: 'd1', l: 'Ponta (mm)', type: 'number', step: 1 }, { k: 't1', l: 'Tolerância (ex.: ±1)' }, { k: 'd2', l: 'Fios expostos (mm)', type: 'number', step: 1 }, { k: 't2', l: 'Tolerância' },
        { k: 'd3', l: 'Espaguete (mm)', type: 'number', step: 5 }, { k: 't3', l: 'Tolerância' }, { k: 'tip', l: 'Texto sob a cota (vazio = TIP.)' }, { k: 'espPN', l: 'PN do espaguete sob a cordoalha' },
        { type: 'head', l: 'Balões (vazio = nº da lista de materiais)' }, { k: 'n16', l: 'Espaguete' }, { k: 'n5', l: 'Adaptador (REF)' }, { k: 'n20', l: 'Barbante' }, { k: 'n14', l: 'Cordoalha (REF)' }, { k: 'n8', l: 'Luva de solda' },
        { k: 'nt16', l: 'Nota (triângulo) no espaguete' }, { k: 'nt8', l: 'Nota (triângulo) na luva de solda' }];
  };
  HX.physAddCord = function (doc) { /* procura um espaço livre na folha (itens já desenhados), senão canto esquerdo */
    var dm = HX.sheetDims ? HX.sheetDims(doc.p.meta) : [420, 297], W = 150, H = 100, B = doc.cur().items.map(function (q) { return q._bb; }).filter(Boolean), at = [20, Math.round(dm[1] * 0.42)], ok = false;
    for (var y = 15; y + H < dm[1] - 50 && !ok; y += 10) for (var x = 15; x + W < dm[0] - 10 && !ok; x += 10) if (B.every(function (b) { return b.x1 < x || b.x0 > x + W || b.y1 < y || b.y0 > y + H; })) { at = [x, y]; ok = true; }
    return doc.add({ type: 'pcord', id: doc.uid('a'), x: at[0], y: at[1], label: '', esc: '', dia: '', d1: '', d2: '', d3: '', espPN: '' }); };
  /* lista de materiais: espaguete sob a cordoalha (comprimento × pontas com adaptador) */
  var bom = HX.physBom;
  HX.physBom = function (p, sh) {
    var Bm = bom(p, sh), D = sh.items.filter(function (i) { return i.type === 'pcord'; })[0]; if (!D) return Bm;
    var ends = sh.items.filter(function (n) { return n.type === 'pnode' && n.nkind === 'conn' && /^(pre_|adp)/.test(n.bsKind || ''); }).length || 1, key = 'cesp:' + (D.espPN || '');
    if (!Bm.key[key]) { var r = { k: key, pn: D.espPN || '', desc: 'Espaguete termo-retrátil (sob a cordoalha)', qty: num(D.d3, 60) * ends, un: 'mm' }; Bm.rows.push(r); Bm.key[key] = r; Bm.rows.forEach(function (q, j) { q.n = j + 1; }); }
    return Bm;
  };
  if (HX.MENU_EXTRA) HX.MENU_EXTRA.push(['Inserir', function (app) { return ['Detalhe típico: montagem da cordoalha', function () {
    if (!HX.isPhys(app.doc.cur())) return HX.UI.toast('Abra a folha do desenho físico.', true); var it; app.doc.change('Detalhe típico da cordoalha', function () { it = HX.physAddCord(app.doc); }); app.doc.select([it.id]); app.view.redraw(); }, '']; }]);
})(typeof window !== 'undefined' ? window : globalThis);
