// Michelle B (emailed 22 Nov 19:15-19:22, found in spam 24 Nov): 4 M&S School Road St Clement receipts (6, 10, 13, 17 Nov) and 3 Waitrose St Saviour 332 receipts (8 Nov delivery, 9 Nov, 16 Nov)
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
const MS = d => 'M&S branch: School Road St Clement (Michelle B receipt ' + d + ')';
const WR = d => 'Waitrose branch: St Saviour 332 (Michelle B receipt ' + d + ')';
const m10 = MS('10 Nov 16:00'), m13 = MS('13 Nov 15:51'), m6 = MS('6 Nov 16:14'), m17 = MS('17 Nov 16:10');
const w8 = WR('8 Nov 11:44, delivery'), w9 = WR('9 Nov 13:15'), w16 = WR('16 Nov 14:55');
// existing rows
setPrice(9634, 'ms', 0.20, '10 Nov', m10 + ': EA BANANAS 3 @ 0.20');
setPrice(9677, 'ms', 3.40, '13 Nov', m13 + ': PR CNFENCE PE 3.40');
setPrice(14290, 'waitrose', 2.98, '8 Nov', w8 + ': RANA MUSH &MASC TORT 2.98');
setPrice(17800, 'waitrose', 2.38, '8 Nov', w8 + ': WR CLOTTED CRM FUDGE 2.38');
addNote(4299, w8 + ': BAHLSEN MLK LEIBNIZ 1.60 at the till (pack size not printed, not stored)');
addNote(4305, w8 + ': BAHLSEN DRK LEIBNIZ 1.60 at the till (pack size not printed, not stored)');
setPrice(7569, 'waitrose', 2.32, '9 Nov', w9 + ': LACTOFREE S/SKIMMED 2.32 (x4)');
setPrice(15132, 'waitrose', 3.24, '9 Nov', w9 + ': WR NO1 CHEESE GRATIN 3.24');
setPrice(17791, 'waitrose', 4.35, '16 Nov', w16 + ': WR CAR & CHO PANETON 4.35');
setPrice(5184, 'waitrose', 1.79, '16 Nov', w16 + ': HARPIC PP CITRUS 1.79 (750ml assumed)');
setPrice(7594, 'waitrose', 2.65, '16 Nov', w16 + ': YVO SALTED BUTTER 2.65 (also 2.65 x2 on 8 Nov delivery)');
setPrice(18294, 'waitrose', 3.08, '16 Nov', w16 + ': NO1 SCHERRY MPIES 3.08');
const NC = ', size not confirmed)';
const NEWROWS = [
  ['M&S 8 Croissants (as printed 8 CROISSANTS)', '🍞 Bread & Bakery', '🥐', 'ms', 5.90, '17 Nov', m17, '8 CROISSANTS 5.90 (code 00041089)'],
  ['M&S 6 Sweet Pancakes (as printed 6 SWEET P/CAK)', '🍞 Bread & Bakery', '🥞', 'ms', 3.35, '10 Nov', m10, '6 SWEET P/CAK 3.35 (code 00456418)'],
  ['Jersey Dairy Organic Milk (as printed Jersey Org Mi, barcode 5018359000690' + NC, '🥛 Dairy & Eggs', '🥛', 'ms', 2.15, '13 Nov', m13, 'Jersey Org Mi 2.15 (also 2.15 on 10 Nov)'],
  ['M&S English Mild Cheddar (as printed ENG MILD CHDS' + NC, '🥛 Dairy & Eggs', '🧀', 'ms', 3.35, '10 Nov', m10, 'ENG MILD CHDS 3.35 (code 29056453)'],
  ['M&S Jacket Potatoes (as printed JACKET POTS X' + NC, '🥦 Fruit & Veg', '🥔', 'ms', 2.15, '10 Nov', m10, 'JACKET POTS X 2.15 (code 00690683)'],
  ['M&S Dark Brown Soft Sugar (as printed DARK BRWN SFT' + NC, '🍝 Pantry', '🍬', 'ms', 2.45, '10 Nov', m10, 'DARK BRWN SFT 2.45 (code 29076116)'],
  ['M&S Double Cream 150ml (as printed DBLE CRM 150M)', '🥛 Dairy & Eggs', '🥛', 'ms', 1.55, '10 Nov', m10, 'DBLE CRM 150M 1.55 (code 00212526)'],
  ['M&S Organic Cucumber (as printed ORG CUCUMBER)', '🥦 Fruit & Veg', '🥒', 'ms', 1.60, '10 Nov', m10, 'ORG CUCUMBER 1.60 (code 00981620)'],
  ['M&S Organic Little Gem Lettuce (as printed ORG GEM' + NC, '🥦 Fruit & Veg', '🥬', 'ms', 2.00, '10 Nov', m10, 'ORG GEM 2.00 (code 00228008)'],
  ['M&S Traditional Coleslaw 300g (as printed TRAD SLAW 300)', '🥗 Deli & Salads', '🥗', 'ms', 1.60, '10 Nov', m10, 'TRAD SLAW 300 1.60 (code 00951531)'],
  ['M&S Haddock Goujons (as printed HADDOCK GOUJO' + NC, '🥩 Meat & Fish', '🐟', 'ms', 6.00, '13 Nov', m13, 'HADDOCK GOUJO 6.00 (code 29281855)'],
  ['M&S Beer Batter Cod (as printed BEER BATTER C' + NC, '🥩 Meat & Fish', '🐟', 'ms', 6.00, '13 Nov', m13, 'BEER BATTER C 6.00 (code 29145249)'],
  ['M&S Chestnut Mushrooms (as printed CHESTNUT MUSH' + NC, '🥦 Fruit & Veg', '🍄', 'ms', 1.30, '13 Nov', m13, 'CHESTNUT MUSH 1.30 (code 00854887)'],
  ['M&S Organic Carrots Bag (as printed ORG CARROT BA' + NC, '🥦 Fruit & Veg', '🥕', 'ms', 1.10, '13 Nov', m13, 'ORG CARROT BA 1.10 (code 00850476)'],
  ['M&S Ripe Plums x4 (as printed RIPE PLUM X4)', '🥦 Fruit & Veg', '🍑', 'ms', 4.00, '13 Nov', m13, 'RIPE PLUM X4 4.00 (code 00998574)'],
  ['M&S Piccolini Tomatoes 360g (as printed PICCOLINI 360)', '🥦 Fruit & Veg', '🍅', 'ms', 4.95, '6 Nov', m6, 'PICCOLINI 360 4.95 (code 00564380)'],
  ['M&S Organic Mixed Peppers (as printed ORG M/PK PEPP' + NC, '🥦 Fruit & Veg', '🫑', 'ms', 2.15, '6 Nov', m6, 'ORG M/PK PEPP 2.15 (code 00313513)'],
  ['M&S Brandy Snaps (as printed Brandy Snaps' + NC, '🍪 Biscuits', '🍪', 'ms', 2.45, '6 Nov', m6, 'Brandy Snaps 2.45 (code 29378401)'],
  ['M&S Cheese & Ham Crustless Quiche (as printed CHS HAM CRIST' + NC, '🥗 Deli & Salads', '🥧', 'ms', 4.95, '6 Nov', m6, 'CHS HAM CRIST 4.95 (code 29343966)'],
  ['M&S Jolly Jellies (as printed Jolly Jellies' + NC, '🍫 Confectionery', '🍬', 'ms', 2.45, '6 Nov', m6, 'Jolly Jellies 2.45 (code 29517510)'],
  ['M&S Gingerbread Latte (as printed Gngrbrd Lte W' + NC, '🍫 Confectionery', '🍫', 'ms', 1.55, '6 Nov', m6, 'Gngrbrd Lte W 1.55 (code 29517275)'],
  ['M&S Mini Shortbread Trees (as printed MINI SB TREES' + NC, '🍪 Biscuits', '🎄', 'ms', 1.85, '6 Nov', m6, 'MINI SB TREES 1.85 (code 00219532)'],
  ['M&S Chocolate Wafer (as printed CHOC WAFER' + NC, '🍪 Biscuits', '🍫', 'ms', 2.35, '6 Nov', m6, 'CHOC WAFER 2.35 (code 29369966)'],
  ['M&S Coconut Grove Bar (as printed CCNUT GROVE B' + NC, '🍫 Confectionery', '🥥', 'ms', 1.25, '6 Nov', m6, 'CCNUT GROVE B 1.25 (code 29512225)'],
  ['Waitrose No.1 Raspberry & Pistachio Tarts (as printed NO.1 RAS & PIS TARTS' + NC, '🍰 Cakes & Desserts', '🥧', 'waitrose', 4.17, '8 Nov', w8, 'NO.1 RAS & PIS TARTS 4.17'],
  ['Waitrose No.1 Gingerbread Pudding (as printed NO1 GINGERBREAD PUD' + NC, '🍰 Cakes & Desserts', '🍮', 'waitrose', 5.56, '8 Nov', w8, 'NO1 GINGERBREAD PUD 5.56 (first digit faint, confirmed by the receipt total)'],
  ['Galbani Mascarpone (as printed GALBANI MASCARPONE' + NC, '🥛 Dairy & Eggs', '🧀', 'waitrose', 3.17, '8 Nov', w8, 'GALBANI MASCARPONE 3.17'],
  ['Duchy Organic Streaky Bacon (as printed WR DORG STREAK BACON' + NC, '🥩 Meat & Fish', '🥓', 'waitrose', 6.85, '8 Nov', w8, 'WR DORG STREAK BACON 6.85 (first digit faint, confirmed by the receipt total)'],
  ['Rude Health Spelt Flakes (as printed RHEALTH SPELT FLAKES' + NC, '🥣 Breakfast', '🥣', 'waitrose', 3.10, '8 Nov', w8, 'RHEALTH SPELT FLAKES 3.10'],
  ["Nature's Path Organic Maple Sunrise (as printed NP ORG MAPLE SUNRISE" + NC, '🥣 Breakfast', '🥣', 'waitrose', 3.35, '8 Nov', w8, 'NP ORG MAPLE SUNRISE 3.35'],
  ['Mallow Coconut Pouch (as printed MALLOW COCONUT POUCH' + NC, '🍫 Confectionery', '🍬', 'waitrose', 2.00, '8 Nov', w8, 'MALLOW COCONUT POUCH 2.00'],
  ['Royal Dansk Butter Cookies (as printed RDANSK BTER COOKIES' + NC, '🍪 Biscuits', '🍪', 'waitrose', 3.75, '8 Nov', w8, 'RDANSK BTER COOKIES 3.75'],
  ['Kallo Organic Rice Cakes (as printed KALLO ORG RICE CAKES' + NC, '🍝 Pantry', '🍘', 'waitrose', 1.45, '8 Nov', w8, 'KALLO ORG RICE CAKES 1.45'],
  ['Waitrose No.1 Gift Cake (as printed NO1 GIFT CAKE' + NC, '🍰 Cakes & Desserts', '🎂', 'waitrose', 4.17, '8 Nov', w8, 'NO1 GIFT CAKE 4.17'],
  ['Waitrose Italian Biscuit Selection (as printed WR ITALIAN BIS SELC' + NC, '🍪 Biscuits', '🍪', 'waitrose', 5.30, '8 Nov', w8, 'WR ITALIAN BIS SELC 5.30'],
  ['Northern Rigatoni (as printed NRTHN RIGATONI, brand' + NC, '🍝 Pantry', '🍝', 'waitrose', 3.62, '8 Nov', w8, 'NRTHN RIGATONI 3.62'],
  ['Northern Pasta Fusilli (as printed NRTHRN PSTA FUSILLI, brand' + NC, '🍝 Pantry', '🍝', 'waitrose', 3.62, '8 Nov', w8, 'NRTHRN PSTA FUSILLI 3.62'],
  ["Mrs Crimble's Chocolate Macaroon (as printed MRS C CHOC MACAROON" + NC, '🍪 Biscuits', '🍪', 'waitrose', 1.65, '8 Nov', w8, 'MRS C CHOC MACAROON 1.65'],
  ['Waitrose Mini Creams Biscuits (as printed WR MINI CREAMS' + NC, '🍪 Biscuits', '🍪', 'waitrose', 3.33, '8 Nov', w8, 'WR MINI CREAMS 3.33'],
  ['Waitrose Milk Chocolate Honeycomb (as printed WR MILK CHOC HCOMB' + NC, '🍫 Confectionery', '🍫', 'waitrose', 2.38, '8 Nov', w8, 'WR MILK CHOC HCOMB 2.38'],
  ['Bahlsen Choco Leibniz Orange (as printed BAHLSEN ORN LEIBNIZ' + NC, '🍪 Biscuits', '🍪', 'waitrose', 1.60, '8 Nov', w8, 'BAHLSEN ORN LEIBNIZ 1.60'],
  ["Tony's Chocolonely Rainbow Tasting Bars (as printed TONYS CHOC RBOW TAST" + NC, '🍫 Confectionery', '🍫', 'waitrose', 8.45, '8 Nov', w8, 'TONYS CHOC RBOW TAST 8.45'],
  ['Duchy Organic 10 Large Free Range Eggs (as printed WR DORG 10 LRGE EGGS)', '🥛 Dairy & Eggs', '🥚', 'waitrose', 6.21, '8 Nov', w8, 'WR DORG 10 LRGE EGGS 6.21'],
  ['Waitrose No.1 Sicilian Orange Panettone (as printed NO1 SORANGE PANET' + NC, '🍞 Bread & Bakery', '🍞', 'waitrose', 18.56, '8 Nov', w8, 'NO1 SORANGE PANET 18.56'],
  ['Mr Organic Plant Veg Soup (as printed MR ORG PLNT VEG SOUP' + NC, '🍝 Pantry', '🥣', 'waitrose', 2.55, '16 Nov', w16, 'MR ORG PLNT VEG SOUP 2.55'],
  ['Waitrose Beef Gravy (as printed WR BEEF GRAVY' + NC, '🍝 Pantry', '🥣', 'waitrose', 3.77, '16 Nov', w16, 'WR BEEF GRAVY 3.77'],
  ['Waitrose Essential Frozen Blueberries (as printed ESS BLUEBERRIES' + NC, '🧊 Frozen', '🫐', 'waitrose', 4.06, '16 Nov', w16, 'ESS BLUEBERRIES 4.06 x2 (Ess frozen fruit 4 for 3)'],
  ['Waitrose Essential Frozen Raspberries (as printed WR ESS RASPBERRIES' + NC, '🧊 Frozen', '🍓', 'waitrose', 4.06, '16 Nov', w16, 'WR ESS RASPBERRIES 4.06 x2 (Ess frozen fruit 4 for 3)'],
  ['Vienna Miche (as printed VIENNA MICHE' + NC, '🍞 Bread & Bakery', '🍞', 'waitrose', 2.60, '16 Nov', w16, 'VIENNA MICHE 2 @ 2.60'],
  ['Rana Mushroom & Garlic (as printed RANA MUSH & GARLIC S' + NC, '🥗 Deli & Salads', '🍝', 'waitrose', 2.69, '9 Nov', w9, 'RANA MUSH & GARLIC S 2.69'],
  ['Belazu Lemon & Garlic Beans (as printed BELAZU LMON GRLC BEA' + NC, '🍝 Pantry', '🫘', 'waitrose', 3.30, '9 Nov', w9, 'BELAZU LMON GRLC BEA 3.30'],
  ['Mr Organic Tomato & Basil Soup (as printed MR ORG TOM BSL SOUP' + NC, '🍝 Pantry', '🥣', 'waitrose', 2.55, '9 Nov', w9, 'MR ORG TOM BSL SOUP 2.55'],
  ['Waitrose All Butter Puff Pastry Mince Pies (as printed WR AB PPASTRY MPIES' + NC, '🍞 Bread & Bakery', '🥧', 'waitrose', 2.31, '9 Nov', w9, 'WR AB PPASTRY MPIES 2.31'],
  ['Otto Pudding 800g (as printed OTTO PUDDING 800G)', '🍰 Cakes & Desserts', '🍮', 'waitrose', 18.56, '9 Nov', w9, 'OTTO PUDDING 800G 18.56'],
  ['Ombar Raspberry & Coconut (as printed OMBAR RASP COCONUT' + NC, '🍫 Confectionery', '🍫', 'waitrose', 2.00, '9 Nov', w9, 'OMBAR RASP COCONUT 2.00'],
];
const cats = new Set(lines.map(l => (l.match(/cat:"([^"]+)"/) || [])[1]).filter(Boolean));
const badCats = [...new Set(NEWROWS.map(r => r[1]).filter(c => !cats.has(c)))];
if (badCats.length) { console.log('UNKNOWN CATEGORIES', badCats); process.exit(1); }
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, store, price, d, src, note]) => { const p = S.map(s => s + ':' + (s === store ? price : 0)).join(','); lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{' + p + '}, upd:"' + d + '"}, // ' + src + ': ' + note); console.log(nid, note); nid++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done', NEWROWS.length, 'new rows');
