function isSanctuary(entity) {
  return Math.hypot(entity.x - 1000, entity.y - 1050) < SPAWN_RULES.sanctuaryRadius;
}

function initializeFarming() {
  if (p.braveryCapes === undefined) p.braveryCapes = 10;
  if (!Number.isSafeInteger(p.braveryCapes) || p.braveryCapes < 0) p.braveryCapes = 0;
}

function farmAreaAt(entity = p) {
  return FARM_AREAS[(entity.y < 1000 ? 2 : 0) + (entity.x > 1000 ? 1 : 0)];
}

function buildSpawnPoints(id) {
  if (MAPS[id].metinsOnly) return buildSuterlandPoints();
  const points = [], random = layoutRandom(id + ':' + MAPS[id].seed + ':layout2'), perArea = MAPS[id].packCount / 4;
  for (const area of FARM_AREAS) {
    const local = [];
    const add = (kind, suffix, extra = {}) => {
      const location = naturalSpawnLocation(area, local, random);
      const point = { id: id + ':' + area.id + ':' + suffix, kind, ...location, area: area.id, offset: area.offset, ...extra };
      points.push(point); local.push(point);
    };
    for (let i = 0; i < perArea; i++) add('pack', 'pack:' + i, { starter: area.offset === 0 && i === 0 });
    add('rare', 'rare');
    for (let i = 0; i < 2; i++) add('stone', 'stone:' + i);
  }
  points.push({ id: id + ':boss', kind: 'boss', x: 1690, y: 330, area: 'northeast', offset: 6 });
  return points;
}

function rollEnemyVariant(point, slot) {
  if (point.kind === 'rare') return 'rare';
  if (point.kind !== 'pack' || (point.starter && slot === 0)) return 'normal';
  const roll = rand();
  return roll < SPAWN_RULES.rareChance ? 'rare' : roll < SPAWN_RULES.rareChance + SPAWN_RULES.eliteChance ? 'elite' : 'normal';
}

function createSpawnEnemy(point, slot = 0) {
  const cfg = map(), type = point.kind === 'pack' || point.kind === 'rare' ? 'wolf' : point.kind;
  const angle = rand() * Math.PI * 2, radius = point.kind === 'pack' ? Math.sqrt(rand()) * 90 : 0;
  let x = point.x + Math.cos(angle) * radius, y = point.y + Math.sin(angle) * radius;
  if (Math.hypot(x - 1000, y - 1050) < SPAWN_RULES.spawnClearance) {
    const a = Math.atan2(y - 1050, x - 1000);
    x = 1000 + Math.cos(a) * SPAWN_RULES.spawnClearance;
    y = 1050 + Math.sin(a) * SPAWN_RULES.spawnClearance;
  }
  const variant = rollEnemyVariant(point, slot), v = ENEMY_VARIANTS[variant];
  const normalLevel = cfg.enemyLevel + point.offset + (type === 'boss' ? 5 : type === 'stone' ? 2 : slot % 3);
  const level = normalLevel + (type === 'wolf' ? v.level : 0);
  const hp = Math.round((type === 'boss' ? 620 : type === 'stone' ? 160 : 55) * cfg.scale * (1 + (level - cfg.enemyLevel) * .08) * (type === 'wolf' ? v.hp : 1));
  const attack = cfg.scale * (1 + (level - cfg.enemyLevel) * .06) * (type === 'wolf' ? v.damage : 1);
  const enemy = {
    spawnId: point.id + ':' + slot, spawnPointId: point.id, spawnSlot: slot,
    type, skin: cfg.skin, area: point.area, variant, rareSlot: point.kind === 'rare',
    x, y, homeX: x, homeY: y, level, baseLevel: level, hp, max: hp, baseMax: hp,
    attackScale: attack, baseAttack: attack, speedScale: type === 'wolf' ? v.speed : 1,
    respawnSeconds: type === 'boss' ? 40 : type === 'stone' ? 18 : point.kind === 'rare' ? 75 : v.respawn,
    dead: 0, cd: 1, hit: 0, windup: 0, taunt: 0, engaged: 0,
    roamTarget: null, roamWait: rand() * 4, returning: false, skillContributors: []
  };
  return type === 'stone' ? configureMetin(enemy, point) : enemy;
}

