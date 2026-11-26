#!/usr/bin/env python3
"""Check a rendered video against a vertical Reel delivery profile."""
import argparse
import json
import shutil
import subprocess
from fractions import Fraction
from pathlib import Path

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("video", help="Rendered video file")
    ap.add_argument("--width", type=int, default=1080)
    ap.add_argument("--height", type=int, default=1920)
    ap.add_argument("--video-codec", default="h264")
    ap.add_argument("--audio-codec", default="aac")
    ap.add_argument("--fps", default="", help="Optional expected FPS, e.g. 30 or 29.97")
    args = ap.parse_args()

    path = Path(args.video).expanduser().resolve()
    if not path.exists():
        raise SystemExit(f"File not found: {path}")
    if not shutil.which("ffprobe"):
        raise SystemExit("ffprobe not found. Install FFmpeg/FFprobe and retry.")
    p = subprocess.run(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)], capture_output=True, text=True)
    if p.returncode:
        raise SystemExit(p.stderr)
    data = json.loads(p.stdout)
    streams = data.get("streams", [])
    v = next((s for s in streams if s.get("codec_type") == "video"), None)
    a = next((s for s in streams if s.get("codec_type") == "audio"), None)
    checks = []
    def check(name, ok, detail):
        checks.append({"check": name, "status": "PASS" if ok else "FAIL", "detail": detail})
    if not v:
        check("video_stream", False, "No video stream found")
    else:
        check("dimensions", v.get("width") == args.width and v.get("height") == args.height, f"Found {v.get('width')}x{v.get('height')}; expected {args.width}x{args.height}")
        check("video_codec", v.get("codec_name") == args.video_codec, f"Found {v.get('codec_name')}; expected {args.video_codec}")
        fps_raw = v.get("avg_frame_rate") or v.get("r_frame_rate") or "0/1"
        try: fps = float(Fraction(fps_raw))
        except Exception: fps = 0
        if args.fps:
            expected = float(args.fps)
            check("frame_rate", abs(fps - expected) < 0.02, f"Found {fps:.3f}; expected {expected:.3f}")
        else:
            check("frame_rate_detected", fps > 0, f"Detected {fps:.3f} fps")
    check("audio_stream", a is not None, "Audio stream present" if a else "No audio stream")
    if a:
        check("audio_codec", a.get("codec_name") == args.audio_codec, f"Found {a.get('codec_name')}; expected {args.audio_codec}")
    duration = (data.get("format") or {}).get("duration")
    check("duration", bool(duration) and float(duration) > 0, f"Duration: {duration}s")
    result = {"file": str(path), "overall": "PASS" if all(x["status"] == "PASS" for x in checks) else "FAIL", "checks": checks,
              "note": "Metadata checks do not replace watching/listening to the full export."}
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result["overall"] == "PASS" else 2)

if __name__ == "__main__":
    main()
