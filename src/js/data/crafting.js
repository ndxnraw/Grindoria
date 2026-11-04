const CRAFT_RULES = { maxLevel: 10, maxXP: 4500, maxStock: 1e12 };
const CRAFT_MATERIALS = { herb: 'Liečivá bylina', hide: 'Vyčinená koža', crystal: 'Surový kryštál', ingot: 'Oceľový ingot', extract: 'Bylinný extrakt', primal: 'Jadro trhliny' };
Object.assign(MATERIALS, CRAFT_MATERIALS);
const ALCHEMY_PRODUCTS = {
  mana: { name: 'Elixír many', text: 'Obnoví 80 many alebo 30 % maxima, podľa vyššej hodnoty. Spoločný cooldown elixírov 4 s.', mana: 80, icon: 'essence' },
  might: { name: 'Odvar sily', text: '+4 útok na 120 s.', bonus: { attack: 4 }, duration: 120, icon: 'ember' },
  guard: { name: 'Odvar odolnosti', text: '+4 obrana na 120 s.', bonus: { defense: 4 }, duration: 120, icon: 'jade' },
  vitality: { name: 'Odvar vitality', text: '+60 max. zdravie na 120 s. Nedopĺňa zdravie.', bonus: { hp: 60 }, duration: 120, icon: 'potion' },
  greaterMight: { name: 'Koncentrát sily', text: '+10 útok na 180 s.', bonus: { attack: 10 }, duration: 180, icon: 'ruby' }
};
const CRAFT_RECIPES = {
  ingot: { name: 'Oceľový ingot', profession: 'crafting', level: 1, xp: 12, cost: { ore: 5, gold: 30 }, output: { material: 'ingot', count: 1 } },
  potion: { name: 'Liečivé elixíry ×6', profession: 'alchemy', level: 1, xp: 15, cost: { herb: 1, gold: 10 }, output: { counter: 'potions', count: 6 } },
  extract: { name: 'Bylinný extrakt', profession: 'alchemy', level: 1, xp: 12, cost: { herb: 4, essence: 2, gold: 20 }, output: { material: 'extract', count: 1 } },
  mana: { name: 'Elixír many', profession: 'alchemy', level: 1, xp: 15, cost: { herb: 2, essence: 4, gold: 25 }, output: { product: 'mana', count: 1 } },
  cape: { name: 'Plášte statočnosti ×10', profession: 'crafting', level: 2, xp: 20, cost: { hide: 1, essence: 1, gold: 20 }, output: { counter: 'braveryCapes', count: 10 } },
  might: { name: 'Odvar sily', profession: 'alchemy', level: 2, xp: 22, cost: { extract: 2, wolf: 2, gold: 80 }, output: { product: 'might', count: 1 } },
  guard: { name: 'Odvar odolnosti', profession: 'alchemy', level: 3, xp: 30, cost: { extract: 2, crystal: 2, gold: 100 }, output: { product: 'guard', count: 1 } },
  vitality: { name: 'Odvar vitality', profession: 'alchemy', level: 4, xp: 40, cost: { extract: 3, frost: 2, dust: 3, gold: 150 }, output: { product: 'vitality', count: 1 } },
  upgradeStone: { name: 'Kameň vylepšenia', profession: 'crafting', level: 4, xp: 40, cost: { crystal: 4, ingot: 2, dust: 5, gold: 300 }, output: { material: 'upgradeStones', count: 1 } },
  rareBlend: { name: 'Kováčske jadro', profession: 'alchemy', level: 6, xp: 65, cost: { crystal: 5, ember: 3, frost: 3, dust: 10, gold: 1000 }, output: { material: 'forgeCore', count: 1 } },
  greaterMight: { name: 'Koncentrát sily', profession: 'alchemy', level: 7, xp: 80, cost: { extract: 4, crystal: 4, gold: 800 }, ingredients: { might: 3 }, output: { product: 'greaterMight', count: 1 } },
  smithCharm: { name: 'Talizman kováča', profession: 'crafting', level: 6, xp: 65, cost: FORGE_RULES.recipes.smithCharm, output: { material: 'smithCharm', count: 1 } },
  protectionScroll: { name: 'Ochranný zvitok', profession: 'crafting', level: 8, xp: 100, cost: FORGE_RULES.recipes.protectionScroll, output: { material: 'protectionScroll', count: 1 } },
  riftKey: { name: 'Kľúč trhliny', profession: 'crafting', level: 10, xp: 120, cost: { primal: 2, crystal: 10, ingot: 5, gold: 3000 }, output: { material: 'keys', count: 1 } }
};
// Equipment uses the same generator, slot sizes and rarity identities as natural loot.
for (const [suffix, level, tier, rarity, ingots] of [['basic', 1, 1, 0, 2], ['adept', 4, 20, 1, 6], ['master', 8, 50, 2, 12]]) {
  for (const slot of Object.keys(EQUIPMENT)) CRAFT_RECIPES[slot + '-' + suffix] = {
    name: EQUIPMENT[slot].name + ' · Lv.' + tier + ' · ' + rarityNameForRecipe(rarity), profession: 'crafting', level, playerLevel: tier, xp: 20 + level * 10,
    cost: { ingot: ingots, hide: ingots, gold: tier * 25, ...(level >= 4 ? { crystal: ingots } : {}), ...(level >= 8 ? { primal: 1 } : {}) },
    output: { slot, tier, rarity, count: 1 }
  };
}
function rarityNameForRecipe(rarity) { return RARITIES.find(spec => spec.id === rarity).name; }
for (const id of Object.keys(GEMS)) CRAFT_RECIPES['gem-' + id] = { name: GEMS[id].name, profession: 'alchemy', level: 1, xp: 20, cost: { essence: 30, ore: 3, gold: 100 }, output: { gem: id, count: 1 } };
