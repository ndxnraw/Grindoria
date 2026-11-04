const vm = require('node:vm');
const { runtimeSource, runtimeSources } = require('./source.cjs');

exports.createGame = function (oldSave, storageKey = 'grindoria-save-v1', additionalStorage = {}, options = {}) {
  const elements = new Map(), saved = new Map(), listeners = new Map();
  if (oldSave) saved.set(storageKey, JSON.stringify(oldSave));
  for (const [key, value] of Object.entries(additionalStorage)) saved.set(key, typeof value === 'string' ? value : JSON.stringify(value));
  const paint = new Proxy({ createRadialGradient: () => ({ addColorStop() {} }) }, { get: (o, key) => key in o ? o[key] : () => {} });
  const element = id => {
    if (!elements.has(id)) elements.set(id, { style: {}, attributes: {}, setAttribute(key, value) { this.attributes[key] = value; }, textContent: '', innerHTML: '', hidden: true, querySelector: selector => element(id + selector), getContext: () => paint, getBoundingClientRect: () => ({ width: 1200, height: 700 }), addEventListener(name, fn) { listeners.set(id + ":" + name, fn); }, focus() {} });
    return elements.get(id);
  };
  const context = vm.createContext({
    document: { getElementById: element, querySelectorAll: () => [], addEventListener: (name, fn) => listeners.set("document:" + name, fn), body: { classList: { add() {}, remove() {}, toggle() {} } } },
    window: { addEventListener: (name, fn) => listeners.set(name, fn) }, devicePixelRatio: 1,
    localStorage: { getItem: key => saved.get(key), setItem: (key, value) => { if(options.failWrites)throw new Error("quota");saved.set(key, value); }, key: index => [...saved.keys()][index] ?? null, get length() { return saved.size; } },
    requestAnimationFrame() {}, TextEncoder, console
  });
  if(options.separateScripts)for(const source of runtimeSources())vm.runInContext(source,context);else vm.runInContext(runtimeSource(), context);
  // Combat/inventory unit fixtures stay unarmed; creation and keepStarter tests use the real loadout.
  if (!options.emptyRoster && !vm.runInContext("characterStore.error",context)) vm.runInContext('var fixtureCreated=!characterStore.account.order.length;if(fixtureCreated)createCharacter("Testovnik","warrior");playCharacter();'+(!options.keepStarter?'if(fixtureCreated){p.equipped.weapon=null;saveActiveCharacter();}':'')+'if(p.mapId==="town"){loadMap("valley",true);p.x=map().entry.x;p.y=map().entry.y;cam.x=p.x;cam.y=p.y;}running=false;document.body.classList.remove("started");',context);
  return { run: code => vm.runInContext(code, context), elements, saved, listeners };
};

exports.readSavedAccount = saved => JSON.parse(saved.get('grindoria-characters-v1'));
exports.readSavedProfile = (saved,id) => { const account=exports.readSavedAccount(saved);return account.profiles[id||account.selectedId].data; };
exports.createEmptyGame = (additionalStorage={}) => exports.createGame(null,'grindoria-save-v1',additionalStorage,{emptyRoster:true});
