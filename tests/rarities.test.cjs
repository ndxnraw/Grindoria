const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,createEmptyGame,readSavedProfile}=require('./helpers/game.cjs');
test('six stable rarity IDs have ordered ranks, colors and properly normalized source-specific odds',()=>{
 const {run}=createGame();assert.deepEqual(Array.from(run('RARITIES.map(r=>r.name)')),['Common','Uncommon','Rare','Epic','Legendary','Mythic']);
 assert.equal(run('new Set(RARITIES.map(r=>r.color)).size'),6);assert.equal(run('rarityName(1)'),'Rare');assert.equal(run('rarityName(2)'),'Epic');
 for(const type of ['normal','elite','rare','boss','metin']){
  run('var source={type:"'+(type==='boss'?'boss':type==='metin'?'stone':'wolf')+'",variant:"'+type+'",level:99,metinType:"doom"};var odds=itemRarityChances(source);var cumulative=0;');
  assert(Math.abs(run('odds.reduce((sum,r)=>sum+r.chance,0)')-1)<1e-12);
  for(let i=0;i<6;i++){assert(run('odds['+i+'].chance>0'));const midpoint=run('cumulative+odds['+i+'].chance/2');assert.equal(run('rollItemRarity(source,false,()=>'+midpoint+')'),run('RARITIES['+i+'].id'));run('cumulative+=odds['+i+'].chance;');}
 }
 assert(run('itemRarityChances({type:"boss",level:99})[5].chance>itemRarityChances({type:"wolf",level:99})[5].chance'));
 for(const [level,legendary,mythic]of [[49,false,false],[50,true,false],[74,true,false],[75,true,true]]){
  run('var gated=itemRarityChances({type:"boss",level:'+level+'});');assert.equal(run('gated[4].chance>0'),legendary);assert.equal(run('gated[5].chance>0'),mythic);
 }
});
test('random affixes are unique, reproducible, tier-scaled and more numerous and stronger with rarity',()=>{
 const {run}=createGame();run('var rng=layoutRandom("affix-test");');
 for(const rarity of [0,3,1,2,4,5])for(const slot of Object.keys(run('EQUIPMENT'))){
  run('var gear=generateEquipmentItem("'+slot+'",'+rarity+',80,"sword",rng);validateCharacterItem(gear);');assert.equal(run('gear.affixes.length'),run('raritySpec('+rarity+').affixes'));assert.equal(run('new Set(gear.affixes.map(a=>a.stat)).size'),run('gear.affixes.length'));
  assert(run('Object.values(gear.stats).every(n=>Number.isFinite(n)&&n>0)'));
 }
 assert.equal(run('JSON.stringify(generateEquipmentItem("weapon",5,90,"bow",layoutRandom("same")))'),run('JSON.stringify(generateEquipmentItem("weapon",5,90,"bow",layoutRandom("same")))'));
 assert(run('affixValue("hp",90,5,100)>affixValue("hp",20,5,100)'));assert(run('affixValue("crit",80,5,100)>affixValue("crit",80,3,100)'));
 run('var seen=new Set();for(var i=0;i<500;i++)seen.add(JSON.stringify(generateEquipmentItem("armor",1,75,"sword",rng).affixes));');assert(run('seen.size>400'));
});
test('extreme rolls stay bounded and same archetype has diverse meaningful attribute combinations',()=>{
 const {run}=createGame();
 for(const n of [0,1,-1,NaN,Infinity]){
  run('var item=generateEquipmentItem("weapon",5,99,"sword",()=>'+String(n)+');validateCharacterItem(item);');assert.equal(run('item.affixes.length'),5);assert(run('item.affixes.every(a=>a.roll>=0&&a.roll<=100)'));
 }
 run('var found=new Set(),rng=layoutRandom("coverage");for(var i=0;i<400;i++)generateEquipmentItem("weapon",5,99,"sword",rng).affixes.forEach(a=>found.add(a.stat));');
 assert.equal(run('found.size'),run('Object.keys(ITEM_AFFIXES).length'));
});
test('ideal rolls and synergy increase real value and trader payout; all rarity tiers have distinct value',()=>{
 const {run}=createGame();run('var low=generateEquipmentItem("weapon",1,80,"sword",()=>0);var high=JSON.parse(JSON.stringify(low));high.affixes.forEach(a=>{a.roll=100;high.stats[a.stat]=affixValue(a.stat,80,1,100);});');
 assert(run('itemMarketValue(high)>itemMarketValue(low)*2'));assert.equal(run('itemSaleValue(high)'),run('Math.floor(itemMarketValue(high)*.25)'));
 run('var prices=RARITIES.map(r=>itemMarketValue(generateEquipmentItem("weapon",r.id,80,"sword",()=>.5)));');assert(run('prices.every((n,i)=>!i||n>prices[i-1])'));
 run('var synergistic={stats:{attack:10,crit:.02,attackSpeed:.03,wolfDamage:.1}},plain={stats:{mp:10,poisonResist:.02}};');assert.equal(run('itemSynergy(synergistic)'),3);assert.equal(run('itemSynergy(plain)'),0);
 run('p.level=99;addGearItem(high);var expected=itemSaleValue(high),goldBefore=p.gold;sellItem(p.bag.length-1);');assert.equal(run('p.gold-goldBefore'),run('expected'));
});
test('penetration changes actual resisted hits and Metin armor without removing weaknesses',()=>{
 const {run}=createGame();run('running=true;p.x=400;p.y=1400;p.level=1;rand=()=>.2;var foe={type:"wolf",skin:"wolf",hp:10000,max:10000,x:450,y:1400,level:1,resistances:{physical:.5}};var ordinary=hurtMob(foe,1,false,null,{type:"physical"});p.equipped.weapon={slot:"weapon",bonus:0,stats:{penetration:.5}};foe.hp=10000;var pierced=hurtMob(foe,1,false,null,{type:"physical"});');
 assert(run('pierced>ordinary'));assert.equal(run('resolveEnemyDamage({...foe,resistances:{physical:-.25}},100,"physical",true)'),125);
 run('var stone={type:"stone",metinArmor:20,metinResistance:.2,resistances:{physical:.4}};');assert.equal(run('metinDamage(stone,100,"physical",true)'),100);assert.equal(run('metinDamage(stone,100,"physical")'),38);
 run('p.equipped.weapon.stats.penetration=10;');assert.equal(run('penetrationChance()'),.5);
});
test('attack speed affects real Space cooldown and respects cap and minimum interval',()=>{
 const {run}=createGame();run('running=true;paused=false;p.x=400;p.y=1400;attackCD=0;attack();var base=attackCD;p.equipped.bracelet={slot:"bracelet",bonus:0,stats:{attackSpeed:.6}};attackCD=0;attack();');assert(run('attackCD<base'));
 run('p.equipped.bracelet.stats.attackSpeed=100;p.classId="ninja";buffs.berserk=10;attackCD=0;attack();');assert.equal(run('itemAttackSpeed()'),.6);assert.equal(run('attackCD'),.16);
});
test('target-specific damage affects only matching enemies, including boss and Metin categories',()=>{
 const {run}=createGame();run('p.equipped.weapon={slot:"weapon",bonus:0,stats:{wolfDamage:.4,metinDamage:.3,bossDamage:.2}};');
 for(const [enemy,expected]of [[{type:'wolf',skin:'wolf'},.4],[{type:'wolf',skin:'scorpion'},0],[{type:'stone'},.3],[{type:'boss',skin:'wolf'},.2]])assert.equal(run('enemyGearBonus('+JSON.stringify(enemy)+')'),expected);
 run('running=true;p.x=400;p.y=1400;rand=()=>.9;var foe={type:"wolf",skin:"wolf",hp:10000,max:10000,level:1,x:450,y:1400};var boosted=hurtMob(foe,1,false,null,{type:"physical"});p.equipped.weapon.stats.wolfDamage=0;foe.hp=10000;var ordinary=hurtMob(foe,1,false,null,{type:"physical"});');assert(run('boosted>ordinary'));
 run('p.equipped.weapon.stats.wolfDamage=99;');assert.equal(run('enemyGearBonus(foe)'),1);
});
test('HP MP crit movement and every resistance bonus change actual character statistics',()=>{
 const {run}=createGame();run('var hp=maxHP(),mp=maxMP(),crit=criticalChance(),speed=speedValue();p.equipped.armor={slot:"armor",bonus:0,stats:{hp:100,mp:50,crit:.05,speed:12,fireResist:.1}};');
 assert.equal(run('maxHP()-hp'),100);assert.equal(run('maxMP()-mp'),50);assert(Math.abs(run('criticalChance()-crit')-.05)<1e-9);assert.equal(run('speedValue()-speed'),12);assert.equal(run('playerResistances().fire'),.1);
});
test('generated affixes and rarity persist in equipment and ground loot through save and full backup import',()=>{
 const {run,saved}=createGame();run('p.level=99;addGearItem(generateEquipmentItem("weapon",4,80,"sword",layoutRandom("save")));equipItem(0);closeModal();spawnGroundDrop({kind:"gear",item:generateEquipmentItem("armor",5,90,"sword",layoutRandom("ground"))},p);save();var backup=exportCharacters();var weapon=JSON.stringify(p.equipped.weapon);');
 const restore=createGame(readSavedProfile(saved));assert.equal(restore.run('JSON.stringify(p.equipped.weapon)'),run('weapon'));assert(restore.run('drops.some(d=>d.item?.rarity===5&&d.item.affixes.length===5)'));
 const next=createEmptyGame();next.run('var prepared=prepareCharacterImport('+JSON.stringify(run('backup'))+');importCharacterBackup(prepared,"add");playCharacter();');assert.equal(next.run('JSON.stringify(p.equipped.weapon)'),run('weapon'));
});
test('invalid affix imports fail transactionally without touching current profiles',()=>{
 const {run}=createGame();run('p.level=99;addGearItem(generateEquipmentItem("weapon",5,90,"sword",layoutRandom("safe")));save();var backup=exportCharacters();var before=JSON.stringify(characterStore.account);');
 const backup=run('backup');
 const mutations=[i=>i.affixes[0].roll=101,i=>i.affixes[0].stat='fake',i=>i.affixes[1]={...i.affixes[0]},i=>i.stats[i.affixes[0].stat]+=1,i=>i.affixes.pop(),i=>i.generationVersion=99,i=>i.rarity=9];
 for(const mutate of mutations){const doc=JSON.parse(backup),id=doc.account.order[0];mutate(doc.account.profiles[id].data.bag[0]);assert.throws(()=>run('prepareCharacterImport('+JSON.stringify(JSON.stringify(doc))+')'),/Neplatná/);assert.equal(run('JSON.stringify(characterStore.account)'),run('before'));}
});
test('legacy Rare and Epic retain all attributes and prices and rarity sorting uses rank instead of ID',()=>{
 const {run,saved}=createGame();run('p.level=99;for(var id of [0,3,1,2,4,5])addGearItem({name:"Starý "+id,slot:"bracelet",rarity:id,bonus:12,value:42,stats:{hp:20}});sortInventory();save();');
 assert.equal(run('p.bag.map(i=>i.rarity).join(",")'),'5,4,2,1,3,0');const reload=createGame(readSavedProfile(saved));assert.equal(reload.run('p.bag.find(i=>i.rarity===1).stats.hp'),20);assert.equal(reload.run('itemSaleValue(p.bag.find(i=>i.rarity===2))'),42);
});
test('six visual identities, full tooltips and guide reflect actual probability and pricing functions',()=>{
 const {run,elements}=createGame();const icons=new Set();
 for(const id of [0,3,1,2,4,5]){run('var item=generateEquipmentItem("weapon",'+id+',90,"sword",()=>.5);');icons.add(run('itemIcon(item)'));assert(!run('itemIcon(item).includes("undefined")'));run('var drop={kind:"gear",item,x:p.x,y:p.y,fallAge:1,expiresAt:Date.now()+10000};var tip=groundDropTooltip(drop);');assert(run('tip.includes(rarityName(item.rarity))'));assert.match(run('tip'),/Trhový odhad/);}
 assert.equal(icons.size,6);run('running=true;inventory();');elements.get('rarity-guide').onclick();for(const label of ['Common','Uncommon','Rare','Epic','Legendary','Mythic','0,001','25 %'])assert(elements.get('modalcontent').innerHTML.includes(label),label);
 run('var mythic=generateEquipmentItem("helmet",5,90);');assert.equal(run('groundDropLifetime({kind:"gear",item:mythic})'),run('LOOT_RULES.rareLifetime'));
});
