function signedItemStat(stat, value) {
  const amount = stat === 'crit' ? Number((Math.abs(value) * 100).toFixed(2)) + ' %' : Number(Math.abs(value).toFixed(2));
  return (value > 0 ? '+' : value < 0 ? '−' : '') + amount;
}

function groundItemComparison(item) {
  const worn = p.equipped[item.slot], current = itemBonuses(worn), next = itemBonuses(item);
  return `<div class="loot-comparison"><h4>Porovnanie: ${escapeHTML(worn?.name || 'prázdny slot')}</h4>${Object.keys(ITEM_STATS).filter(stat => current[stat] || next[stat]).map(stat => {
    const change = next[stat] - current[stat];
    return `<div class="loot-stat ${change > 0 ? 'stat-gain' : change < 0 ? 'stat-loss' : 'stat-same'}"><span>${ITEM_STATS[stat]}</span><b>${signedItemStat(stat, change)}</b></div>`;
  }).join('')}</div>`;
}

function groundDropTooltip(drop) {
  const item = groundDropView(drop); if (!item) return '';
  const gear = drop.kind === 'gear', required = requiredItemLevel(item), usable = gear && canEquipItem(item);
  let details;
  if (gear) {
    const spec = EQUIPMENT[item.slot], base = (Number(item.bonus) || 0) * (spec.stat === 'crit' ? .01 : 1);
    const extras = Object.entries(item.stats || {}).filter(([stat, value]) => ITEM_STATS[stat] && Number.isFinite(value));
    const specials = Array.isArray(item.special) ? item.special : [];
    details = `<h4>Základné atribúty</h4><div class="loot-stat"><span>${ITEM_STATS[spec.stat]}</span><b>${signedItemStat(spec.stat, base)}</b></div><div class="loot-stat"><span>Vylepšenie +${item.enhance || 0}</span><b>${signedItemStat(spec.stat, (item.enhance || 0) * 3 * (spec.stat === 'crit' ? .01 : 1))}</b></div><h4>Bonusy</h4>${extras.length ? extras.map(([stat, value]) => `<div class="loot-stat"><span>${ITEM_STATS[stat]}</span><b>${signedItemStat(stat, value)}</b></div>`).join('') : '<p>Bez dodatočných bonusov.</p>'}<h4>Špeciálne vlastnosti</h4><p>${specials.length ? specials.map(value => escapeHTML(value)).join('<br>') : 'Žiadne.'}</p><p class="${usable ? 'stat-gain' : 'stat-loss'}">${usable ? 'Možno vybaviť · ' + spec.name : escapeHTML(itemEquipReason(item))}</p>${usable ? groundItemComparison(item) : ''}`;
  } else details = `<p>${escapeHTML(item.description)}</p><div class="loot-stat"><span>Množstvo</span><b>${item.count.toLocaleString('sk-SK')}</b></div><h4>Vybavenie</h4><p>${drop.kind === 'relic' ? 'Relikvia zbierky · nezaberá slot výbavy.' : 'Nie je výbava postavy.'}</p>`;
  return `<div class="loot-heading rarity-${item.rarity || 0}"><div class="loot-item-icon">${itemIcon(item)}</div><div><small>${gear ? EQUIPMENT[item.slot].name : drop.kind === 'gold' ? 'MENA' : drop.kind === 'relic' ? 'RELIKVIA' : 'ZÁSOBY'} · ${rarityName(item.rarity)}</small><h3>${escapeHTML(item.name)}${gear ? ' +' + (item.enhance || 0) : ''}</h3></div></div><div class="loot-stat ${p.level < required ? 'stat-loss' : ''}"><span>Požadovaná úroveň</span><b>${required}</b></div>${details}<p class="loot-controls">${drop.fallAge < LOOT_RULES.fallDuration ? 'Predmet dopadá na zem…' : Math.hypot(drop.x - p.x, drop.y - p.y) > LOOT_RULES.pickupRange ? 'Priblíž sa · dosah zbierania 180' : 'Ľavé tlačidlo alebo Y · zdvihnúť'}</p>`;
}

function floatingTooltipPosition(x, y, width, height, viewportWidth, viewportHeight) {
  const gap = 14, edge = 8, w = Math.min(width, viewportWidth - edge * 2), h = Math.min(height, viewportHeight - edge * 2);
  const clamp = (v, max) => Math.max(edge, Math.min(v, max));
  const candidates = [[x + gap, y + gap], [x - gap - w, y + gap], [x + gap, y - gap - h], [x - gap - w, y - gap - h]];
  for (const [left, top] of candidates) {
    const cx = clamp(left, viewportWidth - w - edge), cy = clamp(top, viewportHeight - h - edge);
    if (x >= cx - 6 && x <= cx + w + 6 && y >= cy - 6 && y <= cy + h + 6) continue;
    return { left: cx, top: cy, maxHeight: viewportHeight - edge * 2 };
  }
  const below = viewportHeight - y - gap - edge, above = y - gap - edge, room = Math.max(1, below, above);
  const maxHeight = Math.min(h, room);
  return { left: clamp(x + gap, viewportWidth - w - edge), top: below >= above ? y + gap : y - gap - maxHeight, maxHeight };
}

function updateLootHover() {
  if (!running || paused || !lootPointer.inside) { hoveredLootId = null; $('loot-tooltip').hidden = true; canvas.style.cursor = ''; return; }
  // Scrolling or resizing can move the canvas underneath a stationary cursor.
  const canvasRect = canvas.getBoundingClientRect();
  lootPointer.x = lootPointer.clientX - (canvasRect.left || 0); lootPointer.y = lootPointer.clientY - (canvasRect.top || 0);
  if (lootPointer.x < 0 || lootPointer.y < 0 || lootPointer.x > W || lootPointer.y > H) { hoveredLootId = null; $('loot-tooltip').hidden = true; canvas.style.cursor = ''; return; }
  const drop = groundDropAt(lootPointer.x, lootPointer.y);
  if (!drop) { hoveredLootId = null; $('loot-tooltip').hidden = true; canvas.style.cursor = ''; return; }
  hoveredLootId = drop.id; canvas.style.cursor = 'pointer';
  const signature = [drop.id, p.level, p.classId, drop.fallAge >= LOOT_RULES.fallDuration, Math.hypot(drop.x - p.x, drop.y - p.y) <= LOOT_RULES.pickupRange, JSON.stringify(p.equipped)].join('|');
  const tooltip = $('loot-tooltip');
  if (signature !== lootTooltipSignature) { tooltip.innerHTML = groundDropTooltip(drop); lootTooltipSignature = signature; }
  tooltip.hidden = false; tooltip.style.maxHeight = ((window.innerHeight || H) - 16) + 'px';
  const rect = tooltip.getBoundingClientRect();
  const position = floatingTooltipPosition(lootPointer.clientX, lootPointer.clientY, rect.width, rect.height, window.innerWidth || W, window.innerHeight || H);
  tooltip.style.left = position.left + 'px'; tooltip.style.top = position.top + 'px'; tooltip.style.maxHeight = position.maxHeight + 'px';
}
