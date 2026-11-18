/* HarnessCAD - ATUALIZAÇÃO AUTOMÁTICA (dentro do HarnessCAD.exe, roda a cada abertura pelo atalho).
   1. Lê a versão instalada (web\js\core.js).
   2. Procura um Setup_HarnessCAD*.exe mais novo (lê a versão de dentro dele) em: pastas listadas em
      dados\atualizar.txt (uma por linha: pasta da rede \\servidor\..., pendrive...), Downloads, Área de Trabalho e
      Área de Trabalho\GERAL.
   3. Com internet (no máximo 5 s, 1 vez por dia): versão no GitHub; se for mais nova, baixa o instalador.
   4. Pergunta (ou não, com "perguntar=0" no atualizar.txt) e roda o Setup em silêncio na mesma pasta
      (/s /d=<pasta> /a): dados\ fica intacto e o programa reabre já atualizado.
   atualizar.txt também aceita "internet=0" (não procura no GitHub). HarnessCAD.exe /n abre sem procurar. */
#ifndef UNICODE
#define UNICODE
#endif
#include <windows.h>
#include <urlmon.h>
#include <shellapi.h>
#define URLV L"https://raw.githubusercontent.com/williandlima/HARNESSCAD/main/web/js/core.js"
#define URLS L"https://raw.githubusercontent.com/williandlima/HARNESSCAD/main/atualizacao/Setup_HarnessCAD.exe"
static WCHAR BEST[MAX_PATH], TMPV[MAX_PATH], TMPS[MAX_PATH]; static long BV;
static long vnum(const char *s, int n) { /* procura VERSION = 'a.b.c' no texto */
  int i; for (i = 0; i + 20 < n; i++) if (!memcmp(s + i, "VERSION = '", 11)) { long a = 0, p = 0, v[3] = { 0, 0, 0 }; const char *q = s + i + 11;
    for (; *q && *q != '\'' && p < 3; q++) if (*q == '.') p++; else if (*q >= '0' && *q <= '9') v[p] = v[p] * 10 + *q - '0'; else break;
    a = v[0] * 1000000 + v[1] * 1000 + v[2]; return a; } return 0;
}
static long vfile(const WCHAR *p) { HANDLE h = CreateFileW(p, GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, 0, NULL); char b[4096]; DWORD r = 0;
  if (h == INVALID_HANDLE_VALUE) return 0; ReadFile(h, b, sizeof b - 1, &r, NULL); CloseHandle(h); b[r] = 0; return vnum(b, r); }
static long vsetup(const WCHAR *p) { /* versão do core.js embutido no Setup (formato do montar_setup.py) */
  HANDLE h = CreateFileW(p, GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, 0, NULL); unsigned char t[16]; char nm[600], b[4096]; DWORD r, sz, n, i, fl; WORD pl; long v = 0;
  if (h == INVALID_HANDLE_VALUE) return 0; sz = GetFileSize(h, NULL);
  if (sz < 64) goto fim; SetFilePointer(h, sz - 16, NULL, FILE_BEGIN); ReadFile(h, t, 16, &r, NULL); if (r != 16 || memcmp(t + 8, "HXSETUP1", 8)) goto fim;
  n = *(DWORD *)t; SetFilePointer(h, *(DWORD *)(t + 4), NULL, FILE_BEGIN);
  for (i = 0; i < n; i++) { if (!ReadFile(h, &pl, 2, &r, NULL) || r != 2 || pl >= sizeof nm) break; ReadFile(h, nm, pl, &r, NULL); nm[pl] = 0; ReadFile(h, &fl, 4, &r, NULL);
    if (!lstrcmpA(nm, "web/js/core.js")) { ReadFile(h, b, fl < sizeof b - 1 ? fl : sizeof b - 1, &r, NULL); b[r] = 0; v = vnum(b, r); break; }
    SetFilePointer(h, fl, NULL, FILE_CURRENT); }
fim: CloseHandle(h); return v;
}
static void cand(const WCHAR *dir) { WCHAR q[MAX_PATH], p[MAX_PATH]; WIN32_FIND_DATAW f; HANDLE h; long v;
  if (!dir[0]) return; wsprintfW(q, L"%s\\Setup_HarnessCAD*.exe", dir); h = FindFirstFileW(q, &f); if (h == INVALID_HANDLE_VALUE) return;
  do { wsprintfW(p, L"%s\\%s", dir, f.cFileName); v = vsetup(p); if (v > BV) { BV = v; lstrcpyW(BEST, p); } } while (FindNextFileW(h, &f)); FindClose(h); }
static DWORD WINAPI net(LPVOID x) { WCHAR u[300]; long v; wsprintfW(u, L"%s?t=%u", URLV, GetTickCount());
  if (URLDownloadToFileW(NULL, u, TMPV, 0, NULL) != S_OK || (v = vfile(TMPV)) <= BV) return 0;
  wsprintfW(u, L"%s?t=%u", URLS, GetTickCount()); if (URLDownloadToFileW(NULL, u, TMPS, 0, NULL) == S_OK && vsetup(TMPS) > BV) { BV = vsetup(TMPS); lstrcpyW(BEST, TMPS); }
  (void)x; return 0; }
