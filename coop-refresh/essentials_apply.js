// One-off (10 Oct 2026): re-check the 25 "Weekly Essentials" legacy items against the Co-op / Iceland feeds.
// node coop-refresh/essentials_apply.js [--apply]
const fs = require('fs');
const ROOT = require('path').resolve(__dirname, '..') + '/';
const APPLY = process.argv.includes('--apply');
const UPD = '10 Oct';
const IDX = { coop: 0, morrisons: 1, ms: 2, waitrose: 3, iceland: 4, alliance: 5 };
// [id, store, new price, matched feed product]
const U = [
  [8, 'coop', 2.1, 'Co-op 6 Free Range British Medium Eggs'],
  [16, 'coop', 2.2, 'Co-op British Milk Salted Butter 250g'],
  [16, 'iceland', 2.5, 'Jersey Butter Salted 250g'],
  [10, 'coop', 3.7, 'Co-op Mature Cheddar 400g'],
  [10, 'iceland', 4.25, 'Iceland Mature White Cheddar 400g'],
  [19, 'coop', 1.7, 'Co-op Greek Style Natural Yogurt 500g'],
  [29, 'coop', 1.75, 'Warburtons Original Toastie White Loaf 800g'],
  [29, 'iceland', 2.1, 'Warburtons Medium Soft White 800g'],
  [52, 'coop', 5.6, 'Co-op 15% Fat Beef Mince 500g'],
  [63, 'coop', 2.89, "Co-op Butcher's Choice 8 British Pork Sausages 454g"],
  [63, 'iceland', 2.95, 'Iceland 8 Pork Sausages'],
  [105, 'iceland', 1.35, 'Iceland Carrots 1kg'],
  [112, 'coop', 1.6, 'Jsy Tomatoes 6s'],
  [180, 'coop', 0.95, 'Co-op Italian Menu Penne 500g'],
  [196, 'coop', 2.45, 'Co-op Basmati Rice 1kg'],
  [196, 'iceland', 2.65, 'Tilda Everyday Basmati Rice 1kg'],
  [190, 'coop', 0.7, 'Co-op Baked Beans in Tomato Sauce 400g'],
  [190, 'iceland', 1.25, 'Branston Baked Beans 410g'],
  [164, 'coop', 1.8, 'Co-op Fairtrade 99 Blend 80 Tea Bags 250g'],
  [162, 'coop', 5.75, 'Co-op Fairtrade Gold Roast Instant Coffee 200g'],
  [148, 'coop', 2.55, 'Co-op Smooth Orange Juice 1L'],
  [201, 'coop', 1.65, 'Co-op Corn Flakes 500g'],
  [207, 'coop', 1.35, 'Tate & Lyle Granulated Sugar 1kg'],
  [207, 'iceland', 1.6, 'Whitworths Granulated Sugar 1kg'],
  [107, 'coop', 1.1, 'Co-op Brown Onions 3S'],
  [107, 'iceland', 1.35, 'Brown Onion 3pk'],
  [195, 'coop', 2.55, 'Co-op Vegetable Oil 1 Litre'],
  [195, 'iceland', 3.35, 'Pura Vegetable Oil 1L'],
  [491, 'iceland', 1.65, 'Little Duck 4 Luxe Toilet Tissue'],
];
let text = fs.readFileSync(ROOT + 'src/App.jsx', 'utf8');
if (text.includes('\r')) throw new Error('CRLF');
const lines = text.split('\n');
const idLine = new Map(); lines.forEach((l, i) => { const m = l.match(/^\s*\{id:(\d+)/); if (m) idLine.set(+m[1], i); });
const spMatch = text.match(/const sp = \(base,\[c,m,ms2,w,i,a=0\]\) => \(\{[\s\S]*?\}\);/);
const start = text.indexOf('const BASE_PRODUCTS = ['), endRel = text.indexOf('\n];', start);
const P = new Function(`${spMatch[0]}\n${text.slice(start, endRel + 3)}\nreturn BASE_PRODUCTS;`)();
function setStore(l, store, price) {
  const spm = l.match(/prices:sp\(([\d.]+),\[([^\]]*)\]\)/);
  if (spm) {
    const base = parseFloat(spm[1]); const arr = spm[2].split(',').map(s => s.trim()); while (arr.length < 6) arr.push('0');
    arr[IDX[store]] = (+(price - base).toFixed(2)).toString();
    return l.replace(spm[0], `prices:sp(${spm[1]},[${arr.join(',')}])`);
  }
  return l.replace(new RegExp(store + ':[\\d.]+'), `${store}:${price}`);
}
const stamp = l => /upd:"[^"]*"/.test(l) ? l.replace(/upd:"[^"]*"/, `upd:"${UPD}"`) : l.replace(/\}(,?)(\s*(\/\/.*)?)$/, `, upd:"${UPD}"}$1$2`);
const byId = {};
U.forEach(u => (byId[u[0]] = byId[u[0]] || []).push(u));
for (const id in byId) {
  const i = idLine.get(+id), p = P.find(x => x.id === +id); let l = lines[i];
  const notes = [];
  for (const [, store, price, src] of byId[id]) {
    const cur = p.prices[store] || 0;
    console.log(`${id} ${p.name} ${store}: ${cur} -> ${price}   (${src})`);
    l = setStore(l, store, price); notes.push(`${store} re-checked vs ${src}`);
  }
  l = stamp(l);
  l = /\/\/ /.test(l) ? l + ' | ' + notes.join('; ') : l + ' // ' + notes.join('; ');
  lines[i] = l;
}
if (APPLY) { fs.writeFileSync(ROOT + 'src/App.jsx', lines.join('\n'), 'utf8'); console.log('written'); } else console.log('(dry run)');
