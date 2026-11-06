// Co-op Millennium Park receipt 6 Nov (competition entry, Jason L).
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




const WR = 'Co-op Millennium Park shopper receipt 6 Nov (Jason L)', D = '6 Nov';
const U = (id, p, note) => setPrice(id, 'coop', p, D, WR + ': ' + note);
U(430, 1.64, 'Jersey Dairy 1% F 1.64 x4');
U(3603, 6.00, 'Cp Pork Loin Steaks 6.00 // members £5.00 (seen 6 Nov, expiry date unknown)');
U(4089, 2.40, 'Very Lazy Ginger 2.40');
U(5012, 1.00, 'Cp Basmati Mcrw Rice 1.00 x3 (microwave pouch assumed) // members £0.80 each (seen 6 Nov, expiry date unknown)');
U(10723, 2.00, 'Jsy Mixed Peppers 2.00');
U(3359, 0.26, 'Cp F/T Bananas 0.26 x4 // members £0.23 (seen 6 Nov, expiry date unknown)');
U(8072, 3.85, 'Cp Lge F/Rnge 3.85 (12 large free range eggs assumed from price)');
U(2898, 2.45, 'Cp Spinach 2.45 // members £1.85 (seen 6 Nov, expiry date unknown)');
U(8065, 1.84, 'Hula Hoops Bbq Beef 1.84');
U(3822, 2.80, 'B/E 10 Pot Waffles 2.80');
U(9796, 3.00, 'Cp Choc Cml 4X75g 3.00 // members £2.10 (seen 6 Nov, expiry date unknown)');
U(555, 1.25, 'Cp Wht Tstie Loaf 1.25 // members £0.99 as Coop Loaves 800G (seen 6 Nov, expiry date unknown)');
U(5259, 7.35, 'Fairy Liquid 7.35 (till says Fairy Liquid; price matches this 26-wash Fairy gel, not confirmed)');
const NEW = [
 ['Co-op Farms Flour', '🍝 Pantry', '🌾', 1.85, 'Cp Farms Flour 1.85 (type and size not confirmed)'],
 ['Co-op British Chicken', '🥩 Meat & Fish', '🍗', 5.75, 'Cp Brit Chicken 5.75 x4 (cut and size not confirmed; Buy Any 2 for £8.40 deal applied x2, regular price stored)'],
 ['Medium Curry Powder', '🍝 Pantry', '🍝', 1.78, 'Med Crry Pwdr 1.78 (brand and size not shown on till)'],
 ['Fairy Sensitive Original Washing Up Liquid', '🧹 Household', '🧴', 2.10, 'Fairy Sensitive Org 2.10 (size not confirmed)'],
 ['Muller Corner Crunch Single', '🥛 Dairy & Eggs', '🥛', 2.10, 'Muller Cnr Crnch 2.10 (size not confirmed)'],
 ["Fox's Assorted Cookies 365g", '🍝 Pantry', '🍪', 3.68, 'Fox Ckie As 365G 3.68 (Assorted assumed)'],
 ['Co-op Coffee & Salted Hazelnut Cones', '🧊 Frozen', '🍦', 3.00, 'Cofe&Slted Hnut Con 3.00 (pack size not confirmed) // members £2.26 (seen 6 Nov, expiry date unknown)'],
 ['Flame Grilled Steak Crisps', '🥨 Snacks & Treats', '🥔', 1.73, 'Flame Grilled Steak 1.73 (brand and size not shown on till)'],
 ['Co-op 12 Yorkshire Puddings', '🧊 Frozen', '🥘', 1.75, 'Cp 12 York Puddings 1.75'],
];
let at = find(15942), id = 15943;
NEW.forEach(n => {
  lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:' + n[3] + ',morrisons:0,ms:0,waitrose:0,iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n[4]);
  id++;
});
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
