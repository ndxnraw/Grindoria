const fs=require('node:fs'),path=require('node:path');
function runDesktopSmoke(win,updates,app){
 const report=path.join(app.getPath('userData'),'smoke-report.json');
 const timer=setTimeout(()=>{fs.writeFileSync(report,JSON.stringify({ok:false,error:'Smoke timeout'}));app.exit(1);},30000);
 win.webContents.once('did-finish-load',async()=>{
  try{
   const first=await win.webContents.executeJavaScript(`(async()=>{if(location.origin!=='grindoria://game')throw Error('Origin');if(typeof require!=='undefined'||typeof process!=='undefined')throw Error('Renderer isolation');if(!window.grindoriaDesktop?.updates)throw Error('Update bridge');const id=characterStore.account.order[0]||createCharacter('DesktopTest','warrior');playCharacter(id);p.gold=12345;if(!saveActiveCharacter())throw Error('Save');return {name:p.name,version:document.getElementById('game-version').textContent,fullscreen:await window.grindoriaDesktop.fullscreen.get(),updates:await window.grindoriaDesktop.updates.get()};})()`);
   await new Promise(resolve=>{win.webContents.once('did-finish-load',resolve);win.webContents.reload();});
   const restored=await win.webContents.executeJavaScript(`(()=>{playCharacter();if(p.gold!==12345)throw Error('Restore');return {gold:p.gold,weapon:p.equipped.weapon.name,upgrade:p.equipped.weapon.enhance};})()`);
   await Promise.race([updates.check(),new Promise(resolve=>setTimeout(resolve,13000))]);
   clearTimeout(timer);fs.writeFileSync(report,JSON.stringify({ok:true,packaged:app.isPackaged,...first,restored,updateState:updates.snapshot()},null,2));app.exit(0);
  }catch(error){clearTimeout(timer);fs.writeFileSync(report,JSON.stringify({ok:false,error:error.message}));app.exit(1);}
 });
}
module.exports={runDesktopSmoke};
