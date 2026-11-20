// Jason L Waitrose St Saviour 332, 17 Nov 19:18 (13 lines; sent in app 20 Nov 11:06). Card ...0399 / myWaitrose ...0733 differ from his 19 Nov receipt (any card OK). Lines sum to 31.51 vs 31.50: bleach 0.90 not stored.
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
const D = '17 Nov', WR = 'Waitrose branch: St Saviour 332 (Jason L receipt 17 Nov 19:18)';
const j = (id, p, t) => setPrice(id, 'waitrose', p, D, WR + ': ' + t);
j(16019, 1.22, 'WR BUTTERMILK 2 x 1.22');
j(16022, 4.59, 'WR BRIT RASPBERRIES 4.59');
j(987, 2.32, 'JUS-ROL PUFF SHEET 2.32');
j(15234, 5.98, 'WR FRZ CROISSANTS 5.98 (8 x 440g assumed)');
j(7521, 1.02, 'ESS COURGETTES 1.02 (was 0.60)');
const NEWROWS = [
  ['Leerdammer Lighter (size not confirmed)', '🥛 Dairy & Eggs', '🧀', 2.89, 'LEERDAMMER LIGHTER 2.89'],
  ['Pipers Chorizo Crisps (as printed PIPERS CHORIZO CRISP, size not confirmed)', '🥨 Snacks & Treats', '🥔', 3.06, 'PIPERS CHORIZO CRISP 3.06'],
  ["Waitrose Cooks' Ingredients Basil (as printed WR CI BASIL, size not confirmed)", '🥦 Fruit & Veg', '🌿', 0.87, 'WR CI BASIL 0.87'],
  ['Waitrose Italian Ricotta (size not confirmed)', '🥛 Dairy & Eggs', '🧀', 1.84, 'WR ITALIAN RICOTTA 1.84'],
  ['Waitrose Grana Padano DOP (size not confirmed)', '🥛 Dairy & Eggs', '🧀', 3.80, 'WR GRANA PADANO DOP 3.80'],
];
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let id = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, price, note]) => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + price + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + note); console.log(id, note); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
