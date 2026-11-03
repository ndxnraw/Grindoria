const pendingSaveImports = [];

function parsePlayerSave(raw, compatible = false) {
  try {
    const profile = JSON.parse(raw);
    if (!profile || !Number.isInteger(profile.level) || profile.level < 1 || profile.level > 99) return null;
    if (!compatible) return profile;
    // Identify the existing save format by its structure, independently of project names.
    if (!CLASSES[profile.classId] || !MAPS[profile.mapId] || !Array.isArray(profile.bag) || !profile.equipped || !profile.worldStates) return null;
    if (profile.career?.schema !== PROGRESSION.schema || !profile.career.materials || !profile.career.skills || !profile.career.endgame) return null;
    if (!Object.keys(GEMS).every(id => Number.isInteger(profile.career.alchemy?.equipped?.[id]))) return null;
    if (!Object.entries(profile.schools || {}).every(([id, value]) => SCHOOLS[value]?.classId === id)) return null;
    return profile;
  } catch { return null; }
}

function loadPlayerSave() {
  try {
    const current = localStorage.getItem(SAVE), primary = parsePlayerSave(current);
    if (primary) return primary;
    if (typeof localStorage.key !== 'function' || !Number.isInteger(localStorage.length)) return null;
    const candidates = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === SAVE || !/^[a-z0-9-]+-save-v1$/i.test(key || '')) continue;
      const profile = parsePlayerSave(localStorage.getItem(key), true);
      if (profile) candidates.push(profile);
    }
    if (candidates.length === 1) {
      if (current) localStorage.setItem(SAVE + '.backup', current);
      localStorage.setItem(SAVE, JSON.stringify(candidates[0]));
      return candidates[0];
    }
    if (candidates.length > 1) pendingSaveImports.push(...candidates);
  } catch {}
  return null;
}

function chooseSaveImport(index) {
  if (!Number.isInteger(index) || index < -1 || index >= pendingSaveImports.length) return false;
  if (index >= 0) {
    p = { ...p, ...pendingSaveImports[index] };
    initializeCareer(); initializeInventory(); initializeFarming(); loadMap(p.mapId, true);
    renderClasses(); updateClassHUD(); updateHUD();
  }
  pendingSaveImports.length = 0;
  save(); closeModal(); startGame();
  return true;
}

function openSaveImport() {
  modal(`<span class="eyebrow">VITAJ V GRINDORII</span><h2>Pokračovať v príbehu</h2><p>Na tomto zariadení je viac kompatibilných postáv. Vyber si, s ktorou chceš pokračovať.</p>${pendingSaveImports.map((profile, i) => `<button class="primary" data-save-import="${i}">Postava ${i + 1} · ${CLASSES[profile.classId].name} · úroveň ${profile.level}</button>`).join('')}<button class="secondary" data-save-import="-1">Začať novú postavu</button>`);
  document.querySelectorAll('[data-save-import]').forEach(button => button.onclick = () => chooseSaveImport(Number(button.dataset.saveImport)));
}
