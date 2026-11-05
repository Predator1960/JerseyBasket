// Morrisons Daily St Ouen receipt 5 Nov (competition entry, Katrina B).
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

const MR = 'Morrisons Daily St Ouen shopper receipt 5 Nov', D = '5 Nov';
setPrice(17, 'morrisons', 2.35, D, MR + ': J/DAIRY BUTTER UNSALTED 250G 2.35 x2 (matches)');
setPrice(2641, 'morrisons', 1.64, D, MR + ': JERSEY DAIRY 2.5% FAT MILK 1.64 (was 1.54, an undated legacy figure)');
setPrice(11061, 'morrisons', 5.79, D, MR + ': JERSEY DAIRY ICE CREAM VANILLA 5.79 (900ml, matches Co-op 5.75)');
const k = find(15890);
const row = (id, name, cat, icon, price, rl, note) => '  {id:' + id + ', name:"' + name + '", cat:"' + cat + '", icon:"' + icon + '", prices:{coop:0,morrisons:' + price + ',ms:0,waitrose:0,iceland:0,alliance:0}, upd:"' + D + '"}, // ' + MR + ': ' + rl + ' ' + price.toFixed(2) + ' (' + note + ')';
lines.splice(k + 1, 0,
  row(15891, 'Milkybar Buttons', '🍫 Confectionery', '🍬', 1.90, 'MILKYBAR BUTTONS', 'bought twice; size not confirmed'),
  row(15892, 'Haribo Goldbears', '🍫 Confectionery', '🍬', 1.55, 'HARIBO GOLDBEARS', 'bought twice; size not confirmed'),
  row(15893, 'Morrisons Raisins', '🍝 Pantry', '🍇', 3.30, 'MORRISONS RAISINS', 'size not confirmed'),
  row(15894, 'Morrisons Hazelnuts', '🍝 Pantry', '🥜', 3.20, 'MORRISONS HAZELNUTS', 'size not confirmed'),
  row(15895, 'Morrisons Braeburn Apples', '🥦 Fruit & Veg', '🍎', 2.55, 'MORRISONS BRAEBURN APPLES', 'bought twice; size not confirmed'),
  row(15896, 'Morrisons Loose Bramley Apples', '🥦 Fruit & Veg', '🍏', 3.01, 'MORRISONS LOOSE BRAMLEY APPLES', 'sold by weight at 3.61/kg, 0.835kg bought, so 3.01 is for this weight'));
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
