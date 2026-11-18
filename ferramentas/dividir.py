# -*- coding: utf-8 -*-
"""Divide um arquivo em partes pequenas para redes com limite de tamanho.
Uso: python dividir.py ARQUIVO [PASTA_SAIDA] [--tam 3900]
Gera ARQUIVO.p001.txt, .p002.txt... (passa de p999 para p1000 se precisar) e ARQUIVO.sha256.txt
(".txt" passa nos filtros de rede). O .sha256.txt tem o hash do arquivo inteiro e um hash curto de cada
parte, para o montar apontar exatamente qual recopiar; se não couber em um arquivo de --tam bytes,
continua em ARQUIVO.sha256-2.txt, -3.txt...
Para remontar: montar.py (com Python) ou montar.bat (sem Python)."""
import hashlib
import os
import shutil
import sys

CAB = 120  # bytes reservados para a 1ª linha (hash completo, tamanho, nº de partes)
LINHA = 23  # "p1234 0123456789abcdef\n"


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
        linhas.append("p%03d %s" % (i + 1, hashlib.sha256(parte).hexdigest()[:16]))
    por_arq = max(1, (tam - CAB) // LINHA)
    blocos = [linhas[k:k + por_arq] for k in range(0, len(linhas), por_arq)]
    for k, bloco in enumerate(blocos):
        cab = "%s %d %d\n" % (hashlib.sha256(dados).hexdigest(), len(dados), n) if k == 0 else ""
        sufixo = ".sha256.txt" if k == 0 else ".sha256-%d.txt" % (k + 1)
        with open(os.path.join(saida, nome + sufixo), "w", newline="\n") as f:
            f.write(cab + "\n".join(bloco) + "\n")
    aqui = os.path.dirname(os.path.abspath(__file__))
    for s in ("montar.py", "montar.bat"):
        if os.path.exists(os.path.join(aqui, s)):
            shutil.copy(os.path.join(aqui, s), saida)
    print("%s: %d bytes em %d partes de ate %d bytes (+%d arquivo(s) .sha256) -> %s"
          % (nome, len(dados), n, tam, len(blocos), saida))


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
