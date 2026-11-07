// Co-op Millennium Park receipt 6 Nov (competition entry, Jason L).
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
// Waitrose St Helier shopper receipt 7 Nov 11:17 (Katrina B, staff card 20% partner discount, pre-discount prices).
// 8 items; sum 17.71 less 3.55 partner discount = 14.16. SPK Blue Raspberry price (1.58) is derived from the total (thumbnail unreadable).
const D = '7 Nov', WR = 'Waitrose St Helier shopper receipt 7 Nov (Katrina B, staff card, pre-discount prices)';
setPrice(688, 'waitrose', 0.99, D, WR + ': SML WHITE BAGUETTE 0.99');
setPrice(7158, 'waitrose', 0.99, D, WR + ': MIXED OLIVE ROLL 0.99 (row was 0.80)');
setPrice(4483, 'waitrose', 1.34, D, WR + ': HARIBO MAOAM PINBALL 1.34 (140g assumed, 32g pack also exists)');
const NEW = [
 ['Waitrose Essential Mozzarella (SD, size not confirmed)', '🥛 Dairy & Eggs', '🧀', 3.45, 'WR ESS SD MOZZARELLA 3.45'],
 ['Waitrose Beef Stock (size not confirmed)', '🍝 Pantry', '🍝', 4.64, 'WR BEEF STOCK 4.64'],
 ['Waitrose Prawn Cocktail (not the 170g frozen row, size not confirmed)', '🥗 Deli & Salads', '🍤', 1.79, 'WR PRAWN COCKTAIL 1.79 (an earlier receipt had 4.60 for the 170g pack)'],
 ['Sparkling Blue Raspberry Drink (not confirmed)', '🥤 Drinks', '🥤', 1.58, 'SPK BLUE RASPBERRY 1.58 (price worked out from the receipt total; drink and brand not confirmed)'],
 ['The Fruit Factory Fruit Twists (size not confirmed)', '🥨 Snacks & Treats', '🍬', 2.93, 'FF FRUIT TWISTS 2.93 (FF = Fruit Factory, handwritten on receipt)'],
];
let at = find(15970), id = 15971;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + n[3] + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
