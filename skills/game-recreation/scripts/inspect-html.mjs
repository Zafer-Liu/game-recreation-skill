#!/usr/bin/env node
// Read-only heuristic inspection. Never evaluates HTML/JS or writes artifacts.
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

const usage = 'Usage: node inspect-html.mjs <reference.html>';
const args = process.argv.slice(2);
if (args.length !== 1 || args[0] === '--help') {
  console.log(usage);
  process.exit(args[0] === '--help' ? 0 : 1);
}

try {
  const file = resolve(args[0]);
  const info = await stat(file);
  if (!info.isFile()) throw new Error('Input must be a regular file.');
  if (info.size > 64 * 1024 * 1024) throw new Error('Input exceeds the 64 MiB inspection limit.');
  const bytes = await readFile(file);
  const html = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  const byteLength = (s) => Buffer.byteLength(s, 'utf8');
  const blocks = (tag) => [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}\\s*>`, 'gi'))];
  const scripts = blocks('script');
  const styles = blocks('style');
  const attributes = (text) => {
    const attrs = new Map();
    const pattern = /([^\s=<>"'`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    for (const m of text.matchAll(pattern)) attrs.set(m[1].toLowerCase(), m[2] ?? m[3] ?? m[4] ?? '');
    return attrs;
  };
  const inlineScripts = scripts.filter((m) => !attributes(m[1]).has('src'));
  const redact = (value) => {
    const clean = value.replace(/[\u0000-\u001f\u007f]/g, '');
    if (/^data:/i.test(clean)) return '[data URI omitted]';
    if (/^(?:javascript|vbscript):/i.test(clean)) return '[executable URL omitted]';
    // Strip credentials, query and fragment; do not print embedded payloads.
    try {
      const u = new URL(clean, 'https://reference.invalid/');
      const prefix = u.origin === 'https://reference.invalid' ? '' : u.origin;
      return (prefix + u.pathname).slice(0, 180);
    } catch {
      return '[unparsed value omitted]';
    }
  };

  const candidates = [];
  let totalResourceAttributes = 0;
  let srcsetAttributes = 0;
  const tags = /<(script|link|img|audio|video|source|iframe|object|embed|image|use)\b([^>]*)>/gi;
  for (const m of html.matchAll(tags)) {
    const attrs = attributes(m[2]);
    if (attrs.has('srcset')) srcsetAttributes++;
    for (const key of ['src', 'href', 'xlink:href', 'poster', 'data']) {
      if (!attrs.has(key)) continue;
      totalResourceAttributes++;
      if (candidates.length < 40) candidates.push({ tag: m[1].toLowerCase(), attribute: key, value: redact(attrs.get(key)) });
    }
  }
  const js = inlineScripts.map((m) => m[2]).join('\n');
  const signals = {
    fetch: /\bfetch\s*\(/g,
    XMLHttpRequest: /\bXMLHttpRequest\b/g,
    WebSocket: /\bWebSocket\b/g,
    dynamicImport: /\bimport\s*\(/g,
    Worker: /\b(?:SharedWorker|Worker)\s*\(/g,
    audioContexts: /\b(?:AudioContext|webkitAudioContext|OfflineAudioContext)\b/g,
    canvasTextures: /\b(?:CanvasTexture|DataTexture)\b/g,
    instancing: /\b(?:InstancedMesh|InstancedBufferGeometry)\b/g,
    graphicsAPIs: /\b(?:WebGLRenderer|webgl2?|webgpu)\b/gi,
  };
  const signalCounts = Object.fromEntries(Object.entries(signals).map(([key, re]) => [key, [...js.matchAll(re)].length]));
  const title = (html.match(/<title\b[^>]*>([^<]*)<\/title\s*>/i)?.[1] || '').replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, 120);

  console.log(JSON.stringify({
    method: 'Heuristic static text scan; no reference code executed.',
    file, title,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    fileBytes: bytes.length,
    gzipBytes: gzipSync(bytes, { level: 9 }).length,
    scriptBlocks: scripts.length,
    inlineScriptTextBytesEstimate: inlineScripts.reduce((sum, m) => sum + byteLength(m[2]), 0),
    styleBlocks: styles.length,
    styleTextBytesEstimate: styles.reduce((sum, m) => sum + byteLength(m[2]), 0),
    dataUriCandidates: [...html.matchAll(/\bdata:[^\s<>"',]{0,120},/gi)].length,
    totalResourceAttributes, srcsetAttributes,
    resourceCandidates: candidates,
    inlineScriptSignalCounts: signalCounts,
    limits: [
      'Regex scanning can match comments/strings and miss malformed tags, dynamic URLs, CSS resources and imports.',
      'Signals do not prove runtime behavior, author, library version, offline support, FPS, or procedural generation.',
      'Script/style bytes are estimates, not engine/application attribution; gzip is not the local HTML size.',
      'Resource values are capped and redacted; srcset is counted but not parsed.',
    ],
  }, null, 2));
} catch (error) {
  console.error(`Inspection failed: ${error.message}`);
  process.exitCode = 1;
}
