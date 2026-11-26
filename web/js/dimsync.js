/* HarnessCAD - MEDIDA ENTRE CONECTORES NO ESQUEMÁTICO ⇄ DESENHO FÍSICO (v1.9.13).
   A cota do esquema (item 'dim', ferramenta D) entre dois conectores/emendas é a medida do chicote entre eles:
   - sem desenho físico: entra no cálculo dos fios (dims.js) e na geração do físico (topologia pelas cotas);
   - com desenho físico: a cada edição (dentro do mesmo passo de desfazer) a medida digitada no esquema vai para o caminho
     entre os dois nós no físico (1 ramo recebe o valor; vários → ajusta o menos compartilhado), e se o ramo for mudado
     no físico a cota do esquema passa a mostrar o novo valor. dim.lenSync guarda o último valor sincronizado. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function num(v) { var n = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isNaN(n) ? null : n; }
  /* caminho no físico entre as pontas da cota: { segs:[pseg], len } ou null */
  HX.dimPhysPath = function (p, d) { var sh = HX.physSheet && HX.physSheet(p); if (!sh || !d.a || !d.b) return null; var na = null, nb = null;
    sh.items.forEach(function (i) { if (i.type === 'pnode' && i.of === d.a) na = i.id; if (i.type === 'pnode' && i.of === d.b) nb = i.id; });
    if (!na || !nb || na === nb) return null; var r = HX.physPathLen(sh, na, nb); if (!r || !r.segs.length) return null;
    var m = HX.physIdx(sh), N = +sh.scale || 1, S = r.segs.map(function (id) { return sh.items.filter(function (i) { return i.id === id; })[0]; }).filter(Boolean);
    return { sh: sh, segs: S, len: Math.round(S.reduce(function (a, s) { return a + HX.physSegLen(s, m, N); }, 0)), m: m, N: N }; };
  /* grava L (mm) no caminho do físico; devolve true se conseguiu */
  HX.dimPhysSet = function (p, d, L) { var P = HX.dimPhysPath(p, d); if (!P) return false; var cnt = {};
    try { var LL = HX.computeLengths(p); Object.keys(LL.dims || {}).forEach(function (k) { cnt[k] = LL.dims[k].count; }); } catch (e) { /* sem contagem: o 1º */ }
    var sg = null; P.segs.forEach(function (s) { if (!sg || (cnt[s.id] || 0) <= (cnt[sg.id] || 0)) sg = s; });
    var nv = Math.round(HX.physSegLen(sg, P.m, P.N) + (L - P.len)); if (nv < 1) return false; sg.len = nv; return true; };
  /* passe de sincronização das cotas do esquema (chamado no fim de cada doc.change) */
  HX.dimSync = function (doc) { var p = doc.p; if (!HX.physSheet || !HX.physSheet(p)) return;
    p.sheets.forEach(function (S) { if (HX.isPhys(S)) return; S.items.forEach(function (d) { if (d.type !== 'dim') return; var P = HX.dimPhysPath(p, d); if (!P) return;
      var L = num(d.len), ls = num(d.lenSync);
      if (L != null && L !== ls) { if (L !== P.len) HX.dimPhysSet(p, d, L); d.lenSync = L; }  /* digitado no esquema → físico */
      else if (L == null || P.len !== L) { d.len = P.len; d.lenSync = P.len; } }); });  /* mudou no físico → esquema */
  };
  var D = HX.Doc && HX.Doc.prototype, ch0 = D && D.change;
  if (ch0) D.change = function () { var self = this, a = arguments, f = a[1]; return ch0.call(this, a[0], function () { var r = f.apply(this, arguments); try { HX.dimSync(self); } catch (e) { /* não trava a edição */ } return r; }); };
  /* cota entre dois itens do esquema sem precisar clicar (ação do conector): alinhada, acima dos dois */
  HX.dimAdd = function (doc, A, B, L) { var u = doc.p.unit, a = HX.dimAnchorOf(A, u), b = HX.dimAnchorOf(B, u); if (!a || !b) return null;
    var bA = HX.bbox(A, u), bB = HX.bbox(B, u), top = Math.min(bA.y0, bB.y0) - 8, hz = Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1]);
    var d = { type: 'dim', id: doc.uid('d'), a: A.id, b: B.id, x: a[0], y: a[1], x2: b[0], y2: b[1], orient: hz ? 'h' : 'v', off: hz ? HX.r3(top - a[1]) : HX.r3(Math.max(bA.x1, bB.x1) + 8 - a[0]),
      len: num(L) == null ? '' : num(L), tolP: '', tolM: '', text: '', showCount: true };
    return doc.add(d); };
})(typeof window !== 'undefined' ? window : globalThis);
