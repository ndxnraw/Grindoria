const LOOT_RULES = { fallDuration: .65, pickupRange: 180, hoverDelay: .55, lifetime: 180, rareLifetime: 600 };
const automaticLoot = { items: new Map() };
const lootPointer = { inside: false, x: 0, y: 0, clientX: 0, clientY: 0 };
let hoveredLootId = null, lootTooltipSignature = '';
const lootHover = { id: null, elapsed: 0 };

function groundDropLifetime(drop) { return drop.kind === 'relic' || drop.kind === 'gear' && rarityRank(drop.item?.rarity) >= rarityRank(2) ? LOOT_RULES.rareLifetime : LOOT_RULES.lifetime; }
function pruneStoredGroundDrops(now = Date.now()) {
  for (const state of [...Object.values(p.worldStates), p.career.normalTemple]) {
    if (!Array.isArray(state?.drops)) continue;
    state.drops = state.drops.filter(drop => {
      if (!Number.isFinite(drop.expiresAt)) drop.expiresAt = now + groundDropLifetime(drop) * 1000;
      return drop.expiresAt > now;
    });
  }
}

function expireGroundDrops(now = Date.now()) {
  for (let i = drops.length - 1; i >= 0; i--) if (drops[i].expiresAt <= now) drops.splice(i, 1);
}
const lootSupplyCatalog = new Map();

function initializeLoot() {
  automaticLoot.items.clear();
  pruneStoredGroundDrops();
  lootSupplyCatalog.clear(); supplyDefinitions().forEach(item => lootSupplyCatalog.set(item.id, item));
  if (!Number.isSafeInteger(p.lootSerial) || p.lootSerial < 0) p.lootSerial = 0;
  for (const state of [...Object.values(p.worldStates), p.career.normalTemple]) {
    for (const drop of state?.drops || []) if (Number.isSafeInteger(drop.id)) p.lootSerial = Math.max(p.lootSerial, drop.id);
  }
}

function cloneGroundDrop(drop) {
  return { ...drop, ...(drop.item ? { item: { ...drop.item, ...(drop.item.stats ? { stats: { ...drop.item.stats } } : {}), ...(drop.item.special ? { special: [...drop.item.special] } : {}) } } : {}) };
}

function hydrateGroundDrops(saved) {
  const ids = new Set();
  const now = Date.now();
  return saved.map(prior => {
    const drop = cloneGroundDrop(prior);
    // Existing map snapshots contained only uncollected gold piles.
    drop.kind ??= 'gold';
    drop.expiresAt = Number.isFinite(drop.expiresAt) ? Math.min(drop.expiresAt, now + groundDropLifetime(drop) * 1000) : now + groundDropLifetime(drop) * 1000;
    drop.count ??= drop.value || 1;
    if (!Number.isSafeInteger(drop.id) || drop.id < 1 || ids.has(drop.id)) drop.id = ++p.lootSerial;
    p.lootSerial = Math.max(p.lootSerial, drop.id); ids.add(drop.id);
    drop.fallAge = LOOT_RULES.fallDuration;
    drop.launchX = drop.x; drop.launchY = drop.y;
    return drop;
  }).filter(drop => drop.expiresAt > now);
}

function spawnGroundDrop(payload, source) {
  const angle = rand() * Math.PI * 2, radius = 22 + rand() * 64;
  const drop = {
    ...payload, id: ++p.lootSerial,
    x: Math.max(45, Math.min(SIZE - 45, source.x + Math.cos(angle) * radius)),
    y: Math.max(45, Math.min(SIZE - 45, source.y + Math.sin(angle) * radius)),
    launchX: source.x, launchY: source.y, fallAge: 0
  };
  drop.expiresAt = Date.now() + groundDropLifetime(drop) * 1000;
  if (drop.kind === 'gold') drop.value = drop.count;
  if(drop.kind==='gold'||drop.kind==='supply'){grantAutomaticDrop(drop);return drop;}
  drops.push(drop); return drop;
}

