// M&S School Road, St Clement receipt 8 Nov 12:32 (Mary C, competition entry).
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
// 10 items, balance 38.80 (sum checks). M&S product codes noted on each line.
const D = '8 Nov', WR = 'M&S branch: School Road, St Clement (receipt 8 Nov, Mary C)';
setPrice(15898, 'ms', 8.00, D, WR + ': Froglet Rouge 8.00, product code 29360130 (same as 5 Nov)');
const NEW = [
 ['M&S White Mushrooms (size not confirmed)', '🥦 Fruit & Veg', '🍄', 1.05, 'WHT MUSHROOM 1.05, product code 00314121'],
 ['M&S Soffritto Base (size not confirmed)', '🍝 Pantry', '🍝', 2.45, 'SOFFRITTO BAS 2.45, product code 00730921'],
 ['M&S British Beef Mince (size not confirmed)', '🥩 Meat & Fish', '🥩', 8.75, 'BTH BEEF MINC 8.75, product code 29511556'],
 ['M&S Chunked N\' Loaded Cookie (flavour and size not confirmed)', '🍞 Bread & Bakery', '🍪', 2.45, 'CHNKD & LOAD 2.45, product code 29516520 (different code from the Sticky Apple Cookie 29539918)'],
 ['M&S Beef Bone Broth (size not confirmed)', '🍝 Pantry', '🍲', 7.00, 'BEEF BONE BRO 7.00, product code 29283354'],
 ['M&S Simply Spaghetti (size not confirmed)', '🍝 Pantry', '🍝', 0.85, 'SIMPLY SPAGHE 0.85, product code 00671644'],
 ['M&S Linguine (size not confirmed)', '🍝 Pantry', '🍝', 2.85, 'LINGUINE 2.85, product code 00671651'],
 ['M&S Chicken Gravy Granules (size not confirmed)', '🍝 Pantry', '🍲', 2.70, 'CHKN GRVY GRN 2.70, product code 29420797'],
 ['M&S Beef Gravy Granules (size not confirmed)', '🍝 Pantry', '🍲', 2.70, 'BEEF GRVY GRN 2.70, product code 29420803'],
];
let at = find(15989), id = 15990;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:' + n[3] + ',waitrose:0,iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
