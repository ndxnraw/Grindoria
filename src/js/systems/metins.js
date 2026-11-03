function metinTypeForLevel(level) {
  return Object.keys(METIN_TYPES).find(id => level <= METIN_TYPES[id].levels[1]) || 'doom';
}

function farmAreaLevelRange(area) {
  if (map().metinsOnly) { const index = FARM_AREAS.findIndex(a => a.id === area.id); return [index * 25 + 1, Math.min(99, (index + 1) * 25)]; }
  return [map().enemyLevel + area.offset, map().enemyLevel + area.offset + 2];
}

function buildSuterlandPoints() {
  const points = []; let level = 1;
  for (const [index, area] of FARM_AREAS.entries()) {
    const locations = [], random = layoutRandom('suterland:' + area.id + ':layout2');
    for (let i = 0; i < (index === 3 ? 24 : 25); i++) locations.push(naturalSpawnLocation(area, locations, random, 90));
    locations.sort((a, b) => Math.hypot(a.x - 1000, a.y - 1050) - Math.hypot(b.x - 1000, b.y - 1050));
    for (const location of locations.slice(0, index === 3 ? 24 : 25)) {
      points.push({ id: 'suterland:metin:' + level, kind: 'stone', ...location, area: area.id, offset: level - 1, metinLevel: level, metinType: metinTypeForLevel(level) });
      level++;
    }
  }
  return points;
}

function metinStats(level, type) {
  const spec = METIN_TYPES[type] || METIN_TYPES.fracture;
  return { hp: Math.round((180 + level * 28 + level * level * .6) * spec.hp), armor: Math.floor(level * .3 + spec.armor * 20), resistance: Math.min(.5, .04 + level * .0025 + spec.armor) };
}

function metinModelScale(stone) { return .84 + Math.min(105, stone.level) / 105 * .3; }

function metinHitTest(stone, x, y) {
  const at = screen(stone.x, stone.y), scale = metinModelScale(stone);
  return Math.abs(x - at.x) <= 48 * scale && y >= at.y - 120 * scale && y <= at.y + 10 * scale;
}

function configureMetin(m, point) {
  m.metinType = point.metinType || (METIN_MAP_TYPES[p.mapId] || ['fracture'])[Number(point.id.split(':').at(-1)) % (METIN_MAP_TYPES[p.mapId]?.length || 1)] || metinTypeForLevel(m.level);
  m.level = point.metinLevel || m.level; m.baseLevel = m.level;
  const stats = metinStats(m.level, m.metinType);
  m.hp = stats.hp; m.max = stats.hp; m.baseMax = stats.hp;
  m.metinArmor = stats.armor; m.metinResistance = stats.resistance;
  m.metinSchema = METIN_RULES.schema; m.metinGeneration = 1; m.metinCombat = 0; m.metinWaveTimer = 0; m.metinGuardSerial = 0;
  return m;
}

function restoreMetin(fresh, prior) {
  if (!prior) return fresh;
  if (prior.metinSchema === METIN_RULES.schema) return { ...fresh, ...prior, dot: prior.dot ? { ...prior.dot } : null, dots:(prior.dots||[]).map(dot=>({...dot})), skillContributors: [...(prior.skillContributors || [])], stun: 0, windup: 0, taunt: 0, engaged: 0, metinCombat: Math.max(0, Math.min(METIN_RULES.combatWindow, prior.metinCombat || 0)), metinWaveTimer: Math.max(0, prior.metinWaveTimer || 0) };
  const hpRatio = Math.max(0, Math.min(1, prior.hp / prior.max));
  return { ...prior, ...fresh, x: prior.x, y: prior.y, homeX: prior.homeX ?? prior.x, homeY: prior.homeY ?? prior.y, hp: prior.hp <= 0 ? 0 : Math.max(1, Math.round(fresh.max * hpRatio)), dead: Math.max(0, prior.dead || 0), cd: prior.cd || 0, dot: prior.dot ? { ...prior.dot } : null, dots:(prior.dots||[]).map(dot=>({...dot})), skillContributors: [...(prior.skillContributors || [])] };
}