function grantAutomaticDrop(drop) {
  const view=groundDropView(drop);
  if(!view)return false;
  if(drop.kind==='gold'){
    if(!Number.isSafeInteger(drop.count)||drop.count<1||!Number.isSafeInteger(p.gold+drop.count))return false;
    p.gold+=drop.count;
  }else if(drop.kind==='supply'){if(!grantGroundSupply(drop.supplyId,drop.count))return false;}
  else return false;
  const key=drop.kind==='gold'?'gold':drop.supplyId,prior=automaticLoot.items.get(key);
  automaticLoot.items.set(key,{name:view.name,count:(prior?.count||0)+view.count});
  return true;
}
function flushAutomaticLoot() {
  if(!automaticLoot.items.size)return;
  const items=[...automaticLoot.items.values()];automaticLoot.items.clear();
  for(let i=0;i<items.length;i+=2){
    float(items.slice(i,i+2).map(item=>'+'+item.count+' '+item.name).join(' · '),p.x,p.y-75-i*8,'#dec799');
    if(particles.length)particles[particles.length-1].small=true;
  }
  updateHUD();save();
}
function dropMaterial(id, count, source) {
  if (MATERIALS[id] && Number.isSafeInteger(count) && count > 0) return spawnGroundDrop({ kind: 'supply', supplyId: 'material:' + id, count }, source);
}

function groundDropView(drop) {
  if (drop.kind === 'gear') return { ...drop.item, count: 1, description: 'Výbava postavy.' };
  if (drop.kind === 'supply') {
    const definition = lootSupplyCatalog.get(drop.supplyId);
    return definition ? { ...definition, count: drop.count, rarity: 0, requiredLevel: 1 } : null;
  }
  if (drop.kind === 'relic' && RELICS[drop.relicId]) {
    const relic = RELICS[drop.relicId];
    return { name: relic.name, icon: 'relic-'+drop.relicId, count: 1, rarity: 2, requiredLevel: 1, description: relic.text + (p.career.collection[drop.relicId] ? ' Ďalší exemplár sa po zdvihnutí premení na 10 prachov.' : 'Po zdvihnutí aktivuje trvalý bonus zbierky.') };
  }
  if (drop.kind === 'gold') return { name: drop.currencyName || 'Zlato', icon: 'gold', count: drop.count, rarity: 0, requiredLevel: 1, description: 'Mena pre obchodníka, kováča a rozvoj postavy.' };
  return null;
}

function groundDropVisual(drop) {
  const t = Math.min(1, (drop.fallAge ?? LOOT_RULES.fallDuration) / LOOT_RULES.fallDuration);
  const position = screen((drop.launchX ?? drop.x) + (drop.x - (drop.launchX ?? drop.x)) * t, (drop.launchY ?? drop.y) + (drop.y - (drop.launchY ?? drop.y)) * t);
  const elevation = Math.sin(t * Math.PI) * 42 + (1 - t) * 25;
  return { x: position.x, y: position.y - 17 - elevation, elevation };
}

function groundDropAt(x, y) {
  let closest = null, distance = Infinity;
  for (let i = drops.length - 1; i >= 0; i--) {
    const drop = drops[i], visual = groundDropVisual(drop), dx = Math.abs(x - visual.x), dy = Math.abs(y - visual.y);
    if (dx > 19 || dy > 21) continue;
    const d = Math.hypot(dx, dy);
    if (d < distance) { closest = drop; distance = d; }
  }
  return closest;
}

function setLootPointer(event) {
  if (Math.hypot(event.clientX - lootPointer.clientX, event.clientY - lootPointer.clientY) > 2) lootHover.elapsed = 0;
  const rect = canvas.getBoundingClientRect();
  lootPointer.x = event.clientX - (rect.left || 0); lootPointer.y = event.clientY - (rect.top || 0);
  lootPointer.clientX = event.clientX; lootPointer.clientY = event.clientY;
  lootPointer.inside = lootPointer.x >= 0 && lootPointer.y >= 0 && lootPointer.x <= W && lootPointer.y <= H;
  updateLootHover();
}

function clearLootPointer() {
  lootPointer.inside = false; hoveredLootId = null; lootTooltipSignature = ''; lootHover.id = null; lootHover.elapsed = 0;
  $('loot-tooltip').hidden = true; canvas.style.cursor = '';
}

