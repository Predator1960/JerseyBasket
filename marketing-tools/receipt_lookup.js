// Matches receipt lines to catalogue rows so nobody has to be asked about sizes.
//   node marketing-tools/receipt_lookup.js <store> "TILL TEXT|price" ["TILL TEXT|price" ...]
// 1) exact hit in receipt_glossary.csv  2) fuzzy name + price match in that store's prices  3) otherwise: UNRESOLVED
// For UNRESOLVED lines: search the web (store product pages / Ocado), add the row with a "size not confirmed" comment,
// then append the till text to receipt_glossary.csv so the next receipt resolves instantly.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const [store, ...lineArgs] = process.argv.slice(2);
if (!store || !lineArgs.length) { console.error('usage: node receipt_lookup.js <Co-op|Waitrose|M&S|Morrisons|Iceland|Alliance> "TEXT|price" ...'); process.exit(1); }
const key = { 'co-op': 'coop', coop: 'coop', waitrose: 'waitrose', 'm&s': 'ms', ms: 'ms', morrisons: 'morrisons', iceland: 'iceland', alliance: 'alliance' }[store.toLowerCase()];
const text = fs.readFileSync(path.join(ROOT, 'src/App.jsx'), 'utf8');
const spDef = text.match(/const sp = \(base,\[c,m,ms2,w,i,a=0\]\) => \(\{[\s\S]*?\}\);/)[0];
const rows = [];
for (const l of text.split('\n')) { if (!/^\s*\{id:\d+/.test(l)) continue; try { rows.push(new Function(spDef + '\nreturn ' + l.replace(/^\s*/, '').replace(/\}\s*,?\s*(\/\/.*)?$/, '}') + ';')()); } catch (e) {} }
const byId = new Map(rows.map(r => [r.id, r]));
const glossary = fs.readFileSync(path.join(__dirname, 'receipt_glossary.csv'), 'utf8').split(/\r?\n/).slice(1).filter(Boolean).map(l => { const [s, t, id, ...n] = l.split(','); return { s: s.toLowerCase(), t: t.toUpperCase(), id: +id, n: n.join(',') }; });
const ABBR = { WR: 'waitrose', CP: 'co-op', FRZ: 'frozen', ESS: 'essential', 'B/EYE': 'birds eye', SCOT: 'scottish', AMB: 'amber', CARR: 'carrot', TOMS: 'tomatoes', POTS: 'potatoes', BTR: 'butter', CHK: 'chicken', STFNG: 'stuffing', SW: 'sandwich', 'D/F': 'deep fill', IRR: 'irresistible', CH: 'chocolate', TR: 'triple', DNUTS: 'doughnuts', VNGR: 'vinegar', MLT: 'malt', DILT: 'distilled', SRSNS: 'sarsons', PBC: 'peanut butter cups', VIT: 'vitamin', QRTR: 'quarter', MASHNG: 'mashing' };
const toks = s => s.toUpperCase().split(/[^A-Z0-9/&%']+/).filter(Boolean).map(w => (ABBR[w] || w.toLowerCase())).join(' ').split(' ').filter(w => w.length > 1);
for (const arg of lineArgs) {
  const [t, p] = arg.split('|'); const price = parseFloat(p);
  const g = glossary.find(x => x.s === store.toLowerCase() && x.t === t.toUpperCase());
  if (g) { const r = byId.get(g.id); console.log(`GLOSSARY  ${t} -> ${g.id} ${r ? r.name : '(missing row)'} | store price ${r ? r.prices[key] : '?'} | receipt ${price}${g.n ? ' | ' + g.n : ''}`); continue; }
  const q = toks(t);
  const cand = rows.map(r => { const n = r.name.toLowerCase(); const hit = q.filter(w => n.includes(w) || n.includes(w.slice(0, 4))).length; const pm = Math.abs((r.prices[key] || 0) - price) < 0.005; return { r, hit, s: hit / Math.max(1, q.length) + (pm ? 0.6 : 0) + ((r.prices[key] || 0) > 0 ? 0.1 : 0) }; })
    .filter(c => c.hit > 0 && c.s >= 0.6).sort((a, b) => b.s - a.s).slice(0, 4);
  if (!cand.length) console.log(`UNRESOLVED ${t} ${price}  -> search the web, add row with "size not confirmed", then add to receipt_glossary.csv`);
  else { console.log(`CANDIDATES ${t} ${price}`); cand.forEach(c => console.log(`   ${c.r.id} | ${c.r.name} | ${store} ${c.r.prices[key]} | score ${c.s.toFixed(2)}`)); }
}
