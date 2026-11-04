const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,readSavedAccount}=require('./helpers/game.cjs');
function trader(id='merchant'){const g=createGame();g.run(`running=true;loadMap('town',true);p.x=NPCS.${id}.x;p.y=NPCS.${id}.y;p.gold=100000;`);return g;}
test('new markets initialize stock and preserve starter bundle prices',()=>{
 const {run}=trader();assert.equal(run('marketOffers("merchant").find(o=>o.id==="potions").price'),25);assert.equal(run('marketOffers("merchant").find(o=>o.id==="capes").price'),100);assert.equal(run('p.economy.rare.length'),2);
});
test('purchases atomically consume Yang and stock, grant exact supplies and increase demand',()=>{
 const {run}=trader();run('var before=p.potions,gold=p.gold;');assert(run('buyMarketOffer("merchant","potions",25,0)'));assert.equal(run('p.potions'),run('before+3'));assert.equal(run('p.gold'),run('gold-25'));assert.equal(run('p.economy.stock["merchant:potions"]'),19);assert(run('marketOffers("merchant").find(o=>o.id==="potions").price>25'));
});
test('unavailable, poor, dead, remote and stale transactions leave player unchanged',()=>{
 const {run}=trader();for(const setup of ['p.gold=0;','p.hp=0;','p.x=10;','running=false;','p.economy.stock["merchant:potions"]=0;']){
 run('running=true;p.hp=100;p.x=NPCS.merchant.x;p.gold=100000;p.economy.stock["merchant:potions"]=20;'+setup+'var before=JSON.stringify(p);');assert(!run('buyMarketOffer("merchant","potions")'));assert.equal(run('JSON.stringify(p)'),run('before'));}
 run('running=true;p.hp=100;p.x=NPCS.merchant.x;p.economy.stock["merchant:potions"]=20;var before=JSON.stringify(p);');assert(!run('buyMarketOffer("merchant","potions",999,0)'));assert(!run('buyMarketOffer("merchant","potions",25,1)'));assert(!run('buyMarketOffer("merchant","constructor")'));assert.equal(run('JSON.stringify(p)'),run('before'));
});
test('current traders carry usable supplies and gate rare materials by level',()=>{const {run}=trader('armsdealer');run('p.level=1;');assert(!run('buyMarketOffer("armsdealer","forgeCore")'));assert.equal(run('MARKET_TRADERS.alchemist'),undefined);run('p.x=NPCS.merchant.x;p.y=NPCS.merchant.y;');assert(run('marketOffers("merchant").some(o=>o.supply==="material:herb")'));assert(run('marketOffers("merchant").some(o=>o.supply==="material:dust")'));assert(run('marketOffers("merchant").every(o=>!o.supply?.startsWith("alchemy:"))'));});

