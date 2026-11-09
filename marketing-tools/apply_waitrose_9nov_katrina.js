// Waitrose St Helier receipt 9 Nov 17:39 (Katrina B, competition entry, staff card).
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
// 11 items; sum 31.47 less 20% partner discount 6.30 = 25.17 paid by gift card. Pre-discount prices stored.
const D = '9 Nov', WR = 'Waitrose St Helier shopper receipt 9 Nov 17:39 (Katrina B, staff card, pre-discount prices)';
setPrice(7595, 'waitrose', 1.51, D, WR + ': ESS COLESLAW 300G 1.51 (row was 1.30)');
setPrice(7604, 'waitrose', 1.92, D, WR + ': WR SWEETCORN 2S 1.92 (row was 1.55)');
setPrice(14164, 'waitrose', 4.05, D, WR + ': UE OVEN ROAST HAM 4.05 (Unearthed, written on the receipt)');
setPrice(8065, 'waitrose', 1.90, D, WR + ': HULA HOOPS BBQ BEEF 1.90 (size not confirmed)');
setPrice(7608, 'waitrose', 0.65, D, WR + ': ESS LEEKS LSE 0.65 (row was 0.63)');
setPrice(2641, 'waitrose', 1.65, D, WR + ': JDAIRY FAT RED MILK 1.65');
addNote(849, WR + ': WR SPECIALITY FIGS 3.43 (unchanged)');
addNote(15930, WR + ': WR LIME 0.35 (unchanged)');
const NEW = [
 ['Channel Island Large Cucumber', '🥦 Fruit & Veg', '🥒', 1.25, 'CISLAND LG CUCUMBER 1.25'],
 ['French Cheese Selection Large (HF, brand not confirmed)', '🥛 Dairy & Eggs', '🧀', 13.23, 'HF FRNCH CHS SLCTN L 13.23'],
 ['Propercorn Sweet & Salty Popcorn (size not confirmed)', '🍿 Snacks', '🍿', 1.53, 'PROPERCORN SWT&SALTY 1.53'],
];
let at = find(16064), id = 16065;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + n[3] + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
