// Mary C (app 23 Nov 14:04): M&S St Helier (King Street) 23 Nov 13:44 (8 lines, all count)
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
const M = 'M&S branch: St Helier King Street (Mary C receipt 23 Nov 13:44)';
const NEWROWS = [
  ['M&S Pitted Queen Olives (as printed PITTED QUEEN, size not confirmed)', '🍝 Pantry', '🫒', 2.95, 'PITTED QUEEN 2.95 (code 29073900)'],
  ['M&S Custard Cream Spread (as printed CSTRD CRM SPR, size not confirmed)', '🍝 Pantry', '🍯', 3.10, 'CSTRD CRM SPR 3.10 (code 29925157)'],
  ['M&S Sliced Black Olives (as printed SLICED BLACK, size not confirmed)', '🍝 Pantry', '🫒', 1.60, 'SLICED BLACK 1.60 (code 29073894)'],
  ['M&S Sprinkle Doughnut (as printed SPRINKLE DONU, size not confirmed)', '🍞 Bread & Bakery', '🍩', 1.25, 'SPRINKLE DONU 1.25 (code 00572927)'],
  ['M&S Pecorino Romano (as printed PECORINO ROMA, size not confirmed)', '🥛 Dairy & Eggs', '🧀', 5.25, 'PECORINO ROMA 5.25 (code 29293452)'],
  ['M&S Green Basil Pesto (as printed GRN BASIL PES, size not confirmed)', '🍝 Pantry', '🍝', 2.70, 'GRN BASIL PES 2.70 (code 00744607)'],
  ['M&S Cornish Butter (as printed CORNISH BUTTE, size not confirmed)', '🥛 Dairy & Eggs', '🧈', 4.45, 'CORNISH BUTTE 4.45 (code 00042710)'],
  ['M&S Puff Pastry (as printed PUFF PASTRY M, size not confirmed)', '🌡️ Chilled', '🥐', 3.10, 'PUFF PASTRY M 3.10 (code 00634748)'],
];
const ids = lines.map(l => (l.match(/^\s*\{id:(\d+)/) || [])[1]).filter(Boolean).map(Number);
let nid = Math.max(...ids) + 1, at = find(Math.max(...ids));
NEWROWS.forEach(([name, cat, icon, price, note]) => { const p = S.map(s => s + ':' + (s === 'ms' ? price : 0)).join(','); lines.splice(++at, 0, '  {id:' + nid + ', name:' + JSON.stringify(name) + ', cat:' + JSON.stringify(cat) + ', icon:' + JSON.stringify(icon) + ', prices:{' + p + '}, upd:"23 Nov"}, // ' + M + ': ' + note); console.log(nid, note); nid++; });
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('done');
