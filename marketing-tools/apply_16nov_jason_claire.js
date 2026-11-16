// 16 Nov submissions: Jason L Waitrose St Helier 334 (16 Nov 12:27, 45 items: 42 grocery lines counted, 3 Marlboro not counted) and Claire E (M&S St Peter's 14 Nov; M&S King Street, Alliance Broad Street, Waitrose St Helier, Co-op Millennium Park 16 Nov; Morrisons Queens Road undated, points held).
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
const NEWROWS = [];
const add = (name, cat, icon, store, price, date, note) => NEWROWS.push({ name, cat, icon, store, price, date, note });
// ---- Jason L, Waitrose St Helier 334, 16 Nov 12:27
const JD = '16 Nov', JW = 'Waitrose branch: St Helier 334 (Jason L receipt 16 Nov 12:27)';
setPrice(14611, 'waitrose', 0.93, JD, JW + ': WR ESS CARROTS 0.93');
setPrice(16059, 'waitrose', 1.51, JD, JW + ': WR ONIONS 4S 1.51');
setPrice(7539, 'waitrose', 0.99, JD, JW + ': WR ESS LARGE POTS 4S 0.99');
setPrice(842, 'waitrose', 2.40, JD, JW + ': CISLAND JE PEPPERS 2.40');
setPrice(7528, 'waitrose', 1.34, JD, JW + ": WR CHESTNUT M'ROOMS 1.34");
setPrice(832, 'waitrose', 2.90, JD, JW + ': WR SPANISH CHORIZO S 2.90');
setPrice(14167, 'waitrose', 4.53, JD, JW + ': WR WILT BREADED HAM 2 x 4.53 (CookMeat 2 for 6.50 offer on the receipt)');
addNote(15890, JW + ': WR XL WHOLE CHICKEN 8.09 (by weight, price not stored)');
setPrice(2656, 'waitrose', 4.01, JD, JW + ': ACTIVIA FIBRE WALNUT 2 x 4.01');
setPrice(18273, 'waitrose', 1.34, JD, JW + ': WR ESS LF GREEK YOG 1.34');
setPrice(3004, 'waitrose', 3.66, JD, JW + ': BERTOLLI OLIVE SPR 3.66 (size assumed 450g)');
setPrice(430, 'waitrose', 1.65, JD, JW + ': JD 1% FAT MILK 1.65');
setPrice(15186, 'waitrose', 1.74, JD, JW + ': WR ESS PETITS POIS 1.74');
setPrice(14625, 'waitrose', 2.15, JD, JW + ': CI CHOPPED SHALLOTS 2 x 2.15 (Cooks Ingredients, size assumed 300g)');
setPrice(4409, 'waitrose', 3.05, JD, JW + ': READY BREK ORIGINAL 3.05 (size not confirmed, 450g assumed)');
setPrice(7675, 'waitrose', 1.63, JD, JW + ': ESS FR WHITE EGGS 2 x 1.63');
setPrice(4535, 'waitrose', 1.39, JD, JW + ': SQUASHIES ORIGINAL 1.39 (size assumed 120g)');
setPrice(12436, 'waitrose', 1.99, JD, JW + ': SHADES STRAWB 2 x 1.99');
setPrice(18316, 'waitrose', 1.79, JD, JW + ': NO1 BEEF BEARNAISE 1.79');
setPrice(4664, 'waitrose', 2.55, JD, JW + ': SUN BITES SWT CHILLI 2.55 (Walkers 2 for 3.50 offer on the receipt)');
setPrice(6049, 'waitrose', 1.10, JD, JW + ': HALLS SOOTHERS BCRNT 2 x 1.10 (size assumed 45g)');
const W = 'waitrose';
add('Waitrose Trimmed Leeks 400g', '🥦 Fruit & Veg', '🥬', W, 1.74, JD, JW + ': WR TRMD LEEKS 400G 1.74');
add('Waitrose Easy Peelers (size not confirmed)', '🥦 Fruit & Veg', '🍊', W, 3.08, JD, JW + ': WR EASY PEELERS 3.08');
add('Waitrose Thick Cut Smoked Bacon (size not confirmed)', '🥩 Meat & Fish', '🥓', W, 4.93, JD, JW + ': WR THICK SMK BACON 2 x 4.93 (BaconEgg 2 for 6.50 offer on the receipt)');
add('Waitrose BBQ Chicken Pizza (size not confirmed)', '🧊 Frozen', '🍕', W, 4.71, JD, JW + ': WR BBQ CHICK PIZZA 4.71');
add('Waitrose Essential Salad Onions (size not confirmed)', '🥦 Fruit & Veg', '🧅', W, 0.82, JD, JW + ': ESS SALAD ONIONS 0.82');
add('Waitrose Essential Sardines in Water (size not confirmed)', '🍝 Pantry', '🐟', W, 1.74, JD, JW + ': WR ESS SARDINES WTR 3 x 1.74');
add('Waitrose Demerara Sugar (size not confirmed)', '🍝 Pantry', '🍬', W, 3.31, JD, JW + ': WR DEMERARA SUGAR 3.31');
add('Sunbites Sour Cream & Black Pepper Multipack (size not confirmed)', '🥨 Snacks & Treats', '🥔', W, 2.55, JD, JW + ': SUN BITES SOUR CREAM 3 x 2.55 (Walkers 2 for 3.50 offer on the receipt)');
add('Waitrose Pennoni Rigati (size not confirmed)', '🍝 Pantry', '🍝', W, 1.90, JD, JW + ': WR PENNONI RIGATI 1.90');
add('Ricola Honey Lozenges (size not confirmed)', '💊 Health & Beauty', '💊', W, 1.54, JD, JW + ': RICOLA HONEY LOZENGE 1.54');
// ---- Claire E, Waitrose St Helier 334, 16 Nov 18:34
const CW = 'Waitrose branch: St Helier 334 (Claire E receipt 16 Nov 18:34)';
setPrice(13740, 'waitrose', 3.38, JD, CW + ': WR PRESSED APPLE JCE 3.38 (size assumed 1.75 litre)');
setPrice(2641, 'waitrose', 1.65, JD, CW + ': JDAIRY FAT RED MILK 2 x 1.65');
// ---- Claire E, M&S St Peter's, 14 Nov
const MD = '14 Nov', MS = "M&S branch: St Peter's (Claire E receipt 14 Nov)";
setPrice(18243, 'ms', 3.10, MD, MS + ': 4 PLAIN BAGEL 3.10');
setPrice(9672, 'ms', 5.25, MD, MS + ': 5% XLEAN BEEF 5.25');
setPrice(657, 'ms', 1.85, MD, MS + ': BRWN ONION NE 1.85');
setPrice(9676, 'ms', 1.55, MD, MS + ': GARLIC BAGUET 1.55');
const M = 'ms';
add('M&S Tenderstem Broccoli (as printed TSTEM BROC 20, 200g assumed)', '🥦 Fruit & Veg', '🥦', M, 1.70, MD, MS + ': TSTEM BROC 20 2 x 1.70');
add('M&S Spinach (as printed SGL SPINACH, size not confirmed)', '🥦 Fruit & Veg', '🥬', M, 1.25, MD, MS + ': SGL SPINACH 1.25');
add('M&S Fine Beans (size not confirmed)', '🥦 Fruit & Veg', '🫛', M, 2.85, MD, MS + ': Fine Beans 2.85');
add('M&S Carrots Bag (as printed CARROT BAG 50, size not confirmed)', '🥦 Fruit & Veg', '🥕', M, 0.55, MD, MS + ': CARROT BAG 50 0.55');
add('M&S Cabbage Loaf (as printed, size not confirmed)', '🍞 Bread & Bakery', '🍞', M, 2.45, MD, MS + ': CABBAGE LOAF 2.45');
add('M&S 6 Wholemeal Rolls (size not confirmed)', '🍞 Bread & Bakery', '🍞', M, 2.95, MD, MS + ': 6 W/MEAL ROLL 2.95');
add('M&S Deep Filled Chicken & Gravy Pie (as printed DF CHK GRV PI, size not confirmed)', '🌡️ Chilled', '🥧', M, 6.80, MD, MS + ': DF CHK GRV PI 6.80');
add('M&S 0% Fat Greek Style Yogurt 150g (as printed 0% FAT GRK 15)', '🥛 Dairy & Eggs', '🥛', M, 0.95, MD, MS + ': 0% FAT GRK 15 6 x 0.95');
add('M&S Mini Whips (as printed, size not confirmed)', '🥨 Snacks & Treats', '🍫', M, 3.40, MD, MS + ': MINI WHIPS 3.40');
add('M&S 6 Yorkshire Puddings (size not confirmed)', '🧊 Frozen', '🍳', M, 2.60, MD, MS + ': 6 YKSHIRE PUD 2.60');
add('M&S Southern Style Chicken Tenders (as printed SS CHKN TENDE, size not confirmed)', '🥩 Meat & Fish', '🍗', M, 6.80, MD, MS + ': SS CHKN TENDE 2 x 6.80 (3 for 12.60 offer on the receipt)');
add('M&S Breaded Chicken Breast (as printed BRD BRST ST X, size not confirmed)', '🥩 Meat & Fish', '🍗', M, 6.20, MD, MS + ': BRD BRST ST X 6.20 (3 for 12.60 offer on the receipt)');
// ---- Claire E, M&S King Street, 16 Nov 11:32
const MK = 'M&S branch: King Street, St Helier (Claire E receipt 16 Nov 11:32)';
add('M&S Percy Pig 170g', '🍫 Confectionery', '🐷', M, 2.45, JD, MK + ': PERCY PIG 170 2.45');
add('M&S Croissant (single, size not confirmed)', '🍞 Bread & Bakery', '🥐', M, 1.65, JD, MK + ': CROISSANT 1.65');
// ---- Claire E, Co-op Millennium Park, 16 Nov 18:48
const CC = 'Co-op branch: Millennium Park (Claire E receipt 16 Nov 18:48)';
setPrice(3678, 'coop', 2.69, JD, CC + ': Cp Bttr Pain Au Chc 2.69');
setPrice(3679, 'coop', 3.25, JD, CC + ': Cp I All Bttr Crsnts 3.25');
// ---- Claire E, Alliance Broad Street, 16 Nov 11:36
setPrice(12763, 'alliance', 2.55, JD, 'Alliance Broad Street (Claire E receipt 16 Nov 11:36): CRUSHA STRAWBERRY MI 2 x 2.55 (size assumed 1 litre)');
// ---- Claire E, Morrisons Queens Road, date not printed (submitted 16 Nov, points held)
const MQ = 'Morrisons Queens Road (Claire E receipt, date not printed, submitted 16 Nov)';
setPrice(5702, 'morrisons', 2.00, JD, MQ + ': ROBINSON F/SHOOT B/CURRANT & A 2 x 2.00 (size not confirmed, 4 x 200ml assumed)');
setPrice(9520, 'morrisons', 1.31, JD, MQ + ': HARIBO TWIN SNAKES PMP 1.31 (size assumed 140g)');
setPrice(18067, 'morrisons', 1.95, JD, MQ + ': FERRERO KINDER CHOCOLATE 100g 1.95');
setPrice(4535, 'morrisons', 1.35, JD, MQ + ': SWIZZELS DRUMSTICK SQUASHIES O 1.35');
add('Crazy Candy Factory Funny Money (size not confirmed)', '🍫 Confectionery', '🍬', 'morrisons', 1.19, JD, MQ + ': CRAZY CANDY FACTORY FUNNY MONE 1.19');
// ---- insert new rows after the current max id
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let id = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(n => { const p = S.map(s => s + ':' + (s === n.store ? n.price : 0)).join(','); lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n.name) + ', cat:' + JSON.stringify(n.cat) + ', icon:' + JSON.stringify(n.icon) + ', prices:{' + p + '}, upd:"' + n.date + '"}, // ' + n.note); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done,', NEWROWS.length, 'new rows, next id', id);
// Afterwards: the new 'Waitrose Trimmed Leeks 400g' row duplicated id 17973, so it was removed and 17973 got waitrose 1.74 (16 Nov) instead.
