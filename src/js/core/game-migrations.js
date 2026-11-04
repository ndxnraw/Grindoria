// Compatibility only: removed systems never enter active gameplay or new saves.
function migrateGameSystems(data){
 const c=data?.career;if(!c||c.schema!==PROGRESSION.schema||c.systemsVersion===1)return false;
 let refund=0;
 const count=(n,label,max=1e12)=>{assertCharacterNumber(n,label,0,max,true);return n;};
 const removedSupplyValue=id=>id.startsWith('gem:')?100:id==='material:extract'?45:({mana:70,might:40,guard:50,vitality:75,greaterMight:400})[id.slice(8)];
 if(c.alchemy!==undefined){
  const a=c.alchemy;assertCharacterObject(a,'staré remeslo');
  for(const field of ['stock','equipped']){assertCharacterObject(a[field],'staré kamene');for(const [id,n]of Object.entries(a[field])){if(!['ruby','sapphire','jade'].includes(id))characterDataError('starý kameň.');refund+=100*(field==='equipped'?2**count(n,'starý stupeň',5)-1:count(n,'staré zásoby'));}}
  if(a.products!==undefined){assertCharacterObject(a.products,'staré zásoby');for(const [id,n]of Object.entries(a.products)){const price=removedSupplyValue('alchemy:'+id);if(!price)characterDataError('starý výrobok.');refund+=price*count(n,'starý výrobok');}}
  if(a.xp!==undefined){count(a.xp,'stará prax',4500);c.crafting??={xp:0,crafted:0};c.crafting.xp=Math.min(4500,count(c.crafting.xp,'prax remesla',4500)+a.xp);}
 }
 if(c.collection!==undefined){assertCharacterObject(c.collection,'stará zbierka');for(const [id,v]of Object.entries(c.collection)){if(!['valley','desert','snow','temple'].includes(id)||typeof v!=='boolean')characterDataError('stará zbierka.');if(v)refund+=150;}}
 if(c.materials?.extract!==undefined){refund+=45*count(c.materials.extract,'staré materiály');delete c.materials.extract;}
 for(const state of [...Object.values(data.worldStates||{}),c.normalTemple])if(state?.drops)for(const drop of state.drops){
  const price=drop.kind==='relic'?150:drop.kind==='supply'?removedSupplyValue(drop.supplyId||''):0;
  if(price){const amount=drop.kind==='relic'?1:count(drop.count,'staré predmety na zemi');drop.kind='gold';drop.count=drop.value=Math.min(1e12,price*amount);delete drop.relicId;delete drop.supplyId;}
 }
 if(data.inventory){data.inventory.pages=Math.max(5,data.inventory.pages||2);for(const id of Object.keys(data.inventory.supplyCells||{}))if(id.startsWith('gem:')||id.startsWith('alchemy:')||id==='material:extract')delete data.inventory.supplyCells[id];}
 if(data.economy?.stock){for(const id of Object.keys(data.economy.stock))if(id.startsWith('alchemist:'))delete data.economy.stock[id];for(const id of ['herb','dust'])data.economy.stock['merchant:'+id]??=MARKET_GOODS[id].stock;}
 if(data.discovery?.claimed)delete data.discovery.claimed.relics;
 for(const skill of Object.values(c.skills||{})){count(skill.rank,'starý stupeň schopnosti',20);if(skill.rank<1)characterDataError('starý stupeň schopnosti.');skill.rank=skill.rank===20?31:skill.rank>=10?skill.rank+11:skill.rank*2-1;}
 if(c.biology){while(BIOLOGY[c.biology.stage]&&c.biology.delivered>=BIOLOGY[c.biology.stage].count){c.biology.stage++;c.biology.delivered=0;c.biology.sampleKills=0;}if(Number.isFinite(c.biology.nextDeliveryAt))c.biology.nextDeliveryAt=Math.min(c.biology.nextDeliveryAt,Date.now()+(BIOLOGY[c.biology.stage]?.cooldown||0)*1000);}
 delete c.alchemy;delete c.collection;delete c.relicPity;
 c.materials.soulStones??=0;c.systemsVersion=1;
 data.gold=Math.min(1e12,count(data.gold,'Yang')+refund);
 return true;
}
