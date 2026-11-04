const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,createEmptyGame,readSavedProfile,readSavedAccount}=require('./helpers/game.cjs');
function ready(){const g=createGame();g.run('running=true;loadMap("town",true);p.level=99;p.gold=1000000;p.career.materials.keys=1000;p.hp=maxHP();p.mp=maxMP();');return g;}
function finishTrial(g,id,collect=true){assert(g.run('enterPrestigeTrial("'+id+'")'));g.run('for(const m of [...mobs].filter(m=>!m.dungeonBoss))hit(m,1e9,"arcane",true);dungeonUnlocked();hit(mobs.find(m=>m.dungeonBoss),1e9,"arcane",true);');if(collect)g.run('for(const drop of [...drops]){drop.fallAge=LOOT_RULES.fallDuration;p.x=drop.x;p.y=drop.y;pickUpGroundDrop(drop.id);}');assert(g.run('finishDungeon()'));}

test('prestige activation requires level 99, a living out-of-combat session, and no active expedition',()=>{
 const g=ready();for(const setup of ['p.level=98;','p.hp=0;','running=false;','travelCombat.time=2;']){g.run('p.level=99;p.hp=maxHP();running=true;travelCombat.time=0;'+setup+'var before=JSON.stringify(p);');assert(!g.run('activatePrestige()'));assert.equal(g.run('JSON.stringify(p)'),g.run('before'));}
 g.run('p.level=99;p.hp=maxHP();running=true;travelCombat.time=0;enterDungeon("crypt");');assert(!g.run('activatePrestige()'));g.run('finishDungeon();enterRift();');assert(!g.run('activatePrestige()'));
});

test('activation retains level, Yang, equipment IDs and affixes, inventory, skills, biology and all existing progress',()=>{
 const g=ready();g.run('addGearItem(generateEquipmentItem("weapon",5,99));equipItem(0);p.equipped.weapon.enhance=9;p.career.biology.stage=8;skillProgress(skillKey(0)).rank=20;var gear=JSON.stringify(p.equipped),careerBefore=JSON.stringify({biology:p.career.biology,skills:p.career.skills,alchemy:p.career.alchemy}),gold=p.gold,hp=maxHP();');assert(g.run('activatePrestige()'));assert.equal(g.run('p.level'),99);assert.equal(g.run('p.gold'),g.run('gold'));assert.equal(g.run('JSON.stringify(p.equipped)'),g.run('gear'));assert.equal(g.run('JSON.stringify({biology:p.career.biology,skills:p.career.skills,alchemy:p.career.alchemy})'),g.run('careerBefore'));assert.equal(g.run('maxHP()-hp'),40);assert.equal(g.run('p.career.prestige.marks'),5);assert(!g.run('activatePrestige()'));assert.equal(g.run('p.career.prestige.marks'),5);
});

test('old profiles and backups without prestige load with zero rank and no retrospective challenge currency',()=>{
 const g=ready();g.run('save();');const account=readSavedAccount(g.saved),id=account.selectedId;delete account.profiles[id].data.career.prestige;const n=createEmptyGame({'grindoria-characters-v1':account});assert.equal(n.run('characterStore.error'),'');assert(n.run('playCharacter()'));assert.equal(n.run('prestigeRank()'),0);assert.equal(n.run('p.career.prestige.marks'),0);
 const doc={format:'grindoria-characters',version:2,account};const imported=createEmptyGame();imported.run('importCharacterBackup(prepareCharacterImport('+JSON.stringify(JSON.stringify(doc))+'),"add");playCharacter();');assert.equal(imported.run('prestigeRank()'),0);assert.equal(imported.run('p.level'),99);
});

test('locked challenges charge nothing; prestige trials use the current rank, Lv99, stronger enemies and rare bosses',()=>{
 const g=ready();g.run('var gold=p.gold;');assert(!g.run('enterPrestigeTrial("crypt")'));assert.equal(g.run('p.gold'),g.run('gold'));g.run('enterDungeon("crypt","mythic");var normalHP=mobs.find(m=>m.dungeonBoss).max;finishDungeon();activatePrestige();');assert(g.run('enterPrestigeTrial("crypt")'));assert.equal(g.run('dungeonRun().prestigeTier'),1);assert.equal(g.run('map().level'),99);assert(g.run('mobs.every(m=>m.level===99)'));assert(g.run('mobs.find(m=>m.dungeonBoss).max>normalHP'));assert.equal(g.run('mobs.find(m=>m.dungeonBoss).variant'),'rare');assert(g.run('mobs.find(m=>m.dungeonBoss).max>=189000'));assert.equal(g.run('dungeonAttackBase()'),300);assert(g.run('mobs.find(m=>m.dungeonBoss).name.startsWith("Vzácny")'));assert(!g.run('enterPrestigeTrial("abyss")'));g.run('validateCharacterAccount(accountWithActiveSnapshot());');
});

