const pendingSaveImports = [];

function parsePlayerSave(raw, compatible = false) {
  try {
    const profile = JSON.parse(raw);
    if (!profile || !Number.isInteger(profile.level) || profile.level < 1 || profile.level > 99) return null;
    if(profile.bag!==undefined&&!Array.isArray(profile.bag))return null;
    if(profile.equipped!==undefined&&(!profile.equipped||typeof profile.equipped!=='object'||Array.isArray(profile.equipped)))return null;
    if(profile.worldStates!==undefined){if(!profile.worldStates||typeof profile.worldStates!=='object'||Array.isArray(profile.worldStates))return null;for(const state of Object.values(profile.worldStates))if(!state||!Array.isArray(state.mobs)||!Array.isArray(state.drops))return null;}
    if(profile.career?.schema===PROGRESSION.schema){
      for(const key of ['materials','training','skills','biology','samplePity','specialization','endgame'])if(!profile.career[key]||typeof profile.career[key]!=='object')return null;
    }
    if (!compatible) return profile;
    // Identify the existing save format by its structure, independently of project names.
    if (!CLASSES[profile.classId] || !MAPS[profile.mapId] || !Array.isArray(profile.bag) || !profile.equipped || !profile.worldStates) return null;
    if (profile.career?.schema !== PROGRESSION.schema || !profile.career.materials || !profile.career.skills || !profile.career.endgame) return null;
    if (!Object.entries(profile.schools || {}).every(([id, value]) => SCHOOLS[value]?.classId === id)) return null;
    return profile;
  } catch { return null; }
}

function loadLegacyPlayerSave() {
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
