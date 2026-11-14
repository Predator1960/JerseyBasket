// Waitrose 14 Nov receipt (Jason L, competition entry): 32 lines counted (top line cut off in photo, REFILL 500 3.38 and cut line 3.98 not stored), No.1 Dine In -7.52, free mince pies -3.08 and Save 50p are promos. Total 99.33, paid 95.75.
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
const D = '14 Nov', WR = 'Waitrose branch: code 0334 (Jason L receipt 14 Nov)';
setPrice(1210, 'waitrose', 2.65, D, WR + ': OATLY BARISTA 2 x 2.65');
setPrice(15132, 'waitrose', 3.24, D, WR + ': WR NO1 CHEESE GRATIN 3.24');
setPrice(16020, 'waitrose', 4.10, D, WR + ': ACTIMEL MULTIFRUIT 4.10');
setPrice(7733, 'waitrose', 1.57, D, WR + ': WR ESS TARTARE SAUCE 1.57 (was 1.50)');
setPrice(423, 'waitrose', 0.87, D, WR + ': JERSEY DAIRY 1% MILK 0.87');
setPrice(14203, 'waitrose', 7.83, D, WR + ': WR LARGE WHL CHICKEN 7.83');
setPrice(2594, 'waitrose', 3.17, D, WR + ': WRGARLIC BREADSTICKS 3.17');
setPrice(18002, 'waitrose', 4.64, D, WR + ': NO.1 TRPL CKD CHIPS 4.64');
setPrice(7076, 'waitrose', 3.48, D, WR + ': WR PLADY APPLES 6S 3.48');
setPrice(14611, 'waitrose', 0.93, D, WR + ': WR ESS CARROTS 0.93');
setPrice(7530, 'waitrose', 1.05, D, WR + ': WR PRIPE AVO MED 1.05');
setPrice(16004, 'waitrose', 1.63, D, WR + ': BROCCOLI TIPS 1.63');
setPrice(16097, 'waitrose', 2.90, D, WR + ': WR BLUEBS 2.90');
setPrice(16044, 'waitrose', 2.90, D, WR + ': H/H FR B/FAST EGGS L 2.90');
setPrice(16009, 'waitrose', 1.57, D, WR + ': WR AB CROISSANT 1.57');
setPrice(16010, 'waitrose', 3.22, D, WR + ': TEPE EASYPICK 3.22');
setPrice(3987, 'waitrose', 1.16, D, WR + ': CLMNS CHIL CON CARNE 1.16 (Colman\'s recipe mix, 50g assumed)');
const NEW = [
 ["Hellmann's Mayonnaise (second pack size, size not confirmed)", '🍝 Pantry', '🥫', 3.51, 'HELLMANNS MAYONNAISE 3.51 (an earlier receipt had 5.41)'],
 ['Waitrose Bubbly Haddock Fillets (as printed, size not confirmed)', '🥩 Meat & Fish', '🐟', 12.08, 'WR BUBBLY HADDOCK FL 12.08'],
 ['Waitrose Honey & Rosemary Chipolatas in Bacon (as printed, size not confirmed)', '🥩 Meat & Fish', '🌭', 5.58, 'WR HNY&RSMRY CHIP/BC 2 x 5.58'],
 ['Waitrose No.1 GT TDF Pudding (as printed, size not confirmed)', '🍝 Pantry', '🍮', 5.80, 'NO1 GT TDF PUDDING 5.80'],
 ['Waitrose Mini Roasters (as printed, size not confirmed)', '🥦 Fruit & Veg', '🥔', 1.00, 'WR MINI ROASTERS 1.00'],
 ['Toblerone Dark (size not confirmed)', '🍫 Confectionery', '🍫', 2.59, 'TOBLERONE DARK 2.59'],
 ['Lindt Dark Chocolate Bar (variety not confirmed)', '🍫 Confectionery', '🍫', 3.48, 'LINDT DARK CHOC 2 x 3.48'],
 ['Waitrose Strawberries 230g', '🥦 Fruit & Veg', '🍓', 3.19, 'WR STRAWBS 230G 3.19'],
 ['Waitrose No.1 Mince Pies (as printed SCHERRY, size not confirmed)', '🥨 Snacks & Treats', '🥧', 3.08, 'NO1 SCHERRY MPIES 3.08 (free on the receipt via offer)'],
];
let at = find(18285), id = 18286;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + n[3] + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
