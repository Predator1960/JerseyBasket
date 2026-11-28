// 28 Nov: Jason L Waitrose St Helier 28 Nov 09:14 (38 products; magazine and tulips not counted) + Katrina B Waitrose St Helier 28 Nov 10:10 (2)
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
const J = 'Waitrose branch: St Helier 334 (Jason L receipt 28 Nov 09:14)';
const K = 'Waitrose branch: St Helier 334 (Katrina B receipt 28 Nov 10:10)';
const R = (id, p, t, n) => rec(id, 'waitrose', p, '28 Nov', (n || J) + ': ' + t);
R(18703, 0.90, 'WR THK BLEACH CITRUS 0.90');
R(16087, 0.80, 'WR ESS CITRUS WUL 0.80');
R(16015, 5.77, 'SENSODYNE PRONAMEL 5.77');
R(9608, 2.09, 'WR CI GRLIC GRANULES 2.09');
R(16010, 3.22, 'TEPE EASYPICK 3.22 (x2)');
R(16062, 3.31, 'WR WALNUTS 3.31');
R(18401, 0.93, 'WR ESS EC GRAIN RICE 0.93');
R(18652, 1.16, 'COLMANS BREAD MIX 1.16 (x3, 2 for 1.50)');
R(3987, 1.16, 'CLMNS CHIL CON CARNE 1.16 (x2, 2 for 1.50)');
R(18292, 3.48, 'LINDT DARK CHOC 3.48');
R(18477, 5.22, 'WR DCD BF BRAISING 5.22');
R(14203, 7.83, 'WR LARGE WHL CHICKEN 7.83');
R(18288, 5.58, 'WR HNY&RSMRY CHIP/BC 5.58');
R(16024, 4.82, 'ITSU HOISIN BAO BUNS 4.82');
R(1210, 1.95, 'OATLY OAT DRINK BARI 1.95');
R(423, 0.87, 'JERSEY DAIRY 1% MILK 0.87');
R(85, 0.47, 'WR LEMON 3 @ 0.47');
R(16097, 2.90, 'WR BLUEBS 2.90');
R(16009, 1.57, 'WR AB CROISSANT 1.57');
R(16044, 2.90, 'H/F FR B/FAST EGGS L 2.90');
R(16104, 1.16, 'WR LSE CUCUMBER 1.16', K);
R(7260, 2.32, 'BROWN SF BOULE 2.32', K);
addNote(7608, J + ': ESS LEEKS LSE 0.74 (loose, by weight, price not changed)');
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
const P = { coop:0, morrisons:0, ms:0, waitrose:0, iceland:0, alliance:0 };
function add(name, cat, icon, price, note) {
  const pr = { ...P, waitrose: price };
  lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:"' + cat + '", icon:"' + icon + '", prices:{' + Object.keys(P).map(s => s + ':' + pr[s]).join(',') + '}, upd:"28 Nov"}, // ' + J + ': ' + note);
  console.log(nid, name, price); nid++;
}
add('Persil Non-Bio Liquid 53 Washes (as printed PERSIL LIQ 53W NON-B)', '🧺 Laundry', '🧴', 7.95, 'PERSIL LIQ 53W NON-B 7.95');
add('Waitrose Essential Redcurrant Jelly (as printed WR ESS RDCRRNT JELLY, size not confirmed)', '🍝 Pantry', '🫙', 1.74, 'WR ESS RDCRRNT JELLY 1.74');
add('Nivea Q10 Body Lotion (as printed NIVEA Q10 BODY LOTIO, size not confirmed)', '💊 Health & Beauty', '🧴', 12.52, 'NIVEA Q10 BODY LOTIO 12.52');
add('Blue Dragon Sweet Chilli Sauce (as printed BDRAGON SWT CHILLI, size not confirmed)', '🍝 Pantry', '🌶️', 3.83, 'BDRAGON SWT CHILLI 3.83');
add('Waitrose Air Fryer Spray (as printed WR AR FRYR SPRY, size not confirmed)', '🍝 Pantry', '🫒', 2.56, 'WR AR FRYR SPRY 2.56');
add('Hilltop Blossom Honey, larger jar (as printed HILLTOP BLOSSM HONEY at 4.60)', '🍝 Pantry', '🍯', 4.60, 'HILLTOP BLOSSM HONEY 4.60 (row 2093 340g is 2.30)');
add('Lenor Fabric Conditioner (as printed LENOR SA FAB CON, scent and size not confirmed)', '🧺 Laundry', '🧴', 3.96, 'LENOR SA FAB CON 3.96');
add('Waitrose Essential Cranberry Sauce (as printed WR ESS CRANBERRY SCE, size not confirmed)', '🍝 Pantry', '🫙', 1.74, 'WR ESS CRANBERRY SCE 1.74');
add('Waitrose No.1 Dark Maple Syrup (as printed NO1 DARK MAPLE SYRUP, size not confirmed)', '🍝 Pantry', '🍁', 5.16, 'NO1 DARK MAPLE SYRUP 5.16');
add('Waitrose Olive Oil Spray (as printed WR OLVE OIL SPRAY, size not confirmed)', '🍝 Pantry', '🫒', 3.02, 'WR OLVE OIL SPRAY 3.02');
add('Waitrose No.1 Orecchiette (as printed WR NO1 ORECCHIETTE, size not confirmed)', '🍝 Pantry', '🍝', 3.45, 'WR NO1 ORECCHIETTE 3.45');
add('Waitrose Almonds (as printed WR ALMONDS, size not confirmed)', '🥨 Snacks & Treats', '🌰', 3.86, 'WR ALMONDS 3.86');
add('Waitrose Wholemeal Tortilla Wraps 8 Pack (as printed WR WMEAL TTILLA 8S)', '🍞 Bread & Bakery', '🌯', 1.69, 'WR WMEAL TTILLA 8S 1.69');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
