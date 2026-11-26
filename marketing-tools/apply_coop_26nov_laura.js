// Laura (catalogue only): Co-op Millennium Park 26 Nov 17:02, 86 items 189.01 (members prices noted, regular prices stored; Lindt Choc and Cp Crs Ps 300G too vague to match)
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
const C = 'Co-op branch: Millennium Park (Laura receipt 26 Nov 17:02)';
const D = '26 Nov';
const R = (id, p, t) => rec(id, 'coop', p, D, C + ': ' + t);
R(8041, 3.65, 'Coca-colazerosugar 3.65');
R(15959, 1.35, 'Lczde Enrgy Ornge 1.35');
R(9932, 1.55, 'T&L F.T Icng Sgr 1.55');
R(6983, 1.10, 'Cp Meaty Dog Food 1.10 (x2, flavour not printed)');
R(15958, 1.35, 'Lczde 0 Pnk Lmnde 1.35');
R(11650, 1.30, 'Cp Cotton Fresh Air 2 @ 1.30');
R(9641, 2.65, 'Andrx Sprme Qilt 2.65');
R(2641, 1.64, 'Jersey Green Fat R 2 @ 1.64');
R(5177, 3.40, 'Flash B&C 3.40');
R(4011, 1.30, 'Spaghetti Blgnse 1.30');
R(1094, 1.75, 'Warb Wht/W.Meal 1.75');
R(3721, 1.90, 'Cp Lrg Trtila Wrap 1.90');
R(3802, 3.20, 'B.E Chicken Dippers 3.20 (frozen any 3 for 7)');
R(3815, 3.89, 'Crispy French Fries 3.89 (frozen any 3 for 7)');
R(3817, 3.40, 'Mcc Lite Spiced Wedg 3.40 (frozen any 3 for 7)');
R(2156, 5.80, 'Nutla I/Crem Tub 5.80 (members 3.65 seen 26 Nov)');
R(16467, 1.42, 'Brtns Wgn Whls Jmmie 1.42');
R(8032, 2.80, 'Rce Krsps Squrs Chc 2.80');
R(16070, 1.60, 'French Fries 1.60');
R(3786, 1.95, 'Cp Db Pep Stonbaked 1.95');
R(5646, 3.70, '7Up Zero 8Pk 3.70');
R(12838, 4.95, 'Fnta Or Z 8X330ml 4.95');
R(11311, 1.94, 'Wotsit C Cheese 140G 1.94');
R(9629, 2.25, 'Cp Alum Foil 300Mm 2.25');
R(8215, 3.40, 'Walker Meaty Variety 3.40');
R(913, 2.00, 'Cp Lem Cheeseck 2.00');
R(15956, 1.39, 'Cp Frsh Sgl Crm 1.39');
R(4618, 2.65, 'Pringles Original 2 @ 2.65');
R(4288, 1.05, 'Cp Bourbon Creams 1.05');
R(10120, 1.80, 'Kp Rancheros 100G 1.80');
R(9612, 1.20, 'Cp Biogrde Face Wipe 1.20');
R(15953, 2.40, 'Clgte Tpl Actn Mtwsh 2.40');
R(3557, 1.40, 'Cp Garlic Baguette 1.40');
R(920, 1.00, 'Skittles Fruits 136G 1.00');
R(12425, 2.35, 'Reese Pnut Butt Bar 2.35');
R(4531, 1.84, 'Revels Stan Pouch 1.84');
R(10404, 2.15, 'Cp Tiger Bloomer 2.15 (members 1.80 seen 26 Nov)');
R(8031, 1.84, 'Glxy Minstrels Pouch 1.84');
R(3433, 4.72, 'Cp Ht Chrnch Mni Flt 4.72 (members 4.20 seen 26 Nov)');
R(3088, 4.45, 'Cp Stnbk Meat Feast 4.45');
R(18504, 2.35, 'Cbury Pots Joy Car 2.35');
R(5029, 0.95, 'Cp Conchiglie Pasta 0.95');
R(8036, 0.42, 'Hrlcks Instnt Scht 2 @ 0.42');
R(10609, 2.20, 'Cp Salted Btr 250G 2.20');
R(3386, 2.20, 'Cp F/Rnge Eggs 2.20');
R(2963, 3.00, 'Cp Mozz Grtd 250G 3.00');
R(3317, 4.85, 'Cp Chckn Bgr x Crspy 4.85 (members 4.20 seen 26 Nov)');
R(4519, 0.85, 'Kit Kat Chunky Cd 0.85');
R(556, 1.89, 'Cp Cheese Baps 4S 1.89');
R(3385, 8.00, 'Cp B Chi B F 850G 8.00 (members 6.50 seen 26 Nov)');
R(914, 1.60, 'Snickers Duo 1.60');
R(15968, 2.30, 'Cp C Muffins 4Pk 2.30');
R(5263, 2.10, 'Cmft Fbc Cnd Snshn 2.10 (size not printed)');
R(7658, 1.00, 'Cp Fb Still 2Ltr 1.00');
R(3354, 1.60, 'Cp Icebg Ltc Ea. 1.60 (members 1.15 seen 26 Nov)');
R(891, 2.05, 'Olde Oak Hot Dogs 2.05');
R(922, 1.40, 'Cp White Potatoes 1.40');
R(897, 2.55, 'Hz Spghti Blgnse 2.55');
R(5074, 0.70, 'Cp Baked Beans 0.70');
R(5149, 0.70, 'Cp Hon Val Chop Toma 0.70');
R(5217, 1.45, 'Fairy Washin Liq Lem 1.45');
R(2645, 1.90, 'Cp Toffee Sundae 1.90');
R(5156, 4.45, 'Co-op Corned Beef 4.45');
R(3523, 4.30, 'Cp Chk & Bac Psta Bk 4.30');
R(8039, 3.40, 'Cp Unsmoked Bacon Uk 3.40');
R(3448, 3.40, 'Cp Smoked Bacon Uk 3.40');
R(3359, 0.26, 'Cp F/T Bananas 6 @ 0.26 (members 0.23 seen 26 Nov)');
R(9695, 0.95, 'Cp Baking Pots 0.95 (members 0.75 seen 26 Nov)');
addNote(15966, C + ': Cdm Daim # 2.50 (larger bar than this row, price not changed)');
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
const P = { coop:0, morrisons:0, ms:0, waitrose:0, iceland:0, alliance:0 };
function add(name, cat, icon, price, note) {
  const pr = { ...P, coop: price };
  lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:"' + cat + '", icon:"' + icon + '", prices:{' + Object.keys(P).map(s => s + ':' + pr[s]).join(',') + '}, upd:"26 Nov"}, // ' + C + ': ' + note);
  console.log(nid, name, price); nid++;
}
add('Cadbury Caramel Ice Cream (as printed Cdbry Crml Ice Crm, size not confirmed)', '🧊 Frozen', '🍨', 3.15, 'Cdbry Crml Ice Crm 3.15');
add('Deep Fill Pepper Steak Slice (as printed Dp Fl Ppr Stk, brand and size not confirmed)', '🥗 Deli & Salads', '🥧', 1.60, 'Dp Fl Ppr Stk 1.60');
add('Deep Fill Chicken & Mushroom Slice (as printed G Dp Fill Chk/Msh, brand and size not confirmed)', '🥗 Deli & Salads', '🥧', 1.60, 'G Dp Fill Chk/Msh 1.60');
add('Fridge Raiders Roast Chicken Bites (as printed Frdg R Rost Chckn Bt at 2.75, size not confirmed)', '🥩 Meat & Fish', '🍗', 2.75, 'Frdg R Rost Chckn Bt 2.75');
add('Co-op Beef Steak Mince (as printed Cp Beef Steak Mince, size not confirmed)', '🥩 Meat & Fish', '🥩', 6.50, 'Cp Beef Steak Mince 6.50 (members 5.25 seen 26 Nov)');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
