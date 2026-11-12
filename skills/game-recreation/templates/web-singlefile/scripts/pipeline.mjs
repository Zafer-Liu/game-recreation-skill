// MIT — see ../LICENSE.build-tools. Build modules into one classic-script HTML.
import { build, transform } from 'esbuild';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const htmlEscape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function replaceOnce(source, marker, value) {
  if (source.split(marker).length !== 2) throw new Error(`Expected exactly one template marker: ${marker}`);
  return source.replace(marker, () => value);
}

async function nearestPackage(file) {
  let current = dirname(file);
  for (;;) {
    try {
      const text = await readFile(join(current, 'package.json'), 'utf8');
      return { directory: current, manifest: JSON.parse(text) };
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

async function collectLicenses(root, metadata) {
  const own = await readFile(join(root, 'LICENSE.build-tools'), 'utf8');
  const chunks = [`BUILD TOOLS\n${own}`];
  const packages = new Map();
  for (const input of Object.keys(metadata.inputs)) {
    const pkg = await nearestPackage(resolve(root, input));
    if (!pkg) throw new Error(`Cannot identify license owner for input: ${input}`);
    if (pkg.directory !== root) packages.set(pkg.directory, pkg.manifest);
  }
  const names = [];
  for (const [directory, manifest] of packages) {
    const identity = `${manifest.name || 'unnamed'}@${manifest.version || 'unknown'}`;
    if (typeof manifest.license !== 'string' || !manifest.license.trim()) {
      throw new Error(`Missing package license metadata: ${identity}. Review notices before distribution.`);
    }
    const files = (await readdir(directory, { withFileTypes: true }))
      .filter((item) => item.isFile() && /^(?:licen[sc]e|copying|notice)(?:[.-].*)?$/i.test(item.name))
      .map((item) => item.name).sort();
    if (!files.length) throw new Error(`No root license/notice found for ${identity}. Manual review required.`);
    const texts = await Promise.all(files.map((file) => readFile(join(directory, file), 'utf8')));
    names.push(identity);
    chunks.push(`${identity} (${manifest.license})\n${texts.join('\n\n')}`);
  }
  return { text: chunks.join('\n\n-----\n\n'), packages: names.sort() };
}

export async function buildGame(root, { production = true } = {}) {
  // 开发监听与生产交付使用不同目录，防止并发重建覆盖已验收的包和报告。
  const outputDirectory = production ? 'dist' : '.preview';
  const result = await build({
    absWorkingDir: root,
    entryPoints: ['src/main.js'],
    outfile: join(outputDirectory, 'bundle.js'),
    bundle: true,
    write: false,
    metafile: true,
    minify: production,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    legalComments: 'inline',
    define: { __DEV__: production ? 'false' : 'true' },
    plugins: [{
      name: 'single-css-entry',
      setup(builder) {
        builder.onResolve({ filter: /\.css(?:\?.*)?$/i }, () => ({
          errors: [{ text: 'Write CSS in src/style.css; JS CSS imports are not supported by this single-file template.' }],
        }));
      },
    }],
    logLevel: 'warning',
  });
  if (result.outputFiles.length !== 1 || !result.outputFiles[0].path.endsWith('.js')) {
    throw new Error('Expected one JS output. Extra assets require an explicit inline strategy.');
  }
  for (const output of Object.values(result.metafile.outputs)) {
    if (output.imports.some((item) => item.external)) throw new Error('Externalized imports are not allowed.');
  }

  const sourceCss = await readFile(join(root, 'src/style.css'), 'utf8');
  if (/@import\b|url\s*\(/i.test(sourceCss)) {
    throw new Error('CSS @import/url() requires an explicit offline asset strategy; this template rejects it.');
  }
  const cssResult = await transform(sourceCss, { loader: 'css', minify: production, legalComments: 'inline' });
  if (/<\/style/i.test(cssResult.code)) throw new Error('Unsafe closing style tag in CSS output.');
  const js = result.outputFiles[0].text.replace(/<\/script/gi, (match) => '<\\/' + match.slice(2));
  const licenses = await collectLicenses(root, result.metafile);
  const licenseMarkup = `<pre id="third-party-licenses" hidden>${htmlEscape(licenses.text)}</pre>`;

  let html = await readFile(join(root, 'src/template.html'), 'utf8');
  html = replaceOnce(html, '/*__GAME_CSS__*/', cssResult.code);
  html = replaceOnce(html, '//__GAME_JS__', js);
  html = replaceOnce(html, '<!--__GAME_LICENSES__-->', licenseMarkup);
  html = html.replace(/\r\n?/g, '\n');

  const htmlBytes = Buffer.byteLength(html, 'utf8');
  const gzipBytes = gzipSync(Buffer.from(html), { level: 9 }).length;
  const report = {
    mode: production ? 'production' : 'development',
    outputDirectory,
    htmlSha256: createHash('sha256').update(html, 'utf8').digest('hex'),
    htmlBytes, gzipBytes,
    cssBytes: Buffer.byteLength(cssResult.code, 'utf8'),
    jsBytes: Buffer.byteLength(js, 'utf8'),
    licenseBytes: Buffer.byteLength(licenseMarkup, 'utf8'),
    packages: licenses.packages,
    notes: [
      'gzipBytes is a transfer estimate, not the local HTML file size.',
      'metafile inputs describe bundled modules; bytesInOutput are attribution estimates.',
      'Build success does not prove gameplay, offline runtime or file:// compatibility.',
      'Review package-specific and asset notices in addition to collected root licenses.',
    ],
    metafile: result.metafile,
  };
  const dist = join(root, outputDirectory);
  await mkdir(dist, { recursive: true });
  await writeFile(join(dist, 'index.html'), html, 'utf8');
  await writeFile(join(dist, 'build-report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  await writeFile(join(dist, 'third-party-licenses.txt'), licenses.text.replace(/\r\n?/g, '\n') + '\n', 'utf8');
  return report;
}
