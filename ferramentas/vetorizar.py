# HarnessCAD - vetoriza figura do datasheet (traço central + contatos). Uso no PC de desenvolvimento (numpy, scipy, scikit-image, Pillow):
#   TH=128 TOL=0.5 python vetorizar.py figura.png x0,y0,x1,y1 6 saida.json [dots]   ->   python vetorizar_js.py chave saida.json 0|1 web/js/vimg_nome
import sys, numpy as np, json
from PIL import Image
from skimage.morphology import skeletonize
from scipy import ndimage as ndi
src, box, K, out = sys.argv[1], [int(v) for v in sys.argv[2].split(',')], int(sys.argv[3]), sys.argv[4]
dots = len(sys.argv) > 5 and sys.argv[5] == 'dots'
im = Image.open(src).convert('L').crop(box); W, H = im.size
g = np.array(im.resize((W*K, H*K), Image.BICUBIC)).astype(float)
bw = g < float(__import__("os").environ.get("TH","135"))
circles = []
if dots:  # contatos -> círculos (cheios ou meio cheios: preenche o furo antes)
    hl = ndi.binary_fill_holes(bw) & ~bw; lh, nh = ndi.label(hl); sz = ndi.sum(hl, lh, range(1, nh+1))
    small = np.isin(lh, [i+1 for i, v in enumerate(sz) if v < (K*5)**2]); fl = bw | small
    rr = int(K*float(__import__("os").environ.get("DR","2.2")))
    yy0, xx0 = np.ogrid[-rr:rr+1, -rr:rr+1]; disk = xx0**2 + yy0**2 <= rr*rr
    op = ndi.binary_opening(fl, structure=disk)
    lab, n = ndi.label(op); C = []
    for i in range(1, n+1):
        ys, xs = np.where(lab == i); a = len(xs)
        if a > (K*12)**2: continue
        C.append([xs.mean()/K, ys.mean()/K, np.sqrt(a/np.pi)/K])
    med = float(np.median([c[2] for c in C])) if C else 0
    circles = [[round(c[0], 2), round(c[1], 2), round(c[2], 2)] for c in C if 0.6*med < c[2] < 1.6*med]
    EX=[tuple(map(float,t.split(':'))) for t in __import__('os').environ.get('EXCL','').split() if t]
    circles=[c for c in circles if not any(abs(c[0]-a)<2 and abs(c[1]-b)<2 for a,b in EX)]
    yy, xx = np.ogrid[:H*K, :W*K]
    for c in circles: bw[(xx - c[0]*K)**2 + (yy - c[1]*K)**2 <= (c[2]*K + K*0.9)**2] = False
dt = ndi.distance_transform_edt(bw)
sk = skeletonize(bw)
# grafo do esqueleto
ys, xs = np.nonzero(sk); S = set(zip(ys.tolist(), xs.tolist()))
N8 = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
def nb(p): return [(p[0]+a, p[1]+b) for a, b in N8 if (p[0]+a, p[1]+b) in S]
deg = {p: len(nb(p)) for p in S}
used = set(); lines = []
def ek(a, b): return (a, b) if a < b else (b, a)
starts = [p for p in S if deg[p] != 2] + [p for p in S if deg[p] == 2]
for s in starts:
    for q in nb(s):
        if ek(s, q) in used: continue
        path = [s, q]; used.add(ek(s, q)); cur, prev = q, s
        while deg[cur] == 2:
            nx = [r for r in nb(cur) if r != prev and ek(cur, r) not in used]
            if not nx: break
            used.add(ek(cur, nx[0])); prev, cur = cur, nx[0]; path.append(cur)
        lines.append(path)
def dp(P, e):
    if len(P) < 3: return P
    a, b = np.array(P[0], float), np.array(P[-1], float); d = b - a; L = np.hypot(*d) or 1e-9
    dist = [abs(d[0]*(p[1]-a[1]) - d[1]*(p[0]-a[0]))/L if L > 1e-6 else np.hypot(p[0]-a[0], p[1]-a[1]) for p in P]
    i = int(np.argmax(dist))
    if dist[i] > e: return dp(P[:i+1], e)[:-1] + dp(P[i:], e)
    return [P[0], P[-1]]
res = []
for P in lines:
    if len(P) < K and all(deg[p] == 1 or deg[p] > 2 for p in (P[0], P[-1])) and len(P) < 3: continue
    w = float(np.median([dt[p] for p in P])) * 2 / K
    Q = dp(P, K*float(__import__("os").environ.get("TOL","0.35")))
    res.append([round(w, 1), [[round(p[1]/K, 2), round(p[0]/K, 2)] for p in Q]])
json.dump({'w': W, 'h': H, 'lines': res, 'circles': circles}, open(out, 'w'))
print(W, H, len(res), sum(len(r[1]) for r in res), len(circles), sorted(set(r[0] for r in res))[:12])
