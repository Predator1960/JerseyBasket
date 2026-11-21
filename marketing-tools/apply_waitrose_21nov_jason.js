// Jason L: Waitrose St Helier 21 Nov 14:03 (29 items, 29 lines x2 = 58 pts)
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
const CP = 'Waitrose branch: St Helier (Jason receipt 21 Nov 14:03)';
const P = (id, price, txt) => setPrice(id, 'waitrose', price, D, CP + ': ' + txt);
P(15428, 2.49, 'WR ESS K/ROLLS 2ROLL 2.49');
P(14913, 1.57, 'WR CI BAKING POWDER 1.57');
P(4104, 3.48, 'T&L FT CASTER SUGAR 3.48 (size not printed; 1kg assumed from price)');
P(13884, 2.27, 'WR TOAST FLAKE ALMND 2.27');
P(7948, 2.90, 'WR CHIA SEED 2.90');
P(7525, 5.98, 'WR SALMON FILLETS 5.98 (pack not printed; was 5.80 in July)');
P(17847, 1.86, 'WR RTR PUFF PASTRY 1.86 (ready rolled; size not printed)');
P(740, 1.28, 'BRIT SOURED CREAM 1.28');
P(16027, 1.11, 'YEO YOG NATURAL 1.11');
P(18479, 2.30, 'WR ESS UNSLTD BUTTER 2 x 2.30');
P(1210, 1.95, 'OATLY OAT DRINK BARI 1.95');
P(16020, 5.80, 'ACTIMEL MULTIFRUIT 5.80 (was 4.10 on 31 Oct; pack size not printed)');
P(14608, 1.16, 'WR RED ONIONS 1.16');
P(7617, 2.90, 'WR FINE ASPAR 100G 2.90 (receipt says 100g)');
P(7076, 2.78, 'WR PLADY APPLES 6S 2.78');
P(16097, 2.90, 'WR BLUEBS 2.90');
P(18406, 2.90, 'WR F/R EGGS LARGE 2.90');
const NEWROWS = [
  ['Waitrose Essential Bathroom Tissue (as printed WR ESS BATHRM TISSUE, pack size not confirmed)', '🧹 Household', '🧻', 3.98, 'WR ESS BATHRM TISSUE 3.98'],
  ['Bisto Best Vegetable Gravy (as printed BISTO BEST VEG GRAVY, size not confirmed)', '🍝 Pantry', '🥫', 3.97, 'BISTO BEST VEG GRAVY 3.97'],
  ['Medjool Dates (as printed NATURE MEDJOOL DATES, brand and size not confirmed)', '🍝 Pantry', '🌴', 6.09, 'NATURE MEDJOOL DATES 6.09'],
  ['Waitrose Large Orange (each)', '🥦 Fruit & Veg', '🍊', 0.93, 'WR LARGE ORANGE 0.93'],
  ['Sweet Stem Broccoli (as printed SWEET STEM BROCCOLI, size not confirmed)', '🥦 Fruit & Veg', '🥦', 2.96, 'SWEET STEM BROCCOLI 2.96'],
];
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, price, note]) => { lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + price + ',iceland:0,alliance:0}, upd:"21 Nov"}, // ' + CP + ': ' + note); console.log(nid, note); nid++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
