/* HarnessCAD - desenho físico: ITENS NO RAMO (pacc) posicionados por distância real a partir de uma ponta do ramo.
   Abraçadeira, P-clip, fita, ilhós/passa-fio, marcador de identificação (luva/etiqueta com texto), folga de serviço
   e laço de gotejamento (somam "extra" no comprimento dos fios que passam no ramo). Entram na lista de materiais.
   Campos: seg, end ('a'|'b' = ponta de referência), dist (mm), kind, text, pn, len (fita/marcador, mm), extra, peso, x/y (rótulo). */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, hide = HX.physHide;
  HX.PACC = {
    tie: { n: 'Abraçadeira', bom: 1 }, pclip: { n: 'P-clip / braçadeira', bom: 1 }, tape: { n: 'Fita', bom: 1, len: 25 }, grommet: { n: 'Ilhós / passa-fio', bom: 1 },
    marker: { n: 'Marcador de identificação', bom: 1, len: 20 }, loop: { n: 'Folga de serviço', extra: 100 }, drip: { n: 'Laço de gotejamento', extra: 80 }
  };
  HX.HITPR.pacc = 1.5;
  // ponto e direção do item sobre o ramo
  HX.physAccAt = function (it, sh, m, N) {
    var sg = m[it.seg]; if (!sg) return null; var P = sg._P || HX.physSegPts(sg, m); if (!P) return null;
    if (it.end === 'b') P = P.slice().reverse();
    var L = HX.physSegLen(sg, m, N) || 1, f = Math.max(0, Math.min(1, (+it.dist || 0) / L)), q = HX.polyAt(P, f);
    return { pt: q.pt, d: q.d, from: m[it.end === 'b' ? sg.b : sg.a], L: L };
  };
  HX.physSegExtra = function (sh, segId) { var x = 0; sh.items.forEach(function (i) { if (i.type === 'pacc' && i.seg === segId && (i.kind === 'loop' || i.kind === 'drip')) x += +i.extra || 0; }); return x; };
  function label(it) { var k = HX.PACC[it.kind] || {}; return (it.text || k.n || it.kind) + (it.kind === 'loop' || it.kind === 'drip' ? ' +' + (+it.extra || 0) : ''); }
  HX.physAccLabel = label;
  EXT.pacc = {
    draw: function (g, it, p, s, o) {
      var C = HX.physCtx(p, s, o), A = HX.physAccAt(it, C.sh, C.m, C.N); if (!A) return;
      var col = C.line ? C.col : (o.theme && o.theme.txt) || '#222', x = A.pt[0], y = A.pt[1], ux = A.d[0], uy = A.d[1], BU = HX.physBundleCtx(p, s, o), B = BU.seg[it.seg] || {}, w = (HX.physVisW && C.m[it.seg] ? HX.physVisW(C.m[it.seg], C.sh, BU) : HX.bundleW(B.od)) / 2 + 0.6;
      g.push([ux, uy, -uy, ux, x, y]); g.style({ stroke: col, lw: 0.3, fill: null, dash: null });
      var K = it.kind, Lp = Math.max(2.5, (+it.len || (HX.PACC[K] || {}).len || 20) / C.N); if (HX.physPinchK && C.m[it.seg]) w = (w - 0.6) * HX.physPinchK(C.m[it.seg], C.sh, K) + 0.45; // aperto no feixe sem capa
      if (K === 'tie') { g.style({ fill: col }); g.rect(-0.4, -w, 0.8, 2 * w); g.rect(-0.7, w, 1.4, 0.9); }
      else if (K === 'pclip') { g.circle(0, 0, w + 0.3); g.line(-0.9, -w - 0.3, -0.9, -w - 3); g.line(0.9, -w - 0.3, 0.9, -w - 3); g.circle(0, -w - 3.6, 0.6); }
      else if (K === 'tape') { g.rect(-Lp / 2, -w, Lp, 2 * w); for (var i = -Lp / 2; i < Lp / 2; i += 0.9) g.line(i, -w, Math.min(i + 0.9, Lp / 2), w); }
      else if (K === 'grommet') { g.style({ fill: '#fff' }); g.rect(-0.9, -w - 1.5, 0.7, 2 * w + 3); g.rect(0.2, -w - 1.5, 0.7, 2 * w + 3); }
      else if (K === 'marker') { g.style({ fill: '#fff' }); g.rect(-Lp / 2, -w, Lp, 2 * w); g.style({ fill: null }); if (it.text) g.text(it.text, 0, 0, { size: Math.min(1.6, w * 1.2), align: 'c', color: col, bold: true }); }
      else if (K === 'loop') { g.circle(0, -w - 2.2, 2.2); }
      else if (K === 'drip') { g.poly([[-2.5, -w], [-2.5, w + 3.5], [2.5, w + 3.5], [2.5, -w]], false); }
      g.pop();
      var lx = x + (it.x == null || it.x === '' ? -uy * 8 : +it.x), ly = y + (it.y == null || it.y === '' ? ux * 8 : +it.y), t1 = label(it), t2 = Math.round(+it.dist || 0) + ' de ' + ((A.from || {}).ref || 'ponta');
      if (it.showLbl === false || C.sh.accLbl === false) { hide(it, '_bb', { x0: x - w - 1, y0: y - w - 1, x1: x + w + 1, y1: y + w + 1 }); hide(it, '_pt', A.pt); hide(it, '_lp', null); return; } // rótulo oculto
      if (it.lblTxt) t1 = it.lblTxt; if (it.lblSub != null && it.lblSub !== '') t2 = it.lblSub;
      var side = Math.abs(lx - x) > Math.abs(ly - y), al = side ? (lx < x ? 'r' : 'l') : 'c', tw = Math.max(HX.textW(t1, 1.7), HX.textW(t2, 1.5)) + 1;
      var ex = side ? lx + (lx < x ? 0.8 : -0.8) : lx, ey = side ? ly + 0.7 : (ly > y ? ly - 2.3 : ly + 3.1); // a linha de chamada para na borda do texto
      g.style({ stroke: col, lw: 0.15, dash: null }); g.line(x, y, ex, ey);
      g.text(t1, lx, ly - 0.4, { size: 1.7, align: al, color: col, bold: true }); g.text(t2, lx, ly + 1.9, { size: 1.5, align: al, color: col });
      var bx0 = al === 'c' ? lx - tw / 2 : al === 'r' ? lx - tw : lx, bx1 = bx0 + tw;
      hide(it, '_bb', { x0: Math.min(x - w - 1, bx0), y0: Math.min(y - w - 4, ly - 2.4), x1: Math.max(x + w + 1, bx1), y1: Math.max(y + w + 4, ly + 3) }); hide(it, '_pt', A.pt); hide(it, '_lp', [lx, ly]);
    },
    bbox: function (it) { return it._bb || { x0: 0, y0: 0, x1: 0, y1: 0 }; },
    hit: function (it, pt) { var a = it._pt, l = it._lp; if (!a) return 1e9; return Math.min(Math.hypot(pt[0] - a[0], pt[1] - a[1]) - 2, l ? Math.hypot(pt[0] - l[0], pt[1] - l[1]) - 3 : 1e9); }
  };
  // novo item no meio do ramo
  HX.physAddAcc = function (doc, sg, kind) {
    var sh = doc.cur(), m = HX.physIdx(sh), L = HX.physSegLen(sg, m, +sh.scale || 1), k = HX.PACC[kind] || {};
    var it = { type: 'pacc', id: doc.uid('c'), seg: sg.id, end: 'a', dist: Math.round(L / 2), kind: kind, text: '', pn: '', len: k.len || '', extra: k.extra || '', peso: '', x: 0, y: 8 }, A = HX.physAccAt(it, sh, m, +sh.scale || 1);
    if (A) { it.x = HX.r3(-A.d[1] * 8); it.y = HX.r3(A.d[0] * 8); } return doc.add(it);
  };
  // lista de materiais: itens do ramo + backshell / boot / alívio de tensão do nó
  var bom = HX.physBom;
  HX.physBom = function (p, sh) {
    var B = bom(p, sh); B.assoc = B.assoc || {};
    function add(k, pn, desc, q, un, nd) { var r = B.key[k]; if (!r) { r = { k: k, pn: pn, desc: desc, qty: 0, un: un || 'pç' }; B.rows.push(r); B.key[k] = r; } r.qty = Math.round((r.qty + q) * 100) / 100; if (nd) { var a = B.assoc[nd] = B.assoc[nd] || []; if (a.indexOf(k) < 0) a.push(k); } }
    sh.items.forEach(function (i) {
      if (i.type === 'pacc') { var K = HX.PACC[i.kind] || {}; if (!K.bom) return; if (i.kind === 'tape') add('x:tape:' + (i.pn || ''), i.pn || '', K.n, (+i.len || K.len) / 1000, 'm'); else if (i.kind === 'marker') add('x:marker:' + (i.pn || ''), i.pn || '', K.n, 1); else add('x:' + i.kind + ':' + (i.pn || ''), i.pn || '', K.n, 1); }
      if (i.type === 'pnode' && i.nkind === 'conn') [['backshell', 'Backshell'], ['boot', 'Boot'], ['strain', 'Alívio de tensão']].forEach(function (f) { if (i[f[0]]) add('b:' + i[f[0]], i[f[0]], f[1], 1, 'pç', i.id); });
    });
    B.rows.forEach(function (r, j) { r.n = j + 1; });
    return B;
  };
  var ik = HX.physItemKey;
  HX.physItemKey = function (p, it, m) { if (it.type === 'pacc') return it.kind === 'tape' ? 'x:tape:' + (it.pn || '') : 'x:' + it.kind + ':' + (it.pn || ''); return ik(p, it, m); };
  var an = HX.physAnchor;
  HX.physAnchor = function (it, m) { return it && it.type === 'pacc' ? it._pt || null : an(it, m); };
  // marcadores: lista para impressão de etiquetas
  HX.physMarkers = function (sh) { var m = HX.physIdx(sh); return sh.items.filter(function (i) { return i.type === 'pacc' && i.kind === 'marker'; }).map(function (i) { var sg = m[i.seg] || {}, f = m[i.end === 'b' ? sg.b : sg.a] || {}; return { text: i.text || '', pn: i.pn || '', dist: +i.dist || 0, from: f.ref || '' }; }); };
})(typeof window !== 'undefined' ? window : globalThis);
