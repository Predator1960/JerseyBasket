// Sandra B (emailed 23 Nov): Waitrose Red Houses 22 Nov 12:19 (39 lines; 33 count: crackers, Sellotape, rehydration sachets, L'Oreal cream, Covonia skipped, chestnuts x2 counted once),
// M&S St Peter 21 Nov 15:57 (5 lines), Co-op St Peter's Village 19 Nov 09:05 (12 lines; 9 count: Arnicare, flowers, Zooki skipped)
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
const W = 'Waitrose branch: Red Houses 336 (Sandra B receipt 22 Nov 12:19)';
const M = 'M&S branch: St Peter (Sandra B receipt 21 Nov 15:57)';
const C = 'Co-op branch: St Peter\'s Village (Sandra B receipt 19 Nov 09:05)';
// Waitrose
setPrice(16064, 'waitrose', 2.35, '22 Nov', W + ': MGOURMET CHESTNUTS 2.35 (x2)');
setPrice(17791, 'waitrose', 4.35, '22 Nov', W + ': WR CAR & CHO PANETON 4.35 (free with voucher)');
setPrice(14690, 'waitrose', 2.76, '22 Nov', W + ': RYVITA SOUR CREAM 2.76');
setPrice(16058, 'waitrose', 3.77, '22 Nov', W + ': ACTIVIA BLUEBERRY 3.77');
setPrice(2656, 'waitrose', 4.01, '22 Nov', W + ': ACTIVIA FIBRE WALNUT 4.01');
setPrice(15048, 'waitrose', 1.57, '22 Nov', W + ': WR CI BREADCRUMBS 1.57');
setPrice(17903, 'waitrose', 4.14, '22 Nov', W + ': WR NC1 MARG PIZZA 4.14');
setPrice(13653, 'waitrose', 5.57, '22 Nov', W + ': BENECOL STRAWB YOG 5.57');
setPrice(7582, 'waitrose', 1.57, '22 Nov', W + ': WR LSE CAULIFLOWER 1.57');
setPrice(7414, 'waitrose', 2.09, '22 Nov', W + ': WR RHU CUSTD PASTRY 2.09 (was 1.80)');
setPrice(14999, 'waitrose', 2.48, '22 Nov', W + ': WR SESAME SEEDS 2.48');
setPrice(16006, 'waitrose', 4.64, '22 Nov', W + ': WR BLUEBERRIES 300G 4.64');
addNote(18379, W + ': HEINZ BEANZ NAS 1.16 at the till (offer; regular 1.63 kept)');
setPrice(17980, 'waitrose', 1.05, '22 Nov', W + ': ESS PARSNIPS 500G 1.05');
setPrice(16005, 'waitrose', 1.05, '22 Nov', W + ': WR CI SAGE 1.05');
setPrice(16104, 'waitrose', 1.16, '22 Nov', W + ': WR LSE CUCUMBER 1.16');
setPrice(16055, 'waitrose', 1.51, '22 Nov', W + ': HOVIS 7SEEDS ORGNAL 1.51');
setPrice(14543, 'waitrose', 1.76, '22 Nov', W + ': WR UNWAXED LEMONS 1.76');
addNote(7551, W + ': WR PRIPE AVO LRG 1.00 at the till (offer; regular 1.28 kept)');
// M&S
setPrice(423, 'ms', 0.87, '21 Nov', M + ': CI 500ML 1% F 0.87');
setPrice(18323, 'ms', 2.70, '21 Nov', M + ': LF COTT CHS P 2.70');
// Co-op
setPrice(4626, 'coop', 2.39, '19 Nov', C + ': Hula Hoops Original 2.39');
addNote(4553, C + ': Mlky Way Magic Stars 1.84 (special offer)');
addNote(12367, C + ': Terrys Choc Tablet 1.05 (special offer)');
setPrice(12135, 'coop', 1.95, '19 Nov', C + ': Cp Sprouts 1.95 (reduced to clear on the day)');
setPrice(2765, 'coop', 2.65, '19 Nov', C + ': Cp Organi Mushroom 2.65 (reduced to clear on the day)');
setPrice(3177, 'coop', 0.55, '19 Nov', C + ': Cp Loose B Potato 0.55 (members 0.35)');
const NEWROWS = [
  ['Alexandre Brut Sparkling Wine (as printed ALEXANDRE BRUT, size not confirmed)', '🍷 Wine & Beer', '🍾', 'waitrose', 14.41, W, 'ALEXANDRE BRUT 14.41'],
  ['Benecol Blueberry Yogurt Drink (as printed BENECOL BLUEBERRY, size not confirmed)', '🥤 Drinks', '🥤', 'waitrose', 5.51, W, 'BENECOL BLUEBERRY 5.51 (Benecol 2 for 7.85)'],
  ['Benecol Mango & Passion Fruit Yogurt Drink (as printed BENECOL MANGO-PASSIO, size not confirmed)', '🥤 Drinks', '🥤', 'waitrose', 5.51, W, 'BENECOL MANGO-PASSIO 5.51 (Benecol 2 for 7.85)'],
  ['Waitrose Essential Fat Free Cottage Cheese (as printed WR ESS FF COTTG CHSE, size not confirmed)', '🥛 Dairy & Eggs', '🧀', 'waitrose', 2.02, W, 'WR ESS FF COTTG CHSE 2.02'],
  ['MOJU Ginger Dosing Bottle 12 Shots (as printed MOJU DOSER GING 12X, size not confirmed)', '🥤 Drinks', '🥤', 'waitrose', 8.35, W, 'MOJU DOSER GING 12X 8.35'],
  ['Waitrose Multigrain Rice Cakes (as printed WR M/GRAIN RICECAKE, size not confirmed)', '🍝 Pantry', '🍘', 'waitrose', 2.02, W, 'WR M/GRAIN RICECAKE 2.02'],
  ['Ariel Bio Pods 50 Washes (as printed ARIEL BIO PODS 50W)', '🧺 Laundry', '🧺', 'waitrose', 10.91, W, 'ARIEL BIO PODS 50W 10.91'],
  ['Waitrose Essential ASC Cooked King Prawns (as printed ESS ASC CKD KPRAWNS, size not confirmed)', '🥩 Meat & Fish', '🍤', 'waitrose', 3.80, W, 'ESS ASC CKD KPRAWNS 3.80'],
  ['Lindt Lindor Dark Chocolate Truffles (as printed LINDT LINDOR DARK, size not confirmed)', '🍫 Confectionery', '🍫', 'waitrose', 8.95, W, 'LINDT LINDOR DARK 8.95'],
  ['Waitrose Cooks\' Ingredients Cranberries (as printed WR CI CRANBERRIES, size not confirmed)', '🥦 Fruit & Veg', '🫐', 'waitrose', 2.67, W, 'WR CI CRANBERRIES 2.67'],
  ['Channel Island Cherry Vine Tomatoes, larger pack (as printed CI CHERRY VINE TOMS, size not confirmed)', '🥦 Fruit & Veg', '🍅', 'waitrose', 3.25, W, 'CI CHERRY VINE TOMS 3.25'],
  ['Piccolo Organic Blueberry & Banana Yogurt (as printed PICCLO YOG BLUE BAN, size not confirmed)', '🍼 Baby & Child', '🍼', 'waitrose', 1.99, W, 'PICCLO YOG BLUE BAN 1.99'],
  ['Organix Animal Biscuits (as printed ORGANIX ANIMAL BISCU, size not confirmed)', '🍼 Baby & Child', '🍼', 'waitrose', 2.65, W, 'ORGANIX ANIMAL BISCU 2.65'],
  ['M&S Chicken Tikka Masala & Rice (as printed CHK TIKKA RIC, size not confirmed)', '🥗 Deli & Salads', '🍛', 'ms', 5.40, M, 'CHK TIKKA RIC 5.40'],
];
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, store, price, src, note]) => { const p = S.map(s => s + ':' + (s === store ? price : 0)).join(','); const d = store === 'ms' ? '21 Nov' : '22 Nov'; lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{' + p + '}, upd:"' + d + '"}, // ' + src + ': ' + note); console.log(nid, note); nid++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
