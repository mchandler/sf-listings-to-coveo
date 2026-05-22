'use strict';

const { execFile } = require('child_process');

function runSf(args) {
  return new Promise((resolve, reject) => {
    // shell: true on Windows lets the shell resolve `sf` → `sf.cmd`. Args
    // here are internal constants plus the validated org alias and SOQL
    // query strings — the alias is regex-validated in lib/args.js and the
    // SOQL strings are built from internal constants and SF Ids fetched
    // from the org itself, so there is no shell-injection surface.
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

async function query(orgAlias, soql) {
  const stdout = await runSf(['data', 'query', '--query', soql, '--target-org', orgAlias, '--json']);
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
}

module.exports = { query };
