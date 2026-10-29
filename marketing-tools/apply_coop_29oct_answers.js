// Co-op 29 Oct receipts: answers to size questions.
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
  setPrice(id, 'coop', price, D, CO + ': ' + note + (changed ? ' (was ' + was + ')' : ' matches'));
  if (changed) console.log('PRICE CHANGED', id, was, '->', price);
};
// undo the wrong re-date of the 500g caster sugar (the 29 Oct line was the 1kg)
const orig = require('child_process').execSync('git show HEAD~1:src/App.jsx', { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n').find(l => /^\s*\{id:9931[,\s]/.test(l));
lines[find(9931)] = orig;
go(4104, 2.09, 'T&L F.T Cstr Sgr 1kg (2 @ 2.09)');
go(5765, 1.30, 'Lczade 0 Pnk Lmnde 900ml');
go(4268, 1.85, 'Foxs Viennese Finger 105g');
go(11030, 3.15, 'Coca-colazerosugar 8 pack');
go(4980, 1.75, 'Td Golden Veg rice 250g');
go(4251, 1.60, 'Mcv Drk Choc Dgstv 266g');
go(2861, 2.10, 'Cp 4 Min Crsp Prkps (4 mini pork pies)');
{ const i = find(4980); lines[i] = lines[i].replace(' // special offer £1.05 until 20/10/26', ' //').replace(/\/\/ \|/, '//').replace(/\/\/\s*\/\//, '//'); }
// specials: regular price stays, offer noted
addNote(4607, 'special offer £1.05 seen on Co-op Millennium Park receipt 29 Oct (end date unknown)');
addNote(4568, 'special offer £1.05 seen on Co-op Millennium Park receipt 29 Oct (end date unknown)');
addNote(3735, 'special offer £1.58 seen on Co-op Millennium Park receipt 29 Oct (end date unknown)');
addNote(3736, 'special offer £2.89 seen on Co-op Millennium Park receipt 29 Oct (end date unknown)');
// new rows
const add = (after, text) => { const i = find(after); lines.splice(i + 1, 0, text); };
add(15856, '  {id:15857, name:"Robinsons Double Concentrate Orange & Pineapple Squash 1L", cat:"🥤 Drinks", icon:"🥤", prices:{coop:1.25,morrisons:0,ms:0,waitrose:0,iceland:0,alliance:0}, upd:"29 Oct"}, // Co-op Millennium Park receipt 29 Oct: Robinsons Dc O&P 2 @ 1.25 (1L per shopper)');
add(15857, '  {id:15858, name:"Tate & Lyle Fairtrade Pure Cane Icing Sugar 1kg", cat:"🍝 Pantry", icon:"🍬", prices:{coop:2.7,morrisons:0,ms:0,waitrose:0,iceland:0,alliance:0}, upd:"29 Oct"}, // Co-op Millennium Park receipt 29 Oct: T&L F.T Icng Sgr 2 @ 2.70 (1kg each per shopper)');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
