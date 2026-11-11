// Katrina B Morrisons Daily St Ouen 11 Nov: the lines listed under the receipt's PRICE SAVING headings, stored as current prices (user decision).
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
const D = '11 Nov';
const MO = 'Morrisons branch: Daily St Ouen (receipt 11 Nov 13:12, Katrina B)';
const PS = ' [listed under PRICE SAVING on the receipt: a price cut or More Card price, the usual price is not shown]';
setPrice(13445, 'morrisons', 3.55, D, MO + ': LURPAK GARLIC BUTTER 3.55' + PS);
setPrice(3733, 'morrisons', 2.85, D, MO + ': BAKER ST SLICED SEEDED RYE BRE 2.85 (500g assumed)' + PS);
const NEW = [
 ['Morrisons Whole Watermelon', '🥦 Fruit & Veg', '🍉', 5.25, 'WHOLE WATERMELON 5.25'],
 ['Morrisons Large Flat Mushrooms (size not confirmed)', '🥦 Fruit & Veg', '🍄', 2.10, 'LARGE FLAT MUSHROOMS 2.10'],
 ['Morrisons Simply Granola (size not confirmed)', '🍝 Pantry', '🥣', 3.75, 'MORRISONS SIMPLY GRANOLA 3.75'],
 ['Morrisons The Best Mince Pies (size not confirmed)', '🍞 Bread & Bakery', '🥧', 3.15, 'MORRISONS BEST MINCE PIES 3.15'],
 ['Morrisons Fast Action Yeast (size not confirmed)', '🍝 Pantry', '🍞', 2.10, 'MORRISONS FAST ACTION YEAST SA 2.10'],
 ['Morrisons The Best Conserve Morello Cherry (size not confirmed)', '🍝 Pantry', '🍒', 3.44, 'MORRISONS BEST CONSERVE MORELL 3.44 (Morello cherry assumed)'],
 ['Vifon Chicken Flavour Noodle Soup (size not confirmed)', '🍝 Pantry', '🍜', 0.95, 'VIFON CHICKEN FLAVOUR NOODLE S 0.95 (soup assumed)'],
 ['Morrisons The Best Cauliflower Cheese (size not confirmed)', '🥗 Deli & Salads', '🧀', 2.85, 'MORRISONS BEST CAULIFLOWER CHE 2.85'],
 ['Morrisons Flax Seeds (size not confirmed)', '🍝 Pantry', '🌱', 2.55, 'MORRISONS FLAX SEEDS 2.55'],
 ['Vienna Multigrain Cereal Loaf (size not confirmed)', '🍞 Bread & Bakery', '🍞', 2.82, 'VIENNA MULTIGRAIN CEREAL LOAF 2.82'],
 ['Morrisons Pumpkin Seeds (size not confirmed)', '🍝 Pantry', '🎃', 2.55, 'MORRISONS PUMPKIN SEEDS 2.55'],
 ['Morrisons Pine Nuts (size not confirmed)', '🍝 Pantry', '🌰', 5.60, 'MORRISONS PINE NUTS 5.60'],
 ['Morrisons Filo Pastry Sheets (size not confirmed)', '🍝 Pantry', '🥐', 2.32, 'MORRISONS FILO PASTRY SHEETS 2.32'],
 ['Lindt Excellence Orange (size not confirmed)', '🍫 Confectionery', '🍫', 4.60, 'LINDT EXCELLENCE ORANGE 4.60'],
 ['Border Biscuits Dark Chocolate Ginger (brand and size not confirmed)', '🍫 Confectionery', '🍪', 2.44, 'BORDER DARK CHOCOLATE GINGER 2.44'],
 ['Morrisons The Best Twists Parmesan (size not confirmed)', '🍿 Snacks', '🥨', 3.00, 'MORRISONS BEST TWISTS PARMESAN 3.00'],
 ['Morrisons Slow Cooked Hot Hone (name cut off on the receipt)', '🥗 Deli & Salads', '🍯', 5.50, 'MORRISONS SLOW COOKED HOT HONE 5.50'],
 ['Miltons Multigrain Crackers (size not confirmed)', '🍿 Snacks', '🍘', 2.10, 'MILTONS MULTIGRAIN CRACKERS 2.10'],
 ['Morrisons Olives with Feta (size not confirmed)', '🥗 Deli & Salads', '🫒', 3.90, 'MORRISONS OLIVES WITH FETA 3.90'],
 ['Green & Black\'s Dark Chocolate (size not confirmed)', '🍫 Confectionery', '🍫', 4.50, 'GREEN & BLACKS DARK CHOCOLATE 4.50'],
 ['Morrisons Pizza Base Mix (size not confirmed)', '🍝 Pantry', '🍕', 1.25, 'MORRISONS PIZZA BASE MIX 1.25'],
 ['Morrisons Reduced Fat Oven Coo (name cut off on the receipt)', '🥗 Deli & Salads', '🍖', 2.80, 'MORRISONS REDUCED FAT OVEN COO 2.80'],
 ['Morrisons Dark Chocolate Chips (size not confirmed)', '🍝 Pantry', '🍫', 2.00, 'MORRISONS CHOCOLATE CHIPS DARK 2.00'],
 ['Morrisons Vegetable Spring Rolls (size not confirmed)', '🧊 Frozen', '🥟', 3.70, 'MORRISONS VEGETABLE SPRING ROL 3.70'],
 ['Morrisons Sunflower Seeds (size not confirmed)', '🍝 Pantry', '🌻', 2.10, 'MORRISONS SUNFLOWER SEEDS 2.10'],
 ['Snowbelle Jersey Chocolate Cow Single (size not confirmed)', '🍫 Confectionery', '🐄', 0.70, 'SNOWBELLE JERSEY CHOC COW SING 0.70'],
 ['Lindt Bear Milk Chocolate with Tag', '🍫 Confectionery', '🐻', 4.75, 'LINDT BEAR MILK WITH TAG 4.75 x2'],
];
let at = find(16130), id = 16131;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:' + n[3] + ',ms:0,waitrose:0,iceland:0,alliance:0}, upd:"' + D + '"}, // ' + MO + ': ' + n[4] + PS); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
