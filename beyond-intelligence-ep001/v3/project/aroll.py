# v3 A-roll: edited face footage, graded, 1080x1920 @ 30 fps, with the cleaned camera audio.
# Framing: two base crops that switch only on take changes (gap > 0.6 s), one tighter
# emphasis crop for a few lines, and slow push-ins only on the hook and the final question.
import json, sys, subprocess, os
P = sys.argv[1]
EJ = json.load(open(P + '/edl.json')); E = EJ['segs']; SP = EJ['speed']
C0 = (864, 1536, 108, 330)    # wide
C1 = (760, 1351, 192, 380)    # medium
C2 = (680, 1209, 232, 420)    # emphasis punch-in
EMPH = ('But turns out', "And here's the crazy part", 'Think about it', 'But wait')
PUSH = {'Aur ek aisa move': .04, 'Machines ka humari': .06, 'And that\'s something worth': .03}
GRADE = ("eq=contrast=1.04:saturation=0.94:gamma=1.08:brightness=0.012,"
         "colorbalance=rs=-0.03:bs=0.03:rm=-0.02:bm=0.015,vignette=PI/6.5")
os.makedirs(P + '/seg', exist_ok=True)
zoom = 0; lst = []; log = []
for i, g in enumerate(E):
    if i and abs(g['src_s'] - E[i - 1]['src_e']) > 0.6: zoom ^= 1
    crop = C2 if g['text'].startswith(EMPH) else (C1 if zoom else C0)
    w, h, x, y = crop
    v = f"setpts=PTS/{SP},fps=30,crop={w}:{h}:{x}:{y},scale=1080:1920:flags=lanczos"
    push = next((p for k, p in PUSH.items() if g['text'].startswith(k)), 0)
    if push:  # continuous push across a line's sub-segments
        sib = [k for k, h_ in enumerate(E) if h_['text'] == g['text']]
        tot = sum(E[k]['frames'] for k in sib); done = sum(E[k]['frames'] for k in sib if k < i)
        z0 = 1 + push * done / tot; z1 = 1 + push * (done + g['frames']) / tot
        v += f",zoompan=z='{z0:.4f}+{z1 - z0:.4f}*on/{g['frames']}':x='iw/2-(iw/zoom/2)':y='ih*0.42-(ih/zoom*0.42)':d=1:s=1080x1920:fps=30"
    v += f",setsar=1,{GRADE},format=yuv420p"
    do = g['frames'] / 30
    a = f"atempo={SP},apad,atrim=0:{do:.5f},afade=t=in:d=0.02,afade=t=out:st={do - 0.02:.4f}:d=0.02"
    out = f"{P}/seg/s{i:02d}.mov"; lst.append(f"file '{out}'")
    log.append({'seg': i, 'crop': ['wide', 'medium', 'emphasis'][[C0, C1, C2].index(crop)], 'push': push})
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-threads', '3', '-ss', str(g['src_s']), '-i', P + '/video_raw.mov', '-ss', str(g['src_s']), '-i', P + '/vid_clean.wav',
                    '-t', f"{g['src_e'] - g['src_s'] + .2:.4f}", '-frames:v', str(g['frames']), '-map', '0:v', '-map', '1:a', '-vf', v, '-af', a,
                    '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-r', '30', '-c:a', 'pcm_s16le', '-ar', '48000', out], check=True)
open(P + '/seg/list.txt', 'w').write('\n'.join(lst))
json.dump(log, open(P + '/framing_log.json', 'w'))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', P + '/seg/list.txt', '-c', 'copy', P + '/aroll.mov'], check=True)
print('ok')
