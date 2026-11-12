// Waitrose St Saviour (332) receipt, date not printed, submitted 12 Nov (Jason L, competition entry): 16 lines, 14 groceries counted, 2 Christmas cards not counted. Total 69.96, free mini panettone -4.35, paid 65.61.
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
const D = '12 Nov', WR = 'Waitrose branch: St Saviour 332 (Jason L receipt, date not printed, submitted 12 Nov)';
setPrice(1395, 'waitrose', 8.15, D, WR + ': VILLA MARIA SV BLANC 8.15');
setPrice(7595, 'waitrose', 1.51, D, WR + ': ESS COLESLAW 300G 1.51');
setPrice(17791, 'waitrose', 4.35, D, WR + ': WR CAR & CHO PANETON 4.35 (free Christmas mini panettone -4.35 on the same receipt, size assumed 100g)');
const NEW = [
 ['Silvikrin Hairspray (size not confirmed)', '💊 Health & Beauty', '💇', 5.52, 'SILVIKRIN HAIRSPRAY 5.52'],
 ['Batiste Original Dry Shampoo (size not confirmed)', '💊 Health & Beauty', '💇', 2.86, 'BATISTE ORIGINAL 2.86'],
 ['Calgon Gel (size not confirmed)', '🧹 Household', '🧴', 4.96, 'CALGON GEL 4.96'],
 ["Scott's Porage Oats (size not confirmed)", '🍝 Pantry', '🥣', 2.60, 'SCOTTS PORAGE OATS 2.60'],
 ['Lenor Spring Awakening Scent Beads (size not confirmed)', '🧹 Household', '🧺', 2.48, 'LENOR SPRING BEADS 2 x 2.48'],
 ['Mazzetti Balsamic Glaze (size not confirmed)', '🍝 Pantry', '🍝', 4.30, 'MAZZETTI GLAZE 4.30'],
 ["Pinot Pinot 'Signature' (as printed on the receipt, brand and size not confirmed)", '🍷 Wine & Beer', '🍷', 7.60, "PINOTPINOT 'SIGNATUR 7.60"],
 ['Waitrose Essential Turkey Mince 3% Fat (size not confirmed)', '🥩 Meat & Fish', '🥩', 4.89, 'ESS TURKEY MINCE 3% 2 x 4.89'],
 ['Baxters Pickle (size not confirmed)', '🍝 Pantry', '🥒', 3.37, 'BAXTERS PICKLE 3.37'],
];
let at = find(18276), id = 18277;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + n[3] + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
