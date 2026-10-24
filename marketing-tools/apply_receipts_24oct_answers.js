// Follow-up to apply_receipts_24oct.js: shopper's answers about the unclear Co-op / Waitrose receipt lines (24 Oct 2026).
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

const CO = 'Co-op Millennium Park receipt 24 Oct', WR = 'Waitrose St Helier receipt 24 Oct', D = '24 Oct';
setPrice(10410, 'coop', 1.05, D, CO + ': Muller Corner Sticky Toffee Pudding 1.05 (matches)');
setPrice(3303, 'coop', 6.50, D, CO + ': Cp Beef Steak Mince 2 @ 6.50 (matches)');
setPrice(10443, 'waitrose', 3.65, D, WR + ': CATHEDRAL LIGHTER 3.65 (350g per shopper)');
// lines that were cheaper than the regular price: treated as special offers, regular price kept
addNote(3736, CO + ': special offer 2 @ 2.89 (10 pack, per shopper); regular price unchanged; end date not printed');
addNote(11036, CO + ': Coca-Cola Zero 2 x 4 packs at 2.89 each, treated as a special offer; regular price unchanged; end date not printed');
addNote(9823, CO + ': Nf Frt Cocktail (little pots) 2.10, treated as a special offer; regular price unchanged; end date not printed');
addNote(4251, CO + ': McVitie\'s Dark Choc Digestives 266g 1.60, treated as a special offer; regular price unchanged; end date not printed');
addNote(5765, CO + ': Lucozade Zero Pink Lemonade 900ml 1.30, treated as a special offer; regular price unchanged; end date not printed');
// new rows
const j = find(15847) + 1;
const mk = (id, name, cat, icon, store, price, note, d) => rowText({ id, name, cat, icon, prices: Object.fromEntries(S.map(s => [s, s === store ? price : 0])), upd: d }) + ', // ' + note;
lines.splice(j, 0,
  mk(15848, 'Pepsi Max Cherry 4 Pack', '🥤 Drinks', '🥤', 'coop', 3.50, CO + ': Pepsi Max Cherry 3.50 (4 pack per shopper)', D),
  mk(15849, 'Mr Kipling Chocolate Orange Halloween Slices', '🍰 Cakes & Desserts', '🎃', 'coop', 2.20, CO + ': Mk Choc Orng Hlwn Sl 2.20 (pack size not printed)', D),
  mk(15850, 'Cadbury Twin Pot Buttons', '🍰 Cakes & Desserts', '🍫', 'coop', 1.05, CO + ': Cdbury Twnpt Btn 2 @ 1.05', D),
  mk(15851, 'Waitrose Essential Sunflower Oil 500ml', '🍝 Pantry', '🌻', 'waitrose', 1.51, WR + ': WR ESS SUNFLOWER OIL 1.51 (500ml per shopper)', D));
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
