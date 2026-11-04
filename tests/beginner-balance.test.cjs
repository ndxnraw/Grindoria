const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,createEmptyGame,readSavedProfile,readSavedAccount}=require('./helpers/game.cjs');
test('each school starts with its own common level-one +2 weapon and isolated identity',()=>{
const {run,saved}=createEmptyGame();const combinations=[['warrior','body','sword'],['warrior','mental','sword'],['ninja','blade','daggers'],['ninja','archery','bow'],['sura','weapon','sword'],['sura','black','sword'],['shaman','dragon','fan'],['shaman','healing','fan']];
for(let i=0;i<combinations.length;i++){const [cls,school,kind]=combinations[i];run('var id=createCharacter("Hrac'+i+'","'+cls+'","'+school+'");var gear=characterStore.account.profiles[id].data.equipped.weapon;validateCharacterItem(gear);');assert.equal(run('gear.weaponKind'),kind);assert.equal(run('gear.enhance'),2);assert.equal(run('gear.rarity'),0);assert.equal(run('gear.requiredLevel'),1);assert.equal(run('gear.affixes.length'),0);}
assert.equal(new Set(Object.values(readSavedAccount(saved).profiles).map(p=>p.data.equipped.weapon.instanceId)).size,8);
});
test('starter gear survives reload and is never reissued after deliberate removal',()=>{
const g=createGame(null,undefined,{}, {keepStarter:true});g.run('var identity=p.equipped.weapon.instanceId;save();');const profile=readSavedProfile(g.saved),reload=createGame(profile);assert.equal(reload.run('p.equipped.weapon.instanceId'),g.run('identity'));
reload.run('p.equipped.weapon=null;save();');const again=createGame(readSavedProfile(reload.saved));assert.equal(again.run('p.equipped.weapon'),null);assert.equal(again.run('p.starterWeaponGranted'),true);
});
test('legacy level-one unarmed characters get a starter once while existing equipped gear is preserved',()=>{
const g=createGame();g.run('p.starterWeaponGranted=false;p.equipped.weapon=null;var bagItem=createItem("weapon:fms");addGearItem(bagItem);save();');const old=readSavedProfile(g.saved),restore=createGame(old);assert.equal(restore.run('p.equipped.weapon.enhance'),2);assert.equal(restore.run('p.bag[0].instanceId'),g.run('bagItem.instanceId'));
restore.run('delete p.starterWeaponGranted;p.equipped.weapon.enhance=4;var identity=p.equipped.weapon.instanceId;save();');const preserved=createGame(readSavedProfile(restore.saved));assert.equal(preserved.run('p.equipped.weapon.enhance'),4);assert.equal(preserved.run('p.equipped.weapon.instanceId'),restore.run('identity'));
});
test('entry lies in the beginner region with ordinary level 1–2 packs and low Metins',()=>{
const {run}=createGame();assert.equal(run('farmAreaAt(map().entry).id'),'southwest');assert(run('mobs.filter(m=>m.type==="wolf"&&!m.rareSlot&&m.area==="southwest").every(m=>m.variant==="normal"&&m.level<=2)'));assert(run('mobs.some(m=>m.type==="wolf"&&m.level===1)'));assert(run('mobs.filter(m=>m.type==="stone").every(m=>m.level>=1&&m.level<=8&&m.metinType==="fracture")'));assert.equal(run('mobs.find(m=>m.type==="boss").level'),8);
});
test('an actual level-one starter defeats a full ordinary group with three basic cleaves',()=>{
const {run}=createGame(null,undefined,{}, {keepStarter:true});run('running=true;p.x=600;p.y=2400;cam.x=p.x;cam.y=p.y;var group=mobs.filter(m=>m.type==="wolf"&&m.area==="southwest"&&!m.rareSlot).slice(0,5);mobs.length=0;mobs.push(...group);group.forEach((m,i)=>{const angle=i*Math.PI*2/5;m.x=p.x+Math.cos(angle)*45;m.y=p.y+Math.sin(angle)*45;});rand=()=>.99;for(var hitIndex=0;hitIndex<3;hitIndex++){attackCD=0;attack();}');assert(run('group.every(m=>m.hp===0)'));assert.equal(run('p.level'),1);assert(run('p.hp>0'));
});
test('a level-one starter can finish a low Metin and its guards through normal following and attack updates',()=>{
const {run}=createGame(null,undefined,{}, {keepStarter:true});run('running=true;var stone=mobs.find(m=>m.type==="stone"&&m.level===1);mobs.length=0;mobs.push(stone);p.x=stone.x-76;p.y=stone.y;cam.x=p.x;cam.y=p.y;rand=()=>.99;selectCombatTarget(stone,true);for(var i=0;i<200&&stone.hp>0;i++)update(.05);');
assert.equal(run('stone.hp'),0);assert(run('p.hp>0'));assert(run('mobs.filter(m=>m.metinParentId).every(m=>m.hp===0)'));
});
test('ordinary loot requirements match enemy levels independently of player level',()=>{
const {run}=createGame();run('p.level=99;');
for(const [level,required]of [[1,1],[2,2],[4,4],[5,5],[9,9],[14,14],[29,29],[30,30],[75,75],[99,99]]){run('var drop=makeItem(false,{type:"wolf",level:'+level+'},"armor");');assert.equal(run('drop.requiredLevel'),required);run('validateCharacterItem(drop);');}
assert.equal(run('createItem("weapon:poison-sword").requiredLevel'),75);
});
test('new maps have different safe zones, valid populations, local Metins and their own boss loot pools',()=>{
const {run}=createGame();const zones=new Set();
for(const id of ['meadow','marsh','quarry','highlands','ruins','wastes']){run('loadMap("'+id+'",true);draw();');zones.add(run('JSON.stringify(safeZone())'));assert(run('mobs.filter(m=>m.type==="wolf").length===map().count'));assert.equal(run('mobs.filter(m=>m.type==="stone").length'),8);assert(run('mobs.every(m=>m.level>=map().level&&m.level<=map().levelMax)'));assert(run('mobs.filter(m=>m.type==="stone").every(m=>METIN_MAP_TYPES[p.mapId].includes(m.metinType)&&m.level>=METIN_TYPES[m.metinType].levels[0]&&m.level<=METIN_TYPES[m.metinType].levels[1])'));assert(run('LOOT_POOLS["boss:"+p.mapId]'));assert(run('!isSanctuary(mobs[0])'));run('validateCharacterAccount(accountWithActiveSnapshot());');}
assert.equal(zones.size,6);
});
test('legacy valley balance migration preserves dead slots, HP ratios, drops and unrelated progress',()=>{
const {run,saved}=createGame();run('var m=mobs[0];m.level=20;m.max=1000;m.hp=500;var dead=mobs[1];dead.hp=0;dead.dead=4;p.gold=234;var loot=spawnGroundDrop({kind:"gear",item:createItem("weapon:fms")},p);save();');const profile=readSavedProfile(saved);delete profile.worldStates.valley.balanceSchema;const g=createGame(profile);assert(g.run('mobs[0].level<=2'));assert(Math.abs(g.run('mobs[0].hp/mobs[0].max')-.5)<.02);assert.equal(g.run('mobs[1].hp'),0);assert.equal(g.run('mobs[1].dead'),4);assert.equal(g.run('p.gold'),234);assert.equal(g.run('drops[0].item.instanceId'),run('loot.item.instanceId'));g.run('save();');assert.equal(readSavedProfile(g.saved).worldStates.valley.balanceSchema,2);
});
test('already rebalanced valley snapshots do not reroll stats or revive enemies on reload',()=>{
const {run,saved}=createGame();run('mobs[0].hp=7;mobs[1].hp=0;mobs[1].dead=5;save();');const g=createGame(readSavedProfile(saved));assert.equal(g.run('mobs[0].hp'),7);assert.equal(g.run('mobs[1].hp'),0);assert.equal(g.run('mobs[1].dead'),5);
});
test('melee cleave hits around the player but retains directional reach beyond the inner radius',()=>{
const {run}=createGame();run('running=true;p.x=600;p.y=2400;mobs.length=0;for(var i=0;i<8;i++){const angle=i*Math.PI/4;mobs.push({type:"wolf",skin:"wolf",level:1,hp:1000,max:1000,x:p.x+Math.cos(angle)*50,y:p.y+Math.sin(angle)*50,homeX:p.x,homeY:p.y});}var back={...mobs[0],x:p.x-80};mobs.push(back);face=0;rand=()=>.99;attack();');assert(run('mobs.slice(0,8).every(m=>m.hp<1000)'));assert.equal(run('back.hp'),1000);run('attackCD=0;paused=true;var hp=mobs[0].hp;attack();');assert.equal(run('mobs[0].hp'),run('hp'));
});
test('basic arrow impact splashes nearby enemies once with reduced damage and keeps the selected primary target',()=>{
const {run}=createGame();run('running=true;p.x=600;p.y=2400;p.classId="ninja";p.schools.ninja="archery";mobs.length=0;var primary={type:"wolf",skin:"wolf",level:1,hp:1000,max:1000,x:p.x+150,y:p.y},near={...primary,x:primary.x+60},far={...primary,x:primary.x+66};mobs.push(primary,near,far);target=primary;rand=()=>.99;impactShot({mult:1,style:"arrow",color:"#fff",opts:{basic:true,type:"piercing",skillKey:null,multiplier:1}},primary);');assert(run('primary.hp<near.hp&&near.hp<1000'));assert.equal(run('far.hp'),1000);assert(run('target===primary'));
});
test('ground and inventory tooltips omit absent bonuses and common quality percentages',()=>{
const {run}=createGame();run('var gear=createItem("equipment:weapon:sword",{rarity:0,tier:1});gear.baseStats={attackSpeed:.05};var html=groundDropTooltip({id:1,kind:"gear",item:gear,count:1,x:p.x,y:p.y,fallAge:1});');assert.match(run('html'),/Rýchlosť útoku/);assert(!run('html.includes("Max. zdravie")||html.includes("Prenikavý zásah")||html.includes("Bonusy: 0")||html.includes("Vylepšenie +0")'));assert(!run('itemBonusText(gear).includes("Max. zdravie")'));
});
test('new map progress and starter identities survive multi-character backup export and import',()=>{
const {run}=createEmptyGame();run('var id=createCharacter("Zaciatok","shaman");playCharacter(id);loadMap("marsh",true);p.gold=123;save();var identity=p.equipped.weapon.instanceId;var backup=exportCharacters();returnToCharacters();');const g=createEmptyGame();g.run('importCharacterBackup(prepareCharacterImport('+JSON.stringify(run('backup'))+'),"add");playCharacter();');assert.equal(g.run('p.mapId'),'marsh');assert.equal(g.run('p.gold'),123);assert.equal(g.run('p.equipped.weapon.instanceId'),run('identity'));
});

test('high-level farming continues through level 99 instead of ending with underleveled enemies',()=>{
const {run}=createGame();run('loadMap("ruins",true);');assert(run('mobs.some(m=>m.type==="wolf"&&m.level>=75)'));run('loadMap("wastes",true);p.level=98;');assert(run('mobs.some(m=>m.type==="wolf"&&m.level===99&&enemyXP(m)>0&&rewardEligible(m))'));assert(run('mobs.every(m=>m.level<=99)'));
});

test('all ordinary maps put their lowest-level area at entry and keep bosses outside immediate aggro range',()=>{
const {run}=createGame();for(const id of Array.from(run('Object.keys(MAPS).filter(id=>!MAPS[id].town&&!MAPS[id].instance&&!MAPS[id].metinsOnly)'))){run('loadMap("'+id+'",true);var area=farmAreaAt(map().entry),range=farmAreaLevelRange(area);');assert.equal(run('range[0]'),run('map().enemyLevel'),id);assert(run('Math.hypot(map().bossPosition.x-map().entry.x,map().bossPosition.y-map().entry.y)>650'),id);}
});
