// Morrisons Daily New Era receipt 15 Nov 14:03 (Mary C, competition entry): 16 items = 14 grocery lines counted + 2 x Christmas Draw 2026 tickets (4.00, not counted). Sandwich meal deal -2.34 (sandwich 3.59 + Peperami 1.85 + Pepsi 1.65 at regular price). Lines under the receipt's PRICE SAVING heading stored at the printed price (same decision as Katrina 11 Nov). Sub total 32.24 matches the line sum.
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
const D = '15 Nov', B = 'Morrisons branch: Daily New Era (Mary C receipt 15 Nov 14:03)';
setPrice(12613, 'morrisons', 1.65, D, B + ': PEPSI REGULAR 500ML 1.65 (sandwich meal deal -2.34)');
const GR = '🍝 Pantry', DR = '🥤 Drinks', SN = '🥨 Snacks & Treats', BB = '🍞 Bread & Bakery', DL = '🥗 Deli & Salads', FZ = '🧊 Frozen', HH = '🧹 Household';
const NEW = [
 ['Morrisons New York Deli Sandwich (meal deal item, as printed SANDWICH NEW YORK DELI)', DL, '🥪', 3.59, 'SANDWICH NEW YORK DELI (MD) 3.59 (sandwich meal deal -2.34)'],
 ['Peperami Original (meal deal item, as printed, size not confirmed)', SN, '🌭', 1.85, 'PEPERAMI ORIGINAL (MD) 1.85 (sandwich meal deal -2.34)'],
 ['Morrisons Mashed Potato (size not confirmed)', FZ, '🥔', 2.20, 'MORRISONS MASHED POTATO 2.20'],
 ['Belvita Soft Bakes Chocolate Hazelnut (as printed BELVITA SOFTBAKES CHOC HAZELNU, size not confirmed)', SN, '🍪', 3.60, 'BELVITA SOFTBAKES CHOC HAZELNU 3.60'],
 ['Vienna Gros Pain (as printed, size not confirmed)', BB, '🥖', 2.48, 'VIENNA GROS PAIN 2.48'],
 ['Morrisons Best Sea Salt Crisps (as printed, size not confirmed)', SN, '🥔', 1.20, 'MORRISONS BEST CRISPS SEA SALT 1.20 (listed under PRICE SAVING)'],
 ['Morrisons Salt & Vinegar Twirls (as printed, size not confirmed)', SN, '🥨', 1.35, 'MORRISONS SALT & VINEGAR TWIRL 1.35 (listed under PRICE SAVING)'],
 ["Aunt Bessie's Dumplings 390g", FZ, '🥟', 2.95, 'AUNT BESSIE DUMPLINGS 390G 2.95 (listed under PRICE SAVING)'],
 ['Morrisons Rinse Aid (size not confirmed)', HH, '🧴', 2.95, 'MORRISONS RINSE AID 2.95 (listed under PRICE SAVING)'],
 ['Ainsley Harriott Wild Mushroom Couscous (as printed COUS COUS WIL, size not confirmed)', GR, '🍚', 1.26, 'AINSLEY HARRIOTT COUS COUS WIL 1.26 (listed under PRICE SAVING)'],
 ['Ainsley Harriott Moroccan Couscous (as printed A/H MOROCAN COUS COUS, size not confirmed)', GR, '🍚', 1.25, 'A/H MOROCAN COUS COUS 1.25 (listed under PRICE SAVING)'],
 ['Ainsley Harriott Lemon Couscous (as printed COUS COUS LEM, size not confirmed)', GR, '🍚', 1.25, 'AINSLEY HARRIOTT COUS COUS LEM 1.25 (listed under PRICE SAVING)'],
 ['Marmite Rice Cakes Large (as printed, size not confirmed)', SN, '🍘', 3.00, 'MARMITE RICE CAKES LARGE 3.00 (listed under PRICE SAVING)'],
];
let at = find(18357), id = 18358;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:' + n[3] + ',ms:0,waitrose:0,iceland:0,alliance:0}, upd:"' + D + '"}, // ' + B + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
