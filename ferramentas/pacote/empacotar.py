import os, zipfile, sys
import os.path as _p
raiz=_p.abspath(_p.join(_p.dirname(__file__),'..','..'))
src=raiz; out=_p.join(raiz,'..','HarnessCAD.zip')
leia=open(_p.join(_p.dirname(__file__),'LEIA_img.txt'),'rb').read()
z=zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9)
for root,dirs,files in os.walk(src):
    dirs[:]=sorted(d for d in dirs if d!='__pycache__'); rel=os.path.relpath(root,src)
    arc='HarnessCAD' if rel=='.' else 'HarnessCAD/'+rel.replace(os.sep,'/')
    z.write(root,arc+'/')
    if rel.replace(os.sep,'/')=='web/img':
        dirs[:]=[]; z.writestr(arc+'/LEIA-ME.txt',leia); continue
    for f in sorted(files):
        if f.endswith('.pyc') or f.endswith('.lib'): continue
        z.write(os.path.join(root,f),arc+'/'+f)
z.close(); print(os.path.getsize(out), len(zipfile.ZipFile(out).namelist()))
