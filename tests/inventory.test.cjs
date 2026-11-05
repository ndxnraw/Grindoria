const test = require('node:test'), assert = require('node:assert/strict');
const { createGame, readSavedProfile } = require('./helpers/game.cjs');

function gear(run, slot, bonus = 10) {
  return run(`addGearItem({name:EQUIPMENT['${slot}'].names[1],slot:'${slot}',rarity:1,tier:1,bonus:${bonus},enhance:0,value:25});`);
}

test('grid respects item dimensions, page boundaries and collisions; occupied drops are rejected atomically', () => {
  const { run } = createGame();
  assert(gear(run, 'armor')); assert(gear(run, 'weapon')); assert(gear(run, 'bracelet'));
  run('let armor=p.bag[0],weapon=p.bag[1],bracelet=p.bag[2];');
  assert.equal(run('itemCells(armor,0).length'), 2);
  assert.equal(run('itemCells(weapon,0).length'), 2);
  assert.equal(run('moveGearItem(armor.uid,4)'), true);
  assert.equal(run('moveGearItem(armor.uid,0)'), true);
  assert.equal(run('moveGearItem(armor.uid,40)'), false);
  assert.equal(run('moveGearItem(weapon.uid,85)'), false);
  assert.equal(run('moveGearItem(weapon.uid,45)'), true);
  assert.equal(run('weapon.cell'), 45);
  gear(run, 'necklace'); run('moveGearItem(p.bag.at(-1).uid,bracelet.cell+5);');
  run('let before=JSON.stringify(p.bag);');
  assert.equal(run('moveGearItem(armor.uid,bracelet.cell)'), false);
  assert.equal(run('JSON.stringify(p.bag)'), run('before'));
  gear(run, 'necklace'); run('let necklace=p.bag.at(-1),a=bracelet.cell,b=necklace.cell;');
  assert.equal(run('moveGearItem(bracelet.uid,b)'), false);
  assert.equal(run('necklace.cell'), run('b')); assert.equal(run('bracelet.cell'), run('a'));
  assert.equal(run('moveGearItem(armor.uid,armor.cell+5)'),true);
});

test('every equipment slot changes its real combat statistic immediately and removing it restores the baseline', () => {
  const { run } = createGame();
  const expressions = { weapon: 'damage()', armor: 'defense()', helmet: 'defense()', shield: 'defense()', boots: 'speedValue()', bracelet: 'maxHP()', necklace: 'maxMP()', earrings: 'equipmentBonuses().magic', belt: 'defense()', talisman: 'criticalChance()' };
  for (const [slot, expression] of Object.entries(expressions)) {
    const before = run(expression);
    assert(gear(run, slot, slot === 'talisman' ? 2 : 10));
    assert.equal(run('equipItem(p.bag.length-1)'), true);
    assert(run(expression) > before, slot);
    assert.equal(run(`unequipItem('${slot}')`), true);
    assert.equal(run(expression), before, slot);
    run('p.bag=[];');
  }
});

test('equipment clamps current HP and MP on removal without healing through repeated swaps', () => {
  const { run } = createGame(); gear(run, 'bracelet', 50); gear(run, 'necklace', 50);
  run('equipItem(0);equipItem(0);p.hp=maxHP();p.mp=maxMP();');
  assert.equal(run('unequipItem("bracelet")'), true); assert.equal(run('p.hp'), run('maxHP()'));
  assert.equal(run('unequipItem("necklace")'), true); assert.equal(run('p.mp'), run('maxMP()'));
  run('p.hp=10;p.mp=10;equipItem(0);equipItem(0);'); assert.equal(run('p.hp'), 10); assert.equal(run('p.mp'), 10);
});

