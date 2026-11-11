// Morrisons Daily St Ouen receipt 11 Nov 13:12 (Katrina B, competition entry; 58 items, 2 photos, middle section still missing).
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
// Total 179.93. Seen so far 54 lines; the middle of the receipt (about 2 items, 7.92) is on a third photo not yet received.
// Stored: only lines NOT under the receipt's '* PRICE SAVING *' / 'OUT OF DATE' headings (those are reduced prices, not regular) and not in the unseen-header lower part.
const D = '11 Nov', MO = 'Morrisons branch: Daily St Ouen (receipt 11 Nov 13:12, Katrina B)';
addNote(15895, MO + ': MORRISONS BRAEBURN APPLES 2.55 (unchanged)');
setPrice(4050, 'morrisons', 2.50, D, MO + ': SCHWARTZ TARRAGON 2.50');
setPrice(16056, 'morrisons', 2.35, D, MO + ': CADBURY DAIRY MILK COINS 2.35');
const NEW = [
 ['Morrisons Market Street Large Oranges (size not confirmed)', '🥦 Fruit & Veg', '🍊', 3.10, 'MORRISONS MARKET ST LARGE ORAN 3.10'],
 ['Morrisons Conference Pears 4 Pack', '🥦 Fruit & Veg', '🍐', 2.70, 'MORRISONS CONFERENCE PEARS 4PK 2.70 (M Fruit Deal -1.60 on this line, regular price stored)'],
 ['Morrisons Houmous Classic (size not confirmed)', '🥗 Deli & Salads', '🥣', 1.80, 'MORRISONS HOUMOUS CLASSIC 1.80 (M Dip Deal applied with the guacamole)'],
 ['Morrisons Guacamole (size not confirmed)', '🥗 Deli & Salads', '🥑', 1.69, 'MORRISONS GUACAMOLE 1.69 (M Dip Deal -0.34 across the two dips)'],
 ['Morrisons Multi Kitchen Towel (size not confirmed)', '🧹 Household', '🧻', 2.40, 'MORRISONS MULTI KITCHEN TOWEL 2.40'],
 ['Tate & Lyle Granulated Sugar (size not confirmed)', '🍝 Pantry', '🍬', 1.30, 'TATE & LYLE GRANULATED SUGAR 1.30'],
 ['Morrisons Cooked Mussels in White Wine (size not confirmed)', '🥩 Meat & Fish', '🦪', 4.10, 'MORRISONS COOKED MUSSELS IN WH 4.10 (white wine assumed)'],
 ['Morrisons Roses Warm Colours', '💐 Fresh Flowers', '🌹', 4.00, 'MORRISONS ROSES WARM COLOURS 4.00'],
 ['Morrisons The Best Christmas Pudding (size not confirmed)', '🍝 Pantry', '🎄', 6.85, 'MORRISONS BEST CHRISTMAS PUDDI 6.85'],
 ['Morrisons Grill Block Rump Steak (size not confirmed)', '🥩 Meat & Fish', '🥩', 5.50, 'GRILL BLOCK RUMP STEAK 5.50'],
 ['Tate & Lyle Fairtrade Demerara Sugar (size not confirmed)', '🍝 Pantry', '🍬', 3.10, 'TATE & LYLE FAIRTRADE DEMERARA 3.10'],
 ['Morrisons 12 Duck Spring Rolls', '🧊 Frozen', '🥟', 2.90, 'MORRISONS 12 DUCK SPRING ROLLS 2.90'],
 ['Rowntree\'s Jelly Raspberry 135g', '🍝 Pantry', '🍮', 1.55, 'ROWNT JELLY RASPBERRY 135G 1.55 x2'],
 ['Morrisons British Apples (size not confirmed)', '🥦 Fruit & Veg', '🍎', 2.85, 'MORRISONS BRITISH APPLES 2.85'],
 ['Morrisons Four Seed Mix (size not confirmed)', '🍝 Pantry', '🌰', 1.85, 'MORRISONS FOUR SEED MIX 1.85'],
 ['Morrisons Brazil Nuts (size not confirmed)', '🍝 Pantry', '🥜', 3.35, 'PIN: 63 X MORRISONS BRAZIL NUT 3.35'],
 ['Varzea Vinho Verde DOC Rose (size not confirmed)', '🍷 Wine & Beer', '🍷', 7.50, 'VARZEA VINHO VERDE DOC ROSE 7.50'],
];
let at = find(16113), id = 16114;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:' + n[3] + ',ms:0,waitrose:0,iceland:0,alliance:0}, upd:"' + D + '"}, // ' + MO + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
