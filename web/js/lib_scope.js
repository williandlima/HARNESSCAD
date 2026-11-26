/* HarnessCAD - ESCOPO DA BIBLIOTECA (v1.9.11, decisão do usuário): no catálogo só ficam as famílias com VISTA FRONTAL e
   DESENHO tirados do datasheet oficial — as que a empresa usa (85%): D38999, MS3470/3471/3474/3476, D-Sub, M80 Harwin —
   mais Equipamentos e Componentes discretos (não são conectores). As demais (sem datasheet) saem do catálogo, da pesquisa
   e da lista de fiação; projetos antigos que já as usam continuam abrindo (a definição fica só para isso).
   D38999: só os estilos com desenho do datasheet (/26, /20, /24); os herméticos /21 /23 /25 /27 saem.
   HX.libStatus(chave) diz o que a peça tem (vista, desenho, fonte) — usado pelo catálogo e pelas Propriedades. */
(function (G) {
  'use strict';
  var HX = G.HX;
  var D = 'Datasheet oficial';
  HX.LIB_FAMS = [
    { id: 'D38999', nome: 'D38999 (MIL-DTL-38999 Série III)', fams: ['D38999'], alias: 'd38999 38999 d38 tv mil-dtl-38999 serie iii amphenol circular baioneta rosca', vista: '53 arranjos vetorizados do catálogo Amphenol', des: 'estilos /26 plugue, /20 flange, /24 porca' },
    { id: 'MS34', nome: 'MS3470 / MS3476 (MIL-DTL-26482 Série 2)', fams: ['MS3476'], alias: 'ms3476 ms3470 ms3471 ms3474 3476 3470 3471 3474 26482 serie 2 ms34 matrix amphenol', vista: '34 arranjos do catálogo Amphenol Matrix', des: 'plugue MS3476, receptáculos MS3470 / MS3471 / MS3474' },
    { id: 'DSUB', nome: 'D-Sub (M24308 e comercial)', fams: ['M24308', 'DSUB', 'DSUBC', 'DSUBW'], alias: 'dsub d-sub sub-d db de da dc dd db9 db15 db25 db37 db50 de9 de-9 hd vga m24308 combo coax potencia', vista: 'Amphenol D-Sub', des: 'Amphenol D-Sub Cable Connectors' },
    { id: 'M80', nome: 'M80 Harwin (Datamate)', fams: ['M80'], alias: 'm80 harwin datamate 2mm', vista: 'catálogo Harwin', des: 'catálogo Harwin' },
    { id: 'EQUIP', nome: 'Equipamentos', fams: ['EQUIP'], alias: 'equipamento fonte modulo instrumento', na: true },
    { id: 'DISC', nome: 'Componentes discretos', fams: ['DISC'], alias: 'resistor diodo fusivel capacitor rele discreto', na: true }
  ];
  var BY = {}; HX.LIB_FAMS.forEach(function (g) { g.fams.forEach(function (f) { BY[f] = g; }); });
  HX.libGroup = function (fam) { return BY[fam] || null; };
  HX.libFamOk = function (fam) { return !!BY[fam]; };
  HX.LIB_D38_STYLES = ['26', '20', '24'];
  var F38 = HX.CAT && HX.CAT.fams.D38999; if (F38 && F38.variants) { F38.allVariants = F38.variants; F38.variants = F38.variants.filter(function (v) { return HX.LIB_D38_STYLES.indexOf(v.v) >= 0; }); }
  /* o que a peça tem: vista frontal, desenho lateral, fonte (null = não se aplica: equipamento/discreto) */
  HX.libStatus = function (key, project) {
    var e = (HX.getConnDef && HX.getConnDef(key, project)) || HX.CAT.conns[key] || null; if (!e) return { ok: false, face: false, side: false, fora: true };
    var g = BY[e.fam];
    if (!g) return /^u_|^USR/.test(key) || (project && project.library && project.library.conns[key]) ? { ok: false, face: !!(HX.FACE_USER && HX.FACE_USER[key]), side: false, user: true, txt: 'Peça do usuário' }
      : { ok: false, face: false, side: false, fora: true, txt: 'Fora da biblioteca: sem vista e desenho do datasheet' };
    if (g.na) return { ok: true, na: true, face: null, side: null, txt: g.nome };
    var face = e.fam === 'D38999' ? !!(HX.vecImgHas && HX.vecImgHas('face:' + key)) : e.fam === 'MS3476' ? !!(HX.ms34Face && HX.ms34Face(e.ins || key.split(':')[1])) : true;
    return { ok: face, face: face, side: true, grupo: g.id, vista: g.vista, des: g.des, txt: D + ' — vista: ' + g.vista + ' · desenho: ' + g.des };
  };
  /* catálogo e pesquisa: só as famílias da biblioteca (e a biblioteca do usuário); filtro "F:<grupo>" */
  function na(x) { return String(x == null ? '' : x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  HX.searchConns = function (q, std, project) {
    var t = na(q || '').replace(/(\d+)\s*(vias|via|pinos|pino|p|v)\b/g, '$1v').split(/\s+/).filter(Boolean), gf = /^F:/.test(std || '') ? std.slice(2) : '';
    var r = HX.allConns(project).filter(function (e) { var g = BY[e.fam], user = !g && project && project.library && project.library.conns[e.key];
      if (!g && !user) return false; if (gf === 'USER' ? !user : gf && (!g || g.id !== gf)) return false; if (std && !gf && std !== 'ALL' && e.std !== std) return false;
      var parts = na(e.key + ' ' + e.label).split(/[^a-z0-9]+/), s = na(e.key + ' ' + e.desc + ' ' + (e.mfr || '') + ' ' + (g ? g.alias : 'usuario minha biblioteca'));
      return t.every(function (w) { var m = /^(\d+)v$/.exec(w); if (m) return String(e.n) === m[1];
        if (/^\d{1,2}$/.test(w)) return String(e.n) === w || parts.indexOf(w) >= 0; /* nº curto: vias, carcaça ou arranjo; longo (38999, 3476): família */ return s.indexOf(w) >= 0 || na(e.key).replace(/[^a-z0-9]/g, '').indexOf(w.replace(/[^a-z0-9]/g, '')) >= 0; }); });
    /* relevância: termo que bate na própria peça (db25 → DB-25, 2x5 → M80 2x5) vale mais que o apelido da família */
    function sc(e) { var k = na(e.key + ' ' + e.label).replace(/[^a-z0-9 ]/g, ''), kc = k.replace(/ /g, ''), z = 0; t.forEach(function (w) { var c = w.replace(/[^a-z0-9]/g, ''); if (c && kc.indexOf(c) >= 0) z += 10 + (k.split(' ').indexOf(c) >= 0 ? 5 : 0); }); return z; }
    var ord = {}; HX.LIB_FAMS.forEach(function (g, i) { ord[g.id] = i; });
    return r.sort(function (a, b) { var ga = BY[a.fam], gb = BY[b.fam], oa = ga ? ord[ga.id] : 99, ob = gb ? ord[gb.id] : 99; return sc(b) - sc(a) || oa - ob || (a.fam < b.fam ? -1 : a.fam > b.fam ? 1 : 0) || (HX.natCmp ? HX.natCmp(a.key, b.key) : a.key < b.key ? -1 : 1); });
  };
  /* lista de fiação: "J4 = PEÇA" só com peça da biblioteca */
  var wp0 = HX.wtParse;
  if (wp0) HX.wtParse = function (doc) { var out = wp0.apply(this, arguments);
    out.conns = out.conns.filter(function (c) { var d = HX.getConnDef(c.part, doc.p); if (!d || HX.libFamOk(d.fam) || (doc.p.library && doc.p.library.conns[c.part])) return true;
      out.errors.push({ line: c.line, msg: '"' + c.part + '" é de uma família fora da biblioteca (sem vista e desenho do datasheet). Use D38999, MS3470/3476, D-Sub ou M80.' }); return false; });
    return out; };
})(typeof window !== 'undefined' ? window : globalThis);