test('a full grid rejects unequipping without losing gear; equal-slot replacement still works', () => {
  const { run } = createGame(); gear(run, 'weapon'); run('equipItem(0);');
  run('for(let i=0;i<p.inventory.pages*INVENTORY.pageSize;i++)addGearItem({name:"Prsteň",slot:"bracelet",bonus:1,value:1});let original=p.equipped.weapon;');
  assert.equal(run('p.bag.length'), 225); assert.equal(run('unequipItem("weapon")'), false);
  assert.equal(run('p.equipped.weapon===original'), true); assert.equal(run('p.bag.length'), 225);
  run('p.bag=[];addGearItem({name:"Nový meč",slot:"weapon",bonus:12,enhance:2});for(let i=0;i<p.inventory.pages*INVENTORY.pageSize-2;i++)addGearItem({name:"Prsteň",slot:"bracelet",bonus:1,value:1});');
  assert.equal(run('equipItem(0)'), true); assert.equal(run('p.equipped.weapon.name'), 'Nový meč');
  assert(run('p.bag.includes(original)'));
});

test('weapons and armor use two vertical cells; every other slot uses one cell',()=>{
 const {run}=createGame();
 for(const slot of Object.keys(run('EQUIPMENT'))){
  const size=JSON.parse(run(`JSON.stringify(itemSize({slot:'${slot}'}))`));
  assert.deepEqual(size,slot==='weapon'||slot==='armor'?[1,2]:[1,1],slot);
 }
});

test('smaller footprints preserve legacy positions, item properties and saved quantities',()=>{
 const bag=[{slot:'armor',name:'Zbroj',cell:0,rarity:2,bonus:16,enhance:4,value:90},{slot:'weapon',name:'Meč',cell:2,rarity:1,bonus:22,enhance:3,value:80},{slot:'shield',name:'Štít',cell:3,rarity:1,bonus:6,enhance:2,value:40},{slot:'boots',name:'Obuv',cell:15,rarity:2,bonus:8,enhance:1,value:50}];
 const {run,saved}=createGame({level:5,bag,potions:123,braveryCapes:45});
 const snapshot=run('JSON.stringify(p.bag)');assert.deepEqual(JSON.parse(run('JSON.stringify(p.bag.map(i=>i.cell))')),[0,2,3,15]);
 assert(run('p.bag.flatMap(i=>itemCells(i,i.cell)).length===6'));
 run('sortInventory();save();');const reload=createGame(readSavedProfile(saved));
 assert.equal(reload.run('p.bag.length'),4);assert.equal(reload.run('p.potions'),123);assert.equal(reload.run('p.braveryCapes'),45);
 for(const item of JSON.parse(snapshot)){const actual=JSON.parse(reload.run(`JSON.stringify(p.bag.find(i=>i.uid===${item.uid}))`));delete actual.cell;delete item.cell;assert.deepEqual(actual,item);}
});

test('legacy large bags migrate without losses, duplicates or changes to enhancement and save correctly', () => {
  const items = Array.from({ length: 24 }, (_, i) => ({ name: 'Zbroj ' + i, slot: 'armor', rarity: 1, bonus: 10, enhance: 3, value: 10 }));
  const { run, saved } = createGame({ level: 5, bag: items, equipped: { weapon: { name: 'Meč', slot: 'weapon', bonus: 25, enhance: 2 } }, potions: 123, braveryCapes: 321 });
  assert.equal(run('p.bag.length'), 24); assert(run('p.inventory.pages>=4'));
  assert.equal(run('new Set(p.bag.map(i=>i.uid)).size'), 24);
  assert(run('p.bag.every(i=>i.enhance===3)')); assert.equal(run('equippedBonus("weapon")'), 29);
  run('let cell=p.bag[3].cell;save();'); const reload = createGame(readSavedProfile(saved));
  assert.equal(reload.run('p.bag[3].cell'), run('cell')); assert.equal(reload.run('p.bag.length'), 24);
  assert.equal(reload.run('p.potions'), 123); assert.equal(reload.run('p.braveryCapes'), 321);
});