function applyRiftScaling(m, tier, runId) {
  m.baseMax ??= m.max; m.baseLevel ??= m.level; m.baseAttack ??= m.attackScale || MAPS.temple.scale;
  m.riftTier = tier; m.riftId = runId;
  m.max = Math.round(m.baseMax * (1 + tier * .12)); m.hp = m.max;
  m.level = Math.min(105, m.baseLevel + tier * 2);
  m.attackScale = m.baseAttack * (1 + tier * .12);
  if (m.type === 'stone') { const stats = metinStats(m.level, m.metinType); m.metinArmor = stats.armor; m.metinResistance = stats.resistance; }
}

function hydrateSpawnPopulation(old) {
  const generated = [];
  for (const point of spawnPoints) {
    for (let slot = 0; slot < (point.kind === 'pack' ? SPAWN_RULES.packSize : 1); slot++) {
      const m = createSpawnEnemy(point, slot), run = p.career.endgame.run;
      if (run && p.mapId === 'temple') applyRiftScaling(m, run.tier, run.id);
      generated.push(m);
    }
  }
  if (!old?.mobs?.length) return generated;
  if (old.spawnSchema === SPAWN_RULES.schema) {
    const saved = new Map(old.mobs.map(m => [m.spawnId, m]));
    return restoreMetinGuards(generated.map(m => {
      const prior = saved.get(m.spawnId);
      if (m.type === 'stone') return restoreSpawnLocation(restoreMetin(m, prior), m, old);
      return prior ? restoreSpawnLocation({ ...m, ...cloneEnemyState(prior), dot: prior.dot ? { ...prior.dot } : null, skillContributors: [...(prior.skillContributors || [])], stun: 0, windup: 0, taunt: 0, engaged: 0, roamTarget: null, roamWait: rand() * 4, returning: false }, m, old) : m;
    }), old.mobs);
  }
  // Upgrade old sparse populations into distinct new slots without reviving their dead.
  const used = new Set();
  for (const prior of old.mobs.filter(m => !m.metinParentId)) {
    let best = -1, distance = Infinity;
    for (let i = 0; i < generated.length; i++) {
      if (used.has(i) || generated[i].type !== prior.type) continue;
      const d = Math.hypot(generated[i].homeX - (prior.homeX ?? prior.x), generated[i].homeY - (prior.homeY ?? prior.y));
      if (d < distance) { best = i; distance = d; }
    }
    if (best < 0) continue;
    const m = generated[best], ratio = Math.max(0, Math.min(1, prior.hp / prior.max));
    used.add(best);
    m.hp = prior.hp <= 0 ? 0 : Math.max(1, Math.round(m.max * ratio));
    m.dead = Math.max(0, prior.dead || 0); m.cd = Math.max(0, prior.cd || 0);
    m.skillContributors = [...(prior.skillContributors || [])];
    if (prior.dot) m.dot = { ...prior.dot };
    m.dots=(prior.dots||[]).map(dot=>({...dot}));
  }
  return restoreMetinGuards(generated, old.mobs);
}

function loadLegacyRift(old) {
  legacyRiftLayout = true; spawnPoints.length = 0;
  return old.mobs.map((prior, index) => {
    const id = 'legacy-rift:' + index, x = prior.homeX ?? prior.x, y = prior.homeY ?? prior.y;
    spawnPoints.push({ id, kind: prior.type === 'wolf' ? 'pack' : prior.type, x, y, area: farmAreaAt(prior).id, offset: 0 });
    return upgradeLegacyMetin({ ...cloneEnemyState(prior), spawnId: id + ':0', spawnPointId: id, spawnSlot: 0, variant: 'normal', respawnSeconds: prior.type === 'boss' ? 40 : prior.type === 'stone' ? 18 : 5, taunt: 0, engaged: 0, stun: 0, windup: 0 }, spawnPoints.at(-1));
  });
}

