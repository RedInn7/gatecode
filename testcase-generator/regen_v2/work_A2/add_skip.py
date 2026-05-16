#!/usr/bin/env python3
"""Add skip entries: usage echo 'pid|slug|reason' lines via stdin."""
import sys, json, os

REGEN_DIR = '/Users/capsfly/Desktop/gatecode/testcase-generator/regen_v2'
path = os.path.join(REGEN_DIR, 'skipped_by_A2.json')

with open(path) as fh:
    doc = json.load(fh)

added = 0
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    pid, slug, reason = line.split('|', 2)
    pid = int(pid)
    if any(s['pid'] == pid for s in doc['skipped']):
        continue
    doc['skipped'].append({'pid': pid, 'slug': slug, 'reason': reason})
    added += 1

doc['skipped'].sort(key=lambda x: x['pid'])
with open(path, 'w') as fh:
    json.dump(doc, fh, ensure_ascii=False, indent=2)
print(f'added {added}, total {len(doc["skipped"])}')
