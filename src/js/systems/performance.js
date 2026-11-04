// Transient scheduling and render data never enter character saves.
const PERFORMANCE_RULES={farAiInterval:.2,farAiRadius:1200,lootDetailRadius:360,iconCacheLimit:256,iconBuildsPerFrame:8};
let farEnemySchedule=new WeakMap();
const spawnPointLookup={first:null,length:-1,byId:new Map()};
function spawnPointById(id){
 if(spawnPointLookup.first!==spawnPoints[0]||spawnPointLookup.length!==spawnPoints.length){spawnPointLookup.first=spawnPoints[0];spawnPointLookup.length=spawnPoints.length;spawnPointLookup.byId.clear();for(const point of spawnPoints)spawnPointLookup.byId.set(point.id,point);}
 return spawnPointLookup.byId.get(id);
}
function visibleWorldPoint(x,y,margin=200){
 const sx=W/2+x-cam.x,sy=H/2+(y-cam.y)*.62;
 return sx>=-margin&&sx<=W+margin&&sy>=-margin&&sy<=H+margin;
}
function enemyMovementStep(enemy,dt,index){
 const dx=enemy.x-p.x,dy=enemy.y-p.y;
 if(enemy.engaged>0||enemy.taunt>0||enemy.returning||enemy===target||enemy.dungeonId||enemy.metinParentId||enemy.hp<enemy.max||enemy.stun>0||enemy.slow>0||enemy.dot||enemy.dots?.length||dx*dx+dy*dy<=PERFORMANCE_RULES.farAiRadius**2||visibleWorldPoint(enemy.x,enemy.y,300)){farEnemySchedule.delete(enemy);return dt;}
 let state=farEnemySchedule.get(enemy);
 if(!state){state={elapsed:0,interval:PERFORMANCE_RULES.farAiInterval*(1+(index%12))/12};farEnemySchedule.set(enemy,state);}
 state.elapsed+=dt;
 if(state.elapsed+1e-9<state.interval)return 0;
 const step=state.elapsed;state.elapsed=0;state.interval=PERFORMANCE_RULES.farAiInterval;return step;
}
function resetPerformanceState(){farEnemySchedule=new WeakMap();spawnPointLookup.first=null;spawnPointLookup.length=-1;spawnPointLookup.byId.clear();reusableMobGrid.clear();mobGridBuckets.length=0;}
const reusableMobGrid=new Map(),mobGridBuckets=[];
function mobGridKey(col,row){return col+row*(Math.ceil(SIZE/70)+4);}
