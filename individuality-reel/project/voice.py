# Hybrid voice track: clean + camera audio, same processing chain, camera EQ-matched to clean, loudness-matched per segment.
import json, sys, subprocess, numpy as np, soundfile as sf, noisereduce as nr
from scipy.signal import butter, sosfiltfilt, welch, firwin2, fftconvolve
E = sys.argv[1]; SR = 48000
M = E + '/../source/'
SEGS = [  # id, source, in, out, text, layout
 ('F1', 'cam',   4.30,  6.70, "Your phone is the reason you have no identity.", 'face'),
 ('C1', 'clean', 13.50, 18.50, "I came across this line in a Substack essay recently, and honestly, it made me pause.", 'broll'),
 ('F2', 'cam',  11.25, 18.40, "Because think about it, when was the last time you discovered something you genuinely liked without Instagram, YouTube or an algorithm recommending it to you?", 'face'),
 ('C3', 'clean', 30.25, 39.40, "Look around. We are watching the same movies, listening to the same music, wearing similar clothes, visiting the same aesthetic cafes, and sometimes even developing the same opinions.", 'broll'),
 ('F3', 'cam',  27.70, 30.30, "And somehow, we still think we are expressing our individuality.", 'face'),
 ('F4', 'cam',  30.75, 32.68, "But here is where it gets interesting.", 'face'),
 ('C4', 'clean', 47.50, 52.75, "If you don't spend enough time getting to know yourself, you will end up absorbing everyone else's definition of you.", 'broll'),
 ('F5', 'cam',  40.35, 42.45, "And I think there is a much bigger idea behind this.", 'face'),
 ('C5', 'cam',  42.80, 53.45, "There is a concept in philosophy called the Culture Industry, introduced by Theodor Adorno and Max Horkheimer. They argued that mass-produced entertainment could make culture increasingly standardised.", 'broll'),
 ('F6', 'cam',  53.57, 55.15, "Now think about what algorithms do.", 'face'),
 ('C6', 'clean', 67.45, 76.55, "You like something once, and suddenly you are surrounded by more of the same. Your preferences become predictable, your feed becomes familiar, and slowly, discovering something outside the bubble starts feeling unusual.", 'broll'),
 ('F7', 'cam',  68.18, 72.85, "But can we really blame algorithms or capitalism? After all, we also choose to consume what they offer.", 'face'),
 ('C7', 'clean', 81.98, 86.35, "Maybe the real problem is that we have lost the habit of exploring without being told what to explore.", 'broll'),
 ('F8', 'cam',  77.53, 87.65, "And perhaps the most important question isn't whether the internet is changing our identity. It's this: if you stepped away from everyone else's opinions for a while, would you still know what you actually like?", 'face'),
]
GAP_AFTER = {'F1': .35, 'C1': .25, 'F2': .3, 'C3': .3, 'F3': .35, 'F4': .25, 'C4': .5, 'F5': .25, 'C5': .3, 'F6': .25, 'C6': .4, 'F7': .3, 'C7': .55, 'F8': 0}

def load(path):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', path, '-vn', '-ac', '1', '-ar', str(SR), '/tmp/_v.wav'], check=True)
    x, _ = sf.read('/tmp/_v.wav'); return x
def clean_chain(x, noise):
    x = sosfiltfilt(butter(4, 80, 'hp', fs=SR, output='sos'), x)
    return nr.reduce_noise(y=x, sr=SR, y_noise=noise, stationary=True, prop_decrease=0.75)
cl = load(M + 'Individuality_Reel_Claude_Pack/01_SOURCE_MEDIA/01_CLEAN_VOICE_AUDIO.m4a')
cm = load(M + 'camera_original.mov')
cl = clean_chain(cl, cl[int(.2 * SR):int(4.0 * SR)])
cm = clean_chain(cm, cm[int(1.6 * SR):int(4.2 * SR)])

def ltas(x):
    f = int(.02 * SR); k = len(x) // f; e = 20 * np.log10(np.sqrt((x[:k * f].reshape(k, f) ** 2).mean(1)) + 1e-9)
    sp = np.repeat(e > np.percentile(e, 60), f); xs = x[:len(sp)][sp]
    fr, p = welch(xs, SR, nperseg=4096); return fr, 10 * np.log10(p + 1e-20)
fr, pc = ltas(cl); _, pm = ltas(cm)
diff = pc - pm; diff -= np.median(diff[(fr > 300) & (fr < 3000)])
# smooth in ~1/3 octave and clamp
sm = np.array([diff[(fr > f / 1.12) & (fr < f * 1.12)].mean() if f > 60 else 0 for f in fr])
sm = np.clip(sm, -6, 6); sm[fr < 80] = 0; sm[fr > 12000] = np.clip(sm[fr > 12000], -6, 3)
taps = firwin2(2049, fr / (SR / 2), 10 ** (sm / 20)); cm = fftconvolve(cm, taps, mode='same')
print('EQ match (dB) at 150/500/1k/3k/6k/10k Hz:', [round(float(np.interp(f, fr, sm)), 1) for f in (150, 500, 1000, 3000, 6000, 10000)])

def seg_rms_db(y):
    f = int(.02 * SR); k = len(y) // f; e = np.sqrt((y[:k * f].reshape(k, f) ** 2).mean(1)); e = e[e > np.percentile(e, 50)]
    return 20 * np.log10(np.sqrt((e ** 2).mean()) + 1e-9)
out = []; t = 0.0; voice = []
fade = int(.02 * SR)
for sid, src, a, b, text, lay in SEGS:
    y = (cm if src == 'cam' else cl)[int(a * SR):int(b * SR)].copy()
    y *= 10 ** ((-20 - seg_rms_db(y)) / 20)
    r = np.linspace(0, 1, fade); y[:fade] *= r; y[-fade:] *= r[::-1]
    out.append({'id': sid, 'src': src, 'in': a, 'out': b, 't0': round(t, 3), 't1': round(t + (b - a), 3), 'text': text, 'layout': lay})
    voice.append(y); t += b - a
    g = GAP_AFTER[sid]; voice.append(np.zeros(int(g * SR))); t += g
v = np.concatenate(voice)
sf.write(E + '/audio/voice_raw.wav', v, SR)
# gentle tone + compression + limiter on the whole voice
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', E + '/audio/voice_raw.wav', '-af',
                'equalizer=f=200:t=q:w=1:g=-1.5,equalizer=f=3200:t=q:w=1.2:g=2,deesser=i=0.25,acompressor=threshold=-24dB:ratio=2.5:attack=10:release=150:makeup=2,alimiter=limit=0.89',
                E + '/audio/voice.wav'], check=True)
json.dump({'segments': out, 'dur': round(t, 3)}, open(E + '/timeline.json', 'w'), indent=1)
for o in out: print(f"{o['id']} {o['src']:5s} {o['t0']:6.2f}-{o['t1']:6.2f}  {o['text'][:55]}")
print('voice duration', round(t, 2))
