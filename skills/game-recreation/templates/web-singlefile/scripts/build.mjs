// MIT — see ../LICENSE.build-tools.
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGame } from './pipeline.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try {
  const result = await buildGame(root, { production: true });
  console.log(`dist/index.html: ${result.htmlBytes} bytes; gzip: ${result.gzipBytes} bytes`);
  console.log(`SHA-256: ${result.htmlSha256}`);
  console.log('Build completed. Gameplay, offline and file:// behavior still require verification.');
} catch (error) {
  console.error(`Build failed: ${error.message}`);
  process.exitCode = 1;
}