function respawnEnemy(m) {
  const point = spawnPoints.find(p => p.id === m.spawnPointId);
  if (!point || legacyRiftLayout) {
    m.hp = m.max; m.x = m.homeX ?? m.x; m.y = m.homeY ?? m.y;
    m.dead = 0; m.cd = 1; m.taunt = 0; m.engaged = 0; m.stun = 0; m.slow = 0; m.dot = null; m.dots=[]; m.windup = 0; m.skillContributors = [];
    m.roamTarget = null; m.roamWait = rand() * 4; m.returning = false;
    if (m.type === 'stone') { m.metinCombat = 0; m.metinWaveTimer = 0; m.metinGeneration = (m.metinGeneration || 0) + 1; }
    return;
  }
  let spawnPoint = point;
  if (m.type === 'stone') {
    const area = FARM_AREAS.find(area => area.id === point.area), random = layoutRandom(m.spawnId + ':' + ((m.metinGeneration || 0) + 1) + ':' + rand());
    const others = mobs.filter(other => other !== m && other.type === 'stone' && other.hp > 0);
    spawnPoint = { ...point, ...naturalSpawnLocation(area, others, random, 90) };
  }
  const fresh = createSpawnEnemy(spawnPoint, m.spawnSlot);
  if (m.type === 'stone') fresh.metinGeneration = (m.metinGeneration || 0) + 1;
  const run = p.career.endgame.run;
  if (run && p.mapId === 'temple') applyRiftScaling(fresh, run.tier, run.id);
  // Keep object identity: projectiles and skills may still reference this slot.
  for (const key of Object.keys(m)) delete m[key];
  Object.assign(m, fresh);
  if (Math.hypot(m.x - p.x, m.y - p.y) < 600) fx('aura', m.x, m.y, '#a6cfa1', .45);
}

function buildMobGrid() {
  const grid = new Map();
  for (const m of mobs) if (m.type === 'wolf' && m.hp > 0) {
    const key = Math.floor(m.x / 70) + ':' + Math.floor(m.y / 70);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(m);
  }
  return grid;
}

function walkEnemy(m, x, y, speed, dt, grid = null) {
  let dx = x - m.x, dy = y - m.y, distance = Math.hypot(dx, dy);
  if (distance < 2) return;
  let vx = dx / distance, vy = dy / distance;
  if (grid) {
    const col = Math.floor(m.x / 70), row = Math.floor(m.y / 70);
    for (let cx = col - 1; cx <= col + 1; cx++) for (let cy = row - 1; cy <= row + 1; cy++) {
      for (const other of grid.get(cx + ':' + cy) || []) {
        if (other === m) continue;
        const ox = m.x - other.x, oy = m.y - other.y, d = Math.hypot(ox, oy);
        if (d > .01 && d < 25) { vx += ox / d * (25 - d) / 20; vy += oy / d * (25 - d) / 20; }
      }
    }
  }
  const length = Math.hypot(vx, vy) || 1, step = Math.min(distance, speed * dt);
  let nx = m.x + vx / length * step, ny = m.y + vy / length * step;
  const keepOut = SPAWN_RULES.sanctuaryRadius + 18;
  if (Math.hypot(nx - 1000, ny - 1050) < keepOut) {
    const angle = Math.atan2(m.y - 1050, m.x - 1000), cross = (m.x - 1000) * (y - 1050) - (m.y - 1050) * (x - 1000);
    const next = angle + (cross < 0 ? -1 : 1) * step / keepOut;
    nx = 1000 + Math.cos(next) * keepOut; ny = 1050 + Math.sin(next) * keepOut;
  }
  m.x = Math.max(45, Math.min(SIZE - 45, nx)); m.y = Math.max(45, Math.min(SIZE - 45, ny));
}

