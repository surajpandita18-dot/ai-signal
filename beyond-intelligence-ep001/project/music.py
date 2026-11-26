# Score bed + SFX for Ep 001, driven by cues.json. Writes bed.wav (ducked later) and sfx.wav.
import json, sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
P = sys.argv[1]
cu = json.load(open(P + '/cues.json')); ev = cu['ev']; sc = {s['plate']: s for s in cu['scenes']}
sr = 48000; END = ev['end']; TOT = END + 3.6
n = int(TOT * sr); t = np.arange(n) / sr
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
rng = np.random.default_rng(7)
lp = lambda x, f: sosfilt(butter(2, f, 'lp', fs=sr, output='sos'), x)
hp = lambda x, f: sosfilt(butter(2, f, 'hp', fs=sr, output='sos'), x)

# ---- pad: Dm(add9) - Bbmaj7 - Fadd9 - Csus2, 6 s each, crossfaded ----
CH = [[50, 57, 62, 65, 64], [46, 53, 57, 62, 69], [41, 53, 60, 65, 67], [48, 55, 60, 62, 67]]
bed = np.zeros((n, 2)); CL = 6.0
for k in range(int(TOT / CL) + 1):
    st = k * CL; ch = CH[k % 4]; i0 = int(st * sr); L = int((CL + 2.5) * sr)
    tt = np.arange(L) / sr; env = np.clip(tt / 1.8, 0, 1) * np.clip((CL + 2.5 - tt) / 2.5, 0, 1)
    for j, m in enumerate(ch):
        f = hz(m); g = .5 if m < 48 else .22
        sig = sum(np.sin(2 * np.pi * f * (1 + d) * tt + ph) for d, ph in [(-.0025, 0), (.0, 1.3), (.003, 2.1)]) / 3
        pan = (j - 2) / 4
        seg = sig * env * g
        e = min(n, i0 + L) - i0
        bed[i0:i0 + e, 0] += seg[:e] * np.cos((pan + 1) * np.pi / 4); bed[i0:i0 + e, 1] += seg[:e] * np.sin((pan + 1) * np.pi / 4)
bed[:, 0] = lp(bed[:, 0], 1800); bed[:, 1] = lp(bed[:, 1], 1800)

def pluck(f, d=2.0, dec=3.0):
    tt = np.arange(int(d * sr)) / sr; e = np.exp(-tt * dec) * (1 - np.exp(-tt * 300))
    return e * (np.sin(2 * np.pi * f * tt) + .3 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 6))
def add(buf, sig, st, g=1., pan=0.):
    i = int(st * sr)
    if i >= len(buf): return
    e = min(len(sig), len(buf) - i)
    buf[i:i + e, 0] += sig[:e] * g * np.cos((pan + 1) * np.pi / 4); buf[i:i + e, 1] += sig[:e] * g * np.sin((pan + 1) * np.pi / 4)

