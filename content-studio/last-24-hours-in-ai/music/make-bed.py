# Original background bed for @thinksafari Reels (made from scratch with numpy: no samples, no copyright).
# Calm curiosity: Cmaj9 – Am9 – Fmaj7 – G6sus, 84 BPM, soft pads + plucked arpeggio + light kick. 64 s, loops cleanly.
import numpy as np, wave
SR = 44100; BPM = 84; beat = 60 / BPM; bars = 22; L = int(SR * beat * 4 * bars)
t = np.arange(L) / SR; out = np.zeros((L, 2))
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
chords = [[48, 55, 59, 62, 64], [45, 52, 55, 60, 64], [41, 48, 52, 55, 64], [43, 50, 55, 57, 62]]
def env(n, a, r):
    e = np.ones(n); a = min(int(a * SR), n); r = min(int(r * SR), n - a)
    e[:a] = np.linspace(0, 1, a); e[n - r:] *= np.linspace(1, 0, r); return e
def tone(f, n, kind='pad'):
    x = np.arange(n) / SR
    if kind == 'pad':
        return (np.sin(2 * np.pi * f * x) + .35 * np.sin(2 * np.pi * 2 * f * x * 1.002) + .15 * np.sin(2 * np.pi * 3 * f * x)) * (1 + .08 * np.sin(2 * np.pi * .3 * x))
    return (np.sin(2 * np.pi * f * x) + .5 * np.sin(2 * np.pi * 2 * f * x) + .25 * np.sin(2 * np.pi * 4 * f * x)) * np.exp(-x * 4.5)
barN = int(SR * beat * 4)
for b in range(bars):
    ch = chords[b % 4]; s = b * barN
    for i, m in enumerate(ch):  # pad
        seg = tone(hz(m), barN) * env(barN, 1.2, 1.0) * .06
        pan = .3 + .4 * i / 4; out[s:s + barN, 0] += seg * (1 - pan); out[s:s + barN, 1] += seg * pan
    if b >= 2:  # arpeggio (8th notes)
        arp = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[4] + 12, ch[3] + 12, ch[2] + 12, ch[4] + 12, ch[3] + 24]
        for k, m in enumerate(arp):
            st = s + int(k * beat / 2 * SR); n = int(SR * 1.2); n = min(n, L - st)
            seg = tone(hz(m), n, 'pluck')[:n] * .07; p = .5 + .3 * np.sin(k)
            out[st:st + n, 0] += seg * (1 - p); out[st:st + n, 1] += seg * p
    if 4 <= b < bars - 2:  # soft kick on 1 and 3
        for k in (0, 2):
            st = s + int(k * beat * SR); n = int(SR * .35); x = np.arange(n) / SR
            kick = np.sin(2 * np.pi * (55 + 90 * np.exp(-x * 30)) * x) * np.exp(-x * 9) * .22
            out[st:st + n] += kick[:, None]
# simple stereo delay for space
d = int(SR * beat * .75); wet = np.zeros_like(out); wet[d:] = out[:-d] * .25; out += wet
out *= env(L, 2.0, 4.0)[:, None]
out /= np.abs(out).max() * 1.12
w = wave.open('thinksafari-bed-01.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close(); print('ok', L / SR)
