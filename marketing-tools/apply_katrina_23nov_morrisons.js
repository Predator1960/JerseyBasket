// Katrina B (app 23 Nov 13:42): Morrisons Daily St Ouen 23 Nov 11:39 (9 lines; 6 count: Roses plant, Fixodent, Colgate skipped)
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
const K = 'Morrisons branch: Daily St Ouen (Katrina B receipt 23 Nov 11:39)';
addNote(88, K + ': MORRISONS RASPBERRIES 2 x 3.00 (M fruit deal -1.80, so 2 for 4.20)');
setPrice(5260, 'morrisons', 8.55, '23 Nov', K + ': ARIEL ORIGINAL WASHING LIQUID 8.55 (26 washes inferred: same price as Iceland 26-wash, same owner)');
setPrice(109, 'morrisons', 1.40, '23 Nov', K + ': MORRISONS RED ONIONS 1.40 (pack size not printed; Iceland 3 pack also 1.40)');
const NEWROWS = [
  ['Morrisons Cottage Pie (as printed MORRISONS COTTAGE PIE, size not confirmed)', '🌡️ Chilled', '🥧', 'morrisons', 2.79, K, 'MORRISONS COTTAGE PIE 2.79'],
  ['Morrisons The Best Carrot Cake (as printed MORRISONS BEST CAKE CARROT, size not confirmed)', '🍞 Bread & Bakery', '🍰', 'morrisons', 5.35, K, 'MORRISONS BEST CAKE CARROT 5.35'],
  ['Cadbury Dairy Milk Caramel (as printed CADBURY DAIRY MILK CARAMEL, size not confirmed)', '🍫 Confectionery', '🍫', 'morrisons', 3.60, K, 'CADBURY DAIRY MILK CARAMEL 3.60'],
];
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, store, price, src, note]) => { const p = S.map(s => s + ':' + (s === store ? price : 0)).join(','); lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{' + p + '}, upd:"23 Nov"}, // ' + src + ': ' + note); console.log(nid, note); nid++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
