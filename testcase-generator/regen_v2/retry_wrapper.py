#!/usr/bin/env python3
"""
retry_wrapper.py — Shared wrapper utilities for RetryGen-1 and RetryGen-2.

Provides:
- PY_PREAMBLE: full Python preamble (matches languages.go pyPreamble + helpers)
- PY_RUNNER_TPL: runner template (matches languages.go pyRunnerTpl)
- PY_DESIGN_RUNNER_TPL: design runner template
- find_solution(real_pid) -> Optional[str]
- build_wrapped_code(solution_code) -> str
- run_testcase(code_file, tc_input, timeout) -> (output, error)
- is_design_problem(code) -> bool
- extract_func_name(code) -> str
"""

import re
import subprocess
import tempfile
import os
from pathlib import Path

PROJECT_ROOT = Path("/Users/capsfly/Desktop/gatecode")
SOL1_BASE = PROJECT_ROOT / "leetcode solution" / "solution 1" / "solution"
SOL2_BASE = PROJECT_ROOT / "leetcode solution" / "solution 2"

# ── preamble (matches languages.go pyPreamble) ────────────────────────────────
PY_PREAMBLE = r"""from __future__ import annotations
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
import threading; threading.stack_size(67108864)
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

"""

# ── runner templates ──────────────────────────────────────────────────────────
PY_RUNNER_TPL = r"""
if __name__ == '__main__':
    import sys as _sys, json as _json
    import inspect as _inspect

    _lines = [l.strip() for l in _sys.stdin if l.strip()]
    _args = [_json.loads(l) for l in _lines]

    def _find_tree_node(root, val):
        if root is None: return None
        if root.val == val: return root
        l = _find_tree_node(root.left, val)
        if l: return l
        return _find_tree_node(root.right, val)

    def _find_list_node(head, val):
        cur = head
        while cur:
            if cur.val == val: return cur
            cur = cur.next
        return None

    _built_trees = []
    _built_lists = []
    _built_nodes = []

    def _convert_arg(_ann, _val, _pname=''):
        _has_ann = _ann and 'empty' not in _ann and _ann != 'None'
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
                if _val and isinstance(_val[0], list): return _build_graph_node(_val)
                if len(_val) > 1 and _val[1] is None: return _build_nary_tree(_val)
                n = _build_node_tree(_val)
                _built_nodes.append(n)
                _built_lists.append(_build_list(_val))
                _built_trees.append(_build_tree(_val))
                return n
            if isinstance(_val, (int, float)):
                if _pname == 'node' and 'Node' not in _ann:
                    if _built_lists:
                        return _find_list_node(_built_lists[0], _val)
                if _built_nodes:
                    return _find_node(_built_nodes[0], _val)
                if _built_trees:
                    return _find_tree_node(_built_trees[0], _val)
                if _built_lists:
                    return _find_list_node(_built_lists[0], _val)
            return _val
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
        _sig = _inspect.signature(Solution.__FUNC__)
        _params = list(_sig.parameters.values())[1:]
        _n_params = len(_params)

        if _n_params < len(_args) and isinstance(_args[0], list):
            _need_remap = False
            for _p in _params:
                _pann = str(_p.annotation)
                _ppname = _p.name
                if 'Node' in _pann or 'TreeNode' in _pann or 'ListNode' in _pann or _ppname in ('node', 'root', 'head', 'p', 'q', 'target'):
                    _need_remap = True
            if _need_remap:
                if isinstance(_args[0], list) and _args[0]:
                    _built_lists.append(_build_list(_args[0]))
                    _built_trees.append(_build_tree(_args[0]))
                    _built_nodes.append(_build_node_tree(_args[0]))
                    _args = _args[1:]

        for _i, _p in enumerate(_params):
            if _i < len(_args):
                _ann = str(_p.annotation)
                _args[_i] = _convert_arg(_ann, _args[_i], _p.name)

        if _n_params == 1 and len(_args) >= 2:
            _ann = str(_params[0].annotation)
            _pname = _params[0].name
            if ('ListNode' in _ann or _pname == 'node') and _built_lists:
                _args = [_find_list_node(_built_lists[0], _args[1])]
            elif 'TreeNode' in _ann and _built_trees:
                _args = [_find_tree_node(_built_trees[0], _args[1])]
            elif 'Node' in _ann and _built_nodes:
                _args = [_find_node(_built_nodes[0], _args[1])]

        if len(_args) > _n_params:
            _args = _args[:_n_params]
    except: pass

    _is_void = True
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
        _result = Solution().__FUNC__(*_args)
    except NameError:
        _result = __FUNC__(*_args)

    if _result is None and _args and _is_void:
        if isinstance(_args[0], TreeNode):
            _result = _tree_to_arr(_args[0])
        elif isinstance(_args[0], ListNode):
            _head = _built_lists[0] if _built_lists else _args[0]
            _result = _list_to_arr(_head)
        elif isinstance(_args[0], Node):
            _result = _node_to_arr(_args[0])
        else:
            _result = _args[0]

    def _serialize(r):
        if isinstance(r, TreeNode): return _tree_to_arr(r)
        if isinstance(r, ListNode): return _list_to_arr(r)
        if isinstance(r, Node): return _node_to_arr(r)
        if isinstance(r, list): return [_serialize(x) for x in r]
        return r
    _result = _serialize(_result)

    print(_json.dumps(_result, separators=(',', ':')))
"""

