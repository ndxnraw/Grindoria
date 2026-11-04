const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,createEmptyGame,readSavedProfile,readSavedAccount}=require('./helpers/game.cjs');
function biologist(stage=4){const g=createGame();g.run('running=true;loadMap("town",true);p.x=NPCS.biologist.x;p.y=NPCS.biologist.y;p.level=99;p.gold=1000000;p.career.biology.stage='+stage+';for(const id of Object.keys(MATERIALS))p.career.materials[id]=100;Date.now=()=>2000000000000;');return g;}

test('the four original rewards retain their order and completed progress when loading old accounts',()=>{
 const g=biologist(4);g.run('p.career.biology.delivered=0;save();');const account=readSavedAccount(g.saved),id=account.selectedId,bio=account.profiles[id].data.career.biology;delete bio.nextDeliveryAt;delete bio.sampleKills;for(const key of Object.keys(g.run('BIOLOGY_MATERIALS')))delete account.profiles[id].data.career.materials[key];
 const next=createEmptyGame({'grindoria-characters-v1':account});assert.equal(next.run('characterStore.error'),'');assert(next.run('playCharacter()'));assert.equal(next.run('p.career.biology.stage'),4);assert.equal(next.run('p.career.biology.nextDeliveryAt'),0);assert.equal(next.run('p.career.biology.sampleKills'),0);assert.equal(next.run('careerBonuses().hp'),30);assert.equal(next.run('careerBonuses().attack'),6);assert.equal(next.run('careerBonuses().defense'),5);assert.equal(next.run('careerBonuses().crit'),.04);assert.equal(next.run('p.career.materials.ancientVenom'),0);assert.equal(next.run('BIOLOGY.length'),8);
});

test('normal-map samples become rarer with each initial stage and still drop when the player outlevels the map',()=>{
 const {run}=createGame();for(const [index,map]of ['valley','desert','snow','temple'].entries()){
  run('running=true;loadMap("'+map+'",true);p.level=99;var stage=BIOLOGY['+index+'],before=p.career.materials[stage.item];for(var i=0;i<stage.dropEvery-1;i++)careerKill({type:"wolf",level:1,x:p.x,y:p.y});');assert.equal(run('p.career.materials[stage.item]'),run('before'));run('careerKill({type:"wolf",level:1,x:p.x,y:p.y});');assert.equal(run('p.career.materials[stage.item]'),run('before+1'));
 }assert(run('BIOLOGY.slice(0,4).every((s,i,a)=>!i||s.dropEvery>a[i-1].dropEvery)'));
});

test('advanced samples only come from the current unlocked stage and specified map and enemy variants',()=>{
 const {run}=createGame();run('p.level=40;p.career.biology.stage=4;loadMap("desert",true);rand=()=>0;var m={type:"wolf",variant:"elite",level:10,x:400,y:400};');
 for(const setup of ['p.career.biology.stage=3;','p.level=39;','p.mapId="snow";']){run('p.career.biology.stage=4;p.level=40;p.mapId="desert";'+setup+'dropBiologySample(m);');assert.equal(run('p.career.materials.ancientVenom'),0);}
 run('p.level=40;p.mapId="desert";');for(const extra of ['variant:"normal"','type:"stone"','type:"boss"','metinParentId:"stone"','dungeonBoss:true','dungeonSeal:true']){run('dropBiologySample({...m,'+extra+'});');assert.equal(run('p.career.materials.ancientVenom'),0);}
 run('dropBiologySample(m);');assert.equal(run('p.career.materials.ancientVenom'),1);assert.equal(run('p.career.biology.sampleKills'),0);assert.equal(run('drops.length'),0);
});

test('each advanced source uses its own chance and finite pity, and wrong sources never advance the counter',()=>{
 for(let stage=4;stage<8;stage++){
  const {run}=createGame();run('p.level=99;p.career.biology.stage='+stage+';var stage=BIOLOGY['+stage+'];loadMap(stage.map,true);rand=()=>.999;var m={type:stage.boss?"boss":"wolf",variant:"rare",level:40,x:400,y:400};dropBiologySample({...m,metinParentId:"parent"});');assert.equal(run('p.career.biology.sampleKills'),0);
  run('for(var i=0;i<stage.pity-1;i++)dropBiologySample(m);');assert.equal(run('p.career.materials[stage.item]'),0);assert.equal(run('p.career.biology.sampleKills'),run('stage.pity-1'));run('dropBiologySample(m);');assert.equal(run('p.career.materials[stage.item]'),1);assert.equal(run('p.career.biology.sampleKills'),0);
  run('rand=()=>stage.chance-.001;dropBiologySample(m);');assert.equal(run('p.career.materials[stage.item]'),2);
 }
});

