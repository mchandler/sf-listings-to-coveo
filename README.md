# sf-listings-to-coveo

Generates a Coveo-compatible Listing Pages CSV from a Salesforce B2B Commerce
product category hierarchy.

## Setup

1. Install Node.js 18 or newer.
2. Install the Salesforce CLI: `npm install -g @salesforce/cli`
3. Authenticate to each target org:
   ```bash
   sf org login web --alias <alias>
   ```
   e.g. `sf org login web --alias ecommpilot`
4. Clone this repo. No `npm install` is required — the script has no runtime
   dependencies.

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

### Environment reference

| Org Alias | Base URL | Prefix |
|---|---|---|
| `ecommpilot` | `https://andersen--ecommpilot.sandbox.my.site.com/AndersenPartsStore` | `partsstore-ecommpilot` |
| `andersentest` | `https://andersen--test.sandbox.my.site.com/AndersenPartsStore` | `partsstore-test` |
| `andersenstage` | `https://andersen--stage.sandbox.my.site.com/AndersenPartsStore` | `partsstore-stage` |
| `andersenprod` | `https://andersen.my.site.com/AndersenPartsStore` | `partsstore` |
