const test=require('node:test'),assert=require('node:assert/strict');
const {createEmptyGame,readSavedAccount}=require('./helpers/game.cjs');
const STORE='grindoria-characters-v1';
const reload=saved=>createEmptyGame({[STORE]:saved.get(STORE)});
function populated(){const game=createEmptyGame();game.run('var a=createCharacter("Aradan","warrior"),b=createCharacter("Nymera","ninja","archery"),c=createCharacter("Elira","ninja","blade");');return game;}

test('empty hall, first creation, same-vocation characters and configurable capacity work',()=>{
  const {run,elements}=createEmptyGame();assert.equal(run('characterStore.account.order.length'),0);assert.equal(run('running'),false);assert.match(elements.get('intro').innerHTML,/Žiadne postavy/);
  run('let a=createCharacter("Aradan","warrior");');assert.equal(run('characterStore.account.profiles[a].data.level'),1);assert.equal(run('characterStore.account.profiles[a].data.hp'),120);
  run('createCharacter("Nymera","ninja");createCharacter("Elira","ninja","archery");');assert.equal(run('characterStore.account.order.length'),3);assert.equal(run('new Set(characterStore.account.order).size'),3);
  run('CHARACTER_RULES.maxCharacters=3;');assert.throws(()=>run('createCharacter("TooMany","sura")'),/limit/);assert.equal(run('characterStore.account.order.length'),3);
});

test('names trim and normalize, reject invalid characters, enforce case-insensitive uniqueness, and support GM display',()=>{
  const {run}=createEmptyGame();run('var a=createCharacter("  Aradan  ","warrior");');assert.equal(run('characterStore.account.profiles[a].name'),'Aradan');
  for(const name of ['', 'ab','A'.repeat(17),'bad name','<script>','7Start','**Admin'])assert.throws(()=>run('createCharacter('+JSON.stringify(name)+',"warrior")'));
  assert.throws(()=>run('createCharacter("aRaDaN","ninja")'),/existuje/);assert.throws(()=>run('createCharacter("*ARADAN","sura")'),/existuje/);
  run('var gm=createCharacter("*Admin","sura");');assert.equal(run('characterDisplayName(characterStore.account.profiles[gm])'),'[GM] Admin');
  run('var composed=createCharacter("Élira","shaman");');assert.throws(()=>run('createCharacter("E\u0301lira","warrior")'),/existuje/);
});

test('one character has one fixed vocation and wrong-session writes cannot overwrite it',()=>{
  const {run,saved}=populated();run('playCharacter(a);');const prior=saved.get(STORE);
  assert.equal(run('chooseClass("sura")'),false);assert.equal(run('p.classId'),'warrior');
  run('p.classId="sura";');assert.equal(run('save()'),false);assert.equal(saved.get(STORE),prior);
  run('p.classId="warrior";p.characterId=b;');assert.equal(run('save()'),false);assert.equal(saved.get(STORE),prior);
});

test('level, inventory, equipment, Yang, quests, abilities, biology, bestiary, achievements and worlds remain isolated',()=>{
  const {run}=populated();run('playCharacter(a);loadMap("valley");p.level=35;p.xp=123;p.gold=900;p.strength=9;p.claimed=true;p.career.biology.stage=1;p.career.materials.books=8;skillProgress("body:0").rank=3;addGearItem({name:"Mesačný meč",slot:"weapon",bonus:18,rarity:1});equipItem(0);let foe=mobs[0];foe.hp=1;hit(foe,999);var aGold=p.gold;p.x=600;p.y=1400;returnToCharacters();playCharacter(b);');
  assert.equal(run('p.level'),1);assert.equal(run('p.gold'),0);assert.equal(run('p.strength'),0);assert.equal(run('p.bag.length'),0);assert.equal(run('p.equipped.weapon.weaponKind'),'bow');assert.equal(run('p.equipped.weapon.enhance'),9);assert.equal(run('p.claimed'),false);assert.equal(run('p.career.biology.stage'),0);assert.equal(run('p.career.materials.books'),0);assert.equal(run('Object.keys(p.bestiary).length'),0);assert.equal(run('Object.keys(p.achievements).length'),0);assert.equal(run('p.mapId'),'town');assert.equal(run('mobs.length'),0);
  run('p.level=12;p.gold=40;addGearItem({name:"Kožené čižmy",slot:"boots",bonus:5});returnToCharacters();playCharacter(a);');
  assert.equal(run('p.level'),35);assert.equal(run('p.gold'),run('aGold'));assert.equal(run('p.equipped.weapon.name'),'Mesačný meč');assert.equal(run('p.bag.length'),1);assert.equal(run('p.bag[0].name'),'Začiatočnícky meč');assert.equal(run('p.claimed'),true);assert.equal(run('p.career.skills["body:0"].rank'),3);assert.equal(run('p.career.biology.stage'),1);assert.equal(run('p.achievements.firstKill'),true);assert.equal(run('mobs[0].hp'),0);assert.equal(run('p.x'),600);
  run('returnToCharacters();playCharacter(c);');assert.equal(run('p.classId'),'ninja');assert.equal(run('p.level'),1);assert.equal(run('p.bag.length'),0);
});

