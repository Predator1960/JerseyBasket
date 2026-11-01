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

const WR = 'Waitrose St Helier receipt 31 Oct', D = '31 Oct';
setPrice(2584, 'waitrose', 1.00, D, WR + ': WR DURAFOLD BAG 1.00 (matches)');
setPrice(452, 'waitrose', 4.60, D, WR + ': WR FRZ QRTR POUNDER 4.60 (matches)');
setPrice(689, 'waitrose', 2.79, D, WR + ': WR PARMENTIER POTATO 2.79 (matches)');
setPrice(465, 'waitrose', 2.79, D, WR + ': WR PARMENTIER POTATO 2.79 (matches)');
setPrice(464, 'waitrose', 4.35, D, WR + ': WR ESS BEEF 20 MINCE 4.35 (matches)');
setPrice(450, 'waitrose', 1.51, D, WR + ': WR ESS DOUBLE CREAM 1.51 (matches)');
setPrice(467, 'waitrose', 1.57, D, WR + ': WR JAM DNUTS 5S 1.57 (was 1.35)');
setPrice(7159, 'waitrose', 1.57, D, WR + ': WR JAM DNUTS 5S 1.57 (was 1.35)');
setPrice(14212, 'waitrose', 5.22, D, WR + ': ESS B BEEF MINCE 12% 5.22 (Essential 500g per shopper)');
setPrice(10859, 'waitrose', 3.00, D, WR + ': KELLY\'S HONEYCOMB 3.00 (950ml per shopper)');
setPrice(9063, 'waitrose', 3.91, D, WR + ': B/EYE CHICKEN POUNDR 3.91 (4 pack per shopper)');
setPrice(13827, 'waitrose', 1.55, D, WR + ': JACOBS SWEET CHILLI 1.55 (125g per shopper)');
const k = find(15858);
lines.splice(k + 1, 0, '  {id:15859, name:"Ribena Summerfruits Squash 1L", cat:"🥤 Drinks", icon:"🫐", prices:{coop:0,morrisons:0,ms:0,waitrose:2.44,iceland:0,alliance:0}, upd:"31 Oct"}, // ' + WR + ': RIBENA SUMMERFRUITS 2.44 (1L squash per shopper)');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
