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

function rarityName(r){return ['Bežná','Vzácna','Epická'][r]||'Bežná';}

function makeItem(epic=false, source=null) {
  const rarity = epic ? 2 : source?.variant==='rare' ? 1 : rand() < (source?.variant==='elite' ? .45 : .16) ? 1 : 0;
  const slot = rand() < .5 ? 'weapon' : 'armor';
  const tier = Math.min(99, source ? enemyLevel(source) : map().enemyLevel);
  const name = ['Pútnický', 'Mesačný', 'Dračí'][rarity] + (slot === 'weapon' ? ' meč' : ' pancier');
  return { name, slot, rarity, tier, enhance: 0, bonus: slot === 'weapon' ? 4 + Math.floor(tier * .6) + rarity * 9 : 2 + Math.floor(tier * .25) + rarity * 3, value: 12 + tier * 3 + rarity * 25 };
}

function awardItem(epic=false,source=null){const item=makeItem(epic,source);if(p.bag.length>=24){p.gold+=item.value;float('Batoh plný · +'+item.value+' zlata',p.x,p.y-110,'#d6cb99');return item;}p.bag.push(item);float(item.name+' → I',p.x,p.y-110,item.rarity===2?'#d3a3eb':item.rarity===1?'#a3ceec':'#d1dab7');return item;}

function equipItem(index){if(!Number.isInteger(index)||index<0||index>=p.bag.length)return;const item=p.bag.splice(index,1)[0],old=p.equipped[item.slot];p.equipped[item.slot]=item;if(old)p.bag.push(old);updateHUD();save();inventory();}

function sellItem(index){if(!Number.isInteger(index)||index<0||index>=p.bag.length)return;p.gold+=p.bag.splice(index,1)[0].value;updateHUD();save();inventory();}

function allocate(stat){if(p.points<=0||!['strength','vitality','dexterity','intelligence'].includes(stat))return;p.points--;p[stat]++;if(stat==='vitality')p.hp=Math.min(maxHP(),p.hp+10);updateHUD();save();inventory();}

function claimBoss(){if(p.bossClaimed||p.bossKills<1)return;p.bossClaimed=true;p.gold+=200;experience(80);awardItem(true);save();updateHUD();journal();}

function claimHunt(){if(p.career.eligibleKills<(p.huntClaimed+1)*10)return;p.huntClaimed++;p.gold+=60;addMaterial('training');save();updateHUD();journal();}
