// HarnessCAD - servidor Java 8+ sem bibliotecas (mesma API do server.py)
// javac *.java  &&  java HarnessServer 8080 ..\web ..\dados [admins: joao,maria,10.0.0.5]
import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.Executors;

public class HarnessServer {
    static final String VERSION = "1.1.0";
    static final int MAX = 30 * 1024 * 1024;
    static Path web;
    static HarnessStore st;
    static final Set<String> ADMINS = new HashSet<>();

    static class HttpErr extends Exception { final int code; HttpErr(int c, String m) { super(m); code = c; } }

    public static void main(String[] a) throws Exception {
        int port = a.length > 0 ? Integer.parseInt(a[0]) : 8080;
        web = Paths.get(a.length > 1 ? a[1] : "../web").toAbsolutePath().normalize();
        st = new HarnessStore(Paths.get(a.length > 2 ? a[2] : "../dados").toAbsolutePath().normalize());
        if (a.length > 3) for (String s : a[3].split(",")) if (!s.trim().isEmpty()) ADMINS.add(s.trim().toLowerCase());
        HttpServer s = HttpServer.create(new InetSocketAddress(port), 0);
        s.createContext("/", HarnessServer::handle);
        s.setExecutor(Executors.newFixedThreadPool(16));
        s.start();
        System.out.println("HarnessCAD " + VERSION + " (Java) em http://0.0.0.0:" + port + "  dados: " + st.data + "  admins: " + (ADMINS.isEmpty() ? "todos" : ADMINS));
    }

    static String dec(String s) throws UnsupportedEncodingException { return URLDecoder.decode(s.replace("+", "%2B"), "UTF-8"); }

    static String user(HttpExchange x) throws UnsupportedEncodingException {
        String u = x.getRequestHeaders().getFirst("X-User");
        u = u == null ? "" : dec(u);
        return u.length() > 40 ? u.substring(0, 40) : u;
    }

    static String ip(HttpExchange x) { return x.getRemoteAddress().getAddress().getHostAddress(); }

    static boolean admin(HttpExchange x) throws IOException { return ADMINS.isEmpty() || ADMINS.contains(user(x).toLowerCase()) || ADMINS.contains(ip(x)); }

    static void send(HttpExchange x, int code, String json) throws IOException {
        byte[] d = json.getBytes(StandardCharsets.UTF_8);
        x.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        x.getResponseHeaders().set("Cache-Control", "no-store");
        x.sendResponseHeaders(code, d.length);
        try (OutputStream o = x.getResponseBody()) { o.write(d); }
    }

    static byte[] body(HttpExchange x) throws IOException, HttpErr {
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        byte[] buf = new byte[65536]; int n; InputStream in = x.getRequestBody();
        while ((n = in.read(buf)) > 0) { o.write(buf, 0, n); if (o.size() > MAX) throw new HttpErr(400, "Corpo muito grande"); }
        String t = new String(o.toByteArray(), StandardCharsets.UTF_8).trim();
        if (!t.startsWith("{") || !t.endsWith("}")) throw new HttpErr(400, "JSON inválido (esperado objeto)");
        return o.toByteArray();
    }

    static String name(String a) throws HttpErr {
        String n = HarnessStore.safeName(a);
        if (n == null) throw new HttpErr(400, "Nome inválido (use letras, números, espaço, - _ .)");
        return n;
    }

    static void handle(HttpExchange x) throws IOException {
        try {
            String path = x.getRequestURI().getRawPath(), m = x.getRequestMethod();
            if (!path.startsWith("/api/")) {
                if (!"GET".equals(m)) throw new HttpErr(405, "Método não permitido");
                serveStatic(x, path); return;
            }
            String[] r = path.substring(5).split("/", 2);
            route(x, m, r[0], r.length > 1 ? dec(r[1]) : "");
        } catch (HttpErr e) {
            send(x, e.code, "{\"error\":\"" + HarnessStore.esc(e.getMessage()) + "\"}");
        } catch (Exception e) {
            System.err.println("ERRO " + e);
            try { send(x, 500, "{\"error\":\"Erro interno: " + HarnessStore.esc(String.valueOf(e.getMessage())) + "\"}"); } catch (IOException ignore) { }
        } finally { x.close(); }
    }

