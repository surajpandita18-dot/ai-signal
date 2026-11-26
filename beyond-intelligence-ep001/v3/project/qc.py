# Full-file QC for the final export -> qc_report.json
import json, sys, subprocess, re, difflib, numpy as np, soundfile as sf, sherpa_onnx
from scipy.signal import resample_poly
P, F, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
ev = json.load(open(P + '/cues.json'))['ev']; C = ev['cold_end']
EJ = json.load(open(P + '/edl.json')); E = EJ['segs']
T = lambda t: t + (2.6 if t >= C - .12 else 0)
rep = {'file': F, 'checks': []}
def add(name, status, detail): rep['checks'].append({'check': name, 'status': status, 'detail': detail}); print(f"{status:5s} {name}: {detail}")

pr = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,duration,profile,bit_rate:format=duration,size,bit_rate', '-of', 'json', F], capture_output=True, text=True).stdout)
v = next(s for s in pr['streams'] if s['codec_type'] == 'video'); a = next(s for s in pr['streams'] if s['codec_type'] == 'audio')
add('resolution', 'PASS' if (v['width'], v['height']) == (1080, 1920) else 'FAIL', f"{v['width']}x{v['height']}")
add('video_codec', 'PASS' if v['codec_name'] == 'h264' else 'FAIL', f"{v['codec_name']} {v.get('profile')} {int(v.get('bit_rate', 0)) // 1000} kbps")
add('frame_rate', 'PASS' if v['r_frame_rate'] == '30/1' else 'FAIL', v['r_frame_rate'])
add('audio_codec', 'PASS' if a['codec_name'] == 'aac' else 'FAIL', f"{a['codec_name']} {int(a.get('bit_rate', 0)) // 1000} kbps")
dv, da = float(v['duration']), float(a['duration'])
add('av_duration_match', 'PASS' if abs(dv - da) < .05 else 'FAIL', f"video {dv:.3f}s audio {da:.3f}s")

def ff(filt, kind):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', F] + (['-an', '-vf', filt] if kind == 'v' else ['-vn', '-af', filt]) + ['-f', 'null', '-'], capture_output=True, text=True)
    return r.stderr
bl = re.findall(r'black_start:([\d.]+) black_end:([\d.]+)', ff('blackdetect=d=0.25:pix_th=0.06', 'v'))
add('black_frames', 'PASS' if not bl else 'WARN', f"{len(bl)} segments >=0.25s: {bl[:5]}")
fr = re.findall(r'freeze_start: ([\d.]+)', ff('freezedetect=n=0.002:d=1.2', 'v'))
add('frozen_frames', 'PASS' if not fr else 'WARN', f"{len(fr)} holds >=1.2s (plates are designed holds; listed for review): {fr[:12]}")
sl = re.findall(r'silence_start: ([\d.]+)', ff('silencedetect=n=-45dB:d=1.2', 'a'))
add('long_silences', 'PASS' if len(sl) <= 1 else 'WARN', f"{len(sl)} silences >=1.2s: {sl}")
st = ff('astats=metadata=0', 'a'); pk = max(float(x) for x in re.findall(r'Peak level dB: (-?[\d.]+)', st))
add('clipping', 'PASS' if pk < -0.5 else 'FAIL', f"max sample peak {pk:.1f} dBFS")
lu = ff('ebur128=peak=true', 'a'); I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', lu)[-1]); TP = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', lu)[-1])
add('loudness', 'PASS' if -15.5 < I < -12.5 and TP <= -1.0 else 'WARN', f"integrated {I} LUFS, true peak {TP} dBFS")

# line-by-line speech integrity: source line vs the same line in the final mix
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', F, '-vn', '-ac', '1', '-ar', '16000', P + '/qc_final16.wav'], check=True)
y, _ = sf.read(P + '/qc_final16.wav'); x, _ = sf.read(P + '/vid_audio16.wav')
D = P + '/sherpa-onnx-whisper-small'
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{D}/small-encoder.int8.onnx', decoder=f'{D}/small-decoder.int8.onnx', tokens=f'{D}/small-tokens.txt', language='en', task='transcribe', num_threads=4)
def tr(sig, a_, b_):
    s_ = rec.create_stream(); s_.accept_waveform(16000, sig[int(a_ * 16000):int(b_ * 16000)].astype(np.float32)); rec.decode_stream(s_)
    return re.sub(r'[^a-z0-9 ]', '', s_.result.text.lower()).split()
lines = {}
for g in E: lines.setdefault(g['text'], []).append(g)
res = []
for text, gs in lines.items():
    src = tr(x, gs[0]['src_s'], gs[-1]['src_e']); fin = tr(y, T(gs[0]['out_s']), T(gs[-1]['out_e']))
    r = difflib.SequenceMatcher(None, src, fin).ratio()
    rep_ = [w for i, w in enumerate(fin[1:]) if w == fin[i] and len(w) > 2]
    res.append({'line': text, 'similarity': round(r, 2), 'final_heard': ' '.join(fin), 'repeated_words': rep_})
bad = [r for r in res if r['similarity'] < .7 or r['repeated_words']]
add('speech_integrity', 'PASS' if not bad else 'WARN', f"{len(res)} lines compared (source vs final, same recogniser); {len(bad)} flagged")
rep['speech_lines'] = res
json.dump(rep, open(OUT, 'w'), indent=1)