test('prestige pulses alternate avoidable rings and lines after unlocking; caps and safe zones remain effective',()=>{
 const g=ready();g.run('activatePrestige();enterPrestigeTrial("abyss");p.x=900;p.y=700;prestigeDungeonPulse();');assert.equal(g.run('dungeonRun().hazards.length'),0);g.run('for(const m of mobs.filter(m=>!m.dungeonBoss))hit(m,1e9,"arcane",true);dungeonUnlocked();prestigeDungeonPulse();prestigeDungeonPulse();');assert.equal(g.run('dungeonRun().hazards[0].kind'),'ring');assert.equal(g.run('dungeonRun().hazards[1].kind'),'line');assert(g.run('dungeonRun().hazards.every(h=>h.delay===1.8)'));g.run('for(var i=0;i<30;i++)prestigeDungeonPulse();');assert.equal(g.run('dungeonRun().hazards.length'),12);g.run('dungeonRun().hazards=[];dungeonRun().hazardTimer=0;updateDungeon(.05,true);');assert.equal(g.run('dungeonRun().hazards.length'),0);
});

test('prestige boss rewards are once per real run; abandonment and ordinary mythic runs grant no marks',()=>{
 const g=ready();g.run('activatePrestige();enterPrestigeTrial("crypt");var marks=p.career.prestige.marks;finishDungeon();');assert.equal(g.run('p.career.prestige.marks'),g.run('marks'));g.run('enterDungeon("crypt","mythic");for(const m of [...mobs])hit(m,1e9,"arcane",true);finishDungeon();');assert.equal(g.run('p.career.prestige.marks'),g.run('marks'));finishTrial(g,'crypt');assert.equal(g.run('p.career.prestige.marks'),g.run('marks+1'));assert.equal(g.run('p.career.prestige.clears["crypt:1"]'),1);assert.equal(g.run('p.career.prestige.bosses.crypt'),1);
});

test('prestige loot grants a real Legendary or Mythic item with finite pity and persists after leaving',()=>{
 const g=ready();g.run('activatePrestige();p.career.dungeons.pity["crypt:mythic"]=11;');finishTrial(g,'crypt',false);assert(g.run('drops.some(d=>d.item?.rarity===5)'));assert.equal(g.run('p.career.dungeons.pity["crypt:mythic"]'),0);assert.equal(g.run('p.mapId'),'town');assert.equal(g.run('prestigeProgress({metric:"uniques"})'),0);
 g.run('for(const drop of [...drops]){drop.fallAge=LOOT_RULES.fallDuration;p.x=drop.x;p.y=drop.y;pickUpGroundDrop(drop.id);}');assert.equal(g.run('prestigeProgress({metric:"uniques"})'),1);g.run('var i=p.bag.findIndex(item=>item.uniqueId==="crypt");sellItem(i);');assert.equal(g.run('prestigeProgress({metric:"uniques"})'),1);
});

test('high Metin counters begin only after activation, reject weaker stones and do not count duplicate damage',()=>{
 const g=ready();g.run('loadMap("suterland",true);var stone=mobs.find(m=>m.level===99);hit(stone,1e9,"arcane",true);');assert.equal(g.run('p.career.prestige.metins'),0);g.run('loadMap("town",true);travelCombat.time=0;activatePrestige();loadMap("suterland",true);hit(mobs.find(m=>m.level===94),1e9,"arcane",true);var high=mobs.find(m=>m.level===98);hit(high,1e9,"arcane",true);hit(high,1e9,"arcane",true);');assert.equal(g.run('p.career.prestige.metins'),1);
});

test('promotion requires varied milestones, rejects old low-tier clears, and all five ranks can be earned sequentially',()=>{
 const g=ready();g.run('activatePrestige();');assert(!g.run('promotePrestige()'));finishTrial(g,'crypt');g.run('p.career.prestige.metins=5;for(var i=0;i<3;i++)skillProgress(skillKey(i)).rank=10;');assert(g.run('promotePrestige()'));assert.equal(g.run('prestigeRank()'),2);g.run('skillProgress(skillKey(0)).rank=20;');finishTrial(g,'frost');finishTrial(g,'frost');assert(g.run('promotePrestige()'));assert.equal(g.run('prestigeRank()'),3);
 g.run('p.career.biology.stage=8;');finishTrial(g,'abyss');assert(g.run('promotePrestige()'));assert.equal(g.run('prestigeRank()'),4);assert.equal(g.run('prestigeProgress({metric:"trials4"})'),0);
 g.run('for(var i=0;i<6;i++)skillProgress(skillKey(i)).rank=20;for(const id of PRESTIGE_BESTIARY_KEYS)p.bestiary[id]=1;addGearItem(generateEquipmentItem("weapon",4,99));equipItem(p.bag.length-1);p.equipped.weapon.enhance=9;');
 for(const id of ['crypt','frost','abyss'])finishTrial(g,id);assert(g.run('promotePrestige()'));assert.equal(g.run('prestigeRank()'),5);assert(!g.run('promotePrestige()'));assert.equal(g.run('p.level'),99);assert.equal(g.run('playerResistances().physical'),.05);assert.equal(g.run('careerBonuses().attackPercent'),.03);
});

