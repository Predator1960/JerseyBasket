// Laura (catalogue only, no points): Waitrose St Helier 18 Nov 11:59 + Co-op Five Oaks 18 Nov 15:41 (14 and 17 Nov Co-op receipts already done)
const fs = require('fs');
const f = require('path').resolve(__dirname, '..') + '/src/App.jsx';
const text = fs.readFileSync(f, 'utf8');
const spDef = text.match(/const sp = \(base,\[c,m,ms2,w,i,a=0\]\) => \(\{[\s\S]*?\}\);/)[0];
const lines = text.split('\n');
const S = ['coop', 'morrisons', 'ms', 'waitrose', 'iceland', 'alliance'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dval = d => { const m = String(d || '').match(/^(\d+)\s+(\w+)/); return m ? MON.indexOf(m[2].slice(0, 3)) * 40 + +m[1] : -1; };
const find = id => lines.findIndex(l => new RegExp('^\\s*\\{id:' + id + '[,\\s]').test(l));
const evalRow = l => new Function(spDef + '\nreturn ' + l.replace(/^\s*/, '').replace(/\}\s*,?\s*(\/\/.*)?$/, '}') + ';')();
const ser = v => Array.isArray(v) ? '[' + v.map(ser).join(',') + ']' : (v && typeof v === 'object') ? '{' + Object.keys(v).map(k => k + ':' + ser(v[k])).join(',') + '}' : JSON.stringify(v);
const rowText = o => '  {' + Object.keys(o).map(k => k + ':' + (k === 'prices' ? '{' + S.map(s => s + ':' + (+(o.prices[s] || 0).toFixed(2))).join(',') + '}' : ser(o[k]))).join(', ') + '}';
const commentOf = l => { const m = l.match(/\}\s*,?\s*(\/\/.*)$/); return m ? m[1] : ''; };
function rewrite(id, mutate, note) {
  const i = find(id); if (i < 0) throw new Error('missing row ' + id);
  const old = lines[i], o = evalRow(old);
  mutate(o);
  const ordered = {}; ['id', 'name', 'cat', 'icon', 'prices', 'upd', 'upds', 'oos'].forEach(k => { if (o[k] !== undefined) ordered[k] = o[k]; });
  Object.keys(o).forEach(k => { if (ordered[k] === undefined) ordered[k] = o[k]; });
  const c = commentOf(old);
  lines[i] = rowText(ordered) + ', ' + (c ? c + ' | ' + note : '// ' + note);
}
function setPrice(id, store, price, date, note) {
  rewrite(id, o => {
    const others = S.filter(s => s !== store && (o.prices[s] || 0) > 0);
    if (!o.upds && others.length && o.upd) { o.upds = {}; others.forEach(s => { o.upds[s] = o.upd; }); }
    else if (!o.upds && others.length) o.upds = {};
    o.prices[store] = price;
    if (o.upds) { o.upds[store] = date; o.upd = Object.values(o.upds).reduce((a, b) => (dval(b) > dval(a) ? b : a)); } else o.upd = date;
  }, note);
}
const addNote = (id, note) => rewrite(id, () => {}, note);
const WR = 'Waitrose branch: St Helier 334 (Laura receipt 18 Nov 11:59)', CP = 'Co-op branch: Five Oaks (Laura receipt 18 Nov 15:41)';
setPrice(8120, 'waitrose', 1.79, '18 Nov', WR + ': SULA MINT HUMBUGS 2 x 1.79');
setPrice(2579, 'waitrose', 2.30, '18 Nov', WR + ': WR ESS SALTED BUTTER 2.30');
setPrice(14158, 'waitrose', 1.45, '18 Nov', WR + ': WR ESS GB ROAST HAM 1.45');
setPrice(14362, 'waitrose', 4.00, '18 Nov', WR + ': TUNA MAYO SWEETCORN 4.00');
setPrice(7399, 'waitrose', 2.15, '18 Nov', WR + ': NO1 TCHOC MUFFIN 2.15 (was 1.85)');
addNote(11036, CP + ': Coca Cola Zero Sugar 2.89 again (third time at 2.89: 24 Oct, 2 Nov, 18 Nov); may now be the regular price, check next shelf visit');
const NEWROWS = [
  ['Waitrose Mini Panettone (as printed WR FF MINI PANETTONE, size not confirmed)', '🍰 Cakes & Desserts', '🎄', 4.01, 'WR FF MINI PANETTONE 4.01 (given free with myWaitrose, shelf price kept)'],
  ['Corsodyl Toothpaste (size not confirmed)', '💊 Health & Beauty', '🪥', 4.18, 'CORSODYL TOOTHPASTE 4.18'],
  ["Tony's Chocolonely Caramel Sea Salt (as printed TONYS CARA SALT, size not confirmed)", '🥨 Snacks & Treats', '🍫', 1.75, 'TONYS CARA SALT 1.75'],
];
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let id = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, price, note]) => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + price + ',iceland:0,alliance:0}, upd:"18 Nov"}, // ' + WR + ': ' + note); console.log(id, note); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
