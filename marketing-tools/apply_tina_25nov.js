// Tina S (app 25 Nov 11:23-11:33, 21 dated photos; 14 replace her held 18 Nov photos): M&S School Road 15 receipts, Waitrose St Saviour 5, Alliance Sand Street 1
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
const M = (d) => 'M&S branch: School Road St Clement (Tina S receipt ' + d + ')';
const W = (d) => 'Waitrose branch: St Saviour 332 (Tina S receipt ' + d + ')';
const A = 'Alliance branch: Sand Street (Tina S receipt 8 Nov 12:14)';
// chronological so the newest price wins
rec(9634, 'ms', 0.20, '17 Nov', M('17 Nov 12:47') + ': EA BANANAS 2 @ 0.20');
addNote(9618, W('4 Nov 14:37') + ': FAIRTRADE BANANAS 2.30, 1.80 (7 Nov), 2.79 (9 Nov), 3.53 (20 Nov), weighed');
addNote(15983, W('4 Nov 14:37') + ': WR FR US GAMMON 8.15 and 7.06; 7.12 and 7.01 on 7 Nov (weighed)');
rec(16013, 'waitrose', 0.95, '7 Nov', W('7 Nov 12:05') + ': WR ESS ANTIBAC WUL 0.95');
rec(4003, 'waitrose', 3.97, '7 Nov', W('7 Nov 12:05') + ': BISTO GRAN BEEF 3.97');
rec(15982, 'waitrose', 3.16, '9 Nov', W('9 Nov 12:44') + ': WR 12 PIGS IN BLNKTS 3.16 x2');
rec(4172, 'waitrose', 2.65, '9 Nov', W('9 Nov 12:44') + ': CRISPNDRY RAP OIL 1L 2.65 x2');
rec(18427, 'ms', 0.55, '12 Nov', M('12 Nov 14:57') + ': CARROT BAG 500 0.55');
rec(8171, 'ms', 1.85, '12 Nov', M('12 Nov 14:57') + ': ULTI CRUMPET 1.85');
rec(90, 'ms', 3.10, '16 Nov', M('16 Nov 15:00') + ': WHITE GRAPE 3.10 x2 (2 for 4.73)');
rec(640, 'ms', 3.10, '18 Nov', M('18 Nov 14:57') + ': AUTH YGT 400G 3.10 (also 3 and 9 Nov)');
rec(16108, 'waitrose', 4.60, '20 Nov', W('20 Nov 12:49') + ': WR CUMBERLAND SAUS 4.60');
rec(10665, 'waitrose', 3.75, '20 Nov', W('20 Nov 12:49') + ': B&J MINTER WONDER/L 3.75');
rec(5424, 'waitrose', 3.75, '20 Nov', W('20 Nov 12:49') + ': B & J CHOC/FUDGE I/C 3.75');
rec(8031, 'waitrose', 2.78, '20 Nov', W('20 Nov 12:49') + ': GALAXY MINSTRELS 2.78');
rec(18433, 'ms', 2.60, '20 Nov', M('20 Nov 11:42') + ': 6 YKSHIRE PUD 2.60 x2');
rec(88, 'ms', 3.10, '20 Nov', M('20 Nov 11:42') + ': RASP STD 3.10 x2 (2 for 4.73; std punnet size not printed)');
rec(87, 'ms', 3.40, '21 Nov', M('21 Nov 11:33') + ': STRAWBERRIES 3.40 x2 (also 7 Nov)');
rec(120, 'ms', 1.10, '23 Nov', M('23 Nov 14:54') + ': WHOLE ICEBERG 1.10');
rec(454, 'ms', 1.65, '24 Nov', M('24 Nov 14:54') + ': JE Whole Milk 1.65');
rec(9674, 'ms', 0.30, '24 Nov', M('24 Nov 14:54') + ': BROWN ONION 0.30');
rec(442, 'waitrose', 2.55, '24 Nov', W('24 Nov 18:01') + ': WALKERS READY SALTED 2.55');
rec(7405, 'waitrose', 2.65, '24 Nov', W('24 Nov 18:01') + ': KIPLING ALMND SLICES 2.65 x2');
rec(6237, 'waitrose', 12.02, '24 Nov', W('24 Nov 18:01') + ': FOSTERS FRIDGE PACK 12.02 (also 7 Nov)');
const NC = ', size not confirmed)';
const NEWROWS = [
  ['M&S Sultana & Cherry Cake (as printed SULTANA CHERR' + NC, '🍰 Cakes & Desserts', '🍰', 'ms', 3.45, '3 Nov', M('3 Nov 15:16'), 'SULTANA CHERR 3.45 (code 00262026)'],
  ['M&S Red Strawberry (as printed RED STRWBRY, product not confirmed, bought with WC blocks)', '🧹 Household', '🧽', 'ms', 1.30, '23 Nov', M('23 Nov 14:54'), 'RED STRWBRY 1.30 (code 29482955, also 3, 7, 12 Nov)'],
  ['M&S Clean WC Block (as printed CLN WC BLCK C' + NC, '🧹 Household', '🧽', 'ms', 1.30, '23 Nov', M('23 Nov 14:54'), 'CLN WC BLCK C 1.30 (code 29481750, also 3, 7, 12, 18 Nov)'],
  ['M&S French Fries 1kg (as printed FRNCH FRIES 1' + NC, '🧊 Frozen', '🍟', 'ms', 2.10, '24 Nov', M('24 Nov 14:54'), 'FRNCH FRIES 1 2.10 (code 00585798, also 3 and 10 Nov)'],
  ['M&S Full Baguette (as printed FULL BAGUETTE' + NC, '🍞 Bread & Bakery', '🥖', 'ms', 1.65, '24 Nov', M('24 Nov 14:54'), 'FULL BAGUETTE 1.65 (code 00192781, also 6 Nov)'],
  ['M&S Round Tomatoes (as printed ROUND TOMATOE' + NC, '🥦 Fruit & Veg', '🍅', 'ms', 1.35, '9 Nov', M('9 Nov 14:47'), 'ROUND TOMATOE 1.35 (code 00900140)'],
  ['M&S Salted Caramel (as printed SALT CRML PRT, product' + NC, '🍰 Cakes & Desserts', '🍮', 'ms', 2.80, '12 Nov', M('12 Nov 14:57'), 'SALT CRML PRT 2.80 (code 29390267)'],
  ['M&S Spaghetti Bolognese (as printed OBE SPAG BOL' + NC, '🥗 Deli & Salads', '🍝', 'ms', 8.00, '12 Nov', M('12 Nov 14:57'), 'OBE SPAG BOL 8.00 (code 29531165; a second one reduced 4.80)'],
  ['M&S Malted Milk Biscuits (as printed MALTED MILK' + NC, '🍪 Biscuits', '🍪', 'ms', 0.80, '12 Nov', M('12 Nov 14:57'), 'MALTED MILK 0.80 (code 00706858)'],
  ['M&S Custard Creams (as printed CUSTARD CREAM' + NC, '🍪 Biscuits', '🍪', 'ms', 0.60, '12 Nov', M('12 Nov 14:57'), 'CUSTARD CREAM 0.60 (code 29369843)'],
  ['M&S Savoy Cabbage (as printed SAVOY CABBAGE)', '🥦 Fruit & Veg', '🥬', 'ms', 1.00, '16 Nov', M('16 Nov 15:00'), 'SAVOY CABBAGE 1.00 (code 00266987)'],
  ['M&S British Peas (as printed BRITISH PEAS' + NC, '🥦 Fruit & Veg', '🫛', 'ms', 2.00, '16 Nov', M('16 Nov 15:00'), 'BRITISH PEAS 2.00 (code 00094979)'],
  ['M&S Haddock Chowder (as printed HADDOCK CHOWD' + NC, '🥗 Deli & Salads', '🥣', 'ms', 3.60, '18 Nov', M('18 Nov 14:57'), 'HADDOCK CHOWD 3.60 (code 00894609)'],
  ['M&S Blueberries, large pack (as printed BLUEBERRIES' + NC, '🥦 Fruit & Veg', '🫐', 'ms', 5.25, '18 Nov', M('18 Nov 14:57'), 'BLUEBERRIES 5.25 (code 00925099)'],
  ['M&S All Rounder Potatoes 2kg (as printed ALRND POTS 2K)', '🥦 Fruit & Veg', '🥔', 'ms', 1.75, '20 Nov', M('20 Nov 11:42'), 'ALRND POTS 2K 1.75 (code 00869669)'],
  ['M&S Made Without Yorkshire Puddings (as printed MW YORK PDNGS' + NC, '🌱 Free From', '🥯', 'ms', 3.70, '20 Nov', M('20 Nov 11:42'), 'MW YORK PDNGS 3.70 (code 29372324)'],
  ['M&S Cauliflower Cheese 450g (as printed CALLI CHS 450)', '🥗 Deli & Salads', '🧀', 'ms', 4.65, '21 Nov', M('21 Nov 11:33'), 'CALLI CHS 450 4.65 x2 (code 00858083)'],
  ['M&S Cook Menu Turkey Breast (as printed CKMM TRKY BRE' + NC, '🥩 Meat & Fish', '🦃', 'ms', 11.00, '21 Nov', M('21 Nov 11:33'), 'CKMM TRKY BRE 11.00 (code 00319249)'],
  ['M&S 2 Steak Slices (as printed 2 STEAK SLICE' + NC, '🥗 Deli & Salads', '🥧', 'ms', 3.40, '21 Nov', M('21 Nov 11:33'), '2 STEAK SLICE 3.40 (code 00175388)'],
  ['M&S Super Seeded Loaf 800g (as printed SUPERSEED 800)', '🍞 Bread & Bakery', '🍞', 'ms', 2.10, '21 Nov', M('21 Nov 11:33'), 'SUPERSEED 800 2.10 (code 00642118)'],
  ['M&S 8 Meringues (as printed 8 MERINGUES' + NC, '🍰 Cakes & Desserts', '🍰', 'ms', 2.60, '21 Nov', M('21 Nov 11:33'), '8 MERINGUES 2.60 (code 00393027)'],
  ['M&S Cream 600ml (as printed DEL CRM 600ML, type not confirmed)', '🥛 Dairy & Eggs', '🥛', 'ms', 3.90, '21 Nov', M('21 Nov 11:33'), 'DEL CRM 600ML 3.90 (code 00049191)'],
  ['M&S 4 Large White Rolls (as printed 4 LGE WHITE B' + NC, '🍞 Bread & Bakery', '🥯', 'ms', 1.25, '21 Nov', M('21 Nov 11:33'), '4 LGE WHITE B 1.25 (code 00672214)'],
  ['M&S Cottage Pie (as printed LUE COTTAGE P' + NC, '🥗 Deli & Salads', '🥧', 'ms', 8.00, '24 Nov', M('24 Nov 14:54'), 'LUE COTTAGE P 8.00 (code 00849620)'],
  ['M&S Bunched Spring Onions (as printed BNCH SPRN ONI' + NC, '🥦 Fruit & Veg', '🧅', 'ms', 0.85, '24 Nov', M('24 Nov 14:54'), 'BNCH SPRN ONI 0.85 (code 00252508)'],
  ['Plenty Max Kitchen Roll 2 Rolls (as printed PLENTY MAX 2 ROLL)', '🧹 Household', '🧻', 'waitrose', 3.22, '7 Nov', W('7 Nov 12:05'), 'PLENTY MAX 2 ROLL 3.22'],
  ['Waitrose Essential Fingers (as printed WR ESS FINGERS, product' + NC, '🍪 Biscuits', '🍪', 'waitrose', 0.80, '9 Nov', W('9 Nov 12:44'), 'WR ESS FINGERS 0.80'],
  ['Waitrose Carrot, Broccoli & Sugar Snap (as printed WR CART BROC SSNAP' + NC, '🥦 Fruit & Veg', '🥦', 'waitrose', 3.31, '20 Nov', W('20 Nov 12:49'), 'WR CART BROC SSNAP 3.31'],
  ['Waitrose Chocolate Profiteroles (as printed WR CHOC PROFITEROLES' + NC, '🍰 Cakes & Desserts', '🍮', 'waitrose', 5.11, '20 Nov', W('20 Nov 12:49'), 'WR CHOC PROFITEROLES 5.11'],
  ['Waitrose Mashed Potato (as printed WR MASHED POTATO' + NC, '🥗 Deli & Salads', '🥔', 'waitrose', 2.15, '20 Nov', W('20 Nov 12:49'), 'WR MASHED POTATO 2.15'],
  ['Lindt Dark Supreme (as printed LINDT DARK SUPREME' + NC, '🍫 Confectionery', '🍫', 'waitrose', 3.48, '20 Nov', W('20 Nov 12:49'), 'LINDT DARK SUPREME 3.48'],
  ['Maltesers Pouch (as printed MALTESERS POUCH, variety' + NC, '🍫 Confectionery', '🍫', 'waitrose', 2.78, '20 Nov', W('20 Nov 12:49'), 'MALTESERS POUCH 2.78 x2'],
  ['Paxo Sage & Onion Stuffing (as printed PAXO SAGE & ONION' + NC, '🍝 Pantry', '🥣', 'waitrose', 3.25, '20 Nov', W('20 Nov 12:49'), 'PAXO SAGE & ONION 3.25 x2'],
  ['Waitrose No.1 Brown Butter Mince Pies (as printed NO1 BROWNB MPIES' + NC, '🍰 Cakes & Desserts', '🥧', 'waitrose', 4.64, '24 Nov', W('24 Nov 18:01'), 'NO1 BROWNB MPIES 4.64 (free with voucher)'],
  ['Waitrose Essential Thick Bleach (as printed WR ESS THICK BLEACH' + NC, '🧹 Household', '🧴', 'waitrose', 0.90, '24 Nov', W('24 Nov 18:01'), 'WR ESS THICK BLEACH 0.90'],
  ['Waitrose Kids Apple (as printed WAITROSE KIDSAPPLE, product' + NC, '🥦 Fruit & Veg', '🍎', 'waitrose', 2.75, '24 Nov', W('24 Nov 18:01'), 'WAITROSE KIDSAPPLE 2.75'],
];
const cats = new Set(lines.map(l => (l.match(/cat:"([^"]+)"/) || [])[1]).filter(Boolean));
const badCats = [...new Set(NEWROWS.map(r => r[1]).filter(c => !cats.has(c)))];
if (badCats.length) { console.log('UNKNOWN CATEGORIES', badCats); process.exit(1); }
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, store, price, d, src, note]) => { const p = S.map(s => s + ':' + (s === store ? price : 0)).join(','); lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{' + p + '}, upd:"' + d + '"}, // ' + src + ': ' + note); nid++; });
console.log('new rows', NEWROWS.length, 'last id', nid - 1);
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
