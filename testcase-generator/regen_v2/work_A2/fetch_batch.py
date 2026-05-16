#!/usr/bin/env python3
"""Helper: fetch problem batch from MySQL. Pure I/O, no generation."""
import sys, json, os, subprocess, html, re

def html_to_text(s):
    if not s:
        return ""
    # Strip HTML tags but keep structure markers
    s = re.sub(r'<sup>(.*?)</sup>', r'^\1', s)
    s = re.sub(r'<sub>(.*?)</sub>', r'_\1', s)
    s = re.sub(r'<br\s*/?>', '\n', s)
    s = re.sub(r'</p>', '\n', s)
    s = re.sub(r'</li>', '\n', s)
    s = re.sub(r'</pre>', '\n', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s)
    s = re.sub(r'\n{3,}', '\n\n', s)
    return s.strip()

def fetch(start_id, end_id, done_pids):
    import pymysql
    conn = pymysql.connect(host='127.0.0.1', user='root', password='', database='gatecode', charset='utf8mb4')
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("""
        SELECT id, slug, title, content, is_acm_mode, template_code
        FROM problems
        WHERE judge_enabled=1 AND id BETWEEN %s AND %s
        ORDER BY id
    """, (start_id, end_id))
    out = []
    for row in cur.fetchall():
        if row['id'] in done_pids:
            continue
        tc = row['template_code']
        if isinstance(tc, str):
            try:
                tc = json.loads(tc)
            except Exception:
                tc = {}
        # only keep cpp + python3 signatures
        sig = {}
        if isinstance(tc, dict):
            for k in ('C++', 'Python3', 'Python'):
                if k in tc:
                    sig[k] = tc[k]
        out.append({
            'id': row['id'],
            'slug': row['slug'],
            'title': row['title'],
            'is_acm_mode': bool(row['is_acm_mode']),
            'content': html_to_text(row['content']),
            'signatures': sig,
        })
    conn.close()
    return out

if __name__ == '__main__':
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 1910
    end = int(sys.argv[2]) if len(sys.argv) > 2 else 3845
    inputs_dir = '/Users/capsfly/Desktop/gatecode/testcase-generator/regen_v2/inputs'
    done = set()
    if os.path.isdir(inputs_dir):
        for f in os.listdir(inputs_dir):
            m = re.match(r'(\d+)\.json$', f)
            if m:
                done.add(int(m.group(1)))
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else 50
    data = fetch(start, end, done)[:limit]
    print(json.dumps(data, ensure_ascii=False))
