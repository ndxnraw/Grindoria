function hit(m, amount, type='physical',penetrated=false) {
  if (m.hp <= 0 || !Number.isFinite(amount) || amount <= 0) return 0;
  if(m.dungeonBoss&&!dungeonUnlocked()){toast('Najprv poraz strážcov a znič tri pečate.');return 0;}
  const damage = m.type === 'stone' ? metinDamage(m, amount, type,penetrated) : resolveEnemyDamage(m, amount, type,penetrated), actual = Math.min(m.hp, damage);
  travelCombat.time=WORLD_RULES.travelCooldown;registerPlayerCombat(m);
  if (m.type === 'stone') registerMetinAttack(m); else provokeEnemyGroup(m);
  m.hp = Math.max(0, m.hp - damage); m.hit = .15;
  float('-' + actual, m.x, m.y - 65); beep(170);
  if (m.hp <= 0) {
    if(target===m)clearCombatTarget();m.dot=null;m.dots=[];
    m.windup = 0; m.dead = m.metinParentId ? 1 : m.respawnSeconds || (m.type === 'boss' ? 40 : m.type === 'stone' ? 18 : 8);
    if(m.dungeonSeal){dungeonUnlocked();return actual;}
    if (m.type === 'boss') p.bossKills++; else p[m.type === 'stone' ? 'stones' : 'kills']++;
    recordCharacterKill(m);
    const gained = enemyXP(m); careerKill(m);prestigeKill(m);dropForgeSupplies(m);dropCraftMaterials(m);
    if (m.type === 'stone') { m.metinCombat = 0; m.metinWaveTimer = 0; dropMetinLoot(m);for(const guard of mobs.filter(guard=>guard.hp>0&&guard.metinParentId===m.spawnId&&guard.metinGeneration===m.metinGeneration))hit(guard,guard.hp,'arcane',true); }
    else {
      dropEnemyLoot(m);
    }
    dropCatalogLoot(m);
    if(m.dungeonBoss)dungeonBossReward(m);
    experience(gained);worldEventKill(m);
    float(gained ? '+' + gained + ' EXP' : 'Slabý cieľ · bez EXP', m.x, m.y - 85, gained ? '#d6c28c' : '#8e9f92');
    if (m.type === 'boss'&&!m.dungeonBoss&&!m.worldEventId) toast('Strážca padol! Korisť leží na zemi · klikni alebo Y.');
    else if (!m.worldEventId&&!p.claimed && p.kills >= 5 && p.stones >= 3) toast('Úloha splnená! Vyzdvihni si odmenu.');
  }
  return actual;
}

function potion(){return drinkPotion(false);}

function potionCooldownRemaining(now = Date.now()) { return Math.max(0, ((p.potionReadyAt || 0)-now)/1000); }

function drinkPotion(allowPaused=false) {
  if(!running||(paused&&!allowPaused)||p.hp<=0)return false;
  if(potionCooldownRemaining()>0){toast('Elixír bude pripravený o '+Math.ceil(potionCooldownRemaining())+' s.');return false;}
  if(p.potions<=0){toast('Nemáš elixíry. Navštív obchodníka (F).');return false;}
  if(p.hp>=maxHP()){toast('Zdravie máš plné.');return false;}
  const healed=Math.min(POTION_RULES.heal,maxHP()-p.hp);
  p.potions--;p.hp+=healed;p.potionReadyAt=Date.now()+POTION_RULES.cooldown*1000;
  float('+'+Math.round(healed)+' zdravia',p.x,p.y-65,'#a9e0ac');beep(520,.2);updateHUD();save();return true;
}

function death(){resetDungeonBoss();resetCombatFlow();p.mp=maxMP();shots.length=0;Object.keys(buffs).forEach(k=>delete buffs[k]);p.gold=Math.floor(p.gold*.9);Object.assign(p,map().entry);p.hp=maxHP();target=null;mobs.forEach(m=>m.cd=2);toast('Návrat do bezpečnej zóny\nStratil si 10 % zlata.');save();}

