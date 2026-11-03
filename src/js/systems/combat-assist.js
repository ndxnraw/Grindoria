const COMBAT_ASSIST = { range: 500, spellInterval: .8 };
const combatAssist = { focused: true, timer: 0, nextSkill: 0 };

function initializeCombatAssist() {
  p.combatAssist = { autoAim: p.combatAssist?.autoAim === true, autoSpell: p.combatAssist?.autoSpell === true };
  $('auto-aim').onclick = () => toggleCombatAssist('autoAim');
  $('auto-spell').onclick = () => toggleCombatAssist('autoSpell');
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

function assistedAimEnemy(range = COMBAT_ASSIST.range) {
  return p.combatAssist?.autoAim && combatAssistAvailable() ? closestAssistEnemy(Math.min(range, COMBAT_ASSIST.range)) : null;
}

function toggleCombatAssist(setting) {
  if (!running || paused || !['autoAim', 'autoSpell'].includes(setting)) return false;
  p.combatAssist[setting] = !p.combatAssist[setting];
  if (setting === 'autoSpell') { combatAssist.timer = 0; combatAssist.nextSkill = 0; }
  updateFacing(); updateCombatAssistHUD(); save(); canvas.focus({preventScroll:true});
  return p.combatAssist[setting];
}

function stopCombatAssist() {
  const enabled = p.combatAssist?.autoAim || p.combatAssist?.autoSpell;
  if (p.combatAssist) { p.combatAssist.autoAim = false; p.combatAssist.autoSpell = false; }
  combatAssist.timer = 0; combatAssist.nextSkill = 0;
  updateCombatAssistHUD();
  if (enabled) save();
}

function autoSkillReady(index) {
  const skill = school().skills[index], kind = skill[1], cost = skill[3], range = skill[5] || COMBAT_ASSIST.range;
  if (spellCD[index] > 0 || p.mp < cost) return false;
  if (kind === 'heal') return p.hp < maxHP() * .65;
  if (kind === 'burst' && p.hp <= maxHP() * .35) return false;
  if (SUPPORT_SKILLS.has(kind)) return !active(kind) && Boolean(selectedEnemy() && Math.hypot(target.x-p.x,target.y-p.y)<=COMBAT_ASSIST.range || assistedAimEnemy() || aimEnemy(COMBAT_ASSIST.range));
  // The same target, reach and aiming rules apply as for a manual cast.
  return Boolean(aimEnemy(range));
}

function updateAutoSpell(dt) {
  if (!p.combatAssist?.autoSpell || !combatAssistAvailable()) return;
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
