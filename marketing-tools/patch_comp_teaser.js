// Adds a "Watch this space" teaser stage before the November Price Hunt opens. Every anchor must match exactly once.
const fs = require('fs');
const path = require('path');
const f = path.resolve(__dirname, '..') + '/src/App.jsx';
let t = fs.readFileSync(f, 'utf8').replace(/\r/g, '');
if (t.includes('function CompSoonModal')) { console.log('already patched'); process.exit(0); }
const swap = (a, b, label) => { const c = t.split(a).length - 1; if (c !== 1) throw new Error(`${label}: expected 1 match, found ${c}`); t = t.replace(a, () => b); };

swap('  start:     Date.UTC(2026, 10, 1),   // 1 Nov 2026 00:00 (GMT = UTC in November)',
     '  teaserFrom: Date.UTC(2026, 9, 25),  // "Watch this space" banner starts here and runs until start\n  start:     Date.UTC(2026, 10, 1),   // 1 Nov 2026 00:00 (GMT = UTC in November)', 'teaserFrom');
swap('// "off" (not public), "live" (open for entries) or "ended" (results week)',
     '// "off" (not public), "soon" (teaser only), "live" (open for entries) or "ended" (results week)', 'comment');
swap('  try { if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("comp") === "preview") return "live"; } catch {}\n  const now = Date.now();\n  if (now < COMP.start) return "off";',
     '  try {\n    if (typeof window !== "undefined") {\n      const q = new URLSearchParams(window.location.search).get("comp");\n      if (q === "preview") return "live";   // private preview of the live competition\n      if (q === "soon") return "soon";      // private preview of the teaser\n    }\n  } catch {}\n  const now = Date.now();\n  if (now < COMP.teaserFrom) return "off";\n  if (now < COMP.start) return "soon";', 'phase');
swap('{compPh === "live" ? "November Price Hunt: win Christmas Draw tickets" : "November Price Hunt is closed"}',
     '{compPh === "soon" ? "👀 Watch this space! New Christmas competition coming soon" : compPh === "live" ? "November Price Hunt: win Christmas Draw tickets" : "November Price Hunt is closed"}', 'banner title');
swap('{compPh === "live" ? "Send a receipt · double points at Morrisons, Waitrose & M&S · tap for details" : `Winners announced ${COMP.announce} · tap to see the results`}',
     '{compPh === "soon" ? "Starts 1 November · tap to find out more" : compPh === "live" ? "Send a receipt · double points at Morrisons, Waitrose & M&S · tap for details" : `Winners announced ${COMP.announce} · tap to see the results`}', 'banner subtitle');
swap('{showCompetition && <CompetitionModal onClose={()=>setShowCompetition(false)}',
     '{showCompetition && compPh === "soon" && <CompSoonModal onClose={()=>setShowCompetition(false)} lightMode={lightMode} />}\n      {showCompetition && compPh !== "soon" && <CompetitionModal onClose={()=>setShowCompetition(false)}', 'render');

const soon = `/* ═════════════════════════════════════════════════════════════════════
   COMPETITION "WATCH THIS SPACE" CARD: shown when the teaser banner is tapped, before 1 November.
   Deliberately says nothing about prizes or rules.
══════════════════════════════════════════════════════════════════════ */
function CompSoonModal({ onClose, lightMode=false }) {
  return (
    <div style={{ position:"fixed",top:0,left:0,right:0,height:"var(--app-height, 100%)",zIndex:550,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 20px",background:"rgba(0,0,0,.8)",backdropFilter:"blur(8px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%",maxWidth:420,background:lightMode?"rgba(255,252,248,.98)":"#120c26",border:"1px solid rgba(250,204,21,.4)",borderRadius:20,padding:"28px 24px",textAlign:"center" }}>
        <div style={{ fontSize:48,marginBottom:10 }}>🎄</div>
        <div style={{ fontSize:20,fontWeight:800,color:lightMode?"#581c87":"#fde68a",marginBottom:10 }}>Watch this space!</div>
        <div style={{ fontSize:13,lineHeight:1.7,color:lightMode?"#334155":"#cbd5e1",marginBottom:20 }}>
          A new <b>Christmas competition</b> starts on <b>1 November</b>.<br/>
          Keep your shopping receipts from 1 November, and check back here for all the details. 👀
        </div>
        <button onClick={onClose} style={{ width:"100%",padding:"13px",background:"linear-gradient(180deg,#fbbf24 0%,#d97706 100%)",border:"none",borderRadius:12,color:"#1a1200",cursor:"pointer",fontSize:15,fontWeight:800 }}>Got it</button>
      </div>
    </div>
  );
}

`;
const marker = 'COMPETITION MODAL — November Price Hunt';
const c = t.split(marker).length - 1; if (c !== 1) throw new Error('modal marker ' + c);
const idx = t.lastIndexOf('/* ═', t.indexOf(marker));
t = t.slice(0, idx) + soon + t.slice(idx);

fs.writeFileSync(f, t, 'utf8');
console.log('teaser patched OK');
