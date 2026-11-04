let craftingMessage = '';
function initializeCrafting() {
  p.career.crafting ??= { xp: 0, crafted: 0 };
  const a = p.career.alchemy;
  a.xp ??= 0; a.produced ??= 0;
  a.products ??= Object.fromEntries(Object.keys(ALCHEMY_PRODUCTS).map(id => [id, 0]));
  a.active ??= null;
}
function professionLevel(profession) {
  const xp = profession === 'alchemy' ? p.career.alchemy.xp : p.career.crafting.xp;
  return Math.min(CRAFT_RULES.maxLevel, 1 + Math.floor((Math.sqrt(1 + 8 * xp / 100) - 1) / 2));
}
function professionXPForLevel(level) { return 50 * level * (level - 1); }
function canPayRecipe(cost) {
  return Object.entries(cost).every(([id, n]) => Number.isSafeInteger(n) && n >= 0 && (id === 'gold' ? p.gold : p.career.materials[id]) >= n);
}
function recipeOutputStock(output) {
  if (output.material) return p.career.materials[output.material];
  if (output.product) return p.career.alchemy.products[output.product];
  if (output.gem) return p.career.alchemy.stock[output.gem];
  if (output.counter) return p[output.counter];
  return 0;
}
function recipeBlockReason(id) {
  if (!Object.hasOwn(CRAFT_RECIPES, id)) return 'Neznámy recept.';
  const r = CRAFT_RECIPES[id], npc = r.profession === 'alchemy' ? 'alchemist' : 'smith';
  if (!running || p.hp <= 0) return 'Najprv vstúp do hry so živou postavou.';
  if (!nearNPC(npc)) return r.profession === 'alchemy' ? 'Priblíž sa k alchymistovi v Meste.' : 'Priblíž sa ku kováčovi v Meste.';
  if (professionLevel(r.profession) < r.level) return 'Vyžaduje úroveň remesla ' + r.level + '.';
  if (p.level < (r.playerLevel || 1)) return 'Vyžaduje úroveň postavy ' + r.playerLevel + '.';
  if (!canPayRecipe(r.cost) || Object.entries(r.ingredients || {}).some(([key, n]) => p.career.alchemy.products[key] < n)) return 'Chýbajú materiály alebo Yang.';
  if (!r.output.slot && recipeOutputStock(r.output) + r.output.count > CRAFT_RULES.maxStock) return 'Zásoba dosiahla maximum.';
  if (r.output.slot && !gearLayout([...p.bag, { slot: r.output.slot }])) return 'V inventári nie je dosť súvislého miesta.';
  return '';
}
function craftRecipe(id) {
  craftingMessage = recipeBlockReason(id);
  if (craftingMessage) return false;
  const r = CRAFT_RECIPES[id], out = r.output;
  // Validate every input and the output space before consuming resources or randomness.
  const item = out.slot ? (out.definitionId?createItem(out.definitionId):generateEquipmentItem(out.slot, out.rarity, out.tier)) : null;
  if (item && !addGearItem(item)) return false;
  pay(r.cost);
  for (const [key, n] of Object.entries(r.ingredients || {})) p.career.alchemy.products[key] -= n;
  if (out.material) addMaterial(out.material, out.count);
  if (out.product) p.career.alchemy.products[out.product] += out.count;
  if (out.gem) p.career.alchemy.stock[out.gem] += out.count;
  if (out.counter) p[out.counter] += out.count;
  const progress = r.profession === 'alchemy' ? p.career.alchemy : p.career.crafting;
  progress.xp = Math.min(CRAFT_RULES.maxXP, progress.xp + Math.max(1, Math.floor(r.xp / (professionLevel(r.profession) >= r.level + 3 ? 4 : 1))));
  if (r.profession === 'alchemy') progress.produced++; else progress.crafted++;
  craftingMessage = 'Vyrobené: ' + (item ? item.name : r.name) + '.';
  updateHUD(); save(); return true;
}
function alchemyBonuses() {
  const a = p.career?.alchemy, level = a?.xp === undefined ? 1 : professionLevel('alchemy');
  const bonus = { attack: 0, defense: 0, hp: 0, mp: (level - 1) * 3 };
  if (a?.active?.remaining > 0) for (const [stat, value] of Object.entries(ALCHEMY_PRODUCTS[a.active.id]?.bonus || {})) bonus[stat] += value;
  return bonus;
}
function useAlchemyProduct(id, allowPaused = false) {
  if (!Object.hasOwn(ALCHEMY_PRODUCTS, id) || !running || p.hp <= 0 || paused && !allowPaused || p.career.alchemy.products[id] < 1) return false;
  const product = ALCHEMY_PRODUCTS[id], a = p.career.alchemy;
  if (product.mana) {
    if (p.mp >= maxMP() || potionCooldownRemaining() > 0) return false;
    p.mp = Math.min(maxMP(), p.mp + product.mana); p.potionReadyAt = Date.now() + POTION_RULES.cooldown * 1000;
  } else {
    if (a.active) { toast('Už pôsobí odvar. Počkaj na skončenie účinku.'); return false; }
    a.active = { id, remaining: product.duration };
  }
  a.products[id]--; updateHUD(); save(); return true;
}
function updateAlchemy(dt) {
  const a = p.career.alchemy;
  if (!a.active) return;
  a.active.remaining = Math.max(0, a.active.remaining - dt);
  if (!a.active.remaining) { a.active = null; p.hp = Math.min(p.hp, maxHP()); }
}
function dropCraftMaterials(enemy) {
  if (!rewardEligible(enemy) || enemy.metinParentId) return;
  if (enemy.type === 'stone') dropMaterial('crystal', 1 + Math.floor(enemyLevel(enemy) / 25), enemy);
  else if (enemy.type === 'boss') { dropMaterial('herb', 3, enemy); dropMaterial('hide', 2, enemy); }
  else if (p.career.eligibleKills % 3 === 0) dropMaterial(p.career.eligibleKills % 2 ? 'herb' : 'hide', 1, enemy);
  const run = p.career.endgame.run;
  if (enemy.type === 'boss' && run?.active && enemy.riftId === run.id) dropMaterial('primal', 1 + Math.floor(run.tier / 10), enemy);
}
function validateCraftingProfile(data) {
  if (data.career.crafting !== undefined) {
    assertCharacterObject(data.career.crafting, 'výroba');
    assertCharacterNumber(data.career.crafting.xp, 'prax výroby', 0, CRAFT_RULES.maxXP, true);
    assertCharacterNumber(data.career.crafting.crafted, 'počet výrobkov', 0, 1e12, true);
  }
  const a = data.career.alchemy;
  if (a.xp !== undefined) assertCharacterNumber(a.xp, 'prax alchýmie', 0, CRAFT_RULES.maxXP, true);
  if (a.produced !== undefined) assertCharacterNumber(a.produced, 'počet alchymistických výrobkov', 0, 1e12, true);
  if (a.products !== undefined) {
    assertCharacterObject(a.products, 'alchymistické výrobky');
    for (const id of Object.keys(a.products)) if (!Object.hasOwn(ALCHEMY_PRODUCTS, id)) characterDataError('neznámy alchymistický výrobok.');
    for (const id of Object.keys(ALCHEMY_PRODUCTS)) assertCharacterNumber(a.products[id], 'zásoba výrobku', 0, CRAFT_RULES.maxStock, true);
  }
  if (a.active != null) {
    assertCharacterObject(a.active, 'účinok odvaru');
    if (!Object.hasOwn(ALCHEMY_PRODUCTS, a.active.id) || !ALCHEMY_PRODUCTS[a.active.id].bonus) characterDataError('neznámy odvar.');
    assertCharacterNumber(a.active.remaining, 'trvanie odvaru', 0, ALCHEMY_PRODUCTS[a.active.id].duration);
  }
}
