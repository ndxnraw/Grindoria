const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
exports.runtimeSources = function () {
  const html = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8');
  return [...html.matchAll(/<script src="([^"\n]+)"><\/script>/g)]
    // Pointer dragging is exercised with the real vendored library in browser tests.
    .filter(match => !match[1].startsWith('js/vendor/'))
    .map(match => fs.readFileSync(path.join(root, 'src', match[1]), 'utf8'));
};

exports.runtimeSource=()=>exports.runtimeSources().join('\n\n');
