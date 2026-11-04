// Content registries contain definitions, never mutable item instances.
const LOOT_POOLS=Object.create(null);
function registerLootPool(id,pool){if(Object.hasOwn(LOOT_POOLS,id)||!pool||!Array.isArray(pool.catalog))throw Error('Neplatný loot pool.');for(const e of pool.catalog)if(!ITEM_DEFINITIONS[e.definitionId]||!Number.isFinite(e.chance)||e.chance<0||e.chance>1)throw Error('Neplatný drop.');LOOT_POOLS[id]=pool;}
const ENEMY_LOOT_DEFAULTS={gear:{normal:.03,elite:.2,rare:1,boss:1},potionChance:.25,gold:{boss:120,min:7,range:7},capes:{boss:3,rare:2,eliteChance:.25,normalChance:.02}};
function enemyLootDefaults(){return JSON.parse(JSON.stringify(ENEMY_LOOT_DEFAULTS));}
for(const skin of ['wolf','scorpion','yeti','demon'])registerLootPool('enemy:'+skin,{...enemyLootDefaults(),catalog:[]});
for(const id of Object.keys(MAPS))registerLootPool('boss:'+id,{...enemyLootDefaults(),catalog:[]});
for(const [id,type]of Object.entries(METIN_TYPES))registerLootPool('metin:'+id,{metin:type.loot,catalog:[]});
for(const id of Object.keys(DUNGEONS))registerLootPool('dungeon:'+id,{...enemyLootDefaults(),catalog:[]});
const ICONIC_DROP_ENTRIES=Object.values(ICONIC_ITEMS).map(d=>({definitionId:d.id,minLevel:d.level,chance:d.level===75?.02:.015}));
for(const [id,pool]of Object.entries(LOOT_POOLS))if(id.startsWith('boss:')||id.startsWith('metin:')||id.startsWith('dungeon:'))pool.catalog=ICONIC_DROP_ENTRIES.map(e=>({...e}));
