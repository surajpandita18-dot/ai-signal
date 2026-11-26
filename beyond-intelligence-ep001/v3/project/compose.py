# Final composite: intro + A-roll + end card, B-roll plates, lower third, watermark, captions, grain, mix.
import json, sys, subprocess, os
P = sys.argv[1]; OUTF = sys.argv[2]
cu = json.load(open(P + '/cues.json')); ev = cu['ev']; SC = cu['scenes']
END = ev['end']; ECD = 2.8; TOT = END + ECD
run = lambda a: subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-threads', '3'] + a, check=True)
os.makedirs(P + '/clips', exist_ok=True)

# 1. plate clips (push-in from full 1188x2112 plate to the centre 1080x1920)
for s in SC:
    if os.path.exists(f"{P}/clips/{s['plate']}.mp4"): continue
    d = s['e'] - s['s'] + .05; N = round(d * 30)
    run(['-loop', '1', '-framerate', '30', '-i', f"{P}/plates/{s['plate']}.png", '-frames:v', str(N),
         '-vf', f"zoompan=z='1+0.1*on/{N}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,format=yuv420p",
         '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', f"{P}/clips/{s['plate']}.mp4"])
# end card clip
N = round(ECD * 30)
run(['-loop', '1', '-framerate', '30', '-i', f"{P}/brand/template-end-card.png", '-frames:v', str(N),
     '-vf', f"scale=1188:2112,zoompan=z='1.0+0.05*on/{N}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,fade=t=in:d=0.45,format=yuv420p",
     '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', f"{P}/clips/endcard.mp4"])

# 2. base = intro + aroll (trimmed to the end cue) + end card
aroll_len = END - 2.6; C = ev['cold_end']
if not os.path.exists(f"{P}/base.mp4"): run(['-framerate', '30', '-i', f"{P}/intro_frames/f%03d.png", '-i', f"{P}/aroll.mov", '-i', f"{P}/clips/endcard.mp4",
     '-filter_complex', (f"[0]format=yuv420p,setsar=1[a];[1:v]split[x][y];[x]trim=0:{C:.4f},setpts=PTS-STARTPTS,setsar=1[b0];[y]trim={C:.4f}:{aroll_len:.3f},setpts=PTS-STARTPTS,setsar=1[b1];[2]setsar=1[c];[b0][a][b1][c]concat=n=4:v=1:a=0[v]" if C > 0 else
                       f"[0]format=yuv420p,setsar=1[a];[1:v]trim=0:{aroll_len:.3f},setpts=PTS-STARTPTS,setsar=1[b1];[2]setsar=1[c];[a][b1][c]concat=n=3:v=1:a=0[v]"),
     '-map', '[v]', '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', '-r', '30', f"{P}/base.mp4"])

# 3. overlays
inp = ['-i', f"{P}/base.mp4"]
for s in SC: inp += ['-i', f"{P}/clips/{s['plate']}.mp4"]
inp += ['-loop', '1', '-i', f"{P}/brand/lower-third.png", '-loop', '1', '-i', f"{P}/brand/watermark.png", '-i', f"{P}/mix.wav"]
MOODS = ['confused', 'thinking', 'surprised']
for m in MOODS: inp += ['-framerate', '30', '-i', f"{P}/mascot/{m}/f%03d.png"]
fc = []; last = '0:v'
for k, s in enumerate(SC):
    d = s['e'] - s['s']
    nxt = SC[k + 1]['s'] if k + 1 < len(SC) else 1e9
    prv = SC[k - 1]['e'] if k else -1e9
    f = f"[{k + 1}:v]format=yuva420p"
    if abs(prv - s['s']) > .01 and s['s'] > .05: f += ",fade=t=in:d=0.28:alpha=1"
    if abs(nxt - s['e']) > .01: f += f",fade=t=out:st={d - .28:.3f}:d=0.28:alpha=1"
    else: f += f",fade=t=in:d=0.22:alpha=1" if False else ''
    fc.append(f + f",setpts=PTS-STARTPTS+{s['s']:.3f}/TB[p{k}]")
    fc.append(f"[{last}][p{k}]overlay=eof_action=pass:enable='between(t,{s['s']:.3f},{s['e']:.3f})'[o{k}]"); last = f"o{k}"
li = len(SC) + 1; lt = ev['lower_third']
fc.append(f"[{li}:v]format=yuva420p,trim=0:3.8,fade=t=in:d=0.35:alpha=1,fade=t=out:st=3.4:d=0.4:alpha=1,setpts=PTS-STARTPTS+{lt:.3f}/TB[lt]")
fc.append(f"[{last}][lt]overlay=eof_action=pass:enable='between(t,{lt:.3f},{lt + 3.8:.3f})'[ol]")
fc.append(f"[{li + 1}:v]format=yuva420p,trim=0:{TOT:.3f}[wm]")
fc.append(f"[ol][wm]overlay=x=W-w-150:y=1660:enable='between(t,0.6,{C - .05:.4f})+between(t,{C + 2.75:.4f},{END - .05:.3f})'[ow0]")
last = 'ow0'
for q, m in enumerate(MOODS):
    t0 = ev['mascot_' + m]
    fc.append(f"[{li + 3 + q}:v]format=rgba,setpts=PTS-STARTPTS+{t0:.3f}/TB[mc{q}]")
    fc.append(f"[{last}][mc{q}]overlay=x=710:y=590:eof_action=pass:enable='between(t,{t0:.3f},{t0 + 2:.3f})'[mo{q}]"); last = f"mo{q}"
fc.append(f"[{last}]null[ow]")
fc.append(f"[ow]ass={P}/captions.ass:fontsdir=/usr/share/fonts/opentype/inter,noise=alls=2:allf=t,format=yuv420p[vout]")
run(inp + ['-filter_complex', ';'.join(fc), '-map', '[vout]', '-map', f"{li + 2}:a", '-t', f"{TOT:.3f}",
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-profile:v', 'high', '-maxrate', '16M', '-bufsize', '32M', '-r', '30', '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', OUTF])
print('done', round(TOT, 2))
