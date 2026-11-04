function dashDestination(point) {
  const desired={x:Math.max(45,Math.min(SIZE-45,point.x)),y:Math.max(45,Math.min(SIZE-45,point.y))};
  if(!isSanctuary(desired))return desired;
  let low=0,high=1;
  for(let i=0;i<20;i++){const t=(low+high)/2,at={x:p.x+(desired.x-p.x)*t,y:p.y+(desired.y-p.y)*t};if(isSanctuary(at))high=t;else low=t;}
  return{x:p.x+(desired.x-p.x)*low,y:p.y+(desired.y-p.y)*low};
}

function castSkill(index) {
  if(!running||paused||p.hp<=0||!Number.isInteger(index)||index<0||index>5)return false;
  const s=school().skills[index],[name,kind,cd,cost,mult,range]=s,support=SUPPORT_SKILLS.has(kind),key=skillKey(index),type=skillDamageType(key);
  if(isSanctuary(p)&&!support){toast('V bezpečnej zóne nemožno útočiť.');return false;}
  if(spellCD[index]>0)return false;
  if(p.mp<cost){toast('Nedostatok many · priebežne sa obnovuje.');return false;}
  updateFacing(!support);const m=support?selectedEnemy():aimEnemy(range||500,true);
  const radial=['spin','stomp','poisonCloud','dragonSpin','flameBurst','dragonRoar','burst'];
  if(!support&&!radial.includes(kind)&&selectedEnemy()&&!m){toast('Označený cieľ je mimo dosahu schopnosti.');return false;}
  if(kind==='ambush'&&!m){toast('Prepad potrebuje blízky cieľ pred tebou.');return false;}
  if(kind==='burst'&&p.hp<=maxHP()*.08){toast('Na Životnú silu potrebuješ viac zdravia.');return false;}
  p.mp-=cost;castingSkillKey=key;castingMultiplier=beginSkillFlow(index);
  if(m)rememberSkill(m,key);
  spellCD[index]=cd*(1-(skillProgress(key).rank-1)*.01);skillCD=spellCD[0];castPose=.6;castStyle=kind;
  if(!support){combatAssist.aimTime=.6;travelCombat.time=WORLD_RULES.travelCooldown;}
  animateAbility(index);beep(p.classId==='sura'?160:p.classId==='shaman'?620:320,.17);float(name,p.x,p.y-100,role().color);
  const opts={skillKey:key,type,multiplier:castingMultiplier};
  if(support&&kind!=='heal'){
    buffs[kind]=(kind==='fear'||kind==='berserk'?10:kind==='stealth'?8:12)*skillFactor(key);
    if(kind==='spirit')spiritTick=0;
    fx(kind==='stealth'?'smoke':'aura',p.x,p.y,role().color,1.1);
  }else if(kind==='heal'){
    const amount=Math.round((45+p.level*5+p.intelligence*4+careerBonuses().magic+equipmentBonuses().magic)*skillFactor(key)*(1+passiveBonuses().heal)*castingMultiplier);
    const healed=Math.min(maxHP()-p.hp,amount);p.hp+=healed;fx('heal',p.x,p.y,'#b4f4c1',1);float('+'+healed+' zdravia',p.x,p.y-65,'#b4f4c1');
  }else if(['dash','poisonDash','roll'].includes(kind)){
    const point=m?{x:m.x,y:m.y}:aimedPoint(range),d=Math.hypot(point.x-p.x,point.y-p.y)||1,travel=Math.max(0,Math.min(range,d-(m?40:0))),old={x:p.x,y:p.y};
    const destination=dashDestination({x:p.x+(point.x-p.x)/d*travel,y:p.y+(point.y-p.y)/d*travel});p.x=destination.x;p.y=destination.y;
    fx('dash',old.x,old.y,role().color,.5);fx(kind==='roll'?'spin':'slash');
    if(!isSanctuary(p))areaHit(p.x,p.y,kind==='roll'?155:90,mult,{...opts,dot:kind==='poisonDash'?'poison':null,stun:kind==='dash'?.8:0});
  }else if(kind==='ambush'){
    hurtMob(m,mult*(active('stealth')?2:1),false,key,opts);fx('cross',m.x,m.y,role().color,.6);
  }else if(['darkBolt','darkOrb','spiritBolt','fireArrow','poisonArrow','talisman','boltStun','dispel'].includes(kind)){
    shoot(m,mult,kind,{...opts,range,radius:kind==='darkOrb'?100:kind==='fireArrow'?80:0,dot:kind==='poisonArrow'?'poison':kind==='fireArrow'?'fire':null,stun:kind==='boltStun'?1.8:0,slow:kind==='spiritBolt'?4:0,dispel:kind==='dispel'});
  }else if(kind==='multiShot'){
    for(let j=0;j<3;j++)shoot(m,mult/3,'arrow',{...opts,range,delay:j*.12});
  }else if(kind==='arrowRain'){
    const candidates=mobs.filter(n=>enemyInArc(n,range,face,1.25)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,5),sharedHits=new Set();
    if(candidates.length)for(const enemy of candidates)shoot(enemy,mult,'arrow',{...opts,range,sharedHits});
    else for(let j=0;j<5;j++)shoot(null,mult,'arrow',{...opts,range,angle:face+(j-2)*.13,sharedHits});
  }else if(['lightning','spark','storm','chain'].includes(kind)){
    const anchor=m||aimedPoint(range),list=kind==='chain'&&m?[m,...mobs.filter(n=>n!==m&&n.hp>0&&Math.hypot(n.x-m.x,n.y-m.y)<220).sort((a,b)=>Math.hypot(a.x-m.x,a.y-m.y)-Math.hypot(b.x-m.x,b.y-m.y)).slice(0,3)]:[anchor];
    for(const n of list){fx('lightning',n.x,n.y,DAMAGE_TYPES[type].color,.7);if(kind==='storm')areaHit(n.x,n.y,140,mult,{...opts,stun:.8});else if(n.hp>0){hurtMob(n,mult,true,key,opts);if(kind==='spark')n.stun=1;}}
  }else if(kind==='ground'){
    const at=m||aimedPoint(range);fx('ground',at.x,at.y,role().color,.9);areaHit(at.x,at.y,140,mult,{...opts,knock:true});
  }else if(['beam','dragonBreath','finger','cleave'].includes(kind)){
    fx(kind==='dragonBreath'?'dragon':kind==='finger'?'finger':'beam',p.x,p.y,DAMAGE_TYPES[type].color,.8);
    const ux=Math.cos(face),uy=Math.sin(face);
    for(const n of mobs){const dx=n.x-p.x,dy=n.y-p.y,along=dx*ux+dy*uy,across=Math.abs(dx*uy-dy*ux);
      if(n.hp>0&&along>=0&&along<=range&&across<(kind==='dragonBreath'?100:65)){hurtMob(n,mult,!['physical','piercing'].includes(type),key,opts);applyCombatControl(n,{...opts,dot:kind==='dragonBreath'?'fire':null,knock:kind==='cleave'});}}
  }else if(kind==='triple'){
    for(let j=0;j<3;j++){if(m)hurtMob(m,mult/3,false,key,opts);fx('slash',p.x,p.y,role().color,.35+j*.13,face+(j-1)*.2);}
  }else{
    if(kind==='burst')p.hp-=maxHP()*.08;
    fx(kind==='poisonCloud'?'poison':kind==='dragonRoar'?'dragon':kind==='flameBurst'?'fire':kind==='stomp'||kind==='burst'?'ground':'spin',p.x,p.y,DAMAGE_TYPES[type].color,.85);
    areaHit(p.x,p.y,range,mult,{...opts,dot:kind==='poisonCloud'?'poison':kind==='dragonRoar'||kind==='flameBurst'?'fire':null,stun:kind==='stomp'?1.7:0,knock:kind==='dragonSpin'});
  }
  if(kind!=='stealth')delete buffs.stealth;
  castingSkillKey=null;castingMultiplier=1;updateHUD();return true;
}

