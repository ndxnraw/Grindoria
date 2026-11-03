const test = require('node:test'), assert = require('node:assert/strict');
const { createGame } = require('./helpers/game.cjs');

test('neutral creatures wander independently, pause, and remain inside their home radius on every map', () => {
  const { run } = createGame();
  for (const id of ['valley', 'desert', 'snow', 'temple']) {
    run(`running=true;loadMap('${id}',true);p.hp=100000;`);
    run('var peaceful=mobs.filter(m=>m.type==="wolf");var starts=peaceful.map(m=>[m.x,m.y]);var moved=new Set(),pausedCount=0,health=p.hp;for(let i=0;i<1200;i++){updateEnemySpawns(.05,true);for(let j=0;j<peaceful.length;j++){let m=peaceful[j];if(Math.hypot(m.x-starts[j][0],m.y-starts[j][1])>8)moved.add(j);if(m.roamWait>0)pausedCount++;if(Math.hypot(m.x-m.homeX,m.y-m.homeY)>SPAWN_RULES.roamRadius+1e-7||isSanctuary(m)||m.x<45||m.x>1955||m.y<45||m.y>1955)throw Error("Wander escaped safe home bounds");}}');
    assert.equal(run('moved.size'), run('peaceful.length'));
    assert(run('pausedCount>0')); assert.equal(run('p.hp'), run('health'));
    assert(run('peaceful.every(m=>!m.engaged&&!m.taunt)'));
  }
});

test('spawn locations vary within each pack without changing slot identity or population', () => {
  const { run } = createGame();
  run('let point=spawnPoints.find(p=>p.kind==="pack"),samples=Array.from({length:20},()=>createSpawnEnemy(point,0));');
  assert.equal(run('new Set(samples.map(m=>m.x.toFixed(3)+":"+m.y.toFixed(3))).size'), 20);
  assert(run('samples.every(m=>m.spawnId===samples[0].spawnId&&Math.hypot(m.x-point.x,m.y-point.y)<=60+1e-8&&!isSanctuary(m))'));
  assert(run('spawnPoints.filter(p=>p.kind==="pack").every((p,i,all)=>all.every(q=>p===q||p.x!==q.x&&p.y!==q.y))'));
});

function setupPack(run) {
  run('running=true;mobs.forEach(m=>{m.hp=0;m.dead=1000;});let pack=mobs.filter(m=>m.type==="wolf"&&!m.rareSlot).slice(0,6),foe=pack[0];pack.forEach((m,i)=>Object.assign(m,{hp:1000,max:1000,x:400+i*35,y:1400,homeX:400+i*35,homeY:1400,engaged:0,taunt:0,roamWait:1000,roamTarget:null,returning:false}));p.x=700;p.y=1400;p.hp=100000;');
}

test('one hit attracts at most five members of its own pack and repeated hits do not recruit the sixth', () => {
  const { run } = createGame(); setupPack(run);
  run('let outsider=mobs.filter(m=>m.type==="wolf")[6];Object.assign(outsider,{hp:1000,x:410,y:1400,homeX:410,homeY:1400,roamWait:1000});hit(foe,1);let starts=pack.map(m=>m.x);');
  assert.equal(run('pack.filter(m=>m.engaged>0).length'), 5);
  assert.equal(run('outsider.engaged'), 0);
  run('for(let i=0;i<10;i++)hit(foe,1);for(let i=0;i<30;i++)updateEnemySpawns(.05,false);');
  assert(run('pack.slice(0,5).every((m,i)=>m.x>starts[i])'));
  assert.equal(run('pack[5].engaged'), 0); assert.equal(run('pack[5].x'), run('starts[5]'));
  assert.equal(run('outsider.engaged'), 0);
});

test('a lethal hit still alerts nearby surviving allies but not dead or distant members', () => {
  const { run } = createGame(); setupPack(run);
  run('pack[1].hp=0;pack[2].x=1500;pack[2].homeX=1500;foe.hp=1;hit(foe,2);');
  assert.equal(run('foe.hp'), 0); assert.equal(run('pack[1].engaged'), 0); assert.equal(run('pack[2].engaged'), 0);
  assert(run('pack.slice(3).every(m=>m.engaged>0)'));
});

test('direct area damage and the cape can deliberately engage more than the assistance limit', () => {
  const { run } = createGame(); setupPack(run);
  run('hit(foe,1);hit(pack[5],1);'); assert.equal(run('pack.filter(m=>m.engaged>0).length'), 6);
  run('pack.forEach(m=>m.engaged=0);useBraveryCape();'); assert.equal(run('pack.filter(m=>m.taunt>0).length'), 6);
});

test('escaping returns allies home, then roaming resumes; respawn and reload clear transient movement', () => {
  const { run, saved } = createGame(); setupPack(run);
  run('hit(foe,1);for(let i=0;i<20;i++)updateEnemySpawns(.05,false);p.x=1950;p.y=1950;for(let i=0;i<1400;i++)updateEnemySpawns(.05,false);');
  assert(run('pack.every(m=>!m.engaged&&!m.taunt&&!m.returning&&Math.hypot(m.x-m.homeX,m.y-m.homeY)<=SPAWN_RULES.roamRadius+1e-8)'));
  run('foe.roamTarget={x:1950,y:1950};foe.returning=true;hit(foe,99999);updateEnemySpawns(foe.dead+.1,true);');
  assert.equal(run('foe.returning'), false); assert.equal(run('foe.roamTarget'), null);
  run('foe.roamTarget={x:1950,y:1950};foe.returning=true;save();');
  const reload = createGame(JSON.parse(saved.get('grindoria-save-v1')));
  assert.equal(reload.run('mobs[0].roamTarget'), null); assert.equal(reload.run('mobs[0].returning'), false);
  assert.equal(reload.run('mobs[0].hp'), run('foe.hp'));
});
