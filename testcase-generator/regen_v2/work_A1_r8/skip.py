#!/usr/bin/env python3
"""Append a PID to skipped_by_A1.json with reason."""
import json, sys, os
REGEN_DIR = '/Users/capsfly/Desktop/gatecode/testcase-generator/regen_v2'

def main():
    if len(sys.argv) < 4:
        sys.exit("usage: skip.py <pid> <slug> <reason>")
    pid = int(sys.argv[1])
    slug = sys.argv[2]
    reason = sys.argv[3]
    path = os.path.join(REGEN_DIR, 'skipped_by_A1.json')
    with open(path) as f:
        d = json.load(f)
    if any(s['pid'] == pid for s in d['skipped']):
        print(f"pid {pid} already skipped")
        return
    d['skipped'].append({'pid': pid, 'slug': slug, 'reason': reason})
    d['skipped'].sort(key=lambda x: x['pid'])
    with open(path, 'w') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
    print(f"added skip pid={pid}")

if __name__ == '__main__':
    main()
