const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,createEmptyGame,readSavedProfile,readSavedAccount}=require('./helpers/game.cjs');
function smith(){const g=createGame();g.run('running=true;loadMap("town",true);p.x=NPCS.smith.x;p.y=NPCS.smith.y;p.gold=1e9;for(const id of Object.keys(MATERIALS))p.career.materials[id]=100000;addGearItem({slot:"weapon",name:"Skúšobný meč",bonus:10,rarity:1,tier:35,enhance:0,stats:{hp:20}});equipItem(0);');return g;}

test('new characters start in the smaller peaceful town with reusable NPC services',()=>{
 const {run,elements}=createEmptyGame();run('var id=createCharacter("Novacik","sura");playCharacter(id);');
 assert.equal(run('p.mapId'),'town');assert.equal(run('SIZE'),1200);assert.equal(run('mobs.length'),0);assert.equal(run('spawnPoints.length'),0);assert(run('isSanctuary(p)'));
 assert.equal(run('Object.keys(NPCS).length'),5);run('p.x=NPCS.merchant.x;p.y=NPCS.merchant.y;');assert(run('interactNPC("merchant")'));assert.match(elements.get('modalcontent').innerHTML,/Kúpiť 3 elixíry/);
 run('closeModal();p.x=NPCS.smith.x;p.y=NPCS.smith.y;');assert(run('interactNPC("smith")'));assert.match(elements.get('modalcontent').innerHTML,/Kováč · Mesto/);
 run('closeModal();p.x=NPCS.biologist.x;p.y=NPCS.biologist.y;');assert(run('interactNPC("biologist")'));assert.match(elements.get('modalcontent').innerHTML,/Biológ/);
 run('closeModal();loadMap("valley");');assert(!run('interactNPC("merchant")'));assert(!run('buyBraveryCapes()'));assert(run('worldObjects().every(o=>!String(o.type).includes("npc"))'));
});

test('forge requires a living character next to the town blacksmith and payments fail atomically',()=>{
 const {run}=smith();run('p.career.materials.ore=0;var gold=p.gold;rand=()=>{throw Error("roll before payment");};');assert(!run('enhanceEquipment("weapon")'));assert.equal(run('p.gold'),run('gold'));assert.equal(run('p.equipped.weapon.enhance'),0);
 for(const setup of ['p.x=100;p.y=100;','p.hp=0;','running=false;','p.mapId="valley";']){run('running=true;p.hp=100;p.mapId="town";p.x=NPCS.smith.x;p.y=NPCS.smith.y;p.career.materials.ore=1000;'+setup);assert(!run('enhanceEquipment("weapon")'));assert.equal(run('p.gold'),run('gold'));}
});

test('all nine steps increase real equipment power and costs, with declining success rates and a hard +9 cap',()=>{
 const {run}=smith();run('rand=()=>0;var previousGold=0,previousOre=0,previousDamage=damage(),previousChance=1;');
 for(let rank=1;rank<=9;rank++){
  run('var cost=enhancementCost(p.equipped.weapon),chance=forgeChance(p.equipped.weapon);');assert(run('cost.gold>previousGold&&cost.ore>previousOre&&chance<previousChance'));
  assert(run('enhanceEquipment("weapon")'));assert.equal(run('p.equipped.weapon.enhance'),rank);assert(run('damage()>previousDamage'));assert.equal(run('p.equipped.weapon.stats.hp'),20);
  run('previousGold=cost.gold;previousOre=cost.ore;previousDamage=damage();previousChance=chance;');
 }
 assert.equal(run('enhancementCost(p.equipped.weapon)'),null);run('var before=p.gold;');assert(!run('enhanceEquipment("weapon")'));assert.equal(run('p.gold'),run('before'));assert.equal(run('enhancementBonus(p.equipped.weapon)'),85);
 assert(run('enhancementCost({slot:"weapon",tier:70,rarity:5}).gold>enhancementCost({slot:"weapon",tier:1,rarity:0}).gold'));
});

