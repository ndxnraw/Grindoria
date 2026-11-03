let inventoryDropPending=null;
function requestInventoryDrop(id){
  const entry=inventoryEntry(id);
  if(!running||p.hp<=0||!entry||entry.kind==='equipped')return false;
  inventoryDropPending={id,characterId:characterStore.activeId,mapId:p.mapId};
  inventorySelection=id;inventoryDrag=null;inventory();
  $('inv-drop-cancel').focus({preventScroll:true});return true;
}
function confirmInventoryDrop(count=1){
  const pending=inventoryDropPending,entry=pending&&inventoryEntry(pending.id);
  if(!entry||!running||p.hp<=0||pending.characterId!==characterStore.activeId||pending.mapId!==p.mapId||!Number.isSafeInteger(count)||count<1||drops.length>=5000)return false;
  if(entry.kind==='equipped'||entry.kind==='gear'&&count!==1||entry.kind==='supply'&&count>entry.item.count)return false;
  const payload=entry.kind==='gear'?{kind:'gear',item:copyCharacterData(entry.item)}:{kind:'supply',supplyId:entry.id,count};
  if(entry.kind==='gear')p.bag.splice(p.bag.findIndex(item=>item.uid===entry.item.uid),1);
  else if(!consumeSupply(entry.id,count))return false;
  spawnGroundDrop({...payload,manualPickup:true},p);
  inventoryDropPending=null;inventorySelection=null;finishInventoryChange();return true;
}
function handleInventoryOutsideDrop(event){
  if(!inventoryDrag)return false;
  const rect=$('modalcard').getBoundingClientRect();
  if(event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom)return false;
  event.preventDefault();event.stopPropagation?.();
  const id=inventoryDrag.id;inventoryDrag=null;
  if(!requestInventoryDrop(id)){inventoryMessage('Nasadený predmet najprv zlož do batohu.');return false;}return true;
}
function inventoryDropConfirmation(){
  const entry=inventoryDropPending&&inventoryEntry(inventoryDropPending.id);if(!entry)return '';
  return `<section class="discard-confirm" role="alertdialog" aria-label="Potvrdenie vyhodenia"><h3>Vyhodiť ${escapeHTML(entry.item.name)}?</h3><p>Predmet zostane pri postave. Zdvihneš ho kliknutím alebo Y. Po ${groundDropLifetime(entry.kind==='gear'?{kind:'gear',item:entry.item}:{kind:'supply'})/60} minútach zmizne.</p>${entry.kind==='supply'?'<label>Počet kusov <input id="inv-drop-count" type="number" min="1" max="'+entry.item.count+'" value="1" step="1"></label>':''}<div class="ui-actions"><button id="inv-drop-cancel">Zrušiť</button><button id="inv-drop-confirm" class="danger">Potvrdiť vyhodenie</button></div><p id="inv-drop-error" role="status"></p></section>`;
}
