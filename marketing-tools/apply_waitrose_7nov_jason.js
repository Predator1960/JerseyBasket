// Waitrose St Helier receipt 7 Nov 12:16 (Jason L, competition entry).
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
// 32 items, balance 70.86. NOT stored (leading digit unreadable, receipt sum is 1.00 short): TEPE EASYPICK, TSC ORG VAN EXTRACT, HILLTOP BLOSSM HONEY, WR XL WHOLE CHICKEN, WR FRESH GNOCCHI.
// Weighed lines (parsnips, large pots, loose carrots, bananas) not stored: price is per kg.
const D = '7 Nov', WR = 'Waitrose St Helier shopper receipt 7 Nov 12:16 (Jason L)';
setPrice(7545, 'waitrose', 1.34, D, WR + ': WR ESS GREEK NAT YOG 1.34 (row was 1.20; size assumed 500g)');
setPrice(7530, 'waitrose', 1.05, D, WR + ': WR PRIPE AVO MED 1.05 (row was 0.90)');
setPrice(7076, 'waitrose', 3.48, D, WR + ': WR PLADY APPLES 6S 3.48 (row was 3.00; same price seen 31 Oct)');
setPrice(7528, 'waitrose', 1.34, D, WR + ': WR CHESTNUT M/ROOMS 1.34 (row was 1.10; size assumed 250g)');
setPrice(1210, 'waitrose', 2.65, D, WR + ': OATLY OAT DRINK BARI 2.65');
setPrice(4016, 'waitrose', 1.75, D, WR + ': KALLO ORG CHICK CUBE 1.75 (size assumed 8 x 11g)');
setPrice(4054, 'waitrose', 2.50, D, WR + ': KNORR AROMAT SEASON 2.50 (90g assumed)');
setPrice(14985, 'waitrose', 1.80, D, WR + ': CORNISH SALT FLAKES 1.80 (170g assumed)');
setPrice(14211, 'waitrose', 4.76, D, WR + ': WR CHICKEN MINCE 4.76 (500g assumed)');
addNote(423, WR + ': JERSEY DAIRY 1% MILK 0.87 (unchanged)');
addNote(85, WR + ': WR LEMON 0.47 (unchanged)');
const NEW = [
 ['Flash Bicarbonate (size not confirmed)', '🧹 Household', '🧽', 2.48, 'FLASH BICARBONATE 2.48'],
 ['Duck Toilet Gel Pine (size not confirmed)', '🧹 Household', '🧴', 1.50, 'DUCK GEL PINE 1.50'],
 ['Waitrose Poppy Seeds (size not confirmed)', '🍝 Pantry', '🌱', 1.51, 'WR POPPY SEEDS 1.51'],
 ['Yeo Valley Yeo Yog Greek Style (size not confirmed)', '🥛 Dairy & Eggs', '🥛', 1.16, 'YEO YOG GREEK STYLE 1.16'],
 ['Waitrose Trimmed Salad Onions (size not confirmed)', '🥦 Fruit & Veg', '🧅', 1.74, 'WR TRIM SALAD ONIONS 1.74'],
 ['Waitrose Broccoli Tips (size not confirmed)', '🥦 Fruit & Veg', '🥦', 1.63, 'BROCCOLI TIPS 1.63'],
 ['Waitrose Cooks\' Ingredients Sage (size not confirmed)', '🍝 Pantry', '🌿', 1.05, 'WR CI SAGE 1.05'],
 ['Waitrose Blueberries 300g', '🥦 Fruit & Veg', '🫐', 4.64, 'WR BLUEBERRIES 300G 4.64'],
 ['Waitrose Wholemeal Tortilla Wraps 6 Pack (size not confirmed)', '🍞 Bread & Bakery', '🌯', 1.74, 'WR WMEAL TTILLA 6S 1.74'],
 ['Tyrrells Gammon Crisps (size and flavour not confirmed)', '🍿 Snacks', '🥔', 2.05, 'TYRELLS GAMMON 2.05 x2'],
 ['Waitrose All Butter Croissant (size not confirmed)', '🍞 Bread & Bakery', '🥐', 1.57, 'WR AB CROISSANT 1.57'],
];
let at = find(15998), id = 15999;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + n[3] + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
