// Lucy D 14 Nov email (competition entry): Waitrose St Helier 334 14 Nov 14:00 (40 lines, totals folded away in photo), Co-op Millennium Park 12 Nov 20:39 + 13 Nov 08:52 + 13 Nov 08:53 (5 lines: 1+3+1), M&S King Street 14 Nov 15:03 (4 lines, 10.25).
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
const WRB = 'Waitrose branch: St Helier 334 (Lucy D receipt 14 Nov 14:00)';
const COB = 'Co-op branch: Millennium Park (Lucy D receipt 12-13 Nov)';
const MSB = 'M&S branch: King Street, St Helier (Lucy D receipt 14 Nov 15:03)';
// Waitrose: existing rows
setPrice(4238, 'waitrose', 1.96, D, WRB + ': TUNNOCKS TEA CAKES 1.96');
setPrice(12431, 'waitrose', 1.99, D, WRB + ': SHADES ORIGINAL 2 x 1.99');
setPrice(9403, 'waitrose', 1.75, D, WRB + ': CADBURY BUTTON TWIST 1.75 (size assumed 100g)');
setPrice(835, 'waitrose', 1.80, D, WRB + ': FOXS CHOC ROCKY 7S 1.80');
setPrice(586, 'waitrose', 1.75, D, WRB + ': CADBURY CARA NIBBLES 1.75 (size assumed 120g)');
setPrice(474, 'waitrose', 1.90, D, WRB + ': HULA HOOPS ORIGINAL 1.90');
setPrice(16038, 'waitrose', 1.69, D, WRB + ': MARS 4 PACK 1.69');
setPrice(713, 'waitrose', 1.55, D, WRB + ': MINI CHEDDARS 6PK 1.55 (was 2.04)');
setPrice(16041, 'waitrose', 3.05, D, WRB + ': KP SALTED PEANUTS 3.05 (was 3.59)');
setPrice(4221, 'waitrose', 1.90, D, WRB + ': TUC ORIGINAL CRACKER 1.90 (size assumed 150g)');
setPrice(16069, 'waitrose', 1.60, D, WRB + ': BAHLSEN PICK UP DARK 2 x 1.60');
setPrice(442, 'waitrose', 2.55, D, WRB + ': WALKERS READY SALTED 2.55 (was 2.40)');
setPrice(16074, 'waitrose', 2.32, D, WRB + ': JACKSON WHITE BLOOMER 2.32');
setPrice(501, 'waitrose', 1.80, D, WRB + ': PRINGLES ORIG 1.80');
setPrice(16047, 'waitrose', 1.75, D, WRB + ': MUNCH BUNCH F/FRAIS 1.75 (was 2.44)');
setPrice(13058, 'waitrose', 3.13, D, WRB + ': MARS ICE CREAM 3.13 (4 pack assumed)');
setPrice(2641, 'waitrose', 1.65, D, WRB + ': JDAIRY FAT RED MILK 3 x 1.65');
// Co-op
setPrice(2641, 'coop', 1.64, '12 Nov', COB + ': Jersey Green Fat R 2 x 1.64 (12 Nov 20:39)');
setPrice(5942, 'coop', 2.10, '13 Nov', COB + ': Cp F/T C/W Pads 2.10 (13 Nov 08:52)');
setPrice(4159, 'coop', 4.39, '13 Nov', COB + ': Hz Tomato Ketchup 4.39 (13 Nov 08:52)');
addNote(4159, 'members 3.85 (Mp saving 0.54 on 13 Nov 2026)');
setPrice(5025, 'coop', 2.80, '13 Nov', COB + ': Lyd Gressn Pizza Base 2.80 (13 Nov 08:53)');
const ST = 'ST', PS = '🍝 Pantry', MF = '🥩 Meat & Fish', DR = '🥤 Drinks', FZ = '🧊 Frozen', SN = '🥨 Snacks & Treats', CF = '🍫 Confectionery', DY = '🥛 Dairy & Eggs', FV = '🥦 Fruit & Veg', PC = '🐾 Pet Care', BB = '🍞 Bread & Bakery';
// [name, cat, icon, store, price, comment, date]
const NEW = [
 ['Innocent Orange Juice (as printed INNOCENT ORANGE, size not confirmed)', DR, '🍊', 'waitrose', 3.50, WRB + ': INNOCENT ORANGE 2 x 3.50', D],
 ['Cadbury Twirl Bites (smaller bag, size not confirmed)', CF, '🍫', 'waitrose', 1.75, WRB + ': CADBURY TWIRL BITES 1.75 (existing row has 3.73)', D],
 ['Deliciously Ella Apple Raisin & Cinnamon (as printed DE APPLE RAISIN CIN, size not confirmed)', SN, '🍎', 'waitrose', 3.29, WRB + ': DE APPLE RAISIN CIN 3.29', D],
 ['Waitrose Large Flat Mushrooms (as printed WR LNG FLT MROOMS, size not confirmed)', FV, '🍄', 'waitrose', 1.69, WRB + ': WR LNG FLT MROOMS 1.69', D],
 ['Cadbury Freddo (second pack size, size not confirmed)', CF, '🍫', 'waitrose', 1.89, WRB + ': CADBURY FREDDO 1.89 (single bar row has 1.00)', D],
 ['Cadbury Fudge (second pack size, size not confirmed)', CF, '🍫', 'waitrose', 1.89, WRB + ': CADBURY FUDGE 1.89 (single bar row has 1.00)', D],
 ['Dentalife Dental Cat Treats (as printed, size not confirmed)', PC, '🐱', 'waitrose', 5.12, WRB + ': DENTALIFE DENTAL CAT 5.12', D],
 ['Birds Eye 26 Breaded Cod Fish Fingers (as printed BE 26 BRDED COD F/FI, size not confirmed)', FZ, '🐟', 'waitrose', 11.50, WRB + ': BE 26 BRDED COD F/FI 11.50', D],
 ['Pringles Sour Cream (as printed PRINGLES SC, size not confirmed)', SN, '🥔', 'waitrose', 1.80, WRB + ': PRINGLES SC 1.80', D],
 ['Heinz Tomato Ketchup Reduced Sugar & Salt (as printed RSS, size not confirmed)', PS, '🍅', 'waitrose', 4.10, WRB + ': HEINZ KETCHUP RSS 4.10', D],
 ['Waitrose Chicken Steaks (size not confirmed)', MF, '🍗', 'waitrose', 3.11, WRB + ': WR CHICKEN STEAKS 2 x 3.11', D],
 ['Cadbury Crunchie Cake Bar (single, as printed CAD CAKE CRUNCH)', SN, '🍫', 'waitrose', 1.45, WRB + ': CAD CAKE CRUNCH 1.45', D],
 ['Cadbury Milk Chocolate Cake Bar (single, as printed CAD CAKE BAR CHOC)', SN, '🍫', 'waitrose', 1.45, WRB + ': CAD CAKE BAR CHOC 1.45', D],
 ['Cadbury Caramel Stk (as printed CADBURY CARAMEL STK, size not confirmed)', CF, '🍫', 'waitrose', 4.72, WRB + ': CADBURY CARAMEL STK 2 x 4.72', D],
 ['Magnum Classic (single, as printed, size not confirmed)', FZ, '🍦', 'waitrose', 2.50, WRB + ': MAGNUM CLASSIC 2.50', D],
 ['Cathedral City Minis (as printed, size not confirmed)', DY, '🧀', 'waitrose', 2.76, WRB + ': CATHEDRAL CITY MINIS 2.76', D],
 ['Innocent Orange Juice Smooth (smaller bottle, as printed Inno Org Juice Smooth, size not confirmed)', DR, '🍊', 'coop', 2.47, COB + ': Inno Org Juice Smooth 2.47 (13 Nov 08:52)', '13 Nov'],
 ['M&S French Fries (as printed FRNC FRIE 1.5, size not confirmed)', FZ, '🍟', 'ms', 3.10, MSB + ': FRNC FRIE 1.5 2 x 3.10', D],
 ['M&S Baked Sour Cream (as printed BAKED SOUR CR, size not confirmed)', SN, '🥔', 'ms', 2.30, MSB + ': BAKED SOUR CR 2.30', D],
 ['M&S 8 Mini White Wraps (as printed 8 MINI WHT WR)', BB, '🌯', 'ms', 1.75, MSB + ': 8 MINI WHT WR 1.75', D],
];
let at = find(18337), id = 18338;
NEW.forEach(n => {
  const p = {coop:0, morrisons:0, ms:0, waitrose:0, iceland:0, alliance:0}; p[n[3]] = n[4];
  lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{' + S.map(s => s + ':' + p[s]).join(',') + '}, upd:"' + n[6] + '"}, // ' + n[5]);
  id++;
});
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
