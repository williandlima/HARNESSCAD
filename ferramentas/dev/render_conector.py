import sys
import os
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'web', 'index.html'))
parts=sys.argv[1].split(','); style=sys.argv[2] if len(sys.argv)>2 else 'line'; tag=sys.argv[3] if len(sys.argv)>3 else 'x'
with sync_playwright() as p:
    br=p.chromium.launch(); pg=br.new_page(viewport={'width':1600,'height':1000}); e=[]; pg.on('pageerror',lambda x:e.append(str(x)))
    out=[]
    for k,part in enumerate(parts):
        pg.close(); ctx=br.new_context(viewport={'width':1600,'height':1000}); pg=ctx.new_page(); pg.on('pageerror',lambda x:e.append(str(x))); pg.goto(URL); pg.wait_for_timeout(900)
        try: pg.click('.scard[data-a=close]',timeout=1500)
        except Exception: pass
        pg.evaluate("""([part,style])=>{const d=app.doc; const o=HX.ops; const pp=part.split('|'); part=pp[0]; const A=d.add(HX.makeConn(d,part,40,40)); if(pp[1]) A.variant=pp[1]; const B=d.add(HX.makeConn(d,part,240,40));
          const P=HX.connLayout(A,2.5).pins, Q=HX.connLayout(B,2.5).pins; d.change('w',()=>{for(let j=0;j<Math.min(4,P.length,Q.length);j++) o.addWire(d,[P[j].pt,Q[j].pt]);});
          let r; d.change('g',()=>{r=HX.applyPhysical(d,{scale:5,style:style,faces:false})}); app.setSheet(r.index); const nn=app.doc.cur().items.find(i=>i.type==='pnode'&&i.nkind==='conn'); if(pp[2]){d.change('x',()=>{nn.bsKind=pp[2]; if(pp[3]) nn.bootKind=pp[3];}); app.view.redraw();}}""", [part,style])
        pg.wait_for_timeout(300)
        bb=pg.evaluate("()=>{const n=app.doc.cur().items.find(i=>i.type==='pnode'&&i.nkind==='conn'); return n._bb}")
        if not bb: out.append((part,'nobb')); continue
        pg.evaluate("(b)=>{const v=app.view; const w=b.x1-b.x0+12, h=b.y1-b.y0+12; v.s=Math.min(760/w, 400/h); v.ox=v.W/2-(b.x0+b.x1)/2*v.s; v.oy=v.H/2-(b.y0+b.y1)/2*v.s; v.redraw();}", bb); pg.wait_for_timeout(250)
        pg.screenshot(path='/tmp/%s%d.png'%(tag,k), clip={'x':390,'y':280,'width':800,'height':420}); out.append(part)
    print(out, e); br.close()
