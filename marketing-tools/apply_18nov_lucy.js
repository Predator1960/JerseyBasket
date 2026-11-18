// Lucy D: Waitrose St Helier 18 Nov 14:49 (15 lines), Alliance Sand St 15 Nov 13:28 (1), Co-op Charing Cross 15 Nov (3); all Amex ...2015
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
const WR = 'Waitrose branch: St Helier 334 (Lucy D receipt 18 Nov 14:49)', AL = 'Alliance branch: Sand Street (Lucy D receipt 15 Nov 13:28)', CP = 'Co-op branch: Charing Cross (Lucy D receipt 15 Nov)';
setPrice(2641, 'waitrose', 1.65, '18 Nov', WR + ': JDAIRY FAT RED MILK 3 x 1.65');
setPrice(12436, 'waitrose', 1.99, '18 Nov', WR + ': SHADES STRAWB 2 x 1.99');
setPrice(4535, 'waitrose', 1.39, '18 Nov', WR + ': SQUASHIES ORIGINAL 1.39');
setPrice(8083, 'waitrose', 2.50, '18 Nov', WR + ': INNOCENT KIDS SMOOTH 2 x 2.50');
setPrice(16073, 'waitrose', 2.79, '18 Nov', WR + ': JASONS GRAIN & SEEDS 2.79 (was 2.73)');
setPrice(14735, 'waitrose', 1.01, '18 Nov', WR + ': WR ESS BOURBON 1.01 (size assumed 400g)');
addNote(16036, WR + ': CADBURY FUDGE 2 x 1.89 (a multipack, not this single bar; price not stored)');
addNote(16047, WR + ': MUNCH BUNCH F/FRAIS 2.44 (different pack size from this row; price not stored)');
setPrice(3711, 'alliance', 2.20, '15 Nov', AL + ': BRIOCHE PASQUIER CHO 2.20');
setPrice(2955, 'coop', 6.00, '15 Nov', CP + ': Cp Brit Mat Wht Chd 6.00');
setPrice(5679, 'coop', 3.15, '15 Nov', CP + ': Pepsi Max 3.15');
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
const id = Math.max(...ids) + 1, at = find(Math.max(...ids));
lines.splice(at + 1, 0, '  {id:' + id + ', name:"Fox\'s Favourites Biscuit Assortment (as printed FOX\'S FAV BISC ASMT, size not confirmed)", cat:"🥨 Snacks & Treats", icon:"🍪", prices:{coop:0,morrisons:0,ms:0,waitrose:3.2,iceland:0,alliance:0}, upd:"18 Nov"}, // ' + WR + ': FOX\'S FAV BISC ASMT 3.20');
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, new id', id);
