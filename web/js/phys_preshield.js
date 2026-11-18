/* HarnessCAD - ADAPTADOR PRE-SHIELD (Amphenol, "Pre-Shield Adapter", reto, acoplamento spin): o adaptador da prancha da
   casa — sai de fábrica com a CORDOALHA de cobre (6" = 152,4 mm), que é soldada na cordoalha do cabo com a luva de solda;
   a bota agarra na ranhura do corpo e cobre a emenda. Desenho = traço VETORIAL OFICIAL do catálogo Amphenol Backshells
   M85049 (mai/2012), pp. 546 (família J: M85049/109, MS3476) e 501 (família L: M85049/115, D38999 III), VISTA EXTERNA
   (metade sem corte, espelhada). Mesma figura para todas as carcaças, só muda a proporção (tabelas do catálogo):
   corpo 1,19 máx (30,2) da referência do conector ao fim do corpo; Ø A máx da porca; cordoalha Ø Z máx no início e
   Ø W pela entrada (entry size: padrão = a maior permitida na carcaça; nó: preEntry). */
(function (G) {
  'use strict';
  var HX = G.HX, V = HX.PHYS_VEC, PDS = HX.PDS; if (!V || !PDS) return;
  /* carcaça: [Ø A máx mm, entrada mín, entrada máx] — TABLE-A */
  var TJ = { 8: [22.48, 1, 1], 10: [25.65, 1, 3], 12: [28.83, 1, 5], 14: [32.0, 2, 6], 16: [35.18, 4, 8], 18: [38.35, 5, 9], 20: [41.53, 7, 11], 22: [44.7, 9, 13], 24: [47.88, 11, 14] };
  var TL = { 9: [21.84, 1, 1], 11: [24.89, 1, 3], 13: [29.46, 1, 5], 15: [32.51, 3, 7], 17: [35.81, 5, 9], 19: [38.61, 6, 10], 21: [41.66, 8, 12], 23: [44.96, 9, 13], 25: [48.01, 10, 14] };
  /* entrada: [Ø W mm, Ø Z máx mm] — TABLE-B */
  var TB = [0, [6.35, 14.22], [7.92, 16.0], [9.53, 17.53], [11.13, 19.05], [12.7, 20.83], [14.27, 22.61], [15.88, 24.13], [17.48, 25.91], [19.05, 27.18],
    [20.62, 28.7], [22.23, 30.23], [23.83, 32.0], [25.4, 33.53], [28.58, 37.34]];
  HX.PRESHIELD = { J: TJ, L: TL, B: TB };
  var D = 'o167,27 140,0|o167,60 107,0|o167,93 74,0|o167,126 74,32|o167,158 74,65|o167,191 74,98|o167,224 74,131|o167,256 74,163|o167,289 74,196|o167,322 74,229|o167,354 74,261|o146,366 74,294|o114,366 74,327|o81,366 74,359|o156,366 167,356|o124,366 167,323|o91,366 167,290|o74,351 167,258|o74,318 167,225|o74,285 167,192|o74,253 167,159|o74,220 167,127|o74,187 167,94|o74,155 167,61|o74,122 167,29|o74,89 163,0|o74,56 130,0|o74,24 98,0|o181,356 181,0|o167,366 167,0|o74,366 74,0|o240,344 240,0|o60,356 60,0|o0,0 0,344|o74,366 60,356|o0,344 1,346 1,348 3,351 4,352 6,354 8,355 10,356 13,356|o13,356 60,356|o228,356 231,356 233,355 235,354 237,352 238,351 240,348 240,346 240,344|o181,356 228,356|o167,366 181,356|o74,366 167,366|t1250,7 1243,0|t1250,25 1225,0|t1250,43 1207,0|t1250,61 1188,0|t1250,80 1170,0|t1250,98 1152,0|t1250,116 1134,0|t1250,134 1116,0|t1250,152 1098,0|t1250,171 1080,0|t1250,189 1066,4|t1243,200 1066,23|t1225,200 1066,41|t1207,200 1066,59|t1189,200 1066,77|t1176,206 1066,95|t1164,212 1066,113|t1152,218 1066,132|t1140,224 1066,150|t1128,231 1066,168|t1116,237 1066,186|t1104,243 1066,204|t1089,246 1066,222|t1242,200 1250,192|t1224,200 1250,174|t1206,200 1250,156|t1187,201 1250,138|t1150,220 1250,119|t1113,239 1250,101|t1087,246 1250,83|t1074,241 1250,65|t1066,231 1250,47|t1066,213 1250,29|t1066,195 1250,10|t1066,177 1242,0|t1066,158 1224,0|t1066,140 1206,0|t1066,122 1188,0|t1066,104 1170,0|t1066,86 1151,0|t1066,68 1133,0|t1066,49 1115,0|t1066,31 1097,0|t1066,13 1079,0|o240,321 264,321|o264,321 281,296|o281,0 281,296|o264,321 264,0|o200,199 201,200 201,201 202,202 204,203 206,204 208,204 210,205 212,205 215,205 217,204 219,204 220,203 222,202 223,201 224,200 224,199 224,197 223,196 222,195 220,194 219,194 217,193 215,193 212,192 210,193 208,193 206,194 204,194 202,195 201,196 201,197 200,199|o281,260 810,260|o810,260 829,241|o829,223 891,223|o829,241 829,0|o891,0 891,259|o891,259 917,259|o917,259 917,0|o1066,234 1068,238 1071,242 1075,245 1080,247 1084,248 1089,248 1094,248 1099,246 1099,246 1101,245 1102,244 1102,244|o1101,244 1188,200|o917,234 931,234|o1045,234 1066,234|o1188,200 1250,200|o931,259 1045,259|o931,0 931,259|o1045,259 1045,0|o1066,234 1066,0|o810,260 810,0';
  var S0 = null; function segs() { return S0 || (S0 = D.split('|').map(function (s) { return { t: s[0], p: s.slice(1).split(' ').map(function (q) { var a = q.split(','); return [+a[0] / 10, +a[1] / 10]; }) }; })); }
  var MM = 30.2 / 104, UE = 125, UB = 106.5, RA = 36.6, RW = 20, RZ = 24.4, UG = 82.9; /* mm por ponto; fim; início da cordoalha; raios; ranhura da bota */
  var OUT = [[0, 34.4], [1.3, 35.6], [6, 35.6], [7.4, 36.6], [16.7, 36.6], [18.1, 35.6], [22.8, 35.6], [24, 34.4], [24, 32.1], [26.4, 32.1], [28.1, 29.6], [28.1, 26], [81, 26],
    [82.9, 24.1], [82.9, 22.3], [89.1, 22.3], [89.1, 25.9], [91.7, 25.9], [91.7, 23.4], [93.1, 23.4], [93.1, 25.9], [104.5, 25.9], [104.5, 23.4], [106.6, 23.4], [110.2, 24.4], [118.8, 20], [125, 20]]; /* contorno externo (figura) */
  function row(T, sh) { var k = Object.keys(T).map(Number).filter(function (s) { return s >= (+sh || 0); })[0]; return T[k || Object.keys(T).pop()]; }
  function shellK(T, sh) { return Object.keys(T).map(Number).filter(function (s) { return s >= (+sh || 0); })[0] || +Object.keys(T).pop(); }
  HX.preEntry = function (T, sh, want) { var r = row(T, sh); return Math.max(r[1], Math.min(r[2], +want || r[2])); };
  function mk(id, T, slash, n) {
    PDS[id] = { n: n, src: 'Amphenol, catálogo Backshells M85049, p. ' + (slash === 109 ? 546 : 501) + ' (M85049/' + slash + ')', kind: 'bs', ov: 8 / UE, pre: T, l: PDS.ms_ad && PDS.ms_ad.l,
      L: function () { return Math.round(UE * MM * 100) / 100; }, H: function (sh) { return row(T, sh)[0]; },
      pnOf: function (sh, ent) { var s = shellK(T, sh); return 'M85049/' + slash + '-' + (s < 10 ? '0' : '') + s + 'TW' + ('0' + HX.preEntry(T, sh, ent)).slice(-2) + '-6'; } };
  }
  mk('pre_j', TJ, 109, 'Adaptador Pre-Shield reto c/ cordoalha (MIL-DTL-26482 Sér. 2)');
  mk('pre_l', TL, 115, 'Adaptador Pre-Shield reto c/ cordoalha (MIL-DTL-38999 III)');
  /* desenho: figura oficial; caixa W × H = comprimento × Ø A; a entrada vem de HX._preEnt (montagem) */
  function draw(T) { return function (g, x, y, W, H) {
    var st = HX.physVecST() || { col: '#222' }, c = y + H / 2, kx = W / (UE * MM), A = H / W * UE * MM, sh = Object.keys(T).reduce(function (m, s) { return Math.abs(T[s][0] - A) < Math.abs(T[m][0] - A) ? s : m; }, Object.keys(T)[0]);
    var e = TB[HX.preEntry(T, sh, HX._preEnt)] || TB[1], a = A / 2 / RA, w = e[0] / 2 / RW, z = (e[1] - e[0]) / 2 / (RZ - RW), k = H / A;
    function R(u, v) { return u >= UB ? (v <= RW ? v * w : e[0] / 2 + (v - RW) * z) : v * a; }
    var SIL = OUT.map(function (q) { return [x + q[0] * MM * kx, c - R(q[0], q[1]) * k]; }); /* silhueta branca: esconde a rosca do conector sob a porca */
    g.style({ stroke: st.col, lw: 0.01, fill: '#fff', dash: null }); g.poly(SIL.concat(SIL.map(function (q) { return [q[0], 2 * c - q[1]]; }).reverse()), true); g.style({ fill: null });
    [1, -1].forEach(function (sg) { segs().forEach(function (s) {
      g.style({ stroke: st.col, lw: s.t === 'o' ? 0.25 : 0.1, fill: null, dash: null });
      g.poly(s.p.map(function (q) { return [x + q[0] * MM * kx, c + sg * R(q[0], q[1]) * k]; }), false); }); });
    g.style({ stroke: st.col, lw: 0.15 }); g.line(x + W, c - e[0] / 2 * k, x + W, c + e[0] / 2 * k); /* corte da cordoalha (continua sob a bota) */
    if (HX.vaAxis) HX.vaAxis(g, x - 1, x + W + 1, c);
  }; }
  V.pre_j = draw(TJ); V.pre_l = draw(TL);
  HX.PRE_GROOVE = UG * MM;
  /* Ø do corpo (onde a bota passa e agarra): 26,0/36,6 do Ø A na figura; carcaça par = família J, ímpar = L */
  HX.msAdOD = function (sh) { var T = (+sh) % 2 ? TL : TJ; return Math.round(row(T, sh)[0] * 26 / RA * 10) / 10; };
  /* montagem: entrada do nó; bota com o lábio na ranhura do corpo, cobrindo a cordoalha */
  /* início da rosca de acessório (fração do comprimento do conector, medida nas figuras oficiais): a porca do adaptador
     rosqueia a partir daí e cobre rosca e gromete */
  var OVC = { ms3476: 23.0 / 36.07, d38_26: 22.85 / 31.9, d38_24: 24.5 / 32.5, d38_20: 22.8 / 31.5, tv01: 22.8 / 31.5 };
  var as0 = HX.physAssembly;
  HX.physAssembly = function (nd, c, line) {
    var E = as0.apply(this, arguments); if (!E) return E; HX._preEnt = nd && nd.preEntry;
    E.forEach(function (e, i) { var cn = E[i + 1]; if (/^pre_/.test(e.id) && cn && cn.conn && OVC[cn.id]) e.ov = Math.min(0.6, (cn.L - OVC[cn.id] * cn.L) / e.L); });
    E.forEach(function (e, i) { var ad = E[i + 1]; if (e.id === 'rc_202K' && ad && /^pre_/.test(ad.id)) e.ov = Math.min(0.6, (ad.L - UG * MM) / e.L); });
    return E;
  }; /* posição da ranhura da bota a partir da frente da porca (mm) */
  if (HX.DS_OK) { HX.DS_OK.pecas.pre_j = 1; HX.DS_OK.pecas.pre_l = 1; }
})(typeof window !== 'undefined' ? window : globalThis);
