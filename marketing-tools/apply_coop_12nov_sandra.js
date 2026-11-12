// Co-op St Peter's Village receipt 12 Nov 14:45 (Sandra B, competition entry): 7 lines, 9 items, total sold 17.69, paid 15.38.
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
const D = '12 Nov', CO = "Co-op branch: St Peter's Village (Sandra B receipt 12 Nov 14:45)";
setPrice(9830, 'coop', 1.79, D, CO + ': Heinz Five Beanz 2 x 1.79 (Buy any 2 for 2.65 deal)');
setPrice(3248, 'coop', 3.69, D, CO + ': Cp Grana Padano 170G');
setPrice(16257, 'coop', 1.50, D, CO + ': Cp Whole Cucumber; members 1.05 (seen 12 Nov, expiry date unknown)');
addNote(10823, CO + ': Maltesers St Pouch 1.84 = special offer price (regular 2.49)');
addNote(4705, CO + ': Cpi Wst Cnty Ched 1.40 = special offer price (regular 1.80)');
addNote(4253, CO + ': Mcvities Mlk Choc 2.10 = special offer price (regular 3.90)');
const at = find(18258);
lines.splice(at + 1, 0, '  {id:18259, name:"Heinz Beanz No Added Sugar 415g (size not confirmed)", cat:"🍝 Pantry", icon:"🫘", prices:{coop:1.79,morrisons:0,ms:0,waitrose:0,iceland:0,alliance:0}, upd:"12 Nov"}, // ' + CO + ': Hnz Bnz No Add Sugar 2 x 1.79 (Buy any 2 for 2.65 deal)');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
