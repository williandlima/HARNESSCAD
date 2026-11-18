/* HarnessCAD - desenho físico: anotações automáticas (rótulos, cotas dos ramos, cota total, balões, vistas frontais,
   tabela de ligação e lista de materiais) e aplicação no projeto. Ao ATUALIZAR, tudo o que o usuário ajustou é mantido:
   imagens, tamanhos, rotações, curvas, coberturas, posições de rótulos/balões/cotas/vistas/tabelas e itens extras. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function outDir(nd, sh, m) { var d = HX.physDirAt(nd, sh, m); return d ? [-d[0], -d[1]] : [-1, 0]; }
  HX.physAnnotate = function (sh, p, opt) {
    var m = HX.physIdx(sh), N = +sh.scale || 1, out = [], uid = 0, S = HX.physSchem(p);
    function add(o) { o.id = 'A' + (uid++); out.push(o); return o; }
    var nodes = sh.items.filter(function (i) { return i.type === 'pnode'; }), segs = sh.items.filter(function (i) { return i.type === 'pseg'; });
    nodes.forEach(function (n) {
      if (n.nkind === 'virt') return;
      if (n.nkind !== 'conn') { add({ type: 'pnote', of: n.id, x: 3, y: -5, text: '' }); return; }
      var u = outDir(n, sh, m), spr = HX.physImgOf(n, S[n.of]), L = HX.physPaperLen(spr, n.size, N, sh.pstyle === 'line' ? 28 : 16), H = L * 0.6, hor = Math.abs(u[0]) >= 0.5, fw = S[n.of] ? HX.physFaceW(S[n.of], 14) : 14;
      if (hor) {
        add({ type: 'pnote', of: n.id, x: 0, y: 0, pos: 'auto', text: '' });
        if (opt.balloons !== false) add({ type: 'pball', of: n.id, x: 0, y: 0, pos: 'auto', n: '' });
        if (opt.faces) add({ type: 'pface', of: n.id, x: u[0] * (L + 10 + fw / 2), y: 0, w: 14 });
      } else {
        add({ type: 'pnote', of: n.id, x: 0, y: 0, pos: 'auto', text: '' });
        if (opt.balloons !== false) add({ type: 'pball', of: n.id, x: 0, y: 0, pos: 'auto', n: '' });
        if (opt.faces) add({ type: 'pface', of: n.id, x: -(H / 2 + 8 + fw / 2), y: u[1] * L * 0.6, w: 14 });
      }
    });
    segs.forEach(function (s) {
      add({ type: 'pdim', a: s.a, b: s.b, seg: s.id, mode: 'seg', x: 0, y: 0, off: 6, text: '', tolP: '', tolM: '' });
      if (s.cover && opt.balloons !== false) add({ type: 'pball', of: s.id, x: 0, y: 12, n: '' });
    });
    // cota total só entre conectores alinhados pelo tronco (cota inclinada cruzando o desenho não é usual)
    function straight(r, a, b) { var L = Math.hypot(b.x - a.x, b.y - a.y) || 1; return (r.segs || []).every(function (id) { var g = m[id]; return [g.a, g.b].every(function (k) { var q = m[k]; return Math.abs((b.x - a.x) * (a.y - q.y) - (a.x - q.x) * (b.y - a.y)) / L < 0.06 * L; }); }); }
    var cn = nodes.filter(function (n) { return n.nkind === 'conn'; }), best = null;
    if (segs.length > 1) cn.forEach(function (a, i) { cn.slice(i + 1).forEach(function (b) { var r = HX.physPathLen(sh, a.id, b.id); if (r && (!best || r.len > best.len) && straight(r, a, b)) best = { a: a, b: b, len: r.len }; }); });
    if (best) { var A = best.a.x <= best.b.x ? best.a : best.b, B = A === best.a ? best.b : best.a; add({ type: 'pdim', a: A.id, b: B.id, seg: '', mode: 'path', x: 0, y: 0, off: 16, text: '', tolP: '', tolM: '' }); }
    var d = HX.sheetDims(p.meta), M = HX.frameMargins(p), ys = nodes.map(function (n) { return n.y; }), y1 = Math.max.apply(0, ys.concat([0]));
    if (opt.tables !== false) {
      add({ type: 'ptable', kind: 'wiring', x: M.l + 20, y: Math.min(y1 + 32, d[1] - M.b - 75), w: 170 });
      add({ type: 'ptable', kind: 'bom', anchor: 'b', x: d[0] - M.r - 4 - 170, y: HX.usableArea(p).y1 }); /* sobre o carimbo, crescendo para cima */
    }
    return out;
  };
  function nkey(n) { return n ? n.of : ''; }
  function akey(i, m) { // chave estável de uma anotação (para manter o ajuste do usuário ao atualizar)
    if (i.type === 'pdim') { var s = m[i.seg]; return 'd:' + i.mode + ':' + (s ? (s.dim || nkey(m[s.a]) + '|' + nkey(m[s.b])) : nkey(m[i.a]) + '|' + nkey(m[i.b])); }
    if (i.type === 'ptable') return 't:' + i.kind + (i.of ? ':' + nkey(m[i.of]) : '');
    var o = m[i.of]; return i.type + ':' + (o ? (o.type === 'pseg' ? 's:' + (o.dim || nkey(m[o.a]) + '|' + nkey(m[o.b])) : o.type === 'pnode' ? nkey(o) : o.id) : '');
  }
  var KEEP = { pcov: [], pnote: ['x', 'y', 'text', 'along'], pball: ['x', 'y', 'n'], pface: ['x', 'y', 'w'], pdim: ['x', 'y', 'off', 'text', 'tolP', 'tolM'], ptable: ['x', 'y', 'w'] };
  // aplica no projeto: nova folha ou atualiza a existente
  HX.applyPhysical = function (doc, opt) {
    var p = doc.p, old = p.sheets.filter(HX.isPhys)[0], prev = {}, om = old ? HX.physIdx(old) : {};
    if (old) old.items.forEach(function (i) { if (i.type === 'pnode') prev[i.of] = i; if (i.type === 'pseg' && i.dim) prev['seg:' + i.dim] = i; });
    var r = HX.genPhysical(p, Object.assign({ prev: prev }, opt)); if (r.error) return r;
    var sh = r.sheet, idm = {}; sh.id = old ? old.id : doc.uid('s'); sh.pstyle = opt.style || (HX.SO_TECNICO === false ? (old && old.pstyle) || 'img' : 'line'); if (old && old.lineColor) sh.lineColor = old.lineColor;
    sh.items.forEach(function (i) { var n = doc.uid(i.type === 'pnode' ? 'n' : i.type === 'pseg' ? 'g' : 't'); idm[i.id] = n; i.id = n; });
    sh.items.forEach(function (i) { if (i.type === 'pseg') { i.a = idm[i.a]; i.b = idm[i.b]; var o = i.dim && prev['seg:' + i.dim]; if (o) { i.x = o.x || 0; i.y = o.y || 0; } } });
    if (old && opt.keepPos) sh.items.forEach(function (i) { var o = i.type === 'pnode' && prev[i.of]; if (o) { i.x = o.x; i.y = o.y; } });
    var faces = opt.faces != null ? opt.faces : old ? old.items.some(function (i) { return i.type === 'pface'; }) : sh.pstyle === 'line';
    var ann = HX.physAnnotate(sh, p, { faces: faces, balloons: opt.balloons, tables: opt.tables }), nm;
    ann.forEach(function (a) { a.id = doc.uid('a'); sh.items.push(a); });
    nm = HX.physIdx(sh);
    if (old) { // mantém ajustes e itens extras do usuário
      var gen = {}; ann.forEach(function (a) { gen[akey(a, nm)] = a; });
      var byOf = {}; sh.items.forEach(function (i) { if (i.type === 'pnode') byOf[i.of] = i.id; if (i.type === 'pseg') byOf['s:' + (i.dim || '')] = i.id; });
      old.items.forEach(function (i) {
        if (i.type === 'pimg' || (i.type === 'text' && !/^DESENHO FÍSICO|^Cotas em mm/.test(i.text))) { sh.items.push(i); return; }
        if (!KEEP[i.type]) return;
        var k = akey(i, om), g = gen[k];
        if (g) { KEEP[i.type].forEach(function (f) { if (i[f] !== undefined) g[f] = i[f]; }); return; }
        var c = HX.clone(i), ok = true;
        function map(f) { if (!c[f]) return; var o = om[c[f]]; if (!o) { ok = false; return; } var t = o.type === 'pnode' ? byOf[o.of] : o.type === 'pseg' ? byOf['s:' + (o.dim || '')] : o.type === 'pimg' ? o.id : null; if (t) c[f] = t; else ok = false; }
        ['of', 'a', 'b', 'seg'].forEach(map); if (ok) sh.items.push(c);
      });
    }
    var orf = HX.physBundle(p, sh).orphan; if (orf.length) r.warn.push(orf.length + ' fio(s) não roteado(s) pelo desenho físico (ponta fora dele): ' + orf.slice(0, 8).map(function (w) { return w.num; }).join(', ') + (orf.length > 8 ? '…' : ''));
    if (old) p.sheets[p.sheets.indexOf(old)] = sh; else p.sheets.push(sh);
    r.index = p.sheets.indexOf(sh);
    return r;
  };
})(typeof window !== 'undefined' ? window : globalThis);
