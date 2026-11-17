// Katrina B, Waitrose St Helier 334, 17 Nov 09:21: 38 lines (one reduced Tamkhana tikka thigh line counted, not stored; loose red onions and bananas counted, not stored). Totals folded away in the photo.
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
const add = (name, cat, icon, price, note) => NEWROWS.push({ name, cat, icon, price, note });
const D = '17 Nov', WR = 'Waitrose branch: St Helier 334 (Katrina B receipt 17 Nov 09:21)';
setPrice(15934, 'waitrose', 2.73, D, WR + ': J2O APPLE & RASP CAN 2.73');
addNote(14608, WR + ': WR RED ONIONS 0.47 (loose, price not stored)');
addNote(9618, WR + ': FAIRTRADE BANANAS 0.58 (loose, price not stored)');
setPrice(16109, 'waitrose', 6.96, D, WR + ': WR GARLIC KYIVS 2 x 6.96');
setPrice(18309, 'waitrose', 3.72, D, WR + ': WR CI SMKD PANCETTA 3.72');
setPrice(7595, 'waitrose', 1.57, D, WR + ': ESS COLESLAW 300G 1.57');
setPrice(18306, 'waitrose', 2.39, D, WR + ': WR APPLE ELDERFLOWER 2.39');
setPrice(18395, 'waitrose', 1.22, D, WR + ': COLLECTIVE RASP 1.22');
setPrice(15921, 'waitrose', 4.35, D, WR + ': LURPAK LIGHT SPREAD 4.35');
setPrice(455, 'waitrose', 2.58, D, WR + ': J/D BUTTER V/L SALT 2.58');
setPrice(2641, 'waitrose', 1.65, D, WR + ': JDAIRY FAT RED MILK 2 x 1.65');
setPrice(5624, 'waitrose', 3.50, D, WR + ': GALAXY INST HOT CHOC 3.50 (size assumed 250g)');
setPrice(7215, 'waitrose', 0.99, D, WR + ': WR MIXED SEED ROLL 0.99');
setPrice(15937, 'waitrose', 3.62, D, WR + ': NRTHN RIDIATORI 3.62');
setPrice(1988, 'waitrose', 3.50, D, WR + ': OEP BBQ FAJITAS 3.50 (kit assumed)');
setPrice(842, 'waitrose', 2.40, D, WR + ': CISLAND JE PEPPERS 2.40');
setPrice(740, 'waitrose', 0.99, D, WR + ': BRIT SOURED CREAM 0.99 (size assumed 150ml)');
setPrice(4172, 'waitrose', 2.65, D, WR + ': CRISPNDRY RAP OIL 1L 2.65');
setPrice(15933, 'waitrose', 2.09, D, WR + ': WR ESS STILL WATER 2.09');
setPrice(15973, 'waitrose', 1.79, D, WR + ': WR PRAWN COCKTAIL 1.79 (crisps)');
setPrice(15975, 'waitrose', 2.93, D, WR + ': FF FRUIT TWISTS 2.93');
setPrice(14651, 'waitrose', 6.96, D, WR + ': SHEBA SUCCULENT CAT 6.96 (size assumed 12 x 85g)');
add('Waitrose 4 Lamb Burgers (size not confirmed)', '🥩 Meat & Fish', '🍔', 8.41, 'WR 4 LAMB BURG 8.41');
add('The Collective Peach & Apricot Suckies (as printed TC PEACH/AP SUCKIES, size not confirmed)', '🥛 Dairy & Eggs', '🥛', 1.22, 'TC PEACH/AP SUCKIES 1.22');
add('The Collective Mango & Passion Fruit Suckies (as printed CLLCTV SCK MNG&PSFRT, size not confirmed)', '🥛 Dairy & Eggs', '🥛', 1.22, 'CLLCTV SCK MNG&PSFRT 1.22');
add('Waitrose Raw King Prawns (size not confirmed)', '🥩 Meat & Fish', '🦐', 5.06, 'WR RAW KING PRAWNS 5.06');
add('The Spice Tailor Thai Green Curry (as printed TST THAI GREEN CURRY, size not confirmed)', '🍝 Pantry', '🍛', 3.64, 'TST THAI GREEN CURRY 3.64');
add('Kallo Vegetable Broth (size not confirmed)', '🍝 Pantry', '🍲', 2.31, 'KALLO VEGETBLE BROTH 2.31');
add('Kallo Chicken Broth (size not confirmed)', '🍝 Pantry', '🍲', 2.31, 'KALLO CHICKEN BROTH 2.31');
add('Kallo Beef Broth (size not confirmed)', '🍝 Pantry', '🍲', 2.31, 'KALLO BEEF BROTH 2.31');
add('Waitrose No.1 Pâtes de Fruits (size not confirmed)', '🍫 Confectionery', '🍬', 5.56, 'NO1 PATES DE FRUITS 5.56');
add('Waitrose No.1 Christmas Pudding 227g (as printed NO1 C&C XMASPUD 227G)', '🍰 Cakes & Desserts', '🎄', 4.64, 'NO1 C&C XMASPUD 227G 4.64');
add('Waitrose Christmas All Butter Mince Pies (as printed WR XMAS AB MPIES, size not confirmed)', '🍞 Bread & Bakery', '🥧', 2.31, 'WR XMAS AB MPIES 2.31');
add('Waitrose Dark Chocolate Caramel Fudge (as printed DARK CHOC CARA FUDGE, size not confirmed)', '🍫 Confectionery', '🍫', 3.23, 'DARK CHOC CARA FUDGE 3.23');
add('Waitrose Christmas Stollen Slices (size not confirmed)', '🍰 Cakes & Desserts', '🎄', 4.64, 'WR XMAS STOLLEN SLCS 4.64');
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let id = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n.name) + ', cat:' + JSON.stringify(n.cat) + ', icon:' + JSON.stringify(n.icon) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + n.price + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n.note); console.log(id, n.note.split(' ').slice(0, -1).join(' ')); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done,', NEWROWS.length, 'new rows, next id', id);
