// 28 Nov evening: Lucy D - Waitrose St Helier 28 Nov 16:58 (25 products; magazine not counted), M&S King Street 27 Nov (1, weighed steak) and 28 Nov (4), Alliance Sand Street 28 Nov (3)
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
const WL = 'Waitrose branch: St Helier 334 (Lucy D receipt 28 Nov 16:58)';
const M27 = 'M&S branch: King Street St Helier (Lucy D receipt 27 Nov 13:06)';
const M28 = 'M&S branch: King Street St Helier (Lucy D receipt 28 Nov 14:58)';
const AL = 'Alliance Sand Street (Lucy D receipt 28 Nov 15:04)';
const R = (id, p, t) => rec(id, 'waitrose', p, '28 Nov', WL + ': ' + t);
R(14735, 1.01, 'WR ESS BOURBON 1.01');
R(12436, 1.99, 'SHADES STRAWB 1.99');
R(12431, 1.99, 'SHADES ORIGINAL 1.99');
R(10843, 4.97, 'NUII PEANUT BUTTER 4.97');
R(18524, 5.17, 'B&J COOKIE DGH SANDW 5.17');
R(18351, 2.75, 'CADBURY CARAMEL STK 2.75');
R(16073, 2.79, 'JASONS GRAIN & SEEDS 2.79');
R(2641, 1.65, 'JDAIRY FAT RED MILK 1.65 (x4)');
R(9680, 1.75, 'CADBURY GIANT BUTTON 1.75');
R(16078, 1.75, 'CADBURY OREO BITES 1.75');
R(16041, 3.05, 'KP SALTED PEANUTS 3.05');
R(8090, 3.00, 'INNOCENT JUICE 3.00 (x3)');
R(16044, 2.90, 'H/H FR B/FAST EGGS L 2.90 (x2)');
R(16069, 1.60, 'BAHLSEN PICK UP DARK 1.60');
R(18343, 1.89, 'CADBURY FUDGE 1.89 (x2)');
R(18350, 1.45, 'CAD CAKE BAR CHOC 1.45');
R(4276, 1.56, 'RITZ CRACKERS 1.56 (box size not printed)');
R(18341, 1.69, 'WR LRG FLT MROOMS 1.69');
R(18530, 3.02, 'MBUNCH SQUASHUM YOGS 3.02 (x2, 2 for 3.00)');
R(17924, 1.73, 'WR ESS ALMOND DRINK 1.73');
R(8083, 2.50, 'INNOCENT KIDS SMOOTH 2.50');
rec(18355, 'ms', 3.60, '28 Nov', M28 + ': FRNC FRIE 1.5 3.60 (x2)');
rec(18357, 'ms', 1.75, '28 Nov', M28 + ': 8 MINI WHT WR 1.75');
rec(8044, 'ms', 1.65, '28 Nov', M28 + ': CI 1LTR MILK 1.65');
rec(8255, 'alliance', 2.30, '28 Nov', AL + ': POM BEAR CHEESE 6PK 2.30');
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
const P = { coop:0, morrisons:0, ms:0, waitrose:0, iceland:0, alliance:0 };
const NC = ', size not confirmed)';
function add(name, cat, icon, store, price, date, src, note) {
  const pr = { ...P, [store]: price };
  lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:"' + cat + '", icon:"' + icon + '", prices:{' + Object.keys(P).map(s => s + ':' + pr[s]).join(',') + '}, upd:"' + date + '"}, // ' + src + ': ' + note);
  console.log(nid, store, name, price); nid++;
}
add('Oreo Ice Cream (as printed OREO ICE CREAM at 3.68' + NC, '🧊 Frozen', '🍨', 'waitrose', 3.68, '28 Nov', WL, 'OREO ICE CREAM 3.68');
add("McVitie's Pink Wafers (as printed MCVITIES PINK WAFER" + NC, '🍪 Biscuits', '🍪', 'waitrose', 1.65, '28 Nov', WL, 'MCVITIES PINK WAFER 1.65');
add('Cadbury Wispa (as printed CADBURY WISPA at 1.75, smaller pack' + NC, '🍫 Confectionery', '🍫', 'waitrose', 1.75, '28 Nov', WL, 'CADBURY WISPA 1.75 (row 16039 is 2.85)');
add('Deliciously Ella Mixed Berry Oat Bars (as printed DE MXD BERRY OAT BAR' + NC, '🥨 Snacks & Treats', '🥣', 'waitrose', 3.29, '28 Nov', WL, 'DE MXD BERRY OAT BAR 3.29');
add('M&S Soured Cream (as printed SOURED CREAM at 1.50' + NC, '🥛 Dairy & Eggs', '🥛', 'ms', 1.50, '28 Nov', M28, 'SOURED CREAM 1.50 (code 00329491; row 761 300ml is 1.75)');
add('Hula Hoops Original (as printed HULA HOOPS ORIGINAL at 2.65, pack' + NC, '🥨 Snacks & Treats', '🥔', 'alliance', 2.65, '28 Nov', AL, 'HULA HOOPS ORIGINAL 2.65');
add('Walkers Cheese & Onion (as printed WALKERS CHEESE & O at 2.70, pack' + NC, '🥨 Snacks & Treats', '🥔', 'alliance', 2.70, '28 Nov', AL, 'WALKERS CHEESE & O 2.70');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
