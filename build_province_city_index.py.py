#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
扫描 code/ 目录下的 *.json 或 *.js 文件，提取每个文件内记录的 province 和 city 字段，
并根据文件名的前4位生成省市->4位前缀索引与省->城市列表，输出为两个 JS 文件：
  - province_city_list.js
  - province_city_prefixes.js

使用:
  python3 build_province_city_index.py
可通过命令行参数自定义目录或输出文件名（见脚本顶部说明）
"""

import os
import re
import json
import argparse
from collections import defaultdict

CODE_DIR = "code"
OUT_DIR = "code"  # 输出到 code/ 下，方便前端直接 <script src="code/...">
OUT_LIST_JS = "province_city_list.js"
OUT_PREFIX_JS = "province_city_prefixes.js"

def safe_json_parse(text):
    text = text.strip()
    # Fast path: try direct JSON
    try:
        return json.loads(text)
    except Exception:
        pass
    # Try extract first [...] or {...} chunk
    # Find first '[' and matching ']' (simple last index approach)
    idx_array_start = text.find('[')
    idx_obj_start = text.find('{')
    # prefer array if exists
    if idx_array_start != -1:
        idx_array_end = text.rfind(']')
        if idx_array_end != -1 and idx_array_end > idx_array_start:
            candidate = text[idx_array_start:idx_array_end+1]
            try:
                return json.loads(candidate)
            except Exception:
                pass
    if idx_obj_start != -1:
        idx_obj_end = text.rfind('}')
        if idx_obj_end != -1 and idx_obj_end > idx_obj_start:
            candidate = text[idx_obj_start:idx_obj_end+1]
            try:
                return json.loads(candidate)
            except Exception:
                pass
    # As last resort, try to remove JS comments and var assignment
    # Remove // comments and /* */ blocks
    no_comments = re.sub(r'//.*?(\r?\n)|/\*[\s\S]*?\*/', '\n', text)
    # Remove leading var/const/let/module.exports = etc.
    no_assign = re.sub(r'^[\s\S]*?=\s*', '', no_comments, count=1)
    # Try array/object again
    idx_array_start = no_assign.find('[')
    if idx_array_start != -1:
        idx_array_end = no_assign.rfind(']')
        if idx_array_end != -1 and idx_array_end > idx_array_start:
            candidate = no_assign[idx_array_start:idx_array_end+1]
            try:
                return json.loads(candidate)
            except Exception:
                pass
    idx_obj_start = no_assign.find('{')
    if idx_obj_start != -1:
        idx_obj_end = no_assign.rfind('}')
        if idx_obj_end != -1 and idx_obj_end > idx_obj_start:
            candidate = no_assign[idx_obj_start:idx_obj_end+1]
            try:
                return json.loads(candidate)
            except Exception:
                pass
    # Give up
    return None

def normalize_name(s):
    if s is None:
        return ""
    return str(s).strip()

def main(code_dir, out_dir, out_list_js, out_prefix_js):
    province_to_cities = defaultdict(set)                  # province -> set(cities)
    province_city_to_prefixes = defaultdict(lambda: defaultdict(set))  # prov -> city -> set(prefix4)

    if not os.path.isdir(code_dir):
        print(f"Error: code dir '{code_dir}' not found.")
        return

    files = sorted(os.listdir(code_dir))
    count_files = 0
    for fn in files:
        if not re.match(r'^\d{6}\.(json|js)$', fn):
            continue
        count_files += 1
        path = os.path.join(code_dir, fn)
        try:
            text = open(path, 'r', encoding='utf-8').read()
        except Exception as e:
            print(f"Warning: cannot read {path}: {e}")
            continue
        data = safe_json_parse(text)
        if data is None:
            # skip but warn
            print(f"Warning: cannot parse JSON from {fn}, skipped.")
            continue
        # file prefix 4 digits
        prefix4 = fn[:4]
        # data may be dict or list
        items = []
        if isinstance(data, list):
            items = data
        elif isinstance(data, dict):
            # maybe object with key 'data' or similar
            if 'data' in data and isinstance(data['data'], list):
                items = data['data']
            else:
                # treat single object as one record
                items = [data]
        else:
            continue

        for rec in items:
            if not isinstance(rec, dict):
                continue
            prov = normalize_name(rec.get('province') or rec.get('prov') or rec.get('provinceName'))
            city = normalize_name(rec.get('city') or rec.get('cityName'))
            if not prov and not city:
                continue
            # Trim off suffix like "省"/"市" for key normalization
            prov_key = re.sub(r'(省|自治区|市)$', '', prov).strip()
            city_key = re.sub(r'(市|地区|盟|州)$', '', city).strip()
            if prov_key:
                if city_key:
                    province_to_cities[prov_key].add(city_key)
                    province_city_to_prefixes[prov_key][city_key].add(prefix4)
                else:
                    # if no city, add placeholder
                    province_to_cities[prov_key].add('')
                    province_city_to_prefixes[prov_key][''].add(prefix4)
            else:
                # if only city present, try to map under a special key
                if city_key:
                    province_to_cities[''].add(city_key)
                    province_city_to_prefixes[''][city_key].add(prefix4)

    print(f"Scanned {count_files} files under {code_dir}.")
    # Convert sets to sorted lists
    prov_city_list = {}
    for prov, cities in province_to_cities.items():
        prov_city_list[prov] = sorted([c for c in cities if c != ''])

    prov_city_prefixes = {}
    for prov, city_map in province_city_to_prefixes.items():
        prov_city_prefixes[prov] = {}
        for city, prefixes in city_map.items():
            prov_city_prefixes[prov][city] = sorted(prefixes)

    # Write outputs as JS files
    out_list_path = os.path.join(out_dir, out_list_js)
    out_prefix_path = os.path.join(out_dir, out_prefix_js)

    with open(out_list_path, 'w', encoding='utf-8') as f:
        f.write("// generated by build_province_city_index.py\n")
        f.write("window.PROVINCE_CITY_LIST = ")
        json.dump(prov_city_list, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    with open(out_prefix_path, 'w', encoding='utf-8') as f:
        f.write("// generated by build_province_city_index.py\n")
        f.write("window.PROVINCE_CITY_PREFIXES = ")
        json.dump(prov_city_prefixes, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"Wrote {out_list_path} and {out_prefix_path}.")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Build province-city and prefix JS from code/ files.")
    parser.add_argument("--code-dir", default=CODE_DIR, help="code directory to scan")
    parser.add_argument("--out-dir", default=OUT_DIR, help="output directory")
    parser.add_argument("--out-list-js", default=OUT_LIST_JS, help="output province->cities js filename")
    parser.add_argument("--out-prefix-js", default=OUT_PREFIX_JS, help="output province->city->prefixes js filename")
    args = parser.parse_args()
    main(args.code_dir, args.out_dir, args.out_list_js, args.out_prefix_js)