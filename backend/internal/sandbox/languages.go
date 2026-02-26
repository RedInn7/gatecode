package sandbox

import (
	"regexp"
	"strings"
)

// LangConfig holds all metadata needed to compile and run a solution in a given language.
type LangConfig struct {
	Image        string // Docker image
	FileName     string // file to write inside /w
	CompileCmd   string // empty = no compile step
	RunCmd       string // command to execute the solution
	IsAutoWrap   bool   // true = A group: append stdin→func→JSON runner
	CompileMemMB int    // override memory limit for compile phase (0 = use default)
}

// LangConfigs covers all 19 LeetCode languages.
var LangConfigs = map[string]LangConfig{
	"JavaScript": {
		Image:      "node:20-alpine",
		FileName:   "solution.js",
		RunCmd:     "node /w/solution.js",
		IsAutoWrap: true,
	},
	"TypeScript": {
		Image:      "node-ts:20",
		FileName:   "solution.ts",
		CompileCmd: "esbuild /w/solution.ts --bundle --platform=node --outfile=/w/solution.js --external:@datastructures-js/priority-queue --external:lodash 2>/dev/null",
		RunCmd:     "node /w/solution.js",
		IsAutoWrap: true,
	},
	"Python3": {
		Image:      JudgeImage,
		FileName:   "solution.py",
		RunCmd:     "python3 /w/solution.py",
		IsAutoWrap: true,
	},
	"Python": {
		Image:      JudgeImage,
		FileName:   "solution.py",
		RunCmd:     "python3 /w/solution.py",
		IsAutoWrap: true,
	},
	"C++": {
		Image:        JudgeImage,
		FileName:     "solution.cpp",
		CompileCmd:   "g++ -O2 -std=c++23 -o /w/prog /w/solution.cpp",
		RunCmd:       "/w/prog",
		IsAutoWrap:   true,
		CompileMemMB: 768, // bits/stdc++.h requires significant compile-time RAM
	},
	"C": {
		Image:      "gcc:13",
		FileName:   "solution.c",
		CompileCmd: "gcc -O2 -o /w/prog /w/solution.c",
		RunCmd:     "/w/prog",
		IsAutoWrap: false,
	},
	"Java": {
		Image:      JudgeImage,
		FileName:   "Solution.java",
		CompileCmd: "javac -encoding UTF-8 -cp /usr/local/lib/gson.jar -d /w /w/Solution.java",
		RunCmd:     "java -cp /usr/local/lib/gson.jar:/w Solution",
		IsAutoWrap: true,
	},
	"C#": {
		Image:      "mcr.microsoft.com/dotnet/sdk:8.0",
		FileName:   "solution.csx",
		RunCmd:     "dotnet script /w/solution.csx",
		IsAutoWrap: false,
	},
	"Go": {
		Image:      "golang:1.21-alpine",
		FileName:   "solution.go",
		RunCmd:     "go run /w/solution.go",
		IsAutoWrap: false,
	},
	"Kotlin": {
		Image:      "eclipse-temurin:21-jdk-alpine",
		FileName:   "solution.kt",
		CompileCmd: "kotlinc /w/solution.kt -include-runtime -d /w/prog.jar",
		RunCmd:     "java -jar /w/prog.jar",
		IsAutoWrap: false,
	},
	"Swift": {
		Image:      "swift:5.9-slim",
		FileName:   "solution.swift",
		RunCmd:     "swift /w/solution.swift",
		IsAutoWrap: false,
	},
	"Rust": {
		Image:      "rust:1.74-alpine",
		FileName:   "solution.rs",
		CompileCmd: "rustc -o /w/prog /w/solution.rs",
		RunCmd:     "/w/prog",
		IsAutoWrap: false,
	},
	"Ruby": {
		Image:      "ruby:3.2-alpine",
		FileName:   "solution.rb",
		RunCmd:     "ruby /w/solution.rb",
		IsAutoWrap: true,
	},
	"PHP": {
		Image:      "php:8.2-alpine",
		FileName:   "solution.php",
		RunCmd:     "php /w/solution.php",
		IsAutoWrap: true,
	},
	"Dart": {
		Image:      "dart:stable",
		FileName:   "solution.dart",
		RunCmd:     "dart /w/solution.dart",
		IsAutoWrap: false,
	},
	"Scala": {
		Image:      "sbtscala/scala-sbt",
		FileName:   "solution.scala",
		CompileCmd: "scalac /w/solution.scala -d /w",
		RunCmd:     "scala -cp /w Solution",
		IsAutoWrap: false,
	},
	"Elixir": {
		Image:      "elixir:1.15-alpine",
		FileName:   "solution.exs",
		RunCmd:     "elixir /w/solution.exs",
		IsAutoWrap: false,
	},
	"Erlang": {
		Image:      "erlang:26-alpine",
		FileName:   "solution.erl",
		CompileCmd: "erlc /w/solution.erl -o /w",
		RunCmd:     "erl -noshell -pa /w -s solution main -s init stop",
		IsAutoWrap: false,
	},
	"Racket": {
		Image:      "racket:latest",
		FileName:   "solution.rkt",
		RunCmd:     "racket /w/solution.rkt",
		IsAutoWrap: false,
	},
}

