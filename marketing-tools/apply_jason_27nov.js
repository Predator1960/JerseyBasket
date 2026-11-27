// Jason L (app 27 Nov 15:59-16:01): M&S King St 9 Nov (4), Morrisons Five Oaks 27 Nov (2; reduced chicken breast counted not stored; Xmas draw not counted), Waitrose St Helier 27 Nov (6; Take a Break magazine not counted), Morrisons Benests 27 Nov (2; ribeye by weight not stored)
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
const M = 'M&S branch: King Street, St Helier (Jason L receipt 9 Nov 11:37)';
const W = 'Waitrose branch: St Helier 334, scan & go (Jason L receipt 27 Nov 15:59)';
const F = 'Morrisons branch: Five Oaks (Jason L receipt 27 Nov 15:16)';
const B = 'Morrisons branch: Benests (Jason L receipt 27 Nov 14:30)';
rec(18683, 'ms', 1.75, '9 Nov', M + ': ALRND POTS 2K 1.75');
rec(18335, 'ms', 1.00, '9 Nov', M + ': SPROUTS 1.00');
rec(91, 'ms', 3.10, '9 Nov', M + ': RED GRAPE 3.10 (2 for offer)');
rec(18337, 'ms', 3.10, '9 Nov', M + ': KIWI FRUIT 3.10 (2 for offer)');
rec(430, 'waitrose', 1.65, '27 Nov', W + ': JD 1% FAT MILK 1.65');
rec(12436, 'waitrose', 1.99, '27 Nov', W + ': SHADES STRAWB 1.99 (x4)');
rec(4535, 'waitrose', 1.39, '27 Nov', W + ': SQUASHIES ORIGINAL 1.39 (x2)');
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
const P = { coop:0, morrisons:0, ms:0, waitrose:0, iceland:0, alliance:0 };
function add(name, cat, icon, store, price, date, note) {
  const pr = { ...P, [store]: price };
  lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:"' + cat + '", icon:"' + icon + '", prices:{' + Object.keys(P).map(s => s + ':' + pr[s]).join(',') + '}, upd:"' + date + '"}, // ' + note);
  console.log(nid, name, price); nid++;
}
add('Guinness Draught 12 Pack (as printed GUINNESS 12S, can size not confirmed)', '🍷 Wine & Beer', '🍺', 'waitrose', 14.79, '27 Nov', W + ': GUINNESS 12S 14.79');
add('Old Speckled Hen 10 Pack (as printed OLD SPECKLED HEN 10S, size not confirmed)', '🍷 Wine & Beer', '🍺', 'waitrose', 14.43, '27 Nov', W + ': OLD SPECKLED HEN 10S 14.43');
add('Morrisons Creations Orange & Mango (as printed MORRISONS CREATIONS ORANGE & M, product and size not confirmed)', '🥤 Drinks', '🧃', 'morrisons', 3.10, '27 Nov', F + ': MORRISONS CREATIONS ORANGE & M 3.10');
add('Pork & Honey Sausages (as printed PORK & HONEY SAUSAGES, size not confirmed)', '🥩 Meat & Fish', '🌭', 'morrisons', 4.49, '27 Nov', B + ': PORK & HONEY SAUSAGES 4.49 (x2; shelf label said 3.99 per pack)');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
