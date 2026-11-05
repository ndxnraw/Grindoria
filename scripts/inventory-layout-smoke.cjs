const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const output=path.resolve(process.env.UI_SMOKE_OUTPUT||'work/inventory-layout');fs.mkdirSync(output,{recursive:true});const reports=[],errors=[];
 try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+path.resolve(__dirname,'../dist/Grindoria.html'));
 await page.evaluate(()=>{createCharacter('Inventar','warrior');playCharacter();p.level=53;p.gold=747139;for(const slot of Object.keys(EQUIPMENT))p.equipped[slot]=generateEquipmentItem(slot,2,53);for(let i=0;i<10;i++)addGearItem(generateEquipmentItem(i%2?'weapon':'armor',2,53));for(let i=0;i<15;i++)addGearItem(generateEquipmentItem('bracelet',1,53));for(const id of Object.keys(MATERIALS))p.career.materials[id]=1000;p.hp=maxHP();save();});
 for(const [width,height]of [[1920,1080],[1440,900],[1366,768],[1280,720],[1024,600],[800,600],[640,480],[570,535],[390,844],[360,640],[844,390],[640,360]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>{closeAllGameWindows();inventoryTab='gear';inventoryPage=0;inventory();});
  for(const tab of ['gear','supplies']){
   if(tab==='supplies')await page.locator('[data-inv-tab="supplies"]').click();
   else {
    const slots=await page.locator('[data-window-key="inventory"] .equipment-board').evaluate(board=>Object.fromEntries([...board.querySelectorAll('[data-equip-slot]')].map(el=>{const r=el.getBoundingClientRect();return [el.dataset.equipSlot,{x:r.x,y:r.y,right:r.right,bottom:r.bottom}];})));
    const left=(a,b)=>assert(slots[a].right<=slots[b].x+1,`${width}x${height}: ${a} left of ${b}`),above=(a,b)=>assert(slots[a].bottom<=slots[b].y+1,`${width}x${height}: ${a} above ${b}`);
    left('weapon','armor');above('helmet','armor');left('armor','shield');above('shield','bracelet');left('bracelet','earrings');above('earrings','necklace');above('weapon','talisman');above('bracelet','belt');above('armor','boots');
    const footprint=await page.locator('[data-window-key="inventory"] .inventory-grid').evaluate(grid=>{
     const cell=grid.querySelector('[data-cell]').getBoundingClientRect(),gap=parseFloat(getComputedStyle(grid).rowGap);
     return {gridWidth:grid.getBoundingClientRect().width,bagWidth:grid.closest('.bag-panel').clientWidth,errors:[...grid.querySelectorAll('.grid-item')].filter(el=>{const item=p.bag.find(i=>'gear:'+i.uid===el.dataset.entry),r=el.getBoundingClientRect(),rows=item.slot==='weapon'||item.slot==='armor'?2:1;return Math.abs(r.width-cell.width)>1||Math.abs(r.height-(cell.height*rows+gap*(rows-1)))>1;}).map(el=>el.dataset.entry)};
    });assert(Math.abs(footprint.gridWidth-footprint.bagWidth)<=1,`${width}x${height}: grid must fill bag width`);assert.deepEqual(footprint.errors,[]);
    const ids=Object.keys(slots);assert.equal(ids.length,10);
    for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const a=slots[ids[i]],b=slots[ids[j]];assert(a.right<=b.x+1||b.right<=a.x+1||a.bottom<=b.y+1||b.bottom<=a.y+1,`${width}x${height}: overlapping equipment slots`);}
    await page.screenshot({path:path.join(output,`inventory-gear-${width}x${height}.png`)});
   }
   const report=await page.locator('[data-window-key="inventory"]').evaluate(node=>{const body=node.querySelector('.window-body'),grid=node.querySelector('.inventory-grid'),money=node.querySelector('.inventory-money'),rect=node.getBoundingClientRect(),bottom=grid.querySelector('[data-cell="44"]').getBoundingClientRect(),bodyRect=body.getBoundingClientRect();return {width:innerWidth,height:innerHeight,tab:inventoryTab,scrollHeight:body.scrollHeight,clientHeight:body.clientHeight,scrollWidth:body.scrollWidth,clientWidth:body.clientWidth,windowBottom:rect.bottom,windowRight:rect.right,lastRowBottom:bottom.bottom,bodyBottom:bodyRect.bottom,moneyBottom:money.getBoundingClientRect().bottom,cellHeight:bottom.height,pages:document.querySelectorAll('[data-inv-page]').length};});reports.push(report);
  }
  await page.screenshot({path:path.join(output,`inventory-${width}x${height}.png`)});
 }
 // An already open inventory must refit on resize, page changes and feedback.
 await page.setViewportSize({width:1366,height:768});await page.locator('[data-inv-tab="gear"]').click();
 await page.locator('[data-inv-page="4"]').click();
 assert.equal(await page.evaluate(()=>inventoryPage),4);
 await page.setViewportSize({width:570,height:535});
 await page.evaluate(()=>inventoryMessage('Predmety sa do tohto rozloženia nezmestia.'));
 const inventory=page.locator('[data-window-key="inventory"]');
 await inventory.locator('.window-minimize').click();await inventory.locator('.window-minimize').click();
 const resized=await inventory.locator('.window-body').evaluate(el=>({scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));assert(resized.scrollHeight<=resized.clientHeight+1&&resized.scrollWidth<=resized.clientWidth+1,JSON.stringify(resized));
 assert.equal(await inventory.locator('[data-cell="224"]').isVisible(),true);
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({reports,errors},null,2));console.log(JSON.stringify({reports,errors},null,2));assert.deepEqual(errors,[]);
 for(const r of reports){assert(r.scrollHeight<=r.clientHeight+1,`${r.width}x${r.height} ${r.tab}: vertical scroll ${r.scrollHeight}/${r.clientHeight}`);assert(r.scrollWidth<=r.clientWidth+1,`${r.width}x${r.height}: horizontal scroll`);assert(r.lastRowBottom<=r.bodyBottom+1,`${r.width}x${r.height}: last row clipped`);assert(r.moneyBottom<=r.bodyBottom+1,`${r.width}x${r.height}: Yang clipped`);assert(r.windowBottom<=r.height+1&&r.windowRight<=r.width+1);if(r.tab==='gear')assert.equal(r.pages,5);}
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
