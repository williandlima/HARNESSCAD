# HarnessCAD - monta o instalador único: Setup_HarnessCAD.exe = setup_base.exe (setup.c compilado) + todos os arquivos
# do programa anexados no fim. Uso: python montar_setup.py setup_base.exe HarnessCAD.zip Setup_HarnessCAD.exe
import struct, sys, zipfile


def main(base, pacote, saida):
    z = zipfile.ZipFile(pacote)
    exe = open(base, 'rb').read()
    out = bytearray(exe)
    start, n = len(out), 0
    for info in z.infolist():
        if info.filename.endswith('/'):
            continue
        rel = info.filename.split('/', 1)[1] if '/' in info.filename else info.filename  # tira a pasta HarnessCAD/
        p = rel.encode('utf-8')
        d = z.read(info)
        out += struct.pack('<H', len(p)) + p + struct.pack('<I', len(d)) + d
        n += 1
    out += struct.pack('<II', n, start) + b'HXSETUP1'
    open(saida, 'wb').write(out)
    print('%s: %d arquivos, %d bytes' % (saida, n, len(out)))


if __name__ == '__main__':
    main(*sys.argv[1:4])
