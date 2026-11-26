# Final composite for the Individuality Reel. Usage: python compose.py <ep> <out.mp4>
import json, sys, os, re, subprocess
E = sys.argv[1]; OUT = sys.argv[2]
TL = json.load(open(E + '/timeline.json')); S = {s['id']: s for s in TL['segments']}
W = json.load(open(E + '/words.json'))
V = E + '/visual_assets'; G = E + '/gfx'; CAM = E + '/../source/camera_original.mov'
END = TL['dur'] + 1.0; ECD = 2.6; TOT = END + ECD
run = lambda a: subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-threads', '3'] + a, check=True)
os.makedirs(E + '/build', exist_ok=True); B = E + '/build'

def w(seg, word, n=1, key='s'):
    c = 0
    for x in W:
        if x['seg'] == seg and re.sub(r'\W', '', x['w']).lower() == word.lower():
            c += 1
            if c == n: return x[key]
    raise SystemExit(f'word not found {seg} {word}')

# ---------- base: face slots + dark slots ----------
MED = (810, 1440, 150, 480); EMP = (700, 1244, 205, 560)
GRADE = "eq=contrast=1.04:saturation=1.0:gamma=1.02,colorbalance=rs=0.015:gs=0.0:bs=-0.02:rh=0.01:bh=-0.015,vignette=PI/6.5"
segs = TL['segments']; slots = []
for i, s in enumerate(segs):
    end = segs[i + 1]['t0'] if i + 1 < len(segs) else END
    slots.append((s, s['t0'], end))
PLAN = len(sys.argv) > 3 and sys.argv[3] == 'plan'
lst = []
for k, (s, a, b) in enumerate(slots if not PLAN else []):
    d = b - a; N = round(d * 30); f = f"{B}/slot{k:02d}.mp4"; lst.append(f"file '{f}'")
    if os.path.exists(f) and os.path.getsize(f) > 1000: continue
    if s['layout'] == 'face':
        crop = EMP if s['id'] in ('F4', 'F6') else MED
        vf = f"crop={crop[0]}:{crop[1]}:{crop[2]}:{crop[3]},scale=1080:1920:flags=lanczos"
        if s['id'] == 'F8': vf += f",fade=t=out:st={d - .5:.3f}:d=0.5"
        if s['id'] in ('F1', 'F8', 'F3'):
            z = {'F1': .05, 'F8': .07, 'F3': .04}[s['id']]
            vf += f",zoompan=z='1+{z}*on/{N}':x='iw/2-(iw/zoom/2)':y='ih*0.4-(ih/zoom*0.4)':d=1:s=1080x1920:fps=30"
        run(['-ss', str(s['in']), '-i', CAM, '-frames:v', str(N), '-an', '-vf', vf + f",fps=30,setsar=1,{GRADE},format=yuv420p", '-c:v', 'libx264', '-crf', '15', '-preset', 'medium', '-r', '30', f])
    else:
        run(['-f', 'lavfi', '-i', f'color=c=0x151515:s=1080x1920:r=30', '-frames:v', str(N), '-c:v', 'libx264', '-crf', '15', '-pix_fmt', 'yuv420p', f])
# end card
N = round(ECD * 30)
if not PLAN: run(['-loop', '1', '-framerate', '30', '-i', f"{V}/07_Motion_Graphics/end_card_bigger_picture.png", '-frames:v', str(N), '-vf', 'fade=t=in:d=0.5,format=yuv420p', '-c:v', 'libx264', '-crf', '15', f"{B}/endcard.mp4"])
lst.append(f"file '{B}/endcard.mp4'")
open(B + '/list.txt', 'w').write('\n'.join(lst))
if not PLAN and not os.path.exists(B + '/base.mp4'): run(['-f', 'concat', '-safe', '0', '-i', B + '/list.txt', '-c', 'copy', B + '/base.mp4'])

