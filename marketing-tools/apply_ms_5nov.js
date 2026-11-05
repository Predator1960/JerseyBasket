// M&S School Road St Clement receipt 5 Nov (competition entry, Mary C).
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

const MR = 'M&S branch: School Road, St Clement (receipt 5 Nov', D = '5 Nov';
setPrice(454, 'ms', 1.65, D, MR + ' "JE Whole Milk" 1.65, matches)');
setPrice(3947, 'ms', 1.90, D, MR + ' "UHT Whole Mil" 1.90, barcode 5018359900686, 1L inferred)');
const k = find(15896);
const row = (id, name, cat, icon, price, rl, code, note) => '  {id:' + id + ', name:"' + name + '", cat:"' + cat + '", icon:"' + icon + '", prices:{coop:0,morrisons:0,ms:' + price + ',waitrose:0,iceland:0,alliance:0}, upd:"' + D + '"}, // ' + MR + ' "' + rl + '" ' + price.toFixed(2) + ', product code ' + code + (note ? ', ' + note : '') + ')';
lines.splice(k + 1, 0,
  row(15897, 'M&S Special Reserve Port Decanter 50cl', '🍷 Wine & Beer', '🍷', 12.25, '50CL PORT DEC', '00687041', 'Christmas item'),
  row(15898, 'M&S Le Froglet Shiraz 75cl', '🍷 Wine & Beer', '🍷', 8.00, 'Froglet Rouge', '29360130', ''),
  row(15899, 'M&S Chocolate Liqueurs Selection 155g', '🍫 Confectionery', '🍫', 14.75, 'MRKS CHOC LIQ', '29519514', 'Christmas item'),
  row(15900, 'M&S 4 Mince Pies', '🍞 Bread & Bakery', '🥧', 4.30, '4PK MINCE PIE', '29551927', 'Christmas item; exact variant and size not confirmed'),
  row(15901, 'M&S Chow Mein Noodle Box 300g', '🍝 Pantry', '🍜', 3.10, 'CHOW MEIN NOD', '29378227', ''),
  row(15902, 'M&S Sweet & Sour Noodle Box 300g', '🍝 Pantry', '🍜', 3.10, 'SWEET SUR NOD', '29378159', ''),
  row(15903, 'M&S Hoisin Duck Noodles', '🥗 Deli & Salads', '🍜', 7.00, 'HOISIN DUCK N', '00079112', 'size not confirmed, 350g or 400g'),
  row(15904, 'M&S Butter Beans in Water 430g', '🍝 Pantry', '🫘', 0.75, 'BUTTER BEANS', '29499229', ''),
  row(15905, 'M&S Coarsely Chopped Ham 198g', '🥩 Meat & Fish', '🥩', 2.45, 'CHOPPED HAM', '00788847', 'bought twice'),
  row(15906, 'M&S Chunked N\' Loaded Sticky Apple Cookie 103g', '🍞 Bread & Bakery', '🍪', 2.45, 'Apple Cookie', '29539918', ''),
  row(15907, 'M&S Belgian Milk Chocolate Coated Crispy Chilli Peanuts 150g', '🥨 Snacks & Treats', '🥜', 3.70, 'Choc Ctd Pnut', '29517145', ''),
  row(15908, 'M&S 70% Dark Chocolate Cocoa Dusted Almonds 100g', '🥨 Snacks & Treats', '🥜', 4.65, 'CHOC ALMND 10', '29397839', ''),
  row(15909, 'M&S British Beef Short Ribs', '🥩 Meat & Fish', '🥩', 10.36, 'BRTH BF SHRT', '29528646', 'sold by weight, price is for this pack; size not confirmed'));
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
