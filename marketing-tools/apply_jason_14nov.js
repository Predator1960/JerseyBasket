// Jason 14 Nov receipts, catalogue only for now: Waitrose St Saviour 332 08:36 (7 lines, Dell Meats 2 for 5 -2.78, paid 19.58) and M&S St Clement School Road 08:25 (9 lines, 2 for 4.73 -3.04, paid 16.01). Also fixes Sandra's M&S 14 Nov: 4 '<' lines are meal-deal items at regular price (stored now).
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
const D = '14 Nov';
const WRB = 'Waitrose branch: St Saviour 332 (Jason receipt 14 Nov 08:36)';
const MSB = 'M&S branch: St Clement School Road (Jason receipt 14 Nov 08:25)';
setPrice(15890, 'waitrose', 8.19, D, WRB + ': WR XL WHOLE CHICKEN 8.19 (was 9.09)');
setPrice(14143, 'waitrose', 3.89, D, WRB + ': WR BRIT HNY RST HAM 3.89 (Dell Meats 2 for 5 offer, -2.78 for the two hams)');
setPrice(9618, 'waitrose', 0.98, D, WRB + ': FAIRTRADE BANANAS 0.98 (was 0.84)');
setPrice(7086, 'waitrose', 2.03, D, WRB + ': JASONS WHITE ROLLS 2.03');
setPrice(105, 'ms', 0.95, D, MSB + ': CARROT BAG 1K 0.95 (was 0.85)');
setPrice(97, 'ms', 1.60, D, MSB + ': BROCCOLI CROWN 1.60');
setPrice(18325, 'ms', 1.00, D, MSB + ': GREEN BEANS 1.00');
setPrice(91, 'ms', 3.10, D, MSB + ': RED GRAPE 3.10 (was 3.00; offer 2 for 4.73 across the < fruit lines)');
setPrice(90, 'ms', 3.10, D, MSB + ': WHITE GRAPE 3.10 (was 3.00; offer 2 for 4.73 across the < fruit lines)');
const SB = "M&S branch: St Peter (Sandra B receipt 14 Nov)";
const NEW = [
 // Sandra's four '<' lines (stir fry meal deal 8.40), regular prices
 ['M&S Plum Hoisin Sauce (size not confirmed)', '🍝 Pantry', '🥫', 0, 1.65, D, SB + ': PLUM HOIS SAU 1.65 (stir fry meal deal 8.40)'],
 ['M&S King Prawns (as printed HNDRN KNG PRA, size not confirmed)', '🥩 Meat & Fish', '🍤', 0, 5.25, D, SB + ': HNDRN KNG PRA 5.25 (stir fry meal deal 8.40)'],
 ['M&S Peanut Pad Thai (as printed PNUT PAD THAI, size not confirmed)', '🍝 Pantry', '🍜', 0, 2.15, D, SB + ': PNUT PAD THAI 2.15 (stir fry meal deal 8.40)'],
 ['M&S Beansprouts (size not confirmed)', '🥦 Fruit & Veg', '🌱', 0, 1.15, D, SB + ': BEANSPROUTS 1.15 (stir fry meal deal 8.40)'],
 // Jason Waitrose
 ['Lucozade Energy Drink Original (as printed, size not confirmed)', '🥤 Drinks', '🥤', 1.69, 0, D, WRB + ': LUCOZADE ENERGY ORIG 2 x 1.69'],
 ['Waitrose British Ham (as printed, size not confirmed)', '🥩 Meat & Fish', '🥓', 3.89, 0, D, WRB + ': WR BRITISH HAM 3.89 (Dell Meats 2 for 5 offer)'],
 // Jason M&S
 ['M&S Maris Piper Potatoes 1.25kg', '🥦 Fruit & Veg', '🥔', 0, 2.00, D, MSB + ': MAR PPR 1.25K 2.00'],
 ['M&S Sprouts (size not confirmed)', '🥦 Fruit & Veg', '🥬', 0, 1.00, D, MSB + ': SPROUTS 1.00'],
 ['M&S Easy Peelers Family Pack (as printed EASYPEEL FAMI, size not confirmed)', '🥦 Fruit & Veg', '🍊', 0, 3.20, D, MSB + ': EASYPEEL FAMI 3.20 (offer 2 for 4.73 across the < fruit lines)'],
 ['M&S Kiwi Fruit (size not confirmed)', '🥦 Fruit & Veg', '🥝', 0, 3.10, D, MSB + ': KIWI FRUIT 3.10 (offer 2 for 4.73 across the < fruit lines)'],
];
let at = find(18327), id = 18328;
NEW.forEach(n => { const wp = n[3], mp = n[4]; lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:' + mp + ',waitrose:' + wp + ',iceland:0,alliance:0}, upd:"' + n[5] + '"}, // ' + n[6]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
