const sceneQueue=[],sceneEntries=new WeakMap();
let sceneGlow=null,sceneGlowContext=null,sceneGlowWidth=0,sceneGlowHeight=0,sceneGlowDpr=0;
function queueSceneEntity(entity,kind){if(!visibleWorldPoint(entity.x,entity.y,220))return;let entry=sceneEntries.get(entity);if(!entry){entry={entity,kind,y:entity.y};sceneEntries.set(entity,entry);}entry.kind=kind;entry.y=entity.y;sceneQueue.push(entry);}
function drawSceneObjects(){
 sceneQueue.length=0;
 for(const d of decor)queueSceneEntity(d,d.type);
 for(const object of worldObjects())sceneQueue.push(object);
 for(const m of mobs)if(m.hp>0)queueSceneEntity(m,'mob');
 queueSceneEntity(p,'hero');
 sceneQueue.sort((a,b)=>a.y-b.y);
 for(const entry of sceneQueue){if(entry.draw){entry.draw();continue;}if(entry.kind==='mob')mobDraw(entry.entity);else if(entry.kind==='hero')hero();else if(entry.kind==='tree')tree(entry.entity);else rock(entry.entity);}
}
function draw(){
 ctx.setTransform(dpr,0,0,dpr,0,0);ground();drawWorldEventGround();drawDungeonHazards();drawFarmRegions();drawSceneObjects();drawCombatTarget();
 for(const f of particles){if(!visibleWorldPoint(f.x,f.y,200))continue;const a=screen(f.x,f.y);text(f.t,a.x,a.y-f.age*36,f.color,f.big?22:f.small?11:14);}
 if(sceneGlowContext!==ctx||sceneGlowWidth!==W||sceneGlowHeight!==H||sceneGlowDpr!==dpr){sceneGlowContext=ctx;sceneGlowWidth=W;sceneGlowHeight=H;sceneGlowDpr=dpr;sceneGlow=ctx.createRadialGradient(W*.3,H*.1,0,W*.3,H*.1,W*.7);sceneGlow.addColorStop(0,'#e4e5ad0e');sceneGlow.addColorStop(1,'#091b1a25');}
 ctx.fillStyle=sceneGlow;ctx.fillRect(0,0,W,H);drawEffects();drawFarmingEffects();drawBattleEffects();drawGroundLoot();drawMini();
}
