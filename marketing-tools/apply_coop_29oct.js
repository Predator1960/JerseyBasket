// Co-op Millennium Park receipts 29 Oct 2026 (trans 9 and 10): matches and price changes.
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

const CO = 'Co-op Millennium Park receipt 29 Oct', D = '29 Oct';
const go = (id, price, note) => {
  const i = find(id); if (i < 0) { console.log('MISSING', id); return; }
  const was = evalRow(lines[i]).prices.coop;
  const changed = Math.abs(was - price) > 0.005;
  setPrice(id, 'coop', price, D, CO + ': ' + (note || (changed ? 'price change' : 'matches')) + (changed ? ' (was ' + was + ')' : ''));
  if (changed) console.log('PRICE CHANGED', id, was, '->', price);
};
[[3815, 3.89], [573, 3.89], [3817, 3.40], [3685, 1.80], [3813, 3.90], [8087, 3.90], [1095, 1.95], [2577, 3.15], [6162, 3.75], [771, 2.65], [3354, 1.60],
 [4632, 2.65], [15848, 3.50], [5657, 1.00], [5646, 3.70], [4695, 2.65], [926, 2.65], [901, 1.84], [2641, 1.64], [5149, 0.70], [5158, 0.65], [3027, 1.85],
 [15844, 1.00], [894, 1.45], [3542, 4.30], [3113, 1.05], [3115, 1.05], [4445, 0.80], [1094, 1.75], [9654, 1.75], [588, 2.63], [3558, 2.40], [912, 1.05],
 [3124, 1.05], [4239, 2.00], [9667, 1.85], [3446, 3.40], [575, 4.72], [425, 1.85], [3303, 6.50], [919, 1.30], [10609, 2.20], [10264, 0.42], [571, 1.50],
 [4598, 1.60], [10260, 0.55], [915, 1.05], [2725, 2.80], [3088, 4.45], [581, 4.45], [15853, 2.99], [558, 2.15], [3386, 2.20], [916, 1.20], [2645, 1.90],
 [2961, 3.40], [7667, 3.40], [7304, 2.55], [5150, 0.85], [9695, 0.95], [9689, 1.95], [15852, 1.75], [922, 1.40], [3158, 1.10], [868, 2.75], [2760, 2.75],
 [9931, 2.09], [8072, 3.85], [4009, 1.30], [8076, 2.65]].forEach(([id, p]) => go(id, p));
go(7668, 1.85, 'Cp Frsh Dbl Crm');
go(8050, 2.35, 'Lotus Bisco Ice Cr');
go(8065, 1.84, 'Hula Hoops Bbq Beef');
go(7659, 1.50, 'Cp Spng Scrng Pads');
go(4247, 1.94, "Mcvitie's Jaffa 12Pk");
go(8063, 1.58, 'Cadbury White Button');
go(1812, 1.85, 'Richm 8 Thck Sausage (2 @ 1.85)');
go(913, 2.00, 'Cp Lem Cheeseck');
go(2937, 2.00, 'Cp Lem Cheeseck');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