PY_DESIGN_RUNNER_TPL = r"""
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

    _cls_name = _ops[0]
    _cls = globals().get(_cls_name)
    if _cls is None:
        _skip = {'Solution', 'TreeNode', 'ListNode', 'Node', 'PolyNode',
                 'SortedList', 'SortedDict', 'SortedSet', 'Fraction',
                 'OrderedDict', 'Counter', 'ABCMeta', 'ABC'}
        _candidates = [(k, v) for k, v in list(globals().items())
                       if isinstance(v, type) and k not in _skip and not k.startswith('_')]
        if _candidates:
            _cls = _candidates[-1][1]
    if _cls is None:
        raise NameError(f"Class '{_cls_name}' not found")

    _ctor_args = list(_vals[0])
    _convert_args(_cls.__init__, _ctor_args)
    _obj = _cls(*_ctor_args)
    _results = [None]

    for _op, _val in zip(_ops[1:], _vals[1:]):
        _method = getattr(_obj, _op, None)
        if _method is None:
            _results.append(None)
            continue
        _call_args = list(_val)
        _convert_args(_method, _call_args)
        _r = _method(*_call_args)
        _results.append(_serialize_result(_r))

    print(_json.dumps(_results, separators=(',', ':')))
"""

# ── regex ─────────────────────────────────────────────────────────────────────
_py_method_re = re.compile(r'class\s+Solution[\s\S]*?def\s+(\w+)\s*\(\s*self')
_py_init_params_re = re.compile(r'class\s+Solution\b[\s\S]*?def\s+__init__\s*\(\s*self\s*,')
_py_solution_re = re.compile(r'(?m)^class\s+Solution\s*[\s:(]')


def extract_func_name(code: str) -> str:
    m = _py_method_re.search(code)
    if m and m.group(1) != '__init__':
        return m.group(1)
    loc = re.search(r'class\s+Solution', code)
    if loc:
        body = code[loc.end():]
        for d in re.finditer(r'def\s+(\w+)\s*\(\s*self', body):
            if d.group(1) != '__init__':
                return d.group(1)
    return ''


def is_design_problem(code: str) -> bool:
    if not _py_solution_re.search(code):
        return True
    return bool(_py_init_params_re.search(code))


def find_solution(real_pid: int) -> str | None:
    """Find Python solution for given frontend_question_id. Checks SOL1 then SOL2."""
    rng = f'{real_pid // 100 * 100:04d}-{real_pid // 100 * 100 + 99:04d}'
    for base in [SOL1_BASE, SOL2_BASE]:
        parent = base / rng
        if not parent.exists():
            continue
        for d in parent.iterdir():
            if d.is_dir() and d.name.startswith(f'{real_pid:04d}'):
                for f in d.iterdir():
                    if f.name.lower().startswith('solution') and f.suffix == '.py':
                        code = f.read_text(errors='replace')
                        if len(code.strip()) > 30:
                            return code
    # Check SOL2 python subdir
    for base in [SOL2_BASE]:
        parent = base / 'python' / rng
        if not parent.exists():
            continue
        for d in parent.iterdir():
            if d.is_dir() and d.name.startswith(f'{real_pid:04d}'):
                for f in d.iterdir():
                    if f.name.lower().startswith('solution') and f.suffix == '.py':
                        code = f.read_text(errors='replace')
                        if len(code.strip()) > 30:
                            return code
    return None


def build_wrapped_code(solution_code: str) -> str:
    """Build the full Python file: preamble + solution + runner."""
    if is_design_problem(solution_code):
        runner = PY_DESIGN_RUNNER_TPL
    else:
        func = extract_func_name(solution_code)
        if not func:
            func = 'solution'
        runner = PY_RUNNER_TPL.replace('__FUNC__', func)
    return PY_PREAMBLE + solution_code + runner


def run_testcase(code_file: str, tc_input: str, timeout: int = 5) -> tuple[str, str]:
    """Run solution against one testcase input. Returns (output, error)."""
    try:
        result = subprocess.run(
            ['python3', code_file],
            input=tc_input,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        if result.returncode != 0:
            return '', result.stderr.strip()[:500]
        out = result.stdout.strip()
        if not out:
            return '', 'empty output'
        return out, ''
    except subprocess.TimeoutExpired:
        return '', 'timeout'
    except Exception as e:
        return '', str(e)
