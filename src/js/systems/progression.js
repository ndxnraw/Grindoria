function experience(n){p.xp+=n;while(p.xp>=needXP()){p.xp-=needXP();p.level++;p.points+=3;p.hp=maxHP();float('ÚROVEŇ '+p.level,p.x,p.y-100,'#f9df93',true);toast('Nová úroveň '+p.level+' · +3 body vlastností (I)');beep(660,.25);}}

function rarityName(r){return ['Bežná','Vzácna','Epická'][r]||'Bežná';}

function makeItem(epic=false){const r=epic?2:rand()<.28?1:0,slot=rand()<.5?'weapon':'armor',tier=Math.min(12,p.level),name=(['Pútnický','Mesačný','Dračí'][r])+(slot==='weapon'?' meč':' pancier');return{name,slot,rarity:r,bonus:slot==='weapon'?4+tier*2+r*9:2+Math.floor(tier/2)+r*3,value:12+tier*3+r*25};}

function awardItem(epic=false){const item=makeItem(epic);if(p.bag.length>=24){p.gold+=item.value;float('Batoh plný · +'+item.value+' zlata',p.x,p.y-110,'#d6cb99');return item;}p.bag.push(item);float(item.name+' → I',p.x,p.y-110,item.rarity===2?'#d3a3eb':item.rarity===1?'#a3ceec':'#d1dab7');return item;}

function equipItem(index){if(!Number.isInteger(index)||index<0||index>=p.bag.length)return;const item=p.bag.splice(index,1)[0],old=p.equipped[item.slot];p.equipped[item.slot]=item;if(old)p.bag.push(old);updateHUD();save();inventory();}

function sellItem(index){if(!Number.isInteger(index)||index<0||index>=p.bag.length)return;p.gold+=p.bag.splice(index,1)[0].value;updateHUD();save();inventory();}

function allocate(stat){if(p.points<=0||!['strength','vitality','dexterity','intelligence'].includes(stat))return;p.points--;p[stat]++;if(stat==='vitality')p.hp=Math.min(maxHP(),p.hp+10);updateHUD();save();inventory();}

function claimBoss(){if(p.bossClaimed||p.bossKills<1)return;p.bossClaimed=true;p.gold+=200;experience(150);awardItem(true);save();updateHUD();journal();}

function claimHunt(){if(p.kills<(p.huntClaimed+1)*10)return;p.huntClaimed++;p.gold+=60;experience(40);save();updateHUD();journal();}
