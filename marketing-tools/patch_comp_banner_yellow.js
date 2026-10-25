// Makes the competition banner bright yellow with dark green text, larger, with a gentle pulse + shine.
const fs = require('fs'), path = require('path');
const f = path.resolve(__dirname, '..') + '/src/App.jsx';
let t = fs.readFileSync(f, 'utf8').replace(/\r/g, '');
const start = t.indexOf('            {/* ── NOVEMBER PRICE HUNT BANNER');
const end = t.indexOf('            {/* ── SUBMIT-A-RECEIPT TEASER BANNER');
if (start < 0 || end < 0 || end < start) throw new Error('banner markers not found');
if (t.includes('compPulse')) { console.log('already patched'); process.exit(0); }
const block = `            {/* ── NOVEMBER PRICE HUNT BANNER (bright yellow so it can't be missed; shown while the competition is on the way, live, or in results week) ── */}
            {compPh !== "off" && (
              <div className="compBanner" onClick={()=>setShowCompetition(true)} style={{ marginBottom:14,background:"linear-gradient(135deg,#FFE74C 0%,#FFD60A 50%,#FFC300 100%)",border:"2px solid #14532d",borderRadius:14,padding:"15px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",position:"relative",overflow:"hidden",boxShadow:"0 4px 16px rgba(255,195,0,.5)",animation:"compPulse 2.2s ease-in-out infinite" }}>
                <style>{\`@keyframes compPulse{0%,100%{transform:scale(1);box-shadow:0 4px 16px rgba(255,195,0,.5)}50%{transform:scale(1.015);box-shadow:0 6px 24px rgba(255,195,0,.95)}}@keyframes compShine{0%{left:-60%}100%{left:120%}}@media (prefers-reduced-motion: reduce){.compBanner,.compBanner span{animation:none!important}}\`}</style>
                <span style={{ position:"absolute",top:0,left:"-60%",width:"40%",height:"100%",background:"linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.6) 50%,rgba(255,255,255,0) 100%)",pointerEvents:"none",animation:"compShine 3s ease-in-out infinite" }}/>
                <span style={{ fontSize:36,flexShrink:0,position:"relative" }}>{compPh === "soon" ? "👀" : "🎟️"}</span>
                <div style={{ flex:1,minWidth:0,position:"relative" }}>
                  <div style={{ fontSize:16,fontWeight:900,color:"#0b1f12",lineHeight:1.25 }}>{compPh === "soon" ? "Watch this space! New Christmas competition coming soon" : compPh === "live" ? "November Price Hunt: win Christmas Draw tickets" : "November Price Hunt is closed"}</div>
                  <div style={{ fontSize:12.5,fontWeight:700,color:"#14532d",marginTop:3,lineHeight:1.4 }}>{compPh === "soon" ? "Starts 1 November · tap to find out more" : compPh === "live" ? "Send a receipt · double points at Morrisons, Waitrose & M&S · tap for details" : \`Winners announced \${COMP.announce} · tap to see the results\`}</div>
                </div>
                <span style={{ color:"#14532d",fontSize:30,fontWeight:900,flexShrink:0,position:"relative" }}>›</span>
              </div>
            )}

`;
t = t.slice(0, start) + block + t.slice(end);
fs.writeFileSync(f, t, 'utf8');
console.log('banner restyled');