test('training costs marks atomically, affects real stats and stops at its finite cap',()=>{
 const g=ready();g.run('activatePrestige();var hp=maxHP();');assert(g.run('trainPrestige("vitality")'));assert.equal(g.run('maxHP()-hp'),15);assert.equal(g.run('p.career.prestige.marks'),2);assert(!g.run('trainPrestige("vitality")'));assert(!g.run('trainPrestige("toString")'));g.run('p.career.prestige.marks=1000;');for(let i=1;i<10;i++)assert(g.run('trainPrestige("vitality")'));g.run('var before=p.career.prestige.marks;');assert(!g.run('trainPrestige("vitality")'));assert.equal(g.run('p.career.prestige.marks'),g.run('before'));
});

test('endgame goal claims are one-time and require actual current equipment, bonus rolls and progression',()=>{
 const g=ready();g.run('activatePrestige();');assert(!g.run('claimPrestigeGoal("biology")'));g.run('p.career.biology.stage=8;var marks=p.career.prestige.marks;');assert(g.run('claimPrestigeGoal("biology")'));assert.equal(g.run('p.career.prestige.marks'),g.run('marks+20'));assert(!g.run('claimPrestigeGoal("biology")'));assert(!g.run('claimPrestigeGoal("constructor")'));
 g.run('rand=()=>.999999;addGearItem(generateEquipmentItem("weapon",5,99));');assert.equal(g.run('prestigeProgress(PRESTIGE_GOALS.perfect)'),1);g.run('p.bag.at(-1).affixes[0].roll=99;');assert.equal(g.run('prestigeProgress(PRESTIGE_GOALS.perfect)'),0);assert.equal(g.run('prestigeProgress(PRESTIGE_GOALS.arsenal)'),0);
});

test('prestige state, marks and challenge identity survive reload and backup without repeating boss rewards',()=>{
 const g=ready();g.run('activatePrestige();enterPrestigeTrial("frost");for(const m of [...mobs])hit(m,1e9,"arcane",true);save();var marks=p.career.prestige.marks;');const doc=g.saved.get('grindoria-characters-v1'),n=createEmptyGame({'grindoria-characters-v1':doc});assert(n.run('playCharacter()'));assert.equal(n.run('dungeonRun().prestigeTier'),1);assert.equal(n.run('p.career.prestige.marks'),g.run('marks'));n.run('hit(mobs.find(m=>m.dungeonBoss),1e9,"arcane",true);save();var backup=exportCharacters();');assert.equal(n.run('p.career.prestige.marks'),g.run('marks'));const target=createEmptyGame();target.run('importCharacterBackup(prepareCharacterImport('+JSON.stringify(n.run('backup'))+'),"add");playCharacter();');assert.equal(target.run('p.career.prestige.clears["frost:1"]'),1);assert.equal(target.run('p.career.prestige.marks'),g.run('marks'));
});

test('two characters have separate prestige, marks, training and visual emblems',()=>{
 const {run}=createEmptyGame();run('var a=createCharacter("Prvy","warrior"),b=createCharacter("Druhy","warrior");playCharacter(a);p.level=99;activatePrestige();trainPrestige("vitality");returnToCharacters();playCharacter(b);');assert.equal(run('prestigeRank()'),0);assert.equal(run('p.career.prestige.marks'),0);assert.equal(run('p.career.prestige.training.vitality'),0);assert.equal(run('prestigeEmblemSVG(p)'),'');run('returnToCharacters();playCharacter(a);');assert.equal(run('prestigeRank()'),1);assert.equal(run('p.career.prestige.marks'),2);assert(run('prestigeEmblemSVG(p).includes("data-prestige-rank")'));assert(run('characterAvatar({classId:p.classId,data:p}).includes("data-prestige-rank")'));
});

