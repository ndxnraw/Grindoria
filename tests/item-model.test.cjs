const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,readSavedAccount,createEmptyGame}=require('./helpers/game.cjs');
test('generated instances share attributes but never identity; clones preserve identity and isolate nested affixes',()=>{
const {run}=createGame();run('var a=createItem("weapon:fms",{rng:layoutRandom("a")}),b=createItem("weapon:fms",{rng:layoutRandom("a")});validateCharacterItem(a);var c=cloneItem(a);c.stats.hp=777;c.affixes.push({stat:"hp",roll:0});');
assert.notEqual(run('a.instanceId'),run('b.instanceId'));assert.notEqual(run('a.uid'),run('b.uid'));assert.equal(run('c.instanceId'),run('a.instanceId'));assert(!run('a.stats.hp===777'));assert.equal(run('a.affixes.length'),0);
});
test('every iconic weapon has unique geometry, valid canonical attributes and real innate combat bonuses',()=>{
const {run}=createGame();run('var icons=new Set();p.level=99;');
for(const key of ['fms','poison','rib','blackleaf','autumn']){
run('var d=ITEM_DEFINITIONS[ICONIC_ITEMS["'+key+'"].id],a=createItem(d.id);validateCharacterItem(a);icons.add(equipmentAppearance(a).parts[0].d);');
assert.equal(run('a.requiredLevel'),run('d.level'));assert.equal(run('a.bonus'),run('d.bonus'));
assert(run('Object.entries(d.baseStats).every(([s,n])=>itemBonuses(a)[s]>=n)'));
}assert.equal(run('icons.size'),5);
});
test('gear keeps its identity through physical drop, pickup, equipment and backup reload',()=>{
const {run,saved}=createGame();run('running=true;p.level=99;var a=createItem("weapon:fms"),identity=a.instanceId;var drop=spawnGroundDrop({kind:"gear",item:a},p);drop.x=p.x;drop.y=p.y;drop.fallAge=1;pickUpGroundDrop(drop.id);equipItem(p.bag.length-1);closeModal();save();');
assert.equal(run('p.equipped.weapon.instanceId'),run('identity'));
const account=readSavedAccount(saved),g=createEmptyGame({'grindoria-characters-v1':account});assert(!g.run('characterStore.error'));g.run('playCharacter();');assert.equal(g.run('p.equipped.weapon.instanceId'),run('identity'));
});
test('shop transfers the actual offer once and crafting creates a new canonical weapon',()=>{
const {run}=createGame();run('running=true;loadMap("town",true);p.level=99;p.gold=1e9;p.x=NPCS.armsdealer.x;p.y=NPCS.armsdealer.y;var original=p.economy.catalogItems["catalog-fms"].instanceId;');
assert(run('buyMarketOffer("armsdealer","catalog-fms")'));assert.equal(run('p.bag.at(-1).instanceId'),run('original'));assert(!run('buyMarketOffer("armsdealer","catalog-fms")'));
run('p.x=NPCS.smith.x;p.y=NPCS.smith.y;p.career.crafting.xp=4500;for(const id of Object.keys(MATERIALS))p.career.materials[id]=1000;');
assert(run('craftRecipe("iconic-fms")'));assert.notEqual(run('p.bag.at(-1).instanceId'),run('original'));run('validateCharacterAccount(accountWithActiveSnapshot());');
});
test('legacy saves migrate gear in bag, equipment and ground without changing power or requirements',()=>{
const {run}=createGame();run('var data=copyCharacterData(p);data.bag=[{name:"Starý meč",slot:"weapon",uid:9,bonus:17,stats:{hp:20}}];data.equipped.armor={name:"Brnenie",slot:"armor",uid:10,bonus:8};data.worldStates={};delete data.economy;delete data.inventory;migrateItemProfile(data,"old");');
assert.equal(run('data.bag[0].bonus'),17);assert.equal(run('data.bag[0].stats.hp'),20);assert.equal(run('data.bag[0].requiredLevel'),1);assert.equal(run('data.bag[0].instanceId'),'old:item:9');assert.equal(run('data.equipped.armor.instanceId'),'old:item:10');
});
test('identity validation rejects duplicate owned gear and unknown definitions or models',()=>{
const {run}=createGame();run('var a=createItem("weapon:fms");addGearItem(a);');
for(const mutation of ['data.bag.push(cloneItem(data.bag[0]));','data.bag[0].definitionId="weapon:missing";','data.bag[0].modelId="missing";','data.bag[0].baseStats.attackSpeed=99;']){
assert.throws(()=>run('var data=copyCharacterData(p);'+mutation+'validateProfileItemIdentities(data);'));
}
});
test('copied profile imports rebase global identities while preserving numeric inventory references',()=>{
const {run}=createGame();run('var data=copyCharacterData(p);data.bag=[createItem("weapon:fms")];var uid=data.bag[0].uid,old=data.bag[0].instanceId;rebaseImportedItems(data,p.characterId,"copy");');
assert.equal(run('data.bag[0].uid'),run('uid'));assert.notEqual(run('data.bag[0].instanceId'),run('old'));assert(run('data.bag[0].instanceId.startsWith("copy:item:")'));
});
test('supply counters expose shared definitions without a second persisted inventory',()=>{
const {run}=createGame();run('var s=supplyDefinitions().find(s=>s.id==="material:ore");');
assert.equal(run('s.definitionId'),'material:ore');assert.equal(run('s.type'),'material');assert.equal(run('s.count'),run('p.career.materials.ore'));
run('grantGroundSupply(s.id,5);');assert.equal(run('supplyDefinitions().find(x=>x.id===s.id).count'),run('s.count+5'));
});
test('configurable enemy and Metin pools reference registered definitions and existing Metin tables',()=>{
const {run}=createGame();for(const id of ['wolf','scorpion','yeti','demon'])assert(run('LOOT_POOLS["enemy:'+id+'"]'));
assert(run('Object.entries(METIN_TYPES).every(([id,t])=>LOOT_POOLS["metin:"+id].metin===t.loot)'));
assert.throws(()=>run('registerLootPool("bad",{catalog:[{definitionId:"missing",chance:1}]})'));
});
test('iconic drops respect enemy level, reward eligibility and configured chances',()=>{
const {run}=createGame();run('p.level=30;rand=()=>0;var enemy={type:"boss",level:30,mapId:"temple",x:p.x,y:p.y};var before=drops.length;dropCatalogLoot(enemy);');
assert.equal(run('drops.length-before'),4);assert(!run('drops.slice(before).some(d=>d.item.definitionId==="weapon:poison-sword")'));
run('p.level=75;enemy.level=75;before=drops.length;dropCatalogLoot(enemy);');assert.equal(run('drops.length-before'),5);
run('p.level=99;enemy.level=1;before=drops.length;dropCatalogLoot(enemy);');assert.equal(run('drops.length-before'),0);
});
test('retired item catalog cannot be opened from overview',()=>{const {run,elements}=createGame();run('running=true;careerPanel();');assert.equal(run('careerPanel("items")'),false);assert(!elements.get('modalcontent').innerHTML.includes('data-career-tab="items"'));assert.equal(run('typeof itemCatalogPanel'),'undefined');});

