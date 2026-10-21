// Conservative duplicate merge. Rows are merged only when they have the SAME words (brand, flavour, variant) and the SAME pack
// (same count, and same unit size when both rows state one). Anything else is left alone and listed for review.
//   node marketing-tools/merge_duplicates.js            -> preview only (writes marketing-tools/merge_report.txt)
//   node marketing-tools/merge_duplicates.js --apply    -> writes src/App.jsx
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
const APPLY = process.argv.includes('--apply');
const text = fs.readFileSync(ROOT + 'src/App.jsx', 'utf8');
const sp = text.match(/const sp = \(base,\[c,m,ms2,w,i,a=0\]\) => \(\{[\s\S]*?\}\);/);
const st = text.indexOf('const BASE_PRODUCTS = ['), en = text.indexOf('\n];', st);
const P = new Function(sp[0] + '\n' + text.slice(st, en + 3) + '\nreturn BASE_PRODUCTS;')();
const lines = text.split('\n');
const idLine = new Map(); lines.forEach((l, i) => { const m = l.match(/^\s*\{id:(\d+)/); if (m) idLine.set(+m[1], i); });
const S = ['coop', 'morrisons', 'ms', 'waitrose', 'iceland', 'alliance'];
const IDX = Object.fromEntries(S.map((s, i) => [s, i]));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dval = d => { if (!d) return -1; const m = String(d).match(/^(\d+)\s+(\w+)/); if (!m) return -1; return MONTHS.indexOf(m[2].slice(0, 3)) * 40 + (+m[1]); };

// ---------- signature: words + pack ----------
const BASE = { kg: ['g', 1000], g: ['g', 1], l: ['ml', 1000], ltr: ['ml', 1000], ml: ['ml', 1], cl: ['ml', 10] };
const STOP = new Set(['the', 'of', 'and', 'each', 'pack', 'pk', 'x', 'cans', 'can', 'bottle', 'bottles', 'multipack', 'ea', 's', 'size', 'per', 'for', 'with', 'in']);
function norm(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[®™©]/g, '').replace(/&/g, ' and ').replace(/[’']/g, '')
    .replace(/(\d)\s*%/g, '$1pc ').replace(/(\d)\s*(litres?|liters?|lt)\b/g, '$1l').replace(/(\d)\s+(kg|g|ml|l|cl|ltr)\b/g, '$1$2').replace(/[^a-z0-9. ]/g, ' ');
}
function signature(name) {
  let s = norm(name), count = 1, unit = null, hasSize = false;
  let m;
  if ((m = s.match(/(\d+)\s*x\s*(\d+(?:\.\d+)?)(kg|g|ml|l|ltr|cl)\b/))) { count = +m[1]; const [u, k] = BASE[m[3]]; unit = Math.round(+m[2] * k) + u; hasSize = true; s = s.replace(m[0], ' '); }
  else {
    const q = [...s.matchAll(/(\d+(?:\.\d+)?)(kg|g|ml|l|ltr|cl)\b/g)];
    if (q.length) { const x = q[0]; const [u, k] = BASE[x[2]]; unit = Math.round(+x[1] * k) + u; hasSize = true; q.forEach(z => { s = s.replace(z[0], ' '); }); }
    const c = s.match(/\b(\d+)\s*(cans|pk|pack|packs|bottles|rolls|slices|eggs|tablets|capsules|pods|bars|sachets|each|ea|s)\b/);
    if (c) { count = +c[1]; hasSize = true; s = s.replace(c[0], ' '); }
  }
  const words = s.split(/\s+/).filter(w => w && !STOP.has(w));
  return { key: words.sort().join(' '), nWords: words.length, count, unit, hasSize };
}
const compat = (a, b) => a.count === b.count && (a.unit === null || b.unit === null || a.unit === b.unit);

const rows = P.map(p => ({ p, sig: signature(p.name) }));
const byKey = new Map();
rows.forEach(r => { if (!r.sig.hasSize || r.sig.nWords < 2) return; (byKey.get(r.sig.key) || byKey.set(r.sig.key, []).get(r.sig.key)).push(r); });

// ---------- clusters ----------
const clusters = [];
for (const [key, list] of byKey) {
  if (list.length < 2) continue;
  const parent = list.map((_, i) => i); const find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) if (compat(list[i].sig, list[j].sig)) parent[find(i)] = find(j);
  const g = new Map(); list.forEach((r, i) => { const k = find(i); (g.get(k) || g.set(k, []).get(k)).push(r); });
  for (const members of g.values()) if (members.length >= 2) clusters.push(members);
}

const stores = p => S.filter(s => p.prices[s] > 0);
const dateFor = (p, s) => (p.upds ? p.upds[s] : p.upd) || null;
const plan = [], review = [];
for (const members of clusters) {
  const ps = members.map(m => m.p);
  if (ps.length > 4) { review.push({ why: 'more than 4 rows', ps }); continue; }
  // price disagreement check
  let bad = null;
  for (const s of S) { const v = ps.filter(p => p.prices[s] > 0).map(p => p.prices[s]); if (v.length > 1 && Math.max(...v) / Math.min(...v) > 1.35) bad = s; }
  if (bad) { review.push({ why: 'prices differ by more than 35% at ' + bad, ps }); continue; }
  // choose the row to keep
  const score = p => stores(p).length * 1e6 + (signature(p.name).hasSize ? 1e5 : 0) + dval(p.upd) * 10 + (p.id > 1e5 ? 0 : 0) + p.id / 1e5;
  const keep = ps.slice().sort((a, b) => score(b) - score(a))[0];
  const final = {}; let changed = false, overlaps = 0;
  for (const s of S) {
    const cand = ps.filter(p => p.prices[s] > 0);
    if (!cand.length) continue;
    if (cand.length > 1) overlaps++;
    cand.sort((a, b) => (dval(dateFor(b, s)) - dval(dateFor(a, s))) || ((b === keep) - (a === keep)) || (b.id - a.id));
    const src = cand[0];
    final[s] = { price: src.prices[s], date: dateFor(src, s), oos: Array.isArray(src.oos) && src.oos.includes(s), from: src };
    if (src !== keep) changed = true;
  }
  plan.push({ keep, drop: ps.filter(p => p !== keep), final, overlaps, changed });
}

// ---------- apply to line text ----------
function setStore(l, store, price) {
  const spm = l.match(/prices:sp\(([\d.]+),\[([^\]]*)\]\)/);
  if (spm) { const base = parseFloat(spm[1]); const arr = spm[2].split(',').map(x => x.trim()); while (arr.length < 6) arr.push('0'); arr[IDX[store]] = (+(price - base).toFixed(2)).toString(); return l.replace(spm[0], `prices:sp(${spm[1]},[${arr.join(',')}])`); }
  const re = new RegExp(store + ':[\\d.]+'); if (!re.test(l)) throw new Error('format ' + l.slice(0, 90)); return l.replace(re, `${store}:${price}`);
}
function rewrite(item) {
  const { keep, drop, final } = item;
  let l = lines[idLine.get(keep.id)];
  const m = l.match(/^(\s*\{.*\})(,?)(\s*\/\/.*)?$/); if (!m) throw new Error('shape ' + l.slice(0, 80));
  let obj = m[1], comma = m[2], com = m[3] || '';
  for (const s of S) { if (final[s]) { if (keep.prices[s] !== final[s].price) obj = setStore(obj, s, final[s].price); } }
  obj = obj.replace(/,\s*upds:\{[^}]*\}/, '').replace(/,\s*upd:"[^"]*"/, '').replace(/,\s*oos:\[[^\]]*\]/, '');
  const dates = {}; S.forEach(s => { if (final[s] && final[s].date) dates[s] = final[s].date; });
  const ds = [...new Set(Object.values(dates))];
  const priced = S.filter(s => final[s]);
  let tail = '';
  if (ds.length) {
    if (ds.length === 1 && Object.keys(dates).length === priced.length) tail += `, upd:"${ds[0]}"`;
    else { const latest = ds.slice().sort((a, b) => dval(b) - dval(a))[0]; tail += `, upd:"${latest}", upds:{${S.filter(s => dates[s]).map(s => `${s}:"${dates[s]}"`).join(',')}}`; }
  }
  const oos = S.filter(s => final[s] && final[s].oos);
  if (oos.length) tail += `, oos:[${oos.map(s => `"${s}"`).join(',')}]`;
  obj = obj.replace(/\}$/, tail + '}');
  const note = `merged duplicate rows ${drop.map(d => d.id).join(', ')}`;
  com = com ? com.replace(/\s*$/, '') + ' | ' + note : ' // ' + note;
  return obj + comma + com;
}

