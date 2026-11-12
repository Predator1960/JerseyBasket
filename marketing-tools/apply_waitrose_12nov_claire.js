// Waitrose St Helier ScanPayGo receipt 12 Nov 18:55 (Claire E, competition entry): 18 lines, 18 items, total 54.39.
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
const D = '12 Nov', WR = 'Waitrose branch: St Helier (Claire E receipt 12 Nov 18:55)';
setPrice(7596, 'waitrose', 2.21, D, WR + ': WR M PIPER POT 2KG 2.21 (was 2.20)');
setPrice(8101, 'waitrose', 3.25, D, WR + ': WR ESS 10 BACON RSHR 3.25');
setPrice(2593, 'waitrose', 4.71, D, WR + ': WR SB PEP PIZZA 4.71');
setPrice(2641, 'waitrose', 1.65, D, WR + ': JDAIRY FAT RED MILK 3 x 1.65');
setPrice(7675, 'waitrose', 1.63, D, WR + ': ESS FR WHITE EGGS 1.63');
setPrice(16054, 'waitrose', 7.95, D, WR + ': CAD ADVENT CAL 2 x 7.95');
setPrice(7983, 'waitrose', 2.13, D, WR + ': WR ORZO 2.13 (was 1.85, Aug)');
const NEW = [
 ["Arnott's Shapes Pizza (size not confirmed)", '🍝 Pantry', '🍕', 2.30, 'ARNOTTS SHAPES PIZZA 2.30'],
 ['Waitrose Pork Sausages (size not confirmed)', '🥩 Meat & Fish', '🌭', 2.30, 'WR PORK SAUSAGES 2.30'],
 ['Waitrose Fish Pie (size not confirmed)', '🧊 Frozen', '🐟', 4.93, 'WR FISH PIE 4.93'],
 ['Waitrose Essential Low Fat Greek Style Yogurt (size not confirmed)', '🥛 Dairy & Eggs', '🥛', 1.34, 'WR ESS LF GREEK YOG 1.34'],
 ['Birds Eye Garden Peas (size not confirmed)', '🧊 Frozen', '🫛', 2.90, 'BIRDS EYE GARDEN PEA 2.90'],
 ['Albert Bartlett Fries (size not confirmed)', '🧊 Frozen', '🍟', 3.83, 'ALBERT/B FRIES 3.83'],
 ['Haribo Tangfastics (size not confirmed)', '🍫 Confectionery', '🍬', 1.25, 'HARIBO TANGFASTICS 1.25'],
];
let at = find(18269), id = 18270;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + n[3] + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n[4]); id++; });
addNote(9618, WR + ': FAIRTRADE BANANAS 0.76 (weighed line, not stored)');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
