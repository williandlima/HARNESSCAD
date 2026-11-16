/* HarnessCAD - INSTALADOR ÚNICO (Setup_HarnessCAD.exe): o programa inteiro vai embutido no próprio .exe.
   Ao rodar: pergunta a pasta (padrão %USERPROFILE%\HarnessCAD), extrai tudo sem apagar projetos da pasta "dados",
   chama Instalar_HarnessCAD.exe /s (imagens embutidas + atalhos na Área de Trabalho e no Menu Iniciar) e oferece abrir.
   Sem Python, sem zip, Windows 7+ (32 bits). Conteúdo anexado ao fim do .exe pelo script montar_setup.py:
   [u16 tam][caminho UTF-8][u32 tam][dados]... depois [u32 qtd][u32 início]["HXSETUP1"]. */
#include <windows.h>
#include <shlobj.h>
static WCHAR T[2048];
static int msg(const WCHAR *s, UINT f) { return MessageBoxW(NULL, s, L"Instalar HarnessCAD", f); }
static void mkdirs(WCHAR *p) { WCHAR *s; for (s = p + 3; *s; s++) if (*s == L'\\') { *s = 0; CreateDirectoryW(p, NULL); *s = L'\\'; } }
static int existe(const WCHAR *p) { return GetFileAttributesW(p) != INVALID_FILE_ATTRIBUTES; }
static int pasta(WCHAR *dst) { // escolher outra pasta (diálogo do Windows)
  BROWSEINFOW bi; LPITEMIDLIST id; ZeroMemory(&bi, sizeof bi); bi.lpszTitle = L"Escolha onde instalar (será criada a pasta HarnessCAD dentro dela)";
  bi.ulFlags = BIF_RETURNONLYFSDIRS | BIF_NEWDIALOGSTYLE; id = SHBrowseForFolderW(&bi); if (!id) return 0;
  SHGetPathFromIDListW(id, dst); CoTaskMemFree(id); if (dst[lstrlenW(dst) - 1] != L'\\') lstrcatW(dst, L"\\"); lstrcatW(dst, L"HarnessCAD"); return 1;
}
int WINAPI wWinMain(HINSTANCE hi, HINSTANCE hp, PWSTR cmd, int sw) {
  WCHAR exe[MAX_PATH], dst[MAX_PATH], out[MAX_PATH * 2], rel[600]; HANDLE f, o; DWORD sz, rd, n, i, start, wr; unsigned char tail[16], *buf; char path[600];
  int quiet = cmd && cmd[0] == L'/' && (cmd[1] | 32) == L's', ruins = 0, novos = 0, r;
  GetModuleFileNameW(NULL, exe, MAX_PATH);
  f = CreateFileW(exe, GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, 0, NULL); if (f == INVALID_HANDLE_VALUE) { msg(L"Não consegui ler o instalador.", MB_ICONERROR); return 1; }
  sz = GetFileSize(f, NULL); SetFilePointer(f, sz - 16, NULL, FILE_BEGIN); ReadFile(f, tail, 16, &rd, NULL);
  if (rd != 16 || memcmp(tail + 8, "HXSETUP1", 8)) { msg(L"Instalador incompleto (download cortado?). Baixe de novo.", MB_ICONERROR); return 1; }
  n = *(DWORD *)tail; start = *(DWORD *)(tail + 4);
  CoInitialize(NULL);
  GetEnvironmentVariableW(L"USERPROFILE", dst, MAX_PATH); lstrcatW(dst, L"\\HarnessCAD");
  if (!quiet) {
    wsprintfW(T, L"Instalar o HarnessCAD %s em:\n\n%s\n\nSim = instalar aqui\nNão = escolher outra pasta\n\nProjetos salvos na pasta \"dados\" são mantidos.", L"1.6.15", dst);
    r = msg(T, MB_YESNOCANCEL | MB_ICONQUESTION); if (r == IDCANCEL) return 0; if (r == IDNO && !pasta(dst)) return 0;
  }
  buf = HeapAlloc(GetProcessHeap(), 0, 4 << 20); SetFilePointer(f, start, NULL, FILE_BEGIN);
  for (i = 0; i < n; i++) {
    WORD pl = 0; DWORD fl = 0, k; int dados;
    if (!ReadFile(f, &pl, 2, &rd, NULL) || rd != 2 || pl >= sizeof path) { ruins++; break; }
    ReadFile(f, path, pl, &rd, NULL); path[pl] = 0; ReadFile(f, &fl, 4, &rd, NULL);
    if (fl > (4u << 20)) { ruins++; break; } ReadFile(f, buf, fl, &rd, NULL); if (rd != fl) { ruins++; break; }
    MultiByteToWideChar(CP_UTF8, 0, path, -1, rel, 600); for (k = 0; rel[k]; k++) if (rel[k] == L'/') rel[k] = L'\\';
    wsprintfW(out, L"%s\\%s", dst, rel); mkdirs(out);
    dados = !wcsncmp(rel, L"dados\\", 6);
    if (dados && existe(out)) continue; /* nunca sobrescreve projetos/biblioteca do usuário */
    o = CreateFileW(out, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
    if (o == INVALID_HANDLE_VALUE) { ruins++; continue; } WriteFile(o, buf, fl, &wr, NULL); CloseHandle(o); if (wr != fl) ruins++; else novos++;
  }
  CloseHandle(f);
  { const WCHAR *E[] = { L"dados\\library\\x", L"dados\\projects\\.info\\x", L"dados\\projects\\.bak\\x" }; int j; for (j = 0; j < 3; j++) { wsprintfW(out, L"%s\\%s", dst, E[j]); mkdirs(out); } } /* pastas vazias */
  if (ruins) { wsprintfW(T, L"%d arquivo(s) não foram gravados (HarnessCAD aberto? sem permissão na pasta?).\nFeche o programa e rode o instalador de novo.", ruins); msg(T, MB_ICONWARNING); }
  wsprintfW(out, L"%s\\Instalar_HarnessCAD.exe", dst);
  if (existe(out)) { SHELLEXECUTEINFOW se; ZeroMemory(&se, sizeof se); se.cbSize = sizeof se; se.fMask = SEE_MASK_NOCLOSEPROCESS; se.lpFile = out; se.lpParameters = L"/s"; se.lpDirectory = dst; se.nShow = SW_HIDE;
    if (ShellExecuteExW(&se) && se.hProcess) { WaitForSingleObject(se.hProcess, 60000); CloseHandle(se.hProcess); } }
  wsprintfW(T, L"HarnessCAD instalado em:\n%s\n\n%d arquivos gravados. Atalhos na Área de Trabalho e no Menu Iniciar.\n\nAbrir agora?", dst, novos);
  if (!quiet && msg(T, MB_YESNO | MB_ICONINFORMATION) == IDYES) { wsprintfW(out, L"%s\\HarnessCAD.exe", dst); ShellExecuteW(NULL, L"open", out, NULL, dst, SW_SHOWNORMAL); }
  CoUninitialize(); (void)hi; (void)hp; (void)sw; return 0;
}
