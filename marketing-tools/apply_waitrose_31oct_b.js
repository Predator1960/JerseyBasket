// Waitrose St Saviour receipt dated 31 Oct, second pass: sizes looked up online.
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


const WR = 'Waitrose St Saviour shopper receipt 31 Oct', D = '31 Oct';
setPrice(8656, 'waitrose', 1.15, D, WR + ': TSOP SC RCE CRACKERS 1.15 (The Snack Organisation, 100g)');
setPrice(3417, 'waitrose', 1.11, D, WR + ': MULLER RICE ORIGINAL 1.11 x2 (size from row)');
setPrice(12044, 'waitrose', 2.30, D, WR + ': TIMS DAIRY HONEY 2.30 x2 (450g assumed from row)');
setPrice(2593, 'waitrose', 4.71, D, WR + ': WR SB PEP PIZZA 4.71 (replaces old legacy 6.33; waitrose.com lists 413g)');
setPrice(2596, 'waitrose', 2.79, D, WR + ': WR CHRLTE POT SALAD 2.79 (was 2.73; 270g on waitrose.com)');
setPrice(9022, 'waitrose', 3.45, D, WR + ': YOUNGS SCAMPI 3.45 (Young\'s Formed Golden Scampi 220g inferred)');
setPrice(7938, 'waitrose', 2.19, D, WR + ': WR CHEDDAR TWISTS 2.19 (was 1.50)');
const k = find(15868);
const row = (id, name, cat, icon, price, rl, note) => '  {id:' + id + ', name:"' + name + '", cat:"' + cat + '", icon:"' + icon + '", prices:{coop:0,morrisons:0,ms:0,waitrose:' + price + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + rl + ' ' + price.toFixed(2) + ' (' + note + ')';
lines.splice(k + 1, 0,
  row(15869, 'Tims Dairy Greek Style Honey Yogurt (single pot)', '🥛 Dairy & Eggs', '🥛', 1.05, 'TIMS DAIRY YOG HONEY', 'pot size not confirmed'),
  row(15870, 'Tims Dairy Greek Style Blackcurrant Yogurt (single pot)', '🥛 Dairy & Eggs', '🥛', 1.05, 'TIMS DAIRY BLACKCRNT', 'pot size not confirmed'),
  row(15871, 'Tims Dairy Greek Style Raspberry Yogurt (single pot)', '🥛 Dairy & Eggs', '🥛', 1.05, 'TIMS DAIRY RASPBERRY', 'pot size not confirmed'),
  row(15872, 'Waitrose Cheese & Ham Tortelloni', '🥗 Deli & Salads', '🥘', 2.56, 'WR CHSE & HAM TORTEL', 'x2; size not confirmed, Essential version is 300g'),
  row(15873, 'Duchy Organic Tomato, Red Pepper & Lentil Soup 600g', '🥗 Deli & Salads', '🍲', 3.68, 'DUCHY TOM LENTL SOUP', 'x2; size from waitrose.com'),
  row(15874, 'McCain Air Fryer Hash Brown Bites 600g', '🧊 Frozen', '🧊', 3.25, 'MCCAIN A/FRY HASH BR', 'size from waitrose.com'),
  row(15875, 'Albert Bartlett Potato Croquettes 500g', '🧊 Frozen', '🍟', 2.90, 'ALBERT B CROQUETTES', 'size from waitrose.com'),
  row(15876, 'Waitrose All Butter Gruyere & Poppy Seed Twists 125g', '🥨 Snacks & Treats', '🥨', 3.11, 'WR GRUYEYE TWISTS', '125g per listings'),
  row(15877, 'Cadbury Celebrations Chocolate Pouch', '🍫 Confectionery', '🍫', 3.98, 'CELEBRATIONS POUCH', 'size not confirmed'),
  row(15878, 'Cadbury Heroes Chocolate Pouch', '🍫 Confectionery', '🍫', 4.97, 'CADBURY HEROES POUCH', 'size not confirmed, 270g or 300g'),
  row(15879, 'Badedas Revitalising Shower Gel, Shampoo & Conditioner 200ml', '💊 Health & Beauty', '🧴', 2.64, 'BADEDAS REVITALISING', 'size from retailer listings'));
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
