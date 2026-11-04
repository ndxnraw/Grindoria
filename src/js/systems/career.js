function xpForLevel(level) {
  return Math.ceil(baseEnemyXP(level) * (24 + 1.6 * level));
}
function baseEnemyXP(level){return Math.max(6,Math.floor(6*Math.max(1,level)**1.15));}
function paragonCost(rank){return {shards:25*rank};}

// Enemy strength depends on actual level; location changes population, never hidden multipliers.
function enemyCombatStats(level,type='wolf',variant='normal'){
  const hp=50+12*level+.22*level*level,attack=8+2*level+.012*level*level;
  const v=ENEMY_VARIANTS[variant]||ENEMY_VARIANTS.normal,boss=type==='boss';
  return {hp:Math.round(hp*(boss?9*(variant==='rare'?1.6:1):v.hp)),attack:attack*(boss?2.5*(variant==='rare'?1.25:1):v.damage)/(boss?26:9)};
}
function migrateBalanceProfile(data){
  if(!data?.career||data.career.balanceVersion===2)return;
  const oldNeed=Math.ceil(600*data.level**2.15*(1+.025*(data.level-1)));
  data.xp=data.level===99?0:Math.floor(Math.min(.999999,Math.max(0,data.xp/oldNeed))*xpForLevel(data.level));
  for(const item of [...(data.bag||[]),...Object.values(data.equipped||{})])if(item&&item.rarity===0&&item.tier===1&&item.enhance===9&&['Začiatočnícky meč','Začiatočnícky luk','Začiatočnícke dýky','Začiatočnícky vejár'].includes(item.name))item.enhance=2;
  data.career.balanceVersion=2;
}
function repairLegacyWorld(data){
  for(const state of [...Object.values(data?.worldStates||{}),data?.career?.normalTemple])for(const m of state?.mobs||[])trimEnemySnapshot(m);
  for(const seen of Object.values(data?.discovery?.seen||{}))if(seen?.type==='stone'&&seen.armor===0&&METIN_TYPES[seen.metinType])seen.armor=metinStats(seen.level,seen.metinType).armor;
  for(const state of Object.values(data?.worldStates||{}))if(state?.events?.mapId==='suterland'&&state.events.active?.type==='bounty'){state.events.active=null;state.events.nextCheck=120;}
}

function initializeCareer() {
  migrateItemProfile(p,p.characterId||'legacy');repairLegacyWorld(p);migrateGameSystems(p);
  const old = p.career;
  if (!old || old.schema !== PROGRESSION.schema) {
    const progress = Math.max(0, Math.min(.999999, p.xp / (60 + (p.level - 1) * 35)));
    p.xp = Math.floor(progress * xpForLevel(p.level));
    // Carry the old account-wide forge bonus into an actual equipped weapon.
    const legacy = Math.max(0, Number(p.weapon) || 0);
    if (legacy) {
      p.equipped.weapon ??= { name: 'Pútnický meč', slot: 'weapon', rarity: 0, bonus: 0, value: 10 };
      p.equipped.weapon.enhance = Math.min(legacy, PROGRESSION.maxEnhancement);
      p.equipped.weapon.bonus = Math.max(0,p.equipped.weapon.bonus+legacy*8-enhancementBonus(p.equipped.weapon));
    }
    p.weapon = 0;
    p.career = {
      schema: PROGRESSION.schema, balanceVersion: 2, systemsVersion: 1,
      materials: Object.fromEntries(Object.keys(MATERIALS).map(id => [id, 0])),
      eligibleKills: (p.huntClaimed || 0) * 10, training: { strength: 0, vitality: 0, dexterity: 0, intelligence: 0 },
      skills: {}, skillUpgrades: 0,
      biology: { stage: 0, delivered: 0, nextKill: 0 },
      samplePity: {}, keyPity: 0,
      specialization: { focus: null, rank: 0, points: 0 },
      endgame: { highest: 0, paragon: 0, run: null }
    };
  }
  migrateBalanceProfile(p);
  for (const id of Object.keys(MATERIALS)) p.career.materials[id] ??= 0;
  initializeBiology();
  initializeDiscovery();
  initializeCrafting();
  initializeEconomy();
  initializeDungeons();
  initializePrestige();
  initializeWorldEvents();
  p.level = Math.max(1, Math.min(PROGRESSION.maxLevel, p.level));
  if (p.level === PROGRESSION.maxLevel) p.xp = 0;
  // World difficulty changed; preserve death timers/positions while scaling HP proportionally.
  for (const [id, state] of Object.entries(p.worldStates)) {
    if (MAPS[id] && state && !state.progressionSchema) {
      for (let i = 0; i < state.mobs.length; i++) rebalanceEnemy(state.mobs[i], MAPS[id], i);
      state.progressionSchema = PROGRESSION.schema;
    }
  }
}

