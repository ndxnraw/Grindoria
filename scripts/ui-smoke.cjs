// Requires Playwright; PLAYWRIGHT_MODULE and BROWSER_EXECUTABLE may select local installs.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const output=path.resolve(process.env.UI_SMOKE_OUTPUT||'work/ui-smoke');fs.mkdirSync(output,{recursive:true});
 const report={browser:browser.version(),errors:[],externalRequests:[]};
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))report.externalRequests.push(r.url());});
  await page.goto('file://'+path.resolve(__dirname,'../dist/Grindoria.html'));
  await page.evaluate(()=>{createCharacter('Rozhranie','warrior');playCharacter();p.level=10;p.points=27;p.gold=10000;p.hp=maxHP();p.mp=maxMP();addGearItem(generateEquipmentItem('armor',1,10));save();});
  for(const key of ['c','i','n','h'])await page.keyboard.press(key);
  assert.equal(await page.evaluate(()=>gameWindows.size),4);assert.equal(await page.evaluate(()=>paused),false);
  await page.keyboard.press('i');assert.equal(await page.evaluate(()=>gameWindows.size),3);await page.keyboard.press('i');
  await page.evaluate(()=>frontGameWindow(gameWindows.get('character'),true));
  const character=page.locator('[data-window-key="character"]'),bar=character.locator('.window-titlebar');
  const before=await character.boundingBox(),handle=await bar.boundingBox();
  await page.mouse.move(handle.x+85,handle.y+15);await page.mouse.down();await page.mouse.move(handle.x+255,handle.y+85,{steps:14});await page.mouse.up();
  const after=await character.boundingBox();assert(after.x>before.x+140);assert(after.y>before.y+50);
  report.drag={before:{x:before.x,y:before.y},after:{x:after.x,y:after.y}};
  await character.locator('.window-minimize').click();assert.equal(await character.locator('.window-body').isVisible(),false);
  await page.keyboard.press('c');assert.equal(await character.locator('.window-body').isVisible(),true);
  const initialStrength=await page.evaluate(()=>p.strength);await character.locator('[data-character-stat="strength"]').click();assert.equal(await page.evaluate(()=>p.strength),initialStrength+1);
  // Two service layers and inventory retain independent handlers and IDs.
  await page.evaluate(()=>{closeAllGameWindows();p.x=NPCS.merchant.x;p.y=NPCS.merchant.y;marketPanel('merchant');careerPanel('biology');inventory();});
  await page.evaluate(()=>frontGameWindow(gameWindows.get('career:biology')));
  const hoverItem=page.locator('[data-window-key="inventory"] .grid-item').first();
  await hoverItem.hover();assert(await page.locator('[data-window-key="inventory"] [data-ui-id="item-tooltip"]').isVisible());
  assert.equal(await page.evaluate(()=>panelState.key),'career:biology');
  await page.mouse.move(700,450);
  const oldPots=await page.evaluate(()=>p.potions);
  await page.locator('[data-window-key="market:merchant"] [data-market-buy="potions"]').evaluate(b=>b.click());
  assert.equal(await page.evaluate(()=>p.potions),oldPots+3);assert.equal(await page.evaluate(()=>gameWindows.size),3);
  await page.evaluate(()=>{withGameWindow('inventory',()=>{$('modalcard').scrollTop=150;inventory();});});
  assert.equal(await page.evaluate(()=>gameWindows.get('inventory').body.scrollTop),150);
  await page.locator('[data-window-key="career:biology"] .system-directory summary').evaluate(b=>b.click());
  await page.locator('[data-window-key="career:biology"] [data-career-tab="forge"]').evaluate(b=>b.click());
  assert.equal(await page.evaluate(()=>gameWindows.has('career:forge')&&gameWindows.has('career:biology')),true);
  const ids=await page.locator('[id]').evaluateAll(nodes=>nodes.map(n=>n.id));assert.equal(new Set(ids).size,ids.length);
  await page.evaluate(()=>{careerPanel('crafting');activeGameWindow.craftingFilter='weapon';careerPanel('crafting');careerPanel('alchemy');activeGameWindow.craftingFilter='materials';careerPanel('alchemy');refreshOpenGameWindows(2);});
  assert.equal(await page.locator('[data-window-key="career:crafting"] select').inputValue(),'weapon');
  assert.equal(await page.locator('[data-window-key="career:alchemy"] select').inputValue(),'materials');
  await page.evaluate(()=>{closeAllGameWindows();inventory();});
  const armorId=await page.evaluate(()=>p.bag[0].uid);
  const gear=page.locator('[data-window-key="inventory"] [data-entry="gear:'+armorId+'"]');
  const oldCell=await page.evaluate(()=>p.bag[0].cell);
  await gear.dragTo(page.locator('[data-window-key="inventory"] [data-cell="33"]'));
  assert.notEqual(await page.evaluate(()=>p.bag[0].cell),oldCell);
  await gear.dragTo(page.locator('[data-window-key="inventory"] [data-equip-slot="armor"]'));
  assert.equal(await page.evaluate(()=>p.equipped.armor?.uid),armorId);
  await page.locator('[data-window-key="inventory"] [data-equip-slot="armor"]').dblclick();
  assert.equal(await page.evaluate(uid=>p.bag.some(i=>i.uid===uid),armorId),true);
  assert.equal(await page.evaluate(()=>p.equipped.armor),null);
  await page.evaluate(()=>requestInventoryDrop('gear:'+p.bag[0].uid));
  const bagSize=await page.evaluate(()=>p.bag.length);await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>inventoryDropPending),null);assert.equal(await page.evaluate(()=>p.bag.length),bagSize);assert(await page.locator('[data-window-key="inventory"]').isVisible());
  // The world continues beneath layers; live refresh never clears held movement keys.
  await page.evaluate(()=>{closeAllGameWindows();characterPanel();inventory();keys.d=true;refreshOpenGameWindows(2);});
  assert.equal(await page.evaluate(()=>keys.d),true);await page.evaluate(()=>keysClear());
  await page.screenshot({path:path.join(output,'desktop.png')});
  await page.evaluate(()=>{closeAllGameWindows();p.x=600;p.y=600;cam.x=p.x;cam.y=p.y;});
  const x=await page.evaluate(()=>p.x);await page.mouse.click(970,700);await page.waitForTimeout(350);
  assert(await page.evaluate(()=>p.x)>x);assert.equal(await page.evaluate(()=>target),null);
  await page.keyboard.press('w');assert.equal(await page.evaluate(()=>clickDestination),null);
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>gameWindows.has('system-menu')),true);await page.keyboard.press('Escape');
  await page.evaluate(()=>{loadMap('valley',true);p.x=1000;p.y=1600;cam.x=p.x;cam.y=p.y;p.mp=maxMP();spellCD.fill(0);window.recordedSlots=[];window.actualCast=castSkill;castSkill=i=>{recordedSlots.push(i);return actualCast(i);};});
  await page.keyboard.press('1');assert.equal(await page.evaluate(()=>spellCD[0]>0),true);
  await page.keyboard.press('F2');assert.deepEqual(await page.evaluate(()=>recordedSlots),[0,1]);
  await page.keyboard.press('v');assert.equal(await page.evaluate(()=>gameWindows.has('spellbook')),true);assert.deepEqual(await page.evaluate(()=>recordedSlots),[0,1]);
  await page.keyboard.down('Alt');assert.equal(await page.evaluate(()=>keys.Alt),true);await page.keyboard.up('Alt');assert.equal(await page.evaluate(()=>keys.Alt),false);
  await page.evaluate(()=>{travelCombat.time=5;});await page.keyboard.press('m');assert(await page.locator('[data-window-key="large-map"]').isVisible());
  await page.evaluate(()=>{p.x=1200;drawLargeMap(true);});assert.match(await page.locator('[data-window-key="large-map"] [data-ui-id="atlas-position"]').textContent(),/1200/);
  // Editing a real numeric confirmation field never casts skills or opens windows.
  await page.evaluate(()=>{inventoryTab='supplies';inventory();requestInventoryDrop('material:ore');});
  // Choose an existing supply if no ore is carried.
  await page.evaluate(()=>{if(!inventoryDropPending)requestInventoryDrop('potions');});
  const input=page.locator('[data-window-key="inventory"] input[type=number]');
  assert.equal(await input.count(),1);await input.focus();const windowCount=await page.evaluate(()=>gameWindows.size);await page.keyboard.press('m');await page.keyboard.press('1');assert.equal(await page.evaluate(()=>gameWindows.size),windowCount);assert.deepEqual(await page.evaluate(()=>recordedSlots),[0,1]);
  await page.evaluate(()=>{closeAllGameWindows();loadMap('town',true);save();});await page.reload();await page.evaluate(()=>{playCharacter();characterPanel();});
  assert.equal(Math.round((await character.boundingBox()).x),Math.round(after.x));
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{closeAllGameWindows();inventory();characterPanel();largeMapPanel();});
  await page.screenshot({path:path.join(output,'mobile.png')});
  report.mobile=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,windows:[...gameWindows.values()].map(w=>({key:w.key,x:w.node.getBoundingClientRect().x,width:w.node.getBoundingClientRect().width,y:w.node.getBoundingClientRect().y}))}));
  assert.equal(report.mobile.overflow,false);for(const w of report.mobile.windows){assert(w.x>=0);assert(w.width<=390);assert(w.x+w.width<=391);assert(w.y<690);}
  report.windowCount=await page.evaluate(()=>gameWindows.size);
  await page.evaluate(()=>{closeModal('large-map');closeModal('character');frontGameWindow(gameWindows.get('inventory'));});
  await page.screenshot({path:path.join(output,'mobile-inventory.png')});
  report.mobileInventory=await page.locator('[data-window-key="inventory"] .window-body').evaluate(el=>({width:el.clientWidth,contentWidth:el.scrollWidth}));
  assert(report.mobileInventory.contentWidth<=report.mobileInventory.width+1);
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.externalRequests,[]);
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
