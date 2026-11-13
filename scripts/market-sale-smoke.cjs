const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const output=path.resolve(process.env.UI_SMOKE_OUTPUT||'work/market-sale');fs.mkdirSync(output,{recursive:true});const errors=[],layouts=[];
 try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+path.resolve(__dirname,'../dist/Grindoria.html'));
 await page.evaluate(()=>{createCharacter('Predaj','warrior');playCharacter();p.level=75;p.gold=12345678;p.bag=[];for(const slot of ['weapon','armor','bracelet'])addGearItem(generateEquipmentItem(slot,1,30));p.career.materials.ore=50;loadMap('town',true);p.x=NPCS.merchant.x;p.y=NPCS.merchant.y;inventory();marketPanel();});
 const uid=await page.evaluate(()=>p.bag[0].uid),source=()=>page.locator('[data-window-key="inventory"] [data-entry="gear:'+uid+'"]');
 async function dragToShop(locator,trader='merchant',release=true){const from=await locator.boundingBox(),to=await page.locator('[data-window-key="market:'+trader+'"] .service-grid').boundingBox();await page.mouse.move(from.x+from.width/2,from.y+8);await page.mouse.down();await page.mouse.move(from.x+from.width/2-8,from.y+8,{steps:3});await page.mouse.move(to.x+to.width/2,to.y+16,{steps:8});await page.mouse.move(to.x+to.width/2,to.y+16);if(release)await page.mouse.up();}
 const original=await page.evaluate(()=>JSON.stringify([p.gold,p.bag]));
 for(const cancel of ['button','escape','close']){
  await dragToShop(source());const dialog=page.locator('[data-window-key="market-sale"]');await dialog.waitFor();assert.equal(await page.locator('[data-window-key="inventory-drop"]').count(),0);assert.equal(await page.evaluate(()=>JSON.stringify([p.gold,p.bag])),original);const r=await dialog.boundingBox();assert(Math.abs(r.x+r.width/2-720)<2);assert(Math.abs(r.y+r.height/2-450)<2);await page.screenshot({path:path.join(output,'confirm-'+cancel+'.png')});
  if(cancel==='button')await dialog.locator('[data-ui-id="market-sale-cancel"]').click();else if(cancel==='escape')await page.keyboard.press('Escape');else await dialog.locator('.window-close').click();assert.equal(await page.evaluate(()=>JSON.stringify([p.gold,p.bag])),original);assert.equal(await page.evaluate(()=>inventorySelection),null);
 }
 await dragToShop(source());const quote=await page.evaluate(()=>marketSalePending.price),gold=await page.evaluate(()=>p.gold);await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>p.gold),gold+quote);assert.equal(await page.evaluate(uid=>p.bag.some(i=>i.uid===uid),uid),false);assert.equal(await page.evaluate(()=>drops.length),0);
 // Armsdealer uses its own quote and bonus, with explicit stack quantities.
 await page.evaluate(()=>{p.x=NPCS.armsdealer.x;p.y=NPCS.armsdealer.y;marketPanel('armsdealer');});await page.locator('[data-inv-tab="supplies"]').click();await dragToShop(page.locator('[data-window-key="inventory"] [data-entry="material:ore"]'),'armsdealer');const oreQuote=await page.evaluate(()=>marketSalePending.price),beforeOre=await page.evaluate(()=>({gold:p.gold,ore:p.career.materials.ore}));await page.locator('[data-ui-id="market-sale-count"]').fill('10');assert((await page.locator('[data-ui-id="market-sale-total"]').textContent()).includes(String(10*oreQuote)));await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>p.gold),beforeOre.gold+10*oreQuote);assert.equal(await page.evaluate(()=>p.career.materials.ore),beforeOre.ore-10);
 // Unsupported items never open either a sale or a discard confirmation.
 await dragToShop(page.locator('[data-window-key="inventory"] [data-entry="potions"]'),'armsdealer',false);await page.locator('.inventory-drag-preview.is-invalid').waitFor();await page.mouse.up();assert.equal(await page.locator('[data-window-key="market-sale"], [data-window-key="inventory-drop"]').count(),0);
 await page.keyboard.press('F10');await page.waitForFunction(()=>document.fullscreenElement?.id==='game-shell');await page.locator('[data-inv-tab="gear"]').click();const fullUid=await page.evaluate(()=>p.bag[0].uid),fullBefore=await page.evaluate(()=>JSON.stringify([p.bag,p.gold]));await dragToShop(page.locator('[data-window-key="inventory"] [data-entry="gear:'+fullUid+'"]'),'armsdealer');await page.locator('[data-window-key="market-sale"]').waitFor();assert.equal(await page.locator('[data-window-key="market-sale"]').evaluate(el=>document.fullscreenElement.contains(el)),true);await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>JSON.stringify([p.bag,p.gold])),fullBefore);if(await page.evaluate(()=>!!document.fullscreenElement))await page.keyboard.press('F10');
 // Every offer of both traders must fit without horizontal or vertical scrolling.
 for(const [width,height]of [[1920,1080],[1366,768],[1280,720],[1024,600],[800,600],[640,480],[570,535],[390,844],[360,640],[844,390],[640,360]]){
  await page.setViewportSize({width,height});
  for(const trader of ['merchant','armsdealer']){
   await page.evaluate(trader=>{closeAllGameWindows();p.x=NPCS[trader].x;p.y=NPCS[trader].y;marketPanel(trader);},trader);const shop=page.locator('[data-window-key="market:'+trader+'"]');assert.equal(await shop.locator('[data-market-mode], .service-wallet, [data-ui-id="balance"]').count(),0);
   const ids=await page.evaluate(trader=>marketOffers(trader).map(o=>o.id),trader);
   for(const id of ids){await shop.locator('[data-market-select="'+id+'"]').click();const layout=await shop.locator('.window-body').evaluate(el=>({height:el.clientHeight,scrollHeight:el.scrollHeight,width:el.clientWidth,scrollWidth:el.scrollWidth}));layouts.push({trader,id,viewport:[width,height],...layout});assert(layout.scrollHeight<=layout.height+1,`${trader} ${id} ${width}x${height} vertical ${layout.scrollHeight}/${layout.height}`);assert(layout.scrollWidth<=layout.width+1);assert.equal(await shop.evaluate(el=>el.textContent.includes(uiNumber(p.gold))),false);}
   await page.screenshot({path:path.join(output,trader+'-'+width+'x'+height+'.png')});
  }
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({cancel:true,centered:true,confirmedSale:true,stackQuantity:true,unsupportedRejected:true,layouts,errors},null,2));console.log('Merchant drag sale and layout checks passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
