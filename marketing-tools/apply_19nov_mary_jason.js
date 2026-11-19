// 19 Nov: Mary C Waitrose St Saviour 332 12:36 (53 lines, 4 photos, one missing from the sheet: IMG_3109) + Jason L Waitrose St Helier 334 13:14 (31 grocery lines, 2 x Marlboro not counted)
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
const D = '19 Nov';
const MS = 'Waitrose branch: St Saviour 332 (Mary C receipt 19 Nov 12:36)', JL = 'Waitrose branch: St Helier 334 (Jason L receipt 19 Nov 13:14)';
// ---- Mary C, Waitrose St Saviour, 53 lines ----
const m = (id, p, t) => setPrice(id, 'waitrose', p, D, MS + ': ' + t);
m(16111, 14.00, 'BAILEYS 14.00 (size not printed)');
m(11026, 2.85, 'ABSOLUT & SPRITE 2.85');
m(454, 1.65, 'JERSEY DAIRY WH MILK 1.65');
m(7331, 2.50, 'WR AB WELSH CAKES 2.50 (was 2.15)');
m(17579, 3.78, 'CADBURY CARAMEL NUT 3.78');
m(17183, 1.75, 'JACOBS BITES RED L 1.75');
m(11710, 1.75, 'JACOBS BITES S&V 1.75');
m(4226, 1.75, 'JACOBS BITES C&O 1.75');
m(9835, 2.15, 'IDAHOAN BUTTERY MASH 2 x 2.15');
m(7881, 1.75, 'MG PUY GREEN LENTILS 1.75 (was 2.30)');
m(7883, 1.75, 'MG SPANISH GRAINS 1.75 (was 2.30)');
m(17656, 6.46, 'CAD HEROES ADV CAL 6.46');
m(14982, 2.15, 'WR CI CRISPY ONIONS 2.15');
m(4017, 1.75, 'KALLO ORG VG STK 8S 1.75');
m(4016, 1.75, 'KALLO ORG CHICK CUBE 1.75');
m(1102, 2.88, 'LEERDAMMER ORIGINAL 2.88 (160g assumed)');
m(4956, 3.08, 'PATAKS PAPPADUM 2 x 3.08 (size assumed)');
m(708, 1.69, 'SEABROOK SEA SALTED 1.69 (was 1.64)');
m(16064, 2.35, 'MGOURMET CHESTNUTS 2.35');
m(1733, 1.28, 'MCCOYS STEAK (GRAB) 1.28');
m(16050, 4.77, 'CARRS SSNAL SLCTION 4.77');
// ---- Jason L, Waitrose St Helier, 31 grocery lines (2 x Marlboro not counted) ----
const j = (id, p, t) => setPrice(id, 'waitrose', p, D, JL + ': ' + t);
j(7076, 2.78, 'WR PLADY APPLES 6S 2.78 (was 3.48)');
j(15980, 4.53, 'WR WILTSHIRE HAM 2 x 4.53 (cooked meat 2 for 6.50 not stored)');
j(14230, 6.33, 'WR DICED PORK SHLDR 2 x 6.33 (500g assumed)');
j(1117, 3.91, 'PHILADELPHIA LIGHT 3.91 (280g assumed)');
j(7545, 1.34, 'WR ESS GREEK YOGURT 1.34');
j(430, 1.65, 'JD 1% FAT MILK 2 x 1.65');
j(7720, 1.45, 'SILVER SPOON GRA SGR 1.45');
j(12436, 1.99, 'SHADES STRAWB 2 x 1.99');
j(4535, 1.39, 'SQUASHIES ORIGINAL 2 x 1.39');
j(18423, 1.54, 'RICOLA HONEY LOZENGE 1.54');
// ---- new rows ----
const NEWROWS = [
  [MS, 'Cointreau (size not confirmed)', '🍷 Wine & Beer', '🍊', 25.05, 'COINTREAU 25.05'],
  [MS, 'Waitrose Essential Broad Beans (as printed WR ESS BROAD BEANS, size not confirmed)', '🥦 Fruit & Veg', '🫘', 1.86, 'WR ESS BROAD BEANS 1.86'],
  [MS, 'Merchant Gourmet Persian Style Grains (size not confirmed)', '🍝 Pantry', '🍚', 1.75, 'MGOURMET PRSIAN GRNS 1.75'],
  [MS, 'Merchant Gourmet Turkish Style Grains (size not confirmed)', '🍝 Pantry', '🍚', 1.75, 'MGOURMET TRKISH GRNS 1.75'],
  [MS, 'Merchant Gourmet Giant Butter Beans (size not confirmed)', '🍝 Pantry', '🫘', 2.05, 'M GOURMET GIANT BUTT 2 x 2.05'],
  [MS, 'MOJU Ginger Shots Multipack (as printed MOJU MLTI GNGR SHTS, size not confirmed)', '🥤 Drinks', '🥤', 4.72, 'MOJU MLTI GNGR SHTS 4.72'],
  [MS, 'Itsu Miso Big Bowl (size not confirmed)', '🍝 Pantry', '🍜', 2.55, 'ITSU MISO BIG BOWL 2.55'],
  [MS, 'Colgate Instant Enamel Toothpaste (as printed COLGATE INSTANT ENAM, size not confirmed)', '💊 Health & Beauty', '🪥', 6.26, 'COLGATE INSTANT ENAM 6.26'],
  [MS, 'Heinz Black Beans (size not confirmed)', '🍝 Pantry', '🫘', 2.35, 'HEINZ BLACK BEANS 2.35'],
  [MS, 'NIVEA Essential Lip Balm (as printed NIVEA ESS LIP BALM, size not confirmed)', '💊 Health & Beauty', '💄', 2.04, 'NIVEA ESS LIP BALM 2.04'],
  [MS, 'Kallo Organic Beef Stock Cubes (size not confirmed)', '🍝 Pantry', '🍲', 1.75, 'KALLO ORG BEEF STOCK 1.75'],
  [MS, "Hellmann's Plant Based Mayo (as printed HLM PLNT BS MAYO, size not confirmed)", '🍝 Pantry', '🥫', 4.05, 'HLM PLNT BS MAYO 4.05'],
  [MS, 'The Spice Tailor Rogan Josh (as printed TST ROGAN JOSH, size not confirmed)', '🍝 Pantry', '🍛', 4.59, 'TST ROGAN JOSH 4.59'],
  [MS, 'Kettle Tortilla Chips Sea Salt & Pepper (as printed KETTLE TORTILLA S&P, size not confirmed)', '🥨 Snacks & Treats', '🌮', 2.71, 'KETTLE TORTILLA S&P 2.71'],
  [MS, "Jason's Sourdough 5 Grains (as printed JASONS SDGH 5GRAINS, size not confirmed)", '🍞 Bread & Bakery', '🍞', 2.79, 'JASONS SDGH 5GRAINS 2.79'],
  [JL, 'Waitrose Diced Beef Braising Steak (as printed WR DCD BF BRAISING, size not confirmed)', '🥩 Meat & Fish', '🥩', 5.22, 'WR DCD BF BRAISING 5.22'],
  [JL, 'Waitrose Essential Extra Mature Cheddar (as printed WR ESS XMAT CHEDDAR, size not confirmed)', '🥛 Dairy & Eggs', '🧀', 5.18, 'WR ESS XMAT CHEDDAR 5.18'],
  [JL, 'Waitrose Essential Unsalted Butter (size not confirmed)', '🥛 Dairy & Eggs', '🧈', 2.30, 'WR ESS UNSLTD BUTTER 2.30'],
  [JL, 'Flavour Hacks Sun-Dried Tomato Paste (as printed FLVR HCKS SUN TOM PS, size not confirmed)', '🍝 Pantry', '🍅', 2.84, 'FLVR HCKS SUN TOM PS 2.84'],
  [JL, 'Flavour Hacks Roasted Garlic (as printed FLVR HCK RSTED GRLC, size not confirmed)', '🍝 Pantry', '🧄', 2.84, 'FLVR HCK RSTED GRLC 2 x 2.84'],
  [JL, "Waitrose Cooks' Ingredients Chopped Ginger (as printed WR CI CHOPPED GINGER, size not confirmed)", '🍝 Pantry', '🫚', 2.44, 'WR CI CHOPPED GINGER 2.44'],
  [JL, "Waitrose Cooks' Ingredients Diced Onions (as printed WR CI DICED ONIONS, size not confirmed)", '🥦 Fruit & Veg', '🧅', 2.15, 'WR CI DICED ONIONS 2 x 2.15'],
  [JL, 'Crosta & Mollica Organic Piadina (as printed C&M ORG PIADINA, size not confirmed)', '🍞 Bread & Bakery', '🫓', 2.56, 'C&M ORG PIADINA 2.56'],
  [JL, 'Waitrose Essential Self Raising White Flour (size not confirmed)', '🍝 Pantry', '🌾', 0.93, 'WR ESS SR WHITE FLOUR 0.93'],
  [JL, 'Waitrose Essential Plain Flour (size not confirmed)', '🍝 Pantry', '🌾', 0.93, 'WR ESS PLAIN FLOUR 0.93'],
];
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let id = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([src, name, cat, icon, price, note]) => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + price + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + src + ': ' + note); console.log(id, note); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done,', NEWROWS.length, 'new rows');
