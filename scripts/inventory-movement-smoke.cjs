const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const output=path.resolve(process.env.UI_SMOKE_OUTPUT||'work/inventory-movement');fs.mkdirSync(output,{recursive:true});const errors=[],results=[];
 try{
 const page=await browser.newPage({viewport:{width:1366,height:768}});page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+path.resolve(__dirname,'../dist/Grindoria.html'));
 await page.evaluate(()=>{createCharacter('Pohyb','warrior');playCharacter();p.bag=[];addGearItem(generateEquipmentItem('weapon',1,1));p.x=600;p.y=600;inventory();});
 for(const mode of ['windowed','fullscreen']){
  if(mode==='fullscreen'){await page.keyboard.press('F10');await page.waitForFunction(()=>document.fullscreenElement?.id==='game-shell');}
  for(const key of ['w','a','s','d','ArrowUp','ArrowLeft','ArrowDown','ArrowRight']){
   for(const target of ['.grid-item','[data-cell="44"]']){
    await page.locator('[data-window-key="inventory"] '+target).click();
    const before=await page.evaluate(()=>({x:p.x,y:p.y}));await page.keyboard.down(key);await page.waitForTimeout(100);
    const state=await page.evaluate(()=>({selection:inventorySelection,pressed:document.querySelectorAll('[data-window-key="inventory"] [aria-pressed="true"][data-entry]').length,focused:document.querySelectorAll('[data-window-key="inventory"] .inventory-grid :focus-visible').length,canvasFocused:document.activeElement===canvas,x:p.x,y:p.y,open:gameWindows.has('inventory')}));await page.keyboard.up(key);results.push({mode,key,target,before,...state});
   }
  }
  await page.screenshot({path:path.join(output,'after-movement-'+mode+'.png')});
 }
 // Clicking the bag while holding movement cannot restore a sticky focus ring.
 const item=page.locator('[data-window-key="inventory"] .grid-item');
 await page.keyboard.down('w');
 await item.click();
 const afterClick=await page.evaluate(()=>p.y);
 assert.equal(await page.evaluate(()=>keys.w),true);
 assert.equal(await page.evaluate(()=>inventorySelection),null);
 assert.equal(await item.getAttribute('aria-pressed'),'false');
 await page.waitForFunction(y=>p.y<y,afterClick,{timeout:1500});
 await item.dblclick();
 assert.equal(await page.evaluate(()=>keys.w),true);
 assert.equal(await page.locator('[data-window-key="inventory"] .inventory-grid :focus-visible').count(),0);
 await page.keyboard.up('w');
 // Arrow navigation on an explicitly focused titlebar still moves the window.
 const titlebar=page.locator('[data-window-key="inventory"] .window-titlebar');await titlebar.focus();const titleBefore=await page.evaluate(()=>({x:p.x,y:p.y,windowX:gameWindows.get('inventory').x}));await page.keyboard.press('ArrowLeft');assert.deepEqual(await page.evaluate(()=>({x:p.x,y:p.y})),{x:titleBefore.x,y:titleBefore.y});assert.equal(await page.evaluate(()=>gameWindows.get('inventory').x),titleBefore.windowX-20);
 // Opening a window focuses its close button for keyboard access until movement starts.
 await page.keyboard.press('c');
 const character=page.locator('[data-window-key="character"]');
 assert.equal(await character.locator('.window-close').evaluate(el=>el===document.activeElement),true);
 await page.keyboard.down('w');
 assert.equal(await page.evaluate(()=>document.activeElement===canvas),true);
 await character.locator('.window-close').click();
 const afterClose=await page.evaluate(()=>p.y);
 await page.locator('#game-toolbar #journal').click();
 assert.equal(await page.evaluate(()=>keys.w && document.activeElement===canvas),true);
 await page.waitForFunction(y=>p.y<y,afterClose,{timeout:1500});
 await page.keyboard.up('w');
 await page.locator('[data-window-key="journal"] .window-close').click();
 // Input for discard quantities stays in the form and never moves the player.
 await page.evaluate(()=>{inventoryTab='supplies';p.career.materials.ore=10;inventory();requestInventoryDrop('material:ore');});const input=page.locator('[data-window-key="inventory-drop"] input');await input.focus();const beforeTyping=await page.evaluate(()=>({x:p.x,y:p.y}));await page.keyboard.press('w');assert.deepEqual(await page.evaluate(()=>({x:p.x,y:p.y})),beforeTyping);assert.equal(await input.evaluate(el=>document.activeElement===el),true);await page.keyboard.press('Escape');
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors},null,2));assert.deepEqual(errors,[]);
 for(const r of results){assert.equal(r.selection,null,`${r.mode} ${r.key} retains selection`);assert.equal(r.pressed,0);assert.equal(r.focused,0,`${r.mode} ${r.key} shows inventory focus`);assert(r.canvasFocused);assert(r.open);assert(Math.hypot(r.x-r.before.x,r.y-r.before.y)>0,`${r.key} did not move player`);}
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
