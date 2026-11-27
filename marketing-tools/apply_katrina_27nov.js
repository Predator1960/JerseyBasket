// Katrina B (app 27 Nov 12:15): Waitrose St Saviour 332 scan & go 27 Nov 11:38, 28 products visible (receipt folded; totals hidden), reduced pork ribeye counted not stored
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
const W = 'Waitrose branch: St Saviour 332, scan & go (Katrina B receipt 27 Nov 11:38)';
const R = (id, p, t) => rec(id, 'waitrose', p, '27 Nov', W + ': ' + t);
R(18295, 9.78, 'NO1 CHK SATAY SKEWER 9.78');
R(18299, 4.64, 'DENHAY SMKD BACON 4.64');
R(18298, 4.64, 'DHAY BACK SMK BACON 4.64');
R(15927, 8.05, 'WR SC S&S PORK RIBS 8.05');
R(15971, 3.45, 'WR ESS SD MOZZARELLA 3.45');
R(2641, 1.65, 'JDAIRY FAT RED MILK 1.65 (x2)');
R(18306, 2.39, 'WR APPLE ELDERFLOWER 2.39');
R(7675, 1.74, 'ESS FR WHITE EGGS 1.74');
R(18313, 1.60, 'PICK UP CARAMEL 1.60');
R(18314, 2.00, 'MCVITIES JAFFA CAKES 2.00');
R(14651, 6.96, 'SHEBA SUCCULENT CAT 6.96');
R(7008, 6.96, 'SHEBA FLAKES FISH 6.96 (12 x 85g assumed)');
R(7595, 1.57, 'ESS COLESLAW 300G 1.57');
R(16008, 2.05, 'TYRELLS GAMMON 2.05');
R(15467, 4.97, 'WR LEM DW TABS 44S 4.97');
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
const P = { coop:0, morrisons:0, ms:0, waitrose:0, iceland:0, alliance:0 };
function add(name, cat, icon, price, note) {
  const pr = { ...P, waitrose: price };
  lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:"' + cat + '", icon:"' + icon + '", prices:{' + Object.keys(P).map(s => s + ':' + pr[s]).join(',') + '}, upd:"27 Nov"}, // ' + W + ': ' + note);
  console.log(nid, name, price); nid++;
}
add('Waitrose No.1 8 Mini Burgers (as printed NO1 8 MINI BURGERS)', '🥗 Deli & Salads', '🍔', 9.78, 'NO1 8 MINI BURGERS 9.78');
add('Waitrose No.1 8 King Prawn Toasts (as printed NO1 8 KING PRWN TST)', '🥗 Deli & Salads', '🦐', 9.78, 'NO1 8 KING PRWN TST 9.78');
add('Waitrose Easy to Cook Herby Fries (as printed WR ETC HERBY FRIES, size not confirmed)', '🥦 Fruit & Veg', '🍟', 3.48, 'WR ETC HERBY FRIES 3.48');
add('Waitrose Easy to Cook Mash (as printed WR EASY TO COOK MASH, size not confirmed)', '🥦 Fruit & Veg', '🥔', 3.48, 'WR EASY TO COOK MASH 3.48');
add('Waitrose Cheese Garlic Bread (as printed WR PC CHE GARLIC BRE, size not confirmed)', '🍞 Bread & Bakery', '🥖', 3.45, 'WR PC CHE GARLIC BRE 3.45');
add('Waitrose Steak Pie (as printed WR STEAK PIE, size not confirmed)', '🥗 Deli & Salads', '🥧', 4.60, 'WR STEAK PIE 4.60');
add('Waitrose Bucks Fizz (as printed WR BUCKS FIZZ, size not confirmed)', '🍷 Wine & Beer', '🥂', 3.26, 'WR BUCKS FIZZ 3.26 (x2)');
add('Dolmio Pasta Bake Sauce (as printed DOLMIO PASTA BAKE, flavour and size not confirmed)', '🍝 Pantry', '🍝', 3.17, 'DOLMIO PASTA BAKE 3.17 (x2)');
add('The Spice Tailor Indonesian Rendang (as printed TSI INDO RENDANG, size not confirmed)', '🍝 Pantry', '🍛', 3.64, 'TSI INDO RENDANG 3.64');
add('Waitrose Chicken & Cheese Snack (as printed WR PP CHICKEN CHEESE, product not confirmed)', '🥗 Deli & Salads', '🧀', 1.00, 'WR PP CHICKEN CHEESE 1.00');
add('Felix Beef & Chicken Dry Cat Food (as printed FELIX B&C DRY FOOD, size not confirmed)', '🐾 Pet Care', '🐈', 3.50, 'FELIX B&C DRY FOOD 3.50');
add('Bottlegreen Pomegranate & Elderflower (as printed BGREEN POM & EFLOWER, size not confirmed)', '🥤 Drinks', '🧃', 2.50, 'BGREEN POM & EFLOWER 2.50');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
