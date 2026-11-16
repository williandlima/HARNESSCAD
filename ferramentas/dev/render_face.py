import os
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'web', 'index.html'))
with sync_playwright() as p:
    br=p.chromium.launch(); pg=br.new_page(viewport={'width':1600,'height':1000}); e=[]; pg.on('pageerror',lambda x:e.append(str(x)))
    pg.goto(URL); pg.wait_for_timeout(900)
    try: pg.click('.scard[data-a=close]',timeout=1500)
    except Exception: pass
    pg.evaluate("""()=>{const d=app.doc,o=HX.ops; const A=d.add(HX.makeConn(d,'D38999:25-35',40,40)), B=d.add(HX.makeConn(d,'D38999:25-35',240,40));
      const P=HX.connLayout(A,2.5).pins,Q=HX.connLayout(B,2.5).pins; d.change('w',()=>{for(let j=0;j<4;j++) o.addWire(d,[P[j].pt,Q[j].pt]);});
      let r; d.change('g',()=>{r=HX.applyPhysical(d,{scale:5,style:'line',faces:true})}); app.setSheet(r.index);}""")
    pg.wait_for_timeout(300)
    f=pg.evaluate("()=>{const it=app.doc.cur().items.find(i=>i.type==='pface'); return it&&it._bb}")
    print(f)
    pg.evaluate("(b)=>{const v=app.view; v.s=Math.min(760/(b.x1-b.x0+4),400/(b.y1-b.y0+4)); v.ox=v.W/2-(b.x0+b.x1)/2*v.s; v.oy=v.H/2-(b.y0+b.y1)/2*v.s; v.redraw();}", f); pg.wait_for_timeout(300)
    pg.screenshot(path='/tmp/face.png', clip={'x':390,'y':280,'width':800,'height':440}); print(e); br.close()
