// Frankie D (app, 25 Nov, referred by Peter De La Haye): Waitrose St Saviour 16 Nov 11:37 (44 items, 41 products), Waitrose St Saviour 4 Nov 12:27 (25 items, 20 count: spray carnations skipped), M&S St Martin 4 Nov (9 items, 6 readable), M&S King Street 25 Nov 12:18 (11 items, 9 products)
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
// rec: update the store price only when this receipt is at least as new as the row's current date for that store (or the store has no price); otherwise just add a note
function rec(id, store, price, date, note) {
  const i = find(id); if (i < 0) throw new Error('missing row ' + id);
  const o = evalRow(lines[i]);
  const cur = o.prices[store] || 0;
  const curDate = (o.upds && o.upds[store]) || (cur > 0 ? o.upd : '') || '';
  if (cur === 0 || dval(date) >= dval(curDate)) setPrice(id, store, price, date, note);
  else addNote(id, note + ' (older receipt, price not changed)');
}
const WA = 'Waitrose branch: St Saviour 332 (Frankie D receipt 16 Nov 11:37)';
const WB = 'Waitrose branch: St Saviour 332 (Frankie D receipt 4 Nov 12:27)';
const MC = 'M&S branch: St Martin (Frankie D receipt 4 Nov 11:2x)';
const MD = 'M&S branch: King Street, St Helier (Frankie D receipt 25 Nov 12:18)';
// existing rows: Waitrose 4 Nov
rec(16059, 'waitrose', 1.51, '4 Nov', WB + ': WR ONIONS 4S 1.51');
rec(3482, 'waitrose', 2.73, '4 Nov', WB + ': KRRYGLD PR IRSH BTTR 5 @ 2.73');
rec(17941, 'waitrose', 5.98, '4 Nov', WB + ': WR DORG MAT CHEDDAR 5.98');
rec(7595, 'waitrose', 1.51, '4 Nov', WB + ': ESS COLESLAW 300G 1.51');
rec(7604, 'waitrose', 1.92, '4 Nov', WB + ': WR SWEETCORN 2S 1.92');
rec(18463, 'waitrose', 1.86, '4 Nov', WB + ': WR ESS BROAD BEANS 1.86');
rec(18532, 'waitrose', 1.20, '4 Nov', WB + ': CISLAND RED CHILLIES 1.20');
rec(18362, 'waitrose', 2.65, '4 Nov', WB + ': GROS PAIN 2.65');
// existing rows: Waitrose 16 Nov
rec(15187, 'waitrose', 1.51, '16 Nov', WA + ': WR CHUNKY VEG MIX 1.51');
rec(14353, 'waitrose', 4.71, '16 Nov', WA + ': CHOR &CHAR PEP PIZZA 4.71');
rec(16059, 'waitrose', 1.51, '16 Nov', WA + ': WR ONIONS 4S 1.51');
rec(3482, 'waitrose', 2.73, '16 Nov', WA + ': KRRYGLD PR IRSH BTTR 2.73 (x4)');
rec(454, 'waitrose', 1.65, '16 Nov', WA + ': JERSEY DAIRY WH MILK 1.65');
rec(16031, 'waitrose', 0.58, '16 Nov', WA + ': WR CI GARLIC 0.58');
rec(17941, 'waitrose', 5.98, '16 Nov', WA + ': WR DORG MAT CHEDDAR 5.98');
rec(14164, 'waitrose', 4.05, '16 Nov', WA + ': UE OVEN ROAST HAM 4.05');
rec(15980, 'waitrose', 4.53, '16 Nov', WA + ': WR GB HONEY HAM TC 4.53 (CookMeat 2 for 6.50 with ox tongue)');
rec(17792, 'waitrose', 4.35, '16 Nov', WA + ': WR MINI PANDORO 4.35 (free with voucher)');
rec(2912, 'waitrose', 2.44, '16 Nov', WA + ': ELMLEA DOUBLE 2.44 (size not printed)');
rec(7590, 'waitrose', 0.70, '16 Nov', WA + ': WR ESS RED GFRUIT 0.70');
rec(14355, 'waitrose', 2.99, '16 Nov', WA + ': WR FLATBREAD GARLIC 2.99');
rec(7642, 'waitrose', 2.03, '16 Nov', WA + ': DORG LGEM LETT 2S 2.03');
rec(7088, 'waitrose', 2.90, '16 Nov', WA + ': ST PIERRE 4 BRG BUNS 2.90');
rec(16018, 'waitrose', 3.30, '16 Nov', WA + ': MARIGOLD GLOVES 3.30');
rec(9618, 'waitrose', 1.28, '16 Nov', WA + ': FAIRTRADE BANANAS 0.370kg @ £1.28/kg (price per kg)');
// existing rows: M&S
rec(87, 'ms', 3.40, '4 Nov', MC + ': STRAWBERRIES 3.40');
rec(9607, 'ms', 0.95, '4 Nov', MC + ': THE 70 30 LOA 0.95');
rec(9634, 'ms', 0.20, '4 Nov', MC + ': EA BANANAS 0.20 (x2)');
rec(9607, 'ms', 1.00, '25 Nov', MD + ': THE 70 30 LOA 1.00');
rec(9634, 'ms', 0.20, '25 Nov', MD + ': EA BANANAS 0.20 (x2)');
// new rows
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
const P = { coop:0, morrisons:0, ms:0, waitrose:0, iceland:0, alliance:0 };
function add(name, cat, icon, store, price, date, note) {
  const pr = { ...P, [store]: price };
  const row = '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:"' + cat + '", icon:"' + icon + '", prices:{' + Object.keys(P).map(s => s + ':' + pr[s]).join(',') + '}, upd:"' + date + '"}, // ' + note;
  lines.splice(++at, 0, row); console.log(nid, name, price); nid++;
}
add('Waitrose Essential Straight Cut Chips (as printed WR ESS S/CUT CHIPS, size not confirmed)', '🧊 Frozen', '🍟', 'waitrose', 1.74, '16 Nov', WA + ': WR ESS S/CUT CHIPS 1.74');
add('Waitrose Cauliflower Cheese (as printed WR CAULIFLOWER CHEES, size not confirmed)', '🥗 Deli & Salads', '🥦', 'waitrose', 2.85, '16 Nov', WA + ': WR CAULIFLOWER CHEES 2.85 (row 434 Waitrose Cauliflower Cheese is 4.06, likely a different size)');
add('Waitrose Essential Broccoli (as printed WR ESS BROCCOLI, size not confirmed)', '🥦 Fruit & Veg', '🥦', 'waitrose', 1.74, '16 Nov', WA + ': WR ESS BROCCOLI 1.74');
add('Waitrose Duchy Organic Potatoes (as printed WR DUCHY ORG POTS, size not confirmed)', '🥦 Fruit & Veg', '🥔', 'waitrose', 2.56, '16 Nov', WA + ': WR DUCHY ORG POTS 2.56 (also reduced 1.82 on 4 Nov receipt)');
add('Waitrose Essential Frozen Mixed Berries (as printed ESS BERRIES, size not confirmed)', '🧊 Frozen', '🫐', 'waitrose', 5.51, '16 Nov', WA + ': ESS BERRIES 5.51');
add('Waitrose Duchy Organic Beef Mince (as printed WR DORG BEEF MINCE, size not confirmed)', '🥩 Meat & Fish', '🥩', 'waitrose', 9.28, '16 Nov', WA + ': WR DORG BEEF MINCE 9.28');
add('Waitrose Duchy Organic Beef Fillet Steak (as printed WR DORG FILLET STEAK, size not confirmed)', '🥩 Meat & Fish', '🥩', 'waitrose', 15.05, '16 Nov', WA + ': WR DORG FILLET STEAK 15.05');
add('Waitrose Duchy Organic Lamb Mince 20% Fat (as printed DORG LAMB MNCE 20%F, size not confirmed)', '🥩 Meat & Fish', '🐑', 'waitrose', 8.70, '16 Nov', WA + ': DORG LAMB MNCE 20%F 8.70');
add('Organic Beetroot Juice (as printed ORG BEETROOT JUICE, size not confirmed)', '🥤 Drinks', '🧃', 'waitrose', 3.63, '16 Nov', WA + ': ORG BEETROOT JUICE 3.63');
add('Madrí Excepcional Lager (as printed MADRI EXCEPIONAL, pack size not confirmed)', '🍷 Wine & Beer', '🍺', 'waitrose', 12.45, '16 Nov', WA + ': MADRI EXCEPIONAL 12.45');
add('Waitrose Mincemeat (as printed WR MINCEMEAT, size not confirmed)', '🍝 Pantry', '🥧', 'waitrose', 2.90, '16 Nov', WA + ': WR MINCEMEAT 2.90');
add('Waitrose Mini Potatoes 500g (as printed WR MINI POTS 500G)', '🥦 Fruit & Veg', '🥔', 'waitrose', 2.44, '16 Nov', WA + ': WR MINI POTS 500G 2.44');
add('Waitrose Essential MSC Tuna in Spring Water (as printed WR ESS MSC TUNA SW, size not confirmed)', '🍝 Pantry', '🐟', 'waitrose', 1.74, '16 Nov', WA + ': WR ESS MSC TUNA SW 1.74');
add('Waitrose Midi Cucumber (as printed WR MIDI CUCUMBER)', '🥦 Fruit & Veg', '🥒', 'waitrose', 0.93, '16 Nov', WA + ': WR MIDI CUCUMBER 0.93');
add('Waitrose British Ox Tongue (as printed WR BRITISH OX TONGUE, size not confirmed)', '🥩 Meat & Fish', '🥩', 'waitrose', 4.53, '16 Nov', WA + ': WR BRITISH OX TONGUE 4.53 (also 4 Nov; CookMeat 2 for 6.50)');
add("Sharwood's Garlic & Coriander Mini Naans (as printed SHARW G&C MINI NAANS, size not confirmed)", '🍞 Bread & Bakery', '🫓', 'waitrose', 2.44, '16 Nov', WA + ': SHARW G&C MINI NAANS 2.44 (also 4 Nov)');
add('Waitrose White Baguette (as printed WR WHITE BAGUETTE, size not confirmed)', '🍞 Bread & Bakery', '🥖', 'waitrose', 1.63, '16 Nov', WA + ': WR WHITE BAGUETTE 1.63');
add('Channel Island Round Tomatoes (as printed CISLAND ROUND TOMS, size not confirmed)', '🥦 Fruit & Veg', '🍅', 'waitrose', 2.40, '16 Nov', WA + ': CISLAND ROUND TOMS 2.40 (also 4 Nov)');
add('Biotiful Kefir Yogurt Original 1kg (as printed BIO KFR YOG ORIG 1KG)', '🥛 Dairy & Eggs', '🥛', 'waitrose', 5.51, '16 Nov', WA + ': BIO KFR YOG ORIG 1KG 5.51');
add('Waitrose King Gold Kiwi (each, as printed WR KING GOLD KIWI)', '🥦 Fruit & Veg', '🥝', 'waitrose', 1.16, '16 Nov', WA + ': WR KING GOLD KIWI 1.16');
add('Waitrose Richly Fruited Hot Cross Buns (as printed WR RICHLY FRUIT HXB, size not confirmed)', '🍞 Bread & Bakery', '🍞', 'waitrose', 2.61, '16 Nov', WA + ': WR RICHLY FRUIT HXB 2.61');
add('Waitrose Loose Baby Potatoes (per kg, as printed WR LSE BABY POTS)', '🥦 Fruit & Veg', '🥔', 'waitrose', 1.34, '4 Nov', WB + ': WR LSE BABY POTS 0.450kg @ £1.34/kg (price per kg)');
add('Waitrose Essential Petits Pois (as printed WR ESS PETIT POIS, size not confirmed)', '🧊 Frozen', '🫛', 'waitrose', 2.79, '4 Nov', WB + ': WR ESS PETIT POIS 2.79 (row 15186 725g is 1.74, so likely a larger bag)');
add('Waitrose Duchy Organic Plain Flour (as printed WR DORG FLOUR PLAIN, size not confirmed)', '🍝 Pantry', '🌾', 'waitrose', 3.14, '4 Nov', WB + ': WR DORG FLOUR PLAIN 3.14');
add('Waitrose Essential Little Gem Lettuce (as printed ESS GEM LETTUCE, size not confirmed)', '🥦 Fruit & Veg', '🥬', 'waitrose', 0.93, '4 Nov', WB + ': ESS GEM LETTUCE 0.93');
add('Waitrose Corned Beef (as printed WR CORNED BEEF, size not confirmed)', '🥩 Meat & Fish', '🥩', 'waitrose', 4.53, '4 Nov', WB + ': WR CORNED BEEF 4.53 (CookMeat 2 for 6.50 with ox tongue)');
add('H/F Free Range Extra Large Jersey Eggs (as printed H/F FR EX/LGE J/EGGS, pack size not confirmed)', '🥛 Dairy & Eggs', '🥚', 'waitrose', 3.00, '4 Nov', WB + ': H/F FR EX/LGE J/EGGS 3.00');
add('H/F Free Range Large Jersey Eggs (as printed H/F FR LARGE J/EGGS, pack size not confirmed)', '🥛 Dairy & Eggs', '🥚', 'waitrose', 2.90, '4 Nov', WB + ': H/F FR LARGE J/EGGS 2.90');
add('M&S Classic Mince Pies (as printed CLASSIC MINCE, pack size not confirmed)', '🍞 Bread & Bakery', '🥧', 'ms', 3.10, '4 Nov', MC + ': CLASSIC MINCE 3.10');
add('M&S Supersoft Thick Sliced Bread (as printed SUPERSOFT THI, size not confirmed)', '🍞 Bread & Bakery', '🍞', 'ms', 0.95, '4 Nov', MC + ': SUPERSOFT THI 0.95');
add('M&S Beef Lasagne (as printed BEEF LASAGNE, size not confirmed)', '🥗 Deli & Salads', '🍝', 'ms', 7.75, '25 Nov', MD + ': BEEF LASAGNE 7.75');
add('M&S Coquilles St Jacques, larger pack (as printed COQUILLE ST J at 9.25)', '🥩 Meat & Fish', '🐚', 'ms', 9.25, '25 Nov', MD + ': COQUILLE ST J 9.25 (row 18512 same print at 5.55 on 21 Nov, so a different pack)');
add('M&S Pepperoni Pizza Serves 2 (as printed PEP PIZZA SV2)', '🥗 Deli & Salads', '🍕', 'ms', 7.50, '25 Nov', MD + ': PEP PIZZA SV2 7.50 (x2; Pizza Dine In 14.70 deal)');
add('M&S Halloumi Fries (as printed HALLOUMI FRIE, size not confirmed)', '🥗 Deli & Salads', '🧀', 'ms', 5.60, '25 Nov', MD + ': HALLOUMI FRIE 5.60 (in Pizza Dine In deal)');
add('M&S Fried Chicken Bites (as printed FRID CHKN BIT, size not confirmed)', '🥩 Meat & Fish', '🍗', 'ms', 4.95, '25 Nov', MD + ': FRID CHKN BIT 4.95 (in Pizza Dine In deal)');
add('M&S Organic Chicken Breast Fillets (as printed ORG BREAST FL, size not confirmed)', '🥩 Meat & Fish', '🍗', 'ms', 8.70, '25 Nov', MD + ': ORG BREAST FL 8.70 | ' + MC + ': ORG BREAST FL 8.40 (older receipt)');
add('M&S Mini Pork Pies 6 Pack (as printed MM PRK PIE 6)', '🥩 Meat & Fish', '🥧', 'ms', 4.00, '25 Nov', MD + ': MM PRK PIE 6 4.00');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