function careerBonuses() {
  const b = { hp: 0, mp: 0, attack: 0, defense: 0, magic: 0, crit: 0, speed: 0, attackPercent: 0 };
  if (!p.career) return b;
  const add = bonus => { for (const [id, amount] of Object.entries(bonus)) b[id] += amount; };
  for (let i = 0; i < p.career.biology.stage; i++) add(BIOLOGY[i].bonus);
  const spec = p.career.specialization;
  if (spec.focus === 'ravager') add({ attackPercent: .015 * spec.rank, crit: .005 * spec.rank });
  if (spec.focus === 'sentinel') add({ hp: 15 * spec.rank, defense: 2 * spec.rank });
  if (spec.focus === 'mystic') add({ magic: 4 * spec.rank, mp: 8 * spec.rank });
  add({ attack: p.career.endgame.paragon * 2, hp: p.career.endgame.paragon * 5 });
  add(discoveryBonuses());
  add(prestigeBonuses());
  return b;
}

function enemyLevel(m) {
  return m.level || map().enemyLevel + (m.type === 'boss' ? 5 : m.type === 'stone' ? 2 : 0);
}

function rewardEligible(m) { return enemyLevel(m) >= p.level - 5; }

function enemyXP(m) {
  if (p.level >= PROGRESSION.maxLevel) return 0;
  const delta = enemyLevel(m) - p.level;
  const factor = delta >= 0 ? Math.min(1.5, 1 + delta * .05) : delta <= -8 ? 0 : [1, .85, .7, .55, .4, .25, .1, .05][-delta];
  const type = m.type === 'boss' ? 12 : m.type === 'stone' ? 3 : 1;
  const cap = m.type === 'boss' ? .35 : m.type === 'stone'||m.variant==='rare' ? .12 : m.variant==='elite' ? .08 : .06;
  return Math.max(0, Math.floor(Math.min(baseEnemyXP(enemyLevel(m)) * type * factor * (ENEMY_VARIANTS[m.variant]?.xp||1) * (m.metinParentId ? .35 : 1), needXP() * cap)));
}

function addMaterial(id, count = 1) {
  if (!MATERIALS[id] || !Number.isFinite(count) || count <= 0) return;
  p.career.materials[id] += Math.floor(count);
}

function pay(cost) {
  if (!cost || Object.values(cost).some(n => !Number.isSafeInteger(n) || n < 0)) return false;
  for (const [id, count] of Object.entries(cost)) {
    if (id === 'gold' ? p.gold < count : !MATERIALS[id] || p.career.materials[id] < count) return false;
  }
  for (const [id, count] of Object.entries(cost)) {
    if (id === 'gold') p.gold -= count;
    else p.career.materials[id] -= count;
  }
  return true;
}

function skillKey(index) { return p.schools[p.classId] + ':' + index; }

function skillProgress(key) {
  const [id, index] = String(key).split(':');
  if (!SCHOOLS[id] || !Number.isInteger(Number(index)) || Number(index) < 0 || Number(index) > 5) return null;
  return p.career.skills[key] ??= { rank: 1, practice: 0 };
}

function skillRankShort(rank){return rank<=20?String(rank):rank<=30?'M'+(rank-20):rank<=40?'G'+(rank-30):'P';}
function skillRankLabel(rank){return (rank<=20?'Normál ':rank<=30?'Majster ':rank<=40?'Veľmajster ':'Perfektný majster ')+skillRankShort(rank);}
function skillPowerSteps(rank){return rank<=20?(rank-1)*.5:rank<=30?10+rank-21:rank<=40?20+(rank-31)*1.5:35;}
function skillPracticeNeeded(rank){return rank<=20?10+rank*2:rank<=30?50+(rank-20)*4:90+(rank-30)*8;}
function skillAttackFactor(key){return 1+skillPowerSteps(skillProgress(key)?.rank||1)*.025;}
function skillFactor(key){return 1+skillPowerSteps(skillProgress(key)?.rank||1)*.04;}
function skillCooldownReduction(key){return Math.min(.35,skillPowerSteps(skillProgress(key)?.rank||1)*.01);}
function skillCost(key){const rank=skillProgress(key).rank;if(rank>=41)return {};if(rank<20)return {gold:20*rank};if(rank<30)return {books:1+Math.floor((rank-20)/2),gold:500+250*(rank-20)};return {soulStones:1+Math.floor((rank-30)/2),gold:2500*(rank-29)};}

function upgradeSkill(key) {
  const skill = skillProgress(key);
  if (!skill || !key.startsWith(p.schools[p.classId] + ':') || skill.rank >= PROGRESSION.maxSkillRank || skill.practice < skillPracticeNeeded(skill.rank)) return false;
  if (!pay(skillCost(key))) return false;
  skill.practice -= skillPracticeNeeded(skill.rank); skill.rank++;
  p.career.skillUpgrades++;
  if (p.career.skillUpgrades % 3 === 0) p.career.specialization.points++;
  save(); return true;
}

function rememberSkill(m, key) {
  if (!m || m.hp <= 0 || !skillProgress(key)) return;
  m.skillContributors ??= [];
  if (!m.skillContributors.includes(key)) m.skillContributors.push(key);
}

function specialize(id) {
  const spec = p.career.specialization;
  if (!SPECIALIZATIONS[id] || p.level < 10 || spec.focus || spec.points < 3) return false;
  spec.points -= 3; spec.focus = id; spec.rank = 1;
  save(); return true;
}

