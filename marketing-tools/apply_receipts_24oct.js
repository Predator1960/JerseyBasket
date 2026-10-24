// Receipts: Morrisons Haute Croix 23 Oct 2026, Co-op Millennium Park 24 Oct 2026, Waitrose St Helier 24 Oct 2026.
// Re-dates matched rows, corrects prices that differ, merges two duplicate rows, adds untracked items.
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
const ser = v => {
  if (Array.isArray(v)) return '[' + v.map(ser).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).map(k => k + ':' + ser(v[k])).join(',') + '}';
  return JSON.stringify(v);
};
function rowText(o) {
  const parts = Object.keys(o).map(k => k + ':' + (k === 'prices' ? '{' + S.map(s => s + ':' + (+(o.prices[s] || 0).toFixed(2))).join(',') + '}' : ser(o[k])));
  return '  {' + parts.join(', ') + '}';
}
function commentOf(l) { const m = l.match(/\}\s*,?\s*(\/\/.*)$/); return m ? m[1] : ''; }
function setPrice(id, store, price, date, note, nameTo) {
  const i = find(id); if (i < 0) throw new Error('missing row ' + id);
  const old = lines[i], o = evalRow(old), was = o.prices[store] || 0;
  const others = S.filter(s => s !== store && (o.prices[s] || 0) > 0);
  if (!o.upds) {
    if (others.length && o.upd) { o.upds = {}; others.forEach(s => { o.upds[s] = o.upd; }); }
  }
  o.prices[store] = price;
  if (o.upds) { o.upds[store] = date; o.upd = Object.values(o.upds).reduce((a, b) => (dval(b) > dval(a) ? b : a)); }
  else o.upd = date;
  if (nameTo) o.name = nameTo;
  // keep key order stable: id,name,cat,icon,prices,upd,upds,oos
  const ordered = {}; ['id', 'name', 'cat', 'icon', 'prices', 'upd', 'upds', 'oos'].forEach(k => { if (o[k] !== undefined) ordered[k] = o[k]; });
  Object.keys(o).forEach(k => { if (ordered[k] === undefined) ordered[k] = o[k]; });
  let c = commentOf(old);
  const add = note + (was && was !== price ? ` (was ${was})` : '');
  c = c ? c + ' | ' + add : '// ' + add;
  lines[i] = rowText(ordered) + ', ' + c;
  return was;
}
const del = id => { const i = find(id); if (i < 0) throw new Error('missing row ' + id); lines.splice(i, 1); };

const CO = 'Co-op Millennium Park receipt 24 Oct';
const D = '24 Oct';
// ---- Co-op lines that already match (re-date) -----
[[771, 2.65], [2575, 3.15], [4408, 2.45], [5414, 2.05], [4495, 1.19], [4912, 0.75], [5646, 3.70], [8551, 1.84], [5150, 0.85], [5158, 0.65], [2577, 3.15],
 [4288, 1.05], [3991, 0.79], [8074, 1.84], [4039, 1.19], [4684, 2.65], [11352, 2.65], [3386, 2.20], [4695, 2.65], [12089, 2.35], [5720, 1.29],
 [3817, 3.40], [9905, 0.69], [5457, 2.55], [3320, 6.50], [5012, 1.00], [3028, 1.40], [3446, 3.40], [10264, 0.42], [2725, 2.80], [3758, 1.45],
 [3708, 1.85], [2952, 3.40], [3210, 1.40], [10133, 2.10], [3721, 1.90], [3311, 5.35], [4883, 1.20], [3032, 1.90], [3802, 3.20], [579, 1.35],
 [1096, 1.50], [2731, 2.99], [9688, 3.15], [10521, 3.15], [575, 4.72], [3433, 4.72], [2961, 3.40], [915, 1.05], [4598, 1.60], [8562, 4.55],
 [919, 1.30], [10609, 2.20], [16, 2.20], [3568, 1.29], [3557, 1.30], [556, 1.89]].forEach(([id, p]) => {
  const was = setPrice(id, 'coop', p, D, CO + ' matches');
  if (was && Math.abs(was - p) > 0.005) console.log('PRICE CHANGED', id, was, '->', p);
});
// ---- Co-op price differences -----
setPrice(8117, 'coop', 3.45, D, CO + ': 2 Crispy Chick Grill 3.45');
setPrice(3605, 'coop', 7.00, D, CO + ': Cp Diced Cssrle Stk 7.00');
setPrice(596, 'coop', 1.25, D, CO + ': Robs Dc Orange 1L 1.25');
setPrice(563, 'coop', 3.15, D, CO + ': Co-op Green Grapes 3.15');
// ---- Jersey fat reduced milk 1L: merge the Waitrose-only-priced duplicate (700) into 2641 -----
setPrice(2641, 'waitrose', 1.65, '22 Oct', 'Waitrose St Saviour receipt 22 Oct: JDAIRY FAT RED MILK 1.65 (merged from row 700)', 'Jersey Dairy 2.5% Fat Reduced Milk 1L');
setPrice(2641, 'coop', 1.64, D, CO + ': Jersey Green Fat R 2 @ 1.64');
del(700);
// ---- Morrisons Haute Croix 23 Oct -----
{
  const i = find(954), o = evalRow(lines[i]);
  o.prices = { coop: 0, morrisons: 4.60, ms: 0, waitrose: 0, iceland: 0, alliance: 0 }; o.upd = '23 Oct'; delete o.upds;
  lines[i] = rowText(o) + ', // Morrisons Haute Croix receipt 23 Oct: MORRISONS ALL IN ONE LEMON DIS 4.60 (pack size not printed; the old Iceland 4.40 was an estimate for a Morrisons own-brand product)';
}
setPrice(9610, 'morrisons', 5.48, '23 Oct', 'Morrisons Haute Croix receipt 23 Oct: HAAGEN DAZS SALTED CARAMEL 5.48 (More Card price 4.25; size not printed, 460ml assumed)');
// ---- Waitrose St Helier 24 Oct -----
const WR = 'Waitrose St Helier receipt 24 Oct';
setPrice(452, 'waitrose', 4.60, D, WR + ': WR FRZ QRTR POUNDER 4.60 (bought 2)');
setPrice(4129, 'waitrose', 3.48, D, WR + ': HEINZ ZERO KETCHUP 3.48 (size not printed)');
setPrice(3815, 'waitrose', 3.89, D, WR + ': MCCAIN FRENCH FRIES 3.89 (size not printed; same price as Co-op 900g)');
// ---- New Co-op rows -----
const j = find(15844) + 1;
const mk = (id, name, cat, icon, coop, note) => rowText({ id, name, cat, icon, prices: { coop, morrisons: 0, ms: 0, waitrose: 0, iceland: 0, alliance: 0 }, upd: D }) + ', // ' + CO + ': ' + note;
lines.splice(j, 0,
  mk(15845, 'Bold 2in1 Lavender & Camomile 40 Washes', '🧺 Laundry', '🧺', 9.00, 'Bold 2In1 L&C 40W 9.00'),
  mk(15846, 'Gaviscon Aniseed', '💊 Health & Beauty', '💊', 4.65, 'Gav Aniseed 4.65 (size not printed)'),
  mk(15847, 'Bakers Whirls Bacon & Cheese Dog Treats', '🐾 Pet Care', '🐕', 1.25, 'Bakers Whrls Bcn Chs 1.25 (size not printed)'));
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
