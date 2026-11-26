# Scene cues, captions (ASS) for the edited timeline. Writes cues.json + captions.ass
import json, re, sys
P = sys.argv[1]
INTRO = 2.6
COLD = json.load(open(P + '/edl.json'))['cold_end']
W = json.load(open(P + '/words_edit.json'))
norm = lambda s: re.sub(r"[^\w,']", '', s.lower()).replace(',', '') if not re.match(r'^[\d,]+$', s) else s.replace(',', '')
toks = [norm(w['w']) for w in W]

def find(phrase, occ=1, after=0):
    p = [norm(x) for x in phrase.split()]; c = 0
    for i in range(after, len(toks) - len(p) + 1):
        if toks[i:i + len(p)] == p:
            c += 1
            if c == occ: return i
    raise SystemExit('not found: ' + phrase)

def span(a, b, a_occ=1, b_occ=1):
    i = find(a, a_occ); j = find(b, b_occ, after=i) + len(b.split()) - 1
    return i, j

T = lambda t: round(t + (INTRO if t >= COLD - 0.12 else 0), 3)
scenes = []
def scene(name, a, b, pre=.12, post=.25, a_occ=1, b_occ=1, start=None):
    i, j = span(a, b, a_occ, b_occ)
    s = W[i]['s'] - pre if start is None else start
    scenes.append({'plate': name, 's': T(s), 'e': T(W[j]['e'] + post)})

i = find('Aur ek aisa move')
scenes.append({'plate': 'p00_hook', 's': 0.0, 'e': T(W[i]['s'] - .08)})
scene('p01_2016', "Let's go back to 2016.", 'ke saath.')
scene('p02_lee', 'Ab Lee Sedol koi', 'his generation.')
scene('p03_go', 'Basically,', 'difficult tha.')
i = find('Phir second game')
scene('p04_game1', 'But AlphaGo ne first', 'jeet liya.', post=.0)
scenes[-1]['e'] = T(W[i]['s'] - .05)
scene('p05_game2', 'Phir second game', 'game bhi.')
k = find('really interesting.') + 1
m = find('37th move par')
scenes.append({'plate': 'p06_m37title', 's': T(W[k]['e'] + .2), 'e': T(W[m + 3]['s'] - .05)})
scene('p07_m37board', 'AlphaGo ne ek aisa move play kiya jo', 'unusual tha.', pre=.05)
scene('p08_10k', 'Google DeepMind ke according', '10,000 thi.')
scene('p08b_g2win', 'Aur eventually us move', 'role play kiya.')
scene('p09_human', 'thousands of expert', 'learn kiye.')
scene('p10_selfplay', 'Phir reinforcement learning', 'khelne lagi.')
scene('p11_improve', 'Matlab jitna', 'karti gayi.')
scene('p11b_m37recall', 'aise moves discover', 'kiye the.')
scene('p12_final', 'AlphaGo eventually match', 'jeet gayi.')
scene('p13_m78', 'Lekin fourth game', 'move play kiya.', b_occ=1, post=.2)
scene('p14_win', 'Aur Lee Sedol ne woh game', 'jeet liya.', post=.7)
scene('p14b_rethink', 'Usne humans ko apni', 'majboor kar diya.')
scenes.sort(key=lambda z: z['s'])
for a, b in zip(scenes, scenes[1:]):  # contiguous plates: hand over cleanly
    if b['s'] - a['e'] < .6: a['e'] = b['s']

ev = {
    'lower_third': T(W[find('Yahan hum AI')]['s'] + .1),
    'm37_word': T(W[find('37th')]['s']),
    'k10': T(W[find('10,000')]['s']),
    'maybe': T(W[find("Maybe they'll discover")]['s']),
    'zaroori_end': T(W[find('zaroori nahi hai.', 1)]['e']),
    'learn_s': T(W[find('thousands of expert')]['s']),
    'learn_e': T(W[find('karti gayi.')]['e']),
    'end': T(W[-1]['e'] + .45),
    'cold_end': COLD,
    'mascot_confused': T(W[find('mistake kar di.')]['s'] - .5),
    'mascot_thinking': T(W[find('socha kaise?')]['s'] - .35),
    'mascot_surprised': T(W[find('surprise ho gayi.')]['s'] - .55),
    'sus_cold': [0.0, T(W[find('But turns out')]['s'] - .05)],
    'sus_m37': [T(W[find('really interesting.')]['s']), T(W[find('37th')]['s'])],
    'sus_crazy': [T(W[find('crazy part')]['s']), T(W[find('10,000')]['s'])],
    'sus_question': [T(W[find('Ab naturally question')]['s']), T(W[find('socha kaise?') + 1]['e'] + .3)],
    'sus_wait': [T(W[find('But wait,')]['s']), T(W[find('Move 78')]['s'])],
}
json.dump({'scenes': scenes, 'ev': ev}, open(P + '/cues.json', 'w'), indent=1)

