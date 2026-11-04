const COMBAT_ASSIST = { range: 500, spellInterval: .8 };
const combatAssist = { focused: true, timer: 0, nextSkill: 0, fightTarget: null, fightTime: 0, aimTime: 0 };

function initializeCombatAssist() {
  p.combatAssist = { autoAim: p.combatAssist?.autoAim === true, autoSpell: p.combatAssist?.autoSpell === true, autoPotion: p.combatAssist?.autoPotion === true };
  $('auto-aim').onclick = () => toggleCombatAssist('autoAim');
  $('auto-spell').onclick = () => toggleCombatAssist('autoSpell');
  $('auto-potion').onclick = () => toggleCombatAssist('autoPotion');
  updateCombatAssistHUD();
}

function combatAssistAvailable() { return running && !paused && p.hp > 0 && combatAssist.focused && !document.hidden && !isSanctuary(p); }

function closestAssistEnemy(range = COMBAT_ASSIST.range) {
  let best = null, distance = range;
  for (const enemy of mobs) {
    if (enemy.hp <= 0 || isSanctuary(enemy)) continue;
    const d = Math.hypot(enemy.x-p.x, enemy.y-p.y);
    if (d <= distance && (!best || d < distance)) { best = enemy; distance = d; }
  }
  return best;
}

function assistedAimEnemy(range = COMBAT_ASSIST.range, attacking = false) {
  return attacking && p.combatAssist?.autoAim && combatAssistAvailable() ? closestAssistEnemy(Math.min(range, COMBAT_ASSIST.range)) : null;
}

function toggleCombatAssist(setting) {
  if (!running || paused || !['autoAim', 'autoSpell', 'autoPotion'].includes(setting)) return false;
  p.combatAssist[setting] = !p.combatAssist[setting];
  if (setting === 'autoSpell') { combatAssist.timer = 0; combatAssist.nextSkill = 0; }
  updateFacing(); updateCombatAssistHUD(); save(); canvas.focus({preventScroll:true});
  return p.combatAssist[setting];
}

function stopCombatAssist() {
  const enabled = p.combatAssist?.autoAim || p.combatAssist?.autoSpell || p.combatAssist?.autoPotion;
  if (p.combatAssist) { p.combatAssist.autoAim = false; p.combatAssist.autoSpell = false; p.combatAssist.autoPotion = false; }
  combatAssist.timer = 0; combatAssist.nextSkill = 0;
  updateCombatAssistHUD();
  if (enabled) save();
}

function toggleAllCombatAssist(){
  if(!running||paused)return false;
  const enable=!Object.values(p.combatAssist).every(value=>value===true);
  if(!enable){clearCombatTarget();stopCombatAssist();return false;}
  for(const key of ['autoAim','autoSpell','autoPotion'])p.combatAssist[key]=true;
  combatAssist.timer=0;combatAssist.nextSkill=0;updateFacing();updateCombatAssistHUD();save();canvas.focus({preventScroll:true});return true;
}

function registerPlayerCombat(enemy) {
  if (enemy && enemy.hp > 0 && selectedEnemy() === enemy) { combatAssist.fightTarget = enemy; combatAssist.fightTime = 8; }
}

function selectedCombatEnemy() {
  const enemy = selectedEnemy();
  return enemy && enemy === combatAssist.fightTarget && combatAssist.fightTime > 0 && !isSanctuary(enemy) && Math.hypot(enemy.x-p.x,enemy.y-p.y) <= COMBAT_ASSIST.range ? enemy : null;
}

function updateCombatAssistTimers(dt) {
  combatAssist.fightTime = Math.max(0, combatAssist.fightTime-dt);
  combatAssist.aimTime = Math.max(0, combatAssist.aimTime-dt);
  if (!selectedEnemy() || !combatAssist.fightTime) { combatAssist.fightTarget = null; combatAssist.fightTime = 0; }
}

function autoSkillReady(index) {
  const enemy = selectedCombatEnemy(); if (!enemy) return false;
  const skill = school().skills[index], kind = skill[1], cost = skill[3], range = skill[5] || COMBAT_ASSIST.range;
  if (spellCD[index] > 0 || p.mp < cost) return false;
  if (kind === 'heal') return p.hp < maxHP() * .65;
  if (kind === 'burst' && p.hp <= maxHP() * .35) return false;
  if (SUPPORT_SKILLS.has(kind)) return !active(kind);
  return Math.hypot(enemy.x-p.x,enemy.y-p.y) <= range;
}

function updateAutoPotion() {
  if (!p.combatAssist?.autoPotion || !combatAssistAvailable() || p.potions < 1 || potionCooldownRemaining() > 0 || p.hp >= maxHP()) return false;
  return drinkPotion(false,true);
}

function updateAutoSpell(dt) {
  if (!p.combatAssist?.autoSpell || !combatAssistAvailable() || !selectedCombatEnemy()) return;
  combatAssist.timer = Math.max(0, combatAssist.timer - dt);
  if (combatAssist.timer > 0 || castPose > 0) return;
  const combo = SCHOOL_COMBOS[schoolId()], ready = combatFlow.time > 0 && combatFlow.lastKey === schoolId()+':'+combo.sequence[0];
  const order = Array.from({length:6}, (_,i)=>(combatAssist.nextSkill+i)%6);
  if (ready) order.unshift(combo.sequence[1]);
  // Recovery takes priority when this school has a healing ability.
  const heal = school().skills.findIndex(skill=>skill[1]==='heal');
  if (heal >= 0 && p.hp < maxHP()*.65) order.unshift(heal);
  for (const index of new Set(order)) if (autoSkillReady(index) && castSkill(index)) {
    combatAssist.nextSkill = (index+1)%6; combatAssist.timer = COMBAT_ASSIST.spellInterval; return;
  }
}