// LangKeyToDisplay maps lowercase DB keys (e.g. "python3") to display names (e.g. "Python3").
var LangKeyToDisplay = map[string]string{
	"javascript": "JavaScript",
	"typescript": "TypeScript",
	"python3":    "Python3",
	"python":     "Python",
	"cpp":        "C++",
	"c":          "C",
	"java":       "Java",
	"csharp":     "C#",
	"go":         "Go",
	"kotlin":     "Kotlin",
	"swift":      "Swift",
	"rust":       "Rust",
	"ruby":       "Ruby",
	"php":        "PHP",
	"dart":       "Dart",
	"scala":      "Scala",
	"elixir":     "Elixir",
	"erlang":     "Erlang",
	"racket":     "Racket",
}

// funcNamePatterns extracts the primary function name per language.
var funcNamePatterns = map[string]*regexp.Regexp{
	"JavaScript": regexp.MustCompile(`(?:var|let|const)\s+(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>|\w+\s*=>)|function\s+(\w+)\s*\(`),
	"TypeScript": regexp.MustCompile(`(?:var|let|const)\s+(\w+)\s*=\s*(?:function|\([^)]*\)\s*(?::[^=]*)?=>|\w+\s*(?::[^=]*)?=>)|function\s+(\w+)\s*\(`),
	"Python3":    regexp.MustCompile(`def\s+(\w+)\s*\(`),
	"Python":     regexp.MustCompile(`def\s+(\w+)\s*\(`),
	"Ruby":       regexp.MustCompile(`def\s+(\w+)[\s\(]`),
	"PHP":        regexp.MustCompile(`function\s+(\w+)\s*\(`),
}

// pyMethodPattern matches methods inside "class Solution:" specifically.
// Allows whitespace (including newlines) between ( and self for multi-line signatures.
var pyMethodPattern = regexp.MustCompile(`class\s+Solution[\s\S]*?def\s+(\w+)\s*\(\s*self`)

// ExtractFuncName extracts the primary user function name from template code.
func ExtractFuncName(lang, code string) string {
	// For Python, try to find a method inside class Solution first
	if lang == "Python3" || lang == "Python" {
		m := pyMethodPattern.FindStringSubmatch(code)
		if len(m) > 1 && m[1] != "__init__" {
			return m[1]
		}
		// If __init__ was found, look for the next method
		re := regexp.MustCompile(`class\s+Solution[\s\S]*?`)
		loc := re.FindStringIndex(code)
		if loc != nil {
			body := code[loc[1]:]
			defs := regexp.MustCompile(`def\s+(\w+)\s*\(\s*self`).FindAllStringSubmatch(body, -1)
			for _, d := range defs {
				if d[1] != "__init__" {
					return d[1]
				}
			}
		}
	}

	re, ok := funcNamePatterns[lang]
	if !ok {
		return ""
	}
	// Strip block comments (/* ... */) and line comments (// ...) to avoid
	// matching function names defined inside JSDoc or other comment blocks.
	stripped := jsBlockCommentRe.ReplaceAllString(code, "")
	stripped = jsLineCommentRe.ReplaceAllString(stripped, "")

	matches := re.FindStringSubmatch(stripped)
	for i := 1; i < len(matches); i++ {
		if matches[i] != "" {
			return matches[i]
		}
	}
	return ""
}