function upgradeLegacyMetin(m, point) {
  if (m.type !== 'stone' || m.metinSchema === METIN_RULES.schema) return m;
  const fresh = configureMetin({ ...m, level: m.baseLevel || m.level || map().enemyLevel + 2 }, point);
  const run = p.career.endgame.run;
  if (run && p.mapId === 'temple') applyRiftScaling(fresh, run.tier, run.id);
  return restoreMetin(fresh, m);
}

function restoreMetinGuards(population, prior) {
  const parents = new Set(population.filter(m => m.type === 'stone').map(m => m.spawnId));
  for (const m of prior || []) if (m.metinParentId && m.hp > 0 && m.metinLife > 0 && parents.has(m.metinParentId)) {
    const parent = population.find(stone => stone.spawnId === m.metinParentId), priorParent = prior.find(stone => stone.spawnId === m.metinParentId);
    const dx = priorParent ? parent.x - priorParent.x : 0, dy = priorParent ? parent.y - priorParent.y : 0;
    const safePosition = (x, y) => {
      x = Math.max(45, Math.min(SIZE-45, x+dx)); y = Math.max(45, Math.min(SIZE-45, y+dy));
      const radius = SPAWN_RULES.sanctuaryRadius+24, distance = Math.hypot(x-1000,y-1050);
      if (distance < radius) { const angle = Math.atan2(y-1050,x-1000); x=1000+Math.cos(angle)*radius; y=1050+Math.sin(angle)*radius; }
      return {x,y};
    };
    const position = safePosition(m.x,m.y), home = safePosition(m.homeX??m.x,m.homeY??m.y);
    population.push({ ...cloneEnemyState(m), ...position, homeX: home.x, homeY: home.y, dot: m.dot ? { ...m.dot } : null, skillContributors: [...(m.skillContributors || [])], taunt: 0, engaged: 0, stun: 0, returning: true });
  }
  return population;
}

function metinDamage(m, amount, type='physical') {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return resolveEnemyDamage(m,Math.max(1, Math.round(Math.max(1, amount - (m.metinArmor || 0)) * (1 - (m.metinResistance || 0)))),type);
}

function registerMetinAttack(m) {
  if (!m.metinType) Object.assign(m, upgradeLegacyMetin(m, { id: 'legacy:0' }));
  if (!(m.metinCombat > 0)) m.metinWaveTimer = METIN_RULES.firstWave;
  m.metinCombat = METIN_RULES.combatWindow;
}

function spawnMetinGuards(stone) {
  if (stone.hp <= 0) return 0;
  const spec = METIN_TYPES[stone.metinType], guards = mobs.filter(m => m.metinParentId && m.hp > 0);
  const own = guards.filter(m => m.metinParentId === stone.spawnId && m.metinGeneration === stone.metinGeneration).length;
  const count = Math.max(0, Math.min(spec.wave, METIN_RULES.maxGuards - own, METIN_RULES.globalGuards - guards.length));
  const tier = METIN_GUARDS.find(t => stone.level <= t.max) || METIN_GUARDS.at(-1);
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2, radius = 70 + rand() * 40;
    let x = Math.max(45, Math.min(SIZE - 45, stone.x + Math.cos(angle) * radius)), y = Math.max(45, Math.min(SIZE - 45, stone.y + Math.sin(angle) * radius));
    const sanctuaryDistance = Math.hypot(x - 1000, y - 1050);
    if (sanctuaryDistance < SPAWN_RULES.sanctuaryRadius + 22) { x = 1000 + (x - 1000) / sanctuaryDistance * (SPAWN_RULES.sanctuaryRadius + 23); y = 1050 + (y - 1050) / sanctuaryDistance * (SPAWN_RULES.sanctuaryRadius + 23); }
    const level = Math.max(1, Math.min(105, stone.level - 1 + Math.floor(rand() * 3))), hp = Math.round(40 + level * 9 + level * level * .05);
    const attack = 1 + level * .14 + level * level * .0015, serial = ++stone.metinGuardSerial;
    mobs.push({ type: 'wolf', skin: tier.skin, name: tier.name, variant: 'normal', area: stone.area, level, baseLevel: level, x, y, homeX: x, homeY: y, hp, max: hp, baseMax: hp, attackScale: attack, baseAttack: attack, speedScale: 1 + Math.min(.3, level / 400), spawnId: stone.spawnId + ':guard:' + stone.metinGeneration + ':' + serial, spawnPointId: stone.spawnId + ':guards:' + stone.metinGeneration, spawnSlot: i, metinParentId: stone.spawnId, metinGeneration: stone.metinGeneration, metinLife: METIN_RULES.guardLifetime, dead: 0, cd: .6, hit: 0, taunt: 0, engaged: 8, skillContributors: [], ...(stone.riftId ? { riftId: stone.riftId, riftTier: stone.riftTier } : {}) });
    fx('aura', x, y, spec.glow, .55);
  }
  return count;
}

