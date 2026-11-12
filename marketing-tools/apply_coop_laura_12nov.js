// Co-op Millennium Park receipt 12 Nov 12:06 (Laura, catalogue only, not competition): 82 items, total sold 177.49, 66 lines.
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
const D = '12 Nov', CO = 'Co-op branch: Millennium Park (Laura receipt 12 Nov 12:06)';
const same = [[4632,'Pringl Salt&Vinegar 2 x 2.65'],[5012,'Cp Basmati Mcrw Rice 2 x 1.00; members 0.80 each'],[8562,'Gvscon Double Action'],[9641,'Andrx Surme Qilt'],[5198,'Domes Rimbio Lime'],[3802,'B.E Chicken Dippers'],[8117,'2 Crispy Chick Grill'],[3815,'Crispy French Fries'],[3557,'Cp Garlic Baguette'],[8025,'Haygndaz Sltd Caramel'],[2575,'Bkrs Sml Dg Beef Veg'],[1337,'Mr K Chrry Bkewlls'],[9615,'Cp Mince Pies'],[5646,'7Up Zero 8Pk'],[8041,'Coca-colazerosugar'],[12838,'Fnta Or Z 8X330ml'],[3157,'Cp Carrots'],[891,'Olde Oak Hot Dogs'],[897,'Hz Spghti Blgnse'],[3158,'Cp Onions; members 0.90 (seen 12 Nov, expiry date unknown)'],[15956,'Cp Frsh Sgl Crm'],[2936,'Cp Strwb Cheseck'],[12159,'Yorkie Duo'],[915,'Kitkat Chnk Peanut B'],[12183,'Cad Flake'],[3721,'Cp Lrg Trtila Wrap'],[12349,'Kinder Bueno White 3'],[776,'Bakers Sizzlers Bacn'],[4560,'Cdm Daim # 2.50 (120g row)'],[4929,'Ptks Krma Past Pot'],[7658,'Cp Fb Still 2Ltr'],[4540,'Glxy Rpp S4p 120G'],[4650,'Co-op Sltd Peanuts'],[919,'Cp Closed Cups'],[15954,'Fr Roast Mp 3X22.5G'],[8560,'Fresh Fingers Rolls'],[2571,'Cp Grlc Criandr Naan'],[9654,'Warb Wht/W.Meal; members 1.50 (seen 12 Nov, expiry date unknown)'],[10609,'Cp Salted Btr 250G'],[9667,'Ginsters Bf & Al'],[425,'Cornish Pasty'],[8039,'Cp Unsmoked Bacon Uk; members 2.45 (seen 12 Nov, expiry date unknown)'],[2725,'Cp Naw Breaded Ham 2 x 2.80'],[8076,'Cp Crs Ps 300G (crispy pancakes assumed); members 2.10 (seen 12 Nov, expiry date unknown)'],[3465,'Cp Garlic Kiev 260G'],[1812,'Richm 8 Thck Sausage'],[3523,'Cp Chk & Bac Psta Bk'],[3629,'Cp Beef Stir Fry'],[3311,'Brit Dicd Chick Br; members 4.75 (seen 12 Nov, expiry date unknown)'],[2904,'Cp Mozz&Ched Mx Grtd'],[3386,'Cp F/Rnge Eggs'],[912,'Muller Cr Cnr Bn Ch 4 x 1.05 (buy any 4 for 2.10 deal)'],[3359,'Cp F/T Bananas 6 x 0.26'],[3354,'Cp Icebg Ltc Ea.; members 1.15 (seen 12 Nov, expiry date unknown)']];
same.forEach(([id, n]) => { const o = evalRow(lines[find(id)]); setPrice(id, 'coop', o.prices.coop, D, CO + ': ' + n + ' (price matched)'); });
setPrice(15958, 'coop', 1.35, D, CO + ': Lczade O Pnk Lmnde 1.35 (was 1.30)');
addNote(11311, CO + ': Wotsit C Cheese 140G 1.94 on the receipt (row says 2.65, no deal shown), not changed');
addNote(4561, CO + ': Cad Crunch 4Pk 1.84 on the receipt (row says 2.80), not changed');
const NEW = [
 ['Ready Brek Original (size not confirmed)', '🥣 Cereals', '🥣', 1.58, 'Ready Brek 1.58 (the 450g row is 2.80, so probably a smaller pack)'],
 ['Td Veg Long Grain Rice (brand and size not confirmed)', '🍝 Pantry', '🍚', 1.05, 'Td Vg Long Grin Ric 2 x 1.05 (Buy any 4 for 2.10 deal possible)'],
 ['McCain Home Chips (size not confirmed)', '🧊 Frozen', '🍟', 3.90, 'Mccain Hme Chps Cs 3.90'],
 ['Sure Anti-perspirant Active Dry (size not confirmed)', '🧴 Toiletries', '🧴', 2.10, 'Sure Ap Act Dry 2.10'],
 ['Tiger Tiger Coconut Milk (size not confirmed)', '🍝 Pantry', '🥥', 1.35, 'Tger Tger Cocont Mlk 1.35'],
 ['Robinsons Double Concentrate Orange & Pineapple (size not confirmed)', '🥤 Drinks', '🥤', 2.10, 'Robinsons Dc O&P 2.10'],
 ['Maynards Bassetts Liquorice Allsorts (size not confirmed)', '🍫 Confectionery', '🍬', 1.05, 'Maynrds Lqrc Allsrts 1.05'],
 ['McVitie\'s Milk Chocolate (size not confirmed)', '🍪 Snacks', '🍪', 2.10, 'Mcvities Milk Choc 2.10'],
 ['Walkers Quavers Cheese (size not confirmed)', '🍿 Snacks', '🧀', 1.60, 'Wlkr Quvr Cheese 1.60'],
 ['Cadbury Crunchie 4 Pack (size not confirmed)', '🍫 Confectionery', '🍫', 1.84, 'Cad Crunch 4Pk 1.84 (row 4561 says 2.80)'],
 ['Co-op Hot Crunch Mini Fillets (name from receipt abbreviation, size not confirmed)', '🧊 Frozen', '🍗', 4.72, 'Cp Ht Chrnch Mni Flt 4.72; members 4.20 (seen 12 Nov, expiry date unknown)'],
 ['Co-op British 20% Fat Beef Mince (size not confirmed)', '🥩 Meat & Fish', '🥩', 4.50, 'Cp Brtsh 20% Mnce 4.50'],
];
let at = find(18243), id = 18244;
const ids = [];
NEW.forEach(n => { lines.splice(++at, 0, '  {id:' + id + ', name:' + JSON.stringify(n[0]) + ', cat:' + JSON.stringify(n[1]) + ', icon:' + JSON.stringify(n[2]) + ', prices:{coop:' + n[3] + ',morrisons:0,ms:0,waitrose:0,iceland:0,alliance:0}, upd:"' + D + '"}, // ' + CO + ': ' + n[4]); ids.push(id); id++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done, new ids', ids[0], '-', ids[ids.length - 1]);
