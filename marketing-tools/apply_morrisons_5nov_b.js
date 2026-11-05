// Morrisons Daily St Ouen receipt 5 Nov, second shopper (competition entry, Yasmin T).
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

const MR = 'Morrisons Daily St Ouen shopper receipt 5 Nov (staff-discount transaction, shelf prices printed before discount)', D = '5 Nov';
setPrice(3506, 'morrisons', 3.63, D, MR + ': BONNE MAMAN CREME CARAMEL 3.63');
setPrice(87, 'morrisons', 2.82, D, MR + ': MORRISONS STRAWBERRIES 2.82 (was 2.70; 400g inferred, size not printed)');
setPrice(88, 'morrisons', 3.00, D, MR + ': MORRISONS RASPBERRIES 3.00 (was 2.40; 150g inferred, size not printed)');
setPrice(113, 'morrisons', 1.45, D, MR + ': WHOLE CUCUMBER 1.45 (was 1.20)');
setPrice(14432, 'morrisons', 1.59, D, MR + ': PAW PATROL STRAWBERRY FROMAGE 1.59 (6 x 45g inferred)');
const k = find(15909);
const row = (id, name, cat, icon, price, rl, note) => '  {id:' + id + ', name:"' + name + '", cat:"' + cat + '", icon:"' + icon + '", prices:{coop:0,morrisons:' + price + ',ms:0,waitrose:0,iceland:0,alliance:0}, upd:"' + D + '"}, // ' + MR + ': ' + rl + ' ' + price.toFixed(2) + ' (' + note + ')';
lines.splice(k + 1, 0,
  row(15910, 'Birds Eye Omega 3 Fish Fingers', '🧊 Frozen', '🐟', 3.68, 'BIRDS EYE OMEGA 3 FISH FINGERS', '3.68 each, bought 2; size not confirmed; FZ Ready Meal Deal applied'),
  row(15911, 'Chicago Town Fully Loaded Deep Dish Pizza', '🧊 Frozen', '🍕', 3.35, 'CHICAGO TOWN FULLY LOADED DEEP', 'variant and size not confirmed; FZ Ready Meal Deal applied'),
  row(15912, 'Morrisons The Best Thick 6 Cumberland Sausages 400g', '🥩 Meat & Fish', '🌭', 3.80, 'MORRISONS BEST SAUSAGES CUMBER', '3.80 each, bought 2; 400g inferred from the UK pack; M Sausage Deal applied'),
  row(15913, 'Morrisons Tropical Kids Smoothie 4 x 150ml', '🥤 Drinks', '🧃', 2.45, 'MORRISONS TROPICAL KIDS SMOOTH', '4 x 150ml from the Morrisons listing'),
  row(15914, 'Morrisons Berry Kids Smoothies', '🥤 Drinks', '🧃', 2.30, 'MORRISONS BERRY KIDS SMOOTHIES', 'size not confirmed'),
  row(15915, 'Morrisons Golden Delicious Apples', '🥦 Fruit & Veg', '🍏', 2.55, 'MORRISONS GOLDEN DELICIOUS APP', 'size not confirmed'),
  row(15916, 'Morrisons Wafer Thin Cooked Chicken', '🥗 Deli & Salads', '🍗', 2.55, 'MORRISONS WAFER THIN COOKED CH', 'size not confirmed, 170g or 400g'),
  row(15917, 'Morrisons Sweetclem Easy Peelers', '🥦 Fruit & Veg', '🍊', 2.10, 'MORRISONS SWEETCLEM EASY PEELE', 'size not confirmed, 600g typical'),
  row(15918, 'Morrisons Baby Leaf Salad', '🥦 Fruit & Veg', '🥬', 1.45, 'MORRISONS BABY LEAF SALAD', 'size not confirmed'),
  row(15919, 'Morrisons Little Gem Lettuce 2 Pack', '🥦 Fruit & Veg', '🥬', 1.20, 'MORRISONS LITTLE GEM LETTUCE', '2 pack from the Morrisons listing'),
  row(15920, 'Morrisons Salad Tomatoes 6 Pack', '🥦 Fruit & Veg', '🍅', 1.35, 'MORRISONS SALAD TOMATOES', 'bought twice; 6 pack inferred'));
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
