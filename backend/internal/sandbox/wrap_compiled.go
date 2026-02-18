package sandbox

import (
	"fmt"
	"regexp"
	"strings"
)

// ─── C++ ─────────────────────────────────────────────────────────────────────

// cppJsonNS is a minimal, self-contained C++ JSON parse/serialise namespace
// embedded into every auto-wrapped solution. It avoids heavy third-party
// libraries, compiles in < 1 s, and handles all LeetCode-common types.
const cppJsonNS = `namespace _json {
static string _t(const string&s){size_t a=s.find_first_not_of(" \t\r\n"),b=s.find_last_not_of(" \t\r\n");return a==string::npos?"":s.substr(a,b-a+1);}
static vector<string> _e(const string&raw){vector<string> v;string s=_t(raw);if(s.empty()||s[0]!='[')return v;int i=1,n=(int)s.size(),depth=0;bool inq=false;string cur;for(;i<n;i++){char c=s[i];if(inq){if(c=='\\'&&i+1<n){cur+=c;cur+=s[++i];}else if(c=='"'){cur+=c;inq=false;}else cur+=c;}else if(c=='"'){cur+=c;inq=true;}else if(c=='['||c=='{'){depth++;cur+=c;}else if((c==']'||c=='}')&&depth==0){string t=_t(cur);if(!t.empty())v.push_back(t);break;}else if(c==']'||c=='}'){depth--;cur+=c;}else if(c==','&&depth==0){string t=_t(cur);if(!t.empty())v.push_back(t);cur="";}else cur+=c;}return v;}
template<typename T>static T _p(const string&);
template<>int _p<int>(const string&s){return stoi(_t(s));}
template<>long long _p<long long>(const string&s){return stoll(_t(s));}
template<>double _p<double>(const string&s){return stod(_t(s));}
template<>bool _p<bool>(const string&s){return _t(s)=="true";}
template<>string _p<string>(const string&s){string t=_t(s);if(t.size()>=2&&t[0]=='"'&&t.back()=='"')t=t.substr(1,t.size()-2);return t;}
template<typename T>static vector<T> _pv(const string&s){auto e=_e(s);vector<T> r;for(auto&x:e)r.push_back(_p<T>(x));return r;}
template<typename T>static vector<vector<T>> _pv2(const string&s){auto e=_e(s);vector<vector<T>> r;for(auto&x:e)r.push_back(_pv<T>(x));return r;}
static string _s(int v){return to_string(v);}
static string _s(long long v){return to_string(v);}
static string _s(double v){ostringstream _o;_o<<v;return _o.str();}
static string _s(bool v){return v?"true":"false";}
static string _s(const string&v){string r="\"";for(char c:v){if(c=='"'||c=='\\')r+='\\';r+=c;}return r+"\"";}
template<typename T>static string _sv(const vector<T>&v){string r="[";for(int i=0;i<(int)v.size();i++){if(i)r+=",";r+=_s(v[i]);}return r+"]";}
template<typename T>static string _sv2(const vector<vector<T>>&v){string r="[";for(int i=0;i<(int)v.size();i++){if(i)r+=",";r+=_sv(v[i]);}return r+"]";}
}
`

// cppPrelude is prepended to every C++ solution that doesn't already have
// standard headers. Contains bits/stdc++.h plus the embedded JSON namespace.
const cppPrelude = "#include <bits/stdc++.h>\nusing namespace std;\n" + cppJsonNS + "\n"

// cppMethodRe matches method definitions inside a C++ Solution class.
// The non-greedy [^(\n]+? for the return type backtracks correctly for
// multi-word types like "long long" or "vector<vector<int>>".
// Capture groups: (1) return type  (2) function name  (3) parameter list
var cppMethodRe = regexp.MustCompile(
	`(?m)^\s{4}(?:static\s+)?([^(\n]+?)\s+([a-z]\w*)\s*\(([^)]*)\)\s*(?:const\s*)?\{`,
)

// wrapCpp prepends standard C++ headers and, when the function signature uses
// only supported JSON-serialisable types, appends a main() that reads one JSON
// value per stdin line, calls Solution::funcName, and prints the JSON result.
func wrapCpp(code string) string {
	// User already wrote their own main — just ensure standard headers exist.
	if strings.Contains(code, "int main(") {
		if !strings.Contains(code, "bits/stdc++") {
			return cppPrelude + code
		}
		return code
	}

	// Prepend headers + embedded JSON namespace if missing.
	if !strings.Contains(code, "bits/stdc++") {
		code = cppPrelude + code
	}

	funcName, retType, paramTypes, ok := parseCppSignature(code)
	if !ok {
		return code // unsupported signature; headers help but no main injected
	}
	return code + "\n" + buildCppMain(funcName, retType, paramTypes)
}

