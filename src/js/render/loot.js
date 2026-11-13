const groundIconCache = new Map(),groundRenderCache=new WeakMap();
let groundIconBuildsRemaining=Infinity,groundRasterBuildsRemaining=Infinity;
function groundRenderView(drop){let cached=groundRenderCache.get(drop);const item=drop.item;if(!cached||cached.item!==drop.item||cached.count!==drop.count||cached.kind!==drop.kind||cached.supplyId!==drop.supplyId||cached.enhance!==item?.enhance||cached.rarity!==item?.rarity||cached.modelId!==item?.modelId||cached.name!==item?.name||cached.tier!==item?.tier||cached.bonus!==item?.bonus||cached.affixes!==item?.affixes){cached={enhance:item?.enhance,rarity:item?.rarity,modelId:item?.modelId,name:item?.name,tier:item?.tier,bonus:item?.bonus,affixes:item?.affixes,item:drop.item,count:drop.count,kind:drop.kind,supplyId:drop.supplyId,view:groundDropView(drop),key:null};groundRenderCache.set(drop,cached);}return cached;}

function groundIcon(item,knownKey=null) {
  if (typeof Image === 'undefined') return null;
  const key = knownKey || equipmentAppearance(item)?.key || (item.icon || item.slot) + ':' + (item.rarity || 0);
  if (!groundIconCache.has(key)) {
    if(groundIconBuildsRemaining<=0)return null;groundIconBuildsRemaining--;
    const image = new Image();
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(itemIcon(item).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
    if(groundIconCache.size>=PERFORMANCE_RULES.iconCacheLimit)groundIconCache.delete(groundIconCache.keys().next().value);
    groundIconCache.set(key, {image,bitmap:null});
  }
  const entry=groundIconCache.get(key),image=entry.image;
  if(!image.complete||!image.naturalWidth)return null;
  if(!entry.bitmap&&typeof OffscreenCanvas==='function'&&groundRasterBuildsRemaining>0){groundRasterBuildsRemaining--;const bitmap=new OffscreenCanvas(64,96),paint=bitmap.getContext('2d');if(paint){paint.drawImage(image,0,0,64,96);entry.bitmap=bitmap;}}
  return entry.bitmap||image;
}

function drawGroundLoot() {
  groundIconBuildsRemaining=groundRasterBuildsRemaining=PERFORMANCE_RULES.iconBuildsPerFrame;try{
  for (const drop of drops) {
    if(!visibleWorldPoint(drop.x,drop.y,160))continue;
    const visual = groundDropVisual(drop);
    if (visual.x < -40 || visual.x > W + 40 || visual.y < -65 || visual.y > H + 40) continue;
    const selected=drop.id===hoveredLootId,dx=drop.x-p.x,dy=drop.y-p.y;
    if(!selected&&dx*dx+dy*dy>PERFORMANCE_RULES.lootDetailRadius**2){ellipse(visual.x,visual.y,5,4,'#d6cb99');continue;}
    const cached=groundRenderView(drop),item=cached.view; if (!item) continue;
    cached.key??=equipmentAppearance(item)?.key||(item.icon||item.slot)+':'+(item.rarity||0);
    const location = screen(drop.x, drop.y);
    const color = '#d6cb99';
    ellipse(location.x, location.y, selected ? 19 : 12, selected ? 7 : 4, color + (selected ? '88' : '40'));
    const icon = groundIcon(item,cached.key), height = item.slot === 'weapon' || item.slot === 'talisman' ? 36 : 28, width = height === 36 ? 23 : 28;
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
  }finally{groundIconBuildsRemaining=groundRasterBuildsRemaining=Infinity;}
}
