# Co-op full-catalogue refresh (about 10 minutes)

First run: 10 Oct 2026 (7,030 products -> 1,075 price updates, 2,200 new items). Repeat roughly monthly.

## 1. Capture (in your own browser, token never leaves it)
1. Open the Co-op online shop in Chrome, log in, open DevTools -> Console.
2. Paste **Step 1** snippet (below), then click any category so the page loads products. Console prints `caught`.
   Check with `window.__u` - it should show a URL containing `/api/stores/1/products`.
3. Paste **Step 2** snippet. It pages through everything (about 120 pages of 60) and downloads `coop-all.json`.
4. Move `coop-all.json` into the JERSEYBASKET project folder (replace the old one).

Never paste the Authorization header/token to anyone.

### Step 1
```js
window.__h=null;window.__u=null;
const _of=window.fetch;window.fetch=function(u,o){try{if(String(u).includes('/api/stores/1/products')){window.__u=String(u);window.__h=Object.assign({},(o&&o.headers)||{});console.log('caught')}}catch(e){}return _of.apply(this,arguments)};
const _set=XMLHttpRequest.prototype.setRequestHeader,_open=XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open=function(m,u){this.__u=u;this.__hd={};return _open.apply(this,arguments)};
XMLHttpRequest.prototype.setRequestHeader=function(k,v){if(this.__u&&this.__u.includes('/api/stores/1/products')){this.__hd[k]=v;window.__u=this.__u;window.__h=this.__hd;console.log('caught')}return _set.apply(this,arguments)};
```

### Step 2
```js
(async()=>{
const base=new URL(window.__u,location.origin);
base.searchParams.delete('filter[category]');
base.searchParams.set('per_page','60');
let all=[],page=1,last=1;
do{
  base.searchParams.set('page',page);
  const r=await fetch(base.toString(),{headers:window.__h});
  if(!r.ok){console.log('stopped',r.status,'at page',page);break}
  const j=await r.json();
  all.push(...(j.data||[]));
  last=(j.meta&&j.meta.last_page)||page;
  console.log(page+'/'+last,all.length);
  page++;
  await new Promise(s=>setTimeout(s,400));
}while(page<=last);
const a=document.createElement('a');
a.href=URL.createObjectURL(new Blob([JSON.stringify(all)],{type:'application/json'}));
a.download='coop-all.json';a.click();
})();
```

## 2. Import (ask Claude: "run the Co-op refresh from coop-refresh/README.md")
From the project root:
- Dry run:   `node coop-refresh/coop_all_apply.js` (add `--list` to see every new item)
- Apply:     `node coop-refresh/coop_all_apply.js --apply`
- Dup scan + CSV: `node coop-refresh/export_csv.js`  (must say `dup ids 0 exact-name dups 0`)
- Excel sheet: `python sync_products.py`
- Stage ONLY `src/App.jsx` and `JerseyBasket-Product-Database.xlsx`, commit with `git commit -F <msgfile>`, push.
- Poll https://www.jerseybasket.je/ for the new `main.<hash>.js` to confirm the deploy.

## Rules the script follows
- Matches by normalised name (ignores size tags like 10S/EACH/1KG). Updates Co-op to the REGULAR price (`original_price` if higher than `price`, else `price`).
- New items get mapped categories. Tobacco/vapes/lottery are skipped.
- Offer prices are written as `// special offer £X until DD/MM/YY` or `// members £X until ...` line comments. Multibuys/meal deals are skipped. Expired offer comments are removed.
- Out-of-stock flags are set/cleared (`oos:["coop"]`).
- Receipt-sourced prices can differ from the online shop. Rule `p.id === 5741` (Coke Zero 8-pack) keeps its receipt price; delete or change it once resolved.
- After the run: review the BIG MOVES list in the dry run; strip stale offer comments after 20/10/26, 27/10/26, 03/01/27 if not already removed.