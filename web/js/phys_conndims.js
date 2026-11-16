/* HarnessCAD - medidas do conector PARA CONSULTA (não vão para o desenho da cablagem): vistas cotadas do D-Sub
   (lateral e frontal, mm reais) e tabela de medidas do datasheet de qualquer conector. Interface: ui_conndims.js. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function f2(v) { return (Math.round(v * 100) / 100).toFixed(2).replace('.', ','); }
  function dim(g, a, b, off, t, col) { // cota alinhada ao segmento a-b, deslocada off (mm reais)
    var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy * off, ny = ux * off, A = [a[0] + nx, a[1] + ny], B = [b[0] + nx, b[1] + ny];
    g.style({ stroke: col, lw: 0.1, dash: null, fill: null }); g.line(a[0], a[1], a[0] + nx * 1.1, a[1] + ny * 1.1); g.line(b[0], b[1], b[0] + nx * 1.1, b[1] + ny * 1.1); g.line(A[0], A[1], B[0], B[1]);
    [[A, 1], [B, -1]].forEach(function (e) { var p = e[0], s = e[1]; g.style({ fill: col }); g.poly([p, [p[0] + ux * 1.2 * s - uy * 0.35, p[1] + uy * 1.2 * s + ux * 0.35], [p[0] + ux * 1.2 * s + uy * 0.35, p[1] + uy * 1.2 * s - ux * 0.35]], true); g.style({ fill: null }); });
    var mx = (A[0] + B[0]) / 2 + nx / Math.abs(off || 1) * 1.6, my = (A[1] + B[1]) / 2 + ny / Math.abs(off || 1) * 1.6, an = Math.atan2(uy, ux);
    if (Math.cos(an) < -1e-6 || (Math.abs(Math.cos(an)) <= 1e-6 && Math.sin(an) > 0)) an += Math.PI;
    var c = Math.cos(an), s2 = Math.sin(an); g.push([c, s2, -s2, c, mx, my]); g.text(t, 0, 0, { size: 1.7, align: 'c', color: col }); g.pop();
  }
  HX.connDimsDraw = function (g, nd, c, col) { // vistas cotadas em mm reais; devolve a caixa usada
    var M = HX.dsubSide(c, nd), D = M.D, b = HX.physDsubVec(g, nd, c, 1, col, true, 3);
    var o0 = b.xf - b.xfront; dim(g, [b.xf, -b.A / 2], [b.xf, b.A / 2], o0 + 9, f2(D.A), col); dim(g, [b.xf, -b.B / 2], [b.xf, b.B / 2], o0 + 4, f2(D.B), col);
    if (M.kind === 'crimp') dim(g, [b.xfront, b.y1], [b.xr + M.rear, b.y1], 5, 'A máx ' + f2(M.am), col); else dim(g, [b.xr, b.y1], [b.xr + M.rear, b.y1], 5, f2(M.rear) + ' máx', col);
    dim(g, [b.xfront, b.y0], [b.xf, b.y0], -4, f2(M.fs), col);
    var fx = 22 + D.A / 2, F = HX.physDsubFace(g, c, fx, 0, 1, col);
    dim(g, [F.x0, F.y1], [F.x1, F.y1], 9, f2(D.A), col); dim(g, [fx - D.B / 2, F.y1], [fx + D.B / 2, F.y1], 4, f2(D.B) + ' (Ø3,10)', col); dim(g, [F.x1, F.y0], [F.x1, F.y1], -4, f2(D.H), col);
    return { x0: b.x0 - 16, y0: -D.A / 2 - 8, x1: F.x1 + 10, y1: D.A / 2 + 10 };
  };
  HX.connDimsTable = function (nd, c) {
    var rows = [], d = HX.CAT.conns[c.part] || {};
    rows.push(['Part number', HX.connPN ? HX.connPN(c) : c.part], ['Descrição', d.desc || '']);
    if (HX.isDsub(c)) {
      var M = HX.dsubSide(c, nd), D = M.D; rows.push(['Carcaça', D.shell], ['Flange (A)', f2(D.A) + ' mm'], ['Furação (B)', f2(D.B) + ' mm — furo Ø3,10'], ['Altura do flange', f2(D.H) + ' mm'],
        [M.kind === 'crimp' ? 'A máx. (encaixe → traseira)' : 'Atrás do flange (máx.)', f2(M.kind === 'crimp' ? M.am : M.rear) + ' mm'], ['Terminação', { solder: 'caçapa de solda (2,50)', crimp: 'crimp removível', power: 'contatos de potência/coaxiais' }[M.kind]]);
    } else (HX.physAssembly(nd, c, true) || []).forEach(function (e, i, E) { var L = e.L, H = e.H; if (i === E.length - 1) { if (+nd.cL > 0) L = +nd.cL; if (+nd.cD > 0) H = +nd.cD; } rows.push([(HX.PDS[e.id] || {}).n || e.id, f2(L) + ' × Ø' + f2(H) + ' mm']); });
    return rows;
  };
})(typeof window !== 'undefined' ? window : globalThis);