test('each enemy pool can tune its gear odds without changing another species',()=>{
const {run}=createGame();run('LOOT_POOLS["enemy:wolf"].gear.normal=0;');assert.equal(run('LOOT_POOLS["enemy:scorpion"].gear.normal'),.06);
run('rand=()=>.001;var before=drops.length;dropFarmEquipment({type:"wolf",skin:"wolf",level:1,x:p.x,y:p.y});');assert.equal(run('drops.length'),run('before'));
});
test('canonical corrupted imports fail atomically while name-resolved copies get disjoint item identities',()=>{
const {run,saved}=createGame();run('addGearItem(createItem("weapon:fms"));save();var backup=JSON.parse(exportCharacters()),before=localStorage.getItem(CHARACTER_RULES.storageKey);');
run('var id=backup.account.order[0];backup.account.profiles[id].data.bag[0].definitionId="weapon:unknown";');
assert.throws(()=>run('prepareCharacterImport(JSON.stringify(backup))'));assert.equal(run('localStorage.getItem(CHARACTER_RULES.storageKey)'),run('before'));
run('running=true;returnToCharacters();var prepared=prepareCharacterImport(exportCharacters()),originalId=characterStore.account.order[0];importCharacterBackup(prepared,"add",{renames:{[originalId]:"Kopia"}});var copyId=characterStore.account.order[1];');assert.notEqual(run('characterStore.account.profiles[originalId].data.bag[0].instanceId'),run('characterStore.account.profiles[copyId].data.bag[0].instanceId'));
});

test('separate browser script files restore canonical saves only after all registries load',()=>{
const g=createGame();g.run('addGearItem(createItem("weapon:fms"));save();');const account=readSavedAccount(g.saved);
const reload=createGame(null,'grindoria-save-v1',{'grindoria-characters-v1':account},{separateScripts:true});assert.equal(reload.run('characterStore.error'),'');assert.equal(reload.run('p.bag[0].definitionId'),'weapon:fms');assert.equal(reload.run('p.bag[0].instanceId'),g.run('p.bag[0].instanceId'));
});

test('all sourced weapons and armor have fixed requirements and no extra bonuses on acquisition',()=>{
 const {run}=createGame();
 assert.equal(run('METIN_EQUIPMENT.filter(d=>d.slot==="weapon").length'),147);
 assert.equal(run('METIN_EQUIPMENT.filter(d=>d.slot==="armor").length'),88);
 assert(run('METIN_EQUIPMENT.every(d=>{const item=createItem(d.id,{tier:1,rarity:5});validateCharacterItem(item);return item.requiredLevel===d.level && item.tier===d.level && !item.affixes.length && Object.keys(item.stats).length===0;})'));
 assert.equal(run('createItem("weapon:fms").baseStats.attackSpeed'),.15);
 assert.equal(run('createItem("weapon:fms").bonus'),33);
 assert(run('METIN_EQUIPMENT.filter(d=>d.slot==="armor"&&d.level===1).every(d=>d.bonus>0)'));
});

