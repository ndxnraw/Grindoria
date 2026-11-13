const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const output=path.resolve(process.env.UI_SMOKE_OUTPUT||'work/inventory-window');fs.mkdirSync(output,{recursive:true});const errors=[],report={};
 try{
 const page=await browser.newPage({viewport:{width:1366,height:768}});page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+path.resolve(__dirname,'../dist/Grindoria.html'));
 await page.evaluate(()=>{createCharacter('Okno','warrior');playCharacter();p.bag=[];for(const slot of ['armor','weapon'])addGearItem(generateEquipmentItem(slot,1,1));inventory();});
 const inventory=page.locator('[data-window-key="inventory"]'),baseline=await inventory.boundingBox(),title=await inventory.locator('.window-titlebar').boundingBox();report.baseline=baseline;report.moves=[];
 await page.mouse.move(title.x+60,title.y+15);await page.mouse.down();
 for(const [dx,dy]of [[-30,-8],[-70,-15],[-110,-15],[-150,0],[-180,15]]){await page.mouse.move(title.x+60+dx,title.y+15+dy,{steps:3});report.moves.push(await inventory.boundingBox());}
 await page.mouse.up();await page.screenshot({path:path.join(output,'window-moved.png')});
 await page.keyboard.press('F10');await page.waitForFunction(()=>document.fullscreenElement?.id==='game-shell');
 const armor=await page.evaluate(()=>p.bag[0].uid),source=await inventory.locator('[data-entry="gear:'+armor+'"]').boundingBox(),target=await inventory.locator('[data-cell="1"]').boundingBox();
 await page.mouse.move(source.x+source.width/2,source.y+8);await page.mouse.down();await page.mouse.move(source.x+source.width/2+8,source.y+8,{steps:3});await page.mouse.move(target.x+target.width/2,target.y+8,{steps:6});await page.mouse.move(target.x+target.width/2,target.y+8);await page.locator('.inventory-drag-preview.is-invalid').waitFor();
 report.fullscreenPreview=await page.locator('.inventory-drag-preview').evaluate(el=>({insideFullscreen:document.fullscreenElement.contains(el),border:getComputedStyle(el).borderColor}));await page.screenshot({path:path.join(output,'fullscreen-blocked.png')});await page.mouse.up();assert.equal(await page.locator('.inventory-drag-preview').count(),0);await page.keyboard.press('F10');
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({...report,errors},null,2));console.log(JSON.stringify({...report,errors},null,2));assert.deepEqual(errors,[]);
 assert(report.moves.some(r=>Math.abs(r.x-baseline.x)>20),'window must move');
 assert(report.moves.every(r=>Math.abs(r.width-baseline.width)<1&&Math.abs(r.height-baseline.height)<1),'window dimensions changed while dragging');
 assert(report.fullscreenPreview.insideFullscreen,'drag preview must render inside the fullscreen element');assert.match(report.fullscreenPreview.border,/255, 84, 76/);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
