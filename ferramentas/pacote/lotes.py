"""Gera os 4 lotes (zip) a partir da pasta de partes HarnessCAD_4k (ferramentas/dividir.py).
Uso: python lotes.py PASTA_PARTES PASTA_SAIDA
O lote 1 leva LEIA-ME, montar.py, montar.bat e todos os HarnessCAD.zip.sha256*.txt."""
import math
import os
import re
import sys
import zipfile

src, dst = sys.argv[1], sys.argv[2]
aqui = os.path.dirname(os.path.abspath(__file__))
PARTE = re.compile(r"\.zip\.p(\d{3,})(\.txt)?$", re.I)
parts = sorted((f for f in os.listdir(src) if PARTE.search(f)), key=lambda f: int(PARTE.search(f).group(1)))
shas = sorted(f for f in os.listdir(src) if re.search(r"\.zip\.sha256", f, re.I))
q = math.ceil(len(parts) / 4)
for i in range(4):
    with zipfile.ZipFile(os.path.join(dst, "HarnessCAD_lote%dde4.zip" % (i + 1)), "w", zipfile.ZIP_STORED) as z:
        for f in parts[i * q:(i + 1) * q]:
            z.write(os.path.join(src, f), f)
        if i == 0:
            z.write(os.path.join(aqui, "LEIA-ME_lotes.txt"), "LEIA-ME.txt")
            for f in ["montar.py", "montar.bat"] + shas:
                z.write(os.path.join(src, f), f)
    print("lote", i + 1, "ok")
