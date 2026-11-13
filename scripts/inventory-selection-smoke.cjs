const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const output=path.resolve(process.env.UI_SMOKE_OUTPUT||'work/inventory-selection');fs.mkdirSync(output,{recursive:true});const errors=[],report={};
 try{
 const page=await browser.newPage({viewport:{width:1366,height:768}});page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+path.resolve(__dirname,'../dist/Grindoria.html'));
 await page.evaluate(()=>{createCharacter('Vyber','warrior');playCharacter();p.bag=[];for(const slot of ['armor','weapon'])addGearItem(generateEquipmentItem(slot,1,1));inventory();});
 const uid=await page.evaluate(()=>p.bag[0].uid),source=()=>page.locator('[data-window-key="inventory"] [data-entry="gear:'+uid+'"]');
 async function state(){return source().evaluate(el=>({pressed:el.getAttribute('aria-pressed'),focusVisible:el.matches(':focus-visible'),outline:getComputedStyle(el).outlineWidth,selected:inventorySelection}));}
 async function start(){const r=await source().boundingBox();await page.mouse.move(r.x+r.width/2,r.y+8);await page.mouse.down();await page.mouse.move(r.x+r.width/2+8,r.y+8,{steps:3});}
 // A rejected drag must not leave the selection that existed before dragging.
 await source().click();await start();const occupied=await page.locator('[data-window-key="inventory"] [data-cell="1"]').boundingBox();await page.mouse.move(occupied.x+occupied.width/2,occupied.y+8,{steps:5});await page.mouse.move(occupied.x+occupied.width/2,occupied.y+8);await page.mouse.up();report.rejectedDrag=await state();await page.screenshot({path:path.join(output,'after-rejected-drag.png')});
 // A pointer click never selects an item.
 await page.evaluate(()=>withGameWindow('inventory',()=>selectInventoryEntry(null)));await source().click();report.singleClick=await state();await source().click();report.repeatClick=await state();
 // Closing and reopening inventory cannot restore an old pending selection.
 await source().press('Enter');assert.equal((await state()).pressed,'true');await page.keyboard.press('i');await page.keyboard.press('i');report.reopened=await state();
 // Canceling an actual outside drop removes both visual and logical selection.
 for(const cancel of ['button','escape','close']){
  await source().click();await start();await page.mouse.move(600,400,{steps:8});await page.mouse.up();const dialog=page.locator('[data-window-key="inventory-drop"]');await dialog.waitFor();
  if(cancel==='button')await dialog.locator('[data-ui-id="inv-drop-cancel"]').click();else if(cancel==='escape')await page.keyboard.press('Escape');else await dialog.locator('.window-close').click();
  report[cancel]=await state();await page.screenshot({path:path.join(output,'after-cancel-'+cancel+'.png')});
 }
 await page.keyboard.press('F10');await page.waitForFunction(()=>document.fullscreenElement?.id==='game-shell');
 await source().click();await start();const fullTarget=await page.locator('[data-window-key="inventory"] [data-cell="1"]').boundingBox();await page.mouse.move(fullTarget.x+fullTarget.width/2,fullTarget.y+8,{steps:5});await page.mouse.move(fullTarget.x+fullTarget.width/2,fullTarget.y+8);await page.mouse.up();report.fullscreenRejectedDrag=await state();
 await source().click();await start();await page.mouse.move(600,400,{steps:8});await page.mouse.up();await page.locator('[data-window-key="inventory-drop"]').waitFor();await page.keyboard.press('Escape');report.fullscreenCanceled=await state();
 if(await page.evaluate(()=>!!document.fullscreenElement))await page.keyboard.press('F10');
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({report,errors},null,2));console.log(JSON.stringify({report,errors},null,2));assert.deepEqual(errors,[]);
 for(const [name,s]of Object.entries(report)){assert.equal(s.selected,null,name+' retains logical selection');assert.equal(s.pressed,'false',name+' retains pressed appearance');assert.equal(s.focusVisible,false,name+' retains item focus outline');}
 assert.equal(await page.evaluate(()=>p.bag.length),2);assert.equal(await page.locator('.inventory-drag-preview').count(),0);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
