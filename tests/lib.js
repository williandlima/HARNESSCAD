/* HarnessCAD - carregador dos testes (roda o código do navegador dentro do Node, sem dependências) */
'use strict';
var fs = require('fs'), vm = require('vm'), path = require('path');
var ROOT = path.join(__dirname, '..', 'web', 'js');
var FILES = ['core', 'geom', 'catalog', 'cat_mil', 'cat_dsubc', 'cat_38999_a', 'cat_38999_b', 'cat_38999', 'cat_com', 'cat_com2', 'cat_m80', 'cat_official', 'cat_wire', 'cat_equip', 'netlist', 'reports', 'dims', 'dims_len', 'pdf', 'wirelbl', 'draw', 'symbols', 'symbols2', 'symbols3', 'symbols4', 'disc', 'faceview', 'equip_draw', 'equip_icons', 'equip_icons2', 'equip_icons3', 'equip_pins', 'equip', 'template', 'export_pdf', 'dxf', 'export_dxf', 'print', 'faceimg', 'edit', 'edit2', 'wires_keep', 'junctions', 'pin2pin', 'phys_sprites', 'phys_geom', 'phys_bundle', 'phys_dsub', 'phys_dsubw', 'phys_line', 'phys_gen', 'phys_gen2', 'phys_draw', 'phys_items', 'phys_table', 'phys_table2', 'phys_table3', 'phys_cover', 'phys_edit', 'phys_len', 'phys_topo', 'phys_sync', 'phys_junc', 'erc2', 'erc_phys', 'mfg', 'mfg2', 'model3', 'phys_tree', 'phys_flex', 'phys_route', 'phys_attach', 'phys_acc', 'phys_check', 'phys_rev', 'phys_doc', 'phys_out', 'phys_ds', 'phys_layout', 'phys_ds2', 'phys_dsubvec', 'phys_dsubterm', 'phys_conndims', 'phys_vec', 'phys_face2', 'phys_acc2', 'phys_ms', 'phys_rcx', 'phys_outline', 'phys_com', 'phys_com2', 'phys_vecart', 'phys_vecart2', 'phys_vecart3', 'phys_branch', 'phys_branch2', 'phys_loose2', 'phys_loose', 'phys_loose3', 'phys_lines', 'phys_ball2', 'phys_dim2', 'phys_detail', 'phys_tag', 'phys_tag2', 'phys_tag3', 'phys_angle', 'phys_prep', 'phys_var', 'phys_style', 'model4', 'phys_schemlayout', 'phys_schemlayout2', 'phys_face3', 'phys_custom', 'phys_m80', 'vimg_d38p1', 'vimg_f25351', 'vimg_f25352', 'vimg_faces', 'vimg_f9351', 'vimg_f9981', 'vimg_f1121', 'vimg_f1141', 'vimg_f1151', 'vimg_f11351', 'vimg_f11981', 'vimg_f11991', 'vimg_f1341', 'vimg_f1381', 'vimg_f13351', 'vimg_f13981', 'vimg_f1551', 'vimg_f15151', 'vimg_f15181', 'vimg_f15191', 'vimg_f15351', 'vimg_f15971', 'vimg_f1761', 'vimg_f1781', 'vimg_f17261', 'vimg_f17351', 'vimg_f17991', 'vimg_f19111', 'vimg_f19281', 'vimg_f19301', 'vimg_f19321', 'vimg_f19351', 'vimg_f19352', 'vimg_f19451', 'vimg_f21111', 'vimg_f21161', 'vimg_f21241', 'vimg_f21251', 'vimg_f21271', 'vimg_f21351', 'vimg_f21391', 'vimg_f21392', 'vimg_f21411', 'vimg_f21412', 'vimg_f23211', 'vimg_f23321', 'vimg_f23341', 'vimg_f23351', 'vimg_f23352', 'vimg_f23361', 'vimg_f23531', 'vimg_f23532', 'vimg_f23551', 'vimg_f23552', 'vimg_f23971', 'vimg_f23991', 'vimg_f2541', 'vimg_f2542', 'vimg_f25191', 'vimg_f25241', 'vimg_f25291', 'vimg_f25292', 'vimg_f25431', 'vimg_f25432', 'vimg_f25611', 'vimg_f25612', 'vimg_d38j1', 'vimg_d38w1', 'vimg_tv011', 'vimg_boots1', 'vimg_boot901', 'vimg_srs1', 'vimg_srs2', 'phys_vecimg', 'phys_milcasa', 'phys_milcasa2', 'phys_milcasa3', 'phys_tecnico', 'phys_ms3476'];
var ctx = { console: console }; ctx.globalThis = ctx; vm.createContext(ctx);
FILES.forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(ROOT, f + '.js'), 'utf8'), ctx, { filename: f + '.js' }); });
var HX = ctx.HX, ops = HX.ops, R = { pass: 0, fail: 0 };
function test(name, fn) { try { fn(); R.pass++; console.log('  ok   ' + name); } catch (e) { R.fail++; console.log('  FALHA ' + name + '\n        ' + (e.stack || e).toString().split('\n').slice(0, 3).join('\n        ')); } }
function eq(a, b, m) { var A = JSON.stringify(a), B = JSON.stringify(b); if (A !== B) throw new Error((m || '') + ' esperado ' + B + ' obtido ' + A); }
function ok(v, m) { if (!v) throw new Error(m || 'falso'); }
function setup() {
  var d = new HX.Doc(); d.p.defaults.connWu = 0; // largura automática (geometria de referência dos testes)
  var a = d.add(HX.makeConn(d, 'D38999:11-35', 50, 50)), b = d.add(HX.makeConn(d, 'DT:4 vias', 150, 50));
  b.mx = true; return { d: d, a: a, b: b, A: HX.connLayout(a, 2.5).pins, B: HX.connLayout(b, 2.5).pins };
}

module.exports = { HX: HX, ops: ops, test: test, eq: eq, ok: ok, setup: setup, R: R, fs: fs, path: path };
// bytes de uma imagem: do PNG em web/img ou, no pacote distribuído (sem os PNG), do web/js/imgpack
module.exports.imgBytes = function (url) {
  var fs = require('fs'), path = require('path'), web = path.join(__dirname, '..', 'web'), f = path.join(web, url);
  if (fs.existsSync(f)) return fs.readFileSync(f);
  var dir = path.join(web, 'js', 'imgpack'), s = '';
  fs.readdirSync(dir).filter(function (n) { return /^p\d+\.js$/.test(n); }).sort().forEach(function (n) {
    var t = fs.readFileSync(path.join(dir, n), 'utf8'), re = /H\['([^']+)'\]=\(H\['[^']+'\]\|\|''\)\+'([^']*)';/g, m;
    while ((m = re.exec(t))) if (m[1] === url) s += m[2];
  });
  return Buffer.from(s.replace(/^data:image\/png;base64,/, ''), 'base64');
};
/* testes do modo antigo (imagens / desenho típico): rodam com o "só desenho técnico" desligado */
module.exports.antigo = function (name, fn) { test(name + ' [modo antigo]', function () { var v = HX.SO_TECNICO; HX.SO_TECNICO = false; try { fn(); } finally { HX.SO_TECNICO = v; } }); };
