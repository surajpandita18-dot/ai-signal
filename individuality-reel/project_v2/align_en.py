# Word timings on the edited voice track (per segment, pocketsphinx forced alignment; voiced-frame fallback).
import json, sys, re, numpy as np, soundfile as sf, subprocess
from pocketsphinx import Decoder
E = sys.argv[1]
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', E + '/audio/voice_raw.wav', '-ac', '1', '-ar', '16000', E + '/audio/voice16.wav'], check=True)
x, sr = sf.read(E + '/audio/voice16.wav')
TL = json.load(open(E + '/timeline.json'))
EXTRA = {'substack': 'S AH B S T AE K', 'horkheimer': 'HH AO R K HH AY M ER', 'adorno': 'AH D AO R N OW', 'theodor': 'TH IY AH D AO R', 'standardised': 'S T AE N D ER D AY Z D', 'youtube': 'Y UW T UW B', 'instagram': 'IH N S T AH G R AE M', 'cafes': 'K AH F EY Z', 'massproduced': 'M AE S P R AH D UW S T', 'isnt': 'IH Z AH N T', 'its': 'IH T S'}
words = []; fails = []
for s in TL['segments']:
    disp = s['text'].split(); spoken = [re.sub(r"[^\w']", '', w.replace('-', '')).lower().strip("'") for w in disp]
    a, b = s['t0'] - .05, s['t1'] + .05
    d = Decoder(samprate=16000, loglevel='ERROR')
    for w in set(spoken):
        if d.lookup_word(w) is None:
            try: d.add_word(w, EXTRA[w], True)
            except Exception: print('OOV', w)
    times = None
    try:
        d.set_align_text(' '.join(spoken)); d.start_utt(); d.process_raw((x[int(a * sr):int(b * sr)] * 32767).astype(np.int16).tobytes(), full_utt=True); d.end_utt()
        sg = [(re.sub(r'\(\d+\)$', '', g.word), g.start_frame / 100 + a, g.end_frame / 100 + a) for g in d.seg() if g.word not in ('<s>', '</s>', '<sil>', '(NULL)')]
        if [w for w, _, _ in sg] == spoken: times = [(p, q) for _, p, q in sg]
    except Exception: pass
    if times is None:
        fails.append(s['id']); seg = x[int(s['t0'] * sr):int(s['t1'] * sr)]; n = len(seg) // 160
        dbv = 20 * np.log10(np.sqrt((seg[:n * 160].reshape(n, 160) ** 2).mean(1)) + 1e-9)
        v = (dbv > np.percentile(dbv, 90) - 24).astype(float); cv = np.concatenate([[0], np.cumsum(v)]); cv /= cv[-1]
        syl = [max(1, len(re.findall('[aeiouy]+', w))) for w in spoken]; T = np.cumsum([0] + syl) / sum(syl)
        tm = lambda q: s['t0'] + np.searchsorted(cv, q) / 100
        times = [(tm(T[i]), tm(T[i + 1])) for i in range(len(spoken))]
    for w, (p, q) in zip(disp, times): words.append({'seg': s['id'], 'w': w, 's': round(p, 3), 'e': round(q, 3)})
json.dump(words, open(E + '/words.json', 'w'), indent=0)
print('words', len(words), 'estimated segments:', fails)
