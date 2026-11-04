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

function claimHunt(){if(p.career.eligibleKills<(p.huntClaimed+1)*10)return;p.huntClaimed++;p.gold+=60;addMaterial('training');save();updateHUD();if(gameWindows.has('journal'))journal();}
