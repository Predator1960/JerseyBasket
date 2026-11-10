// Co-op Don Street receipt 10 Nov 13:37 (Mary C, competition entry).
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
// 11 items: 8 grocery lines + Christmas Lottery 20 (2 x 2.00, not grocery, not counted). Total sold 38.71, savings 0.55 (members), paid 38.16.
const D = '10 Nov', CO = 'Co-op branch: Don Street (receipt 10 Nov 13:37, Mary C)';
setPrice(11979, 'coop', 4.15, D, CO + ': Tst Kera Curry 4.15 (The Spice Tailor assumed, same price as the row)');
setPrice(5060, 'coop', 1.00, D, CO + ': Cp Cream Chckn Soup 1.00; members 0.85 (seen 10 Nov, expiry date unknown)');
setPrice(10386, 'coop', 2.30, D, CO + ': Knor Stk Cbes Vgtble 2.30 (8 cubes assumed)');
setPrice(5065, 'coop', 2.80, D, CO + ': Stagg Chili 2.80');
setPrice(3174, 'coop', 1.60, D, CO + ': Cp Mashed Potato 2 x 1.60; members 1.40 (seen 10 Nov, expiry date unknown)');
const NEW = [
 ['Baileys Irish Cream (size not confirmed, row 6443 is the 70cl at 20.00)', '🍷 Wine & Beer', '🥃', 16.00, 'Baileys I/Cream 16.00 (no deal shown on the receipt)'],
 ['Dolmio Chunky Meatballs with Fusilli (size not confirmed)', '🍝 Pantry', '🍝', 2.63, 'Dolmio C Mball Fsill 2.63'],
 ['Dolmio Classic Ragu Bolognese (size not confirmed)', '🍝 Pantry', '🍝', 2.63, 'Dlm Clss Rg Blgns 2.63'],
];
let at = find(16110), id = 16111;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:' + n[3] + ',morrisons:0,ms:0,waitrose:0,iceland:0,alliance:0}, upd:"' + D + '"}, // ' + CO + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
