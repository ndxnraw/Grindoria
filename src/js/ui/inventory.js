let inventoryTab = 'gear', inventoryPage = 0, inventorySelection = null, inventoryDrag = null, inventoryDeletePending = null;

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
  return Object.entries(itemBonuses(item)).filter(([, value]) => value).map(([stat, value]) => `<span class="bonus-line">${ITEM_STATS[stat]} <b>+${stat === 'crit' ? (value * 100).toFixed(1) + ' %' : value}</b></span>`).join('');
}

function itemDescription(entry, tooltip = false) {
  const item = entry.item, gear = entry.kind !== 'supply';
  const [w, h] = gear ? itemSize(item) : [1, 1];
  return `<div class="item-description rarity-${item.rarity || 0}"><small>${gear ? (entry.kind === 'equipped' ? 'NASADENÉ · ' : '') + EQUIPMENT[item.slot].name : 'ZÁSOBY · ' + item.count.toLocaleString('sk-SK') + ' ks'}</small><h3>${escapeHTML(item.name)}${gear ? ' +' + (item.enhance || 0) : ''}</h3>${!tooltip ? `<div class="detail-icon">${itemIcon(item)}</div>` : ''}${gear ? `<p>${rarityName(item.rarity)} · stupeň ${item.tier || 1} · ${w} × ${h} políčka</p>${itemBonusText(item)}<p class="item-price">Predaj: ${item.value || 0} zlata</p>` : `<p>${escapeHTML(item.description)}</p><p>Rovnaký typ sa automaticky stackuje.<br>Množstvo: <b>${item.count.toLocaleString('sk-SK')} ks</b></p>`}</div>`;
}