# ---------- overlays ----------
AI = 'AI illustration'
OV = []  # (png, start, end, push, fade_in, fade_out, label)
def ov(p, a, b, push=.05, fi=.0, fo=.0, label=''): OV.append((p, round(a, 3), round(b, 3), push, fi, fo, label))
g8 = f"{V}/08_AI_Illustrations_Gemini"
# F1 hook type
ov(f"{G}/ov_hook.png", 0.0, S['F1']['t1'] + .1, 0, 0, .2)
# C1
sub = w('C1', 'substack')
ov(f"{g8}/ai_01_metro_phones.png", S['F1']['t1'] + .1, sub - .05, .06, 0, 0, AI)
ov(f"{G}/pl_citation_big.png", sub - .05, S['F2']['t0'], .03)
# F2 tags
for k, word in enumerate(['instagram', 'youtube', 'algorithm']):
    a = w('F2', word); b = w('F2', ['youtube', 'algorithm', 'recommending'][k]) if k < 2 else S['F2']['t1']
    ov(f"{G}/ov_tags_{k + 1}.png", a - .05, b - .05 if k < 2 else b, 0, .12 if k == 0 else 0, .2 if k == 2 else 0)
# C3 montage
c3 = S['C3']; t = S['F2']['t1'] + .05
mv = w('C3', 'movies'); wat = w('C3', 'watching'); lis = w('C3', 'listening'); wea = w('C3', 'wearing'); vis = w('C3', 'visiting'); som = w('C3', 'sometimes')
ov(f"{g8}/ai_02_mall_crowd.png", t, wat - .1, .06, 0, 0, AI)
pt = ['poster_the_truman_show_1998', 'poster_her_2013', 'poster_interstellar_2014']; step = (mv + .1 - (wat - .1)) / 3
for k, p in enumerate(pt): ov(f"{G}/pl_{p}.png", wat - .1 + k * step, wat - .1 + (k + 1) * step, .03, 0, 0, 'Film posters © Paramount Pictures · Warner Bros. Pictures')
ov(f"{g8}/extra_01_cinema_hall.png", mv + .1, lis - .05, .05, 0, 0, AI)
ov(f"{g8}/ai_03_headphones.png", lis - .05, wea - .05, .05, 0, 0, AI)
ov(f"{g8}/extra_03_street_crowd.png", wea - .05, vis - .05, .05, 0, 0, AI)
ov(f"{G}/pl_cafes.png", vis - .05, som - .25, .03, 0, 0, AI)
ov(f"{V}/07_Motion_Graphics/graphic_same_opinions.png", som - .25, S['F3']['t0'], .03)
# C4 quote
ov(f"{G}/pl_quote_big.png", S['F4']['t1'] + .1, S['F5']['t0'], .03)
# C5
intro = w('C5', 'introduced'); they = w('C5', 'they')
ov(f"{G}/pl_culture_title.png", S['F5']['t1'] + .1, intro - .1, .03)
ov(f"{G}/pl_culture_portraits.png", intro - .1, they - .1, .03)
stc = [they - .1, w('C5', 'entertainment') - .05, w('C5', 'culture', 2) - .05, w('C5', 'standardised') - .05, S['F6']['t0']]
for k in range(4): ov(f"{G}/pl_std_{k + 1}.png", stc[k], stc[k + 1], 0)
# C6 loop
cues = [S['F6']['t1'] + .1, w('C6', 'suddenly'), w('C6', 'preferences'), w('C6', 'feed'), w('C6', 'outside')]
for k in range(5):
    ov(f"{G}/pl_loop_{k + 1}.png", cues[k], cues[k + 1] if k < 4 else S['F7']['t0'], 0)