static char *opt(char *cfg, const char *k) { char *s = strstr(cfg, k); return s && (s == cfg || s[-1] == '\n') ? s + lstrlenA(k) : NULL; }
/* devolve 1 se iniciou a atualização (o HarnessCAD.exe deve sair) */
int hx_atualiza(const WCHAR *root) {
  WCHAR p[MAX_PATH], d[MAX_PATH], arg[MAX_PATH + 40], t[700], dia[16]; char cfg[4096] = "", *s, *e; DWORD r = 0; HANDLE h; long cur; SYSTEMTIME st; int perg = 1, inet = 1;
  wsprintfW(p, L"%s\\web\\js\\core.js", root); BV = cur = vfile(p); if (!cur) return 0; BEST[0] = 0;
  wsprintfW(p, L"%s\\dados\\atualizar.txt", root); h = CreateFileW(p, GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, 0, NULL);
  if (h != INVALID_HANDLE_VALUE) { ReadFile(h, cfg, sizeof cfg - 1, &r, NULL); CloseHandle(h); cfg[r] = 0; }
  if (opt(cfg, "perguntar=0")) perg = 0; if (opt(cfg, "internet=0")) inet = 0;
  for (s = cfg[0] == '\xEF' && cfg[1] == '\xBB' ? cfg + 3 : cfg; *s; s = e) { char *l; e = s; while (*e && *e != '\n') e++; l = e; if (*e) *e++ = 0; if (l > s && l[-1] == '\r') l[-1] = 0;
    if (*s && *s != '#' && !strchr(s, '=')) { if (!MultiByteToWideChar(CP_UTF8, MB_ERR_INVALID_CHARS, s, -1, d, MAX_PATH)) MultiByteToWideChar(CP_ACP, 0, s, -1, d, MAX_PATH); /* Bloco de Notas do Win7 grava ANSI */
      while (lstrlenW(d) > 3 && d[lstrlenW(d) - 1] == L'\\') d[lstrlenW(d) - 1] = 0; cand(d); } }
  if (GetEnvironmentVariableW(L"USERPROFILE", d, MAX_PATH)) { wsprintfW(p, L"%s\\Downloads", d); cand(p); wsprintfW(p, L"%s\\Desktop", d); cand(p); wsprintfW(p, L"%s\\Desktop\\GERAL", d); cand(p); }
  GetLocalTime(&st); wsprintfW(dia, L"%04d%02d%02d", st.wYear, st.wMonth, st.wDay); wsprintfW(p, L"%s\\dados\\.verificado", root);
  GetTempPathW(MAX_PATH, d); wsprintfW(TMPV, L"%shx_versao.js", d); wsprintfW(TMPS, L"%sSetup_HarnessCAD_novo.exe", d);
  if (lstrlenW(d) > 3) d[lstrlenW(d) - 1] = 0; cand(d); /* baixado antes e recusado: continua oferecendo */
  if (inet && !BEST[0]) { char o[16] = ""; h = CreateFileW(p, GENERIC_READ, 0, NULL, OPEN_EXISTING, 0, NULL); if (h != INVALID_HANDLE_VALUE) { ReadFile(h, o, 15, &r, NULL); CloseHandle(h); o[r] = 0; }
    MultiByteToWideChar(CP_ACP, 0, o, -1, t, 16);
    if (lstrcmpW(t, dia)) { HANDLE th = CreateThread(NULL, 0, net, NULL, 0, NULL); if (th) { if (WaitForSingleObject(th, 5000) == WAIT_OBJECT_0) {
        char a[16]; WideCharToMultiByte(CP_ACP, 0, dia, -1, a, 16, NULL, NULL); h = CreateFileW(p, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_HIDDEN, NULL);
        if (h != INVALID_HANDLE_VALUE) { WriteFile(h, a, 8, &r, NULL); CloseHandle(h); } } else BEST[0] = 0; CloseHandle(th); } } }
  if (!BEST[0] || BV <= cur) return 0;
  wsprintfW(t, L"Nova versão do HarnessCAD: %d.%d.%d (instalada: %d.%d.%d).\n\nOrigem: %s\n\nAtualizar agora? Os projetos e a biblioteca (pasta dados) são mantidos.",
    BV / 1000000, BV / 1000 % 1000, BV % 1000, cur / 1000000, cur / 1000 % 1000, cur % 1000, BEST);
  if (perg && MessageBoxW(NULL, t, L"Atualizar HarnessCAD", MB_YESNO | MB_ICONQUESTION) != IDYES) return 0;
  GetTempPathW(MAX_PATH, d); wsprintfW(p, L"%shx_setup_run.exe", d); if (!CopyFileW(BEST, p, FALSE)) lstrcpyW(p, BEST);
  wsprintfW(arg, L"/s /a /d=%s", root);
  return (INT_PTR)ShellExecuteW(NULL, L"open", p, arg, d, SW_SHOWNORMAL) > 32;
}
