# Render the edited face A-roll (graded, 1080x1920, 30 fps) with the cleaned video audio.
import json, sys, subprocess
P = sys.argv[1]
EJ = json.load(open(P + '/edl.json')); E = EJ['segs']; SP = EJ['speed']
C0 = (864, 1536, 108, 330)   # wide
C1 = (760, 1351, 192, 380)   # close (hides jump cuts)
GRADE = "eq=contrast=1.06:saturation=0.9:gamma=1.1,colorbalance=rs=-0.04:bs=0.04:rm=-0.03:bm=0.02,vignette=PI/4.6"
import os
os.makedirs(P + '/seg', exist_ok=True)
zoom = 0; n = len(E); lst = []
for i, g in enumerate(E):
    if i and abs(g['src_s'] - E[i - 1]['src_e']) > 0.05: zoom ^= 1
    w, h, x, y = C1 if zoom else C0
    d = g['src_e'] - g['src_s']
    v = f"setpts=PTS/{SP},fps=30,crop={w}:{h}:{x}:{y},scale=1080:1920:flags=lanczos"
    if i < 3 or i >= n - 2:
        zs = {0: 1.0, 1: 1.0, 2: 1.06, n - 2: 1.0}.get(i, 1.035); ze = zs + 0.035
        v += f",zoompan=z='{zs}+{ze - zs:.3f}*on/{g['frames']}':x='iw/2-(iw/zoom/2)':y='ih*0.42-(ih/zoom*0.42)':d=1:s=1080x1920:fps=30"
    v += f",setsar=1,{GRADE},format=yuv420p"
    do = g['frames'] / 30
    a = f"atempo={SP},apad,atrim=0:{do:.5f},afade=t=in:d=0.012,afade=t=out:st={do - 0.012:.4f}:d=0.012"
    out = f"{P}/seg/s{i:02d}.mov"; lst.append(f"file '{out}'")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-threads', '3', '-ss', str(g['src_s']), '-i', P + '/video_raw.mov', '-ss', str(g['src_s']), '-i', P + '/vid_clean.wav',
                    '-t', f"{d + .2:.4f}", '-frames:v', str(g['frames']), '-map', '0:v', '-map', '1:a', '-vf', v, '-af', a, '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-r', '30',
                    '-c:a', 'pcm_s16le', '-ar', '48000', out], check=True)
open(P + '/seg/list.txt', 'w').write('\n'.join(lst))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', P + '/seg/list.txt', '-c', 'copy', P + '/aroll.mov'], check=True)
print('ok')
