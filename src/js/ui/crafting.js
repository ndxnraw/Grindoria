let craftingFilter = 'all';
function craftingRecipesPanel(profession) {
  const a = p.career.alchemy, progress = profession === 'alchemy' ? a : p.career.crafting, level = professionLevel(profession);
  const categories = { all: 'Všetky recepty', weapon: 'Zbrane', armor: 'Brnenia', jewelry: 'Šperky', supplies: 'Spotrebné predmety', materials: 'Materiály', special: 'Špeciálne predmety' };
  const category = recipe => recipe.output.slot ? recipe.output.slot === 'weapon' ? 'weapon' : ['bracelet','necklace','earrings'].includes(recipe.output.slot) ? 'jewelry' : recipe.output.slot === 'talisman' ? 'special' : 'armor' : recipe.output.product || recipe.output.counter ? 'supplies' : recipe.output.gem || ['keys','smithCharm','protectionScroll'].includes(recipe.output.material) ? 'special' : 'materials';
  const recipes = Object.entries(CRAFT_RECIPES).filter(([, r]) => r.profession === profession);
  const visible = recipes.filter(([, r]) => craftingFilter === 'all' || category(r) === craftingFilter);
  const activeProduct = a.active && ALCHEMY_PRODUCTS[a.active.id];
  return `<section class="craft-workshop"><h3>${profession === 'alchemy' ? 'Alchymista' : 'Výroba u kováča'} · úroveň ${level} / ${CRAFT_RULES.maxLevel}</h3>
    <p>${level === CRAFT_RULES.maxLevel ? 'Majstrovská úroveň' : 'Prax ' + progress.xp + ' / ' + professionXPForLevel(level + 1)} · vyrobené ${profession === 'alchemy' ? a.produced : progress.crafted}</p>
    <p>${profession === 'alchemy' ? 'Trvalý bonus majstrovstva: +' + ((level - 1) * 3) + ' max. mana. ' : ''}Výroba v Meste pri NPC. Úspech 100 %. Staršie recepty od rozdielu 3 úrovní dávajú štvrtinu praxe.</p>
    <details><summary>Zdroje surovín</summary><p>Primerané bežné príšery: každé 3. primerané zabitie dá bylinu alebo kožu. Boss: 3 byliny a 2 kože. Metin: 1 + ⌊úroveň / 25⌋ kryštálov. Boss aktívnej trhliny: 1 + ⌊stupeň / 10⌋ jadier. Privolaní obrancovia tieto suroviny nedávajú.</p></details>
    ${profession === 'alchemy' ? `<p>Odvary sa nekombinujú. Čas plynie iba počas hry.${activeProduct ? ' Aktívny: ' + activeProduct.name + ' · ' + Math.ceil(a.active.remaining) + ' s.' : ''}</p><div class="craft-products">${Object.entries(ALCHEMY_PRODUCTS).map(([id, product]) => `<div><b>${product.name} · ${a.products[id]} ks</b><small>${product.text}</small><button data-action="product" data-id="${id}" ${!a.products[id] || product.bonus && a.active ? 'disabled' : ''}>Použiť</button></div>`).join('')}</div>` : ''}
    <label>Recepty <select id="craft-filter">${Object.entries(categories).filter(([id]) => id === 'all' || recipes.some(([, r]) => category(r) === id)).map(([id, label]) => `<option value="${id}" ${craftingFilter === id ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
    <div class="craft-recipes">${visible.map(([id, r]) => {
      const reason = recipeBlockReason(id), out = r.output;
      const outcome = out.slot ? `${EQUIPMENT[out.slot].name} · ${rarityName(out.rarity)} · požadovaná úroveň ${out.tier} · náhodné bonusy podľa rarity` : out.product ? ALCHEMY_PRODUCTS[out.product].text : out.gem ? GEMS[out.gem].text : out.counter === 'potions' ? 'Obnoví 65 zdravia za kus.' : '';
      return `<article class="career-card craft-recipe"><h4>${r.name}</h4><p>Remeslo ${r.level}${r.playerLevel ? ' · postava ' + r.playerLevel : ''} · +${Math.max(1, Math.floor(r.xp / (level >= r.level + 3 ? 4 : 1)))} praxe${level === CRAFT_RULES.maxLevel ? ' (maximum)' : ''}</p><p>${outcome}</p>${costRequirements(r.cost)}${Object.keys(r.ingredients||{}).length?'<div class="requirements">'+Object.entries(r.ingredients).map(([key,count])=>requirementRow(ALCHEMY_PRODUCTS[key].name,a.products[key],count)).join('')+'</div>':''}<button class="primary" data-action="recipe" data-id="${id}" ${reason ? 'disabled' : ''}>Vyrobiť</button>${reason ? '<small>' + reason + '</small>' : ''}</article>`;
    }).join('') || '<p>V tejto kategórii nie sú recepty.</p>'}</div></section>`;
}
