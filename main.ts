// Deterministic entry point for the token-radar-01 sealed snapshot.
// Run locally with: MAKEFUN_OUTPUT_DIR=out node main.ts --input ../input/snapshot.json
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { boardIssue, buildRadar, dataScript, parseSnapshot } from './lib/model.ts';
import { buildDossier } from './vendor/makefun-board.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const screenshotSettings = { max: 4, max_bytes: 512 * 1024 };
const dashboardSettings = { max_files: 400, max_bytes: 4 * 1024 * 1024 };
const namePattern = /^[A-Za-z0-9_][A-Za-z0-9._-]{0,127}$/;

function option(key: string, defaultValue: string): string {
  const flag = `--${key}`;
  const position = process.argv.indexOf(flag);
  if (position !== -1) {
    const value = process.argv[position + 1];
    if (value) return value;
  }
  const inline = process.argv.find((part) => part.startsWith(`${flag}=`));
  return inline ? inline.slice(flag.length + 1) : defaultValue;
}

function stop(message: string, status = 1): never {
  process.stderr.write(`token-radar: ${message}\n`);
  process.exit(status);
}

function copyFlatDirectory(source: string, destination: string): string[] {
  if (!existsSync(source)) return [];
  mkdirSync(destination, { recursive: true });
  const copied: string[] = [];
  for (const entry of readdirSync(source).sort()) {
    if (entry.startsWith('.')) continue;
    const from = join(source, entry);
    if (!statSync(from).isFile()) continue;
    copyFileSync(from, join(destination, entry));
    copied.push(entry);
  }
  return copied;
}

const inputArgument = option('input', '/input');
const snapshotPath = inputArgument.endsWith('.json')
  ? resolve(inputArgument)
  : join(resolve(inputArgument), 'snapshot.json');
if (!existsSync(snapshotPath)) stop(`snapshot is missing at ${snapshotPath}; use --input <file-or-directory>`, 2);

const destination = resolve(option('output', output));
mkdirSync(destination, { recursive: true });
const snapshot = parseSnapshot(readFileSync(snapshotPath, 'utf8'));
const result = buildRadar(snapshot);
const invalidBoard = boardIssue(result.board, snapshot);
if (invalidBoard) stop(`model output rejected by the local gate: ${invalidBoard}`);

writeFileSync(join(destination, 'board.json'), `${JSON.stringify({ rows: result.board })}\n`, 'utf8');
writeFileSync(join(destination, 'data.js'), dataScript(result.radar), 'utf8');

const dashboardFiles = copyFlatDirectory(join(root, 'dashboard'), join(destination, 'dashboard'));
if (!dashboardFiles.includes('index.html') || !dashboardFiles.some((file) => file.endsWith('.css')) || !dashboardFiles.some((file) => file.endsWith('.js'))) {
  stop('dashboard must contain index.html, a stylesheet and a JavaScript file');
}

const screenshotFiles = copyFlatDirectory(join(root, 'screenshots'), join(destination, 'screenshots'));
if (screenshotFiles.length < 3) stop(`need three screenshots (board, details, filter); found ${screenshotFiles.length}`);
for (const file of screenshotFiles) {
  if (!namePattern.test(file)) stop(`screenshots/${file} has a disallowed filename`);
}

// The dossier is derived after the files have been copied so its bytes describe the submitted page.
const dossier = buildDossier(destination, {
  text_max_bytes: 65_536,
  screenshots: screenshotSettings,
  dashboard: dashboardSettings
});
writeFileSync(join(destination, 'dossier.json'), dossier, 'utf8');

const written = [
  'board.json', 'data.js', 'dashboard/', 'screenshots/', 'dossier.json'
].map((path) => join(destination, path));
process.stdout.write(
  `token radar: ${snapshot.protocols.length} protocols; ${snapshot.watchlist.length} watchlist entries; ` +
  `${result.board.length} ranked rows (${result.radar.early_size} early, ${result.radar.live_size} live-token rows set aside)\n` +
  `token radar: wrote ${written.join(', ')}\n`
);