var jsBlockCommentRe = regexp.MustCompile(`(?s)/\*.*?\*/`)
var jsLineCommentRe = regexp.MustCompile(`//[^\n]*`)

// jsNodePreamble defines ListNode, TreeNode, Node classes and helper functions
// for JS/TS auto-wrapped solutions. Prepended before user code.
const jsNodePreamble = `
try { var _pq = require('@datastructures-js/priority-queue'); var PriorityQueue = _pq.PriorityQueue; var MinPriorityQueue = _pq.MinPriorityQueue; var MaxPriorityQueue = _pq.MaxPriorityQueue; } catch(e) {}
try { var _ = require('lodash'); } catch(e) {}
function ListNode(val, next) { this.val = (val===undefined ? 0 : val); this.next = (next===undefined ? null : next); }
function TreeNode(val, left, right) { this.val = (val===undefined ? 0 : val); this.left = (left===undefined ? null : left); this.right = (right===undefined ? null : right); }
function Node(val, children, next, random, left, right, neighbors) {
  this.val = val === undefined ? 0 : val;
  this.children = children === undefined ? [] : children;
  this.next = next === undefined ? null : next;
  this.random = random === undefined ? null : random;
  this.left = left === undefined ? null : left;
  this.right = right === undefined ? null : right;
  this.neighbors = neighbors === undefined ? [] : neighbors;
}
function _buildList(arr) { if (!arr || !arr.length) return null; var d = new ListNode(0), t = d; for (var i = 0; i < arr.length; i++) { if (arr[i] !== null) { t.next = new ListNode(arr[i]); t = t.next; } } return d.next; }
function _serializeList(head) { var r = []; for (; head; head = head.next) r.push(head.val); return r; }
function _buildTree(arr) { if (!arr || !arr.length || arr[0] === null) return null; var root = new TreeNode(arr[0]); var q = [root], i = 1; while (q.length && i < arr.length) { var n = q.shift(); if (i < arr.length && arr[i] !== null) { n.left = new TreeNode(arr[i]); q.push(n.left); } i++; if (i < arr.length && arr[i] !== null) { n.right = new TreeNode(arr[i]); q.push(n.right); } i++; } return root; }
function _serializeTree(root) { if (!root) return []; var r = [], q = [root]; while (q.length) { var n = q.shift(); if (n) { r.push(n.val); q.push(n.left); q.push(n.right); } else { r.push(null); } } while (r.length && r[r.length-1] === null) r.pop(); return r; }
function _buildNodeTree(arr) { if (!arr || !arr.length || arr[0] === null) return null; var root = new Node(arr[0]); var q = [root], i = 2; while (q.length && i < arr.length) { var parent = q.shift(); parent.children = []; while (i < arr.length) { if (arr[i] === null) { i++; break; } var child = new Node(arr[i]); parent.children.push(child); q.push(child); i++; } } return root; }
function _serializeNodeTree(root) { if (!root) return []; var r = [root.val, null]; var q = [root]; while (q.length) { var n = q.shift(); if (n.children) for (var c of n.children) { r.push(c.val); q.push(c); } r.push(null); } while (r.length && r[r.length-1] === null) r.pop(); return r; }
function _isListNode(v) { return v instanceof ListNode; }
function _isTreeNode(v) { return v instanceof TreeNode; }
function _autoConvert(val, fullSrc, argIdx, totalArgs) { if (!Array.isArray(val)) return val; if (val.length > 0 && Array.isArray(val[0])) return val; var isFlat = val.every(function(x){ return x === null || typeof x === 'number'; }); if (!isFlat) return val; if (fullSrc.match(/ListNode/) && !fullSrc.match(/TreeNode/)) return _buildList(val); if (fullSrc.match(/TreeNode/)) return _buildTree(val); if (fullSrc.match(/\bNode\b/) && fullSrc.match(/children/)) return _buildNodeTree(val); return val; }
function _autoSerialize(val) { if (val instanceof ListNode) return _serializeList(val); if (val instanceof TreeNode) return _serializeTree(val); if (val instanceof Node) return _serializeNodeTree(val); if (Array.isArray(val) && val.length > 0 && val[0] instanceof ListNode) return val.map(_serializeList); if (Array.isArray(val) && val.length > 0 && val[0] instanceof TreeNode) return val.map(_serializeTree); return val; }
`

