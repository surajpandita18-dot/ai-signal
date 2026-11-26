# Commons research: search candidates per topic, fetch live licence metadata (no image downloads here).
import json, subprocess, time, urllib.parse, sys, re
OUT = sys.argv[1]
UA = 'ReelEditorialResearch/1.0 (licence verification; low request rate)'
API = 'https://commons.wikimedia.org/w/api.php'

def api(params, tries=5):
    url = API + '?' + urllib.parse.urlencode({**params, 'format': 'json', 'formatversion': 2})
    for t in range(tries):
        r = subprocess.run(['curl', '-sS', '--max-time', '40', '-A', UA, '-w', '\n%{http_code}', url], capture_output=True, text=True)
        body, code = r.stdout.rsplit('\n', 1)
        if code == '200':
            try: return json.loads(body)
            except Exception: pass
        time.sleep(15 * (t + 1))
    return {}

GIVEN = ['File:Theodor_Ludwig_Wiesengrund_Adorno.jpg', 'File:Max_Horkheimer.jpg', 'File:AdornoHorkheimer.png',
         'File:Man_using_smartphone.jpg', 'File:Diverse_people_using_phones.jpeg', 'File:Crowd_inside_nex_shopping_center.jpg',
         'File:Books_at_the_bookstore.jpg', 'File:Vinyl_Store.jpg', 'File:A_Shopping_Mall.jpg', 'File:Fashion_Street.jpg',
         'File:Bookstore.jpg', 'File:Walking_in_a_shopping_mall.jpg', 'File:Street_Crowd.jpg']
QUERIES = {
    'movies': 'cinema audience watching film',
    'movies2': 'movie theater auditorium audience',
    'music': 'person listening music headphones',
    'cafe': 'cafe interior minimalist',
    'cafe2': 'specialty coffee shop interior',
    'fashion': 'street style fashion people',
    'phones': 'people looking at smartphones train',
    'phones2': 'commuters using mobile phones',
    'massprod': 'Ford assembly line 1913',
    'record': 'record store browsing vinyl',
    'library': 'person browsing bookshop shelves',
}
cands = {}
for key, q in QUERIES.items():
    d = api({'action': 'query', 'list': 'search', 'srsearch': q + ' filetype:bitmap', 'srnamespace': 6, 'srlimit': 12})
    cands[key] = [r['title'] for r in d.get('query', {}).get('search', [])]
    print(key, len(cands[key]), flush=True); time.sleep(4)
titles = GIVEN + [t for v in cands.values() for t in v]
meta = {}
for i in range(0, len(titles), 40):
    d = api({'action': 'query', 'titles': '|'.join(titles[i:i + 40]), 'prop': 'imageinfo', 'iiprop': 'url|size|extmetadata|mime', 'iiurlwidth': 1920})
    for p in d.get('query', {}).get('pages', []):
        ii = (p.get('imageinfo') or [{}])[0]; em = ii.get('extmetadata', {})
        g = lambda k: re.sub(r'<[^>]+>', '', (em.get(k) or {}).get('value', '')).strip()
        meta[p['title']] = {'page': ii.get('descriptionurl'), 'url': ii.get('url'), 'thumb': ii.get('thumburl'), 'w': ii.get('width'), 'h': ii.get('height'),
                            'mime': ii.get('mime'), 'license': g('LicenseShortName'), 'license_url': g('LicenseUrl'), 'artist': g('Artist'),
                            'credit': g('Credit'), 'desc': g('ImageDescription')[:200], 'date': g('DateTimeOriginal') or g('DateTime'),
                            'attribution_required': g('AttributionRequired'), 'restrictions': g('Restrictions'), 'missing': 'missing' in p}
    time.sleep(4)
json.dump({'given': GIVEN, 'candidates': cands, 'meta': meta}, open(OUT, 'w'), indent=1, ensure_ascii=False)
print('meta', len(meta))
