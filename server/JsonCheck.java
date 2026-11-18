// HarnessCAD - validador de JSON (RFC 8259) sem bibliotecas, para o servidor Java 8+.
// Só confere a sintaxe: o servidor guarda os bytes como vieram, mas nunca um JSON inválido
// (um item inválido na biblioteca quebraria a resposta de GET /api/library para todos).
public final class JsonCheck {
    private final String s;
    private int i;
    private static final int MAX_DEPTH = 512;

    private JsonCheck(String s) { this.s = s; }

    /** true se o texto é exatamente um objeto JSON válido (espaços em volta são aceitos). */
    public static boolean isObject(String text) {
        if (text == null) return false;
        JsonCheck c = new JsonCheck(text);
        try {
            c.ws();
            if (c.i >= c.s.length() || c.s.charAt(c.i) != '{') return false;
            c.value(0);
            c.ws();
            return c.i == c.s.length();
        } catch (IllegalArgumentException | StringIndexOutOfBoundsException e) {
            return false;
        }
    }

    private void ws() {
        while (i < s.length()) {
            char c = s.charAt(i);
            if (c == ' ' || c == '\t' || c == '\n' || c == '\r') i++; else break;
        }
    }

    private static IllegalArgumentException bad() { return new IllegalArgumentException("JSON inválido"); }

    private void expect(char c) { if (i >= s.length() || s.charAt(i) != c) throw bad(); i++; }

    private void value(int depth) {
        if (depth > MAX_DEPTH) throw bad();
        ws();
        if (i >= s.length()) throw bad();
        char c = s.charAt(i);
        if (c == '{') object(depth);
        else if (c == '[') array(depth);
        else if (c == '"') string();
        else if (c == '-' || (c >= '0' && c <= '9')) number();
        else if (s.startsWith("true", i)) i += 4;
        else if (s.startsWith("false", i)) i += 5;
        else if (s.startsWith("null", i)) i += 4;
        else throw bad();
    }

    private void object(int depth) {
        expect('{'); ws();
        if (i < s.length() && s.charAt(i) == '}') { i++; return; }
        while (true) {
            ws(); string(); ws(); expect(':'); value(depth + 1); ws();
            if (i < s.length() && s.charAt(i) == ',') { i++; continue; }
            expect('}'); return;
        }
    }

    private void array(int depth) {
        expect('['); ws();
        if (i < s.length() && s.charAt(i) == ']') { i++; return; }
        while (true) {
            value(depth + 1); ws();
            if (i < s.length() && s.charAt(i) == ',') { i++; continue; }
            expect(']'); return;
        }
    }

    private void string() {
        expect('"');
        while (true) {
            if (i >= s.length()) throw bad();
            char c = s.charAt(i++);
            if (c == '"') return;
            if (c < 0x20) throw bad();
            if (c == '\\') {
                char e = s.charAt(i++);
                if (e == 'u') {
                    for (int k = 0; k < 4; k++) if (Character.digit(s.charAt(i++), 16) < 0) throw bad();
                } else if ("\"\\/bfnrt".indexOf(e) < 0) throw bad();
            }
        }
    }

    private void number() {
        if (s.charAt(i) == '-') i++;
        if (i >= s.length()) throw bad();
        if (s.charAt(i) == '0') i++;
        else digits();
        if (i < s.length() && s.charAt(i) == '.') { i++; digits(); }
        if (i < s.length() && (s.charAt(i) == 'e' || s.charAt(i) == 'E')) {
            i++;
            if (i < s.length() && (s.charAt(i) == '+' || s.charAt(i) == '-')) i++;
            digits();
        }
    }

    private void digits() {
        int st = i;
        while (i < s.length() && s.charAt(i) >= '0' && s.charAt(i) <= '9') i++;
        if (i == st) throw bad();
    }
}
