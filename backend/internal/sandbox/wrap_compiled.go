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
template<>uint32_t _p<uint32_t>(const string&s){return (uint32_t)stoul(_t(s));}
template<>double _p<double>(const string&s){return stod(_t(s));}
template<>bool _p<bool>(const string&s){return _t(s)=="true";}
template<>string _p<string>(const string&s){string t=_t(s);if(t.size()>=2&&t[0]=='"'&&t.back()=='"')t=t.substr(1,t.size()-2);return t;}
template<>char _p<char>(const string&s){string t=_t(s);if(t.size()>=2&&t[0]=='"'&&t.back()=='"')t=t.substr(1,t.size()-2);return t.empty()?' ':t[0];}
template<typename T>static vector<T> _pv(const string&s){auto e=_e(s);vector<T> r;for(auto&x:e)r.push_back(_p<T>(x));return r;}
template<typename T>static vector<vector<T>> _pv2(const string&s){auto e=_e(s);vector<vector<T>> r;for(auto&x:e)r.push_back(_pv<T>(x));return r;}
static string _s(int v){return to_string(v);}
static string _s(uint32_t v){return to_string(v);}
static string _s(long long v){return to_string(v);}
static string _s(double v){ostringstream _o;_o<<v;return _o.str();}
static string _s(bool v){return v?"true":"false";}
static string _s(char v){string r="\"";r+=v;return r+"\"";}
static string _s(const string&v){string r="\"";for(char c:v){if(c=='"'||c=='\\')r+='\\';r+=c;}return r+"\"";}
template<typename T>static string _sv(const vector<T>&v){string r="[";for(int i=0;i<(int)v.size();i++){if(i)r+=",";r+=_s(v[i]);}return r+"]";}
template<typename T>static string _sv2(const vector<vector<T>>&v){string r="[";for(int i=0;i<(int)v.size();i++){if(i)r+=",";r+=_sv(v[i]);}return r+"]";}
}
`

// cppNodeDefs provides ListNode, TreeNode structs and helpers that mirror LeetCode's definitions.
// Includes JSON array → linked list / binary tree deserialization and back.
const cppNodeDefs = `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};
class Node {
public:
    int val;
    Node* left;
    Node* right;
    Node* next;
    Node* random;
    vector<Node*> neighbors;
    vector<Node*> children;
    Node() : val(0), left(nullptr), right(nullptr), next(nullptr), random(nullptr) {}
    Node(int _val) : val(_val), left(nullptr), right(nullptr), next(nullptr), random(nullptr) {}
    Node(int _val, Node* _left, Node* _right, Node* _next) : val(_val), left(_left), right(_right), next(_next), random(nullptr) {}
    Node(int _val, vector<Node*> _children) : val(_val), left(nullptr), right(nullptr), next(nullptr), random(nullptr), children(_children) {}
};
namespace _node {
static ListNode* buildList(const string& s) {
    auto elems = _json::_e(s);
    ListNode dummy; ListNode* tail = &dummy;
    for (auto& e : elems) {
        string t = _json::_t(e);
        if (t == "null") continue;
        tail->next = new ListNode(stoi(t));
        tail = tail->next;
    }
    return dummy.next;
}
static string serializeList(ListNode* head) {
    string r = "[";
    bool first = true;
    for (; head; head = head->next) {
        if (!first) r += ",";
        r += to_string(head->val);
        first = false;
    }
    return r + "]";
}
static TreeNode* buildTree(const string& s) {
    auto elems = _json::_e(s);
    if (elems.empty()) return nullptr;
    string rt = _json::_t(elems[0]);
    if (rt == "null" || rt.empty()) return nullptr;
    TreeNode* root = new TreeNode(stoi(rt));
    queue<TreeNode*> q;
    q.push(root);
    int i = 1, n = (int)elems.size();
    while (!q.empty() && i < n) {
        TreeNode* node = q.front(); q.pop();
        if (i < n) {
            string v = _json::_t(elems[i]);
            if (v != "null" && !v.empty()) {
                node->left = new TreeNode(stoi(v));
                q.push(node->left);
            }
            i++;
        }
        if (i < n) {
            string v = _json::_t(elems[i]);
            if (v != "null" && !v.empty()) {
                node->right = new TreeNode(stoi(v));
                q.push(node->right);
            }
            i++;
        }
    }
    return root;
}
static string serializeTree(TreeNode* root) {
    if (!root) return "[]";
    string r = "[";
    queue<TreeNode*> q;
    q.push(root);
    bool first = true;
    vector<string> parts;
    while (!q.empty()) {
        TreeNode* node = q.front(); q.pop();
        if (node) {
            parts.push_back(to_string(node->val));
            q.push(node->left);
            q.push(node->right);
        } else {
            parts.push_back("null");
        }
    }
    while (!parts.empty() && parts.back() == "null") parts.pop_back();
    for (int i = 0; i < (int)parts.size(); i++) {
        if (i) r += ",";
        r += parts[i];
    }
    return r + "]";
}
static Node* buildNodeTree(const string& s) {
    auto elems = _json::_e(s);
    if (elems.empty()) return nullptr;
    string rt = _json::_t(elems[0]);
    if (rt == "null" || rt.empty()) return nullptr;
    Node* root = new Node(stoi(rt));
    queue<Node*> q;
    q.push(root);
    int i = 2, n = (int)elems.size(); // skip root and first null separator
    while (!q.empty() && i < n) {
        Node* parent = q.front(); q.pop();
        if (!parent->children.empty()) parent->children.clear();
        while (i < n) {
            string v = _json::_t(elems[i]);
            i++;
            if (v == "null") break; // null separator between sibling groups
            Node* child = new Node(stoi(v));
            parent->children.push_back(child);
            q.push(child);
        }
    }
    return root;
}
static string serializeNodeTree(Node* root) {
    if (!root) return "[]";
    vector<string> parts;
    parts.push_back(to_string(root->val));
    parts.push_back("null");
    queue<Node*> q;
    q.push(root);
    while (!q.empty()) {
        Node* node = q.front(); q.pop();
        for (auto* child : node->children) {
            parts.push_back(to_string(child->val));
            q.push(child);
        }
        parts.push_back("null");
    }
    while (!parts.empty() && parts.back() == "null") parts.pop_back();
    string r = "[";
    for (int i = 0; i < (int)parts.size(); i++) {
        if (i) r += ",";
        r += parts[i];
    }
    return r + "]";
}
static vector<ListNode*> buildListArray(const string& s) {
    auto elems = _json::_e(s);
    vector<ListNode*> res;
    for (auto& e : elems) res.push_back(buildList(e));
    return res;
}
static string serializeListArray(const vector<ListNode*>& arr) {
    string r = "[";
    for (int i = 0; i < (int)arr.size(); i++) {
        if (i) r += ",";
        r += serializeList(arr[i]);
    }
    return r + "]";
}
static vector<TreeNode*> buildTreeArray(const string& s) {
    auto elems = _json::_e(s);
    vector<TreeNode*> res;
    for (auto& e : elems) res.push_back(buildTree(e));
    return res;
}
static string serializeTreeArray(const vector<TreeNode*>& arr) {
    string r = "[";
    for (int i = 0; i < (int)arr.size(); i++) {
        if (i) r += ",";
        r += serializeTree(arr[i]);
    }
    return r + "]";
}
static vector<Node*> buildNodeArray(const string& s) {
    auto elems = _json::_e(s);
    vector<Node*> res;
    for (auto& e : elems) res.push_back(buildNodeTree(e));
    return res;
}
static string serializeNodeArray(const vector<Node*>& arr) {
    string r = "[";
    for (int i = 0; i < (int)arr.size(); i++) {
        if (i) r += ",";
        r += serializeNodeTree(arr[i]);
    }
    return r + "]";
}
}
`

// cppPrelude is prepended to every C++ solution that doesn't already have
// standard headers. Contains bits/stdc++.h plus the embedded JSON namespace.
// cppNodeDefsNoNode is like cppNodeDefs but without the Node class.
// Used when the solution defines its own Node class (segment tree, trie, etc.).
const cppNodeDefsNoNode = `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};
`

// Variant Node definitions for special problem types
const cppNodeQuadTree = `
class Node {
public:
    bool val;
    bool isLeaf;
    Node* topLeft;
    Node* topRight;
    Node* bottomLeft;
    Node* bottomRight;
    Node() : val(false), isLeaf(false), topLeft(nullptr), topRight(nullptr), bottomLeft(nullptr), bottomRight(nullptr) {}
    Node(bool _val, bool _isLeaf) : val(_val), isLeaf(_isLeaf), topLeft(nullptr), topRight(nullptr), bottomLeft(nullptr), bottomRight(nullptr) {}
    Node(bool _val, bool _isLeaf, Node* _tl, Node* _tr, Node* _bl, Node* _br) : val(_val), isLeaf(_isLeaf), topLeft(_tl), topRight(_tr), bottomLeft(_bl), bottomRight(_br) {}
};
`

const cppNodeDoublyLinked = `
class Node {
public:
    int val;
    Node* prev;
    Node* next;
    Node* child;
    Node() : val(0), prev(nullptr), next(nullptr), child(nullptr) {}
    Node(int _val) : val(_val), prev(nullptr), next(nullptr), child(nullptr) {}
    Node(int _val, Node* _prev, Node* _next, Node* _child) : val(_val), prev(_prev), next(_next), child(_child) {}
};
`

const cppNodeWithParent = `
class Node {
public:
    int val;
    Node* left;
    Node* right;
    Node* parent;
    Node() : val(0), left(nullptr), right(nullptr), parent(nullptr) {}
    Node(int _val) : val(_val), left(nullptr), right(nullptr), parent(nullptr) {}
};
`

// detectNodeVariant checks the code for field access patterns to determine which Node variant to inject.
// Returns the appropriate C++ Node definition, or empty string if no variant detected.
func detectCppNodeVariant(code string) string {
	if strings.Contains(code, "topLeft") || strings.Contains(code, "bottomLeft") || strings.Contains(code, "isLeaf") {
		return cppNodeQuadTree
	}
	if (strings.Contains(code, "->child") && !strings.Contains(code, "->children")) ||
		(strings.Contains(code, "->prev") && strings.Contains(code, "->next")) {
		return cppNodeDoublyLinked
	}
	if strings.Contains(code, "->parent") {
		return cppNodeWithParent
	}
	return ""
}

const cppPrelude = "#include <bits/stdc++.h>\nusing namespace std;\n" + cppJsonNS + "\n" + cppNodeDefs
const cppPreludeNoNode = "#include <bits/stdc++.h>\nusing namespace std;\n" + cppJsonNS + "\n" + cppNodeDefsNoNode

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
// cppStripNodeDefs removes user-defined ListNode/TreeNode structs that would
// conflict with our prelude definitions. Only removes standalone struct defs,
// not those inside comments (which are harmless).
var cppNodeDefRe = regexp.MustCompile(`(?ms)^(?:struct|class)\s+(ListNode|TreeNode)\s*\{[^}]*\};\s*\n?`)

// cppStdNodeRe matches only the standard LeetCode Node class (with val + left/right/next/random/children/neighbors).
// It does NOT strip user-defined Node classes used for segment trees, tries, etc.
var cppStdNodeRe = regexp.MustCompile(`(?ms)^class\s+Node\s*\{[^}]*?\bval\b[^}]*?\b(?:next|left|children|neighbors|random)\b[^}]*\};\s*\n?`)

// cppSolutionClassRe detects the presence of a "class Solution" declaration.
var cppSolutionClassRe = regexp.MustCompile(`(?m)^class\s+Solution\b`)

// cppSolCtorWithParamsRe matches "    Solution(params)" inside a class body.
var cppSolCtorWithParamsRe = regexp.MustCompile(`(?m)^\s+Solution\s*\(\s*\S`)

// isCppDesignSolution detects "class Solution" with a parameterized constructor.
// Example: class Solution { public: Solution(int[] nums) { ... } int[] reset() { ... } }
// These are design-class problems where the class name happens to be "Solution".
func isCppDesignSolution(code string) bool {
	solBody := extractCppClassBody(code, "Solution")
	if solBody == "" {
		return false
	}
	// Check if Solution has a constructor with parameters
	return cppSolCtorWithParamsRe.MatchString(solBody)
}

func wrapCpp(code string) string {
	// User already wrote their own main — just ensure standard headers exist.
	if strings.Contains(code, "int main(") {
		if !strings.Contains(code, "bits/stdc++") {
			return cppPrelude + code
		}
		return code
	}

	// Check if user defines their own Node class (segment tree, trie, etc.)
	// Strip comments first to avoid false positives from commented-out definitions
	codeNoComments := stripCComments(code)
	hasCustomNode := regexp.MustCompile(`(?m)^class\s+Node\s*\{`).MatchString(codeNoComments)

	// Strip user-defined ListNode/TreeNode to avoid redefinition.
	code = cppNodeDefRe.ReplaceAllString(code, "")
	// Only strip Node if it's the standard LeetCode Node (with val+next/left/etc.)
	// Don't strip custom Node classes used for segment trees, tries, etc.
	if !hasCustomNode {
		code = cppStdNodeRe.ReplaceAllString(code, "")
	}

	// Prepend headers + embedded JSON namespace if missing.
	if !strings.Contains(code, "bits/stdc++") {
		if hasCustomNode {
			code = cppPreludeNoNode + code
		} else {
			// Check if code needs a variant Node (QuadTree, DoublyLinked, WithParent)
			if variant := detectCppNodeVariant(code); variant != "" {
				code = cppPreludeNoNode + variant + code
			} else {
				code = cppPrelude + code
			}
		}
	}

	// Inject API stubs for interactive problems (read4, isBadVersion, guess)
	code = injectCppApiStubs(code)

	// Design-class detection:
	// 1. No "class Solution" present → use design-class wrapper
	// 2. "class Solution" with a parameterized constructor → design-class (like Shuffle an Array)
	if !cppSolutionClassRe.MatchString(code) || isCppDesignSolution(code) {
		if main := buildCppDesignMain(code); main != "" {
			return code + "\n" + main
		}
		return code
	}

	funcName, retType, paramTypes, ok := parseCppSignature(code)
	if !ok {
		return code // unsupported signature; headers help but no main injected
	}
	return code + "\n" + buildCppMain(funcName, retType, paramTypes)
}

func parseCppSignature(code string) (funcName, retType string, paramTypes []string, ok bool) {
	// Extract only the body of "class Solution { ... }" to avoid matching
	// methods from helper classes (Trie, BinaryIndexedTree, etc.).
	solBody := extractCppClassBody(code, "Solution")
	searchCode := solBody
	if searchCode == "" {
		searchCode = code // fallback: search entire code
	}

	for _, m := range cppMethodRe.FindAllStringSubmatch(searchCode, -1) {
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

// extractCppClassBody returns the body of a specific class (between { and matching }).
func extractCppClassBody(code, className string) string {
	marker := "class " + className
	idx := strings.Index(code, marker)
	if idx < 0 {
		return ""
	}
	braceStart := strings.Index(code[idx:], "{")
	if braceStart < 0 {
		return ""
	}
	braceStart += idx
	depth := 0
	for i := braceStart; i < len(code); i++ {
		if code[i] == '{' {
			depth++
		} else if code[i] == '}' {
			depth--
			if depth == 0 {
				return code[braceStart : i+1]
			}
		}
	}
	return ""
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
var cppParamWordRe = regexp.MustCompile(`^(.+?)\s+[&*]*\w+\s*$`)

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
	// Preserve pointer for node types (ListNode*, TreeNode*)
	isPtr := strings.HasSuffix(strings.TrimRight(t, " &"), "*")
	base := strings.TrimRight(t, "&* ")
	base = strings.TrimSpace(base)
	if isPtr && (base == "ListNode" || base == "TreeNode" || base == "Node") {
		return base + "*"
	}
	return base
}

var cppOKTypes = map[string]bool{
	"int": true, "long": true, "long long": true, "int64_t": true,
	"uint32_t": true, "unsigned int": true,
	"double": true, "float": true, "bool": true, "string": true, "char": true,
	"vector<int>":               true,
	"vector<long>":              true,
	"vector<long long>":         true,
	"vector<string>":            true,
	"vector<double>":            true,
	"vector<bool>":              true,
	"vector<char>":              true,
	"vector<vector<int>>":       true,
	"vector<vector<string>>":    true,
	"vector<vector<long long>>": true,
	"vector<vector<char>>":      true,
	// Node types
	"ListNode*":         true,
	"TreeNode*":         true,
	"Node*":             true,
	"vector<ListNode*>": true,
	"vector<TreeNode*>": true,
	"vector<Node*>":     true,
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
	// Handle node pointer types
	switch typ {
	case "ListNode*":
		return fmt.Sprintf("_node::buildList(%s)", lineExpr)
	case "TreeNode*":
		return fmt.Sprintf("_node::buildTree(%s)", lineExpr)
	case "Node*":
		return fmt.Sprintf("_node::buildNodeTree(%s)", lineExpr)
	case "vector<ListNode*>":
		return fmt.Sprintf("_node::buildListArray(%s)", lineExpr)
	case "vector<TreeNode*>":
		return fmt.Sprintf("_node::buildTreeArray(%s)", lineExpr)
	case "vector<Node*>":
		return fmt.Sprintf("_node::buildNodeArray(%s)", lineExpr)
	}
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
	// Handle node pointer types
	switch typ {
	case "ListNode*":
		return fmt.Sprintf("_node::serializeList(%s)", varExpr)
	case "TreeNode*":
		return fmt.Sprintf("_node::serializeTree(%s)", varExpr)
	case "Node*":
		return fmt.Sprintf("_node::serializeNodeTree(%s)", varExpr)
	case "vector<ListNode*>":
		return fmt.Sprintf("_node::serializeListArray(%s)", varExpr)
	case "vector<TreeNode*>":
		return fmt.Sprintf("_node::serializeTreeArray(%s)", varExpr)
	case "vector<Node*>":
		return fmt.Sprintf("_node::serializeNodeArray(%s)", varExpr)
	}
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
		// For void (in-place) functions, print the first argument after modification
		if len(paramTypes) > 0 {
			sb.WriteString(fmt.Sprintf("    cout << %s << \"\\n\";\n",
				cppSerializeExpr(paramTypes[0], "_arg0")))
		}
	} else {
		sb.WriteString(fmt.Sprintf("    cout << %s << \"\\n\";\n",
			cppSerializeExpr(retType, call)))
	}
	sb.WriteString("    return 0;\n}\n")
	return sb.String()
}

// stripPublicFromNonSolutionClasses removes the "public" modifier from class declarations
// that aren't "class Solution". Java requires public class to match filename, but we
// compile everything as Solution.java.
func stripPublicFromNonSolutionClasses(code string) string {
	re := regexp.MustCompile(`(?m)^public\s+(class\s+(\w+))`)
	return re.ReplaceAllStringFunc(code, func(match string) string {
		m := re.FindStringSubmatch(match)
		if m != nil && m[2] != "Solution" {
			return m[1] // strip "public " prefix
		}
		return match
	})
}

// stripCComments removes C/C++/Java block comments (/* ... */) and line comments (// ...).
// Used for checking code structure without being confused by commented-out definitions.
func stripCComments(code string) string {
	var result strings.Builder
	i := 0
	for i < len(code) {
		if i+1 < len(code) && code[i] == '/' && code[i+1] == '*' {
			// Block comment: skip to */
			j := strings.Index(code[i+2:], "*/")
			if j >= 0 {
				i = i + 2 + j + 2
			} else {
				break // unterminated comment
			}
		} else if i+1 < len(code) && code[i] == '/' && code[i+1] == '/' {
			// Line comment: skip to end of line
			j := strings.Index(code[i:], "\n")
			if j >= 0 {
				i = i + j
			} else {
				break
			}
		} else {
			result.WriteByte(code[i])
			i++
		}
	}
	return result.String()
}

// ─── C++ API Stubs ───────────────────────────────────────────────────────────

// injectCppApiStubs adds stub implementations for platform-provided API functions
// like read4(), isBadVersion(), and guess() when the solution calls them.
func injectCppApiStubs(code string) string {
	codeNC := stripCComments(code) // check without comments
	var stubs []string

	// read4 API (problems 157, 158)
	if strings.Contains(code, "read4(") && !strings.Contains(codeNC, "int read4(") {
		stubs = append(stubs, `static string _read4_buf;
static int _read4_pos = 0;
int read4(char* buf) {
    int cnt = 0;
    while (cnt < 4 && _read4_pos < (int)_read4_buf.size()) {
        buf[cnt++] = _read4_buf[_read4_pos++];
    }
    return cnt;
}`)
	}

	// isBadVersion API (problem 278)
	if strings.Contains(code, "isBadVersion(") && !strings.Contains(codeNC, "bool isBadVersion(") {
		stubs = append(stubs, `static int _bad_version = 1;
bool isBadVersion(int version) { return version >= _bad_version; }`)
	}

	// guess API (problem 374)
	if strings.Contains(code, "guess(") && !strings.Contains(codeNC, "int guess(") {
		stubs = append(stubs, `static int _pick = 1;
int guess(int num) { if (num == _pick) return 0; return num > _pick ? -1 : 1; }`)
	}

	if len(stubs) == 0 {
		return code
	}

	// Insert stubs before the Solution class
	stubStr := strings.Join(stubs, "\n") + "\n"
	if idx := strings.Index(code, "class Solution"); idx >= 0 {
		return code[:idx] + stubStr + code[idx:]
	}
	return stubStr + code
}

// ─── C++ Design-Class ────────────────────────────────────────────────────────

// cppDesignClassRe finds the primary design class name (not ListNode/TreeNode/Node).
var cppDesignClassRe = regexp.MustCompile(`(?m)^class\s+(\w+)\s*(?::\s*[^{]*)?\{`)

// cppPublicMethodRe matches public method declarations inside any class.
// Groups: (1) return type  (2) method name  (3) parameter list
var cppPublicMethodRe = regexp.MustCompile(
	`(?m)^\s{4}(?:static\s+)?([^(\n]+?)\s+([a-z]\w*)\s*\(([^)]*)\)\s*(?:const\s*)?\{`,
)

// cppCtorRe matches a constructor: "    ClassName(" with optional params.
// Groups: (1) class name  (2) parameter list
var cppCtorRe = regexp.MustCompile(
	`(?m)^\s{4}(\w+)\s*\(([^)]*)\)\s*(?::\s*[^{]*)?\{`,
)

type cppMethodInfo struct {
	Name       string
	RetType    string
	ParamTypes []string
	ParamNames []string
}

// parseCppDesignClass extracts the class name, constructor params, and all methods.
// When multiple classes exist, picks the one with the most public methods.
func parseCppDesignClass(code string) (className string, ctorParams []string, methods []cppMethodInfo, ok bool) {
	skipClasses := map[string]bool{"ListNode": true, "TreeNode": true, "Node": true, "Solution": true}

	// Collect all candidate class names
	var candidates []string
	for _, m := range cppDesignClassRe.FindAllStringSubmatch(code, -1) {
		name := m[1]
		if !skipClasses[name] {
			candidates = append(candidates, name)
		}
	}
	if len(candidates) == 0 {
		return
	}

	// Pick the LAST candidate class that has public methods.
	// In LeetCode design problems, helper classes come first and the main
	// design class (e.g., MyCalendarThree) is defined last.
	for i := len(candidates) - 1; i >= 0; i-- {
		cand := candidates[i]
		_, cp, ms, ok2 := parseCppDesignClassByName(code, cand)
		if ok2 && len(ms) > 0 {
			className = cand
			ctorParams = cp
			methods = ms
			ok = true
			return
		}
	}
	return
}

// parseCppDesignClassByName parses a specific C++ class by name.
func parseCppDesignClassByName(code, className string) (string, []string, []cppMethodInfo, bool) {
	// Extract the class body (from "class ClassName {" to its matching "};")
	classStart := strings.Index(code, "class "+className)
	if classStart < 0 {
		return className, nil, nil, false
	}
	braceStart := strings.Index(code[classStart:], "{")
	if braceStart < 0 {
		return className, nil, nil, false
	}
	braceStart += classStart
	depth := 0
	classEnd := -1
	for i := braceStart; i < len(code); i++ {
		if code[i] == '{' {
			depth++
		} else if code[i] == '}' {
			depth--
			if depth == 0 {
				classEnd = i + 1
				break
			}
		}
	}
	if classEnd < 0 {
		classEnd = len(code)
	}
	classBody := code[braceStart:classEnd]

	// Find constructor parameters
	var ctorParams []string
	for _, m := range cppCtorRe.FindAllStringSubmatch(classBody, -1) {
		if m[1] == className {
			paramStr := strings.TrimSpace(m[2])
			if paramStr != "" && paramStr != "void" {
				for _, p := range splitAngleBracketAware(paramStr) {
					if t, ok2 := cppParamType(p); ok2 {
						ctorParams = append(ctorParams, t)
					}
				}
			}
			break
		}
	}

	// Find all public methods (skip constructor and destructor).
	// Track public/private scope — only include methods from public sections.
	var methods []cppMethodInfo
	inPublic := false
	for _, line := range strings.Split(classBody, "\n") {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "public:") {
			inPublic = true
			continue
		}
		if strings.HasPrefix(trimmed, "private:") || strings.HasPrefix(trimmed, "protected:") {
			inPublic = false
			continue
		}
		if !inPublic {
			continue
		}
		m := cppPublicMethodRe.FindStringSubmatch(line)
		if m == nil {
			continue
		}
		fn := strings.TrimSpace(m[2])
		if fn == className || fn == "main" {
			continue
		}
		retType := normCppType(strings.TrimSpace(m[1]))
		paramStr := strings.TrimSpace(m[3])
		var pts []string
		var pns []string
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
				pn := cppParamName(p)
				pns = append(pns, pn)
			}
			if !valid {
				continue
			}
		}
		methods = append(methods, cppMethodInfo{
			Name:       fn,
			RetType:    retType,
			ParamTypes: pts,
			ParamNames: pns,
		})
	}

	return className, ctorParams, methods, len(methods) > 0
}

// cppParamName extracts the parameter name from a declaration like "const vector<int>& nums".
func cppParamName(p string) string {
	p = strings.TrimSpace(p)
	// Take the last word token
	parts := strings.Fields(p)
	if len(parts) == 0 {
		return "_p"
	}
	last := parts[len(parts)-1]
	// Strip leading & or *
	last = strings.TrimLeft(last, "&*")
	if last == "" {
		return "_p"
	}
	return last
}

func buildCppDesignMain(code string) string {
	className, ctorParams, methods, ok := parseCppDesignClass(code)
	// If no external design class found, try Solution itself (parameterized ctor)
	if !ok && cppSolutionClassRe.MatchString(code) {
		_, ctorParams, methods, ok = parseCppDesignClassByName(code, "Solution")
		if ok {
			className = "Solution"
		}
	}
	if !ok {
		return ""
	}

	var sb strings.Builder
	sb.WriteString("int main() {\n")
	sb.WriteString("    // Read ops and args from stdin\n")
	sb.WriteString("    string _line1, _line2;\n")
	sb.WriteString("    {\n")
	sb.WriteString("        string _l;\n")
	sb.WriteString("        vector<string> _ls;\n")
	sb.WriteString("        while (getline(cin, _l)) {\n")
	sb.WriteString("            _l.erase(0, _l.find_first_not_of(\" \\t\\r\\n\"));\n")
	sb.WriteString("            if (!_l.empty()) _ls.push_back(_l);\n")
	sb.WriteString("        }\n")
	sb.WriteString("        _line1 = _ls[0];\n")
	sb.WriteString("        _line2 = _ls[1];\n")
	sb.WriteString("    }\n")

	// Parse operations array (line 1 is JSON array of strings)
	sb.WriteString("    auto _ops = _json::_pv<string>(_line1);\n")
	// Parse args array (line 2 is JSON array of arrays) — we parse as raw strings
	sb.WriteString("    auto _args_raw = _json::_e(_line2);\n")
	sb.WriteString("    string _out = \"[\";\n")

	// Constructor
	sb.WriteString("    // Constructor\n")
	sb.WriteString("    auto _ctor_args = _json::_e(_args_raw[0]);\n")
	if len(ctorParams) == 0 {
		sb.WriteString(fmt.Sprintf("    %s* _obj = new %s();\n", className, className))
	} else {
		for i, pt := range ctorParams {
			sb.WriteString(fmt.Sprintf("    auto _ca%d = %s;\n", i, cppParseExpr(pt, fmt.Sprintf("_ctor_args[%d]", i))))
		}
		args := make([]string, len(ctorParams))
		for i := range ctorParams {
			args[i] = fmt.Sprintf("_ca%d", i)
		}
		sb.WriteString(fmt.Sprintf("    %s* _obj = new %s(%s);\n", className, className, strings.Join(args, ", ")))
	}
	sb.WriteString("    _out += \"null\";\n")

	// Method dispatch loop
	sb.WriteString("    for (int _i = 1; _i < (int)_ops.size(); _i++) {\n")
	sb.WriteString("        _out += \",\";\n")
	sb.WriteString("        auto _ma = _json::_e(_args_raw[_i]);\n")
	sb.WriteString("        string _op = _ops[_i];\n")

	for mi, m := range methods {
		cond := "if"
		if mi > 0 {
			cond = "} else if"
		}
		sb.WriteString(fmt.Sprintf("        %s (_op == \"%s\") {\n", cond, m.Name))

		// Parse arguments
		for pi, pt := range m.ParamTypes {
			sb.WriteString(fmt.Sprintf("            auto _a%d = %s;\n", pi, cppParseExpr(pt, fmt.Sprintf("_ma[%d]", pi))))
		}
		args := make([]string, len(m.ParamTypes))
		for pi := range m.ParamTypes {
			args[pi] = fmt.Sprintf("_a%d", pi)
		}

		call := fmt.Sprintf("_obj->%s(%s)", m.Name, strings.Join(args, ", "))
		if m.RetType == "void" {
			sb.WriteString(fmt.Sprintf("            %s;\n", call))
			sb.WriteString("            _out += \"null\";\n")
		} else {
			sb.WriteString(fmt.Sprintf("            _out += %s;\n", cppSerializeExpr(m.RetType, call)))
		}
	}
	if len(methods) > 0 {
		sb.WriteString("        } else {\n")
		sb.WriteString("            _out += \"null\";\n")
		sb.WriteString("        }\n")
	}

	sb.WriteString("    }\n")
	sb.WriteString("    _out += \"]\";\n")
	sb.WriteString("    cout << _out << \"\\n\";\n")
	sb.WriteString("    delete _obj;\n")
	sb.WriteString("    return 0;\n")
	sb.WriteString("}\n")
	return sb.String()
}

// ─── Java ────────────────────────────────────────────────────────────────────

// javaNodeDefs provides ListNode and TreeNode class definitions and helper methods.
const javaNodeDefs = `
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }
}
class Node {
    public int val;
    public Node left;
    public Node right;
    public Node next;
    public Node random;
    public List<Node> neighbors;
    public List<Node> children;
    public Node() {}
    public Node(int _val) { val = _val; }
    public Node(int _val, List<Node> _children) { val = _val; children = _children; }
    public Node(int _val, Node _left, Node _right, Node _next) { val = _val; left = _left; right = _right; next = _next; }
}
`

// javaNodeDefsNoNode is like javaNodeDefs but without the Node class.
const javaNodeDefsNoNode = `
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }
}
`

// Java variant Node definitions
const javaNodeQuadTree = `
class Node {
    public boolean val;
    public boolean isLeaf;
    public Node topLeft;
    public Node topRight;
    public Node bottomLeft;
    public Node bottomRight;
    public Node() {}
    public Node(boolean val, boolean isLeaf) { this.val = val; this.isLeaf = isLeaf; }
    public Node(boolean val, boolean isLeaf, Node topLeft, Node topRight, Node bottomLeft, Node bottomRight) {
        this.val = val; this.isLeaf = isLeaf; this.topLeft = topLeft; this.topRight = topRight;
        this.bottomLeft = bottomLeft; this.bottomRight = bottomRight;
    }
}
`

const javaNodeDoublyLinked = `
class Node {
    public int val;
    public Node prev;
    public Node next;
    public Node child;
    public Node() {}
    public Node(int val) { this.val = val; }
    public Node(int val, Node prev, Node next, Node child) {
        this.val = val; this.prev = prev; this.next = next; this.child = child;
    }
}
`

const javaNodeWithParent = `
class Node {
    public int val;
    public Node left;
    public Node right;
    public Node parent;
    public Node() {}
    public Node(int val) { this.val = val; }
}
`

func detectJavaNodeVariant(code string) string {
	if strings.Contains(code, "topLeft") || strings.Contains(code, "bottomLeft") || strings.Contains(code, "isLeaf") {
		return javaNodeQuadTree
	}
	if (strings.Contains(code, ".child") && !strings.Contains(code, ".children")) ||
		(strings.Contains(code, ".prev") && strings.Contains(code, ".next")) {
		return javaNodeDoublyLinked
	}
	if strings.Contains(code, ".parent") {
		return javaNodeWithParent
	}
	return ""
}

// javaNodeHelpers are static methods injected into the Solution class for
// deserializing/serializing ListNode and TreeNode from/to JSON arrays.
const javaNodeHelpers = `
    private static ListNode _buildList(JsonArray arr) {
        ListNode dummy = new ListNode(0); ListNode tail = dummy;
        for (int i = 0; i < arr.size(); i++) {
            if (arr.get(i).isJsonNull()) continue;
            tail.next = new ListNode(arr.get(i).getAsInt());
            tail = tail.next;
        }
        return dummy.next;
    }
    private static JsonElement _serializeList(ListNode head) {
        JsonArray arr = new JsonArray();
        for (; head != null; head = head.next) arr.add(head.val);
        return arr;
    }
    private static TreeNode _buildTree(JsonArray arr) {
        if (arr.size() == 0 || arr.get(0).isJsonNull()) return null;
        TreeNode root = new TreeNode(arr.get(0).getAsInt());
        Queue<TreeNode> q = new LinkedList<>(); q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < arr.size()) {
            TreeNode node = q.poll();
            if (i < arr.size() && !arr.get(i).isJsonNull()) {
                node.left = new TreeNode(arr.get(i).getAsInt());
                q.add(node.left);
            }
            i++;
            if (i < arr.size() && !arr.get(i).isJsonNull()) {
                node.right = new TreeNode(arr.get(i).getAsInt());
                q.add(node.right);
            }
            i++;
        }
        return root;
    }
    private static ListNode[] _buildListArray(JsonArray outer) {
        ListNode[] arr = new ListNode[outer.size()];
        for (int i = 0; i < outer.size(); i++) arr[i] = _buildList(outer.get(i).getAsJsonArray());
        return arr;
    }
    private static Node _buildNodeTree(JsonArray arr) {
        if (arr.size() == 0 || arr.get(0).isJsonNull()) return null;
        Node root = new Node(arr.get(0).getAsInt());
        root.children = new ArrayList<>();
        Queue<Node> q = new LinkedList<>(); q.add(root);
        int i = 2; // skip root and first null separator
        while (!q.isEmpty() && i < arr.size()) {
            Node parent = q.poll();
            parent.children = new ArrayList<>();
            while (i < arr.size()) {
                if (arr.get(i).isJsonNull()) { i++; break; } // null separator
                Node child = new Node(arr.get(i).getAsInt());
                child.children = new ArrayList<>();
                parent.children.add(child);
                q.add(child);
                i++;
            }
        }
        return root;
    }
    private static JsonElement _serializeNodeTree(Node root) {
        JsonArray arr = new JsonArray();
        if (root == null) return arr;
        arr.add(root.val);
        arr.add(JsonNull.INSTANCE);
        Queue<Node> q = new LinkedList<>(); q.add(root);
        while (!q.isEmpty()) {
            Node node = q.poll();
            if (node.children != null) {
                for (Node child : node.children) {
                    arr.add(child.val);
                    q.add(child);
                }
            }
            arr.add(JsonNull.INSTANCE);
        }
        while (arr.size() > 0 && arr.get(arr.size()-1).isJsonNull()) arr.remove(arr.size()-1);
        return arr;
    }
    private static JsonElement _serializeTree(TreeNode root) {
        JsonArray arr = new JsonArray();
        if (root == null) return arr;
        Queue<TreeNode> q = new LinkedList<>(); q.add(root);
        while (!q.isEmpty()) {
            TreeNode node = q.poll();
            if (node != null) { arr.add(node.val); q.add(node.left); q.add(node.right); }
            else arr.add(JsonNull.INSTANCE);
        }
        while (arr.size() > 0 && arr.get(arr.size()-1).isJsonNull()) arr.remove(arr.size()-1);
        return arr;
    }
    private static JsonElement _serializeListArray(ListNode[] arr) {
        JsonArray res = new JsonArray();
        for (ListNode head : arr) {
            if (head == null) res.add(JsonNull.INSTANCE);
            else res.add(_serializeList(head));
        }
        return res;
    }
    private static JsonElement _serializeTreeArray(TreeNode[] arr) {
        JsonArray res = new JsonArray();
        for (TreeNode root : arr) {
            if (root == null) res.add(JsonNull.INSTANCE);
            else res.add(_serializeTree(root));
        }
        return res;
    }
    private static JsonElement _serializeTreeList(List<TreeNode> list) {
        JsonArray res = new JsonArray();
        for (TreeNode root : list) {
            if (root == null) res.add(JsonNull.INSTANCE);
            else res.add(_serializeTree(root));
        }
        return res;
    }
    private static JsonElement _serializeListList(List<ListNode> list) {
        JsonArray res = new JsonArray();
        for (ListNode head : list) {
            if (head == null) res.add(JsonNull.INSTANCE);
            else res.add(_serializeList(head));
        }
        return res;
    }
`

// javaImports is prepended to every Java solution so that Gson and standard
// Java IO classes are available in both the user's code and the injected main().
const javaImports = "import com.google.gson.*;\nimport com.google.gson.reflect.*;\nimport java.util.*;\nimport java.util.stream.*;\nimport java.util.function.*;\nimport java.io.*;\nimport java.math.*;\nimport java.util.regex.*;\nimport java.text.*;\n\n" +
	// Pair<A,B> stub (JavaFX Pair removed since Java 11+)
	"class Pair<A,B>{A key;B val;public Pair(A a,B b){key=a;val=b;}public A getKey(){return key;}public B getValue(){return val;}@Override public String toString(){return \"(\"+key+\",\"+val+\")\";}" +
	"@Override public int hashCode(){return Objects.hash(key,val);}@Override public boolean equals(Object o){if(!(o instanceof Pair))return false;Pair<?,?> p=(Pair<?,?>)o;return Objects.equals(key,p.key)&&Objects.equals(val,p.val);}}\n\n"

// javaMethodRe matches public method declarations in a Java Solution class.
// Capture groups: (1) return type  (2) method name  (3) parameter list
var javaMethodRe = regexp.MustCompile(
	`(?m)^\s+public\s+(?:static\s+)?([^(\n]+?)\s+([a-z]\w*)\s*\(([^)]*)\)\s*(?:throws\s+[\w,\s]+)?\{`,
)

// javaNodeClassRe matches standalone ListNode/TreeNode class definitions to strip them.
var javaNodeClassRe = regexp.MustCompile(`(?ms)^(?:public\s+)?class\s+(ListNode|TreeNode)\s*\{[^}]*\}\s*\n?`)

// javaStdNodeRe matches only the standard LeetCode Node class (with val + next/left/etc.).
var javaStdNodeRe = regexp.MustCompile(`(?ms)^(?:public\s+)?class\s+Node\s*\{[^}]*?\bval\b[^}]*?\b(?:next|left|children|neighbors|random)\b[^}]*\}\s*\n?`)

// wrapJava prepends Gson/IO imports and, when the function signature uses only
// supported types, injects a static main() method before the closing brace of
// the Solution class.
// javaSolutionClassRe detects the presence of a "class Solution" declaration.
var javaSolutionClassRe = regexp.MustCompile(`(?m)^(?:public\s+)?class\s+Solution\b`)

// javaSolCtorWithParamsRe matches "    public Solution(params)" inside a class body.
var javaSolCtorWithParamsRe = regexp.MustCompile(`(?m)^\s+public\s+Solution\s*\(\s*\S`)

// isJavaDesignSolution detects "class Solution" with a parameterized constructor.
func isJavaDesignSolution(code string) bool {
	solBody := extractJavaClassBody(code, "Solution")
	if solBody == "" {
		return false
	}
	return javaSolCtorWithParamsRe.MatchString(solBody)
}

func wrapJava(code string) string {
	// Strip "public" from non-Solution class declarations (Java requires public class
	// to match filename, but we compile everything as Solution.java)
	code = stripPublicFromNonSolutionClasses(code)

	// Strip user import statements — we inject all needed imports ourselves.
	code = regexp.MustCompile(`(?m)^\s*import\s+[^;]+;\s*\n?`).ReplaceAllString(code, "")

	// Check if user defines their own Node class (segment tree, trie, LFU, etc.)
	// Strip comments first to avoid false positives from commented-out definitions
	javaCodeNoComments := stripCComments(code)
	hasCustomJavaNode := regexp.MustCompile(`(?m)^(?:public\s+)?class\s+Node\s*\{`).MatchString(javaCodeNoComments)

	// Strip user-defined ListNode/TreeNode classes to avoid redefinition.
	code = javaNodeClassRe.ReplaceAllString(code, "")
	// Only strip Node if it's the standard LeetCode Node
	if !hasCustomJavaNode {
		code = javaStdNodeRe.ReplaceAllString(code, "")
	}

	// Prepend imports and node class definitions if not already present.
	if !strings.Contains(code, "import com.google.gson") {
		if hasCustomJavaNode {
			code = javaImports + javaNodeDefsNoNode + code
		} else {
			// Check if code needs a variant Node (QuadTree, DoublyLinked, WithParent)
			if variant := detectJavaNodeVariant(code); variant != "" {
				code = javaImports + javaNodeDefsNoNode + variant + code
			} else {
				code = javaImports + javaNodeDefs + code
			}
		}
	}
	// If user already has a main, nothing more to do.
	if strings.Contains(code, "static void main") {
		return code
	}

	// Inject API stubs for interactive problems (read4, isBadVersion, guess)
	code = injectJavaApiStubs(code)

	// Design-class detection:
	// 1. No "class Solution" present → use design-class wrapper (external Solution class)
	// 2. "class Solution" with a parameterized constructor → inject main into Solution
	hasSolution := javaSolutionClassRe.MatchString(code)
	if !hasSolution {
		if wrapped := buildJavaDesignWrapper(code); wrapped != "" {
			return wrapped
		}
		return code
	}
	if isJavaDesignSolution(code) {
		if main := buildJavaDesignMain(code); main != "" {
			// Inject main before the closing brace of class Solution
			idx := findJavaClassClosingBrace(code, "Solution")
			if idx >= 0 {
				return code[:idx] + main + "\n}"
			}
		}
		return code
	}

	funcName, retType, paramTypes, ok := parseJavaSignature(code)
	if !ok {
		return code
	}

	// Check if we need node helpers
	needNodeHelpers := false
	for _, pt := range paramTypes {
		if pt == "ListNode" || pt == "TreeNode" || pt == "Node" || pt == "ListNode[]" {
			needNodeHelpers = true
			break
		}
	}
	if retType == "ListNode" || retType == "TreeNode" || retType == "Node" ||
		retType == "ListNode[]" || retType == "TreeNode[]" ||
		retType == "List<TreeNode>" || retType == "List<ListNode>" {
		needNodeHelpers = true
	}

	main := buildJavaMain(funcName, retType, paramTypes)
	helpers := ""
	if needNodeHelpers {
		helpers = javaNodeHelpers
	}
	// Inject before the closing brace of class Solution.
	idx := findJavaClassClosingBrace(code, "Solution")
	if idx < 0 {
		return code
	}
	return code[:idx] + helpers + main + "\n}"
}

func parseJavaSignature(code string) (funcName, retType string, paramTypes []string, ok bool) {
	// Extract only the body of "class Solution { ... }" to avoid matching
	// methods from helper classes.
	solBody := extractJavaClassBody(code, "Solution")
	searchCode := solBody
	if searchCode == "" {
		searchCode = code // fallback
	}

	// Collect all valid method candidates, preferring non-static methods.
	// In LeetCode, the entry-point method is always non-static (instance method),
	// while user-defined helpers like qpow/comb are often static.
	type methodCandidate struct {
		funcName   string
		retType    string
		paramTypes []string
		isStatic   bool
	}
	var candidates []methodCandidate

	for _, m := range javaMethodRe.FindAllStringSubmatch(searchCode, -1) {
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
		isStatic := strings.Contains(m[0], "static")
		candidates = append(candidates, methodCandidate{fn, strings.TrimSpace(m[1]), pts, isStatic})
	}

	// Prefer non-static methods (the LeetCode entry point is always non-static)
	for _, c := range candidates {
		if !c.isStatic {
			return c.funcName, c.retType, c.paramTypes, true
		}
	}
	// Fall back to the first valid static method if no non-static method found
	for _, c := range candidates {
		return c.funcName, c.retType, c.paramTypes, true
	}
	return
}

// findJavaClassClosingBrace returns the byte index of the closing "}" of the named class.
// Returns -1 if the class is not found.
func findJavaClassClosingBrace(code, className string) int {
	marker := "class " + className
	idx := strings.Index(code, marker)
	if idx < 0 {
		return -1
	}
	braceStart := strings.Index(code[idx:], "{")
	if braceStart < 0 {
		return -1
	}
	braceStart += idx
	depth := 0
	for i := braceStart; i < len(code); i++ {
		if code[i] == '{' {
			depth++
		} else if code[i] == '}' {
			depth--
			if depth == 0 {
				return i
			}
		}
	}
	return -1
}

// extractJavaClassBody returns the body of a specific class (between { and matching }).
func extractJavaClassBody(code, className string) string {
	// Look for "class ClassName" possibly preceded by "public"
	marker := "class " + className
	idx := strings.Index(code, marker)
	if idx < 0 {
		return ""
	}
	braceStart := strings.Index(code[idx:], "{")
	if braceStart < 0 {
		return ""
	}
	braceStart += idx
	depth := 0
	for i := braceStart; i < len(code); i++ {
		if code[i] == '{' {
			depth++
		} else if code[i] == '}' {
			depth--
			if depth == 0 {
				return code[braceStart : i+1]
			}
		}
	}
	return ""
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
	"int[][]": true, "long[][]": true, "String[][]": true, "char[][]": true,
	"List<Integer>":       true,
	"List<Long>":          true,
	"List<String>":        true,
	"List<Double>":        true,
	"List<Boolean>":       true,
	"List<List<Integer>>": true,
	"List<List<String>>":  true,
	// Node types
	"ListNode":   true,
	"TreeNode":   true,
	"Node":       true,
	"ListNode[]":       true,
	"TreeNode[]":       true,
	"List<TreeNode>":   true,
	"List<ListNode>":   true,
}

func javaTypeOK(t string) bool { return javaOKTypes[t] }

// javaCharHelpers are static helper methods for char conversion (Gson can't parse char directly)
const javaCharHelpers = `
    static char[] _toCharArr(String[] s) { char[] r = new char[s.length]; for(int i=0;i<s.length;i++) r[i]=s[i].charAt(0); return r; }
    static char[][] _toCharArr2d(String[][] s) { char[][] r = new char[s.length][]; for(int i=0;i<s.length;i++) r[i]=_toCharArr(s[i]); return r; }
`

func buildJavaMain(funcName, retType string, paramTypes []string) string {
	var sb strings.Builder
	// Add char helpers if needed
	needsCharHelpers := false
	for _, pt := range paramTypes {
		if pt == "char[]" || pt == "char[][]" || pt == "char" {
			needsCharHelpers = true
			break
		}
	}
	if needsCharHelpers {
		sb.WriteString(javaCharHelpers)
	}
	sb.WriteString("\n    public static void main(String[] args) throws Exception {\n")
	sb.WriteString("        Gson _gson = new GsonBuilder().serializeSpecialFloatingPointValues().create();\n")
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
		// For void (in-place) functions, print the first argument after modification
		if len(paramTypes) > 0 {
			serExpr := javaSerializeExpr(paramTypes[0], "_arg0")
			sb.WriteString(fmt.Sprintf("        System.out.println(%s);\n", serExpr))
		}
	} else {
		serExpr := javaSerializeExpr(retType, call)
		sb.WriteString(fmt.Sprintf("        System.out.println(%s);\n", serExpr))
	}
	sb.WriteString("    }\n")
	return sb.String()
}

// javaSerializeExpr produces the Java expression to convert a result to JSON string.
func javaSerializeExpr(typ, expr string) string {
	switch typ {
	case "ListNode":
		return fmt.Sprintf("_gson.toJson(_serializeList(%s))", expr)
	case "TreeNode":
		return fmt.Sprintf("_gson.toJson(_serializeTree(%s))", expr)
	case "Node":
		return fmt.Sprintf("_gson.toJson(_serializeNodeTree(%s))", expr)
	case "ListNode[]":
		return fmt.Sprintf("_gson.toJson(_serializeListArray(%s))", expr)
	case "TreeNode[]":
		return fmt.Sprintf("_gson.toJson(_serializeTreeArray(%s))", expr)
	case "List<TreeNode>":
		return fmt.Sprintf("_gson.toJson(_serializeTreeList(%s))", expr)
	case "List<ListNode>":
		return fmt.Sprintf("_gson.toJson(_serializeListList(%s))", expr)
	default:
		return fmt.Sprintf("_gson.toJson(%s)", expr)
	}
}

// ─── Java API Stubs ──────────────────────────────────────────────────────────

// injectJavaApiStubs adds stub implementations for platform-provided API functions.
// These are injected as static methods inside the Solution class.
func injectJavaApiStubs(code string) string {
	codeNC := stripCComments(code) // check without comments
	var outerStubs []string // injected before Solution class
	var innerStubs []string // injected inside Solution class

	// isBadVersion API (problem 278) — Solution extends VersionControl
	if strings.Contains(code, "extends VersionControl") {
		outerStubs = append(outerStubs, `class VersionControl {
    static int _badVersion = 1;
    boolean isBadVersion(int version) { return version >= _badVersion; }
}`)
	} else if strings.Contains(code, "isBadVersion(") && !strings.Contains(codeNC, "boolean isBadVersion(") {
		innerStubs = append(innerStubs, `    static int _badVersion = 1;
    static boolean isBadVersion(int version) { return version >= _badVersion; }`)
	}

	// guess API (problem 374) — Solution extends GuessGame
	if strings.Contains(code, "extends GuessGame") {
		outerStubs = append(outerStubs, `class GuessGame {
    static int _pick = 1;
    int guess(int num) { if (num == _pick) return 0; return num > _pick ? -1 : 1; }
}`)
	} else if strings.Contains(code, "guess(") && !strings.Contains(codeNC, "int guess(") {
		innerStubs = append(innerStubs, `    static int _pick = 1;
    static int guess(int num) { if (num == _pick) return 0; return num > _pick ? -1 : 1; }`)
	}

	// read4 API (problems 157, 158) — Solution extends Reader4
	if strings.Contains(code, "extends Reader4") {
		outerStubs = append(outerStubs, `class Reader4 {
    static String _read4Buf = "";
    static int _read4Pos = 0;
    int read4(char[] buf) {
        int cnt = 0;
        while (cnt < 4 && _read4Pos < _read4Buf.length()) {
            buf[cnt++] = _read4Buf.charAt(_read4Pos++);
        }
        return cnt;
    }
}`)
	} else if strings.Contains(code, "read4(") && !strings.Contains(codeNC, "int read4(") {
		innerStubs = append(innerStubs, `    static String _read4Buf = "";
    static int _read4Pos = 0;
    static int read4(char[] buf) {
        int cnt = 0;
        while (cnt < 4 && _read4Pos < _read4Buf.length()) {
            buf[cnt++] = _read4Buf.charAt(_read4Pos++);
        }
        return cnt;
    }`)
	}

	modified := code

	// Inject outer stubs before the Solution class
	if len(outerStubs) > 0 {
		stubStr := strings.Join(outerStubs, "\n") + "\n"
		classMatch := javaSolutionClassRe.FindStringIndex(modified)
		if classMatch != nil {
			modified = modified[:classMatch[0]] + stubStr + modified[classMatch[0]:]
		}
	}

	// Inject inner stubs inside the Solution class body
	if len(innerStubs) > 0 {
		stubStr := "\n" + strings.Join(innerStubs, "\n") + "\n"
		classMatch := javaSolutionClassRe.FindStringIndex(modified)
		if classMatch != nil {
			braceIdx := strings.Index(modified[classMatch[0]:], "{")
			if braceIdx >= 0 {
				pos := classMatch[0] + braceIdx + 1
				modified = modified[:pos] + stubStr + modified[pos:]
			}
		}
	}

	return modified
}

// ─── Java Design-Class ───────────────────────────────────────────────────────

// javaDesignClassRe finds the design class name (not ListNode/TreeNode/Node/Solution).
var javaDesignClassRe = regexp.MustCompile(`(?m)^(?:public\s+)?class\s+(\w+)\s*(?:extends\s+\w+\s*)?(?:implements\s+[^{]*)?\{`)

// javaDesignMethodRe matches public method declarations.
// Groups: (1) return type  (2) method name  (3) parameter list
var javaDesignMethodRe = regexp.MustCompile(
	`(?m)^\s+public\s+(?:static\s+)?([^(\n]+?)\s+([a-z]\w*)\s*\(([^)]*)\)\s*(?:throws\s+[\w,\s]+)?\{`,
)

// javaCtorRe matches a constructor: "    public ClassName("
// Groups: (1) class name  (2) parameter list
var javaCtorRe = regexp.MustCompile(
	`(?m)^\s+public\s+(\w+)\s*\(([^)]*)\)\s*\{`,
)

type javaMethodInfo struct {
	Name       string
	RetType    string
	ParamTypes []string
}

func parseJavaDesignClass(code string) (className string, ctorParams []string, methods []javaMethodInfo, ok bool) {
	skipClasses := map[string]bool{"ListNode": true, "TreeNode": true, "Node": true, "Solution": true}

	// Collect all candidate classes (non-skip).
	var candidates []string
	for _, m := range javaDesignClassRe.FindAllStringSubmatch(code, -1) {
		name := m[1]
		if !skipClasses[name] {
			candidates = append(candidates, name)
		}
	}
	if len(candidates) == 0 {
		return
	}

	// Pick the LAST candidate class that has public methods.
	// In LeetCode design problems, helper classes come first and the main
	// design class is defined last.
	for i := len(candidates) - 1; i >= 0; i-- {
		cand := candidates[i]
		_, cp, ms, ok2 := parseJavaDesignClassByName(code, cand)
		if ok2 && len(ms) > 0 {
			className = cand
			ctorParams = cp
			methods = ms
			ok = true
			return
		}
	}
	return
}

// parseJavaDesignClassByName parses a specific class by name.
func parseJavaDesignClassByName(code, className string) (string, []string, []javaMethodInfo, bool) {
	// Extract the class body
	classStart := strings.Index(code, "class "+className)
	if classStart < 0 {
		return className, nil, nil, false
	}
	braceStart := strings.Index(code[classStart:], "{")
	if braceStart < 0 {
		return className, nil, nil, false
	}
	braceStart += classStart
	depth := 0
	classEnd := -1
	for i := braceStart; i < len(code); i++ {
		if code[i] == '{' {
			depth++
		} else if code[i] == '}' {
			depth--
			if depth == 0 {
				classEnd = i + 1
				break
			}
		}
	}
	if classEnd < 0 {
		classEnd = len(code)
	}
	classBody := code[braceStart:classEnd]

	// Find constructor parameters
	var ctorParams []string
	for _, m := range javaCtorRe.FindAllStringSubmatch(classBody, -1) {
		if m[1] == className {
			paramStr := strings.TrimSpace(m[2])
			if paramStr != "" {
				for _, p := range splitAngleBracketAware(paramStr) {
					if t, ok2 := javaDesignParamType(p); ok2 {
						ctorParams = append(ctorParams, t)
					}
				}
			}
			break
		}
	}

	// Find all public methods
	var methods []javaMethodInfo
	for _, m := range javaDesignMethodRe.FindAllStringSubmatch(classBody, -1) {
		fn := strings.TrimSpace(m[2])
		if fn == className || fn == "main" {
			continue
		}
		retType := strings.TrimSpace(m[1])
		paramStr := strings.TrimSpace(m[3])
		var pts []string
		if paramStr != "" {
			parts := splitAngleBracketAware(paramStr)
			valid := true
			for _, p := range parts {
				t, ok2 := javaDesignParamType(p)
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
		methods = append(methods, javaMethodInfo{
			Name:       fn,
			RetType:    retType,
			ParamTypes: pts,
		})
	}

	return className, ctorParams, methods, len(methods) > 0
}

// javaDesignParamType extracts the type from a parameter declaration.
// Same as javaParamType but with an extended type set for design classes.
func javaDesignParamType(p string) (string, bool) {
	p = strings.TrimSpace(p)
	p = strings.TrimPrefix(p, "final ")
	m := javaParamWordRe.FindStringSubmatch(p)
	if m == nil {
		return "", false
	}
	t := strings.TrimSpace(m[1])
	if javaDesignTypeOK(t) {
		return t, true
	}
	return "", false
}

// javaDesignTypeOK accepts the standard types plus a few extras common in design problems.
func javaDesignTypeOK(t string) bool {
	if javaTypeOK(t) {
		return true
	}
	// Additional types common in design-class problems
	extras := map[string]bool{
		"Integer": true, "Long": true, "Double": true, "Boolean": true,
		"int[][]": true, "char[]": true,
	}
	return extras[t]
}

// buildJavaDesignMain generates a static main() method for a design-class problem
// where the design class IS the Solution class (has parameterized constructor).
// Returns "" if the code doesn't match the design pattern.
func buildJavaDesignMain(code string) string {
	// For Solution-as-design-class, parse it directly
	_, ctorParams, methods, ok := parseJavaDesignClassByName(code, "Solution")
	if !ok {
		return ""
	}
	return buildJavaDesignMainBody("Solution", ctorParams, methods)
}

func buildJavaDesignWrapper(code string) string {
	className, ctorParams, methods, ok := parseJavaDesignClass(code)
	if !ok {
		return ""
	}

	// Check if any ctor or method params/returns need node helpers
	needNodeHelpers := false
	nodeTypes := map[string]bool{"ListNode": true, "TreeNode": true, "Node": true}
	for _, pt := range ctorParams {
		if nodeTypes[pt] {
			needNodeHelpers = true
			break
		}
	}
	if !needNodeHelpers {
		for _, m := range methods {
			for _, pt := range m.ParamTypes {
				if nodeTypes[pt] {
					needNodeHelpers = true
					break
				}
			}
			if nodeTypes[m.RetType] {
				needNodeHelpers = true
			}
		}
	}

	var sb strings.Builder

	// The code already has imports prepended. We need to add a Solution class
	// with a static main that wraps the design class.
	sb.WriteString(code)
	sb.WriteString("\n\nclass Solution {\n")
	if needNodeHelpers {
		sb.WriteString(javaNodeHelpers)
	}
	sb.WriteString(buildJavaDesignMainBody(className, ctorParams, methods))
	sb.WriteString("\n}\n")
	return sb.String()
}

// buildJavaDesignMainBody generates the body of a static main() for design-class dispatch.
func buildJavaDesignMainBody(className string, ctorParams []string, methods []javaMethodInfo) string {
	var sb strings.Builder
	sb.WriteString("    public static void main(String[] args) throws Exception {\n")
	sb.WriteString("        Gson _gson = new GsonBuilder().serializeSpecialFloatingPointValues().create();\n")
	sb.WriteString("        BufferedReader _br = new BufferedReader(new InputStreamReader(System.in));\n")
	sb.WriteString("        List<String> _lines = new ArrayList<>();\n")
	sb.WriteString("        String _l;\n")
	sb.WriteString("        while ((_l = _br.readLine()) != null) {\n")
	sb.WriteString("            _l = _l.trim();\n")
	sb.WriteString("            if (!_l.isEmpty()) _lines.add(_l);\n")
	sb.WriteString("        }\n")
	sb.WriteString("        JsonArray _ops = _gson.fromJson(_lines.get(0), JsonArray.class);\n")
	sb.WriteString("        JsonArray _allArgs = _gson.fromJson(_lines.get(1), JsonArray.class);\n")
	sb.WriteString("        StringBuilder _out = new StringBuilder(\"[\");\n")

	// Constructor
	sb.WriteString("        JsonArray _ca = _allArgs.get(0).getAsJsonArray();\n")
	if len(ctorParams) == 0 {
		sb.WriteString(fmt.Sprintf("        %s _obj = new %s();\n", className, className))
	} else {
		for i, pt := range ctorParams {
			sb.WriteString(fmt.Sprintf("        %s _cp%d = %s;\n", pt, i, javaDeserializeFromJsonElement(pt, fmt.Sprintf("_ca.get(%d)", i))))
		}
		cargs := make([]string, len(ctorParams))
		for i := range ctorParams {
			cargs[i] = fmt.Sprintf("_cp%d", i)
		}
		sb.WriteString(fmt.Sprintf("        %s _obj = new %s(%s);\n", className, className, strings.Join(cargs, ", ")))
	}
	sb.WriteString("        _out.append(\"null\");\n")

	// Method dispatch loop
	sb.WriteString("        for (int _i = 1; _i < _ops.size(); _i++) {\n")
	sb.WriteString("            _out.append(\",\");\n")
	sb.WriteString("            String _op = _ops.get(_i).getAsString();\n")
	sb.WriteString("            JsonArray _ma = _allArgs.get(_i).getAsJsonArray();\n")

	for mi, m := range methods {
		cond := "if"
		if mi > 0 {
			cond = "} else if"
		}
		sb.WriteString(fmt.Sprintf("            %s (_op.equals(\"%s\")) {\n", cond, m.Name))

		// Parse arguments
		for pi, pt := range m.ParamTypes {
			sb.WriteString(fmt.Sprintf("                %s _a%d = %s;\n", pt, pi, javaDeserializeFromJsonElement(pt, fmt.Sprintf("_ma.get(%d)", pi))))
		}
		pargs := make([]string, len(m.ParamTypes))
		for pi := range m.ParamTypes {
			pargs[pi] = fmt.Sprintf("_a%d", pi)
		}

		call := fmt.Sprintf("_obj.%s(%s)", m.Name, strings.Join(pargs, ", "))
		if m.RetType == "void" {
			sb.WriteString(fmt.Sprintf("                %s;\n", call))
			sb.WriteString("                _out.append(\"null\");\n")
		} else {
			sb.WriteString(fmt.Sprintf("                _out.append(_gson.toJson(%s));\n", call))
		}
	}
	if len(methods) > 0 {
		sb.WriteString("            } else {\n")
		sb.WriteString("                _out.append(\"null\");\n")
		sb.WriteString("            }\n")
	}

	sb.WriteString("        }\n")
	sb.WriteString("        _out.append(\"]\");\n")
	sb.WriteString("        System.out.println(_out.toString());\n")
	sb.WriteString("    }\n")
	return sb.String()
}

// javaDeserializeFromJsonElement deserializes a Gson JsonElement to the given Java type.
func javaDeserializeFromJsonElement(typ, expr string) string {
	switch typ {
	case "int":
		return fmt.Sprintf("%s.getAsInt()", expr)
	case "long":
		return fmt.Sprintf("%s.getAsLong()", expr)
	case "double":
		return fmt.Sprintf("%s.getAsDouble()", expr)
	case "float":
		return fmt.Sprintf("%s.getAsFloat()", expr)
	case "boolean":
		return fmt.Sprintf("%s.getAsBoolean()", expr)
	case "char":
		return fmt.Sprintf("%s.getAsString().charAt(0)", expr)
	case "String":
		return fmt.Sprintf("%s.getAsString()", expr)
	case "Integer":
		return fmt.Sprintf("%s.getAsInt()", expr)
	case "Long":
		return fmt.Sprintf("%s.getAsLong()", expr)
	case "Double":
		return fmt.Sprintf("%s.getAsDouble()", expr)
	case "Boolean":
		return fmt.Sprintf("%s.getAsBoolean()", expr)
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
	case "int[][]":
		return fmt.Sprintf("_gson.fromJson(%s, int[][].class)", expr)
	case "char[]":
		return fmt.Sprintf("_gson.fromJson(%s, char[].class)", expr)
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
	case "ListNode":
		return fmt.Sprintf("_buildList(%s.getAsJsonArray())", expr)
	case "TreeNode":
		return fmt.Sprintf("_buildTree(%s.getAsJsonArray())", expr)
	default:
		return fmt.Sprintf("_gson.fromJson(%s, Object.class)", expr)
	}
}

// ─── Java Standard (Solution-class) ─────────────────────────────────────────

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
	case "char":
		return fmt.Sprintf("_gson.fromJson(%s, String.class).charAt(0)", expr)
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
		return fmt.Sprintf("_toCharArr(_gson.fromJson(%s, String[].class))", expr)
	case "int[][]":
		return fmt.Sprintf("_gson.fromJson(%s, int[][].class)", expr)
	case "long[][]":
		return fmt.Sprintf("_gson.fromJson(%s, long[][].class)", expr)
	case "String[][]":
		return fmt.Sprintf("_gson.fromJson(%s, String[][].class)", expr)
	case "char[][]":
		return fmt.Sprintf("_toCharArr2d(_gson.fromJson(%s, String[][].class))", expr)
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
	case "ListNode":
		return fmt.Sprintf("_buildList(_gson.fromJson(%s, JsonArray.class))", expr)
	case "TreeNode":
		return fmt.Sprintf("_buildTree(_gson.fromJson(%s, JsonArray.class))", expr)
	case "ListNode[]":
		return fmt.Sprintf("_buildListArray(_gson.fromJson(%s, JsonArray.class))", expr)
	case "Node":
		return fmt.Sprintf("_buildNodeTree(_gson.fromJson(%s, JsonArray.class))", expr)
	default:
		return fmt.Sprintf("_gson.fromJson(%s, Object.class)", expr)
	}
}
