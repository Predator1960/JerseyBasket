// Waitrose 26 Oct receipt: sizes confirmed by the shopper.
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

const FO = 'Co-op Five Oaks receipt 1 Nov', SB = 'Co-op St Brelade receipt 31 Oct';
setPrice(5177, 'coop', 2.40, '1 Nov', FO + ': FLASH B&C 2.40 (spray 800ml per shopper; was 3.30)');
setPrice(5190, 'coop', 2.65, '1 Nov', FO + ': FLASH LEMON 2.65 (liquid 1L per shopper; matches)');
setPrice(1090, 'coop', 3.60, '31 Oct', SB + ': CP D/F CHK STFNG SW 3.60 (same item as row 8102, per shopper)');
setPrice(8102, 'coop', 3.60, '31 Oct', SB + ': CP D/F CHK STFNG SW 3.60 (same item as row 1090, per shopper)');
const k = find(15859);
lines.splice(k + 1, 0,
  '  {id:15860, name:"Co-op Irresistible Chocolate Cupcakes 2 Pack", cat:"🍞 Bread & Bakery", icon:"🧁", prices:{coop:2.25,morrisons:0,ms:0,waitrose:0,iceland:0,alliance:0}, upd:"31 Oct"}, // ' + SB + ': CP IRR TR CH 2PK 2.25 (cupcakes 2 pack per shopper; exact flavour name not printed)',
  '  {id:15861, name:"Co-op Cherry Vitamin C Sucking Sweets", cat:"🥨 Snacks & Treats", icon:"🍬", prices:{coop:1.05,morrisons:0,ms:0,waitrose:0,iceland:0,alliance:0}, upd:"31 Oct"}, // ' + SB + ': CP CHERRY VIT C 1.05 (sucking sweets for car journeys per shopper; size not printed)');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
