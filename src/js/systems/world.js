function map(){return MAPS[p.mapId]||MAPS.valley;}

function snapshotMap() {
  if (!mobs.length) return;
  p.worldStates[p.mapId] = {
    progressionSchema: PROGRESSION.schema, spawnSchema: legacyRiftLayout ? 0 : SPAWN_RULES.schema,
    mobs: mobs.map(cloneEnemyState),
    drops: drops.map(cloneGroundDrop)
  };
}

function save(){if(pendingSaveImports.length)return;snapshotMap();try{localStorage.setItem(SAVE,JSON.stringify(p));}catch{}}

function loadMap(id, initial=false) {
  if (!MAPS[id]) return false;
  if (p.career?.endgame.run && !initial) { toast('Najprv dokonči alebo opusti trhlinu (P).'); return false; }
  if (!initial) {
    if (!running || !isSanctuary(p)) { toast('Cestovať môžeš z útočiska (M).'); return false; }
    snapshotMap();
  }
  resetCombatFlow();
  p.mapId=id;
  const cfg=map(), old=p.worldStates[id];
  cfg.mobSpeed=75+(cfg.scale-1)*14; seed=cfg.seed; decor.length=0;
  for(let i=0;i<250;i++) {
    const x=rand()*SIZE,y=rand()*SIZE;
    if(Math.hypot(x-1000,y-1050)>190) decor.push({x,y,type:rand()<(cfg.metinsOnly?0:id==='valley'?.67:id==='snow'?.45:id==='desert'?.2:.12)?'tree':'rock',s:.6+rand()*.8,t:rand()});
  }
  legacyRiftLayout=false; spawnPoints.length=0;
  spawnPoints.push(...buildSpawnPoints(id));
  const oldRun=p.career.endgame.run&&id==='temple'&&old?.mobs?.length&&old.spawnSchema!==SPAWN_RULES.schema;
  const population=oldRun?loadLegacyRift(old):hydrateSpawnPopulation(old);
  mobs.length=0; mobs.push(...population); drops.length=0;
  drops.push(...hydrateGroundDrops(old?.drops||[]));
  clearLootPointer();
  p.x=1000; p.y=1160; cam.x=p.x; cam.y=p.y; target=null;
  shots.length=0; effects.length=0; particles.length=0; lastMiniMapPaint=-Infinity;
  Object.keys(buffs).forEach(k=>delete buffs[k]);
  updateMapHUD();
  if(!initial){closeModal();save();toast(cfg.name+'\nOdporúčaná úroveň '+cfg.level+'+');}
  return true;
}