function attack(skill=false) {
  if(skill)return castSkill(0);
  if(!running||paused||p.hp<=0||attackCD>0||isSanctuary(p))return false;
  travelCombat.time=WORLD_RULES.travelCooldown;updateFacing(true);combatAssist.aimTime=.22;const fighting=selectedEnemy();if(fighting&&Math.hypot(fighting.x-p.x,fighting.y-p.y)<=basicAttackRange())registerPlayerCombat(fighting);attackCD=Math.max(.16,(p.classId==='ninja'?.32:.42)*(active('berserk')?.6:1)/(1+itemAttackSpeed()));slash=.22;castStyle='basic';
  if(rangedBasic())shoot(selectedEnemy()&&Math.hypot(target.x-p.x,target.y-p.y)<=BATTLE.rangedRange?target:null,1,'arrow',{basic:true,type:'piercing',range:BATTLE.rangedRange,skillKey:null,multiplier:1,markTarget:Boolean(keys[' '])});
  else{
    fx(p.classId==='ninja'?'cross':p.classId==='shaman'?'fan':'slash',p.x,p.y,role().color,.25,face);
    let marked=null;
    for(const m of mobs)if(m.hp>0&&(Math.hypot(m.x-p.x,m.y-p.y)<=BATTLE.basicCleaveRadius||enemyInArc(m,BATTLE.meleeRange))){
      const actual=hurtMob(m,1,false,null,{basic:true,type:'physical',multiplier:1});
      if(keys[' ']&&actual>0&&m.hp>0&&(!marked||Math.hypot(m.x-p.x,m.y-p.y)<Math.hypot(marked.x-p.x,marked.y-p.y)))marked=m;
    }
    if(marked)markManualCombatHit(marked);
  }
  delete buffs.stealth;beep(230);return true;
}
