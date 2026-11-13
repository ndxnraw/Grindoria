let castingMultiplier=1;
const combatFlow={lastKey:null,time:0,name:'',flash:0,basicTarget:null,basicHits:0,basicTime:0,rhythm:0};

function schoolId() { return p.schools[p.classId]; }
function passiveRank() { return p.level<10?0:p.level<25?1:p.level<50?2:p.level<75?3:4; }

function passiveBonuses() {
  const b={outgoing:{},resist:{},crit:0,mp:0,heal:0,manaRegen:0},rank=passiveRank();
  if(!rank)return b;
  switch(schoolId()){
    case 'body':b.outgoing.physical=.03*rank;break;
    case 'mental':b.resist.physical=.04+.02*rank;break;
    case 'blade':b.crit=.01*rank;b.resist.poison=.06*rank;break;
    case 'archery':b.outgoing.piercing=.04*rank;break;
    case 'weapon':b.outgoing.dark=.03*rank;b.resist.physical=.02*rank;break;
    case 'black':b.resist.dark=.05*rank;b.mp=15*rank;break;
    case 'dragon':b.outgoing.fire=.04*rank;b.resist.fire=.04*rank;break;
    case 'healing':b.resist.lightning=.04*rank;b.heal=.04*rank;b.manaRegen=.5*rank;break;
  }
  return b;
}

function enemyResistances(m) {
  const source=m.type==='stone'?(METIN_RESISTS[m.metinType]||{}):(CREATURE_RESISTS[m.skin||'wolf']||{});
  return Object.fromEntries(Object.keys(DAMAGE_TYPES).map(type=>{
    let value=Object.hasOwn(m.resistances||{},type)?m.resistances[type]:(source[type]||0)+(m.type==='boss'?.1:0);
    if(m.suppressed>0&&value>0)value=Math.max(0,value-.15);
    return [type,Math.max(-.5,Math.min(.75,Number(value)||0))];
  }));
}

function playerResistances() {
  const gear=equipmentBonuses(),passive=passiveBonuses();
  return Object.fromEntries(Object.keys(DAMAGE_TYPES).map(type=>[type,Math.max(-.5,Math.min(.75,(gear[type+'Resist']||0)+(!['physical','piercing'].includes(type)?gear.magicResist:0)+(passive.resist[type]||0)+(prestigeRank()===5?.05:0)))]));
}

// Skill power favors equipment over innate level/attribute damage; enemy level is not a damage gate.
function magicPower(gear=equipmentBonuses(),career=careerBonuses()){return p.intelligence*BATTLE.magicPerIntelligence+career.magic+gear.magic*BATTLE.skillGearScale;}
function skillAttackPower(type){
 const gear=equipmentBonuses(),career=careerBonuses();
 const base=18+((p.level-1)*2+p.strength*3)*BATTLE.skillAttributeScale+gear.attack*BATTLE.skillGearScale+career.attack;
 return base*attackPower()*(1+career.attackPercent)+(!['physical','piercing'].includes(type)?magicPower(gear,career):0);
}

function resolveEnemyDamage(m,amount,type='physical',penetrated=false) {
  if(!Number.isFinite(amount)||amount<=0)return 0;
  return Math.max(1,Math.round(amount*(1-(penetrated?Math.min(0,enemyResistances(m)[type]||0):(enemyResistances(m)[type]||0)))));
}

function enemyDamageType(m) { return m?.damageType|| (m?.skin==='scorpion'?'poison':m?.skin==='demon'?'fire':'physical'); }
function basicDamageType() { return rangedBasic()?'piercing':'physical'; }
function skillDamageType(key) { return ACTIVE_SKILLS[key]?.type||'arcane'; }
function percentItemStat(stat) { return ['crit','maxHpPercent','skillDamage','skillHaste','monsterDamage','hpRegen','manaSteal','bonusExp'].includes(stat)||Boolean(ITEM_AFFIXES[stat]?.percent)||stat.endsWith('Resist'); }

function resetCombatFlow() {
  combatAssist.aimTime = 0;
  clearCombatTarget();Object.assign(combatFlow,{lastKey:null,time:0,name:'',flash:0,basicTarget:null,basicHits:0,basicTime:0,rhythm:0});castingMultiplier=1;playerMoving=false;
}

function updateCombatFlow(dt) {
  for(const key of ['time','flash','basicTime','rhythm'])combatFlow[key]=Math.max(0,combatFlow[key]-dt);
  if(!combatFlow.time)combatFlow.lastKey=null;
  if(!combatFlow.basicTime){combatFlow.basicTarget=null;combatFlow.basicHits=0;}
}

function registerBasicHit(m) {
  if(schoolId()!=='body'||!passiveRank())return;
  if(combatFlow.basicTarget!==m){combatFlow.basicTarget=m;combatFlow.basicHits=0;}
  combatFlow.basicHits++;combatFlow.basicTime=3;
  if(combatFlow.basicHits>=3){combatFlow.basicHits=0;combatFlow.rhythm=5;float('BOJOVÝ RYTMUS',p.x,p.y-95,'#ead19b');}
}

function beginSkillFlow(index) {
  const id=schoolId(),key=id+':'+index,combo=SCHOOL_COMBOS[id],meta=ACTIVE_SKILLS[key];let multiplier=1;
  if(combatFlow.time>0&&combatFlow.lastKey===id+':'+combo.sequence[0]&&index===combo.sequence[1]){
    multiplier+=combo.bonus;combatFlow.name=combo.name;combatFlow.flash=2;combatFlow.lastKey=null;combatFlow.time=0;
    float('KOMBO · '+combo.name,p.x,p.y-115,'#f1cf8d',true);fx('comboBurst',p.x,p.y,'#efd09b',.7);
  }else{combatFlow.lastKey=key;combatFlow.time=BATTLE.comboWindow;}
  if(meta.type&&combatFlow.rhythm>0){multiplier+=.1+.03*passiveRank();combatFlow.rhythm=0;}
  return multiplier;
}

