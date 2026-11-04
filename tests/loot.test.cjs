const test = require('node:test'), assert = require('node:assert/strict');
const { createGame, readSavedProfile } = require('./helpers/game.cjs');

test('kills grant gold and supplies immediately while equipment and relics stay on the ground',()=>{
 const {run}=createGame();run('running=true;p.level=10;p.x=400;p.y=400;rand=()=>0;var initial=p.gold,pots=p.potions,capes=p.braveryCapes;var foe={...mobs[0],hp:1,level:10,x:400,y:400,variant:"rare"};hit(foe,2);');
 assert(run('p.gold>initial'));assert(run('p.potions>pots'));assert(run('p.braveryCapes>capes'));assert(run('p.career.materials.books>0'));assert.equal(run('p.bag.length'),0);assert(run('drops.some(d=>d.kind==="gear")'));assert(run('drops.every(d=>d.kind==="gear"||d.kind==="relic")'));
 run('var after=JSON.stringify({gold:p.gold,potions:p.potions,materials:p.career.materials,drops});hit(foe,99);');assert.equal(run('JSON.stringify({gold:p.gold,potions:p.potions,materials:p.career.materials,drops})'),run('after'));
 run('var stone={...mobs.find(m=>m.type==="stone"),x:500,y:500,hp:1,level:10};hit(stone,2);');assert(run('drops.some(d=>d.kind==="gear"&&d.launchX===500)'));assert(run('drops.every(d=>d.id>0&&d.fallAge===0&&Number.isFinite(d.x)&&Number.isFinite(d.y))'));
});

test('equipment falls once and stays on the ground until explicitly picked up', () => {
  const { run } = createGame();
  run('running=true;p.x=400;p.y=400;let drop=spawnGroundDrop({kind:"gear",item:{name:"Meč",slot:"weapon",bonus:10}},p);let x=drop.x,y=drop.y;');
  assert.equal(run('pickUpGroundDrop(drop.id)'), false);
  run('for(let i=0;i<100;i++)updateGroundLoot(.05);p.x=drop.x;p.y=drop.y;for(let i=0;i<50;i++)update(.05);');
  assert.equal(run('drop.x'), run('x')); assert.equal(run('drop.y'), run('y'));
  assert.equal(run('p.bag.length'), 0); assert.equal(run('drops.length'), 1);
  assert.equal(run('pickUpGroundDrop(drop.id)'), true); assert.equal(run('p.bag.length'), 1);
  assert.equal(run('pickUpGroundDrop(drop.id)'), false); assert.equal(run('p.bag.length'), 1);
});