test('failures charge the recipe, retain early grades, downgrade middle grades, and can destroy late gear',()=>{
 for(const [current,rolls,expected]of [[0,[.99],0],[2,[.99],2],[3,[.99],2],[5,[.99],4],[6,[.99,.8],5],[8,[.99,.1],null]]){
  const {run,saved}=smith();run('p.equipped.weapon.enhance='+current+';var rolls='+JSON.stringify(rolls)+',before=p.gold,cost=enhancementCost(p.equipped.weapon);rand=()=>rolls.shift();');assert(run('enhanceEquipment("weapon")'));assert.equal(run('p.equipped.weapon?.enhance??null'),expected);assert.equal(run('p.gold'),run('before-cost.gold'));assert(!run('forgeResult.success'));assert.equal(run('forgeResult.destroyed'),expected===null);
  if(expected===null){assert.equal(readSavedProfile(saved).equipped.weapon,null);assert.equal(run('p.bag.length'),0);}
 }
});

test('protection keeps both grade and item on failure and the charm changes the actual success roll',()=>{
 const {run}=smith();run('p.equipped.weapon.enhance=8;var before=p.gold,cost=enhancementCost(p.equipped.weapon,{protect:true,charm:true});rand=()=>.99;');assert(run('enhanceEquipment("weapon",{protect:true,charm:true})'));assert.equal(run('p.equipped.weapon.enhance'),8);assert.equal(run('p.career.materials.protectionScroll'),99999);assert.equal(run('p.career.materials.smithCharm'),99999);assert.equal(run('p.gold'),run('before-cost.gold'));
 run('p.equipped.weapon.enhance=5;rand=()=>.4;');assert(run('enhanceEquipment("weapon",{charm:true})'));assert.equal(run('p.equipped.weapon.enhance'),6);
 run('p.equipped.weapon.enhance=0;var charm=p.career.materials.smithCharm,protection=p.career.materials.protectionScroll;rand=()=>0;enhanceEquipment("weapon",{charm:true,protect:true});');assert.equal(run('p.career.materials.smithCharm'),run('charm'));assert.equal(run('p.career.materials.protectionScroll'),run('protection'));
});

test('missing protection or booster never silently attempts an unprotected upgrade',()=>{
 const {run}=smith();run('p.equipped.weapon.enhance=8;p.career.materials.protectionScroll=0;var before=p.gold;rand=()=>{throw Error("unexpected attempt");};');assert(!run('enhanceEquipment("weapon",{protect:true})'));assert.equal(run('p.gold'),run('before'));assert.equal(run('p.equipped.weapon.enhance'),8);
 run('p.career.materials.smithCharm=0;');assert(!run('enhanceEquipment("weapon",{charm:true})'));assert.equal(run('p.gold'),run('before'));
});

test('blacksmith crafts support for finite resources; only eligible high-level rare sources grant extra supplies',()=>{
 const {run}=smith();run('p.career.crafting.xp=CRAFT_RULES.maxXP;var before=p.gold,cores=p.career.materials.forgeCore;');assert(run('craftForgeSupport("protectionScroll")'));assert.equal(run('p.gold'),run('before-FORGE_RULES.recipes.protectionScroll.gold'));assert.equal(run('p.career.materials.forgeCore'),run('cores-6'));assert(!run('craftForgeSupport("toString")'));
 run('for(const id of Object.keys(MATERIALS))p.career.materials[id]=0;p.level=35;rand=()=>0;var enemy={type:"boss",level:35,x:500,y:500};dropForgeSupplies(enemy);');for(const id of ['forgeCore','smithCharm','protectionScroll'])assert.equal(run('p.career.materials.'+id),1);
 run('dropForgeSupplies({...enemy,level:34});dropForgeSupplies({...enemy,metinParentId:"parent"});dropForgeSupplies({...enemy,type:"wolf",variant:"normal"});p.level=99;dropForgeSupplies(enemy);');assert.equal(run('p.career.materials.forgeCore'),1);assert.equal(run('drops.length'),0);
});

