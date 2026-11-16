"""Gera os 4 lotes (zip) a partir da pasta de partes HarnessCAD_4k (ferramentas/dividir.py).
Uso: python lotes.py PASTA_PARTES PASTA_SAIDA   (lote 1 leva LEIA-ME, montar.py, montar.bat e o .sha256)"""
import os, sys, zipfile, math
src, dst = sys.argv[1], sys.argv[2]; aqui = os.path.dirname(os.path.abspath(__file__))
parts = sorted(f for f in os.listdir(src) if '.zip.p' in f); q = math.ceil(len(parts) / 4)
for i in range(4):
    z = zipfile.ZipFile(os.path.join(dst, 'HarnessCAD_lote%dde4.zip' % (i + 1)), 'w', zipfile.ZIP_STORED)
    for f in parts[i * q:(i + 1) * q]: z.write(os.path.join(src, f), f)
    if i == 0:
        z.write(os.path.join(aqui, 'LEIA-ME_lotes.txt'), 'LEIA-ME.txt')
        for f in ['montar.py', 'montar.bat', 'HarnessCAD.zip.sha256.txt']: z.write(os.path.join(src, f), f)
    z.close(); print('lote', i + 1, 'ok')