// ---------- report ----------
const out = [];
const withMoves = plan.filter(x => x.changed || x.drop.length);
out.push(`clusters of same-product rows: ${clusters.length}`);
out.push(`  will merge: ${plan.length} (rows removed: ${plan.reduce((s, x) => s + x.drop.length, 0)}) | left for review: ${review.length}`);
out.push(`  of the merges, ${plan.filter(x => x.overlaps === 0).length} only combine different stores (no conflict), ${plan.filter(x => x.overlaps > 0).length} had two rows with a price at the same store (newest kept)`);
out.push('');
out.push('=== SAMPLE MERGES ===');
const f = p => S.map(k => (p.prices[k] || 0).toFixed(2)).join('/');
plan.slice(0, +(process.env.SAMPLE || 40)).forEach(x => {
  out.push(`KEEP ${x.keep.id} ${x.keep.name.slice(0, 60)}  ${f(x.keep)}`);
  x.drop.forEach(d => out.push(`  drop ${d.id} ${d.name.slice(0, 60)}  ${f(d)}`));
  out.push('  -> ' + S.map(s => (x.final[s] ? x.final[s].price.toFixed(2) : '0.00')).join('/'));
});
out.push('');
out.push('=== LEFT FOR REVIEW (first 30) ===');
review.slice(0, 30).forEach(r => { out.push(r.why); r.ps.forEach(p => out.push(`   ${p.id} ${p.name.slice(0, 60)}  ${f(p)}`)); });
fs.writeFileSync(path.join(__dirname, 'merge_report.txt'), out.join('\n'), 'utf8');
console.log(out.slice(0, 4).join('\n'));

if (APPLY) {
  const newLines = new Map(); const dropIds = new Set();
  plan.forEach(x => { newLines.set(idLine.get(x.keep.id), rewrite(x)); x.drop.forEach(d => dropIds.add(idLine.get(d.id))); });
  const result = [];
  lines.forEach((l, i) => { if (dropIds.has(i)) return; result.push(newLines.has(i) ? newLines.get(i) : l); });
  fs.writeFileSync(ROOT + 'src/App.jsx', result.join('\n'), 'utf8');
  console.log('written; rows removed:', dropIds.size);
}