function updateMetins(dt, safe) {
  if (!running || paused) return;
  for (let i = mobs.length - 1; i >= 0; i--) {
    const guard = mobs[i]; if (!guard.metinParentId) continue;
    guard.metinLife -= dt;
    if (guard.hp <= 0) guard.dead -= dt;
    if (guard.metinLife <= 0 || guard.hp <= 0 && guard.dead <= 0) { mobs.splice(i, 1); continue; }
  }
  for (const stone of mobs.filter(m => m.type === 'stone' && m.hp > 0)) {
    stone.metinCombat = Math.max(0, (stone.metinCombat || 0) - dt);
    if (!stone.metinCombat || safe || active('stealth') || p.hp <= 0 || Math.hypot(stone.x - p.x, stone.y - p.y) > 850) continue;
    for (const guard of mobs) if (guard.hp > 0 && guard.metinParentId === stone.spawnId && guard.metinGeneration === stone.metinGeneration) guard.engaged = Math.max(guard.engaged || 0, 8);
    stone.metinWaveTimer = Math.max(0, (stone.metinWaveTimer || 0) - dt);
    if (stone.metinWaveTimer <= 0) { spawnMetinGuards(stone); stone.metinWaveTimer = METIN_TYPES[stone.metinType].interval; }
  }
}

function metinLootAmount(min, max) { return min + Math.floor(rand() * (max - min + 1)); }

function dropMetinLoot(stone) {
  const type = METIN_TYPES[stone.metinType || metinTypeForLevel(stone.level)], pool = type.loot;
  spawnGroundDrop({ kind: 'gold', currencyName: 'Yang', count: Math.round(metinLootAmount(...pool.yang) * (1 + stone.level * .12)) }, stone);
  if (!rewardEligible(stone)) return;
  for (const id of ['ore', 'books', 'essence', 'dust', 'upgradeStones']) {
    const [chance, min, max] = pool[id];
    if (rand() < chance) dropMaterial(id, metinLootAmount(min, max), stone);
  }
  const [extra, chance, min, max] = pool.extra;
  if (rand() < chance) dropMaterial(extra, metinLootAmount(min, max), stone);
  if (rand() < pool.gear) {
    const item = makeItem(rand() < pool.epic, stone), slot = pool.slots[Math.floor(rand() * pool.slots.length)], spec = EQUIPMENT[slot];
    item.slot = slot; item.weaponKind=slot==='weapon'?(item.weaponKind||generatedWeaponKind()):undefined; item.name = equipmentItemName(slot,item.rarity,item.weaponKind); item.bonus = spec.base + Math.floor(item.tier * spec.scale) + item.rarity * spec.rare;
    spawnGroundDrop({ kind: 'gear', item }, stone);
  }
  if (rand() < pool.rare) spawnGroundDrop({ kind: 'relic', relicId: pool.relic, count: 1 }, stone);
}
