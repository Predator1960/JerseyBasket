// Iceland (Snappy Shopper) full-catalogue import. Run from anywhere:
//   node iceland-refresh/iceland_apply.js [--list] [--apply]
const fs = require('fs');
const ROOT = require('path').resolve(__dirname, '..') + '/';
const APPLY = process.argv.includes('--apply');
const NOW = new Date();
const UPD = NOW.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][NOW.getMonth()];
const STORE_KEY = 'iceland', STORE_IDX = 4; // sp() offset order: coop, morrisons, ms, waitrose, iceland, alliance
const feed = JSON.parse(fs.readFileSync(ROOT + (process.env.FEED || 'iceland-all.json'), 'utf8'));
let text = fs.readFileSync(ROOT + 'src/App.jsx', 'utf8');
if (text.includes('\r')) throw new Error('CRLF present');
const spMatch = text.match(/const sp = \(base,\[c,m,ms2,w,i,a=0\]\) => \(\{[\s\S]*?\}\);/);
const start = text.indexOf('const BASE_PRODUCTS = [');
const endRel = text.indexOf('\n];', start);
const P = new Function(`${spMatch[0]}\n${text.slice(start, endRel + 3)}\nreturn BASE_PRODUCTS;`)();
let lines = text.split('\n');
const idLine = new Map();
lines.forEach((l, i) => { const m = l.match(/^\s*\{id:(\d+)/); if (m) idLine.set(+m[1], i); });

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[®™©]/g, '').replace(/(\d)\s*(litres?|liters?|ltr)\b/g, '$1l').replace(/&/g, ' and ').replace(/[’']/g, '').replace(/(\d)\s+(g|kg|ml|l|gr)\b/g, '$1$2').replace(/(\d)gr\b/g, '$1g').replace(/[^a-z0-9. ]/g, ' ');
const toks = s => norm(s).split(/\s+/).filter(t => t && !['the', 'of'].includes(t));
const key = a => a.slice().sort().join(' ');
const SIZE = /^\d+(\.\d+)?(g|kg|ml|l|ltr|pack|pk)$|^\d+x\d+(\.\d+)?(g|ml|pack)?$/;
const hasSize = t => t.some(x => SIZE.test(x));
function catKeys(name) {
  const t = toks(name); const ks = [key(t)];
  const last = t[t.length - 1];
  if (t.length > 2 && ((SIZE.test(last) && t.slice(0, -1).some(x => SIZE.test(x))) || /^\d*(s|each|pk)$/.test(last))) ks.push(key(t.slice(0, -1)));
  return ks;
}
const catIndex = new Map();
P.forEach(p => catKeys(p.name).forEach(k => { const a = catIndex.get(k) || []; if (!a.includes(p)) a.push(p); catIndex.set(k, a); }));

const SKIP = /^(Cigarettes|Rolling - Tobacco|Nicotine Pouches|Rolling - Papers & Tips|Vaping)$/;
const BUNDLE = /^(Big Roast Energy|£11 Harry Ramsden Meal Deal|Frozen - Mix&Match)/;
const MAP = [
  [/Wine|Lager|Ale|Cider|Vodka|Gin|Whisky|Rum|Brandy|Spirits|Premixed/, '🍷 Wine & Beer', '🍷'],
  [/Tea, Coffee/, '🥤 Drinks', '☕'], [/Milkshakes|Juice|Fizzy|Energy|Water|Large Bottles|Multipack Drinks|Cordial|Mixers|Low & No|Dairy Free Drinks/, '🥤 Drinks', '🥤'],
  [/^(Milk|Cream|Eggs|Butter|Cheese|Yoghurts)/, '🥛 Dairy & Eggs', '🥛'], [/^(Meat|Chicken|Fish)/, '🧊 Frozen', '🥩'], [/Sausage, Bacon/, '🧊 Frozen', '🥓'],
  [/^(Fruit|Salad)/, '🥦 Fruit & Veg', '🥦'], [/Vegetables & Rice/, '🧊 Frozen', '🥦'],
  [/^(Ice|Pizzas|Chips|Ready Meals|Meat Free|Desserts|Pies Pasties|Frozen|Party Food|Yorkshire|Harry)/, '🧊 Frozen', '🧊'],
  [/^(Bread|Rolls|Cakes|Gluten)/, '🍞 Bread & Bakery', '🍞'], [/Biscuits/, '🥨 Snacks & Treats', '🍪'],
  [/Crisps|Popcorn|Nuts|Dips|Protein/, '🥨 Snacks & Treats', '🥨'], [/Chocolate|Sweets|Gum/, '🍫 Confectionery', '🍫'],
  [/Cooked Meat|Pies & Quiche|Sandwiches|Pasta & Salad|Coleslaw/, '🥗 Deli & Salads', '🥗'],
  [/Dog|Cat/, '🐾 Pet Care', '🐾'],
  [/Dental|Deodorants|Haircare|Soap|Medicines|Family Planning|Sanitary|Shaving|Skin|Toiletries/, '💊 Health & Beauty', '💊'],
  [/Toilet Rolls|Bags & Wrap|Dish Wash|Laundry|Cleaning|Air Fresheners|Tableware|Batteries|BBQ|Stationery|Party Decor|Car Care|Misc|Lighters/, '🧹 Household', '🧹'],
  [/Cereals|Breakfast|Rice|Pasta|Noodles|Preserves|Home Baking|Oils|Sauces|Cooks|Condiments|Baked Beans|Tomatoes|Pulses|Soup|Meals|Meat & Fish|Fruit & Vegetables/, '🍝 Pantry', '🥫'],
  [/Gift/, '🍫 Confectionery', '🎁']
];
function mapCat(f) { const c = String((typeof f.mainCategory === 'object' ? f.mainCategory && f.mainCategory.name : f.mainCategory) || '').trim(); for (const [re, cat, ic] of MAP) if (re.test(c)) return { cat, ic, raw: c }; return { cat: '🍝 Pantry', ic: '🛒', raw: c, unmapped: true }; }

function setStore(l, price) {
  const spm = l.match(/prices:sp\(([\d.]+),\[([^\]]*)\]\)/);
  if (spm) {
    const base = parseFloat(spm[1]); const arr = spm[2].split(',').map(s => s.trim());
    while (arr.length < 6) arr.push('0');
    arr[STORE_IDX] = (+(price - base).toFixed(2)).toString();
    return l.replace(spm[0], `prices:sp(${spm[1]},[${arr.join(',')}])`);
  }
  const re = new RegExp(STORE_KEY + ':[\\d.]+'); if (!re.test(l)) throw new Error('format ' + l);
  return l.replace(re, `${STORE_KEY}:${price}`);
}
function stamp(l) { if (/upd:"[^"]*"/.test(l)) return l.replace(/upd:"[^"]*"/, `upd:"${UPD}"`); const i = l.lastIndexOf('}'); return l.slice(0, i) + `, upd:"${UPD}"` + l.slice(i); }
function setOos(l, on) {
  const q = `"${STORE_KEY}"`, has = l.match(/oos:\[([^\]]*)\]/);
  if (on) { if (!has) { const i = l.lastIndexOf('}'); return l.slice(0, i) + `, oos:[${q}]` + l.slice(i); } if (!has[0].includes(STORE_KEY)) return l.replace(/oos:\[([^\]]*)\]/, (m, a) => `oos:[${a},${q}]`); return l; }
  if (has && has[0].includes(STORE_KEY)) { const rest = has[1].split(',').map(s => s.trim()).filter(s => s && s !== q); return rest.length ? l.replace(/oos:\[[^\]]*\]/, `oos:[${rest.join(',')}]`) : l.replace(/,\s*oos:\[[^\]]*\]/, ''); }
  return l;
}
const storePrice = p => p.prices[STORE_KEY] || 0;

