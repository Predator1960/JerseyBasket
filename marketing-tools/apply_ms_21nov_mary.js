// Mary C: M&S School Road, St Clement 21 Nov 13:53 (10 items, 10 lines x2 = 20 pts)
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
const CP = 'M&S branch: School Road, St Clement (Mary receipt 21 Nov 13:53)';
const P = (id, price, txt) => setPrice(id, 'ms', price, D, CP + ': ' + txt);
P(15900, 4.30, '4PK MINCE PIE 4.30');
P(15991, 2.45, 'SOFFRITTO BAS 2.45');
const NEWROWS = [
  ['M&S Hand Crafted Pork Sausage Roll (as printed HC SAU RL PRK, size not confirmed)', '🥩 Meat & Fish', '🥐', 4.30, 'HC SAU RL PRK 2 x 4.30 (3 for £8.40 offer on the receipt)'],
  ['M&S Quiche Cheese & Ham (as printed QCH CL HAM CH, size not confirmed)', '🌡️ Chilled', '🥧', 4.95, 'QCH CL HAM CH 4.95 (in the 3 for £8.40 offer)'],
  ['M&S Coquilles St Jacques (as printed COQUILLE ST J, size not confirmed)', '🥩 Meat & Fish', '🐚', 5.55, 'COQUILLE ST J 5.55'],
  ['M&S Organic Free Range Large Eggs (as printed ORG EGGS LGE, pack size not confirmed)', '🥛 Dairy & Eggs', '🥚', 4.10, 'ORG EGGS LGE 4.10'],
  ['M&S Sweet & Crunchy (as printed SWT & CRUNCH, product not confirmed)', '🥦 Fruit & Veg', '🥗', 3.10, 'SWT & CRUNCH 3.10'],
  ['M&S Diced White Onions (as printed DICED WHT ONI, size not confirmed)', '🥦 Fruit & Veg', '🧅', 1.90, 'DICED WHT ONI 1.90'],
  ['M&S Rosso Puglia Wine Pouch (as printed ROSSOPUGL POU, size not confirmed)', '🍷 Wine & Beer', '🍷', 17.50, 'ROSSOPUGL POU 17.50'],
];
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, price, note]) => { lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{coop:0,morrisons:0,ms:' + price + ',waitrose:0,iceland:0,alliance:0}, upd:"21 Nov"}, // ' + CP + ': ' + note); console.log(nid, note); nid++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
