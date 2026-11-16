// Sandra B (submitted 16 Nov, competition entry): Waitrose Red Houses 336 receipt 14 Nov 13:28 (76 lines, 217.47 less offers 24.26 = 193.21; two photos of one long receipt, prices read one row off in the sideways photo and verified against the offer lines) and Co-op St Peter's Village 15 Nov 11:22 (19 items = 16 grocery lines + 1 Christmas Lottery 2.00 not counted; total sold 35.86, member savings 2.08, paid 33.78).
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
const WD = '14 Nov', CD = '15 Nov';
const WB = 'Waitrose branch: Red Houses 336 (Sandra B receipt 14 Nov 13:28)';
const CB = "Co-op branch: St Peter's Village (Sandra B receipt 15 Nov 11:22)";
// ---- Waitrose: existing rows
const WSET = [
  [2696, 1.22, 'TC STRAWB SUCKIES 2 x 1.22 (TC Multi 3 for 2.25)'],
  [15036, 1.27, 'WR ESS BASIL PESTO 1.27'],
  [2582, 3.51, 'HELLMANNS LIGHT MAYO 2 x 3.51 (was 2.60)'],
  [14686, 2.60, 'KALLO ONION CHUTNEY 2.60 (veggie cakes row assumed)'],
  [14705, 2.05, 'MARMITE RICE CAKES 2.05 (110g assumed)'],
  [14825, 0.81, 'WR ESS PENNE 0.81'],
  [5860, 3.92, 'KIDDYL VEGGIE STRAWS 3.92 (4 x 12g assumed)'],
  [7113, 2.73, 'JASONS SDGH GREAT WH 2.73 (was 2.35)'],
  [7948, 2.90, 'WR CHIA SEED 2.90 (was 2.50)'],
  [5232, 4.47, 'DR. BECKMANN CARPET 4.47 (650ml assumed)'],
  [810, 1.28, 'HOVIS WMEAL 400G 1.28'],
  [11838, 2.98, 'FAIRY WUL EUCALYPTUS 2.98 (660ml assumed)'],
  [405, 2.44, "RIBENA B'CURRANT NAS 2.44 (2 for 3 offer with Summerfruits)"],
  [15859, 2.44, 'RIBENA SUMMERFRUITS 2.44'],
  [18322, 4.05, 'JW TUNA SPW 3PCK 4.05'],
  [3134, 4.99, 'FAGE TOTAL 5% YOG 4.99 (450g assumed)'],
  [14367, 2.56, 'WR ESS SPIN TRTLL 2 x 2.56'],
  [14513, 4.53, 'RAMONAS HOUMOUS ORIG 4.53 (500g assumed)'],
  [384, 2.90, 'WR GRN GRAPES 500G 2.90 (FRT/VEG 2 for 4.50 with the red grapes)'],
  [14557, 2.90, 'WR RED GRAPES 500G 2.90'],
  [16104, 1.16, 'WR LSE CUCUMBER 1.16'],
  [8118, 1.10, 'WR ESS GARLIC BAG 1.10'],
  [14269, 7.77, 'LIGHT DUSTED PLAICE 7.77 (Meat/Fish 3 for 12 with cod fingers and kyivs)'],
  [16109, 6.96, 'WR GARLIC KYIVS 6.96'],
  [13419, 2.76, 'WR PARM REGG GRATED 2.76 (80g assumed)'],
  [15173, 1.40, 'WR ESS GARDEN PEAS 1.40 (725g frozen assumed)'],
  [7538, 1.74, 'WR WILD ROCKET 1.74'],
];
WSET.forEach(a => setPrice(a[0], 'waitrose', a[1], WD, WB + ': ' + a[2]));
// ---- Co-op: existing rows
const CSET = [
  [5804, 2.75, 'Organix Carrot Stick 2.75'],
  [16125, 0.87, 'Jersey Dairy 1% Fa 0.87'],
  [2699, 2.40, 'Yeo Vly Grk Ntrl Yg 2.40'],
  [2872, 3.25, 'Cp Blackberries 3.25'],
  [3386, 2.20, 'Cp F/Rnge Eggs 2.20'],
  [3172, 2.60, 'Cp Unwaxed Lemon 2.60 (members 1.95)'],
  [5808, 1.45, 'Heinz 6 M Strw Ban 1.45'],
  [5855, 1.45, 'Heinz S1 Pouch Peach 1.45'],
  [5854, 1.45, 'Heinz 6+ App Pch Ban 1.45'],
  [3177, 0.55, 'Cp Loose B Potato 0.55 (members 0.35)'],
  [3359, 0.26, 'Cp F/T Bananas 3 x 0.26 (members 0.23)'],
  [10031, 0.62, 'Biscolata Break Ca 0.62'],
  [10355, 4.49, 'Cp Raspberries 4.49 (members 3.90)'],
];
CSET.forEach(a => setPrice(a[0], 'coop', a[1], CD, CB + ': ' + a[2]));
addNote(3172, 'members 1.95 (15 Nov 2026)');
addNote(10355, 'members 3.90 (15 Nov 2026)');
addNote(3177, 'members 0.35 (15 Nov 2026)');
// ---- new rows [name, cat, icon, store, price, comment]
const PS = '🍝 Pantry', DR = '🥤 Drinks', SN = '🥨 Snacks & Treats', BB = '🍞 Bread & Bakery', DL = '🥗 Deli & Salads', FZ = '🧊 Frozen', HH = '🧹 Household', DY = '🥛 Dairy & Eggs', FV = '🥦 Fruit & Veg', MF = '🥩 Meat & Fish', BC = '🍼 Baby & Child';
const NEW = [
  ['Waitrose Apples 3S (as printed WR APPLES 3S)', FV, '🍎', 'waitrose', 1.00, WB + ': WR APPLES 3S 1.00'],
  ['Jersey Dairy UHT 1% Fat Milk (as printed, size not confirmed)', DY, '🥛', 'waitrose', 1.90, WB + ': JDAIRY UHT 1% MILK 2 x 1.90'],
  ['Alpro Almond Roasted Drink (as printed, size not confirmed)', DR, '🥛', 'waitrose', 2.88, WB + ': ALPRO ALMOND ROASTED 2.88'],
  ['Kallo Organic Chocolate Corn Cakes (as printed OCHOC CORNCAKE, size not confirmed)', SN, '🍘', 'waitrose', 3.32, WB + ': KALLO OCHOC CORNCAKE 3.32'],
  ['Oatly Oat Barista (smaller pack, size not confirmed)', DR, '🥛', 'waitrose', 1.76, WB + ': OATLY OAT BARISTA 2 x 1.76 (1L row has 2.65)'],
  ['Quaker Rolled Oats (as printed, size not confirmed)', PS, '🥣', 'waitrose', 4.14, WB + ': QUAKER ROLLED OATS 2 x 4.14 (QKR SCTT 2 for 4.50)'],
  ['Vanish Gold Oxi Action Powder 1.35kg (as printed VANISH G W PW 1.35KG)', HH, '🧺', 'waitrose', 10.42, WB + ': VANISH G W PW 1.35KG 10.42'],
  ['Fairy Fabric Conditioner 48 Wash (as printed FAIRY FAB CON 48W)', HH, '🧺', 'waitrose', 3.47, WB + ': FAIRY FAB CON 48W 3.47'],
  ['Heinz Beanz No Added Sugar (as printed NAS, size not confirmed)', PS, '🫘', 'waitrose', 1.63, WB + ': HEINZ BEANZ NAS 2 x 1.63 (Heinz Beans 2 for 2)'],
  ['Heinz Tomato Cheese Pasta (as printed HNZ TOM CHEESE PASTA, size not confirmed)', PS, '🍝', 'waitrose', 2.05, WB + ': HNZ TOM CHEESE PASTA 2.05'],
  ['Waitrose Essential Pitted Olives (as printed, size not confirmed)', PS, '🫒', 'waitrose', 1.63, WB + ': WR ESS PITTED OLIVES 1.63'],
  ['Heinz BBQ Baked Beans (as printed, size not confirmed)', PS, '🫘', 'waitrose', 1.63, WB + ': HEINZ BBQ BAKED BEAN 2 x 1.63 (Heinz Beans 2 for 2)'],
  ['Waitrose Sweet Crunch Stir Fry (as printed WR SWT CRNCH SFRY, size not confirmed)', FV, '🥬', 'waitrose', 2.61, WB + ': WR SWT CRNCH SFRY 2.61 (£8 Stir Fry Dine In)'],
  ['Waitrose King Prawn Stir Fry (as printed WR K PRAWN STIR FRY, size not confirmed)', MF, '🍤', 'waitrose', 4.89, WB + ': WR K PRAWN STIR FRY 4.89 (£8 Stir Fry Dine In)'],
  ['Waitrose Singapore Noodles (size not confirmed)', PS, '🍜', 'waitrose', 1.80, WB + ': WR SINGAPORE NOODLES 1.80 (£8 Stir Fry Dine In)'],
  ['Waitrose Essential Sweetcorn (as printed, size not confirmed)', PS, '🌽', 'waitrose', 0.82, WB + ': WR ESS SWEETCORN 0.82'],
  ['Grenade Oreo Milk (as printed, size not confirmed)', DR, '🥛', 'waitrose', 4.10, WB + ': GRENADE OREO MILK 4.10'],
  ['Waitrose Essential Foil 10m x 300mm (as printed WR ESS 10MX300M FOIL)', HH, '🧻', 'waitrose', 1.69, WB + ': WR ESS 10MX300M FOIL 1.69'],
  ['Kallo Low Salt Vegetable Stock Cubes (as printed KALLO LW SLT VG STICK, size not confirmed)', PS, '🧂', 'waitrose', 1.74, WB + ': KALLO LW SLT VG STICK 1.74'],
  ['Method Antibac All Purpose Cleaner (as printed METHOD AB AP CLEANER, size not confirmed)', HH, '🧴', 'waitrose', 3.98, WB + ': METHOD AB AP CLEANER 3.98'],
  ['British Creme Fraiche (as printed BRIT CREME FRAICHE, size not confirmed)', DY, '🥛', 'waitrose', 1.16, WB + ': BRIT CREME FRAICHE 1.16'],
  ['AT Cottage Cheese Low Fat (as printed AT COTTAGE CHEESE LF, size not confirmed)', DY, '🧀', 'waitrose', 2.25, WB + ': AT COTTAGE CHEESE LF 2.25'],
  ['Drink Me Chai Latte (as printed, size not confirmed)', DR, '☕', 'waitrose', 5.05, WB + ': DRINK ME CHAI LATTE 5.05'],
  ['Waitrose Essential Cherry Tomatoes 400g', FV, '🍅', 'waitrose', 1.74, WB + ': ESS CHERRY TOMS 400G 1.74'],
  ['The Collective Raspberry Suckies (as printed TCOLLECTIVE RASP, size not confirmed)', DY, '🍓', 'waitrose', 1.22, WB + ': TCOLLECTIVE RASP 1.22 (TC Multi 3 for 2.25)'],
  ['Cheestrings Original (size not confirmed)', DY, '🧀', 'waitrose', 1.45, WB + ': CHEESTRINGS ORIGINAL 1.45'],
  ['Waitrose Essential Dual Scourer (as printed, size not confirmed)', HH, '🧽', 'waitrose', 0.90, WB + ': WR ESS DUAL SCOURER 0.90'],
  ['Waitrose Perfectly Ripe Avocados (as printed WR PR AVOCADOS, size not confirmed)', FV, '🥑', 'waitrose', 2.32, WB + ': WR PR AVOCADOS 2.32'],
  ['Waitrose Nectarines (as printed, size not confirmed)', FV, '🍑', 'waitrose', 3.57, WB + ': WR NECTARINES 3.57'],
  ['Waitrose Chunky Cod Fingers (as printed, size not confirmed)', FZ, '🐟', 'waitrose', 7.77, WB + ': CHUNKY COD FINGERS 7.77 (Meat/Fish 3 for 12)'],
  ['Waitrose Essential Easy Cook Grain Rice (as printed EC GRAIN RICE, size not confirmed)', PS, '🍚', 'waitrose', 0.93, WB + ': WR ESS EC GRAIN RICE 0.93'],
  ['Alpro Greek Style Plain Yoghurt Alternative (as printed ALPRO GS PLN YOG ALT, size not confirmed)', DY, '🥛', 'waitrose', 2.50, WB + ': ALPRO GS PLN YOG ALT 2.50'],
  ['Waitrose Baby Button Mushrooms 200g (as printed BBUT MROOMS 200G)', FV, '🍄', 'waitrose', 1.51, WB + ': WR BBUT MROOMS 200G 1.51'],
  ['Tilda Kids Cheese & Tomato Rice (as printed TILDA KIDS CH/TOM RC, size not confirmed)', PS, '🍚', 'waitrose', 1.51, WB + ': TILDA KIDS CH/TOM RC 1.51'],
  ['Waitrose Teriyaki Sauce (as printed WR TERIYAKI SCE, size not confirmed)', PS, '🥫', 'waitrose', 1.57, WB + ': WR TERIYAKI SCE 1.57'],
  ['Waitrose Free Range Large Eggs (as printed WR F/R EGGS LARGE, pack size not confirmed)', DY, '🥚', 'waitrose', 2.90, WB + ': WR F/R EGGS LARGE 2.90'],
  ['Schweppes Elderflower (as printed SCHWEPPES ELDERFLOWER, size not confirmed)', DR, '🥤', 'waitrose', 1.94, WB + ': SCHWEPPES ELDERFLOWER 1.94'],
  ['Waitrose Blueberries 500g', FV, '🫐', 'waitrose', 6.38, WB + ': WR BLUEBERRIES 500G 6.38'],
  ['Waitrose Raspberries (as printed, size not confirmed)', FV, '🍓', 'waitrose', 4.35, WB + ': WR RASPBERRIES 4.35'],
  ['Waitrose Whole Chicken Stuffed (as printed WR WHOLE CHICK STUFF, size not confirmed)', MF, '🍗', 'waitrose', 9.86, WB + ': WR WHOLE CHICK STUFF 9.86'],
  ['Vienna Cherry Danish (as printed, size not confirmed)', BB, '🥐', 'coop', 1.95, CB + ': Vienna Cherry Danish 1.95'],
  ['Cathedral City Mature Cheddar (as printed Cath City Mat Ched, size not confirmed)', DY, '🧀', 'coop', 3.65, CB + ': Cath City Mat Ched 3.65'],
  ['Co-op Strawberries Each (as printed Cp Strwbrry Each, size not confirmed)', FV, '🍓', 'coop', 3.40, CB + ': Cp Strwbrry Each 3.40 (members 2.85)'],
];
let at = find(18370), id = 18371;
NEW.forEach(n => {
  const p = {coop:0, morrisons:0, ms:0, waitrose:0, iceland:0, alliance:0}; p[n[3]] = n[4];
  const d = n[3] === 'coop' ? CD : WD;
  lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{' + S.map(s => s + ':' + p[s]).join(',') + '}, upd:"' + d + '"}, // ' + n[5]);
  id++;
});
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id, 'new rows', NEW.length);