function inventory() {
  initializeInventory();
  inventoryPage = Math.min(inventoryPage, p.inventory.pages - 1);
  const page = inventoryTab === 'supplies' ? 0 : inventoryPage, offset = page * INVENTORY.pageSize;
  const entries = inventoryTab === 'supplies' ? supplyEntries().map(item => ({ id: item.id, item, kind: 'supply' })) : p.bag.filter(item => Math.floor(item.cell / INVENTORY.pageSize) === page).map(item => ({ id: 'gear:' + item.uid, item, kind: 'gear' }));
  const occupied = p.bag.reduce((n, item) => n + itemSize(item)[0] * itemSize(item)[1], 0);
  modal(`<section class="inventory-window"><header class="inventory-title"><span class="window-sigil">G</span><div><small>GRINDORIA · ${role().name}</small><h2>Výbava a inventár</h2></div><span class="inv-level">ÚR. ${p.level}</span></header>
    <div class="inventory-columns"><section class="character-panel"><h3>Vybavenie postavy</h3><div class="equipment-board">${equipmentFigure()}${Object.entries(EQUIPMENT).map(([id, spec]) => {
      const item = p.equipped[id];
      return `<button class="equipment-slot slot-${id} ${item ? 'filled rarity-' + item.rarity : ''}" data-equip-slot="${id}" ${item ? `data-entry="equipped:${id}" draggable="true"` : ''} aria-label="${spec.name}${item ? ': ' + escapeHTML(item.name) : ': prázdny slot'}"><span>${itemIcon(item || { slot: id }, !item)}</span><small>${spec.name}</small>${item ? '<i>✓</i>' : ''}</button>`;
    }).join('')}</div><div class="character-values"><span>Útok <b>${damage()}</b></span><span>Obrana <b>${defense()}</b></span><span>Zdravie <b>${Math.ceil(p.hp)} / ${maxHP()}</b></span><span>Mana <b>${Math.ceil(p.mp)} / ${maxMP()}</b></span><span>Kritický zásah <b>${(criticalChance() * 100).toFixed(1)} %</b></span><span>Rýchlosť <b>${Math.round(speedValue())}</b></span><span>Sila kúziel <b>${p.intelligence * 4 + careerBonuses().magic + equipmentBonuses().magic}</b></span></div><details class="inventory-attributes"><summary>Vlastnosti · ${p.points} voľných bodov</summary>${[['strength', 'Sila'], ['vitality', 'Vitalita'], ['dexterity', 'Obratnosť'], ['intelligence', 'Inteligencia']].map(([id, name]) => `<div>${name}<b>${p[id]}</b><button data-stat="${id}" ${p.points ? '' : 'disabled'} aria-label="Zlepšiť: ${name}">+</button></div>`).join('')}</details></section>
    <section class="bag-panel"><div class="bag-heading"><h3>Inventár</h3><small>${inventoryTab === 'gear' ? occupied + ' / ' + p.inventory.pages * INVENTORY.pageSize + ' políčok' : 'Automatické stackovanie'}</small></div><div class="inventory-tabs"><button data-inv-tab="gear" aria-pressed="${inventoryTab === 'gear'}">Predmety</button><button data-inv-tab="supplies" aria-pressed="${inventoryTab === 'supplies'}">Zásoby</button></div><div class="inventory-pages">${inventoryTab === 'gear' ? Array.from({ length: p.inventory.pages }, (_, i) => `<button data-inv-page="${i}" aria-label="Strana ${i + 1}" aria-pressed="${page === i}">${i + 1}</button>`).join('') : '<span>Elixíry · plášte · materiály · kamene</span>'}<button id="inv-sort" title="Zoradiť podľa veľkosti, vzácnosti a stupňa">Zoradiť</button></div>
    <div class="inventory-grid" id="inventory-grid" role="group" aria-label="Mriežka inventára, 5 stĺpcov a 9 riadkov">${Array.from({ length: INVENTORY.pageSize }, (_, i) => `<button class="inventory-cell" data-cell="${offset + i}" aria-label="Prázdne políčko ${offset + i + 1}" style="grid-column:${i % 5 + 1};grid-row:${Math.floor(i / 5) + 1}"></button>`).join('')}${entries.map(entry => {
      const item = entry.item, [w, h] = entry.kind === 'gear' ? itemSize(item) : [1, 1], local = item.cell % INVENTORY.pageSize;
      return `<button class="grid-item rarity-${item.rarity || 0}" draggable="true" data-entry="${entry.id}" aria-label="${escapeHTML(item.name)}${entry.kind === 'supply' ? ', ' + item.count + ' kusov' : ', +' + (item.enhance || 0)}" aria-pressed="${inventorySelection === entry.id}" style="grid-column:${local % 5 + 1} / span ${w};grid-row:${Math.floor(local / 5) + 1} / span ${h}">${itemIcon(item)}${entry.kind === 'supply' ? `<b class="stack-count">${item.count}</b>` : `<b class="enhance-count">+${item.enhance || 0}</b>`}</button>`;
    }).join('')}</div><p class="inventory-hint">Presuň predmet myšou. Na dotyku vyber predmet a potom cieľové políčko alebo slot.</p><div class="inventory-money">◉ <b>${p.gold.toLocaleString('sk-SK')}</b> <small>ZLATO</small></div></section>
    <aside class="item-inspector"><span class="eyebrow">PREDMET</span><div id="inventory-detail"></div><p class="inventory-message" id="inventory-message" role="status"></p><div class="inventory-shortcuts"><span>Plášť statočnosti: ${p.braveryCapes} ks · B</span><span>Elixíry: ${p.potions} · E</span><button id="inv-progress">Dlhodobá progresia · P</button></div></aside></div><div id="item-tooltip" class="item-tooltip" role="tooltip" hidden></div></section>`);
  $('modal').className = 'overlay inventory-overlay';
  $('inv-sort').onclick = () => { if (sortInventory(inventoryTab)) inventory(); else inventoryMessage('Predmety sa do tohto rozloženia nezmestia.'); };
  $('inv-progress').onclick = () => careerPanel();
  document.querySelectorAll('[data-inv-tab]').forEach(button => button.onclick = () => { inventoryTab = button.dataset.invTab; inventorySelection = null; inventoryDeletePending = null; inventory(); });
  document.querySelectorAll('[data-inv-page]').forEach(button => button.onclick = () => { inventoryPage = Number(button.dataset.invPage); inventory(); });
  document.querySelectorAll('[data-stat]').forEach(button => button.onclick = () => allocate(button.dataset.stat));
  document.querySelectorAll('[data-entry]').forEach(button => {
    button.onclick = () => selectInventoryEntry(button.dataset.entry);
    button.ondblclick = () => activateInventoryEntry(button.dataset.entry);
    button.onmouseenter = event => showItemTooltip(button.dataset.entry, event);
    button.onmousemove = event => positionItemTooltip(event);
    button.onmouseleave = () => $('item-tooltip').hidden = true;
    button.onfocus = () => showItemTooltip(button.dataset.entry, { clientX: button.getBoundingClientRect().left, clientY: button.getBoundingClientRect().bottom });
    button.onblur = () => $('item-tooltip').hidden = true;
    button.ondragstart = event => {
      inventoryDrag = { id: button.dataset.entry, x: 0, y: 0 };
      if (button.className.includes('grid-item')) {
        const rect = button.getBoundingClientRect(), grid = $('inventory-grid').getBoundingClientRect();
        inventoryDrag.x = Math.floor((event.clientX - rect.left) / (grid.width / 5));
        inventoryDrag.y = Math.floor((event.clientY - rect.top) / (grid.height / 9));
      }
      event.dataTransfer.setData('text/plain', button.dataset.entry); event.dataTransfer.effectAllowed = 'move'; $('item-tooltip').hidden = true;
    };
    button.ondragend = () => { inventoryDrag = null; };
  });
  document.querySelectorAll('[data-equip-slot]').forEach(button => {
    if (!button.dataset.entry) button.onclick = () => dropOnEquipment(button.dataset.equipSlot, inventorySelection);
    else { const choose = button.onclick; button.onclick = () => inventoryEntry(inventorySelection)?.kind === 'gear' && inventoryEntry(inventorySelection).item.slot === button.dataset.equipSlot ? dropOnEquipment(button.dataset.equipSlot, inventorySelection) : choose(); }
    button.ondragover = event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; };
    button.ondrop = event => { event.preventDefault(); dropOnEquipment(button.dataset.equipSlot, inventoryDrag?.id); inventoryDrag = null; };
  });
  document.querySelectorAll('[data-cell]').forEach(button => button.onclick = () => dropOnInventoryCell(inventorySelection, Number(button.dataset.cell)));
  const grid = $('inventory-grid');
  grid.ondragover = event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; };
  grid.ondrop = event => {
    event.preventDefault(); if (!inventoryDrag) return;
    const rect = grid.getBoundingClientRect(), col = Math.floor((event.clientX - rect.left) / (rect.width / 5)) - inventoryDrag.x, row = Math.floor((event.clientY - rect.top) / (rect.height / 9)) - inventoryDrag.y;
    if (col >= 0 && col < 5 && row >= 0 && row < 9) dropOnInventoryCell(inventoryDrag.id, offset + row * 5 + col);
    else inventoryMessage('Predmet by presahoval okraj mriežky.');
    inventoryDrag = null;
  };
  selectInventoryEntry(inventoryEntry(inventorySelection) ? inventorySelection : null);
}