    static void route(HttpExchange x, String m, String what, String arg) throws Exception {
        String k = m + " " + what;
        switch (k) {
            case "GET ping":
                send(x, 200, "{\"app\":\"HarnessCAD\",\"version\":\"" + VERSION + "\",\"server\":\"java\",\"time\":" + System.currentTimeMillis() / 1000.0
                    + ",\"user\":\"" + HarnessStore.esc(user(x)) + "\",\"ip\":\"" + ip(x) + "\",\"admin\":" + admin(x) + "}");
                return;
            case "GET projects": {
                if (arg.isEmpty()) { send(x, 200, st.listProjects()); return; }
                boolean b = arg.startsWith(".bak/");
                String j = st.loadProject(name(b ? arg.substring(5) : arg), b);
                if (j == null) throw new HttpErr(404, "Projeto não encontrado");
                send(x, 200, j); return;
            }
            case "PUT projects": {
                String n = name(arg); byte[] d = body(x); String hb = x.getRequestHeaders().getFirst("X-Base-Mtime"); Double base = null;
                if (hb != null && !hb.isEmpty()) try { base = Double.parseDouble(hb); } catch (NumberFormatException e) { throw new HttpErr(400, "Cabeçalho X-Base-Mtime inválido"); }
                try { send(x, 200, "{\"ok\":true,\"mtime\":" + st.saveProject(n, d, base, user(x), ip(x)) + ",\"name\":\"" + HarnessStore.esc(n) + "\"}"); }
                catch (HarnessStore.Conflict c) { throw new HttpErr(409, "Arquivo alterado por outro usuário"); }
                return;
            }
            case "DELETE projects":
                if (!admin(x)) throw new HttpErr(403, "Sem permissão para excluir (peça a um administrador)");
                if (!st.deleteProject(name(arg))) throw new HttpErr(404, "Projeto não encontrado");
                send(x, 200, "{\"ok\":true}"); return;
            case "GET backups": send(x, 200, st.listBackups(name(arg))); return;
            case "GET library": send(x, 200, st.library()); return;
            case "PUT library": {
                String key = HarnessStore.safeKey(arg);
                if (key == null) throw new HttpErr(400, "Chave inválida (deve começar com USR: e ter até 120 caracteres)");
                st.saveLib(key, body(x)); send(x, 200, "{\"ok\":true,\"key\":\"" + HarnessStore.esc(key) + "\"}"); return;
            }
            case "DELETE library": {
                if (!admin(x)) throw new HttpErr(403, "Sem permissão para excluir");
                String key = HarnessStore.safeKey(arg);
                if (key == null || !st.deleteLib(key)) throw new HttpErr(404, "Item não encontrado");
                send(x, 200, "{\"ok\":true}"); return;
            }
            default: throw new HttpErr(404, "Rota desconhecida");
        }
    }

    static void serveStatic(HttpExchange x, String raw) throws IOException, HttpErr {
        String path = dec(raw);
        if (path.endsWith("/")) path += "index.html";
        Path f;
        try { f = web.resolve(path.substring(1)).normalize(); } catch (InvalidPathException e) { throw new HttpErr(404, "Não encontrado"); }
        if (!f.startsWith(web) || !Files.isRegularFile(f)) throw new HttpErr(404, "Não encontrado");
        String fn = f.toString().toLowerCase(), ct = (fn.endsWith(".js") ? "application/javascript" : fn.endsWith(".css") ? "text/css"
            : fn.endsWith(".html") ? "text/html" : "application/octet-stream") + "; charset=utf-8";
        byte[] d = Files.readAllBytes(f);
        x.getResponseHeaders().set("Content-Type", ct);
        x.getResponseHeaders().set("Cache-Control", "no-cache");
        x.sendResponseHeaders(200, d.length);
        try (OutputStream o = x.getResponseBody()) { o.write(d); }
    }
}