function trainSpecialization() {
  const spec = p.career.specialization;
  if (!spec.focus || spec.rank >= PROGRESSION.maxSpecialization || spec.points < spec.rank + 1) return false;
  spec.points -= spec.rank + 1; spec.rank++; save(); return true;
}

function careerKill(m) {
  const giveMaterial = (id, count = 1) => { if (m.type !== 'stone') dropMaterial(id, count, m); };
  const eligible = rewardEligible(m), c = p.career;
  dropBiologySample(m);
  if (eligible) {
    c.eligibleKills++; giveMaterial('essence', m.type === 'boss' ? 12 : m.type === 'stone' ? 4 : 1);
    if (c.eligibleKills % 5 === 0) { giveMaterial('ore',2); }
    if (m.type === 'stone' || m.type === 'boss') { giveMaterial('books'); giveMaterial('dust', m.type === 'boss' ? 5 : 1); }
    if(enemyLevel(m)>=35&&m.type==='boss'&&rand()<.2)giveMaterial('soulStones');
    const used = new Set(m.skillContributors || []);
    school().skills.forEach((s, i) => { if (active(s[1])) used.add(skillKey(i)); });
    for (const key of used) {
      const skill = skillProgress(key);
      if (skill && skill.rank < PROGRESSION.maxSkillRank) skill.practice = Math.min(skillPracticeNeeded(skill.rank) * 2, skill.practice + (m.type === 'boss' ? 4 : 1));
    }
    if (m.type === 'boss') {
      c.specialization.points++;
    }
  }
  if (m.type === 'boss'&&!m.dungeonBoss) {
    c.keyPity++;
    if (c.keyPity >= 3) { giveMaterial('keys'); c.keyPity = 0; }

  }
  const run = c.endgame.run;
  if (run?.active && p.mapId === 'temple' && m.riftId === run.id) {
    if (m.type === 'wolf') run.kills++;
    if (m.type === 'boss') run.bosses++;
  }
}

function rebalanceEnemy(m, cfg, index) {
  const ratio = Math.max(0, Math.min(1, m.hp / m.max));
  m.level = cfg.enemyLevel + (m.type === 'boss' ? 5 : m.type === 'stone' ? 2 : index % 5);
  const extra = m.level - cfg.enemyLevel;
  m.max = Math.round((m.type === 'boss' ? 620 : m.type === 'stone' ? 160 : 55) * cfg.scale * (1 + extra * .08));
  m.attackScale = cfg.scale * (1 + extra * .06);
  m.hp = ratio > 0 ? Math.max(1, Math.round(ratio * m.max)) : 0;
  m.skillContributors = [];
}

function enterRift() {
  const end = p.career.endgame;
  if (!nearNPC('dungeonMaster') || p.level < 35 || end.run || dungeonRun() || !canTravel()) return false;
  if (!pay({ keys: 3 })) return false;
  const tier = Math.min(PROGRESSION.maxRiftTier, end.highest + 1);
  loadMap('temple');
  snapshotMap();
  end.run = { id: (p.career.riftSerial = (p.career.riftSerial || 0) + 1), tier, kills: 0, bosses: 0, active: true };
  // Separate expedition enemies from the ordinary map snapshot.
  p.career.normalTemple = p.worldStates.temple;
  suspendWorldEvents();
  drops.length = 0;
  mobs.forEach(m => {
    applyRiftScaling(m, tier, end.run.id);
    m.dead = 0; m.cd = 2; m.stun = 0; m.dot = null; m.dots=[]; m.skillContributors = [];
    m.taunt = 0; m.engaged = 0;
    m.x = m.homeX ?? (m.type === 'boss' ? 1690 : m.x);
    m.y = m.homeY ?? (m.type === 'boss' ? 330 : m.y);
  });
  save(); return true;
}

function finishRift(claim = true) {
  const end = p.career.endgame, run = end.run;
  if (!run || (claim && (run.kills < 20 || run.bosses < 1))) return false;
  if (claim) { addMaterial('shards', 10 + run.tier * 3); end.highest = Math.max(end.highest, run.tier); }
  end.run = null;
  const ordinary = p.career.normalTemple || {};
  p.worldStates.temple = { ...ordinary, drops: [...(ordinary.drops || []), ...drops.map(cloneGroundDrop)] };
  delete p.career.normalTemple;
  // Do not overwrite the ordinary snapshot with expedition enemies on exit.
  mobs.length = 0; drops.length = 0; Object.assign(p,MAPS[p.mapId].entry);
  travelCombat.time=0;loadMap('town');p.x=NPCS.dungeonMaster.x;p.y=NPCS.dungeonMaster.y+60;cam.x=p.x;cam.y=p.y;save(); return true;
}

function upgradeParagon() {
  const end = p.career.endgame, rank = end.paragon + 1;
  if (p.level < 35 || end.paragon >= PROGRESSION.maxParagon || !pay(paragonCost(rank))) return false;
  end.paragon++; save(); return true;
}

