#!/usr/bin/env python3
"""Non-destructive media inventory; optionally extract audio and create proxies."""
import argparse
import json
import shutil
import subprocess
from pathlib import Path

VIDEO_EXTS = {".mp4", ".mov", ".mkv", ".m4v", ".webm", ".avi"}
AUDIO_EXTS = {".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg"}

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, check=False)

def probe(path):
    p = run(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)])
    if p.returncode != 0:
        return {"file": str(path), "error": p.stderr.strip()}
    data = json.loads(p.stdout)
    fmt = data.get("format", {})
    streams = []
    for s in data.get("streams", []):
        streams.append({
            "type": s.get("codec_type"), "codec": s.get("codec_name"),
            "width": s.get("width"), "height": s.get("height"),
            "r_frame_rate": s.get("r_frame_rate"), "sample_rate": s.get("sample_rate"),
            "channels": s.get("channels"), "duration": s.get("duration")
        })
    return {
        "file": str(path), "size_bytes": path.stat().st_size,
        "duration_seconds": float(fmt["duration"]) if fmt.get("duration") else None,
        "format": fmt.get("format_name"), "streams": streams
    }

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("input", help="Media file or directory")
    ap.add_argument("--output", default="reel_project", help="Project output directory")
    ap.add_argument("--extract-audio", action="store_true", help="Extract mono 16 kHz WAV from video/audio")
    ap.add_argument("--proxy", action="store_true", help="Create 720px-wide H.264 proxies for video")
    args = ap.parse_args()

    ffprobe, ffmpeg = shutil.which("ffprobe"), shutil.which("ffmpeg")
    if not ffprobe:
        raise SystemExit("ffprobe not found. Install FFmpeg/FFprobe and retry.")
    src = Path(args.input).expanduser().resolve()
    if not src.exists():
        raise SystemExit(f"Input does not exist: {src}")
    media = [src] if src.is_file() else sorted(p for p in src.rglob("*") if p.is_file() and p.suffix.lower() in VIDEO_EXTS | AUDIO_EXTS)
    out = Path(args.output).expanduser().resolve()
    for folder in ("source", "proxies", "audio", "assets", "project", "exports", "qc"):
        (out / folder).mkdir(parents=True, exist_ok=True)

    report = {"input": str(src), "ffmpeg_available": bool(ffmpeg), "ffprobe_available": True, "files": []}
    for f in media:
        item = probe(f)
        report["files"].append(item)
        if item.get("error") or not ffmpeg:
            continue
        has_video = any(s.get("type") == "video" for s in item.get("streams", []))
        if args.extract_audio and any(s.get("type") == "audio" for s in item.get("streams", [])):
            target = out / "audio" / (f.stem + "_16k_mono.wav")
            run(["ffmpeg", "-y", "-i", str(f), "-vn", "-ac", "1", "-ar", "16000", str(target)])
            item["audio_extract"] = str(target) if target.exists() else "FAILED"
        if args.proxy and has_video:
            target = out / "proxies" / (f.stem + "_proxy.mp4")
            run(["ffmpeg", "-y", "-i", str(f), "-vf", "scale='min(720,iw)':-2", "-c:v", "libx264", "-preset", "veryfast", "-crf", "25", "-c:a", "aac", "-b:a", "128k", str(target)])
            item["proxy"] = str(target) if target.exists() else "FAILED"

    report_path = out / "qc" / "media_inventory.json"
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({"project_dir": str(out), "media_count": len(media), "report": str(report_path), "ffmpeg_available": bool(ffmpeg)}, indent=2))

if __name__ == "__main__":
    main()
