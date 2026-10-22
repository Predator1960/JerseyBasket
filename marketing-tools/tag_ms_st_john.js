// Tag M&S prices dated 14 Sep 2026 or later as "M&S branch: St John" (code comment), except King Street (2 Oct) and Centre Point (15 Oct) receipts.
//   node marketing-tools/tag_ms_st_john.js          -> list only
//   node marketing-tools/tag_ms_st_john.js --apply
const fs = require('fs'), f = require('path').resolve(__dirname, '..') + '/src/App.jsx';
const text = fs.readFileSync(f, 'utf8');
const sp = text.match(/const sp = \(base,\[c,m,ms2,w,i,a=0\]\) => \(\{[\s\S]*?\}\);/)[0];
const st = text.indexOf('const BASE_PRODUCTS = ['), en = text.indexOf('\n];', st);
const P = new Function(sp + '\n' + text.slice(st, en + 3) + '\nreturn BASE_PRODUCTS;')();
const MON = { Sep: 9, Oct: 10, Nov: 11 }, day = d => { const m = String(d || '').match(/^(\d+)\s+(\w+)/); return m && MON[m[2]] ? MON[m[2]] * 100 + +m[1] : 0; };
const CENTRE_POINT = new Set([15833, 15834]);
// Branch not recoverable from the data: 29 Sep shopper-submitted receipt (9630-9635) and the 30 Sep - 5 Oct block that mixes King St and St Johns (9670-9677)
const UNSURE = new Set([9630, 9631, 9632, 9633, 9634, 9635, 9670, 9671, 9672, 9673, 9674, 9675, 9676, 9677]);
const EXTRA = new Set([25]); // Single Cream (300ml): M&S 1.80 from the 14 Sep St Johns receipt
const pick = [], skipped = [];
P.forEach(p => {
  if (!(p.prices.ms > 0)) return;
  const d = day(p.upds ? p.upds.ms : p.upd); if (d < 914) return;
  if (d === 1002 || CENTRE_POINT.has(p.id) || UNSURE.has(p.id)) { skipped.push(p); return; }
  pick.push(p);
});
P.filter(p => EXTRA.has(p.id)).forEach(p => pick.push(p));
console.log('to tag:', pick.length, '| left untagged (King St / Centre Point / branch unclear):', skipped.length);
pick.forEach(p => console.log('  ', p.id, p.name.slice(0, 55), 'M&S', p.prices.ms, p.upds ? p.upds.ms : p.upd));
skipped.forEach(p => console.log('  skip', p.id, p.name.slice(0, 55), p.upds ? p.upds.ms : p.upd));
if (process.argv.includes('--apply')) {
  const ids = new Set(pick.map(p => p.id)); let n = 0;
  const out = text.split('\n').map(l => {
    const m = l.match(/^\s*\{id:(\d+)[,\s]/); if (!m || !ids.has(+m[1]) || /M&S branch/.test(l)) return l;
    n++; return l.replace(/\s+$/, '') + (/\/\//.test(l) ? ' | M&S branch: St John' : ' // M&S branch: St John');
  });
  fs.writeFileSync(f, out.join('\n'), 'utf8'); console.log('tagged', n);
}
