const vm = require('node:vm');
const { runtimeSource } = require('./source.cjs');

exports.createGame = function (oldSave, storageKey = 'grindoria-save-v1', additionalStorage = {}) {
  const elements = new Map(), saved = new Map(), listeners = new Map();
  if (oldSave) saved.set(storageKey, JSON.stringify(oldSave));
  for (const [key, value] of Object.entries(additionalStorage)) saved.set(key, typeof value === 'string' ? value : JSON.stringify(value));
  const paint = new Proxy({ createRadialGradient: () => ({ addColorStop() {} }) }, { get: (o, key) => key in o ? o[key] : () => {} });
  const element = id => {
    if (!elements.has(id)) elements.set(id, { style: {}, attributes: {}, setAttribute(key, value) { this.attributes[key] = value; }, textContent: '', innerHTML: '', hidden: true, querySelector: selector => element(id + selector), getContext: () => paint, getBoundingClientRect: () => ({ width: 1200, height: 700 }), addEventListener(name, fn) { listeners.set(id + ":" + name, fn); }, focus() {} });
    return elements.get(id);
  };
  const context = vm.createContext({
    document: { getElementById: element, querySelectorAll: () => [], addEventListener: (name, fn) => listeners.set("document:" + name, fn), body: { classList: { add() {}, toggle() {} } } },
    window: { addEventListener: (name, fn) => listeners.set(name, fn) }, devicePixelRatio: 1,
    localStorage: { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value), key: index => [...saved.keys()][index] ?? null, get length() { return saved.size; } },
    requestAnimationFrame() {}, console
  });
  vm.runInContext(runtimeSource(), context);
  return { run: code => vm.runInContext(code, context), elements, saved, listeners };
};