test('old multi-character storage and backup gain only missing forge counters, preserving equipment and Yang',()=>{
 const {run,saved}=smith();run('p.equipped.weapon.enhance=5;save();');const account=readSavedAccount(saved),id=account.selectedId;for(const key of ['forgeCore','smithCharm','protectionScroll'])delete account.profiles[id].data.career.materials[key];
 const loaded=createEmptyGame({'grindoria-characters-v1':account});assert.equal(loaded.run('characterStore.error'),'');assert(loaded.run('playCharacter()'));assert.equal(loaded.run('p.equipped.weapon.enhance'),5);assert.equal(loaded.run('p.gold'),run('p.gold'));assert.equal(loaded.run('p.career.materials.forgeCore'),0);
 const target=createEmptyGame(),doc={format:'grindoria-characters',version:2,account};target.run('var prepared=prepareCharacterImport('+JSON.stringify(JSON.stringify(doc))+');importCharacterBackup(prepared,"add");playCharacter();');assert.equal(target.run('p.equipped.weapon.enhance'),5);assert.equal(target.run('p.career.materials.smithCharm'),0);
 account.profiles[id].data.career.materials.forgeCore=-1;assert.throws(()=>target.run('prepareCharacterImport('+JSON.stringify(JSON.stringify({format:'grindoria-characters',version:2,account}))+')'));
});

test('weapons +5 through +9 have increasingly strong SVG and canvas effects without consuming gameplay randomness',()=>{
 const {run}=smith();run('var Path2D=class{constructor(d){this.d=d;}};rand=()=>{throw Error("visual RNG");};p.equipped.weapon.enhance=4;');assert.equal(run('weaponUpgradeProfile(p.equipped.weapon)'),null);assert(!run('itemIcon(p.equipped.weapon).includes("data-upgrade-effect")'));
 for(let rank=5;rank<=9;rank++){
  run('p.equipped.weapon.enhance='+rank+';var effect=weaponUpgradeProfile(p.equipped.weapon);');assert.equal(run('effect.strength'),rank-4);assert.equal(run('effect.sparks'),(rank-4)*2);assert(run('itemIcon(p.equipped.weapon).includes(\'data-upgrade-effect="'+rank+'"\')'));assert(run('canvasEquipment(p.equipped.weapon,0,0,64,80)'));
 }
 assert.equal(run('weaponUpgradeProfile({slot:"armor",enhance:9})'),null);
});

test('combat maps are expanded with distinct small safe zones and natural spawns across the expanded area',()=>{
 const {run}=createGame();const centers=[];for(const id of ['valley','desert','snow','temple','suterland']){
  run('loadMap("'+id+'",true);');assert.equal(run('SIZE'),3200);assert.equal(run('safeZone().radius'),85);assert(run('isSanctuary(map().entry)'));assert(run('mobs.every(m=>!isSanctuary(m))'));assert(run('mobs.some(m=>m.x>2300)&&mobs.some(m=>m.y>2300)'));centers.push(run('safeZone().x+":"+safeZone().y'));
 }assert.equal(new Set(centers).size,5);
});

test('old 2000-unit worlds scale position and ground loot once, preserving damage, dead timers and inventory',()=>{
 const {run,saved}=createGame();run('p.x=700;p.y=1400;save();');const profile=readSavedProfile(saved),world=profile.worldStates.valley;delete world.worldSize;world.mobs[0].hp=0;world.mobs[0].dead=3;world.drops=[{kind:"gear",id:1,x:600,y:900,item:{slot:"weapon",name:"Pamiatka",bonus:5}}];
 const migrated=createGame(profile);assert.equal(migrated.run('p.x'),1120);assert.equal(migrated.run('p.y'),2240);assert.equal(migrated.run('mobs[0].hp'),0);assert.equal(migrated.run('mobs[0].dead'),3);assert.equal(migrated.run('drops[0].x'),960);assert.equal(migrated.run('drops[0].y'),1440);migrated.run('save();');
 const again=createGame(readSavedProfile(migrated.saved));assert.equal(again.run('p.x'),1120);assert.equal(again.run('drops[0].x'),960);assert.equal(again.run('p.worldStates.valley.worldSize'),3200);
});

