const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,readSavedProfile}=require('./helpers/game.cjs');
const schools=['body','mental','blade','archery','weapon','black','dragon','healing'];
function arena(school='body'){
 const g=createGame();g.run(`running=true;paused=false;p.classId=SCHOOLS['${school}'].classId;p.schools[p.classId]='${school}';p.level=40;p.x=1500;p.y=1500;var pts=117,caster=['sura','shaman'].includes(p.classId);p.strength=Math.floor(pts*(caster?.2:.45));p.vitality=Math.floor(pts*.3);p.intelligence=caster?Math.floor(pts*.4):0;p.dexterity=pts-p.strength-p.vitality-p.intelligence;p.points=0;p.hp=maxHP();p.mp=maxMP();rand=()=>.99;var foe={type:'wolf',skin:'wolf',level:40,x:1545,y:1500,hp:1e8,max:1e8,skillContributors:[],resistances:Object.fromEntries(Object.keys(DAMAGE_TYPES).map(id=>[id,0]))};mobs.length=0;mobs.push(foe);for(const slot of Object.keys(EQUIPMENT))p.equipped[slot]=null;for(let i=0;i<6;i++)skillProgress(skillKey(i)).rank=21;`);return g;
}
function loadout(g,enhance){g.run(`for(const slot of Object.keys(EQUIPMENT)){p.equipped[slot]=generateEquipmentItem(slot,1,40,generatedWeaponKind(),layoutRandom(slot));p.equipped[slot].enhance=${enhance};}p.hp=maxHP();p.mp=maxMP();`);}
function strike(g,index){return g.run(`foe.hp=1e8;hurtMob(foe,school().skills[${index}][4],true,skillKey(${index}),{type:skillDamageType(skillKey(${index})),multiplier:1})`);}
test('every school deals the same spell damage to equal defenses regardless of target level',()=>{
 for(const school of schools){const g=arena(school);loadout(g,6);const index=g.run('school().skills.findIndex(s=>!SUPPORT_SKILLS.has(s[1]))');let first;
 for(const level of [1,40,60,99,105]){g.run('foe.level='+level);const actual=strike(g,index);first??=actual;assert.equal(actual,first,`${school} against Lv.${level}`);}
 assert.equal(g.run('typeof playerDamageLevelFactor'),'undefined');assert.equal(g.run('BATTLE.levelGrace'),undefined);
 }
});
test('each school gains substantial real spell power from upgrading the same legal gear',()=>{
 for(const school of schools){const g=arena(school),index=g.run('school().skills.findIndex(s=>!SUPPORT_SKILLS.has(s[1]))');const naked=strike(g,index);loadout(g,0);let previous=strike(g,index),base=previous;assert(previous>naked);
 for(const rank of [3,6,9]){g.run('for(const item of Object.values(p.equipped))item.enhance='+rank);const value=strike(g,index);assert(value>previous,school+' +'+rank);previous=value;}
 assert(previous>base*1.3,school);assert(previous>naked*2,school+' should favor equipment');
 }
});
test('a weak ungeared P skill cannot one-shot an ordinary target forty levels higher',()=>{
 for(const school of schools){const g=arena(school);g.run('for(let i=0;i<6;i++)skillProgress(skillKey(i)).rank=41;foe.level=80;var actualHP=enemyCombatStats(80).hp;');
 for(let i=0;i<6;i++){if(g.run(`SUPPORT_SKILLS.has(school().skills[${i}][1])`))continue;assert(strike(g,i)<g.run('actualHP'),school+':'+i);}
 }
});
test('upgraded gear still lets all eight schools actually defeat a higher-level enemy for EXP',()=>{
 for(const school of schools){const g=arena(school);loadout(g,9);g.run(`foe.level=60;foe.max=enemyCombatStats(60).hp;foe.hp=foe.max;foe.attackScale=enemyCombatStats(60).attack;foe.baseLevel=60;foe.spawnId='geared-test';foe.spawnPointId='geared-test';foe.homeX=foe.x;foe.homeY=foe.y;foe.cd=1;foe.engaged=8;combatAssist.focused=true;p.combatAssist={autoAim:true,autoSpell:true,autoPotion:true};p.potions=20;var xp=p.xp,dead=false;death=()=>dead=true;var elapsed=0,epoch=Date.now();Date.now=()=>epoch+elapsed*1000;selectCombatTarget(foe,true);for(let i=0;i<600&&foe.hp>0&&!dead;i++){elapsed+=.05;update(.05);}`);
 assert.equal(g.run('dead'),false,school);assert.equal(g.run('foe.hp'),0,school);assert(g.run('p.xp>xp'),school+' EXP');
 }
});
test('damage over time benefits from gear and never applies a hidden level penalty',()=>{
 const g=arena('archery');g.run('applyCombatControl(foe,{dot:"fire",skillKey:skillKey(0),multiplier:1});var weak=foe.dots[0].power;foe.dots=[];');loadout(g,9);g.run('applyCombatControl(foe,{dot:"fire",skillKey:skillKey(0),multiplier:1});var strong=foe.dots[0].power;');assert(g.run('strong>weak*2'));
 let first;for(const level of [40,80,105]){g.run('foe.hp=1e8;foe.level='+level+';foe.dots=[];applyDamageOverTime(foe,"fire",strong,skillKey(0));updateDamageOverTime(foe,1);');const damage=g.run('1e8-foe.hp');first??=damage;assert.equal(damage,first);}
});
test('reflections and basic attacks remain independent of target level at equal defenses',()=>{
 const g=arena('dragon');let basic,reflected;for(const level of [40,80,105]){g.run('foe.hp=1e8;foe.level='+level);const dealt=g.run('hurtMob(foe,1,false,null,{basic:true,type:"physical",multiplier:1})');basic??=dealt;assert.equal(dealt,basic);g.run('foe.hp=1e8;p.hp=maxHP();buffs.reflect=10;takeDamage(20,foe,"physical");');const reflection=g.run('1e8-foe.hp');reflected??=reflection;assert.equal(reflection,reflected);}
});
test('P keeps meaningful offensive progression while healing, mana and support duration stay intact',()=>{
 const g=arena();loadout(g,6);let last=0;for(const rank of [1,20,21,30,31,40,41]){g.run('skillProgress(skillKey(0)).rank='+rank);const actual=strike(g,0);assert(actual>last);last=actual;}
 const h=arena('healing');h.run('skillProgress(skillKey(3)).rank=41;p.hp=1;p.mp=maxMP();var mana=p.mp,expected=Math.min(maxHP()-p.hp,Math.round((45+p.level*5+p.intelligence*4+careerBonuses().magic+equipmentBonuses().magic)*skillFactor(skillKey(3))*(1+passiveBonuses().heal)));castSkill(3);');assert.equal(h.run('p.hp'),h.run('1+expected'));assert.equal(h.run('mana-p.mp'),25);
 const b=arena();b.run('skillProgress(skillKey(1)).rank=41;castSkill(1);');assert.equal(b.run('buffs.aura'),b.run('12*skillFactor(skillKey(1))'));
});
test('new Metin health is monotonic and substantially above schema two without changing armor',()=>{
 const g=arena();let last=0;for(let level=1;level<=99;level++){g.run('var level='+level+',type=metinTypeForLevel(level),stats=metinStats(level,type),oldHP=Math.round((180+level*28+level*level*.6)*METIN_TYPES[type].hp*(1.8+level*.035));');const hp=g.run('stats.hp');assert(hp>last);assert(g.run('stats.hp>oldHP*2.5'));assert.equal(g.run('stats.armor'),g.run('Math.floor(level*.3+METIN_TYPES[type].armor*20)'));last=hp;}
 assert.equal(g.run('metinStats(99,"doom").hp'),260420);
});
test('schema-two wounded and dead Metins retain their progress and generation after reload',()=>{
 const g=arena();g.run('loadMap("suterland",true);var stone=mobs.find(m=>m.level===60),dead=mobs.find(m=>m.level===61);stone.metinSchema=2;stone.max=stone.baseMax=10000;stone.hp=2500;stone.metinGeneration=7;stone.metinGuardSerial=12;dead.metinSchema=2;dead.hp=0;dead.dead=7;save();');const next=createGame(readSavedProfile(g.saved));next.run('var stone=mobs.find(m=>m.level===60),dead=mobs.find(m=>m.level===61);');assert(next.run('Math.abs(stone.hp/stone.max-.25)<.001'));assert.equal(next.run('stone.metinSchema'),3);assert.equal(next.run('stone.metinGeneration'),7);assert.equal(next.run('stone.metinGuardSerial'),12);assert.equal(next.run('dead.hp'),0);assert.equal(next.run('dead.dead'),7);next.run('running=true;save();');const third=createGame(readSavedProfile(next.saved));assert.equal(third.run('mobs.find(m=>m.level===60).max'),next.run('stone.max'));assert.equal(third.run('mobs.find(m=>m.level===60).hp'),next.run('stone.hp'));
});
