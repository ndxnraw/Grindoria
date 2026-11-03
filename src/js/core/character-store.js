const characterStore = { account: null, raw: null, activeId: null, needsMigration: false, error: '', writeError: '', serial: 0 };
const copyCharacterData = value => JSON.parse(JSON.stringify(value));
const characterNameKey = name => name.normalize('NFKC').toLocaleLowerCase('sk-SK');
function characterDisplayName(character) { return (character?.isGM?'[GM] ':'') + (character?.name || 'Pútnik'); }
function characterInputName(character) { return (character.isGM?'*':'')+character.name; }
function validateCharacterName(input, profiles = [], ignoreId = null) {
  if(typeof input!=='string')throw new Error('Zadaj meno postavy.');
  let name=input.trim().normalize('NFKC'),isGM=name.startsWith('*');if(isGM)name=name.slice(1);
  const length=[...name].length;
  if(length<CHARACTER_RULES.nameMin||length>CHARACTER_RULES.nameMax)throw new Error('Meno musí mať '+CHARACTER_RULES.nameMin+'–'+CHARACTER_RULES.nameMax+' znakov.');
  if(!/^[\p{L}][\p{L}\p{M}\p{N}_-]*$/u.test(name))throw new Error('Začni písmenom. Povolené sú písmená, čísla, podčiarkovník a pomlčka; bez medzier.');
  if(profiles.some(c=>c.id!==ignoreId&&characterNameKey(c.name)===characterNameKey(name)))throw new Error('Postava s týmto menom už existuje.');
  return {name,isGM};
}
function newCharacterId(profiles = {}) {
  let id;
  do { id='chr-'+(typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12)+'-'+(++characterStore.serial)); } while(Object.hasOwn(profiles,id));
  return id;
}
function emptyCharacterAccount() { return { format:'grindoria-account',version:1,revision:0,settings:{sound:false},selectedId:null,order:[],profiles:{}}; }
function listCharacters(account = characterStore.account) { return account.order.map(id=>account.profiles[id]); }
function profileIdentity(record,data) { return {...data,characterId:record.id,name:record.name,isGM:record.isGM,classId:record.classId,createdAt:record.createdAt,lastPlayedAt:record.lastPlayedAt}; }
function loadPlayerSave() {
  const account=emptyCharacterAccount();characterStore.account=account;
  try {
    const raw=(localStorage.getItem(CHARACTER_RULES.storageKey)??null);characterStore.raw=raw;
    if(raw!==null){
      const stored=JSON.parse(raw);migrateForgeMaterials(stored);validateCharacterAccount(stored);characterStore.account=stored;
      return stored.selectedId?copyCharacterData(profileIdentity(stored.profiles[stored.selectedId],stored.profiles[stored.selectedId].data)):null;
    }
    const legacy=loadLegacyPlayerSave(),candidates=legacy?[legacy]:[...pendingSaveImports];pendingSaveImports.length=0;
    if(!candidates.length&&localStorage.getItem(SAVE))throw new Error('Pôvodný postup je poškodený. Ostal zachovaný; obnov ho z platnej zálohy.');
    for(const [index,data] of candidates.entries()){
      const id=newCharacterId(account.profiles),now=Date.now();let identity;
      try{identity=validateCharacterName((data.isGM?'*':'')+(data.name||('Pútnik_'+(index+1))),listCharacters(account));}catch{let suffix=index+1;do{try{identity=validateCharacterName('Pútnik_'+suffix,listCharacters(account));break;}catch{suffix++;}}while(suffix<10000);}
      const record={id,...identity,classId:Object.hasOwn(CLASSES,data.classId)?data.classId:'warrior',createdAt:now,lastPlayedAt:now,data:copyCharacterData(data)};
      record.data=profileIdentity(record,record.data);account.order.push(id);account.profiles[id]=record;
    }
    account.selectedId=account.order[0]||null;characterStore.needsMigration=true;
    return account.selectedId?copyCharacterData(account.profiles[account.selectedId].data):null;
  } catch(error) { characterStore.error='Uložené postavy sa nepodarilo bezpečne načítať: '+error.message;return null; }
}
function commitCharacterAccount(next, {safetyBackup=false, allowRecovery=false} = {}) {
  if(characterStore.error&&!allowRecovery)throw new Error(characterStore.error);
  const previous=localStorage.getItem(CHARACTER_RULES.storageKey)??null;
  if(previous!==characterStore.raw)throw new Error('Postavy zmenilo iné okno. Obnov túto stránku pred ďalším ukladaním.');
  next.revision=(characterStore.account.revision||0)+1;
  const serialized=JSON.stringify(next);
  try {
  if(safetyBackup){
    const backup=characterStore.error?previous:JSON.stringify(characterBackupDocument(characterStore.account));
    localStorage.setItem(CHARACTER_RULES.storageKey+'.safety',backup);
  }
  // A single atomic localStorage write publishes the entire new profile set.
  localStorage.setItem(CHARACTER_RULES.storageKey,serialized);
  }catch(error){if(error.name==='QuotaExceededError'||/quota/i.test(error.message))throw new Error('Úložisko je plné. Exportuj postavy a uvoľni miesto v prehliadači.');if(error.name==='SecurityError')throw new Error('Prehliadač zablokoval lokálne ukladanie. Povoľ úložisko alebo exportuj postavy.');throw error;}
  characterStore.account=next;characterStore.raw=serialized;characterStore.error='';characterStore.writeError='';characterStore.needsMigration=false;
  return true;
}
function normalizeCharacterProfile(record) {
  const previous=p;
  try {
    p=createPlayerState(profileIdentity(record,record.data));initializeCareer();initializeInventory();initializeFarming();
    p.combatAssist={autoAim:p.combatAssist?.autoAim===true,autoSpell:p.combatAssist?.autoSpell===true,autoPotion:p.combatAssist?.autoPotion===true};p.lootSerial??=0;
    return copyCharacterData(p);
  } finally {p=previous;}
}
function initializeCharacterAccount() {
  if(characterStore.error)return;
  if(characterStore.needsMigration){
    const next=copyCharacterData(characterStore.account);
    for(const record of listCharacters(next))record.data=normalizeCharacterProfile(record);
    try{commitCharacterAccount(next);}catch(error){characterStore.account=next;characterStore.writeError=error.message;characterStore.error='Migráciu sa nepodarilo uložiť. Pôvodné údaje zostali zachované. Exportuj postavy a uvoľni miesto v úložisku.';}
  }
  sound=characterStore.account.settings.sound===true;
}
function createCharacter(input,classId,schoolId=DEFAULT_SCHOOLS[classId]) {
  if(running||characterStore.activeId)throw new Error('Najprv sa vráť na výber postáv.');
  if(!CLASSES[classId]||SCHOOLS[schoolId]?.classId!==classId)throw new Error('Vyber platné povolanie a školu.');
  const next=copyCharacterData(characterStore.account);
  if(next.order.length>=CHARACTER_RULES.maxCharacters)throw new Error('Dosiahnutý limit '+CHARACTER_RULES.maxCharacters+' postáv.');
  const identity=validateCharacterName(input,listCharacters(next)),id=newCharacterId(next.profiles),now=Date.now();
  const record={id,...identity,classId,createdAt:now,lastPlayedAt:null,data:{classId,schools:{[classId]:schoolId}}};
  record.data=normalizeCharacterProfile(record);
  const previous=p;try{p=record.data;p.hp=maxHP();p.mp=maxMP();}finally{p=previous;}
  next.profiles[id]=record;next.order.push(id);next.selectedId=id;commitCharacterAccount(next);return id;
}
function accountWithActiveSnapshot() {
  const id=characterStore.activeId;
  if(!id)return copyCharacterData(characterStore.account);
  const record=characterStore.account.profiles[id];
  if(!record||p.characterId!==id||p.classId!==record.classId)throw new Error('Identita postavy nesúhlasí. Uloženie bolo zastavené.');
  expireGroundDrops();pruneStoredGroundDrops();snapshotMap();
  const next=copyCharacterData(characterStore.account),saved=next.profiles[id];saved.lastPlayedAt=Date.now();p.lastPlayedAt=saved.lastPlayedAt;
  saved.data=copyCharacterData(profileIdentity(saved,p));next.selectedId=id;next.settings.sound=sound;return next;
}
function saveActiveCharacter() {
  if(!characterStore.activeId)return true;
  try {return commitCharacterAccount(accountWithActiveSnapshot());}
  catch(error){characterStore.writeError=error.message;if(typeof toast==='function')toast('Postavu sa nepodarilo uložiť. '+error.message);return false;}
}