// runner templates — use {{FUNC}} as the placeholder for the function name.
const jsRunnerTpl = `
;(function(){
  var _rl = require('readline').createInterface({input: process.stdin});
  var _lines = [];
  var _fullSrc = require('fs').readFileSync('/w/solution.js', 'utf8').split('// --- user code ---')[1] || '';
  _rl.on('line', function(l){ var t = l.trim(); if(t) _lines.push(t); });
  _rl.on('close', function(){
    var _fn = {{FUNC}};
    var _parsed = _lines.map(function(l){ return JSON.parse(l); });
    var _args = _parsed.map(function(v){ return _autoConvert(v, _fullSrc); });
    var _result = _fn.apply(null, _args);
    if (_result === undefined || _result === null) {
      _result = _autoSerialize(_args[0]);
    } else {
      _result = _autoSerialize(_result);
    }
    process.stdout.write(JSON.stringify(_result) + '\n');
  });
})();
`

const tsRunnerTpl = `
;(function(){
  const _rl = require('readline').createInterface({input: process.stdin});
  const _lines: string[] = [];
  const _fullSrc: string = (require('fs').readFileSync('/w/solution.ts', 'utf8') as string).split('// --- user code ---')[1] || '';
  _rl.on('line', (l: string) => { const t = l.trim(); if(t) _lines.push(t); });
  _rl.on('close', () => {
    const _fn = {{FUNC}} as Function;
    const _parsed = _lines.map((l: string) => JSON.parse(l));
    const _args = _parsed.map((v: any) => _autoConvert(v, _fullSrc));
    let _result = _fn.apply(null, _args);
    if (_result === undefined || _result === null) {
      _result = _autoSerialize(_args[0]);
    } else {
      _result = _autoSerialize(_result);
    }
    process.stdout.write(JSON.stringify(_result) + '\n');
  });
})();
`

