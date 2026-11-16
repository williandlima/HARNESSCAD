/* HarnessCAD - exportação DXF (para o Solid Edge Draft, AutoCAD...): cada folha vira um arquivo DXF R12 em mm de papel
   1:1, com moldura e carimbo, igual ao PDF (mesmo desenho, backend dxf.js). No Solid Edge: Arquivo › Abrir › .dxf ›
   salvar como .dft. Cotas, balões e tabelas chegam como linhas e textos (não como objetos nativos do Solid Edge). */
(function (G) {
  'use strict';
  var HX = G.HX;
  /* opts: { mono: true = tudo em preto (cor 7) } -> texto do arquivo DXF (bytes ANSI 1252 em HX.dxfBytes) */
  HX.exportDXF = function (p, s, opts) {
    opts = opts || {}; if (!p.sheets[s]) throw new Error('Folha inexistente');
    var d = HX.sheetDims(p.meta), g = new HX.DxfPage(d[0], d[1], { mono: !!opts.mono }), nl = HX.buildNetlist(p);
    HX.drawFrame(g, p, s, { mono: !!opts.mono });
    if (p._fit) g.push([p._fit.k, 0, 0, p._fit.k, p._fit.dx, p._fit.dy]);
    HX.drawSheetItems(g, p, s, { mono: !!opts.mono, connected: null, faceConn: nl.connected, nl: nl });
    if (p._fit) g.pop();
    return g.build();
  };
  HX.dxfName = function (p, s) {
    var m = p.meta || {}, base = (m.docNo || 'desenho') + (m.rev ? '_rev' + m.rev : '') + (p.sheets.length > 1 ? '_folha' + (s + 1) + '_' + (p.sheets[s].name || '') : '');
    return (HX.io && HX.io.safeName ? HX.io.safeName(base) : base.replace(/[^\w\-. ]+/g, '_')) + '.dxf';
  };
  HX.MENU_EXTRA = HX.MENU_EXTRA || [];
  HX.MENU_EXTRA.push(['Arquivo', function (app) {
    return ['Exportar DXF (Solid Edge / AutoCAD)…', function () {
      var UI = HX.UI, p = app.doc.p, cur = app.doc.sheet;
      var h = '<div class="row"><label>Folhas</label><select id="dxfS"><option value="cur">Folha atual: ' + HX.esc(p.sheets[cur].name || '') + '</option><option value="all">Todas as folhas (um arquivo por folha)</option></select></div>' +
        '<div class="row"><label>Cores</label><select id="dxfC"><option value="mono">Tudo em preto (usual no .dft)</option><option value="cor">Cores do desenho</option></select></div>' +
        '<p style="max-width:430px;font-size:12px">DXF R12 em mm, escala 1:1 da folha (com moldura e carimbo). No Solid Edge: Arquivo › Abrir › escolha o .dxf e salve como .dft. ' +
        'Camadas: FINO, MEDIO, GROSSO (espessura do traço), TEXTO e PREENCHIMENTO. Cotas, balões e tabelas chegam como linhas e textos; imagens raster não vão para o DXF.</p>';
      UI.modal('Exportar DXF', h, [{ t: 'Exportar', pri: true, fn: function (api) {
        var all = api.el.querySelector('#dxfS').value === 'all', mono = api.el.querySelector('#dxfC').value === 'mono';
        var list = all ? p.sheets.map(function (_, i) { return i; }) : [cur];
        try {
          list.forEach(function (s, k) { var b = HX.dxfBytes(HX.exportDXF(p, s, { mono: mono })), nm = HX.dxfName(p, s);
            setTimeout(function () { HX.io.download(nm, new Blob([b], { type: 'application/dxf' })); }, k * 400); });
          UI.toast('DXF exportado: ' + list.length + ' folha(s)');
        } catch (e) { UI.toast('Erro ao exportar DXF: ' + e.message, true); }
      } }, { t: 'Cancelar' }]);
    }, ''];
  }]);
})(typeof window !== 'undefined' ? window : globalThis);
