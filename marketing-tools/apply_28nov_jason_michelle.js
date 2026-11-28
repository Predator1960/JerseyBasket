// 28 Nov (afternoon): Jason L Waitrose St Helier 28 Nov 10:19 (26 products) + Michelle B: M&S School Road 20 Nov (10), M&S King Street 27 Nov (4), M&S School Road 27 Nov 16:14 (7) and 16:15 (7), Co-op Charing Cross 27 Nov (4), Alliance Sand Street 27 Nov (2), Alliance Broad Street 27 Nov (5), Waitrose St Saviour 23 Nov (12)
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
const J = 'Waitrose branch: St Helier 334 (Jason L receipt 28 Nov 10:19)';
const MS20 = 'M&S branch: School Road St Clement (Michelle B receipt 20 Nov 16:11)';
const MK27 = 'M&S branch: King Street St Helier (Michelle B receipt 27 Nov 10:19)';
const MS27a = 'M&S branch: School Road St Clement (Michelle B receipt 27 Nov 16:14)';
const MS27b = 'M&S branch: School Road St Clement (Michelle B receipt 27 Nov 16:15)';
const WM = 'Waitrose branch: St Saviour 332 (Michelle B receipt 23 Nov 12:23)';
const CM = 'Co-op Charing Cross (Michelle B receipt 27 Nov 10:34)';
const AS = 'Alliance Sand Street (Michelle B receipt 27 Nov 10:43)';
const AB = 'Alliance Broad Street (Michelle B receipt 27 Nov 10:03)';
// Jason L, Waitrose St Helier 28 Nov 10:19
const R = (id, p, t) => rec(id, 'waitrose', p, '28 Nov', J + ': ' + t);
R(430, 1.65, 'JD 1% FAT MILK 1.65 (x2)');
R(13228, 6.91, 'SHARPS DOOM BAR 6.91 (pack not printed; 4 x 500ml assumed from Iceland/Alliance prices)');
R(18741, 4.53, 'WR CORNED BEEF 4.53 (x2, CookMeat 2 for 6.50)');
R(7875, 2.50, 'MARMITE CRISPS 2.50 (multipack size not printed)');
R(18316, 1.79, 'NO1 BEEF BEARNAISE 1.79');
R(15978, 1.00, 'WR REGAL WHITE POTS 1.00');
R(7098, 0.93, 'SOFT WHITE TOASTIE 0.93');
R(7720, 1.45, 'SILVER SPOON GRA SGR 1.45');
R(7523, 1.00, 'WR DORG CARROTS 1.00 (Duchy Organic, size not printed)');
R(16090, 3.11, 'WR ESS MAT CHEDDAR 3.11');
R(18652, 1.16, 'COLMANS BREAD MIX 1.16');
R(15454, 2.54, 'WR ESS BAK PAPER 15M 2.54');
R(18388, 1.69, 'WR ESS 10MX300M FOIL 1.69');
R(16097, 2.90, 'WR BLUEBS 2.90');
R(3004, 2.90, 'BERTOLLI OLIVE SPR 2.90 (tub size not printed)');
R(18636, 1.69, 'WR CHOC TWIST 1.69');
R(18362, 2.65, 'GROS PAIN 2.65');
addNote(106, J + ': LSE PARSNIPS 0.170kg @ 2.09/kg = 0.36 (loose, by weight, price not changed)');
addNote(9618, J + ': FAIRTRADE BANANAS 0.275kg @ 1.28/kg = 0.35 (by weight, price not changed)');
// Michelle B
rec(9634, 'ms', 0.20, '20 Nov', MS20 + ': EA BANANAS 0.20 (x2)');
rec(18593, 'ms', 4.95, '20 Nov', MS20 + ': CHS HAM CRIST 4.95');
rec(18577, 'ms', 2.15, '20 Nov', MS20 + ': Jersey Org Mi 2.15');
rec(877, 'ms', 2.95, '20 Nov', MS20 + ': MINI N POTATO 2.95 (code 00147217)');
rec(18687, 'ms', 3.40, '27 Nov', MS27a + ': 2 STEAK SLICE 3.40');
rec(18582, 'ms', 1.75, '27 Nov', MS27b + ': ORG CUCUMBER 1.75 (code 00981620)');
const W = (id, p, t) => rec(id, 'waitrose', p, '23 Nov', WM + ': ' + t);
W(7569, 2.32, 'LACTOFREE S/SKIMMED 2.32 (x4)');
W(18577, 2.15, 'JERSEY DAIRY O MILK 2.15');
W(13732, 2.39, 'WR APPLE JCE GINGER 2.39');
W(14384, 4.64, 'CROSTA M TIRAMISU 4.64');
W(18620, 3.77, 'WR BEEF GRAVY 3.77');
W(18606, 3.75, 'RDANSK BTER COOKIES 3.75');
W(18294, 4.64, 'NO1 SCHERRY MPIES 4.64');
rec(7665, 'coop', 2.10, '27 Nov', CM + ': Cadbury Fruit&Nt 2.10');
addNote(2947, CM + ': Mk Custard Tarts 1.31 (marked-down price, not stored)');
addNote(16114, CM + ': Pring Pigs In Blank 1.80 (below the 2.65 shelf price, likely an offer; price not changed)');
addNote(8569, CM + ': Lees Snowballs 10Pk 1.05 (below the 1.65 shelf price, likely an offer; price not changed)');
rec(9417, 'alliance', 2.25, '27 Nov', AS + ': TERRYS CHOC ORANGE BAL 2.25 (x2)');
rec(8658, 'alliance', 1.90, '27 Nov', AB + ': TAGO 260G CACAO CREA 1.90');
rec(4268, 'alliance', 2.25, '27 Nov', AB + ': DIPPED VIENNESE FING 2.25');
rec(1374, 'alliance', 1.30, '27 Nov', AB + ': BAKERSWORTH 5PK PAND 1.30');
// New rows
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
const P = { coop:0, morrisons:0, ms:0, waitrose:0, iceland:0, alliance:0 };
const NC = ', size not confirmed)';
function add(name, cat, icon, store, price, date, src, note) {
  const pr = { ...P, [store]: price };
  lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:"' + cat + '", icon:"' + icon + '", prices:{' + Object.keys(P).map(s => s + ':' + pr[s]).join(',') + '}, upd:"' + date + '"}, // ' + src + ': ' + note);
  console.log(nid, store, name, price); nid++;
}
add('Listerine Mild Mouthwash (as printed LISTERNE MILD M/WASH' + NC, '💊 Health & Beauty', '🧴', 'waitrose', 2.71, '28 Nov', J, 'LISTERNE MILD M/WASH 2.71');
add('Waitrose Small Whole Chicken (as printed WR SML WHL CHICKEN' + NC, '🥩 Meat & Fish', '🍗', 'waitrose', 6.09, '28 Nov', J, 'WR SML WHL CHICKEN 6.09');
add('Heinz Salad Cream (as printed HEINZ SALAD CREAM' + NC, '🍝 Pantry', '🫙', 'waitrose', 3.97, '28 Nov', J, 'HEINZ SALAD CREAM 3.97');
add('Heinz Tomato Ketchup (as printed HEINZ TOMATO KETCHUP at 3.48' + NC, '🍝 Pantry', '🍅', 'waitrose', 3.48, '28 Nov', J, 'HEINZ TOMATO KETCHUP 3.48');
add('Waitrose Tomatoes (as printed WR TOMATOES' + NC, '🥦 Fruit & Veg', '🍅', 'waitrose', 1.28, '28 Nov', J, 'WR TOMATOES 1.28');
add('Waitrose Pears 3 Pack (as printed WAITROSE PEARS 3S)', '🥦 Fruit & Veg', '🍐', 'waitrose', 1.00, '28 Nov', J, 'WAITROSE PEARS 3S 1.00');
add('Waitrose Essential Large Cloths (as printed WR ESS LGE CLOTHS, pack not confirmed)', '🧹 Household', '🧽', 'waitrose', 2.59, '28 Nov', J, 'WR ESS LGE CLOTHS 2.59');
add('M&S Seasoned Potatoes (as printed SEASONED POTA' + NC, '🥦 Fruit & Veg', '🥔', 'ms', 3.20, '20 Nov', MS20, 'SEASONED POTA 3.20 (code 29511471)');
add('M&S 2 Spiced Buns (as printed 2 SPICED BUNS)', '🍞 Bread & Bakery', '🥯', 'ms', 2.40, '20 Nov', MS20, '2 SPICED BUNS 2.40 (code 00441865)');
add('M&S Flapjack (as printed FLAPJACK MB' + NC, '🥨 Snacks & Treats', '🍪', 'ms', 4.80, '20 Nov', MS20, 'FLAPJACK MB 4.80 (code 00364317)');
add('M&S 6 Chry MC Tck (as printed, product not confirmed)', '🥨 Snacks & Treats', '🧁', 'ms', 2.15, '20 Nov', MS20, '6 Chry MC Tck 2.15 (code 29518555)');
add('M&S Organic Medium Eggs (as printed ORG EGGS MED, pack size not confirmed)', '🥛 Dairy & Eggs', '🥚', 'ms', 3.85, '27 Nov', MS27b, 'ORG EGGS MED 3.85 (code 00222327; 3.20 on Michelle B receipt 20 Nov 16:11)');
add('M&S Baking Powder (as printed MW BAKIN POWD' + NC, '🍝 Pantry', '🧂', 'ms', 2.15, '20 Nov', MS20, 'MW BAKIN POWD 2.15 (code 00077996)');
add('M&S 8 Brioche Rolls (as printed 8 BRIOCHE ROL)', '🍞 Bread & Bakery', '🥐', 'ms', 2.45, '27 Nov', MS27a, '8 BRIOCHE ROL 2.45 (x2, code 00644846)');
add('M&S Chicken Tagliatelle (as printed CHK TAGLIATEL' + NC, '🌡️ Chilled', '🍝', 'ms', 5.20, '27 Nov', MS27a, 'CHK TAGLIATEL 5.20 (3 for 10.50, code 00937641)');
add('M&S Macaroni Cheese (as printed MAC CHEESE SV' + NC, '🌡️ Chilled', '🧀', 'ms', 5.20, '27 Nov', MS27a, 'MAC CHEESE SV 5.20 (3 for 10.50, code 00626866)');
add('M&S Spaghetti Carbonara (as printed SPAG CARBONAR' + NC, '🌡️ Chilled', '🍝', 'ms', 5.20, '27 Nov', MS27a, 'SPAG CARBONAR 5.20 (3 for 10.50, code 00168425)');
add('M&S 100% Squeezed Orange Juice (as printed 100% ORANGE S' + NC, '🥤 Drinks', '🍊', 'ms', 2.70, '27 Nov', MS27a, '100% ORANGE S 2.70 (code 00320870)');
add('M&S Half Baguette (as printed HALF BAGUETTE)', '🍞 Bread & Bakery', '🥖', 'ms', 1.00, '27 Nov', MS27a, 'HALF BAGUETTE 1.00 (code 00192811)');
add('M&S Eat Well Prawn Mayonnaise Sandwich (as printed EW PRAWN MAY, product not confirmed)', '🥗 Deli & Salads', '🥪', 'ms', 4.95, '27 Nov', MK27, 'EW PRAWN MAY 4.95 (code 00185905)');
add('M&S Chocolate Marzipan Balls (as printed CH MARZI BALL, product not confirmed)', '🍫 Confectionery', '🍫', 'ms', 2.45, '27 Nov', MK27, 'CH MARZI BALL 2.45 (x4, code 00087322)');
add('M&S Mint Crumbles (as printed MINT CRUMBLES' + NC, '🍫 Confectionery', '🍬', 'ms', 2.15, '27 Nov', MK27, 'MINT CRUMBLES 2.15 (x2, code 29097784)');
add('M&S Clotted Cream Fudge (as printed CLT CRM FUDGE' + NC, '🍫 Confectionery', '🍬', 'ms', 2.15, '27 Nov', MK27, 'CLT CRM FUDGE 2.15 (code 00992664)');
add('M&S Wholemeal Farmhouse Loaf (as printed WHLML FARMHOU' + NC, '🍞 Bread & Bakery', '🍞', 'ms', 1.85, '27 Nov', MS27b, 'WHLML FARMHOU 1.85 (code 00982184)');
add('M&S Dolce Romaine Lettuce x2 (as printed Dolce Rom X2)', '🥦 Fruit & Veg', '🥬', 'ms', 2.00, '27 Nov', MS27b, 'Dolce Rom X2 2.00 (code 00981187)');
add('M&S Easy Peelers (as printed EASY PEELERS' + NC, '🥦 Fruit & Veg', '🍊', 'ms', 1.85, '27 Nov', MS27b, 'EASY PEELERS 1.85 (code 00925037)');
add('M&S Avocado Twin Pack (as printed AVO TWIN PACK)', '🥦 Fruit & Veg', '🥑', 'ms', 2.45, '27 Nov', MS27b, 'AVO TWIN PACK 2.45 (code 00140478)');
add('M&S Piccolini Tomatoes 220g (as printed PICCOLINI 220)', '🥦 Fruit & Veg', '🍅', 'ms', 3.40, '27 Nov', MS27b, 'PICCOLINI 220 3.40 (code 00169752)');
add('Rio Mare Tuna (as printed RIO MARE TUNA, single pack' + NC, '🍝 Pantry', '🐟', 'waitrose', 3.50, '23 Nov', WM, 'RIO MARE TUNA 3.50 (x2)');
add('Duchy Organic Ground Almonds (as printed WR DORG GRND ALMONDS' + NC, '🍝 Pantry', '🌰', 'waitrose', 5.22, '23 Nov', WM, 'WR DORG GRND ALMONDS 5.22');
add('Waitrose Chicken Gravy (as printed WR CHICKEN GRAVY' + NC, '🍝 Pantry', '🍗', 'waitrose', 3.77, '23 Nov', WM, 'WR CHICKEN GRAVY 3.77 (x2)');
add('Yeo Valley Greek Style Natural Yogurt (as printed YEO YOG GREEK NATURA at 2.35' + NC, '🥛 Dairy & Eggs', '🥛', 'waitrose', 2.35, '23 Nov', WM, 'YEO YOG GREEK NATURA 2.35');
add('Waitrose No.1 Iced Fruit Cake (as printed NO1 ICED FRUIT CAKE' + NC, '🍰 Cakes & Desserts', '🎂', 'waitrose', 4.24, '23 Nov', WM, 'NO1 ICED FRUIT CAKE 4.24');
add('Baileys Creams Milk Chocolate (as printed BAILEYS CREAMS MILK' + NC, '🍫 Confectionery', '🍫', 'alliance', 1.50, '27 Nov', AS, 'BAILEYS CREAMS MILK 1.50');
add("Mrs Bector's Mini Creams (as printed MRS BECTOR MINI CREA" + NC, '🍪 Biscuits', '🍪', 'alliance', 1.30, '27 Nov', AB, 'MRS BECTOR MINI CREA 1.30');
add('La Boulangère 8 Petits (as printed LA BOULANGERIE 8 PETIT, product not confirmed)', '🍞 Bread & Bakery', '🥐', 'alliance', 2.30, '27 Nov', AB, 'LA BOULANGERIE 8 PETIT 2.30');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