const pyPreamble = `from __future__ import annotations
import builtins as _builtins
from typing import *
from collections import *
from itertools import *
from functools import *
from heapq import *
from bisect import *
from math import *
from string import ascii_lowercase, ascii_uppercase, digits
from operator import xor, or_, add, mul
import sys, collections, itertools, functools, heapq, bisect, math, operator, string, re, random, datetime
from random import choice, randint, shuffle, sample, uniform, randrange
sys.setrecursionlimit(300000)
import threading; threading.stack_size(67108864)  # 64MB stack for deep recursion
try:
    from sortedcontainers import SortedList, SortedDict, SortedSet
except ImportError:
    pass
from fractions import Fraction
def pow(base, exp, mod=None):
    if mod is not None:
        try:
            return _builtins.pow(base, exp, mod)
        except TypeError:
            return _builtins.pow(int(base), int(exp), mod)
    return _builtins.pow(base, exp)

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val; self.left = left; self.right = right
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val; self.next = next
class Node:
    def __init__(self, val=0, neighbors=None, left=None, right=None, next=None, children=None, random=None, parent=None):
        self.val = val; self.neighbors = neighbors if neighbors else []; self.left = left; self.right = right; self.next = next; self.children = children if children else []; self.random = random; self.parent = parent

def _build_tree(arr):
    if not arr or arr[0] is None: return None
    root = TreeNode(arr[0]); q = [root]; i = 1
    while q and i < len(arr):
        node = q.pop(0)
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i]); q.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i]); q.append(node.right)
        i += 1
    return root

def _tree_to_arr(root):
    if not root: return []
    res = []; q = [root]
    while q:
        node = q.pop(0)
        if node: res.append(node.val); q.append(node.left); q.append(node.right)
        else: res.append(None)
    while res and res[-1] is None: res.pop()
    return res

def _build_list(arr):
    if not arr: return None
    dummy = ListNode(0); cur = dummy
    for v in arr: cur.next = ListNode(v); cur = cur.next
    return dummy.next

def _list_to_arr(head):
    res = []; seen = set()
    while head and id(head) not in seen:
        seen.add(id(head)); res.append(head.val); head = head.next
    return res

def _build_nary_tree(arr):
    if not arr or arr[0] is None: return None
    root = Node(arr[0]); root.children = []; q = [root]; i = 2
    while q and i < len(arr):
        parent = q.pop(0)
        while i < len(arr) and arr[i] is not None:
            child = Node(arr[i]); child.children = []
            parent.children.append(child); q.append(child); i += 1
        i += 1
    return root

def _nary_tree_to_arr(root):
    if not root: return []
    res = [root.val, None]; q = [root]
    while q:
        node = q.pop(0)
        for c in (node.children or []):
            res.append(c.val); q.append(c)
        res.append(None)
    while res and res[-1] is None: res.pop()
    return res

def _build_graph_node(adj):
    if not adj: return None
    nodes = {i+1: Node(i+1) for i in range(len(adj))}
    for i, nb in enumerate(adj):
        nodes[i+1].neighbors = [nodes[j] for j in nb]
    return nodes.get(1)

def _build_node_tree(arr):
    if not arr or arr[0] is None: return None
    root = Node(arr[0]); q = [root]; i = 1
    while q and i < len(arr):
        node = q.pop(0)
        if i < len(arr) and arr[i] is not None:
            node.left = Node(arr[i]); node.left.parent = node; q.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = Node(arr[i]); node.right.parent = node; q.append(node.right)
        i += 1
    return root

def _find_node(root, val):
    if root is None: return None
    if root.val == val: return root
    l = _find_node(getattr(root, 'left', None), val)
    if l: return l
    return _find_node(getattr(root, 'right', None), val)

def _node_to_arr(node):
    if isinstance(node, TreeNode): return _tree_to_arr(node)
    if isinstance(node, ListNode): return _list_to_arr(node)
    if not node: return []
    if hasattr(node, 'left') or hasattr(node, 'right'):
        res = []; q = [node]
        while q:
            n = q.pop(0)
            if n: res.append(n.val); q.append(getattr(n,'left',None)); q.append(getattr(n,'right',None))
            else: res.append(None)
        while res and res[-1] is None: res.pop()
        return res
    if node.children:
        return _nary_tree_to_arr(node)
    return node.val

`

