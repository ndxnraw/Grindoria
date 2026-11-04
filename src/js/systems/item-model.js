function ensureItemState(){p.inventory??={schema:INVENTORY.schema,pages:INVENTORY.pages,serial:0,supplyCells:{}};p.inventory.serial??=0;return p.inventory;}
function cloneItem(item){return JSON.parse(JSON.stringify(item));}
function genericItemDefinition(item){return 'equipment:'+item.slot+(item.slot==='weapon'?':'+(item.weaponKind||'sword'):'');}
function normalizeItemFields(item,owner,uid){
 if(item.itemSchema===1)return item;
 item.uid=uid;item.itemSchema=1;item.instanceId??=owner+':item:'+uid;item.definitionId??=genericItemDefinition(item);item.type??='equipment';item.rarity??=0;item.tier??=item.requiredLevel||1;item.requiredLevel??=1;item.enhance??=0;item.bonus??=0;item.value??=0;item.stats??={};item.baseStats??={};
 const kind=item.slot==='weapon'&&['bow','daggers','fan'].includes(item.weaponKind)?item.weaponKind:item.slot;item.modelId??=kind+'-'+raritySpec(item.rarity).family;return item;
}
function profileItemReferences(data,history=true){
 const items=[...(Array.isArray(data.bag)?data.bag:[]),...Object.values(data.equipped||{}).filter(Boolean)];
 for(const state of [...Object.values(data.worldStates||{}),data.career?.normalTemple])for(const drop of state?.drops||[])if(drop.kind==='gear'&&drop.item)items.push(drop.item);
 for(const offer of data.economy?.rare||[])if(history||offer.stock>0)items.push(offer.item);
 for(const [id,item]of Object.entries(data.economy?.catalogItems||{}))if(history||Object.entries(MARKET_TRADERS).some(([trader,cfg])=>cfg.goods.includes(id)&&data.economy.stock[trader+':'+id]>0))items.push(item);
 return items;
}
function migrateItemProfile(data,owner){
 if(!data||typeof data!=='object')return;
 data.inventory??={schema:INVENTORY.schema,pages:INVENTORY.pages,serial:0,supplyCells:{}};if(typeof data.inventory!=='object'||Array.isArray(data.inventory))return;
 const items=profileItemReferences(data),seen=new Set(),objects=new Set();let serial=Number.isSafeInteger(data.inventory.serial)?data.inventory.serial:0;
 for(const item of items)if(Number.isSafeInteger(item?.uid))serial=Math.max(serial,item.uid);
 for(const item of items){if(!item||typeof item!=='object'||objects.has(item)||!Object.hasOwn(EQUIPMENT,item.slot))continue;objects.add(item);if(item.itemSchema!==1){let uid=item.uid;if(!Number.isSafeInteger(uid)||uid<1||seen.has(uid))uid=++serial;normalizeItemFields(item,owner,uid);}seen.add(item.uid);}
 data.inventory.serial=Math.max(serial,data.inventory.serial||0);
 if(data.economy&&data.economy.stock)for(const [trader,cfg]of Object.entries(MARKET_TRADERS))for(const id of cfg.goods)data.economy.stock[trader+':'+id]??=0;
}
function migrateItemAccount(account){if(!account?.profiles||typeof account.profiles!=='object')return;for(const record of Object.values(account.profiles))if(record?.data)migrateItemProfile(record.data,record.id);}
function ensureItemIdentity(item){if(item.itemSchema===1)return item;const state=ensureItemState(),uid=Number.isSafeInteger(item.uid)&&item.uid>0?item.uid:++state.serial;state.serial=Math.max(state.serial,uid);return normalizeItemFields(item,p.characterId||'legacy',uid);}
function createItem(definitionId,options={}){
 const def=ITEM_DEFINITIONS[definitionId];if(!def)throw Error('Neznáma definícia predmetu.');if(def.type!=='equipment')return stackItemView(definitionId,options.count||1);
 const item=generateEquipmentItem(def.slot,options.rarity??def.rarity??0,options.tier??def.level??1,def.weaponKind||options.weaponKind||generatedWeaponKind(),options.rng||rand);
 if(!def.generic){item.definitionId=def.id;item.name=def.name;item.requiredLevel=def.level;item.bonus=def.bonus;item.modelId=def.modelId;item.classes=[...def.classes];item.allowedSchools=[...def.schools];item.baseStats={...def.baseStats};item.value=itemSaleValue(item);}return item;
}
function stackItemView(id,count){const def=ITEM_DEFINITIONS[id];if(!def)return null;return {itemSchema:1,instanceId:(p.characterId||'legacy')+':stack:'+id,definitionId:id,type:def.type,name:def.name,rarity:def.rarity,modelId:def.modelId,stats:{},baseStats:{},count};}
function rebaseImportedItems(data,oldId,newId){if(oldId===newId)return;for(const item of profileItemReferences(data))if(item.instanceId?.startsWith(oldId+':item:'))item.instanceId=newId+item.instanceId.slice(oldId.length);}
function validateItemModel(item){
 if(item.itemSchema===undefined)return;if(item.itemSchema!==1||item.type!=='equipment'||typeof item.instanceId!=='string'||!/^[-a-zA-Z0-9_:]{1,200}$/.test(item.instanceId)||!Number.isSafeInteger(item.uid))characterDataError('identita predmetu.');
 const def=ITEM_DEFINITIONS[item.definitionId];if(!def||def.type!=='equipment'||def.slot!==item.slot)characterDataError('definícia predmetu.');if(!Object.hasOwn(EQUIPMENT_MODELS[item.slot]||{},item.modelId))characterDataError('vizuálny model predmetu.');
 assertCharacterObject(item.baseStats,'základné bonusy');for(const [stat,n]of Object.entries(item.baseStats)){if(!Object.hasOwn(ITEM_STATS,stat))characterDataError('základný atribút predmetu.');assertCharacterNumber(n,'základný bonus',-.5,1e9);}
 if(!def.generic&&(item.bonus!==def.bonus||item.modelId!==def.modelId||item.weaponKind!==def.weaponKind||item.requiredLevel!==def.level||JSON.stringify(item.baseStats)!==JSON.stringify(def.baseStats)||JSON.stringify(item.classes)!==JSON.stringify(def.classes)||JSON.stringify(item.allowedSchools)!==JSON.stringify(def.schools)))characterDataError('nesúlad katalógového predmetu.');
}
function validateProfileItemIdentities(data,seen=new Set()){
 const uids=new Set();for(const item of profileItemReferences(data,false)){if(item.itemSchema===undefined)continue;validateItemModel(item);if(seen.has(item.instanceId)||uids.has(item.uid))characterDataError('duplicitná identita predmetu.');seen.add(item.instanceId);uids.add(item.uid);if(item.uid>data.inventory.serial)characterDataError('séria predmetov.');}return seen;
}

function grantStarterWeapon(fresh=false){
 if(p.starterWeaponGranted===true)return;
 p.starterWeaponGranted=true;
 if(!fresh&&(p.level!==1||p.equipped.weapon))return;
 const kind=generatedWeaponKind(),names={sword:'Začiatočnícky meč',bow:'Začiatočnícky luk',daggers:'Začiatočnícke dýky',fan:'Začiatočnícky vejár'};
 const item=createItem('equipment:weapon:'+kind,{rarity:0,tier:1,weaponKind:kind,rng:()=>0});
 item.name=names[kind];item.enhance=9;item.classes=[p.classId];item.value=itemSaleValue(item);p.equipped.weapon=item;
}
