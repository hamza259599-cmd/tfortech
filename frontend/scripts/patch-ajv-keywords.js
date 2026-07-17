#!/usr/bin/env node
'use strict';
/**
 * fork-ts-checker-webpack-plugin bundles an old schema-utils that calls
 * ajv-keywords requesting ALL keywords unfiltered, including format
 * keywords (formatMinimum/formatMaximum/etc) that were removed from
 * ajv-keywords@5 (the ajv8-compatible version this project needs
 * everywhere else). That causes ajv-keywords' get() to throw
 * "Unknown keyword" and crash the whole build.
 *
 * This project has zero TypeScript files, so fork-ts-checker's actual
 * type-checking behavior is irrelevant — we only need it to not crash
 * at require/validate time. This patch makes get() return a harmless
 * no-op instead of throwing for any keyword it doesn't recognize.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
let files = [];
try {
  const out = execSync(
    'find node_modules -path "*/ajv-keywords/dist/index.js" 2>/dev/null',
    { cwd: root, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
  );
  files = out.split('\n').map((s) => s.trim()).filter(Boolean);
} catch (e) {
  console.log('[patch-ajv-keywords] find failed:', e.message);
}

const NEEDLE = 'throw new Error("Unknown keyword " + keyword);';
const REPLACEMENT = 'return function () { return true; }; // patched: ignore unknown/removed ajv-keywords';

let patched = 0;
for (const rel of files) {
  const file = path.join(root, rel);
  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch (e) {
    continue;
  }
  if (content.includes(NEEDLE)) {
    fs.writeFileSync(file, content.split(NEEDLE).join(REPLACEMENT));
    patched++;
    console.log('[patch-ajv-keywords] patched', file);
  }
}
console.log(`[patch-ajv-keywords] done. patched ${patched} of ${files.length} found.`);