test('bought tools add four distinct lines then reroll just the added attributes',()=>{
 const {run}=createGame();
 run('running=true;loadMap("town",true);p.x=NPCS.merchant.x;p.y=NPCS.merchant.y;p.level=99;p.gold=1e6;var weapon=createItem("weapon:fms");addGearItem(weapon);var key="gear:"+weapon.uid,add="material:strengthenItem",reroll="material:enchantItem";var fixed=JSON.stringify([weapon.uid,weapon.instanceId,weapon.requiredLevel,weapon.baseStats,weapon.enhance]);');
 assert(run('buyMarketOffer("merchant","enchantItem")'));
 assert(!run('applyItemBonus(reroll,key)'));
 assert.equal(run('p.career.materials.enchantItem'),1);
 assert(run('Array.from({length:5},()=>buyMarketOffer("merchant","strengthenItem")).every(Boolean)'));
 assert(run('Array.from({length:4},()=>applyItemBonus(add,key,()=>0)).every(Boolean)'));
 assert(!run('applyItemBonus(add,key)'));
 assert.equal(run('p.career.materials.strengthenItem'),1);
 run('var previous=weapon.affixes.map(a=>a.stat);equipItem(p.bag.indexOf(weapon));');
 assert(run('applyItemBonus(reroll,"equipped:weapon",()=>.5)'));
 assert.equal(run('p.career.materials.enchantItem'),0);
 assert(run('weapon.affixes.length===4 && new Set(weapon.affixes.map(a=>a.stat)).size===4 && weapon.affixes.every(a=>!previous.includes(a.stat))'));
 assert.equal(run('JSON.stringify([weapon.uid,weapon.instanceId,weapon.requiredLevel,weapon.baseStats,weapon.enhance])'),run('fixed'));
 run('validateCharacterAccount(accountWithActiveSnapshot());');
});

test('profiles predating the bonus tools load their holdings and merchant stock',()=>{
 const {run,saved}=createGame();
 run('var previous=LEGACY_ICONIC_DEFINITIONS["weapon:fms"];var old=generateEquipmentItem("weapon",previous.rarity,previous.level,"sword",()=>0);Object.assign(old,{definitionId:previous.id,name:previous.name,bonus:previous.bonus,modelId:previous.modelId,classes:[...previous.classes],allowedSchools:[...previous.schools],baseStats:{...previous.baseStats}});addGearItem(old);save();');
 const account=readSavedAccount(saved), data=account.profiles[account.selectedId].data;
 for(const id of ['strengthenItem','enchantItem']){delete data.career.materials[id];delete data.economy.stock['merchant:'+id];}
 const old=JSON.stringify(data.bag[0]);
 const reload=createEmptyGame({'grindoria-characters-v1':account});
 assert.equal(reload.run('characterStore.error'),'');
 reload.run('playCharacter();');
 assert.equal(reload.run('JSON.stringify(p.bag[0])'),old);
 assert(reload.run('Object.keys(ITEM_BONUS_TOOLS).every(id=>p.career.materials[id]===0 && p.economy.stock["merchant:"+id]===MARKET_GOODS[id].stock)'));
});

test('the same gear name has one required level across source levels and rarities',()=>{
 const {run}=createGame();
 assert(run(`const levelsByName=new Map();
   Object.keys(EQUIPMENT).every(slot=>[1,18,23,29,30,45,59,60,75,99].every(level=>
     RARITIES.every(({id})=>{
       const item=rewardEquipment(slot,id,level,undefined,()=>0);
       const previous=levelsByName.get(item.name);
       levelsByName.set(item.name,item.requiredLevel);
       return item.requiredLevel<=level && (previous===undefined||previous===item.requiredLevel);
     })))`));
});

test('saved gear gets its fixed requirement without changing its rolled stats or identity',()=>{
 const {run}=createGame();
 assert(run(`const shield=generateEquipmentItem('shield',1,23,undefined,()=>.5);
   const unique={...generateEquipmentItem('bracelet',1,32),uniqueId:'crypt',name:DUNGEON_UNIQUES.crypt.name};
   const data=copyCharacterData(p);
   data.bag=[shield];data.equipped.bracelet=unique;
   const rolls=JSON.stringify([shield.uid,shield.instanceId,shield.tier,shield.stats,shield.affixes]);
   migrateItemProfile(data,p.characterId);
   migrateItemProfile(data,p.characterId);
   validateCharacterItem(shield);validateCharacterItem(unique);
   shield.requiredLevel===30 && unique.requiredLevel===20 &&
     rolls===JSON.stringify([shield.uid,shield.instanceId,shield.tier,shield.stats,shield.affixes])`));
});
