function requiredItemLevel(item) { return Number.isSafeInteger(item.requiredLevel) && item.requiredLevel > 0 ? item.requiredLevel : 1; }
function canEquipItem(item) { return !!EQUIPMENT[item?.slot] && p.level >= requiredItemLevel(item) && (!Array.isArray(item.classes) || item.classes.includes(p.classId)); }
function itemEquipReason(item) { if (!EQUIPMENT[item?.slot]) return 'Predmet nemožno vybaviť.'; if (p.level < requiredItemLevel(item)) return 'Nedostatočná úroveň · vyžaduje ' + requiredItemLevel(item); if (Array.isArray(item.classes) && !item.classes.includes(p.classId)) return 'Predmet nie je pre tvoje povolanie.'; return 'Možno vybaviť · ' + EQUIPMENT[item.slot].name; }

function itemSize(item) { return EQUIPMENT[item.slot]?.size || [1, 1]; }

function itemCells(item, cell) {
  const [w, h] = itemSize(item), page = Math.floor(cell / INVENTORY.pageSize), local = cell % INVENTORY.pageSize;
  if (!Number.isInteger(cell) || cell < 0 || local % INVENTORY.columns + w > INVENTORY.columns || Math.floor(local / INVENTORY.columns) + h > INVENTORY.rows) return null;
  return Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => page * INVENTORY.pageSize + local + y * INVENTORY.columns + x)).flat();
}

function gearLayout(items, pages = p.inventory.pages, preserve = true) {
  const occupied = new Set(), layout = new Map(), pending = [];
  const fits = (item, cell) => { const cells = itemCells(item, cell); return cells && cells.every(n => n < pages * INVENTORY.pageSize && !occupied.has(n)); };
  const place = (item, cell) => { itemCells(item, cell).forEach(n => occupied.add(n)); layout.set(item, cell); };
  for (const item of items) {
    if (preserve && fits(item, item.cell)) place(item, item.cell);
    else pending.push(item);
  }
  for (const item of pending) {
    let cell = 0;
    while (cell < pages * INVENTORY.pageSize && !fits(item, cell)) cell++;
    if (cell === pages * INVENTORY.pageSize) return null;
    place(item, cell);
  }
  return layout;
}

function applyGearLayout(layout) { for (const [item, cell] of layout) item.cell = cell; }

function initializeInventory() {
  p.inventory ??= { schema: INVENTORY.schema, pages: INVENTORY.pages, serial: 0, supplyCells: {} };
  p.inventory.pages = Math.max(INVENTORY.pages, Math.floor(Number(p.inventory.pages) || 0));
  p.inventory.serial = Math.max(0, Math.floor(Number(p.inventory.serial) || 0));
  p.inventory.supplyCells ??= {};
  const used = new Set();
  for (const item of [...p.bag, ...Object.values(p.equipped).filter(Boolean)]) {
    if (!EQUIPMENT[item.slot]) item.slot = 'talisman';
    if (!Number.isSafeInteger(item.uid) || item.uid < 1 || used.has(item.uid)) item.uid = ++p.inventory.serial;
    used.add(item.uid); p.inventory.serial = Math.max(p.inventory.serial, item.uid);
  }
  for (const id of Object.keys(EQUIPMENT)) p.equipped[id] ??= null;
  // Expand only to preserve existing items during migration; ordinary drops never expand the bag.
  let layout = gearLayout(p.bag);
  while (!layout) { p.inventory.pages++; layout = gearLayout(p.bag); }
  applyGearLayout(layout); p.inventory.schema = INVENTORY.schema;
}

function itemBonuses(item) {
  const b = Object.fromEntries(Object.keys(ITEM_STATS).map(id => [id, 0]));
  if (!item || !EQUIPMENT[item.slot]) return b;
  const stat = EQUIPMENT[item.slot].stat;
  b[stat] += ((Number(item.bonus) || 0) + enhancementBonus(item)) * (stat === 'crit' ? .01 : 1);
  for (const [id, value] of Object.entries(item.stats || {})) if (Object.hasOwn(b, id) && Number.isFinite(value)) b[id] += value;
  return b;
}

