// Adds the full rules (COMP_RULES + CompRulesModal) and a "Read the full rules" button to CompetitionModal.
const fs = require('fs'), path = require('path');
const f = path.resolve(__dirname, '..') + '/src/App.jsx';
let t = fs.readFileSync(f, 'utf8').replace(/\r/g, '');
if (t.includes('function CompRulesModal')) { console.log('already patched'); process.exit(0); }
const swap = (a, b, label) => { const c = t.split(a).length - 1; if (c !== 1) throw new Error(`${label}: ${c} matches`); t = t.replace(a, () => b); };

const code = `/* ═════════════════════════════════════════════════════════════════════
   COMPETITION FULL RULES (also kept in COMPETITION-NOV2026-RULES.md): edit both together
══════════════════════════════════════════════════════════════════════ */
const COMP_RULES = [
  ["1. Who is running it", [
    "The November Price Hunt (\\"the competition\\") is run by JerseyBasket.je (\\"we\\", \\"us\\"), a sole-trader business operated by Eamonn O'Shea, The Mews, Hauteville, La Rue Coutanche, Trinity, Jersey JE3 5DW.",
    "Contact: hello@jerseybasket.je",
  ]],
  ["2. Who can enter", [
    "You must live in Jersey and be aged 18 or over.",
    "The organiser, members of their family and anyone living in the same household cannot win.",
    "Entry is free. No purchase is necessary: a receipt from any shop you were already in counts.",
  ]],
  ["3. When it runs", [
    "Receipts must be dated between 1 November 2026 and 30 November 2026 (inclusive).",
    "Entries must be sent by midnight at the end of 30 November 2026. Winners are announced on Tuesday 1 December 2026.",
    "Receipts dated before 1 November or after 30 November do not count. You can send other receipts at any time to help keep JerseyBasket's prices right, but they will not score in this competition.",
  ]],
  ["4. How to enter", [
    "Open the JerseyBasket app, tap \\"Send a receipt\\", take a photo of your receipt (or of a shelf price label), choose the store and the date, and leave the box \\"Enter me in the November Price Hunt\\" ticked.",
    "You must give a name or alias and a mobile number or email address so we can contact you if you win.",
    "The photo must clearly show the store name, the date and the prices. You may cover or fold over your card number or any loyalty-card number before photographing; we do not need them.",
    "Each receipt can only be entered once, and it must be a genuine receipt from a Jersey shop. Photos of shelf price labels are welcome if they show the store, the date and the price clearly.",
    "You may send as many different receipts as you like.",
  ]],
  ["5. How scores work", [
    "We check every receipt by hand. Each correct price that we can read and use scores 1 point.",
    "Prices from Morrisons, Waitrose and M&S score 2 points each.",
    "Bring a friend: if a new entrant writes your name or alias in the \\"who told you\\" box, you receive 5 bonus points once their first receipt has been checked and accepted. This applies once per friend, and you cannot refer yourself.",
    "A receipt that is unclear, not dated within the dates above, a duplicate, not genuine, or not from a Jersey shop will not score. Our decision on whether a price or receipt counts is final.",
    "The leaderboard shows names or aliases and points only. It updates as receipts are checked, so it may be a little behind.",
  ]],
  ["6. The prizes", [
    "The prizes are tickets in the Channel Islands Charity Christmas Draw (draw date Thursday 17 December 2026): 1st prize 7 tickets for the entrant with the most points; 2nd prize 5 tickets for the entrant with the second most points; 3rd prize 3 tickets, drawn at random from all other eligible entrants who have at least one accepted receipt.",
    "Tickets are handed over whole and unscratched. There is no cash or other alternative, and prizes cannot be transferred or exchanged.",
    "The tickets are bought by us at their normal price. The competition is not connected with, sponsored by or endorsed by the Channel Islands Lottery, and we cannot guarantee any winnings in the draw. The ticket holder must be 18 or over.",
  ]],
  ["7. How winners are chosen and told", [
    "1st and 2nd prizes go to the two highest scores after all receipts sent by midnight on 30 November have been checked. If scores are equal, the entrant whose first accepted receipt was received earliest ranks higher.",
    "The 3rd prize draw uses a random number generator and will be recorded or shown publicly.",
    "Winners will be contacted using the details they gave, and announced on Tuesday 1 December 2026 (names or aliases only, and only with their agreement).",
    "If a winner cannot be reached or does not reply within 7 days, or is found to be ineligible, the prize passes to the next eligible entrant.",
    "Tickets will be handed over in person or by recorded delivery. We record the ticket numbers beforehand and ask winners to confirm receipt.",
  ]],
  ["8. Your data", [
    "We collect your name or alias, mobile number and/or email address, and the receipt photos you send. We use your contact details only to run the competition and contact winners, and we do not share or sell them.",
    "Receipt photos are also used to check and update prices in the JerseyBasket catalogue, and are kept only as long as we need them for that.",
    "Contact details are deleted within 30 days after the prizes have been handed over.",
    "We handle your data in line with the Data Protection (Jersey) Law 2018. You can ask us to see, correct or delete your data, or withdraw from the competition, by emailing hello@jerseybasket.je.",
  ]],
  ["9. General", [
    "We may disqualify anyone who breaks these rules, sends fake or altered receipts, or tries to cheat.",
    "We may change or cancel the competition if something outside our control makes that necessary. If so, we will say so in the app and on our social media pages.",
    "Store names and logos belong to their owners. This competition is not run by, sponsored by or connected with any of the stores, or with Facebook, Instagram or LinkedIn.",
    "These rules are governed by the law of Jersey. JerseyBasket's decision on all matters to do with the competition is final.",
  ]],
];

function CompRulesModal({ onClose }) {
  return (
    <div style={{ position:"fixed",top:0,left:0,right:0,height:"var(--app-height, 100%)",zIndex:560,display:"flex",alignItems:"flex-end",justifyContent:"center",background:"rgba(0,0,0,.85)" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%",maxWidth:520,background:"linear-gradient(160deg,#FFE74C 0%,#FFD60A 55%,#FFC300 100%)",border:"3px solid #14532d",borderBottom:"none",borderRadius:"20px 20px 0 0",maxHeight:"94%",display:"flex",flexDirection:"column" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px 12px",borderBottom:"2px solid rgba(20,83,45,.35)",flexShrink:0 }}>
          <div style={{ fontSize:18,fontWeight:900,color:"#0b1f12" }}>📜 Full rules</div>
          <button onClick={onClose} style={{ background:"rgba(20,83,45,.14)",border:"none",borderRadius:8,width:34,height:34,color:"#14532d",cursor:"pointer",fontSize:17,fontWeight:900 }}>✕</button>
        </div>
        <div style={{ overflowY:"auto",padding:"14px 20px 8px",flex:1 }}>
          <div style={{ fontSize:13,fontWeight:900,color:"#14532d",marginBottom:10 }}>NOVEMBER PRICE HUNT 2026: OFFICIAL RULES</div>
          {COMP_RULES.map(([h, lines]) => (
            <div key={h} style={{ marginBottom:14 }}>
              <div style={{ fontSize:13,fontWeight:900,color:"#0b1f12",marginBottom:4 }}>{h}</div>
              {lines.map((l, i) => <div key={i} style={{ fontSize:12,fontWeight:600,color:"#14532d",lineHeight:1.65,marginBottom:3 }}>• {l}</div>)}
            </div>
          ))}
        </div>
        <div style={{ padding:"8px 20px 20px",flexShrink:0,borderTop:"2px solid rgba(20,83,45,.25)" }}>
          <button onClick={onClose} style={{ width:"100%",padding:"14px",marginTop:8,background:"#14532d",border:"none",borderRadius:12,color:"#FFE74C",cursor:"pointer",fontSize:15,fontWeight:900 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

`;
// insert before the CompetitionModal function's comment block
const m = 'COMPETITION MODAL — November Price Hunt';
if (t.split(m).length !== 2) throw new Error('modal marker');
const idx = t.lastIndexOf('/* ═', t.indexOf(m));
t = t.slice(0, idx) + code + t.slice(idx);

swap('function CompetitionModal({ onClose, onEnter, data=null, phase="live" }) {\n', 'function CompetitionModal({ onClose, onEnter, data=null, phase="live" }) {\n  const [showRules, setShowRules] = useState(false);\n', 'state');
swap('        {/* header */}\n        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px 12px",borderBottom:"2px solid rgba(20,83,45,.35)"',
     '        {showRules && <CompRulesModal onClose={()=>setShowRules(false)} />}\n\n        {/* header */}\n        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px 12px",borderBottom:"2px solid rgba(20,83,45,.35)"', 'render rules');
swap("Tickets are handed over in person or by recorded delivery. JerseyBasket's decision is final.\n          </div>",
     "Tickets are handed over in person or by recorded delivery. JerseyBasket's decision is final.\n            <button onClick={()=>setShowRules(true)} style={{ display:\"block\",width:\"100%\",marginTop:12,padding:\"11px\",background:\"rgba(255,255,255,.55)\",border:\"2px solid #14532d\",borderRadius:10,color:\"#14532d\",cursor:\"pointer\",fontSize:13.5,fontWeight:900 }}>📜 Read the full rules</button>\n          </div>", 'button');
fs.writeFileSync(f, t, 'utf8');
console.log('full rules added');
