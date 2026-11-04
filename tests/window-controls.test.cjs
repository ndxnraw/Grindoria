const test=require('node:test'),assert=require('node:assert/strict');
const {createGame}=require('./helpers/game.cjs');
function setup(){const g=createGame();g.run('running=true;paused=false;loadMap("town",true);closeAllGameWindows();');return g;}
function press(g,key,extra={}){g.listeners.get('keydown')({key,repeat:false,preventDefault(){},...extra});}
test('Metin-style panel shortcuts toggle independent layers and keep the world running',()=>{
 const g=setup();for(const key of ['c','i','m','n','h','v','k','p'])press(g,key);
 assert.deepEqual(Array.from(g.run('[...gameWindows.keys()]')),['character','inventory','large-map','journal','help','spellbook','auto-hunt','career:overview']);assert.equal(g.run('paused'),false);
 const time=g.run('clock');g.run('update(.1);');assert(g.run('clock')>time);
 press(g,'i');assert.equal(g.run('gameWindows.size'),7);assert.equal(g.run('gameWindows.has("inventory")'),false);assert.equal(g.run('gameWindows.has("character")'),true);
 press(g,'Escape');assert.equal(g.run('gameWindows.size'),6);assert.equal(g.run('gameWindows.has("career:overview")'),false);
});
test('minimized layers restore with their shortcut and preserve position and body scroll',()=>{
 const g=setup();press(g,'c');g.run('var w=gameWindows.get("character");w.node.getBoundingClientRect=()=>({width:330,height:500});w.x=120;w.y=140;w.body.scrollTop=160;minimizeGameWindow(w);');
 assert.equal(g.run('w.minimized'),true);press(g,'c');assert.equal(g.run('w.minimized'),false);assert.equal(g.run('w.x'),120);assert.equal(g.run('w.y'),140);assert.equal(g.run('w.body.scrollTop'),160);assert.equal(g.run('gameWindows.size'),1);
});
test('numeric slots and F1–F8 map identically, V opens skills and typing/modifiers stay native',()=>{
 const g=setup();g.run('var used=[];castSkill=i=>used.push(i);potion=()=>used.push("hp");useBraveryCape=()=>used.push("cape");');
 for(const key of ['1','2','3','4','5','6','7','8','F1','F2','F3','F4','F5','F6','F7','F8'])press(g,key);
 const expected=[0,1,2,3,4,5,'hp','cape'];assert.deepEqual(Array.from(g.run('used')),[...expected,...expected]);
 press(g,'v');assert.equal(g.run('gameWindows.has("spellbook")'),true);
 for(const key of ['1','m','c','n'])press(g,key,{target:{tagName:'INPUT'}});press(g,'F1',{ctrlKey:true});press(g,'1',{metaKey:true});
 assert.deepEqual(Array.from(g.run('used')),[...expected,...expected]);assert.equal(g.run('gameWindows.size'),1);
 press(g,'Alt');assert.equal(g.run('keys.Alt'),true);g.listeners.get('keyup')({key:'Alt'});assert.equal(g.run('keys.Alt'),false);
});
test('map can open during combat while travel and distant NPC transactions retain their gates',()=>{
 const g=setup();g.run('travelCombat.time=5;');press(g,'m');assert.equal(g.run('gameWindows.has("large-map")'),true);assert.equal(g.run('canTravel()'),false);
 g.run('p.x=1100;p.y=1100;');assert.equal(g.run('marketCanTrade("merchant")'),false);assert.equal(g.run('buyMarketOffer("merchant","potions",1,p.economy.cycle)'),false);
});
test('refresh preserves held input and focus context; switching character clears all session windows',()=>{
 const g=setup();g.run('biologyInfoPanel();inventory();keys.d=true;var key=panelState.key;refreshBiologyPanel();refreshOpenGameWindows(2);');
 assert.equal(g.run('keys.d'),true);assert.equal(g.run('panelState.key'),g.run('key'));
 g.run('clickDestination={x:800,y:800};');press(g,'w');assert.equal(g.run('clickDestination'),null);
 g.run('returnToCharacters();');assert.equal(g.run('gameWindows.size'),0);assert.equal(g.run('activeGameWindow'),null);assert.equal(g.run('clickDestination'),null);assert.equal(g.run('paused'),false);
});
test('Escape first cancels a discard, then closes the layer, then opens the system menu',()=>{
 const g=setup();g.run('p.career.materials.ore=4;inventory();requestInventoryDrop("material:ore");');press(g,'Escape');assert.equal(g.run('inventoryDropPending'),null);assert.equal(g.run('gameWindows.size'),1);assert.equal(g.run('p.career.materials.ore'),4);
 press(g,'Escape');assert.equal(g.run('gameWindows.size'),0);press(g,'Escape');assert.equal(g.run('gameWindows.has("system-menu")'),true);
});
