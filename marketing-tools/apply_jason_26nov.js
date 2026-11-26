// Jason L (app 26 Nov 13:07-13:08): Waitrose St Helier 1 Nov 10:44 (6 items, 5 products) and Co-op Five Oaks 25 Nov 12:32 (8 items, 6 grocery lines; Marlboro x2 not counted)
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
const W = 'Waitrose branch: St Helier 334 (Jason L receipt 1 Nov 10:44)';
const C = 'Co-op branch: Five Oaks (Jason L receipt 25 Nov 12:32)';
rec(15024, 'waitrose', 3.83, '1 Nov', W + ': WR CI GOOSE FAT 3.83 (x2)');
rec(7086, 'waitrose', 2.03, '1 Nov', W + ': JASONS WHITE ROLLS 2.03');
addNote(15890, W + ': WR XL WHOLE CHICKEN 8.21 (sold by weight, price not changed)');
addNote(9618, W + ': FAIRTRADE BANANAS 0.83 (weight not printed, price not changed)');
rec(1263, 'coop', 1.49, '25 Nov', C + ': Warb 8 Crump Thins 1.49');
rec(2643, 'coop', 1.64, '25 Nov', C + ': Jersey Dairy 1% F 1.64');
rec(16125, 'coop', 0.87, '25 Nov', C + ': Jersey Dairy 1% Fa 0.87');
addNote(4278, C + ': Lu Pet Beurr 167G 1.31 at the till (offer, regular price kept)');
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
const P = { coop:0, morrisons:0, ms:0, waitrose:0, iceland:0, alliance:0 };
function add(name, cat, icon, store, price, date, note) {
  const pr = { ...P, [store]: price };
  lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:"' + cat + '", icon:"' + icon + '", prices:{' + Object.keys(P).map(s => s + ':' + pr[s]).join(',') + '}, upd:"' + date + '"}, // ' + note);
  console.log(nid, name, price); nid++;
}
add('Gressingham Duck Fat (as printed GRESSINGHAM DUCK FAT, size not confirmed)', '🍝 Pantry', '🦆', 'waitrose', 4.47, '1 Nov', W + ': GRESSINGHAM DUCK FAT 4.47');
add('Co-op Portuguese Rolls (as printed Portuguese Rolls., pack size not confirmed)', '🍞 Bread & Bakery', '🥖', 'coop', 2.65, '25 Nov', C + ': Portuguese Rolls. 2.65');
add('Happy Hens Medium Eggs 6s (as printed Happy Hens Medium, pack size assumed 6)', '🥛 Dairy & Eggs', '🥚', 'coop', 2.70, '25 Nov', C + ': Happy Hens Medium 2.70 (12s row 12061 is 5.25)');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
