const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,readSavedAccount,createEmptyGame}=require('./helpers/game.cjs');
test('generated instances share attributes but never identity; clones preserve identity and isolate nested affixes',()=>{
const {run}=createGame();run('var a=createItem("weapon:fms",{rng:layoutRandom("a")}),b=createItem("weapon:fms",{rng:layoutRandom("a")});validateCharacterItem(a);var c=cloneItem(a);c.stats.hp=777;c.affixes[0].roll=0;');
assert.notEqual(run('a.instanceId'),run('b.instanceId'));assert.notEqual(run('a.uid'),run('b.uid'));assert.equal(run('c.instanceId'),run('a.instanceId'));assert(!run('a.stats.hp===777'));
});
test('every iconic weapon has unique geometry, valid canonical attributes and real innate combat bonuses',()=>{
const {run}=createGame();run('var icons=new Set();p.level=99;');
for(const key of ['fms','poison','rib','blackleaf','autumn']){
run('var d=ICONIC_ITEMS["'+key+'"],a=createItem(d.id);validateCharacterItem(a);icons.add(equipmentAppearance(a).parts[0].d);');
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
const {run}=createGame();run('LOOT_POOLS["enemy:wolf"].gear.normal=0;');assert.equal(run('LOOT_POOLS["enemy:scorpion"].gear.normal'),.12);
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
