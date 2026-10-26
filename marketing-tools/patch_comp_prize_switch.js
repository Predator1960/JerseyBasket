// Makes the prizes (tickets or vouchers) and the third-prize random draw switchable from one place in COMP.
//   COMP.prizeMode: "tickets" | "vouchers"      COMP.drawThird: true | false
// Private preview of the other versions (only with the preview link): ?comp=preview&prizes=vouchers&draw=no
const fs = require('fs'), path = require('path');
const f = path.resolve(__dirname, '..') + '/src/App.jsx';
let t = fs.readFileSync(f, 'utf8').replace(/\r/g, '');
if (t.includes('const COMP_PRIZES')) { console.log('already patched'); process.exit(0); }
const swap = (a, b, label) => { const c = t.split(a).length - 1; if (c !== 1) throw new Error(`${label}: expected 1 match, found ${c}`); t = t.replace(a, () => b); };

// 1. settings
swap('  dataUrl: "/leaderboard.json",\n};',
     '  dataUrl: "/leaderboard.json",\n  prizeMode: "tickets",               // "tickets" (Channel Islands Charity Christmas Draw) or "vouchers" (£15 / £10 / £5)\n  drawThird: true,                    // true: 3rd prize is a random draw; false: 3rd prize goes to the 3rd highest score\n};', 'settings');
swap('// "off" (not public), "soon" (teaser only)',
`// Prize wording follows the two settings above. The URL switches only work together with the private preview link.
const _q = (() => { try { return typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null; } catch { return null; } })();
const _pv = !!_q && ["preview", "soon"].includes(_q.get("comp"));
const COMP_TICKETS = !(_pv && _q.get("prizes") === "vouchers" ? true : COMP.prizeMode === "vouchers");
const COMP_DRAW = _pv && _q.get("draw") === "no" ? false : COMP.drawThird;
const COMP_PRIZES = {
  tickets:  { name: "Christmas Draw tickets", head: "Channel Islands Charity Christmas Draw tickets", first: "7 tickets", second: "5 tickets", third: "3 tickets" },
  vouchers: { name: "shopping vouchers", head: "Shopping vouchers, your choice of store", first: "£15 voucher", second: "£10 voucher", third: "£5 voucher" },
};
const PRIZE = COMP_TICKETS ? COMP_PRIZES.tickets : COMP_PRIZES.vouchers;
// "off" (not public), "soon" (teaser only)`, 'derived values');

// 2. banner title
swap('compPh === "live" ? "November Price Hunt: win Christmas Draw tickets" :', 'compPh === "live" ? `November Price Hunt: win ${PRIZE.name}` :', 'banner');

