// Report likely duplicate products: rows that look like the same item (same words, compatible pack numbers).
//   node marketing-tools/find_duplicates.js [--all]   (default: only groups where 2+ rows carry a Co-op price)
const fs = require('fs');
const src = fs.readFileSync(require('path').resolve(__dirname, '..') + '/src/App.jsx', 'utf8');
const sp = src.match(/const sp = \(base,\[c,m,ms2,w,i,a=0\]\) => \(\{[\s\S]*?\}\);/);
const st = src.indexOf('const BASE_PRODUCTS = ['); const en = src.indexOf('\n];', st);
const P = new Function(sp[0] + '\n' + src.slice(st, en + 3) + '\nreturn BASE_PRODUCTS;')();
const S = ['coop', 'morrisons', 'ms', 'waitrose', 'iceland', 'alliance'];
const f = p => S.map(k => (p.prices[k] || 0).toFixed(2)).join('/');
const STOP = new Set(['the', 'of', 'and', 'each', 'pack', 'pk', 'x', 'cans', 'can', 'bottle', 'bottles', 'multipack', 'original', 'taste', 's', 'e', 'ea', 'box']);
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[®™©]/g, '').replace(/&/g, ' and ').replace(/[’']/g, '')
  .replace(/(\d)\s*(litres?|liters?|ltr|lt)\b/g, '$1l').replace(/(\d)\s+(g|kg|ml|l|cl)\b/g, '$1$2').replace(/[^a-z0-9. ]/g, ' ');
function sig(name) {
  const t = norm(name).split(/\s+/).filter(Boolean);
  const words = t.filter(w => !/\d/.test(w) && !STOP.has(w));
  const nums = t.filter(w => /\d/.test(w)).map(w => w.replace(/(g|kg|ml|l|cl|s|pk|pack|each|ltr)$/, ''));
  return { key: words.sort().join(' '), nums: [...new Set(nums)] };
}
const groups = new Map();
P.forEach(p => { const s = sig(p.name); if (s.key.split(' ').length < 2) return; (groups.get(s.key) || groups.set(s.key, []).get(s.key)).push({ p, nums: s.nums }); });
const out = [];
for (const [k, v] of groups) {
  if (v.length < 2) continue;
  const rows = new Set();
  for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) {
    const a = v[i], b = v[j];
    if (a.nums.some(n => b.nums.includes(n)) || !a.nums.length || !b.nums.length) { rows.add(a.p); rows.add(b.p); }
  }
  if (rows.size) out.push({ k, rows: [...rows] });
}
const all = process.argv.includes('--all');
const shown = out.filter(g => all || g.rows.filter(p => p.prices.coop > 0).length >= 2);
console.log('likely duplicate groups in the whole catalogue:', out.length, '| rows involved:', out.reduce((s, g) => s + g.rows.length, 0));
console.log(all ? 'all groups:' : 'groups where 2+ rows both carry a Co-op price:', shown.length);
shown.slice(0, +(process.env.LIMIT || 30)).forEach(g => { console.log('  [' + g.k.slice(0, 56) + ']'); g.rows.slice(0, 4).forEach(p => console.log('     ', String(p.id).padEnd(6), p.name.slice(0, 58).padEnd(59), f(p), '|', p.upd || '-')); });
