#!/usr/bin/env node
// Copy a gameplay-free web shell and specs. No install, build, Git or network.
import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const usage = 'Usage: node scaffold.mjs <new-output-dir> <lowercase-project-name>';
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] === '--help') {
  console.log(usage);
  process.exit(args[0] === '--help' ? 0 : 1);
}

let created = false;
let output;
try {
  output = resolve(args[0]);
  const name = args[1];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64) {
    throw new Error('Project name must be 1–64 lowercase letters/digits separated by single hyphens.');
  }
  try {
    await lstat(output);
    throw new Error('Output already exists; refusing to overwrite it.');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const parent = await lstat(dirname(output));
  if (!parent.isDirectory()) throw new Error('Output parent must be an existing directory.');
  const skill = resolve(dirname(fileURLToPath(import.meta.url)), '..');

  const files = [];
  const collect = async (source, relative = '') => {
    for (const item of await readdir(source, { withFileTypes: true })) {
      if (item.isSymbolicLink()) throw new Error('Template symlinks are not allowed.');
      const rel = join(relative, item.name);
      if (item.isDirectory()) await collect(join(source, item.name), rel);
      else if (item.isFile()) {
        const data = await readFile(join(source, item.name));
        const text = new TextDecoder('utf-8', { fatal: true }).decode(data);
        files.push({ relative: rel, text: text.replaceAll('{{PROJECT_NAME}}', name).replace(/\r\n?/g, '\n') });
      }
    }
  };
  // Stage all reads in memory before touching the new output directory.
  await collect(join(skill, 'templates', 'web-singlefile'));
  await collect(join(skill, 'templates', 'specs'), 'docs');
  await mkdir(output);
  created = true;
  for (const file of files) {
    const destination = join(output, file.relative);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, file.text, { encoding: 'utf8', flag: 'wx' });
  }
  console.log(`Created ${files.length} template files in ${output}`);
  console.log('No gameplay, dependencies, build artifacts or Git history were generated.');
  console.log('Fill docs/ first. Run install/build only when authorized.');
} catch (error) {
  if (created) {
    console.error(`Scaffold failed; partial files remain for inspection at ${output}`);
  }
  console.error(error.message);
  process.exitCode = 1;
}