const pyRunnerTpl = `
if __name__ == '__main__':
    import sys as _sys, json as _json
    import inspect as _inspect

    _lines = [l.strip() for l in _sys.stdin if l.strip()]
    _args = [_json.loads(l) for l in _lines]

    # Helper: find a TreeNode by value in a tree
    def _find_tree_node(root, val):
        if root is None: return None
        if root.val == val: return root
        l = _find_tree_node(root.left, val)
        if l: return l
        return _find_tree_node(root.right, val)

    # Helper: find a ListNode by value in a linked list
    def _find_list_node(head, val):
        cur = head
        while cur:
            if cur.val == val: return cur
            cur = cur.next
        return None

    # Track built trees/lists/nodes for node-by-value lookup
    _built_trees = []
    _built_lists = []
    _built_nodes = []

    # Convert list args to TreeNode/ListNode/Node based on function signature
    def _convert_arg(_ann, _val, _pname=''):
        _has_ann = _ann and 'empty' not in _ann and _ann != 'None'
        # Annotation-based detection takes priority
        if 'TreeNode' in _ann:
            if isinstance(_val, list):
                t = _build_tree(_val)
                _built_trees.append(t)
                return t
            if isinstance(_val, (int, float)) and _built_trees:
                return _find_tree_node(_built_trees[0], _val)
            return _val
        if 'ListNode' in _ann:
            if isinstance(_val, list):
                l = _build_list(_val)
                _built_lists.append(l)
                return l
            if isinstance(_val, (int, float)) and _built_lists:
                return _find_list_node(_built_lists[0], _val)
            return _val
        if 'Node' in _ann or _pname in ('node',):
            if isinstance(_val, list):
                # Heuristic: adjacency list (list of lists of ints) → graph
                if _val and isinstance(_val[0], list): return _build_graph_node(_val)
                # N-ary tree: second element is None separator (standard N-ary format)
                if len(_val) > 1 and _val[1] is None: return _build_nary_tree(_val)
                # Build as Node tree (with parent pointers) AND also as ListNode/TreeNode
                n = _build_node_tree(_val)
                _built_nodes.append(n)
                _built_lists.append(_build_list(_val))
                _built_trees.append(_build_tree(_val))
                return n
            # int/value → find node by value
            if isinstance(_val, (int, float)):
                # For pname 'node' without annotation: prefer ListNode (deleteNode pattern)
                if _pname == 'node' and 'Node' not in _ann:
                    if _built_lists:
                        return _find_list_node(_built_lists[0], _val)
                # Otherwise: prefer Node tree (parent-pointer problems)
                if _built_nodes:
                    return _find_node(_built_nodes[0], _val)
                if _built_trees:
                    return _find_tree_node(_built_trees[0], _val)
                if _built_lists:
                    return _find_list_node(_built_lists[0], _val)
            return _val
        # Param-name fallback (when no annotation matched)
        if not _has_ann:
            if _pname in ('root', 'tree') and isinstance(_val, list):
                t = _build_tree(_val)
                _built_trees.append(t)
                return t
            if _pname in ('head',) and isinstance(_val, list):
                l = _build_list(_val)
                _built_lists.append(l)
                return l
        if not isinstance(_val, list): return _val
        if 'List[TreeNode]' in _ann:
            return [_build_tree(x) if isinstance(x, list) else x for x in _val]
        if 'List[ListNode]' in _ann:
            return [_build_list(x) if isinstance(x, list) else x for x in _val]
        return _val

    try:
        _sig = _inspect.signature(Solution.{{FUNC}})
        _params = list(_sig.parameters.values())[1:]  # skip self
        _n_params = len(_params)

        # When function expects fewer args than we have, the first input line is
        # often a tree/list and remaining lines are node values to look up.
        # Pre-process: build the tree/list from first arg, shift remaining args.
        if _n_params < len(_args) and isinstance(_args[0], list):
            _first_ann = str(_params[0].annotation) if _params else ''
            _first_pname = _params[0].name if _params else ''
            # Check if any param expects a node type
            _need_remap = False
            for _p in _params:
                _pann = str(_p.annotation)
                _ppname = _p.name
                if 'Node' in _pann or 'TreeNode' in _pann or 'ListNode' in _pann or _ppname in ('node', 'root', 'head', 'p', 'q', 'target'):
                    _need_remap = True
            if _need_remap:
                # Build tree/list from first arg (consumed, not passed to function)
                if isinstance(_args[0], list) and _args[0]:
                    _built_lists.append(_build_list(_args[0]))
                    _built_trees.append(_build_tree(_args[0]))
                    _built_nodes.append(_build_node_tree(_args[0]))
                    # Shift: remove the tree/list arg, keep remaining as actual params
                    _args = _args[1:]

        for _i, _p in enumerate(_params):
            if _i < len(_args):
                _ann = str(_p.annotation)
                _args[_i] = _convert_arg(_ann, _args[_i], _p.name)

        # If func expects 1 param but we have 2+ args (e.g. deleteNode(node))
        # and first arg built a tree/list, find node by value from second arg
        if _n_params == 1 and len(_args) >= 2:
            _ann = str(_params[0].annotation)
            _pname = _params[0].name
            if ('ListNode' in _ann or _pname == 'node') and _built_lists:
                _args = [_find_list_node(_built_lists[0], _args[1])]
            elif 'TreeNode' in _ann and _built_trees:
                _args = [_find_tree_node(_built_trees[0], _args[1])]
            elif 'Node' in _ann and _built_nodes:
                _args = [_find_node(_built_nodes[0], _args[1])]

        # Trim extra args to match parameter count
        if len(_args) > _n_params:
            _args = _args[:_n_params]
    except: pass

    # Detect void (in-place) functions via return annotation
    _is_void = True  # default: assume void if no annotation
    try:
        _ret_ann = str(_sig.return_annotation)
        if _ret_ann in ('None', "<class 'NoneType'>"):
            _is_void = True
        elif _sig.return_annotation is _inspect.Parameter.empty:
            _is_void = True
        else:
            _is_void = False
    except:
        pass

    try:
        _result = Solution().{{FUNC}}(*_args)
    except NameError:
        _result = {{FUNC}}(*_args)

    # Handle void (in-place) functions — only when annotation says void
    if _result is None and _args and _is_void:
        if isinstance(_args[0], TreeNode):
            _result = _tree_to_arr(_args[0])
        elif isinstance(_args[0], ListNode):
            # For deleteNode-style: return the head of the list, not the node
            _head = _built_lists[0] if _built_lists else _args[0]
            _result = _list_to_arr(_head)
        elif isinstance(_args[0], Node):
            _result = _node_to_arr(_args[0])
        else:
            _result = _args[0]

    # Convert TreeNode/ListNode/Node result back to list/array
    def _serialize(r):
        if isinstance(r, TreeNode): return _tree_to_arr(r)
        if isinstance(r, ListNode): return _list_to_arr(r)
        if isinstance(r, Node): return _node_to_arr(r)
        if isinstance(r, list): return [_serialize(x) for x in r]
        return r
    _result = _serialize(_result)

    print(_json.dumps(_result))
`

