function xpForLevel(level) {
  return Math.ceil(600 * Math.pow(level, 2.15) * (1 + .025 * (level - 1)));
}

function initializeCareer() {
  const old = p.career;
  if (!old || old.schema !== PROGRESSION.schema) {
    const progress = Math.max(0, Math.min(.999999, p.xp / (60 + (p.level - 1) * 35)));
    p.xp = Math.floor(progress * xpForLevel(p.level));
    // Carry the old account-wide forge bonus into an actual equipped weapon.
    const legacy = Math.max(0, Number(p.weapon) || 0);
    if (legacy) {
      p.equipped.weapon ??= { name: 'Pútnický meč', slot: 'weapon', rarity: 0, bonus: 0, value: 10 };
      p.equipped.weapon.enhance = Math.min(legacy, PROGRESSION.maxEnhancement);
      p.equipped.weapon.bonus += legacy * 8 - p.equipped.weapon.enhance * 3;
    }
    p.weapon = 0;
    p.career = {
      schema: PROGRESSION.schema,
      materials: Object.fromEntries(Object.keys(MATERIALS).map(id => [id, 0])),
      eligibleKills: (p.huntClaimed || 0) * 10, training: { strength: 0, vitality: 0, dexterity: 0, intelligence: 0 },
      skills: {}, skillUpgrades: 0,
      biology: { stage: 0, delivered: 0, nextKill: 0 },
      alchemy: { stock: { ruby: 0, sapphire: 0, jade: 0 }, equipped: { ruby: 0, sapphire: 0, jade: 0 } },
      collection: {}, relicPity: {}, samplePity: {}, keyPity: 0,
      specialization: { focus: null, rank: 0, points: 0 },
      endgame: { highest: 0, paragon: 0, run: null }
    };
  }
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
  const b = { hp: 0, mp: 0, attack: 0, defense: 0, magic: 0, crit: 0, attackPercent: 0 };
  if (!p.career) return b;
  const add = bonus => { for (const [id, amount] of Object.entries(bonus)) b[id] += amount; };
  for (let i = 0; i < p.career.biology.stage; i++) add(BIOLOGY[i].bonus);
  const gems = p.career.alchemy.equipped;
  add({ attack: 2 * gems.ruby ** 2, mp: 15 * gems.sapphire, magic: 2 * gems.sapphire, hp: 10 * gems.jade, defense: gems.jade });
  const relics = Object.keys(p.career.collection).filter(id => p.career.collection[id] && RELICS[id]);
  relics.forEach(id => add(RELICS[id].bonus));
  if (relics.length >= 2) add({ defense: 2 });
  if (relics.length === 4) add({ attack: 8, hp: 15 });
  const spec = p.career.specialization;
  if (spec.focus === 'ravager') add({ attackPercent: .015 * spec.rank, crit: .005 * spec.rank });
  if (spec.focus === 'sentinel') add({ hp: 15 * spec.rank, defense: 2 * spec.rank });
  if (spec.focus === 'mystic') add({ magic: 4 * spec.rank, mp: 8 * spec.rank });
  add({ attack: p.career.endgame.paragon * 2, hp: p.career.endgame.paragon * 5 });
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
  const cap = m.type === 'boss' ? .35 : m.type === 'stone' ? .12 : .03;
  return Math.max(0, Math.floor(Math.min(6 * enemyLevel(m) ** 1.15 * type * factor * (ENEMY_VARIANTS[m.variant]?.xp||1), needXP() * cap)));
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

function trainingCost(stat) {
  const rank = p.career.training[stat];
  return { training: 3 + rank, gold: 100 * (rank + 1) };
}

function trainAttribute(stat) {
  if (!Object.hasOwn(p.career.training, stat) || p.career.training[stat] >= PROGRESSION.maxTraining) return false;
  if (!pay(trainingCost(stat))) return false;
  p.career.training[stat]++; p[stat]++;
  if (stat === 'vitality') p.hp = Math.min(maxHP(), p.hp + 10);
  save(); return true;
}

function skillKey(index) { return p.schools[p.classId] + ':' + index; }

function skillProgress(key) {
  const [id, index] = String(key).split(':');
  if (!SCHOOLS[id] || !Number.isInteger(Number(index)) || Number(index) < 0 || Number(index) > 5) return null;
  return p.career.skills[key] ??= { rank: 1, practice: 0 };
}

function skillPracticeNeeded(rank) { return Math.ceil(20 * rank ** 1.4); }
function skillFactor(key) { return 1 + ((skillProgress(key)?.rank || 1) - 1) * .04; }
function skillCost(key) { const rank = skillProgress(key).rank; return { books: Math.ceil(rank / 3), gold: 25 * rank * rank }; }

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

function completeBiology() {
  const bio = p.career.biology, stage = BIOLOGY[bio.stage];
  if (!stage || p.level < stage.level || Math.hypot(p.x - 1000, p.y - 1050) > 190 || p.career.eligibleKills < bio.nextKill || p.career.materials[stage.item] < 1) return false;
  if (!pay({ [stage.item]: 1, gold: 25 * (bio.stage + 1) })) return false;
  bio.delivered++; bio.nextKill = p.career.eligibleKills + 10;
  if (bio.delivered >= stage.count) {
    bio.stage++; bio.delivered = 0;
    toast('Biologický výskum dokončený!\nTrvalý bonus: ' + stage.text);
  }
  save(); return true;
}

function enhancementCost(item) { const rank = (item?.enhance || 0) + 1; return { ore: 2 * rank * rank, gold: 100 * rank * rank }; }

function enhanceEquipment(slot) {
  const item = p.equipped[slot];
  if (!EQUIPMENT[slot] || !item || (item.enhance || 0) >= PROGRESSION.maxEnhancement) return false;
  if (!pay(enhancementCost(item))) return false;
  item.enhance = (item.enhance || 0) + 1;
  save(); return true;
}

function craftGem(id) {
  if (!GEMS[id] || !pay({ essence: 30, ore: 3, gold: 100 })) return false;
  p.career.alchemy.stock[id]++; save(); return true;
}

function upgradeGem(id) {
  if (!GEMS[id]) return false;
  const alchemy = p.career.alchemy, rank = alchemy.equipped[id], stones = rank ? 2 ** rank : 1;
  if (rank >= PROGRESSION.maxGemRank || alchemy.stock[id] < stones) return false;
  if (!pay(rank ? { dust: 5 * rank, gold: 100 * rank * rank } : {})) return false;
  alchemy.stock[id] -= stones; alchemy.equipped[id]++;
  save(); return true;
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

function collectRelic(id) {
  if (!RELICS[id]) return;
  if (p.career.collection[id]) addMaterial('dust', 10);
  else {
    p.career.collection[id] = true;
    float('RELIKVIA · ' + RELICS[id].name, p.x, p.y - 130, '#dbaff0', true);
    toast('Vzácna relikvia: ' + RELICS[id].name + '\nTrvalý bonus: ' + RELICS[id].text);
  }
}

function careerKill(m) {
  const giveMaterial = (id, count = 1) => dropMaterial(id, count, m);
  const eligible = rewardEligible(m), c = p.career;
  // Biological specimens stay available when revisiting lower-level maps.
  const bio = BIOLOGY.find(b => b.map === p.mapId);
  if (bio && m.type === 'wolf') {
    c.samplePity[p.mapId] = (c.samplePity[p.mapId] || 0) + 1;
    if (c.samplePity[p.mapId] >= 4) { giveMaterial(bio.item); c.samplePity[p.mapId] = 0; }
  }
  if (eligible) {
    c.eligibleKills++; giveMaterial('essence', m.type === 'boss' ? 12 : m.type === 'stone' ? 4 : 1);
    if (c.eligibleKills % 5 === 0) { giveMaterial('ore'); giveMaterial('training'); }
    if (m.type === 'stone' || m.type === 'boss') { giveMaterial('books'); giveMaterial('dust', m.type === 'boss' ? 5 : 1); }
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
  if (m.type === 'boss') {
    c.keyPity++;
    if (c.keyPity >= 3) { giveMaterial('keys'); c.keyPity = 0; }
    c.relicPity[p.mapId] = (c.relicPity[p.mapId] || 0) + 1;
    if (rand() < .08 || c.relicPity[p.mapId] >= 10) { spawnGroundDrop({ kind: 'relic', relicId: p.mapId, count: 1 }, m); c.relicPity[p.mapId] = 0; }
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
  if (p.level < 35 || end.run || !running || !isSanctuary(p)) return false;
  if (!pay({ keys: 3 })) return false;
  const tier = Math.min(PROGRESSION.maxRiftTier, end.highest + 1);
  loadMap('temple');
  snapshotMap();
  end.run = { id: (p.career.riftSerial = (p.career.riftSerial || 0) + 1), tier, kills: 0, bosses: 0, active: true };
  // Separate expedition enemies from the ordinary map snapshot.
  p.career.normalTemple = p.worldStates.temple;
  drops.length = 0;
  mobs.forEach(m => {
    applyRiftScaling(m, tier, end.run.id);
    m.dead = 0; m.cd = 2; m.stun = 0; m.dot = null; m.skillContributors = [];
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
  mobs.length = 0; drops.length = 0; p.x = 1000; p.y = 1160;
  loadMap('valley'); save(); return true;
}

function upgradeParagon() {
  const end = p.career.endgame, rank = end.paragon + 1;
  if (p.level < 35 || end.paragon >= PROGRESSION.maxParagon || !pay({ shards: 25 * rank * rank })) return false;
  end.paragon++; save(); return true;
}
