const CHANNELS={get:'grindoria:updates:get',check:'grindoria:updates:check',download:'grindoria:updates:download',install:'grindoria:updates:install',changed:'grindoria:updates:changed'};
function installUpdater(win,ipcMain,{updater,version,packaged,logger=()=>{},schedule=setImmediate,timeoutMs=12000}){
 let state={status:packaged?'idle':'development',currentVersion:version,version:null,percent:0},checking=null,downloading=null,disposed=false;
 updater.autoDownload=false;updater.autoInstallOnAppQuit=false;updater.allowPrerelease=false;updater.allowDowngrade=false;
 const snapshot=()=>({...state});
 const trusted=event=>event.sender===win.webContents&&event.senderFrame===win.webContents.mainFrame;
 const publish=patch=>{if(disposed)return;state={...state,...patch};if(!win.webContents.isDestroyed())win.webContents.send(CHANNELS.changed,snapshot());};
 const fail=error=>{logger(error);publish({status:'error',percent:0});};
 const handlers={
  'checking-for-update':()=>publish({status:'checking',percent:0}),
  'update-available':info=>publish({status:'available',version:String(info.version),percent:0}),
  'update-not-available':()=>publish({status:'current',version:null,percent:0}),
  'download-progress':info=>publish({status:'downloading',percent:Math.max(0,Math.min(100,Number(info.percent)||0))}),
  'update-downloaded':info=>publish({status:'downloaded',version:String(info.version),percent:100}),
  error:fail
 };
 for(const [event,handler]of Object.entries(handlers))updater.on(event,handler);
 async function check(){
  if(disposed||!packaged||downloading||state.status==='downloaded'||state.status==='installing')return snapshot();
  if(checking)return checking;
  publish({status:'checking',percent:0});
  const timer=setTimeout(()=>{if(state.status==='checking')publish({status:'offline',percent:0});},timeoutMs);timer.unref?.();
  checking=Promise.resolve().then(()=>updater.checkForUpdates()).catch(fail).finally(()=>{clearTimeout(timer);checking=null;}).then(snapshot);
  return checking;
 }
 async function download(){
  if(disposed||!packaged||checking||state.status!=='available'||downloading)return snapshot();
  publish({status:'downloading',percent:0});
  downloading=Promise.resolve().then(()=>updater.downloadUpdate()).catch(fail).finally(()=>{downloading=null;}).then(snapshot);
  return downloading;
 }
 function install(){
  if(disposed||!packaged||state.status!=='downloaded')return false;
  publish({status:'installing'});
  schedule(()=>{try{win.webContents.session?.flushStorageData();updater.quitAndInstall(true,true);}catch(error){fail(error);}});return true;
 }
 const methods={get:snapshot,check,download,install};
 for(const [name,method]of Object.entries(methods))ipcMain.handle(CHANNELS[name],event=>{if(!trusted(event))throw Error('Invalid updater sender');return method();});
 win.once('closed',()=>{disposed=true;for(const key of Object.keys(methods))ipcMain.removeHandler(CHANNELS[key]);for(const [event,handler]of Object.entries(handlers))updater.removeListener(event,handler);});
 return {check,snapshot};
}
module.exports={installUpdater,CHANNELS};
