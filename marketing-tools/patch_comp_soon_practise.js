// Adds "you can send receipts from now" + a button to the Watch-this-space card.
const fs = require('fs'), path = require('path');
const f = path.resolve(__dirname, '..') + '/src/App.jsx';
let t = fs.readFileSync(f, 'utf8').replace(/\r/g, '');
if (t.includes('onPractise')) { console.log('already patched'); process.exit(0); }
const swap = (a, b, label) => { const c = t.split(a).length - 1; if (c !== 1) throw new Error(`${label}: ${c} matches`); t = t.replace(a, () => b); };
swap('function CompSoonModal({ onClose }) {', 'function CompSoonModal({ onClose, onPractise }) {', 'signature');
swap('          <span style={{ fontSize:13 }}>(Only receipts dated 1 to 30 November will count.)</span>\n        </div>',
     '          <span style={{ fontSize:13 }}>(Only receipts dated 1 to 30 November will count.)</span>\n        </div>\n        <div style={{ fontSize:13,fontWeight:700,lineHeight:1.6,color:"#14532d",marginBottom:16,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.55)" }}>\n          Like to practise? You can send receipts from now. They help keep prices right, but won\'t count towards the competition yet.\n        </div>\n        <button onClick={onPractise} style={{ width:"100%",padding:"12px",marginBottom:10,background:"transparent",border:"2px solid #14532d",borderRadius:12,color:"#14532d",cursor:"pointer",fontSize:14,fontWeight:900 }}>📸 Practise sending a receipt</button>', 'card body');
swap('<CompSoonModal onClose={()=>setShowCompetition(false)} />', '<CompSoonModal onClose={()=>setShowCompetition(false)} onPractise={()=>{ setShowCompetition(false); setShowSubmitPrice(true); }} />', 'render');
fs.writeFileSync(f, t, 'utf8'); console.log('practise added');
