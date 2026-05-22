'use strict';

const { slugify } = require('./slug');

// Build a Map<categoryId, category> from raw SF rows.
function indexCategories(rows) {
  const byId = new Map();
  for (const r of rows) {
    byId.set(r.Id, {
      Id: r.Id,
      Name: r.Name,
      ParentCategoryId: r.ParentCategoryId || null,
    });
  }
  return byId;
}

// Walk from a node up through its ancestors, returning the chain root-first
// (root, ..., this). Uses a cycle guard and a depth cap as a safety net.
function ancestorChain(catId, byId, maxDepth = 50) {
  const chain = [];
  const seen = new Set();
  let current = catId;
  let depth = 0;
  while (current && depth < maxDepth) {
    if (seen.has(current)) break;
    seen.add(current);
    const node = byId.get(current);
    if (!node) break;
    chain.push(node);
    current = node.ParentCategoryId;
    depth++;
  }
  chain.reverse();
  return chain;
}

function buildRows(byId, baseUrl) {
  const rows = [];
  for (const cat of byId.values()) {
    const chain = ancestorChain(cat.Id, byId);
    if (chain.length === 0) continue;

    const namePath = chain.map(n => n.Name).join('|');
    const slugSegments = chain.map(n => slugify(n.Name));
    const urlPattern = `${baseUrl}/category/${slugSegments.join('/')}/${cat.Id}`;

    rows.push({
      Name: namePath,
      UrlPattern: urlPattern,
      FilterField: 'ec_category',
      FilterValue: namePath,
      FilterOperator: 'contains',
      Language: '',
      Country: '',
      Currency: '',
    });
  }
  rows.sort((a, b) => a.Name.localeCompare(b.Name));
  return rows;
}

module.exports = { indexCategories, ancestorChain, buildRows };
