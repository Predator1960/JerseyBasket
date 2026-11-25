// Sandra B (emailed): Co-op St Peter's Village 24 Nov 09:04 (10 items, 9 lines; chicken, salmon, haddock reduced to clear on the day)
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
// rec: update the store price only when this receipt is at least as new as the row's current date for that store (or the store has no price); otherwise just add a note
function rec(id, store, price, date, note) {
  const i = find(id); if (i < 0) throw new Error('missing row ' + id);
  const o = evalRow(lines[i]);
  const cur = o.prices[store] || 0;
  const curDate = (o.upds && o.upds[store]) || (cur > 0 ? o.upd : '') || '';
  if (cur === 0 || dval(date) >= dval(curDate)) setPrice(id, store, price, date, note);
  else addNote(id, note + ' (older receipt, price not changed)');
}
const C = 'Co-op branch: St Peter\'s Village (Sandra B receipt 24 Nov 09:04)';
rec(2569, 'coop', 2.45, '24 Nov', C + ': Cp Extra Thick Foil 2.45');
rec(5346, 'coop', 2.45, '24 Nov', C + ': Co-op Cling Film 2.45');
rec(3385, 'coop', 8.00, '24 Nov', C + ': Cp B Chl 6 F 850G 8.00 (reduced to clear on the day)');
rec(2872, 'coop', 3.25, '24 Nov', C + ': Cp Blackberries 3.25');
rec(16207, 'coop', 3.20, '24 Nov', C + ': Cp Raspberries 3.20');
rec(3223, 'coop', 5.90, '24 Nov', C + ': Cp Salmon Fillets 5.90 (reduced to clear -1.95 on the day)');
rec(3606, 'coop', 5.60, '24 Nov', C + ': Cp 2 Battered Hdck 5.60 (reduced to clear -1.85 on the day)');
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
[['Co-op Irresistible Maple Streaky Bacon (as printed Cp I Mpl Strky Bcn, size not confirmed)', '🥩 Meat & Fish', '🥓', 2.62, 'Cp I Mpl Strky Bcn 2 @ 2.62'],
 ['Twinings Tea, 20 bags 40g (as printed Tw Sb M Tb 20S40g, variety not confirmed)', '🥤 Drinks', '🍵', 3.15, 'Tw Sb M Tb 20S40g 3.15']].forEach(([name, cat, icon, price, note]) => {
  lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{coop:' + price + ',morrisons:0,ms:0,waitrose:0,iceland:0,alliance:0}, upd:"24 Nov"}, // ' + C + ': ' + note); console.log(nid, note); nid++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
