// Waitrose St Helier receipt 6 Nov 18:55 (Claire E, competition entry).
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
// 26 items; sum 82.38 less Sharwood's 2 for 4 (2.16 + 0.88) and Cookmeat 2 for 6.50 (2.56) = 76.78; less 0.50 = 76.28 paid.
const D = '6 Nov', WR = 'Waitrose St Helier shopper receipt 6 Nov 18:55 (Claire E)';
setPrice(7539, 'waitrose', 0.99, D, WR + ': WR ESS LARGE POTS 4S 0.99 (row was 0.95)');
setPrice(7696, 'waitrose', 1.16, D, WR + ': WR ESS PASSATA 1.16 (row was 1.00; size assumed 680g)');
setPrice(1295, 'waitrose', 2.44, D, WR + ': SHARWOODS PLAIN NAAN 2.44 x2 (size not confirmed; 2 for 4.00 deal that day, regular price stored)');
setPrice(11053, 'waitrose', 1.75, D, WR + ': VIENNETTA VANILLA 1.75 (may have been an offer)');
addNote(13729, WR + ': WR ESS APPLE JUICE 1.59 x2');
addNote(2641, WR + ': JDAIRY FAT RED MILK 1.65 x3');
addNote(13398, WR + ': WR 30% MAT GRTD CHDR 3.22');
const NEW = [
 ['Waitrose Regal White Potatoes (size not confirmed)', '🥦 Fruit & Veg', '🥔', 1.16, 'WR REGAL WHITE POTS 1.16'],
 ['Waitrose Chicken Slices (size not confirmed)', '🥩 Meat & Fish', '🍗', 4.53, 'WR CHICKEN SLICES 4.53 (Cookmeat 2 for 6.50 deal with the Wiltshire honey ham, regular price stored)'],
 ['Waitrose Wiltshire Honey Ham (size not confirmed)', '🥩 Meat & Fish', '🥓', 4.53, 'WR WILTSHIRE HNY HAM 4.53 (Cookmeat 2 for 6.50 deal with the chicken slices, regular price stored)'],
 ['Waitrose Cooks\' Ingredients Chorizo (size not confirmed)', '🥩 Meat & Fish', '🌭', 4.06, 'WR CI CHORIZO 4.06'],
 ['Waitrose 12 Pigs in Blankets (size not confirmed)', '🥩 Meat & Fish', '🌭', 3.16, 'WR 12 PIGS IN BLNKTS 3.16 x2'],
 ['Waitrose Free Range Gammon (size not confirmed)', '🥩 Meat & Fish', '🥩', 6.23, 'WR FR US GAMMON 6.23 (FR US = free range unsmoked, assumed)'],
 ['Waitrose 4 Onion Bhajis (size not confirmed)', '🥗 Deli & Salads', '🧅', 3.19, 'WR 4 ONION BHAJIS 3.19 x2'],
 ['Waitrose Silverside Joint (size not confirmed)', '🥩 Meat & Fish', '🥩', 14.41, 'WR SILVERSIDE JOINT 14.41'],
 ['Goodfella\'s Pepperoni Pizza (size not confirmed)', '🧊 Frozen', '🍕', 2.35, 'GOODFELLA PEPPERONI 2.35'],
 ['Goodfella\'s Margherita Pizza (size not confirmed)', '🧊 Frozen', '🍕', 2.35, 'GOODFELLA MARGHERITA 2.35'],
 ['Sharwood\'s Reduced Fat Tikka Masala Sauce (size not confirmed)', '🍝 Pantry', '🍝', 3.08, 'SHARWOODS RF TIKKA MASA 3.08 (Sharwood\'s 2 for 4.00 deal with the rogan josh, regular price stored)'],
 ['Sharwood\'s Rogan Josh Cooking Sauce (size not confirmed)', '🍝 Pantry', '🍝', 3.08, 'SHARWOODS ROGAN JOSH 3.08 (Sharwood\'s 2 for 4.00 deal with the tikka masala, regular price stored)'],
];
let at = find(15977), id = 15978;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + n[3] + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
