// Waitrose St Saviour receipt 10 Nov 14:30 (Jason L, competition entry; Visa 1630 / myWaitrose 9646).
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
// 15 items, sum 66.05 less Sausages 2 for 6 (3.20) and Meat/Fish 3 for 12 (9.69) = 53.16 (matches).
const D = '10 Nov', WR = 'Waitrose branch: St Saviour (receipt 10 Nov 14:30, Jason L)';
const wDate = id => { const o = evalRow(lines[find(id)]); return (o.upds && o.upds.waitrose) || ((o.prices.waitrose || 0) > 0 ? o.upd : ''); };
const older = id => { const d = wDate(id); return !d || dval(d) < dval(D); };
function ifOlder(id, price, note) {
  if (older(id)) { setPrice(id, 'waitrose', price, D, WR + ': ' + note); console.log('set', id, price); }
  else { addNote(id, WR + ': ' + note + ' [row already has a Waitrose price from the same day or later]'); console.log('kept', id); }
}
ifOlder(15199, 3.24, 'WR TRIPLE CHIPS 3.24 x3 (750g assumed)');
ifOlder(889, 1.05, 'ESS ICBRG LETTUCE 1.05 (unchanged)');
ifOlder(14269, 7.77, 'LIGHT DUSTED PLAICE 7.77 (Meat/Fish 3 for 12.00 deal, regular price stored)');
ifOlder(430, 1.65, 'JD 1% FAT MILK 1.65 (unchanged)');
ifOlder(2584, 1.00, 'WR DURAFOLD BAG 1.00 x2 (unchanged)');
const NEW = [
 ['Waitrose Loose Cucumber', '🥦 Fruit & Veg', '🥒', 1.16, 'WR LSE CUCUMBER 1.16'],
 ['Waitrose British Native Breed Topside Large (size not confirmed)', '🥩 Meat & Fish', '🥩', 14.65, 'WR NB TOPSIDE LRG 14.65'],
 ['Waitrose Stuffed Breaded Chicken (size not confirmed)', '🥩 Meat & Fish', '🍗', 4.93, 'WR STK BRND CHICKEN 4.93 (STK = stuffed, assumed)'],
 ['Waitrose 6 Chorizo Sausages', '🥩 Meat & Fish', '🌭', 4.60, 'WR 6 CHORIZO SAUSAGE 4.60 (WR Sausages 2 for 6.00 deal, regular price stored)'],
 ['Waitrose Cumberland Sausages (size not confirmed)', '🥩 Meat & Fish', '🌭', 4.60, 'WR CUMBERLAND SAUS 4.60 (WR Sausages 2 for 6.00 deal, regular price stored)'],
 ['Waitrose Garlic Kyivs (size not confirmed)', '🥩 Meat & Fish', '🍗', 6.96, 'WR GARLIC KYIVS 6.96 (Meat/Fish 3 for 12.00 deal, regular price stored)'],
 ['Waitrose Cajun Mini Fillets (size not confirmed)', '🥩 Meat & Fish', '🍗', 6.96, 'WR CAJUN MFILLETS 6.96 (Meat/Fish 3 for 12.00 deal, regular price stored)'],
];
let at = find(16103), id = 16104;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + n[3] + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