test('switching clears transient combat and inventory references and uses the latest active data',()=>{
  const {run}=populated();run('playCharacter(a);p.gold=77;buffs.aura=12;shots.push({});effects.push({});spellCD[0]=5;inventorySelection="gear:1";inventoryDrag="gear:1";playCharacter(a);');assert.equal(run('p.gold'),77);
  run('playCharacter(b);');assert.equal(run('shots.length+effects.length'),0);assert.equal(run('Object.keys(buffs).length'),0);assert.equal(run('spellCD[0]'),0);assert.equal(run('inventorySelection'),null);assert.equal(run('inventoryDrag'),null);assert.equal(run('p.gold'),0);
});

test('every profile and its saved position survive page reload, preserving dates and selected ID',()=>{
  const {run,saved}=populated();run('playCharacter(b);loadMap("valley");p.level=12;p.gold=222;p.x=2670;p.y=2460;returnToCharacters();');const original=readSavedAccount(saved).profiles[run('b')];
  const again=reload(saved);assert.equal(again.run('running'),false);assert.equal(again.run('characterStore.account.selectedId'),run('b'));assert.equal(again.run('characterStore.activeId'),null);
  assert.equal(again.run('playCharacter()'),true);assert.equal(again.run('p.gold'),222);assert.equal(again.run('p.level'),12);assert.equal(again.run('p.x'),2670);assert.equal(again.run('p.y'),2460);assert.equal(again.run('p.createdAt'),original.createdAt);assert(again.run('p.lastPlayedAt')>=original.lastPlayedAt);
});

test('deletion requires the full normalized name, affects only its ID, and never resurrects after reload',()=>{
  const {run,saved}=populated();const before=saved.get(STORE);assert.throws(()=>run('deleteCharacter(b,"wrong")'),/presné meno/);assert.equal(saved.get(STORE),before);
  run('playCharacter(b);deleteCharacter(b,"  nYmErA  ");');assert.equal(run('running'),false);assert.equal(run('characterStore.activeId'),null);assert.equal(run('characterStore.account.order.length'),2);assert.equal(run('characterStore.account.profiles[b]'),undefined);
  const again=reload(saved);assert.equal(again.run('characterStore.account.order.length'),2);assert.equal(again.run('characterStore.account.profiles['+JSON.stringify(run('b'))+']'),undefined);
  run('var gm=createCharacter("*Admin","sura");');assert.throws(()=>run('deleteCharacter(gm,"Admin")'));assert.equal(run('deleteCharacter(gm,"[GM] Admin")'),true);
});

test('export includes all profiles and restores all data, IDs and equipment in a new empty roster',()=>{
  const {run}=populated();run('playCharacter(a);p.gold=501;addGearItem({name:"Pečať",slot:"talisman",bonus:1,rarity:2});returnToCharacters();var backup=exportCharacters();');
  const doc=JSON.parse(run('backup'));assert.equal(doc.version,2);assert.equal(doc.account.order.length,3);
  const next=createEmptyGame();next.run('var prepared=prepareCharacterImport('+JSON.stringify(run('backup'))+');importCharacterBackup(prepared,"add");');assert.equal(next.run('characterStore.account.order.length'),3);assert.equal(next.run('characterStore.account.profiles['+JSON.stringify(run('a'))+'].data.gold'),501);assert.equal(next.run('characterStore.account.profiles['+JSON.stringify(run('a'))+'].data.bag[0].rarity'),2);
  assert.deepEqual(JSON.parse(next.run('exportCharacters()')).account.profiles,doc.account.profiles);
});

