/* HarnessCAD - SÓ DESENHO TÉCNICO (padrão Altium), FIEL AO DATASHEET. Decisão do usuário: nada de figuras realistas
   (imagens/fotos) e nada de desenho "típico". Toda folha física sai em traço; conector, acessório ou vista frontal
   que ainda não tem desenho tirado do datasheet OFICIAL aparece como contorno tracejado "AGUARDANDO DATASHEET" (com o
   tamanho de referência, só para o leiaute), até o usuário enviar o datasheet e o desenho exato ser feito.
   Desenhos verificados (HX.DS_OK):
   • D38999/26, /24, /20 e TV01 (Amphenol) e as 53 vistas frontais vetorizadas; alívio 620-048 e botas 770-001 (Glenair);
     bota Raychem 202K/222K (TE, Ø e comprimentos da tabela);
   • Harwin M80 (catálogo Harwin); D-Sub M24308/DSUB (Amphenol D-Sub Cable Connectors). */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, V = HX.PHYS_VEC; if (!EXT.pnode || !V) return;
  var OKV = { d38_26: 1, d38_24: 1, d38_20: 1, tv01: 1, sr_s: 1, boot_s: 1, boot_90: 1, rc_202K: 1, rc_222K: 1 };
  var OKF = /^(M80|M24308|DSUB|DSUBC|DSUBW)$/;
  HX.DS_OK = { pecas: OKV, familias: OKF };
  HX.SO_TECNICO = true; function ON() { return HX.SO_TECNICO !== false; } /* false só nos testes do modo antigo */
  function fam(c) { return ((c && HX.CAT.conns[c.part]) || {}).fam || ''; }
  /* contorno "aguardando datasheet": retângulo tracejado, linha de centro e o aviso */
  HX.physPendente = function (g, x, y, W, H, nome, col, round) {
    col = col || (HX.physVecST() || {}).col || '#222';
    g.style({ stroke: col, lw: 0.2, fill: '#fff', dash: [1.2, 0.8] });
    if (round) g.circle(x + W / 2, y + H / 2, Math.min(W, H) / 2); else g.rect(x, y, W, H);
    g.style({ fill: null, dash: null }); var mir = g._mir && g._mir(); if (mir) g.push([-1, 0, 0, 1, 2 * x + W, 0]); /* texto legível em peça espelhada */
    var fs = Math.max(0.7, Math.min(1.6, H * 0.16, W / 13));
    g.text('AGUARDANDO', x + W / 2, y + H / 2 - fs * 0.7, { size: fs, bold: true, align: 'c', color: col });
    g.text('DATASHEET', x + W / 2, y + H / 2 + fs * 0.5, { size: fs, bold: true, align: 'c', color: col });
    if (nome) g.text(String(nome), x + W / 2, y + H / 2 + fs * 1.7, { size: fs * 0.6, align: 'c', color: col });
    if (mir) g.pop();
  };
  HX.PHYS_VEC_TIPICO = {};
  Object.keys(V).forEach(function (id) {
    if (OKV[id]) return; HX.PHYS_VEC_TIPICO[id] = V[id]; /* desenho típico guardado: volta quando o datasheet chegar */
    V[id] = function (g, x, y, W, H) { if (!ON()) return HX.PHYS_VEC_TIPICO[id].apply(this, arguments); HX.physPendente(g, x, y, W, H, (HX.PDS[id] || {}).n || id); };
  });
  /* montagem: sabe se a peça está espelhada (para o aviso não sair ao contrário) */
  var da0 = HX.physDrawAssembly;
  HX.physDrawAssembly = function (g) {
    var q = Object.create(g), sg = 1, P = []; q.push = function (M) { P.push(sg); if (M[0] * M[3] - M[1] * M[2] < 0) sg = -sg; return g.push(M); };
    q.pop = function () { sg = P.length ? P.pop() : 1; return g.pop(); }; q._mir = function () { return sg < 0; };
    var A = [].slice.call(arguments); A[0] = q; return da0.apply(this, A);
  };
  /* tudo em traço: folhas antigas em "imagens" ou "contorno" passam para o desenho técnico */
  var cx0 = HX.physCtx;
  HX.physCtx = function (p, s, o) {
    var sh = p && p.sheets[s]; if (ON() && sh && HX.isPhys(sh) && (!o || !o._pc || o._pcs !== s)) { if (sh.pstyle !== 'line') sh.pstyle = 'line'; if (sh.connDraw) sh.connDraw = ''; }
    return cx0.apply(this, arguments);
  };
  var vo = HX.physVecOn; HX.physVecOn = function () { return ON() || vo.apply(this, arguments); };
  var nop = function () {}, MUDO = ['style', 'line', 'poly', 'rect', 'circle', 'text', 'push', 'pop', 'image'];
  function mudo(g) { var q = Object.create(g); MUDO.forEach(function (k) { q[k] = nop; }); q.image = function () { return false; }; return q; }
  /* conector sem desenho de datasheet e sem montagem (comerciais, Micro-D, circulares genéricos): só o contorno */
  var nd0 = EXT.pnode.draw;
  EXT.pnode.draw = function (g, it, p, s, o) {
    if (it.nkind !== 'conn' || !ON()) return nd0.apply(this, arguments);
    var C = HX.physCtx(p, s, o), c = C.S[it.of], f = fam(c); if (!c || OKF.test(f)) return nd0.apply(this, arguments);
    var r = nd0.call(this, mudo(g), it, p, s, o), b = it._bb; if (!b) return r;
    if ((it._asm || []).some(function (e) { return e.conn; })) return nd0.apply(this, arguments); /* montagem: cada peça pelo V acima */
    var a = HX.physAngle ? HX.physAngle(it, C.sh.items) : 0, vert = Math.abs(Math.sin(a * Math.PI / 180)) > 0.7, W = b.x1 - b.x0, H = b.y1 - b.y0, col = C.line ? C.col : '#222';
    if (vert) { g.push([0, 1, -1, 0, (b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2]); HX.physPendente(g, -H / 2, -W / 2, H, W, c.part, col); g.pop(); }
    else HX.physPendente(g, b.x0, b.y0, W, H, c.part, col);
    return r;
  };
  /* vista frontal: só a figura oficial (D38999 vetorizada, M80, D-Sub); as demais aguardam o datasheet */
  var lf = HX.physLineFace;
  HX.physLineFace = function (g, c, x, y, w, col, imgOK, k) {
    var f = fam(c); if (!ON() || !c || OKF.test(f) || (f === 'D38999' && HX.vecImgHas && HX.vecImgHas('face:' + c.part))) return lf.apply(this, arguments);
    var b = lf.call(this, mudo(g), c, x, y, w, col, imgOK, k) || { x0: x - w / 2, y0: y - w / 2, x1: x + w / 2, y1: y + w / 2 };
    HX.physPendente(g, b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0, c.part, col, /^(D38999|MS|M8|M12|M16|M23|MINI78|XLR|COAX)/.test(f)); return b;
  };
  /* lista dos conectores da folha que aguardam datasheet (para o aviso e para pedir ao usuário) */
  HX.physPendentes = function (p, sh) {
    var S = HX.physSchem(p), out = {};
    sh.items.forEach(function (i) { var c = i.type === 'pnode' && i.nkind === 'conn' && S[i.of]; if (!c) return; var E = i._asm && i._asm.length ? i._asm : null; if (!E) try { E = HX.physAssembly(i, c, true); } catch (e) { E = null; }
      if (E && E.length) E.forEach(function (e) { if (!OKV[e.id]) out[(HX.PDS[e.id] || {}).n || e.id] = 1; });
      else if (!OKF.test(fam(c))) out[fam(c) + ' (' + c.part + ')'] = 1; });
    return Object.keys(out);
  };
})(typeof window !== 'undefined' ? window : globalThis);
(function (G) {
  'use strict';
  var HX = G.HX; if (!HX.physPendentes || !HX.applyPhysical) return;
  /* ao gerar a folha: aviso com o que ainda aguarda datasheet */
  var ap0 = HX.applyPhysical;
  HX.applyPhysical = function (doc) {
    var r = ap0.apply(this, arguments), sh = r && r.index != null && doc.p.sheets[r.index]; if (!sh || HX.SO_TECNICO === false) return r;
    var S = HX.physSchem(doc.p); sh.items.forEach(function (n) { var c = n.type === 'pnode' && n.nkind === 'conn' && S[n.of]; if (c && c.backshell && !n.backshell) n.backshell = c.backshell; }); /* periférico antigo do esquema passa para a fase física */
    var L = HX.physPendentes(doc.p, sh); if (L.length) { r.warn = r.warn || []; r.warn.push('Aguardando datasheet (desenho em contorno tracejado até chegar): ' + L.join('; ')); }
    return r;
  };
})(typeof window !== 'undefined' ? window : globalThis);
