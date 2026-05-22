'use strict';

const HEADER = [
  'Name', 'UrlPattern', 'FilterField', 'FilterValue',
  'FilterOperator', 'Language', 'Country', 'Currency',
];

function escapeField(value) {
  const s = value == null ? '' : String(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowToLine(row) {
  return HEADER.map(col => escapeField(row[col])).join(',');
}

function serialize(rows) {
  const lines = [HEADER.join(',')];
  for (const r of rows) lines.push(rowToLine(r));
  return lines.join('\r\n') + '\r\n';
}

module.exports = { HEADER, serialize };
