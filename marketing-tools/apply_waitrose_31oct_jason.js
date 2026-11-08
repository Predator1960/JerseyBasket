// Waitrose St Helier receipt 31 Oct 16:04 (Jason L, NOT a competition entry: before 1 Nov). Catalogue only, prices applied only where the row's Waitrose date is older than 31 Oct.
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
// 41 items; sum 101.03 less free food magazine 5.00 = 96.03 balance due (tulips were a free flowers offer).
const D = '31 Oct', WR = 'Waitrose St Helier shopper receipt 31 Oct 16:04 (Jason L)';
const wDate = id => { const o = evalRow(lines[find(id)]); return (o.upds && o.upds.waitrose) || ((o.prices.waitrose || 0) > 0 ? o.upd : ''); };
const older = id => { const d = wDate(id); return !d || dval(d) < dval(D); };
function ifOlder(id, price, note) {
  if (older(id)) { setPrice(id, 'waitrose', price, D, WR + ': ' + note); console.log('set', id, price); }
  else { addNote(id, WR + ': ' + note + ' [not applied, row has a newer Waitrose price]'); console.log('kept newer', id); }
}
ifOlder(15440, 3.33, 'WR 50 SNACK BAGS 3.33');
ifOlder(2201, 2.73, 'QUORN MINCE 2.73 (300g assumed)');
ifOlder(14608, 1.16, 'WR RED ONIONS 1.16 (row was 1.00; pack size assumed)');
ifOlder(7551, 1.28, 'WR PRIPE AVO LRG 1.28 (row was 1.10)');
ifOlder(7538, 1.74, 'WR WILD ROCKET 1.74 (row was 1.50; 90g assumed)');
ifOlder(16004, 1.45, 'BROCCOLI TIPS 1.45');
ifOlder(1210, 2.65, 'OATLY OAT DRINK BARI 2.65');
ifOlder(16002, 1.16, 'YEO YOG GREEK STYLE 1.16');
ifOlder(7545, 1.34, 'WR ESS GREEK YOGURT 1.34');
ifOlder(7076, 3.48, 'WR PLADY APPLES 6S 3.48');
ifOlder(15978, 1.16, 'WR REGAL WHITE POTS 1.16');
const NEW = [
 ['Maple Syrup Very Dark (brand and size not confirmed)', '🍝 Pantry', '🍁', 3.75, 'MPLE CRST SYRP VDARK 3.75'],
 ['Waitrose Essential Antibacterial Washing Up Liquid (size not confirmed)', '🧹 Household', '🧴', 0.95, 'WR ESS ANTIBAC WUL 0.95 (WUL = washing up liquid, assumed)'],
 ['Hellmann\'s Mayonnaise (size not confirmed)', '🍝 Pantry', '🥫', 5.41, 'HELLMANNS MAYONNAISE 5.41'],
 ['Sensodyne Pronamel Toothpaste (size not confirmed)', '💊 Health & Beauty', '🪥', 5.77, 'SENSODYNE PRONAMEL 5.77'],
 ['Waitrose Small Resealable Freezer Bags (size not confirmed)', '🧹 Household', '🛍️', 2.24, 'WR SML RESEAL F/BAG 2.24'],
 ['Santa Napkins (size not confirmed)', '🧹 Household', '🎅', 2.00, 'SANTA NAPKIN 2.00'],
 ['Marigold Gloves (size not confirmed)', '🧹 Household', '🧤', 3.30, 'MARIGOLD GLOVES 3.30'],
 ['Waitrose Buttermilk (size not confirmed)', '🥛 Dairy & Eggs', '🥛', 1.22, 'WR BUTTERMILK 1.22 x2'],
 ['Actimel Multifruit (size not confirmed)', '🥛 Dairy & Eggs', '🥛', 4.10, 'ACTIMEL MULTIFRUIT 4.10'],
 ['Jus-Rol Filo Pastry Sheets (size not confirmed)', '🧊 Frozen', '🥧', 2.61, 'JSRL FIL PSTRY SHTS 2.61 (frozen assumed)'],
 ['Waitrose British Raspberries (size not confirmed)', '🥦 Fruit & Veg', '🍓', 4.59, 'WR BRIT RASPBERRIES 4.59'],
 ['Waitrose Garlic Rustic Wheel (size not confirmed)', '🍞 Bread & Bakery', '🥖', 2.81, 'WR GRLC RUSTIC WHEEL 2.81'],
 ['Itsu Hoisin Bao Buns (size not confirmed)', '🧊 Frozen', '🥟', 3.83, 'ITSU HOISIN BAO BUNS 3.83'],
 ['Birds Eye Sweetcorn (size not confirmed)', '🧊 Frozen', '🌽', 3.77, 'BIRDS EYE SWEETCORN 3.77'],
 ['Waitrose 2 Mozzarella (size not confirmed)', '🥛 Dairy & Eggs', '🧀', 3.11, 'WR 2 MOZZARELLA 3.11'],
 ['Yeo Valley Yeo Yog Natural (size not confirmed)', '🥛 Dairy & Eggs', '🥛', 1.11, 'YEO YOG NATURAL 1.11'],
 ['Lurpak Slightly Salted Spread (size not confirmed)', '🥛 Dairy & Eggs', '🧈', 4.35, 'LURPAK SALT SPREAD 4.35'],
 ['Waitrose Essential Butternut Squash (size not confirmed)', '🥦 Fruit & Veg', '🎃', 1.65, 'ESS BNUT SQUASH 1.65'],
 ['Waitrose No.1 Special Strawberries (size not confirmed)', '🥦 Fruit & Veg', '🍓', 4.64, 'WR NO1 SPEC STRAW 4.64'],
 ['Waitrose Cooks\' Ingredients Garlic (size not confirmed)', '🥦 Fruit & Veg', '🧄', 0.58, 'WR CI GARLIC 0.58'],
 ['Waitrose Asparagus Tips 100g', '🥦 Fruit & Veg', '🥬', 2.27, 'WR ASPAR TIPS 100G 2.27'],
];
let at = find(16011), id = 16012;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + n[3] + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
