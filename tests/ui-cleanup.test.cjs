const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createGame,createEmptyGame,readSavedProfile}=require('./helpers/game.cjs');
function arena(run){run('running=true;paused=false;p.x=400;p.y=1400;cam.x=p.x;cam.y=p.y;p.hp=maxHP();p.mp=maxMP();attackCD=0;castPose=0;spellCD.fill(0);keysClear();resetCombatFlow();mobs.forEach(m=>{m.hp=0;m.dead=10000;});var foe=mobs.find(m=>m.type==="wolf");Object.assign(foe,{x:450,y:1400,hp:20000,max:20000,homeX:450,homeY:1400,engaged:0,taunt:0,cd:5});');}
function click(listeners,x=650,y=333){listeners.get('game:pointerdown')({clientX:x,clientY:y,button:0});}
test('single click only selects and reveals level; two clicks and native double click engage follow and attacks',()=>{
 const {run,listeners,elements}=createGame();arena(run);run('foe.x=700;');click(listeners,900);
 assert(run('target===foe'));assert.equal(run('combatSelection.following'),false);run('for(var i=0;i<10;i++)updatePlayerControl(.05);');assert.equal(run('p.x'),400);assert.equal(run('foe.hp'),20000);assert.equal(run('attackCD'),0);
 assert.match(elements.get('target-panel').innerHTML,/Lv./);assert.doesNotMatch(elements.get('target-panel').innerHTML,/AUTOMATICKÝ BOJ|Automatický útok/);
 click(listeners,900);listeners.get('game:dblclick')({clientX:900,clientY:333,button:0});assert.equal(run('combatSelection.following'),true);
 run('for(var i=0;i<80;i++)update(.05);');assert(run('p.x>400'));assert(run('foe.hp<20000'));
 run('hit(foe,999999);var stopped=p.x;updatePlayerControl(1);');assert.equal(run('target'),null);assert.equal(run('combatSelection.following'),false);assert.equal(run('p.x'),run('stopped'));
});
test('Space marks a real melee hit without enabling auto attacks or following after release',()=>{
 const {run,listeners}=createGame();arena(run);listeners.get('keydown')({key:' ',preventDefault(){}});run('update(.05);');assert(run('foe.hp<20000'));assert(run('target===foe'));assert(run('selectedCombatEnemy()===foe'));assert.equal(run('combatSelection.following'),false);
 listeners.get('keyup')({key:' '});run('foe.x=750;var health=foe.hp;for(var i=0;i<30;i++)update(.05);');assert.equal(run('p.x'),400);assert.equal(run('foe.hp'),run('health'));
});
test('manual ballistic arrows select only an enemy actually hit and never start auto following',()=>{
 const {run,listeners}=createGame();arena(run);run('p.classId="ninja";p.schools.ninja="archery";foe.x=600;');listeners.get('keydown')({key:' ',preventDefault(){}});run('attack();');listeners.get('keyup')({key:' '});assert.equal(run('target'),null);
 run('for(var i=0;i<15;i++)updateCombat(.05);');assert(run('target===foe'));assert.equal(run('combatSelection.following'),false);assert(run('foe.hp<20000'));
});
test('double clicking loot never starts combat through the removed item; first enemy click remains inspect-only',()=>{
 const {run,listeners}=createGame();arena(run);run('var drop=spawnGroundDrop({kind:"gear",item:{slot:"bracelet",name:"Náramok",bonus:1}},p);Object.assign(drop,{x:450,y:1400,launchX:450,launchY:1400,fallAge:1});');
 click(listeners);assert.equal(run('p.bag.length'),1);click(listeners);listeners.get('game:dblclick')({clientX:650,clientY:333,button:0});assert.equal(run('combatSelection.following'),false);assert.equal(run('foe.hp'),20000);
});
test('automatic loot is immediate, batched as small text and never duplicated after a saved reload',()=>{
 const {run,saved}=createGame();arena(run);run('var gold=p.gold,ore=p.career.materials.ore;var a=spawnGroundDrop({kind:"gold",count:11},{x:1900,y:1900});spawnGroundDrop({kind:"gold",count:7},{x:1900,y:1900});spawnGroundDrop({kind:"supply",supplyId:"material:ore",count:3},{x:1900,y:1900});');
 assert.equal(run('p.gold-gold'),18);assert.equal(run('p.career.materials.ore-ore'),3);assert.equal(run('drops.length'),0);assert.equal(run('pickUpGroundDrop(a.id)'),false);
 run('updateGroundLoot(.01);var receipts=particles.filter(p=>p.small);');assert.equal(run('receipts.length'),1);assert(run('receipts[0].t.includes("+18")&&receipts[0].t.includes("+3")'));
 run('save();');const restored=createGame(readSavedProfile(saved));assert.equal(restored.run('p.gold'),run('p.gold'));assert.equal(restored.run('p.career.materials.ore'),run('p.career.materials.ore'));restored.run('running=true;updateGroundLoot(.01);');assert.equal(restored.run('drops.length'),0);assert.equal(restored.run('particles.filter(p=>p.small).length'),0);
});
test('pending automatic loot remains isolated when switching profiles and legacy ground supplies migrate once',()=>{
 const {run}=createEmptyGame();run('var a=createCharacter("Prva","warrior"),b=createCharacter("Druha","ninja");playCharacter(a);spawnGroundDrop({kind:"supply",supplyId:"potions",count:3},p);var count=p.potions;returnToCharacters();playCharacter(b);');assert.equal(run('automaticLoot.items.size'),0);assert.equal(run('p.potions'),5);run('returnToCharacters();playCharacter(a);');assert.equal(run('p.potions'),run('count'));
 run('drops.push({id:++p.lootSerial,kind:"gold",count:9,x:1900,y:1900,fallAge:0,expiresAt:Date.now()+100000});var gold=p.gold;updateGroundLoot(.01);updateGroundLoot(.01);');assert.equal(run('p.gold-gold'),9);assert.equal(run('drops.length'),0);
});
test('world labels contain names while enemy level and Metin protection are kept in target info',()=>{
 const {run,elements}=createGame();arena(run);run('var labels=[];text=(value)=>labels.push(String(value));drawMobBase(foe);var stone=mobs.find(m=>m.type==="stone");Object.assign(stone,{x:470,y:1400,hp:1000,max:1000,level:35,metinType:"frost",metinArmor:10,metinResistance:.2});drawMetin(stone);var boss=mobs.find(m=>m.type==="boss");Object.assign(boss,{x:450,y:1400,hp:1000,max:1000,level:40});drawBoss(boss);hero();');
 assert(run('labels.includes(enemyName(foe))'));assert(run('labels.includes(METIN_TYPES.frost.name)'));assert(run('labels.includes(map().boss)'));assert(!run('labels.some(label=>/Lv\.|úrov|stupeň/i.test(label))'));assert(!run('labels.includes(role().name+" · "+school().name)'));
 run('selectCombatTarget(stone);updateCombatHUD();');for(const text of ['Lv.35','Pancier 10','Odolnosť 20 %'])assert(elements.get('target-panel').innerHTML.includes(text),text);
});
test('all game panels render concise functional copy and retain safety warnings and usable controls',()=>{
 const {run,elements}=createGame();arena(run);
 for(const panel of ['help','spellbook','combatManual','journal','travelMenu','metinCodex','rarityGuide']){run(panel+'();');const html=elements.get('modalcontent').innerHTML;assert(html.length>50);assert(!/<(?:p|small|span)>\s*<\/(?:p|small|span)>/.test(html),panel);run('closeModal();');}
 run('help();');const help=elements.get('modalcontent').innerHTML;for(const text of ['SPACE','Druhý klik','Y','Esc'])assert(help.includes(text));assert(!/respawn|1,8|0,55|algo|vlastn.*2D/i.test(help));
 run('combatManual();');assert(!/WASD|F10/.test(elements.get('modalcontent').innerHTML));run('closeModal();spellbook();');assert(!elements.get('modalcontent').innerHTML.includes('Samostatná taktická'));assert(elements.get('modalcontent').innerHTML.includes('cooldown'));
 for(const tab of ['overview','biology','items','discovery']){run('closeModal();careerPanel("'+tab+'");');assert(!elements.get('modalcontent').innerHTML.includes('Level je len jedna cesta'));}
 run('closeModal();returnToCharacters();renderCharacterScreen();');assert.match(elements.get('intro').innerHTML,/Výber postavy/);run('characterDraft={name:"",classId:"warrior",schoolId:"body"};renderCharacterCreation();');assert(!elements.get('intro').innerHTML.includes('[GM]'));assert(!elements.get('intro').innerHTML.includes('2D grafiku'));
 run('showCharacterDeletion(characterStore.account.selectedId);');assert.match(elements.get('modalcontent').innerHTML,/nezvratné/);assert.match(elements.get('modalcontent').innerHTML,/delete-character-name/);
});
test('public documentation omits internal naming instructions and records ongoing UI writing rules',()=>{
 const base=path.resolve(__dirname,'..');for(const file of ['README.md','CHANGELOG.md',...fs.readdirSync(path.join(base,'docs')).filter(f=>f.endsWith('.md')).map(f=>'docs/'+f)]){
  const text=fs.readFileSync(path.join(base,file),'utf8');assert(!/Predpona.*\*.*GM|hviezdi.*GM|\*Noctis|\[GM\]/i.test(text),file);
 }
 assert.match(fs.readFileSync(path.join(base,'AGENTS.md'),'utf8'),/Jedna informácia/);
});
