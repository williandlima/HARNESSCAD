/* HarnessCAD - CATÁLOGO DAS ALÇAS (tamanhos e tipos). Fontes: Amphenol catálogo Backshells M85049 (mai/2012) pp. 498–501
   e 543–546; TE/Raychem 202K/222K e 382A (Molded Parts); TE RNF-100 / DR-25 (2:1); MS21919 (P-clip, Ø em 1/16").
   PN em branco = a família não tem PN único (complete no item ou salve um item novo). Adaptadores Amphenol sem figura
   vetorizada (só o Pre-Shield está desenhado) usam o tamanho real da tabela e saem "AGUARDANDO DATASHEET" no traço. */
(function (G) {
  'use strict';
  var HX = G.HX, PDS = HX.PDS, V = HX.PHYS_VEC; if (!HX.hitemAdd || !PDS) return;
  function add(k, o) { return HX.hitemAdd('h:' + k, o); }
  function br(v) { return String(Math.round(v * 100) / 100).replace('.', ','); }
  var J = [8, 10, 12, 14, 16, 18, 20, 22, 24], L = [9, 11, 13, 15, 17, 19, 21, 23, 25], SRC = 'Amphenol, catálogo Backshells M85049, p. ';
  /* ---------- Adaptadores ---------- */
  var AD = [
    ['adp60', 'MS3476', J, 'Adaptador p/ bota (Shrink Boot) M85049/60-1', 30.15, [15.67, 18.64, 21.79, 24.99, 28.24, 30.94, 34.16, 37.29, 40.46], function (s) { return 'M85049/60-1W' + s; }, 543],
    ['adp26', 'MS3476', J, 'Adaptador p/ anel de crimpagem M85049/26', 32.34, [15.67, 18.64, 21.79, 24.99, 28.24, 30.94, 34.16, 37.29, 40.46], function (s) { return 'M85049/26-1-' + s + 'W'; }, 544],
    ['adp82', 'MS3476', J, 'Adaptador band lock (cinta) M85049/82', 34.29, [22.48, 25.65, 28.83, 32.0, 35.18, 38.35, 41.53, 44.7, 47.88], function (s) { return 'M85049/82-' + (s < 10 ? '0' : '') + s + 'W03'; }, 545],
    ['adp69', 'D38999', L, 'Adaptador p/ bota (Shrink Boot) M85049/69', 18.03, [19.05, 21.59, 25.4, 29.21, 31.75, 35.56, 39.37, 41.91, 46.99], function (s) { return 'M85049/69-' + s + 'W'; }, 498],
    ['adp20', 'D38999', L, 'Adaptador p/ anel de crimpagem M85049/20', 33.02, [19.05, 21.59, 25.4, 27.94, 31.75, 35.56, 38.1, 41.91, 44.45], function (s) { return 'M85049/20-' + s + 'W'; }, 499],
    ['adp88', 'D38999', L, 'Adaptador band lock (cinta) M85049/88', 34.29, [21.82, 25.04, 29.36, 32.54, 35.71, 38.51, 41.68, 44.86, 48.03], function (s) { return 'M85049/88-' + s + 'W03'; }, 500]];
  AD.forEach(function (a) {
    var S = a[2], A = a[5], row = function (sh) { var i = S.indexOf(+sh); return i < 0 ? A[A.length - 1] : A[i]; };
    PDS[a[0]] = { n: a[3], src: SRC + a[7], kind: 'bs', ov: 0.25, l: PDS.ms_ad && PDS.ms_ad.l, L: function () { return a[4]; }, H: row, pnOf: a[6] };
    if (V && HX.physPendente) V[a[0]] = function (g, x, y, W, H) { HX.physPendente(g, x, y, W, H, a[3]); };
    S.forEach(function (s, i) { add('adapt:' + a[0] + ':' + s, { grp: 'adapt', use: 'bs', pds: a[0], n: a[3] + ' — carcaça ' + s, pn: a[6](s), mfr: 'Amphenol', desc: 'Ø A ' + br(A[i]) + ' · comprimento ' + br(a[4]), fam: a[1], shell: s, src: SRC + a[7] }); });
  });
  [['pre_j', 'MS3476', J, 'Pre-Shield reto c/ cordoalha M85049/109', 546], ['pre_l', 'D38999', L, 'Pre-Shield reto c/ cordoalha M85049/115', 501]].forEach(function (a) {
    var T = PDS[a[0]] && PDS[a[0]].pre; if (!T) return;
    a[2].forEach(function (s) { add('adapt:' + a[0] + ':' + s, { grp: 'adapt', use: 'bs', pds: a[0], n: a[3] + ' — carcaça ' + s, pn: PDS[a[0]].pnOf(s), mfr: 'Amphenol', desc: 'Ø A ' + br(T[s][0]) + ' · corpo 30,2 · cordoalha 6" · entrada ' + T[s][1] + '–' + T[s][2], fam: a[1], shell: s, src: SRC + a[4] }); });
  });
  /* ---------- Botas (TE/Raychem, material -25) ---------- */
  ['202K', '222K'].forEach(function (f) { (HX.RC_BOOT && HX.RC_BOOT[f] || []).forEach(function (r) {
    add('boot:' + r[0], { grp: 'boot', use: 'boot', pds: f === '202K' ? 'rc_202K' : 'rc_222K', n: (f === '202K' ? 'Bota reta ' : 'Bota 90° ') + r[0], pn: r[0] + '-25-0', mfr: 'TE Connectivity / Raychem',
      desc: 'H fornecido ' + br(r[1]) + ' / recuperado ' + br(r[2]) + ' · J ' + br(r[3]) + ' · comprimento ' + br(r[4]), src: 'TE Raychem, Molded Parts' }); }); });
  /* ---------- Cordoalhas (malha tubular de cobre estanhado) ---------- */
  [3, 5, 6, 8, 10, 12, 16, 20, 25, 32].forEach(function (d) { add('braid:' + d, { grp: 'braid', use: 'cover', spr: 'cov_braid', un: 'm', n: 'Cordoalha tubular cobre estanhado Ø ' + d + ' mm', pn: '', desc: 'Ø nominal (achatada ≈ ' + br(d * 1.57) + ' mm)' }); });
  /* ---------- Luvas de solda: phys_hitems4.js (tabela TE/Raychem M83519) ---------- */
  /* ---------- Transições (Y moldada, -25) ---------- */
  (HX.RC_TRANS || []).forEach(function (r) { add('trans:' + r[0], { grp: 'trans', use: 'trans', n: 'Transição Y ' + r[0], pn: r[0] + '-25-0', mfr: 'TE Connectivity / Raychem', desc: 'H ' + br(r[1]) + '/' + br(r[2]) + ' · J ' + br(r[3]) + '/' + br(r[4]) + ' · K ' + br(r[5]) + '/' + br(r[6]) + ' (forn./rec.)' }); });
  /* ---------- Capas ---------- */
  [['E', 9], ['A', 15], ['B', 25], ['C', 37], ['D', 50]].forEach(function (c) { ['metálica', 'plástica'].forEach(function (m) {
    add('cap:dsub:' + c[0] + m[0], { grp: 'cap', use: 'hood', n: 'Capa ' + m + ' D-Sub carcaça ' + c[0] + ' (' + c[1] + ' vias)', pn: '', fam: 'DSUB,DSUBC,DSUBW,M24308' }); }); });
  L.forEach(function (s) { add('cap:d38p:' + s, { grp: 'cap', use: 'acc', n: 'Tampa protetora p/ plugue D38999/33 — carcaça ' + s, pn: '', desc: 'PN pelo acabamento e corrente', fam: 'D38999', shell: s });
    add('cap:d38r:' + s, { grp: 'cap', use: 'acc', n: 'Tampa protetora p/ receptáculo D38999/32 — carcaça ' + s, pn: '', desc: 'PN pelo acabamento e corrente', fam: 'D38999', shell: s }); });
  J.forEach(function (s) { add('cap:26482:' + s, { grp: 'cap', use: 'acc', n: 'Tampa protetora MIL-DTL-26482 — carcaça ' + s, pn: '', fam: 'MS3476', shell: s }); });
  /* ---------- Kits de retenção ---------- */
  var DS = 'DSUB,DSUBC,DSUBW,M24308', MT = 'Metaltex, folha Kit de retenção para DB (KF KM), p. 13';
  add('ret:KF', { grp: 'ret', use: 'acc', lock: 'V', n: 'Kit de retenção D-Sub fêmea KF (espaçador sextavado 4-40 UNC)', pn: 'KF', mfr: 'Metaltex', fam: DS, src: MT,
    desc: 'espaçador sext. 4,75 (5,48 máx.) × 5,8 c/ rosca 4-40 UNC 7,0; porca 4,75 × 2,0; arruela Ø5,30/Ø3,25 × 1,03 e lisa Ø5,50/Ø2,95 × 0,50; latão niquelado; painel ≤ 1,2 mm; torque ≤ 0,2 N·m' });
  add('ret:KM', { grp: 'ret', use: 'acc', n: 'Kit de retenção D-Sub macho KM (parafuso 4-40 UNC c/ presilha)', pn: 'KM', mfr: 'Metaltex', fam: DS, src: MT,
    desc: 'parafuso de fenda 4-40 UNC, comprimento 8,5 (rosca 5,7), cabeça 4,0; presilha 5,0 × 5,5 (chapa 0,25); latão niquelado; painel ≤ 1,2 mm; torque ≤ 0,2 N·m' });
  [['jkm3', 'Kit parafuso-trava M3 — D-Sub'],
    ['srdsub', 'Kit alívio de tensão (braçadeira) — D-Sub'], ['clip', 'Kit clipes de retenção de contato'], ['seal', 'Kit tampões de vedação (reposição)']].forEach(function (r) { add('ret:' + r[0], { grp: 'ret', use: 'acc', n: r[1], pn: '', fam: /D-Sub/.test(r[1]) ? 'DSUB,DSUBC,DSUBW,M24308' : '' }); });
  /* ---------- Espaguetes (termo-retrátil 2:1) ---------- */
  function inch(t) { var p = t.split('-'), q = p[p.length - 1].split('/'); return (p.length > 1 ? +p[0] : 0) + (q[1] ? +q[0] / +q[1] : +q[0]); }
  [['RNF-100', 'preto', ['3/64', '1/16', '3/32', '1/8', '3/16', '1/4', '3/8', '1/2', '3/4', '1']], ['RNF-100', 'transparente', ['1/16', '3/32', '1/8', '3/16', '1/4', '3/8', '1/2', '3/4', '1']],
    ['DR-25', 'preto', ['1/8', '3/16', '1/4', '3/8', '1/2', '3/4', '1', '1-1/2', '2']]].forEach(function (f) { f[2].forEach(function (s) { var d = inch(s) * 25.4;
    add('shr:' + f[0] + ':' + f[1][0] + ':' + s, { grp: 'shr', use: 'cover', spr: 'cov_shrink', un: 'm', n: 'Termo-retrátil ' + f[0] + ' Ø' + s + '" ' + f[1], pn: f[1] === 'transparente' ? '' : f[0] + '-' + s, mfr: 'TE Connectivity / Raychem', desc: 'Ø fornecido ' + br(d) + ' / recuperado ' + br(d / 2) + ' mm (2:1)' }); }); });
  add('solsl', { grp: 'shr', use: 'acc', per: 'pin', un: 'mm', len: 10, n: 'Espaguete na solda do contato (10 mm por contato)', pn: '' });
  /* ---------- Amarração ---------- */
  [['100x2,5'], ['140x3,6'], ['200x3,6'], ['200x4,8'], ['300x4,8'], ['370x7,6']].forEach(function (t) { add('tie:' + t[0], { grp: 'tie', use: 'pacc', kind: 'tie', n: 'Abraçadeira de nylon ' + t[0] + ' mm', pn: '' }); });
  add('tie:mount', { grp: 'tie', use: 'pacc', kind: 'tiemount', shape: 'tie', n: 'Abraçadeira com base (parafuso)', pn: '' });
  add('tie:admount', { grp: 'tie', use: 'pacc', kind: 'admount', shape: 'pclip', n: 'Base adesiva p/ abraçadeira', pn: '' });
  add('tie:lacing', { grp: 'tie', use: 'pacc', kind: 'lacing', shape: 'tie', n: 'Barbante de amarração (lacing tape)', pn: '', desc: 'A-A-52081' });
  [3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24].forEach(function (n) { add('tie:pclip:' + n, { grp: 'tie', use: 'pacc', kind: 'pclip', n: 'P-clip MS21919 Ø' + br(n * 25.4 / 16) + ' mm', pn: 'MS21919WDG' + n, desc: 'Ø ' + n + '/16"' }); });
  /* ---------- Etiquetas ---------- */
  add('lbl:etiqtr', { grp: 'lbl', use: 'tag', n: 'Etiqueta sob espaguete transparente (padrão da casa)', pn: '' });
  ['1/8', '3/16', '1/4', '3/8', '1/2'].forEach(function (s) { add('lbl:tms:' + s, { grp: 'lbl', use: 'tag', n: 'Etiqueta termo-retrátil impressa Ø' + s + '"', pn: '' }); });
  add('lbl:flag', { grp: 'lbl', use: 'tag', n: 'Etiqueta bandeira adesiva', pn: '' });
  add('lbl:conn', { grp: 'lbl', use: 'acc', n: 'Etiqueta do conector', pn: '' });
})(typeof window !== 'undefined' ? window : globalThis);
