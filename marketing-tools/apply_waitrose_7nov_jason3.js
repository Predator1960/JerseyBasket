// Waitrose St Helier receipt 7 Nov 10:29 (Jason L, competition entry; Visa 8450 / myWaitrose 2950).
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
// 36 items, sum 102.02 less Deli Meats 2 for 5 (2.78) = 99.24 (matches). Not stored: FVH 1.00 (not identified); weighed lines (sweet potatoes, broccoli, bananas, parsnips).
const D = '7 Nov', WR = 'Waitrose St Helier shopper receipt 7 Nov 10:29 (Jason L)';
const wDate = id => { const o = evalRow(lines[find(id)]); return (o.upds && o.upds.waitrose) || ((o.prices.waitrose || 0) > 0 ? o.upd : ''); };
const older = id => { const d = wDate(id); return !d || dval(d) < dval(D); };
function ifOlder(id, price, note) {
  if (older(id)) { setPrice(id, 'waitrose', price, D, WR + ': ' + note); console.log('set', id, price); }
  else { addNote(id, WR + ': ' + note + ' [not applied, row has a newer Waitrose price]'); console.log('kept newer', id); }
}
ifOlder(430, 1.65, 'JD 1% FAT MILK 1.65 x2');
ifOlder(14163, 3.89, 'WR BRIT BREADED HAM 3.89 x2 (Deli Meats 2 for 5.00 deal, regular price stored)');
ifOlder(14249, 10.44, 'WR FR PORK BELLY JNT 10.44 (700g assumed)');
ifOlder(14489, 5.75, 'WR CHICKEN LEEK PIE 5.75 (550g assumed)');
ifOlder(14340, 5.98, 'CM STROMBOLI PIZZA 5.98');
ifOlder(15186, 1.74, 'WR ESS PETITS POIS 1.74 (725g assumed)');
ifOlder(4003, 3.97, 'BISTO BEST BEEF 3.97 (230g assumed)');
ifOlder(5573, 2.88, 'YORKSHIRE TEA 40S 2.88');
ifOlder(30, 1.74, 'WR MGRN FH LOAF 800G 1.74');
ifOlder(9619, 0.76, 'WR SWEDE 0.76');
const NEW = [
 ['Lucozade Energy Orange Multipack (size not confirmed)', '🥤 Drinks', '🥤', 3.93, 'LUCOZADE ENERGY ORGN 3.93'],
 ['Waitrose Essential Original Washing Up Liquid (size not confirmed)', '🧹 Household', '🧴', 0.80, 'WR ESS ORIGINAL WUL 0.80 (WUL = washing up liquid, assumed)'],
 ['Waitrose Apple & Pear Chutney (size not confirmed)', '🍝 Pantry', '🫙', 3.25, 'WR APPL PEAR CHUTNEY 3.25'],
 ['Aspall Cyder Vinegar (size not confirmed)', '🍝 Pantry', '🍎', 3.48, 'ASPALL CYDER VINEGAR 3.48'],
 ['Waitrose Essential Mature Cheddar (size not confirmed)', '🥛 Dairy & Eggs', '🧀', 3.11, 'WR ESS MAT CHEDDAR 3.11'],
 ['Waitrose Garlic Doughballs (size not confirmed)', '🥗 Deli & Salads', '🧄', 4.20, 'WR GARLIC DOUGHBALLS 4.20'],
 ['Waitrose Essential Lambs Liver (size not confirmed)', '🥩 Meat & Fish', '🥩', 2.50, 'WR ESS LAMBS LIVER 2.50'],
 ['Waitrose British Lamb Kidneys (size not confirmed)', '🥩 Meat & Fish', '🥩', 2.16, 'BRIT LAMB KIDNEYS 2.16'],
 ['Waitrose No.1 White Sourdough 1kg', '🍞 Bread & Bakery', '🍞', 3.71, 'NO1 WHT SDOUGH 1KG 3.71'],
 ['V Bakery Rolls (size not confirmed)', '🍞 Bread & Bakery', '🍞', 3.25, 'V BAKERY ROLLS 3.25'],
 ['Waitrose Trimmed Brussels Sprouts 330g', '🥦 Fruit & Veg', '🥬', 1.00, 'WR TRM B SPROUT 330G 1.00'],
 ['Waitrose Blueberries (small pack, size not confirmed)', '🥦 Fruit & Veg', '🫐', 2.90, 'WR BLUEBS 2.90'],
 ['Waitrose Salted Crisps (size not confirmed)', '🍿 Snacks', '🥔', 2.35, 'WR SALTED CRISPS 2.35'],
 ['Peroni Nastro Azzurro 4 x 440ml Cans', '🍷 Wine & Beer', '🍺', 6.20, 'PERONI 4X440ML CAN 6.20'],
 ['Channel Island Cherry Vine Tomatoes (size not confirmed)', '🥦 Fruit & Veg', '🍅', 2.50, 'CISLAND C VINE TOMS 2.50'],
 ['Aquafresh Complete Care Whitening Toothpaste (not confirmed)', '💊 Health & Beauty', '🪥', 2.09, 'AQF CMP CR WHITE 2.09'],
 ['Reach Toothbrushes (size not confirmed)', '💊 Health & Beauty', '🪥', 2.69, 'REACH TOOTHBRUSHES 2.69'],
 ['H/F Free Range Medium Jersey Eggs (size not confirmed)', '🥛 Dairy & Eggs', '🥚', 2.80, 'H/F FR MED J/EGGS 2.80'],
];
let at = find(16085), id = 16086;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + n[3] + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