// pyDesignRunnerTpl handles operation-based problems (e.g. LRU Cache, MinStack, Trie).
// Input format: line 1 = JSON array of operations, line 2 = JSON array of argument lists.
const pyDesignRunnerTpl = `
if __name__ == '__main__':
    import sys as _sys, json as _json, inspect as _inspect

    _lines = [l.strip() for l in _sys.stdin if l.strip()]
    _ops = _json.loads(_lines[0])
    _vals = _json.loads(_lines[1])

    def _convert_arg_design(_ann, _val):
        if not isinstance(_val, list): return _val
        if 'TreeNode' in _ann: return _build_tree(_val)
        if 'ListNode' in _ann: return _build_list(_val)
        if 'Node' in _ann:
            if _val and isinstance(_val[0], list): return _build_graph_node(_val)
            if None in _val: return _build_nary_tree(_val)
            return _build_node_tree(_val)
        return _val

    def _convert_args(_func, _raw_args):
        try:
            _sig = _inspect.signature(_func)
            _params = [p for p in _sig.parameters.values() if p.name != 'self']
            # If function expects 1 param but got multiple values, wrap as single list
            # (handles test data like [-1,-1,-1] meaning a tree [−1,−1,−1])
            if len(_params) == 1 and len(_raw_args) > 1:
                _raw_args[:] = [_raw_args[:]]
            for _i, _p in enumerate(_params):
                if _i < len(_raw_args):
                    _ann = str(_p.annotation)
                    _raw_args[_i] = _convert_arg_design(_ann, _raw_args[_i])
        except: pass
        return _raw_args

    def _serialize_result(_r):
        if isinstance(_r, TreeNode): return _tree_to_arr(_r)
        if isinstance(_r, ListNode): return _list_to_arr(_r)
        if isinstance(_r, Node): return _node_to_arr(_r)
        if isinstance(_r, list): return [_serialize_result(x) for x in _r]
        return _r

    # Constructor — find the class, with fallback name matching
    _cls_name = _ops[0]
    _cls = globals().get(_cls_name)
    if _cls is None:
        # Try to find the user-defined class by scanning globals
        _skip = {'Solution', 'TreeNode', 'ListNode', 'Node', 'PolyNode',
                 'SortedList', 'SortedDict', 'SortedSet', 'Fraction',
                 'OrderedDict', 'Counter', 'ABCMeta', 'ABC'}
        _candidates = [(k, v) for k, v in list(globals().items())
                       if isinstance(v, type) and k not in _skip and not k.startswith('_')]
        if _candidates:
            _cls = _candidates[-1][1]  # last defined class (user's class)
    if _cls is None:
        raise NameError(f"Class '{_cls_name}' not found")

    _ctor_args = list(_vals[0])
    _convert_args(_cls.__init__, _ctor_args)
    _obj = _cls(*_ctor_args)
    _results = [None]

    # Method calls
    for _op, _val in zip(_ops[1:], _vals[1:]):
        _method = getattr(_obj, _op, None)
        if _method is None:
            _results.append(None)
            continue
        _call_args = list(_val)
        _convert_args(_method, _call_args)
        _r = _method(*_call_args)
        _results.append(_serialize_result(_r))

    print(_json.dumps(_results))
`

