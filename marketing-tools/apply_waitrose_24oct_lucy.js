// Waitrose St Helier receipt 24 Oct 16:33 (Lucy Delaney, NOT a competition entry: before 1 Nov). Catalogue only, applied by date.
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
// 29 items; sum 81.75 less Tassimo 3 for 13 (6.68) = 75.07 paid by gift card.
const D = '24 Oct', WR = 'Waitrose St Helier shopper receipt 24 Oct 16:33 (Lucy D)';
const wDate = id => { const o = evalRow(lines[find(id)]); return (o.upds && o.upds.waitrose) || ((o.prices.waitrose || 0) > 0 ? o.upd : ''); };
const older = id => { const d = wDate(id); return !d || dval(d) < dval(D); };
function ifOlder(id, price, note) {
  if (older(id)) { setPrice(id, 'waitrose', price, D, WR + ': ' + note); console.log('set', id, price); }
  else { addNote(id, WR + ': ' + note + ' [not applied, row has a newer Waitrose price]'); console.log('kept newer', id); }
}
ifOlder(8090, 3.00, 'INNOCENT JUICE 3.00 x2');
ifOlder(7611, 1.57, 'ESS CUP MROOMS 400G 1.57 (row was 1.35)');
ifOlder(7720, 1.45, 'SILVER SPOON GRA SGR 1.45 (row was 1.25; 1kg assumed)');
ifOlder(5802, 2.27, 'PAMPERS 99% WATER 2.27 (60 wipes assumed)');
ifOlder(2641, 1.65, 'JDAIRY FAT RED MILK 1.65 x4');
const NEW = [
 ['Tassimo Kenco Colombian Coffee Pods (size not confirmed)', '🥤 Drinks', '☕', 6.56, 'TASSMO KNCO COL PODS 6.56 x3 (Tassimo 3 for 13.00 deal, regular price stored)'],
 ['Biscoff Ice Cream Sticks (size not confirmed)', '🧊 Frozen', '🍦', 2.48, 'BISCOFF I/CRM STICKS 2.48'],
 ['Cadbury Milk Chocolate Ice Cream Sticks (size not confirmed)', '🧊 Frozen', '🍦', 2.75, 'CADBURY MILK STICKS 2.75'],
 ['Cadbury Fudge Bar (single)', '🍫 Confectionery', '🍫', 1.00, 'CADBURY FUDGE 1.00 x2'],
 ['Cadbury Freddo (single bar)', '🍫 Confectionery', '🍫', 1.00, 'CADBURY FREDDO 1.00'],
 ['Mars 4 Pack (size not confirmed)', '🍫 Confectionery', '🍫', 2.59, 'MARS 4 PACK 2.59'],
 ['Cadbury Wispa (size not confirmed)', '🍫 Confectionery', '🍫', 2.85, 'CAD WISPA 2.85'],
 ['Cadbury Dairy Milk (size not confirmed)', '🍫 Confectionery', '🍫', 2.85, 'CAD DAIRY MILK 2.85'],
 ['KP Salted Peanuts (size not confirmed)', '🍿 Snacks', '🥜', 3.59, 'KP SALTED PEANUTS 3.59'],
 ['Elastoplast Water Resistant Plasters (size not confirmed)', '💊 Health & Beauty', '🩹', 3.58, 'ELASTOPLAST WATER 3.58'],
 ['Waitrose Essential Vanilla Ice Cream (size not confirmed)', '🧊 Frozen', '🍨', 2.09, 'WR ESS VAN ICE CREAM 2.09'],
 ['Happy Hens Free Range Breakfast Eggs Large (size not confirmed)', '🥛 Dairy & Eggs', '🥚', 2.90, 'H/H FR B/FAST EGGS L 2.90 x2 (H/H = Happy Hens assumed)'],
 ['Haagen-Dazs Caramel Collection (size not confirmed)', '🧊 Frozen', '🍨', 3.95, 'H-D CARAMEL COLLECTN 3.95'],
 ['Nuii Pistachio (size not confirmed)', '🧊 Frozen', '🍨', 4.97, 'NUII PISTACHIO 4.97'],
 ['Munch Bunch Fromage Frais (size not confirmed)', '🥛 Dairy & Eggs', '🥛', 2.44, 'MUNCH BUNCH F/FRAIS 2.44'],
];
let at = find(16032), id = 16033;
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + n[3] + ',iceland:0,alliance:0}, upd:"' + D + '"}, // ' + WR + ': ' + n[4]); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, next id', id);
