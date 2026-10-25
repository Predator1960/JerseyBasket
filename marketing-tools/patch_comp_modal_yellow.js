// Replaces CompetitionModal with the yellow / dark green version, and adds "Only receipts dated 1 to 30 November count" to the Watch-this-space card.
const fs = require('fs'), path = require('path');
const f = path.resolve(__dirname, '..') + '/src/App.jsx';
let t = fs.readFileSync(f, 'utf8').replace(/\r/g, '');
const neu = fs.readFileSync(path.join(__dirname, 'comp-parts', 'modal_yellow.txt'), 'utf8').replace(/\r/g, '');
const s = t.indexOf('function CompetitionModal(');
if (s < 0) throw new Error('CompetitionModal not found');
const e = t.indexOf('\n}\n', s) + 3;
if (t.slice(s, e).includes('#14532d')) { console.log('modal already yellow'); } else { t = t.slice(0, s) + neu + t.slice(e); console.log('modal restyled'); }
// the modal no longer takes lightMode; drop it where rendered
const a = 'onEnter={()=>{ setShowCompetition(false); setShowSubmitPrice(true); }} lightMode={lightMode} data={compData}';
if (t.includes(a)) t = t.replace(a, () => 'onEnter={()=>{ setShowCompetition(false); setShowSubmitPrice(true); }} data={compData}');
// teaser card: say what counts
const old = '<b>Start saving your shopping receipts now</b>, and check back here for all the details.\n        </div>';
if (t.split(old).length === 2) t = t.replace(old, () => '<b>Start saving your shopping receipts now</b>, and check back here for all the details.<br/>\n          <span style={{ fontSize:13 }}>(Only receipts dated 1 to 30 November will count.)</span>\n        </div>');
else console.log('card line: anchor not found or already added');
fs.writeFileSync(f, t, 'utf8');
