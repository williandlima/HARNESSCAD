# -*- coding: utf-8 -*-
"""Divide um arquivo em partes pequenas para redes com limite de tamanho.
Uso: python dividir.py ARQUIVO [PASTA_SAIDA] [--tam 3900]
Gera ARQUIVO.p001.txt, .p002.txt... e ARQUIVO.sha256.txt (".txt" passa nos filtros de rede).
Para remontar: montar.py (com Python) ou montar.bat (sem Python)."""
import hashlib
import os
import shutil
import sys


def dividir(arq, saida, tam):
    os.makedirs(saida, exist_ok=True)
    nome = os.path.basename(arq)
    with open(arq, "rb") as f:
        dados = f.read()
    n = max(1, (len(dados) + tam - 1) // tam)
    linhas = []
    for i in range(n):
        parte = dados[i * tam:(i + 1) * tam]
        with open(os.path.join(saida, "%s.p%03d.txt" % (nome, i + 1)), "wb") as f:
            f.write(parte)
        if n <= 150:  # hash curto de cada parte: aponta exatamente qual recopiar
            linhas.append("p%03d %s" % (i + 1, hashlib.sha256(parte).hexdigest()[:16]))
    with open(os.path.join(saida, nome + ".sha256.txt"), "w") as f:
        f.write("%s %d %d\n" % (hashlib.sha256(dados).hexdigest(), len(dados), n) + "\n".join(linhas) + "\n")
    aqui = os.path.dirname(os.path.abspath(__file__))
    for s in ("montar.py", "montar.bat"):
        if os.path.exists(os.path.join(aqui, s)):
            shutil.copy(os.path.join(aqui, s), saida)
    print("%s: %d bytes em %d partes de ate %d bytes -> %s" % (nome, len(dados), n, tam, saida))


if __name__ == "__main__":
    args = sys.argv[1:]
    tam = 3900
    if "--tam" in args:
        k = args.index("--tam")
        tam = int(args[k + 1])
        del args[k:k + 2]
    if not args:
        print(__doc__)
        sys.exit(1)
    dividir(args[0], args[1] if len(args) > 1 else os.path.dirname(os.path.abspath(args[0])), tam)
