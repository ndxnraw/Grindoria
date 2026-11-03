const test = require('node:test'), assert = require('node:assert/strict');
const { createGame } = require('./helpers/game.cjs');

function profile(level = 17) {
  const game = createGame();
  game.run(`p.level=${level};p.gold=1234;p.braveryCapes=2;save();`);
  return JSON.parse(game.saved.get('grindoria-save-v1'));
}

test('ordinary, elite and rare enemies stay neutral while wandering near a peaceful player', () => {
  const { run } = createGame();
  run('running=true;let group=mobs.filter(m=>m.type==="wolf").slice(0,3);group.forEach((m,i)=>Object.assign(m,{variant:["normal","elite","rare"][i],x:400+i*30,y:1400,homeX:400+i*30,homeY:1400,engaged:0,taunt:0,cd:0}));p.x=445;p.y=1400;p.hp=maxHP();let health=p.hp,positions=group.map(m=>[m.x,m.y]);for(let i=0;i<100;i++)update(.05);');
  assert.equal(run('p.hp'), run('health'));
  assert(run('group.every(m=>Math.hypot(m.x-m.homeX,m.y-m.homeY)<=SPAWN_RULES.roamRadius+1e-8&&m.engaged===0&&m.taunt===0)'));
});

test('attacked enemies retaliate and maintain an ongoing fight', () => {
  const { run } = createGame();
  run('running=true;let foe=mobs[0];p.x=foe.x+35;p.y=foe.y;p.hp=10000;foe.cd=0;hit(foe,1);let health=p.hp;for(let i=0;i<200;i++)updateEnemySpawns(.05,false);');
  assert(run('p.hp < health'));
  assert(run('foe.engaged>0'));
});

test('a ranged hit does not attract a neighboring different group; escaping ends retaliation', () => {
  const { run } = createGame();
  run('running=true;mobs.forEach(m=>{m.hp=0;m.dead=1000;});let [foe,neighbor]=mobs.filter(m=>m.type==="wolf");Object.assign(foe,{hp:1000,x:400,y:1400,homeX:400,homeY:1400});Object.assign(neighbor,{hp:1000,x:450,y:1400,homeX:450,homeY:1400,spawnPointId:"another-pack"});p.x=850;p.y=1400;hit(foe,1);for(let i=0;i<60;i++)updateEnemySpawns(.05,false);');
  assert(run('foe.x>400')); assert.equal(run('neighbor.engaged'), 0);
  run('p.x=1950;p.y=1950;for(let i=0;i<400;i++)updateEnemySpawns(.05,false);');
  assert.equal(run('foe.engaged'), 0); assert(run('Math.hypot(foe.x-foe.homeX,foe.y-foe.homeY)<=SPAWN_RULES.roamRadius+1e-8'));
});

test('bosses still automatically approach a player within their natural aggro range', () => {
  const { run } = createGame();
  run('let boss=mobs.find(m=>m.type==="boss");p.x=boss.x-250;p.y=boss.y;let before=Math.hypot(boss.x-p.x,boss.y-p.y);updateBoss(.5,false);');
  assert(run('Math.hypot(boss.x-p.x,boss.y-p.y)<before')); assert.equal(run('boss.taunt'), 0);
});

test('a compatible previous save is imported without embedding project-specific legacy names', () => {
  const original = profile();
  const { run, saved } = createGame(original, 'previous-save-v1');
  assert.equal(run('p.level'), 17); assert.equal(run('p.gold'), 1234); assert.equal(run('p.braveryCapes'), 2);
  assert(saved.has('grindoria-save-v1'));
  assert.deepEqual(JSON.parse(saved.get('previous-save-v1')), original);
});

test('the canonical save takes precedence and unrelated storage is not imported', () => {
  const canonical = profile(9), older = profile(5);
  const game = createGame(canonical, 'grindoria-save-v1', { 'previous-save-v1': older });
  assert.equal(game.run('p.level'), 9); assert.equal(game.run('pendingSaveImports.length'), 0);
  const other = createGame(null, 'grindoria-save-v1', { 'another-save-v1': { level: 99, coins: 1000 } });
  assert.equal(other.run('p.level'), 1); assert.equal(other.saved.has('grindoria-save-v1'), false);
});

test('multiple compatible profiles require an explicit selection before play', () => {
  const first = profile(17), second = profile(8);
  const { run, saved, elements } = createGame(first, 'previous-save-v1', { 'second-save-v1': second });
  assert.equal(run('pendingSaveImports.length'), 2); assert.equal(saved.has('grindoria-save-v1'), false);
  run('save();'); assert.equal(saved.has('grindoria-save-v1'), false);
  run('startGame();'); assert.equal(run('running'), false); assert.match(elements.get('modalcontent').innerHTML, /Pokračovať v príbehu/);
  assert.equal(run('chooseSaveImport(1)'), true); assert.equal(run('p.level'), 8); assert.equal(run('running'), true);
  assert.equal(JSON.parse(saved.get('grindoria-save-v1')).level, 8);
});
