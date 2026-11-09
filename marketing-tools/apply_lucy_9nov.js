// Lucy D: Waitrose St Helier 9 Nov 15:08 and Morrisons Castle Quay 9 Nov 14:36 (competition entries).
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
// Waitrose: 19 items, sum 54.23, less 0.50 saved = 53.73 paid (Amex). Held back (alignment on the tilted photo not certain): MARS 4 PACK, CADBURY OREO BITES, CAD TWIRL BITES, WALKER'S FINGERS.
// Morrisons: 4 items; Pom-Bear 2 x 1.75 made free by the offer (-3.50) + Swizzels 1.35 + Refreshers 1.20 = 2.55.
const D = '9 Nov';
const WR = 'Waitrose St Helier shopper receipt 9 Nov 15:08 (Lucy D)';
const MO = 'Morrisons branch: Castle Quay (receipt 9 Nov 14:36, Lucy D)';
setPrice(999, 'waitrose', 7.93, D, WR + ': FAIRY PODS 30W 7.93');
setPrice(4238, 'waitrose', 1.96, D, WR + ': TUNNOCKS TEA CAKES 1.96 (milk chocolate 6 pack assumed)');
setPrice(12436, 'waitrose', 1.99, D, WR + ': SHADES STRAWB 1.99');
setPrice(12431, 'waitrose', 1.99, D, WR + ': SHADES ORIGINAL 1.99');
setPrice(474, 'waitrose', 1.90, D, WR + ': HULA HOOPS ORIGINAL 1.90 (size not confirmed)');
setPrice(8255, 'morrisons', 1.75, D, MO + ': POM BEAR CHEESE 6PK 2 x 1.75, free with the Pom-Bear offer (-3.50)');
setPrice(4481, 'morrisons', 1.35, D, MO + ': SWIZZELS DRUMSTICK SQUASHIES C 1.35 (cherry & apple assumed; receipt shows 1.90 total price savings, so this may be a reduced price)');
const NEW = [
 ['waitrose', 'Finish Lemon Dishwasher Tablets (tab count not confirmed)', '🧹 Household', '🧼', 9.89, WR, 'FINISH LEMN DISH TAB 9.89'],
 ['waitrose', 'Bahlsen Pick Up Dark (size not confirmed)', '🍫 Confectionery', '🍫', 1.60, WR, 'BAHLSEN PICK UP DARK 1.60'],
 ['waitrose', 'Walkers French Fries (size not confirmed)', '🍿 Snacks', '🍟', 1.80, WR, 'WALKERS FRENCH FRIES 1.80'],
 ['waitrose', 'McCoy\'s Salt & Vinegar Crisps (size not confirmed)', '🍿 Snacks', '🥔', 2.50, WR, 'MCCOYS SALT VINEGAR 2.50'],
 ['waitrose', 'Wotsits Really Cheesy (size not confirmed)', '🍿 Snacks', '🧀', 2.55, WR, 'WOTSITS CHEESY 2.55'],
 ['waitrose', 'Jason\'s Grain & Seeds Loaf (size not confirmed)', '🍞 Bread & Bakery', '🍞', 2.73, WR, 'JASONS GRAIN & SEEDS 2.73'],
 ['waitrose', 'Jacksons White Bloomer (size not confirmed)', '🍞 Bread & Bakery', '🍞', 2.32, WR, 'JACKSON WHTE BLOOMER 2.32 x2'],
 ['waitrose', 'Cadbury Fudge Multipack (size not confirmed)', '🍫 Confectionery', '🍫', 1.89, WR, 'CADBURY FUDGE 1.89 (not the single bar at 1.00)'],
 ['waitrose', 'Cadbury Freddo Multipack (size not confirmed)', '🍫 Confectionery', '🍫', 1.89, WR, 'CADBURY FREDDO 1.89 (not the single bar at 1.00)'],
 ['morrisons', 'Refreshers Softies (price-marked pack, size not confirmed)', '🍫 Confectionery', '🍬', 1.20, MO, 'REFRESHERS SOFTIES PMP 1.20'],
];
let at = find(16067), id = 16068;
NEW.forEach(n => { const p = {coop:0,morrisons:0,ms:0,waitrose:0,iceland:0,alliance:0}; p[n[0]] = n[4];
  lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[1]) + ', cat:' + JSON.stringify(n[2]) + ', icon:' + JSON.stringify(n[3]) + ', prices:{' + S.map(s => s + ':' + p[s]).join(',') + '}, upd:"' + D + '"}, // ' + n[5] + ': ' + n[6]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
