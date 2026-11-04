function initializePrestige(){p.career.prestige??={schema:1,rank:0,marks:0,metins:0,clears:{},bosses:{},uniques:{},claimed:{},training:{vitality:0,guard:0,focus:0}};trackPrestigeUniques();}
function prestigeRank(data=p){return data?.career?.prestige?.rank||0;}
function prestigeSuffix(data=p){return prestigeRank(data)?' · P '+PRESTIGE_RANKS[prestigeRank(data)].label:'';}
function trackPrestigeUniques(){const c=p.career?.prestige;if(!c)return;for(const item of [...(p.bag||[]),...Object.values(p.equipped||{})])if(item&&Object.hasOwn(DUNGEON_UNIQUES,item.uniqueId||''))c.uniques[item.uniqueId]=true;}
function prestigeBonuses(){const c=p.career?.prestige,b={};if(!c?.rank)return b;const add=(bonus,n=1)=>{for(const [key,value]of Object.entries(bonus))b[key]=(b[key]||0)+value*n;};for(let rank=1;rank<=c.rank;rank++)add(PRESTIGE_RANKS[rank].bonus);for(const [id,training]of Object.entries(PRESTIGE_TRAINING))add(training.bonus,c.training[id]);return b;}
function prestigeTrialCount(id,minTier){const c=p.career.prestige;return Object.entries(c.clears).filter(([key])=>key.split(':')[0]===id&&Number(key.split(':')[1])>=minTier).reduce((sum,[,n])=>sum+n,0);}
function prestigeProgress(goal){const c=p.career.prestige,gear=Object.values(p.equipped).filter(Boolean);switch(goal.metric){
 case'trial':return prestigeTrialCount(goal.dungeon,goal.tier);
 case'trials4':case'trials5':return Object.keys(DUNGEONS).filter(id=>prestigeTrialCount(id,goal.metric==='trials4'?4:5)>0).length;
 case'metins':return c.metins;case'bosses':return Object.values(c.bosses).reduce((a,b)=>a+b,0);case'bossTypes':return Object.keys(c.bosses).filter(id=>c.bosses[id]>0).length;
 case'skills10':case'skills20':return school().skills.filter((s,i)=>(p.career.skills[skillKey(i)]?.rank||1)>=(goal.metric==='skills10'?10:20)).length;
 case'biology':return p.career.biology.stage;case'uniques':return Object.keys(c.uniques).length;
 case'bestiary':return PRESTIGE_BESTIARY_KEYS.filter(id=>p.bestiary[id]>0).length;
 case'weapon9':return p.equipped.weapon?.enhance===9&&rarityRank(p.equipped.weapon.rarity)>=4?1:0;
 case'arsenal':return gear.filter(item=>item.rarity===5&&item.enhance===9).length;
 case'perfect':return [...p.bag,...gear].some(item=>item.rarity===5&&item.affixes?.length===5&&item.affixes.every(affix=>affix.roll===100))?1:0;
 case'training':return Object.values(c.training).reduce((a,b)=>a+b,0);
 }return 0;}
