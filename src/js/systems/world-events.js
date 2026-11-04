let worldEventState=null;
function initializeWorldEvents(){p.career.worldEvents??={schema:1,serial:0,completed:{}};p.discovery.eventPlaces??={};}
function worldEventMap(id=p.mapId){return Object.hasOwn(MAPS,id)&&!MAPS[id].town&&!MAPS[id].instance;}
function worldEventsAllowed(){return worldEventMap()&&!dungeonRun()&&!p.career.endgame.run;}
function worldEventRandom(){worldEventState.seed=(Math.imul(worldEventState.seed,1664525)+1013904223)>>>0;return worldEventState.seed/4294967296;}
function worldEventSnapshot(){return worldEventState?copyCharacterData(worldEventState):null;}
function restoreWorldEvents(state,population,prior=[]){
 worldEventState=null;if(!worldEventsAllowed())return;
 worldEventState=state?copyCharacterData(state):{schema:1,mapId:p.mapId,seed:appearanceHash((p.characterId||'player')+p.mapId),nextCheck:WORLD_EVENT_RULES.firstCheck,active:null};
 const event=worldEventState.active;if(!event)return;
 const members=prior.filter(m=>m.worldEventId===event.id),parents=new Set(members.filter(m=>m.type==='stone').map(m=>m.spawnId));
 for(const m of prior)if(m.worldEventId===event.id||parents.has(m.metinParentId))population.push({...upgradeLegacyMetin(cloneEnemyState(m),{id:m.spawnId}),taunt:0,engaged:0,windup:0,stun:0,roamTarget:null,returning:false});
}
function worldEventPosition(){
 let point={x:SIZE/2,y:SIZE/2};
 for(let attempt=0;attempt<48;attempt++){
  point={x:220+worldEventRandom()*(SIZE-440),y:220+worldEventRandom()*(SIZE-440)};
  if(Math.hypot(point.x-safeZone().x,point.y-safeZone().y)>safeZone().radius+320&&Math.hypot(point.x-p.x,point.y-p.y)>520&&!mobs.some(m=>m.hp>0&&Math.hypot(m.x-point.x,m.y-point.y)<110))break;
 }
 return safePosition(point,180);
}
function worldEventEnemy(event,index){
 const spec=WORLD_EVENTS[event.type],type=spec.kind==='boss'?'boss':spec.kind==='stone'?'stone':'wolf',point={id:event.id,kind:type==='wolf'?'pack':type,area:farmAreaAt(event).id,offset:0};
 const enemy=createSpawnEnemy(point,index),angle=worldEventRandom()*Math.PI*2,radius=spec.count>1?35+worldEventRandom()*65:0,at=safePosition({x:event.x+Math.cos(angle)*radius,y:event.y+Math.sin(angle)*radius},60);
 Object.assign(enemy,{...at,homeX:at.x,homeY:at.y,level:event.level,baseLevel:event.level,noRespawn:true,worldEventId:event.id,spawnId:event.id+':'+index,spawnPointId:event.id,spawnSlot:index,variant:type==='wolf'?(event.type==='patrol'||index?'elite':'rare'):'rare',engaged:0,taunt:0});
 if(type==='stone'){
  configureMetin(enemy,{id:event.id,metinType:metinTypeForLevel(event.level),metinLevel:event.level});enemy.max=Math.round(enemy.max*2.4);enemy.hp=enemy.max;enemy.baseMax=enemy.max;enemy.metinArmor=Math.round(enemy.metinArmor*1.15);enemy.name='Vzácny '+METIN_TYPES[enemy.metinType].name;enemy.rareMetin=true;
 }else{
  const stats=enemyCombatStats(event.level,type,enemy.variant);enemy.max=stats.hp;enemy.hp=stats.hp;enemy.baseMax=stats.hp;enemy.attackScale=stats.attack;enemy.baseAttack=stats.attack;
  enemy.name=type==='boss'?'Prastarý '+map().boss:event.type==='patrol'?'Elitný hliadkar':event.type==='convoy'?['Veliteľ sprievodu','Jedový lovec','Ľadový strážca','Temný bojovník','Stopár sprievodu'][index]:index?'Elitný lovec':'Veliteľ lovcov';
  if(event.type==='convoy'){enemy.skin=['demon','scorpion','yeti','demon','wolf'][index];enemy.damageType=['dark','poison','physical','fire','physical'][index];if(index===2)enemy.resistances={physical:.35};}
 }
 return enemy;
}
function startWorldEvent(type){
 if(!running||paused||p.hp<=0||!worldEventsAllowed()||!worldEventState||worldEventState.active||!Object.hasOwn(WORLD_EVENTS,type))return false;
 const spec=WORLD_EVENTS[type];if(!worldEventTypeAllowed(type))return false;
 const at=worldEventPosition(),range=farmAreaLevelRange(farmAreaAt(at));
 const level=Math.min(map().levelMax||99,map().metinsOnly?range[0]+Math.floor(worldEventRandom()*(range[1]-range[0]+1)):range[0]+(spec.kind==='boss'?18:spec.kind==='stone'?10:4));
 const serial=++p.career.worldEvents.serial,event={id:p.mapId+':event:'+serial,serial,type,...at,level,remaining:spec.duration,kills:0,total:spec.count,revealed:spec.kind!=='secret'};
 worldEventState.active=event;for(let i=0;i<spec.count;i++)mobs.push(worldEventEnemy(event,i));
 toast(spec.name+' · '+(spec.kind==='secret'?'Objavili sa neznáme stopy.':farmAreaAt(event).name));return true;
}
function purgeWorldEventMembers(event){
 const parents=new Set(mobs.filter(m=>m.worldEventId===event.id&&m.type==='stone').map(m=>m.spawnId));
 for(let i=mobs.length-1;i>=0;i--){const m=mobs[i];if(m.worldEventId!==event.id&&!parents.has(m.metinParentId))continue;if(target===m)clearCombatTarget();m.hp=0;m.dot=null;m.dots=[];m.windup=0;m.taunt=0;m.engaged=0;mobs.splice(i,1);}
}
function finishWorldEvent(success,source=null){
 const event=worldEventState?.active;if(!event)return false;const spec=WORLD_EVENTS[event.type];worldEventState.active=null;
 worldEventState.nextCheck=WORLD_EVENT_RULES.minCheck+worldEventRandom()*(WORLD_EVENT_RULES.maxCheck-WORLD_EVENT_RULES.minCheck);
 purgeWorldEventMembers(event);
 if(success){const completed=p.career.worldEvents.completed;completed[event.type]=(completed[event.type]||0)+1;
  if(spec.kind==='secret')p.discovery.eventPlaces[p.mapId]=(p.discovery.eventPlaces[p.mapId]||0)+1;
  if(spec.kind!=='drop'){
   const at=source||event;spawnGroundDrop({kind:'gold',count:Math.round((['boss','stone'].includes(spec.kind)?300:100)*(1+event.level*.08))},at);
   if(rewardEligible({level:event.level})){
    dropMaterial('ore',spec.kind==='group'?5:12,at);dropMaterial('upgradeStones',spec.kind==='group'?1:3,at);
    if(['boss','stone','secret'].includes(spec.kind)||event.type==='convoy'){const rarity=event.level>=75&&worldEventRandom()<.04?5:event.level>=50?4:2,slot=Object.keys(EQUIPMENT)[Math.floor(worldEventRandom()*Object.keys(EQUIPMENT).length)];spawnGroundDrop({kind:'gear',item:generateEquipmentItem(slot,rarity,event.level)},at);}
   }
  }
  toast('Udalosť dokončená: '+spec.name);
 }else toast('Udalosť sa skončila: '+spec.name);
 save();return true;
}
function worldEventKill(enemy){
 const event=worldEventState?.active;if(!event)return;
 if(WORLD_EVENTS[event.type].kind==='drop'&&enemy.type==='wolf'&&!enemy.metinParentId&&rewardEligible(enemy)){
  event.kills++;if(worldEventRandom()<.5)dropMaterial('ore',1,enemy);if(worldEventRandom()<.1)dropMaterial('upgradeStones',1,enemy);return;
 }
 if(enemy.worldEventId!==event.id)return;event.kills++;
 if(!mobs.some(m=>m.worldEventId===event.id&&m.hp>0))finishWorldEvent(true,enemy);
}
function suspendWorldEvents(){if(worldEventState?.active)purgeWorldEventMembers(worldEventState.active);worldEventState=null;}
function updateWorldEvents(dt){
 if(!running||paused||p.hp<=0||!worldEventsAllowed()||!worldEventState)return;
 const event=worldEventState.active;
 if(event){
  event.remaining=Math.max(0,event.remaining-dt);const distance=Math.hypot(p.x-event.x,p.y-event.y);
  if(WORLD_EVENTS[event.type].kind==='secret'){if(distance<420)event.revealed=true;if(distance<90){finishWorldEvent(true,event);return;}}
  if(event.remaining<=0)finishWorldEvent(WORLD_EVENTS[event.type].kind==='drop'&&event.kills>0);
  return;
 }
 worldEventState.nextCheck=Math.max(0,worldEventState.nextCheck-dt);if(worldEventState.nextCheck>0)return;
 worldEventState.nextCheck=WORLD_EVENT_RULES.minCheck+worldEventRandom()*(WORLD_EVENT_RULES.maxCheck-WORLD_EVENT_RULES.minCheck);
 let roll=worldEventRandom();for(const [id,spec]of Object.entries(WORLD_EVENTS)){if(!worldEventTypeAllowed(id))continue;roll-=spec.chance;if(roll<0){startWorldEvent(id);break;}}
}
function worldEventTypeAllowed(type,id=p.mapId){return Object.hasOwn(WORLD_EVENTS,type)&&!(MAPS[id]?.metinsOnly&&['group','boss','drop'].includes(WORLD_EVENTS[type].kind));}
function validateWorldEventSnapshot(state){
 const events=state.events;if(events==null){if(state.mobs.some(m=>m.worldEventId))characterDataError('nepriateľ bez udalosti.');return;}
 assertCharacterObject(events,'udalosti mapy');if(events.schema!==1||!worldEventMap(events.mapId))characterDataError('mapa udalosti.');assertCharacterNumber(events.seed,'náhoda udalostí',0,4294967295,true);assertCharacterNumber(events.nextCheck,'čas ďalšej udalosti',0,180);
 const event=events.active;if(event!==null){assertCharacterObject(event,'udalosť');if(!Object.hasOwn(WORLD_EVENTS,event.type))characterDataError('typ udalosti.');const spec=WORLD_EVENTS[event.type];assertCharacterNumber(event.serial,'ID udalosti',1,Number.MAX_SAFE_INTEGER,true);if(event.id!==events.mapId+':event:'+event.serial||!worldEventTypeAllowed(event.type,events.mapId))characterDataError('identita udalosti.');for(const key of ['x','y'])assertCharacterNumber(event[key],'poloha udalosti',45,MAPS[events.mapId].size-45);assertCharacterNumber(event.level,'úroveň udalosti',1,99,true);assertCharacterNumber(event.remaining,'čas udalosti',0,spec.duration);assertCharacterNumber(event.kills,'postup udalosti',0,spec.kind==='drop'?1e12:spec.count,true);if(event.total!==spec.count||typeof event.revealed!=='boolean')characterDataError('cieľ udalosti.');}
 const members=state.mobs.filter(m=>m.worldEventId);if(!event&&members.length||members.length>WORLD_EVENT_RULES.maxMembers)characterDataError('populácia udalosti.');
 if(event){const spec=WORLD_EVENTS[event.type];if(members.length!==spec.count)characterDataError('neúplná populácia udalosti.');for(const m of members)if(m.worldEventId!==event.id||m.spawnId!==event.id+':'+m.spawnSlot||m.spawnPointId!==event.id||!Number.isInteger(m.spawnSlot)||m.spawnSlot<0||m.spawnSlot>=spec.count||m.noRespawn!==true||m.level!==event.level||m.type!==(spec.kind==='group'?'wolf':spec.kind))characterDataError('neplatný nepriateľ udalosti.');if(spec.count&&members.filter(m=>m.hp<=0).length!==event.kills)characterDataError('nesúlad postupu udalosti.');}
}
function validateWorldEventsProfile(data){
 const c=data.career.worldEvents;if(c!==undefined){assertCharacterObject(c,'postup udalostí');if(c.schema!==1)characterDataError('verzia udalostí.');assertCharacterNumber(c.serial,'séria udalostí',0,Number.MAX_SAFE_INTEGER,true);assertCharacterObject(c.completed,'dokončené udalosti');for(const [id,n]of Object.entries(c.completed)){if(!Object.hasOwn(WORLD_EVENTS,id))characterDataError('záznam udalosti.');assertCharacterNumber(n,'počet udalostí',1,1e12,true);}}
 for(const [id,state]of Object.entries(data.worldStates||{})){if(state?.events&&state.events.mapId!==id)characterDataError('nesúlad mapy udalosti.');if(state?.events?.active&&(!c||state.events.active.serial>c.serial))characterDataError('referencia udalosti.');}if(data.career.normalTemple?.events&&data.career.normalTemple.events.mapId!=='temple')characterDataError('mapa udalosti chrámu.');if(data.career.normalTemple?.events?.active&&(!c||data.career.normalTemple.events.active.serial>c.serial))characterDataError('referencia udalosti chrámu.');
}
