// Katrina B: Waitrose St Helier 334, 22 Nov 10:33 (12 lines) and Waitrose St Saviour 332, 21 Nov 14:49 (6 lines); staff card, pre-discount prices
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
const A = 'Waitrose branch: St Helier 334 (Katrina receipt 22 Nov 10:33, staff card, pre-discount prices)';
const B = 'Waitrose branch: St Saviour 332 (Katrina receipt 21 Nov 14:49, staff card, pre-discount prices)';
setPrice(987, 'waitrose', 2.32, '22 Nov', A + ': JUS-ROL PUFF SHEET 2.32');
setPrice(7562, 'waitrose', 2.09, '22 Nov', A + ': WR ESS DOUBLE CREAM 2.09');
setPrice(18312, 'waitrose', 2.56, '22 Nov', A + ': JACKSON MG BRWN BLOM 2.56 (was 2.32)');
setPrice(7582, 'waitrose', 1.57, '22 Nov', A + ': WR LSE CAULIFLOWER 1.57 (was 1.35)');
setPrice(8005, 'waitrose', 1.23, '21 Nov', B + ': WR SWT SALT POPCORN 1.23 (was 1.20)');
const NEWROWS = [
  ['Waitrose No.1 Cherry Tart (size not confirmed)', '🍞 Bread & Bakery', '🥧', 8.70, A, 'NO.1 CHERRY TART 8.70'],
  ['Waitrose Meatballs (as printed WR NB MEATBALLS, variant and size not confirmed)', '🥩 Meat & Fish', '🥩', 5.64, A, 'WR NB MEATBALLS 5.64'],
  ['Britannia Beef Dripping (size not confirmed)', '🍝 Pantry', '🛒', 1.74, A, 'BRITANNIA BEEF DRIP 1.74'],
  ['Waitrose Chicken Breast Fillets (as printed WR CHICK BRST FLTS, size not confirmed)', '🥩 Meat & Fish', '🍗', 11.89, A, 'WR CHICK BRST FLTS 11.89'],
  ['Waitrose Fresh Linguine (size not confirmed)', '🍝 Pantry', '🍝', 3.19, A, 'WR FRESH LINGUINE 3.19'],
  ['Waitrose Garlic Ciabatta (size not confirmed)', '🍞 Bread & Bakery', '🍞', 2.53, A, 'WR GARLIC CIABATTA 2.53'],
  ['Waitrose Snowman Crumpets (size not confirmed)', '🍞 Bread & Bakery', '🍞', 1.74, A, 'WR SNOWMAN CRUMPETS 1.74'],
  ['Waitrose Sweet Popcorn (size not confirmed)', '🍿 Snacks', '🍿', 1.23, B, 'WR SWEET POPCORN 1.23'],
];
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, price, src, note]) => { const d = src === A ? '22 Nov' : '21 Nov'; lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + price + ',iceland:0,alliance:0}, upd:"' + d + '"}, // ' + src + ': ' + note); console.log(nid, note); nid++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