function school(){return SCHOOLS[p.schools[p.classId]];}

function active(id){return (buffs[id]||0)>0;}

function maxMP(){return 100+p.level*8+p.intelligence*5+careerBonuses().mp+equipmentBonuses().mp+passiveBonuses().mp;}

function attackPower(){return (active('aura')||active('enchanted')?1.45:1)*(active('attackUp')?1.35:1);}

function armorBonus(){return active('guard')?12:active('armor')?8:0;}

function speedValue(){return dungeonSpeedFactor()*(role().speed+p.dexterity*2+equipmentBonuses().speed+careerBonuses().speed)*(active('speed')?1.45:active('berserk')?1.22:1);}

function criticalChance(){return Math.min(.8,role().crit+p.dexterity*.01+careerBonuses().crit+equipmentBonuses().crit+passiveBonuses().crit+(active('dragonPower')?.25:0));}

function nearest(range=500,from=p){if(!(range>0))return undefined;let best,minimum=range*range;for(const m of mobs){if(m.hp<=0)continue;const dx=m.x-from.x,dy=m.y-from.y,distance=dx*dx+dy*dy;if(distance<minimum){minimum=distance;best=m;}}return best;}

function hurtMob(m,mult=1,magic=false,key=castingSkillKey,opts={}) {
  if(!m||m.hp<=0)return 0;if(key)rememberSkill(m,key);
  const type=opts.type||(key?skillDamageType(key):magic?'arcane':basicDamageType()),critical=rand()<criticalChance(),multiplier=opts.multiplier??castingMultiplier;
  const magicBonus=!['physical','piercing'].includes(type)?p.intelligence*4+careerBonuses().magic+equipmentBonuses().magic:0;
  const pierced=penetrationChance()>0 && rand()<penetrationChance();
  const raw=(damage()+magicBonus)*mult*(key?skillFactor(key):1)*multiplier*(1+(passiveBonuses().outgoing[type]||0))*(critical?1.8:1)*(1+enemyGearBonus(m));
  const actual=hit(m,Math.max(1,Math.round(raw*(.94+rand()*.12))),type,pierced);
  if(actual>0&&opts.basic)registerBasicHit(m);
  if(actual>0&&opts.basic&&opts.markTarget)markManualCombatHit(m);
  if(active('enchanted'))p.hp=Math.min(maxHP(),p.hp+actual*.15);
  if(pierced&&actual>0)float('PRENIKAVÝ!',m.x,m.y-103,'#a9e5e0');
  if(critical&&actual>0)float('KRITICKÝ!',m.x,m.y-90,'#f2bc70');return actual;
}

function areaHit(x,y,r,mult,opts={}) {
  const key=opts.skillKey||castingSkillKey,type=opts.type||(key?skillDamageType(key):'arcane');
  for(const m of mobs)if(m.hp>0&&Math.hypot(m.x-x,(m.y-y)*.85)<r){hurtMob(m,mult,!['physical','piercing'].includes(type),key,{...opts,type});applyCombatControl(m,opts,x,y);}
}

function shoot(m,mult,style='bolt',opts={}) {
  const key=Object.hasOwn(opts,'skillKey')?opts.skillKey:castingSkillKey,type=opts.type||(key?skillDamageType(key):SKILL_DAMAGE[style]||(style==='arrow'?'piercing':'arcane'));
  const angle=opts.angle??(m?Math.atan2(m.y-p.y,m.x-p.x):face),range=opts.range||500;
  const ballistic=style==='arrow'||style.includes('Arrow');
  shots.push({x:p.x,y:p.y-25,target:ballistic?null:m,mult,style,color:DAMAGE_TYPES[type].color,opts:{...opts,type,skillKey:key,multiplier:opts.multiplier??castingMultiplier},life:range/650+1,remainingRange:range,vx:Math.cos(angle),vy:Math.sin(angle)});
  fx('cast',p.x,p.y,DAMAGE_TYPES[type].color,.35);return true;
}

