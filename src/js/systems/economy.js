let marketMessage = '';
function marketSeed(text) { let n=2166136261; for(const ch of text)n=Math.imul(n^ch.charCodeAt(0),16777619);return n>>>0; }
function makeRareOffers(cycle) {
  let seed=marketSeed((p.characterId||'hero')+':market:'+cycle);
  const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const tier=Math.max(1,Math.min(99,p.level)),slots=['weapon','armor','bracelet','necklace','earrings','talisman'];
  return [0,1].map(index=>({id:'rare-'+index,stock:1,item:generateEquipmentItem(slots[Math.floor(rng()*slots.length)],tier>=35&&index===1?2:1,tier,generatedWeaponKind(),rng)}));
}
function initializeEconomy() {
  if(p.economy)return;
  p.economy={schema:ECONOMY_RULES.schema,elapsed:0,cycle:0,demand:{supplies:0,materials:0,gear:0},stock:{},rare:makeRareOffers(0)};
  for(const [trader,cfg] of Object.entries(MARKET_TRADERS))for(const id of cfg.goods)p.economy.stock[trader+':'+id]=MARKET_GOODS[id].stock;
}
function updateEconomy(dt) {
  const e=p.economy;e.elapsed+=dt;
  if(e.elapsed<ECONOMY_RULES.refreshSeconds)return;
  const periods=Math.floor(e.elapsed/ECONOMY_RULES.refreshSeconds);e.elapsed%=ECONOMY_RULES.refreshSeconds;
  e.cycle=Math.min(ECONOMY_RULES.maxCycles,e.cycle+periods);
  for(const group of Object.keys(e.demand))e.demand[group]=Math.trunc(e.demand[group]/2);
  for(const [trader,cfg] of Object.entries(MARKET_TRADERS))for(const id of cfg.goods)e.stock[trader+':'+id]=MARKET_GOODS[id].stock;
  e.rare=makeRareOffers(e.cycle);
}
function marketFactor(group) {
  const e=p.economy;if(!e)return 1;
  const trend=e.cycle?((marketSeed(group+':'+e.cycle)%21)-10)/100:0;
  return Math.max(.65,Math.min(1.6,1+e.demand[group]*.04+trend));
}
function changeDemand(group,delta){p.economy.demand[group]=Math.max(-10,Math.min(10,p.economy.demand[group]+delta));}
function currentTrader(){return Object.keys(MARKET_TRADERS).filter(id=>nearNPC(id)).sort((a,b)=>Math.hypot(p.x-NPCS[a].x,p.y-NPCS[a].y)-Math.hypot(p.x-NPCS[b].x,p.y-NPCS[b].y))[0]||null;}
function marketCanTrade(trader){return running&&p.hp>0&&Object.hasOwn(MARKET_TRADERS,trader)&&nearNPC(trader);}
function marketOffers(trader) {
  if(!Object.hasOwn(MARKET_TRADERS,trader))return [];
  const list=MARKET_TRADERS[trader].goods.map(id=>{const g=MARKET_GOODS[id];return {id,name:g.name,price:Math.ceil(g.price*marketFactor(g.group)),stock:p.economy.stock[trader+':'+id],level:g.level||1,group:g.group,supply:g.supply,count:g.count};});
  if(MARKET_TRADERS[trader].rare)for(const r of p.economy.rare)list.push({id:r.id,name:r.item.name,price:Math.ceil(Math.max(1000,itemMarketValue(r.item)*4)*marketFactor('gear')),stock:r.stock,level:requiredItemLevel(r.item),group:'gear',item:r.item,count:1});
  return list;
}
function buyMarketOffer(trader,id,expectedPrice=null,expectedCycle=null) {
  marketMessage='';
  if(!marketCanTrade(trader)){marketMessage='Priblíž sa k obchodníkovi v Meste.';return false;}
  const offer=marketOffers(trader).find(o=>o.id===id);
  if(!offer||!offer.stock||p.level<offer.level){marketMessage='Ponuka je vypredaná alebo nemáš potrebnú úroveň.';return false;}
  if(expectedPrice!==null&&expectedPrice!==offer.price||expectedCycle!==null&&expectedCycle!==p.economy.cycle){marketMessage='Cena alebo ponuka sa zmenila. Otvor obchod znova.';return false;}
  if(p.gold<offer.price){marketMessage='Nemáš dosť Yang.';return false;}
  if(offer.item){if(!gearLayout([...p.bag,offer.item])){marketMessage='V inventári nie je dosť súvislého miesta.';return false;}if(!addGearItem(copyCharacterData(offer.item)))return false;}
  else {
    const entry=supplyDefinitions().find(s=>s.id===offer.supply);
    if(!entry||entry.count+offer.count>1e12||!grantGroundSupply(offer.supply,offer.count)){marketMessage='Zásoba dosiahla maximum.';return false;}
  }
  p.gold-=offer.price;
  if(offer.item)p.economy.rare.find(r=>r.id===id).stock--;else p.economy.stock[trader+':'+id]--;
  changeDemand(offer.group,1);marketMessage='Kúpené: '+offer.name+' · −'+offer.price+' Yang.';save();updateHUD();return true;
}
function marketGearSaleValue(item,trader=currentTrader()) {
  return Math.max(1,Math.floor(itemSaleValue(item)*marketFactor('gear')*(trader==='armsdealer'?1.1:1)));
}
function sellMarketGear(uid,trader=currentTrader()) {
  if(!marketCanTrade(trader))return false;
  const index=p.bag.findIndex(item=>item.uid===uid);if(index<0)return false;
  const price=marketGearSaleValue(p.bag[index],trader);if(p.gold+price>1e12)return false;
  const item=p.bag.splice(index,1)[0];p.gold+=price;changeDemand('gear',-1);
  marketMessage='Predané: '+item.name+' · +'+price+' Yang.';finishInventoryChange();return true;
}
function marketMaterialSaleValue(id,trader) {
  if(!Object.hasOwn(MARKET_MATERIAL_PRICES,id))return 0;
  const preferred=trader==='alchemist'&&['herb','extract','dust'].includes(id);
  return Math.max(1,Math.floor(MARKET_MATERIAL_PRICES[id]*.25*marketFactor('materials')*(preferred?1.1:1)));
}
function sellMarketMaterial(trader,id,count=1) {
  if(!marketCanTrade(trader)||!Number.isSafeInteger(count)||count<1||count>1000)return false;
  const unit=marketMaterialSaleValue(id,trader);if(!unit||p.career.materials[id]<count||p.gold+unit*count>1e12)return false;
  p.career.materials[id]-=count;p.gold+=unit*count;changeDemand('materials',-Math.min(3,count));
  marketMessage='Predané: '+count+' '+MATERIALS[id]+' · +'+unit*count+' Yang.';save();updateHUD();return true;
}
function validateEconomyProfile(data) {
  const e=data.economy;if(e===undefined)return;
  assertCharacterObject(e,'trh');if(e.schema!==ECONOMY_RULES.schema)characterDataError('verzia trhu.');
  assertCharacterNumber(e.elapsed,'čas trhu',0,ECONOMY_RULES.refreshSeconds);assertCharacterNumber(e.cycle,'cyklus trhu',0,ECONOMY_RULES.maxCycles,true);
  assertCharacterObject(e.demand,'dopyt');for(const group of ['supplies','materials','gear'])assertCharacterNumber(e.demand[group],'dopyt',-10,10,true);
  assertCharacterObject(e.stock,'zásoby obchodníkov');const keys=[];
  for(const [trader,cfg]of Object.entries(MARKET_TRADERS))for(const id of cfg.goods){const key=trader+':'+id;keys.push(key);assertCharacterNumber(e.stock[key],'zásoba ponuky',0,MARKET_GOODS[id].stock,true);}
  if(Object.keys(e.stock).some(key=>!keys.includes(key)))characterDataError('neznáma ponuka.');
  if(!Array.isArray(e.rare)||e.rare.length!==2)characterDataError('vzácne ponuky.');
  e.rare.forEach((r,i)=>{assertCharacterObject(r,'vzácna ponuka');if(r.id!=='rare-'+i)characterDataError('ID ponuky.');assertCharacterNumber(r.stock,'vzácna zásoba',0,1,true);validateCharacterItem(r.item);});
}
