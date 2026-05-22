'use strict';

function slugify(name) {
  let s = String(name).toLowerCase();
  s = s.replace(/[^a-z0-9 ]/g, '');
  s = s.replace(/ +/g, '-');
  s = s.replace(/-+/g, '-');
  s = s.replace(/-+$/g, '');
  return s;
}

module.exports = { slugify };