func parseCppSignature(code string) (funcName, retType string, paramTypes []string, ok bool) {
	for _, m := range cppMethodRe.FindAllStringSubmatch(code, -1) {
		fn := strings.TrimSpace(m[2])
		if fn == "main" {
			continue
		}
		paramStr := strings.TrimSpace(m[3])
		var pts []string
		if paramStr != "" && paramStr != "void" {
			parts := splitAngleBracketAware(paramStr)
			valid := true
			for _, p := range parts {
				t, ok2 := cppParamType(p)
				if !ok2 {
					valid = false
					break
				}
				pts = append(pts, t)
			}
			if !valid {
				continue // try next method (might be a helper with complex types)
			}
		}
		return fn, normCppType(strings.TrimSpace(m[1])), pts, true
	}
	return
}

// splitAngleBracketAware splits on commas but ignores commas inside <>.
func splitAngleBracketAware(s string) []string {
	var parts []string
	depth, start := 0, 0
	for i, ch := range s {
		switch ch {
		case '<':
			depth++
		case '>':
			depth--
		case ',':
			if depth == 0 {
				parts = append(parts, strings.TrimSpace(s[start:i]))
				start = i + 1
			}
		}
	}
	if p := strings.TrimSpace(s[start:]); p != "" {
		parts = append(parts, p)
	}
	return parts
}

// cppParamType extracts the normalised type from a declaration like
// "const vector<int>& nums" → "vector<int>"
var cppParamWordRe = regexp.MustCompile(`^(.+?)\s+\w+\s*$`)

func cppParamType(p string) (string, bool) {
	m := cppParamWordRe.FindStringSubmatch(strings.TrimSpace(p))
	if m == nil {
		return "", false
	}
	t := normCppType(m[1])
	if !cppTypeOK(t) {
		return "", false
	}
	return t, true
}

func normCppType(t string) string {
	t = strings.TrimSpace(t)
	for strings.HasPrefix(t, "const ") {
		t = strings.TrimSpace(strings.TrimPrefix(t, "const "))
	}
	t = strings.TrimRight(t, "&* ")
	return strings.TrimSpace(t)
}

var cppOKTypes = map[string]bool{
	"int": true, "long": true, "long long": true, "int64_t": true,
	"double": true, "float": true, "bool": true, "string": true,
	"vector<int>":               true,
	"vector<long>":              true,
	"vector<long long>":         true,
	"vector<string>":            true,
	"vector<double>":            true,
	"vector<bool>":              true,
	"vector<vector<int>>":       true,
	"vector<vector<string>>":    true,
	"vector<vector<long long>>": true,
}

func cppTypeOK(t string) bool { return cppOKTypes[t] }

// cppVecInfo returns (depth, innerBaseType) for a C++ vector type.
// "vector<vector<int>>" → (2, "int"), "vector<int>" → (1, "int"), "int" → (0, "int")
func cppVecInfo(t string) (int, string) {
	if !strings.HasPrefix(t, "vector<") || !strings.HasSuffix(t, ">") {
		return 0, t
	}
	inner := t[7 : len(t)-1]
	d, base := cppVecInfo(inner)
	return d + 1, base
}

// cppTemplateType normalises C++ types to the template parameter used in _json.
// "long" / "int64_t" → "long long", "float" → "double".
func cppTemplateType(base string) string {
	switch base {
	case "long", "int64_t":
		return "long long"
	case "float":
		return "double"
	}
	return base
}

func cppParseExpr(typ, lineExpr string) string {
	depth, base := cppVecInfo(typ)
	tt := cppTemplateType(base)
	switch depth {
	case 0:
		return fmt.Sprintf("_json::_p<%s>(%s)", tt, lineExpr)
	case 1:
		return fmt.Sprintf("_json::_pv<%s>(%s)", tt, lineExpr)
	case 2:
		return fmt.Sprintf("_json::_pv2<%s>(%s)", tt, lineExpr)
	}
	return lineExpr
}

func cppSerializeExpr(typ, varExpr string) string {
	depth, _ := cppVecInfo(typ)
	switch depth {
	case 0:
		return fmt.Sprintf("_json::_s(%s)", varExpr)
	case 1:
		return fmt.Sprintf("_json::_sv(%s)", varExpr)
	case 2:
		return fmt.Sprintf("_json::_sv2(%s)", varExpr)
	}
	return varExpr
}

