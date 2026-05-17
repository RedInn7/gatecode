#!/usr/bin/env python3
"""
RetryGen-1: Generate outputs for retry PIDs (pid <= 1500)
Uses the SAME wrapper as backend/internal/sandbox/languages.go pyPreamble + pyRunnerTpl.
"""

import json
import os
import re
import subprocess
import sys
import tempfile
import time
import threading
import traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import pymysql

# ── Paths ──────────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path("/Users/capsfly/Desktop/gatecode")
SOL1_BASE = PROJECT_ROOT / "leetcode solution" / "solution 1" / "solution"
SOL2_BASE = PROJECT_ROOT / "leetcode solution" / "solution 2"
INPUTS_DIR = PROJECT_ROOT / "testcase-generator" / "regen_v2" / "inputs"
REGEN_DIR  = PROJECT_ROOT / "testcase-generator" / "regen_v2"

SKIPPED_FILE = REGEN_DIR / "STAGE_RETRY1_skipped.json"
ERRORS_FILE  = REGEN_DIR / "STAGE_RETRY1_errors.json"
SUMMARY_FILE = REGEN_DIR / "STAGE_RETRY1.md"

# ── Python wrapper (verbatim from languages.go pyPreamble + pyRunnerTpl) ──────
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

"""

PY_RUNNER_TPL = r"""
if __name__ == '__main__':
    import sys as _sys, json as _json
    import inspect as _inspect

    _lines = [l.strip() for l in _sys.stdin if l.strip()]
    def _safe_loads(l):
        try:
            return _json.loads(l)
        except Exception:
            # Raw string (unquoted) — treat as string literal
            return l
    _args = [_safe_loads(l) for l in _lines]

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
        # Coerce to str if annotation requires it
        if _ann in ("str", "<class 'str'>") or _ann == 'str':
            return str(_val)
        if _ann.startswith('str') and not _ann.startswith('strict'):
            if isinstance(_val, (int, float)):
                return str(_val)
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
                # Heuristic: adjacency list (list of lists of ints) -> graph
                if _val and isinstance(_val[0], list): return _build_graph_node(_val)
                # N-ary tree: second element is None separator (standard N-ary format)
                if len(_val) > 1 and _val[1] is None: return _build_nary_tree(_val)
                # Build as Node tree (with parent pointers) AND also as ListNode/TreeNode
                n = _build_node_tree(_val)
                _built_nodes.append(n)
                _built_lists.append(_build_list(_val))
                _built_trees.append(_build_tree(_val))
                return n
            # int/value -> find node by value
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
        _sig = _inspect.signature(Solution.{FUNC})
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
        _result = Solution().{FUNC}(*_args)
    except NameError:
        _result = {FUNC}(*_args)

    # Handle void (in-place) functions -- only when annotation says void
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

    print(_json.dumps(_results))
