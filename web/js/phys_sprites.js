/* HarnessCAD - imagens do desenho físico (recortes do painel de referência, fundo transparente).
   Cada imagem: vista lateral com o lado de engate à ESQUERDA e a saída do cabo à DIREITA (ey = altura da saída, 0..1).
   len = comprimento nominal (mm) usado para desenhar em escala (imagem ilustrativa). */
(function (G) {
  'use strict';
  var HX = G.HX;
  var NAMES = {"mil_plug": "Plugue circular MIL (38999)", "ms_plug": "Plugue circular MS (5015)", "mil_recep_kn": "Receptáculo circular de caixa", "mil_plug_hex": "Plugue circular (26482/3476)", "mil_recep_jam": "Receptáculo porca (jam nut)", "mil_recep_wall": "Receptáculo flange (parede) c/ bota", "mil_recep_inline": "Receptáculo de cabo (inline)", "mil_recep_jam_boot": "Receptáculo porca c/ bota", "mil_recep_pcb": "Receptáculo hermético / solda", "mil_plug_boot": "Plugue circular c/ bota", "dsub_bs": "D-Sub c/ backshell", "dsub_face": "D-Sub (vista frontal)", "microd_bs": "Micro-D c/ backshell", "dsub_bs45": "D-Sub c/ backshell 45°", "dsub_bs_blk": "D-Sub c/ backshell plástico", "circ_small_cbl": "Circular pequeno c/ cabo", "cbl_braid": "Cabo blindado (malha)", "cbl_4w": "Cabo 4 vias (decapado)", "cbl_4w_b": "Cabo 4 vias curto", "cbl_6w": "Cabo 6 vias (decapado)", "bnc": "Coaxial BNC", "term_ring": "Terminal olhal isolado", "term_spade": "Terminal forquilha isolado", "tnc": "Coaxial TNC / N", "term_bullet": "Terminal pino (bullet)", "term_faston": "Terminal faston fêmea", "sma": "Coaxial SMA", "sma_ra": "Coaxial SMA 90°", "lemo": "Circular push-pull", "m12": "Circular M12/M8", "term_lug": "Terminal tubular (olhal sem isolação)", "tie_blk": "Abraçadeira preta", "tie_wht": "Abraçadeira natural", "tie_mount": "Base p/ abraçadeira", "mount_tab": "Suporte c/ furo", "cov_conduit": "Conduíte corrugado", "cov_braid": "Malha (sleeve)", "cov_shrink": "Termocontrátil", "cov_spiral": "Espiral", "pclip": "Clip P (nylon)", "clamp_blk": "Presilha c/ parafuso", "saddle": "Abraçadeira metálica (omega)", "grommet": "Passa-fio (grommet)"};
  var D = 'mil_plug:162:99:0.49:55:conn ms_plug:171:107:0.472:60:conn mil_recep_kn:160:112:0.496:60:conn mil_plug_hex:152:100:0.49:55:conn mil_recep_jam:189:128:0.484:65:conn mil_recep_wall:204:145:0.493:70:conn mil_recep_inline:181:128:0.492:55:conn mil_recep_jam_boot:217:131:0.504:75:conn mil_recep_pcb:226:146:0.497:55:conn mil_plug_boot:260:125:0.468:90:conn dsub_bs:244:135:0.5:55:conn dsub_face:269:92:0.511:55:face microd_bs:200:141:0.496:35:conn dsub_bs45:252:141:0.486:60:conn dsub_bs_blk:248:149:0.49:60:conn circ_small_cbl:284:70:0.493:80:cable cbl_braid:288:61:0.467:80:cable cbl_4w:280:50:0.46:70:cable cbl_4w_b:228:45:0.478:55:cable cbl_6w:274:59:0.407:70:cable bnc:262:68:0.485:50:coax term_ring:121:65:0.5:25:term term_spade:107:49:0.48:22:term tnc:253:65:0.508:50:coax term_bullet:133:42:0.488:25:term term_faston:130:49:0.48:25:term sma:189:56:0.491:30:coax sma_ra:164:121:0.269:25:coax lemo:196:74:0.493:40:conn m12:285:82:0.39:55:conn term_lug:117:49:0.48:25:term tie_blk:326:28:0.482:40:tie tie_wht:327:27:0.463:40:tie tie_mount:117:57:0.789:25:mount mount_tab:82:89:0.91:20:mount cov_conduit:256:79:0.494:60:cov cov_braid:207:68:0.493:50:cov cov_shrink:158:64:0.484:40:cov cov_spiral:198:75:0.493:50:cov pclip:76:77:0.74:20:mount clamp_blk:114:86:0.692:25:mount saddle:137:88:0.841:30:mount grommet:71:76:0.487:20:mount';
  HX.PSPR = {}; HX.PSPR_CATS = { conn: 'Conectores', cable: 'Cabos', coax: 'Coaxiais', term: 'Terminais', tie: 'Abraçadeiras', mount: 'Fixação', cov: 'Coberturas do ramo', face: 'Vistas' };
  D.split(' ').forEach(function (t) {
    var a = t.split(':');
    HX.PSPR[a[0]] = { id: a[0], name: NAMES[a[0]], w: +a[1], h: +a[2], ey: +a[3], len: +a[4], cat: a[5], url: 'img/phys/' + a[0] + '.png' };
  });
  // imagem automática para um conector do esquemático (família + estilo); null = sem imagem correspondente
  var MAP = {
    D38999: { 26: 'mil_plug', 20: 'mil_recep_wall', 24: 'mil_recep_jam', 23: 'mil_recep_jam', 21: 'mil_recep_pcb', 25: 'mil_recep_pcb', 27: 'mil_recep_pcb', '': 'mil_plug' },
    MS5015: { '06A': 'ms_plug', '08B': 'ms_plug', '02A': 'mil_recep_kn', '01A': 'mil_recep_inline', '00A': 'mil_recep_wall', '': 'ms_plug' },
    MS26482: { '16F': 'mil_plug_hex', '12E': 'mil_recep_kn', '14E': 'mil_recep_jam', '': 'mil_plug_hex' },
    MS3476: { 76: 'mil_plug_hex', 70: 'mil_recep_kn', 74: 'mil_recep_jam', '': 'mil_plug_hex' },
    M24308: { C: 'dsub_bs', S: 'dsub_bs_blk', '': 'dsub_bs' }, DSUB: { '': 'dsub_bs45' }, DSUBC: { '': 'dsub_bs' }, DSUBW: { '': 'dsub_bs' }, M83513: { '': 'microd_bs' },
    MILTERM: { '': 'term_ring' }, M12: { '': 'm12' }, M12X: { '': 'm12' }, M8: { '': 'm12' }, M16: { '': 'm12' }, M23: { '': 'm12' }, MINI78: { '': 'm12' }
  };
  HX.physSpriteFor = function (c) {
    var d = c && HX.CAT.conns[c.part]; if (!d) return null;
    var lab = String(d.label || '').toLowerCase();
    if (d.fam === 'COAX') return /sma/.test(lab) ? (/90/.test(lab) ? 'sma_ra' : 'sma') : /tnc|^n\b| n /.test(lab) ? 'tnc' : 'bnc';
    if (d.fam === 'TERM') return /forq|spade/.test(lab) ? 'term_spade' : /faston|fêmea/.test(lab) ? 'term_faston' : /pino|bullet/.test(lab) ? 'term_bullet' : /tubular|sem isol/.test(lab) ? 'term_lug' : 'term_ring';
    var m = MAP[d.fam]; if (!m) return null;
    return m[c.variant || ''] || m[''] || null;
  };
})(typeof window !== 'undefined' ? window : globalThis);