func buildCppMain(funcName, retType string, paramTypes []string) string {
	var sb strings.Builder
	sb.WriteString("int main() {\n")
	sb.WriteString("    Solution _sol;\n")
	sb.WriteString("    vector<string> _lines;\n")
	sb.WriteString("    {\n")
	sb.WriteString("        string _l;\n")
	sb.WriteString("        while (getline(cin, _l)) {\n")
	sb.WriteString("            _l.erase(0, _l.find_first_not_of(\" \\t\\r\\n\"));\n")
	sb.WriteString("            if (!_l.empty()) _lines.push_back(_l);\n")
	sb.WriteString("        }\n")
	sb.WriteString("    }\n")
	for i, pt := range paramTypes {
		sb.WriteString(fmt.Sprintf(
			"    auto _arg%d = %s;\n", i, cppParseExpr(pt, fmt.Sprintf("_lines[%d]", i))))
	}
	// Build call expression
	args := make([]string, len(paramTypes))
	for i := range paramTypes {
		args[i] = fmt.Sprintf("_arg%d", i)
	}
	call := fmt.Sprintf("_sol.%s(%s)", funcName, strings.Join(args, ", "))
	if retType == "void" {
		sb.WriteString(fmt.Sprintf("    %s;\n", call))
	} else {
		sb.WriteString(fmt.Sprintf("    cout << %s << \"\\n\";\n",
			cppSerializeExpr(retType, call)))
	}
	sb.WriteString("    return 0;\n}\n")
	return sb.String()
}

// ─── Java ────────────────────────────────────────────────────────────────────

// javaImports is prepended to every Java solution so that Gson and standard
// Java IO classes are available in both the user's code and the injected main().
const javaImports = "import com.google.gson.*;\nimport com.google.gson.reflect.*;\nimport java.util.*;\nimport java.io.*;\n\n"

// javaMethodRe matches public method declarations in a Java Solution class.
// Capture groups: (1) return type  (2) method name  (3) parameter list
var javaMethodRe = regexp.MustCompile(
	`(?m)^\s+public\s+(?:static\s+)?([^(\n]+?)\s+([a-z]\w*)\s*\(([^)]*)\)\s*(?:throws\s+[\w,\s]+)?\{`,
)

// wrapJava prepends Gson/IO imports and, when the function signature uses only
// supported types, injects a static main() method before the closing brace of
// the Solution class.
func wrapJava(code string) string {
	// Prepend imports if not already present.
	if !strings.Contains(code, "import com.google.gson") {
		code = javaImports + code
	}
	// If user already has a main, nothing more to do.
	if strings.Contains(code, "static void main") {
		return code
	}

	funcName, retType, paramTypes, ok := parseJavaSignature(code)
	if !ok {
		return code
	}

	main := buildJavaMain(funcName, retType, paramTypes)
	// Inject before the last closing brace (end of the Solution class).
	idx := strings.LastIndex(code, "}")
	if idx < 0 {
		return code
	}
	return code[:idx] + main + "\n}"
}

func parseJavaSignature(code string) (funcName, retType string, paramTypes []string, ok bool) {
	for _, m := range javaMethodRe.FindAllStringSubmatch(code, -1) {
		fn := strings.TrimSpace(m[2])
		if fn == "main" {
			continue
		}
		paramStr := strings.TrimSpace(m[3])
		var pts []string
		if paramStr != "" {
			parts := splitAngleBracketAware(paramStr)
			valid := true
			for _, p := range parts {
				t, ok2 := javaParamType(p)
				if !ok2 {
					valid = false
					break
				}
				pts = append(pts, t)
			}
			if !valid {
				continue
			}
		}
		return fn, strings.TrimSpace(m[1]), pts, true
	}
	return
}

var javaParamWordRe = regexp.MustCompile(`^(.+?)\s+\w+\s*$`)

func javaParamType(p string) (string, bool) {
	p = strings.TrimSpace(p)
	p = strings.TrimPrefix(p, "final ")
	m := javaParamWordRe.FindStringSubmatch(p)
	if m == nil {
		return "", false
	}
	t := strings.TrimSpace(m[1])
	if !javaTypeOK(t) {
		return "", false
	}
	return t, true
}

var javaOKTypes = map[string]bool{
	"int": true, "long": true, "double": true, "float": true,
	"boolean": true, "char": true, "String": true,
	"int[]": true, "long[]": true, "double[]": true,
	"String[]": true, "boolean[]": true, "char[]": true,
	"int[][]": true, "long[][]": true, "String[][]": true,
	"List<Integer>":       true,
	"List<Long>":          true,
	"List<String>":        true,
	"List<Double>":        true,
	"List<Boolean>":       true,
	"List<List<Integer>>": true,
	"List<List<String>>":  true,
}

