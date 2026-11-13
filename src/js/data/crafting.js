const CRAFT_RULES = { maxLevel: 10, maxXP: 4500, maxStock: 1e12 };
const CRAFT_MATERIALS = { herb: 'Liečivá bylina', hide: 'Vyčinená koža', crystal: 'Surový kryštál', ingot: 'Oceľový ingot', primal: 'Jadro trhliny' };
Object.assign(MATERIALS, CRAFT_MATERIALS);
const CRAFT_RECIPES = {
  ingot: { name: 'Oceľový ingot', profession: 'crafting', level: 1, xp: 12, cost: { ore: 5, gold: 30 }, output: { material: 'ingot', count: 1 } },
  potion: { name: 'Liečivé elixíry ×6', profession: 'crafting', level: 1, xp: 15, cost: { herb: 1, gold: 10 }, output: { counter: 'potions', count: 6 } },
  cape: { name: 'Plášte statočnosti ×10', profession: 'crafting', level: 2, xp: 20, cost: { hide: 1, essence: 1, gold: 20 }, output: { counter: 'braveryCapes', count: 10 } },
  upgradeStone: { name: 'Kameň vylepšenia', profession: 'crafting', level: 4, xp: 40, cost: { crystal: 4, ingot: 2, dust: 5, gold: 300 }, output: { material: 'upgradeStones', count: 1 } },
  rareBlend: { name: 'Kováčske jadro', profession: 'crafting', level: 6, xp: 65, cost: { crystal: 5, ember: 3, frost: 3, dust: 10, gold: 1000 }, output: { material: 'forgeCore', count: 1 } },
  smithCharm: { name: 'Talizman kováča', profession: 'crafting', level: 6, xp: 65, cost: FORGE_RULES.recipes.smithCharm, output: { material: 'smithCharm', count: 1 } },
  protectionScroll: { name: 'Ochranný zvitok', profession: 'crafting', level: 8, xp: 100, cost: FORGE_RULES.recipes.protectionScroll, output: { material: 'protectionScroll', count: 1 } },
  riftKey: { name: 'Kľúč trhliny', profession: 'crafting', level: 10, xp: 120, cost: { primal: 2, crystal: 10, ingot: 5, gold: 3000 }, output: { material: 'keys', count: 1 } }
};
// Recipe tiers select equipment from the same definitions as natural loot.
for (const [suffix, level, tier, ingots] of [['basic', 1, 1, 2], ['adept', 4, 30, 6], ['master', 8, 60, 12]]) {
  for (const slot of Object.keys(EQUIPMENT)) CRAFT_RECIPES[slot + '-' + suffix] = {
    name: EQUIPMENT[slot].name + ' · Lv.' + tier, profession: 'crafting', level, playerLevel: tier, xp: 20 + level * 10,
    cost: { ingot: ingots, hide: ingots, gold: tier * 25, ...(level >= 4 ? { crystal: ingots } : {}), ...(level >= 8 ? { primal: 1 } : {}) },
    output: { slot, tier, count: 1 }
  };
}
