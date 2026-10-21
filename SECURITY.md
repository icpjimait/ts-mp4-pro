# Security Policy

## Supported versions

Only the latest release of TS to MP4 Pro is supported with security fixes.

## Reporting a vulnerability

Please **do not** open a public issue for a security vulnerability.

Instead, use GitHub's private vulnerability reporting on this repository
(**Security → Report a vulnerability**), or contact the maintainer through
their GitHub profile: [@icpjimait](https://github.com/icpjimait).

Please include:

- A description of the issue and its impact
- Steps to reproduce (a crafted media file's `ffprobe` output helps;
  do not attach copyrighted content)
- The app version and your operating system

You can expect an acknowledgment within 7 days. Fixes are shipped in a
patch release, and reporters are credited in the changelog unless they
prefer to stay anonymous.

## Scope notes

TS to MP4 Pro runs FFmpeg locally on files the user selects. Reports about
FFmpeg itself are best filed upstream with the
[FFmpeg project](https://ffmpeg.org/security.html), but please still let us
know if a malicious media file can crash or escape the app's conversion flow.