function equipmentBonuses() {
  const b = itemBonuses(null);
  for (const id of Object.keys(EQUIPMENT)) {
    const item = p.equipped[id];
    if (!item || item.slot !== id) continue;
    for (const [stat, value] of Object.entries(itemBonuses(item))) b[stat] += value;
  }
  return b;
}

function addGearItem(item) {
  if (!EQUIPMENT[item.slot]) return false;
  const layout = gearLayout([...p.bag, item]);
  if (!layout) return false;
  item.uid = ++p.inventory.serial; p.bag.push(item); applyGearLayout(layout); return true;
}

function finishInventoryChange() {
  p.hp = Math.min(p.hp, maxHP()); p.mp = Math.min(p.mp, maxMP());
  updateHUD(); save();
}

function equipItem(index) {
  if (!Number.isInteger(index) || index < 0 || index >= p.bag.length) return false;
  const item = p.bag[index], slot = item.slot;
  if (!canEquipItem(item)) { toast(itemEquipReason(item)); return false; }
  const old = p.equipped[slot], next = p.bag.filter((_, i) => i !== index);
  if (old) next.push(old);
  const layout = gearLayout(next);
  if (!layout) return false;
  p.bag = next; p.equipped[slot] = item; delete item.cell; applyGearLayout(layout);
  finishInventoryChange(); inventory(); return true;
}

function unequipItem(slot, cell = null) {
  const item = p.equipped[slot];
  if (!EQUIPMENT[slot] || !item) return false;
  const oldCell = item.cell;
  if (cell !== null) item.cell = cell;
  const next = [...p.bag, item], layout = gearLayout(next);
  if (cell !== null && layout?.get(item) !== cell || !layout) { item.cell = oldCell; return false; }
  p.bag = next; p.equipped[slot] = null; applyGearLayout(layout);
  finishInventoryChange(); inventory(); return true;
}

function moveGearItem(uid, cell) {
  const item = p.bag.find(item => item.uid === uid);
  if (!item || !itemCells(item, cell) || cell >= p.inventory.pages * INVENTORY.pageSize) return false;
  const target = new Set(itemCells(item, cell)), conflicts = p.bag.filter(other => other !== item && itemCells(other, other.cell)?.some(n => target.has(n)));
  if (conflicts.length > 1) return false;
  const other = conflicts[0], old = item.cell, otherCell = other?.cell;
  item.cell = cell; if (other) other.cell = old;
  const layout = gearLayout(p.bag);
  if (!layout || p.bag.some(m => layout.get(m) !== m.cell)) {
    item.cell = old; if (other) other.cell = otherCell; return false;
  }
  applyGearLayout(layout); finishInventoryChange(); return true;
}

function supplyDefinitions() {
  return [
    { id: 'potions', name: 'Liečivý elixír', count: p.potions, icon: 'potion', description: 'Obnoví 65 zdravia. Kláves E. Spoločný cooldown 4 s aj pre Autoelixíry.', action: 'drink' },
    { id: 'braveryCapes', name: 'Plášť statočnosti', count: p.braveryCapes, icon: 'cape', description: 'Privolá pohyblivých nepriateľov v dosahu 650 na 18 sekúnd. Kláves B.', action: 'cape' },
    ...Object.entries(MATERIALS).map(([id, name]) => ({ id: 'material:' + id, name, count: p.career.materials[id], icon: id, description: ['ore','upgradeStones','forgeCore','smithCharm','protectionScroll'].includes(id)?'Použitie: kováč.':'Materiál na progresiu.', action: 'material', material: id })),
    ...Object.entries(ALCHEMY_PRODUCTS).map(([id, product]) => ({ id: 'alchemy:' + id, name: product.name, count: p.career.alchemy.products[id], icon: product.icon, description: product.text, action: 'product' })),
    ...Object.entries(GEMS).map(([id, gem]) => ({ id: 'gem:' + id, name: gem.name, count: p.career.alchemy.stock[id], icon: id, description: gem.text + ' Použitie otvorí alchýmiu.', action: 'alchemy' }))
  ];
}

