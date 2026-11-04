function drawFarmRegions() {
  if(map().town||map().instance)return;
  for (const area of FARM_AREAS) {
    const a = screen((area.x1 + area.x2) / 2, area.y1 - 35);
    if (a.x < -160 || a.x > W + 160 || a.y < -40 || a.y > H + 40) continue;
    text(area.name, a.x, a.y, map().accent, 12);

  }
  for (const point of spawnPoints) {
    if (point.kind !== 'pack' && point.kind !== 'rare') continue;
    const a = screen(point.x, point.y);
    if (a.x < -40 || a.x > W + 40 || a.y < -30 || a.y > H + 30) continue;
    ellipse(a.x, a.y, point.kind === 'rare' ? 18 : 10, point.kind === 'rare' ? 9 : 5, point.kind === 'rare' ? '#ecd08825' : '#d4dcad12');
  }
}

function mobDraw(m) {
  if (m.hp <= 0) return;
  const a = screen(m.x, m.y);
  if (a.x < -120 || a.x > W + 120 || a.y < -140 || a.y > H + 120) return;
  const special = m.type === 'wolf' && m.variant && m.variant !== 'normal';
  if (special) {
    const v = ENEMY_VARIANTS[m.variant], size = m.variant === 'rare' ? 1.14 : 1.06;
    ellipse(a.x, a.y + 3, m.variant === 'rare' ? 26 : 21, 10, v.color + '22');
    ctx.save(); ctx.translate(a.x, a.y); ctx.scale(size, size); ctx.translate(-a.x, -a.y);
    drawMobBase(m); ctx.restore();
    if (Math.hypot(m.x - p.x, m.y - p.y) < 530 || m.hp < m.max) {
      const yy = a.y - (m.skin === 'wolf' ? 76 : 105);

      const barY = a.y - (m.skin === 'wolf' ? 47 : 77), width = m.skin === 'wolf' ? 44 : 48;
      ctx.fillStyle = '#182b25'; ctx.fillRect(a.x - width / 2, barY, width, 4);
      ctx.fillStyle = v.color; ctx.fillRect(a.x - width / 2, barY, width * m.hp / m.max, 4);
    }
  } else drawMobBase(m);
  if (m.taunt > 0) text('!', a.x + 25, a.y - (m.type === 'boss' ? 90 : 48), '#ffb987', 17);
}

function drawFarmingEffects() {
  for (const e of effects) {
    if (e.style !== 'bravery') continue;
    const a = screen(e.x, e.y), t = 1 - e.life / e.total, radius = SPAWN_RULES.capeRange * t;
    ctx.save(); ctx.globalAlpha = Math.max(0, 1 - t);
    ctx.strokeStyle = e.color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(a.x, a.y, radius, radius * .62, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(a.x, a.y, radius * .58, radius * .36, 0, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const angle = i * Math.PI / 6;
      const x = a.x + Math.cos(angle) * radius, y = a.y + Math.sin(angle) * radius * .62;
      line(x, y - 6, x + Math.cos(angle) * 13, y + Math.sin(angle) * 8, '#f5d7a6', 2);
    }
    const wave = Math.sin(t * Math.PI * 6) * 9;
    polygon([[a.x - 11, a.y - 37], [a.x + 13, a.y - 32], [a.x + 29 + wave, a.y - 3], [a.x - 21 + wave, a.y + 8]], '#ba6b52', '#eed298');
    ctx.restore();
  }
}

function drawFarmMinimap() {
  if(map().town||map().instance)return;
  mini.strokeStyle = '#ece2b22b'; mini.lineWidth = 1;
  mini.beginPath(); mini.moveTo(69, 0); mini.lineTo(69, 118); mini.moveTo(0, 59); mini.lineTo(138, 59); mini.stroke();
  mini.font = '7px Segoe UI'; mini.textAlign = 'left'; mini.fillStyle = '#fff1c6';
  for (const area of FARM_AREAS) {
    const x = area.x1 / SIZE * 138, y = area.y1 / SIZE * 118;
    mini.fillText('L' + (farmAreaLevelRange(area).join('–')), x, y + 8);
  }
  for (const point of spawnPoints) if (point.kind === 'pack' || point.kind === 'rare') {
    mini.strokeStyle = point.kind === 'rare' ? '#edd183aa' : '#f2deb54a'; mini.beginPath();
    mini.arc(point.x / SIZE * 138, point.y / SIZE * 118, point.kind === 'rare' ? 3 : 2, 0, Math.PI * 2); mini.stroke();
  }
}
