const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,readSavedProfile}=require('./helpers/game.cjs');
function arena(run){run('running=true;paused=false;p.x=400;p.y=1400;cam.x=400;cam.y=1400;keysClear();resetCombatFlow();combatAssist.focused=true;p.hp=maxHP();p.mp=maxMP();p.potions=10;p.potionReadyAt=0;attackCD=0;castPose=0;spellCD.fill(0);mobs.forEach(m=>{m.hp=0;m.dead=10000});var foe=mobs.find(m=>m.type==="wolf");Object.assign(foe,{x:450,y:1400,hp:10000,max:10000});');}
test('idle Autospell never heals or buffs; distant selection waits for combat and death stops casts',()=>{
 const {run}=createGame();arena(run);
 run('p.classId="shaman";p.schools.shaman="healing";p.hp=1;p.mp=maxMP();p.combatAssist.autoSpell=true;updateAutoSpell(1);');assert.equal(run('p.hp'),1);assert(!run('spellCD.some(x=>x>0)'));
 run('foe.x=900;selectCombatTarget(foe);updateAutoSpell(1);');assert(!run('spellCD.some(x=>x>0)'));
 run('foe.x=450;attack();castPose=0;updateAutoSpell(1);');assert(run('p.hp>1'));
 run('foe.hp=0;spellCD.fill(0);castPose=0;combatAssist.timer=0;updateAutoSpell(1);');assert(!run('spellCD.some(x=>x>0)'));
});
test('combat authorization expires and cannot transfer to another selected enemy',()=>{
 const {run}=createGame();arena(run);run('selectCombatTarget(foe,true);');assert(run('selectedCombatEnemy()===foe'));
 run('updateCombatAssistTimers(8.1);');assert.equal(run('selectedCombatEnemy()'),null);
 run('registerPlayerCombat(foe);var other=mobs.find(m=>m!==foe);Object.assign(other,{hp:1000,x:800,y:1400});selectCombatTarget(other);');assert.equal(run('selectedCombatEnemy()'),null);
});
test('automatic potions use finite supplies below 45 percent with a shared four second cooldown',()=>{
 const {run}=createGame();arena(run);run('var now=100000;Date.now=()=>now;p.combatAssist.autoPotion=true;p.hp=1;var count=p.potions;updateAutoPotion();');assert.equal(run('p.hp'),66);assert.equal(run('p.potions'),9);assert.equal(run('potionCooldownRemaining()'),4);
 run('p.hp=1;');assert.equal(run('drinkPotion()'),false);assert.equal(run('updateAutoPotion()'),false);
 run('now+=3999;');assert.equal(run('updateAutoPotion()'),false);
 run('now++;');assert.equal(run('drinkPotion()'),true);assert.equal(run('p.hp'),66);assert.equal(run('p.potions'),8);
 run('now+=4000;p.hp=maxHP()*.45;');assert.equal(run('updateAutoPotion()'),false);
 run('p.hp=maxHP()-10;drinkPotion();');assert.equal(run('p.hp'),run('maxHP()'));assert.equal(run('p.potions'),7);
});
test('automatic potions pause in dialogs, blur, hidden tabs, sanctuary and never revive or create supplies',()=>{
 for(const condition of ['running=false','paused=true','combatAssist.focused=false','document.hidden=true','p.hp=0','p.potions=0','p.x=map().entry.x;p.y=map().entry.y']){
  const {run}=createGame();arena(run);run('p.hp=1;p.combatAssist.autoPotion=true;'+condition+';var health=p.hp,count=p.potions;updateAutoPotion();');assert.equal(run('p.hp'),run('health'),condition);assert.equal(run('p.potions'),run('count'),condition);
 }
});
test('potions cannot bypass cooldown through inventory or reloading, and preferences stay per profile',()=>{
 const {run,saved,elements}=createGame();arena(run);elements.get('auto-potion').onclick();run('p.hp=1;drinkPotion();save();');
 const profile=readSavedProfile(saved),restored=createGame(profile);assert.equal(restored.run('p.combatAssist.autoPotion'),true);assert.equal(restored.run('p.potionReadyAt'),profile.potionReadyAt);assert(restored.run('potionCooldownRemaining()>0'));
 run('paused=true;');assert.equal(run('drinkPotion(true)'),false);
});
test('sustained damage exceeds bounded potion healing and supply exhaustion stops automation',()=>{
 const {run}=createGame();arena(run);run('var now=100000;Date.now=()=>now;p.combatAssist.autoPotion=true;p.potions=2;p.hp=1;for(var i=0;i<4;i++){p.hp=1;updateAutoPotion();now+=4000;}');assert.equal(run('p.potions'),0);assert.equal(run('p.hp'),1);
});
test('all modal backdrops dismiss only on primary outside clicks and never attack through to the canvas',()=>{
 const {run,listeners,elements}=createGame();arena(run);
 for(const panel of ['inventory','spellbook','journal','careerPanel','travelMenu']){
  run(panel+'();');assert.equal(run('paused'),true);const click=listeners.get('modal:click');
  click({target:elements.get('modalcard'),button:0,preventDefault(){},stopPropagation(){}});assert.equal(run('paused'),true);
  click({target:elements.get('modal'),button:2,preventDefault(){},stopPropagation(){}});assert.equal(run('paused'),true);
  let stopped=false;click({target:elements.get('modal'),button:0,preventDefault(){},stopPropagation(){stopped=true}});
  assert(stopped);assert.equal(run('paused'),false);assert.equal(elements.get('modal').hidden,true);assert.equal(run('attackCD'),0);
 }
});
