// Remove "// members ... until DD/MM/YY" comments whose end date is before today.
const fs = require('fs'); const f = require('path').resolve(__dirname, '..') + '/src/App.jsx';
const today = new Date(process.argv[2] || new Date().toISOString().slice(0, 10)); let n = 0;
const out = fs.readFileSync(f, 'utf8').split('\n').map(l => {
  const m = l.match(/ \/\/ members [^|]*? until (\d\d)\/(\d\d)\/(\d\d)/); if (!m) return l;
  const end = new Date(2000 + +m[3], +m[2] - 1, +m[1]); if (end >= today) return l; n++;
  let r = l.replace(/ \/\/ members [^|]*?until \d\d\/\d\d\/\d\d(?: \|)?/, '').replace(/\s+$/, '');
  return r.replace(/(\}),? ?\|?$/, (x) => x) ;
}).join('\n');
fs.writeFileSync(f, out, 'utf8'); console.log('stripped', n);
