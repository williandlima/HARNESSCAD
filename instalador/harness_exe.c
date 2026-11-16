/* HarnessCAD - HarnessCAD.exe (atalho) e Instalar_HarnessCAD.exe (instalador). Windows 7+, sem Python, sem .NET.
   HarnessCAD.exe: embute as imagens de web\img em web\js\imgpack (se faltar) e abre web\index.html no Edge/Chrome/
   Firefox (ou no navegador padrão). Com as imagens embutidas o PDF sai com conectores e vistas no modo local.
   Instalar (compilado com -DINSTALADOR): copia a pasta para %USERPROFILE%\HarnessCAD (dados existentes ficam),
   embute as imagens e cria atalhos com ícone na Área de Trabalho e no Menu Iniciar.
   Compilar: i686-w64-mingw32-gcc -Os -s [-DINSTALADOR] harness_exe.c icone.o -mwindows -lole32 -luuid -lshell32 */
#ifndef UNICODE
#define UNICODE
#endif
#define _UNICODE
#include <windows.h>
#include <shlobj.h>
#include <objbase.h>
#include <shellapi.h>

static const char B64[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
static WCHAR ROOT[MAX_PATH];
static char *OBUF; static int OBN, NFILES; static WCHAR PACK[MAX_PATH];
static char LISTA[8192]; static int LN;

static int existe(const WCHAR *p) { return GetFileAttributesW(p) != INVALID_FILE_ATTRIBUTES; }
static void junta(WCHAR *d, const WCHAR *a, const WCHAR *b) { lstrcpyW(d, a); if (d[lstrlenW(d) - 1] != L'\\') lstrcatW(d, L"\\"); lstrcatW(d, b); }
static int QUIET;
static void msg(const WCHAR *t, UINT f) { if (!QUIET) MessageBoxW(NULL, t, L"HarnessCAD", f); }

static void grava(void) { /* fecha um pNNN.js */
  WCHAR nome[32], p[MAX_PATH]; HANDLE h; DWORD w; char nm[16];
  if (!OBN) return; NFILES++;
  wsprintfW(nome, L"p%03d.js", NFILES); junta(p, PACK, nome); wsprintfA(nm, "p%03d.js", NFILES);
  h = CreateFileW(p, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
  if (h != INVALID_HANDLE_VALUE) { WriteFile(h, OBUF, OBN, &w, NULL); CloseHandle(h); }
  LN += wsprintfA(LISTA + LN, "%s\"%s\"", NFILES > 1 ? "," : "", nm);
  OBN = 0;
}
static void add(const char *s, int n) { CopyMemory(OBUF + OBN, s, n); OBN += n; }
static const char HDR[] = "var H=window.HX_IMG=window.HX_IMG||{};\n";
static void peca(const char *url, const char *b, int n) {
  char t[300]; int k;
  if (OBN && OBN + n + 2 * lstrlenA(url) + 30 > 9000) grava();
  if (!OBN) add(HDR, sizeof(HDR) - 1);
  k = wsprintfA(t, "H['%s']=(H['%s']||'')+'", url, url); add(t, k); add(b, n); add("';\n", 3);
}
static void png(const WCHAR *arq, const char *url) { /* lê, codifica em base64 e reparte em pedaços */
  HANDLE h = CreateFileW(arq, GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, 0, NULL); DWORD n, r; unsigned char *d; char *b; int i, j = 0, L;
  if (h == INVALID_HANDLE_VALUE) return; n = GetFileSize(h, NULL);
  d = HeapAlloc(GetProcessHeap(), 0, n + 3); b = HeapAlloc(GetProcessHeap(), 0, n * 4 / 3 + 64);
  ReadFile(h, d, n, &r, NULL); CloseHandle(h); d[n] = d[n + 1] = 0;
  j = wsprintfA(b, "data:image/png;base64,");
  for (i = 0; i < (int)n; i += 3) {
    unsigned v = d[i] << 16 | d[i + 1] << 8 | d[i + 2];
    b[j++] = B64[v >> 18 & 63]; b[j++] = B64[v >> 12 & 63]; b[j++] = i + 1 < (int)n ? B64[v >> 6 & 63] : '='; b[j++] = i + 2 < (int)n ? B64[v & 63] : '=';
  }
  for (i = 0; i < j; i += L) { L = j - i < 8800 ? j - i : 8800; peca(url, b + i, L); }
  HeapFree(GetProcessHeap(), 0, d); HeapFree(GetProcessHeap(), 0, b);
}
static void varre(const WCHAR *dir, const char *url) {
  WCHAR q[MAX_PATH], p[MAX_PATH]; WIN32_FIND_DATAW f; HANDLE h; char u[260]; int n;
  junta(q, dir, L"*"); h = FindFirstFileW(q, &f); if (h == INVALID_HANDLE_VALUE) return;
  do {
    if (f.cFileName[0] == L'.') continue; junta(p, dir, f.cFileName);
    n = wsprintfA(u, "%s/", url); WideCharToMultiByte(CP_UTF8, 0, f.cFileName, -1, u + n, 200, NULL, NULL);
    if (f.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) varre(p, u);
    else { n = lstrlenW(f.cFileName); if (n > 4 && !lstrcmpiW(f.cFileName + n - 4, L".png")) png(p, u); }
  } while (FindNextFileW(h, &f));
  FindClose(h);
}
static int embute(const WCHAR *raiz, int forca) { /* = ferramentas\embutir_imagens.py */
  WCHAR img[MAX_PATH], p1[MAX_PATH], t[MAX_PATH]; HANDLE h; DWORD w; char s[9000];
  junta(t, raiz, L"web\\js\\imgpack"); lstrcpyW(PACK, t); junta(p1, PACK, L"p001.js");
  if (!forca && existe(p1)) return 1;
  junta(img, raiz, L"web\\img\\ds\\plug_l.png"); if (!existe(img)) return existe(p1); /* pacote sem os PNG: usa o imgpack que veio pronto */
  CreateDirectoryW(PACK, NULL); OBUF = HeapAlloc(GetProcessHeap(), 0, 20000); OBN = NFILES = LN = 0; LISTA[0] = 0;
  junta(img, raiz, L"web\\img"); varre(img, "img"); grava();
  junta(t, PACK, L"lista.js"); h = CreateFileW(t, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
  if (h == INVALID_HANDLE_VALUE) return 0;
  lstrcpyA(s, "window.HX_IMGPACK=["); lstrcatA(s, LISTA); lstrcatA(s, "];\n"); WriteFile(h, s, lstrlenA(s), &w, NULL); CloseHandle(h);
  return NFILES > 0;
}
static int navegador(WCHAR *out) { /* Edge, Chrome ou Firefox instalados */
  static const WCHAR *V[] = { L"ProgramFiles(x86)", L"ProgramFiles", L"LOCALAPPDATA" };
  static const WCHAR *E[] = { L"Microsoft\\Edge\\Application\\msedge.exe", L"Google\\Chrome\\Application\\chrome.exe", L"Mozilla Firefox\\firefox.exe" };
  WCHAR b[MAX_PATH]; int i, j;
  for (j = 0; j < 3; j++) for (i = 0; i < 3; i++) if (GetEnvironmentVariableW(V[i], b, MAX_PATH)) { junta(out, b, E[j]); if (existe(out)) return 1; }
  return 0;
}
static void abre(const WCHAR *raiz) {
  WCHAR idx[MAX_PATH], arg[MAX_PATH + 4], nav[MAX_PATH];
  junta(idx, raiz, L"web\\index.html");
  if (!existe(idx)) { msg(L"Não achei web\\index.html. O HarnessCAD.exe precisa ficar na pasta do programa (junto das pastas web e server).", MB_ICONERROR); return; }
  if (!embute(raiz, 0)) msg(L"Não consegui embutir as imagens em web\\js\\imgpack (pasta só de leitura?). O PDF pode sair sem as imagens.", MB_ICONWARNING);
  wsprintfW(arg, L"\"%s\"", idx);
  if (navegador(nav)) ShellExecuteW(NULL, L"open", nav, arg, raiz, SW_SHOWNORMAL); else ShellExecuteW(NULL, L"open", idx, NULL, raiz, SW_SHOWNORMAL);
}

#ifdef INSTALADOR
static int copia(const WCHAR *de, const WCHAR *para, int dados) {
  WCHAR q[MAX_PATH], a[MAX_PATH], b[MAX_PATH]; WIN32_FIND_DATAW f; HANDLE h; int ok = 1;
  CreateDirectoryW(para, NULL); junta(q, de, L"*"); h = FindFirstFileW(q, &f); if (h == INVALID_HANDLE_VALUE) return 0;
  do {
    if (f.cFileName[0] == L'.' || !lstrcmpiW(f.cFileName, L"__pycache__")) continue;
    junta(a, de, f.cFileName); junta(b, para, f.cFileName);
    if (f.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) ok &= copia(a, b, dados || !lstrcmpiW(f.cFileName, L"dados"));
    else if (!CopyFileW(a, b, dados) && !dados) ok = 0; /* em "dados" nada é sobrescrito */
  } while (FindNextFileW(h, &f));
  FindClose(h); return ok;
}
static void atalho(int csidl, const WCHAR *alvo, const WCHAR *raiz) {
  WCHAR p[MAX_PATH]; IShellLinkW *sl; IPersistFile *pf;
  if (!SHGetSpecialFolderPathW(NULL, p, csidl, TRUE)) return; lstrcatW(p, L"\\HarnessCAD.lnk");
  if (FAILED(CoCreateInstance(&CLSID_ShellLink, NULL, CLSCTX_INPROC_SERVER, &IID_IShellLinkW, (void **)&sl))) return;
  sl->lpVtbl->SetPath(sl, alvo); sl->lpVtbl->SetWorkingDirectory(sl, raiz); sl->lpVtbl->SetIconLocation(sl, alvo, 0);
  sl->lpVtbl->SetDescription(sl, L"HarnessCAD - esquemas e desenho físico de cablagens");
  if (SUCCEEDED(sl->lpVtbl->QueryInterface(sl, &IID_IPersistFile, (void **)&pf))) { pf->lpVtbl->Save(pf, p, TRUE); pf->lpVtbl->Release(pf); }
  sl->lpVtbl->Release(sl);
}
int WINAPI wWinMain(HINSTANCE hi, HINSTANCE hp, PWSTR cmd, int sw) {
  WCHAR src[MAX_PATH], dst[MAX_PATH], t[1100], exe[MAX_PATH]; WCHAR *s; int mesmo;
  QUIET = cmd && cmd[0] == L'/' && (cmd[1] | 32) == L's'; /* /s = silencioso (TI): instala em %USERPROFILE%\\HarnessCAD sem perguntar */
  GetModuleFileNameW(NULL, src, MAX_PATH); s = src + lstrlenW(src); while (s > src && *s != L'\\') s--; *s = 0;
  junta(t, src, L"web\\index.html"); if (!existe(t)) { msg(L"Rode o instalador de dentro da pasta HarnessCAD extraída (junto das pastas web e server).", MB_ICONERROR); return 1; }
  GetEnvironmentVariableW(L"USERPROFILE", t, MAX_PATH); junta(dst, t, L"HarnessCAD"); mesmo = !lstrcmpiW(src, dst);
  wsprintfW(t, L"Instalar o HarnessCAD em:\n%s\n\nSim = instalar ali (projetos em \"dados\" são mantidos)\nNão = usar esta pasta mesmo:\n%s", dst, src);
  if (!mesmo && !QUIET) { int r = MessageBoxW(NULL, t, L"Instalar HarnessCAD", MB_YESNOCANCEL | MB_ICONQUESTION); if (r == IDCANCEL) return 0; if (r == IDNO) lstrcpyW(dst, src); }
  if (lstrcmpiW(src, dst) && !copia(src, dst, 0)) { msg(L"Alguns arquivos não foram copiados (programa aberto? sem permissão?). Feche o HarnessCAD e rode de novo.", MB_ICONWARNING); }
  junta(exe, dst, L"HarnessCAD.exe"); if (!existe(exe)) { msg(L"Falta HarnessCAD.exe na pasta do programa.", MB_ICONERROR); return 1; }
  embute(dst, 1);
  CoInitialize(NULL); atalho(CSIDL_DESKTOPDIRECTORY, exe, dst); atalho(CSIDL_PROGRAMS, exe, dst); CoUninitialize();
  wsprintfW(t, L"HarnessCAD instalado em:\n%s\n\nAtalhos criados na Área de Trabalho e no Menu Iniciar.\nImagens embutidas: o PDF sai com conectores e vistas.\n\nAbrir agora?", dst);
  if (!QUIET && MessageBoxW(NULL, t, L"HarnessCAD", MB_YESNO | MB_ICONINFORMATION) == IDYES) abre(dst);
  (void)hi; (void)hp; (void)cmd; (void)sw; return 0;
}
#else
int WINAPI wWinMain(HINSTANCE hi, HINSTANCE hp, PWSTR cmd, int sw) {
  WCHAR *s; GetModuleFileNameW(NULL, ROOT, MAX_PATH); s = ROOT + lstrlenW(ROOT); while (s > ROOT && *s != L'\\') s--; *s = 0;
  if (cmd && cmd[0] == L'/' && (cmd[1] | 32) == L'e') return embute(ROOT, 1) ? 0 : 2; /* HarnessCAD.exe /embutir: só refaz as imagens */
  abre(ROOT); (void)hi; (void)hp; (void)cmd; (void)sw; return 0;
}
#endif