test('add import previews conflicts and requires explicit rename, allocating new IDs without changing item UIDs',()=>{
  const {run,saved}=populated();run('playCharacter(a);addGearItem({name:"Meč",slot:"weapon",bonus:1});returnToCharacters();var backup=exportCharacters(),prepared=prepareCharacterImport(backup);');const before=saved.get(STORE);
  assert.throws(()=>run('importCharacterBackup(prepared,"add")'),/meno/);assert.equal(saved.get(STORE),before);
  run('var renames={[a]:"AradanTwo",[b]:"NymeraTwo",[c]:"EliraTwo"};importCharacterBackup(prepared,"add",{renames});');assert.equal(run('characterStore.account.order.length'),6);assert.equal(run('new Set(characterStore.account.order).size'),6);
  assert(run('listCharacters().filter(c=>c.name.endsWith("Two")).every(c=>c.data.characterId===c.id)'));assert.equal(run('listCharacters().find(c=>c.name==="AradanTwo").data.bag[0].uid'),run('characterStore.account.profiles[a].data.bag[0].uid'));
});

test('replace import requires confirmation and creates a recoverable safety export before one atomic commit',()=>{
  const {run,saved}=populated();run('var backup=exportCharacters();createCharacter("Extra","shaman");var prepared=prepareCharacterImport(backup);');const old=saved.get(STORE);
  assert.throws(()=>run('importCharacterBackup(prepared,"replace")'),/Potvrď/);assert.equal(saved.get(STORE),old);
  run('importCharacterBackup(prepared,"replace",{confirmReplace:true});');assert.equal(run('characterStore.account.order.length'),3);
  const safety=JSON.parse(saved.get(STORE+'.safety'));assert.equal(safety.account.order.length,4);assert(safety.account.order.some(id=>safety.account.profiles[id].name==='Extra'));
});

test('invalid JSON, unsupported versions, dangerous keys and invalid item or progression references never mutate storage',()=>{
  const {run,saved}=populated();run('var baseline=exportCharacters();');const baseline=run('baseline'),before=saved.get(STORE);
  for(const raw of ['{','null',JSON.stringify({format:'grindoria-characters',version:99}),'{'+'"__proto__":{"polluted":true}}']){assert.throws(()=>run('prepareCharacterImport('+JSON.stringify(raw)+')'));assert.equal(saved.get(STORE),before);}
  const mutations=[doc=>doc.account.profiles[doc.account.order[0]].classId='unknown',doc=>doc.account.profiles[doc.account.order[0]].data.level=-1,doc=>doc.account.profiles[doc.account.order[0]].data.career.alchemy.equipped.jade=99,doc=>doc.account.profiles[doc.account.order[0]].data.career.materials.fake=1,doc=>doc.account.profiles[doc.account.order[0]].data.bag.push({name:'Bad',slot:'fake'}),doc=>doc.account.profiles[doc.account.order[0]].data.career.skills['fake:0']={rank:1,practice:0}];
  for(const mutate of mutations){const doc=JSON.parse(baseline);mutate(doc);assert.throws(()=>run('prepareCharacterImport('+JSON.stringify(JSON.stringify(doc))+')'));assert.equal(saved.get(STORE),before);}
});

test('quota failures and stale previews leave every existing profile untouched',()=>{
  const {run,saved}=populated();run('var prepared=prepareCharacterImport(exportCharacters());');const before=saved.get(STORE);
  run('var set=localStorage.setItem;localStorage.setItem=(key,value)=>{if(key===CHARACTER_RULES.storageKey)throw Error("quota");return set(key,value);};');assert.throws(()=>run('importCharacterBackup(prepared,"replace",{confirmReplace:true})'),/Úložisko/);assert.equal(saved.get(STORE),before);assert.equal(run('characterStore.account.order.length'),3);
  run('localStorage.setItem=set;createCharacter("Extra","shaman");');const after=saved.get(STORE);assert.throws(()=>run('importCharacterBackup(prepared,"replace",{confirmReplace:true})'),/medzitým/);assert.equal(saved.get(STORE),after);
});

test('legacy progress migrates once, remains independent and is not re-imported after deletion',()=>{
  const first=createEmptyGame({'grindoria-save-v1':{level:17,xp:99,gold:1234,potions:8,classId:'ninja',bag:[{name:'Pamiatka',slot:'weapon',bonus:12}],equipped:{weapon:null,armor:null},worldStates:{},mapId:'desert'}});
  assert.equal(first.run('characterStore.account.order.length'),1);assert.equal(first.run('running'),false);first.run('var id=characterStore.account.selectedId;playCharacter(id);');assert.equal(first.run('p.level'),17);assert.equal(first.run('p.gold'),1234);assert.equal(first.run('p.bag[0].name'),'Pamiatka');assert.equal(first.run('p.classId'),'ninja');
  first.run('returnToCharacters();deleteCharacter(id,characterDisplayName(characterStore.account.profiles[id]));');const second=createEmptyGame(Object.fromEntries(first.saved));assert.equal(second.run('characterStore.account.order.length'),0);
});

