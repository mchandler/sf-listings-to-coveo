'use strict';

const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

function runSf(args) {
  return new Promise((resolve, reject) => {
    // shell: true on Windows lets the shell resolve `sf` → `sf.cmd`. Args
    // here are internal constants plus a validated org alias and a temp
    // file path — no untrusted shell-meta characters reach cmd.exe.
    execFile('sf', args, {
      maxBuffer: 20 * 1024 * 1024,
      shell: process.platform === 'win32',
    }, (err, stdout, stderr) => {
      if (err) {
        const msg = stderr && stderr.trim() ? stderr.trim() : err.message;
        return reject(new Error(`sf ${args.join(' ')} failed: ${msg}`));
      }
      resolve(stdout);
    });
  });
}

// Writes the SOQL to a temp file and invokes `sf data query --file`. Going
// through a file avoids Windows cmd.exe interpreting parentheses and other
// SOQL meta-characters as shell tokens (e.g. subqueries like `... IN (SELECT
// ...)` get mangled when passed via `--query` on Windows).
async function query(orgAlias, soql) {
  const tmp = path.join(os.tmpdir(), `sf-listings-${crypto.randomBytes(8).toString('hex')}.soql`);
  fs.writeFileSync(tmp, soql, 'utf8');
  try {
    const stdout = await runSf(['data', 'query', '--file', tmp, '--target-org', orgAlias, '--json']);
    let parsed;
    try {
      parsed = JSON.parse(stdout);
    } catch (e) {
      throw new Error(`Could not parse sf data query output: ${e.message}`);
    }
    if (!parsed || !parsed.result || !Array.isArray(parsed.result.records)) {
      throw new Error(`sf data query did not return result.records (status=${parsed && parsed.status})`);
    }
    return parsed.result.records;
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) { /* ignore cleanup errors */ }
  }
}

module.exports = { query };
