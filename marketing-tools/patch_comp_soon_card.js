// Restyles the "Watch this space" card (yellow + dark green, dark green button with yellow text) and says to start saving receipts now.
const fs = require('fs'), path = require('path');
const f = path.resolve(__dirname, '..') + '/src/App.jsx';
let t = fs.readFileSync(f, 'utf8').replace(/\r/g, '');
const start = t.indexOf('function CompSoonModal');
const end = t.indexOf('\n}\n', start) + 3;
if (start < 0 || end < start) throw new Error('CompSoonModal not found');
if (t.slice(start, end).includes('#14532d')) { console.log('already patched'); process.exit(0); }
const block = `function CompSoonModal({ onClose }) {
  return (
    <div style={{ position:"fixed",top:0,left:0,right:0,height:"var(--app-height, 100%)",zIndex:550,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 20px",background:"rgba(0,0,0,.8)",backdropFilter:"blur(8px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%",maxWidth:420,background:"linear-gradient(135deg,#FFE74C 0%,#FFD60A 50%,#FFC300 100%)",border:"3px solid #14532d",borderRadius:20,padding:"28px 24px",textAlign:"center",boxShadow:"0 10px 40px rgba(255,195,0,.45)" }}>
        <div style={{ fontSize:52,marginBottom:10 }}>👀</div>
        <div style={{ fontSize:24,fontWeight:900,color:"#0b1f12",marginBottom:12 }}>Watch this space!</div>
        <div style={{ fontSize:14.5,fontWeight:700,lineHeight:1.7,color:"#14532d",marginBottom:22 }}>
          A new <b>Christmas competition</b> starts on <b>1 November</b>.<br/>
          <b>Start saving your shopping receipts now</b>, and check back here for all the details.
        </div>
        <button onClick={onClose} style={{ width:"100%",padding:"14px",background:"#14532d",border:"none",borderRadius:12,color:"#FFE74C",cursor:"pointer",fontSize:16,fontWeight:900 }}>Got it</button>
      </div>
    </div>
  );
}
`;
t = t.slice(0, start) + block + t.slice(end);
// the card no longer takes lightMode; drop the prop where it is rendered
const a = '<CompSoonModal onClose={()=>setShowCompetition(false)} lightMode={lightMode} />';
if (t.split(a).length !== 2) throw new Error('render anchor');
t = t.replace(a, () => '<CompSoonModal onClose={()=>setShowCompetition(false)} />');
fs.writeFileSync(f, t, 'utf8');
console.log('soon card restyled');
