// Lucy D: Waitrose St Helier 21 Nov (50 items; WR food magazine not groceries; 49 lines x2 = 98 pts)
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
const D = '21 Nov';
const CP = 'Waitrose branch: St Helier (Lucy receipt 21 Nov)';
const P = (id, price, txt) => setPrice(id, 'waitrose', price, D, CP + ': ' + txt);
P(12336, 4.97, 'ANDREX SKIN PROTECT 4.97 (4 rolls assumed)');
P(18351, 2.75, 'CADBURY CARAMEL STK 2.75 (was 4.72; size not printed)');
P(13058, 3.13, 'MARS ICE CREAM 3.13');
P(15253, 4.97, 'NUII SALTED CARAMEL 4.97');
P(14735, 1.01, 'WR ESS BOURBON 1.01');
P(5337, 1.27, 'BRYANT & MAY MATCHES 1.27 (variant not printed)');
P(4238, 1.96, 'TUNNOCKS TEA CAKES 1.96');
P(18340, 3.29, 'DE APPLE RAISIN CIN 3.29');
P(12431, 1.99, 'SHADES ORIGINAL 1.99');
P(12436, 1.99, 'SHADES STRAWB 1.99');
P(18339, 1.75, 'CADBURY TWIRL BITES 1.75');
P(586, 1.75, 'CADBURY CARA NIBBLES 1.75');
P(9680, 1.75, 'CADBURY GIANT BUTTON 1.75');
P(13861, 1.02, 'WR ESS VARIETY 2 x 1.02');
P(17790, 4.35, 'WR XMAS M CLSC PANE 4.35 (free with myWaitrose)');
P(18348, 3.11, 'WR CHICKEN STEAKS 3.11');
P(7913, 1.55, 'POM-BEAR ORIGINAL 1.55');
P(16044, 2.90, 'H/H FR B/FAST EGGS L 3 x 2.90');
P(16073, 2.79, 'JASONS GRAIN & SEEDS 2.79');
P(4172, 2.65, 'CRISP&DRY RAP OIL 1L 2.65');
P(5679, 3.48, 'PEPSI MAX CAN 3.48');
P(8090, 3.00, 'INNOCENT JUICE 3.00');
P(2641, 1.65, 'JDAIRY FAT RED MILK 4 x 1.65');
P(18341, 1.69, 'WR LRG FLT MROOMS 1.69');
P(7610, 8.70, 'WR NB BEEF MINCE 5% 8.70 (was 7.50 in July)');
P(18418, 0.82, 'ESS SALAD ONIONS 0.82');
P(16041, 3.05, 'KP SALTED PEANUTS 3.05');
const NEWROWS = [
  ['Whiskas 7+ Poultry in Jelly Wet Cat Food 40x85g (as printed WHISK7+ PLT J 40X85G)', '🐾 Pet', '🐱', 15.90, 'WHISK7+ PLT J 40X85G 15.90'],
  ["Ben & Jerry's Cookie Dough Ice Cream Sandwich (as printed B&J COOKIE DGH SANDW, size not confirmed)", '🧊 Frozen', '🍨', 5.17, 'B&J COOKIE DGH SANDW 5.17'],
  ['Garnier Bright Serum (as printed GARNIER BRIGHT SERUM, size not confirmed)', '💊 Health & Beauty', '🧴', 9.73, 'GARNIER BRIGHT SERUM 9.73'],
  ['Waitrose Chocolate Malted Milk Biscuits (as printed WR CHOC MALT MILK BC, size not confirmed)', '🥨 Snacks & Treats', '🍪', 1.75, 'WR CHOC MALT MILK BC 1.75'],
  ['Crosta & Mollica Pizza Margherita (as printed CM PIZZA MARGHERITA, size not confirmed)', '🧊 Frozen', '🍕', 5.68, 'CM PIZZA MARGHERITA 5.68'],
  ['Waitrose No.1 Crumble Mince Pies (as printed NO1 CRUMBLE MPIES, size not confirmed)', '🍞 Bread & Bakery', '🥧', 4.64, 'NO1 CRUMBLE MPIES 4.64 (free with myWaitrose)'],
  ['Waitrose Essential Chopped Tomatoes (single tin, as printed WR ESS CHPD TOMATOES, size not confirmed)', '🍝 Pantry', '🍅', 0.70, 'WR ESS CHPD TOMATOES 3 x 0.70'],
  ['Munch Bunch Squashums Yogurts (as printed MBUNCH SQUASHUM YOGS, pack size not confirmed)', '🥛 Dairy & Eggs', '🥛', 3.02, 'MBUNCH SQUASHUM YOGS 4 x 3.02 (2 for £3 offer)'],
  ['Waitrose Courgettes 500g (as printed WR COURGS 500G)', '🥦 Fruit & Veg', '🥒', 2.56, 'WR COURGS 500G 2.56'],
  ['Channel Island Red Chillies (as printed CISLAND RED CHILLIES, size not confirmed)', '🥦 Fruit & Veg', '🌶️', 1.20, 'CISLAND RED CHILLIES 1.20'],
];
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, price, note]) => { lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + price + ',iceland:0,alliance:0}, upd:"21 Nov"}, // ' + CP + ': ' + note); console.log(nid, note); nid++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