function selectCharacter(id) {
  if(running||!Object.hasOwn(characterStore.account.profiles,id))return false;
  const next=copyCharacterData(characterStore.account);next.selectedId=id;commitCharacterAccount(next);renderCharacterScreen();return true;
}
function clearCharacterSession() {
  keysClear();resetCombatFlow();travelCombat.time=0;clearLootPointer();combatAim.inside=false;face=0;shots.length=0;effects.length=0;particles.length=0;
  for(const id of Object.keys(buffs))delete buffs[id];spellCD.fill(0);attackCD=0;skillCD=0;castPose=0;castStyle='';spiritTick=0;capeCooldown=0;saveTimer=0;slash=0;ring=0;
  for(const slot of Object.keys(forgeOptions))delete forgeOptions[slot];forgeResult=null;
  inventoryTab='gear';inventoryPage=0;inventorySelection=null;inventoryDrag=null;inventoryDeletePending=null;careerTab='overview';
  combatAssist.timer=0;combatAssist.nextSkill=0;combatAssist.fightTarget=null;combatAssist.fightTime=0;combatAssist.aimTime=0;combatAssist.focused=true;
}
function playCharacter(id = characterStore.account.selectedId) {
  if(!Object.hasOwn(characterStore.account.profiles,id)||characterStore.error)return false;
  if(characterStore.activeId&&!saveActiveCharacter())return false;
  const record=characterStore.account.profiles[id];
  running=false;paused=false;characterStore.activeId=null;clearCharacterSession();
  p=createPlayerState(copyCharacterData(profileIdentity(record,record.data)));
  initializeCareer();initializeInventory();initializeFarming();initializeLoot();initializeCombatAssist();
  if(p.hp<=0){Object.assign(p,MAPS[p.mapId].entry);p.hp=maxHP();}
  p.hp=Math.max(1,Math.min(p.hp,maxHP()));p.mp=Math.max(0,Math.min(p.mp,maxMP()));loadMap(p.mapId,true);
  characterStore.activeId=id;
  if(!saveActiveCharacter()){characterStore.activeId=null;renderCharacterScreen();return false;}
  running=true;setCharacterScreenMode(false);document.body.classList.add('started');document.body.classList.remove('character-select');$('modal').hidden=true;
  resize();requestAnimationFrame(resize);updateClassHUD();updateHUD();canvas.focus({preventScroll:true});toast('Načítané: '+characterDisplayName(p));return true;
}
function returnToCharacters() {
  if(characterStore.activeId&&!saveActiveCharacter()){showCharacterSaveFailure();return false;}
  running=false;paused=false;characterStore.activeId=null;clearCharacterSession();$('modal').hidden=true;
  document.body.classList.remove('started');document.body.classList.add('character-select');renderCharacterScreen();return true;
}
function deleteCharacter(id,confirmation) {
  const record=characterStore.account.profiles[id];if(!record)throw new Error('Postava už neexistuje.');
  const supplied=String(confirmation).trim().normalize('NFKC');
  if(characterNameKey(supplied)!==characterNameKey(characterDisplayName(record)))throw new Error('Zadaj presné meno '+characterDisplayName(record)+'.');
  if(characterStore.activeId===id&&!saveActiveCharacter())throw new Error('Aktívnu postavu sa nepodarilo uložiť.');
  const next=copyCharacterData(characterStore.account);delete next.profiles[id];next.order=next.order.filter(value=>value!==id);if(next.selectedId===id)next.selectedId=next.order[0]||null;
  commitCharacterAccount(next);
  if(characterStore.activeId===id){characterStore.activeId=null;running=false;paused=false;clearCharacterSession();document.body.classList.remove('started');document.body.classList.add('character-select');}
  return true;
}
function characterBackupDocument(account=characterStore.account) {return {gameVersion:$('game-version').textContent.replace(/^ALPHA\s*/,'' )||'unknown',format:'grindoria-characters',version:CHARACTER_RULES.backupVersion,exportedAt:new Date().toISOString(),account:copyCharacterData(account)};}
function exportCharacters() {const account=accountWithActiveSnapshot();validateCharacterAccount(account);return JSON.stringify(characterBackupDocument(account),null,2);}
function prepareCharacterImport(text) {
  if(typeof text!=='string'||text.length>CHARACTER_RULES.maxBackupBytes||new TextEncoder().encode(text).length>CHARACTER_RULES.maxBackupBytes)throw new Error('Súbor je príliš veľký.');
  let data;try{data=JSON.parse(text);}catch{throw new Error('Súbor nie je platný JSON.');}
  assertSafeCharacterJSON(data);assertCharacterObject(data,'formát zálohy');
  if(data.format!=='grindoria-characters'||![1,CHARACTER_RULES.backupVersion].includes(data.version))throw new Error('Nepodporovaný formát alebo verzia zálohy.');
  if(data.version===1){
    const account=emptyCharacterAccount();if(!Array.isArray(data.characters))throw new Error('Chýba zoznam postáv.');
    for(const source of data.characters){assertCharacterObject(source,'profil starej zálohy');assertCharacterObject(source.data,'údaje starej zálohy');const record=copyCharacterData(source);record.isGM??=false;record.lastPlayedAt??=null;record.data.characterId=record.id;record.data.name=record.name;record.data.isGM=record.isGM;record.data.bestiary??={};record.data.achievements??={};if(Object.hasOwn(account.profiles,record.id))throw new Error('Duplicitné ID v zálohe.');account.order.push(record.id);account.profiles[record.id]=record;}
    account.selectedId=account.order[0]||null;data={...data,version:CHARACTER_RULES.backupVersion,account};
  }
  migrateForgeMaterials(data.account);validateCharacterAccount(data.account);return {account:copyCharacterData(data.account),baseRaw:characterStore.raw};
}
function remapImportedCharacterReferences(value,idMap) {
  if(!value||typeof value!=='object')return;
  for(const [key,item]of Object.entries(value)){
    if(['characterId','ownerCharacterId','selectedCharacterId'].includes(key)&&typeof item==='string'&&Object.hasOwn(idMap,item))value[key]=idMap[item];
    else if(item&&typeof item==='object')remapImportedCharacterReferences(item,idMap);
  }
}
function importCharacterBackup(prepared,mode,{renames={},confirmReplace=false}={}) {
  if(running||characterStore.activeId)throw new Error('Importuj postavy z úvodnej obrazovky.');
  if(!['add','replace'].includes(mode))throw new Error('Vyber spôsob importu.');
  if(prepared.baseRaw!==characterStore.raw)throw new Error('Zoznam postáv sa medzitým zmenil. Otvor zálohu znova.');
  validateCharacterAccount(prepared.account);
  if(mode==='replace'&&!confirmReplace)throw new Error('Potvrď nahradenie aktuálnych postáv.');
  if(mode==='replace')for(const record of listCharacters(prepared.account)){const existing=characterStore.account.profiles[record.id];if(existing&&existing.classId!==record.classId)throw new Error('Povolanie existujúcej postavy s rovnakým ID sa nesmie zmeniť. Použi pridanie s novým ID.');}
  const next=mode==='replace'?emptyCharacterAccount():copyCharacterData(characterStore.account);next.settings=copyCharacterData(characterStore.account.settings);
  if(next.order.length+prepared.account.order.length>CHARACTER_RULES.maxCharacters)throw new Error('Import by prekročil limit '+CHARACTER_RULES.maxCharacters+' postáv.');
  const idMap={},reserved={...next.profiles};for(const record of listCharacters(prepared.account)){const id=Object.hasOwn(reserved,record.id)?newCharacterId(reserved):record.id;idMap[record.id]=id;reserved[id]=true;}
  for(const source of listCharacters(prepared.account)){
    const record=copyCharacterData(source),identity=validateCharacterName(renames[source.id]||characterInputName(record),listCharacters(next));
    record.id=idMap[source.id];record.name=identity.name;record.isGM=identity.isGM;remapImportedCharacterReferences(record.data,idMap);
    record.data=profileIdentity(record,record.data);next.profiles[record.id]=record;next.order.push(record.id);
  }
  if(mode==='replace'||!next.selectedId)next.selectedId=idMap[prepared.account.selectedId]||next.order[0]||null;
  validateCharacterAccount(next);commitCharacterAccount(next,{safetyBackup:mode==='replace',allowRecovery:mode==='replace'});return next.order.length;
}
function saveGlobalSettings() {if(characterStore.activeId)return saveActiveCharacter();const next=copyCharacterData(characterStore.account);next.settings.sound=sound;try{return commitCharacterAccount(next);}catch(error){characterStore.writeError=error.message;return false;}}
function recordCharacterKill(enemy) {
  const key=enemy.type==='stone'?'metin:'+enemy.metinType:enemy.type==='boss'?'boss:'+p.mapId:enemy.skin||'wolf';p.bestiary[key]=(p.bestiary[key]||0)+1;
  if(enemy.type!=='stone')p.achievements.firstKill=true;if(enemy.type==='stone')p.achievements.firstMetin=true;if(enemy.type==='boss')p.achievements.firstBoss=true;if(p.kills>=100)p.achievements.hunter100=true;
}
