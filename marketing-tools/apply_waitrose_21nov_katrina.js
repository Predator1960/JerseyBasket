// Katrina B: Waitrose St Saviour 21 Nov 14:48 (23 items; crackers 8.00 not groceries; 22 lines x2 = 44 pts)
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
const D = '21 Nov';
const CP = 'Waitrose branch: St Saviour (Katrina receipt 21 Nov 14:48)';
const P = (id, price, txt) => setPrice(id, 'waitrose', price, D, CP + ': ' + txt);
P(17814, 6.96, 'THE CHOC BOX 6.96');
P(17821, 2.24, 'WR HOT CHOC BOMBE 2.24');
P(849, 3.43, 'WR SPECIALITY FIGS 3.43');
P(14617, 2.96, 'SPROUT BROCCOLI P/P 2.96');
P(17858, 3.22, 'WR PC MOZ STICKS 2 x 3.22');
P(2641, 1.65, 'JDAIRY FAT RED MILK 2 x 1.65');
P(15933, 2.09, 'WR ESS STILL WATER 2.09');
P(15934, 2.73, 'J20 APPLE & RASP CAN 2.73');
P(15977, 2.45, 'DOR ORIGINAL 5PK 2.45');
P(15976, 2.45, 'DORITOS CHEESE 5PK 2.45');
P(4664, 2.55, 'SUN BITES SWT CHILLI 2 x 2.55');
const NEWROWS = [
  ['Haribo Starmix (as printed HARIBO STARMIX, size not confirmed)', '🍫 Confectionery', '🍬', 1.25, 'HARIBO STARMIX 1.25'],
  ['Pizza Express Dough Balls (as printed P/EXPRESS DOUGH BLS, size not confirmed)', '🌡️ Chilled', '🍕', 2.53, 'P/EXPRESS DOUGH BLS 2.53'],
  ['Waitrose No.1 Peppered Beef (as printed NO.1 PEPPERED BEEF, size not confirmed)', '🥩 Meat & Fish', '🥩', 4.00, 'NO.1 PEPPERED BEEF 4.00'],
  ['Waitrose No.1 Blossom Ham (as printed NO.1 BLOSSOM HAM, size not confirmed)', '🥩 Meat & Fish', '🍖', 4.00, 'NO.1 BLOSSOM HAM 4.00'],
  ['Waitrose Essential Glass & Window Spray (as printed ESS GLASS/WINDOW SPR, size not confirmed)', '🧹 Household', '🧴', 0.90, 'ESS GLASS/WINDOW SPR 0.90'],
  ['Waitrose Essential Sensitive Soap Bars (as printed WR ESS SENS SOAP BRS, pack size not confirmed)', '💊 Health & Beauty', '🧼', 2.09, 'WR ESS SENS SOAP BRS 2.09'],
];
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, price, note]) => { lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{coop:0,morrisons:0,ms:0,waitrose:' + price + ',iceland:0,alliance:0}, upd:"21 Nov"}, // ' + CP + ': ' + note); console.log(nid, note); nid++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
