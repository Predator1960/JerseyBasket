// Lucy D Co-op Millennium Park 22 Nov 11:50 (A, 10 grocery lines; Mitchum deodorant skipped) and 13:00 (B, 12 grocery lines; Pampers wipes skipped); Katrina B Morrisons Five Oaks 22 Nov 14:38 (1 line)
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
const A = 'Co-op branch: Millennium Park (Lucy D receipt 22 Nov 11:50)';
const B = 'Co-op branch: Millennium Park (Lucy D receipt 22 Nov 13:00)';
const K = 'Morrisons branch: Five Oaks (Katrina B receipt 22 Nov 14:38)';
// A
setPrice(1250, 'coop', 2.00, '22 Nov', A + ': Warbs Farmhouse 2.00');
setPrice(3684, 'coop', 3.65, '22 Nov', A + ': Cp Sweet Pancakes 8S 3.65');
rewrite(3483, o => { o.prices.coop = 2.40; o.upd = '22 Nov'; if (o.oos) { o.oos = o.oos.filter(s => s !== 'coop'); if (!o.oos.length) delete o.oos; } }, A + ': Danone Oyks Bbry 4Pk 2.40 (was 3.40; back in stock)');
setPrice(2788, 'coop', 3.55, '22 Nov', A + ': Cp Irr Butter Mash 3.55');
setPrice(3933, 'coop', 1.59, '22 Nov', A + ': Cp Apricot Jam 1.59');
setPrice(2633, 'coop', 1.64, '22 Nov', A + ': Jersey Whole Milk 1.64');
setPrice(3334, 'coop', 3.15, '22 Nov', A + ': Co-op Green Grapes 3.15');
setPrice(2911, 'coop', 2.95, '22 Nov', A + ': Co-op Milano Salami 2.95');
setPrice(3359, 'coop', 0.26, '22 Nov', A + ': Cp F/T Bananas 0.26');
// B
setPrice(2922, 'coop', 1.90, '22 Nov', B + ': Dryl Snckrs Or 1.90 (was 1.85)');
setPrice(2678, 'coop', 1.65, '22 Nov', B + ': Cp Choc Flav Milk 1.65');
setPrice(5679, 'coop', 3.15, '22 Nov', B + ': Pepsi Max 3.15');
setPrice(2679, 'coop', 1.65, '22 Nov', B + ': Cp Strawb Flav Milk 1.65');
setPrice(9688, 'coop', 3.15, '22 Nov', B + ': R/Mnd Irsh Thn 3.15');
setPrice(9957, 'coop', 2.80, '22 Nov', B + ': Galtee Proc Cheddar 2.80');
setPrice(1750, 'coop', 2.50, '22 Nov', B + ': Werthers Original Ca 2.50');
setPrice(2641, 'coop', 1.64, '22 Nov', B + ': Jersey Green Fat R 1.64');
setPrice(2059, 'coop', 2.15, '22 Nov', B + ': Hz Crm/Tomato Sp 2.15');
addNote(16484, B + ': Lindt Advent Calndr 7.88 at the till (special offer; regular 9.00 kept)');
const NEWROWS = [
  ['CRF Rosette Slices (as printed CRF ROSETTO SLICES, size not confirmed)', '🥗 Deli & Salads', '🥗', 'coop', 2.40, A, 'Crf Rosetto Slices 2.40'],
  ['Chocolate Filled Brioche (as printed CHOC FILLED BRIOCHE, brand and size not confirmed)', '🍞 Bread & Bakery', '🥐', 'coop', 1.21, B, 'Choc Filled Brioche 1.21'],
  ['Robinsons Orange & Mango (as printed ROBINSONS ORNG&MNGO, size not confirmed)', '🥤 Drinks', '🥤', 'coop', 1.85, B, 'Robinsons Orng&Mngo 1.85'],
  ['Morrisons Sweet Popcorn (size not confirmed)', '🥨 Snacks & Treats', '🍿', 'morrisons', 1.50, K, 'MORRISONS POPCORN SWEET 1.50'],
];
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, store, price, src, note]) => { const p = S.map(s => s + ':' + (s === store ? price : 0)).join(','); lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{' + p + '}, upd:"22 Nov"}, // ' + src + ': ' + note); console.log(nid, note); nid++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
