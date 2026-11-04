const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,createEmptyGame,readSavedAccount}=require('./helpers/game.cjs');
test('leveling stays within 26–181 ordinary equal-level kills, with a genuine weak-target penalty',()=>{
 const g=createGame();
 for(let level=1;level<99;level++){
  g.run(`p.level=${level};`);const count=g.run('Math.ceil(needXP()/enemyXP({type:"wolf",level:p.level}))');
  assert(count>=26&&count<=181,`level ${level}: ${count}`);
  if(level>=9)assert.equal(g.run('enemyXP({type:"wolf",level:p.level-8})'),0);
 }
 g.run('p.level=98;');assert(g.run('needXP()<250000'));assert(g.run('enemyXP({type:"boss",level:99})<=needXP()*.35'));
});
test('old EXP fractions migrate once without awarding levels or resetting owned items',()=>{
 const g=createGame();g.run('p.level=60;p.xp=Math.floor(600*60**2.15*(1+.025*59)*.63);delete p.career.balanceVersion;save();');
 const next=createEmptyGame(Object.fromEntries(g.saved));assert(next.run('playCharacter()'));assert.equal(next.run('p.level'),60);
 assert(Math.abs(next.run('p.xp/needXP()')-.63)<.0001);
 const xp=next.run('p.xp');next.run('returnToCharacters();playCharacter();');assert.equal(next.run('p.xp'),xp);
});
test('all combat maps obey their advertised range, produce matching gear and keep bosses at the top',()=>{
 const g=createGame();
 for(const id of g.run('Object.keys(MAPS).filter(id=>!MAPS[id].town&&!MAPS[id].instance)')){
  g.run(`loadMap('${id}',true);`);
  assert(g.run('mobs.every(m=>m.level>=map().level&&m.level<=map().levelMax)'),id);
  if(id!=='suterland'){
   assert.equal(g.run('mobs.find(m=>m.type==="boss").level'),g.run('map().levelMax'));
   assert(g.run('mobs.some(m=>m.type==="wolf"&&m.level===map().enemyLevel)'));
  }
  g.run('var loot=makeItem(false,mobs[0],"weapon");');assert.equal(g.run('loot.requiredLevel'),g.run('Math.min(99,mobs[0].level)'));
 }
});
test('all six new bosses drop registered relics and old broken saves and backups recover',()=>{
 for(const id of ['meadow','marsh','quarry','highlands','ruins','wastes']){
  const g=createGame();g.run(`running=true;loadMap('${id}',true);p.career.relicPity[p.mapId]=9;rand=()=>.99;hit(mobs.find(m=>m.type==='boss'),1e9,'arcane',true);save();exportCharacters();`);
  assert(g.run('drops.some(d=>d.kind==="relic"&&RELICS[d.relicId])'));
  const old=readSavedAccount(g.saved),data=old.profiles[old.selectedId].data;
  data.worldStates[id].drops.find(d=>d.kind==='relic').relicId=id;
  const next=createEmptyGame({'grindoria-characters-v1':old});assert.equal(next.run('characterStore.error'),'');assert(next.run('playCharacter()'));
  next.run('exportCharacters();');
  const backup={format:'grindoria-characters',version:2,account:old};
  assert(next.run('prepareCharacterImport('+JSON.stringify(JSON.stringify(backup))+').account.order.length>0'));
 }
});
test('world events fit local level ranges and Suterland cannot schedule a targetless bounty',()=>{
 const g=createGame();g.run('running=true;loadMap("suterland",true);');assert(!g.run('startWorldEvent("bounty")'));
 for(const id of ['valley','desert','snow','temple','meadow','marsh','quarry','highlands','ruins','wastes'])for(const type of ['patrol','boss','metin']){
  g.run(`loadMap('${id}',true);worldEventState.active=null;startWorldEvent('${type}');`);
  assert(g.run('worldEventState.active.level<=map().levelMax'),`${id}/${type}`);
 }
});
test('quest reward level is independent of the claim map and crafting previews use actual definitions',()=>{
 const levels=[];
 for(const id of ['town','valley','wastes']){
  const g=createGame();g.run(`running=true;loadMap('${id}',true);p.bossKills=1;rand=()=>.5;claimBoss();`);levels.push(g.run('p.bag[0].requiredLevel'));
 }
 assert.deepEqual(levels,[8,8,8]);
 const g=createGame();g.run('running=true;careerPanel("crafting");');const html=g.elements.get('modalcontent').innerHTML;
 assert(!html.includes('undefined'));assert(html.includes('Rare · požadovaná úroveň 30'));assert(html.includes('Epic · požadovaná úroveň 75'));
 g.run('loadMap("suterland",true);var stone=mobs.find(m=>m.level===99);discoverEnemy(stone);');assert.equal(g.run('p.discovery.seen["metin:doom"].armor'),31);
});
test('real combat cooldowns persist across sessions and combat items cannot heal a paused fight',()=>{
 const g=createGame();g.run('running=true;p.level=35;loadMap("temple",true);p.hp=maxHP();p.mp=maxMP();var stone=mobs.find(m=>m.type==="stone");p.x=stone.x-80;p.y=stone.y;target=stone;castSkill(0);var hp=stone.hp;inventory();p.hp=1;var count=p.potions;');
 assert.equal(g.run('paused'),false);g.run('paused=true;');assert(!g.run('drinkPotion(true)'));assert.equal(g.run('p.potions'),g.run('count'));
 g.run('returnToCharacters();playCharacter();');assert.equal(g.run('spellCD[0]'),7);assert.equal(g.run('mobs.find(m=>m.spawnId===stone.spawnId).hp'),g.run('hp'));
 g.run('closeModal();');assert(g.run('drinkPotion()'));assert(g.run('p.hp>65'));
});
test('forging preserves room below crit cap, crafting beats raw-material purchase cost and paragon is finite',()=>{
 const g=createGame();g.run('var talisman=generateEquipmentItem("talisman",0,99);talisman.enhance=9;');
 assert(g.run('itemBonuses(talisman).crit<.15'));
 for(const [id,price]of [['cape',10],['potion',25/3]])assert(g.run(`(Object.entries(CRAFT_RECIPES.${id}.cost).reduce((n,[key,c])=>n+c*(key==='gold'?1:MARKET_MATERIAL_PRICES[key]),0)/CRAFT_RECIPES.${id}.output.count)<${price}`));
 assert.equal(g.run('Array.from({length:50},(_,i)=>paragonCost(i+1).shards).reduce((a,b)=>a+b,0)'),31875);
 assert.equal(g.run('PRESTIGE_BESTIARY_KEYS.length'),25);
});
test('all eight schools can defeat an ordinary group at representative progression levels',()=>{
 const schools=[['warrior','body'],['warrior','mental'],['ninja','blade'],['ninja','archery'],['sura','weapon'],['sura','black'],['shaman','dragon'],['shaman','healing']];
 for(const [cls,school]of schools)for(const [level,map]of [[1,'valley'],[10,'desert'],[35,'temple'],[60,'ruins'],[98,'wastes']]){
  const g=createEmptyGame();g.run(`createCharacter('Bojovnik','${cls}','${school}');playCharacter();p.level=${level};loadMap('${map}',true);`);
  g.run(`var pts=(p.level-1)*3,caster=['sura','shaman'].includes(p.classId);p.strength=Math.floor(pts*(caster?.2:.45));p.vitality=Math.floor(pts*.3);p.intelligence=caster?Math.floor(pts*.4):0;p.dexterity=pts-p.strength-p.vitality-p.intelligence;p.points=0;
   if(p.level>1)for(const slot of Object.keys(EQUIPMENT)){const rng=layoutRandom(p.classId+slot+p.level);p.equipped[slot]=generateEquipmentItem(slot,p.level>=60?2:1,p.level,generatedWeaponKind(),rng);p.equipped[slot].enhance=p.level>=60?5:2;}
   var group=mobs.filter(m=>m.type==='wolf'&&m.variant==='normal').sort((a,b)=>Math.abs(a.level-p.level)-Math.abs(b.level-p.level)).slice(0,6);mobs.length=0;mobs.push(...group);p.x=1500;p.y=1500;group.forEach((m,i)=>{m.x=p.x+Math.cos(i)*45;m.y=p.y+Math.sin(i)*45;m.homeX=m.x;m.homeY=m.y;m.cd=1;});p.hp=maxHP();p.mp=maxMP();
   p.combatAssist={autoAim:true,autoSpell:true,autoPotion:true};var deaths=0,oldDeath=death;death=()=>{deaths++;oldDeath();};var epoch=Date.now(),elapsed=0;Date.now=()=>epoch+elapsed*1000;
   for(var step=0;step<1200&&group.some(m=>m.hp>0)&&!deaths;step++){elapsed+=.05;if(!selectedEnemy()){const m=group.find(m=>m.hp>0);if(m)selectCombatTarget(m,true);}update(.05);}
  `);
  assert.equal(g.run('deaths'),0,`${school} Lv.${level}: player died`);assert(g.run('group.every(m=>m.hp<=0)'),`${school} Lv.${level}: group survived 60s`);
 }
});
test('eight fully explored profiles fit five MiB and survive lossless storage, export and reload',()=>{
 const g=createEmptyGame();
 for(let i=0;i<8;i++){
  g.run(`createCharacter('Profil${i}','warrior');playCharacter();for(const id of Object.keys(MAPS).filter(id=>!MAPS[id].town&&!MAPS[id].instance)){loadMap(id,true);for(const m of mobs)if(m.type==='wolf'){m.roamWait=0;for(let t=0;t<30;t++)wanderEnemy(m,.2,null);}mobs[0].hp=Math.max(1,Math.floor(mobs[0].hp*.7));snapshotMap();}save();returnToCharacters();`);
  const raw=g.saved.get('grindoria-characters-v1');assert(raw.length*2<5*1024*1024,`profile ${i+1}: ${raw.length*2} bytes`);
 }
 const account=readSavedAccount(g.saved);assert.equal(account.order.length,8);
 const next=createEmptyGame(Object.fromEntries(g.saved));assert.equal(next.run('characterStore.error'),'');assert.equal(next.run('characterStore.account.order.length'),8);
 next.run('var backup=exportCharacters();prepareCharacterImport(backup);');
 assert.deepEqual(readSavedAccount(next.saved),account);
});
