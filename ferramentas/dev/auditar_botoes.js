/* HarnessCAD (dev) - AUDITORIA DE BOTÕES: abre o programa no Chromium (Playwright), monta um esquema de exemplo e clica
   cada botão da faixa (todas as abas, inclusive a contextual do físico), da barra ativa e cada item de menu; mede o efeito
   (janela aberta, ferramenta trocada, desenho alterado, painel/aba/tema/zoom mudou, aviso, download) e os erros no console.
   Uso: NODE_PATH=$(npm root -g) node ferramentas/dev/auditar_botoes.js [saida.json]
   Saída: lista "SEM EFEITO" e "COM ERRO" (o resto funcionou). Não altera arquivos do projeto. */
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const URL = 'file://' + path.resolve(__dirname, '../../web/index.html');
(async () => {
  const br = await chromium.launch(), pg = await br.newPage({ viewport: { width: 1600, height: 950 }, acceptDownloads: true }); let errs = [], dl = 0;
  pg.on('pageerror', e => errs.push(String(e).slice(0, 160))); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); }); pg.on('download', () => dl++);
  pg.on('dialog', d => d.dismiss().catch(() => {})); pg.on('popup', p => p.close().catch(() => {}));
  await pg.goto(URL); await pg.waitForTimeout(1500); try { await pg.getByText('Voltar ao desenho').first().click({ timeout: 2000 }); } catch (e) {}
  await pg.evaluate(() => { window.print = function () { window._printed = (window._printed || 0) + 1; }; const app = window.app, d = app.doc;
    d.change('ex', () => { const a = d.add(HX.makeConn(d, 'D38999:13-98', 60, 60)), b = d.add(HX.makeConn(d, 'D38999:13-98', 180, 60)); a.ref = 'J1'; b.ref = 'J2'; });
    d.change('w', () => HX.wtApply(d, HX.wtParse(d, 'J1:A > J2:A\nJ1:B > J2:B\nJ1:C > J2:C'))); app.view.fit(); window._base = JSON.stringify(d.p); });
  const sig = () => pg.evaluate(() => { const a = window.app, d = a.doc, q = s => document.querySelector(s), vis = e => e && e.offsetParent !== null;
    return JSON.stringify({ m: !!q('#modal.show'), t: a.tools.tool, u: d.undoStack.length, p: JSON.stringify(d.p).length, sh: d.sheet, s: [...d.sel].join(), z: Math.round(a.view.s * 1000) + ',' + Math.round(a.view.ox) + ',' + Math.round(a.view.oy),
      ap: q('#app').className, th: document.documentElement.className + document.documentElement.dataset.theme, pend: !!(a.tools._cabPend || a.tools._pinName || a.tools._cpPick),
      ctx: document.querySelectorAll('.hxCtx,.ctxmenu,[class*=ctx-menu]').length, toast: document.querySelectorAll('.toast,#toast > *').length, pal: vis(q('#palette,.palette')),
      st: vis(q('#start,.start')), rt: (q('#rtabs .rt.on') || {}).textContent, dock: (q('#dock') || {}).className, lay: JSON.stringify(a.layout && a.layout.state || {}), pr: window._printed || 0,
      lp: [...document.querySelectorAll('.pane')].filter(vis).map(e => e.id).join(), lr: ['#left', '#right', '#dock', '#props', '#bottom'].map(x => (q(x) || {}).className + (vis(q(x)) ? 1 : 0)).join(), dt: [...document.querySelectorAll('#dockTabs button.on,#dock button.on')].map(b => b.textContent).join(), ab: (q('#hxAB') || {}).className, fl: vis(q('#hxFlow')), ed: document.querySelectorAll('body > input').length }); });
  async function reset(tab) { await pg.keyboard.press('Escape'); await pg.evaluate(() => { const a = window.app; const m = document.querySelector('#modal'); if (m) { m.classList.remove('show'); m.innerHTML = ''; }
      document.querySelectorAll('body > input').forEach(e => e.remove()); a.tools._cabPend = null; a.tools._pinName = false; a.tools._cpPick = null; a.tools.setTool('select');
      const st = document.querySelector('#start,.start'); if (st && st.offsetParent) { const b = [...document.querySelectorAll('button')].find(x => /Voltar ao desenho/.test(x.textContent)); if (b) b.click(); }
      if (JSON.stringify(a.doc.p) !== window._base) { a.doc.load ? a.doc.load(JSON.parse(window._base)) : (a.doc.p = JSON.parse(window._base)); } a.doc.select([]); });
    if (tab) await pg.evaluate(t => window.app.ribbonTab(t, true), tab); await pg.waitForTimeout(60); }
  const out = { semEfeito: [], erro: [], ok: 0 };
  /* contexto que o comando precisa: item selecionado, algo para desfazer/colar, zoom fora do ajuste */
  const CTX = [[/Copiar|Duplicar|Excluir|Girar|Espelhar|Bloquear|Colar/, 'sel'], [/Desfazer/, 'undo'], [/Refazer/, 'redo'], [/Ajustar/, 'zoom'], [/Colar/, 'clip']];
  async function prep(name) { for (const c of CTX) if (c[0].test(name)) await pg.evaluate(k => { const a = window.app, d = a.doc, j = d.items().find(x => x.ref === 'J1');
      if (k === 'sel' || k === 'clip') d.select([j.id]); if (k === 'clip') a.tools.copy && a.tools.copy(); if (k === 'undo' || k === 'redo') d.change('t', () => { j.note = 'x'; }); if (k === 'redo') d.undo();
      if (k === 'zoom') { a.view.s *= 2; a.view.redraw(); } }, c[1]); }
  async function probe(name, clickFn, tab) { await reset(tab); await prep(name); const s0 = await sig(), e0 = errs.length, d0 = dl; let ex = null;
    try { await clickFn(); } catch (e) { ex = String(e).slice(0, 120); } await pg.waitForTimeout(220); const s1 = await sig();
    if (ex || errs.length > e0) out.erro.push({ b: name, e: ex || errs.slice(e0).join(' | ') }); else if (s0 === s1 && dl === d0) out.semEfeito.push(name); else out.ok++; }
  /* faixa: todas as abas */
  const tabs = await pg.evaluate(() => [...document.querySelectorAll('#rtabs .rt[data-tab]')].map(b => b.dataset.tab));
  for (const t of tabs) { if (t === 'Desenho físico') continue;
    const n = await pg.evaluate(t => document.querySelectorAll('.rpanel[data-tab="' + t + '"] button.rb, .rpanel[data-tab="' + t + '"] button.rs').length, t);
    for (let i = 0; i < n; i++) { const lab = await pg.evaluate(([t, i]) => { const b = document.querySelectorAll('.rpanel[data-tab="' + t + '"] button.rb, .rpanel[data-tab="' + t + '"] button.rs')[i]; return (b.textContent.trim() || b.title) + ' [' + t + ']'; }, [t, i]);
      await probe('Faixa: ' + lab, () => pg.evaluate(([t, i]) => document.querySelectorAll('.rpanel[data-tab="' + t + '"] button.rb, .rpanel[data-tab="' + t + '"] button.rs')[i].click(), [t, i]), t); } }
  /* barra ativa (esquema) */
  const nb = await pg.evaluate(() => document.querySelectorAll('#hxAB button[data-i]').length);
  for (let i = 0; i < nb; i++) { const lab = await pg.evaluate(i => document.querySelectorAll('#hxAB button[data-i]')[i].title, i); await probe('Barra ativa: ' + lab, () => pg.evaluate(i => document.querySelectorAll('#hxAB button[data-i]')[i].click(), i)); }
  /* menus (ocultos atrás da faixa) */
  const menus = await pg.evaluate(() => [...document.querySelectorAll('#menus .menu .dd > div')].map(d => d.closest('.menu').firstChild.textContent + ' › ' + d.firstChild.textContent));
  for (let i = 0; i < menus.length; i++) { if (/Sair|Novo projeto|Abrir|Importar|Restaurar/.test(menus[i])) continue; await probe('Menu: ' + menus[i], () => pg.evaluate(i => document.querySelectorAll('#menus .menu .dd > div')[i].click(), i)); }
  /* ações dos itens */
  for (const ref of ['J1', 'W1']) { const n = await pg.evaluate(r => { const a = window.app, it = a.doc.items().find(x => x.ref === r || x.num === r); return HX.itemActions(a, it).filter(e => Array.isArray(e)).length; }, ref);
    for (let i = 0; i < n; i++) { const lab = await pg.evaluate(([r, i]) => { const a = window.app, it = a.doc.items().find(x => x.ref === r || x.num === r); return HX.itemActions(a, it).filter(e => Array.isArray(e))[i][0]; }, [ref, i]);
      if (/^Dica/.test(lab)) continue;
      await probe('Ação ' + ref + ': ' + lab, () => pg.evaluate(([r, i]) => { const a = window.app, it = a.doc.items().find(x => x.ref === r || x.num === r); a.doc.select([it.id]); HX.itemActions(a, it).filter(e => Array.isArray(e))[i][1](); }, [ref, i])); } }
  out.erros_soltos = errs.slice(0, 20); const f = process.argv[2]; if (f) fs.writeFileSync(f, JSON.stringify(out, null, 1));
  console.log('funcionando:', out.ok, '| sem efeito:', out.semEfeito.length, '| com erro:', out.erro.length); out.semEfeito.forEach(x => console.log('  SEM EFEITO  ' + x)); out.erro.forEach(x => console.log('  ERRO  ' + x.b + ' → ' + x.e));
  await br.close();
})();
