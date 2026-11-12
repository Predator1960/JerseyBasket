/* ═══════════════════════════════════════════════════════════════════════════
   DISPLAY MODE — jerseybasket.je/?display
   A hands-off, auto-cycling version of the app for screensavers, shop-window
   TVs and counter screens. Nobody taps it, so instead of the shop view it
   rotates through: intro → verified price gaps → Price Hunt leaderboard → QR.
   The real AdBanner runs along the bottom so advertisers get seen too.
   Loaded from index.js instead of the main app when the URL has ?display.
═══════════════════════════════════════════════════════════════════════════ */
import React, { useEffect, useMemo, useState } from "react";
import { STORES, BASE_PRODUCTS, AdBanner } from "./App";

const SCENE_MS = 10000;
const STORE_BY_ID = Object.fromEntries(STORES.map(s => [s.id, s]));
const money = v => `£${v.toFixed(2)}`;
const fmt = n => n.toLocaleString("en-GB");

// Only prices someone has actually checked (listed in upds) go on screen —
// estimates never do. Needs 3+ checked stores and a gap worth showing.
const EXCLUDE = /durex|condom|tampon|incontinence|pregnancy test/i;
function buildGapPool() {
  const pool = [];
  for (const p of BASE_PRODUCTS) {
    if (!p.upds || EXCLUDE.test(p.name)) continue;
    const rows = Object.keys(p.upds)
      // Alliance prices come from Snappy Shopper (not yet receipt-verified) — keep off screen
      .filter(id => STORE_BY_ID[id] && id !== "alliance" && p.prices[id] > 0)
      .map(id => ({ id, price: p.prices[id] }))
      .sort((a, b) => a.price - b.price);
    if (rows.length < 3) continue;
    const lo = rows[0].price, hi = rows[rows.length - 1].price;
    const gap = hi - lo;
    if (gap < 0.75 || gap / hi < 0.15) continue;
    pool.push({ id: p.id, name: p.name, icon: p.icon, rows, gap, pct: Math.round(gap / hi * 100) });
  }
  // Shuffle so each screen shows a different mix, biased toward bigger gaps
  return pool
    .map(x => ({ x, k: Math.random() * (1 + x.gap) }))
    .sort((a, b) => b.k - a.k)
    .map(o => o.x);
}

const SCENES = ["intro", "gaps", "gaps", "hunt", "gaps", "fb", "gaps", "qr"];
// Facebook page (what /qr-facebook.png links to): https://www.facebook.com/profile.php?id=61590238925449

