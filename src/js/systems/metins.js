function metinTypeForLevel(level) {
  return Object.keys(METIN_TYPES).find(id => level <= METIN_TYPES[id].levels[1]) || 'doom';
}

function farmAreaLevelRange(area) {
  if (map().metinsOnly) { const index = FARM_AREAS.findIndex(a => a.id === area.id); return [index * 25 + 1, Math.min(99, (index + 1) * 25)]; }
  const offset=map().areaLevelOffsets?.[FARM_AREAS.indexOf(area)]??area.offset;return [map().enemyLevel+offset,map().enemyLevel+offset+(map().mobLevelSpread??2)];
}

function buildSuterlandPoints() {
  const points = []; let level = 1;
  for (const [index, area] of FARM_AREAS.entries()) {
    const locations = [], random = layoutRandom('suterland:' + area.id + ':layout2');
    for (let i = 0; i < (index === 3 ? 24 : 25); i++) locations.push(naturalSpawnLocation(area, locations, random, 90));
    locations.sort((a, b) => Math.hypot(a.x-safeZone().x,a.y-safeZone().y)-Math.hypot(b.x-safeZone().x,b.y-safeZone().y));
    for (const location of locations.slice(0, index === 3 ? 24 : 25)) {
      points.push({ id: 'suterland:metin:' + level, kind: 'stone', ...location, area: area.id, offset: level - 1, metinLevel: level, metinType: metinTypeForLevel(level) });
      level++;
    }
  }
  return points;
}

function metinStats(level, type) {
  const spec = METIN_TYPES[type] || METIN_TYPES.fracture;
  return { hp: Math.round((180 + level * 28 + level * level * .6) * spec.hp * (4.5 + level * .12)), armor: Math.floor(level * .3 + spec.armor * 20), resistance: Math.min(.5, .04 + level * .0025 + spec.armor) };
}

function metinModelScale(stone) { return .84 + Math.min(105, stone.level) / 105 * .3; }

function metinHitTest(stone, x, y) {
  const at = screen(stone.x, stone.y), scale = metinModelScale(stone);
  return Math.abs(x - at.x) <= 48 * scale && y >= at.y - 120 * scale && y <= at.y + 10 * scale;
}

function configureMetin(m, point) {
  m.metinType = point.metinType || (METIN_MAP_TYPES[p.mapId] || ['fracture'])[Number(point.id.split(':').at(-1)) % (METIN_MAP_TYPES[p.mapId]?.length || 1)] || metinTypeForLevel(m.level);
  const bounds=METIN_TYPES[m.metinType].levels;
  m.level = point.metinLevel || Math.min(bounds[1],map().levelMax||99,Math.max(m.level,bounds[0],map().level)); m.baseLevel = m.level;
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
  return { ...prior, ...fresh, x: prior.x, y: prior.y, homeX: prior.homeX ?? prior.x, homeY: prior.homeY ?? prior.y, hp: prior.hp <= 0 ? 0 : Math.max(1, Math.round(fresh.max * hpRatio)), metinGeneration:prior.metinGeneration||1,metinGuardSerial:prior.metinGuardSerial||0,metinCombat:Math.max(0,Math.min(METIN_RULES.combatWindow,prior.metinCombat||0)),metinWaveTimer:Math.max(0,prior.metinWaveTimer||0),dead: Math.max(0, prior.dead || 0), cd: prior.cd || 0, dot: prior.dot ? { ...prior.dot } : null, dots:(prior.dots||[]).map(dot=>({...dot})), skillContributors: [...(prior.skillContributors || [])] };
}

function upgradeLegacyMetin(m, point) {
  if (m.type !== 'stone' || m.metinSchema === METIN_RULES.schema) return m;
  const fresh = configureMetin({ ...m, level: m.baseLevel || m.level || map().enemyLevel + 2 }, {...point,metinType:m.metinType||point.metinType,metinLevel:m.baseLevel||m.level||point.metinLevel});
  if(m.rareMetin){fresh.max=Math.round(fresh.max*2.4);fresh.hp=fresh.max;fresh.baseMax=fresh.max;fresh.metinArmor=Math.round(fresh.metinArmor*1.15);}
  const run = p.career.endgame.run;
  if (run && p.mapId === 'temple') applyRiftScaling(fresh, run.tier, run.id);
  return restoreMetin(fresh, m);
}

function restoreMetinGuards(population, prior) {
  const parents = new Map(population.filter(m => m.type === 'stone').map(m => [m.spawnId,m])),priorParents=new Map((prior||[]).filter(m=>m.type==='stone').map(m=>[m.spawnId,m]));
  for (const m of prior || []) if (m.metinParentId && m.hp > 0 && m.metinLife > 0 && parents.has(m.metinParentId)) {
    const parent = parents.get(m.metinParentId), priorParent = priorParents.get(m.metinParentId);
    const dx = priorParent ? parent.x - priorParent.x : 0, dy = priorParent ? parent.y - priorParent.y : 0;
    const restorePosition = (x, y) => {
      x = Math.max(45, Math.min(SIZE-45, x+dx)); y = Math.max(45, Math.min(SIZE-45, y+dy));
      return safePosition({x,y},24);
    };
    const position = restorePosition(m.x,m.y), home = restorePosition(m.homeX??m.x,m.homeY??m.y);
    population.push({ ...cloneEnemyState(m), ...position, homeX: home.x, homeY: home.y, dot: m.dot ? { ...m.dot } : null, skillContributors: [...(m.skillContributors || [])], taunt: 0, engaged: 0, stun: 0, returning: true });
  }
  return population;
}

