// Waitrose Red Houses receipt 8 Nov 11:03 (Sandra B, competition entry).
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
// 27 items, balance 96.07 (sum checks). Not stored: 3 reduced-item lines (N1 mariniere, 2x No.1 Lincoln sausages) and the weighed cooking apples.
const D = '8 Nov', WR = 'Waitrose branch: Red Houses (receipt 8 Nov 11:03, Sandra B)';
setPrice(7634, 'waitrose', 1.63, D, WR + ': ESS LEMONS 5S 1.63 (row was 1.60)');
setPrice(7565, 'waitrose', 0.93, D, WR + ': ESS GREEN CELERY 0.93 (row was 0.90)');
setPrice(7996, 'waitrose', 5.07, D, WR + ': WR RS MIXED NUTS CAN 5.07 (row was 5.75; 300g assumed)');
setPrice(13653, 'waitrose', 5.57, D, WR + ': BENECOL STRAWB YOG 5.57');
setPrice(5731, 'waitrose', 4.50, D, WR + ': FT LIGHT TONIC WATER 4.50 (8 x 150ml assumed)');
addNote(16031, WR + ': WR CI GARLIC 0.58 (unchanged)');
const NEW = [
 ['Carr\'s Seasonal Selection Biscuits (size not confirmed)', '🍿 Snacks', '🍪', 4.77, 'CARRS SSNAL SLCTION 4.77'],
 ['Cadbury Dairy Milk Advent Calendar 24 Pack (size not confirmed)', '🍫 Confectionery', '🎄', 2.98, 'CDM ADV CLDR 24P 2.98'],
 ['Lindt Santa Countdown Calendar (size not confirmed)', '🍫 Confectionery', '🎅', 6.95, 'LINDT SANTA COUNTDOW 6.95'],
 ['Toblerone Advent Calendar (size not confirmed)', '🍫 Confectionery', '🎄', 9.94, 'TOBLERONE ADVENT 9.94'],
 ['Cadbury Advent Calendar (size not confirmed)', '🍫 Confectionery', '🎄', 7.95, 'CAD ADVENT CAL 7.95'],
 ['Hovis 7 Seeds Original Bread (size not confirmed)', '🍞 Bread & Bakery', '🍞', 1.51, 'HOVIS 7SEEDS ORGNAL 1.51'],
 ['Cadbury Dairy Milk Coins 70g', '🍫 Confectionery', '🪙', 1.64, 'CDM COINS 70G 1.64'],
 ['Family Favourites Cheese Selection (size not confirmed)', '🥛 Dairy & Eggs', '🧀', 3.40, 'FMLY FAV CHEESE SLCT 3.40 x2'],
 ['Activia Blueberry Yogurt (size not confirmed)', '🥛 Dairy & Eggs', '🥛', 3.77, 'ACTIVIA BLUEBERRY 3.77'],
 ['Waitrose Onions 4 Pack', '🥦 Fruit & Veg', '🧅', 1.51, 'WR ONIONS 4S 1.51 x2'],
 ['Waitrose Cherry Lattice (size not confirmed)', '🍞 Bread & Bakery', '🥧', 1.98, 'WR CHERRY LATTICE 1.98'],
 ['Kallo Protein Cakes (size not confirmed)', '🍿 Snacks', '🍘', 2.88, 'KALLO PROTEIN CAKES 2.88 (the 100g lentil row 7858 is 2.40, may be the same product)'],
 ['Waitrose Walnuts (size not confirmed)', '🍝 Pantry', '🥜', 3.31, 'WR WALNUTS 3.31'],
 ['Twinings Superblends Metabolism Tea (size not confirmed)', '🥤 Drinks', '🍵', 3.20, 'TWNGS SBLEND MTABLSM 3.20'],
 ['Merchant Gourmet Chestnuts (size not confirmed)', '🍝 Pantry', '🌰', 2.35, 'MGOURMET CHESTNUTS 2.35'],
];
let at = find(16049), id = 16050;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + n[3] + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
