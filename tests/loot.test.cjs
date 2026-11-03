const test = require('node:test'), assert = require('node:assert/strict');
const { createGame } = require('./helpers/game.cjs');

test('enemy and stone kills put all item rewards on the ground and never in the backpack', () => {
  const { run } = createGame();
  run('running=true;p.level=10;p.x=400;p.y=400;rand=()=>0;let initial=JSON.stringify({gold:p.gold,potions:p.potions,capes:p.braveryCapes,bag:p.bag,materials:p.career.materials,collection:p.career.collection});let foe={...mobs[0],hp:1,level:10,x:400,y:400,variant:"rare"};hit(foe,2);');
  assert.equal(run('JSON.stringify({gold:p.gold,potions:p.potions,capes:p.braveryCapes,bag:p.bag,materials:p.career.materials,collection:p.career.collection})'), run('initial'));
  assert(run('drops.some(d=>d.kind==="gear")&&drops.some(d=>d.kind==="gold")&&drops.some(d=>d.supplyId==="potions")&&drops.some(d=>d.supplyId==="braveryCapes")&&drops.some(d=>d.supplyId==="material:books")'));
  run('let count=drops.length;hit(foe,99);'); assert.equal(run('drops.length'), run('count'));
  run('let stone={...mobs.find(m=>m.type==="stone"),x:500,y:500,hp:1,level:10};hit(stone,2);');
  assert(run('drops.some(d=>d.kind==="gear"&&d.launchX===500)'));
  assert(run('drops.every(d=>d.id>0&&d.fallAge===0&&Number.isFinite(d.x)&&Number.isFinite(d.y))'));
});

test('loot falls once and stays fixed without attraction or proximity pickup, even under the player', () => {
  const { run } = createGame();
  run('running=true;p.x=400;p.y=400;let drop=spawnGroundDrop({kind:"gold",count:50},p);let x=drop.x,y=drop.y;');
  assert.equal(run('pickUpGroundDrop(drop.id)'), false);
  run('for(let i=0;i<100;i++)updateGroundLoot(.05);p.x=drop.x;p.y=drop.y;for(let i=0;i<50;i++)update(.05);');
  assert.equal(run('drop.x'), run('x')); assert.equal(run('drop.y'), run('y'));
  assert.equal(run('p.gold'), 0); assert.equal(run('drops.length'), 1);
  assert.equal(run('pickUpGroundDrop(drop.id)'), true); assert.equal(run('p.gold'), 50);
  assert.equal(run('pickUpGroundDrop(drop.id)'), false); assert.equal(run('p.gold'), 50);
});

test('left click and Y under the cursor pick exactly the hovered drop; right click, repeats and empty cursor do nothing', () => {
  const { run, listeners } = createGame();
  run('running=true;p.x=400;p.y=400;cam.x=p.x;cam.y=p.y;let a=spawnGroundDrop({kind:"gold",count:12},p),b=spawnGroundDrop({kind:"supply",supplyId:"potions",count:3},p);Object.assign(a,{x:400,y:400,launchX:400,launchY:400,fallAge:.65});Object.assign(b,{x:480,y:400,launchX:480,launchY:400,fallAge:.65});');
  const pointer = { clientX: 600, clientY: 333, button: 2 };
  listeners.get('game:pointerdown')(pointer); assert.equal(run('p.gold'), 0);
  listeners.get('game:pointermove')(pointer);
  listeners.get('keydown')({ key: 'Y', repeat: true, preventDefault() {} }); assert.equal(run('p.gold'), 0);
  listeners.get('keydown')({ key: 'Y', repeat: false, preventDefault() {} }); assert.equal(run('p.gold'), 12); assert.equal(run('p.potions'), 5);
  listeners.get('game:pointerdown')({ clientX: 680, clientY: 333, button: 0 }); assert.equal(run('p.potions'), 8); assert.equal(run('drops.length'), 0);
  listeners.get('game:pointerleave')(); assert.equal(run('pickHoveredGroundDrop()'), false);
  assert.equal(run('spellKeys[3]'), 'v'); assert.equal(run('spellCD[3]'), 0);
});

