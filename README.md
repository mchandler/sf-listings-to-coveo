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
   e.g. `sf org login web --alias your-org-alias`
4. Clone this repo. No `npm install` is required — the script has no runtime
   dependencies.

## Usage

```bash
node generate-listings-csv.js \
  --org your-org-alias \
  --base-url "https://orgname.sandbox.my.site.com/YourStore" \
  --prefix mystore-export
```

| Argument | Required | Description | Example |
|---|---|---|---|
| `--org` | Yes | SF CLI target org alias | `your-org-alias` |
| `--base-url` | Yes | Storefront base URL (no trailing slash) | `https://orgname.my.site.com/YourStore` |
| `--prefix` | Yes | Output filename prefix | `mystore-export` |
| `--webstore-name` | No | WebStore name (default set in `lib/args.js`) | |
| `--output-dir` | No | Output directory (default: current working dir) | |

The CSV is written to `{prefix}-listings-export-{yyyy-MM-dd-HHmmss}.csv`.
