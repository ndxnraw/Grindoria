function raritySpec(id) {return RARITIES.find(spec=>spec.id===id)||RARITIES[0];}
function rarityRank(id) {return raritySpec(id).rank;}
function equipmentSourceLevel(source) {return Math.max(1,Math.min(PROGRESSION.maxLevel,source?enemyLevel(source):map().enemyLevel));}
function itemRandom(rng=rand) {const n=Number(rng());return Number.isFinite(n)?Math.max(0,Math.min(1-Number.EPSILON,n)):0;}
function affixValue(stat,tier,rarity,roll) {
 const spec=ITEM_AFFIXES[stat],rank=rarityRank(rarity);
 const value=(spec.base+Math.max(1,Math.min(99,tier))*spec.scale)*(1+rank*.22)*(.35+.65*roll/100);
 return spec.percent?Math.round(value*10000)/10000:Math.max(1,Math.round(value));
}
function rollItemAffixes(item,rng=rand) {
 const pool=Object.keys(ITEM_AFFIXES),affixes=[],stats={};
 for(let i=0;i<raritySpec(item.rarity).affixes;i++){
  const stat=pool.splice(Math.floor(itemRandom(rng)*pool.length),1)[0],roll=Math.floor(itemRandom(rng)*101);
  affixes.push({stat,roll});stats[stat]=affixValue(stat,item.tier,item.rarity,roll);
 }
 return {affixes,stats};
}
function itemRollQuality(item) {return item.affixes?.length?item.affixes.reduce((sum,affix)=>sum+affix.roll,0)/item.affixes.length:0;}
function itemSynergy(item) {
 const stats=item.stats||{};let pairs=0;
 for(const [a,b]of [['attack','crit'],['attack','attackSpeed'],['attack','penetration'],['hp','physicalResist'],['hp','fireResist'],['mp','attackSpeed']])if(stats[a]>0&&stats[b]>0)pairs++;
 if(stats.attack>0&&Object.keys(stats).some(key=>key.endsWith('Damage')&&stats[key]>0))pairs++;
 return pairs;
}
function itemMarketValue(item) {
 if(item.generationVersion!==ITEM_GENERATION.version)return Math.max(0,Math.floor(Number(item.value)||0));
 const base=12+item.tier*3,quality=itemRollQuality(item)/100,perfect=item.affixes.filter(affix=>affix.roll>=95).length;
 return Math.max(1,Math.round(base*raritySpec(item.rarity).market*(1+quality*2)*(1+perfect*.35)*(1+itemSynergy(item)*.25)*(1+(item.enhance||0)*.12)));
}
function itemSaleValue(item) {return item.generationVersion===ITEM_GENERATION.version?Math.max(1,Math.floor(itemMarketValue(item)*.25)):Math.max(0,Math.floor(Number(item.value)||0));}
function generateEquipmentItem(slot,rarity,tier,weaponKind=generatedWeaponKind(),rng=rand) {
 const spec=EQUIPMENT[slot],rank=raritySpec(rarity),item={generationVersion:ITEM_GENERATION.version,name:equipmentItemName(slot,rarity,weaponKind),slot,rarity,tier,requiredLevel:tier,enhance:0,bonus:spec.base+Math.floor(tier*spec.scale)+Math.round(rank.power*spec.rare)};
 if(slot==='weapon')item.weaponKind=weaponKind;
 Object.assign(item,rollItemAffixes(item,rng));item.value=itemSaleValue(item);return ensureItemIdentity(item);
}
function newBonusEquipment(slot, rarity, tier, weaponKind) {
  const spec = EQUIPMENT[slot];
  const item = {slot, rarity, tier, requiredLevel:tier, name:equipmentItemName(slot, rarity, weaponKind),
    bonus:spec.base+Math.floor(tier*spec.scale)+Math.round(raritySpec(rarity).power*spec.rare),
    enhance:0, generationVersion:ITEM_GENERATION.version, bonusMode:'manual', affixes:[], stats:{}, value:0};
  if (slot === 'weapon' && weaponKind) item.weaponKind = weaponKind;
  return item;
}

function equipmentRewardDefinition(slot, tier, weaponKind, rng) {
  const matching = METIN_EQUIPMENT.filter(def => def.slot === slot && def.classes.includes(p.classId) &&
    def.level <= tier && (!weaponKind || def.weaponKind === weaponKind));
  const pool = matching.filter(def => def.level >= tier-10);
  if (matching.length) {
    const choices = pool.length ? pool : matching.filter(def => def.level === Math.max(...matching.map(row=>row.level)));
    return choices[Math.floor(itemRandom(rng)*choices.length)];
  }
  return null;
}

function standardGearFamily(level) {
  return Math.max(0,STANDARD_GEAR_LEVELS.findLastIndex(required=>required<=level));
}

