# v3 EDL: piece segments + automatic hesitation tightening inside each piece.
# Silent runs (< -39 dB, >= 0.30 s) inside a piece are shortened:
#   hesitation (previous word has no punctuation) -> 0.10 s kept
#   sentence/clause pause (previous word ends in . , ? … !) -> 0.24 s kept
#   KEEP_LONG boundaries (deliberate beats) -> left as recorded (capped)
import json, sys, re, numpy as np, soundfile as sf
P = sys.argv[1]
W = json.load(open(P + '/words_vid.json'))
pieces = [l.strip().split('|') for l in open(P + '/pieces_vid.txt')]
x, sr = sf.read(P + '/vid_audio16.wav')
nf = len(x) // 160
db = 20 * np.log10(np.sqrt((x[:nf * 160].reshape(nf, 160) ** 2).mean(1)) + 1e-9)
voiced = db > -40

def next_speech(t):
    i = int(t * 100)
    while i < nf and not voiced[i]: i += 1
    return i / 100

BEAT = {'Intelligence.': .3, 'brilliant.': .5, '2016.': .3, 'interesting.': 1.0, "wasn't.": .35, 'part…': .45,
        'thi.': .6, 'kaise?': .45, 'about it…': .5, 'hoti.': .4, 'gayi.': .2, 'liya.': .75, 'yet?': 1.0, 'about.': .4}
KEEP_LONG = {'hai.': .85}   # "zaroori nahi hai. | Maybe…" — silence before the final question
PRE = 0.09
log = []
segs = []
for s, e, text in pieces:
    s = float(s); ws = [w for w in W if w['piece'] == s]
    st = max(ws[0]['s'] - PRE, s - 0.04)
    en_word = ws[-1]['e']
    cap = next((v for key, v in BEAT.items() if text.endswith(key)), .16)
    nxt = next_speech(en_word + .06)
    tail = max(.05, min(cap, nxt - en_word - .04))
    en = en_word + tail
    # inner silent runs -> split points
    cuts = []
    a, b = int(st * 100), int(en * 100); i = a + 8
    while i < b - 8:
        if db[i] < -39:
            j = i
            while j < b - 8 and db[j] < -39: j += 1
            r0, r1 = i / 100, j / 100
            if r1 - r0 >= .30 and r0 < en_word - .12 and not text.startswith('Machines ka'):
                prev = [w for w in ws if w['e'] <= r0 + .12]
                pw = prev[-1]['w'] if prev else ''
                if text.startswith('Google DeepMind ke') and r0 < 94.2:
                    keep, kind = .06, 'hesitation (Google… DeepMind)'
                else:
                    keep, kind = .20, 'pause'
                if r1 - r0 > keep + .08:
                    m0 = r0 + keep / 2; m1 = r1 - keep / 2
                    if kind.startswith('hesitation'): m0, m1 = 93.72, 94.06  # verified clean join (-45 dB at cut)
                    cuts.append((m0, m1)); log.append({'src_from': round(r0, 2), 'src_to': round(r1, 2), 'kind': kind, 'kept_s': keep, 'removed_s': round(m1 - m0, 2), 'line': text})
            i = j
        else: i += 1
    bounds = [st] + [c for cc in cuts for c in cc] + [en]
    subs = [{'src_s': round(bounds[k], 4), 'src_e': round(bounds[k + 1], 4), 'text': text, 'split': k > 0, 'words': []} for k in range(0, len(bounds), 2)]
    for w in ws:  # every word goes to the sub-segment it overlaps most (or the nearest), clamped inside it
        ov = [min(w['e'], g['src_e']) - max(w['s'], g['src_s']) for g in subs]
        k = int(np.argmax(ov))
        if ov[k] <= 0: k = int(np.argmin([min(abs(w['s'] - g['src_e']), abs(w['e'] - g['src_s'])) for g in subs]))
        g = subs[k]; ww = dict(w)
        ww['s'] = min(max(w['s'], g['src_s']), g['src_e'] - .05); ww['e'] = min(max(w['e'], ww['s'] + .05), g['src_e'])
        g['words'].append(ww)
    segs += subs

for a, b in zip(segs, segs[1:]):
    if a['src_s'] < b['src_s'] < a['src_e']: a['src_e'] = b['src_s']

SPEED = 1.10
for g in segs: g['frames'] = max(1, round((g['src_e'] - g['src_s']) / SPEED * 30))
t = 0.0; words = []
for g in segs:
    g['out_s'] = round(t, 5)
    for w in g['words']:
        words.append({'w': w['w'], 's': round(t + max(0, w['s'] - g['src_s']) / SPEED, 3), 'e': round(t + min(w['e'], g['src_e']) - g['src_s'], 3) if False else round(t + (min(w['e'], g['src_e']) - g['src_s']) / SPEED, 3)})
    t += g['frames'] / 30
    g['out_e'] = round(t, 5)
    g['n_words'] = len(g['words']); del g['words']
cold_end = next(g['out_e'] for k, g in enumerate(segs) if g['text'].startswith('But turns out') and (k + 1 == len(segs) or not segs[k + 1]['text'].startswith('But turns out')))
json.dump({'segs': segs, 'dur': round(t, 3), 'speed': SPEED, 'cold_end': cold_end, 'hesitation_log': log}, open(P + '/edl.json', 'w'), indent=1)
json.dump(words, open(P + '/words_edit.json', 'w'), indent=0)
print('segments', len(segs), 'edited duration', round(t, 2), 'cold_end', cold_end)
for l in log: print(f"  {l['kind']:28s} {l['src_from']:7.2f}-{l['src_to']:7.2f} removed {l['removed_s']:.2f}s  | {l['line'][:45]}")
