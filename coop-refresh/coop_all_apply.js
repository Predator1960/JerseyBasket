const fs = require('fs');
const ROOT = require('path').resolve(__dirname, '..') + '/';
const APPLY = process.argv.includes('--apply');
const NOW = new Date(); const UPD = NOW.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][NOW.getMonth()];
const TODAY = new Date(NOW.toISOString().slice(0, 10));
const feed = JSON.parse(fs.readFileSync(ROOT + (process.env.FEED || 'coop-all.json'), 'utf8'));
let text = fs.readFileSync(ROOT + 'src/App.jsx', 'utf8');
if (text.includes('\r')) throw new Error('CRLF present');
const spMatch = text.match(/const sp = \(base,\[c,m,ms2,w,i,a=0\]\) => \(\{[\s\S]*?\}\);/);
const start = text.indexOf('const BASE_PRODUCTS = [');
const endRel = text.indexOf('\n];', start);
const P = new Function(`${spMatch[0]}\n${text.slice(start, endRel + 3)}\nreturn BASE_PRODUCTS;`)();
let lines = text.split('\n');
const idLine = new Map();
lines.forEach((l, i) => { const m = l.match(/^\s*\{id:(\d+)/); if (m) idLine.set(+m[1], i); });

const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[®™©]/g, '').replace(/(\d)\s*(litres?|liters?|ltr)\b/g, '$1l').replace(/&/g, ' and ').replace(/[’']/g, '').replace(/(\d)\s+(g|kg|ml|l|gr)\b/g, '$1$2').replace(/(\d)gr\b/g, '$1g').replace(/[^a-z0-9. ]/g, ' ');
const toks = s => norm(s).split(/\s+/).filter(t => t && !['the', 'of'].includes(t));
const key = a => a.slice().sort().join(' ');
const SIZE = /^\d+(\.\d+)?(g|kg|ml|l|ltr|pack|pk)$|^\d+x\d+(\.\d+)?(g|ml|pack)?$/;
const hasSize = t => t.some(x => SIZE.test(x));
function catKeys(name) {
  const t = toks(name); const ks = [key(t)];
  const last = t[t.length - 1];
  if (t.length > 2 && ((SIZE.test(last) && t.slice(0, -1).some(x => SIZE.test(x))) || /^\d*(s|each)$/.test(last))) ks.push(key(t.slice(0, -1)));
  return ks;
}
function feedKeys(f) {
  const t = toks(f.description); const ks = [key(t)];
  if (!hasSize(t) && f.actual_size) ks.push(key([...t, ...toks(String(f.actual_size))]));
  return ks;
}
const catIndex = new Map();
P.forEach(p => catKeys(p.name).forEach(k => { const a = catIndex.get(k) || []; if (!a.includes(p)) a.push(p); catIndex.set(k, a); }));

const SKIP = /^(Tobacco & Lottery)/;
const MAP = [
  [/^Alcohol/, '🍷 Wine & Beer', '🍷'], [/^Drinks > Hot/, '🥤 Drinks', '☕'], [/^Drinks/, '🥤 Drinks', '🥤'],
  [/^Fresh Food > (Milk|Cheese|Yoghurt)/, '🥛 Dairy & Eggs', '🥛'], [/^Fresh Food > Meat/, '🥩 Meat & Fish', '🥩'],
  [/^Fresh Food > (Fruit|Vegetables|Organic)/, '🥦 Fruit & Veg', '🥦'], [/^Fresh Food > Salad/, '🥦 Fruit & Veg', '🥗'],
  [/^Fresh Food/, '🥗 Deli & Salads', '🥗'], [/^Cook/, '🥗 Deli & Salads', '🍽️'], [/^Carrefour > Fresh/, '🥗 Deli & Salads', '🥗'],
  [/^Frozen/, '🧊 Frozen', '🧊'], [/^Bakery > Bread/, '🍞 Bread & Bakery', '🍞'], [/^Bakery > (Confectionery|Biscuits)/, '🥨 Snacks & Treats', '🍪'], [/^Bakery/, '🍞 Bread & Bakery', '🥐'],
  [/^Food Cupboard > (Confectionery)/, '🍫 Confectionery', '🍫'], [/^Food Cupboard > (Crisps|Biscuits)/, '🥨 Snacks & Treats', '🥨'],
  [/^Food Cupboard/, '🍝 Pantry', '🥫'], [/^Carrefour/, '🍝 Pantry', '🥫'], [/^Big Packs/, '🍝 Pantry', '📦'],
  [/^Baby/, '🍼 Baby & Child', '🍼'], [/^Household/, '🧹 Household', '🧹'], [/^Home & Garden/, '🧹 Household', '🏠'],
  [/^Health & Beauty/, '💊 Health & Beauty', '💊'], [/^Pets/, '🐾 Pet Care', '🐾'], [/^Fresh Flowers/, '💐 Fresh Flowers', '💐'], [/^Halloween/, '🥨 Snacks & Treats', '🎃']
];
function mapCat(f) { const c = ((f.categories || {}).lvl1 || [])[0] || ''; for (const [re, cat, ic] of MAP) if (re.test(c)) return { cat, ic, raw: c }; return { cat: '🍝 Pantry', ic: '🛒', raw: c, unmapped: true }; }

const fmtDate = d => `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(2, 4)}`;
const money = t => { const m = t.match(/£([\d.]+)/); if (m) return '£' + parseFloat(m[1]).toFixed(2); const p = t.match(/(\d+)p\b/); return p ? '£' + (parseInt(p[1]) / 100).toFixed(2) : null; };
function offerComment(f) {
  const d = (f.deals || [])[0]; if (!d) return null;
  const end = fmtDate(String(d.end_date).slice(0, 10));
  const t = d.till_description || '';
  if (/BUY|FOR £|MAINS|PIZZA|PASTA|NOODLES|DRUMSTICKS|SERVE|SAVE/i.test(t) && !/^Special Offer/i.test(t)) return null; // multibuys / meal deals / save-x
  if (/^Special Offer$/i.test(t) && f.original_price != null && f.original_price > f.price) return `special offer £${(f.price / 100).toFixed(2)} until ${end}`;
  let m;
  if ((m = t.match(/^Special Offer\s+(.*)$/i)) && money(m[1])) return `special offer ${money(m[1])} until ${end}`;
  if ((m = t.match(/^Members (?:Price|Offer)(?: Only)?\s+(.*)$/i)) && money(m[1])) return `members ${money(m[1])} until ${end}`;
  if ((m = t.match(/^Offer\s+(.*)$/i)) && money(m[1])) return `special offer ${money(m[1])} until ${end}`;
  if ((m = t.match(/^Crf Clearance\s+(.*)$/i)) && money(m[1])) return `clearance ${money(m[1])} until ${end}`;
  return null;
}
function setCoop(l, price) {
  const spm = l.match(/prices:sp\(([\d.]+),\[([^\]]*)\]\)/);
  if (spm) {
    const base = parseFloat(spm[1]); const arr = spm[2].split(',').map(s => s.trim());
    while (arr.length < 6) arr.push('0');
    arr[0] = (+(price - base).toFixed(2)).toString();
    return l.replace(spm[0], `prices:sp(${spm[1]},[${arr.join(',')}])`);
  }
  const re = /coop:[\d.]+/; if (!re.test(l)) throw new Error('format ' + l);
  return l.replace(re, `coop:${price}`);
}
function stamp(l) { if (/upd:"[^"]*"/.test(l)) return l.replace(/upd:"[^"]*"/, `upd:"${UPD}"`); const i = l.lastIndexOf('}'); return l.slice(0, i) + `, upd:"${UPD}"` + l.slice(i); }
function setOos(l, on) {
  const has = l.match(/oos:\[([^\]]*)\]/);
  if (on) { if (!has) { const i = l.lastIndexOf('}'); return l.slice(0, i) + ', oos:["coop"]' + l.slice(i); } if (!/coop/.test(has[0])) return l.replace(/oos:\[([^\]]*)\]/, (m, a) => `oos:[${a},"coop"]`); return l; }
  if (has && /coop/.test(has[0])) { const rest = has[1].split(',').map(s => s.trim()).filter(s => s && s !== '"coop"'); return rest.length ? l.replace(/oos:\[[^\]]*\]/, `oos:[${rest.join(',')}]`) : l.replace(/,\s*oos:\[[^\]]*\]/, ''); }
  return l;
}
// replace/expire dated offer segments in an existing line comment, then add the new one
const OFFER_SEG = /(special offer|members|clearance)[^|]*?until (\d\d)\/(\d\d)\/(\d\d)/i;
function updateComment(l, newC) {
  const m = l.match(/^(.*?\})(,?)(\s*)\/\/\s?(.*)$/);
  let head = l, segs = [];
  if (m) { head = m[1] + m[2]; segs = m[4].split(/\s\|\s/); }
  const kept = segs.filter(s => { const o = s.match(OFFER_SEG); if (!o) return true; const dt = new Date(`20${o[4]}-${o[3]}-${o[2]}`); return dt >= TODAY && !newC; });
  if (newC) { const k2 = kept.filter(s => !OFFER_SEG.test(s)); k2.push(newC); return k2.length ? head + ' // ' + k2.join(' | ') : head; }
  return kept.length ? head + ' // ' + kept.join(' | ') : head;
}

