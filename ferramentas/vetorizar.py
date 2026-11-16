# HarnessCAD - vetoriza figura do datasheet (traço central + contatos). Uso no PC de desenvolvimento (numpy, scipy, scikit-image, Pillow):
#   TH=128 TOL=0.5 [FILL=2.2 FILLT=4] [SIL=1] python vetorizar.py figura.png x0,y0,x1,y1 6 saida.json [dots]   ->   python vetorizar_js.py chave saida.json 0|1 web/js/vimg_nome
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
    small = np.isin(lh, [i+1 for i, v in enumerate(sz) if v < (K*float(__import__('os').environ.get('HOLE', '5')))**2]); fl = bw | small  # HOLE: furo do contato meio cheio
    rr = int(K*float(__import__("os").environ.get("DR","2.2")))
    yy0, xx0 = np.ogrid[-rr:rr+1, -rr:rr+1]; disk = xx0**2 + yy0**2 <= rr*rr
    op = ndi.binary_opening(fl, structure=disk)
    lab, n = ndi.label(op); C = []
    for i in range(1, n+1):
        ys, xs = np.where(lab == i); a = len(xs)
        if a > (K*12)**2: continue
        C.append([xs.mean()/K, ys.mean()/K, np.sqrt(a/np.pi)/K])
    med = float(np.median([c[2] for c in C])) if C else 0
    lo, hi = [float(v) for v in __import__('os').environ.get('CR', '0.6,1.6').split(',')]  # faixa de raio aceita (x mediana)
    circles = [[round(c[0], 2), round(c[1], 2), round(c[2], 2)] for c in C if lo*med < c[2] < hi*med]
    EX=[tuple(map(float,t.split(':'))) for t in __import__('os').environ.get('EXCL','').split() if t]
    circles=[c for c in circles if not any(abs(c[0]-a)<2 and abs(c[1]-b)<2 for a,b in EX)]
    IN = float(__import__('os').environ.get('INSIDE', '0'))  # vista frontal: só contatos dentro do inserto (fração do raio)
    if IN > 0: circles = [c for c in circles if ((c[0] - W / 2)**2 + (c[1] - H / 2)**2) ** 0.5 < IN * min(W, H) / 2]
    yy, xx = np.ogrid[:H*K, :W*K]
    # lado escuro de cada contato meio cheio: ângulo (graus, y para baixo) do centroide escuro + fração escura
    C2 = []
    for c in circles:
        cx, cy, rr2 = c[0]*K, c[1]*K, (c[2]*K*0.85)**2; y0_, y1_ = int(max(0, cy - c[2]*K)), int(min(H*K, cy + c[2]*K + 1)); x0_, x1_ = int(max(0, cx - c[2]*K)), int(min(W*K, cx + c[2]*K + 1))
        sub = bw[y0_:y1_, x0_:x1_]; my, mx = np.ogrid[y0_:y1_, x0_:x1_]; ins = (mx - cx)**2 + (my - cy)**2 <= rr2; dk = sub & ins
        dy_, dx_ = np.nonzero(dk); a = float(np.degrees(np.arctan2((dy_ + y0_).mean() - cy, (dx_ + x0_).mean() - cx))) if dk.any() else 180.0
        C2.append(c + [round(a), round(float(dk.sum()) / max(1, ins.sum()), 2)])
    circles = C2
    RM = float(__import__('os').environ.get('RM', '0.9'))  # margem (px) apagada em volta do contato: some o anel do desenho
    for c in circles: bw[(xx - c[0]*K)**2 + (yy - c[1]*K)**2 <= (c[2]*K + K*RM)**2] = False
# regiões cheias (faixas de acoplamento, corte do painel): viram polígonos preenchidos, não um traço central
# FILL=raio em px da figura original (0 = desliga); só manchas mais largas que 2x esse raio
fills_raw = []
FR = float(__import__("os").environ.get("FILL", "0"))
FT = float(__import__("os").environ.get("FILLT", "0")) or FR * 1.15  # meia-espessura mínima (px) de uma região cheia
if FR > 0:
    from skimage import measure
    rf = max(1, int(round(K * FR))); yy1, xx1 = np.ogrid[-rf:rf+1, -rf:rf+1]; dk = xx1**2 + yy1**2 <= rf*rf
    thick = ndi.binary_dilation(ndi.binary_opening(bw, structure=dk), iterations=K) & bw  # recupera os cantos sem fechar frestas
    lab_t, nt = ndi.label(thick); dt0 = ndi.distance_transform_edt(bw); keep = np.zeros_like(bw)
    for i in range(1, nt+1):
        m = lab_t == i
        # cruzamento de traços (mancha pequena ou fina) não é região cheia: continua como linha
        if m.sum() < (K*7)**2 or dt0[m].max() < K*FT: continue
        cs = measure.find_contours(np.pad(m, 1).astype(float), 0.5)
        if not cs: continue
        P = max(cs, key=len); ys_, xs_ = np.array([q[0] for q in P]), np.array([q[1] for q in P])
        if m.sum() < 0.6 * abs(np.dot(xs_, np.roll(ys_, 1)) - np.dot(ys_, np.roll(xs_, 1))) / 2: continue  # anel (oco): não é região cheia
        fills_raw.append([(float(r) - 1, float(c) - 1) for r, c in P]); keep |= m
    bw = bw & ~ndi.binary_dilation(keep, iterations=max(1, K // 2))
# silhueta (SIL=1): contorno externo da peça, pintado com o fundo antes dos traços (esconde o que fica atrás)
sil_raw = []
if __import__("os").environ.get("SIL") == "1":
    from skimage import measure
    sm = ndi.binary_fill_holes(ndi.binary_closing(g < float(__import__("os").environ.get("TH", "135")), iterations=K * 2))
    ls, ns = ndi.label(sm)
    if ns:
        big = ls == (1 + int(np.argmax(ndi.sum(sm, ls, range(1, ns + 1)))))
        cs = measure.find_contours(np.pad(big, 1).astype(float), 0.5)
        if cs: sil_raw = [(float(r) - 1, float(c) - 1) for r, c in max(cs, key=len)]
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
fills = []
for P in fills_raw:
    Q = dp(P + [P[0]], K*float(__import__("os").environ.get("TOL","0.35")))
    if len(Q) >= 4: fills.append([[round(p[1]/K, 2), round(p[0]/K, 2)] for p in Q])
sil = [[round(p[1]/K, 2), round(p[0]/K, 2)] for p in dp(sil_raw + sil_raw[:1], K*0.5)] if sil_raw else []
json.dump({'w': W, 'h': H, 'lines': res, 'circles': circles, 'fills': fills, 'sil': sil}, open(out, 'w'))
print(W, H, len(res), sum(len(r[1]) for r in res), len(circles), len(fills), sorted(set(r[0] for r in res))[:12])
