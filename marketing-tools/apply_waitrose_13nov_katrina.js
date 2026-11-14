// Waitrose St Saviour 332 receipt 13 Nov 11:35 (Katrina B, competition entry): 49 lines counted incl. 5 reduced items (counted, not stored). Totals section not in photos, so no sum check.
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
const D = '13 Nov', WR = 'Waitrose branch: St Saviour 332 (Katrina B receipt 13 Nov)';
setPrice(15934, 'waitrose', 2.73, D, WR + ': J20 APPLE & RASP CAN 2.73');
setPrice(18257, 'waitrose', 1.25, D, WR + ': PELLEGRINO WATER 2 x 1.25');
setPrice(384, 'waitrose', 2.90, D, WR + ': WR GRN GRAPES 500G 2 x 2.90');
setPrice(16019, 'waitrose', 1.22, D, WR + ': WR BUTTERMILK 1.22');
setPrice(2641, 'waitrose', 1.65, D, WR + ': JDAIRY FAT RED MILK 2 x 1.65');
setPrice(9806, 'waitrose', 4.05, D, WR + ': BE 22 CHICKEN DIPPER 4.05');
setPrice(7535, 'waitrose', 2.41, D, WR + ': WR PLADY APPLES 4S 2.41 (was 2.60)');
setPrice(7111, 'waitrose', 1.28, D, WR + ': WARBURTONS CRUMPETS 1.28');
setPrice(16056, 'waitrose', 1.64, D, WR + ': CDM 70G COINS 1.64');
setPrice(15933, 'waitrose', 2.09, D, WR + ': WR ESS STILL WATER 2.09');
setPrice(15512, 'waitrose', 4.97, D, WR + ': OVEN PRIDE CLEANER 4.97');
setPrice(8904, 'waitrose', 3.89, D, WR + ': OXO BEEF STOCK CUBES 3.89 (size assumed from row)');
const P = '🍝 Pantry', M = '🥩 Meat & Fish', H = '🧹 Household', F = '🥦 Fruit & Veg', C = '🍫 Confectionery', SN = '🥨 Snacks & Treats', DY = '🥛 Dairy & Eggs';
const NEW = [
 ['Waitrose No.1 Chicken Satay Skewers (size not confirmed)', M, '🍢', 9.78, 'NO1 CHK SATAY SKEWER 9.78'],
 ['Waitrose No.1 8 Brie Wedges (size not confirmed)', DY, '🧀', 9.78, 'NO1 8 BRIE WEDGES 9.78'],
 ['Waitrose No.1 Wagyu Mini Pie (size not confirmed)', M, '🥧', 9.78, 'NO1 WAGYU MINI PIE 9.78'],
 ['Dhay Back Smoked Bacon (as printed, size not confirmed)', M, '🥓', 4.64, 'DHAY BACK SMK BACON 4.64'],
 ['Denhay Smoked Bacon (size not confirmed)', M, '🥓', 4.64, 'DENHAY SMKD BACON 4.64'],
 ['Waitrose Black Pudding (size not confirmed)', M, '🥩', 2.09, 'WR BLACK PUDDING 2.09'],
 ['SC L&H Chicken Legs (as printed, size not confirmed)', M, '🍗', 8.63, 'SC L&H CHICKEN LEGS 8.63'],
 ['Waitrose Garlic & Herb Wedges (size not confirmed)', '🧊 Frozen', '🥔', 3.48, 'WR GARLC & HRB WEDGE 3.48'],
 ['Waitrose ETC C&C Veg Steamer (as printed, size not confirmed)', F, '🥦', 2.90, 'WR ETC C&C VEG STMR 2.90'],
 ['Waitrose Flatbread (size not confirmed)', '🍞 Bread & Bakery', '🫓', 2.36, 'WR FLATBREAD 2.36'],
 ['Waitrose No.1 Whipped Feta Dip (size not confirmed)', '🥗 Deli & Salads', '🧀', 3.83, 'NO1 WHIPPED FETA DIP 3.83'],
 ['Waitrose Apple & Elderflower (as printed, size not confirmed)', '🥤 Drinks', '🍏', 2.39, 'WR APPLE ELDERFLOWER 2.39'],
 ['Yeo Valley Honey Yogurt (second size, size not confirmed)', DY, '🍯', 2.35, 'YEO VALLEY HONEY YOG 2.35'],
 ["Waitrose Cooks' Ingredients Butternut Squash (as printed, size not confirmed)", F, '🎃', 1.92, "WR CI B'NUT SQUASH 1.92"],
 ["Waitrose Cooks' Ingredients Smoked Pancetta (as printed, size not confirmed)", M, '🥓', 3.72, 'WR CI SMKD PANCETTA 3.72'],
 ['Waitrose No.1 Maple Caramelised Nuts (as printed, size not confirmed)', SN, '🥜', 3.18, 'NO1 MAPLE CARA/M NUT 3.18'],
 ['Waitrose No.1 Fruit & Nut Mix (size not confirmed)', SN, '🥜', 3.18, 'NO.1 FRUIT & NUT MIX 3.18'],
 ['Jacksons Multigrain Brown Bloomer (as printed, size not confirmed)', '🍞 Bread & Bakery', '🍞', 2.32, 'JACKSON MG BRWN BLOM 2.32'],
 ['Bahlsen Pick Up Caramel (size not confirmed)', C, '🍫', 1.60, 'PICK UP CARAMEL 1.60'],
 ["McVitie's Jaffa Cakes (as printed, size not confirmed)", SN, '🍊', 2.00, 'MCVITIES JAFFA CAKES 2.00'],
 ['Waitrose Colour Care Laundry Liquid (as printed, size not confirmed)', H, '🧺', 3.33, 'WR COLOUR LIQUID 3.33'],
 ['Waitrose No.1 Beef Béarnaise (as printed, size not confirmed)', M, '🥩', 1.79, 'NO1 BEEF BEARNAISE 1.79'],
 ['Waitrose Prawn Cocktail (smaller pack, size not confirmed)', '🥗 Deli & Salads', '🍤', 1.79, 'WR PRAWN COCKTAIL 1.79 (an earlier receipt had 4.60 for 170g)'],
 ['Hula Hoops Smoky Bacon (size not confirmed)', SN, '🥔', 1.90, 'H HOOPS SMOKY BACON 1.90'],
 ['Neat Handwash Cotton (as printed, size not confirmed)', H, '🧴', 3.13, 'NEAT HWASH COTTON 2 x 3.13'],
 ['Duracell Plus AA 12 Pack', H, '🔋', 8.92, 'DURACELL PLUS AA 12 8.92'],
 ['Duracell Plus AAA 12 Pack', H, '🔋', 8.92, 'DURACELL + AAA 12PK 8.92'],
 ['John West Tuna in Spring Water 3 Pack (as printed, size not confirmed)', P, '🐟', 4.05, 'JW TUNA SPW 3PCK 4.05'],
];
let at = find(18294), id = 18295;
const ids = {};
NEW.forEach(n => { ids[n[4].split(' ').slice(0,3).join(' ')] = id; lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + n[3] + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
