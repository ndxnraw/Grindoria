const travelCombat={time:0};
function safeZone(id=p.mapId){return MAPS[id]?.safeZone||MAPS.valley.safeZone;}
function safePosition(position,margin=0,id=p.mapId){
 const zone=safeZone(id),radius=zone.radius+margin,dx=position.x-zone.x,dy=position.y-zone.y,d=Math.hypot(dx,dy);
 if(!MAPS[id].town&&d<radius){const angle=d?Math.atan2(dy,dx):0;return{x:zone.x+Math.cos(angle)*(radius+1),y:zone.y+Math.sin(angle)*(radius+1)};}
 return {x:Math.max(45,Math.min(MAPS[id].size-45,position.x)),y:Math.max(45,Math.min(MAPS[id].size-45,position.y))};
}
function nearNPC(id){const npc=NPCS[id];return !!npc&&p.mapId===npc.mapId&&Math.hypot(p.x-npc.x,p.y-npc.y)<=170;}
function interactNPC(id=null){
 if(!running||p.hp<=0)return false;
 const npc=id?NPCS[id]:Object.values(NPCS).filter(n=>nearNPC(Object.keys(NPCS).find(key=>NPCS[key]===n))).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
 if(!npc||p.mapId!==npc.mapId||Math.hypot(p.x-npc.x,p.y-npc.y)>170){toast('Priblíž sa k NPC v Meste.');return false;}
 if(npc.service==='shop')shop();else if(npc.service==='market')marketPanel('armsdealer');else careerPanel(npc.service);return true;
}
function npcAtPointer(x,y){return Object.entries(NPCS).find(([,npc])=>{if(npc.mapId!==p.mapId)return false;const at=screen(npc.x,npc.y);return Math.abs(x-at.x)<28&&y>at.y-65&&y<at.y+12;})?.[0]||null;}
function enemyTargetsPlayer(enemy){
 if(enemy.hp<=0||enemy.type==='stone'||isSanctuary(p)||active('stealth'))return false;
 return enemy.taunt>0||enemy.engaged>0||enemy.windup>0||enemy.type==='boss'&&Math.hypot(enemy.x-p.x,enemy.y-p.y)<=500;
}
function canTravel(){return running&&p.hp>0&&travelCombat.time<=0&&!mobs.some(enemyTargetsPlayer);}
function migrateMapSize(state,id){
 if(!state)return state;const cfg=MAPS[id],oldSize=state.worldSize||2000;
 if(oldSize===cfg.size)return state;
 const next={...state,worldSize:cfg.size,layoutSchema:0,mobs:state.mobs.map(cloneEnemyState),drops:state.drops.map(cloneGroundDrop)},factor=cfg.size/oldSize;
 for(const entity of [...next.mobs,...next.drops]){
  for(const key of ['x','homeX','launchX'])if(Number.isFinite(entity[key]))entity[key]=Math.max(45,Math.min(cfg.size-45,entity[key]*factor));
  for(const key of ['y','homeY','launchY'])if(Number.isFinite(entity[key]))entity[key]=Math.max(45,Math.min(cfg.size-45,entity[key]*factor));
 }
 return next;
}
