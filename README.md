# sf-listings-to-coveo

Generates a Coveo-compatible Listing Pages CSV from a Salesforce B2B Commerce
product category hierarchy. Replaces the per-environment Python scripts.

## Prerequisites

- Node.js 18+
- SF CLI installed and authenticated to each target org:
  `sf org login web --alias <name>`

No Salesforce metadata is required. The script queries `WebStoreCatalog` and
`ProductCategory` records via the SF CLI.

## Usage

```bash
node generate-listings-csv.js \
  --org andersentest \
  --base-url "https://andersen--test.sandbox.my.site.com/AndersenPartsStore" \
  --prefix partsstore-test
```

| Argument | Required | Description | Example |
|---|---|---|---|
| `--org` | Yes | SF CLI target org alias | `andersentest` |
| `--base-url` | Yes | Storefront base URL (no trailing slash) | `https://andersen.my.site.com/AndersenPartsStore` |
| `--prefix` | Yes | Output filename prefix | `partsstore-test` |
| `--webstore-name` | No | WebStore name (default: `Andersen Parts Store`) | |
| `--output-dir` | No | Output directory (default: current working dir) | |

The CSV is written to `{prefix}-listings-export-{yyyy-MM-dd-HHmmss}.csv`.

## Behavior

1. Query `WebStoreCatalog` to get the `ProductCatalogId` for the named WebStore.
2. Query all `ProductCategory` records in that catalog where
   `IsNavigational = true` (the "Show In Menu" filter).
3. Build pipe-delimited ancestor paths starting from each root.
4. Emit one CSV row per category. Both roots and subcategories use
   `FilterOperator = contains` with `FilterValue` equal to the path. The root
   is included in the path for every row.
5. Sort rows by `Name` and write to disk.

## CSV columns

| Column | Value |
|---|---|
| `Name` | Pipe-delimited path from root to this category |
| `UrlPattern` | `{base-url}/category/{slug-segments}/{CategoryId}` |
| `FilterField` | `ec_category` |
| `FilterValue` | Same as `Name` |
| `FilterOperator` | `contains` |
| `Language` / `Country` / `Currency` | empty |

## Environment reference

| Org Alias | Base URL | Prefix |
|---|---|---|
| `ecommpilot` | `https://andersen--ecommpilot.sandbox.my.site.com/AndersenPartsStore` | `partsstore-ecommpilot` |
| `andersentest` | `https://andersen--test.sandbox.my.site.com/AndersenPartsStore` | `partsstore-test` |
| `andersenstage` | `https://andersen--stage.sandbox.my.site.com/AndersenPartsStore` | `partsstore-stage` |
| `andersenprod` | `https://andersen.my.site.com/AndersenPartsStore` | `partsstore` |
