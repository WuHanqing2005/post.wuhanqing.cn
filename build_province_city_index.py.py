#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成省-市-区三级索引与前缀映射，输出到 code/ 目录下的两个 JS 文件：
  - province_city_area_list.js          -> window.PROVINCE_CITY_AREA_LIST (prov -> city -> [area])
  - province_city_area_prefixes.js      -> window.PROVINCE_CITY_AREA_PREFIXES (prov -> city -> area -> [prefix4,...])

用法:
  python3 build_province_city_area_index.py
可通过命令行参数自定义目录或输出文件名。
"""

import os
import re
import json
import argparse
from collections import defaultdict

CODE_DIR = "code"
OUT_DIR = "code"
OUT_LIST_JS = "province_city_area_list.js"
OUT_PREFIX_JS = "province_city_area_prefixes.js"

def safe_json_parse(text):
    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        pass
    # try to extract first [ ... ] or { ... }
    idx_array_start = text.find('[')
    idx_obj_start = text.find('{')
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
    # remove comments and assignment
    no_comments = re.sub(r'//.*?(\r?\n)|/\*[\s\S]*?\*/', '\n', text)
    no_assign = re.sub(r'^[\s\S]*?=\s*', '', no_comments, count=1)
    # try again
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
    return None

def normalize_name(s):
    if s is None:
        return ""
    return str(s).strip()

def strip_prov_city_suffix(name):
    # remove common suffixes for keys
    if not name:
        return ""
    return re.sub(r'(省|自治区|特别行政区|市|自治州|地区|盟|州)$', '', str(name)).strip()

def main(code_dir, out_dir, out_list_js, out_prefix_js):
    prov_to_cities = defaultdict(lambda: defaultdict(set))  # prov -> city -> set(areas)
    prov_city_area_to_prefixes = defaultdict(lambda: defaultdict(lambda: defaultdict(set))) # prov->city->area->set(prefix4)

    if not os.path.isdir(code_dir):
        print(f"Error: code dir '{code_dir}' not found.")
        return

    files = sorted(os.listdir(code_dir))
    scanned = 0
    for fn in files:
        if not re.match(r'^\d{6}\.(json|js)$', fn):
            continue
        scanned += 1
        path = os.path.join(code_dir, fn)
        try:
            text = open(path, 'r', encoding='utf-8').read()
        except Exception as e:
            print(f"Warning: cannot read {path}: {e}")
            continue
        data = safe_json_parse(text)
        if data is None:
            print(f"Warning: cannot parse JSON from {fn}, skipped.")
            continue

        prefix4 = fn[:4]
        items = []
        if isinstance(data, list):
            items = data
        elif isinstance(data, dict):
            if 'data' in data and isinstance(data['data'], list):
                items = data['data']
            else:
                items = [data]
        else:
            continue

        for rec in items:
            if not isinstance(rec, dict):
                continue
            prov_raw = normalize_name(rec.get('province') or rec.get('prov') or rec.get('provinceName') or rec.get('省'))
            city_raw = normalize_name(rec.get('city') or rec.get('cityName') or rec.get('市'))
            area_raw = normalize_name(rec.get('area') or rec.get('county') or rec.get('district') or rec.get('区'))
            # fallback: sometimes area is included in address; we still prefer explicit field
            if not prov_raw and not city_raw and not area_raw:
                continue

            prov_key = strip_prov_city_suffix(prov_raw) or ""
            city_key = strip_prov_city_suffix(city_raw) or ""
            area_key = (area_raw or "").strip()

            if prov_key:
                if city_key:
                    if area_key:
                        prov_to_cities[prov_key][city_key].add(area_key)
                        prov_city_area_to_prefixes[prov_key][city_key][area_key].add(prefix4)
                    else:
                        # no area -> add empty area placeholder
                        prov_to_cities[prov_key][city_key].add('')
                        prov_city_area_to_prefixes[prov_key][city_key][''].add(prefix4)
                else:
                    # city missing -> map under empty city
                    prov_to_cities[prov_key][''].add(area_key or '')
                    prov_city_area_to_prefixes[prov_key][''][area_key or ''].add(prefix4)
            else:
                # province missing -> map under empty prov
                prov_to_cities[''][city_key or ''].add(area_key or '')
                prov_city_area_to_prefixes[''][city_key or ''][area_key or ''].add(prefix4)

    # convert sets to sorted lists
    prov_city_area_list = {}
    for prov, city_map in prov_to_cities.items():
        prov_city_area_list[prov] = {}
        for city, areas in city_map.items():
            # filter out empty area '' when appropriate
            arr = sorted([a for a in areas if a != ''])
            prov_city_area_list[prov][city] = arr

    prov_city_area_prefixes = {}
    for prov, city_map in prov_city_area_to_prefixes.items():
        prov_city_area_prefixes[prov] = {}
        for city, area_map in city_map.items():
            prov_city_area_prefixes[prov][city] = {}
            for area, prefixes in area_map.items():
                prov_city_area_prefixes[prov][city][area] = sorted(prefixes)

    # ensure out dir exists
    os.makedirs(out_dir, exist_ok=True)

    out_list_path = os.path.join(out_dir, out_list_js)
    out_prefix_path = os.path.join(out_dir, out_prefix_js)

    with open(out_list_path, 'w', encoding='utf-8') as f:
        f.write("// generated by build_province_city_area_index.py\n")
        f.write("window.PROVINCE_CITY_AREA_LIST = ")
        json.dump(prov_city_area_list, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    with open(out_prefix_path, 'w', encoding='utf-8') as f:
        f.write("// generated by build_province_city_area_index.py\n")
        f.write("window.PROVINCE_CITY_AREA_PREFIXES = ")
        json.dump(prov_city_area_prefixes, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"Scanned {scanned} files under {code_dir}.")
    print(f"Wrote {out_list_path} and {out_prefix_path}.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Build province-city-area and prefix JS from code/ files.")
    parser.add_argument("--code-dir", default=CODE_DIR, help="code directory to scan")
    parser.add_argument("--out-dir", default=OUT_DIR, help="output directory")
    parser.add_argument("--out-list-js", default=OUT_LIST_JS, help="output province->city->areas js filename")
    parser.add_argument("--out-prefix-js", default=OUT_PREFIX_JS, help="output province->city->area->prefixes js filename")
    args = parser.parse_args()
    main(args.code_dir, args.out_dir, args.out_list_js, args.out_prefix_js)