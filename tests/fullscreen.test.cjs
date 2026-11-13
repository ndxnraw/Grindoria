const test = require('node:test'), assert = require('node:assert/strict');
const { createGame } = require('./helpers/game.cjs');

test('browser fullscreen requests the game shell, tracks actual changes and exits without losing controls', async () => {
  const { run, elements, listeners } = createGame();
  const shell=elements.get('game-shell');let entered=0,exited=0;
  shell.requestFullscreen=async()=>{entered++;run('document.fullscreenElement=$("game-shell");');listeners.get('document:fullscreenchange')();};
  run('document.exitFullscreen=async()=>{document.fullscreenElement=null;};keys.w=true;');
  assert.equal(await run('toggleGameFullscreen()'),true);assert.equal(entered,1);assert.equal(run('fullscreenState.active'),true);
  assert.equal(elements.get('fullscreen').attributes['aria-pressed'],'true');assert.equal(run('keys.w'),false);
  run('document.fullscreenElement=null;');listeners.get('document:fullscreenchange')();assert.equal(run('fullscreenState.active'),false);
  assert.equal(await run('setGameFullscreen(true)'),true);
  assert.equal(await run('setGameFullscreen(false)'),true);assert.equal(run('fullscreenState.active'),false);
  let prevented=false;listeners.get('keydown')({key:'F10',repeat:true,preventDefault(){prevented=true;}});assert(prevented);assert.equal(entered,2);
});

test('rejected or unsupported fullscreen leaves real state intact and permits retry', async () => {
  const { run, elements }=createGame();
  assert.equal(await run('toggleGameFullscreen()'),false);assert.equal(run('fullscreenState.active'),false);assert.equal(run('fullscreenState.busy'),false);
  elements.get('game-shell').requestFullscreen=async()=>{throw Error('denied');};assert.equal(await run('toggleGameFullscreen()'),false);
  assert.match(elements.get('toast').textContent,/nepodarilo/);assert.equal(run('fullscreenState.busy'),false);
});

test('browser Escape lock is acquired and released while only the F10 toggle can exit',async()=>{
 const {run,elements,listeners}=createGame();let locks=0,unlocks=0;
 elements.get('fullscreen').keyboard={lock:async keys=>{assert.deepEqual(Array.from(keys),['Escape']);locks++;},unlock(){unlocks++;}};
 run('globalThis.navigator={keyboard:$("fullscreen").keyboard};');
 elements.get('game-shell').requestFullscreen=async()=>{run('document.fullscreenElement=$("game-shell");');listeners.get('document:fullscreenchange')();};
 run('document.exitFullscreen=async()=>{document.fullscreenElement=null;};');
 assert(await run('setGameFullscreen(true)'));await Promise.resolve();assert.equal(locks,1);assert.equal(run('fullscreenState.keyboardLocked'),true);
 assert.equal(await run('toggleGameFullscreen()'),false);assert.equal(run('fullscreenState.active'),true);
 listeners.get('keydown')({key:'Escape',preventDefault(){}});assert.equal(run('fullscreenState.active'),true);
 assert.equal(await run('toggleGameFullscreen("F10")'),true);assert.equal(run('fullscreenState.active'),false);assert(unlocks>0);
});

test('pending keyboard permission never blocks F10 and a late grant cannot relock a closed fullscreen',async()=>{
 const {run,elements,listeners}=createGame();let grant;
 elements.get('fullscreen').keyboard={lock:()=>new Promise(resolve=>grant=resolve),unlock(){}};
 run('globalThis.navigator={keyboard:$("fullscreen").keyboard};');
 elements.get('game-shell').requestFullscreen=async()=>{run('document.fullscreenElement=$("game-shell");');listeners.get('document:fullscreenchange')();};
 run('document.exitFullscreen=async()=>{document.fullscreenElement=null;};');
 assert(await run('setGameFullscreen(true)'));assert.equal(run('fullscreenState.busy'),false);
 assert(await run('toggleGameFullscreen("F10")'));grant();await Promise.resolve();assert.equal(run('fullscreenState.keyboardLocked'),false);assert.equal(run('fullscreenState.active'),false);
});
