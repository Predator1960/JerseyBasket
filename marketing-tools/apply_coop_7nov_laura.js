// Co-op Millennium Park receipt 6 Nov (competition entry, Jason L).
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
// Laura's Co-op receipts (NOT competition entries): Millennium Park 7 Nov (97 items, 208.48 less 17.76 savings = 190.72),
// Millennium Park 6 Nov (7 items, 12.29), St Brelade 6 Nov (5 items, 8.03 less 0.83 savings = 7.20).
const mk = (src, D) => (id, p, note) => setPrice(id, 'coop', p, D, src + ': ' + note);
const B = mk('Co-op Millennium Park Laura receipt 6 Nov', '6 Nov');
const C = mk('Co-op St Brelade Laura receipt 6 Nov', '6 Nov');
const A = mk('Co-op Millennium Park Laura receipt 7 Nov', '7 Nov');
// --- 6 Nov Millennium Park (7 items)
B(2645, 1.90, 'Cp Tcffee Sundae 1.90');
B(4588, 1.60, 'Mars Duo 69G 1.60');
B(556, 1.89, 'Cp Cheese Baps 4S 1.89');
B(913, 2.00, 'Cp Lem Cheeseck 2.00 (size not confirmed)');
B(925, 1.05, 'Werthers Orig Sf Box 1.05');
B(4581, 1.20, 'Cad Twirl 1.20 (43g bar assumed from price)');
B(4683, 2.65, 'Pringl Tex Bbq 2.65');
// --- 6 Nov St Brelade (5 items)
C(4823, 3.09, 'Cp Rtr Icing 3.09 (was 2.99 on 10 Oct; size assumed unchanged)');
C(2837, 0.99, 'Cp Frsh Rsmry 0.99 x2 (fresh rosemary pot assumed; row name says A Pinch of Rosemary) // members £0.70 (seen 6 Nov, expiry date unknown)');
C(9654, 1.75, 'Warb Wht/W.Meal 1.75 // members £1.50 (seen 6 Nov, expiry date unknown)');
// --- 7 Nov Millennium Park (97 items)
A(3822, 2.80, 'B/E 10 Pot Waffles 2.80');
A(2952, 3.40, 'Peperami Original 3.40 (5 x 20g assumed from price)');
A(2414, 1.70, 'Colgate Toothpaste 1.70 (till text does not name the variant; Triple Action 75ml assumed from price)');
A(925, 1.05, 'Werthers Orig Sf Box 1.05');
A(10680, 1.60, 'Lynx Shwr Gel Africa 1.60');
A(5922, 3.00, 'Head & Shoulders 3.00 (Classic Clean 250ml assumed from price)');
A(5395, 3.70, 'Regina Kit Towel 3.70 // members £1.85 (seen 7 Nov, expiry date unknown)');
A(8025, 3.17, 'Hagndaz Sltd Caramel 3.17');
A(11311, 2.65, 'Wotsit C Cheese 140G 2.65');
A(10120, 1.80, 'Kp Rancheros 100G 1.80');
A(3813, 3.90, 'Mccain Hme Chps Cc 3.90 (crinkle cut)');
A(15853, 2.99, 'Cp Chs Coleslaw 2.99');
A(771, 2.65, 'Andrx Tlt Tissue 2.65');
A(2641, 1.64, 'Jersey Green Fat R 1.64 x2 (green top = 2.5% fat reduced assumed)');
A(4288, 1.05, 'Cp Bourbon Creams 1.05');
A(8245, 2.65, "Orgnl Twdglts 2.65 (Jacob's Twiglets 150g assumed, size not confirmed)");
A(3815, 3.89, 'Crispy French Fries 3.89');
A(2822, 3.65, 'Coop Dphn Pts 400G 3.65');
A(3862, 1.15, 'Amb Light Rice Pot 1.15');
A(5158, 0.65, 'Cp Baked Beans 0.65');
A(3919, 1.85, "Fne Ct Svle Mrmalde 1.85 (till says Fine Cut Seville Marmalade; brand not shown, Duerr's assumed from price)");
A(9654, 1.75, 'Warb Wht/W.Meal 1.75 // members £1.50 (seen 7 Nov, expiry date unknown)');
A(3359, 0.26, 'Cp F/T Bananas 0.26 x7 // members £0.23 (seen 7 Nov, expiry date unknown)');
A(5510, 1.40, 'Cp Ftrade Tea Bags 1.40');
A(1775, 1.50, 'Wlk Swt Chl 150G 1.50 x2 (Walkers Sweet Chilli nuts assumed, row price was 2.50 elsewhere; size/variant not confirmed)');
A(2812, 2.95, 'Cp Ir Easy Peelers 2.95 // members £2.20 (seen 7 Nov, expiry date unknown)');
A(11352, 2.65, 'Pringl Prwn Cocktail 2.65');
A(5149, 0.70, 'Cp Hon Val Chop Toma 0.70 // members £0.50 (seen 7 Nov, expiry date unknown)');
A(897, 2.55, 'Hz Spghti Blgnse 2.55 (one can)');
A(8817, 1.50, 'Pot Ndle Curry 1.50');
A(8065, 1.84, 'Hula Hoops Bbq Beef 1.84 x2');
A(556, 1.89, 'Cp Cheese Baps 4S 1.89');
A(3158, 1.10, 'Cp Onions 1.10 // members £0.90 (seen 7 Nov, expiry date unknown)');
A(588, 2.63, 'Revels Lar Pouch 2.63');
A(3386, 2.20, 'Cp F/Rnge Eggs 2.20');
A(4011, 1.30, "Spaghetti Blgnse 1.30 (Schwartz 40g assumed; Colman's 44g is also 1.30, not confirmed)");
A(15850, 1.05, 'Cdbury Twnpt Btn 1.05 x2');
A(3354, 1.60, 'Cp Icebg Ltc Ea. 1.60 // members £1.15 (seen 7 Nov, expiry date unknown)');
A(912, 1.05, 'Muller Cr Cnr Bn Ch 1.05 x4 (Banana Choc assumed) // Buy Any 4 for £2.10 (deal applied, regular price stored)');
A(915, 1.05, 'Kitkat Chnk Peanut B 1.05 x2');
A(9396, 2.75, 'Ferrero Tblt Milk 2.75 (tablet assumed)');
A(7658, 1.00, 'Cp Fb Still 2Ltr 1.00 (spring vs natural mineral not confirmed)');
A(7667, 3.40, 'Cp Brit Mild Chdr Gr 3.40');
A(10404, 2.15, 'Cp Tiger Bloomer 2.15 (800g assumed) // members £1.80 (seen 7 Nov, expiry date unknown)');
A(1812, 1.85, 'Richm 8 Thck Sausage 1.85 (row price was 3.15; no member discount shown on this receipt, so 1.85 may be a deal)');
A(3557, 1.30, 'Cp Garlic Baguette 1.30');
A(4458, 1.20, 'Nestle York Original 1.20');
A(12183, 1.20, 'Cad Flake 1.20');
A(919, 1.30, 'Cp Closed Cups 1.30 // members £1.15 (seen 7 Nov, expiry date unknown)');
A(9615, 1.60, 'Cp Mince Pies 1.60');
A(596, 1.25, 'Robs Dc Orange 1L 1.25');
A(15857, 1.25, 'Robinsons Dc O&P 1.25');
A(3542, 4.30, 'Cp Spgtti Crbnra 4.30');
A(3433, 4.72, 'Cp Ht Chrnch Mni Flt 4.72 (Hot & Spicy assumed) // members £4.20 (seen 7 Nov, expiry date unknown)');
A(1337, 2.70, 'Mr K Chrry Bkewlls 2.70');
A(3312, 4.89, 'Cp Fried Fillets 4.89 (Southern Fried mini fillets assumed) // members £4.20 (seen 7 Nov, expiry date unknown)');
A(3445, 4.00, 'Cp Fresh Pork Mince 4.00 (500g assumed; older row 918 at 3.99) // members £3.35 (seen 7 Nov, expiry date unknown)');
A(3446, 3.40, 'Cp Unsmoked Bacon Uk 3.40 (Outdoor Bred back bacon assumed) // members £2.45 (seen 7 Nov, expiry date unknown)');
A(2725, 2.80, 'Cp Naw Breaded Ham 2.80 x2 // Buy Any 2 for £4.20 (deal applied, regular price stored)');
A(922, 1.40, 'Cp White Potatoes 1.40');
A(3303, 6.50, 'Cp Beef Steak Mince 6.50 x2 // members £5.25 each (seen 7 Nov, expiry date unknown)');
const NEW = [
 ['Lynx Africa Body Spray (small, size not confirmed)', '💊 Health & Beauty', '🧴', 2.32, 'Lynx B/S Africa 2.32 (size not confirmed; 150ml FIFA Africa is 4.65)'],
 ['Colgate Triple Action Mouthwash (size not confirmed)', '💊 Health & Beauty', '🧴', 2.40, 'Clgte Tpl Actn Mtwsh 2.40'],
 ['Fr Roast Multipack Crisps 3 x 22.5g (brand not confirmed)', '🥨 Snacks & Treats', '🥔', 1.05, 'Fr Roast Mp 3X22.5G 1.05'],
 ["Young's Chip Shop Fish (size not confirmed)", '🧊 Frozen', '🐟', 3.75, 'Yngs Chp Shp Fish 3.75 x2'],
 ['Co-op Fresh Single Cream (size not confirmed)', '🥛 Dairy & Eggs', '🥛', 1.39, 'Cp Frsh Sgl Crm 1.39 (300ml single cream is 1.40)'],
 ['Cathedral City Lighter Cheddar (size not confirmed)', '🥛 Dairy & Eggs', '🧀', 3.65, 'Cath City Lghtr Chd 3.65'],
 ['Lucozade Energy Pink Lemonade (size not confirmed)', '🥤 Drinks', '🥤', 1.30, 'Lczade O Pnk Lmnde 1.30 (variant and size not confirmed)'],
 ['Lucozade Energy Orange (single bottle, size not confirmed)', '🥤 Drinks', '🥤', 1.30, 'Lczde Enrgy Ornge 1.30'],
 ['Sprite No Sugar 8 x 330ml (size not confirmed)', '🥤 Drinks', '🥤', 3.15, 'Sprite No Sugar 3.15 (8 pack assumed from price; other drinks on the till are 8X330ml)'],
 ['Fanta Orange Zero 8 x 330ml', '🥤 Drinks', '🥤', 3.15, 'Fnta Or Z 8X330ml 3.15'],
 ['Coca-Cola Zero Sugar 8 x 330ml (size not confirmed)', '🥤 Drinks', '🥤', 3.15, 'Coca-cola zero sugar 3.15 (8 pack assumed from price; older Multipack row is 3.65)'],
 ["McVitie's Club Orange Bar (single)", '🥨 Snacks & Treats', '🍫', 1.05, 'Mcvities Club Orange 1.05 (single bar assumed)'],
 ['Vienna Large Ham Roll (size not confirmed)', '🍞 Bread & Bakery', '🥖', 2.65, 'Vienna Lg Ham Roll 2.65'],
 ['Cadbury Fruit & Nut Bar (small, size not confirmed)', '🍫 Confectionery', '🍫', 1.60, 'Cadbury Fruit & Nut 1.60'],
 ['Cadbury Dairy Milk Daim Bar (small, size not confirmed)', '🍫 Confectionery', '🍫', 1.60, 'Cdm Daim # 1.60'],
 ["McVitie's Jaffa Cakes Twin Pack (size not confirmed)", '🥨 Snacks & Treats', '🍪', 1.58, 'Mcvitie Jaffa Twin 1.58'],
 ['Co-op 4 Muffins (flavour not confirmed)', '🍞 Bread & Bakery', '🧁', 2.30, 'Cp C Muffins 4Pk 2.30 (C = chocolate or cranberry, not confirmed)'],
 ['Co-op Gammon Joint (size not confirmed)', '🥩 Meat & Fish', '🍖', 7.18, 'Cp Gammon Joint 7.18'],
];
const NEW_C = [['Highland Spring Still Water 750ml Eco Bottle', '🥤 Drinks', '💧', 1.21, 'H Sprng Eco 750Ml 1.21']];
let at = find(15951), id = 15952;
const add = (n, src, D) => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:' + n[3] + ',morrisons:0,ms:0,waitrose:0,iceland:0,alliance:0}, upd:"' + D + '"}, // ' + src + ': ' + n[4]); id++; };
NEW.forEach(n => add(n, 'Co-op Millennium Park Laura receipt 7 Nov', '7 Nov'));
NEW_C.forEach(n => add(n, 'Co-op St Brelade Laura receipt 6 Nov', '6 Nov'));
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
