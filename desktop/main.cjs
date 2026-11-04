const {app,BrowserWindow,ipcMain,protocol,net}=require('electron');
const path=require('node:path'),fs=require('node:fs');
const {installFullscreen}=require('./fullscreen.cjs');
const {installUpdater}=require('./updater.cjs');
const {gameProtocolResponse}=require('./protocol.cjs');
app.setName('Grindoria');
const userData=process.env.GRINDORIA_USER_DATA_DIR?path.resolve(process.env.GRINDORIA_USER_DATA_DIR):path.join(app.getPath('appData'),'Grindoria');
fs.mkdirSync(userData,{recursive:true});app.setPath('userData',userData);
protocol.registerSchemesAsPrivileged([{scheme:'grindoria',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
let mainWindow;
const logUpdate=error=>{try{const file=path.join(app.getPath('userData'),'updates.log');if(fs.existsSync(file)&&fs.statSync(file).size>262144)fs.writeFileSync(file,'');fs.appendFileSync(file,new Date().toISOString()+' '+String(error?.code||error?.message||error)+'\n');}catch{}};
function createWindow(){
 mainWindow=new BrowserWindow({title:'Grindoria',width:1440,height:960,minWidth:960,minHeight:640,show:false,autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 installFullscreen(mainWindow,ipcMain);
 const {autoUpdater}=require('electron-updater');autoUpdater.logger={info(){},warn:logUpdate,error:logUpdate,debug(){}};
 // Keep a process-level error listener while a window is being closed.
 if(!autoUpdater.listenerCount('error'))autoUpdater.on('error',logUpdate);
 const updates=installUpdater(mainWindow,ipcMain,{updater:autoUpdater,version:app.getVersion(),packaged:app.isPackaged,logger:logUpdate});
 mainWindow.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 mainWindow.webContents.on('will-navigate',event=>event.preventDefault());
 mainWindow.webContents.session.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));
 mainWindow.webContents.once('did-finish-load',()=>{void updates.check();});
 mainWindow.once('ready-to-show',()=>{if(process.env.GRINDORIA_SMOKE_TEST!=='1')mainWindow.show();});
 mainWindow.on('closed',()=>{mainWindow=null;});
 mainWindow.loadURL('grindoria://game/index.html');
 if(process.env.GRINDORIA_SMOKE_TEST==='1')require('./smoke.cjs').runDesktopSmoke(mainWindow,updates,app);
}
if(!app.requestSingleInstanceLock())app.quit();
else{
 app.on('second-instance',()=>{if(mainWindow){if(mainWindow.isMinimized())mainWindow.restore();mainWindow.focus();}});
 app.whenReady().then(()=>{
  const entry=path.join(__dirname,'../dist/Grindoria.html');
  protocol.handle('grindoria',request=>gameProtocolResponse(request,entry,url=>net.fetch(url)));
  createWindow();app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)createWindow();});
 });
 app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
}
