// Mary C (app 25 Nov 12:12): M&S School Road 25 Nov 11:55 (16 items, 15 lines)
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
const M = 'M&S branch: School Road St Clement (Mary C receipt 25 Nov 11:55)';
rec(15990, 'ms', 1.05, '25 Nov', M + ': WHT MUSHROOM 1.05');
rec(15908, 'ms', 4.65, '25 Nov', M + ': CHOC ALMND 10 4.65');
rec(18584, 'ms', 1.65, '25 Nov', M + ': TRAD SLAW 300 1.65 (was 1.60)');
rec(15992, 'ms', 8.75, '25 Nov', M + ': BTH BEEF MINC 8.75');
rec(472, 'ms', 1.40, '25 Nov', M + ': PORTUGESE ROL 1.40 (barcode 5018985232229)');
const NC = ', size not confirmed)';
const NEWROWS = [
  ['M&S Oven Done Pork Belly (as printed ODB PORK BELL' + NC, '🥩 Meat & Fish', '🥓', 7.94, 'ODB PORK BELL 7.94 (code 00664493)'],
  ['M&S Southern Style Chicken Drumsticks & Thighs (as printed SS DRUMS/THIG' + NC, '🥩 Meat & Fish', '🍗', 6.80, 'SS DRUMS/THIG 6.80 x2 (3 for 12.60)'],
  ['M&S Buttermilk Chicken Tenders (as printed BUTMILK TENDE' + NC, '🥩 Meat & Fish', '🍗', 6.80, 'BUTMILK TENDE 6.80 (3 for 12.60)'],
  ['M&S BBQ Rib Rack (as printed BBQ RIB RACK' + NC, '🥩 Meat & Fish', '🍖', 9.25, 'BBQ RIB RACK 9.25 (Slowcook Dine In 12.60)'],
  ['M&S Chunky Chips (as printed CHNKY CHIPS S' + NC, '🧊 Frozen', '🍟', 3.45, 'CHNKY CHIPS S 3.45 (Dine In)'],
  ['M&S 70% Dark Drinking Chocolate (as printed 70 DARK DRNKG' + NC, '🥤 Drinks', '☕', 7.50, '70 DARK DRNKG 7.50 (code 29467013)'],
  ['M&S Collection Dark Chocolate Raspberry (as printed COL DARK RSPB' + NC, '🍫 Confectionery', '🍫', 3.70, 'COL DARK RSPB 3.70 (code 29398065)'],
  ['M&S British Beef Burgers (as printed BRI BEEF BURG' + NC, '🥩 Meat & Fish', '🍔', 6.80, 'BRI BEEF BURG 6.80 (code 29493043)'],
  ['M&S Walnut Pieces (as printed WALNUT PIECES' + NC, '🍝 Pantry', '🥜', 1.90, 'WALNUT PIECES 1.90 (code 29157235)'],
  ['M&S Runner Bean & Veg (as printed RUN BEAN & VE' + NC, '🥦 Fruit & Veg', '🫛', 3.40, 'RUN BEAN & VE 3.40 (Dine In)'],
];
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, price, note]) => { lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{coop:0,morrisons:0,ms:' + price + ',waitrose:0,iceland:0,alliance:0}, upd:"25 Nov"}, // ' + M + ': ' + note); console.log(nid, note); nid++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
