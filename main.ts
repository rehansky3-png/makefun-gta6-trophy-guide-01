// Sunset Platinum — a GTA VI trophy guide and tracker (gta6-trophy-guide-01).
//
// This is the entry's program, run by the grader in a fresh container with
// Node 22 and no network. It hands the guide in: it copies the static app
// (app/) and the screenshots (screenshots/) from beside this file into the
// output directory, then writes dossier.json there — the summary the judge
// reads — using the vendored make.fun library, which must stay byte for
// byte the copy the kit ships (vendor/makefun-frontend.ts).
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it twice: both runs must write the same bytes.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps for this bounty (kit reference/gate.json): the
// dossier text is capped at 160 KiB, at most 4 screenshots of at most
// 256 KiB each, app/ at most 993 files and directories and 48 MiB in all.
const dossierOptions = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function mustExist(path, what) {
  if (!existsSync(path)) throw new Error(`missing ${what}: ${path}`);
}

function screenshotCount(dir) {
  return readdirSync(dir).filter((name) => {
    const full = join(dir, name);
    return statSync(full).isFile() && !name.startsWith('.');
  }).length;
}

const appDir = join(repoRoot, 'app');
const shotsDir = join(repoRoot, 'screenshots');
mustExist(appDir, 'the app folder');
mustExist(join(appDir, 'index.html'), 'the app entry page');
mustExist(join(appDir, 'data', 'trophies.json'), 'the trophy data');
mustExist(shotsDir, 'the screenshots folder');

const shots = screenshotCount(shotsDir);
if (shots < 3 || shots > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shots}`);
}

// Start from a clean output so a second run writes the same bytes as the
// first: stale files from an earlier run must not survive into the entry.
mkdirSync(outputDir, { recursive: true });
rmSync(join(outputDir, 'app'), { recursive: true, force: true });
rmSync(join(outputDir, 'screenshots'), { recursive: true, force: true });
cpSync(appDir, join(outputDir, 'app'), { recursive: true });
cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outputDir, dossierOptions);
writeFileSync(join(outputDir, 'dossier.json'), dossier);

console.log(`Sunset Platinum: ${shots} screenshots, dossier ${dossier.length} bytes -> ${outputDir}`);