// 3. full rules: sections 6 and 7 follow the settings
{
  const a = t.indexOf('  ["6. The prizes", ['), b = t.indexOf('  ["8. Your data", [');
  if (a < 0 || b < a) throw new Error('rules sections');
  const sections = `  ["6. The prizes", [
    COMP_TICKETS
      ? \`The prizes are tickets in the Channel Islands Charity Christmas Draw (draw date \${COMP.drawDate}): 1st prize \${PRIZE.first} for the entrant with the most points; 2nd prize \${PRIZE.second} for the entrant with the second most points; 3rd prize \${PRIZE.third}, \${COMP_DRAW ? "drawn at random from all other eligible entrants who have at least one accepted receipt" : "for the entrant with the third most points"}.\`
      : \`The prizes are shopping vouchers: 1st prize \${PRIZE.first} for the entrant with the most points; 2nd prize \${PRIZE.second} for the entrant with the second most points; 3rd prize \${PRIZE.third}, \${COMP_DRAW ? "drawn at random from all other eligible entrants who have at least one accepted receipt" : "for the entrant with the third most points"}.\`,
    COMP_TICKETS
      ? "Tickets are handed over whole and unscratched. There is no cash or other alternative, and prizes cannot be transferred or exchanged."
      : "Each voucher is for one of the six stores in the app, the winner's choice, subject to availability. There is no cash alternative, and prizes cannot be transferred or exchanged.",
    COMP_TICKETS
      ? "The tickets are bought by us at their normal price. The competition is not connected with, sponsored by or endorsed by the Channel Islands Lottery, and we cannot guarantee any winnings in the draw. The ticket holder must be 18 or over."
      : "The vouchers are bought by us and are subject to the issuing store's own terms and expiry date.",
  ]],
  ["7. How winners are chosen and told", [
    COMP_DRAW
      ? "1st and 2nd prizes go to the two highest scores after all receipts sent by midnight on 30 November have been checked. If scores are equal, the entrant whose first accepted receipt was received earliest ranks higher."
      : "The three prizes go to the three highest scores after all receipts sent by midnight on 30 November have been checked. If scores are equal, the entrant whose first accepted receipt was received earliest ranks higher.",
    COMP_DRAW ? "The 3rd prize draw uses a random number generator and will be recorded or shown publicly." : null,
    "Winners will be contacted using the details they gave, and announced on Tuesday 1 December 2026 (names or aliases only, and only with their agreement).",
    "If a winner cannot be reached or does not reply within 7 days, or is found to be ineligible, the prize passes to the next eligible entrant.",
    COMP_TICKETS
      ? "Tickets will be handed over in person or by recorded delivery. We record the ticket numbers beforehand and ask winners to confirm receipt."
      : "Vouchers will be handed over in person, by recorded delivery or by email, and we ask winners to confirm receipt.",
  ].filter(Boolean)],
`;
  t = t.slice(0, a) + sections + t.slice(b);
}

// 4. competition screen
swap('[["🥇",winners.first,"7 tickets"],["🥈",winners.second,"5 tickets"],["🥉",winners.third,"3 tickets"]]', '[["🥇",winners.first,PRIZE.first],["🥈",winners.second,PRIZE.second],["🥉",winners.third,PRIZE.third]]', 'winners');
swap('The prizes · Channel Islands Charity Christmas Draw tickets', 'The prizes · {PRIZE.head}', 'prize head');
swap('[["🥇","1st prize","7 tickets","Most points"],["🥈","2nd prize","5 tickets","Second most points"],["🥉","3rd prize","3 tickets","Random draw: everyone with a checked receipt is in it"]]',
     '[["🥇","1st prize",PRIZE.first,"Most points"],["🥈","2nd prize",PRIZE.second,"Second most points"],["🥉","3rd prize",PRIZE.third,COMP_DRAW ? "Random draw: everyone with a checked receipt is in it" : "Third most points"]]', 'prize rows');
swap('Tickets are handed over whole and unscratched. The draw is on {COMP.drawDate} and supports Channel Island charities. JerseyBasket is not connected to the Channel Islands Lottery.',
     '{COMP_TICKETS ? `Tickets are handed over whole and unscratched. The draw is on ${COMP.drawDate} and supports Channel Island charities. JerseyBasket is not connected to the Channel Islands Lottery.` : "Each voucher is for the store of your choice from the six in the app, subject to availability."}', 'footnote');
swap('• 1st and 2nd prizes go to the highest scores. 3rd prize is a random draw among all other entrants with at least one checked receipt.<br/>',
     '• {COMP_DRAW ? "1st and 2nd prizes go to the highest scores. 3rd prize is a random draw among all other entrants with at least one checked receipt." : "The three prizes go to the three highest scores."}<br/>', 'rules bullet');
swap("Tickets are handed over in person or by recorded delivery. JerseyBasket's decision is final.", "{COMP_TICKETS ? \"Tickets\" : \"Vouchers\"} are handed over in person or by recorded delivery. JerseyBasket's decision is final.", 'handover bullet');

// 5. entry form and share text
swap('Win Christmas Draw tickets · double points at Morrisons, Waitrose & M&S', 'Win {PRIZE.name} · double points at Morrisons, Waitrose & M&S', 'entry panel');
swap('send a receipt, win Christmas Draw tickets.', 'send a receipt, win ${PRIZE.name}.', 'share text');

fs.writeFileSync(f, t, 'utf8');
console.log('prize switch added');