export default function DisplayMode() {
  const pool = useMemo(buildGapPool, []);
  const [step, setStep] = useState(0);
  const [now, setNow] = useState(new Date());
  const [board, setBoard] = useState(null);
  const [cursorHidden, setCursorHidden] = useState(false);
  // Phones: one price card per screen, and Hunt/Facebook trimmed to fit
  const [narrow, setNarrow] = useState(() => window.innerWidth < 700);
  useEffect(() => {
    const r = () => setNarrow(window.innerWidth < 700);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setStep(s => s + 1), SCENE_MS);
    const c = setInterval(() => setNow(new Date()), 15000);
    return () => { clearInterval(t); clearInterval(c); };
  }, []);

  // Refresh the leaderboard every 10 minutes so a long-running screen stays current
  useEffect(() => {
    const load = () => fetch(`/leaderboard.json?t=${Date.now()}`).then(r => r.json()).then(setBoard).catch(() => {});
    load();
    const t = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // Reload every hour so a screen left on for days picks up new prices
  // (and reshuffles its comparisons). Skips the reload while offline, so a
  // dropped connection never leaves the screen blank.
  useEffect(() => {
    const t = setInterval(() => { if (navigator.onLine) window.location.reload(); }, 60 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // Hide the mouse pointer when idle; Esc goes to the normal app
  useEffect(() => {
    let timer;
    const wake = () => { setCursorHidden(false); clearTimeout(timer); timer = setTimeout(() => setCursorHidden(true), 3000); };
    const key = e => { if (e.key === "Escape") window.location.href = "/"; };
    wake();
    window.addEventListener("mousemove", wake);
    window.addEventListener("keydown", key);
    return () => { clearTimeout(timer); window.removeEventListener("mousemove", wake); window.removeEventListener("keydown", key); };
  }, []);

  const hasHunt = !!board?.entries?.length;
  const order = hasHunt ? SCENES : SCENES.filter(s => s !== "hunt");
  const scene = order[step % order.length];
  // Each "gaps" scene takes the next 3 products (1 on phones) from the pool
  const per = narrow ? 1 : 3;
  const gapIndex = Math.floor(step / order.length) * order.filter(s => s === "gaps").length
    + order.slice(0, step % order.length).filter(s => s === "gaps").length;
  const gapItems = pool.length
    ? Array.from({ length: per }, (_, i) => pool[(gapIndex * per + i) % pool.length])
    : [];

  return (
    <div className="jbd-root" style={{
      display: "flex", flexDirection: "column", overflow: "hidden",
      background: "linear-gradient(160deg,#050d1a 0%,#0b1c35 55%,#061220 100%)",
      fontFamily: "'Georgia',serif", color: "#f0f4f8", cursor: cursorHidden ? "none" : "default",
    }}>
      <style>{`
        @keyframes jbdFade { from { opacity:0; transform:translateY(1.5vh); } to { opacity:1; transform:none; } }
        .jbd-scene { animation: jbdFade .8s ease-out both; }
        .jbd-bar { transition: width 1.2s ease-out; }
        /* Pinned to the screen so it can't be pulled/scrolled, and padded by
           the iPhone safe areas: a home-screen icon runs full screen under the
           status bar (black-translucent), which hid the header and clock. */
        .jbd-root { position: fixed; inset: 0; box-sizing: border-box;
          padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right); }
      `}</style>

      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2vh 3vw", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ fontSize: "clamp(20px,3.2vw,48px)", fontWeight: 700, letterSpacing: "-.01em" }}>
          🛒 Jersey<span style={{ color: "#22c55e" }}>Basket</span><span style={{ color: "#64748b" }}>.je</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "clamp(18px,2.6vw,40px)", fontWeight: 700 }}>
            {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div style={{ fontSize: "clamp(11px,1.1vw,18px)", color: "#94a3b8" }}>
            {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
      </div>

      {/* scene */}
      <div key={step} className="jbd-scene" style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "2vh 4vw" }}>
        {scene === "intro" && <Intro />}
        {scene === "gaps" && <Gaps items={gapItems} />}
        {scene === "hunt" && <Hunt board={board} narrow={narrow} />}
        {scene === "fb" && <Facebook narrow={narrow} />}
        {scene === "qr" && <QR />}
      </div>

      {/* progress dots */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", paddingBottom: "1.5vh" }}>
        {order.map((_, i) => (
          <div key={i} style={{ width: i === step % order.length ? 26 : 8, height: 8, borderRadius: 4, background: i === step % order.length ? "#22c55e" : "rgba(255,255,255,.18)", transition: "width .4s" }} />
        ))}
      </div>

      <AdBanner onEnquiry={() => {}} externalPause={false} />
    </div>
  );
}

const H1 = { fontSize: "clamp(28px,5vw,84px)", fontWeight: 700, lineHeight: 1.1, margin: 0, textAlign: "center" };
const SUB = { fontSize: "clamp(14px,1.8vw,30px)", color: "#94a3b8", textAlign: "center", marginTop: "1.5vh" };

function Intro() {
  const stats = [
    [`${fmt(Math.floor(BASE_PRODUCTS.length / 500) * 500)}+`, "products"],
    [`${STORES.length}`, "supermarkets"],
    ["2,800+", "Jersey shoppers"],
    ["Free", "no sign-up"],
  ];
  return (
    <div style={{ textAlign: "center" }}>
      <h1 style={H1}>Are you paying too much<br />for your <span style={{ color: "#22c55e" }}>groceries?</span></h1>
      <div style={SUB}>Compare prices across Jersey's supermarkets, in one place.</div>
      <div style={{ display: "flex", gap: "2.5vw", justifyContent: "center", marginTop: "5vh", flexWrap: "wrap" }}>
        {stats.map(([v, l]) => (
          <div key={l} style={{ minWidth: "14vw", padding: "2.5vh 2vw", borderRadius: 18, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)" }}>
            <div style={{ fontSize: "clamp(24px,4vw,64px)", fontWeight: 700, color: "#22c55e" }}>{v}</div>
            <div style={{ fontSize: "clamp(12px,1.3vw,22px)", color: "#cbd5e1" }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "1.2vw", justifyContent: "center", marginTop: "4vh", flexWrap: "wrap" }}>
        {STORES.map(s => (
          <span key={s.id} style={{ padding: "0.8vh 1.2vw", borderRadius: 999, border: `2px solid ${s.color}`, fontSize: "clamp(12px,1.4vw,24px)", fontWeight: 700 }}>{s.emoji} {s.short}</span>
        ))}
      </div>
    </div>
  );
}

function Gaps({ items }) {
  return (
    <div style={{ width: "100%", maxWidth: 1700 }}>
      <h2 style={{ ...H1, fontSize: "clamp(22px,3.4vw,56px)" }}>Same product. <span style={{ color: "#f59e0b" }}>Different price.</span></h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "2vw", marginTop: "4vh" }}>
        {items.map(p => {
          const hi = p.rows[p.rows.length - 1].price;
          return (
            <div key={p.id} style={{ padding: "2.5vh 1.6vw", borderRadius: 20, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)" }}>
              <div style={{ fontSize: "clamp(16px,1.7vw,30px)", fontWeight: 700, minHeight: "2.6em", lineHeight: 1.3 }}>{p.icon} {p.name}</div>
              <div style={{ marginTop: "2vh", display: "flex", flexDirection: "column", gap: "1.2vh" }}>
                {p.rows.map((r, i) => {
                  const s = STORE_BY_ID[r.id];
                  const best = i === 0;
                  return (
                    <div key={r.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "clamp(13px,1.4vw,24px)", marginBottom: 4 }}>
                        <span style={{ color: best ? "#22c55e" : "#cbd5e1", fontWeight: best ? 700 : 400 }}>{s.short}{best ? " ✓ cheapest" : ""}</span>
                        <span style={{ fontWeight: 700, color: best ? "#22c55e" : "#f0f4f8" }}>{money(r.price)}</span>
                      </div>
                      <div style={{ height: "1vh", minHeight: 6, borderRadius: 6, background: "rgba(255,255,255,.07)" }}>
                        <div className="jbd-bar" style={{ width: `${(r.price / hi) * 100}%`, height: "100%", borderRadius: 6, background: best ? "#22c55e" : s.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: "2.2vh", fontSize: "clamp(15px,1.7vw,30px)", fontWeight: 700, color: "#f59e0b" }}>
                Save {money(p.gap)} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({p.pct}% less)</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ ...SUB, fontSize: "clamp(11px,1.1vw,18px)", marginTop: "3vh" }}>Shelf prices checked in Jersey stores. Prices change, so always verify in-store.</div>
    </div>
  );
}

function Hunt({ board, narrow }) {
  const top = (board.entries || []).slice(0, narrow ? 4 : 5);
  const stores = narrow ? [] : Object.entries(board.stores || {});
  const medal = ["🥇", "🥈", "🥉", "4", "5"];
  return (
    <div style={{ width: "100%", maxWidth: 1500 }}>
      <h2 style={{ ...H1, fontSize: "clamp(22px,3.4vw,56px)" }}>🏆 The <span style={{ color: "#22c55e" }}>Price Hunt</span> leaderboard</h2>
      <div style={SUB}>Send in your shopping receipts to climb the table. Updated {board.updated}.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "3vw", marginTop: "4vh" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.4vh" }}>
          {top.map((e, i) => (
            <div key={e.name} style={{ display: "flex", alignItems: "center", gap: "1.2vw", padding: "1.6vh 1.6vw", borderRadius: 16, background: i === 0 ? "rgba(34,197,94,.14)" : "rgba(255,255,255,.05)", border: `1px solid ${i === 0 ? "rgba(34,197,94,.5)" : "rgba(255,255,255,.1)"}` }}>
              <span style={{ fontSize: "clamp(18px,2.2vw,38px)", width: "2.4vw", minWidth: 28, textAlign: "center", fontWeight: 700 }}>{medal[i]}</span>
              <span style={{ flex: 1, fontSize: "clamp(16px,2vw,34px)", fontWeight: 700 }}>{e.name}</span>
              <span style={{ fontSize: "clamp(16px,2vw,34px)", fontWeight: 700, color: "#22c55e" }}>{e.points} pts</span>
            </div>
          ))}
        </div>
        {stores.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2.4vh", justifyContent: "center" }}>
            <div style={{ fontSize: "clamp(14px,1.6vw,26px)", color: "#cbd5e1", fontWeight: 700 }}>Prices collected so far</div>
            {stores.map(([id, s]) => {
              const st = STORE_BY_ID[id];
              const pct = Math.min(100, (s.prices / s.goal) * 100);
              return (
                <div key={id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "clamp(13px,1.5vw,26px)", marginBottom: 6 }}>
                    <span>{st ? st.name : id}</span><span style={{ fontWeight: 700 }}>{s.prices} / {s.goal}</span>
                  </div>
                  <div style={{ height: "1.4vh", minHeight: 8, borderRadius: 8, background: "rgba(255,255,255,.07)" }}>
                    <div className="jbd-bar" style={{ width: `${pct}%`, height: "100%", borderRadius: 8, background: st ? st.color : "#22c55e" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Facebook's Page Plugin won't show posts for this page to logged-out viewers
// (new-style profile.php pages), so only its live header is used: name, logo,
// follower count, Follow button. The QR opens the page on a phone.
function Facebook({ narrow }) {
  // Our own card rather than Facebook's Page Plugin: the plugin overlaps its
  // follower line with the Follow bar and can't be styled from outside.
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5vw", flexWrap: "wrap", justifyContent: "center" }}>
      <img src="/qr-facebook.png" alt="QR code for JerseyBasket on Facebook" style={{ width: "min(32vh,30vw)", height: "min(32vh,30vw)", background: "#fff", padding: "1.5vh", borderRadius: 20 }} />
      <div>
        <h2 style={{ ...H1, textAlign: "left", fontSize: "clamp(26px,4.4vw,74px)" }}>Follow us on<br /><span style={{ color: "#1877f2" }}>Facebook</span></h2>
        <div style={{ ...SUB, textAlign: "left" }}>Price gaps, Price Hunt news and the best deals, first.</div>
        <div style={{ marginTop: "3vh", display: "inline-flex", alignItems: "center", gap: narrow ? 12 : "1.4vw",
          padding: narrow ? "12px 16px" : "1.6vh 1.6vw", borderRadius: 16,
          background: "linear-gradient(180deg,rgba(24,119,242,.22) 0%,rgba(24,119,242,.1) 100%)",
          border: "1px solid rgba(24,119,242,.55)", boxShadow: "0 6px 24px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.12)" }}>
          <div style={{ width: narrow ? 44 : "clamp(44px,5vw,90px)", height: narrow ? 44 : "clamp(44px,5vw,90px)", borderRadius: "50%", flexShrink: 0,
            background: "#1877f2", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontFamily: "Arial,Helvetica,sans-serif", fontWeight: 900, fontSize: narrow ? 30 : "clamp(30px,3.4vw,62px)" }}>f</div>
          <div>
            <div style={{ fontSize: narrow ? 18 : "clamp(18px,2.2vw,40px)", fontWeight: 700 }}>
              Jersey<span style={{ color: "#22c55e" }}>Basket</span>
            </div>
            <div style={{ fontSize: narrow ? 13 : "clamp(13px,1.4vw,26px)", color: "#93c5fd", marginTop: 2 }}>Scan the code to follow us</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QR() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5vw", flexWrap: "wrap", justifyContent: "center" }}>
      <img src="/qr-jerseybasket.png" alt="QR code for jerseybasket.je" style={{ width: "min(32vh,30vw)", height: "min(32vh,30vw)", background: "#fff", padding: "1.5vh", borderRadius: 20 }} />
      <div>
        <h2 style={{ ...H1, textAlign: "left", fontSize: "clamp(26px,4.4vw,74px)" }}>Scan to compare<br /><span style={{ color: "#22c55e" }}>your shop</span></h2>
        <div style={{ ...SUB, textAlign: "left" }}>Free. No sign-up. Works on any phone.</div>
        <div style={{ marginTop: "3vh", fontSize: "clamp(20px,3vw,50px)", fontWeight: 700 }}>jerseybasket.je</div>
      </div>
    </div>
  );
}
