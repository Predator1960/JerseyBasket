// Waitrose St Helier receipt 5 Nov (competition entry, Jason).
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

const WR = 'Waitrose St Helier shopper receipt 5 Nov', D = '5 Nov';
setPrice(430, 'waitrose', 1.65, D, WR + ': JD 1% FAT MILK 1.65 x2 (matches)');
setPrice(14258, 'waitrose', 4.64, D, WR + ': WR ESS BEEF BURGERS 4.64');
setPrice(14143, 'waitrose', 3.89, D, WR + ': WR BRIT HNY RST HAM 3.89 (Deli Meats 2 for £5 offer applied, regular price stored)');
setPrice(14163, 'waitrose', 3.89, D, WR + ': WR BRIT BREADED HAM 3.89 (Deli Meats 2 for £5 offer applied, regular price stored)');
setPrice(7086, 'waitrose', 2.03, D, WR + ': JASONS WHITE ROLLS 2.03');
setPrice(7088, 'waitrose', 2.90, D, WR + ': ST PIERRE 4 BRG BUNS 2.90');
const k = find(15889);
lines.splice(k + 1, 0, '  {id:15890, name:"Waitrose Extra Large Whole Chicken", cat:"🥩 Meat & Fish", icon:"🍗", prices:{coop:0,morrisons:0,ms:0,waitrose:8.85,iceland:0,alliance:0}, upd:"5 Nov"}, // ' + WR + ': WR XL WHOLE CHICKEN 8.85 (sold by weight, price is for this bird; size not confirmed, typically about 2.3kg)');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