"""


# ── Helpers ───────────────────────────────────────────────────────────────────

def extract_func_name(code: str) -> str:
    """Extract primary method name from Python Solution class."""
    m = re.search(r'class\s+Solution[\s\S]*?def\s+(\w+)\s*\(\s*self', code)
    if m and m.group(1) != '__init__':
        return m.group(1)
    loc = re.search(r'class\s+Solution', code)
    if loc:
        body = code[loc.end():]
        defs = re.findall(r'def\s+(\w+)\s*\(\s*self', body)
        for d in defs:
            if d != '__init__':
                return d
    return ''


def is_design_problem(code: str) -> bool:
    """Detect operation-based design problems."""
    has_solution = re.search(r'(?m)^class\s+Solution\s*[\s:(]', code)
    if not has_solution:
        return True
    init_with_params = re.search(r'class\s+Solution\b[\s\S]*?def\s+__init__\s*\(\s*self\s*,', code)
    return bool(init_with_params)


def build_wrapper(code: str) -> str:
    """Build complete wrapped Python script."""
    if is_design_problem(code):
        runner = PY_DESIGN_RUNNER_TPL
    else:
        func_name = extract_func_name(code)
        if not func_name:
            func_name = 'solution'
        runner = PY_RUNNER_TPL.replace('{FUNC}', func_name)
    return PY_PREAMBLE + code + runner


def find_solution(slug: str, fqid: int) -> str | None:
    """Find Python3 solution for a given slug/fqid."""
    ext = '.py'
    # SOL1: numbered directory structure
    rng = f'{fqid // 100 * 100:04d}-{fqid // 100 * 100 + 99:04d}'
    rng_dir = SOL1_BASE / rng
    if rng_dir.exists():
        for d in rng_dir.iterdir():
            if d.is_dir() and d.name.startswith(f'{fqid:04d}'):
                for f in d.iterdir():
                    if f.name.lower().startswith('solution') and f.suffix == ext:
                        code = f.read_text(errors='ignore')
                        if len(code.strip()) > 30:
                            return code
    # SOL2: slug-based files in Python/Python3
    for py_dir in [SOL2_BASE / 'Python', SOL2_BASE / 'Python3']:
        if py_dir.exists():
            for suffix in ['.py', '.py3']:
                fp = py_dir / f'{slug}{suffix}'
                if fp.exists():
                    code = fp.read_text(errors='ignore')
                    if len(code.strip()) > 30:
                        return code
    return None


def run_testcase(wrapped_code: str, input_str: str, timeout: int = 10) -> tuple[bool, str, str]:
    """Run wrapped code with input_str as stdin. Returns (ok, stdout, stderr)."""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, prefix='/tmp/gc_retry1_') as f:
        f.write(wrapped_code)
        tmppath = f.name
    try:
        result = subprocess.run(
            ['python3', tmppath],
            input=input_str,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        stdout = result.stdout.strip()
        stderr = result.stderr.strip()
        if result.returncode != 0:
            return False, stdout, stderr or f'exit code {result.returncode}'
        if not stdout:
            return False, stdout, 'empty output'
        return True, stdout, stderr
    except subprocess.TimeoutExpired:
        return False, '', f'timeout after {timeout}s'
    except Exception as e:
        return False, '', str(e)
    finally:
        try:
            os.unlink(tmppath)
        except:
            pass


# ── Main logic ─────────────────────────────────────────────────────────────────

lock = threading.Lock()
skipped = {}   # pid -> reason
errors  = {}   # pid -> list of {testcase_idx, error}
stats = {'processed': 0, 'filled': 0, 'partial': 0, 'skipped': 0, 'errored': 0}


def process_pid(pid: int, fqid: int, slug: str) -> bool:
    """Process one PID. Returns True if outputs were filled."""
    input_path = INPUTS_DIR / f'{pid}.json'
    if not input_path.exists():
        with lock:
            skipped[pid] = 'no_input_file'
            stats['skipped'] += 1
        return False

    # Find solution
    sol_code = find_solution(slug, fqid)
    if not sol_code:
        with lock:
            skipped[pid] = 'solution_missing'
            stats['skipped'] += 1
        return False

    # Build wrapper
    try:
        wrapped = build_wrapper(sol_code)
    except Exception as e:
        with lock:
            skipped[pid] = f'wrap_error: {e}'
            stats['skipped'] += 1
        return False

    # Read input file
    with open(input_path, encoding='utf-8') as f:
        data = json.load(f)

    testcases = data.get('testcases', [])
    if not testcases:
        with lock:
            skipped[pid] = 'no_testcases'
            stats['skipped'] += 1
        return False

    pid_errors = []
    outputs = []

    for idx, tc in enumerate(testcases):
        input_str = tc.get('input', '')
        # If already has a valid output, keep it
        existing = tc.get('output')
        if existing not in (None, ''):
            outputs.append(existing)
            continue
        ok, stdout, stderr = run_testcase(wrapped, input_str, timeout=10)
        if not ok:
            pid_errors.append({'testcase_idx': idx, 'error': stderr or 'empty output', 'input': input_str[:200]})
            outputs.append(None)
        else:
            outputs.append(stdout)

    # Count failures
    failed = [i for i, o in enumerate(outputs) if o is None]
    success_count = len(testcases) - len(failed)

    # If ALL failed, skip this PID
    if success_count == 0:
        with lock:
            errors[pid] = pid_errors
            stats['errored'] += 1
        return False

    # Fill outputs (leave errored ones as empty string)
    is_partial = len(failed) > 0
    for idx, tc in enumerate(testcases):
        if outputs[idx] is not None:
            tc['output'] = outputs[idx]
        else:
            tc['output'] = ''

    # Write back JSON
    with open(input_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

    # Update DB
    try:
        db_testcases = [{'input': tc['input'], 'output': tc.get('output', '')} for tc in testcases]
        conn = pymysql.connect(
            host='127.0.0.1', port=3306, user='root', password='',
            database='gatecode', charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
        )
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    'UPDATE problems SET test_cases = %s WHERE id = %s',
                    (json.dumps(db_testcases, ensure_ascii=False), pid)
                )
            conn.commit()
    except Exception as e:
        with lock:
            print(f'  [WARN] DB update failed for pid={pid}: {e}', flush=True)

    with lock:
        if is_partial:
            stats['partial'] += 1
        else:
            stats['filled'] += 1
        if pid_errors:
            errors[pid] = pid_errors

    return True


def commit_batch(batch_pids: list, batch_num: int):
    """Git add + commit a batch of filled input files."""
    files = [str(INPUTS_DIR / f'{pid}.json') for pid in batch_pids if (INPUTS_DIR / f'{pid}.json').exists()]
    if not files:
        return
    try:
        subprocess.run(['git', 'add'] + files, cwd=PROJECT_ROOT, check=True, capture_output=True)
        min_pid = min(batch_pids)
        max_pid = max(batch_pids)
        n = len(batch_pids)
        msg = f'regen-v2 retry-1: filled outputs for {n} PIDs ({min_pid}-{max_pid})'
        subprocess.run(['git', 'commit', '-m', msg], cwd=PROJECT_ROOT, check=True, capture_output=True)
        # Push with retry
        for attempt in range(3):
            result = subprocess.run(['git', 'push', 'origin', 'main'], cwd=PROJECT_ROOT, capture_output=True, text=True)
            if result.returncode == 0:
                break
            if attempt < 2:
                # Pull rebase first then push again
                subprocess.run(['git', 'pull', '--rebase', 'origin', 'main'], cwd=PROJECT_ROOT, capture_output=True)
                time.sleep(3)
        print(f'  [GIT] Committed batch {batch_num}: {n} PIDs ({min_pid}-{max_pid})', flush=True)
    except Exception as e:
        print(f'  [GIT] Commit failed for batch {batch_num}: {e}', flush=True)


def write_state_files():
    """Write skipped and errors JSON files."""
    with open(SKIPPED_FILE, 'w') as f:
        json.dump(skipped, f, indent=2)
    with open(ERRORS_FILE, 'w') as f:
        json.dump(errors, f, indent=2)


def write_summary(elapsed: float, todo_count: int):
    total = stats['filled'] + stats['partial']
    with open(SUMMARY_FILE, 'w') as f:
        f.write(f"# STAGE_RETRY1 Summary\n\n")
        f.write(f"- Elapsed: {elapsed/60:.1f} min\n")
        f.write(f"- PIDs in range: {todo_count}\n")
        f.write(f"- Processed: {stats['processed']}\n")
        f.write(f"- Filled (all outputs): {stats['filled']}\n")
        f.write(f"- Partial (some outputs): {stats['partial']}\n")
        f.write(f"- Skipped (no solution): {stats['skipped']}\n")
        f.write(f"- Errored (all failed): {stats['errored']}\n")
        f.write(f"- Total with outputs: {total}\n")


def main():
    start_time = time.time()
    MAX_SECONDS = 7200  # 2 hours

    # Load retry PIDs (pid <= 1500)
    with open(REGEN_DIR / 'retry_output_pids.json') as f:
        all_pids = json.load(f)['pids']
    pids_le1500 = sorted([p for p in all_pids if p <= 1500])
    print(f'Retry PIDs <= 1500: {len(pids_le1500)}', flush=True)

    # Build pid -> (fqid, slug) map from DB
    conn = pymysql.connect(
        host='127.0.0.1', port=3306, user='root', password='',
        database='gatecode', charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
    )
    with conn:
        with conn.cursor() as cur:
            placeholders = ','.join(map(str, pids_le1500))
            cur.execute(f'SELECT id, frontend_question_id, slug FROM problems WHERE id IN ({placeholders}) ORDER BY id')
            rows = cur.fetchall()

    pid_map = {r['id']: (r['frontend_question_id'], r['slug']) for r in rows}

    # Find which need output
    todo = []
    already_done = []
    for pid in pids_le1500:
        input_path = INPUTS_DIR / f'{pid}.json'
        if input_path.exists():
            try:
                with open(input_path) as f:
                    data = json.load(f)
                tcs = data.get('testcases', [])
                if tcs and all(tc.get('output', '') not in ('', None) for tc in tcs):
                    already_done.append(pid)
                    continue
            except:
                pass
        todo.append(pid)

    print(f'Already done: {len(already_done)}, TODO: {len(todo)}', flush=True)
    stats['processed'] = len(already_done)
    stats['filled'] = len(already_done)

    if not todo:
        print('Nothing to do!', flush=True)
        write_summary(time.time() - start_time, len(pids_le1500))
        return

    BATCH_SIZE = 25
    WORKERS = 20
    consecutive_failures = 0
    batch_pids = []
    batch_num = 0
    last_progress = time.time()
    pending_commit = []

    def process_one(pid):
        fqid, slug = pid_map[pid]
        return pid, process_pid(pid, fqid, slug)

    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {executor.submit(process_one, pid): pid for pid in todo}

        for future in as_completed(futures):
            pid = futures[future]
            try:
                _, success = future.result()
            except Exception as e:
                with lock:
                    errors[pid] = [{'testcase_idx': -1, 'error': str(e)}]
                    stats['errored'] += 1
                success = False

            do_commit = False
            commit_pids = []
            with lock:
                stats['processed'] += 1
                if success:
                    batch_pids.append(pid)
                    consecutive_failures = 0
                else:
                    consecutive_failures += 1

                if consecutive_failures >= 30:
                    print(f'[HALT] 30 consecutive failures at pid={pid}', flush=True)
                    write_state_files()
                    write_summary(time.time() - start_time, len(pids_le1500))
                    sys.exit(1)

                elapsed = time.time() - start_time
                if elapsed > MAX_SECONDS:
                    print(f'[HALT] 2-hour limit reached', flush=True)
                    write_state_files()
                    write_summary(elapsed, len(pids_le1500))
                    sys.exit(0)

                # Commit every BATCH_SIZE successes
                if len(batch_pids) >= BATCH_SIZE:
                    batch_num += 1
                    commit_pids = batch_pids[:]
                    batch_pids.clear()
                    do_commit = True

                # Progress every 5 minutes
                if time.time() - last_progress >= 300:
                    last_progress = time.time()
                    p = stats['processed']
                    f = stats['filled']
                    pt = stats['partial']
                    s = stats['skipped']
                    e = stats['errored']
                    elapsed_min = (time.time() - start_time) / 60
                    print(f'[PROGRESS] {elapsed_min:.1f}min | processed={p} filled={f} partial={pt} skipped={s} errored={e}', flush=True)

            # Commit outside lock
            if do_commit and commit_pids:
                commit_batch(commit_pids, batch_num)

    # Commit remaining
    if batch_pids:
        batch_num += 1
        commit_batch(batch_pids, batch_num)

    elapsed = time.time() - start_time
    write_state_files()
    write_summary(elapsed, len(pids_le1500))

    f = stats['filled']
    pt = stats['partial']
    s = stats['skipped']
    e = stats['errored']
    print(f'\n[DONE] {elapsed/60:.1f}min | filled={f} partial={pt} skipped={s} errored={e}', flush=True)


if __name__ == '__main__':
    main()