// Assistance is requested only by a direct damage event, never by another helper.
function provokeEnemyGroup(victim) {
  if (victim.type !== 'wolf' && victim.type !== 'boss') return;
  victim.engaged = Math.max(victim.engaged || 0, 8);
  if (victim.type !== 'wolf' || !victim.spawnPointId) return;
  const group = mobs.filter(m => m !== victim && m.type === 'wolf' && m.hp > 0 && m.spawnPointId === victim.spawnPointId);
  const activeCount = 1 + group.filter(m => m.engaged > 0 || m.taunt > 0).length;
  let remaining = Math.max(0, SPAWN_RULES.assistLimit - activeCount);
  group.sort((a, b) => Math.hypot(a.x - victim.x, a.y - victim.y) - Math.hypot(b.x - victim.x, b.y - victim.y));
  for (const m of group) {
    if (Math.hypot(m.x - victim.x, m.y - victim.y) > SPAWN_RULES.assistRange) continue;
    if (Math.hypot(m.x - m.homeX, m.y - m.homeY) >= SPAWN_RULES.leash) continue;
    if (m.engaged > 0 || m.taunt > 0) m.engaged = Math.max(m.engaged || 0, 8);
    else if (remaining > 0) { m.engaged = 8; remaining--; }
  }
}

function wanderEnemy(m, dt, grid) {
  m.roamWait = Math.max(0, (m.roamWait || 0) - dt);
  if (m.roamWait > 0) return;
  if (!m.roamTarget) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const angle = rand() * Math.PI * 2, radius = SPAWN_RULES.roamRadius * Math.sqrt(rand());
      const x = m.homeX + Math.cos(angle) * radius, y = m.homeY + Math.sin(angle) * radius;
      if (x < 45 || x > SIZE - 45 || y < 45 || y > SIZE - 45 || Math.hypot(x - 1000, y - 1050) < SPAWN_RULES.sanctuaryRadius + 18) continue;
      m.roamTarget = { x, y }; break;
    }
    if (!m.roamTarget) { m.roamWait = 2; return; }
  }
  const slow = m.slow > 0 ? .55 : 1;
  walkEnemy(m, m.roamTarget.x, m.roamTarget.y, map().mobSpeed * (m.speedScale || 1) * SPAWN_RULES.roamSpeed * slow, dt, grid);
  const distance = Math.hypot(m.x - m.homeX, m.y - m.homeY);
  if (distance > SPAWN_RULES.roamRadius) {
    m.x = m.homeX + (m.x - m.homeX) / distance * SPAWN_RULES.roamRadius;
    m.y = m.homeY + (m.y - m.homeY) / distance * SPAWN_RULES.roamRadius;
  }
  if (Math.hypot(m.x - m.roamTarget.x, m.y - m.roamTarget.y) < 5) {
    m.roamTarget = null; m.roamWait = 1.5 + rand() * 3.5;
  }
}

