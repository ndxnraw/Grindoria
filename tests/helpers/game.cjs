const vm = require('node:vm');
const { runtimeSource } = require('./source.cjs');

exports.createGame = function (oldSave) {
  const elements = new Map(), saved = new Map(), listeners = new Map();
  if (oldSave) saved.set('jade-realm-save-v1', JSON.stringify(oldSave));
  const paint = new Proxy({ createRadialGradient: () => ({ addColorStop() {} }) }, { get: (o, key) => key in o ? o[key] : () => {} });
  const element = id => {
    if (!elements.has(id)) elements.set(id, { style: {}, textContent: '', innerHTML: '', hidden: true, querySelector: selector => element(id + selector), getContext: () => paint, getBoundingClientRect: () => ({ width: 1200, height: 700 }), addEventListener() {}, focus() {} });
    return elements.get(id);
  };
  const context = vm.createContext({
    document: { getElementById: element, querySelectorAll: () => [], addEventListener() {}, body: { classList: { add() {} } } },
    window: { addEventListener: (name, fn) => listeners.set(name, fn) }, devicePixelRatio: 1,
    localStorage: { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) },
    requestAnimationFrame() {}, console
  });
  vm.runInContext(runtimeSource(), context);
  return { run: code => vm.runInContext(code, context), elements, saved, listeners };
};
