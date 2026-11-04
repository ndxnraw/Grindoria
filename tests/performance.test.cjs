const test=require('node:test'),assert=require('node:assert/strict');const {createGame,readSavedProfile}=require('./helpers/game.cjs');
test('nearest lookup preserves strict range and stable ties without sorting or changing population',()=>{
const {run}=createGame();run('mobs.length=0;var a={type:"wolf",hp:1,x:10,y:0},b={...a,x:-10};mobs.push(a,b);');
assert.equal(run('nearest(-11,{x:0,y:0})'),undefined);assert.equal(run('nearest(0,{x:0,y:0})'),undefined);assert.equal(run('nearest(10,{x:0,y:0})'),undefined);assert(run('nearest(11,{x:0,y:0})===a'));assert(run('mobs[0]===a&&mobs[1]===b'));run('a.hp=0;');assert(run('nearest(11,{x:0,y:0})===b'));
});
test('pointer hit testing preserves frontmost enemy and original tie order',()=>{
const {run}=createGame();run('cam.x=100;cam.y=100;var a={type:"wolf",skin:"wolf",hp:1,x:100,y:100},b={...a,y:105},c={...b};mobs.length=0;mobs.push(a,b,c);');assert(run('enemyAtPointer(W/2,H/2-10)===b'));run('b.hp=0;');assert(run('enemyAtPointer(W/2,H/2-10)===c'));
});
test('far idle AI is staggered, advances elapsed time and wakes on the same combat frame',()=>{
const {run}=createGame();run('p.x=200;p.y=200;cam.x=p.x;cam.y=p.y;var m={type:"wolf",x:3000,y:3000,hp:100,max:100,engaged:0,taunt:0};var total=0,count=0;for(var i=0;i<120;i++){var dt=enemyMovementStep(m,1/60,5);if(dt){total+=dt;count++;}}');
assert(run('count<=12'));assert(run('total>1.8&&total<=2.000001'));run('m.engaged=8;');assert.equal(run('enemyMovementStep(m,1/60,5)'),1/60);run('m.engaged=0;m.x=p.x;m.y=p.y;');assert.equal(run('enemyMovementStep(m,1/60,5)'),1/60);
});
test('active effects, injured, returning, selected and Metin enemies never use distant idle scheduling',()=>{
const {run}=createGame();run('p.x=200;p.y=200;cam.x=p.x;cam.y=p.y;');
for(const extra of [{engaged:1},{taunt:1},{returning:true},{hp:90},{stun:1},{slow:1},{dots:[{kind:"poison"}]},{metinParentId:"stone"},{dungeonId:"crypt"}])assert.equal(run('enemyMovementStep({x:3000,y:3000,hp:100,max:100,...'+JSON.stringify(extra)+'},.016,0)'),.016);
run('target={x:3000,y:3000,hp:100,max:100};');assert.equal(run('enemyMovementStep(target,.016,0)'),.016);
});
test('remote cooldowns, respawn timers and immediate provocation retain full frame timing',()=>{
const {run}=createGame();run('running=true;p.x=200;p.y=200;cam.x=p.x;cam.y=p.y;var m=mobs.find(m=>m.type==="wolf");Object.assign(m,{x:3000,y:3000,homeX:3000,homeY:3000,cd:1});updateEnemySpawns(.05,false);');assert(Math.abs(run('m.cd')-.95)<1e-9);run('m.hp=0;m.dead=.03;updateEnemySpawns(.05,false);');assert(run('m.hp===m.max'));run('m.x=p.x+100;m.y=p.y;m.homeX=m.x;m.homeY=m.y;var before=m.x;provokeEnemyGroup(m);updateEnemySpawns(.016,false);');assert(run('m.x<before'));
});
test('reusable separation grid replaces membership and map load releases its buckets',()=>{
const {run}=createGame();run('var a=buildMobGrid(),m=mobs.find(m=>m.type==="wolf"),old=mobGridKey(Math.floor(m.x/70),Math.floor(m.y/70));m.x=3000;m.y=3000;var b=buildMobGrid();');assert(run('a===b'));assert(!run('b.get(old).includes(m)'));run('loadMap("snow",true);');assert.equal(run('reusableMobGrid.size'),0);
});
test('spawn index refreshes across same-size maps and preserves the existing respawn object',()=>{
const {run}=createGame();run('var m=mobs[0],point=spawnPointById(m.spawnPointId);loadMap("snow",true);var next=mobs[0],current=spawnPointById(next.spawnPointId);');assert(run('current===spawnPoints.find(s=>s.id===next.spawnPointId)'));assert(run('point!==current'));run('var ref=next;next.hp=0;respawnEnemy(next);');assert(run('ref===next&&next.hp===next.max'));
});
test('scene culls before sorting, reuses entries and retains painter order',()=>{
const {run}=createGame();run('decor.length=0;mobs.length=0;worldObjects=()=>[];p.x=100;p.y=100;cam.x=100;cam.y=100;var a={x:100,y:90,hp:1},b={x:100,y:110,hp:1},far={x:3000,y:3000,hp:1};mobs.push(b,far,a);var seen=[];mobDraw=m=>seen.push(m);hero=()=>seen.push(p);drawSceneObjects();var entry=sceneEntries.get(a);');
assert(run('seen[0]===a&&seen[1]===p&&seen[2]===b'));assert.equal(run('sceneQueue.length'),3);run('seen=[];a.y=105;drawSceneObjects();');assert(run('sceneEntries.get(a)===entry'));assert(run('seen[0]===p&&seen[1]===a&&seen[2]===b'));
});
test('large simultaneous loot expiration compacts in order and manual pickups remain manual',()=>{
const {run}=createGame();run('drops.length=0;for(var i=0;i<5000;i++)drops.push({id:i,kind:"supply",manualPickup:true,supplyId:"potions",count:1,x:p.x,y:p.y,fallAge:1,expiresAt:i%2?Date.now()+100000:0});var potions=p.potions;expireGroundDrops();updateGroundLoot(.05);');assert.equal(run('drops.length'),2500);assert(run('drops.every((d,i)=>d.id===i*2+1)'));assert.equal(run('p.potions'),run('potions'));
});
test('loot hit testing matches falling and settled visual coordinates including camera changes',()=>{
const {run}=createGame();run('drops.length=0;var d={id:1,kind:"gear",x:p.x+30,y:p.y+30,launchX:p.x,launchY:p.y,fallAge:0};drops.push(d);');
for(const age of [0,.1,.3,.65,1]){run('d.fallAge='+age+';cam.x+=10;cam.y+=10;var at=groundDropVisual(d);');assert(run('groundDropAt(at.x,at.y)===d'));assert.equal(run('groundDropAt(at.x+30,at.y)'),null);}
});
test('render cache avoids repeated appearance hashing and limits icon builds per frame',()=>{
const {run}=createGame();run('var Image=class{constructor(){this.complete=true;this.naturalWidth=64;}set src(value){this.value=value;}};drops.length=0;for(var i=0;i<40;i++)drops.push({kind:"gear",id:i,item:createItem("weapon:fms"),x:p.x,y:p.y,fallAge:1});var calls=0,original=equipmentAppearance;equipmentAppearance=function(item){calls++;return original(item);};drawGroundLoot();var first=calls,firstIcons=groundIconCache.size;drawGroundLoot();var secondIcons=groundIconCache.size;for(var frame=0;frame<6;frame++)drawGroundLoot();var warmed=calls;drawGroundLoot();');
assert(run('first>=40'));assert.equal(run('calls'),run('warmed'));assert(run('firstIcons<=PERFORMANCE_RULES.iconBuildsPerFrame&&secondIcons-firstIcons<=PERFORMANCE_RULES.iconBuildsPerFrame'));run('var a=groundRenderView(drops[0]);drops[0].count=2;');assert(run('groundRenderView(drops[0])!==a'));run('for(var i=0;i<300;i++)groundIcon({...drops[0].item,name:"Variant "+i});');assert(run('groundIconCache.size<=256'));
});
test('far drops never build SVG icons and icon scheduling does not advance gameplay RNG',()=>{
const {run}=createGame();run('drops.length=0;for(var i=0;i<200;i++)drops.push({kind:"gear",id:i,item:createItem("weapon:fms"),x:3000,y:3000,fallAge:1});cam.x=100;cam.y=100;var initial=seed;equipmentAppearance=()=>{throw Error("offscreen appearance");};drawGroundLoot();');assert.equal(run('seed'),run('initial'));
});
test('idle menus render less often while active frames still update and draw every frame',()=>{
const {run}=createGame();run('var updates=0,draws=0;update=()=>updates++;draw=()=>draws++;running=false;paused=false;lastSceneDraw=-Infinity;for(var t=0;t<1000;t+=10)frame(t);');assert.equal(run('updates'),100);assert.equal(run('draws'),10);run('running=true;for(var t=1000;t<1100;t+=10)frame(t);');assert.equal(run('draws'),20);
});
test('performance caches and scheduling are absent from saved character and ground data',()=>{
const {run,saved}=createGame();run('buildMobGrid();enemyMovementStep(mobs[0],.05,0);save();');const profile=readSavedProfile(saved);assert(!JSON.stringify(profile).includes('farEnemySchedule'));assert(!JSON.stringify(profile).includes('reusableMobGrid'));
});

test('distant visible loot uses a marker but hovered loot retains its own full icon',()=>{
const {run}=createGame();run('drops.length=0;p.x=1600;p.y=1600;cam.x=1600;cam.y=1600;var d={id:999,kind:"gear",item:createItem("weapon:fms"),x:p.x+400,y:p.y,fallAge:1};drops.push(d);var calls=0,original=equipmentAppearance;equipmentAppearance=item=>{calls++;return original(item);};drawGroundLoot();');assert.equal(run('calls'),0);run('hoveredLootId=d.id;drawGroundLoot();');assert(run('calls>0'));
});
test('ready SVG icons rasterize once within a bounded bitmap cache',()=>{
const {run}=createGame();run('var rasterized=0;var OffscreenCanvas=class{constructor(w,h){this.width=w;this.height=h;}getContext(){return{drawImage(){rasterized++;}};}};var Image=class{complete=true;naturalWidth=64;set src(value){}};var item=createItem("weapon:fms");var first=groundIcon(item),second=groundIcon(item);');assert(run('first===second&&first instanceof OffscreenCanvas'));assert.equal(run('rasterized'),1);
});