test('travel works anywhere out of combat and blocks recent attacks and any active hostile targeting',()=>{
 const {run}=createGame();run('running=true;p.x=800;p.y=1400;mobs.forEach(m=>m.hp=0);');assert(run('canTravel()'));assert(run('loadMap("desert")'));run('p.x=800;p.y=1400;mobs.forEach(m=>m.hp=0);attackCD=0;attack();');assert(!run('canTravel()'));assert(!run('loadMap("town")'));run('travelCombat.time=0;var foe=mobs[0];foe.hp=foe.max;foe.engaged=8;');assert(!run('canTravel()'));run('foe.engaged=0;foe.taunt=8;');assert(!run('canTravel()'));run('foe.taunt=0;');assert(run('canTravel()'));
 run('var boss=mobs.find(m=>m.type==="boss");boss.hp=boss.max;boss.x=p.x+100;boss.y=p.y;');assert(!run('canTravel()'));run('boss.hp=0;');assert(run('canTravel()'));assert(run('loadMap("town")'));
});

test('destroying a Metin kills its own guards and pays their usual rewards once without harming another group',()=>{
 const {run}=createGame();run('running=true;loadMap("suterland",true);p.level=50;rand=()=>.999;var stone=mobs.find(m=>m.level===50),other=mobs.find(m=>m.level===51);spawnMetinGuards(stone);spawnMetinGuards(other);var guards=mobs.filter(m=>m.metinParentId===stone.spawnId),others=mobs.filter(m=>m.metinParentId===other.spawnId);p.x=stone.x-60;p.y=stone.y;var count=guards.length,kills=p.kills;hit(stone,999999);');assert(run('guards.every(g=>g.hp===0)'));assert(run('others.every(g=>g.hp>0)'));assert.equal(run('p.kills'),run('kills+count'));assert(run('p.gold>0&&p.xp>0'));run('var gold=p.gold,xp=p.xp;hit(stone,999999);updateMetins(.01,false);');assert.equal(run('p.gold'),run('gold'));assert.equal(run('p.xp'),run('xp'));
 assert(run('METIN_RULES.firstWave<=.1&&Object.values(METIN_TYPES).every(t=>t.interval<3)'));assert.equal(run('ENEMY_VARIANTS.normal.respawn'),8);assert.equal(run('ENEMY_VARIANTS.elite.respawn'),12);assert.equal(run('SPAWN_RULES.rareChance'),.003);
});

test('the second click acts after any delay without a native dblclick and another first click only selects',()=>{
 const {run,listeners}=createGame();run('running=true;p.x=500;p.y=1400;cam.x=p.x;cam.y=p.y;mobs.forEach(m=>m.hp=0);var foe=mobs[0],other=mobs[1];Object.assign(foe,{hp:1000,max:1000,x:550,y:1400});Object.assign(other,{hp:1000,max:1000,x:700,y:1400});var at=screen(foe.x,foe.y);');
 const click=()=>listeners.get('game:pointerdown')({button:0,clientX:run('at.x'),clientY:run('at.y-20')});click();assert(run('target===foe'));assert(!run('combatSelection.following'));assert.equal(run('foe.hp'),1000);run('clock+=20;');click();assert(run('combatSelection.following'));assert(run('foe.hp<1000'));
 run('at=screen(other.x,other.y);');click();assert(run('target===other'));assert(!run('combatSelection.following'));assert.equal(run('other.hp'),1000);
});

test('finishing an expedition immediately after its final combat safely returns to town',()=>{
 const {run}=createGame();run('running=true;p.level=35;p.career.materials.keys=3;enterRift();p.career.endgame.run.kills=20;p.career.endgame.run.bosses=1;travelCombat.time=3;');assert(run('finishRift()'));assert.equal(run('p.mapId'),'town');assert.equal(run('mobs.length'),0);assert.equal(run('SIZE'),1200);
});

