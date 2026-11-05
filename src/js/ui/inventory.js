let inventoryTab = 'gear', inventoryPage = 0, inventorySelection = null, inventoryDrag = null, inventoryDragPreview = null;

function inventoryEntry(id) {
  if (!id) return null;
  if (id.startsWith('gear:')) {
    const item = p.bag.find(item => 'gear:' + item.uid === id);
    return item ? { id, item, kind: 'gear' } : null;
  }
  if (id.startsWith('equipped:')) {
    const item = p.equipped[id.slice(9)];
    return item ? { id, item, kind: 'equipped' } : null;
  }
  const item = supplyEntries().find(item => item.id === id);
  return item ? { id, item, kind: 'supply' } : null;
}

function itemBonusText(item) {
  return Object.entries(itemBonuses(item)).filter(([, value]) => value).map(([stat, value]) => `<span class="bonus-line">${ITEM_STATS[stat]} <b>+${percentItemStat(stat) ? (value * 100).toFixed(1) + ' %' : value}</b></span>`).join('');
}

function itemDescription(entry, tooltip = false) {
  const item = entry.item, gear = entry.kind !== 'supply';
  const [w, h] = gear ? itemSize(item) : [1, 1];
  return `<div class="item-description rarity-${item.rarity || 0}"><small>${gear ? (entry.kind === 'equipped' ? 'NASADENÉ · ' : '') + EQUIPMENT[item.slot].name : 'ZÁSOBY · ' + item.count.toLocaleString('sk-SK') + ' ks'}</small><h3>${escapeHTML(item.name)}${gear ? ' +' + (item.enhance || 0) : ''}</h3>${!tooltip ? `<div class="detail-icon">${itemIcon(item)}</div>` : ''}${gear ? `${item.uniqueId?'<p class="inventory-usable">Unikát · '+DUNGEONS[item.uniqueId].name+'</p>':''}<p>${rarityName(item.rarity)} · stupeň ${item.tier || 1} · ${w} × ${h} políčka</p><p class="${canEquipItem(item) ? 'inventory-usable' : 'inventory-unusable'}">Požadovaná úroveň: ${requiredItemLevel(item)}<br>${escapeHTML(itemEquipReason(item))}</p>${itemBonusText(item)}${itemGenerationDescription(item)}${item.generationVersion===ITEM_GENERATION.version?'':`<p class="item-price">Výkup: ${marketGearSaleValue(item)} Yang</p>`}` : `<p>${escapeHTML(item.description)}</p><p>Množstvo: <b>${item.count.toLocaleString('sk-SK')} ks</b></p>`}</div>`;
}