# C7 exploring
ov(f"{g8}/extra_02_headphones_room.png", S['F7']['t1'] + .1, S['F8']['t0'], .05, .2, .2, AI)
OV.sort(key=lambda o: o[1]); NOV = []
for i, o in enumerate(OV):
    o = list(o); full = not os.path.basename(o[0]).startswith('ov_')
    hard = lambda q: q is not None and ('pl_poster' in q[0] or 'cinema_hall' in q[0])
    prv = OV[i - 1] if i else None; nxt = OV[i + 1] if i + 1 < len(OV) else None
    if full:
        if prv and not os.path.basename(prv[0]).startswith('ov_') and abs(prv[2] - o[1]) < .02: o[4] = 0 if (hard(o) or hard(prv)) else max(o[4], .22)
        elif not o[4]: o[4] = .15
        if nxt and not os.path.basename(nxt[0]).startswith('ov_') and abs(nxt[1] - o[2]) < .02: o[2] = o[2] if (hard(o) or hard(nxt)) else round(o[2] + .22, 3)
        elif not o[5] and o[2] < END - .1: o[5] = .15
    NOV.append(tuple(o))
OV = NOV
json.dump(OV, open(B + '/overlays.json', 'w'), indent=1)
if len(sys.argv) > 3 and sys.argv[3] == 'plan': print('overlays', len(OV)); sys.exit(0)

# pre-render each overlay as a clip (push-in), labels burned in
F = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
clips = []
for k, (p, a, b, push, fi, fo, label) in enumerate(OV):
    d = b - a; N = max(2, round(d * 30)); c = f"{B}/ov{k:02d}.mov"; isov = os.path.basename(p).startswith('ov_')
    ai = '08_AI' in p
    vf = ("scale=1200:-2,crop=1080:1920:60:0" if ai else "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920") if not isov else "scale=1080:1920"
    if push and not isov:
        vf += f",scale=1188:2112,zoompan=z='1+{push}*on/{N}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30"
    if ai: vf += ",eq=contrast=1.03:saturation=0.9,colorbalance=rs=0.015:bs=-0.015,noise=alls=5:allf=t"
    if label:
        vf += f",drawbox=x=36:y=1748:w=iw-72:h=46:color=black@0.0:t=fill,drawtext=fontfile={F}:text='{label}':x=48:y=1758:fontsize=22:fontcolor=white@0.85:shadowcolor=black@0.6:shadowx=1:shadowy=1"
    vf += ",format=yuva420p"
    run(['-loop', '1', '-framerate', '30', '-i', p, '-frames:v', str(N), '-vf', vf, '-c:v', 'qtrle' if isov else 'libx264', *([] if isov else ['-crf', '15', '-pix_fmt', 'yuv420p']), c])
    clips.append((c, a, b, fi, fo))

# ---------- final ----------
inp = ['-i', B + '/base.mp4']
for c, a, b, fi, fo in clips: inp += ['-i', c]
inp += ['-i', E + '/audio/mix.wav']
fc = []; last = '0:v'
for k, (c, a, b, fi, fo) in enumerate(clips):
    fd = (f',fade=t=in:d={fi}:alpha=1' if fi else '') + (f',fade=t=out:st={max(0, b - a - fo):.3f}:d={fo}:alpha=1' if fo else '')
    fc.append(f"[{k + 1}:v]format=yuva420p{fd},setpts=PTS-STARTPTS+{a:.3f}/TB[o{k}]")
    fc.append(f"[{last}][o{k}]overlay=eof_action=pass:enable='between(t,{a:.3f},{b:.3f})'[v{k}]"); last = f"v{k}"
fc.append(f"[{last}]ass={E}/captions.ass:fontsdir=/usr/share/fonts/opentype/inter,noise=alls=2:allf=t,format=yuv420p[vout]")
run(inp + ['-filter_complex', ';'.join(fc), '-map', '[vout]', '-map', f"{len(clips) + 1}:a", '-t', f"{TOT:.3f}",
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-profile:v', 'high', '-maxrate', '16M', '-bufsize', '32M', '-r', '30', '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', OUT])
print('done', round(TOT, 2), 'overlays', len(clips))
