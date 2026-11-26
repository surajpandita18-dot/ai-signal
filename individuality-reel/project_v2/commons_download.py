# Extra café search + licence fetch, then download selected Commons files into the 7 folders.
import json, subprocess, time, urllib.parse, sys, re, os
EP = sys.argv[1]; OUT = EP + '/visual_assets'
UA = 'ReelEditorialResearch/1.0 (licence verification; low request rate)'
API = 'https://commons.wikimedia.org/w/api.php'
R = json.load(open(EP + '/research.json'))

def curl(url, out=None):
    args = ['curl', '-sS', '-L', '--max-time', '120', '-A', UA, '-D', '/tmp/_hdr.txt', '-w', '%{http_code}', url] + (['-o', out] if out else [])
    r = subprocess.run(args, capture_output=True, text=True)
    return (r.stdout[-3:], r.stdout[:-3])

def retry_after():
    try:
        m = re.search(r'retry-after:\s*(\d+)', open('/tmp/_hdr.txt').read(), re.I); return min(int(m.group(1)), 900) if m else 120
    except Exception: return 120

def api(params):
    url = API + '?' + urllib.parse.urlencode({**params, 'format': 'json', 'formatversion': 2})
    for t in range(5):
        code, body = curl(url)
        if code == '200':
            try: return json.loads(body)
            except Exception: pass
        time.sleep(20 * (t + 1))
    return {}

def meta_for(titles):
    out = {}
    d = api({'action': 'query', 'titles': '|'.join(titles), 'prop': 'imageinfo', 'iiprop': 'url|size|extmetadata|mime', 'iiurlwidth': 1920})
    for p in d.get('query', {}).get('pages', []):
        ii = (p.get('imageinfo') or [{}])[0]; em = ii.get('extmetadata', {})
        g = lambda k: re.sub(r'<[^>]+>', '', (em.get(k) or {}).get('value', '')).strip()
        out[p['title']] = {'page': ii.get('descriptionurl'), 'url': ii.get('url'), 'thumb': ii.get('thumburl'), 'w': ii.get('width'), 'h': ii.get('height'),
                           'license': g('LicenseShortName'), 'license_url': g('LicenseUrl'), 'artist': g('Artist'), 'desc': g('ImageDescription')[:200]}
    return out

cm = json.load(open(EP + '/research_cafes.json')) if os.path.exists(EP + '/research_cafes.json') else {}
print('cafe candidates:', flush=True); [print(' ', t[5:70], v['w'], v['h'], v['license'], '|', v['artist'][:25], flush=True) for t, v in cm.items()]

SEL = json.load(open(EP + '/selection.json'))
M = {**R['meta'], **cm}
log = []
for folder, items in SEL.items():
    os.makedirs(f'{OUT}/{folder}', exist_ok=True)
    for title, fname, use in items:
        key = title if title in M else next((k for k in M if k.startswith(title)), None)
        m = M.get(key) if key else (meta_for([title]).get(title.replace('_', ' ')) or {})
        title = key or title
        if not m: print('NO META', title); continue
        src = m['url']  # originals only (Commons rejects non-standard thumb widths)
        dst = f'{OUT}/{folder}/{fname}'
        ok = False
        if os.path.exists(dst) and os.path.getsize(dst) > 10000: ok = True
        for t in range(4):
            if ok: break
            code, _ = curl(src, dst)
            if code == '200' and os.path.getsize(dst) > 10000: ok = True; break
            if os.path.exists(dst): os.remove(dst)
            w = retry_after() if code == '429' else 60
            print(f'   {code} -> waiting {w}s (server Retry-After)', flush=True); time.sleep(w)
        print(('OK  ' if ok else 'FAIL'), folder, fname, flush=True)
        log.append({'folder': folder, 'file': fname, 'title': title, 'source_page': m.get('page'), 'downloaded_from': src, 'creator': m.get('artist'),
                    'license': m.get('license'), 'license_url': m.get('license_url'), 'original_size': f"{m.get('w')}x{m.get('h')}", 'use': use, 'status': 'downloaded' if ok else 'FAILED'})
        time.sleep(15)
json.dump(log, open(OUT + '/download_log.json', 'w'), indent=1, ensure_ascii=False)
