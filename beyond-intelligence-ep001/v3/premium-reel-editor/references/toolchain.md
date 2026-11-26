# Toolchain and Capability Guide

## Start with what is already installed
Inspect available commands and apps before proposing installation. Prefer the user's existing NLE/project (Premiere Pro, DaVinci Resolve, Final Cut Pro, CapCut, etc.) when available.

## FFmpeg / FFprobe
Useful for:
- Media metadata inspection.
- Audio extraction and conversion.
- Proxy generation.
- Simple trims, concatenation, scaling, and encoding.
- Technical export validation.

FFmpeg is not a substitute for a full nonlinear editor for complex timeline work, advanced keyframing, or sophisticated colour grading.

## Speech transcription
Use an available Whisper implementation or another approved speech-to-text tool. Verify Hinglish manually: code-switching, Indian names, and technical terms can be misrecognised. Do not send private footage to an external transcription service without user approval.

## Remotion
Use Remotion when code-driven motion graphics, reusable animated layouts, and reproducible renders are useful. Check Node.js and project dependencies first. Follow the current Remotion documentation and licensing terms. Do not assume package installation or rendering will succeed.

## Editing application
If a native editor is available, use its timeline and project format for frame-accurate work. Keep the project editable and preserve original media references.

## Suggested checks
- `ffmpeg -version`
- `ffprobe -version`
- `python --version`
- `node --version`
- `npx remotion --version` (only inside a suitable Remotion project)

## Installation discipline
Ask before installing large dependencies, downloading speech models, or uploading footage. Explain disk space, privacy, and licensing implications. Do not install software from untrusted scripts or unknown repositories.