function inventory() {
  initializeInventory();
  inventoryPage = Math.min(inventoryPage, p.inventory.pages - 1);
  const page = inventoryTab === 'supplies' ? 0 : inventoryPage, offset = page * INVENTORY.pageSize;
  const entries = inventoryTab === 'supplies' ? supplyEntries().map(item => ({ id: item.id, item, kind: 'supply' })) : p.bag.filter(item => Math.floor(item.cell / INVENTORY.pageSize) === page).map(item => ({ id: 'gear:' + item.uid, item, kind: 'gear' }));
  const occupied = p.bag.reduce((n, item) => n + itemSize(item)[0] * itemSize(item)[1], 0);
  modal(`<section class="inventory-window"><header class="inventory-title"><small>${escapeHTML(characterDisplayName(p))} · ${role().name}</small><span class="inv-level">ÚR. ${p.level}</span></header>
    <div class="inventory-columns"><section class="character-panel"><h3>Vybavenie postavy</h3><div class="equipment-board">${equipmentFigure()}${Object.entries(EQUIPMENT).map(([id, spec]) => {
      const item = p.equipped[id];
      return `<button class="equipment-slot slot-${id} ${item ? 'filled rarity-' + item.rarity : ''}" data-equip-slot="${id}" ${item ? `data-entry="equipped:${id}" draggable="true"` : ''} aria-label="${spec.name}${item ? ': ' + escapeHTML(item.name) + ' · ' + rarityName(item.rarity) : ': prázdny slot'}"><span>${itemIcon(item || { slot: id }, !item)}</span><small>${spec.name}</small>${item ? '<i>✓</i>' : ''}</button>`;
    }).join('')}</div></section>
    <section class="bag-panel"><div class="bag-heading"><h3>Inventár</h3><small>${inventoryTab === 'gear' ? occupied + ' / ' + p.inventory.pages * INVENTORY.pageSize + ' políčok' : supplyEntries().length+' typov'}</small></div><div class="inventory-tabs"><button data-inv-tab="gear" aria-pressed="${inventoryTab === 'gear'}">Predmety</button><button data-inv-tab="supplies" aria-pressed="${inventoryTab === 'supplies'}">Zásoby</button></div><div class="inventory-pages">${inventoryTab === 'gear' ? Array.from({ length: p.inventory.pages }, (_, i) => `<button data-inv-page="${i}" aria-label="Strana ${i + 1}" aria-pressed="${page === i}">${i + 1}</button>`).join('') : ''}<button id="rarity-guide" type="button" title="Rarity" aria-label="Rarity">◇</button><button id="inv-sort" title="Zoradiť podľa veľkosti, vzácnosti a stupňa" aria-label="Zoradiť">↕</button></div>
    <div class="inventory-grid" id="inventory-grid" role="group" aria-label="Mriežka inventára, 5 stĺpcov a 9 riadkov">${Array.from({ length: INVENTORY.pageSize }, (_, i) => `<button class="inventory-cell" data-cell="${offset + i}" aria-label="Prázdne políčko ${offset + i + 1}" style="grid-column:${i % 5 + 1};grid-row:${Math.floor(i / 5) + 1}"></button>`).join('')}${entries.map(entry => {
      const item = entry.item, [w, h] = entry.kind === 'gear' ? itemSize(item) : [1, 1], local = item.cell % INVENTORY.pageSize;
      return `<button class="grid-item rarity-${item.rarity || 0}" draggable="true" data-entry="${entry.id}" aria-label="${escapeHTML(item.name)}${entry.kind === 'gear' ? ' · ' + rarityName(item.rarity) : ''}${entry.kind === 'supply' ? ', ' + item.count + ' kusov' : ', +' + (item.enhance || 0)}" aria-pressed="${inventorySelection === entry.id}" style="grid-column:${local % 5 + 1} / span ${w};grid-row:${Math.floor(local / 5) + 1} / span ${h}">${itemIcon(item)}${entry.kind === 'supply' ? `<b class="stack-count">${item.count}</b>` : `<b class="enhance-count">+${item.enhance || 0}</b>`}</button>`;
    }).join('')}</div></section>
    <div class="inventory-money">◉ <b>${p.gold.toLocaleString('sk-SK')}</b> <small>YANG</small></div><div class="inventory-controls"><p class="inventory-message" id="inventory-message" role="status"></p></div></div><div id="item-tooltip" class="item-tooltip loot-tooltip" role="tooltip" hidden></div></section>`,{key:'inventory',title:'Inventár',refresh:()=>{if(gameWindows.get('inventory')?.inventorySignature!==inventoryContentSignature())inventory();}});
  $('rarity-guide').onclick=rarityGuide;
  $('inv-sort').onclick = () => { if (sortInventory(inventoryTab)) inventory(); else inventoryMessage('Predmety sa do tohto rozloženia nezmestia.'); };
  panelQueryAll('[data-inv-tab]').forEach(button => button.onclick = () => { inventoryTab = button.dataset.invTab; inventorySelection = null; inventory(); });
  panelQueryAll('[data-inv-page]').forEach(button => button.onclick = () => { inventoryPage = Number(button.dataset.invPage); inventory(); });
  panelQueryAll('[data-stat]').forEach(button => button.onclick = () => allocate(button.dataset.stat));
  panelQueryAll('[data-entry]').forEach(button => {
    button.onclick = () => selectInventoryEntry(button.dataset.entry);
    button.ondblclick = () => activateInventoryEntry(button.dataset.entry);
    button.onmouseenter = event => withGameWindow('inventory',()=>showItemTooltip(button.dataset.entry,event));
    button.onmousemove = event => withGameWindow('inventory',()=>positionItemTooltip(event));
    button.onmouseleave = () => withGameWindow('inventory',()=>{$('item-tooltip').hidden=true;});
    button.onfocus = () => withGameWindow('inventory',()=>showItemTooltip(button.dataset.entry,{clientX:button.getBoundingClientRect().left,clientY:button.getBoundingClientRect().bottom}));
    button.onblur = () => withGameWindow('inventory',()=>{$('item-tooltip').hidden=true;});
    button.ondragstart = event => {
      clearInventoryDrag();
      const sourceRect=button.getBoundingClientRect();
      inventoryDrag = { id: button.dataset.entry, x: 0, y: 0, grabX:event.clientX-sourceRect.left,grabY:event.clientY-sourceRect.top };
      if (button.className.includes('grid-item')) {
        const pitch=inventoryGridPitch();
        inventoryDrag.x = Math.floor(inventoryDrag.grabX/pitch.x);
        inventoryDrag.y = Math.floor(inventoryDrag.grabY/pitch.y);
      }
      inventoryDragPreview=document.createElement('div');inventoryDragPreview.className='grid-item inventory-drag-preview rarity-'+(inventoryEntry(inventoryDrag.id)?.item.rarity||0);inventoryDragPreview.innerHTML=button.innerHTML;inventoryDragPreview.setAttribute('aria-hidden','true');inventoryDragPreview.style.width=sourceRect.width+'px';inventoryDragPreview.style.height=sourceRect.height+'px';document.body.appendChild(inventoryDragPreview);
      const blank=document.createElement('canvas');blank.width=blank.height=1;event.dataTransfer.setDragImage?.(blank,0,0);updateInventoryDragPreview(event);
      event.dataTransfer.setData('text/plain', button.dataset.entry); event.dataTransfer.effectAllowed = 'move'; $('item-tooltip').hidden = true;
    };
    button.ondragend = clearInventoryDrag;
  });
  panelQueryAll('[data-equip-slot]').forEach(button => {
    if (!button.dataset.entry) button.onclick = () => dropOnEquipment(button.dataset.equipSlot, inventorySelection);
    else { const choose = button.onclick; button.onclick = () => inventoryEntry(inventorySelection)?.kind === 'gear' && inventoryEntry(inventorySelection).item.slot === button.dataset.equipSlot ? dropOnEquipment(button.dataset.equipSlot, inventorySelection) : choose(); }
    button.ondragover = event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; };
    button.ondrop = event => { event.preventDefault(); dropOnEquipment(button.dataset.equipSlot, inventoryDrag?.id); clearInventoryDrag(); };
  });
  panelQueryAll('[data-cell]').forEach(button => button.onclick = () => dropOnInventoryCell(inventorySelection, Number(button.dataset.cell)));
  const grid = $('inventory-grid');
  grid.ondragover = event => { event.preventDefault(); event.dataTransfer.dropEffect = canDropInventoryEntry(inventoryDrag?.id,inventoryPointerCell(event))?'move':'none'; };
  grid.ondrop = event => {
    event.preventDefault(); if (!inventoryDrag) return;
    const cell=inventoryPointerCell(event);
    if (cell!==null) dropOnInventoryCell(inventoryDrag.id,cell);
    else inventoryMessage('Predmet by presahoval okraj mriežky.');
    clearInventoryDrag();
  };
  selectInventoryEntry(inventoryEntry(inventorySelection) ? inventorySelection : null);activeGameWindow.inventorySignature=inventoryContentSignature();
}

