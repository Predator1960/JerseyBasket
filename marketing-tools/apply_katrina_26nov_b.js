// Katrina B (app 26 Nov 13:00): Morrisons Daily St Ouen 26 Nov 12:57 (52 items, 36 products; Radox x3, Colgate x2 and roses x4 not counted)
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
const C = 'Morrisons branch: Daily St Ouen (Katrina B receipt 26 Nov 12:57)';
rec(384, 'morrisons', 3.20, '26 Nov', C + ': EXPLORE GREEN GRAPES 3.20 and EXPLORE RED GRAPES 3.20');
rec(88, 'morrisons', 3.00, '26 Nov', C + ': MORRISONS RASPBERRIES 2 x 3.00 (fruit deal)');
rec(3506, 'morrisons', 3.63, '26 Nov', C + ': BONNE MAMAN CREME CARAMEL 3.63');
rec(8942, 'morrisons', 4.50, '26 Nov', C + ': LEA & PERRIN WORCESTER 4.50 (290ml assumed)');
rec(13895, 'morrisons', 4.00, '26 Nov', C + ': KP PEANUTS ORIGINAL SALTED REC 4.00 (reclosable bag, size assumed; nuts offer)');
rec(13894, 'morrisons', 4.00, '26 Nov', C + ': KP PEANUTS DRY ROASTED RECLOSE 4.00 (reclosable bag, size assumed; nuts offer)');
rec(4626, 'morrisons', 3.05, '26 Nov', C + ': HULA HOOPS ORIGINAL 6PK 3.05');
rec(4300, 'morrisons', 3.05, '26 Nov', C + ': NATURE VALLEY OATS & HONEY 2 x 3.05');
rec(7111, 'morrisons', 1.38, '26 Nov', C + ': WARBURTONS CRUMPETS 1.38');
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
const P = { coop:0, morrisons:0, ms:0, waitrose:0, iceland:0, alliance:0 };
function add(name, cat, icon, price, note) {
  const pr = { ...P, morrisons: price };
  lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:"' + cat + '", icon:"' + icon + '", prices:{' + Object.keys(P).map(s => s + ':' + pr[s]).join(',') + '}, upd:"26 Nov"}, // ' + C + ': ' + note);
  console.log(nid, name, price); nid++;
}
add('Morrisons Ready to Eat Avocado (as printed MORRISONS READY TO EAT AVOCADO, pack size not confirmed)', '🥦 Fruit & Veg', '🥑', 2.15, 'MORRISONS READY TO EAT AVOCADO 2 x 2.15 (fruit deal)');
add('Morrisons Cold Water Prawns (as printed MORRISONS COLD WATER PRAWNS, size not confirmed)', '🥩 Meat & Fish', '🦐', 4.65, 'MORRISONS COLD WATER PRAWNS 4.65');
add('Morrisons Cooked & Peeled King Prawns (as printed MORRISONS COOKED & PEELED KING, size not confirmed)', '🥩 Meat & Fish', '🦐', 4.40, 'MORRISONS COOKED & PEELED KING 2 x 4.40 (meat & fish deal)');
add('Morrisons Strawberry Trifles (as printed MORRISONS TRIFLES STRAWBERRY, pack size not confirmed)', '🍰 Cakes & Desserts', '🍓', 3.15, 'MORRISONS TRIFLES STRAWBERRY 3.15');
add('Loose Baking Potatoes (per kg, as printed LOOSE BAKING POTATOES)', '🥦 Fruit & Veg', '🥔', 1.30, 'LOOSE BAKING POTATOES 1.245kg @ £1.30/kg (price per kg)');
add('Morrisons Tomato Juice (as printed MORRISONS TOMATO JUICE, size not confirmed)', '🥤 Drinks', '🍅', 1.95, 'MORRISONS TOMATO JUICE 1.95');
add('Morrisons Vanilla Crème Caramel (as printed MORRISONS VANILLA CREME CARAME, pack size not confirmed)', '🍰 Cakes & Desserts', '🍮', 3.15, 'MORRISONS VANILLA CREME CARAME 3.15');
add('Morrisons Celery (as printed MORRISONS CELERY)', '🥦 Fruit & Veg', '🥬', 1.05, 'MORRISONS CELERY 1.05');
add('Alpro Almond Milk Unsweetened (as printed ALPRO ALMOND MILK UNSWEETENED, size not confirmed)', '🥛 Dairy & Eggs', '🥛', 3.10, 'ALPRO ALMOND MILK UNSWEETENED 3.10');
add('Morrisons Edam Wedge (as printed MORRISONS EDAM WEDGE, size not confirmed)', '🥛 Dairy & Eggs', '🧀', 4.40, 'MORRISONS EDAM WEDGE 4.40');
add('Morrisons Extra Mature Cheddar (as printed MORRISONS CHEDDAR EXTRA MATURE, size not confirmed)', '🥛 Dairy & Eggs', '🧀', 4.15, 'MORRISONS CHEDDAR EXTRA MATURE 4.15');
add('Morrisons Large Free Range Eggs, larger pack (as printed MORRISONS LARGE FREE RANGE EGG at 4.50)', '🥛 Dairy & Eggs', '🥚', 4.50, 'MORRISONS LARGE FREE RANGE EGG 4.50 (row 8022 6-pack is 2.00, so likely 12)');
add('Grissini Rustici Breadsticks (as printed GRISSINI RUSTICI BREADSTICKS, size not confirmed)', '🍞 Bread & Bakery', '🥖', 1.90, 'GRISSINI RUSTICI BREADSTICKS 1.90');
add('Morrisons Ginger Nuts (as printed MORRISONS GINGER NUTS, size not confirmed)', '🍪 Biscuits', '🍪', 1.05, 'MORRISONS GINGER NUTS 1.05');
add('Pretzel Twists (as printed ...OSEM PRETZEL TWISTS, brand and size not confirmed)', '🥨 Snacks & Treats', '🥨', 4.50, 'OSEM PRETZEL TWISTS 4.50 (first letters cut off in the photo)');
add('TUC Crackers (as printed TUC CRACKERS, size not confirmed)', '🥨 Snacks & Treats', '🍘', 2.10, 'TUC CRACKERS 2.10');
add('Morrisons Ripe & Ready Conference Pears (as printed MORRISONS RIPE & READY CONFERE, pack size not confirmed)', '🥦 Fruit & Veg', '🍐', 3.15, 'MORRISONS RIPE & READY CONFERE 3.15');
add('Morrisons The Best Piccolina Vine Tomatoes (as printed MORRISONS BEST PICCOLINA VINE, size not confirmed)', '🥦 Fruit & Veg', '🍅', 3.05, 'MORRISONS BEST PICCOLINA VINE 3.05 (x2)');
add('Morrisons Watercress (as printed MORRISONS WATERCRESS, size not confirmed)', '🥦 Fruit & Veg', '🥬', 1.70, 'MORRISONS WATERCRESS 1.70');
add('Morrisons Sweet & Crispy Salad (as printed MORRISONS SWEET & CRISPY SALAD, size not confirmed)', '🥦 Fruit & Veg', '🥗', 2.00, 'MORRISONS SWEET & CRISPY SALAD 2.00');
add('Morrisons Fig Rolls (as printed MORRISONS FIG ROLL, size not confirmed)', '🍪 Biscuits', '🍪', 0.97, 'MORRISONS FIG ROLL 0.97');
add('Warburtons Five Seed Batch (as printed WARBURTONS FIVE SEED BATCH, size not confirmed)', '🍞 Bread & Bakery', '🍞', 2.15, 'WARBURTONS FIVE SEED BATCH 2.15');
add('Vienna Batons 2 Pack (as printed VIENNA BATONS 2PK)', '🍞 Bread & Bakery', '🥖', 1.74, 'VIENNA BATONS 2PK 1.74');
add('Jordans Crunchy Oat Granola (as printed JORDANS CRUNCHY OAT GRANOLA FR, flavour and size not confirmed)', '🍝 Pantry', '🥣', 4.80, 'JORDANS CRUNCHY OAT GRANOLA FR 4.80');
add('Morrisons Dog Food Beef Pâté (as printed MORRISONS DOG FOOD BEEF PATE, size not confirmed)', '🐾 Pet Care', '🐕', 0.80, 'MORRISONS DOG FOOD BEEF PATE 0.80 (x2)');
add('Morrisons Dog Food Chicken Pâté (as printed MORRISONS DOG FOOD CHICKEN PAT, size not confirmed)', '🐾 Pet Care', '🐕', 0.80, 'MORRISONS DOG FOOD CHICKEN PAT 0.80 (x2)');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
