# Build the asset contact sheet (PNG) + licence manifest (CSV + MD) from what is actually on disk.
import json, os, sys, csv, glob, html, subprocess
EP = sys.argv[1]; V = EP + '/visual_assets'; OUTD = sys.argv[2]
log = json.load(open(V + '/download_log.json')) if os.path.exists(V + '/download_log.json') else []
rows = []
for r in log:
    p = f"{V}/{r['folder']}/{r['file']}"
    ok = os.path.exists(p) and os.path.getsize(p) > 10000
    rows.append({**r, 'path': p, 'ok': ok})
own = [('06_Article_and_Quotes', 'quote_card_oladimeji_ajegbile.png', 'Quote card (exact verified text)', 'Oladimeji Ajegbile — Substack Note, 11 Mar 2026', 'https://substack.com/@diimejii/note/c-226139197', 'Original design; quotation used with credit (editorial)'),
       ('06_Article_and_Quotes', 'citation_card_jc_weekly_scrapbook.png', 'Essay citation card (verified title/subtitle/date)', 'jc — the weekly scrapbook, 15 Nov 2025', 'https://theweeklyscrapbook.substack.com/p/your-phone-is-the-reason-you-have', 'Original design; title quoted with credit (editorial)'),
       ('06_Article_and_Quotes', 'verification_capture_oladimeji_note_unstyled.png', 'Live page capture (verification only, not for screen)', 'substack.com', 'https://substack.com/@diimejii/note/c-226139197', 'Reference only'),
       ('07_Motion_Graphics', 'hook_typography.png', 'Hook type style', 'Original', '', 'Owned'),
       ('07_Motion_Graphics', 'title_culture_industry.png', 'Culture Industry title card', 'Original', '', 'Owned'),
       ('07_Motion_Graphics', 'diagram_recommendation_loop.png', 'Recommendation loop (Illustration)', 'Original', '', 'Owned'),
       ('07_Motion_Graphics', 'graphic_same_opinions.png', 'Same opinions (Illustration)', 'Original', '', 'Owned'),
       ('07_Motion_Graphics', 'end_card_bigger_picture.png', 'End card', 'Original', '', 'Owned')]
for f, n, use, cr, src, lic in own:
    rows.append({'folder': f, 'file': n, 'use': use, 'creator': cr, 'source_page': src, 'license': lic, 'license_url': '', 'original_size': '1080x1920', 'path': f'{V}/{f}/{n}', 'ok': os.path.exists(f'{V}/{f}/{n}'), 'status': 'created'})
us = json.load(open(V + '/user_supplied.json')) if os.path.exists(V + '/user_supplied.json') else []
for r in us:
    rows.append({**r, 'license': r['license'] + ' · ' + r['status'], 'license_url': '', 'original_size': '', 'path': f"{V}/{r['folder']}/{r['file']}", 'ok': True})
rows.sort(key=lambda r: (r['folder'], not r['ok']))
# manifest
with open(OUTD + '/ASSET_LICENCE_MANIFEST.csv', 'w', newline='') as fh:
    w = csv.writer(fh); w.writerow(['folder', 'file', 'status', 'use', 'creator', 'licence', 'licence_url', 'source_page', 'original_size', 'modifications'])
    for r in rows:
        w.writerow([r['folder'], r['file'], 'on disk' if r['ok'] else 'NOT DOWNLOADED — download manually from source_page', r['use'], r.get('creator', ''), r.get('license', ''), r.get('license_url', ''), r.get('source_page', ''), r.get('original_size', ''),
                    'crop to 9:16 / scale, colour grade, slow push' if r['folder'] < '06' else ''])
# contact sheet html
cells = ''
for r in rows:
    img = f"<img src='file://{r['path']}'>" if r['ok'] else "<div class='miss'>NOT DOWNLOADED<br>(rate-limited)</div>"
    cells += f"""<div class='c'>{img}<div class='t'><b>{html.escape(r['folder'][:2])} · {html.escape(r['file'])}</b><br>{html.escape(r['use'])}<br>
    <span>{html.escape((r.get('creator') or '')[:60])}</span><br><span class='l'>{html.escape(r.get('license') or '')}</span><br><span class='u'>{html.escape((r.get('source_page') or '')[:95])}</span></div></div>"""
page = f"""<html><head><style>body{{margin:0;padding:30px;background:#efeae0;font:15px/1.35 Inter,Arial}}h1{{font:600 30px Georgia;margin:0 0 6px}}
.g{{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}}.c{{background:#fff;border:1px solid #d8d0c0}}.c img,.miss{{width:100%;height:240px;object-fit:cover;display:block;background:#222}}
.miss{{color:#E2412B;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:700;background:#f7f3ea}}.t{{padding:10px 12px}}.l{{color:#E2412B;font-weight:600}}.u{{color:#777;font-size:12px;word-break:break-all}}</style></head>
<body><h1>Individuality Reel — visual assets for approval</h1><div style='margin-bottom:18px;color:#555'>Real photographs from Wikimedia Commons with live-verified licences · original cards/graphics · {sum(r['ok'] for r in rows)}/{len(rows)} on disk</div><div class='g'>{cells}</div></body></html>"""
open(EP + '/qc/contact_sheet.html', 'w').write(page)
js = f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1800,height:1000}}}});
await p.goto('file://{EP}/qc/contact_sheet.html');await p.waitForTimeout(800);await p.screenshot({{path:'{OUTD}/CONTACT_SHEET.png',fullPage:true}});await b.close();}})();"""
open(EP + '/qc/cs.js', 'w').write(js); subprocess.run(['node', EP + '/qc/cs.js'], check=True)
print('rows', len(rows), 'on disk', sum(r['ok'] for r in rows))
