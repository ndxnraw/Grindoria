function raritySpec(id) {return RARITIES.find(spec=>spec.id===id)||RARITIES[0];}
function rarityRank(id) {return raritySpec(id).rank;}
function rarityColor(id) {return raritySpec(id).color;}
function raritySourceLevel(source) {return Math.max(1,Math.min(99,source?enemyLevel(source):map().enemyLevel));}
function itemRarityWeights(source=null,epic=false) {
 const level=raritySourceLevel(source);
 let weights=[...RARITY_WEIGHTS[epic?'reward':source?.type==='boss'?'boss':source?.type==='stone'?'metin':source?.variant==='rare'?'rare':source?.variant==='elite'?'elite':'normal']];
 if(!epic&&source?.type==='stone'){
  const chance=METIN_TYPES[source.metinType]?.loot.epic||0;
  weights=weights.map((weight,i)=>weight*(1-chance)+RARITY_WEIGHTS.reward[i]*chance);
 }
 if(level<ITEM_GENERATION.legendaryLevel)weights[4]=0;
 if(level<ITEM_GENERATION.mythicLevel)weights[5]=0;
 return weights;
}
function itemRarityChances(source=null,epic=false) {const weights=itemRarityWeights(source,epic),sum=weights.reduce((a,b)=>a+b,0);return weights.map((weight,i)=>({id:RARITIES[i].id,chance:weight/sum}));}
function itemRandom(rng=rand) {const n=Number(rng());return Number.isFinite(n)?Math.max(0,Math.min(1-Number.EPSILON,n)):0;}
function rollItemRarity(source=null,epic=false,rng=rand) {
 const chances=itemRarityChances(source,epic);let roll=itemRandom(rng);
 for(const entry of chances){roll-=entry.chance;if(roll<0)return entry.id;}return chances.findLast(entry=>entry.chance>0).id;
}
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
function validateGeneratedItem(item) {
 if(item.generationVersion===undefined){if(item.affixes!==undefined)characterDataError('bonusy bez verzie generátora.');return;}
 if(item.generationVersion!==ITEM_GENERATION.version||!RARITIES.some(spec=>spec.id===item.rarity)||!Number.isSafeInteger(item.tier)||item.tier<1||item.tier>99||!Array.isArray(item.affixes)||item.affixes.length!==raritySpec(item.rarity).affixes)characterDataError('generované bonusy predmetu.');
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
function enemyGearBonus(enemy) {
 const kind=enemy.type==='stone'?'metin':enemy.type==='boss'?'boss':enemy.skin||'wolf';
 return Math.max(0,Math.min(ITEM_GENERATION.maxEnemyBonus,equipmentBonuses()[kind+'Damage']||0));
}
