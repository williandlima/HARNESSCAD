/* HarnessCAD - ícones da faixa de opções (traço 24×24): HX.uiIcon(nome ou texto do comando) */
(function (G) {
  'use strict';
  var HX = G.HX;
  var P = {
    novo: 'M6 2h9l5 5v15H6zM14 2v6h6M12 11v7M8.5 14.5h7', abrir: 'M3 6h6l2 2h10v12H3zM3 10h18', salvar: 'M5 3h12l4 4v14H5zM8 3v6h8M8 21v-7h8v7',
    importar: 'M12 3v12M7 10l5 5 5-5M4 17v4h16v-4', exportar: 'M12 15V3M7 8l5-5 5 5M4 17v4h16v-4', backup: 'M12 7v5l3 3M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4',
    imprimir: 'M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z', tabela: 'M3 5h18v14H3zM3 10h18M3 15h18M9 5v14', pagina: 'M5 3h14v18H5zM5 16h14M12 16v5',
    undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3', redo: 'M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3', save: 'M5 3h12l4 4v14H5zM8 3v6h8M8 21v-7h8v7',
    copiar: 'M8 8h12v13H8zM4 16V3h12', colar: 'M8 4h8v3H8zM6 5H4v16h16V5h-2M8 12h8M8 16h5', duplicar: 'M4 4h10v10H4zM10 10h10v10H10z',
    excluir: 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7', selecionar: 'M4 4h4M12 4h4M20 4v4M20 12v4M20 20h-4M12 20H8M4 20v-4M4 12V8',
    renumerar: 'M9 3L7 21M17 3l-2 18M4 8h17M3 16h17', bloquear: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4', alinharh: 'M3 12h18M6 7h4v10H6zM14 9h4v6h-4z',
    alinharv: 'M12 3v18M7 6h10v4H7zM9 14h6v4H9z', distribuir: 'M4 3v18M20 3v18M9 8h6v8H9z', ajustar: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    foco: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5M9 9h6v6H9z', texto: 'M5 5h14M12 5v15M9 20h6', grade: 'M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18',
    cor: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-2 0-3 2-1 3-1a4 4 0 0 0 4-4c0-4.5-4-8-9-8zM7.5 11.5h.01M10 7.5h.01M15 7.5h.01',
    nomes: 'M3 12l4-5h13v10H7zM10 12h6', estilo: 'M4 4h7v7H4zM17.5 7.5m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M4 20l3.5-6 3.5 6zM14 14h7v7h-7z',
    erc: 'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5zM8 12l3 3 5-6', rastro: 'M2 12h20M12 2v20M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0',
    conector: 'M7 3v5M17 3v5M5 8h14v5a7 7 0 0 1-14 0zM12 20v2', fio: 'M3 18h6V6h12', emenda: 'M3 12h18M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
    label: 'M3 12l4-5h13v10H7z', cabo: 'M12 12m-9 0a9 5 0 1 0 18 0a9 5 0 1 0-18 0M1 9h22M1 15h22', cota: 'M3 8v8M21 8v8M3 12h18M3 12l3-2M3 12l3 2M21 12l-3-2M21 12l-3 2',
    derivacao: 'M2 12h9l5-6h6M11 12l5 6h6M11 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0', folha: 'M5 3h10l4 4v14H5zM12 11v6M9 14h6', delfolha: 'M5 3h10l4 4v14H5zM9 12l6 6M15 12l-6 6',
    fisico: 'M2 7h5l3 5h6l3-5h3M10 12l-3 6H2M16 12l3 6h3', personalizado: 'M7 3v5M17 3v5M5 8h14v5a7 7 0 0 1-14 0zM19 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
    medir: 'M3 17L17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2', usuario: 'M12 8m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0', pincel: 'M18 3l3 3-9 9-3-3zM9 12l-4 1-2 6 6-2 1-4',
    pinoapino: 'M4 6h4M4 12h4M4 18h4M16 6h4M16 12h4M16 18h4M8 6l8 6M8 12l8 6M8 18l8-12', atalhos: 'M2 6h20v12H2zM6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10',
    sobre: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 11v6M12 7.5v.01', tema: 'M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z', busca: 'M10.5 10.5m-6.5 0a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0M15.5 15.5L21 21',
    detalhe: 'M10 10m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0M14.5 14.5L21 21M7 10h6M10 7v6', etiqueta: 'M3 9h18v6H3zM7 9v6M10 12h8',
    circuito: 'M5 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M19 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M7 6h6v12h4', bom: 'M6 3h12v18H6zM9 7h6M9 11h6M9 15h4',
    livre: 'M3 19l7-7 4 3 7-9', orto: 'M4 19V9h8v6h8V5', curva: 'M3 18c5 0 4-12 9-12s4 12 9 12', arvore: 'M3 12h7l4-6h7M10 12l4 6h7', endireitar: 'M3 12h18M3 8v8M21 8v8',
    dot: 'M6 6h12v12H6z'
  };
  var K = { select: 'M5 3l12 9-5 1 3 6-2 1-3-6-4 4z', wire: P.fio, splice: P.emenda, line: 'M4 20L20 4', rect: 'M4 6h16v12H4z', circle: 'M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0',
    cable: P.cabo, dim: P.cota, brk: P.derivacao, paint: P.pincel, pdet: P.detalhe, ptag: P.etiqueta, measure: P.medir, rot: 'M20 12a8 8 0 1 1-3-6.3M20 3v5h-5',
    mx: 'M12 3v18M8 7l-5 5 5 5zM16 7l5 5-5 5z', my: 'M3 12h18M7 8l5-5 5 5zM7 16l5 5 5-5z', lock: P.bloquear, fit: P.ajustar, erc: P.erc, pdf: 'M6 2h9l5 5v15H6zM14 2v6h6',
    bTrace: P.rastro, hl: 'M3 4h18v16H3zM9 4v16', hd: 'M3 4h18v16H3zM3 15h18', hr: 'M3 4h18v16H3zM15 4v16', focus: P.foco,
    tab_wl: P.tabela, tab_bom: P.bom, tab_cn: P.conector, tab_nets: P.circuito, tab_dims: P.cota, tab_pn: P.cabo, tab_erc: P.erc };
  var R = [[/traçado livre/i, 'livre'], [/ângulo reto/i, 'orto'], [/curva suave/i, 'curva'], [/levar ramo/i, 'arvore'], [/endireitar/i, 'endireitar'], [/^novo/i, 'novo'], [/^abrir/i, 'abrir'], [/^salvar/i, 'salvar'], [/^importar/i, 'importar'], [/^exportar/i, 'exportar'], [/backup/i, 'backup'],
    [/imprimir|pdf/i, 'imprimir'], [/p[áa]gina|carimbo/i, 'pagina'], [/^desfazer/i, 'undo'], [/^refazer/i, 'redo'], [/^copiar/i, 'copiar'], [/^colar/i, 'colar'],
    [/^duplicar/i, 'duplicar'], [/excluir folha/i, 'delfolha'], [/^excluir/i, 'excluir'], [/selecionar tudo/i, 'selecionar'], [/renumerar/i, 'renumerar'],
    [/bloquear/i, 'bloquear'], [/alinhar.*horizontal/i, 'alinharh'], [/alinhar.*vertical/i, 'alinharv'], [/distribuir/i, 'distribuir'], [/ajustar/i, 'ajustar'],
    [/foco/i, 'foco'], [/cor real/i, 'cor'], [/nomes dos sinais/i, 'nomes'], [/texto/i, 'texto'], [/grade/i, 'grade'], [/estilo/i, 'estilo'], [/erc|verifica/i, 'erc'],
    [/rastro/i, 'rastro'], [/conector personalizado/i, 'personalizado'], [/pino a pino/i, 'pinoapino'], [/conector/i, 'conector'], [/^fio/i, 'fio'], [/emenda/i, 'emenda'],
    [/label/i, 'label'], [/cabo/i, 'cabo'], [/cota/i, 'cota'], [/deriva/i, 'derivacao'], [/nova folha/i, 'folha'], [/desenho f[íi]sico/i, 'fisico'], [/medir/i, 'medir'],
    [/usu[áa]rio|nome/i, 'usuario'], [/pincel/i, 'pincel'], [/atalho/i, 'atalhos'], [/sobre/i, 'sobre'], [/lista de fios/i, 'tabela'], [/bom|materiais/i, 'bom'], [/csv|lista/i, 'tabela']];
  HX.uiIcon = function (n) {
    if (K[n]) return K[n]; if (P[n]) return P[n];
    for (var i = 0; i < R.length; i++) if (R[i][0].test(n || '')) return P[R[i][1]];
    return P.dot;
  };
})(typeof window !== 'undefined' ? window : globalThis);
