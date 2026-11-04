const SPAWN_LAYOUT_VERSION = 3;

function layoutRandom(key) {
  let value = 2166136261;
  for (const char of key) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
}

// Rejection sampling preserves open spaces without rows, columns or snapped cells.
function naturalSpawnLocation(area, existing, random, gap = 115) {
  let best = null, bestDistance = -1;
  for (let attempt = 0; attempt < 160; attempt++) {
    const at = { x: area.x1 + 50 + random() * (area.x2 - area.x1 - 100), y: area.y1 + 50 + random() * (area.y2 - area.y1 - 100) };
    if (Math.hypot(at.x-safeZone().x,at.y-safeZone().y) < SPAWN_RULES.spawnClearance + 15) continue;
    const distance = Math.min(Infinity, ...existing.map(other => Math.hypot(at.x - other.x, at.y - other.y)));
    if (distance >= gap) return at;
    if (distance > bestDistance) { best = at; bestDistance = distance; }
  }
  if (!best) throw new Error('Oblasť nemá bezpečné miesto na spawn.');
  return best;
}

function restoreSpawnLocation(enemy, fresh, state) {
  if(map().balanceVersion&&state.balanceSchema!==map().balanceVersion){const ratio=Math.max(0,Math.min(1,enemy.hp/enemy.max));return {...enemy,level:fresh.level,baseLevel:fresh.baseLevel,variant:fresh.variant,max:fresh.max,baseMax:fresh.baseMax,attackScale:fresh.attackScale,baseAttack:fresh.baseAttack,speedScale:fresh.speedScale,hp:enemy.hp<=0?0:Math.max(1,Math.round(fresh.max*ratio)),metinType:fresh.metinType,metinArmor:fresh.metinArmor,metinResistance:fresh.metinResistance,x:fresh.x,y:fresh.y,homeX:fresh.homeX,homeY:fresh.homeY,roamTarget:null,returning:false};}
  if (state.layoutSchema === SPAWN_LAYOUT_VERSION) return enemy;
  return { ...enemy, x: fresh.x, y: fresh.y, homeX: fresh.homeX, homeY: fresh.homeY, roamTarget: null, returning: false };
}