test('supply stacks use the existing counters, merge new drops, move and sort without duplicating quantities', () => {
  const { run, saved } = createGame();
  run('p.potions=200;p.career.materials.ore=250;addMaterial("ore",5);let ore=supplyEntries().find(i=>i.id==="material:ore");');
  assert.equal(run('ore.count'), 255); assert.equal(run('supplyEntries().filter(i=>i.id==="material:ore").length'), 1);
  run('let potionCell=supplyEntries().find(i=>i.id==="potions").cell;');assert.equal(run('moveSupplyItem("material:ore",potionCell)'),false);
  assert.equal(run('moveSupplyItem("material:ore",40)'), true);
  assert.equal(run('supplyEntries().find(i=>i.id==="material:ore").cell'), 40);
  run('sortInventory("supplies");sortInventory("gear");save();');
  const reload = createGame(readSavedProfile(saved));
  assert.equal(reload.run('p.potions'), 200); assert.equal(reload.run('p.career.materials.ore'), 255);
  assert.equal(reload.run('consumeSupply("material:ore",256)'), false);
  assert.equal(reload.run('consumeSupply("material:ore",-1)'), false);
});

test('potions can be used in the paused inventory; cape checks sanctuary and opens the battlefield', () => {
  const { run } = createGame(); run('running=true;inventory();p.hp=1;let potions=p.potions;');
  assert.equal(run('useInventorySupply("potions")'), true); assert.equal(run('p.hp'), 66); assert.equal(run('p.potions'), run('potions-1'));
  const capes = run('p.braveryCapes'); assert.equal(run('useInventorySupply("braveryCapes")'), false); assert.equal(run('p.braveryCapes'), capes);
  run('p.x=400;p.y=400;'); assert.equal(run('useInventorySupply("braveryCapes")'), true);
  assert.equal(run('p.braveryCapes'), capes - 1); assert.equal(run('paused'), false);
});

test('selection has no action menu and stack deletion remains exact at the inventory API',()=>{const {run,elements}=createGame();run('running=true;addGearItem({slot:"bracelet",name:"Naramok",bonus:1});inventory();selectInventoryEntry("gear:"+p.bag[0].uid);');assert(!elements.get('modalcontent').innerHTML.includes('inventory-actions'));assert.equal(run('p.bag.length'),1);run('p.potions=10;');assert(run('deleteInventoryItem("potions",4)'));assert.equal(run('p.potions'),6);assert(!run('deleteInventoryItem("potions",7)'));assert.equal(run('p.potions'),6);});

test('all new slots drop as real equipment and can be enhanced with materials', () => {
  const { run } = createGame();
  run('running=true;loadMap("town",true);p.x=NPCS.smith.x;p.y=NPCS.smith.y;');const slots = Object.keys(run('EQUIPMENT'));
  slots.forEach((slot, i) => {
    run(`rand=()=>${(i + .5) / slots.length};`); assert.equal(run('makeItem(true).slot'), slot);
    run(`p.equipped['${slot}']={slot:'${slot}',name:'Test',bonus:5,enhance:0};p.gold=1000;p.career.materials.ore=100;rand=()=>0;`);
    assert.equal(run(`enhanceEquipment('${slot}')`), true);
    assert.equal(run(`p.equipped['${slot}'].enhance`), 1);
  });
});

test('inventory renders complete grid, icons, equipment, safe tooltips and action details', () => {
  const { run, elements } = createGame(); gear(run, 'weapon');
  run('p.bag[0].name="<img src=x onerror=alert(1)>";inventory();showItemTooltip("gear:"+p.bag[0].uid,{clientX:20,clientY:20});');
  const html = elements.get('modalcontent').innerHTML;
  assert.equal((html.match(/data-cell=/g) || []).length, 45);
  assert.equal((html.match(/data-equip-slot=/g) || []).length, 10);
  assert(html.includes('data-inv-page="1"')); assert(html.includes('data-inv-tab="supplies"'));
  assert.match(elements.get('item-tooltip').innerHTML, /&lt;img/); assert(!elements.get('item-tooltip').innerHTML.includes('<img'));
  assert.equal(elements.get('item-tooltip').hidden, false);
});
