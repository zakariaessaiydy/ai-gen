// Locate ffmpeg without demanding it be on PATH.
//
// On Windows, winget/scoop/choco installs land in per-user shim dirs that a fresh shell often
// does not inherit — the tools then fail with a confusing "command not found" even though
// ffmpeg is installed. Resolve it the same way tools/ffmpeg_path.py does for the Python side.
import { existsSync } from 'fs';
import { execFileSync } from 'child_process';
import path from 'path';
import os from 'os';

const HOME = os.homedir();
const LOCALAPPDATA = process.env.LOCALAPPDATA || path.join(HOME, 'AppData', 'Local');

const CANDIDATES = (exe) => [
  path.join(LOCALAPPDATA, 'Microsoft', 'WinGet', 'Links', `${exe}.exe`),
  path.join(HOME, 'scoop', 'shims', `${exe}.exe`),
  'C:\\ProgramData\\chocolatey\\bin\\' + exe + '.exe',
  path.join(LOCALAPPDATA, 'Programs', 'ffmpeg', 'bin', `${exe}.exe`),
  'C:\\ffmpeg\\bin\\' + exe + '.exe',
  `/usr/bin/${exe}`,
  `/usr/local/bin/${exe}`,
  `/opt/homebrew/bin/${exe}`,
];

const cache = new Map();

/** Absolute path to ffmpeg/ffprobe, or null when it genuinely is not installed. */
export function findFfmpeg(exe = 'ffmpeg') {
  if (cache.has(exe)) return cache.get(exe);
  let found = null;
  try {
    // on PATH?
    execFileSync(exe, ['-version'], { stdio: 'ignore' });
    found = exe;
  } catch {
    for (const c of CANDIDATES(exe)) {
      if (existsSync(c)) { found = c; break; }
    }
  }
  cache.set(exe, found);
  return found;
}
