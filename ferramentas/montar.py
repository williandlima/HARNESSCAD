# -*- coding: utf-8 -*-
"""Junta partes (X.p001, X.p001.txt, X_p001...), confere SHA-256 e extrai .zip.
Python 3.8+. Duplo clique, ou: python montar.py [pasta ou uma das partes]"""
import hashlib
import os
import re
import sys
import zipfile

PARTE = re.compile(r"^(?P<b>.+?)[._-]p(?P<n>\d{3})(\.txt)?$", re.I)


def achar(pasta):
    grupos, sha = {}, {}
    for f in os.listdir(pasta):
        m = PARTE.match(f)
        if m:
            grupos.setdefault(m.group("b"), {})[int(m.group("n"))] = os.path.join(pasta, f)
        elif re.search(r"\.sha256(\.txt)?$", f, re.I):
            sha[re.sub(r"\.sha256(\.txt)?$", "", f, flags=re.I).lower()] = os.path.join(pasta, f)
    return grupos, sha


def juntar(pasta, base, partes, shafile):
    info, porparte = None, {}
    if shafile:
        with open(shafile) as f:
            linhas = f.read().split("\n")
        h, tam, n = linhas[0].split()[:3]
        info = (h, int(tam), int(n))
        porparte = dict(l.split() for l in linhas[1:] if len(l.split()) == 2)
    total = info[2] if info else max(partes)
    faltam = ["p%03d" % k for k in range(1, total + 1) if k not in partes]
    if faltam:
        print("ERRO %s: faltam partes: %s" % (base, " ".join(faltam)))
        return None
    dados, ruins = b"", []
    for k in range(1, total + 1):
        with open(partes[k], "rb") as f:
            d = f.read()
        if porparte.get("p%03d" % k, "") not in ("", hashlib.sha256(d).hexdigest()[:16]):
            ruins.append("%s (%d bytes)" % (os.path.basename(partes[k]), len(d)))
        dados += d
    if ruins:
        print("ERRO %s: partes corrompidas, copie de novo:\n  %s" % (base, "\n  ".join(ruins)))
        return None
    if info and (hashlib.sha256(dados).hexdigest() != info[0] or len(dados) != info[1]):
        print("ERRO %s: resultado diferente do original." % base)
        return None
    if dados[:2] == b"PK" and not base.lower().endswith(".zip"):
        base += ".zip"
    dest = os.path.join(pasta, base)
    with open(dest, "wb") as f:
        f.write(dados)
    print("OK  %s  (%d partes, %d bytes%s)" % (base, total, len(dados), ", SHA-256 conferido" if info else ""))
    return dest


def extrair(zp, pasta):
    raiz = os.path.realpath(pasta)
    with zipfile.ZipFile(zp) as z:
        for m in z.namelist():
            alvo = os.path.realpath(os.path.join(raiz, m))
            if not (alvo == raiz or alvo.startswith(raiz + os.sep)):
                raise ValueError("caminho suspeito no zip: " + m)
        z.extractall(raiz)
        print("Extraido em %s (%d arquivos)" % (raiz, len(z.namelist())))


def main():
    alvo = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
    pasta = os.path.abspath(alvo if os.path.isdir(alvo) else os.path.dirname(alvo))
    print("Pasta: " + pasta)
    grupos, shas = achar(pasta)
    if not grupos:
        print("Nenhuma parte encontrada (esperado: nome.p001 ou nome.p001.txt).")
        print("Arquivos nesta pasta:")
        for f in sorted(os.listdir(pasta))[:40]:
            print("  " + f)
        return 1
    ok = True
    for base in sorted(grupos):
        dest = juntar(pasta, base, grupos[base], shas.get(base.lower()))
        if dest and dest.lower().endswith(".zip"):
            extrair(dest, pasta)
        ok = ok and bool(dest)
    print("\nConcluido." if ok else "\nHouve erros: copie de novo os arquivos indicados.")
    return 0 if ok else 1


if __name__ == "__main__":
    try:
        code = main()
    except Exception as e:  # mostra o erro em vez de fechar a janela
        print("ERRO: %r" % e)
        code = 2
    if os.name == "nt":
        input("Enter para fechar...")
    sys.exit(code)
