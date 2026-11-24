// Jason L (app 24 Nov 17:44-17:46, 16 uploads = 12 photos, 4 sent twice): Co-op Five Oaks 10 Nov 12:02 and 21 Nov 10:31; Waitrose St Helier 334 14 Nov 10:11 and 21 Nov 09:57; Waitrose St Saviour 332 24 Nov 16:05
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
const C10 = 'Co-op branch: Five Oaks (Jason L receipt 10 Nov 12:02)';
const C21 = 'Co-op branch: Five Oaks (Jason L receipt 21 Nov 10:31)';
const W21 = 'Waitrose branch: St Helier 334 (Jason L receipt 21 Nov 09:57)';
const W14 = 'Waitrose branch: St Helier 334 (Jason L receipt 14 Nov 10:11)';
const W24 = 'Waitrose branch: St Saviour 332 (Jason L receipt 24 Nov 16:05, scan & go)';
// Co-op 10 Nov
addNote(3008, C10 + ': D Act Rhub 4X115g 3.10');
addNote(430, C10 + ': Jersey Dairy 1% F 1.64');
addNote(4042, C10 + ': Saldomar Sea Salt 1.45');
addNote(1263, C10 + ': Warb 8 Crump Thins 1.05 at the till');
addNote(4871, C10 + ': Cp S/R Wht Flour 1.05 (members -0.15)');
addNote(18412, C10 + ': Cath City Mat Ched 3.65');
// Co-op 21 Nov
addNote(3008, C21 + ': D Act Rhub 4X115g 2 @ 1.85 (offer)');
addNote(3191, C21 + ': Cp Plums Punnet 2.00 (members -0.25)');
addNote(5432, C21 + ': Colmns Brmley Appl 2.40 (members -1.20)');
addNote(2906, C21 + ': Cp Honey Roast Ham 3.19');
addNote(4278, C21 + ': Lu Pet Beurr 167G 1.31 at the till');
addNote(3015, C21 + ': Dairylea Slices 1.85');
addNote(2900, C21 + ': Cp Broccoli 1.45 (members -0.30)');
// Waitrose 14 Nov 10:11
rec(7677, 'waitrose', 0.64, '14 Nov', W14 + ': WR ESS BKD BEANS TMT 0.64');
rec(7958, 'waitrose', 1.45, '14 Nov', W14 + ': ESS PEAR HLV IN JUIC 1.45');
rec(16097, 'waitrose', 2.90, '14 Nov', W14 + ': WR BLUEBS 2.90');
rec(7812, 'waitrose', 0.82, '14 Nov', W14 + ': ESS EVAP MILK 170G 0.82');
rec(932, 'waitrose', 1.04, '14 Nov', W14 + ': CIRIO CHOPPED TOMS 1.04');
rec(18502, 'waitrose', 5.46, '14 Nov', W14 + ': ARIEL ORIGINAL GEL 5.46');
addNote(9618, W14 + ': FAIRTRADE BANANAS 1.28/kg');
addNote(2912, W14 + ': ELMLEA DOUBLE 2.44 (size not printed, not stored)');
rec(889, 'waitrose', 1.05, '14 Nov', W14 + ': ESS ICBRG LETTUCE 1.05');
rec(7539, 'waitrose', 0.99, '14 Nov', W14 + ': WR ESS LARGE POTS 4S 0.99');
addNote(7551, W14 + ': WR PRIPE AVO LRG 1.00 at the till');
rec(5167, 'waitrose', 2.19, '14 Nov', W14 + ': MR SHEEN MS POLISH 2.19');
rec(16092, 'waitrose', 2.50, '14 Nov', W14 + ': WR ESS LAMBS LIVER 2.50');
rec(16093, 'waitrose', 2.13, '14 Nov', W14 + ': BRIT LAMB KIDNEYS 2.13');
rec(15137, 'waitrose', 6.62, '14 Nov', W14 + ': WR ESS PEELED PRAWNS 6.62');
rec(15198, 'waitrose', 1.74, '14 Nov', W14 + ': WR CRINKLE CUT CHIPS 1.74');
rec(4677, 'waitrose', 2.55, '14 Nov', W14 + ': WALKERS R/CHICKEN 2.55 (multipack assumed)');
rec(15980, 'waitrose', 4.53, '14 Nov', W14 + ': WR GB HONEY HAM TC 4.53 x2 (CookMeat 2 for 6.50)');
rec(7718, 'waitrose', 3.06, '14 Nov', W14 + ': PIPERS SALT 3.06');
rec(4408, 'waitrose', 2.30, '14 Nov', W14 + ': WEETABIX 2.30 (12 pack assumed)');
rec(4221, 'waitrose', 1.90, '14 Nov', W14 + ': TUC ORIGINAL CRACKER 1.90');
rec(14595, 'waitrose', 1.11, '14 Nov', W14 + ': ESS SAVOY CABB 1.11');
rec(3889, 'waitrose', 1.16, '14 Nov', W14 + ': A/DELIGHT B\'SCOTCH 1.16');
// Waitrose 21 Nov 09:57
rec(15890, 'waitrose', 8.59, '21 Nov', W21 + ': WR XL WHOLE CHICKEN 8.59 (by weight)');
rec(430, 'waitrose', 1.65, '21 Nov', W21 + ': JD 1% FAT MILK 1.65 x2 (also x2 on 14 Nov)');
rec(868, 'waitrose', 3.02, '21 Nov', W21 + ': STORK SPREAD 3.02');
addNote(4305, W21 + ': BAHLSEN DRK LEIBNIZ 1.60 at the till');
rec(7745, 'waitrose', 1.86, '21 Nov', W21 + ': MCVITIES DIGESTIVE 1.86 (also 1.86 on 14 Nov)');
rec(5558, 'waitrose', 4.26, '21 Nov', W21 + ': PG TIPS TEA BAGS 80S 4.26');
addNote(3004, W21 + ': BERTOLLI OLIVE SPR 2.90 at the till (size not printed)');
rec(18271, 'waitrose', 2.30, '21 Nov', W21 + ': WR PORK SAUSAGES 2.30');
rec(7582, 'waitrose', 1.57, '21 Nov', W21 + ': WR LSE CAULIFLOWER 1.57 (also 14 Nov)');
rec(16059, 'waitrose', 1.51, '21 Nov', W21 + ': WR ONIONS 4S 1.51 (also 14 Nov)');
rec(14611, 'waitrose', 0.93, '21 Nov', W21 + ': WR ESS CARROTS 0.93 (also 14 Nov)');
rec(18362, 'waitrose', 2.65, '21 Nov', W21 + ': GROS PAIN 2.65');
rec(16006, 'waitrose', 4.64, '21 Nov', W21 + ': WR BLUEBERRIES 300G 4.64');
rec(16090, 'waitrose', 3.11, '21 Nov', W21 + ': WR ESS MAT CHEDDAR 3.11 (also 3.11 on 14 Nov)');
// Waitrose 24 Nov 16:05
rec(17973, 'waitrose', 1.74, '24 Nov', W24 + ': WR TRMD LEEKS 400G 1.74');
rec(7528, 'waitrose', 1.34, '24 Nov', W24 + ': WR CHESTNUT M\'ROOMS 1.34');
rec(18416, 'waitrose', 4.93, '24 Nov', W24 + ': WR THICK SMK BACON 4.93 x2 (BaconEgg 2 for 6.50)');
rec(15890, 'waitrose', 8.72, '24 Nov', W24 + ': WR XL WHOLE CHICKEN 8.72 (by weight)');
rec(14143, 'waitrose', 3.89, '24 Nov', W24 + ': WR BRIT HNY RST HAM 3.89 x2 (Deli meats 2 for 5)');
rec(430, 'waitrose', 1.65, '24 Nov', W24 + ': JD 1% FAT MILK 1.65 x2');
rec(13724, 'waitrose', 2.39, '24 Nov', W24 + ': WR RED GRAPE JUICE 2.39');
rec(5067, 'waitrose', 1.16, '24 Nov', W24 + ': BRANSTON BAKED BEANS 1.16 x2 (2 for 1.70)');
rec(9846, 'waitrose', 1.45, '24 Nov', W24 + ': MUTTI DBLE TOM PUREE 1.45 x2');
rec(5110, 'waitrose', 2.03, '24 Nov', W24 + ': HEINZ CN SOUP 2.03 (Heinz soup 3 for 4)');
rec(2060, 'waitrose', 2.03, '24 Nov', W24 + ': HEINZ VEGETABLE SOUP 2.03 (Heinz soup 3 for 4)');
rec(16074, 'waitrose', 2.09, '24 Nov', W24 + ': JACKSON WHIE BLOOMER 2.09');
rec(10418, 'waitrose', 2.15, '24 Nov', W24 + ': TILDA COCONUT RICE 2.15 x3 (Tilda 2 for 2)');
rec(4409, 'waitrose', 3.05, '24 Nov', W24 + ': READY BREK ORIGINAL 3.05');
addNote(7862, W24 + ': KLGS CORNFLAKES 3.17 at the till (pack size not printed)');
rec(4673, 'waitrose', 2.30, '24 Nov', W24 + ': POPCHIPS BARBEQUE 2.30 (Popchips 2 for 3.50)');
rec(18378, 'waitrose', 3.47, '24 Nov', W24 + ': FAIRY FAB CON 48W 3.47');
rec(9517, 'waitrose', 1.49, '24 Nov', W24 + ': MINI GEMS 1.49');
rec(12436, 'waitrose', 1.99, '24 Nov', W24 + ': SHADES STRAWB 1.99 x3');
const NC = ', size not confirmed)';
const NEWROWS = [
  ['Co-op Pork Leg Joint (as printed Co-op Pork Leg Joint, weight not confirmed)', '🥩 Meat & Fish', '🥩', 'coop', 7.64, '21 Nov', C21, 'Co-op Pork Leg Joint 7.64'],
  ['John West Tuna Chunks in Spring Water (as printed JW TUNA CHUNKS SPW, single tin' + NC, '🥫 Tins & Jars', '🐟', 'waitrose', 1.75, '21 Nov', W21, 'JW TUNA CHUNKS SPW 1.75'],
  ['Waitrose Essential Reduced Sugar & Salt Baked Beans, small (as printed ESS RSS BEANS SML' + NC, '🥫 Tins & Jars', '🫘', 'waitrose', 0.47, '21 Nov', W21, 'ESS RSS BEANS SML 0.47'],
  ['Waitrose Pure Clear Honey (as printed WR PURE HONEY CLEAR' + NC, '🍝 Pantry', '🍯', 'waitrose', 1.90, '21 Nov', W21, 'WR PURE HONEY CLEAR 1.90'],
  ['Waitrose Essential Pear Halves (as printed WR ESS PEAR HALVES' + NC, '🥫 Tins & Jars', '🍐', 'waitrose', 1.05, '21 Nov', W21, 'WR ESS PEAR HALVES 1.05'],
  ['Parmentier Sardines (as printed PARMENTIER SARDINES, variant' + NC, '🥫 Tins & Jars', '🐟', 'waitrose', 2.85, '21 Nov', W21, 'PARMENTIER SARDINES 2.85'],
  ['Waitrose Chocolate Twist (as printed WR CHOC TWIST' + NC, '🍞 Bread & Bakery', '🥐', 'waitrose', 1.69, '21 Nov', W21, 'WR CHOC TWIST 1.69 (also 1.69 on 14 Nov)'],
  ['Waitrose Frozen Breaded Hake (as printed WR FF BRD HAKE' + NC, '🧊 Frozen', '🐟', 'waitrose', 7.48, '21 Nov', W21, 'WR FF BRD HAKE 7.48'],
  ['Waitrose Swede (each, as printed WR SWEDE)', '🥦 Fruit & Veg', '🥔', 'waitrose', 0.82, '21 Nov', W21, 'WR SWEDE 0.82 (also 0.82 on 14 Nov)'],
  ['Waitrose Soft White Farmhouse Loaf (as printed WR SOFT WHITE FH' + NC, '🍞 Bread & Bakery', '🍞', 'waitrose', 1.45, '21 Nov', W21, 'WR SOFT WHITE FH 1.45'],
  ['Waitrose Essential Apple Sauce (as printed WR ESS APPLE SAUCE' + NC, '🍝 Pantry', '🍎', 'waitrose', 1.74, '14 Nov', W14, 'WR ESS APPLE SAUCE 1.74'],
  ['Mutti Bolognese Sauce (as printed MUTTI BOLOGNESE SAU' + NC, '🍝 Pantry', '🍅', 'waitrose', 2.53, '14 Nov', W14, 'MUTTI BOLOGNESE SAU 2.53'],
  ['Greene King IPA (as printed GREENE KING IPA, pack' + NC, '🍷 Wine & Beer', '🍺', 'waitrose', 4.92, '14 Nov', W14, 'GREENE KING IPA 4.92'],
  ['Waitrose Cooks\' Ingredients Flat Leaf Parsley (as printed WR CI FLAT PARSLEY' + NC, '🥦 Fruit & Veg', '🌿', 'waitrose', 0.87, '14 Nov', W14, 'WR CI FLAT PARSLEY 0.87'],
  ['Waitrose Native Breed 15% Fat Beef Mince (as printed WR NB 15% MINCE' + NC, '🥩 Meat & Fish', '🥩', 'waitrose', 8.12, '14 Nov', W14, 'WR NB 15% MINCE 8.12'],
  ['Antibacterial Biodegradable Floor Wipes (as printed ANTIBAC BIO FL WIPES, brand' + NC, '🧹 Household', '🧽', 'waitrose', 1.25, '14 Nov', W14, 'ANTIBAC BIO FL WIPES 1.25'],
  ['Waitrose Smoked Haddock (as printed WR SMOKED HADDOCK' + NC, '🥩 Meat & Fish', '🐟', 'waitrose', 7.57, '14 Nov', W14, 'WR SMOKED HADDOCK 7.57'],
  ['Waitrose Saucisson Sec (as printed WR SAUCISSON SEC' + NC, '🥗 Deli & Salads', '🥓', 'waitrose', 4.06, '14 Nov', W14, 'WR SAUCISSON SEC 4.06'],
  ["Carr's Melts Original (as printed CARRS MELTS ORIGINAL" + NC, '🍪 Biscuits', '🍘', 'waitrose', 2.42, '14 Nov', W14, 'CARRS MELTS ORIGINAL 2.42'],
  ['Cadbury Flake (as printed CADBURY FLAKE, pack' + NC, '🍫 Confectionery', '🍫', 'waitrose', 1.75, '14 Nov', W14, 'CADBURY FLAKE 1.75'],
  ['Lindt Lindor Milk (as printed LINDT LINDOR MILK' + NC, '🍫 Confectionery', '🍫', 'waitrose', 2.98, '14 Nov', W14, 'LINDT LINDOR MILK 2.98'],
  ['Waitrose Multigrain Loaf (as printed WR MULTIGRAIN LOAF' + NC, '🍞 Bread & Bakery', '🍞', 'waitrose', 1.74, '14 Nov', W14, 'WR MULTIGRAIN LOAF 1.74'],
  ["Colman's Bread Sauce Mix (as printed COLMANS BREAD MIX" + NC, '🍝 Pantry', '🥣', 'waitrose', 1.16, '14 Nov', W14, 'COLMANS BREAD MIX 1.16'],
  ['Duchy Organic Celery (as printed DORG CELERY' + NC, '🥦 Fruit & Veg', '🥬', 'waitrose', 1.74, '24 Nov', W24, 'DORG CELERY 1.74'],
  ['Waitrose No.1 4 Free Range Pork Sausages (as printed WR1 4 FR PORK SAUS' + NC, '🥩 Meat & Fish', '🌭', 'waitrose', 4.56, '24 Nov', W24, 'WR1 4 FR PORK SAUS 4.56'],
  ['Lurpak Garlic Butter (as printed LURPAK GARLIC BUTTER' + NC, '🥛 Dairy & Eggs', '🧈', 'waitrose', 3.60, '24 Nov', W24, 'LURPAK GARLIC BUTTER 3.60 x2'],
  ['Heinz Tomato Soup No Added Sugar (as printed HEINZ TOM SOUP NAS' + NC, '🥫 Tins & Jars', '🍅', 'waitrose', 2.03, '24 Nov', W24, 'HEINZ TOM SOUP NAS 2.03 (Heinz soup 3 for 4)'],
  ['Heinz Carrot & Coriander Soup (as printed HNZ CRRT&CRNDER SOUP' + NC, '🥫 Tins & Jars', '🥕', 'waitrose', 2.09, '24 Nov', W24, 'HNZ CRRT&CRNDER SOUP 2.09'],
  ['Tilda Coconut, Chilli & Lemongrass Rice (as printed TILDA CCNT CHIL RICE' + NC, '🍝 Pantry', '🍚', 'waitrose', 2.15, '24 Nov', W24, 'TILDA CCNT CHIL RICE 2.15 (Tilda 2 for 2)'],
  ['Tilda Sweet Chilli & Lime Rice (as printed TILDA S/CHL LME RICE' + NC, '🍝 Pantry', '🍚', 'waitrose', 2.15, '24 Nov', W24, 'TILDA S/CHL LME RICE 2.15 x2 (Tilda 2 for 2)'],
  ['Dumpling Mix (as printed AB DUMPLING MIX, brand' + NC, '🍝 Pantry', '🥣', 'waitrose', 1.16, '24 Nov', W24, 'AB DUMPLING MIX 1.16 x2'],
  ['Popchips Sour Cream & Onion (as printed POPCHIPS SOUR CREAM' + NC, '🥨 Snacks & Treats', '🥔', 'waitrose', 2.30, '24 Nov', W24, 'POPCHIPS SOUR CREAM 2.30 (Popchips 2 for 3.50)'],
  ["Peter's Yard Rosemary & Sea Salt Crackers (as printed PYARD ROSEMARY&SALT" + NC, '🍪 Biscuits', '🍘', 'waitrose', 2.05, '24 Nov', W24, 'PYARD ROSEMARY&SALT 2.05'],
  ["Peter's Yard Oat & Honey Sourdough Crackers (as printed P/Y OATHONEY SDOUGH" + NC, '🍪 Biscuits', '🍘', 'waitrose', 3.05, '24 Nov', W24, 'P/Y OATHONEY SDOUGH 3.05'],
  ["Tony's Chocolonely Dark Chocolate (as printed TONY'S DARK CHOC" + NC, '🍫 Confectionery', '🍫', 'waitrose', 3.98, '24 Nov', W24, "TONY'S DARK CHOC 3.98"],
  ["Tony's Chocolonely Milk Chocolate (as printed TONY'S MILK CHOCO" + NC, '🍫 Confectionery', '🍫', 'waitrose', 3.98, '24 Nov', W24, "TONY'S MILK CHOCO 3.98"],
  ['Strawberry Pencils (as printed STRAWB PENCILS, brand' + NC, '🍫 Confectionery', '🍬', 'waitrose', 0.70, '24 Nov', W24, 'STRAWB PENCILS 0.70 x5'],
];
const cats = new Set(lines.map(l => (l.match(/cat:"([^"]+)"/) || [])[1]).filter(Boolean));
const badCats = [...new Set(NEWROWS.map(r => r[1]).filter(c => !cats.has(c)))];
if (badCats.length) { console.log('UNKNOWN CATEGORIES', badCats); process.exit(1); }
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, store, price, d, src, note]) => { const p = S.map(s => s + ':' + (s === store ? price : 0)).join(','); lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{' + p + '}, upd:"' + d + '"}, // ' + src + ': ' + note); console.log(nid, note); nid++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done', NEWROWS.length, 'new rows');
