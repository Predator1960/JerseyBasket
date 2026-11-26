// Katrina B (app 26 Nov 09:37): Morrisons Daily St Ouen 24 Nov 14:23 (18 items, 13 products; bag for life crossed out) and 25 Nov 11:54 (6 products; one line crossed out by entrant)
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
const A = 'Morrisons branch: Daily St Ouen (Katrina B receipt 24 Nov 14:23)';
const B = 'Morrisons branch: Daily St Ouen (Katrina B receipt 25 Nov 11:54)';
rec(4627, 'morrisons', 3.05, '24 Nov', A + ': HULA HOOPS BBQ BEEF 6PK 3.05 (multipack offer)');
rec(13855, 'morrisons', 3.05, '24 Nov', A + ': HULA HOOPS FAMILY VARIETY 6PK 3.05 (multipack offer)');
rec(2641, 'morrisons', 1.64, '24 Nov', A + ': JERSEY DAIRY 2.5% FAT MILK 1.64');
rec(18412, 'morrisons', 5.25, '24 Nov', A + ': C/CITY CHEDDAR MATURE WHITE 5.25');
rec(455, 'morrisons', 2.35, '24 Nov', A + ': JSY DAIRY SALTED BUTTER 2.35');
rec(472, 'morrisons', 2.29, '24 Nov', A + ': ISLANDS CHOICE PORTUGUESE ROLL 2.29');
rec(16044, 'morrisons', 2.55, '24 Nov', A + ': HAPPY HENS B/FAST EGGS 6PK 2 x 2.55 (More Card 2 for 3.50)');
rec(5233, 'morrisons', 5.25, '25 Nov', B + ': MR.MUSCLE SINK/PLUG 500ML 5.25');
rec(10508, 'morrisons', 3.50, '25 Nov', B + ': FLORA LIGHTER 3.50 (size not printed)');
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
const P = { coop:0, morrisons:0, ms:0, waitrose:0, iceland:0, alliance:0 };
function add(name, cat, icon, price, date, note) {
  const pr = { ...P, morrisons: price };
  lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:"' + cat + '", icon:"' + icon + '", prices:{' + Object.keys(P).map(s => s + ':' + pr[s]).join(',') + '}, upd:"' + date + '"}, // ' + note);
  console.log(nid, name, price); nid++;
}
add('Morrisons The Best Finely Sliced (as printed MORRISONS BEST FINELY SLICED D, product not confirmed)', '🥩 Meat & Fish', '🥩', 4.35, '24 Nov', A + ': MORRISONS BEST FINELY SLICED D 2 x 4.35 (Best meat deal)');
add('Morrisons Bolognese Sauce (as printed MORRISONS SAUCE BOLOGNESE, size not confirmed)', '🍝 Pantry', '🥫', 1.83, '24 Nov', A + ': MORRISONS SAUCE BOLOGNESE 1.83 (x2)');
add('Morrisons Corned Beef (as printed MORRISONS CORNED BEEF PMP, size not confirmed)', '🍝 Pantry', '🥫', 2.89, '24 Nov', A + ': MORRISONS CORNED BEEF PMP 2.89');
add('Morrisons Savers 25% Fat Beef Mince (as printed MORRISONS SAVERS 25% BEEF MINC, size not confirmed)', '🥩 Meat & Fish', '🥩', 4.40, '24 Nov', A + ': MORRISONS SAVERS 25% BEEF MINC 4.40 (x2)');
add('Tarczynski Pork Kabanos (as printed TARCZYNSKI PORK KABANOS, size not confirmed)', '🥩 Meat & Fish', '🌭', 3.80, '24 Nov', A + ': TARCZYNSKI PORK KABANOS 3.80');
add('Morrisons Smoked Bacon Lardons (as printed MORRISONS LARDONS SMOKED, size not confirmed)', '🥩 Meat & Fish', '🥓', 2.80, '24 Nov', A + ': MORRISONS LARDONS SMOKED 2.80');
add('Morrisons Yorkshire Vale Still Water (as printed MORRISONS YORKSHIRE VALE STILL, pack size not confirmed)', '🥤 Drinks', '💧', 2.80, '25 Nov', B + ': MORRISONS YORKSHIRE VALE STILL 2.80');
add('J2O Orange & Passion Fruit (as printed J20 ORANGE & PASSIONFRUIT at 8.00, pack size not confirmed)', '🥤 Drinks', '🧃', 8.00, '25 Nov', B + ': J20 ORANGE & PASSIONFRUIT 8.00');
add('Morrisons Olive Oil (as printed MORRISONS OLIVE OIL, size not confirmed)', '🍝 Pantry', '🫒', 8.10, '25 Nov', B + ': MORRISONS OLIVE OIL 8.10');
add('Loose Sweet Potatoes (per kg, as printed LOOSE SWEET POTATO)', '🥦 Fruit & Veg', '🍠', 1.70, '25 Nov', B + ': LOOSE SWEET POTATO 0.425kg @ £1.70/kg (price per kg)');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
