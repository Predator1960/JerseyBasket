// Random draw for 3rd prize among everyone with at least one checked receipt, excluding the top two scorers and ineligible people.
//   node marketing-tools/draw_third_prize.js entries.csv [--exclude "Alias1,Alias2"]
// Use the same entries.csv you gave update_leaderboard.js. The pool, time and result are printed so you can screenshot or film them.
const fs = require('fs');
const crypto = require('crypto');
const args = process.argv.slice(2);
const csvPath = args.find(a => !a.startsWith('--'));
const exIdx = args.indexOf('--exclude');
const excluded = new Set((exIdx >= 0 ? args[exIdx + 1] : '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
if (!csvPath) { console.error('usage: node marketing-tools/draw_third_prize.js entries.csv [--exclude "Alias1,Alias2"]'); process.exit(1); }
const board = JSON.parse(fs.readFileSync(require('path').resolve(__dirname, '..', 'public', 'leaderboard.json'), 'utf8')).entries || [];
const topTwo = new Set(board.slice(0, 2).map(e => e.name.toLowerCase()));
const lines = fs.readFileSync(csvPath, 'utf8').replace(/\r/g, '').split('\n').filter(l => l.trim());
const head = lines.shift().split(',').map(h => h.trim().toLowerCase());
const ai = head.indexOf('alias'), vi = head.indexOf('verified_prices');
const pool = new Map();
for (const l of lines) { const c = l.split(','); const name = (c[ai] || '').trim(); if (!name || !(parseInt(c[vi], 10) > 0)) continue; const k = name.toLowerCase(); if (excluded.has(k) || topTwo.has(k)) continue; if (!pool.has(k)) pool.set(k, name); }
const names = [...pool.values()].sort((a, b) => a.localeCompare(b));
if (!names.length) { console.error('Nobody left in the draw pool.'); process.exit(1); }
console.log('3RD PRIZE DRAW  ', new Date().toString());
console.log('1st and 2nd (not in the draw):', board.slice(0, 2).map(e => e.name).join(', ') || '(leaderboard empty)');
console.log(`In the draw (${names.length}):`, names.join(', '));
const winner = names[crypto.randomInt(names.length)];
console.log('\nWINNER:', winner);