function grantGroundSupply(id, count) {
  if (!Number.isSafeInteger(count) || count < 1) return false;
  let holder, key;
  if (id.startsWith('material:') && MATERIALS[id.slice(9)]) { holder = p.career.materials; key = id.slice(9); }
  else if (id.startsWith('gem:') && GEMS[id.slice(4)]) { holder = p.career.alchemy.stock; key = id.slice(4); }
  else if (id === 'potions' || id === 'braveryCapes') { holder = p; key = id; }
  else return false;
  if (!Number.isSafeInteger((holder[key] || 0) + count)) return false;
  holder[key] = (holder[key] || 0) + count; return true;
}

function pickUpGroundDrop(id, batch = false) {
  if (!running || paused || p.hp <= 0) return false;
  const index = drops.findIndex(drop => drop.id === id);
  if (index < 0) return false;
  const drop = drops[index], view = groundDropView(drop);
  if (drop.expiresAt <= Date.now()) { drops.splice(index, 1); updateLootHover(); return false; }
  if (!view || drop.fallAge < LOOT_RULES.fallDuration) return false;
  if (Math.hypot(drop.x - p.x, drop.y - p.y) > LOOT_RULES.pickupRange) { toast('Priblíž sa ku koristi a znova klikni alebo stlač Y.'); return false; }
  if (drop.kind === 'gear') {
    if (!addGearItem(cloneGroundDrop(drop).item)) { if (!batch) toast('V inventári nie je dosť miesta. Predmet zostáva na zemi.'); return false; }
  } else if (drop.kind === 'supply') {
    if (!grantGroundSupply(drop.supplyId, drop.count)) return false;
  } else if (drop.kind === 'relic') collectRelic(drop.relicId);
  else if (drop.kind === 'gold') {
    if (!Number.isSafeInteger(drop.count) || drop.count < 1 || !Number.isSafeInteger(p.gold + drop.count)) return false;
    p.gold += drop.count;
  } else return false;
  drops.splice(index, 1);
  if (!batch) finishGroundPickup([view]);
  return true;
}

function finishGroundPickup(items) {
  const message = items.length > 2 ? 'Pozbierané predmety: ' + items.length : items.map(item => '+' + (item.count > 1 ? item.count + ' ' : '') + item.name).join(' · ');
  float(message, p.x, p.y - 75, '#dec799');
  beep(750, .05); updateHUD(); save(); updateLootHover();
}

function collectNearbyGroundDrops(automaticOnly = false) {
  if (!running || paused || p.hp <= 0) return 0;
  expireGroundDrops();
  const candidates = drops.filter(drop => (!automaticOnly || drop.kind === 'gold' || drop.kind === 'supply') && drop.fallAge >= LOOT_RULES.fallDuration && Math.hypot(drop.x - p.x, drop.y - p.y) <= LOOT_RULES.pickupRange);
  candidates.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y) || a.id - b.id);
  const collected = [];
  let blockedGear = false;
  for (const drop of candidates) {
    const view = groundDropView(drop);
    if (pickUpGroundDrop(drop.id, true)) collected.push(view);
    else if (drop.kind === 'gear') blockedGear = true;
  }
  if (collected.length) finishGroundPickup(collected);
  if (blockedGear && !automaticOnly) toast('Časť výbavy sa do inventára nezmestí a zostáva na zemi.');
  return collected.length;
}

function pickNearbyGroundDrops() {
  return collectNearbyGroundDrops(false);
}

function updateGroundLoot(dt) {
  expireGroundDrops();
  if (!running || paused || p.hp <= 0) { updateLootHover(); return; }
  for (const drop of drops) drop.fallAge = Math.min(LOOT_RULES.fallDuration, (drop.fallAge || 0) + dt);
  for(let i=drops.length-1;i>=0;i--)if((drops[i].kind==='gold'||drops[i].kind==='supply')&&grantAutomaticDrop(drops[i]))drops.splice(i,1);
  flushAutomaticLoot();
  updateLootHover(dt);
}