# sparse piano notes on chord tones
for k in range(int(TOT / 3.0)):
    st = k * 3.0 + rng.uniform(.2, .9); ch = CH[int(st // CL) % 4]
    add(bed, pluck(hz(rng.choice(ch[2:]) + 12), 3, 1.6), st, .07, rng.uniform(-.5, .5))

# tech pulse during the learning explainer
a, b = ev['learn_s'] - .3, ev['learn_e'] + .3; step = .1875; k = 0
while a + k * step < b:
    st = a + k * step; ch = CH[int(st // CL) % 4]
    add(bed, pluck(hz(ch[(k % 4) + 1] + 24), .25, 18), st, .05 * (1 if k % 4 == 0 else .55), .3 if k % 2 else -.3); k += 1

# ---- gain automation ----
g = np.ones(n)
def ramp(t0, t1, v0, v1):
    i0, i1 = int(t0 * sr), int(t1 * sr); g[i0:i1] = np.linspace(v0, v1, i1 - i0)
def hold(t0, t1, v): g[int(t0 * sr):int(t1 * sr)] = v
C0 = ev['cold_end']
SUS = [ev['sus_cold'], ev['sus_m37'], ev['sus_crazy'], ev['sus_question'], ev['sus_wait']]
hold(0, C0, .35); hold(C0, C0 + 2.6, 0); ramp(C0 + 2.6, C0 + 6.5, 0, 1)
for a_, b_ in SUS[2:]:
    ramp(a_ - .4, a_, 1, .35); hold(a_, b_, .35); ramp(b_, b_ + 1.2, .35, 1)
m37 = ev['m37_word']; s6 = sc['p06_m37title']['s']
ramp(s6 - .6, s6, 1, .12); hold(s6, m37, .12); ramp(m37, m37 + 1.5, .12, 1)
z, mb = ev['zaroori_end'], ev['maybe']
ramp(z - .5, z + .05, 1, 0); hold(z + .05, mb - .05, 0); ramp(mb - .05, mb + 2.5, 0, .7)
ramp(END - .2, END + .4, .7, 1.1); ramp(TOT - 1.8, TOT, 1.1, 0)
bed *= g[:, None] * .5
sf.write(P + '/bed.wav', bed.astype(np.float32), sr)

# ---- SFX (not ducked) ----
fx = np.zeros((n, 2))
def stone():
    tt = np.arange(int(.35 * sr)) / sr
    click = hp(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 260) * .6
    tone = (np.sin(2 * np.pi * 1850 * tt) * .5 + np.sin(2 * np.pi * 3320 * tt) * .25) * np.exp(-tt * 55)
    thump = np.sin(2 * np.pi * 190 * tt) * np.exp(-tt * 38) * .7
    return click + tone + thump
def boom():
    tt = np.arange(int(2.2 * sr)) / sr
    return np.sin(2 * np.pi * (48 + 40 * np.exp(-tt * 6)) * tt) * np.exp(-tt * 2.2) + lp(rng.standard_normal(len(tt)), 300) * np.exp(-tt * 6) * .4
def chime(f):
    return pluck(f, 3, 1.4) * .8 + pluck(f * 2.01, 3, 2.5) * .3
for p, gg in [('p04_game1', .32), ('p05_game2', .32), ('p12_final', .3), ('p13_m78', .36)]:
    add(fx, stone(), sc[p]['s'] + .18, gg)
add(fx, stone(), m37 + .02, .42); add(fx, boom(), m37 + .02, .55)
# soft reverse swell into the Move 37 reveal
L = int(1.2 * sr); sw = lp(rng.standard_normal(L), 900) * np.linspace(0, 1, L) ** 3 * .25; add(fx, sw, m37 - 1.2, 1.)
add(fx, chime(hz(81)), ev['k10'] + .05, .22, .2); add(fx, chime(hz(88)), ev['k10'] + .2, .12, -.2)
# Move 78: low swell (emotional weight)
L = int(3 * sr); tt = np.arange(L) / sr
add(fx, np.sin(2 * np.pi * hz(38) * tt) * np.sin(np.pi * tt / 3) * .5, sc['p13_m78']['s'] + .3, .5)
# brand sting on the end card: reuse the intro chord hit
im, _ = sf.read(P + '/intro_music.wav'); hit = im[int(1.30 * sr):]
i = int(END * sr); e = min(len(hit), n - i); fx[i:i + e] += hit[:e] * .55
i0 = int(C0 * sr); fx[i0:i0 + int(2.6 * sr)] += im[:int(2.6 * sr)] * .9  # intro sting music
tail = im[int(2.6 * sr):]; i = i0 + int(2.6 * sr); e = min(len(tail), n - i); fx[i:i + e] += tail[:e] * .35
def tension(t0, t1, g=1.):
    L = int((t1 - t0) * sr); tt = np.arange(L) / sr; p = tt / max(tt[-1], 1e-3)
    out = np.zeros(L)
    # heartbeat ~72 bpm, getting slightly faster
    beat = 0.0
    while beat < tt[-1] - .1:
        for off, amp in ((0, 1), (.16, .7)):
            i = int((beat + off) * sr); n_ = min(int(.25 * sr), L - i)
            if n_ <= 0: continue
            k = np.arange(n_) / sr
            out[i:i + n_] += amp * np.sin(2 * np.pi * (46 + 30 * np.exp(-k * 30)) * k) * np.exp(-k * 18)
        beat += .83 - .2 * (beat / tt[-1])
    # low dissonant drone with tremolo
    dr = (np.sin(2 * np.pi * hz(38) * tt) + .6 * np.sin(2 * np.pi * hz(39) * tt)) * (.6 + .4 * np.sin(2 * np.pi * 5 * tt))
    out += dr * .18 * np.clip(p * 3, 0, 1)
    # rising high tone in the last 45 %
    f = hz(74) * (1 + .5 * np.clip((p - .55) / .45, 0, 1))
    out += np.sin(2 * np.pi * np.cumsum(f) / sr) * .05 * np.clip((p - .55) / .45, 0, 1) ** 2
    out *= np.clip((t1 - t0 - tt) / .08, 0, 1)  # hard stop = cut to silence before the payoff
    add(fx, out, t0, g)
for a_, b_ in SUS: tension(a_, b_, .55)
add(fx, stone(), ev['sus_cold'][0] + .02, .45)  # frame-0 pattern interrupt
def blip(f0, f1, d=.09):
    tt = np.arange(int(d * sr)) / sr
    return np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, len(tt))) / sr) * np.sin(np.pi * tt / d)
for k_ in ('mascot_confused', 'mascot_thinking', 'mascot_surprised'):
    add(fx, blip(700, 1100), ev[k_] + .44, .12, .5)
    add(fx, blip(1200, 1700 if k_ != 'mascot_confused' else 900, .12), ev[k_] + .74, .10, .5)
sf.write(P + '/sfx.wav', fx.astype(np.float32), sr)
print('ok', round(TOT, 2))
