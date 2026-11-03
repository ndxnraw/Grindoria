const groundIconCache = new Map();

function groundIcon(item) {
  if (typeof Image === 'undefined') return null;
  const key = equipmentAppearance(item)?.key || (item.icon || item.slot) + ':' + (item.rarity || 0);
  if (!groundIconCache.has(key)) {
    const image = new Image();
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(itemIcon(item).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
    if(groundIconCache.size>=256)groundIconCache.delete(groundIconCache.keys().next().value);
    groundIconCache.set(key, image);
  }
  const image = groundIconCache.get(key);
  return image.complete && image.naturalWidth ? image : null;
}

function drawGroundLoot() {
  for (const drop of drops) {
    const visual = groundDropVisual(drop);
    if (visual.x < -40 || visual.x > W + 40 || visual.y < -65 || visual.y > H + 40) continue;
    const item = groundDropView(drop); if (!item) continue;
    const location = screen(drop.x, drop.y), selected = drop.id === hoveredLootId;
    const color = ['#cfbc7f', '#88c5dd', '#c899e5'][item.rarity || 0];
    ellipse(location.x, location.y, selected ? 19 : 12, selected ? 7 : 4, color + (selected ? '88' : '40'));
    const icon = groundIcon(item), height = item.slot === 'weapon' || item.slot === 'talisman' ? 36 : 28, width = height === 36 ? 23 : 28;
    if (icon) ctx.drawImage(icon, visual.x - width / 2, visual.y - height / 2, width, height);
    else { ellipse(visual.x, visual.y, 7, 7, color); }
    if (item.count > 1) {
      ctx.font = 'bold 9px Segoe UI,sans-serif'; ctx.textAlign = 'right'; ctx.lineWidth = 3; ctx.strokeStyle = '#101713'; ctx.fillStyle = '#f5e8bc';
      ctx.strokeText(String(item.count), visual.x + 16, visual.y + 15); ctx.fillText(String(item.count), visual.x + 16, visual.y + 15);
    }
    if (selected) {
      const label = item.name + (drop.kind === 'gear' ? ' +' + (item.enhance || 0) : '');
      ctx.font = '11px Segoe UI,sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#0d1613'; ctx.fillStyle = color;
      ctx.strokeText(label, visual.x, visual.y - 25); ctx.fillText(label, visual.x, visual.y - 25);
    }
  }
}
