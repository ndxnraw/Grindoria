function map(){return MAPS[p.mapId]||MAPS.valley;}

function trimEnemySnapshot(enemy){
  // These ordinary-world fields already reset on hydration; never discard dungeon attack plans.
  if(!enemy.dungeonId)for(const key of ['roamTarget','roamWait','returning','taunt','engaged','windup','stun','hit'])delete enemy[key];
  enemy.cd=Math.max(0,enemy.cd||0);return enemy;
}

function snapshotMap() {
  if (!mobs.length&&!drops.length&&!map().town) return;
  p.worldStates[p.mapId] = {
    balanceSchema:map().balanceVersion||0,events:worldEventSnapshot(),worldSize:SIZE,layoutSchema: SPAWN_LAYOUT_VERSION, progressionSchema: PROGRESSION.schema, spawnSchema: legacyRiftLayout ? 0 : SPAWN_RULES.schema,
    mobs: mobs.map(m=>{
      const snapshot=trimEnemySnapshot(cloneEnemyState(m));
      if(map().metinWorld)for(const key of ['x','y','homeX','homeY'])snapshot[key]=Math.round(snapshot[key]);
      return snapshot;
    }),
    drops: drops.map(cloneGroundDrop)
  };
}

function save(){return saveActiveCharacter();}

function loadMap(id, initial=false) {
  if (!MAPS[id]||MAPS[id].instance&&!dungeonRun()) return false;
  if(dungeonRun()&&!initial){toast('Najprv dokonči alebo opusti dungeon (P).');return false;}
  if(id==='dungeon')configureDungeonMap();
  if (p.career?.endgame.run && !initial) { toast('Najprv dokonči alebo opusti trhlinu (P).'); return false; }
  if (!initial) {
    if (!canTravel()) { toast('Cestovanie nie je dostupné počas boja.'); return false; }
    snapshotMap();
  }
  const resumePosition={x:p.x,y:p.y};
  resetCombatFlow();resetPerformanceState();
  p.mapId=id;
  const cfg=map(), prior=p.worldStates[id],old=migrateMapSize(prior,id);SIZE=cfg.size;
  if(initial&&prior&&(prior.worldSize||2000)!==cfg.size){const factor=cfg.size/(prior.worldSize||2000);resumePosition.x*=factor;resumePosition.y*=factor;if(Math.hypot(resumePosition.x-1000*factor,resumePosition.y-1050*factor)<190*factor)Object.assign(resumePosition,cfg.entry);}
  if(initial&&id==='valley'&&p.level===1&&old?.balanceSchema!==cfg.balanceVersion&&Math.hypot(resumePosition.x-360,resumePosition.y-310)<220)Object.assign(resumePosition,cfg.entry);
  cfg.mobSpeed=95+Math.min(60,cfg.enemyLevel*.7); seed=cfg.seed; decor.length=0;
  for(let i=0;i<(cfg.instance?0:250);i++) {
    const x=rand()*SIZE,y=rand()*SIZE;
    if(!isSanctuary({x,y})) decor.push({x,y,type:rand()<(cfg.metinsOnly?0:id==='valley'?.67:id==='snow'?.45:id==='desert'?.2:.12)?'tree':'rock',s:.6+rand()*.8,t:rand()});
  }
  legacyRiftLayout=false; spawnPoints.length=0;
  spawnPoints.push(...buildSpawnPoints(id));
  const oldRun=p.career.endgame.run&&id==='temple'&&old?.mobs?.length&&old.spawnSchema!==SPAWN_RULES.schema;
  const population=cfg.instance?hydrateDungeonPopulation(old):oldRun?loadLegacyRift(old):hydrateSpawnPopulation(old);
  restoreWorldEvents(old?.events,population,old?.mobs||[]);
  mobs.length=0; mobs.push(...population); drops.length=0;
  drops.push(...hydrateGroundDrops(old?.drops||[]));
  clearLootPointer();
  p.x=initial&&Number.isFinite(resumePosition.x)&&resumePosition.x>=45&&resumePosition.x<=SIZE-45?resumePosition.x:cfg.entry.x;
  p.y=initial&&Number.isFinite(resumePosition.y)&&resumePosition.y>=45&&resumePosition.y<=SIZE-45?resumePosition.y:cfg.entry.y;
  cam.x=p.x;cam.y=p.y;target=null;clickDestination=null;
  shots.length=0; effects.length=0; particles.length=0; lastMiniMapPaint=-Infinity;
  Object.keys(buffs).forEach(k=>delete buffs[k]);
  updateMapHUD();
  if(!initial){npcSessions.clear();for(const key of [...gameWindows.keys()])if(key.startsWith('market:')||key.startsWith('npc:')||['travel','large-map','inventory-drop','dungeon-run','rift-run'].includes(key))closeModal(key);save();toast(cfg.name+'\nOdporúčaná úroveň '+cfg.level+'+');}
  return true;
}
