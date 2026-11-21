// Laura (catalogue only, no points): Co-op Millennium Park 21 Nov 10:13 (101 items)
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
const D = '21 Nov';
const CP = 'Co-op branch: Millennium Park (Laura receipt 21 Nov 10:13)';
const P = (id, price, txt) => setPrice(id, 'coop', price, D, CP + ': ' + txt);
const N = (id, txt) => addNote(id, CP + ': ' + txt);
// price matches (re-dated)
P(11528, 1.85, 'Co-op Frsted Flkes 1.85');
P(3966, 1.65, 'kg Ndle Crry 114G 3 @ 1.65');
P(2575, 3.15, 'Bkrs Sml Dg Beef Veg 3.15');
P(3815, 3.89, 'Crispy French Fries 3.89 (Frozen any 3 for £7)');
P(3817, 3.40, 'Mcc Lite Spiced Wedg 3.40 (Frozen any 3 for £7)');
P(7666, 2.10, 'Cadbury Dairy Mk 2.10');
P(2680, 1.50, 'Cp 10 Chse Sngls 1.50');
P(18249, 2.10, 'Robinsons Dc O&P 2.10');
P(5709, 2.10, 'Robs Dc Orange 1L 2.10');
P(8127, 2.10, 'Sure Fw Ap Pure 2.10');
P(11650, 1.30, 'Cp Cotton Fresh Air 1.30');
P(15955, 3.75, 'Yngs Chp Shp Fish 3.75 (Frozen any 3 for £7)');
P(10680, 1.60, 'Lynx Shwr Gel Africa 1.60');
P(12425, 2.35, 'Reese Pnut Butt Bar 2.35');
P(566, 1.65, 'Cp 2In1 Shampoo 2 @ 1.65');
P(9641, 2.65, 'Andrx Sprme Qilt 2.65');
P(3354, 1.60, 'Cp Icebg Ltc Ea. 1.60 // members £1.15 (seen 21 Nov, expiry date unknown)');
P(5406, 3.39, 'Plnty Kitchen Roll 3.39 // members £1.69 (seen 21 Nov, expiry date unknown)');
P(8559, 2.10, 'Mcvities Dark Choc 2.10');
P(10120, 1.80, 'Kp Rancheros 100G 1.80');
P(913, 2.00, 'Cp Lem Cheeseck 2.00');
P(912, 1.05, 'Muller Cr Cnr Bn Ch 4 @ 1.05 (any 4 for £2.10)');
P(16464, 2.65, 'Cp 4 Min Crsp Prkps. 2.65 (as printed; taken as the 4 mini pork pies, price matches)');
P(4684, 2.65, 'Prngl Sour Crem&Onin 2.65 // members £1.32');
P(874, 2.35, 'Vienna Floury Rolls 2.35');
P(7665, 2.10, 'Cadbury Fruit&Nt 2.10 (was 2.30 from July)');
P(8039, 3.40, 'Cp Unsmoked Bacon Uk 3.40');
P(15968, 2.30, 'Cp C Muffins 4Pk 2.30');
P(4225, 1.90, 'Mcvities Club Mint 1.90');
P(9615, 1.60, 'Cp Mince Pies 1.60');
P(556, 1.89, 'Cp Cheese Baps 4S 1.89');
P(9654, 1.75, 'Warb Wht/W.Meal 1.75 // members £1.50');
P(4650, 1.85, 'Co-op Sltd Peanuts 1.85');
P(9790, 1.30, 'Cp Tgr Blmer 400G 1.30');
P(3557, 1.30, 'Cp Garlic Baguette 1.30');
P(8031, 1.84, 'Glxy Minstrels Pouch 1.84');
P(10521, 3.15, 'Richm 8 Thck Sausage 3.15');
P(15954, 2.20, 'Fr Roast Mp 3X22.5G 2.20 (was 1.05 on 7 and 12 Nov)');
P(2641, 1.64, 'Jersey Green Fat R 2 @ 1.64');
P(2904, 3.40, 'Cp Mozz&Ched Mx Grtd 3.40');
P(3736, 4.35, 'C/Bury R/Berry Rolls 4.35');
P(3210, 1.40, 'Jersey Cauliflower E 1.40 (Jersey-grown)');
P(919, 1.30, 'Cp Closed Cups 1.30 // members £1.05 (seen 21 Nov, expiry date unknown)');
P(2822, 3.65, 'Coop Dphn Pts 400G 3.65');
P(10842, 1.60, 'Jsy Tomatoes 6S 1.60 // members £1.40 (seen 21 Nov, expiry date unknown)');
P(3523, 4.30, 'Cp Chk & Bac Psta Bk 4.30');
P(10594, 5.60, 'Brtsh 15% Ft Bf Mnce 5.60');
P(3433, 4.72, 'Cp Ht Chrnch Mni Flt 4.72 // members £4.20 (seen 21 Nov, expiry date unknown)');
P(3124, 1.05, 'Muller Rice Stwb 1.05 (any 4 for £2.10)');
P(3113, 1.05, 'Muller Light Cherry 1.05 (any 4 for £2.10)');
P(3115, 1.05, 'Mul Lght Toffee 1.05 (any 4 for £2.10)');
P(3125, 1.05, 'Muller Rice Apple 1.05 (any 4 for £2.10)');
P(9695, 0.95, 'Cp Baking Pots 0.95 // members £0.75 (seen 21 Nov, expiry date unknown)');
P(3158, 1.10, 'Cp Onions 1.10 // members £0.90 (seen 21 Nov, expiry date unknown)');
P(10609, 2.20, 'Cp Salted Btr 250G 2.20');
P(8035, 2.55, 'Cp Orng J Smth 1Ltr 2.55');
P(922, 1.40, 'Cp White Potatoes 1.40');
P(5149, 0.70, 'Cp Hon Val Chop Toma 0.70');
P(2725, 2.80, 'Cp Naw Breaded Ham 2 @ 2.80 (any 2 for £4.20)');
P(3465, 3.99, 'Cp Garlic Kiev 260G 3.99');
P(3359, 0.26, 'Cp F/T Bananas 10 @ 0.26 // members £0.23 (seen 21 Nov, expiry date unknown)');
P(8041, 3.65, 'Coca-colazerosugar 3.65');
P(12838, 4.95, 'Fnta Or Z 8X330ml 4.95');
P(15958, 1.35, 'Lczde 0 Pnk Lmnde 1.35 (till says zero sugar)');
P(15959, 1.35, 'Lczde Enrgy Orngne 1.35 (was 1.30 on 7 Nov)');
P(7658, 1.00, 'Cp Fb Still 2Ltr 1.00');
// special offers on until 01/12/26: regular price kept
N(4654, 'Mccoys Meaty 6Pk 1.60 (special offer, regular price kept)');
N(4653, 'Mccoys Steak 6Pk 1.60 on the receipt (row says 1.85; probably the same offer as Meaty, not changed)');
N(4561, 'Cad Crunch 4Pk 1.84 (special offer, regular price kept)');
N(11311, 'Wotsit C Cheese 140G 1.94 (special offer, regular price kept)');
N(4531, 'Revels Stan Pouch 1.84 (special offer, regular price kept)');
N(3703, 'Mr K Mini Bttnbrgs 1.58 (special offer, regular price kept)');
N(4557, 'After Eight Mnts 3.15 (special offer, regular price kept)');
N(4223, 'Mcvities Mlk Choc 2.10 on the receipt (row says 2.95; size not printed, not changed)');
const NEWROWS = [
  ["Kelly's Raspberry Ripple Cheesecake Ice Cream (as printed KLY RSPB CHCKE I/CRM, size not confirmed)", '🧊 Frozen', '🍨', 3.15, 'Kly Rspb Chcke I/Crm 3.15'],
  ['Carex Advanced Hand Wash 500ml (as printed CAREX ADVANCED 500MI, variant not confirmed)', '💊 Health & Beauty', '🧴', 1.60, 'Carex Advanced 500Ml 1.60'],
  ['Ariel Original Washing Gel (as printed ARIEL ORG WASHNG GEL, size not confirmed)', '🧺 Laundry', '🧺', 5.25, 'Ariel Org Washng Gel 5.25'],
  ['Fairy Dishwasher Tablets Lemon (as printed FAIRY DW LEMON, pack size not confirmed)', '🧹 Household', '🍋', 5.25, 'Fairy Dw Lemon 5.25'],
  ['Cadbury Pots of Joy Caramel (as printed CBURY POTS JOY CAR, size not confirmed)', '🥛 Dairy & Eggs', '🍮', 2.35, 'Cbury Pots Joy Car 2.35'],
];
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, price, note]) => { lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{coop:' + price + ',morrisons:0,ms:0,waitrose:0,iceland:0,alliance:0}, upd:"21 Nov"}, // ' + CP + ': ' + note); console.log(nid, note); nid++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