function animateAbility(index) {
  const key=skillKey(index),meta=ACTIVE_SKILLS[key],color=meta.type?DAMAGE_TYPES[meta.type].color:role().color;
  effects.push({style:'skillSigil',x:p.x,y:p.y,color,life:.8,total:.8,angle:face,ability:key,school:schoolId(),slot:index});
}

function applyDamageOverTime(m,kind,power,key=null) {
  if(m.hp<=0)return;
  m.dots??=[];let dot=m.dots.find(dot=>dot.kind===kind);
  if(dot){dot.time=6;dot.power=Math.max(dot.power,power);dot.key=key||dot.key;}
  else m.dots.push({kind,time:6,tick:1,power,key});
}

function updateDamageOverTime(m,dt) {
  if(m.dot){m.dots??=[];if(!m.dots.some(d=>d.kind===m.dot.kind))m.dots.push({...m.dot});m.dot=null;}
  if(m.hp<=0)return;
  for(const dot of m.dots||[]){
    const activeTime=Math.min(dt,dot.time);dot.time=Math.max(0,dot.time-dt);dot.tick-=activeTime;
    while(dot.tick<=0&&m.hp>0){dot.tick+=1;if(dot.key)rememberSkill(m,dot.key);hit(m,dot.power,dot.kind);fx(dot.kind==='poison'?'poison':'fire',m.x,m.y,DAMAGE_TYPES[dot.kind]?.color||'#cfb481',.4);}
  }
  m.dots=(m.dots||[]).filter(dot=>dot.time>0);
}

function cloneEnemyState(m) { return {...m,dot:m.dot?{...m.dot}:null,dots:(m.dots||[]).map(d=>({...d})),skillContributors:[...(m.skillContributors||[])],...(m.attackPlan?{attackPlan:{...m.attackPlan}}:{})}; }

function applyCombatControl(m,opts,x=p.x,y=p.y) {
  if(m.hp<=0)return;
  if(opts.stun)m.stun=Math.max(m.stun||0,opts.stun*(m.type==='boss'?.4:1));
  if(opts.dot)applyDamageOverTime(m,opts.dot,Math.max(3,Math.round(skillAttackPower(opts.dot)*.18*BATTLE.skillDamageScale*skillAttackFactor(opts.skillKey||castingSkillKey||'invalid')*(opts.multiplier||castingMultiplier)*(1+(passiveBonuses().outgoing[opts.dot]||0)))),opts.skillKey||castingSkillKey);
  if(opts.knock&&m.type!=='stone'){const d=Math.hypot(m.x-x,m.y-y)||1;m.x=Math.max(45,Math.min(SIZE-45,m.x+(m.x-x)/d*45));m.y=Math.max(45,Math.min(SIZE-45,m.y+(m.y-y)/d*45));}
}

function segmentHit(m,x1,y1,x2,y2) {
  const dx=x2-x1,dy=y2-y1,length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((m.x-x1)*dx+(m.y-15-y1)*dy)/length)):0;
  const radius=m.type==='stone'?32:m.type==='boss'?32:20;
  return Math.hypot(m.x-(x1+dx*t),m.y-15-(y1+dy*t))<=radius?t:null;
}

function impactShot(b,m) {
  if(b.opts.sharedHits)b.opts.sharedHits.add(m);
  if(b.opts.basic){hurtMob(m,b.mult,false,null,b.opts);for(const other of mobs)if(other!==m&&other.hp>0&&Math.hypot(other.x-m.x,other.y-m.y)<=BATTLE.basicSplashRadius)hurtMob(other,b.mult*BATTLE.basicSplashMultiplier,false,null,{...b.opts,markTarget:false});}
  else if(b.opts.radius)areaHit(m.x,m.y,b.opts.radius,b.mult,{...b.opts,type:b.opts.type});
  else{hurtMob(m,b.mult,!['physical','piercing'].includes(b.opts.type),b.opts.skillKey,b.opts);applyCombatControl(m,b.opts);}
  if(b.opts.dispel)m.suppressed=8;
  if(b.opts.slow)m.slow=b.opts.slow;
  fx(b.style==='darkOrb'?'dark':b.style==='fireArrow'?'fire':'impact',m.x,m.y,b.color,.6);
}

function updateShots(dt) {
  for(let i=shots.length-1;i>=0;i--){
    const b=shots[i];
    if(b.opts.delay>0){b.opts.delay=Math.max(0,b.opts.delay-dt);continue;}
    b.life-=dt;if(b.life<=0||b.target&&b.target.hp<=0){shots.splice(i,1);continue;}
    const step=Math.min(650*dt,b.remainingRange),oldX=b.x,oldY=b.y;
    if(b.target){const dx=b.target.x-b.x,dy=b.target.y-15-b.y,d=Math.hypot(dx,dy);b.vx=dx/(d||1);b.vy=dy/(d||1);if(d<=step+12){impactShot(b,b.target);shots.splice(i,1);continue;}}
    b.x+=b.vx*step;b.y+=b.vy*step;b.remainingRange-=step;
    if(!b.target){
      const hits=mobs.filter(m=>m.hp>0&&!b.opts.sharedHits?.has(m)).map(m=>({m,t:segmentHit(m,oldX,oldY,b.x,b.y)})).filter(hit=>hit.t!==null).sort((a,b)=>a.t-b.t);
      if(hits.length){impactShot(b,hits[0].m);shots.splice(i,1);continue;}
    }
    if(b.remainingRange<=0)shots.splice(i,1);
  }
}
