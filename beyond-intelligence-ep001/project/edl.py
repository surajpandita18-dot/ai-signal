# Build the edit decision list from aligned pieces, and remap word times to the edited timeline.
import json, sys, numpy as np, soundfile as sf
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

# deliberate beats: pause kept after the piece ending with this text
BEAT = {'Intelligence.': .3, 'brilliant.': .5, '2016.': .3, 'interesting.': 1.0, "wasn't.": .35, 'part…': .45,
        'thi.': .6, 'kaise?': .45, 'about it…': .5, 'hoti.': .4, 'gayi.': .2, 'liya.': .75, 'yet?': 1.0, 'about.': .4}
PRE = 0.09
segs = []
for k, (s, e, text) in enumerate(pieces):
    s = float(s); ws = [w for w in W if w['piece'] == s]
    st = max(ws[0]['s'] - PRE, s - 0.04)
    en_word = ws[-1]['e']
    cap = next((v for key, v in BEAT.items() if text.endswith(key)), .16)
    nxt = next_speech(en_word + .06)
    tail = max(.05, min(cap, nxt - en_word - .04))
    segs.append({'src_s': round(st, 3), 'src_e': round(en_word + tail, 3), 'text': text, 'words': ws})

# Assert no overlap in source
for a, b in zip(segs, segs[1:]):
    if a['src_s'] < b['src_s'] < a['src_e']: a['src_e'] = b['src_s']

SPEED = 1.10
for g in segs:
    g['src_s'] = round(g['src_s'], 4); g['src_e'] = round(g['src_e'], 4)
    g['frames'] = max(1, round((g['src_e'] - g['src_s']) / SPEED * 30))
t = 0.0; words = []
for g in segs:
    g['out_s'] = round(t, 5)
    for w in g['words']:
        words.append({'w': w['w'], 's': round(t + (w['s'] - g['src_s']) / SPEED, 3), 'e': round(t + (w['e'] - g['src_s']) / SPEED, 3)})
    t += g['frames'] / 30
    g['out_e'] = round(t, 5)
    del g['words']
json.dump({'segs': segs, 'dur': round(t, 3), 'speed': SPEED, 'cold_end': segs[2]['out_e']}, open(P + '/edl.json', 'w'), indent=1)
json.dump(words, open(P + '/words_edit.json', 'w'), indent=0)
print('segments', len(segs), 'edited duration', round(t, 2))