const rubyRunnerTpl = `
# runner
require 'json'
_lines = $stdin.readlines.map(&:strip).reject(&:empty?)
_args = _lines.map { |l| JSON.parse(l) }
_result = {{FUNC}}(*_args)
puts JSON.generate(_result)
`

const phpRunnerTpl = `
// runner
$_stdin = file_get_contents('php://stdin');
$_lines = array_values(array_filter(array_map('trim', explode("\n", $_stdin))));
$_args = array_map(function($_l) { return json_decode($_l, true); }, $_lines);
$_result = {{FUNC}}(...$_args);
echo json_encode($_result) . "\n";
`

// isPyDesignProblem detects operation-based design problems in Python.
// Design problems use classes like LRUCache, MinStack (not Solution),
// or Solution with __init__ that takes parameters beyond self.
var pyInitWithParamsRe = regexp.MustCompile(`class\s+Solution\b[\s\S]*?def\s+__init__\s*\(\s*self\s*,`)
var pySolutionClassRe = regexp.MustCompile(`(?m)^class\s+Solution\s*[\s:(]`)

func isPyDesignProblem(code string) bool {
	if !pySolutionClassRe.MatchString(code) {
		return true // No class Solution → design class (LRUCache, MinStack, etc.)
	}
	return pyInitWithParamsRe.MatchString(code) // Solution.__init__(self, params) → design
}

// WrapCode appends a stdin→func→JSON runner for A-group languages.
// B-group code is returned unchanged.
func WrapCode(lang, code string) string {
	cfg, ok := LangConfigs[lang]
	if !ok || !cfg.IsAutoWrap {
		return code
	}

	funcName := ExtractFuncName(lang, code)
	if funcName == "" {
		funcName = "solution"
	}

	// Compiled languages with auto-wrap handled by wrap_compiled.go
	switch lang {
	case "C++":
		return wrapCpp(code)
	case "Java":
		return wrapJava(code)
	}

	var tpl string
	var preamble string
	switch lang {
	case "JavaScript":
		preamble = jsNodePreamble
		tpl = jsRunnerTpl
	case "TypeScript":
		preamble = jsNodePreamble
		tpl = tsRunnerTpl
	case "Python3", "Python":
		preamble = pyPreamble
		if isPyDesignProblem(code) {
			tpl = pyDesignRunnerTpl
		} else {
			tpl = pyRunnerTpl
		}
	case "Ruby":
		tpl = rubyRunnerTpl
	case "PHP":
		tpl = phpRunnerTpl
	default:
		return code
	}

	runner := strings.ReplaceAll(tpl, "{{FUNC}}", funcName)
	marker := ""
	if lang == "JavaScript" || lang == "TypeScript" {
		marker = "\n// --- user code ---\n"
	}
	return preamble + marker + code + runner
}