test('full inventory, distance, pause and death leave the item on the ground without converting it to gold', () => {
  const { run } = createGame();
  run('running=true;p.x=400;p.y=400;let item={name:"Meč",slot:"weapon",bonus:10,rarity:1};let drop=spawnGroundDrop({kind:"gear",item},p);drop.fallAge=.65;for(let i=0;i<90;i++)addGearItem({slot:"bracelet",name:"Náramok",bonus:1});');
  assert.equal(run('pickUpGroundDrop(drop.id)'), false); assert.equal(run('drops.length'), 1); assert.equal(run('p.gold'), 0);
  run('p.bag=[];p.x=1900;p.y=1900;'); assert.equal(run('pickUpGroundDrop(drop.id)'), false);
  run('p.x=drop.x;p.y=drop.y;paused=true;'); assert.equal(run('pickUpGroundDrop(drop.id)'), false);
  run('paused=false;p.hp=0;'); assert.equal(run('pickUpGroundDrop(drop.id)'), false);
  run('p.hp=100;'); assert.equal(run('pickUpGroundDrop(drop.id)'), true); assert.equal(run('p.bag.length'), 1);
});

test('supplies and relics enter progression only after manual pickup, including biological samples and keys', () => {
  const { run } = createGame();
  run('running=true;p.level=10;p.x=400;p.y=400;rand=()=>0;for(let i=0;i<4;i++)careerKill({type:"wolf",level:10,x:400,y:400});for(let i=0;i<3;i++)careerKill({type:"boss",level:12,x:400,y:400});');
  assert.equal(run('p.career.materials.wolf'), 0); assert.equal(run('p.career.materials.keys'), 0); assert.equal(run('p.career.collection.valley'), undefined);
  assert(run('drops.some(d=>d.supplyId==="material:wolf")')); assert(run('drops.some(d=>d.supplyId==="material:keys")')); assert(run('drops.some(d=>d.kind==="relic")'));
  run('for(const d of [...drops]){d.fallAge=.65;p.x=d.x;p.y=d.y;pickUpGroundDrop(d.id);}');
  assert.equal(run('p.career.materials.wolf'), 1); assert.equal(run('p.career.materials.keys'), 1); assert.equal(run('p.career.collection.valley'), true);
});

test('ground items and old gold saves survive reload and map travel without duplicate pickups', () => {
  const game = createGame({ level: 1, worldStates: { valley: { mobs: [], drops: [{ x: 400, y: 400, value: 37 }] } } });
  const { run, saved } = game;
  assert.equal(run('drops[0].kind'), 'gold'); assert.equal(run('drops[0].count'), 37);
  run('running=true;let item=spawnGroundDrop({kind:"gear",item:{name:"Starý meč",slot:"weapon",bonus:12,rarity:2,requiredLevel:8,stats:{hp:20},special:["Pamiatka strážcu"]}},p);save();');
  const reloaded = createGame(JSON.parse(saved.get('grindoria-save-v1')));
  assert.equal(reloaded.run('drops.length'), 2); assert.equal(reloaded.run('drops[1].item.stats.hp'), 20);
  reloaded.run('running=true;let gold=drops.find(d=>d.kind==="gold");p.x=gold.x;p.y=gold.y;pickUpGroundDrop(gold.id);save();');
  const again = createGame(JSON.parse(reloaded.saved.get('grindoria-save-v1')));
  assert.equal(again.run('p.gold'), 37); assert.equal(again.run('drops.length'), 1);
  again.run('running=true;loadMap("desert");loadMap("valley");'); assert.equal(again.run('drops.length'), 1);
  assert.equal(again.run('drops[0].item.name'), 'Starý meč');
});

