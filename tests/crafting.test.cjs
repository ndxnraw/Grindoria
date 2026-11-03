const test = require('node:test'), assert = require('node:assert/strict');
const { createGame, readSavedAccount } = require('./helpers/game.cjs');
function workshop(profession = 'crafting') {
  const g = createGame();
  g.run(`running=true;loadMap('town',true);Object.assign(p,{x:NPCS.${profession === 'alchemy' ? 'alchemist' : 'smith'}.x,y:630,gold:1e9,level:60});p.hp=maxHP();for(const id of Object.keys(MATERIALS))p.career.materials[id]=100000;`);
  return g;
}
test('recipes require the right living character, NPC, profession level and resources without charging on failure', () => {
  const {run} = workshop();
  for (const setup of ['p.x=50;', 'p.hp=0;', 'running=false;', 'p.career.materials.ore=0;']) {
    run('running=true;p.hp=100;p.x=NPCS.smith.x;p.career.materials.ore=100;'+setup+'var before=JSON.stringify(p);');
    assert.equal(run('craftRecipe("ingot")'),false);assert.equal(run('JSON.stringify(p)'),run('before'));
  }
  run('running=true;p.hp=100;p.career.materials.ore=100;p.x=NPCS.smith.x;');
  assert(!run('craftRecipe("weapon-master")'));assert(!run('craftRecipe("mana")'));assert(!run('craftRecipe("constructor")'));
});
test('processing costs exact materials, awards independent practice and unlocks higher recipes', () => {
  const {run} = workshop();run('var ore=p.career.materials.ore,gold=p.gold;');
  assert(run('craftRecipe("ingot")'));assert.equal(run('p.career.materials.ore'),run('ore-5'));assert.equal(run('p.gold'),run('gold-30'));
  assert.equal(run('p.career.crafting.xp'),12);assert.equal(run('p.career.alchemy.xp'),0);
  run('for(let i=0;i<8;i++)craftRecipe("ingot");');assert.equal(run('professionLevel("crafting")'),2);assert(run('craftRecipe("cape")'));
  run('p.career.crafting.xp=4500;craftRecipe("ingot");');assert.equal(run('p.career.crafting.xp'),4500);assert.equal(run('professionLevel("crafting")'),10);
});
test('all ten slots and every recipe tier produce valid equippable gear through the shared generator', () => {
  const {run} = workshop();run('p.career.crafting.xp=4500;');
  for (const slot of run('Object.keys(EQUIPMENT)')) for (const tier of ['basic','adept','master']) {
    run('p.bag=[];');assert(run(`craftRecipe('${slot}-${tier}')`));
    assert.equal(run('p.bag[0].slot'),slot);assert(run('canEquipItem(p.bag[0])'));run('validateCharacterItem(p.bag[0]);validateCharacterAccount(accountWithActiveSnapshot());');
  }
});
test('a full grid rejects equipment before consuming inputs, IDs, practice or randomness', () => {
  const {run} = workshop();run('for(let i=0;i<90;i++)addGearItem({slot:"bracelet",name:"Plný batoh",bonus:1});var before=JSON.stringify(p);rand=()=>{throw Error("randomness consumed");};');
  assert(!run('craftRecipe("weapon-basic")'));assert.equal(run('JSON.stringify(p)'),run('before'));
  assert(run('craftRecipe("ingot")'));
});
test('alchemy processes herbs, makes healing and mana potions and upgrades existing products', () => {
  const {run} = workshop('alchemy');run('var pots=p.potions;');assert(run('craftRecipe("potion")'));assert.equal(run('p.potions'),run('pots+3'));
  assert(run('craftRecipe("extract")'));assert(run('craftRecipe("mana")'));run('p.career.alchemy.xp=4500;p.career.alchemy.products.might=3;var before=p.career.materials.extract;');
  assert(run('craftRecipe("greaterMight")'));assert.equal(run('p.career.alchemy.products.might'),0);assert.equal(run('p.career.alchemy.products.greaterMight'),1);assert.equal(run('p.career.materials.extract'),run('before-4'));
  run('var state=JSON.stringify(p);');assert(!run('craftRecipe("greaterMight")'));assert.equal(run('JSON.stringify(p)'),run('state'));
});
test('mana products use the shared potion cooldown and cannot be wasted at full mana', () => {
  const {run} = workshop('alchemy');run('p.career.alchemy.products.mana=3;p.mp=maxMP();');assert(!run('useAlchemyProduct("mana")'));
  run('p.mp=1;');assert(run('useAlchemyProduct("mana")'));assert.equal(run('p.mp'),81);assert(!run('useAlchemyProduct("mana")'));assert.equal(run('p.career.alchemy.products.mana'),2);assert(!run('drinkPotion()'));
});
test('tonics affect real statistics, never heal by swapping, respect pause and expire safely', () => {
  const {run} = workshop('alchemy');run('p.career.alchemy.products.might=2;p.career.alchemy.products.vitality=2;var dmg=damage(),hp=p.hp,max=maxHP();');
  assert(run('useAlchemyProduct("might")'));assert.equal(run('damage()'),run('dmg+4'));assert(!run('useAlchemyProduct("vitality")'));
  run('paused=true;update(2);');assert.equal(run('p.career.alchemy.active.remaining'),120);
  run('paused=false;updateAlchemy(121);');assert.equal(run('damage()'),run('dmg'));assert(run('useAlchemyProduct("vitality")'));assert.equal(run('maxHP()'),run('max+60'));assert.equal(run('p.hp'),run('hp'));
  run('p.hp=maxHP();updateAlchemy(121);');assert.equal(run('p.hp'),run('max'));assert.equal(run('p.career.alchemy.active'),null);
});
test('mastery grants permanent mana and original gem fusion remains compatible', () => {
  const {run} = workshop('alchemy');run('var mp=maxMP();p.career.alchemy.xp=4500;');assert.equal(run('maxMP()'),run('mp+27'));
  assert(run('craftGem("ruby")'));assert(run('upgradeGem("ruby")'));assert.equal(run('p.career.alchemy.equipped.ruby'),1);assert.equal(run('careerBonuses().attack'),2);
});
test('eligible enemy, Metin and dungeon sources grant new materials once through actual kills', () => {
  const {run} = createGame();run('running=true;rand=()=>.999;p.level=1;var wolf=mobs.find(m=>m.type==="wolf");p.career.eligibleKills=2;hit(wolf,999999);var herbs=p.career.materials.herb;hit(wolf,999999);');assert.equal(run('herbs'),1);assert.equal(run('p.career.materials.herb'),1);
  run('var stone=mobs.find(m=>m.type==="stone");hit(stone,999999);');assert(run('p.career.materials.crystal>0'));
  run('p.career.endgame.run={id:123,tier:20,active:true};var primal=p.career.materials.primal;dropCraftMaterials({type:"boss",level:35,riftId:123,x:p.x,y:p.y});');assert.equal(run('p.career.materials.primal'),run('primal+3'));
  run('dropCraftMaterials({type:"boss",level:35,riftId:124,x:p.x,y:p.y});dropCraftMaterials({type:"boss",level:35,riftId:123,metinParentId:"stone",x:p.x,y:p.y});p.level=99;dropCraftMaterials({type:"boss",level:1,riftId:123,x:p.x,y:p.y});');assert.equal(run('p.career.materials.primal'),run('primal+3'));
});
test('products integrate with inventory stacks, consumption and transactional backup validation', () => {
  const {run} = workshop('alchemy');assert(run('craftRecipe("mana")'));run('paused=true;p.mp=1;');assert(run('useInventorySupply("alchemy:mana")'));
  run('p.career.alchemy.products.guard=2;p.inventory.supplyCells["alchemy:guard"]=5;');assert(run('consumeSupply("alchemy:guard",1)'));run('var backup=exportCharacters();var prepared=prepareCharacterImport(backup);');
  for (const invalid of ['a.xp=-1','a.products.guard=-1','a.products.unknown=1','a.active={id:"mana",remaining:20}','a.active={id:"might",remaining:9999}']) {
    assert.throws(()=>run('var doc=JSON.parse(backup),a=doc.account.profiles[doc.account.selectedId].data.career.alchemy;'+invalid+';prepareCharacterImport(JSON.stringify(doc));'),/Neplatná záloha/);
  }
});
test('old registers gain only missing fields, preserve gems and isolate new progress between profiles', () => {
  const game = workshop('alchemy'), {run,saved} = game;run('p.career.alchemy.equipped.ruby=3;save();');const old=readSavedAccount(saved),id=old.selectedId;
  delete old.profiles[id].data.career.crafting;const a=old.profiles[id].data.career.alchemy;for(const key of ['xp','produced','products','active'])delete a[key];for(const key of ['herb','hide','crystal','ingot','extract','primal'])delete old.profiles[id].data.career.materials[key];
  const restored=createGame(null,'grindoria-save-v1',{'grindoria-characters-v1':old});assert.equal(restored.run('p.career.alchemy.equipped.ruby'),3);assert.equal(restored.run('p.career.crafting.xp'),0);assert.equal(restored.run('p.career.materials.herb'),0);
  restored.run('p.career.alchemy.xp=100;p.career.alchemy.products.might=2;save();returnToCharacters();var other=createCharacter("Remeselnik","ninja");playCharacter(other);');assert.equal(restored.run('p.career.alchemy.xp'),0);assert.equal(restored.run('p.career.alchemy.products.might'),0);
  restored.run('returnToCharacters();playCharacter('+JSON.stringify(id)+');');assert.equal(restored.run('p.career.alchemy.xp'),100);assert.equal(restored.run('p.career.alchemy.products.might'),2);
});
test('crafted equipment, active tonic and practice survive reload and backup replacement', () => {
  const {run,saved} = workshop('alchemy');run('p.career.alchemy.xp=700;p.career.alchemy.products.might=2;useAlchemyProduct("might");p.career.crafting.xp=4500;p.x=NPCS.smith.x;craftRecipe("weapon-master");save();var backup=exportCharacters();');
  const reloaded=createGame(null,'grindoria-save-v1',Object.fromEntries(saved));assert.equal(reloaded.run('p.career.alchemy.active.id'),'might');assert.equal(reloaded.run('p.career.alchemy.active.remaining'),120);assert.equal(reloaded.run('p.career.alchemy.products.might'),1);assert.equal(reloaded.run('p.bag[0].tier'),50);
  reloaded.run('returnToCharacters();var prepared=prepareCharacterImport('+JSON.stringify(run('backup'))+');importCharacterBackup(prepared,"replace",{confirmReplace:true});playCharacter();');assert.equal(reloaded.run('p.career.alchemy.xp'),700);assert.equal(reloaded.run('p.career.alchemy.active.id'),'might');assert.equal(reloaded.run('p.bag[0].rarity'),2);
});
test('both panels show progress, recipes, resource counts, gates and usable products', () => {
  const {run,elements} = workshop('alchemy');run('careerPanel("alchemy");');let html=elements.get('modalcontent').innerHTML;assert.match(html,/Alchymista · úroveň 1/);assert.match(html,/Elixír many/);assert.match(html,/máš/);assert.match(html,/Koncentrát sily/);
  run('p.x=NPCS.smith.x;careerPanel("crafting");');html=elements.get('modalcontent').innerHTML;assert.match(html,/Výroba u kováča/);assert.match(html,/Zbraň/);assert.match(html,/Kľúč trhliny/);
});
