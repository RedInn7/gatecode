#!/usr/bin/env python3
"""Helper: fetch problem batch from MySQL in DESC order. Pure I/O, no generation."""
import sys, json, os, html, re
import pymysql

REGEN_DIR = '/Users/capsfly/Desktop/gatecode/testcase-generator/regen_v2'
SIG_LANGS = ('C++', 'Python3', 'Python')

_HTML_REPLACEMENTS = [
    (re.compile(r'<sup>(.*?)</sup>'), r'^\1'),
    (re.compile(r'<sub>(.*?)</sub>'), r'_\1'),
    (re.compile(r'<br\s*/?>'), '\n'),
    (re.compile(r'</(?:p|li|pre)>'), '\n'),
    (re.compile(r'<[^>]+>'), ''),
]
_BLANK_RE = re.compile(r'\n{3,}')

def html_to_text(s):
    if not s:
        return ""
    for pat, rep in _HTML_REPLACEMENTS:
        s = pat.sub(rep, s)
    return _BLANK_RE.sub('\n\n', html.unescape(s)).strip()

def load_done_pids():
    done = set()
    inputs_dir = os.path.join(REGEN_DIR, 'inputs')
    for f in os.listdir(inputs_dir):
        m = re.match(r'(\d+)\.json$', f)
        if m:
            done.add(int(m.group(1)))
    try:
        with open(os.path.join(REGEN_DIR, 'skipped_by_A2.json')) as fh:
            for s in json.load(fh).get('skipped', []):
                done.add(s['pid'])
    except (FileNotFoundError, json.JSONDecodeError):
        pass
    return done

def fetch(start_id, end_id, done_pids, desc=False):
    order = 'DESC' if desc else 'ASC'
    conn = pymysql.connect(host='127.0.0.1', user='root', password='', database='gatecode', charset='utf8mb4')
    try:
        cur = conn.cursor(pymysql.cursors.DictCursor)
        cur.execute(f"""
            SELECT id, slug, title, content, is_acm_mode, template_code
            FROM problems
            WHERE judge_enabled=1 AND id BETWEEN %s AND %s
            ORDER BY id {order}
        """, (start_id, end_id))
        out = []
        for row in cur.fetchall():
            if row['id'] in done_pids:
                continue
            tc = row['template_code']
            if isinstance(tc, str):
                try:
                    tc = json.loads(tc)
                except json.JSONDecodeError:
                    tc = {}
            sig = {k: tc[k] for k in SIG_LANGS if isinstance(tc, dict) and k in tc}
            out.append({
                'id': row['id'],
                'slug': row['slug'],
                'title': row['title'],
                'is_acm_mode': bool(row['is_acm_mode']),
                'content': html_to_text(row['content']),
                'signatures': sig,
            })
        return out
    finally:
        conn.close()

if __name__ == '__main__':
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 1910
    end = int(sys.argv[2]) if len(sys.argv) > 2 else 3845
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else 50
    desc = (len(sys.argv) > 4 and sys.argv[4] == 'desc')
    data = fetch(start, end, load_done_pids(), desc=desc)[:limit]
    print(json.dumps(data, ensure_ascii=False))