func javaTypeOK(t string) bool { return javaOKTypes[t] }

func buildJavaMain(funcName, retType string, paramTypes []string) string {
	var sb strings.Builder
	sb.WriteString("\n    public static void main(String[] args) throws Exception {\n")
	sb.WriteString("        Gson _gson = new Gson();\n")
	sb.WriteString("        BufferedReader _br = new BufferedReader(new InputStreamReader(System.in));\n")
	sb.WriteString("        List<String> _lines = new ArrayList<>();\n")
	sb.WriteString("        String _l;\n")
	sb.WriteString("        while ((_l = _br.readLine()) != null) {\n")
	sb.WriteString("            _l = _l.trim();\n")
	sb.WriteString("            if (!_l.isEmpty()) _lines.add(_l);\n")
	sb.WriteString("        }\n")
	sb.WriteString("        Solution _sol = new Solution();\n")
	for i, pt := range paramTypes {
		expr := javaDeserialize(pt, fmt.Sprintf("_lines.get(%d)", i))
		sb.WriteString(fmt.Sprintf("        %s _arg%d = %s;\n", pt, i, expr))
	}
	args := make([]string, len(paramTypes))
	for i := range paramTypes {
		args[i] = fmt.Sprintf("_arg%d", i)
	}
	call := fmt.Sprintf("_sol.%s(%s)", funcName, strings.Join(args, ", "))
	if retType == "void" {
		sb.WriteString(fmt.Sprintf("        %s;\n", call))
	} else {
		sb.WriteString(fmt.Sprintf("        System.out.println(_gson.toJson(%s));\n", call))
	}
	sb.WriteString("    }\n")
	return sb.String()
}

func javaDeserialize(typ, expr string) string {
	switch typ {
	case "int":
		return fmt.Sprintf("_gson.fromJson(%s, Integer.class)", expr)
	case "long":
		return fmt.Sprintf("_gson.fromJson(%s, Long.class)", expr)
	case "double":
		return fmt.Sprintf("_gson.fromJson(%s, Double.class)", expr)
	case "float":
		return fmt.Sprintf("_gson.fromJson(%s, Float.class)", expr)
	case "boolean":
		return fmt.Sprintf("_gson.fromJson(%s, Boolean.class)", expr)
	case "String":
		return fmt.Sprintf("_gson.fromJson(%s, String.class)", expr)
	case "int[]":
		return fmt.Sprintf("_gson.fromJson(%s, int[].class)", expr)
	case "long[]":
		return fmt.Sprintf("_gson.fromJson(%s, long[].class)", expr)
	case "double[]":
		return fmt.Sprintf("_gson.fromJson(%s, double[].class)", expr)
	case "String[]":
		return fmt.Sprintf("_gson.fromJson(%s, String[].class)", expr)
	case "boolean[]":
		return fmt.Sprintf("_gson.fromJson(%s, boolean[].class)", expr)
	case "char[]":
		return fmt.Sprintf("_gson.fromJson(%s, char[].class)", expr)
	case "int[][]":
		return fmt.Sprintf("_gson.fromJson(%s, int[][].class)", expr)
	case "long[][]":
		return fmt.Sprintf("_gson.fromJson(%s, long[][].class)", expr)
	case "String[][]":
		return fmt.Sprintf("_gson.fromJson(%s, String[][].class)", expr)
	case "List<Integer>":
		return fmt.Sprintf("_gson.fromJson(%s, new TypeToken<List<Integer>>(){}.getType())", expr)
	case "List<Long>":
		return fmt.Sprintf("_gson.fromJson(%s, new TypeToken<List<Long>>(){}.getType())", expr)
	case "List<String>":
		return fmt.Sprintf("_gson.fromJson(%s, new TypeToken<List<String>>(){}.getType())", expr)
	case "List<Double>":
		return fmt.Sprintf("_gson.fromJson(%s, new TypeToken<List<Double>>(){}.getType())", expr)
	case "List<Boolean>":
		return fmt.Sprintf("_gson.fromJson(%s, new TypeToken<List<Boolean>>(){}.getType())", expr)
	case "List<List<Integer>>":
		return fmt.Sprintf("_gson.fromJson(%s, new TypeToken<List<List<Integer>>>(){}.getType())", expr)
	case "List<List<String>>":
		return fmt.Sprintf("_gson.fromJson(%s, new TypeToken<List<List<String>>>(){}.getType())", expr)
	default:
		return fmt.Sprintf("_gson.fromJson(%s, Object.class)", expr)
	}
}
