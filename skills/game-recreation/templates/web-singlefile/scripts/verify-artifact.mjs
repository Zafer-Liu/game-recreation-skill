// MIT — see ../LICENSE.build-tools. Read-only production file/report check; does not execute the game.
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try {
  const [bytes, reportText] = await Promise.all([
    readFile(join(root, 'dist/index.html')),
    readFile(join(root, 'dist/build-report.json'), 'utf8'),
  ]);
  const report = JSON.parse(reportText);
  if (!report || typeof report !== 'object' || Array.isArray(report)) {
    throw new Error('Invalid build report object.');
  }
  if (report.mode !== 'production' || report.outputDirectory !== 'dist') {
    throw new Error('Expected a production build report for dist/.');
  }
  const html = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const gzipBytes = gzipSync(bytes, { level: 9 }).length;
  if (report.htmlBytes !== bytes.length) throw new Error('HTML byte count differs from the build report.');
  if (report.gzipBytes !== gzipBytes) throw new Error('gzip byte count differs from the build report.');
  if (report.htmlSha256 !== sha256) throw new Error('HTML SHA-256 differs from the build report.');
  if (bytes.includes(13)) throw new Error('Expected LF-only HTML.');
  for (const marker of ['/*__GAME_CSS__*/', '//__GAME_JS__', '<!--__GAME_LICENSES__-->']) {
    if (html.includes(marker)) throw new Error(`Unreplaced template marker: ${marker}`);
  }
  if (!html.includes('<pre id="third-party-licenses" hidden>')) {
    throw new Error('Missing inline third-party license block.');
  }
  console.log(JSON.stringify({
    mode: report.mode,
    file: 'dist/index.html',
    htmlBytes: bytes.length,
    gzipBytes,
    htmlSha256: sha256,
    artifactIntegrity: 'pass',
    gameplay: 'not evaluated',
    visualQuality: 'not evaluated',
    offlineRuntime: 'not evaluated',
  }, null, 2));
} catch (error) {
  console.error(`Artifact verification failed: ${error.message}`);
  process.exitCode = 1;
}
