# Captions (ASS + SRT) and score/SFX + final mix for the Individuality Reel.
import json, sys, re, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
E = sys.argv[1]
TL = json.load(open(E + '/timeline.json')); S = {s['id']: s for s in TL['segments']}
W = json.load(open(E + '/words.json'))
END = TL['dur'] + .25; TOT = END + 2.6
HIDE = {'F1', 'C4'}   # hook type and quote card already show the words
RED = {'identity', 'substack', 'genuinely', 'individuality', 'interesting', 'culture', 'industry', 'standardised', 'algorithms', 'unusual', 'capitalism', 'explore', 'actually'}
# ---- chunks ----
chunks = []; cur = []
for x in W:
    if x['seg'] in HIDE: continue
    if cur:
        txt = ' '.join(y['w'] for y in cur + [x])
        if cur[-1]['seg'] != x['seg'] or len(txt) > 30 or x['s'] - cur[-1]['e'] > .35 or re.search(r'[.,?:]$', cur[-1]['w']):
            chunks.append(cur); cur = []
    cur.append(x)
chunks.append(cur)
def ts(t): return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"
def st(t): return f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round(t % 1 * 1000)) % 1000:03d}"
ev = []; srt = []
for i, c in enumerate(chunks):
    a = c[0]['s'] - .05; nxt = chunks[i + 1][0]['s'] - .05 if i + 1 < len(chunks) else 1e9
    b = min(nxt, c[-1]['e'] + .3)
    txt = ' '.join((r'{\c&H002B41E2&}' + y['w'] + r'{\c&H00FFFFFF&}') if re.sub(r'\W', '', y['w']).lower() in RED else y['w'] for y in c)
    ev.append(f"Dialogue: 0,{ts(a)},{ts(b)},Cap,,0,0,0,,{{\\fad(60,40)}}{txt}")
    srt.append((a, b, ' '.join(y['w'] for y in c)))
# hidden segments still go into the SRT (accessibility)
for sid in HIDE:
    s = S[sid]; srt.append((s['t0'], s['t1'], s['text']))
srt.sort()
open(E + '/captions.ass', 'w').write(f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Inter SemiBold,60,&H00FFFFFF,&H00FFFFFF,&H40000000,&H80000000,0,0,0,0,100,100,0,0,1,3,2,2,90,90,380,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + '\n'.join(ev) + '\n')
open(E + '/AlphaGo_tmp.srt' if False else E + '/Individuality_Reel.srt', 'w').write('\n'.join(f"{i + 1}\n{st(a)} --> {st(b)}\n{t}\n" for i, (a, b, t) in enumerate(srt)))
print('caption chunks', len(chunks))

# ---- score ----
sr = 48000; n = int(TOT * sr); t = np.arange(n) / sr; rng = np.random.default_rng(11)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
bed = np.zeros((n, 2))
def add(buf, sig, s0, g=1., pan=0.):
    i = int(s0 * sr)
    if i >= len(buf) or i < 0: return
    e = min(len(sig), len(buf) - i); buf[i:i + e, 0] += sig[:e] * g * np.cos((pan + 1) * np.pi / 4); buf[i:i + e, 1] += sig[:e] * g * np.sin((pan + 1) * np.pi / 4)
CH = [[45, 57, 60, 64, 71], [41, 53, 60, 65, 69], [48, 55, 60, 64, 67], [43, 55, 59, 62, 67]]  # Am(add9) F C G
CL = 4.8
def pad(f, d):
    tt = np.arange(int(d * sr)) / sr; env = np.clip(tt / 1.5, 0, 1) * np.clip((d - tt) / 1.8, 0, 1)
    return env * sum(np.sin(2 * np.pi * f * (1 + dt) * tt + ph) for dt, ph in [(-.002, 0), (0, 1.1), (.0025, 2.3)]) / 3
def piano(f, d=3.0):
    tt = np.arange(int(d * sr)) / sr; e = np.exp(-tt * 1.6) * (1 - np.exp(-tt * 250))
    return e * (np.sin(2 * np.pi * f * tt) + .25 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 3) + .1 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt * 5))