function metinDamage(m, amount, type='physical',penetrated=false) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return resolveEnemyDamage(m,Math.max(1, Math.round(Math.max(1, amount - (penetrated?0:(m.metinArmor || 0))) * (1 - (penetrated?0:(m.metinResistance || 0))))),type,penetrated);
}

function registerMetinAttack(m) {
  if (!m.metinType) Object.assign(m, upgradeLegacyMetin(m, { id: 'legacy:0' }));
  if (!(m.metinCombat > 0)) m.metinWaveTimer = METIN_RULES.firstWave;
  m.metinCombat = METIN_RULES.combatWindow;
}

function spawnMetinGuards(stone) {
  if (stone.hp <= 0) return 0;
  const spec = METIN_TYPES[stone.metinType];let own=0,total=0;for(const m of mobs)if(m.metinParentId&&m.hp>0){total++;if(m.metinParentId===stone.spawnId&&m.metinGeneration===stone.metinGeneration)own++;}
  const count = Math.max(0, Math.min(spec.wave, METIN_RULES.maxGuards - own, METIN_RULES.globalGuards - total));
  const tier = METIN_GUARDS.find(t => stone.level <= t.max) || METIN_GUARDS.at(-1);
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2, radius = 70 + rand() * 40;
    let x = Math.max(45, Math.min(SIZE - 45, stone.x + Math.cos(angle) * radius)), y = Math.max(45, Math.min(SIZE - 45, stone.y + Math.sin(angle) * radius));
    ({x,y}=safePosition({x,y},23));
    const level = Math.max(1, Math.min(105, stone.level - 1 + Math.floor(rand() * 3))), hp = Math.round(40 + level * 9 + level * level * .05);
    const attack = 1 + level * .14 + level * level * .0015, serial = ++stone.metinGuardSerial;
    mobs.push({ type: 'wolf', skin: tier.skin, name: tier.name, variant: 'normal', area: stone.area, level, baseLevel: level, x, y, homeX: x, homeY: y, hp, max: hp, baseMax: hp, attackScale: attack, baseAttack: attack, speedScale: 1 + Math.min(.3, level / 400), spawnId: stone.spawnId + ':guard:' + stone.metinGeneration + ':' + serial, spawnPointId: stone.spawnId + ':guards:' + stone.metinGeneration, spawnSlot: i, metinParentId: stone.spawnId, metinGeneration: stone.metinGeneration, metinLife: METIN_RULES.guardLifetime, dead: 0, cd: .6, hit: 0, taunt: 0, engaged: 8, skillContributors: [], ...(stone.riftId ? { riftId: stone.riftId, riftTier: stone.riftTier } : {}) });
    fx('aura', x, y, spec.glow, .55);
  }
  return count;
}

function updateMetins(dt, safe) {
  if (!running || paused) return;
  const parents=new Map();for(const m of mobs)if(m.type==='stone')parents.set(m.spawnId,m);
  for (let i = mobs.length - 1; i >= 0; i--) {
    const guard = mobs[i]; if (!guard.metinParentId) continue;
    const parent=parents.get(guard.metinParentId);if(guard.hp>0&&parent&&parent.hp<=0&&guard.metinGeneration===parent.metinGeneration)hit(guard,guard.hp,'arcane',true);
    guard.metinLife -= dt;
    if (guard.hp <= 0) guard.dead -= dt;
    if (guard.metinLife <= 0 || guard.hp <= 0 && guard.dead <= 0) { mobs.splice(i, 1); continue; }
  }
  const groups=new Map();for(const guard of mobs)if(guard.metinParentId&&guard.hp>0){if(!groups.has(guard.metinParentId))groups.set(guard.metinParentId,[]);groups.get(guard.metinParentId).push(guard);}
  for (const stone of parents.values()) {
    if(stone.hp<=0)continue;
    stone.metinCombat = Math.max(0, (stone.metinCombat || 0) - dt);
    if (!stone.metinCombat || safe || active('stealth') || p.hp <= 0 || Math.hypot(stone.x - p.x, stone.y - p.y) > 850) continue;
    for (const guard of groups.get(stone.spawnId)||EMPTY_NEIGHBORS) if (guard.metinGeneration === stone.metinGeneration) guard.engaged = Math.max(guard.engaged || 0, 8);
    stone.metinWaveTimer = Math.max(0, (stone.metinWaveTimer || 0) - dt);
    if (stone.metinWaveTimer <= 0) { spawnMetinGuards(stone); stone.metinWaveTimer = METIN_TYPES[stone.metinType].interval; }
  }
}

function metinLootAmount(min, max) { return min + Math.floor(rand() * (max - min + 1)); }

function dropMetinLoot(stone) {
  const type = METIN_TYPES[stone.metinType || metinTypeForLevel(stone.level)], pool = enemyLootPool(stone).metin;
  spawnGroundDrop({ kind: 'gold', currencyName: 'Yang', count: Math.round(metinLootAmount(...pool.yang) * (1 + stone.level * .12)) }, stone);
  if (!rewardEligible(stone)) return;
  for (const id of ['ore', 'books', 'essence', 'dust', 'upgradeStones']) {
    const [chance, min, max] = pool[id];
    if (rand() < chance) dropMaterial(id, metinLootAmount(min, max), stone);
  }
  if(stone.level>=35&&rand()<.08)dropMaterial('soulStones',1,stone);
  const [extra, chance, min, max] = pool.extra;
  if (rand() < chance) dropMaterial(extra, metinLootAmount(min, max), stone);
  if (rand() < pool.gear) {
    const slot=pool.slots[Math.min(pool.slots.length-1,Math.floor(itemRandom()*pool.slots.length))],item=makeItem(false,stone,slot);
    spawnGroundDrop({ kind: 'gear', item }, stone);
  }
}
