// MIT — see ../LICENSE.build-tools. Local dev server; no automatic browser opening.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGame } from './pipeline.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT ?? 8940);
let watcher;
let server;
try {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535.');
  await buildGame(root, { production: false });

  let running = false;
  let queued = false;
  const rebuild = async () => {
    if (running) { queued = true; return; }
    running = true;
    do {
      queued = false;
      try {
        await buildGame(root, { production: false });
        console.log('Rebuilt. Reload the browser to see source changes.');
      } catch (error) {
        console.error(`Rebuild failed: ${error.message}`);
        console.error('The previously generated page may still be served.');
      }
    } while (queued);
    running = false;
  };
  let debounce;
  watcher = watch(join(root, 'src'), { recursive: true }, () => {
    clearTimeout(debounce);
    debounce = setTimeout(rebuild, 150);
  });
  watcher.on('error', (error) => { console.error(`Watcher failed: ${error.message}`); process.exitCode = 1; server?.close(); watcher.close(); });
  server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (!['/', '/index.html'].includes(url.pathname) || !['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(404); res.end('Not found'); return;
      }
      const html = await readFile(join(root, '.preview/index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : html);
    } catch (error) {
      res.writeHead(500); res.end('Development page unavailable. Check server output.');
      console.error(error.message);
    }
  });
  server.on('error', (error) => {
    console.error(`Server failed: ${error.message}`);
    watcher.close();
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => console.log(`Ready: http://127.0.0.1:${port} (development build from .preview/; dist/ is unchanged)`));
  const close = () => { clearTimeout(debounce); watcher.close(); server.close(); };
  process.once('SIGINT', close);
  process.once('SIGTERM', close);
} catch (error) {
  watcher?.close();
  server?.close();
  console.error(`Dev server failed: ${error.message}`);
  process.exitCode = 1;
}
