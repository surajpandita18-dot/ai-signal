# Voice timeline (cold open | 2.6 s sting gap | rest) + ducked bed + SFX -> mix.wav at -14 LUFS.
import json, sys, subprocess, numpy as np, soundfile as sf
P = sys.argv[1]
ev = json.load(open(P + '/cues.json'))['ev']; C = ev['cold_end']; TOT = ev['end'] + 3.6
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', P + '/aroll.mov', '-vn', '-ac', '2', '-ar', '48000', P + '/aroll_a.wav'], check=True)
a, sr = sf.read(P + '/aroll_a.wav')
v = np.zeros((int(TOT * sr), 2)); c = int(C * sr); g = int(2.6 * sr)
v[:c] = a[:c]; rest = a[c:]; n = min(len(rest), len(v) - c - g); v[c + g:c + g + n] = rest[:n]
sf.write(P + '/voice_tl.wav', v.astype(np.float32), sr)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', P + '/voice_tl.wav', '-i', P + '/bed.wav', '-i', P + '/sfx.wav', '-filter_complex',
                "[0]asplit[v][sc];[1][sc]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=350:makeup=1[bd];"
                "[v][bd][2]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[o]",
                '-map', '[o]', '-ar', '48000', P + '/mix.wav'], check=True)
print('mix ok', round(TOT, 2))
