// Waitrose St Helier receipt 26 Oct 2026.
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

const WR = 'Waitrose St Helier receipt 26 Oct', D = '26 Oct';
setPrice(2584, 'waitrose', 1.00, D, WR + ': WR DURAFOLD BAG 1.00 (matches)');
setPrice(2586, 'waitrose', 3.75, D, WR + ': SPRITE 3.75 (matches the 8 x 330ml price; pack size not printed)');
const j = find(15853) + 1;
const mk = (id, name, cat, icon, price, note) => rowText({ id, name, cat, icon, prices: { coop: 0, morrisons: 0, ms: 0, waitrose: price, iceland: 0, alliance: 0 }, upd: D }) + ', // ' + WR + ': ' + note;
lines.splice(j, 0,
  mk(15854, 'Waitrose Essential Salted Peanuts', '🥨 Snacks & Treats', '🥜', 1.66, 'WR ESS SALTED PEANUT 1.66 (size not printed)'),
  mk(15855, 'Waitrose Cream Chocolate Choux Buns', '🍰 Cakes & Desserts', '🍫', 3.19, 'WR CREAM CHOC CHOUX 3.19 (pack size not printed)'),
  mk(15856, 'Waitrose Essential Hot Cross Buns', '🍞 Bread & Bakery', '🥐', 2.03, 'WR ESS HOT CROSS BUN 2.03 (pack size not printed)'));
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
