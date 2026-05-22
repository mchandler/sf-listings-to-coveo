'use strict';

const fs = require('fs');
const path = require('path');

const { resolveConfig } = require('./lib/args');
const sf = require('./lib/sf-query');
const { indexCategories, buildRows } = require('./lib/categories');
const { serialize } = require('./lib/csv');

function timestamp(d = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return [
    d.getFullYear(),
    pad(d.getMonth() + 1),
    pad(d.getDate()),
  ].join('-') + '-' + [
    pad(d.getHours()),
    pad(d.getMinutes()),
    pad(d.getSeconds()),
  ].join('');
}

function escapeSoqlLiteral(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function getCatalogId(org, webstoreName) {
  const escaped = escapeSoqlLiteral(webstoreName);
  const records = await sf.query(org,
    `SELECT ProductCatalogId FROM WebStoreCatalog ` +
    `WHERE SalesStoreId IN (SELECT Id FROM WebStore WHERE Name = '${escaped}') ` +
    `LIMIT 1`
  );
  if (records.length === 0) {
    throw new Error(`No WebStoreCatalog found for WebStore "${webstoreName}" in org "${org}"`);
  }
  return records[0].ProductCatalogId;
}

async function getCategories(org, catalogId) {
  return sf.query(org,
    `SELECT Id, Name, ParentCategoryId FROM ProductCategory ` +
    `WHERE CatalogId = '${catalogId}' AND IsNavigational = true`
  );
}

function countRoots(byId) {
  let n = 0;
  for (const c of byId.values()) if (!c.ParentCategoryId) n++;
  return n;
}

async function main() {
  const cfg = resolveConfig(process.argv.slice(2));

  console.log(`Querying catalog from ${cfg.org}...`);
  const catalogId = await getCatalogId(cfg.org, cfg.webstoreName);
  console.log(`Catalog ID: ${catalogId}`);

  console.log('Querying navigational categories (IsNavigational = true)...');
  const rawCategories = await getCategories(cfg.org, catalogId);
  console.log(`Total navigational categories in catalog: ${rawCategories.length}`);

  const byId = indexCategories(rawCategories);

  const rootCount = countRoots(byId);
  console.log(`Root categories: ${rootCount}`);
  for (const c of byId.values()) {
    if (!c.ParentCategoryId) console.log(`  ${c.Name} (${c.Id})`);
  }

  console.log('Building CSV rows...');
  const rows = buildRows(byId, cfg.baseUrl);
  console.log(`Listing rows generated: ${rows.length}`);

  const filename = `${cfg.prefix}-listings-export-${timestamp()}.csv`;
  const outputPath = path.join(cfg.outputDir, filename);
  fs.writeFileSync(outputPath, serialize(rows), 'utf8');
  console.log(`CSV written to: ${outputPath}`);
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