const stats = { matchedRows: 0, priceChanged: 0, unchanged: 0, newItems: 0, skippedCat: 0, comments: 0, oosSet: 0, oosCleared: 0, unmapped: 0, feedDupKeys: 0 };
const protectedLog = [], newRows = [], changeLog = [], bigMoves = [], seenNewKeys = new Set(), touched = new Set();
for (const f of feed) {
  const c = mapCat(f);
  if (SKIP.test(c.raw)) { stats.skippedCat++; continue; }
  const regular = (f.original_price != null && f.original_price > f.price ? f.original_price : f.price) / 100;
  const oos = !!(f.stock_details && f.stock_details.out_of_stock);
  const seen = new Set(); const targets = [];
  for (const k of feedKeys(f)) for (const p of (catIndex.get(k) || [])) if (!seen.has(p.id)) { seen.add(p.id); targets.push(p); }
  const comment = offerComment(f);
  if (targets.length) {
    for (const p of targets) {
      if (touched.has(p.id)) { stats.feedDupKeys++; continue; }
      touched.add(p.id);
      stats.matchedRows++;
      const i = idLine.get(p.id); let l = lines[i];
      const cur = p.prices.coop || 0;
      const protectedRow = p.id === 5741;
      if (protectedRow && Math.abs(cur - regular) > 0.004) { protectedLog.push(`${p.id} ${p.name}: keep ${cur}, feed ${regular}`); continue; }
      if (Math.abs(cur - regular) > 0.004) {
        l = setCoop(l, regular); stats.priceChanged++; changeLog.push(`${p.id} ${p.name}: ${cur} -> ${regular}`);
        if (cur > 0 && (regular / cur > 1.6 || regular / cur < 0.6)) bigMoves.push(`${p.id} ${p.name}: ${cur} -> ${regular}`);
      } else stats.unchanged++;
      l = stamp(l);
      const hadOos = /oos:\[[^\]]*coop/.test(l);
      l = setOos(l, oos); if (oos && !hadOos) stats.oosSet++; if (!oos && hadOos) stats.oosCleared++;
      const l2 = updateComment(l, comment); if (comment && l2 !== l) stats.comments++; l = l2;
      lines[i] = l;
    }
  } else {
    const ks = feedKeys(f)[0]; if (seenNewKeys.has(ks)) { stats.feedDupKeys++; continue; } seenNewKeys.add(ks);
    let name = f.description.trim();
    if (!hasSize(toks(name)) && f.actual_size) name += ' ' + String(f.actual_size).toLowerCase().replace(/^(\d+(?:\.\d+)?)(kg|g|ml|l)$/, '$1$2');
    if (c.unmapped) stats.unmapped++;
    const n = norm(name);
    let icon = c.ic;
    if (c.cat === '🥤 Drinks' && c.raw.includes('Hot')) icon = /tea|matcha|chai|infusion/.test(n) && !/coffee/.test(n) ? '🍵' : /chocolate|cocoa|ovaltine|horlicks|malt/.test(n) && !/coffee/.test(n) ? '🍫' : '☕';
    newRows.push({ name, price: regular, comment, oos, icon, cat: c.cat, raw: c.raw });
    stats.newItems++;
  }
}
let nid = Math.max(...idLine.keys()) + 1;
const newLines = newRows.map(r => {
  let l = `  {id:${nid++}, name:${JSON.stringify(r.name)}, cat:"${r.cat}", icon:"${r.icon}", prices:{coop:${r.price},morrisons:0,ms:0,waitrose:0,iceland:0,alliance:0}, upd:"${UPD}"${r.oos ? ', oos:["coop"]' : ''}},`;
  if (r.comment) { l += ' // ' + r.comment; stats.comments++; }
  if (r.oos) stats.oosSet++;
  return l;
});
console.log(JSON.stringify(stats));
const byCat = {}; newRows.forEach(r => byCat[r.cat] = (byCat[r.cat] || 0) + 1); console.log('new by app category', JSON.stringify(byCat));
console.log('PROTECTED (receipt-sourced, kept) '+protectedLog.length);protectedLog.forEach(x=>console.log('  '+x));console.log('\nBIG MOVES (>1.6x or <0.6x) ' + bigMoves.length); bigMoves.slice(0, 60).forEach(x => console.log('  ' + x));
if (process.argv.includes('--list')) { console.log('\nNEW:'); newRows.forEach(r => console.log(`  [${r.cat}] ${r.name} £${r.price}${r.comment ? ' // ' + r.comment : ''}`)); }
if (APPLY) {
  const s = lines.findIndex(l => l.startsWith('const BASE_PRODUCTS = ['));
  const c = lines.findIndex((l, i) => i > s && l.startsWith('];'));
  lines.splice(c, 0, '  /* ── Co-op Jersey full catalogue, API download ' + UPD + ' (auto) ── */', ...newLines);
  fs.writeFileSync(ROOT + 'src/App.jsx', lines.join('\n'), 'utf8');
  console.log('\nwritten');
} else console.log('\n(dry run)');