function rewardEquipment(slot, _legacyRarity, level, weaponKind, rng=rand) {
  const tier = Math.max(1, Math.min(PROGRESSION.maxLevel, level));
  const definition=equipmentRewardDefinition(slot,tier,weaponKind,rng);
  if(definition)return createItem(definition.id);
  const kind=slot==='weapon' ? weaponKind||generatedWeaponKind() : undefined;
  const family=standardGearFamily(tier);
  const item=newBonusEquipment(slot,0,STANDARD_GEAR_LEVELS[family],kind);
  item.name=equipmentFamilyName(slot,family,kind);
  return ensureItemIdentity(item);
}

function inventoryBonusTool(id) {
  return id?.startsWith('material:') && Object.hasOwn(ITEM_BONUS_TOOLS,id.slice(9)) ? ITEM_BONUS_TOOLS[id.slice(9)] : null;
}

function canApplyItemBonus(sourceId, targetId) {
  const mode = inventoryBonusTool(sourceId);
  const target = inventoryEntry(targetId);
  if (!running || p.hp<=0 || !mode || !(p.career.materials[sourceId.slice(9)]>0) ||
      !target || target.kind==='supply') return false;
  const item=target.item, count=item.affixes?.length||0;
  if (!item.generationVersion && !ITEM_DEFINITIONS[item.definitionId]?.generic) return false;
  return mode==='add' ? count<4 && Object.keys(ITEM_AFFIXES).some(stat=>!item.affixes?.some(a=>a.stat===stat))
    : count>0;
}

function applyItemBonus(sourceId, targetId, rng=rand) {
  if (!canApplyItemBonus(sourceId,targetId)) return false;
  const item=inventoryEntry(targetId).item, mode=inventoryBonusTool(sourceId);
  const previous=item.affixes||[];
  const affixes=mode==='add' ? [...previous] : [];
  // Prefer types that were absent before rerolling, keeping all lines unique.
  const excluded=new Set(previous.map(a=>a.stat));
  const pool=Object.keys(ITEM_AFFIXES).filter(stat=>!excluded.has(stat) && (stat!=='bonusExp'||['shield','boots','necklace'].includes(item.slot)));
  const count=mode==='add' ? 1 : previous.length;
  const legacyBase=item.generationVersion ? null : {...item.baseStats};
  if(legacyBase) for(const [stat,value] of Object.entries(item.stats||{})) legacyBase[stat]=(legacyBase[stat]||0)+value;
  for(let i=0;i<count;i++){
    const stat=pool.splice(Math.floor(itemRandom(rng)*pool.length),1)[0];
    affixes.push({stat,roll:Math.floor(itemRandom(rng)*101)});
  }
  if(!consumeSupply(sourceId,1))return false;
  if(legacyBase){item.baseStats=legacyBase;item.tier=Math.max(1,item.tier||1);}
  item.generationVersion=ITEM_GENERATION.version;
  item.bonusMode='manual';
  item.affixes=affixes;
  item.stats=Object.fromEntries(affixes.map(({stat,roll})=>[stat,affixValue(stat,item.tier,item.rarity,roll)]));
  item.value=itemSaleValue(item);
  finishInventoryChange();
  return true;
}

function validateGeneratedItem(item) {
 if(item.generationVersion===undefined){if(item.affixes!==undefined)characterDataError('bonusy bez verzie generátora.');return;}
 if(item.generationVersion!==ITEM_GENERATION.version||!RARITIES.some(spec=>spec.id===item.rarity)||!Number.isSafeInteger(item.tier)||item.tier<1||item.tier>(item.catalogVersion?120:105)||!Array.isArray(item.affixes)||(item.bonusMode==='manual'?item.affixes.length>5:item.affixes.length!==raritySpec(item.rarity).affixes))characterDataError('generované bonusy predmetu.');
 const seen=new Set();assertCharacterObject(item.stats,'generované štatistiky');
 for(const affix of item.affixes){
  assertCharacterObject(affix,'bonus predmetu');
  if(!Object.hasOwn(ITEM_AFFIXES,affix.stat)||seen.has(affix.stat)||!Number.isInteger(affix.roll)||affix.roll<0||affix.roll>100)characterDataError('náhodný bonus predmetu.');
  seen.add(affix.stat);const expected=affixValue(affix.stat,item.tier,item.rarity,affix.roll);
  if(!Number.isFinite(item.stats[affix.stat])||Math.abs(item.stats[affix.stat]-expected)>1e-8)characterDataError('hodnota náhodného bonusu.');
 }
 if(Object.keys(item.stats).length!==seen.size)characterDataError('nadbytočné bonusy predmetu.');
}
function penetrationChance(){return Math.max(0,Math.min(ITEM_GENERATION.maxPenetration,equipmentBonuses().penetration));}
function itemAttackSpeed(){return Math.max(0,Math.min(ITEM_GENERATION.maxAttackSpeed,equipmentBonuses().attackSpeed));}
function sourceIsMonster(enemy){return enemy.type!=='stone';}
function enemyGearBonus(enemy) {
 const kind=enemy.type==='stone'?'metin':enemy.type==='boss'?'boss':enemy.skin||'wolf';
 const gear=equipmentBonuses();
 return Math.max(0,Math.min(ITEM_GENERATION.maxEnemyBonus,(gear[kind+'Damage']||0)+(sourceIsMonster(enemy)?gear.monsterDamage:0)));
}