function supplyEntries() {
  const all = supplyDefinitions();
  const entries = all.filter(item => item.count > 0), occupied = new Set();
  for (const item of entries) {
    let cell = p.inventory.supplyCells[item.id];
    if (!Number.isInteger(cell) || cell < 0 || cell >= INVENTORY.pageSize || occupied.has(cell)) {
      cell = 0; while (occupied.has(cell)) cell++;
      p.inventory.supplyCells[item.id] = cell;
    }
    item.cell = cell; occupied.add(cell);
  }
  return entries;
}

function moveSupplyItem(id, cell) {
  if (!Number.isInteger(cell) || cell < 0 || cell >= INVENTORY.pageSize) return false;
  const entries = supplyEntries(), item = entries.find(item => item.id === id);
  if (!item) return false;
  const other = entries.find(item => item.cell === cell);
  if (other) p.inventory.supplyCells[other.id] = item.cell;
  p.inventory.supplyCells[id] = cell; save(); return true;
}

function sortInventory(tab = 'gear') {
  if (tab === 'supplies') {
    supplyEntries().sort((a, b) => a.name.localeCompare(b.name, 'sk')).forEach((item, i) => p.inventory.supplyCells[item.id] = i);
  } else {
    const sorted = [...p.bag].sort((a, b) => { const [aw, ah] = itemSize(a), [bw, bh] = itemSize(b); return bw * bh - aw * ah || rarityRank(b.rarity) - rarityRank(a.rarity) || (b.tier || 0) - (a.tier || 0) || String(a.name).localeCompare(String(b.name), 'sk'); });
    const layout = gearLayout(sorted, p.inventory.pages, false);
    if (!layout) return false;
    p.bag = sorted; applyGearLayout(layout);
  }
  save(); return true;
}

function consumeSupply(id, count) {
  if (!Number.isSafeInteger(count) || count < 1) return false;
  const item = supplyEntries().find(item => item.id === id);
  if (!item || item.count < count) return false;
  if (id.startsWith('material:')) p.career.materials[id.slice(9)] -= count;
  else if (id.startsWith('gem:')) p.career.alchemy.stock[id.slice(4)] -= count;
  else if (id.startsWith('alchemy:')) p.career.alchemy.products[id.slice(8)] -= count;
  else p[id] -= count;
  return true;
}

function deleteInventoryItem(id, count = 1) {
  if (id.startsWith('gear:')) {
    const index = p.bag.findIndex(item => 'gear:' + item.uid === id);
    if (index < 0 || count !== 1) return false;
    p.bag.splice(index, 1);
  } else if (!consumeSupply(id, count)) return false;
  finishInventoryChange(); return true;
}

function useInventorySupply(id) {
  const item = supplyEntries().find(item => item.id === id);
  if (!item || !running || p.hp <= 0) return false;
  if (item.action === 'product') return useAlchemyProduct(id.slice(8), true);
  if (item.material && Object.hasOwn(CRAFT_MATERIALS, item.material)) { careerPanel(['herb','extract','crystal'].includes(item.material) ? 'alchemy' : 'crafting'); return true; }
  if (item.action === 'drink') return drinkPotion(true);
  if (item.action === 'cape') {
    if (isSanctuary(p) || capeCooldown > 0) return false;
    closeModal(); return useBraveryCape();
  }
  const tab = item.action === 'alchemy' || ['dust', 'essence'].includes(item.material) ? 'alchemy' : ['ore','upgradeStones','forgeCore','smithCharm','protectionScroll'].includes(item.material) ? 'forge' : item.material === 'books' ? 'skills' : item.material === 'training' ? 'training' : ['keys', 'shards'].includes(item.material) ? 'endgame' : 'biology';
  careerPanel(tab); return true;
}

function sellItem(index) {
  if (!Number.isInteger(index) || index < 0 || index >= p.bag.length) return false;
  if(!sellMarketGear(p.bag[index].uid)){toast('Predaj výbavu pri obchodníkovi v Meste.');return false;}
  inventory(); return true;
}

