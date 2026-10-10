// Run in the browser console on https://www.snappyshopper.co.uk/stores/iceland-5154 (public, no login needed).
// Walks every category page, reads the product data embedded in each page, downloads iceland-all.json.
(async () => {
  const STORE = '/stores/iceland-5154';
  const MAX = window.__MAX || 1e9; // test limit on number of category pages
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const items = new Map(), done = new Set(), queue = [STORE], problems = [];
  const WRAP = ['Reactive', 'ShallowReactive', 'Ref', 'ShallowRef', 'EmptyRef', 'EmptyShallowRef'];

  function extract(doc) {
    const el = doc.getElementById('__NUXT_DATA__');
    if (!el) return { items: [], links: [], total: 0 };
    const nd = JSON.parse(el.textContent), memo = {};
    const res = i => {
      if (i === -1 || i == null) return null;
      if (i in memo) return memo[i];
      const v = nd[i]; let out;
      if (Array.isArray(v)) out = (typeof v[0] === 'string' && WRAP.includes(v[0])) ? res(v[1]) : v.map(res);
      else if (v && typeof v === 'object') { out = {}; memo[i] = out; for (const k in v) out[k] = res(v[k]); }
      else out = v;
      memo[i] = out; return out;
    };
    const found = [];
    nd.forEach((x, i) => { if (x && typeof x === 'object' && !Array.isArray(x) && 'eposCode' in x) found.push(res(i)); });
    const links = [...doc.querySelectorAll('a[href*="/category/"]')].map(a => a.getAttribute('href').split('?')[0]).filter(h => h.startsWith(STORE + '/category/') && !h.includes('/menuItem/'));
    let total = 0;
    try { total = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent).numberOfItems || 0; } catch (e) {}
    return { items: found, links, total };
  }
  async function load(url) {
    for (let t = 0; t < 3; t++) {
      try {
        const r = await fetch(url, { credentials: 'include' });
        if (r.ok) return new DOMParser().parseFromString(await r.text(), 'text/html');
        if (r.status === 404) return null;
      } catch (e) {}
      await sleep(1500 * (t + 1));
    }
    problems.push(url); return null;
  }
  function keep(p) {
    const pr = p.price || {};
    return {
      id: p.id, name: p.name, ean: p.eposCode, slug: p.slug,
      price: pr.price, fromPrice: pr.fromPrice, unitMetric: pr.unitMetric, unitVolume: pr.unitVolume, unitsInPack: pr.unitsInPack,
      outOfStock: !!p.outOfStock, ageRestriction: p.ageRestriction,
      category: p.category && (p.category.name || p.category), mainCategory: p.mainCategory && (p.mainCategory.name || p.mainCategory),
      badge: p.badge, pageStatements: p.pageStatements,
    };
  }

  let n = 0;
  while (queue.length && n < MAX) {
    const url = queue.shift();
    if (done.has(url)) continue; done.add(url); n++;
    const doc = await load(url);
    if (!doc) continue;
    const ex = extract(doc);
    let added = 0;
    ex.items.forEach(p => { if (!items.has(p.id)) { items.set(p.id, keep(p)); added++; } });
    // category pages that list fewer products than their stated total: try further pages
    let page = 2, got = ex.items.length;
    while (url !== STORE && ex.total && got < ex.total && page < 60) {
      const d2 = await load(url + '?page=' + page);
      if (!d2) break;
      const e2 = extract(d2); let a2 = 0;
      e2.items.forEach(p => { if (!items.has(p.id)) { items.set(p.id, keep(p)); a2++; } });
      if (!a2) break; got += a2; added += a2; page++; await sleep(300);
    }
    if (url !== STORE && ex.total && got < ex.total) problems.push(`${url}: got ${got} of ${ex.total}`);
    ex.links.forEach(l => { if (!done.has(l) && !queue.includes(l)) queue.push(l); });
    console.log(`${n} done, ${queue.length} queued, ${items.size} products (${url.split('/').pop()}: +${added})`);
    await sleep(350);
  }
  window.__iceland = [...items.values()];
  console.log('FINISHED', items.size, 'products from', n, 'pages. Problems:', problems.length, problems.slice(0, 10));
  if (!window.__MAX) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(window.__iceland)], { type: 'application/json' }));
    a.download = 'iceland-all.json'; a.click();
  }
})();
