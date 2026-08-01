#!/usr/bin/env node
// Runs after `react-scripts build` (see package.json "postbuild"). Stamps
// build/service-worker.js with a version unique to this deploy and the
// real hashed asset filenames from build/asset-manifest.json, so the SW
// can precache the app shell without hardcoding filenames that change on
// every build, and so its bytes always change on every deploy (which is
// what lets the browser detect an update at all).

const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const manifestPath = path.join(buildDir, 'asset-manifest.json');
const swPath = path.join(buildDir, 'service-worker.js');

if (!fs.existsSync(manifestPath) || !fs.existsSync(swPath)) {
  console.warn('[inject-sw-version] build/asset-manifest.json or service-worker.js missing — skipping');
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const entrypoints = (manifest.entrypoints || []).map(f => '/' + f);

const precacheUrls = Array.from(new Set([
  '/',
  '/index.html',
  '/manifest.json',
  ...entrypoints,
]));

const version = String(Date.now());

let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace('"__SW_VERSION__"', JSON.stringify(version));
sw = sw.replace('__PRECACHE_URLS__', JSON.stringify(precacheUrls));
fs.writeFileSync(swPath, sw);

console.log(`[inject-sw-version] stamped service-worker.js — version ${version}, ${precacheUrls.length} precached URLs`);
