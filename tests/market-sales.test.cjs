const test=require('node:test'),assert=require('node:assert/strict');
const {createGame}=require('./helpers/game.cjs');
function setup(trader='merchant'){const g=createGame();g.run(`running=true;loadMap('town',true);p.x=NPCS.${trader}.x;p.y=NPCS.${trader}.y;p.gold=987654321;addGearItem({slot:'weapon',name:'Predajný meč',bonus:50,value:2000});inventory();marketPanel('${trader}');var id='gear:'+p.bag[0].uid;`);return g;}
test('merchant shows only offers and prices, without wallet or sale tabs',()=>{
 const {run,elements}=setup();const html=elements.get('modalcontent').innerHTML;assert(!html.includes(run('uiNumber(p.gold)')));assert(!html.includes('data-market-mode'));assert(!html.includes('service-wallet'));assert.match(html,/data-market-buy="potions"/);
});
test('sale requests do not consume items and cancellation clears pending state',()=>{
 const {run}=setup();run('var before=JSON.stringify([p.bag,p.gold]);');assert(run('requestMarketSale("merchant",id)'));assert.equal(run('JSON.stringify([p.bag,p.gold])'),run('before'));run('closeModal("market-sale");');assert.equal(run('marketSalePending'),null);assert.equal(run('inventorySelection'),null);assert.equal(run('JSON.stringify([p.bag,p.gold])'),run('before'));
});
test('confirmed equipment sale pays the quoted trader value exactly once',()=>{
 const {run}=setup('armsdealer');run('var before=p.gold,price=marketGearSaleValue(p.bag[0],"armsdealer");');assert(run('requestMarketSale("armsdealer",id)'));assert(run('confirmMarketSale(1)'));assert.equal(run('p.gold'),run('before+price'));assert.equal(run('p.bag.length'),0);assert(!run('confirmMarketSale(1)'));assert.equal(run('marketSalePending'),null);
});
test('remote, stale, changed-price and overflowing confirmations preserve everything',()=>{
 for(const change of ['p.x=10;p.y=10;','marketSalePending.characterId="other";','marketSalePending.mapId="other";','p.economy.demand.gear+=5;','p.economy.cycle++;','p.bag[0].instanceId+=":new";','p.gold=1e12;']){
  const {run}=setup();assert(run('requestMarketSale("merchant",id)'));run(change+'var before=JSON.stringify([p.bag,p.gold]);');assert(!run('confirmMarketSale(1)'),change);assert.equal(run('JSON.stringify([p.bag,p.gold])'),run('before'),change);
 }
});
test('tradeable materials use explicit quantity confirmation and unsupported items are rejected',()=>{
 const {run}=setup();run('p.career.materials.ore=20;p.career.materials.training=10;var before=p.gold,price=marketMaterialSaleValue("ore","merchant");');assert(!run('requestMarketSale("merchant","potions")'));assert(!run('requestMarketSale("merchant","material:training")'));assert(!run('requestMarketSale("merchant","equipped:weapon")'));
 assert(run('requestMarketSale("merchant","material:ore")'));for(const n of [0,-1,21,1001,NaN])assert(!run('confirmMarketSale('+n+')'));assert(run('confirmMarketSale(10)'));assert.equal(run('p.career.materials.ore'),10);assert.equal(run('p.gold'),run('before+10*price'));
});
test('closing the source shop cancels a pending sale',()=>{
 const {run}=setup();assert(run('requestMarketSale("merchant",id)'));run('closeModal("market:merchant");');assert.equal(run('marketSalePending'),null);assert(!run('gameWindows.has("market-sale")'));assert.equal(run('p.bag.length'),1);
});