test('malformed prestige and challenge imports fail transactionally and do not touch saved data',()=>{
 const g=ready();g.run('activatePrestige();save();');const doc=JSON.parse(g.run('exportCharacters()')),id=doc.account.selectedId;
 for(const mutate of [d=>d.career.prestige.rank=6,d=>d.level=98,d=>d.career.prestige.marks=-1,d=>d.career.prestige.training.guard=11,d=>d.career.prestige.clears['crypt:5']=1,d=>d.career.prestige.claimed.nope=true,d=>d.career.prestige.uniques.nope=true]){const bad=JSON.parse(JSON.stringify(doc));mutate(bad.account.profiles[id].data);const before=g.saved.get('grindoria-characters-v1');assert.throws(()=>g.run('prepareCharacterImport('+JSON.stringify(JSON.stringify(bad))+')'));assert.equal(g.saved.get('grindoria-characters-v1'),before);}
 g.run('enterPrestigeTrial("crypt");save();');const bad=JSON.parse(g.run('exportCharacters()'));bad.account.profiles[id].data.career.dungeons.run.prestigeTier=5;assert.throws(()=>g.run('prepareCharacterImport('+JSON.stringify(JSON.stringify(bad))+')'));
});

test('prestige panel and endgame shortcut have functional goals, requirements and actions',()=>{
 const {run,elements}=ready();run('careerPanel("prestige");');assert(elements.get('modalcontent').innerHTML.includes('Aktivovať prestíž I'));run('closeModal();activatePrestige();careerPanel("prestige");');for(const text of ['Znaky prestíže','Prestížne výzvy','Pasívny tréning','Endgame ciele','1,8 s','data-prestige-trial','data-action="prestigePromote"'])assert(elements.get('modalcontent').innerHTML.includes(text),text);run('careerPanel("endgame");');elements.get('open-prestige').onclick();assert.equal(run('panelState.key'),'career:prestige');
});


test('Mythic refinement is a finite deterministic path to maximum rolls and preserves item identity and affix combination',()=>{
 const g=ready();g.run('activatePrestige();p.career.prestige.rank=3;p.career.prestige.marks=10000;rand=()=>.4;addGearItem(generateEquipmentItem("weapon",5,99));equipItem(0);p.equipped.weapon.enhance=9;var item=p.equipped.weapon,id=item.uid,stats=item.affixes.map(a=>a.stat).join(","),base=item.bonus;');
 for(let index=0;index<5;index++){g.run('var stat=item.affixes['+index+'].stat;');while(g.run('item.affixes['+index+'].roll')<100)assert(g.run('refinePrestigeAffix("weapon:"+stat)'));assert(!g.run('refinePrestigeAffix("weapon:"+stat)'));}
 assert.equal(g.run('item.uid'),g.run('id'));assert.equal(g.run('item.bonus'),g.run('base'));assert.equal(g.run('item.enhance'),9);assert.equal(g.run('item.affixes.map(a=>a.stat).join(",")'),g.run('stats'));assert.equal(g.run('prestigeProgress(PRESTIGE_GOALS.perfect)'),1);g.run('validateCharacterAccount(accountWithActiveSnapshot());');
 const n=createEmptyGame({'grindoria-characters-v1':g.saved.get('grindoria-characters-v1')});assert(n.run('playCharacter()'));assert(n.run('p.equipped.weapon.affixes.every(a=>a.roll===100)'));
});

test('refinement rejects insufficient marks, lower prestige, non-Mythic gear and invalid bonus references atomically',()=>{
 const g=ready();g.run('activatePrestige();rand=()=>.4;addGearItem(generateEquipmentItem("weapon",5,99));equipItem(0);var stat=p.equipped.weapon.affixes[0].stat;');for(const setup of ['p.career.prestige.rank=2;p.career.prestige.marks=100;','p.career.prestige.rank=3;p.career.prestige.marks=0;']){g.run(setup+'var before=JSON.stringify(p);');assert(!g.run('refinePrestigeAffix("weapon:"+stat)'));assert.equal(g.run('JSON.stringify(p)'),g.run('before'));}assert(!g.run('refinePrestigeAffix("weapon:__proto__")'));assert(!g.run('refinePrestigeAffix("constructor:attack")'));
});


test('actual prestige boss telegraphs and material payouts use the same scaled values shown in the UI',()=>{
 const g=ready();g.run('activatePrestige();enterPrestigeTrial("crypt");rand=()=>.99999;for(const m of mobs.filter(m=>!m.dungeonBoss))hit(m,1e9,"arcane",true);dungeonUnlocked();p.x=900;p.y=700;var boss=mobs.find(m=>m.dungeonBoss);boss.cd=0;updateDungeonBoss(boss,.01,false);');assert.equal(g.run('boss.attackPlan.damage'),720);assert.equal(g.run('dungeonCombatDifficulty().reward'),4);g.run('var primal=p.career.materials.primal;hit(boss,1e9,"arcane",true);');assert.equal(g.run('p.career.materials.primal-primal'),4);
});