function inventoryMessage(message) { $('inventory-message').textContent = message;const entry=gameWindows.get('inventory');if(entry)clampGameWindow(entry); }

function selectInventoryEntry(id) {
  inventorySelection = id;
  panelQueryAll('[data-entry]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.entry === id)));
}

function activateInventoryEntry(id) {
  const entry = inventoryEntry(id); if (!entry) return false;
  if (entry.kind === 'gear') { if (!canEquipItem(entry.item)) { inventoryMessage(itemEquipReason(entry.item)); return false; } return equipItem(p.bag.findIndex(item => item.uid === entry.item.uid)); }
  if (entry.kind === 'equipped') { const ok = unequipItem(entry.item.slot); if (!ok) inventoryMessage('V inventári nie je dosť súvislého miesta.'); return ok; }
  const ok = useInventorySupply(id);
  if (ok && ['drink','cape'].includes(entry.item.action)) inventory();
  if (!ok) inventoryMessage(entry.item.action === 'drink' ? 'Zdravie je plné alebo elixír nemožno použiť.' : 'Plášť použi mimo bezpečnej zóny a počkaj na obnovenie.');
  return ok;
}

function dropOnInventoryCell(id, cell) {
  if (!id) return false;
  let ok = false;
  if (id.startsWith('equipped:') && inventoryTab === 'gear') { const result = unequipItem(id.slice(9), cell); if (!result) inventoryMessage('Výbava sa na toto miesto nezmestí.'); return result; }
  if (id.startsWith('gear:') && inventoryTab === 'gear') ok = moveGearItem(Number(id.slice(5)), cell);
  else if (!id.startsWith('gear:') && inventoryTab === 'supplies') ok = moveSupplyItem(id, cell);
  if (ok) inventory(); else inventoryMessage('Predmet sa sem nezmestí. Výbava a zásoby majú vlastné záložky.');
  return ok;
}

function dropOnEquipment(slot, id) {
  const entry = inventoryEntry(id);
  if (!entry || entry.kind !== 'gear' || entry.item.slot !== slot) { inventoryMessage('Tento predmet patrí do iného slotu.'); return false; }
  return equipItem(p.bag.findIndex(item => item.uid === entry.item.uid));
}

function showItemTooltip(id, event) {
  const entry = inventoryEntry(id); if (!entry) return;
  $('item-tooltip').innerHTML = entry.kind==='supply'?itemDescription(entry,true):groundDropTooltip({kind:'gear',item:entry.item,x:p.x,y:p.y,fallAge:LOOT_RULES.fallDuration},true); $('item-tooltip').hidden = false; positionItemTooltip(event);
}

function positionItemTooltip(event) {
  const tooltip=$('item-tooltip'),width=window.innerWidth||W,height=window.innerHeight||H;
  tooltip.style.maxHeight=(height-16)+'px';const rect=tooltip.getBoundingClientRect();
  const position=floatingTooltipPosition(event.clientX,event.clientY,rect.width,rect.height,width,height);
  tooltip.style.left=position.left+'px';tooltip.style.top=position.top+'px';tooltip.style.maxHeight=position.maxHeight+'px';
}


function inventoryContentSignature(){return JSON.stringify([p.level,p.gold,p.bag,p.equipped,p.potions,p.braveryCapes,p.career.materials,p.inventory.supplyCells,currentTrader()]);}

// Fit equipment and all nine bag rows to the available window, including toolbar wrapping.
function fitInventoryLayout(entry){
 const grid=entry.content.querySelector('.inventory-grid'),bag=entry.content.querySelector('.bag-panel');if(!grid||!bag)return;
 const titlebar=entry.node.querySelector('.window-titlebar'),border=Math.max(0,entry.node.offsetHeight-entry.node.clientHeight);
 const budget=Math.max(1,parseFloat(entry.node.style.maxHeight)-titlebar.getBoundingClientRect().height-border);
 entry.node.classList.toggle('inventory-compact',budget<320);
 let cell=Math.max(8,Math.min(36,Math.floor((windowBounds().width-32)/5)));
 entry.node.style.setProperty('--inventory-cell',cell+'px');
 for(let attempt=0;attempt<8;attempt++){
  const excess=entry.content.scrollHeight-budget;if(!(excess>0)||cell<=8)break;
  cell=Math.max(8,cell-Math.max(1,Math.ceil(excess/15)));entry.node.style.setProperty('--inventory-cell',cell+'px');
 }
 // A formerly scrolled inventory must reopen at its first visible row after a resize.
 entry.body.scrollTop=0;entry.body.scrollLeft=0;
}

function inventoryGridPitch(){
 const cells=gameWindows.get('inventory').content.querySelectorAll('[data-cell]'),first=cells[0].getBoundingClientRect();
 return {x:cells[1].getBoundingClientRect().left-first.left,y:cells[5].getBoundingClientRect().top-first.top,first};
}
function inventoryPointerCell(event){
 const {x,y,first}=inventoryGridPitch(),col=Math.floor((event.clientX-first.left)/x)-(inventoryDrag?.x||0),row=Math.floor((event.clientY-first.top)/y)-(inventoryDrag?.y||0);
 return col>=0&&col<5&&row>=0&&row<9?(inventoryTab==='gear'?inventoryPage*INVENTORY.pageSize:0)+row*5+col:null;
}
function canDropInventoryEntry(id,cell){
 const entry=inventoryEntry(id);if(!entry||cell===null)return false;
 if(entry.kind==='supply')return inventoryTab==='supplies'&&Number.isInteger(cell)&&cell>=0&&cell<INVENTORY.pageSize&&!supplyEntries().some(other=>other.id!==id&&other.cell===cell);
 return inventoryTab==='gear'&&gearCellAvailable(entry.item,cell);
}
function clearInventoryDrag(){inventoryDragPreview?.remove();inventoryDragPreview=null;inventoryDrag=null;}
function updateInventoryDragPreview(event){
 if(!inventoryDragPreview||!inventoryDrag)return;
 inventoryDragPreview.style.left=event.clientX-inventoryDrag.grabX+'px';inventoryDragPreview.style.top=event.clientY-inventoryDrag.grabY+'px';
 const entry=gameWindows.get('inventory'),grid=entry?.content.querySelector('.inventory-grid'),slot=event.target.closest?.('[data-equip-slot]');
 let valid=!entry?.node.contains(event.target);
 if(grid?.contains(event.target))valid=canDropInventoryEntry(inventoryDrag.id,inventoryPointerCell(event));
 else if(slot){const item=inventoryEntry(inventoryDrag.id);valid=item?.kind==='gear'&&item.item.slot===slot.dataset.equipSlot&&canEquipItem(item.item);}
 inventoryDragPreview.classList.toggle('is-invalid',!valid);
}
document.addEventListener('dragover',updateInventoryDragPreview);
window.addEventListener('blur',clearInventoryDrag);
