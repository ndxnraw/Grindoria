function characterDataError(message) { throw new Error('Neplatná záloha: '+message); }
function assertCharacterObject(value,label) { if(!value||typeof value!=='object'||Array.isArray(value))characterDataError(label); }
function assertCharacterNumber(value,label,min=0,max=1e12,integer=false) { if(!Number.isFinite(value)||value<min||value>max||integer&&!Number.isSafeInteger(value))characterDataError(label); }
function assertSafeCharacterJSON(value) {
  let nodes=0;
  const visit=(node,depth)=>{
    if(++nodes>600000||depth>40)characterDataError('dáta sú príliš zložité.');
    if(typeof node==='number'&&!Number.isFinite(node))characterDataError('neplatné číslo.');
    if(typeof node==='string'&&node.length>20000)characterDataError('príliš dlhý text.');
    if(node&&typeof node==='object')for(const [key,item] of Object.entries(node)){
      if(['__proto__','prototype','constructor'].includes(key))characterDataError('zakázaný dátový kľúč.');visit(item,depth+1);
    }
  };visit(value,0);
}
function validateCharacterItem(item,slot=null) {
  assertCharacterObject(item,'predmet');validateItemModel(item);
  if(item.weaponKind!==undefined && (item.slot!=='weapon'||!['sword','bow','daggers','fan'].includes(item.weaponKind)))characterDataError('typ zbrane.');
  if(item.modelId!==undefined && (typeof item.modelId!=='string'||!Object.hasOwn(EQUIPMENT_MODELS[item.slot]||{},item.modelId)))characterDataError('model predmetu.');
  if(!Object.hasOwn(EQUIPMENT,item.slot)||slot&&item.slot!==slot)characterDataError('neplatný slot predmetu.');
  if(typeof item.name!=='string'||!item.name.length||item.name.length>150)characterDataError('názov predmetu.');
  for(const key of ['bonus','value'])if(item[key]!==undefined)assertCharacterNumber(item[key],key);
  if(item.rarity!==undefined)assertCharacterNumber(item.rarity,'rarita',0,5,true);
  if(item.enhance!==undefined)assertCharacterNumber(item.enhance,'vylepšenie',0,PROGRESSION.maxEnhancement,true);
  if(item.requiredLevel!==undefined)assertCharacterNumber(item.requiredLevel,'úroveň predmetu',1,105,true);
  if(item.tier!==undefined)assertCharacterNumber(item.tier,'stupeň predmetu',0,105,true);
  if(item.uid!==undefined)assertCharacterNumber(item.uid,'ID predmetu',1,Number.MAX_SAFE_INTEGER,true);
  if(item.cell!==undefined)assertCharacterNumber(item.cell,'políčko',0,4499,true);
  if(item.icon!==undefined&&!Object.hasOwn(EQUIPMENT,item.icon))characterDataError('ikona výbavy.');
  if(item.classes!==undefined&&(!Array.isArray(item.classes)||item.classes.some(id=>!Object.hasOwn(CLASSES,id))))characterDataError('povolanie predmetu.');
  if(item.allowedSchools!==undefined&&(!Array.isArray(item.allowedSchools)||item.allowedSchools.some(id=>!Object.hasOwn(SCHOOLS,id))))characterDataError('škola predmetu.');
  if(item.stats!==undefined){assertCharacterObject(item.stats,'bonusy predmetu');for(const [key,value]of Object.entries(item.stats)){if(!Object.hasOwn(ITEM_STATS,key))characterDataError('neznámy bonus predmetu.');assertCharacterNumber(value,'hodnota bonusu',-.5,1e9);}}
  validateGeneratedItem(item);
  if(item.uniqueId!==undefined&&(!Object.hasOwn(DUNGEON_UNIQUES,item.uniqueId)||DUNGEON_UNIQUES[item.uniqueId].slot!==item.slot))characterDataError('unikát dungeonu.');
  if(item.special!==undefined&&(!Array.isArray(item.special)||item.special.length>20||item.special.some(value=>typeof value!=='string'||value.length>500)))characterDataError('vlastnosti predmetu.');
}
function validateCharacterWorld(state) {
  assertCharacterObject(state,'snímka mapy');if(state.balanceSchema!==undefined)assertCharacterNumber(state.balanceSchema,'verzia vyváženia mapy',0,1,true);
  if(!Array.isArray(state.mobs)||state.mobs.length>1000||!Array.isArray(state.drops)||state.drops.length>5000)characterDataError('populácia alebo korisť mapy.');
  const ids=new Set();
  for(const mob of state.mobs){
    assertCharacterObject(mob,'nepriateľ');if(!['wolf','stone','boss'].includes(mob.type))characterDataError('typ nepriateľa.');
    for(const key of ['x','y','hp','max'])assertCharacterNumber(mob[key],'údaj nepriateľa '+key,key==='max'?1:0);
    if(mob.skin&&!['wolf','scorpion','yeti','demon'].includes(mob.skin))characterDataError('model nepriateľa.');
    if(mob.damageType&&!Object.hasOwn(DAMAGE_TYPES,mob.damageType))characterDataError('typ poškodenia.');
    if(mob.hp>mob.max)characterDataError('zdravie nepriateľa.');
    if(mob.spawnId){if(typeof mob.spawnId!=='string'||ids.has(mob.spawnId))characterDataError('duplicitná identita nepriateľa.');ids.add(mob.spawnId);}
    if(mob.metinType&&!Object.hasOwn(METIN_TYPES,mob.metinType))characterDataError('typ Metinu.');
    if(mob.skillContributors&&(!Array.isArray(mob.skillContributors)||mob.skillContributors.some(key=>!Object.hasOwn(ACTIVE_SKILLS,key))))characterDataError('referencia schopnosti.');
    if(mob.dots&&(!Array.isArray(mob.dots)||mob.dots.length>2||mob.dots.some(dot=>!['poison','fire'].includes(dot.kind)||!Number.isFinite(dot.power)||dot.power<0||!Number.isFinite(dot.time)||!Number.isFinite(dot.tick)||dot.key&&!Object.hasOwn(ACTIVE_SKILLS,dot.key))))characterDataError('stav poškodenia.');
  }
  validateWorldEventSnapshot(state);
  const dropIds=new Set();
  for(const drop of state.drops){
    assertCharacterObject(drop,'korisť');for(const key of ['x','y'])assertCharacterNumber(drop[key],'poloha koristi',0,Math.max(...Object.values(MAPS).map(m=>m.size)));
    if(drop.id!==undefined){assertCharacterNumber(drop.id,'ID koristi',1,Number.MAX_SAFE_INTEGER,true);if(dropIds.has(drop.id))characterDataError('duplicitné ID koristi.');dropIds.add(drop.id);}
    if(drop.kind==='gear')validateCharacterItem(drop.item);
    else if(drop.kind==='supply'){
      const id=drop.supplyId;if(typeof id!=='string'||!(['potions','braveryCapes'].includes(id)||id.startsWith('material:')&&Object.hasOwn(MATERIALS,id.slice(9))||id.startsWith('gem:')&&Object.hasOwn(GEMS,id.slice(4))||id.startsWith('alchemy:')&&Object.hasOwn(ALCHEMY_PRODUCTS,id.slice(8))))characterDataError('neznáma zásoba.');
      assertCharacterNumber(drop.count,'počet zásob',1,1e12,true);
    }else if(drop.kind==='relic'){if(!Object.hasOwn(RELICS,drop.relicId))characterDataError('neznáma relikvia.');}
    else if(drop.kind==='gold'||drop.kind===undefined)assertCharacterNumber(drop.count??drop.value,'zlato na zemi',1,1e12,true);
    else characterDataError('typ koristi.');
    if(drop.manualPickup!==undefined&&typeof drop.manualPickup!=='boolean')characterDataError('ručné zbieranie koristi.');
    if(drop.expiresAt!==undefined)assertCharacterNumber(drop.expiresAt,'expirácia',0,Number.MAX_SAFE_INTEGER);
  }
}
function validateCharacterProfile(record) {
  assertCharacterObject(record,'profil');
  if(typeof record.id!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(record.id))characterDataError('ID postavy.');
  const identity=validateCharacterName((record.isGM?'*':'')+record.name);
  if(identity.name!==record.name||typeof record.isGM!=='boolean'||!Object.hasOwn(CLASSES,record.classId))characterDataError('identita postavy.');
  assertCharacterNumber(record.createdAt,'dátum vytvorenia',0,Number.MAX_SAFE_INTEGER);
  if(record.lastPlayedAt!==null)assertCharacterNumber(record.lastPlayedAt,'posledné hranie',0,Number.MAX_SAFE_INTEGER);
  const data=record.data;assertCharacterObject(data,'herné údaje');
  if(data.starterWeaponGranted!==undefined&&typeof data.starterWeaponGranted!=='boolean')characterDataError('štartovacia výbava.');
  if(data.characterId!==record.id||data.classId!==record.classId||data.name!==record.name||data.isGM!==record.isGM)characterDataError('nesúlad identity a povolania.');
  for(const key of ['level','xp','gold','potions','strength','vitality','dexterity','intelligence','points','kills','stones','bossKills','huntClaimed','braveryCapes'])assertCharacterNumber(data[key],key,key==='level'?1:0,key==='level'?99:1e12,true);
  for(const key of ['hp','mp'])assertCharacterNumber(data[key],key);for(const key of ['x','y'])assertCharacterNumber(data[key],key,45,(MAPS[data.mapId]?.size||2000)-45);
  if(!Object.hasOwn(MAPS,data.mapId))characterDataError('neznáma mapa.');
  for(const key of ['claimed','bossClaimed'])if(typeof data[key]!=='boolean')characterDataError('stav úlohy.');
  assertCharacterObject(data.schools,'školy');for(const [id,school]of Object.entries(data.schools))if(SCHOOLS[school]?.classId!==id)characterDataError('neznáma škola.');
  if(SCHOOLS[data.schools[data.classId]]?.classId!==data.classId)characterDataError('chýbajúca škola povolania.');
  assertCharacterObject(data.inventory,'inventár');assertCharacterNumber(data.inventory.pages,'strany inventára',2,100,true);assertCharacterNumber(data.inventory.serial,'séria inventára',0,Number.MAX_SAFE_INTEGER,true);
  assertCharacterObject(data.inventory.supplyCells,'umiestnenie zásob');for(const [key,cell]of Object.entries(data.inventory.supplyCells)){if(!(['potions','braveryCapes'].includes(key)||key.startsWith('material:')&&Object.hasOwn(MATERIALS,key.slice(9))||key.startsWith('gem:')&&Object.hasOwn(GEMS,key.slice(4))||key.startsWith('alchemy:')&&Object.hasOwn(ALCHEMY_PRODUCTS,key.slice(8))))characterDataError('referencia zásoby v inventári.');assertCharacterNumber(cell,'políčko zásoby',0,44,true);}
  if(!Array.isArray(data.bag)||data.bag.length>data.inventory.pages*45)characterDataError('batoh.');assertCharacterObject(data.equipped,'výbava');
  const uids=new Set(),cells=new Set();
  for(const [slot,item]of Object.entries(data.equipped)){if(!Object.hasOwn(EQUIPMENT,slot))characterDataError('slot výbavy.');if(item)validateCharacterItem(item,slot);}
  for(const item of [...data.bag,...Object.values(data.equipped).filter(Boolean)]){validateCharacterItem(item);if(!Number.isSafeInteger(item.uid)||uids.has(item.uid))characterDataError('ID vybavenia.');uids.add(item.uid);}
  if([...uids].some(uid=>uid>data.inventory.serial))characterDataError('séria ID výbavy.');
  for(const item of data.bag){
    if(!Number.isInteger(item.cell))characterDataError('umiestnenie predmetu.');
    const [w,h]=EQUIPMENT[item.slot].size,local=item.cell%45;if(local%5+w>5||Math.floor(local/5)+h>9)characterDataError('predmet presahuje inventár.');
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const cell=item.cell+y*5+x;if(cell>=data.inventory.pages*45||cells.has(cell))characterDataError('prekrývajúce sa predmety.');cells.add(cell);}
  }
  const c=data.career;assertCharacterObject(c,'progres');if(c.schema!==PROGRESSION.schema)characterDataError('nepodporovaná verzia progresu.');
  assertCharacterObject(c.materials,'materiály');for(const [key,value]of Object.entries(c.materials)){if(!Object.hasOwn(MATERIALS,key))characterDataError('materiál.');assertCharacterNumber(value,'množstvo materiálu',0,1e12,true);}for(const key of Object.keys(MATERIALS))if(c.materials[key]===undefined)characterDataError('chýbajúci materiál.');
  for(const key of ['eligibleKills','skillUpgrades','keyPity'])assertCharacterNumber(c[key],'progres '+key,0,1e12,true);
  for(const key of ['relicPity','samplePity']){assertCharacterObject(c[key],key);for(const [id,value]of Object.entries(c[key])){if(!Object.hasOwn(MAPS,id))characterDataError('mapa progresu.');assertCharacterNumber(value,key,0,1e12,true);}}
  assertCharacterObject(c.skills,'schopnosti');for(const [key,skill]of Object.entries(c.skills)){if(!Object.hasOwn(ACTIVE_SKILLS,key))characterDataError('schopnosť.');assertCharacterNumber(skill.rank,'stupeň schopnosti',1,PROGRESSION.maxSkillRank,true);assertCharacterNumber(skill.practice,'prax schopnosti');}
  assertCharacterObject(c.training,'tréning');for(const key of ['strength','vitality','dexterity','intelligence'])assertCharacterNumber(c.training[key],'tréning '+key,0,PROGRESSION.maxTraining,true);
  assertCharacterObject(c.biology,'biológia');assertCharacterNumber(c.biology.stage,'stupeň biológie',0,BIOLOGY.length,true);for(const key of ['delivered','nextKill'])assertCharacterNumber(c.biology[key],'biológia '+key,0,1e12,true);
  for(const key of ['nextDeliveryAt','sampleKills'])if(c.biology[key]!==undefined)assertCharacterNumber(c.biology[key],'biológia '+key,0,key==='nextDeliveryAt'?Number.MAX_SAFE_INTEGER:1e12,true);
  assertCharacterObject(c.alchemy,'alchýmia');for(const key of ['stock','equipped']){assertCharacterObject(c.alchemy[key],'alchýmia '+key);for(const [id,value]of Object.entries(c.alchemy[key])){if(!Object.hasOwn(GEMS,id))characterDataError('alchymistický kameň.');assertCharacterNumber(value,'alchýmia',0,key==='equipped'?PROGRESSION.maxGemRank:1e12,true);}for(const id of Object.keys(GEMS))if(c.alchemy[key][id]===undefined)characterDataError('chýbajúca alchýmia.');}
  assertCharacterObject(c.collection,'zbierka');for(const [id,value]of Object.entries(c.collection))if(!Object.hasOwn(RELICS,id)||typeof value!=='boolean')characterDataError('relikvia zbierky.');
  assertCharacterObject(c.specialization,'špecializácia');if(c.specialization.focus!==null&&!Object.hasOwn(SPECIALIZATIONS,c.specialization.focus))characterDataError('typ špecializácie.');assertCharacterNumber(c.specialization.rank,'stupeň špecializácie',0,PROGRESSION.maxSpecialization,true);assertCharacterNumber(c.specialization.points,'body špecializácie',0,1e12,true);
  assertCharacterObject(c.endgame,'endgame');assertCharacterNumber(c.endgame.highest,'trhliny',0,PROGRESSION.maxRiftTier,true);assertCharacterNumber(c.endgame.paragon,'paragon',0,PROGRESSION.maxParagon,true);
  if(c.endgame.run){const run=c.endgame.run;assertCharacterObject(run,'výprava');assertCharacterNumber(run.id,'ID výpravy',1,Number.MAX_SAFE_INTEGER,true);assertCharacterNumber(run.tier,'stupeň výpravy',1,PROGRESSION.maxRiftTier,true);for(const key of ['kills','bosses'])assertCharacterNumber(run[key],'ciele výpravy',0,1e12,true);if(run.active!==true||data.mapId!=='temple')characterDataError('stav výpravy.');}
  assertCharacterObject(data.worldStates,'mapy');for(const [id,state]of Object.entries(data.worldStates)){if(!Object.hasOwn(MAPS,id))characterDataError('referencia mapy.');validateCharacterWorld(state);}if(c.normalTemple)validateCharacterWorld(c.normalTemple);
  validateCraftingProfile(data);
  validateEconomyProfile(data);
  validateWorldEventsProfile(data);
  validatePrestige(data);
  validateDungeonProfile(data);
  validateDiscovery(data);assertCharacterObject(data.bestiary,'bestiár');for(const [key,value]of Object.entries(data.bestiary)){if(!['wolf','scorpion','yeti','demon'].includes(key)&&!(key.startsWith('dungeon:')&&Object.hasOwn(DUNGEONS,key.slice(8)))&&!(key.startsWith('metin:')&&Object.hasOwn(METIN_TYPES,key.slice(6)))&&!(key.startsWith('boss:')&&Object.hasOwn(MAPS,key.slice(5))))characterDataError('záznam bestiára.');assertCharacterNumber(value,'počet v bestiári',0,1e12,true);}
  assertCharacterObject(data.achievements,'úspechy');for(const [key,value]of Object.entries(data.achievements))if(!Object.hasOwn(CHARACTER_ACHIEVEMENTS,key)||typeof value!=='boolean')characterDataError('úspech.');
  if(data.potionReadyAt!==undefined)assertCharacterNumber(data.potionReadyAt,'čas elixíru',0,Number.MAX_SAFE_INTEGER);
  if(data.combatAssist?.autoPotion!==undefined&&typeof data.combatAssist.autoPotion!=='boolean')characterDataError('automatické elixíry.');
  if(data.combatAssist){for(const key of ['autoAim','autoSpell'])if(typeof data.combatAssist[key]!=='boolean')characterDataError('nastavenia postavy.');}
}
function validateCharacterAccount(account) {
  assertSafeCharacterJSON(account);assertCharacterObject(account,'zoznam postáv');
  if(account.format!=='grindoria-account'||account.version!==1||!Array.isArray(account.order)||account.order.length>CHARACTER_RULES.maxBackupCharacters)characterDataError('formát zoznamu postáv.');
  assertCharacterNumber(account.revision,'revízia',0,Number.MAX_SAFE_INTEGER,true);assertCharacterObject(account.settings,'globálne nastavenia');if(typeof account.settings.sound!=='boolean')characterDataError('nastavenie zvuku.');
  assertCharacterObject(account.profiles,'profily');if(new Set(account.order).size!==account.order.length||Object.keys(account.profiles).length!==account.order.length)characterDataError('duplicitné alebo chýbajúce profily.');
  const names=new Set();for(const id of account.order){if(typeof id!=='string'||!Object.hasOwn(account.profiles,id))characterDataError('referencia postavy.');const record=account.profiles[id];validateCharacterProfile(record);if(id!==record.id||names.has(characterNameKey(record.name)))characterDataError('duplicitné meno alebo ID.');names.add(characterNameKey(record.name));}
  const itemInstances=new Set();for(const record of Object.values(account.profiles))validateProfileItemIdentities(record.data,itemInstances);
  const checkReferences=(value,ownerId)=>{if(!value||typeof value!=='object')return;for(const [key,item]of Object.entries(value)){if(['characterId','ownerCharacterId','selectedCharacterId'].includes(key)&&item!==null&&(typeof item!=='string'||!account.order.includes(item)))characterDataError('referencia na neexistujúcu postavu.');if(item&&typeof item==='object')checkReferences(item,ownerId);}};
  for(const record of Object.values(account.profiles))checkReferences(record.data,record.id);
  if(account.selectedId!==null&&!account.order.includes(account.selectedId))characterDataError('vybraná postava.');
}

