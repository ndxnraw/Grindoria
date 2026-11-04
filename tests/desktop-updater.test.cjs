const test=require('node:test'),assert=require('node:assert/strict'),{EventEmitter}=require('node:events');
const {installUpdater,CHANNELS}=require('../desktop/updater.cjs');
function fixture(options={}){
 const win=new EventEmitter(),updater=new EventEmitter(),handlers=new Map(),sent=[];win.webContents={mainFrame:{},isDestroyed:()=>false,send:(...args)=>sent.push(args)};
 updater.checkForUpdates=async()=>{updater.emit('update-not-available');};updater.downloadUpdate=async()=>{updater.emit('update-downloaded',{version:'1.1.0'});};updater.quitAndInstall=(...args)=>{updater.installed=args;};
 const api=installUpdater(win,{handle:(id,fn)=>handlers.set(id,fn),removeHandler:id=>handlers.delete(id)},{updater,version:'1.0.0',packaged:true,...options});
 return{win,updater,handlers,sent,api,event:{sender:win.webContents,senderFrame:win.webContents.mainFrame}};
}
test('startup checks metadata once, never downloads automatically, and preserves strict updater policies',async()=>{
 const f=fixture();let checks=0;f.updater.checkForUpdates=async()=>{checks++;await Promise.resolve();f.updater.emit('update-available',{version:'1.1.0'});};await Promise.all([f.api.check(),f.api.check()]);assert.equal(checks,1);assert.equal(f.api.snapshot().status,'available');assert.equal(f.updater.autoDownload,false);assert.equal(f.updater.autoInstallOnAppQuit,false);assert.equal(f.updater.allowDowngrade,false);assert.equal(f.updater.allowPrerelease,false);
});
test('offline failures allow retry and never install or prevent game state from existing',async()=>{
 const f=fixture();f.updater.checkForUpdates=()=>{throw Error('offline');};await f.api.check();assert.equal(f.api.snapshot().status,'error');f.updater.checkForUpdates=async()=>f.updater.emit('update-not-available');await f.api.check();assert.equal(f.api.snapshot().status,'current');assert.equal(f.updater.installed,undefined);
});
test('download progress is bounded and only verified completion enables explicit installation',async()=>{
 const scheduled=[],f=fixture({schedule:fn=>scheduled.push(fn)}),invoke=name=>f.handlers.get(CHANNELS[name])(f.event);
 assert.equal(invoke('install'),false);f.updater.emit('update-available',{version:'1.1.0'});f.updater.downloadUpdate=async()=>{f.updater.emit('download-progress',{percent:200});assert.equal(f.api.snapshot().percent,100);f.updater.emit('update-downloaded',{version:'1.1.0'});};
 let flushed=false;f.win.webContents.session={flushStorageData(){flushed=true;}};
 await invoke('download');assert.equal(f.api.snapshot().status,'downloaded');assert.equal(invoke('install'),true);assert.equal(f.updater.installed,undefined);scheduled[0]();assert.equal(flushed,true);assert.deepEqual(f.updater.installed,[true,true]);
});
test('failed download leaves installation unavailable',async()=>{
 const f=fixture();f.updater.emit('update-available',{version:'1.1.0'});f.updater.downloadUpdate=()=>{throw Error('checksum');};await f.handlers.get(CHANNELS.download)(f.event);assert.equal(f.api.snapshot().status,'error');assert.equal(f.handlers.get(CHANNELS.install)(f.event),false);
});
test('update IPC rejects foreign windows and subframes, and unregisters on close',()=>{
 const f=fixture();for(const handler of f.handlers.values()){assert.throws(()=>handler({...f.event,sender:{}}),/sender/);assert.throws(()=>handler({...f.event,senderFrame:{}}),/sender/);}f.win.emit('closed');assert.equal(f.handlers.size,0);assert.equal(f.updater.listenerCount('update-available'),0);
});
test('development host skips network checks',async()=>{const f=fixture({packaged:false});f.updater.checkForUpdates=()=>{throw Error('must not connect');};await f.api.check();assert.equal(f.api.snapshot().status,'development');});
test('slow startup checks time out visually without blocking or installing',async()=>{
 const f=fixture({timeoutMs:5});let finish;f.updater.checkForUpdates=()=>new Promise(resolve=>finish=resolve);const pending=f.api.check();await new Promise(resolve=>setTimeout(resolve,15));assert.equal(f.api.snapshot().status,'offline');finish();await pending;assert.equal(f.updater.installed,undefined);
});
test('stable custom origin serves only the bundled game with a renderer content policy',async()=>{
 const {gameProtocolResponse}=require('../desktop/protocol.cjs');let url;const fetch=async target=>{url=target;return new Response('<html>Game</html>',{headers:{'content-type':'text/html'}});};
 const response=await gameProtocolResponse({method:'GET',url:'grindoria://game/index.html'},'C:/app/dist/Grindoria.html',fetch);assert.match(url,/Grindoria.html/);assert.match(response.headers.get('content-security-policy'),/connect-src 'none'/);assert.equal(await response.text(),'<html>Game</html>');
 for(const request of [{method:'GET',url:'grindoria://other/index.html'},{method:'GET',url:'grindoria://game/secret.txt'},{method:'POST',url:'grindoria://game/index.html'}])assert.equal((await gameProtocolResponse(request,'unused',fetch)).status,404);
});
test('renderer saves active progress before install and refuses restart when saving fails',async()=>{
 const {createGame}=require('./helpers/game.cjs'),g=createGame();let listener,installed=0;
 const api={get:async()=>({status:'downloaded',currentVersion:'1.0.0',version:'1.1.0'}),onChange:fn=>{listener=fn;return()=>{};},install:async()=>{installed++;}};
 g.run('$("desktop-updates");');g.elements.get('desktop-updates').api=api;g.run('window.grindoriaDesktop={updates:$("desktop-updates").api};initializeDesktopUpdates();');await Promise.resolve();g.run('renderDesktopUpdates();saveActiveCharacter=()=>false;');await g.elements.get('desktop-update-action').onclick();assert.equal(installed,0);assert.match(g.elements.get('desktop-update-error').textContent,/nepodarilo uložiť/);g.run('saveActiveCharacter=()=>true;');await g.elements.get('desktop-update-action').onclick();assert.equal(installed,1);listener({status:'available',currentVersion:'1.0.0',version:'<unsafe>'});assert(!g.elements.get('modalcontent').innerHTML.includes('<unsafe>'));
});
test('installer configuration publishes a GitHub NSIS feed and preserves user data',()=>{
 const config=require('../electron-builder.json');assert.equal(config.win.target[0].target,'nsis');assert.equal(config.nsis.deleteAppDataOnUninstall,false);assert.equal(config.publish[0].owner,'ndxnraw');assert.equal(config.publish[0].repo,'Grindoria');assert(config.files.includes('dist/Grindoria.html'));
});
