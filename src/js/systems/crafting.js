let craftingMessage = '';
function initializeCrafting() {
  p.career.crafting ??= { xp: 0, crafted: 0 };

}
function professionLevel(profession) {
  const xp=p.career.crafting.xp;
  return Math.min(CRAFT_RULES.maxLevel, 1 + Math.floor((Math.sqrt(1 + 8 * xp / 100) - 1) / 2));
}
function professionXPForLevel(level) { return 50 * level * (level - 1); }
function canPayRecipe(cost) {
  return Object.entries(cost).every(([id, n]) => Number.isSafeInteger(n) && n >= 0 && (id === 'gold' ? p.gold : p.career.materials[id]) >= n);
}
function recipeOutputStock(output) {
  if (output.material) return p.career.materials[output.material];
  if (output.counter) return p[output.counter];
  return 0;
}
function recipeBlockReason(id) {
  if (!Object.hasOwn(CRAFT_RECIPES, id)) return 'Neznámy recept.';
  const r = CRAFT_RECIPES[id], npc='smith';
  if (!running || p.hp <= 0) return 'Najprv vstúp do hry so živou postavou.';
  if (!nearNPC(npc)) return 'Priblíž sa ku kováčovi v Meste.';
  if (professionLevel(r.profession) < r.level) return 'Vyžaduje úroveň remesla ' + r.level + '.';
  if (p.level < (r.playerLevel || 1)) return 'Vyžaduje úroveň postavy ' + r.playerLevel + '.';
  if (!canPayRecipe(r.cost)) return 'Chýbajú materiály alebo Yang.';
  if (!r.output.slot && recipeOutputStock(r.output) + r.output.count > CRAFT_RULES.maxStock) return 'Zásoba dosiahla maximum.';
  if (r.output.slot && !gearLayout([...p.bag, { slot: r.output.slot }])) return 'V inventári nie je dosť súvislého miesta.';
  return '';
}
function craftRecipe(id) {
  craftingMessage = recipeBlockReason(id);
  if (craftingMessage) return false;
  const r = CRAFT_RECIPES[id], out = r.output;
  // Validate every input and the output space before consuming resources or randomness.
  const item = out.slot ? (out.definitionId?createItem(out.definitionId):rewardEquipment(out.slot, 0, out.tier, undefined, ()=>0)) : null;
  if (item && !addGearItem(item)) return false;
  pay(r.cost);
  if (out.material) addMaterial(out.material, out.count);
  if (out.counter) p[out.counter] += out.count;
  const progress=p.career.crafting;
  progress.xp = Math.min(CRAFT_RULES.maxXP, progress.xp + Math.max(1, Math.floor(r.xp / (professionLevel(r.profession) >= r.level + 3 ? 4 : 1))));
  progress.crafted++;
  craftingMessage = 'Vyrobené: ' + (item ? item.name : r.name) + '.';
  updateHUD(); save(); return true;
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
}
