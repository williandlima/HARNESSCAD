// HarnessCAD - armazenamento em pasta (mesma estrutura do store.py)
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;

public class HarnessStore {
    static final Pattern NAME = Pattern.compile("^[\\w\\-. ]{1,80}$");
    static final int KEEP = 30;
    final Path data, proj, bak, info, lib;
    final Object lock = new Object();

    public static class Conflict extends Exception { }

    HarnessStore(Path data) throws IOException {
        this.data = data; proj = data.resolve("projects"); bak = proj.resolve(".bak"); info = proj.resolve(".info"); lib = data.resolve("library");
        for (Path p : new Path[]{proj, bak, info, lib}) Files.createDirectories(p);
    }

    static String safeName(String n) {
        if (n == null) return null;
        n = n.trim();
        if (n.toLowerCase().endsWith(".json")) n = n.substring(0, n.length() - 5);
        return NAME.matcher(n).matches() && !n.startsWith(".") ? n : null;
    }

    static String safeKey(String k) {
        if (k == null) return null;
        k = k.trim();
        return k.startsWith("USR:") && k.length() <= 120 && k.indexOf('\n') < 0 && k.indexOf('\r') < 0 ? k : null;
    }

    static String esc(String s) {
        StringBuilder b = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (c == '"' || c == '\\') b.append('\\').append(c);
            else if (c < 32) b.append(String.format("\\u%04x", (int) c));
            else b.append(c);
        }
        return b.toString();
    }

    static double mtime(Path p) throws IOException { return Files.getLastModifiedTime(p).toMillis() / 1000.0; }

    static String read(Path p) throws IOException { return new String(Files.readAllBytes(p), StandardCharsets.UTF_8); }

    static void write(Path p, byte[] d) throws IOException {
        Path tmp = p.resolveSibling(p.getFileName() + ".tmp");
        Files.write(tmp, d);
        try { Files.move(tmp, p, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE); }
        catch (AtomicMoveNotSupportedException e) { Files.move(tmp, p, StandardCopyOption.REPLACE_EXISTING); }
    }

    Path path(String name, boolean backup) { return (backup ? bak : proj).resolve(name + ".json"); }

    String listProjects() throws IOException {
        StringBuilder b = new StringBuilder("[");
        try (DirectoryStream<Path> ds = Files.newDirectoryStream(proj, "*.json")) {
            for (Path p : ds) {
                String f = p.getFileName().toString(), user = "";
                Path ip = info.resolve(f);
                if (Files.exists(ip)) { java.util.regex.Matcher m = Pattern.compile("\"user\":\"((?:[^\"\\\\]|\\\\.)*)\"").matcher(read(ip)); if (m.find()) user = m.group(1); }
                if (b.length() > 1) b.append(',');
                b.append("{\"name\":\"").append(esc(f.substring(0, f.length() - 5))).append("\",\"mtime\":").append(mtime(p))
                    .append(",\"size\":").append(Files.size(p)).append(",\"user\":\"").append(user).append("\"}");
            }
        }
        return b.append(']').toString();
    }

    /** Retorna JSON {project, mtime, name} ou null se não existe. */
    String loadProject(String name, boolean backup) throws IOException {
        Path p = path(name, backup);
        if (!Files.exists(p)) return null;
        String txt = read(p).trim();
        if (!txt.startsWith("{") || !txt.endsWith("}")) throw new IOException("Arquivo do projeto corrompido no servidor (" + name + "). Recupere um backup.");
        return "{\"project\":" + txt + ",\"mtime\":" + mtime(p) + ",\"name\":\"" + esc(name) + "\"}";
    }

    void backup(String name) throws IOException {
        Path src = path(name, false);
        if (!Files.exists(src)) return;
        String st = new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date(Files.getLastModifiedTime(src).toMillis()));
        Files.copy(src, bak.resolve(name + "__" + st + ".json"), StandardCopyOption.REPLACE_EXISTING);
        List<String> l = new ArrayList<>();
        try (DirectoryStream<Path> ds = Files.newDirectoryStream(bak, name + "__*.json")) { for (Path p : ds) l.add(p.getFileName().toString()); }
        Collections.sort(l);
        for (int i = 0; i < l.size() - KEEP; i++) Files.deleteIfExists(bak.resolve(l.get(i)));
    }

    double saveProject(String name, byte[] d, Double base, String user, String ip) throws IOException, Conflict {
        Path p = path(name, false);
        synchronized (lock) {
            if (base != null && Files.exists(p) && Math.abs(mtime(p) - base) > 0.001) throw new Conflict();
            backup(name); write(p, d);
            write(info.resolve(name + ".json"), ("{\"user\":\"" + esc(user) + "\",\"ip\":\"" + esc(ip) + "\",\"time\":" + System.currentTimeMillis() / 1000.0 + "}").getBytes(StandardCharsets.UTF_8));
            return mtime(p);
        }
    }

    boolean deleteProject(String name) throws IOException {
        synchronized (lock) {
            if (!Files.exists(path(name, false))) return false;
            backup(name); Files.delete(path(name, false)); return true;
        }
    }

    String listBackups(String name) throws IOException {
        List<String> l = new ArrayList<>();
        try (DirectoryStream<Path> ds = Files.newDirectoryStream(bak, name + "__*.json")) {
            for (Path p : ds) { String f = p.getFileName().toString(); l.add("{\"name\":\"" + esc(f.substring(0, f.length() - 5)) + "\",\"mtime\":" + mtime(p) + "}"); }
        }
        Collections.sort(l, Collections.reverseOrder());
        return "[" + String.join(",", l) + "]";
    }

    Path libPath(String key) throws IOException {
        try {
            byte[] h = MessageDigest.getInstance("SHA-1").digest(key.getBytes(StandardCharsets.UTF_8));
            StringBuilder b = new StringBuilder(); for (byte x : h) b.append(String.format("%02x", x));
            return lib.resolve(b + ".lib");
        } catch (Exception e) { throw new IOException(e); }
    }

    String library() throws IOException {
        StringBuilder b = new StringBuilder("{");
        try (DirectoryStream<Path> ds = Files.newDirectoryStream(lib, "*.lib")) {
            for (Path p : ds) {
                String t = read(p); int i = t.indexOf('\n'); if (i < 0) continue;
                if (b.length() > 1) b.append(',');
                b.append('"').append(esc(t.substring(0, i))).append("\":").append(t.substring(i + 1));
            }
        }
        return b.append('}').toString();
    }

    void saveLib(String key, byte[] d) throws IOException {
        byte[] k = (key + "\n").getBytes(StandardCharsets.UTF_8), all = new byte[k.length + d.length];
        System.arraycopy(k, 0, all, 0, k.length); System.arraycopy(d, 0, all, k.length, d.length);
        synchronized (lock) { write(libPath(key), all); }
    }

    boolean deleteLib(String key) throws IOException { synchronized (lock) { return Files.deleteIfExists(libPath(key)); } }
}