const stats = { feed: feed.length, matchedRows: 0, priceChanged: 0, unchanged: 0, newItems: 0, skippedCat: 0, skippedBundle: 0, oosSet: 0, oosCleared: 0, feedDupKeys: 0, unmapped: 0 };
const newRows = [], changeLog = [], bigMoves = [], seenNewKeys = new Set(), touched = new Set();
for (const f of feed) {
  const c = mapCat(f);
  if (SKIP.test(c.raw)) { stats.skippedCat++; continue; }
  if (BUNDLE.test(c.raw)) { stats.skippedBundle++; continue; }
  const price = f.price, oos = !!f.outOfStock;
  const seen = new Set(), targets = [];
  for (const k of [key(toks(f.name))]) for (const p of (catIndex.get(k) || [])) if (!seen.has(p.id)) { seen.add(p.id); targets.push(p); }
  if (targets.length) {
    for (const p of targets) {
      if (touched.has(p.id)) { stats.feedDupKeys++; continue; }
      touched.add(p.id); stats.matchedRows++;
      const i = idLine.get(p.id); let l = lines[i]; const cur = storePrice(p);
      if (cur > 0 && price < cur * 0.65) {
        // feed has no "was" price; a big drop is most likely an Iceland offer, so keep the regular price and note the offer
        l = l.replace(/\s*\|?\s*iceland offer £[\d.]+ seen \d+ \w+/, '');
        const note = `iceland offer £${price} seen ${UPD}`;
        l = /\/\/ /.test(l) ? l + ' | ' + note : l + ' // ' + note;
        stats.offerKept = (stats.offerKept || 0) + 1; stats.unchanged++;
      } else if (Math.abs(cur - price) > 0.004) {
        l = setStore(l, price); stats.priceChanged++; changeLog.push(`${p.id} ${p.name}: ${cur} -> ${price}`);
        if (cur > 0 && (price / cur > 1.6 || price / cur < 0.6)) bigMoves.push(`${p.id} ${p.name}: ${cur} -> ${price}`);
      } else stats.unchanged++;
      l = stamp(l);
      const had = /oos:\[[^\]]*iceland/.test(l);
      l = setOos(l, oos); if (oos && !had) stats.oosSet++; if (!oos && had) stats.oosCleared++;
      lines[i] = l;
    }
  } else {
    const ks = key(toks(f.name)); if (seenNewKeys.has(ks)) { stats.feedDupKeys++; continue; } seenNewKeys.add(ks);
    if (c.unmapped) stats.unmapped++;
    newRows.push({ name: f.name.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').trim(), price, oos, icon: c.ic, cat: c.cat, raw: c.raw });
    stats.newItems++;
  }
}
const notInFeed = P.filter(p => storePrice(p) > 0 && !touched.has(p.id));
let nid = Math.max(...idLine.keys()) + 1;
const newLines = newRows.map(r => {
  const l = `  {id:${nid++}, name:${JSON.stringify(r.name)}, cat:"${r.cat}", icon:"${r.icon}", prices:{coop:0,morrisons:0,ms:0,waitrose:0,iceland:${r.price},alliance:0}, upd:"${UPD}"${r.oos ? ', oos:["iceland"]' : ''}},`;
  if (r.oos) stats.oosSet++;
  return l;
});
console.log(JSON.stringify(stats));
console.log('catalogue rows with an Iceland price NOT in this feed (left untouched):', notInFeed.length);
const byCat = {}; newRows.forEach(r => byCat[r.cat] = (byCat[r.cat] || 0) + 1); console.log('new by app category', JSON.stringify(byCat));
console.log('\nBIG MOVES (>1.6x or <0.6x) ' + bigMoves.length); bigMoves.slice(0, 60).forEach(x => console.log('  ' + x));
if (process.argv.includes('--list')) { console.log('\nNEW:'); newRows.forEach(r => console.log(`  [${r.cat}] ${r.name} £${r.price}${r.oos ? ' [OOS]' : ''}`)); console.log('\nCHANGES:'); changeLog.forEach(x => console.log('  ' + x)); }
if (APPLY) {
  const s = lines.findIndex(l => l.startsWith('const BASE_PRODUCTS = ['));
  const c = lines.findIndex((l, i) => i > s && l.startsWith('];'));
  lines.splice(c, 0, '  /* ── Iceland full catalogue (Snappy Shopper), download ' + UPD + ' ── */', ...newLines);
  fs.writeFileSync(ROOT + 'src/App.jsx', lines.join('\n'), 'utf8');
  console.log('\nwritten');
} else console.log('\n(dry run)');
