const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const output=path.resolve(process.env.UI_SMOKE_OUTPUT||'work/inventory-drag');fs.mkdirSync(output,{recursive:true});const errors=[];
 try{
 const page=await browser.newPage({viewport:{width:1366,height:768}});page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+path.resolve(__dirname,'../dist/Grindoria.html'));
 await page.evaluate(()=>{createCharacter('Presun','warrior');playCharacter();p.bag=[];for(const slot of ['armor','weapon','bracelet'])addGearItem(generateEquipmentItem(slot,1,1));moveGearItem(p.bag[2].uid,22);p.career.materials.ore=10;inventory();});
 const armor=await page.evaluate(()=>p.bag[0].uid),before=await page.evaluate(()=>JSON.stringify(p.bag));
 const item=()=>page.locator('[data-window-key="inventory"] [data-entry="gear:'+armor+'"]');
 async function dragStart(source){const r=await source.boundingBox();await page.mouse.move(r.x+r.width/2,r.y+8);await page.mouse.down();await page.mouse.move(r.x+r.width/2+8,r.y+8,{steps:3});}
 async function hoverCell(cell){const r=await page.locator('[data-window-key="inventory"] [data-cell="'+cell+'"]').boundingBox();await page.mouse.move(r.x+r.width/2,r.y+8,{steps:5});await page.mouse.move(r.x+r.width/2,r.y+8);}
 // Direct overlap, then overlap only in the lower cell of a two-cell item.
 for(const cell of [1,17]){
  await dragStart(item());await hoverCell(cell);await page.locator('.inventory-drag-preview.is-invalid').waitFor();
  assert.match(await page.locator('.inventory-drag-preview').evaluate(el=>getComputedStyle(el).borderColor),/255, 84, 76/);
  await page.screenshot({path:path.join(output,'blocked-'+cell+'.png')});await page.mouse.up();
  assert.equal(await page.evaluate(()=>JSON.stringify(p.bag)),before);assert.equal(await page.locator('.inventory-drag-preview').count(),0);
 }
 await dragStart(item());await hoverCell(10);assert.equal(await page.locator('.inventory-drag-preview.is-invalid').count(),0);await page.mouse.up();assert.equal(await page.evaluate(()=>p.bag[0].cell),10);
 // Supply stacks also reject overlap without exchanging or merging quantities.
 await page.locator('[data-inv-tab="supplies"]').click();const supplies=await page.evaluate(()=>JSON.stringify(p.inventory.supplyCells));
 const oreCell=await page.evaluate(()=>p.inventory.supplyCells['material:ore']);await dragStart(page.locator('[data-entry="potions"]'));await hoverCell(oreCell);await page.locator('.inventory-drag-preview.is-invalid').waitFor();await page.mouse.up();assert.equal(await page.evaluate(()=>JSON.stringify(p.inventory.supplyCells)),supplies);
 // Cancel, Escape and the titlebar close all clear the pending selection.
 await page.locator('[data-inv-tab="gear"]').click();
 for(const cancel of ['button','escape','close']){
  const original=await page.evaluate(()=>JSON.stringify(p.bag));await item().press('Enter');assert.equal(await page.locator('[data-window-key="inventory"] [data-entry][aria-pressed="true"]').count(),1);await dragStart(item());await page.mouse.move(600,400,{steps:8});await page.mouse.up();const dialog=page.locator('[data-window-key="inventory-drop"]');await dialog.waitFor();
  if(cancel==='button')await dialog.locator('[data-ui-id="inv-drop-cancel"]').click();else if(cancel==='escape')await page.keyboard.press('Escape');else await dialog.locator('.window-close').click();
  assert.equal(await page.evaluate(()=>inventorySelection),null);assert.equal(await page.locator('[data-window-key="inventory"] [data-entry][aria-pressed="true"]').count(),0);assert.equal(await page.locator('.inventory-drag-preview').count(),0);
  await page.locator('[data-window-key="inventory"] [data-cell="30"]').click();assert.equal(await page.evaluate(()=>JSON.stringify(p.bag)),original);
 }
 // Dragging outside still asks before discarding, and Enter confirms.
 await dragStart(item());await page.mouse.move(600,400,{steps:8});await page.mouse.up();await page.locator('[data-window-key="inventory-drop"]').waitFor();await page.keyboard.press('Enter');assert.equal(await page.evaluate(uid=>p.bag.some(i=>i.uid===uid),armor),false);assert.equal(await page.locator('.inventory-drag-preview').count(),0);
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({blockedOverlap:true,blockedPartialOverlap:true,emptyCellMove:true,blockedSupplySwap:true,cancelClearsSelection:true,outsideDiscard:true,errors},null,2));console.log('Inventory drag checks passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
