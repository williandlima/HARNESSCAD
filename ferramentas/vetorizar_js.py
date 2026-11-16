import json, sys
# uso: gen.py chave arquivo.json half(0/1) prefixo_saida
key, src, half, pre = sys.argv[1], sys.argv[2], sys.argv[3] == '1', sys.argv[4]
d = json.load(open(src)); Q = 4
def enc(P):
    out = []; px = py = 0
    for x, y in P:
        ix, iy = round(x*Q), round(y*Q); out += [ix-px, iy-py]; px, py = ix, iy
    return ','.join(map(str, out))
items = ['%d:%s' % (1 if w >= 2.4 else 0, enc(P)) for w, P in d['lines']]
circ = ';'.join('%d,%d,%d' % (round(x*Q), round(y*Q), round(r*Q)) for x, y, r in d['circles'])
head = "(function(G){var H=G.HX,V=H.VECIMG=H.VECIMG||{},e=V[%s]=V[%s]||{w:%d,h:%d,q:%d,half:%s,l:[],c:''};" % (json.dumps(key), json.dumps(key), d['w'], d['h'], Q, 'true' if half else 'false')
tail = "})(typeof window!=='undefined'?window:globalThis);\n"
files = []; cur = []; size = 0; LIM = 8800
for it in items + ['C' + circ] if circ else items:
    if size + len(it) > LIM and cur: files.append(cur); cur = []; size = 0
    cur.append(it); size += len(it) + 3
if cur: files.append(cur)
names = []
for i, f in enumerate(files):
    L = [x for x in f if not x.startswith('C')]; C = [x[1:] for x in f if x.startswith('C')]
    body = head + ("e.l.push(%s);" % ','.join(json.dumps(x) for x in L) if L else '') + ("e.c=%s;" % json.dumps(C[0]) if C else '') + tail
    n = '%s%d.js' % (pre, i+1); open(n, 'w').write('/* HarnessCAD - desenho do datasheet vetorizado (%s), traço por traço */\n' % key + body); names.append(n)
import os; print([(n, os.path.getsize(n)) for n in names])