# ---- captions ----
HL = ['37th move', 'Move 78', 'reinforcement learning', 'khud ke against', 'Beyond Intelligence', '1 in 10,000']
hl = set()
for ph in HL:
    o = 1
    while True:
        try: i = find(ph, o)
        except SystemExit: break
        hl.update(range(i, i + len(ph.split()))); o += 1
CONN = {'and', 'but', 'aur', 'lekin', 'ki', 'jo', 'phir', 'toh', 'ke', 'so'}
chunks = []; cur = []
for i, w in enumerate(W):
    if cur:
        txt = ' '.join(W[k]['w'] for k in cur + [i])
        gap = w['s'] - W[cur[-1]]['e']
        brk = len(cur) >= 3 or len(txt) > 18 or gap > .35 or re.search(r'[.,?…—]$', W[cur[-1]]['w']) or toks[cur[-1]] in ('karo', 'part', 'out') \
            or (len(cur) >= 2 and toks[i] in CONN)
        # keep highlighted phrases together
        if brk and i in hl and cur[-1] in hl and len(cur) < 4: brk = False
        if toks[cur[-1]] == 'google' and toks[i] == 'deepmind': brk = False
        if brk: chunks.append(cur); cur = []
    cur.append(i)
chunks.append(cur)
# merge lonely one-word chunks
mer = []
for c in chunks:
    if mer and len(c) == 1 and len(mer[-1]) <= 2 and len(' '.join(W[k]['w'] for k in mer[-1] + c)) <= 20 and not re.search(r'[.?]$', W[mer[-1][-1]]['w']) and toks[mer[-1][-1]] not in ('karo', 'part', 'out'):
        mer[-1] = mer[-1] + c
    else: mer.append(c)
chunks = mer

def ts(t):
    t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"
YEL = r'{\c&H003DC8FF&}'; WH = r'{\c&H00FFFFFF&}'
def clean(k):
    word = W[k]['w'].replace('—', '').strip()
    return re.sub(r'[,.…]+$', '', word) if word != '10,000' else word
lines = []; srt = []
for n, c in enumerate(chunks):
    s = max(0, W[c[0]]['s'] - .05)
    nxt = W[chunks[n + 1][0]]['s'] - .05 if n + 1 < len(chunks) else 1e9
    e = min(nxt, W[c[-1]]['e'] + .35)
    srt.append((T(s), T(e) if s >= COLD - 0.12 else min(e, COLD - .02), ' '.join(clean(k) for k in c)))
    for j, k in enumerate(c):
        a = s if j == 0 else W[k]['s'] - .03
        b = e if j == len(c) - 1 else W[c[j + 1]]['s'] - .03
        if b <= a: continue
        txt = r'{\fscx86\fscy86\t(0,110,\fscx100\fscy100)}' if j == 0 else ''
        for kk in c:
            word = clean(kk)
            if kk in hl: word = word.upper()
            txt += (YEL if (kk == k or kk in hl) else WH) + word + ' '
        ta, tb = T(a), (T(b) if a >= COLD - 0.12 else min(b, COLD - .02))
        lines.append(f"Dialogue: 0,{ts(ta)},{ts(tb)},Cap,,0,0,0,,{txt.strip()}")
def st(t): return f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round(t % 1 * 1000)) % 1000:03d}"
open(P + '/captions.srt', 'w').write('\n'.join(f"{i + 1}\n{st(a)} --> {st(b)}\n{t}\n" for i, (a, b, t) in enumerate(srt)))
ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Inter ExtraBold,70,&H00FFFFFF,&H00FFFFFF,&H28000000,&H70000000,0,0,0,0,100,100,0,0,1,3.6,2,2,80,80,330,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + '\n'.join(lines) + '\n'
open(P + '/captions.ass', 'w').write(ass)
print('scenes', len(scenes), 'chunks', len(chunks))
broll = sum(s['e'] - s['s'] for s in scenes); print('b-roll s', round(broll, 1), 'of', round(ev['end'] - INTRO, 1), f"= {broll / (ev['end'] - INTRO) * 100:.0f}%")
print(json.dumps(ev))
