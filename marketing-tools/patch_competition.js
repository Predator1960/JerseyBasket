// Wires the November Price Hunt into src/App.jsx. Every anchor must match exactly once or nothing is written.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
const parts = n => fs.readFileSync(path.join(__dirname, 'comp-parts', n), 'utf8').replace(/\r/g, '');
let t = fs.readFileSync(ROOT + 'src/App.jsx', 'utf8').replace(/\r/g, '');
if (t.includes('const COMP = {')) { console.log('already patched'); process.exit(0); }

const once = (needle, label) => { const c = t.split(needle).length - 1; if (c !== 1) throw new Error(`${label}: expected 1 match, found ${c}`); };
const insertAfter = (needle, add, label) => { once(needle, label); t = t.replace(needle, () => needle + add); };
const insertBefore = (needle, add, label) => { once(needle, label); t = t.replace(needle, () => add + needle); };
const swap = (a, b, label) => { once(a, label); t = t.replace(a, () => b); };

// 1. settings + helpers, right after the receipt endpoint constants
insertAfter('const RECEIPT_SHARED_SECRET = "2bf2c87b3d5bd1bd57bcc8dee5818ab8f75f238d509471b1";\n', '\n' + parts('constants.txt'), 'constants');

// 2. the modal, before the SubmitPriceModal comment block
{
  const marker = 'SUBMIT PRICE MODAL — receipt-photo price submission';
  once(marker, 'modal marker');
  const idx = t.lastIndexOf('/* ═', t.indexOf(marker));
  t = t.slice(0, idx) + parts('modal.txt') + t.slice(idx);
}

// 3. SubmitPriceModal changes
swap('function SubmitPriceModal({ onClose, lightMode=false }) {', 'function SubmitPriceModal({ onClose, onOpenCompetition, lightMode=false }) {', 'signature');
swap(`  const [taken, setTaken] = useState(todayLocal()); // date the photo was taken (defaults to today)
  const fileRef = useRef(null);
`, `  const [taken, setTaken] = useState(todayLocal()); // date the photo was taken (defaults to today)
  const fileRef = useRef(null);
  // November Price Hunt: a pre-ticked entry box while the competition is live
  const compLive = compPhase() === "live";
  const [enter, setEnter] = useState(compLive);
  const [referrer, setReferrer] = useState("");
  const entered = compLive && enter;
  // remember an entrant's details on this phone so repeat entries take seconds
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("jb_entrant") || "null");
      if (s) setForm(p => ({ name: s.name || p.name, mobile: s.mobile || p.mobile, email: s.email || p.email }));
    } catch {}
  }, []);
  const shareHunt = () => {
    const alias = form.name.trim();
    const text = \`I'm in the JerseyBasket November Price Hunt: send a receipt, win Christmas Draw tickets. \${alias ? \`Put "\${alias}" in "who told you" when you enter. \` : ""}https://jerseybasket.je\`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
  };
`, 'states');
swap('  const disabled = !photos.length || sending || preparing;',
`  const needsContact = entered && (!form.name.trim() || (!form.mobile.trim() && !form.email.trim()));
  const disabled = !photos.length || sending || preparing || needsContact;`, 'disabled');
swap('              dateTaken:     taken,\n', `              dateTaken:     taken,
              competition:   entered ? COMP.id : "",
              referredBy:    entered ? referrer.trim() : "",
`, 'payload');
swap('photoName:     `${taken}_${store ? store.replace(/[^A-Za-z0-9]+/g, "-") : "store-unknown"}_${ph.name}`,',
  'photoName:     `${entered ? "COMP-NOV26_" + (referrer.trim() ? "REF-" + referrer.trim().replace(/[^A-Za-z0-9]+/g, "-") + "_" : "") : ""}${taken}_${store ? store.replace(/[^A-Za-z0-9]+/g, "-") : "store-unknown"}_${ph.name}`,', 'photoName');
swap('    setSentCount(ok);\n    setStatus(ok === photos.length ? "sent" : "error");',
`    if (ok && entered) { try { localStorage.setItem("jb_entrant", JSON.stringify({ name: form.name, mobile: form.mobile, email: form.email })); } catch {} }
    setSentCount(ok);
    setStatus(ok === photos.length ? "sent" : "error");`, 'save details');