test('real rare monster death grants a sample once without increasing EXP from a weak enemy',()=>{
 const {run}=createGame();run('running=true;loadMap("temple",true);p.level=70;p.career.biology.stage=6;rand=()=>0;var m=mobs.find(m=>m.type==="wolf");m.variant="rare";m.hp=1;var xp=p.xp;hit(m,999999);');assert.equal(run('p.career.materials.demonHeart'),1);assert.equal(run('p.xp'),run('xp'));run('hit(m,999999);');assert.equal(run('p.career.materials.demonHeart'),1);
});

test('submissions require the NPC, level, living session, one sample, Yang and intervening kills; rejection is atomic',()=>{
 for(const setup of ['running=false;','p.hp=0;','p.x=100;p.y=100;','p.mapId="desert";','p.level=39;','p.career.materials.ancientVenom=0;','p.gold=0;','p.career.biology.nextKill=p.career.eligibleKills+1;','p.career.biology.nextDeliveryAt=Date.now()+10000;']){
  const {run}=biologist();run(setup+'var before=JSON.stringify(p);');assert(!run('completeBiology()'));assert.equal(run('JSON.stringify(p)'),run('before'));assert(run('biologyMessage.length>0'));
 }
});

test('successful submission charges only one sample and fee, and enforces both persisted real-time and kill cooldowns',()=>{
 const {run}=biologist();run('var gold=p.gold,samples=p.career.materials.ancientVenom;');assert(run('completeBiology()'));assert.equal(run('p.gold'),run('gold-500'));assert.equal(run('p.career.materials.ancientVenom'),run('samples-1'));assert.equal(run('p.career.biology.delivered'),1);assert.equal(run('p.career.biology.nextDeliveryAt'),2000000300000);assert.equal(run('biologyCooldown()'),300);
 run('p.career.eligibleKills+=10;');assert(!run('completeBiology()'));run('Date.now=()=>2000000299999;');assert(!run('completeBiology()'));run('Date.now=()=>2000000300000;');assert(run('completeBiology()'));assert.equal(run('p.career.biology.delivered'),2);
});

test('cooldown survives reload, advances offline, and remains enforceable with an open nonmodal window',()=>{
 const g=biologist();g.run('completeBiology();p.career.eligibleKills+=10;careerPanel("biology");save();');assert.equal(g.run('paused'),false);assert(!g.run('completeBiology()'));
 const next=createEmptyGame({'grindoria-characters-v1':g.saved.get('grindoria-characters-v1')});next.run('Date.now=()=>2000000001000;playCharacter();');assert.equal(next.run('biologyCooldown()'),299);assert(!next.run('completeBiology()'));next.run('Date.now=()=>2000000300000;');assert(next.run('completeBiology()'));
});

test('completion grants permanent real HP, defense, attack, magic and movement speed exactly once',()=>{
 for(let stage=4;stage<8;stage++){
  const {run}=biologist(stage);run('var stage=BIOLOGY['+stage+'];p.career.biology.delivered=stage.count-1;p.career.biology.sampleKills=3;var hp=maxHP(),atk=damage(),def=defense(),speed=speedValue(),bonuses=careerBonuses();');assert(run('completeBiology()'));assert.equal(run('p.career.biology.stage'),stage+1);assert.equal(run('p.career.biology.delivered'),0);assert.equal(run('p.career.biology.sampleKills'),0);assert.equal(run('maxHP()-hp'),run('stage.bonus.hp||0'));assert.equal(run('damage()-atk'),run('stage.bonus.attack||0'));assert.equal(run('defense()-def'),run('stage.bonus.defense||0'));assert.equal(run('speedValue()-speed'),run('stage.bonus.speed||0'));assert.equal(run('careerBonuses().magic-bonuses.magic'),run('stage.bonus.magic||0'));assert(!run('completeBiology()'));assert.equal(run('p.career.biology.stage'),stage+1);
 }
});