test('unpicked expedition loot is returned to the ordinary temple alongside its existing loot exactly once', () => {
  const { run } = createGame();
  run('running=true;p.level=35;p.career.materials.keys=3;loadMap("temple");spawnGroundDrop({kind:"gold",count:10},p);save();enterRift();let initial=drops.length;spawnGroundDrop({kind:"gold",count:20},p);finishRift(false);loadMap("temple");');
  assert.equal(run('initial'), 0); assert.equal(run('drops.length'), 2);
  assert.equal(run('drops.reduce((n,d)=>n+d.count,0)'), 30); assert.equal(run('new Set(drops.map(d=>d.id)).size'), 2);
});

test('gear tooltips show requirements, rarity, icon, base stats, bonuses, special properties and signed comparison', () => {
  const { run } = createGame();
  run('p.level=10;p.equipped.weapon={name:"Nasadený meč",slot:"weapon",bonus:10,enhance:2,stats:{hp:30}};let drop=spawnGroundDrop({kind:"gear",item:{name:"Nový <meč>",slot:"weapon",rarity:2,bonus:20,enhance:1,requiredLevel:8,stats:{hp:10,crit:.02},special:["Výskumný predmet"]}},p);let html=groundDropTooltip(drop);');
  const html = run('html');
  for (const text of ['Požadovaná úroveň', 'Epická', '<svg', 'Základné atribúty', 'Bonusy', 'Špeciálne vlastnosti', 'Výskumný predmet', 'Možno vybaviť', 'Nasadený meč', 'stat-gain', 'stat-loss', '+7', '−20']) assert(html.includes(text), text);
  assert(html.includes('Nový &lt;meč&gt;'));
  run('p.level=1;'); assert.equal(run('canEquipItem(drop.item)'), false); assert.match(run('groundDropTooltip(drop)'), /Nedostatočná úroveň/);
  run('addGearItem({...drop.item});'); assert.equal(run('equipItem(0)'), false); assert.equal(run('p.equipped.weapon.name'), 'Nasadený meč');
});

test('tooltip positioning keeps the box in the viewport and away from the cursor at every corner', () => {
  const { run } = createGame();
  for (const [width, height] of [[1200,700],[390,844],[320,240]]) {
    for (const [x,y] of [[2,2],[width-2,2],[2,height-2],[width-2,height-2],[width/2,height/2]]) {
      const pos = run(`floatingTooltipPosition(${x},${y},282,480,${width},${height})`), w = Math.min(282,width-16), h = Math.min(480,pos.maxHeight);
      assert(pos.left>=8 && pos.left+w<=width-8+1e-6);
      assert(pos.top>=8 && pos.top+h<=height-8+1e-6);
      assert(!(x>=pos.left && x<=pos.left+w && y>=pos.top && y<=pos.top+h));
    }
  }
});

test('hover is recalculated after canvas scrolling and equipment changes, rather than using stale coordinates', () => {
  const { run, elements } = createGame();
  run('running=true;p.x=400;p.y=400;cam.x=400;cam.y=400;let drop=spawnGroundDrop({kind:"gear",item:{name:"Meč",slot:"weapon",bonus:10,rarity:1}},p);Object.assign(drop,{x:400,y:400,launchX:400,launchY:400,fallAge:.65});setLootPointer({clientX:600,clientY:333});');
  assert.match(elements.get('loot-tooltip').innerHTML, /stat-gain/);
  run('p.equipped.weapon={name:"Silnejší",slot:"weapon",bonus:20};updateLootHover();');
  assert.match(elements.get('loot-tooltip').innerHTML, /stat-loss/);
  run('canvas.getBoundingClientRect=()=>({left:0,top:150,width:W,height:H});updateLootHover();');
  assert.equal(elements.get('loot-tooltip').hidden, true);
  assert.equal(run('pickHoveredGroundDrop()'), false); assert.equal(run('drops.length'), 1);
});
