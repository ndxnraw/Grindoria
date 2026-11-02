const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
exports.runtimeSource = function () {
  const html = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8');
  return [...html.matchAll(/<script src="([^"\n]+)"><\/script>/g)]
    .map(match => fs.readFileSync(path.join(root, 'src', match[1]), 'utf8')).join('\n\n');
};
