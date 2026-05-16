#!/usr/bin/env python3
"""Write a single input file for a PID. Reads JSON spec from stdin or arg."""
import sys, json, os

REGEN_DIR = '/Users/capsfly/Desktop/gatecode/testcase-generator/regen_v2'

def main():
    spec = json.load(sys.stdin) if len(sys.argv) < 2 else json.load(open(sys.argv[1]))
    pid = spec['pid']
    path = os.path.join(REGEN_DIR, 'inputs', f'{pid}.json')
    if os.path.exists(path):
        print(f'EXISTS {pid}')
        return
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(spec, f, ensure_ascii=False, indent=2)
    print(f'OK {pid} {len(spec["testcases"])} cases')

if __name__ == '__main__':
    main()