test('backup version one migrates safely and corrupt stored roster is never overwritten on startup',()=>{
  const {run}=populated();const account=JSON.parse(run('exportCharacters()')).account;
  const v1={format:'grindoria-characters',version:1,characters:account.order.map(id=>account.profiles[id])};const empty=createEmptyGame();empty.run('var prepared=prepareCharacterImport('+JSON.stringify(JSON.stringify(v1))+');importCharacterBackup(prepared,"add");');assert.equal(empty.run('characterStore.account.order.length'),3);
  const broken=createEmptyGame({[STORE]:'{broken'});assert.equal(broken.saved.get(STORE),'{broken');assert(broken.run('characterStore.error'));assert.throws(()=>broken.run('createCharacter("Unsafe","warrior")'));assert.equal(broken.saved.get(STORE),'{broken');
});

test('cross-tab stale writes are rejected instead of overwriting another character set',()=>{
  const {run,saved}=populated();run('playCharacter(a);');const newer=JSON.parse(saved.get(STORE));newer.revision++;saved.set(STORE,JSON.stringify(newer));run('p.gold=999;');assert.equal(run('save()'),false);assert.equal(JSON.parse(saved.get(STORE)).profiles[run('a')].data.gold,0);
});

test('replace cannot change the vocation of an existing ID; addition can allocate a separate profile',()=>{
  const {run,saved}=populated();run('var altered=characterBackupDocument();altered.account.profiles[a].classId="sura";altered.account.profiles[a].data.classId="sura";var prepared=prepareCharacterImport(JSON.stringify(altered));');const before=saved.get(STORE);
  assert.throws(()=>run('importCharacterBackup(prepared,"replace",{confirmReplace:true})'),/Povolanie/);assert.equal(saved.get(STORE),before);
});

test('failed migration preserves its original source and permits exporting the normalized profile',()=>{
  const {createGame}=require('./helpers/game.cjs');const legacy={level:7,gold:1234};const game=createGame(legacy,'grindoria-save-v1',{}, {emptyRoster:true,failWrites:true});
  assert.deepEqual(JSON.parse(game.saved.get('grindoria-save-v1')),legacy);assert.equal(game.saved.has(STORE),false);assert(game.run('characterStore.error'));assert.equal(JSON.parse(game.run('exportCharacters()')).account.order.length,1);
});

test('returning from an open panel restores an interactive selector',()=>{
  const {run,elements}=populated();run('playCharacter(a);inventory();');assert.equal(elements.get('intro').inert,true);run('returnToCharacters();');assert.equal(elements.get('intro').inert,false);assert.equal(run('running'),false);
});

test('ID conflicts remap nested character references and reject dangling references',()=>{
  const {run,saved}=populated();run('playCharacter(a);addGearItem({name:"Meč",slot:"weapon",bonus:1,ownerCharacterId:a});returnToCharacters();var doc=characterBackupDocument(),prepared=prepareCharacterImport(JSON.stringify(doc));importCharacterBackup(prepared,"add",{renames:{[a]:"AradanTwo",[b]:"NymeraTwo",[c]:"EliraTwo"}});var imported=listCharacters().find(c=>c.name==="AradanTwo");');
  assert.equal(run('imported.data.bag[0].ownerCharacterId'),run('imported.id'));assert.equal(run('characterStore.account.profiles[a].data.bag[0].ownerCharacterId'),run('a'));
  const before=saved.get(STORE);run('doc.account.profiles[a].data.bag[0].ownerCharacterId="missing";');assert.throws(()=>run('prepareCharacterImport(JSON.stringify(doc))'),/neexistujúcu/);assert.equal(saved.get(STORE),before);
});

test('entering the game recalculates Canvas dimensions after the selection layout changes',()=>{
  const {run,elements}=populated();elements.get('game').getBoundingClientRect=()=>({width:1200,height:run('running')?600:700});
  run('playCharacter(a);');assert.equal(run('H'),600);run('returnToCharacters();');assert.equal(run('H'),700);run('playCharacter(b);');assert.equal(run('H'),600);
});

test('export preserves the latest active progress even when local storage is full',()=>{
  const {run,saved}=populated();run('playCharacter(a);p.gold=999;localStorage.setItem=()=>{throw Error("quota");};');const before=saved.get(STORE);assert.equal(run('save()'),false);
  const doc=JSON.parse(run('exportCharacters()'));assert.equal(doc.account.profiles[run('a')].data.gold,999);assert.equal(saved.get(STORE),before);assert.equal(run('returnToCharacters()'),false);assert.equal(run('running'),true);
});