test('finite rare offers survive reopening and reload without rerolls, and reject a full bag',()=>{
 const {run,saved}=trader('armsdealer');run('var offers=JSON.stringify(p.economy.rare);for(let i=0;i<p.inventory.pages*INVENTORY.pageSize;i++)addGearItem({slot:"bracelet",name:"Test",bonus:1});var before=JSON.stringify(p);');assert(!run('buyMarketOffer("armsdealer","rare-0")'));assert.equal(run('JSON.stringify(p)'),run('before'));
 run('p.bag=[];');assert(run('buyMarketOffer("armsdealer","rare-0")'));assert.equal(run('p.bag.length'),1);assert(!run('buyMarketOffer("armsdealer","rare-0")'));run('save();');const restored=createGame(null,'grindoria-save-v1',Object.fromEntries(saved));assert.equal(restored.run('p.economy.rare[0].stock'),0);assert.equal(restored.run('p.bag[0].name'),run('p.bag[0].name'));assert.equal(restored.run('p.economy.rare[1].item.name'),run('p.economy.rare[1].item.name'));
});
test('restock follows active simulation only, preserves pause and restores finite offers',()=>{
 const {run}=trader();run('buyMarketOffer("merchant","potions");paused=true;update(599);');assert.equal(run('p.economy.elapsed'),0);run('paused=false;updateEconomy(599);');assert.equal(run('p.economy.stock["merchant:potions"]'),19);run('updateEconomy(1);');assert.equal(run('p.economy.cycle'),1);assert.equal(run('p.economy.stock["merchant:potions"]'),20);assert.equal(run('p.economy.demand.supplies'),0);assert(run('p.economy.rare.every(r=>r.stock===1)'));
});
test('gear buyback uses rarity, quality, specialist bonus and live demand with no duplicate sales',()=>{
 const {run}=trader('armsdealer');run('addGearItem(generateEquipmentItem("weapon",2,20));var uid=p.bag[0].uid,gold=p.gold,quote=marketGearSaleValue(p.bag[0],"armsdealer"),base=itemSaleValue(p.bag[0]);');assert(run('quote>=base'));assert(run('sellMarketGear(uid,"armsdealer")'));assert.equal(run('p.gold'),run('gold+quote'));assert(!run('sellMarketGear(uid,"armsdealer")'));assert.equal(run('p.economy.demand.gear'),-1);
});
test('inventory sale requires an NPC and material sales reduce holdings and prices',()=>{
 const {run}=trader();run('addGearItem({slot:"weapon",name:"Test",value:50});p.x=50;p.y=50;');assert(!run('sellItem(0)'));assert.equal(run('p.bag.length'),1);run('p.x=NPCS.merchant.x;p.y=NPCS.merchant.y;p.career.materials.ore=20;var price=marketMaterialSaleValue("ore","merchant"),gold=p.gold;');assert(run('sellMarketMaterial("merchant","ore",10)'));assert.equal(run('p.gold'),run('gold+price*10'));assert.equal(run('p.career.materials.ore'),10);assert(run('marketMaterialSaleValue("ore","merchant")<=price'));assert(!run('sellMarketMaterial("merchant","keys",1)'));assert(!run('sellMarketMaterial("merchant","ore",-1)'));assert(!run('sellMarketMaterial("merchant","ore",11)'));
});
test('buying and immediately reselling every offered material always loses Yang',()=>{
 const {run}=trader();for(const vendor of ['merchant','armsdealer'])for(const offer of run(`marketOffers('${vendor}').filter(o=>o.supply?.startsWith('material:'))`)){
 run(`p.x=NPCS.${vendor}.x;p.y=NPCS.${vendor}.y;p.level=99;p.gold=100000;p.economy.demand.materials=0;var initial=p.gold;`);assert(run(`buyMarketOffer('${vendor}','${offer.id}')`));assert(run(`sellMarketMaterial('${vendor}','${offer.supply.slice(9)}',${offer.count})`));assert(run('p.gold<initial'));
 }
});
test('market fluctuations stay bounded and rare gear cannot be flipped for a profit',()=>{
 const {run}=trader('armsdealer');run('p.economy.demand.gear=10;');assert(run('marketFactor("gear")<=1.6'));run('p.economy.demand.gear=-10;');assert(run('marketFactor("gear")>=.65'));run('p.economy.demand.gear=0;var initial=p.gold;');assert(run('buyMarketOffer("armsdealer","rare-0")'));assert(run('sellMarketGear(p.bag[0].uid,"armsdealer")'));assert(run('p.gold<initial'));
});
test('backups roundtrip markets, reject malformed stock and migrate older profiles',()=>{
 const {run,saved}=trader();run('buyMarketOffer("merchant","ore");save();var backup=exportCharacters();');for(const bad of ['e.demand.gear=11','e.stock["merchant:ore"]=-1','e.elapsed=-1','e.rare[0].stock=2','e.rare[1].id="rare-0"'])assert.throws(()=>run('var doc=JSON.parse(backup),e=doc.account.profiles[doc.account.selectedId].data.economy;'+bad+';prepareCharacterImport(JSON.stringify(doc));'),/Neplatná záloha/);
 run('returnToCharacters();var prepared=prepareCharacterImport(backup);importCharacterBackup(prepared,"replace",{confirmReplace:true});playCharacter();');assert.equal(run('p.economy.stock["merchant:ore"]'),11);
 const old=readSavedAccount(saved);for(const r of Object.values(old.profiles))delete r.data.economy;const migrated=createGame(null,'grindoria-save-v1',{'grindoria-characters-v1':old});assert.equal(migrated.run('p.economy.stock["merchant:ore"]'),12);
});
test('markets remain isolated between characters and do not consume combat randomness',()=>{
 const {run}=trader();run('buyMarketOffer("merchant","ore");var first=characterStore.activeId;returnToCharacters();var other=createCharacter("Obchodnik","ninja");playCharacter(other);');assert.equal(run('p.economy.stock["merchant:ore"]'),12);run('returnToCharacters();playCharacter(first);');assert.equal(run('p.economy.stock["merchant:ore"]'),11);run('rand=()=>{throw Error("combat rng");};updateEconomy(600);');
});
test('all merchant screens show prices, stocks, refresh, buyback and specialist service',()=>{
 const {run,elements}=trader();for(const vendor of ['merchant','armsdealer']){run(`p.x=NPCS.${vendor}.x;p.y=NPCS.${vendor}.y;marketPanel('${vendor}');`);const html=elements.get('modalcontent').innerHTML;for(const word of ['Yang','zásoba','Obnova','Výkup'])assert(html.includes(word));}assert(!elements.get('modalcontent').innerHTML.includes("Alchymistické recepty"));assert.equal(run("Object.keys(MARKET_TRADERS).length"),2);
});
