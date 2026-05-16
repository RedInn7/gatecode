#!/usr/bin/env python3
"""Write a problem's input JSON. Pass JSON-encoded payload via argv or stdin.

Usage:
  python3 wr.py '{"pid":2304,"slug":"...","inferred_constraints":"...","input_format":"...","testcases":[{"input":"...","desc":"..."}]}'
or
  cat payload.json | python3 wr.py -
"""
import json, sys, os
REGEN_DIR = '/Users/capsfly/Desktop/gatecode/testcase-generator/regen_v2'

def main():
    if len(sys.argv) < 2:
        sys.exit("need payload arg")
    arg = sys.argv[1]
    if arg == '-':
        data = json.load(sys.stdin)
    else:
        # support filepath or raw json
        if os.path.exists(arg):
            with open(arg) as f:
                data = json.load(f)
        else:
            data = json.loads(arg)
    pid = data['pid']
    if not (2303 <= pid <= 3846):
        sys.exit(f"pid {pid} out of range [2303,3846]")
    tcs = data.get('testcases', [])
    if len(tcs) != 20:
        sys.exit(f"need exactly 20 testcases, got {len(tcs)}")
    for tc in tcs:
        if 'input' not in tc or 'desc' not in tc:
            sys.exit("each testcase needs input + desc")
    out_path = os.path.join(REGEN_DIR, 'inputs', f'{pid}.json')
    # Pretty format like other files
    lines = ['{',
        f'  "pid": {pid},',
        f'  "slug": {json.dumps(data["slug"])},',
        f'  "inferred_constraints": {json.dumps(data["inferred_constraints"])},',
        f'  "input_format": {json.dumps(data["input_format"])},',
        '  "testcases": [',
    ]
    for i, tc in enumerate(tcs):
        comma = ',' if i < len(tcs) - 1 else ''
        lines.append(f'    {{"input": {json.dumps(tc["input"])}, "desc": {json.dumps(tc["desc"])}}}{comma}')
    lines.append('  ]')
    lines.append('}')
    with open(out_path, 'w') as f:
        f.write('\n'.join(lines) + '\n')
    print(f"wrote {out_path}")

if __name__ == '__main__':
    main()
