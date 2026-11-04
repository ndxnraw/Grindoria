function updateCombatAssistHUD() {
  for (const [id, setting, label] of [['auto-aim','autoAim','Automierenie'],['auto-spell','autoSpell','Autospell'],['auto-potion','autoPotion','Autoelixíry']]) {
    const enabled = p.combatAssist?.[setting] === true, button = $(id);
    button.setAttribute('aria-pressed', String(enabled));
    button.textContent = label + ': ' + (enabled ? 'ZAP' : 'VYP');
    button.disabled = !running || paused;
  }
  const active=Object.values(p.combatAssist||{}).some(value=>value===true);$('auto-hunt').setAttribute('aria-pressed',String(active));$('auto-hunt').title='Automatický boj · K · '+(active?'zapnutý':'vypnutý');
}

function hotbarAction(action) {
  if (!running || paused) return;
  const result = action();
  if (!paused) canvas.focus({preventScroll:true});
  return result;
}
