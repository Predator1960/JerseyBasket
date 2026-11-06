// Waitrose St Helier receipt 6 Nov (competition entry, Katrina B).
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


const WR = 'Waitrose St Helier shopper receipt 6 Nov (Katrina B, staff card, pre-discount prices)', D = '6 Nov';
setPrice(2641, 'waitrose', 1.65, D, WR + ': JDAIRY FAT RED MILK 1.65');
setPrice(455, 'waitrose', 2.58, D, WR + ': J/D BUTTER V/L SALT 2.58 x2');
setPrice(736, 'waitrose', 3.48, D, WR + ': WR SWEET/P FRIES 3.48');
setPrice(987, 'waitrose', 2.32, D, WR + ': JUS-ROL PUFF SHEET 2.32 (size not confirmed)');
setPrice(9618, 'waitrose', 0.84, D, WR + ': FAIRTRADE BANANAS 0.84');
setPrice(15807, 'waitrose', 4.60, D, WR + ': WR PRAWN COCKTAIL 4.60 x2 (2 for £5.50 offer applied, regular price stored)');
setPrice(14355, 'waitrose', 2.99, D, WR + ': WR FLATBREAD GARLIC 2.99 (matched by name, size not confirmed)');
setPrice(545, 'waitrose', 2.39, D, WR + ': WR ORNGE MANGO JUICE 2.39 (size not confirmed)');
setPrice(14763, 'waitrose', 5.05, D, WR + ': CADBURY HOT CHOC JAR 5.05');
setPrice(7260, 'waitrose', 2.32, D, WR + ': BROWN SF BOULE 2.32');
setPrice(7111, 'waitrose', 1.28, D, WR + ': WARBURTONS CRUMPETS 1.28 (size not confirmed)');
setPrice(7862, 'waitrose', 3.30, D, WR + ': KLGS CORNFLAKES 670G 3.30');
setPrice(7675, 'waitrose', 1.63, D, WR + ': ESS FR WHITE EGGS 1.63 x2 (size not confirmed)');
setPrice(15519, 'waitrose', 2.88, D, WR + ': WR ESS RINSE AID 2.88');
addNote(15890, WR + ': WR XL WHOLE CHICKEN 7.97 (by weight, price differs per bird, stored price left unchanged)');
const NEW = [
 ['Lurpak Light Spread', '🥛 Dairy & Eggs', '🧈', 4.35, 'LURPAK LIGHT SPREAD 4.35 (size not confirmed)'],
 ['Waitrose Loose Carrots', '🥦 Fruit & Veg', '🥕', 0.37, 'WR LOOSE CARROTS 0.37 (by weight)'],
 ['Waitrose Onions Loose', '🥦 Fruit & Veg', '🧅', 0.35, 'WR ONIONS 0.35 (by weight, size not confirmed)'],
 ['Taste 12 Mini Satay', '🥗 Deli & Salads', '🍢', 3.83, 'TASTE 12 MINI SATAY 3.83 (size not confirmed)'],
 ['Waitrose ETC Green Veg Steamer', '🥦 Fruit & Veg', '🥦', 2.90, 'WR ETC GRN VEG STMR 2.90 (ETC = Easy To Cook range, assumed; size not confirmed; Ready To Cook £10 offer applied)'],
 ['Waitrose ETC Hasselback Potatoes', '🥦 Fruit & Veg', '🥔', 3.48, 'WR ETC HSLL POTS 3.48 (HSLL = Hasselback, assumed; size not confirmed; Ready To Cook £10 offer applied)'],
 ['Waitrose Slow Cooked Sweet & Sour Pork Ribs', '🥩 Meat & Fish', '🥩', 8.05, 'WR SC S&S PORK RIBS 8.05 (size not confirmed)'],
 ['Waitrose No1 Cherrywood Smoked Salmon', '🥩 Meat & Fish', '🐟', 5.60, 'NO1 CWOOD SMK SALMON 5.60 (size not confirmed)'],
 ['YP Thai Chicken Soup', '🥗 Deli & Salads', '🍲', 4.32, 'YP THAI CHICKEN SOUP 4.32 (size not confirmed)'],
 ['Waitrose Lime Each', '🥦 Fruit & Veg', '🍋', 0.35, 'WR LIME 0.35'],
 ['Waitrose Christmas Chocolate Knots', '🍞 Bread & Bakery', '🍫', 2.44, 'WR XMAS CHOC KNOTS 2.44 (seasonal, size not confirmed)'],
 ['Waitrose Christmas Cinnamon Knots', '🍞 Bread & Bakery', '🍞', 2.44, 'WR XMAS CINNA KNOTS 2.44 (seasonal, size not confirmed)'],
 ['Waitrose Essential Still Water', '🥤 Drinks', '💧', 2.09, 'WR ESS STILL WATER 2.09 (size not confirmed)'],
 ['J20 Apple & Raspberry Cans', '🥤 Drinks', '🥤', 2.73, 'J20 APPLE & RASP CAN 2.73 (pack size not confirmed)'],
 ['Pledge Multi-Surface', '🧹 Household', '🧹', 2.00, 'PLEDGE M-SURFACE JAS 2.00 (size not confirmed)'],
];
let at = find(15920), id = 15921, gl = [];
NEW.forEach(n => {
  lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + n[3] + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n[4]);
  id++;
});
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