test('left click collects its target while Y gathers all landed nearby items without any cursor', () => {
  const { run, listeners } = createGame();
  run('running=true;p.x=400;p.y=400;cam.x=p.x;cam.y=p.y;let a=spawnGroundDrop({kind:"gear",item:{name:"Prvý",slot:"weapon",bonus:1}},p),b=spawnGroundDrop({kind:"gear",item:{name:"Druhý",slot:"bracelet",bonus:1}},p);Object.assign(a,{x:400,y:400,launchX:400,launchY:400,fallAge:.65});Object.assign(b,{x:480,y:400,launchX:480,launchY:400,fallAge:.65});');
  listeners.get('game:pointerdown')({ clientX: 600, clientY: 333, button: 2 }); assert.equal(run('p.bag.length'), 0);
  listeners.get('game:pointerdown')({ clientX: 600, clientY: 333, button: 0 }); assert.equal(run('p.bag.length'), 1);
  run('let near=spawnGroundDrop({kind:"gear",item:{name:"Tretí",slot:"necklace",bonus:1}},p),far=spawnGroundDrop({kind:"gear",item:{name:"Ďaleký",slot:"bracelet",bonus:1}},p),falling=spawnGroundDrop({kind:"gear",item:{name:"Padajúci",slot:"bracelet",bonus:1}},p);near.fallAge=.65;Object.assign(far,{x:581,y:400,fallAge:.65});clearLootPointer();');
  listeners.get('keydown')({ key: 'Y', repeat: true, preventDefault() {} }); assert.equal(run('p.bag.length'), 1);
  listeners.get('keydown')({ key: 'Y', repeat: false, preventDefault() {} }); assert.equal(run('p.bag.length'), 3);
  assert.equal(run('drops.length'), 2); assert(run('drops.includes(far)&&drops.includes(falling)'));
  assert.equal(run('pickNearbyGroundDrops()'), 0);
  assert.equal(run('spellKeys[3]'), '4'); assert.equal(run('spellCD[3]'), 0);
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

test('gold and every supply go directly to counters without range, falling or bag space requirements',()=>{
 const {run}=createGame();run('running=true;p.x=400;p.y=400;for(var i=0;i<90;i++)addGearItem({slot:"bracelet",name:"Náramok",bonus:1});var gold=p.gold;var coin=spawnGroundDrop({kind:"gold",count:37},{x:1900,y:1900});');
 assert.equal(run('p.gold-gold'),37);assert.equal(run('drops.length'),0);assert.equal(run('pickUpGroundDrop(coin.id)'),false);
 for(const entry of run('supplyDefinitions()')){run('var beforeCount=supplyDefinitions().find(s=>s.id==='+JSON.stringify(entry.id)+').count;spawnGroundDrop({kind:"supply",supplyId:'+JSON.stringify(entry.id)+',count:3},{x:1900,y:1900});');assert.equal(run('supplyDefinitions().find(s=>s.id==='+JSON.stringify(entry.id)+').count-beforeCount'),3);}
 assert.equal(run('p.bag.length'),90);assert.equal(run('drops.length'),0);run('updateGroundLoot(.01);');assert(run('particles.some(p=>p.small)'));assert.equal(run('automaticLoot.items.size'),0);
});

test('legacy ground supplies wait while inactive and transfer once when simulation resumes',()=>{
 for(const state of ['running=false','paused=true','p.hp=0']){
  const {run}=createGame();run('running=true;p.x=400;p.y=400;var gold=p.gold;drops.push({id:++p.lootSerial,kind:"gold",count:12,x:1900,y:1900,fallAge:0,expiresAt:Date.now()+100000});'+state+';updateGroundLoot(.1);');assert.equal(run('p.gold'),run('gold'));assert.equal(run('drops.length'),1);
  run('running=true;paused=false;p.hp=maxHP();updateGroundLoot(.01);updateGroundLoot(.01);');assert.equal(run('p.gold-gold'),12);assert.equal(run('drops.length'),0);
 }
});

test('nearby Y skips gear that cannot fit and continues picking smaller items and relics', () => {
  const { run } = createGame();
  run('running=true;p.x=400;p.y=400;for(let i=0;i<89;i++)addGearItem({slot:"bracelet",name:"Batoh",bonus:1});let large=spawnGroundDrop({kind:"gear",item:{name:"Brnenie",slot:"armor",bonus:1}},p),small=spawnGroundDrop({kind:"gear",item:{name:"Náušnice",slot:"earrings",bonus:1}},p),relic=spawnGroundDrop({kind:"relic",relicId:"valley",count:1},p);Object.assign(large,{x:400,y:400,fallAge:.65});Object.assign(small,{x:410,y:400,fallAge:.65});relic.fallAge=.65;clearLootPointer();');
  assert.equal(run('pickNearbyGroundDrops()'), 2); assert.equal(run('p.bag.length'), 90);
  assert.equal(run('p.career.collection.valley'), true); assert.equal(run('drops.length'), 1);
  assert.equal(run('drops[0]===large'), true); assert.equal(run('pickNearbyGroundDrops()'), 0);
});

test('supplies transfer immediately while relics wait for Y', () => {
  const { run } = createGame();
  run('running=true;p.level=10;p.x=400;p.y=400;rand=()=>0;for(let i=0;i<4;i++)careerKill({type:"wolf",level:10,x:400,y:400});for(let i=0;i<3;i++)careerKill({type:"boss",level:12,x:400,y:400});');
  assert.equal(run('p.career.materials.wolf'), 1); assert.equal(run('p.career.materials.keys'), 1); assert.equal(run('p.career.collection.valley'), undefined);
  assert(run('drops.every(d=>d.kind==="relic")')); assert(run('drops.some(d=>d.kind==="relic")'));
  run('updateGroundLoot(.65);');
  assert.equal(run('p.career.collection.valley'), undefined);
  assert(run('drops.every(d=>d.kind==="relic")'));
  run('pickNearbyGroundDrops();');
  assert.equal(run('p.career.materials.wolf'), 1); assert.equal(run('p.career.materials.keys'), 1); assert.equal(run('p.career.collection.valley'), true);
});

test('ground items and old gold saves survive reload and map travel without duplicate pickups', () => {
  const game = createGame({ level: 1, worldStates: { valley: { mobs: [], drops: [{ x: 400, y: 400, value: 37 }] } } });
  const { run, saved } = game;
  assert.equal(run('drops[0].kind'), 'gold'); assert.equal(run('drops[0].count'), 37);
  run('running=true;let item=spawnGroundDrop({kind:"gear",item:{name:"Starý meč",slot:"weapon",bonus:12,rarity:2,requiredLevel:8,stats:{hp:20},special:["Pamiatka strážcu"]}},p);save();');
  const reloaded = createGame(readSavedProfile(saved));
  assert.equal(reloaded.run('drops.length'), 2); assert.equal(reloaded.run('drops[1].item.stats.hp'), 20);
  reloaded.run('running=true;let gold=drops.find(d=>d.kind==="gold");p.x=gold.x;p.y=gold.y;pickUpGroundDrop(gold.id);save();');
  const again = createGame(readSavedProfile(reloaded.saved));
  assert.equal(again.run('p.gold'), 37); assert.equal(again.run('drops.length'), 1);
  again.run('running=true;loadMap("desert");loadMap("valley");'); assert.equal(again.run('drops.length'), 1);
  assert.equal(again.run('drops[0].item.name'), 'Starý meč');
});

test('unpicked expedition loot is returned to the ordinary temple alongside its existing loot exactly once', () => {
  const { run } = createGame();
  run('running=true;p.level=35;p.career.materials.keys=3;loadMap("temple");spawnGroundDrop({kind:"gear",item:{slot:"weapon",name:"Prvý meč",bonus:1}},p);save();enterRift();let initial=drops.length;spawnGroundDrop({kind:"gear",item:{slot:"weapon",name:"Druhý meč",bonus:1}},p);finishRift(false);loadMap("temple");');
  assert.equal(run('initial'), 0); assert.equal(run('drops.length'), 2);
  assert.equal(run('new Set(drops.map(d=>d.item.name)).size'),2); assert.equal(run('new Set(drops.map(d=>d.id)).size'), 2);
});

test('gear tooltips show requirements, rarity, icon, base stats, bonuses, special properties and signed comparison', () => {
  const { run } = createGame();
  run('p.level=10;p.equipped.weapon={name:"Nasadený meč",slot:"weapon",bonus:10,enhance:2,stats:{hp:30}};let drop=spawnGroundDrop({kind:"gear",item:{name:"Nový <meč>",slot:"weapon",rarity:2,bonus:20,enhance:1,requiredLevel:8,stats:{hp:10,crit:.02},special:["Výskumný predmet"]}},p);let html=groundDropTooltip(drop);');
  const html = run('html');
  for (const text of ['Požadovaná úroveň', 'Epic', '<svg', 'Základné atribúty', 'Bonusy', 'Špeciálne vlastnosti', 'Výskumný predmet', 'Možno vybaviť', 'Nasadený meč', 'stat-gain', 'stat-loss', '+8', '−20']) assert(html.includes(text), text);
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
  run('running=true;p.x=400;p.y=400;cam.x=400;cam.y=400;let drop=spawnGroundDrop({kind:"gear",item:{name:"Meč",slot:"weapon",bonus:10,rarity:1}},p);Object.assign(drop,{x:400,y:400,launchX:400,launchY:400,fallAge:.65});setLootPointer({clientX:600,clientY:333});updateLootHover(LOOT_RULES.hoverDelay);');
  assert.match(elements.get('loot-tooltip').innerHTML, /stat-gain/);
  run('p.equipped.weapon={name:"Silnejší",slot:"weapon",bonus:20};updateLootHover();');
  assert.match(elements.get('loot-tooltip').innerHTML, /stat-loss/);
  run('canvas.getBoundingClientRect=()=>({left:0,top:150,width:W,height:H});updateLootHover();');
  assert.equal(elements.get('loot-tooltip').hidden, true);
  assert.equal(run('hoveredLootId'), null); assert.equal(run('pickNearbyGroundDrops()'), 1); assert.equal(run('drops.length'), 0);
});
