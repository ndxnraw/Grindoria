const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,readSavedProfile}=require('./helpers/game.cjs');
function ready(){const g=createGame();g.run('running=true;paused=false;p.x=400;p.y=1400;p.hp=maxHP();p.mp=maxMP();combatAssist.focused=true;');return g;}
function key(g,key,code,extra={}){let prevented=false;g.listeners.get('keydown')({key,code,target:{tagName:'CANVAS'},preventDefault(){prevented=true;},...extra});return prevented;}
test('physical hotbar positions handle Slovak, English, French and shifted layouts without relabeling',()=>{
 const g=ready();g.run('var actions=[];castSkill=i=>actions.push(i+1);potion=()=>actions.push(7);useBraveryCape=()=>actions.push(8);');
 for(const layout of [['+','ľ','š','č','ť','ž','ý','á'],['1','2','3','4','5','6','7','8'],['&','é','"',"'",'(','-','è','_'],['!','@','#','$','%','^','&','*']])for(let i=0;i<8;i++)assert(key(g,layout[i],'Digit'+(i+1)));
 assert.deepEqual(Array.from(g.run('actions')),Array.from({length:32},(_,i)=>i%8+1));
 for(let i=1;i<=8;i++){assert(key(g,'F'+i,'F'+i));assert(key(g,String(i),'Numpad'+i));}
 const before=g.run('actions.length');for(const extra of [{ctrlKey:true},{altKey:true},{metaKey:true},{repeat:true},{target:{tagName:'INPUT'}},{target:{isContentEditable:true}}])key(g,'ľ','Digit2',extra);assert.equal(g.run('actions.length'),before);
});
test('Tab toggles travel without disturbing text editing, modified shortcuts or other layers',()=>{
 const g=ready();g.run('characterPanel();');assert(key(g,'Tab','Tab'));assert(g.run('gameWindows.has("travel")&&gameWindows.has("character")'));key(g,'Tab','Tab',{repeat:true});assert(g.run('gameWindows.has("travel")'));key(g,'Tab','Tab');assert(!g.run('gameWindows.has("travel")'));for(const extra of [{ctrlKey:true},{target:{tagName:'INPUT'}},{target:{tagName:'SELECT'}}]){assert(!key(g,'Tab','Tab',extra));assert(!g.run('gameWindows.has("travel")'));}
});
test('all automation switch enables every assist from a partial state and disables all with following',()=>{
 const g=ready();g.run('p.combatAssist.autoAim=true;');assert(g.run('toggleAllCombatAssist()'));assert(g.run('Object.values(p.combatAssist).every(Boolean)'));g.run('var foe=mobs.find(m=>m.type==="wolf");foe.hp=1000;selectCombatTarget(foe,true);');assert(!g.run('toggleAllCombatAssist()'));assert(!g.run('Object.values(p.combatAssist).some(Boolean)'));assert(!g.run('combatSelection.following'));g.run('paused=true;');assert(!g.run('toggleAllCombatAssist()'));
});
test('manual potion stays enabled during auto cooldown, cannot waste full-health supplies or revive',()=>{
 const g=ready();g.run('p.combatAssist.autoPotion=true;p.hp=1;p.potions=10;updateAutoPotion();updateHUD();');assert.equal(g.elements.get('potion').disabled,false);const deadline=g.run('p.potionReadyAt');assert(g.run('potion()'));assert.equal(g.run('p.potionReadyAt'),deadline);g.run('p.hp=maxHP();var count=p.potions;');assert(!g.run('potion()'));assert.equal(g.run('p.potions'),g.run('count'));g.run('p.hp=0;');assert(!g.run('potion()'));assert(!g.run('updateAutoPotion()'));
});
test('hunter shows true overflow kills and previews exactly the awarded level-scaled resources',()=>{
 const g=ready();g.run('p.level=50;p.career.eligibleKills=2417;p.huntClaimed=240;var q=questEntries().find(q=>q.id==="hunt");');assert.equal(g.run('q.goals[0][1]'),2417);assert.equal(g.run('q.goals[0][2]'),2410);assert(g.run('q.ready'));assert.equal(g.run('huntReward().gold'),3850);g.run('var gold=p.gold,ore=p.career.materials.ore;');assert(g.run('claimHunt()'));assert.equal(g.run('p.gold-gold'),3850);assert.equal(g.run('p.career.materials.ore-ore'),7);assert(!g.run('claimHunt()'));assert.equal(g.run('p.huntClaimed'),241);
 g.run('p.huntClaimed=249;p.career.eligibleKills=2500;var books=p.career.materials.books,stones=p.career.materials.upgradeStones;');assert(g.run('claimHunt()'));assert.equal(g.run('p.career.materials.books-books'),2);assert.equal(g.run('p.career.materials.upgradeStones-stones'),2);
 for(const level of [1,20,50,99]){g.run('p.level='+level);const rewards=g.run('huntReward()');assert(rewards.gold>60);assert.equal(g.run('questEntries().find(q=>q.id==="hunt").reward'),g.run('costLabel(huntReward())'));}
});
test('Metin health grows throughout all 99 levels and updates saved wounded and dead stones once',()=>{
 const g=ready();let last=0;for(let l=1;l<=99;l++){const hp=g.run('metinStats('+l+',metinTypeForLevel('+l+')).hp');assert(hp>last);last=hp;}assert(last>80000);assert(g.run('metinStats(35,"frost").hp>7000'));
 g.run('loadMap("suterland",true);var stone=mobs.find(m=>m.level===35);stone.max=stone.baseMax=1000;stone.hp=250;stone.metinSchema=1;stone.metinGeneration=4;stone.metinGuardSerial=9;stone.metinWaveTimer=1;stone.metinCombat=3;var dead=mobs.find(m=>m.level===50);dead.hp=0;dead.dead=7;dead.metinSchema=1;save();');
 const again=createGame(readSavedProfile(g.saved));assert.equal(again.run('characterStore.error'),'');again.run('var stone=mobs.find(m=>m.level===35),dead=mobs.find(m=>m.level===50);');assert(again.run('Math.abs(stone.hp/stone.max-.25)<.001'));assert.equal(again.run('stone.metinSchema'),2);assert.equal(again.run('stone.metinGeneration'),4);assert.equal(again.run('stone.metinGuardSerial'),9);assert.equal(again.run('dead.hp'),0);assert.equal(again.run('dead.dead'),7);again.run('running=true;save();');const third=createGame(readSavedProfile(again.saved));assert.equal(third.run('mobs.find(m=>m.level===35).max'),again.run('stone.max'));assert.equal(third.run('mobs.find(m=>m.level===35).hp'),again.run('stone.hp'));
});
test('inventory uses drop comparison palette and flags insufficient level without selection actions',()=>{
 const g=ready();g.run('p.level=1;addGearItem({name:"Stit",slot:"shield",rarity:1,bonus:10,requiredLevel:33,tier:33,stats:{hp:128}});inventory();selectInventoryEntry("gear:"+p.bag[0].uid);showItemTooltip("gear:"+p.bag[0].uid,{clientX:100,clientY:100});');const html=g.elements.get('modalcontent').innerHTML;assert.match(html,/item-tooltip loot-tooltip/);assert(!/inventory-actions|inv-use|inv-sell|inv-delete/.test(html));const tooltip=g.elements.get('item-tooltip').innerHTML;assert.match(tooltip,/loot-stat stat-loss[^]*Požadovaná úroveň/);assert.match(tooltip,/stat-gain/);assert.match(tooltip,/Porovnanie/);
});
test('overview, character and large map no longer contain retired navigation or paid training',()=>{
 const g=ready();g.run('careerPanel();');let html=g.elements.get('modalcontent').innerHTML;assert(!/data-career-tab="(?:items|biology)"/.test(html));assert.match(html,/data-career-tab="metins"/);g.run('characterPanel("stats");');html=g.elements.get('modalcontent').innerHTML;assert(!/character-inventory|character-resists|Tréning za pečate/.test(html));assert.equal(g.run('typeof trainAttribute'),'undefined');assert.equal(g.run('typeof combatManual'),'undefined');g.run('largeMapPanel();');assert(!g.elements.get('modalcontent').innerHTML.includes('atlas-quests'));g.run('travelMenu();');assert(!g.elements.get('modalcontent').innerHTML.includes('metinAtlas'));g.run('biologyInfoPanel();');assert(g.run('gameWindows.has("quest:biology")'));
});
test('saved rare event Metins retain their multiplier and wounds with the new health curve',()=>{
 const g=ready();g.run('p.level=50;loadMap("suterland",true);startWorldEvent("metin");var rare=mobs.find(m=>m.rareMetin);rare.metinSchema=1;rare.max=rare.baseMax=1000;rare.hp=500;save();');const next=createGame(readSavedProfile(g.saved));next.run('var rare=mobs.find(m=>m.rareMetin);');assert.equal(next.run('rare.max'),next.run('Math.round(metinStats(rare.level,rare.metinType).hp*2.4)'));assert(next.run('Math.abs(rare.hp/rare.max-.5)<.001'));assert.equal(next.run('rare.metinSchema'),2);
});