function inventoryMessage(message) { $('inventory-message').textContent = message; }

function selectInventoryEntry(id) {
  inventorySelection = id; inventoryDeletePending = null;
  document.querySelectorAll('[data-entry]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.entry === id)));
  renderInventoryDetail();
}

function renderInventoryDetail() {
  const entry = inventoryEntry(inventorySelection);
  if (!entry) { $('inventory-detail').innerHTML = '<div class="empty-inspector">◇<h3>Tvoja korisť, tvoja sila</h3><p>Vyber predmet a prezri si jeho vlastnosti. Prázdne sloty čakajú na výbavu z lovu.</p></div>'; return; }
  const gear = entry.kind !== 'supply', item = entry.item;
  $('inventory-detail').innerHTML = itemDescription(entry) + `<div class="item-actions"><button id="inv-use">${entry.kind === 'equipped' ? 'Zložiť výbavu' : gear ? 'Nasadiť' : ['drink', 'cape'].includes(item.action) ? 'Použiť' : 'Otvoriť progresiu'}</button>${entry.kind === 'gear' ? '<button id="inv-sell">Predať</button>' : ''}${entry.kind !== 'equipped' ? '<button id="inv-delete" class="danger">Odstrániť…</button>' : ''}</div>${inventoryDeletePending === entry.id ? `<div class="delete-confirm"><p>Odstránenie je trvalé. ${gear ? 'Odstrániť tento predmet?' : 'Koľko kusov odstrániť?'}</p>${gear ? '' : `<label>Počet <input id="inv-delete-count" type="number" min="1" max="${item.count}" value="1" step="1"></label>`}<button id="inv-delete-confirm">Potvrdiť odstránenie</button><button id="inv-delete-cancel">Zrušiť</button></div>` : ''}`;
  $('inv-use').onclick = () => activateInventoryEntry(entry.id);
  if (entry.kind === 'gear') $('inv-sell').onclick = () => { sellItem(p.bag.findIndex(item => 'gear:' + item.uid === entry.id)); inventorySelection = null; renderInventoryDetail(); };
  if (entry.kind !== 'equipped') $('inv-delete').onclick = () => { inventoryDeletePending = entry.id; renderInventoryDetail(); };
  if (inventoryDeletePending === entry.id) {
    $('inv-delete-cancel').onclick = () => { inventoryDeletePending = null; renderInventoryDetail(); };
    $('inv-delete-confirm').onclick = () => {
      const count = gear ? 1 : Number($('inv-delete-count').value);
      if (deleteInventoryItem(entry.id, count)) { inventorySelection = null; inventoryDeletePending = null; inventory(); }
      else inventoryMessage('Zadaj platný počet kusov.');
    };
  }
}

function activateInventoryEntry(id) {
  const entry = inventoryEntry(id); if (!entry) return false;
  if (entry.kind === 'gear') return equipItem(p.bag.findIndex(item => item.uid === entry.item.uid));
  if (entry.kind === 'equipped') { const ok = unequipItem(entry.item.slot); if (!ok) inventoryMessage('V inventári nie je dosť súvislého miesta.'); return ok; }
  const ok = useInventorySupply(id);
  if (ok && entry.item.action === 'drink') inventory();
  if (!ok) inventoryMessage(entry.item.action === 'drink' ? 'Zdravie je plné alebo elixír nemožno použiť.' : 'Plášť použi mimo útočiska a počkaj na obnovenie.');
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
  $('item-tooltip').innerHTML = itemDescription(entry, true); $('item-tooltip').hidden = false; positionItemTooltip(event);
}

function positionItemTooltip(event) {
  const tooltip = $('item-tooltip'), width = window.innerWidth || W, height = window.innerHeight || H;
  const rect = tooltip.getBoundingClientRect();
  tooltip.style.left = Math.max(8, Math.min(event.clientX + 14, width - rect.width - 12)) + 'px';
  tooltip.style.top = Math.max(8, Math.min(event.clientY + 14, height - rect.height - 12)) + 'px';
}
