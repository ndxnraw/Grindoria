const test=require('node:test'),assert=require('node:assert/strict');
const {createGame}=require('./helpers/game.cjs');
test('service grids reuse equipment footprints without modifying items or consuming randomness',()=>{
 const {run}=createGame();run('var entries=Object.keys(EQUIPMENT).map(id=>({id,item:{slot:id,name:EQUIPMENT[id].name,rarity:1},label:EQUIPMENT[id].name}));var before=JSON.stringify(entries);rand=()=>{throw Error("UI consumed randomness");};');
 const html=run('serviceTileGrid(entries,"armor","service-select",0)');assert.match(html,/service-grid/);assert.match(html,/span 2/);assert.match(html,/aria-pressed="true"/);assert.equal(run('JSON.stringify(entries)'),run('before'));
});
test('graphical costs retain quantities, material names and missing requirements',()=>{
 const {run}=createGame();run('p.gold=25;p.career.materials.ore=2;');const html=run('serviceCostTiles({ore:5,gold:30})');
 for(const word of ['Ruda','Yang','Chýba 3','Chýba 5','is-missing'])assert(html.includes(word));assert.match(html,/item-icon/);
});
test('recipe previews render catalog and generated output without creating inventory items',()=>{
 const {run}=createGame();run('var before=JSON.stringify([p.inventory,p.bag,p.equipped]);rand=()=>{throw Error("UI consumed randomness");};');
 assert.equal(run('recipePreviewItem(CRAFT_RECIPES["iconic-fms"]).modelId'),run('ITEM_DEFINITIONS[CRAFT_RECIPES["iconic-fms"].output.definitionId].modelId'));
 assert.equal(run('recipePreviewItem(CRAFT_RECIPES["armor-basic"]).slot'),'armor');assert.equal(run('recipePreviewItem(CRAFT_RECIPES.potion).icon'),'potion');
 run('p.classId="shaman";');assert.equal(run('recipePreviewItem(CRAFT_RECIPES["weapon-basic"]).weaponKind'),'fan');
 assert.equal(run('JSON.stringify([p.inventory,p.bag,p.equipped])'),run('before'));
});
test('merchant and smith display graphic grids with one selected transaction detail',()=>{
 const {run,elements}=createGame();run('running=true;loadMap("town",true);p.x=NPCS.merchant.x;p.y=NPCS.merchant.y;marketPanel();');assert.match(elements.get('modalcontent').innerHTML,/service-grid/);assert.match(elements.get('modalcontent').innerHTML,/data-market-buy="potions"/);
 run('p.x=NPCS.smith.x;p.y=NPCS.smith.y;interactNPC("smith");smithPanel("forge");');assert.match(elements.get('modalcontent').innerHTML,/data-forge-select=/);
 run('smithPanel("crafting");');assert.match(elements.get('modalcontent').innerHTML,/data-recipe-select=/);assert.match(elements.get('modalcontent').innerHTML,/service-cost-grid/);
});
