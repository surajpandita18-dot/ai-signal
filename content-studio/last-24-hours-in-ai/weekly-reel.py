#!/usr/bin/env python3
"""Turn a weekly carousel (weekNN-01.png ... in a *-doodle folder) into a 9:16 Reel MP4.

Usage:
  python3 weekly-reel.py issues/2026-11-28-week01-doodle                 # music only (music/ folder)
  python3 weekly-reel.py issues/2026-11-28-week01-doodle --voice v.m4a   # Suraj's voice + soft music bed

Music only: ~4 s per slide. With a voice note: slides are spread evenly across the voice length,
music plays underneath at low volume. Output: <folder>/reel.mp4 (1080x1920, H.264, AAC).
"""
import argparse, glob, os, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, 'fonts')
MUSIC = os.path.join(HERE, 'music', 'satie-gymnopedie-1-alciatore-PD.ogg')


def dur(path):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]).strip())


def frame(png, i, n, week, out):
    W, H = 1080, 1920
    c = Image.new('RGB', (W, H), 'white')
    s = Image.open(png).convert('RGB')
    c.paste(s, (0, 300))
    d = ImageDraw.Draw(c)
    try:
        f1 = ImageFont.truetype(os.path.join(FONT, 'Inter-ExtraBold.ttf'), 44)
    except OSError:
        f1 = ImageFont.load_default(size=44)
    d.text((W // 2, 170), f'LAST 7 DAYS IN AI · WEEK {week:02d}', fill='#151515', font=f1, anchor='mm')
    # progress bar under the slide
    x0, x1, y = 90, W - 90, 1730
    d.rounded_rectangle((x0, y, x1, y + 14), 7, fill='#E5E5E5')
    d.rounded_rectangle((x0, y, x0 + (x1 - x0) * (i + 1) / n, y + 14), 7, fill='#E5383B')
    c.save(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('folder'); ap.add_argument('--voice'); ap.add_argument('--per', type=float, default=4.0)
    a = ap.parse_args()
    pngs = sorted(glob.glob(os.path.join(a.folder, 'week*-[0-9][0-9].png')))
    week = int(os.path.basename(pngs[0])[4:6])
    n = len(pngs)
    total = dur(a.voice) + 0.8 if a.voice else a.per * n
    per = total / n
    tmp = tempfile.mkdtemp()
    frames = []
    for i, p in enumerate(pngs):
        f = os.path.join(tmp, f'f{i:02d}.png'); frame(p, i, n, week, f); frames.append(f)
    lst = os.path.join(tmp, 'list.txt')
    with open(lst, 'w') as fh:
        for f in frames:
            fh.write(f"file '{f}'\nduration {per:.3f}\n")
        fh.write(f"file '{frames[-1]}'\n")
    out = os.path.join(a.folder, 'reel.mp4')
    vid = ['-f', 'concat', '-safe', '0', '-i', lst]
    if a.voice:
        cmd = ['ffmpeg', '-y', *vid, '-i', a.voice, '-stream_loop', '-1', '-i', MUSIC, '-filter_complex',
               f'[1:a]aresample=44100,volume=1.0[v];[2:a]aresample=44100,volume=0.12,atrim=0:{total:.2f}[m];[v][m]amix=inputs=2:duration=longest:normalize=0,afade=t=out:st={total - 1.5:.2f}:d=1.5[a]',
               '-map', '0:v', '-map', '[a]']
    else:
        cmd = ['ffmpeg', '-y', *vid, '-stream_loop', '-1', '-i', MUSIC, '-filter_complex',
               f'[1:a]aresample=44100,atrim=0:{total:.2f},afade=t=in:d=1,afade=t=out:st={total - 2:.2f}:d=2[a]', '-map', '0:v', '-map', '[a]']
    cmd += ['-t', f'{total:.2f}', '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20',
            '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f'{n} slides, {total:.1f}s → {out}')


if __name__ == '__main__':
    main()
