#!/bin/sh
# Recompila HarnessCAD.exe e Instalar_HarnessCAD.exe (Linux com mingw-w64; gera executáveis 32 bits p/ Windows 7+)
cd "$(dirname "$0")"
i686-w64-mingw32-windres icone.rc -O coff -o icone.o
B="i686-w64-mingw32-gcc -Os -s -municode -mwindows -Wl,--no-insert-timestamp"
$B -o ../HarnessCAD.exe harness_exe.c atualiza.c icone.o -lole32 -luuid -lshell32 -lurlmon
$B -DINSTALADOR -o ../Instalar_HarnessCAD.exe harness_exe.c icone.o -lole32 -luuid -lshell32
rm -f icone.o
# instalador único (programa inteiro embutido): precisa do HarnessCAD.zip do pacote
i686-w64-mingw32-windres icone.rc -O coff -o icone.o
V=$(sed -n "s/.*HX.VERSION = '\([^']*\)'.*/\1/p" ../web/js/core.js)
$B -DHXVER="L\"$V\"" -o setup_base.exe setup.c icone.o -lole32 -luuid -lshell32 && python3 montar_setup.py setup_base.exe ../../HarnessCAD.zip ../../Setup_HarnessCAD.exe
rm -f icone.o setup_base.exe
# cópia para a atualização automática pela internet (HarnessCAD.exe baixa daqui; ver atualiza.c)
mkdir -p ../atualizacao && cp ../../Setup_HarnessCAD.exe ../atualizacao/Setup_HarnessCAD.exe