for k in range(int(TOT / CL) + 1):
    ch = CH[k % 4]
    for j, m in enumerate(ch): add(bed, pad(hz(m), CL + 1.8), k * CL, .5 if m < 50 else .18, (j - 2) / 4)
    for q in range(4):  # gentle broken chord
        add(bed, piano(hz(ch[1 + (q % 4)] + 12)), k * CL + q * 1.2 + .1, .08 if q else .11, (q - 1.5) / 3)
s_ = butter(2, 2400, 'lp', fs=sr, output='sos'); bed[:, 0] = sosfilt(s_, bed[:, 0]); bed[:, 1] = sosfilt(s_, bed[:, 1])
g = np.ones(n)
def ramp(a, b, v0, v1): i0, i1 = int(a * sr), int(b * sr); g[i0:i1] = np.linspace(v0, v1, max(1, i1 - i0))
def hold(a, b, v): g[int(a * sr):int(b * sr)] = v
ramp(0, 1.5, .3, 1)
q0, q1 = S['C4']['t0'], S['C4']['t1']; ramp(q0 - .4, q0, 1, .55); hold(q0, q1, .55); ramp(q1, q1 + .8, .55, 1)
stepped = next(x['s'] for x in W if x['seg'] == 'F8' and x['w'] == 'stepped') - .25  # "If you stepped…"
ramp(stepped - 1.2, stepped - .2, 1, .05); hold(stepped - .2, END - .2, .12); ramp(END - .2, END + .6, .12, 1.1); ramp(TOT - 1.6, TOT, 1.1, 0)
bed *= (g * .45)[:, None]
# ---- SFX ----
fx = np.zeros((n, 2))
def paper():
    L = int(.45 * sr); x = rng.standard_normal(L); e = np.sin(np.pi * np.arange(L) / L) ** 2
    return sosfilt(butter(2, [1800, 7000], 'bp', fs=sr, output='sos'), x) * e * .5
def tick():
    tt = np.arange(int(.12 * sr)) / sr; return np.sin(2 * np.pi * 1650 * tt) * np.exp(-tt * 60) * .6
def thump():
    tt = np.arange(int(.9 * sr)) / sr; return np.sin(2 * np.pi * (52 + 50 * np.exp(-tt * 18)) * tt) * np.exp(-tt * 5)
def hit():
    tt = np.arange(int(2 * sr)) / sr; return np.sin(2 * np.pi * (46 + 30 * np.exp(-tt * 8)) * tt) * np.exp(-tt * 2.2) * .8
ov = json.load(open(E + '/build/overlays.json')) if __import__('os').path.exists(E + '/build/overlays.json') else []
idt = next(x['s'] for x in W if x['seg'] == 'F1' and x['w'].startswith('identity'))
add(fx, hit(), idt, .35)
for p, a, b, *_ in ov:
    if 'citation_card' in p or 'quote_card' in p: add(fx, paper(), a, .5, -.2)
    if 'pl_loop_' in p: add(fx, tick(), a, .25, .3)
    if 'pl_standardised' in p: add(fx, thump(), a + .05, .45)
    if 'pl_poster' in p or 'pl_cafes' in p: add(fx, tick(), a, .12, -.3)
sf.write(E + '/audio/bed.wav', bed.astype(np.float32), sr); sf.write(E + '/audio/sfx.wav', fx.astype(np.float32), sr)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', E + '/audio/voice.wav', '-af', f'apad,atrim=0:{TOT:.3f},aformat=channel_layouts=stereo', '-ar', '48000', E + '/audio/voice_tl.wav'], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', E + '/audio/voice_tl.wav', '-i', E + '/audio/bed.wav', '-i', E + '/audio/sfx.wav', '-filter_complex',
                '[0]asplit[v][sc];[1][sc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400:makeup=1[bd];[v][bd][2]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[o]',
                '-map', '[o]', '-ar', '48000', E + '/audio/mix.wav'], check=True)
print('mix done', round(TOT, 2))
