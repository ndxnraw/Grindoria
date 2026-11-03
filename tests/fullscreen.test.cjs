const test = require('node:test'), assert = require('node:assert/strict'), vm = require('node:vm'), fs = require('node:fs'), path = require('node:path');
const { EventEmitter } = require('node:events');
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

test('native bridge controls Electron fullscreen and Escape exits even before the game starts', async () => {
  const { run, elements, listeners }=createGame();let changed;const requests=[];
  run('let nativeClasses={};document.body.classList.toggle=(name,value)=>nativeClasses[name]=value;');
  const bridge={get:async()=>false,onChange:callback=>{changed=callback;return()=>{};},set:async value=>{requests.push(value);changed(value);return value;}};
  // Inject the same narrow contract supplied by the isolated preload.
  elements.get('fullscreen').bridge=bridge;run('window.grindoriaDesktop={fullscreen:$("fullscreen").bridge};initializeFullscreen();');await Promise.resolve();
  assert.equal(await run('toggleGameFullscreen()'),true);assert.equal(run('nativeClasses["native-fullscreen"]'),true);
  listeners.get('keydown')({key:'Escape',repeat:false,preventDefault(){}});await Promise.resolve();
  assert.equal(run('fullscreenState.active'),false);assert.deepEqual(requests,[true,false]);
  changed(true);assert.equal(elements.get('fullscreen').attributes['aria-pressed'],'true');changed(false);assert.equal(run('nativeClasses["native-fullscreen"]'),false);
});

test('Electron handler validates its sender and waits for real OS transition events', async () => {
  const { installFullscreen }=require('../desktop/fullscreen.cjs'), win=new EventEmitter(), handlers=new Map(), sent=[];
  let state=false,requested;
  win.webContents={mainFrame:{},isDestroyed:()=>false,send:(...args)=>sent.push(args)};win.isFullScreen=()=>state;win.setFullScreen=value=>{requested=value;};
  const ipc={handle:(name,fn)=>handlers.set(name,fn),removeHandler:name=>handlers.delete(name)};
  installFullscreen(win,ipc);const valid={sender:win.webContents,senderFrame:win.webContents.mainFrame};
  const get=handlers.get('grindoria:fullscreen:get'),set=handlers.get('grindoria:fullscreen:set');
  assert.equal(get(valid),false);assert.throws(()=>get({...valid,senderFrame:{}}));assert.throws(()=>set(valid,'true'));
  const pending=set(valid,true);let settled=false;pending.then(()=>settled=true);await Promise.resolve();assert.equal(requested,true);assert.equal(settled,false);
  await assert.rejects(set(valid,false),/progress/);state=true;win.emit('enter-full-screen');assert.equal(await pending,true);assert.deepEqual(sent.at(-1),['grindoria:fullscreen:changed',true]);
  const leaving=set(valid,false);state=false;win.emit('leave-full-screen');assert.equal(await leaving,false);
  const interrupted=set(valid,true);win.emit('closed');await assert.rejects(interrupted,/closed/);assert.equal(handlers.size,0);
});

test('preload exposes only fullscreen methods and strips IPC event objects from notifications', async () => {
  let exposed,listener,removed;
  const bridge={exposeInMainWorld:(name,api)=>{assert.equal(name,'grindoriaDesktop');exposed=api;}};
  const ipc={invoke:async(name,value)=>value??false,on:(name,fn)=>listener=fn,removeListener:(name,fn)=>removed=fn};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../desktop/preload.cjs'),'utf8'),{require:name=>{assert.equal(name,'electron');return{contextBridge:bridge,ipcRenderer:ipc};}});
  assert.deepEqual(Object.keys(exposed.fullscreen),['get','set','onChange']);await assert.rejects(exposed.fullscreen.set('yes'));
  let values;const unsubscribe=exposed.fullscreen.onChange((...args)=>values=args);listener({secret:'IPC'},true);assert.deepEqual(values,[true]);unsubscribe();assert.equal(removed,listener);
});
