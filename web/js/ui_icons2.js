/* HarnessCAD - ÍCONES NOVOS (v1.9.7): desenho mais claro do que cada ferramenta faz — conector com pinos, fio com as pontas,
   emenda com a bolinha unindo duas vias numa só, label em bandeira, nome da via (pino + "A"), cabo trançado com o oval,
   blindagem com o dreno à terra, cota com setas… Substitui os antigos em todo lugar (faixa, barra ativa, ações), pelo
   nome ou pelo desenho antigo. HX.ICON_NEW[nome]; HX.iconFor(texto) acha o ícone pelo rótulo do botão. */
(function (G) {
  'use strict';
  var HX = G.HX; if (!HX.uiIcon) return;
  function c(x, y, r) { return 'M' + (x - r) + ' ' + y + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0'; }
  var N = HX.ICON_NEW = {
    select: 'M5 3l13 8.5-6 1.2 3.4 6.3-2.2 1.2-3.4-6.4L5 18z',
    conector: 'M4 4h8v16H4zM12 7.5h7M12 12h7M12 16.5h7M6.5 7.5h3M6.5 12h3M6.5 16.5h3' + c(19.5, 7.5, 1) + c(19.5, 16.5, 1),
    fio: 'M4 18h6V6h10' + c(3, 18, 1.5) + c(21, 6, 1.5),
    emenda: 'M2 6h5l5 6M2 18h5l5-6M12 12h10' + c(12, 12, 2.2) + c(12, 12, 1),
    label: 'M2 12h4M6 7.5h10.5L21 12l-4.5 4.5H6z',
    nomes: 'M2 12h6' + c(9.5, 12, 1.5) + 'M13 18l3.5-12L20 18M14.2 14h4.6',
    cabo: 'M2 8c4 0 6 8 10 8s6-8 10-8M2 16c4 0 6-8 10-8s6 8 10 8M12 3.5a2.6 8.5 0 1 0 0 17a2.6 8.5 0 1 0 0-17',
    blindagem: 'M2 8h20M2 14h20M12 3a3 7.5 0 1 0 0 15a3 7.5 0 1 0 0-15M12 18v3M8.5 21h7M10 23h4',
    texto: 'M5 5h14M12 5v14M9 19h6M5 5v2M19 5v2',
    pinoapino: 'M2 4h5v16H2M22 4h-5v16h5M7 8h10M7 16h10' + c(7, 8, 1) + c(17, 8, 1) + c(7, 16, 1) + c(17, 16, 1),
    tabela: 'M4 3h16v18H4zM4 8h16M4 13h16M4 18h16M10 3v18',
    erc: 'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5zM8 12l3 3 5-6',
    fisico: 'M2 9h3v6H2zM5 12h6l4-5h4M11 12l4 5h4M19 5h3v4h-3zM19 15h3v4h-3z',
    derivacao: 'M2 12h20M12 12l6 7' + c(12, 12, 1.6),
    cota: 'M3 6v12M21 6v12M3 12h18M3 12l3.5-2.5M3 12l3.5 2.5M21 12l-3.5-2.5M21 12l-3.5 2.5',
    cotalivre: 'M4 20L20 4M4 20l1.2-4.4M4 20l4.4-1.2M20 4l-4.4 1.2M20 4l-1.2 4.4M14 18h6',
    balao: c(10, 9, 6) + 'M8 9h4M14.3 13.3L21 20',
    etiqueta: 'M3 7h12l6 5-6 5H3zM7 12h5',
    detalhe: c(10, 10, 6.5) + 'M14.8 14.8L21 21M7 10h6M10 7v6',
    catdet: 'M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z',
    itens: 'M2 7h6v10H2zM8 9l7 1.5v3L8 15M15 12h7M17 9.5v5M20 9.5v5',
    atualizar: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5',
    posicao: 'M12 2v20M2 12h20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3',
    comprimento: 'M3 9h18v6H3zM7 9v3M11 9v3M15 9v3M19 9v3',
    editar: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
    girar: 'M20 12a8 8 0 1 1-3-6.3M20 3v5h-5', espelhar: 'M12 3v18M8 7l-5 5 5 5zM16 7l5 5-5 5z',
    excluir: 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7'
  };
  var ALIAS = { wire: 'fio', splice: 'emenda', cable: 'blindagem', text: 'texto', dim: 'cota', brk: 'derivacao', pdet: 'detalhe', ptag: 'etiqueta', circuito: 'balao' };
  /* rótulo do botão → ícone */
  var RX = [[/^selecionar$|^select/i, 'select'], [/nome.? das vias/i, 'nomes'], [/cabo nos pinos|transformar em cabo|trocar o modelo do cabo/i, 'cabo'], [/blindagem/i, 'blindagem'],
    [/pino a pino/i, 'pinoapino'], [/lista de fia/i, 'tabela'], [/itens da cablagem/i, 'itens'], [/cat[aá]logo de detalhes/i, 'catdet'], [/^conector(?! personalizado)|conector do cat/i, 'conector'],
    [/^fio\b/i, 'fio'], [/emenda/i, 'emenda'], [/label/i, 'label'], [/^texto/i, 'texto'], [/verifica|erc/i, 'erc'], [/gerar desenho f|atualizar a partir/i, 'fisico'],
    [/deriva/i, 'derivacao'], [/cota livre/i, 'cotalivre'], [/cota/i, 'cota'], [/bal[aã]o/i, 'balao'], [/etiqueta/i, 'etiqueta'], [/^detalhe/i, 'detalhe'],
    [/posi[cç][aã]o/i, 'posicao'], [/comprimento/i, 'comprimento'], [/girar/i, 'girar'], [/espelhar/i, 'espelhar'], [/^excluir$/i, 'excluir'], [/renomear|editar|identifica/i, 'editar']];
  HX.iconFor = function (t) { for (var i = 0; i < RX.length; i++) if (RX[i][0].test(String(t || ''))) return N[RX[i][1]]; return null; };
  var u0 = HX.uiIcon, REV = {};
  Object.keys(N).forEach(function (k) { var o = u0(k); if (o && o !== u0('dot')) REV[o] = N[k]; });
  Object.keys(ALIAS).forEach(function (k) { REV[u0(k)] = N[ALIAS[k]]; });
  HX.uiIcon = function (n) { if (N[n]) return N[n]; if (ALIAS[n]) return N[ALIAS[n]]; var f = HX.iconFor(n); if (f) return f; var r = u0(n); return REV[r] || r; };
})(typeof window !== 'undefined' ? window : globalThis);
