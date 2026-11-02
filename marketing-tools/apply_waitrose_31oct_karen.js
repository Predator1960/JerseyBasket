// Waitrose St Saviour receipt dated 31 Oct (shared by a shopper; entered no competition, prices only).
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
setPrice(430, 'waitrose', 1.65, D, WR + ': JD 1% FAT MILK 1.65 x2 (matches)');
setPrice(13729, 'waitrose', 1.59, D, WR + ': WR ESS APPLE JUICE 1.59 (1L, size inferred from row)');
setPrice(13898, 'waitrose', 2.21, D, WR + ': WR MONKEY NUTS 2.21 (350g, size inferred from row)');
setPrice(7982, 'waitrose', 4.41, D, WR + ': WR NUTS & RAISINS 4.41 (was 4.00)');
setPrice(7560, 'waitrose', 5.11, D, WR + ': WR F/R EGGS LARGE 5.11 (was 4.40)');
setPrice(7927, 'waitrose', 1.06, D, WR + ': SIMMERS ABERNETHY 1.06 (was 1.00)');
setPrice(14711, 'waitrose', 1.33, D, WR + ': WR MILK CHOC DIG 1.33 x2');
setPrice(14262, 'waitrose', 4.93, D, WR + ': MACSWEEN HAGGIS 4.93 (size inferred from row)');
setPrice(7564, 'waitrose', 2.09, D, WR + ': WR ROYAL GALA APPLES 2.09 (was 1.50)');
setPrice(7077, 'waitrose', 3.25, D, WR + ': WR BLK SEEDLESS GRPE 3.25 (was 2.80)');
setPrice(14223, 'waitrose', 3.48, D, WR + ': WR ESS SMOKED LARDON 3.48 (size inferred from row)');
setPrice(14495, 'waitrose', 4.55, D, WR + ': WR MED VEG QUICHE 4.55 (size inferred from row)');
setPrice(7075, 'waitrose', 4.55, D, WR + ': WR QUICHE LORRAINE 4.55 x2 (was 3.95)');
setPrice(14857, 'waitrose', 1.86, D, WR + ': WR ESS OLIVE SPREAD 1.86 (size inferred from row)');
setPrice(9806, 'waitrose', 4.05, D, WR + ': BE 22 CHICKEN DIPPER 4.05 (size inferred from row)');
setPrice(3125, 'waitrose', 1.11, D, WR + ': MULLER RICE APPLE 1.11 x2 (size inferred from row)');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