function takeDamage(amount,source,type=enemyDamageType(source)) {
  let factor=active('bless')?.7:1;if(active('guard'))factor*=.8;
  if(active('darkGuard')&&p.mp>=4){factor*=.67;p.mp=Math.max(0,p.mp-4);}
  if(active('berserk'))factor*=1.2;if(active('fear')&&source&&Math.hypot(source.x-p.x,source.y-p.y)<300)factor*=.65;
  const armorFactor=type==='physical'?1:type==='piercing'?.6:.25;
  const n=Math.max(1,Math.round((amount-defense()*armorFactor)*factor*(1-(playerResistances()[type]||0))));
  if(source)registerPlayerCombat(source);
  travelCombat.time=WORLD_RULES.travelCooldown;p.hp-=n;float('-'+n,p.x,p.y-70,DAMAGE_TYPES[type]?.color||'#eda28d');
  if(source&&(active('reflect')||active('armor'))&&source.hp>0)hit(source,Math.max(1,Math.round(n*(active('reflect')?.35:.2))),'arcane');
  return n;
}

function updateCombat(dt) {
  updateCombatFlow(dt);castPose=Math.max(0,castPose-dt);for(let i=0;i<6;i++)spellCD[i]=Math.max(0,spellCD[i]-dt);skillCD=spellCD[0];
  for(const id of Object.keys(buffs)){buffs[id]-=dt;if(buffs[id]<=0)delete buffs[id];}
  p.mp=Math.min(maxMP(),p.mp+dt*((active('speed')&&schoolId()==='healing'?11:7)+passiveBonuses().manaRegen));
  for(let i=effects.length-1;i>=0;i--){effects[i].life-=dt;if(effects[i].life<=0)effects.splice(i,1);}
  for(const m of mobs){m.stun=Math.max(0,(m.stun||0)-dt);m.slow=Math.max(0,(m.slow||0)-dt);m.suppressed=Math.max(0,(m.suppressed||0)-dt);updateDamageOverTime(m,dt);}
  updateShots(dt);
  if(active('spirit')&&!isSanctuary(p)){spiritTick-=dt;if(spiritTick<=0){spiritTick=1.5;const m=nearest(430);if(m)shoot(m,.85,'fireArrow',{skillKey:'black:3',type:'fire',multiplier:1});}}
}

function updateSingleBoss(b,dt,safe){if(!b||b.hp<=0||b.stun>0)return;if(b.dungeonBoss){updateDungeonBoss(b,dt,safe);return;}const d=Math.hypot(b.x-p.x,b.y-p.y);if(safe||(!(b.taunt>0||b.engaged>0)&&d>500)||active('stealth')){b.windup=0;b.taunt=0;b.engaged=0;const home=Math.hypot(b.x-b.homeX,b.y-b.homeY);if(home>4)walkEnemy(b,b.homeX,b.homeY,90,dt);b.hp=Math.min(b.max,b.hp+10*dt);return;}const enraged=b.hp<b.max*.3&&!(b.suppressed>0);if(b.windup>0){b.windup-=dt;if(b.windup<=0){b.cd=enraged?2:3;if(d<120){takeDamage(Math.round(26*(b.attackScale||map().scale)*(enraged?1.3:1)),b);beep(90,.25);}else float('ÚHYB!',p.x,p.y-75,'#acd9b0');}return;}if(d<100&&b.cd<=0){b.windup=1;beep(100,.2);return;}if(d>65){const speed=(enraged?115:90)*(b.slow>0?.55:1)*(active('fear')?.65:1);walkEnemy(b,p.x,p.y,speed,dt);}}


function updateBoss(dt,safe){for(const boss of mobs)if(boss.type==='boss'&&boss.hp>0)updateSingleBoss(boss,dt,safe);}
