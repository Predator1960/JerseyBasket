// One-off (12 Oct 2026): give items per-store "last checked" dates (upds) so a date is only shown for a store
// whose price was really checked. Items whose single date (upd) was stamped by an import that only verified
// SOME of their stores get upds = {store: date}. Stores with no verified date show "Estimated price".
//   node coop-refresh/per_store_dates.js <baseline App.jsx> [--apply]
// <baseline> = App.jsx from just before the 9-11 Oct imports (git show 95af3475:src/App.jsx).
const fs = require('fs');
const ROOT = require('path').resolve(__dirname, '..') + '/';
const APPLY = process.argv.includes('--apply');
const baselinePath = process.argv[2];
const STORES = ['coop', 'morrisons', 'ms', 'waitrose', 'iceland', 'alliance'];
const STAMPS = new Set(['9 Oct', '10 Oct', '11 Oct']);

function load(text) {
  const spMatch = text.match(/const sp = \(base,\[c,m,ms2,w,i,a=0\]\) => \(\{[\s\S]*?\}\);/);
  const start = text.indexOf('const BASE_PRODUCTS = ['), endRel = text.indexOf('\n];', start);
  return new Function(`${spMatch[0]}\n${text.slice(start, endRel + 3)}\nreturn BASE_PRODUCTS;`)();
}
const curText = fs.readFileSync(ROOT + 'src/App.jsx', 'utf8');
const P = load(curText);
const B = new Map(load(fs.readFileSync(baselinePath, 'utf8')).map(p => [p.id, p]));

// ---- same name matching as the import scripts ----
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[®™©]/g, '').replace(/(\d)\s*(litres?|liters?|ltr)\b/g, '$1l').replace(/&/g, ' and ').replace(/[’']/g, '').replace(/(\d)\s+(g|kg|ml|l|gr)\b/g, '$1$2').replace(/(\d)gr\b/g, '$1g').replace(/[^a-z0-9. ]/g, ' ');
const toks = s => norm(s).split(/\s+/).filter(t => t && !['the', 'of'].includes(t));
const key = a => a.slice().sort().join(' ');
const SIZE = /^\d+(\.\d+)?(g|kg|ml|l|ltr|pack|pk)$|^\d+x\d+(\.\d+)?(g|ml|pack)?$/;
const hasSize = t => t.some(x => SIZE.test(x));
function catKeys(name) {
  const t = toks(name); const ks = [key(t)]; const last = t[t.length - 1];
  if (t.length > 2 && ((SIZE.test(last) && t.slice(0, -1).some(x => SIZE.test(x))) || /^\d*(s|each|pk)$/.test(last))) ks.push(key(t.slice(0, -1)));
  return ks;
}
const catIndex = new Map();
P.forEach(p => catKeys(p.name).forEach(k => { const a = catIndex.get(k) || []; if (!a.includes(p)) a.push(p); catIndex.set(k, a); }));
const coopFeed = JSON.parse(fs.readFileSync(ROOT + 'coop-all.json', 'utf8'));
const iceFeed = JSON.parse(fs.readFileSync(ROOT + 'iceland-all.json', 'utf8'));
const SKIP_COOP = /^(Tobacco & Lottery)/;
const verified = new Map(); // id -> Set(stores)
const mark = (id, s) => { if (!verified.has(id)) verified.set(id, new Set()); verified.get(id).add(s); };
for (const f of coopFeed) {
  if (SKIP_COOP.test(((f.categories || {}).lvl1 || [])[0] || '')) continue;
  const ks = [key(toks(f.description))]; const t = toks(f.description);
  if (!hasSize(t) && f.actual_size) ks.push(key([...t, ...toks(String(f.actual_size))]));
  for (const k of ks) for (const p of (catIndex.get(k) || [])) mark(p.id, 'coop');
}
[5497, 5525].forEach(id => mark(id, 'coop')); // hand-matched Cadbury cocoa
for (const f of iceFeed) for (const p of (catIndex.get(key(toks(f.name))) || [])) mark(p.id, 'iceland');
// hand-checked in the Weekly Essentials pass (coop-refresh/essentials_apply.js)
const ess = fs.readFileSync(ROOT + 'coop-refresh/essentials_apply.js', 'utf8');
for (const m of ess.matchAll(/\[(\d+), '(coop|iceland)', [\d.]+, /g)) mark(+m[1], m[2]);
// receipts
[[206, 'ms'], [208, 'ms'], [9678, 'ms'], [7511, 'waitrose'], [7562, 'waitrose']].forEach(([id, s]) => mark(id, s));

const lines = curText.split('\n');
const idLine = new Map(); lines.forEach((l, i) => { const m = l.match(/^\s*\{id:(\d+)/); if (m) idLine.set(+m[1], i); });
let changed = 0, fix = 0; const examples = [];
for (const p of P) {
  if (!STAMPS.has(p.upd)) continue;
  const b = B.get(p.id);
  if (b && b.upd === p.upd) continue; // not stamped this session
  changed++;
  const priced = STORES.filter(s => (p.prices[s] || 0) > 0);
  const V = verified.get(p.id) || new Set();
  const un = priced.filter(s => !V.has(s));
  if (!un.length) continue;
  const upds = {};
  priced.forEach(s => { if (V.has(s)) upds[s] = p.upd; });
  // stores that were not checked get no date (shown as "Estimated price"): an older single date can't say which store it was for
  const i = idLine.get(p.id); let l = lines[i];
  const txt = Object.entries(upds).map(([k, v]) => `${k}:"${v}"`).join(',');
  l = l.replace(/upd:"([^"]*)"/, `upd:"$1", upds:{${txt}}`);
  lines[i] = l; fix++;
  if (examples.length < 12 || [29, 107, 206, 7511].includes(p.id)) examples.push(`${p.id} ${p.name} -> upds {${txt}}   (unverified: ${un.join(',')})`);
}
console.log(`rows stamped this session: ${changed}; rows needing per-store dates: ${fix}`);
examples.forEach(x => console.log('  ' + x));
if (APPLY) { fs.writeFileSync(ROOT + 'src/App.jsx', lines.join('\n'), 'utf8'); console.log('written'); } else console.log('(dry run)');
