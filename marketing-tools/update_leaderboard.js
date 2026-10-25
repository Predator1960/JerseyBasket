// Builds public/leaderboard.json from a CSV of CHECKED receipts.
//   node marketing-tools/update_leaderboard.js entries.csv [--exclude "Alias1,Alias2"]
// CSV columns (header row required): alias,store,verified_prices,referred_by
//   - one row per checked receipt; verified_prices = how many correct prices you accepted from it
//   - store: Co-op, Iceland, Alliance, Morrisons, Waitrose or M&S (any spelling that contains the name)
//   - referred_by: the alias the entrant wrote under "who told you" (leave blank if none)
// Points: 1 per verified price, 2 per price at Morrisons / Waitrose / M&S, +5 to the referrer once per referred entrant.
// Ineligible people (organiser's family) go in --exclude: they are left off the board and out of the draw.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const csvPath = args.find(a => !a.startsWith('--'));
const exIdx = args.indexOf('--exclude');
const excluded = new Set((exIdx >= 0 ? args[exIdx + 1] : '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
if (!csvPath) { console.error('usage: node marketing-tools/update_leaderboard.js entries.csv [--exclude "Alias1,Alias2"]'); process.exit(1); }

const DOUBLE = ['morrisons', 'waitrose', 'ms'];
const storeId = s => { s = String(s || '').toLowerCase(); if (/morrison/.test(s)) return 'morrisons'; if (/waitrose/.test(s)) return 'waitrose'; if (/m&s|m & s|marks|^ms$/.test(s)) return 'ms'; if (/co-?op/.test(s)) return 'coop'; if (/iceland/.test(s)) return 'iceland'; if (/alliance/.test(s)) return 'alliance'; return ''; };
const parseCsv = txt => txt.replace(/\r/g, '').split('\n').filter(l => l.trim()).map(l => { const out = []; let cur = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === ',' && !q) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map(x => x.trim()); });
const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
const head = rows.shift().map(h => h.toLowerCase());
const col = n => head.indexOf(n);
if (['alias', 'store', 'verified_prices'].some(c => col(c) < 0)) { console.error('CSV needs columns: alias,store,verified_prices,referred_by'); process.exit(1); }

const people = new Map();   // lower alias -> { name, points, prices, referredBy }
const storeTotals = {};
let skipped = 0;
for (const r of rows) {
  const name = r[col('alias')]; const n = parseInt(r[col('verified_prices')], 10) || 0; const id = storeId(r[col('store')]);
  if (!name || n <= 0) { skipped++; continue; }
  if (!id) console.warn('Unknown store, scored at 1x:', r.join(' | '));
  const key = name.toLowerCase();
  const p = people.get(key) || { name, points: 0, prices: 0, referredBy: '' };
  p.points += n * (DOUBLE.includes(id) ? 2 : 1); p.prices += n;
  const ref = col('referred_by') >= 0 ? r[col('referred_by')] : '';
  if (ref && !p.referredBy) p.referredBy = ref;
  people.set(key, p);
  if (id) storeTotals[id] = (storeTotals[id] || 0) + n;
}
// referral bonus: +5 to the referrer once per referred entrant who has a checked receipt
for (const p of people.values()) {
  if (!p.referredBy) continue;
  const ref = people.get(p.referredBy.toLowerCase());
  if (ref && ref !== p) ref.points += 5; else console.warn(`Referral "${p.referredBy}" (from ${p.name}) not matched to an entrant with a checked receipt; no bonus given`);
}
const entries = [...people.values()].filter(p => !excluded.has(p.name.toLowerCase())).sort((a, b) => b.points - a.points).map(p => ({ name: p.name, points: p.points }));

const jsonPath = path.join(ROOT, 'public', 'leaderboard.json');
const old = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, 'utf8')) : {};
const stores = { ...(old.stores || {}) };
['morrisons', 'waitrose', 'ms'].forEach(id => { stores[id] = { goal: (stores[id] && stores[id].goal) || 100, prices: storeTotals[id] || 0 }; });
const out = { competition: 'nov2026', updated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), entries, stores, winners: old.winners || { first: '', second: '', third: '' } };
fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`leaderboard.json written: ${entries.length} on the board, ${skipped} rows skipped, store totals`, storeTotals);
console.log('Top 5:', entries.slice(0, 5).map(e => `${e.name} ${e.points}`).join(' | ') || '(none)');