function updateEnemySpawns(dt, safe) {
  capeCooldown = Math.max(0, capeCooldown - dt);
  const grid = buildMobGrid();
  for (const m of mobs) {
    m.hit = Math.max(0, (m.hit || 0) - dt); m.cd = (m.cd || 0) - dt;
    m.taunt = Math.max(0, (m.taunt || 0) - dt); m.engaged = Math.max(0, (m.engaged || 0) - dt);
    if (safe || active('stealth')) { m.taunt = 0; m.engaged = 0; }
    if (m.hp <= 0) { if (m.metinParentId) continue; m.dead -= dt; if (m.dead <= 0) respawnEnemy(m); continue; }
    if (m.type !== 'wolf' || m.stun > 0) continue;
    const d = Math.hypot(m.x - p.x, m.y - p.y), home = Math.hypot(m.x - m.homeX, m.y - m.homeY);
    const forced = m.taunt > 0 || m.engaged > 0;
    const chasing = !safe && !active('stealth') && forced && (m.taunt > 0 || home < SPAWN_RULES.leash);
    if (chasing) {
      m.returning = true; m.roamTarget = null;
      const slow = (active('fear') && d < 300 ? .5 : 1) * (m.slow > 0 ? .55 : 1);
      const angle = (m.spawnSlot || 0) * 2.39996, spread = d < 110 ? 28 : 0;
      if (d > 33) walkEnemy(m, p.x + Math.cos(angle) * spread, p.y + Math.sin(angle) * spread, map().mobSpeed * (m.speedScale || 1) * slow, dt, grid);
      if (d < 55 && m.cd <= 0) { m.engaged = Math.max(m.engaged || 0, 8); takeDamage(Math.max(4, Math.round(9 * (m.attackScale || map().scale) - p.level * .5)), m); m.cd = 1.3; }
    } else {
      m.taunt = 0; m.engaged = 0;
      if (m.returning || home > SPAWN_RULES.roamRadius + 1e-6) {
        walkEnemy(m, m.homeX, m.homeY, map().mobSpeed * 1.15, dt, grid);
        if (home < 20) m.hp = Math.min(m.max, m.hp + m.max * dt * .2);
        if (Math.hypot(m.x - m.homeX, m.y - m.homeY) <= 4) {
          m.returning = false; m.roamTarget = null; m.roamWait = 1.5 + rand() * 3.5;
        }
      } else wanderEnemy(m, dt, grid);
    }
  }
}

function useBraveryCape() {
  if (!running || paused || p.hp <= 0 || capeCooldown > 0) return false;
  if (p.braveryCapes < 1) { toast('Nemáš Plášť statočnosti. Kúpiš ho u obchodníka (F).'); return false; }
  if (isSanctuary(p)) { toast('Plášť použi mimo chráneného útočiska.'); return false; }
  p.braveryCapes--; capeCooldown = SPAWN_RULES.capeCooldown; delete buffs.stealth;
  let count = 0;
  for (const m of mobs) if (m.hp > 0 && (m.type === 'wolf' || m.type === 'boss') && Math.hypot(m.x - p.x, m.y - p.y) <= SPAWN_RULES.capeRange) {
    m.taunt = SPAWN_RULES.capeDuration; m.engaged = SPAWN_RULES.capeDuration; count++;
  }
  fx('bravery', p.x, p.y, '#efbe8a', 1.25); beep(200, .3);
  toast(count ? 'Plášť statočnosti · pritiahnutí nepriatelia: ' + count : 'Plášť použitý · v dosahu nebol žiadny pohyblivý nepriateľ.');
  updateHUD(); save(); return true;
}

function buyBraveryCapes() {
  if (Math.hypot(p.x - 1110, p.y - 1110) > 160 || !pay({ gold: SPAWN_RULES.capePrice })) return false;
  p.braveryCapes += SPAWN_RULES.capeBundle;
  updateHUD(); save(); return true;
}

function farmBonusLoot(m) {
  const eligible = rewardEligible(m), rare = m.variant === 'rare', elite = m.variant === 'elite';
  let capes = m.type === 'boss' ? 3 : rare ? 2 : rand() < (elite ? .25 : .02) ? 1 : 0;
  if (capes) spawnGroundDrop({ kind: 'supply', supplyId: 'braveryCapes', count: capes }, m);
  if (!eligible || m.type !== 'wolf') return;
  if (rare) { dropMaterial('ore', 3, m); dropMaterial('dust', 3, m); dropMaterial('books', 1, m); dropMaterial('training', 1, m); }
  else if (elite) { dropMaterial('ore', 1, m); dropMaterial('essence', 2, m); }
}

function dropFarmEquipment(m) {
  const rare = m.variant === 'rare', elite = m.variant === 'elite';
  if (m.type === 'boss') return spawnGroundDrop({ kind: 'gear', item: makeItem(false, m) }, m);
  if (m.type === 'stone' || rare || rand() < (elite ? .2 : .03)) return spawnGroundDrop({ kind: 'gear', item: makeItem(false, m) }, m);
}

