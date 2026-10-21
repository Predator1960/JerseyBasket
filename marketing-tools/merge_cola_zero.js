// Clean up duplicate Coca-Cola Zero Sugar rows (old starter/older-import rows next to the current Co-op list rows).
const fs = require('fs');
const f = require('path').resolve(__dirname, '..') + '/src/App.jsx';
let text = fs.readFileSync(f, 'utf8');
const lines = text.split('\n');
const find = id => lines.findIndex(l => new RegExp('^\\s*\\{id:' + id + '[,\\s]').test(l));
const IDX = { coop: 0, morrisons: 1, ms: 2, waitrose: 3, iceland: 4, alliance: 5 };
const STORES = Object.keys(IDX);
function evalRow(l) {
  const spm = text.match(/const sp = \(base,\[c,m,ms2,w,i,a=0\]\) => \(\{[\s\S]*?\}\);/)[0];
  return new Function(`${spm}\nreturn ${l.trim().replace(/,\s*(\/\/.*)?$/, '').replace(/\/\/.*$/, '')};`)();
}
function setStore(l, store, price) {
  const spm = l.match(/prices:sp\(([\d.]+),\[([^\]]*)\]\)/);
  if (spm) { const base = parseFloat(spm[1]); const arr = spm[2].split(',').map(s => s.trim()); while (arr.length < 6) arr.push('0'); arr[IDX[store]] = (+(price - base).toFixed(2)).toString(); return l.replace(spm[0], `prices:sp(${spm[1]},[${arr.join(',')}])`); }
  const re = new RegExp(store + ':[\\d.]+'); if (!re.test(l)) throw new Error('format ' + l); return l.replace(re, `${store}:${price}`);
}
const datesOf = p => { const d = {}; STORES.filter(s => p.prices[s] > 0).forEach(s => { const v = p.upds ? p.upds[s] : p.upd; if (v) d[s] = v; }); return d; };
const note = (l, n) => (/\/\/ /.test(l) ? l.replace(/\s*$/, '') + ' | ' + n : l.replace(/\s*$/, '') + ' // ' + n);
const expect = (id, re) => { const i = find(id); if (i < 0 || !re.test(lines[i])) throw new Error('row ' + id + ' not as expected: ' + (i < 0 ? 'missing' : lines[i].slice(0, 100))); return i; };

// delete a row that only duplicates another row
const del = (id, re) => { const i = expect(id, re); lines.splice(i, 1); console.log('deleted', id); };
// move one store's price (and its date) from a duplicate row onto the row we keep, then delete the duplicate
function mergeInto(keepId, dropId, store, keepRe, dropRe) {
  const ki = expect(keepId, keepRe), di = expect(dropId, dropRe);
  const keep = evalRow(lines[ki]), drop = evalRow(lines[di]);
  if (!(drop.prices[store] > 0)) throw new Error('nothing to move');
  if (keep.prices[store] > 0) throw new Error('keep row already has ' + store);
  const dates = datesOf(keep); const dd = datesOf(drop); if (dd[store]) dates[store] = dd[store];
  let l = setStore(lines[ki], store, drop.prices[store]);
  l = l.replace(/,\s*upds:\{[^}]*\}/, '');
  const txt = STORES.filter(s => dates[s]).map(s => `${s}:"${dates[s]}"`).join(',');
  l = l.replace(/upd:"([^"]*)"/, `upd:"$1", upds:{${txt}}`);
  lines[ki] = note(l, `${store} price moved here from duplicate row ${dropId}`);
  lines.splice(find(dropId), 1); console.log(`merged ${dropId} -> ${keepId} (${store})`);
}

// 18 pack: keep the current Co-op row (9.50); drop the old starter row and the Jul import
del(890, /Coca-Cola Zero Sugar \(18 cans\)/);
del(6563, /Coca-Cola Zero Sugar 18 x 330ml"/);
// 12 pack: keep the Co-op list row, re-date it from the receipts (6.85 confirmed 9 and 15 Oct); drop the starter row
{ const i = expect(11608, /Coca-Cola Zero Sugar 12 x 330ml Cans/); lines[i] = note(lines[i].replace(/upd:"[^"]*"/, 'upd:"15 Oct"'), 'Co-op receipts 9 and 15 Oct confirm 6.85'); }
del(2568, /Coca-Cola Zero Sugar \(12 cans\)/);
// 8 pack: keep the row that also carries Iceland and Alliance; drop the Co-op-only one
del(5741, /Coca-Cola Zero Sugar 8 x 330ml Cans 8X330ML/);
// 4 pack: keep the current Co-op row (3.99); drop the starter row and the Jul row (its Waitrose 3.75 was an old estimate)
del(2567, /Coca-Cola Zero Sugar \(4 cans\)/);
del(5752, /Coca-Cola Zero Sugar 4 x 330ml 4X330ML/);
// 24 pack: Co-op price onto the row that already has Iceland and Alliance
mergeInto(12842, 6574, 'coop', /Coca-Cola Zero Sugar Multipack Cans 24 x 330ml/, /Coca-Cola Zero Sugar 24 x 330ml Cans/);
// 2L and 2L Cherry: same idea
mergeInto(1663, 5670, 'coop', /Coca-Cola Zero Sugar 2L"/, /Coca-Cola Zero Sugar 2L Bottle 2LTR/);
mergeInto(12833, 11926, 'coop', /Coca-Cola Zero Sugar Cherry 2 L"/, /Coca-Cola Zero Sugar Cherry 2L Bottle/);
// 1.25L: old Jul row vs current Co-op list row
del(5707, /Coca-Cola Zero Sugar 1\.25L 1\.25LTR/);
// 150ml: keep the multi-store row, drop the Co-op-only duplicate
del(10453, /Coca-Cola Zero Sugar 150ml Can"/);

fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
