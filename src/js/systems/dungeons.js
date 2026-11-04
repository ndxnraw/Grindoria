function initializeDungeons(){p.career.dungeons??={schema:1,serial:0,clears:{},pity:{},run:null};}
function dungeonRun(){return p.career?.dungeons?.run||null;}
function dungeonLevel(id,difficulty){return Math.min(99,DUNGEONS[id].level+DUNGEON_DIFFICULTIES[difficulty].level);}
function configureDungeonMap(){const r=dungeonRun();if(!r)return;const d=DUNGEONS[r.dungeon];Object.assign(MAPS.dungeon,{name:d.name,desc:d.enemy+' · '+d.boss,level:r.prestigeTier?99:dungeonLevel(r.dungeon,r.difficulty),enemyLevel:r.prestigeTier?99:dungeonLevel(r.dungeon,r.difficulty),skin:d.skin,boss:d.boss,mob:d.enemy,ground:d.ground,accent:d.color,scale:1+d.level/10});}
function createDungeonEnemy(role,index,x,y){
 const r=dungeonRun(),d=DUNGEONS[r.dungeon],diff=dungeonCombatDifficulty(r),level=r.prestigeTier?99:dungeonLevel(r.dungeon,r.difficulty),boss=role==='boss',seal=role==='seal';
 const hp=Math.round((boss?(r.prestigeTier?Math.max(42000,d.hp):d.hp):seal?180+level*10:100+level*10)*diff.hp);
 return {type:boss?'boss':'wolf',skin:d.skin,name:boss?(r.prestigeTier?'Vzácny '+d.boss:d.boss):seal?'Pečať '+(index+1):d.enemy,dungeonId:r.dungeon,dungeonRunId:r.id,dungeonRole:role,dungeonBoss:boss,dungeonSeal:seal,noRespawn:true,spawnId:'dungeon:'+r.id+':'+role+':'+index,spawnPointId:'dungeon:'+r.id+':'+role+':'+Math.floor(index/4),spawnSlot:index,level,variant:boss&&r.prestigeTier?'rare':'normal',area:'northwest',x,y,homeX:x,homeY:y,hp,max:hp,baseMax:hp,attackScale:(dungeonAttackBase(r)*diff.damage)/9,damageType:d.type,baseAttack:(dungeonAttackBase(r)*diff.damage)/9,speedScale:1,cd:2,hit:0,windup:0,dead:0,stun:0,slow:0,engaged:0,taunt:0,roamWait:2,skillContributors:[],dots:[],attackStep:0,attackPlan:null,phaseMask:0,resistances:{[d.type]:.25,lightning:-.15}};
}
function hydrateDungeonPopulation(old){
 if(old?.mobs?.length)return old.mobs.map(m=>JSON.parse(JSON.stringify(m)));
 const d=DUNGEONS[dungeonRun().dungeon],list=[];
 for(let i=0;i<d.count;i++){const row=Math.floor(i/4),col=i%4,angle=i/d.count*Math.PI*2;const at=dungeonRun().dungeon==='abyss'?{x:900+Math.cos(angle)*570,y:900+Math.sin(angle)*450}:dungeonRun().dungeon==='crypt'?{x:420+col*310+Math.sin(row*2)*65,y:1200-row*210+Math.cos(col*2)*60}:{x:450+col*290,y:1200-row*200};list.push(createDungeonEnemy('guard',i,at.x,at.y));}
 const seals=dungeonRun().dungeon==='frost'?[[400,1050],[1400,1050],[900,650]]:dungeonRun().dungeon==='abyss'?[[420,650],[1380,650],[900,1250]]:[[400,600],[1400,600],[900,950]];
 for(let i=0;i<3;i++)list.push(createDungeonEnemy('seal',i,...seals[i]));
 list.push(createDungeonEnemy('boss',0,900,330));return list;
}
function enterDungeon(id,difficulty='normal',prestige=false){
 if(prestige&&(p.level!==99||!prestigeRank()||difficulty!=='mythic'))return false;
 if(!Object.hasOwn(DUNGEONS,id)||!Object.hasOwn(DUNGEON_DIFFICULTIES,difficulty)||!running||dungeonRun()||p.career.endgame.run||p.level<dungeonLevel(id,difficulty)||!canTravel())return false;
 const d=DUNGEONS[id];if(!canPayRecipe(d.cost))return false;
 snapshotMap();pay(d.cost);const c=p.career.dungeons;
 c.run={id:++c.serial,dungeon:id,difficulty,unlocked:false,cleared:false,rewarded:false,time:0,hazardTimer:8,hazards:[],...(prestige?{prestigeTier:prestigeRank(),prestigePulse:0}:{})};
 delete p.worldStates.dungeon;configureDungeonMap();loadMap('dungeon',true);Object.assign(p,MAPS.dungeon.entry);cam.x=p.x;cam.y=p.y;closeModal();updateHUD();save();return true;
}
function dungeonUnlocked(){const r=dungeonRun();if(!r)return false;if(!r.unlocked&&!mobs.some(m=>(m.dungeonRole==='seal'||m.dungeonRole==='guard')&&m.hp>0))r.unlocked=true;return r.unlocked;}
function dungeonBossReward(boss){
 const r=dungeonRun();if(!r||r.rewarded||boss.dungeonRunId!==r.id)return;
 const c=p.career.dungeons,d=DUNGEONS[r.dungeon],diff=dungeonCombatDifficulty(r),key=r.dungeon+':'+r.difficulty;
 r.rewarded=true;r.cleared=true;r.hazards=[];prestigeDungeonReward(boss);c.clears[key]=(c.clears[key]||0)+1;
 const unique=DUNGEON_UNIQUES[d.unique],rarity=r.difficulty==='normal'?1:r.difficulty==='mythic'&&boss.level>=50?4:2;
 const item=generateEquipmentItem(unique.slot,rarity,boss.level);item.name=unique.name;item.uniqueId=d.unique;item.bonus+=unique.bonus;item.special=['Výlučná korisť: '+d.name];spawnGroundDrop({kind:'gear',item},boss);
 dropMaterial('shards',(5+Math.floor(d.level/5))*diff.reward,boss);
 if(d.endgame||r.difficulty!=='normal')dropMaterial('primal',diff.reward,boss);
 if(d.endgame||r.prestigeTier){const chance=r.prestigeTier?.08+.02*r.prestigeTier:r.difficulty==='mythic'?.08:r.difficulty==='hard'?.03:0;let mythic=false;if(chance){c.pity[key]=(c.pity[key]||0)+1;mythic=c.pity[key]>=DUNGEON_RULES.mythicPity||rand()<chance;if(mythic)c.pity[key]=0;}
  const rare=generateEquipmentItem(Object.keys(EQUIPMENT)[Math.floor(rand()*Object.keys(EQUIPMENT).length)],mythic?5:4,boss.level);spawnGroundDrop({kind:'gear',item:rare},boss);
 }
 if(r.dungeon==='crypt')dropMaterial('keys',1,boss);
 toast('Dungeon dokončený. Korisť je pri bossovi. Návrat cez M alebo P.');
}
function finishDungeon(){
 const r=dungeonRun();if(!r)return false;
 // Keep all uncollected items on the town ground, with original identities and expiry.
 const carried=drops.map(cloneGroundDrop),town=p.worldStates.town||{worldSize:1200,mobs:[],drops:[]};
 if((town.drops?.length||0)+carried.length>5000){toast('Najprv pozbieraj korisť. V Meste je priveľa predmetov.');return false;}
 carried.forEach((drop,i)=>{drop.x=600+(i%7-3)*15;drop.y=720+Math.floor(i/7)%7*10;drop.launchX=drop.x;drop.launchY=drop.y;drop.fallAge=LOOT_RULES.fallDuration;});
 p.worldStates.town={...town,drops:[...(town.drops||[]),...carried]};p.career.dungeons.run=null;delete p.worldStates.dungeon;mobs.length=0;drops.length=0;travelCombat.time=0;loadMap('town');save();return true;
}
function makeDungeonHazard(kind,x,y,damage,type,extra={}){const r=dungeonRun();if(r&&r.hazards.length<DUNGEON_RULES.maxHazards)r.hazards.push({kind,x,y,age:0,delay:1.4,duration:3,tick:0,damage,type,radius:110,...extra});}
function hazardContains(h,entity=p){const dx=entity.x-h.x,dy=entity.y-h.y,d=Math.hypot(dx,dy);if(h.kind==='ring')return d>=h.inner&&d<=h.radius;if(h.kind==='line'){const along=dx*Math.cos(h.angle)+dy*Math.sin(h.angle),side=Math.abs(-dx*Math.sin(h.angle)+dy*Math.cos(h.angle));return along>=0&&along<=h.length&&side<=h.width;}return d<h.radius;}
function updateDungeon(dt,safe){
 const r=dungeonRun();if(!r||r.cleared)return;r.time+=dt;dungeonUnlocked();
 const d=DUNGEONS[r.dungeon],diff=dungeonCombatDifficulty(r);r.hazardTimer-=dt;
 if(r.hazardTimer<=0){r.hazardTimer=(d.endgame?9:14)/(1+(r.prestigeTier||0)*.15);if(!safe){prestigeDungeonPulse();if(r.dungeon==='frost')makeDungeonHazard('frost',p.x,p.y,dungeonAttackBase(r)*.3*diff.damage,'physical',{radius:125,duration:4});else makeDungeonHazard('circle',p.x,p.y,dungeonAttackBase(r)*.4*diff.damage,d.type,{radius:d.endgame?130:100});}}
 for(const h of r.hazards){h.age+=dt;if(h.age<h.delay)continue;h.tick=Math.max(0,h.tick-dt);if(!safe&&h.tick<=0&&hazardContains(h)){takeDamage(h.damage,null,h.type);h.tick=1;}}
 r.hazards=r.hazards.filter(h=>h.age<h.delay+h.duration);
}
function dungeonSpeedFactor(){const r=dungeonRun();return r?.hazards.some(h=>h.kind==='frost'&&h.age>=h.delay&&hazardContains(h))?.65:1;}
function updateDungeonBoss(b,dt,safe){
 const r=dungeonRun();if(!r||!dungeonUnlocked()||r.cleared)return;
 if(safe||active('stealth')){b.attackPlan=null;b.hp=Math.min(b.max,b.hp+b.max*dt*.1);return;}
 const d=DUNGEONS[r.dungeon],diff=dungeonCombatDifficulty(r),ratio=b.hp/b.max;
 for(const [threshold,bit]of [[.5,1],[.25,2]])if(ratio<=threshold&&!(b.phaseMask&bit)){b.phaseMask|=bit;for(let i=0;i<2;i++){const add=createDungeonEnemy('add',bit*10+i,b.x+(i?100:-100),b.y+100);add.engaged=20;mobs.push(add);}}
 if(b.attackPlan){b.attackPlan.age+=dt;if(b.attackPlan.age>=b.attackPlan.delay){const plan=b.attackPlan;if(hazardContains(plan)&&!safe)takeDamage(plan.damage,b,d.type);if(plan.kind==='line'){b.x=Math.max(80,Math.min(SIZE-80,plan.x+Math.cos(plan.angle)*plan.length));b.y=Math.max(80,Math.min(SIZE-80,plan.y+Math.sin(plan.angle)*plan.length));}b.attackPlan=null;b.cd=ratio<.5?2:3.5;}return;}
 if(b.cd>0)return;
 const step=b.attackStep++%3,angle=Math.atan2(p.y-b.y,p.x-b.x),damage=Math.round(dungeonAttackBase(r)*diff.damage*(ratio<.25?1.3:1));
 if(r.dungeon==='frost'&&step!==2)b.attackPlan={kind:'line',x:b.x,y:b.y,angle,length:Math.min(650,Math.hypot(p.x-b.x,p.y-b.y)+80),width:65,radius:0,age:0,delay:1.3,damage};
 else if(r.dungeon==='abyss'&&step!==1)b.attackPlan={kind:'ring',x:b.x,y:b.y,inner:130,radius:430,age:0,delay:1.6,damage};
 else b.attackPlan={kind:'circle',x:p.x,y:p.y,radius:r.dungeon==='crypt'?130:160,age:0,delay:1.4,damage};
 if(step===2)makeDungeonHazard('circle',p.x,p.y,damage*.45,d.type,{radius:100,duration:4});
}
function resetDungeonBoss(){const r=dungeonRun();if(!r||r.cleared)return;r.hazards=[];const b=mobs.find(m=>m.dungeonBoss);if(b){b.hp=b.max;b.x=b.homeX;b.y=b.homeY;b.attackPlan=null;b.phaseMask=0;b.cd=3;}for(let i=mobs.length-1;i>=0;i--)if(mobs[i].dungeonRole==='add')mobs.splice(i,1);}
function validateDungeonProfile(data){
 const c=data.career.dungeons;if(c===undefined){if(data.mapId==='dungeon')characterDataError('chýbajúca výprava.');return;}
 assertCharacterObject(c,'dungeony');if(c.schema!==DUNGEON_RULES.schema)characterDataError('verzia dungeonov.');assertCharacterNumber(c.serial,'séria výprav',0,Number.MAX_SAFE_INTEGER,true);
 for(const field of ['clears','pity']){assertCharacterObject(c[field],field);for(const [key,value]of Object.entries(c[field])){const [id,difficulty]=key.split(':');if(!Object.hasOwn(DUNGEONS,id)||!Object.hasOwn(DUNGEON_DIFFICULTIES,difficulty)||key!==id+':'+difficulty)characterDataError('záznam dungeonu.');assertCharacterNumber(value,'počet výprav',0,field==='pity'?11:1e12,true);}}
 const r=c.run;if(r==null){if(data.mapId==='dungeon')characterDataError('mapa bez výpravy.');return;}
 assertCharacterObject(r,'výprava dungeonu');if(!Object.hasOwn(DUNGEONS,r.dungeon)||!Object.hasOwn(DUNGEON_DIFFICULTIES,r.difficulty)||data.mapId!=='dungeon'||data.career.endgame.run)characterDataError('stav dungeonu.');
 if(r.prestigeTier!==undefined){assertCharacterNumber(r.prestigeTier,'stupeň prestížnej výzvy',1,data.career.prestige?.rank||0,true);if(data.level!==99||r.difficulty!=='mythic')characterDataError('prestížna obtiažnosť.');assertCharacterNumber(r.prestigePulse,'cyklus prestížnej mechaniky',0,1e12,true);}
 assertCharacterNumber(r.id,'ID dungeonu',1,c.serial,true);for(const key of ['unlocked','cleared','rewarded'])if(typeof r[key]!=='boolean')characterDataError('stav odmeny dungeonu.');
 assertCharacterNumber(r.time,'čas dungeonu',0,1e12);assertCharacterNumber(r.hazardTimer,'čas mechaniky',-1,15);
 if(r.cleared!==r.rewarded)characterDataError('odmena dungeonu.');if(!Array.isArray(r.hazards)||r.hazards.length>12)characterDataError('mechaniky dungeonu.');
 const validateHazard=h=>{assertCharacterObject(h,'útok bossa');if(!['circle','line','ring','frost'].includes(h.kind)||h.type!==undefined&&!Object.hasOwn(DAMAGE_TYPES,h.type))characterDataError('typ útoku bossa.');for(const key of ['x','y'])assertCharacterNumber(h[key],'poloha útoku',0,1800);for(const key of ['age','delay','radius'])assertCharacterNumber(h[key],'čas alebo dosah útoku',0,key==='radius'?1800:15);assertCharacterNumber(h.damage,'sila útoku',0,1e6);if(h.kind==='line'){assertCharacterNumber(h.angle,'smer útoku',-Math.PI,Math.PI);assertCharacterNumber(h.length,'dĺžka útoku',0,1800);assertCharacterNumber(h.width,'šírka útoku',0,300);}if(h.kind==='ring')assertCharacterNumber(h.inner,'vnútorný dosah',0,h.radius);};
 for(const h of r.hazards){validateHazard(h);assertCharacterNumber(h.duration,'trvanie poľa',0,10);assertCharacterNumber(h.tick,'čas zásahu',-1,1);}
 const state=data.worldStates.dungeon;if(!state||!Array.isArray(state.mobs)||state.mobs.length>60)characterDataError('populácia dungeonu.');
 let bosses=0,seals=0,guards=0;
 for(const m of state.mobs){if(m.dungeonRunId!==r.id||m.dungeonId!==r.dungeon||m.noRespawn!==true||!['boss','seal','guard','add'].includes(m.dungeonRole))characterDataError('identita nepriateľa dungeonu.');if(m.dungeonRole==='boss'){bosses++;if(!m.dungeonBoss||m.type!=='boss'||r.cleared!==(m.hp<=0))characterDataError('boss dungeonu.');assertCharacterNumber(m.attackStep,'cyklus bossa',0,1e12,true);assertCharacterNumber(m.phaseMask,'fáza bossa',0,3,true);if(m.attackPlan)validateHazard(m.attackPlan);}if(m.dungeonRole==='seal')seals++;if(m.dungeonRole==='guard')guards++;}
 if(r.unlocked&&state.mobs.some(m=>(m.dungeonRole==='seal'||m.dungeonRole==='guard')&&m.hp>0))characterDataError('odomknutie bossa.');
 if(bosses!==1||seals!==3||guards!==DUNGEONS[r.dungeon].count)characterDataError('neúplná výprava.');
}
