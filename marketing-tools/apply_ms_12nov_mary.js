// M&S School Road, St Clement receipt 12 Nov 16:22 (Mary C, competition entry): 13 lines, total 56.47 (one reduced line BT MS POT SV2 2.22R counted, not stored).
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
const D = '12 Nov', MS = 'M&S branch: School Road, St Clement (Mary C receipt 12 Nov 16:22)';
setPrice(15866, 'ms', 2.10, D, MS + ': SCOT AMB CARR 2.10');
setPrice(7778, 'ms', 2.45, D, MS + ': Nonpareilles 2.45 (assumed capers, matched by name only)');
const NEW = [
 ['M&S Shiraz Wine Pouch (brand and size not confirmed)', '🍷 Wine & Beer', '🍷', 20.00, 'LK SHIRAZ POU 20.00'],
 ['M&S Large Gherkins (size not confirmed)', '🍝 Pantry', '🥒', 3.10, 'LARGE GHERKIN 3.10'],
 ['M&S 6 Iced Mince Pies', '🍞 Bread & Bakery', '🥧', 3.10, '6 ICED MINCE 3.10'],
 ['M&S Deep Filled Steak Pie (size not confirmed)', '🧊 Frozen', '🥧', 6.80, 'Deep filed st 6.80'],
 ['M&S Golden Yolk Free Range Eggs (size not confirmed)', '🥛 Dairy & Eggs', '🥚', 3.60, 'Golden Yolk e 3.60'],
 ['M&S Low Fat Natural Cottage Cheese (size not confirmed)', '🥛 Dairy & Eggs', '🧀', 2.70, 'LF NAT COTT C 2.70'],
 ["M&S Mozzarella Cow's Milk (size not confirmed)", '🥛 Dairy & Eggs', '🧀', 2.45, 'MOZZA COWS 12 2.45'],
 ['M&S Mature Cheddar (size not confirmed)', '🥛 Dairy & Eggs', '🧀', 3.35, 'MTR CHEDDAR 3.35'],
 ['M&S Wasabi Peas (size not confirmed)', '🥨 Snacks & Treats', '🟢', 1.80, 'WASABI PEAS 1.80'],
 ['M&S 6 Bags Popped Crisps (size not confirmed)', '🥨 Snacks & Treats', '🥔', 2.80, '6 BAGS POPPED 2.80'],
];
let at = find(18259), id = 18260;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:' + n[3] + ',waitrose:0,iceland:0,alliance:0}, upd:"' + D + '"}, // ' + MS + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
