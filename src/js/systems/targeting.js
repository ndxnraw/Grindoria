const combatAim = { inside: false, clientX: 0, clientY: 0 };
let playerMoving = false;
let clickDestination=null;
const combatSelection = { following: false, clickTarget: null, doubleReady: false };

function selectedEnemy() {
  return target && mobs.includes(target) && target.hp > 0 ? target : null;
}

function clearCombatTarget() { clickDestination=null;target = null; combatSelection.following = false; combatSelection.clickTarget = null; combatSelection.doubleReady = false; combatAssist.fightTarget = null; combatAssist.fightTime = 0; $('target-panel').hidden = true; }

function setCombatPointer(event) {
  combatAim.inside = true; combatAim.clientX = event.clientX; combatAim.clientY = event.clientY;
  setLootPointer(event); updateFacing();
}

function leaveCombatPointer() { combatAim.inside = false; clearLootPointer(); }

function combatBlur() { combatAssist.focused = false; combatAssist.aimTime = 0; keysClear(); leaveCombatPointer(); clearCombatTarget(); }

function cursorWorld() {
  const rect = canvas.getBoundingClientRect();
  return world(combatAim.clientX - (rect.left || 0), combatAim.clientY - (rect.top || 0));
}

function updateFacing(attacking = false) {
  const enemy = selectedEnemy() || assistedAimEnemy(COMBAT_ASSIST.range, attacking || Boolean(keys[' ']) || combatAssist.aimTime > 0);
  if (enemy) face = Math.atan2(enemy.y - p.y, enemy.x - p.x);
  else if (combatAim.inside) { const aim = cursorWorld(); if (Math.hypot(aim.x-p.x,aim.y-p.y)>3) face=Math.atan2(aim.y-p.y,aim.x-p.x); }
}

function enemyInArc(m, range, angle = face, halfArc = BATTLE.halfArc) {
  if (m.hp <= 0) return false;
  const dx=m.x-p.x,dy=m.y-p.y,d=Math.hypot(dx,dy);
  return d <= range && (d < 3 || (dx*Math.cos(angle)+dy*Math.sin(angle))/d >= Math.cos(halfArc));
}

function aimEnemy(range, attacking = false) {
  const selected = selectedEnemy();
  if (selected) return Math.hypot(selected.x-p.x,selected.y-p.y)<=range ? selected : null;
  const assisted = assistedAimEnemy(range, attacking);
  if (assisted) return assisted;
  let best=null,minimum=Infinity;for(const m of mobs)if(enemyInArc(m,range)){const distance=(m.x-p.x)**2+(m.y-p.y)**2;if(distance<minimum){minimum=distance;best=m;}}return best;
}

function aimedPoint(range) {
  if (combatAim.inside) {
    const aim=cursorWorld(),d=Math.hypot(aim.x-p.x,aim.y-p.y),distance=Math.min(range,d);
    return {x:p.x+Math.cos(face)*distance,y:p.y+Math.sin(face)*distance};
  }
  return {x:p.x+Math.cos(face)*range,y:p.y+Math.sin(face)*range};
}

function enemyAtPointer(x,y) {
  let best=null;for(const m of mobs){if(m.hp<=0||best&&m.y<=best.y)continue;
    if(m.type==='stone'){if(metinHitTest(m,x,y))best=m;continue;}
    const a=screen(m.x,m.y),width=m.type==='boss'?48:m.skin==='wolf'?31:38,height=m.type==='boss'?112:m.skin==='wolf'?48:74;
    if(Math.abs(x-a.x)<=width && y>=a.y-height && y<=a.y+9)best=m;
  }return best;
}

function rangedBasic() { return p.classId==='ninja' && p.schools.ninja==='archery'; }
function basicAttackRange() { return rangedBasic()?BATTLE.rangedRange:BATTLE.meleeRange; }

function selectCombatTarget(enemy, follow = false) {
  if(!enemy||enemy.hp<=0||!mobs.includes(enemy))return false;
  clickDestination=null;target=enemy; combatSelection.following=follow; updateFacing(); updateCombatHUD();
  if(follow&&Math.hypot(enemy.x-p.x,enemy.y-p.y)<=basicAttackRange())attack();
  return true;
}

function handleCombatClick(event) {
  if(event.button!==undefined&&event.button!==0||!running||paused)return;
  setCombatPointer(event);
  const npc=npcAtPointer(lootPointer.x,lootPointer.y);if(npc){interactNPC(npc);return;}
  const loot=groundDropAt(lootPointer.x,lootPointer.y);
  if(loot){combatSelection.clickTarget=null;combatSelection.doubleReady=false;pickUpGroundDrop(loot.id);canvas.focus();return;}
  const enemy=enemyAtPointer(lootPointer.x,lootPointer.y);
  if(enemy){combatSelection.doubleReady=combatSelection.clickTarget===enemy;combatSelection.clickTarget=enemy;selectCombatTarget(enemy,combatSelection.doubleReady);}
  else{clearCombatTarget();const at=cursorWorld();clickDestination={x:Math.max(45,Math.min(SIZE-45,at.x)),y:Math.max(45,Math.min(SIZE-45,at.y))};combatAssist.aimTime=0;updateFacing();}
  canvas.focus();
}

function handleCombatDoubleClick(event) {
  if(event.button!==undefined&&event.button!==0||!running||paused)return;
  setCombatPointer(event);
  if(groundDropAt(lootPointer.x,lootPointer.y))return;
  const enemy=enemyAtPointer(lootPointer.x,lootPointer.y);
  if(enemy&&combatSelection.doubleReady&&combatSelection.clickTarget===enemy){selectCombatTarget(enemy,true);combatSelection.doubleReady=false;}
  canvas.focus();
}

function markManualCombatHit(enemy) {
  if(!selectedEnemy()&&enemy?.hp>0&&mobs.includes(enemy)){selectCombatTarget(enemy,false);registerPlayerCombat(enemy);}
}

function movePlayer(dx,dy,distance) {
  const d=Math.hypot(dx,dy);if(!d||distance<=0)return;
  const oldX=p.x,oldY=p.y;
  p.x=Math.max(45,Math.min(SIZE-45,p.x+dx/d*distance));p.y=Math.max(45,Math.min(SIZE-45,p.y+dy/d*distance));
  playerMoving=Math.hypot(p.x-oldX,p.y-oldY)>.001;
}

function updatePlayerControl(dt) {
  playerMoving=false;
  if(target&&!selectedEnemy())clearCombatTarget();
  const dx=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0),dy=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0);
  if(dx||dy){clearCombatTarget();movePlayer(dx,dy,speedValue()*dt);if(!combatAim.inside)face=Math.atan2(dy,dx);}
  else{
    if(clickDestination){const dx=clickDestination.x-p.x,dy=clickDestination.y-p.y,d=Math.hypot(dx,dy);if(d<2)clickDestination=null;else{face=Math.atan2(dy,dx);movePlayer(dx,dy,Math.min(d,speedValue()*dt));}return;}
    const enemy=selectedEnemy();
    if(enemy&&combatSelection.following){
      if(isSanctuary(enemy)){clearCombatTarget();return;}
      const d=Math.hypot(enemy.x-p.x,enemy.y-p.y),stop=isSanctuary(p)?0:rangedBasic()?BATTLE.rangedStop:BATTLE.meleeStop;
      if(d>stop)movePlayer(enemy.x-p.x,enemy.y-p.y,Math.min(d-stop,speedValue()*dt));
      updateFacing();
      if(Math.hypot(enemy.x-p.x,enemy.y-p.y)<=basicAttackRange()&&castPose<=.2)attack();
    }
  }
  updateFacing();
}
