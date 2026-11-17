// Laura (catalogue only, no points): Co-op Five Oaks receipts 14 Nov 18:12 and 17 Nov 11:58
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
const A = 'Co-op branch: Five Oaks (Laura receipt 17 Nov 11:58)', B = 'Co-op branch: Five Oaks (Laura receipt 14 Nov 18:12)';
setPrice(3682, 'coop', 1.59, '17 Nov', A + ': Cp All Butter Scones 1.59 (bought reduced to clear, regular price kept)');
setPrice(2651, 'coop', 2.06, '17 Nov', A + ': Jersey Double Crea 2.06');
setPrice(1094, 'coop', 1.75, '17 Nov', A + ': Warb.Wht/W.Meal 2 x 1.75; members £1.50 (seen 17 Nov, expiry date unknown)');
setPrice(15844, 'coop', 1.00, '17 Nov', A + ': Co-op Med Woven 1.00');
addNote(3966, A + ': King Pot Noodle 1.65 (flavour not printed) + kg Ndle Crry 114G 1.65');
setPrice(3966, 'coop', 1.65, '17 Nov', A + ': kg Ndle Crry 114G 1.65');
setPrice(1263, 'coop', 1.49, '17 Nov', A + ': Warb 8 Crump Thins 1.49');
setPrice(8039, 'coop', 3.40, '14 Nov', B + ': Cp Unsmoked Bacon Uk 3.40; members £2.45');
setPrice(3674, 'coop', 2.10, '14 Nov', B + ': Warburtons Wht Blmr 2.10; members £1.80');
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
const id = Math.max(...ids) + 1, at = find(Math.max(...ids));
lines.splice(at + 1, 0, '  {id:' + id + ', name:"Häagen-Dazs Caramel Waffle (as printed HGN DAZS CML WFL, size not confirmed)", cat:"🧊 Frozen", icon:"🍨", prices:{coop:3.17,morrisons:0,ms:0,waitrose:0,iceland:0,alliance:0}, upd:"14 Nov"}, // ' + B + ': Hgn Dazs Cml Wfl 3.17');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, new id', id);
