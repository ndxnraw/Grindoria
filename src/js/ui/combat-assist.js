function updateCombatAssistHUD() {
  for (const [id, setting, label] of [['auto-aim','autoAim','Automierenie'],['auto-spell','autoSpell','Autospell']]) {
    const enabled = p.combatAssist?.[setting] === true, button = $(id);
    button.setAttribute('aria-pressed', String(enabled));
    button.textContent = label + ': ' + (enabled ? 'ZAP' : 'VYP');
    button.disabled = !running || paused;
  }
}

function hotbarAction(action) {
  if (!running || paused) return;
  const result = action();
  if (!paused) canvas.focus({preventScroll:true});
  return result;
}