test('all eight stages finish sequentially and permanent bonuses survive export, import and reload without duplication',()=>{
 const g=biologist(0);g.run('for(var i=0;i<BIOLOGY.length;i++){var b=BIOLOGY[i];for(var j=0;j<b.count;j++){p.career.eligibleKills=p.career.biology.nextKill;p.career.biology.nextDeliveryAt=0;if(!completeBiology())throw Error("submission failed");}}var hp=maxHP(),attack=damage(),def=defense(),speed=speedValue();save();var backup=exportCharacters();');assert.equal(g.run('p.career.biology.stage'),8);assert(!g.run('completeBiology()'));
 const target=createEmptyGame();target.run('importCharacterBackup(prepareCharacterImport('+JSON.stringify(g.run('backup'))+'),"add");playCharacter();');for(const [expr,val]of [['maxHP()','hp'],['damage()','attack'],['defense()','def'],['speedValue()','speed']])assert.equal(target.run(expr),g.run(val));target.run('save();');const again=createGame(readSavedProfile(target.saved));assert.equal(again.run('p.career.biology.stage'),8);assert.equal(again.run('speedValue()'),g.run('speed'));
});

test('characters isolate sample stacks, active stage, pity, delivery timer and permanent bonuses',()=>{
 const {run}=createEmptyGame();run('var a=createCharacter("Prvy","warrior"),b=createCharacter("Druhy","warrior");playCharacter(a);p.career.biology.stage=5;p.career.biology.delivered=3;p.career.biology.sampleKills=7;p.career.biology.nextDeliveryAt=Date.now()+600000;p.career.materials.frozenMarrow=9;returnToCharacters();playCharacter(b);');assert.equal(run('p.career.biology.stage'),0);assert.equal(run('p.career.biology.sampleKills'),0);assert.equal(run('biologyCooldown()'),0);assert.equal(run('p.career.materials.frozenMarrow'),0);assert.equal(run('careerBonuses().speed'),0);run('returnToCharacters();playCharacter(a);');assert.equal(run('p.career.biology.delivered'),3);assert.equal(run('p.career.biology.sampleKills'),7);assert(run('biologyCooldown()>0'));assert.equal(run('p.career.materials.frozenMarrow'),9);assert.equal(run('careerBonuses().speed'),12);
});

test('old backups migrate additively; malformed timers, sample counters and new material stocks reject atomically',()=>{
 const g=biologist();g.run('save();');const doc=JSON.parse(g.run('exportCharacters()')),id=doc.account.selectedId,old=JSON.parse(JSON.stringify(doc));for(const key of Object.keys(g.run('BIOLOGY_MATERIALS')))delete old.account.profiles[id].data.career.materials[key];delete old.account.profiles[id].data.career.biology.nextDeliveryAt;delete old.account.profiles[id].data.career.biology.sampleKills;assert(g.run('prepareCharacterImport('+JSON.stringify(JSON.stringify(old))+')'));
 for(const [key,value]of [['nextDeliveryAt',-1],['nextDeliveryAt','tomorrow'],['sampleKills',.5],['sampleKills',null]]){const bad=JSON.parse(JSON.stringify(doc));bad.account.profiles[id].data.career.biology[key]=value;const before=g.saved.get('grindoria-characters-v1');assert.throws(()=>g.run('prepareCharacterImport('+JSON.stringify(JSON.stringify(bad))+')'));assert.equal(g.saved.get('grindoria-characters-v1'),before);}
 const bad=JSON.parse(JSON.stringify(doc));bad.account.profiles[id].data.career.materials.ancientVenom=-1;assert.throws(()=>g.run('prepareCharacterImport('+JSON.stringify(JSON.stringify(bad))+')'));
});

test('NPC panel shows objectives, exact sources, drop/pity, prices, timers and rewards; timer refresh keeps the same dialog',()=>{
 const {run,elements}=biologist();run('p.career.biology.nextDeliveryAt=Date.now()+1000;careerPanel("biology");');let html=elements.get('modalcontent').innerHTML;for(const text of ['Aktívny výskum','Koncentrovaný jed','Elitné a vzácne škorpióny','20 %','10. vhodné','500','5 min','+12 rýchlosť','biology-submit'])assert(html.includes(text),text);assert.match(html,/biology-submit[^>]+disabled/);
 run('Date.now=()=>2000000001000;refreshBiologyPanel();');assert.equal(elements.get('biology-submit').disabled,false);assert.equal(elements.get('biology-status').textContent,'Možno odovzdať.');assert.equal(elements.get('modalcontent').innerHTML,html);assert.equal(run('paused'),false);
 run('closeModal();journal();');assert(elements.get('modalcontent').innerHTML.includes('Biologický výskum'));elements.get('journalBiology').onclick();assert(run('panelState.key==="career:biology"'));
});
