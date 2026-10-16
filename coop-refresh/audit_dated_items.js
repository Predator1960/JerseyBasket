// One-off (16 Oct 2026): twelve starter items showed one date for all six stores, but only the Co-op price can be
// checked against a store list. Co-op price confirmed/corrected from the Co-op list (dated 10 Oct); every other
// store becomes undated, so the app shows "Estimated price" for it.
const fs = require('fs');
const f = require('path').resolve(__dirname, '..') + '/src/App.jsx';
const lines = fs.readFileSync(f, 'utf8').split('\n');
const IDX = { coop: 0, morrisons: 1, ms: 2, waitrose: 3, iceland: 4, alliance: 5 };
const find = id => lines.findIndex(l => new RegExp('^\\s*\\{id:' + id + '[,\\s]').test(l));
function setStore(l, store, price) {
  const spm = l.match(/prices:sp\(([\d.]+),\[([^\]]*)\]\)/);
  if (spm) {
    const base = parseFloat(spm[1]); const arr = spm[2].split(',').map(s => s.trim()); while (arr.length < 6) arr.push('0');
    arr[IDX[store]] = (+(price - base).toFixed(2)).toString();
    return l.replace(spm[0], `prices:sp(${spm[1]},[${arr.join(',')}])`);
  }
  const re = new RegExp(store + ':[\\d.]+'); if (!re.test(l)) throw new Error('format ' + l);
  return l.replace(re, `${store}:${price}`);
}
// [id, new Co-op price or null (null = no clear Co-op equivalent), what it was checked against]
const A = [
  [9, 3.3, 'Co-op British 12 Medium Free Range Eggs'],
  [25, 1.4, 'Co-op British Milk Single Cream 300ml'],
  [75, 0.85, 'Co-op Tuna Flakes in Brine 145g (own brand; other stores are not like-for-like)'],
  [98, 1.4, 'Co-op Cauliflower'],
  [152, 1.0, 'Co-op Still Natural Mineral Water 2 Litre'],
  [184, 0.9, 'Co-op Italian Chopped Tomatoes 400g'],
  [307, 2.2, 'Co Op for Men Sensitive Shave Gel 200ml'],
  [399, 1.7, 'Co-op Thai Menu Coconut Milk 400ml'],
  [414, 1.7, 'Domestos Original Thick Bleach 750ml'],
  [425, null, 'no clear Co-op equivalent (list only has Ginsters)'],
  [463, 3.3, 'Birds Eye 2 Garlic & Herb Chicken Kievs 204g'],
  [510, null, 'not in any store list'],
];
for (const [id, coop, src] of A) {
  const i = find(id); if (i < 0) throw new Error('row ' + id);
  let l = lines[i];
  const before = (l.match(/id:(\d+),\s*name:"([^"]*)"/) || []).slice(1).join(' ');
  l = l.replace(/,\s*upds:\{[^}]*\}/, '');
  if (coop !== null) {
    l = setStore(l, 'coop', coop);
    l = /upd:"[^"]*"/.test(l) ? l.replace(/upd:"[^"]*"/, 'upd:"10 Oct"') : l;
    l = l.replace(/upd:"([^"]*)"/, 'upd:"$1", upds:{coop:"10 Oct"}');
  } else {
    l = l.replace(/upd:"([^"]*)"/, 'upd:"$1", upds:{}');
  }
  const note = 'audit 16 Oct: ' + (coop !== null ? `Co-op ${coop} checked against ${src}; other stores unverified (estimates)` : `all stores unverified (${src})`);
  l = /\/\/ /.test(l) ? l.replace(/\s*$/, '') + ' | ' + note : l.replace(/\s*$/, '') + ' // ' + note;
  lines[i] = l; console.log(before, '->', coop === null ? 'all estimates' : 'Co-op ' + coop);
}
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('written');
