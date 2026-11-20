// Katrina B Morrisons Daily St Ouen, 20 Nov 15:56 (8 grocery lines; 2 x UK postage stamps not counted; bacon deal -2.35 not stored)
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
const D = '20 Nov', MO = 'Morrisons branch: Daily St Ouen (Katrina B receipt 20 Nov 15:56)';
const m = (id, p, t) => setPrice(id, 'morrisons', p, D, MO + ': ' + t);
m(15881, 10.40, 'MORRISONS GAMMON JOINT SMOKED 10.40 (size not printed)');
m(1260, 1.97, 'WARBURTONS SOFT PITTAS WHITE 1.97');
m(1290, 3.60, 'SCHAR CIABATTA ROLLS WHITE 3.60 (200g assumed)');
m(4075, 2.50, 'SCHWARTZ TURMERIC 2.50 (37g assumed)');
const NEWROWS = [
  ['Morrisons Smoked Extra Thick Bacon (as printed MORRISONS BACON SMOKED EXTRA T, size not confirmed)', '🥩 Meat & Fish', '🥓', 3.00, 'MORRISONS BACON SMOKED EXTRA T 2 x 3.00 (bacon deal -2.35 not stored)'],
  ['Cofresh Spicy Green Peas (as printed COFRESH GREEN PEAS SPICY W/PEA, size not confirmed)', '🥨 Snacks & Treats', '🫛', 2.50, 'COFRESH GREEN PEAS SPICY W/PEA 2.50'],
  ['Morrisons Free From Meat Gravy (size not confirmed)', '🍝 Pantry', '🥫', 2.16, 'MORRISONS FREE FROM MEAT GRAVY 2.16'],
  ['Morrisons Dry Shampoo Tropical (size not confirmed)', '💊 Health & Beauty', '🧴', 2.45, 'MORRISONS DRY SHAMPOO TROPICAL 2.45'],
];
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let id = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, price, note]) => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{coop:0,morrisons:' + price + ',ms:0,waitrose:0,iceland:0,alliance:0}, upd:"' + D + '"}, // ' + MO + ': ' + note); console.log(id, note); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