swap('One photo is all it takes. Anonymous.', '{entered ? "Price Hunt entry · double points at Morrisons, Waitrose & M&S" : "One photo is all it takes. Anonymous."}', 'subtitle');
// the header subtitle was plain text inside a div, so the replacement above needs to be a JSX expression; handled by the swap since it sits between tags
swap('{sentCount > 1 ? "Receipts sent!" : "Receipt sent!"}', '{entered ? "You\'re in the Price Hunt! 🎟️" : (sentCount > 1 ? "Receipts sent!" : "Receipt sent!")}', 'success title');
swap(`              {form.name.trim() ? \`Thanks \${form.name.trim().split(" ")[0]}! \` : "Thanks! "}We'll check it and add<br/>
              the prices to JerseyBasket within 24 hours.<br/>
              Thanks for helping keep it accurate! 🙌`,
`              {entered ? (<>
                Thanks {form.name.trim().split(" ")[0]}! We check every receipt by hand and update<br/>
                the leaderboard as we go, usually within a couple of days.<br/>
                Send more to climb: Morrisons, Waitrose and M&S score double. 🙌
              </>) : (<>
                {form.name.trim() ? \`Thanks \${form.name.trim().split(" ")[0]}! \` : "Thanks! "}We'll check it and add<br/>
                the prices to JerseyBasket within 24 hours.<br/>
                Thanks for helping keep it accurate! 🙌
              </>)}`, 'success text');
insertBefore('            <button onClick={onClose} style={{ width:"100%",padding:"10px",background:"transparent"',
`            {entered && onOpenCompetition && (
              <button onClick={onOpenCompetition} style={{ width:"100%",padding:"11px",marginBottom:8,background:"linear-gradient(180deg,#fbbf24 0%,#d97706 100%)",border:"none",borderRadius:11,color:"#1a1200",cursor:"pointer",fontSize:13,fontWeight:800 }}>
                🏆 See the leaderboard
              </button>
            )}
            {entered && (
              <button onClick={shareHunt} style={{ width:"100%",padding:"10px",marginBottom:8,background:"transparent",border:"1px solid rgba(250,204,21,.5)",borderRadius:11,color:lightMode?"#92400e":"#fde68a",cursor:"pointer",fontSize:13,fontWeight:700 }}>
                📣 Tell a friend (they get you +5 points)
              </button>
            )}
`, 'success buttons');
swap('<button onClick={()=>setShowDetails(s=>!s)} style={{ width:"100%",marginTop:14,padding:"8px"',
     '<button onClick={()=>setShowDetails(s=>!s)} style={{ display:(compLive && enter) ? "none" : "block",width:"100%",marginTop:14,padding:"8px"', 'details toggle');
swap('{showDetails && (', '{showDetails && !(compLive && enter) && (', 'details block');
insertBefore('              <button onClick={handleSubmit} disabled={disabled}', parts('panel.txt'), 'entry panel');

// 4. main app: state, banner, modal render
insertAfter('  const [showSubmitPrice,  setShowSubmitPrice]  = useState(false);\n', `  const [showCompetition, setShowCompetition] = useState(false);
  const compPh   = compPhase();
  const compData = useCompData(compPh !== "off");
`, 'main state');
insertBefore('            {/* ── SUBMIT-A-RECEIPT TEASER BANNER (tap opens SubmitPriceModal) ── */}\n', parts('banner.txt'), 'banner');
swap('      {showSubmitPrice && <SubmitPriceModal onClose={()=>setShowSubmitPrice(false)} lightMode={lightMode} />}',
`      {showSubmitPrice && <SubmitPriceModal onClose={()=>setShowSubmitPrice(false)} onOpenCompetition={()=>{ setShowSubmitPrice(false); setShowCompetition(true); }} lightMode={lightMode} />}

      {/* ── NOVEMBER PRICE HUNT MODAL ── */}
      {showCompetition && <CompetitionModal onClose={()=>setShowCompetition(false)} onEnter={()=>{ setShowCompetition(false); setShowSubmitPrice(true); }} lightMode={lightMode} data={compData} phase={compPh === "off" ? "live" : compPh} />}`, 'render');

fs.writeFileSync(ROOT + 'src/App.jsx', t, 'utf8');
console.log('patched OK');
