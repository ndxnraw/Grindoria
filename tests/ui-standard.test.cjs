const test=require('node:test'),assert=require('node:assert/strict');
const {createGame}=require('./helpers/game.cjs');
function setup(){const g=createGame();g.run('running=true;loadMap("town",true);p.x=NPCS.merchant.x;p.y=NPCS.merchant.y;p.gold=10000;addGearItem({slot:"weapon",name:"Test meč",rarity:1,bonus:10,value:50});');return g;}
test('same panel rerenders preserve scroll; changing or reopening a panel starts at top',()=>{
 const {run}=setup();run('modal("first",{key:"market"});$("modalcard").scrollTop=420;modal("second",{key:"market"});');assert.equal(run('$("modalcard").scrollTop'),420);
 run('modal("other",{key:"book"});');assert.equal(run('$("modalcard").scrollTop'),0);run('$("modalcard").scrollTop=120;closeModal();modal("book",{key:"book"});');assert.equal(run('$("modalcard").scrollTop'),0);
});
test('requirements show owned, required and missing counts without color dependence',()=>{
 const {run}=setup();run('p.career.materials.ore=2;');const html=run('costRequirements({ore:5,gold:10001})');assert.match(html,/Máš \/ Potrebuješ/);assert.match(html,/Chýba 3/);assert.match(html,/Chýba 1/);assert.match(html,/>2<\/b>/);assert.match(run('costRequirements({ore:1})'),/Splnené/);
});
test('market and inventory refresh clear obsolete scrolling',()=>{
 const {run}=setup();run('marketPanel("merchant");$("modalcard").scrollTop=360;sellMarketGear(p.bag[0].uid,"merchant");marketPanel("merchant");');assert.equal(run('$("modalcard").scrollTop'),0);
 run('inventory();$("modalcard").scrollTop=220;inventory();');assert.equal(run('$("modalcard").scrollTop'),0);
});
test('drop confirmation leaves items untouched until confirmed and can be canceled',()=>{
 const {run}=setup();run('inventory();var uid=p.bag[0].uid;');assert(run('requestInventoryDrop("gear:"+uid)'));assert.equal(run('p.bag.length'),1);assert.equal(run('drops.length'),0);
 run('$("inv-drop-cancel").onclick();');assert.equal(run('p.bag.length'),1);assert.equal(run('inventoryDropPending'),null);assert.equal(run('inventorySelection'),null);
});
test('confirmed equipment drops are recoverable once, preserve attributes and cannot duplicate',()=>{
 const {run}=setup();run('inventory();var uid=p.bag[0].uid;requestInventoryDrop("gear:"+uid);');assert(run('confirmInventoryDrop(1)'));assert(!run('confirmInventoryDrop(1)'));assert.equal(run('p.bag.length'),0);assert.equal(run('drops.length'),1);assert.equal(run('drops[0].item.bonus'),10);
 run('closeModal();updateGroundLoot(1);');assert.equal(run('drops.length'),1);assert.equal(run('pickNearbyGroundDrops()'),1);assert.equal(run('p.bag.length'),1);assert.equal(run('pickNearbyGroundDrops()'),0);
});
test('partial supply drops stay manual across save/reload and return exactly their count',()=>{
 const {run,saved}=setup();run('p.career.materials.ore=10;inventoryTab="supplies";inventory();requestInventoryDrop("material:ore");');assert(!run('confirmInventoryDrop(11)'));assert.equal(run('p.career.materials.ore'),10);assert(run('confirmInventoryDrop(3)'));assert.equal(run('p.career.materials.ore'),7);
 run('closeModal();updateGroundLoot(1);save();');assert.equal(run('drops.length'),1);assert.equal(run('p.career.materials.ore'),7);
 const next=createGame(null,'grindoria-save-v1',Object.fromEntries(saved));next.run('running=true;loadMap("town",true);p.x=NPCS.merchant.x;p.y=NPCS.merchant.y;updateGroundLoot(1);');assert.equal(next.run('p.career.materials.ore'),7);assert.equal(next.run('pickNearbyGroundDrops()'),1);assert.equal(next.run('p.career.materials.ore'),10);
});
test('equipped items, stale sessions, invalid counts and full ground cannot be dropped',()=>{
 const {run}=setup();run('equipItem(0);inventory();');assert(!run('requestInventoryDrop("equipped:weapon")'));run('unequipItem("weapon");requestInventoryDrop("gear:"+p.bag[0].uid);');assert(!run('confirmInventoryDrop(2)'));
 run('inventoryDropPending.characterId="stale";');assert(!run('confirmInventoryDrop(1)'));assert.equal(run('p.bag.length'),1);
 run('inventoryDropPending.characterId=characterStore.activeId;drops.length=5000;');assert(!run('confirmInventoryDrop(1)'));assert.equal(run('p.bag.length'),1);
});
test('Escape cancels a pending drop while keeping inventory open and all items',()=>{
 const {run}=setup();run('inventory();requestInventoryDrop("gear:"+p.bag[0].uid);handleGameKeyDown({key:"Escape",preventDefault(){}});');assert.equal(run('inventoryDropPending'),null);assert.equal(run('inventorySelection'),null);assert.equal(run('$("modal").hidden'),false);assert.equal(run('p.bag.length'),1);
});
test('closing a discard dialog clears stack selection without consuming or moving supplies',()=>{
 const {run}=setup();run('p.career.materials.ore=10;inventoryTab="supplies";inventory();var cells=JSON.stringify(p.inventory.supplyCells);requestInventoryDrop("material:ore");closeModal("inventory-drop");');
 assert.equal(run('inventorySelection'),null);assert.equal(run('inventoryDropPending'),null);assert.equal(run('inventoryDrag'),null);assert.equal(run('p.career.materials.ore'),10);assert.equal(run('JSON.stringify(p.inventory.supplyCells)'),run('cells'));assert(run('gameWindows.has("inventory")'));
});
test('closing and reopening inventory cannot restore an old selected item',()=>{
 const {run}=setup();run('inventory();selectInventoryEntry("gear:"+p.bag[0].uid);closeModal("inventory");inventory();');assert.equal(run('inventorySelection'),null);assert.equal(run('p.bag.length'),1);
});
test('finishing a rejected or canceled drag clears its selection without changing items',()=>{
 const {run}=setup();run('inventory();var before=JSON.stringify(p.bag);selectInventoryEntry("gear:"+p.bag[0].uid);inventoryDrag={id:inventorySelection};finishInventoryItemDrag();');assert.equal(run('inventorySelection'),null);assert.equal(run('inventoryDrag'),null);assert.equal(run('JSON.stringify(p.bag)'),run('before'));
});
test('hotbar shows actual unavailability for mana, cooldown and empty consumables',()=>{
 const {run,elements}=setup();run('loadMap("valley",true);p.x=1000;p.y=1000;p.mp=0;paused=false;spellCD[0]=3;p.potions=0;p.braveryCapes=0;updateHUD();');assert.equal(elements.get('skill').disabled,true);assert.match(elements.get('skill').title,/Obnova 3/);assert.equal(elements.get('potion').disabled,true);assert.equal(elements.get('bravery').disabled,true);
 run('spellCD[0]=0;p.mp=maxMP();updateHUD();');assert.equal(elements.get('skill').disabled,false);assert.match(elements.get('skill').title,/Pripravené/);
});
