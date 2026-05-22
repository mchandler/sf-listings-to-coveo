'use strict';

const fs = require('fs');
const path = require('path');

const USAGE = `Usage:
  node generate-listings-csv.js \\
    --org <alias> --base-url <url> --prefix <name> \\
    --webstore-name <name> [options]

Required:
  --org <alias>           SF CLI target org alias (e.g., my-sandbox)
  --base-url <url>        Storefront base URL (no trailing slash)
  --prefix <name>         Output filename prefix
  --webstore-name <name>  WebStore Name to look up (exact match)

Options:
  --output-dir <path>     Directory to write the CSV to (default: cwd)
  -h, --help              Show this help
`;

// SF CLI aliases are letters/digits/underscore/hyphen. Validate because the
// value is passed to the `sf` executable; on Windows shell mode is enabled,
// so we don't want any shell-injection surface.
const SF_ORG_ALIAS_RE = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

function fail(msg) {
  console.error(msg);
  console.error('');
  console.error(USAGE);
  process.exit(1);
}

function takeValue(argv, i, flag) {
  const v = argv[i + 1];
  if (v == null || v.startsWith('--')) fail(`${flag} requires a value`);
  return v;
}

function parseArgs(argv) {
  const out = {
    org: null,
    baseUrl: null,
    prefix: null,
    webstoreName: null,
    outputDir: process.cwd(),
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '--org':            out.org = takeValue(argv, i++, a); break;
      case '--base-url':       out.baseUrl = takeValue(argv, i++, a); break;
      case '--prefix':         out.prefix = takeValue(argv, i++, a); break;
      case '--webstore-name':  out.webstoreName = takeValue(argv, i++, a); break;
      case '--output-dir':     out.outputDir = takeValue(argv, i++, a); break;
      case '-h':
      case '--help':
        console.log(USAGE);
        process.exit(0);
      default:
        fail(`Unknown argument: ${a}`);
    }
  }

  return out;
}

function resolveConfig(argv) {
  const cfg = parseArgs(argv);

  if (!cfg.org) fail('Missing --org');
  if (!cfg.baseUrl) fail('Missing --base-url');
  if (!cfg.prefix) fail('Missing --prefix');
  if (!cfg.webstoreName) fail('Missing --webstore-name');

  if (!SF_ORG_ALIAS_RE.test(cfg.org)) {
    fail(`--org must be a valid SF CLI alias (letters, digits, underscore, hyphen): ${cfg.org}`);
  }

  cfg.baseUrl = cfg.baseUrl.replace(/\/$/, '');
  cfg.outputDir = path.resolve(process.cwd(), cfg.outputDir);

  if (!fs.existsSync(cfg.outputDir)) fail(`Output directory does not exist: ${cfg.outputDir}`);

  return cfg;
}

module.exports = { resolveConfig, USAGE };