function prestigeCanChange(){return running&&p.level===PROGRESSION.maxLevel&&!dungeonRun()&&!p.career.endgame.run&&canTravel();}
function activatePrestige(){if(!prestigeCanChange()||prestigeRank())return false;p.career.prestige.rank=1;p.career.prestige.marks=5;trackPrestigeUniques();save();updateClassHUD();updateHUD();return true;}
function promotePrestige(){const c=p.career.prestige,next=c.rank+1;if(!prestigeCanChange()||!c.rank||next>PRESTIGE_RULES.maxRank||PRESTIGE_REQUIREMENTS[next].some(goal=>prestigeProgress(goal)<goal.need))return false;c.rank=next;c.marks+=next*5;save();updateClassHUD();updateHUD();return true;}
function trainPrestige(id){const c=p.career.prestige;if(!running||p.hp<=0||!c.rank||!Object.hasOwn(PRESTIGE_TRAINING,id)||c.training[id]>=PRESTIGE_RULES.maxTraining)return false;const cost=3*(c.training[id]+1);if(c.marks<cost)return false;c.marks-=cost;c.training[id]++;save();updateHUD();return true;}
function claimPrestigeGoal(id){const c=p.career.prestige;if(!running||p.hp<=0||!c.rank||!Object.hasOwn(PRESTIGE_GOALS,id)||c.claimed[id]||prestigeProgress(PRESTIGE_GOALS[id])<PRESTIGE_GOALS[id].need)return false;c.claimed[id]=true;c.marks+=PRESTIGE_RULES.goalReward;save();updateHUD();return true;}
function prestigeKill(enemy){if(prestigeRank()&&enemy.type==='stone'&&enemyLevel(enemy)>=95)p.career.prestige.metins++;}
function prestigeDungeonReward(boss){const r=dungeonRun(),c=p.career.prestige;if(!r?.prestigeTier||boss.dungeonRunId!==r.id)return;const key=r.dungeon+':'+r.prestigeTier;c.clears[key]=(c.clears[key]||0)+1;c.bosses[r.dungeon]=(c.bosses[r.dungeon]||0)+1;c.marks+=r.prestigeTier;}
function enterPrestigeTrial(id){return enterDungeon(id,'mythic',true);}
function dungeonCombatDifficulty(r=dungeonRun()){const base=DUNGEON_DIFFICULTIES[r.difficulty],tier=r.prestigeTier||0;return tier?{...base,hp:base.hp*(1+tier*.5),damage:base.damage*(1+tier*.2),reward:base.reward+tier}:base;}
function prestigeDungeonPulse(){const r=dungeonRun(),boss=mobs.find(m=>m.dungeonBoss&&m.hp>0);if(!r?.prestigeTier||!r.unlocked||!boss)return;const n=r.prestigePulse=(r.prestigePulse||0)+1,damage=dungeonAttackBase(r)*dungeonCombatDifficulty(r).damage*.5;if(n%2)makeDungeonHazard('ring',boss.x,boss.y,damage,'arcane',{inner:100,radius:350,delay:1.8,duration:2});else makeDungeonHazard('line',boss.x,boss.y,damage,'arcane',{angle:Math.atan2(p.y-boss.y,p.x-boss.x),length:700,width:50,delay:1.8,duration:2});}
function validatePrestige(data){const c=data.career.prestige;if(c===undefined)return;assertCharacterObject(c,'prestíž');if(c.schema!==1)characterDataError('verzia prestíže.');assertCharacterNumber(c.rank,'stupeň prestíže',0,5,true);if(c.rank&&data.level!==99)characterDataError('úroveň prestíže.');for(const field of ['marks','metins'])assertCharacterNumber(c[field],field,0,1e12,true);for(const field of ['clears','bosses','uniques','claimed','training'])assertCharacterObject(c[field],field);
 for(const [id,n]of Object.entries(c.clears)){const parts=id.split(':');if(parts.length!==2||!Object.hasOwn(DUNGEONS,parts[0])||!/^([1-5])$/.test(parts[1])||Number(parts[1])>c.rank)characterDataError('prestížna výzva.');assertCharacterNumber(n,'počet výziev',1,1e12,true);}
 for(const [id,n]of Object.entries(c.bosses)){if(!Object.hasOwn(DUNGEONS,id))characterDataError('prestížny boss.');assertCharacterNumber(n,'počet bossov',1,1e12,true);}
 for(const [id,v]of Object.entries(c.uniques))if(!Object.hasOwn(DUNGEON_UNIQUES,id)||v!==true)characterDataError('unikát prestíže.');for(const [id,v]of Object.entries(c.claimed))if(!Object.hasOwn(PRESTIGE_GOALS,id)||v!==true)characterDataError('odmena prestíže.');for(const [id,n]of Object.entries(c.training)){if(!Object.hasOwn(PRESTIGE_TRAINING,id))characterDataError('pasívna prestíž.');assertCharacterNumber(n,'stupeň pasívu',0,10,true);}for(const id of Object.keys(PRESTIGE_TRAINING))if(c.training[id]===undefined)characterDataError('chýbajúci pasív prestíže.');if(!c.rank&&(c.marks||c.metins||Object.keys(c.clears).length||Object.keys(c.bosses).length||Object.keys(c.claimed).length||Object.values(c.training).some(Boolean)))characterDataError('neaktívna prestíž.');
}

function refinePrestigeAffix(id){
 if(typeof id!=='string')return false;const [slot,stat]=id.split(':'),c=p.career.prestige,item=p.equipped[slot];
 if(!running||p.hp<=0||c.rank<3||!Object.hasOwn(EQUIPMENT,slot)||!Object.hasOwn(ITEM_AFFIXES,stat)||item?.rarity!==5||item.generationVersion!==ITEM_GENERATION.version)return false;
 const affix=item.affixes.find(a=>a.stat===stat);if(!affix||affix.roll>=100)return false;const cost=5+Math.floor(affix.roll/20);if(c.marks<cost)return false;
 c.marks-=cost;affix.roll=Math.min(100,affix.roll+5);item.stats[stat]=affixValue(stat,item.tier,item.rarity,affix.roll);save();updateHUD();return true;
}

function dungeonAttackBase(r=dungeonRun()){return r.prestigeTier?Math.max(300,DUNGEONS[r.dungeon].attack):DUNGEONS[r.dungeon].attack;}
