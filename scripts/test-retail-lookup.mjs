#!/usr/bin/env node
/**
 * Check the goal importer against real store codes on a running ChoreQuest server.
 *
 *   node scripts/test-retail-lookup.mjs 6643857 6642280 B0D22HBFK1
 *   node scripts/test-retail-lookup.mjs --url http://localhost:3000 "https://www.bestbuy.com/site/.../6643857.p?skuId=6643857"
 *
 * In Docker:  docker compose exec <service> node scripts/test-retail-lookup.mjs 6643857
 * Server-side details (which source answered, why an answer was rejected):
 *   docker compose logs | grep "Retail Lookup"
 */
const args = process.argv.slice(2);
let base = 'http://localhost:3000';
const codes = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url') base = args[++i];
  else codes.push(args[i]);
}
if (!codes.length) {
  console.log('Usage: node scripts/test-retail-lookup.mjs [--url http://host:3000] <SKU|ASIN|link> ...');
  process.exit(1);
}

let failures = 0;
for (const query of codes) {
  const started = Date.now();
  try {
    const r = await fetch(`${base}/api/retail-lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, retailer: 'all' }),
    });
    const d = await r.json();
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    if (d.success && d.product) {
      const p = d.product;
      console.log(`OK    ${query}  (${d.source}, ${secs}s)`);
      console.log(`      ${p.title}`);
      console.log(`      ${p.retailer} · $${Number(p.targetCost).toFixed(2)}${p.priceNeedsCheck ? ' (check price)' : ''}`);
      if (p.productUrl) console.log(`      ${p.productUrl}`);
    } else {
      failures++;
      console.log(`MISS  ${query}  (${secs}s): ${d.message || r.status}`);
    }
  } catch (e) {
    failures++;
    console.log(`ERROR ${query}: ${e.message} (is the server running at ${base}?)`);
  }
}
process.exit(failures ? 1 : 0);
