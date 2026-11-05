function experience(n) {
  if (!Number.isFinite(n) || n <= 0 || p.level >= PROGRESSION.maxLevel) return;
  p.xp += Math.floor(n);
  while (p.level < PROGRESSION.maxLevel && p.xp >= needXP()) {
    p.xp -= needXP(); p.level++; p.points += 3;
    p.hp = maxHP(); p.mp = maxMP();
    float('ÚROVEŇ ' + p.level, p.x, p.y - 100, '#f9df93', true);
    toast('Nová úroveň ' + p.level + '!\n+3 body vlastností · zdravie a mana obnovené');
    beep(660, .25);
  }
  if (p.level === PROGRESSION.maxLevel) p.xp = 0;
}

function rarityName(r){return raritySpec(r).name;}

function equipmentDropLevel(source){return raritySourceLevel(source);}

function makeItem(epic=false, source=null, forcedSlot=null) {
  const rarity=rollItemRarity(source,epic),slots=Object.keys(EQUIPMENT),slot=forcedSlot||slots[Math.min(slots.length-1,Math.floor(itemRandom()*slots.length))];
  return generateEquipmentItem(slot,rarity,equipmentDropLevel(source));
}

function awardItem(epic=false,source=null){const item=makeItem(epic,source);if(!addGearItem(item)){p.gold+=itemSaleValue(item);float('Batoh plný · +'+itemSaleValue(item)+' zlata',p.x,p.y-110,'#d6cb99');return item;}float(item.name+' → I',p.x,p.y-110,rarityColor(item.rarity));return item;}



function allocate(stat){if(p.points<=0||!['strength','vitality','dexterity','intelligence'].includes(stat))return;p.points--;p[stat]++;if(stat==='vitality')p.hp=Math.min(maxHP(),p.hp+10);updateHUD();save();if(gameWindows.has('inventory'))inventory();if(gameWindows.has('character'))characterPanel();}

function claimBoss(){if(p.bossClaimed||p.bossKills<1)return;p.bossClaimed=true;p.gold+=200;experience(80);awardItem(true,{type:'boss',level:8});save();updateHUD();if(gameWindows.has('journal'))journal();}

function huntRequired(data=p){const hunt=data.career.hunt;return hunt.legacy>0?10:Math.min(200,10+5*data.huntClaimed+5*Math.floor((hunt.level-1)/10));}
function huntProgress(data=p){return data.career.eligibleKills-data.career.hunt.consumed;}
function huntReward(level=p.career.hunt.level,claim=p.huntClaimed+1,required=huntRequired()){
 const scale=required/10,reward={gold:Math.round((100+25*level+level*level)*scale),ore:Math.ceil((2+Math.floor(level/10))*scale)};
 if(claim%5===0)reward.books=Math.ceil((1+Math.floor(level/30))*scale);
 if(claim%10===0)reward.upgradeStones=Math.ceil((1+Math.floor(level/40))*scale);
 return reward;
}
function validateHuntProfile(data){
 const hunt=data.career.hunt;assertCharacterObject(hunt,'Lovec');if(hunt.schema!==1)characterDataError('verzia Lovca.');
 assertCharacterNumber(hunt.consumed,'započítané zabitia Lovca',0,data.career.eligibleKills,true);
 assertCharacterNumber(hunt.level,'úroveň série Lovca',1,data.level,true);
 assertCharacterNumber(hunt.legacy,'staré série Lovca',0,Math.floor((data.career.eligibleKills-hunt.consumed)/10),true);
}
function claimHunt(){
 if(!running||p.hp<=0||p.huntClaimed>=1e12||huntProgress()<huntRequired())return false;
 const required=huntRequired(),reward=huntReward(),hunt=p.career.hunt;
 if(p.gold+reward.gold>1e12||Object.entries(reward).some(([id,n])=>id!=='gold'&&p.career.materials[id]+n>1e12)){toast('Odmenu nemožno prevziať: limit zásob.');return false;}
 hunt.consumed+=required;if(hunt.legacy>0)hunt.legacy--;p.huntClaimed++;hunt.level=p.level;p.gold+=reward.gold;
 for(const [id,count]of Object.entries(reward))if(id!=='gold')addMaterial(id,count);
 toast('Lovec dokončený.\n'+costLabel(reward));save();updateHUD();if(gameWindows.has('journal'))journal();return true;
}
