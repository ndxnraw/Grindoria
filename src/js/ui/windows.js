// All game panels share one in-page layer. Interact.js owns pointer dragging.
const gameWindows=new Map();
let windowSerial=0,windowOrder=20,windowRefreshTime=0,refreshingGameWindows=false,windowPointerHeld=false;
const windowLayout={};
function panelQueryAll(selector){return (activeGameWindow?.content||document).querySelectorAll(selector);}
function withGameWindow(key,action){
  const entry=gameWindows.get(key);if(!entry)return;
  const previous=activeGameWindow;
  activeGameWindow=entry;panelState.key=key;
  try{return action(entry);}finally{activeGameWindow=activeGameWindow&&activeGameWindow!==entry&&gameWindows.has(activeGameWindow.key)?activeGameWindow:previous&&gameWindows.has(previous.key)?previous:activeGameWindow&&gameWindows.has(activeGameWindow.key)?activeGameWindow:null;panelState.key=activeGameWindow?.key||null;}
}
function frontGameWindow(entry,focus=false){
  activeGameWindow=entry;panelState.key=entry.key;
  entry.node.style.zIndex=String(++windowOrder);
  if(windowOrder>900){[...gameWindows.values()].sort((a,b)=>Number(a.node.style.zIndex)-Number(b.node.style.zIndex)).forEach((w,i)=>w.node.style.zIndex=String(20+i));windowOrder=20+gameWindows.size;}
  if(focus)focusWindowClose(entry);
}
function focusWindowClose(entry) {
  const control = running && movementKeys.some(key => keys[key]) ? canvas : entry.close;
  control.focus({preventScroll:true});
}
function windowBounds(){const r=$('game-shell').getBoundingClientRect();return {width:r.width||W,height:r.height||H};}
function clampGameWindow(entry){
  const bounds=windowBounds(),rect=entry.node.getBoundingClientRect();
  if(entry.key==='market-sale'){
    entry.node.style.maxHeight=Math.max(70,bounds.height-16)+'px';const popup=entry.node.getBoundingClientRect();entry.x=Math.max(0,(bounds.width-popup.width)/2);entry.y=Math.max(0,(bounds.height-popup.height)/2);entry.node.style.left=entry.x+'px';entry.node.style.top=entry.y+'px';return;
  }
  const inventory=entry.key==='inventory'&&!entry.minimized,market=entry.key.startsWith('market:')&&!entry.minimized;
  let reserve=bounds.width<=700?154:110;
  if(inventory||market){
    const hotbar=document.querySelector('.hotbar')?.getBoundingClientRect(),shell=$('game-shell').getBoundingClientRect();
    if(Number.isFinite(hotbar?.top))reserve=Math.min(reserve,Math.max(72,bounds.height-hotbar.top+(shell.top||0)+8));
    // The viewport determines inventory size; dragging only changes its position.
    entry.node.style.maxHeight=Math.max(70,bounds.height-reserve-(bounds.height<400?0:16))+'px';
    if(inventory)fitInventoryLayout(entry);else fitMarketLayout(entry);
    const fitted=entry.node.getBoundingClientRect();
    entry.x=Math.max(0,Math.min(entry.x,Math.max(0,bounds.width-fitted.width)));
    entry.y=Math.max(0,Math.min(entry.y,Math.max(0,bounds.height-reserve-fitted.height)));
  }else{
    entry.x=Math.max(0,Math.min(entry.x,Math.max(0,bounds.width-rect.width)));
    entry.y=Math.max(0,Math.min(entry.y,Math.max(0,bounds.height-reserve-76)));
    entry.node.style.maxHeight=Math.max(70,bounds.height-entry.y-reserve)+'px';
  }
  entry.node.style.left=entry.x+'px';entry.node.style.top=entry.y+'px';
}
function saveWindowLayout(){
  for(const w of gameWindows.values())windowLayout[w.key]={x:w.x,y:w.y};
  try{localStorage.setItem('grindoria-ui-windows-v1',JSON.stringify(windowLayout));}catch{}
}
function minimizeGameWindow(entry){
  entry.minimized=!entry.minimized;entry.body.hidden=entry.minimized;
  entry.node.classList.toggle('is-minimized',entry.minimized);
  entry.minimize.setAttribute('aria-expanded',String(!entry.minimized));
  entry.minimize.setAttribute('aria-label',entry.minimized?'Obnoviť '+entry.title:'Minimalizovať '+entry.title);
  entry.minimize.textContent=entry.minimized?'□':'−';clampGameWindow(entry);frontGameWindow(entry);
}
function createGameWindow(key,title){
  const node=document.createElement('section'),serial='window-'+(++windowSerial);
  node.className='game-window modal-card';node.dataset.windowKey=key;
  node.setAttribute('role','dialog');node.setAttribute('aria-modal','false');node.setAttribute('aria-labelledby',serial+'-title');
  node.innerHTML='<div class="window-titlebar"><span class="window-gem" aria-hidden="true">◆</span><h2 id="'+serial+'-title"></h2><button class="window-minimize" type="button" aria-expanded="true">−</button><button class="window-close" type="button">×</button></div><div class="window-body"><div class="window-content"></div></div>';
  const entry={key,title,node,serial,body:node.querySelector('.window-body'),content:node.querySelector('.window-content'),close:node.querySelector('.window-close'),minimize:node.querySelector('.window-minimize'),minimized:false,x:0,y:0,refresh:null};
  entry.body.hidden=false;node.querySelector('.window-titlebar h2').textContent=title;
  entry.close.setAttribute('aria-label','Zavrieť '+title);entry.minimize.setAttribute('aria-label','Minimalizovať '+title);
  entry.close.onclick=()=>closeModal(key);entry.minimize.onclick=()=>minimizeGameWindow(entry);
  node.addEventListener('pointerdown',()=>{frontGameWindow(entry);windowPointerHeld=true;},true);
  for(const type of ['click','change','drop','dragstart'])node.addEventListener(type,()=>frontGameWindow(entry),true);
  node.addEventListener('focusin', event => {
    if(activeGameWindow!==entry)frontGameWindow(entry);
    if(isTextControl(event.target))keysClear();
  });
  node.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.classList?.contains('window-titlebar')){minimizeGameWindow(entry);event.preventDefault();}});
  const titlebar=node.querySelector('.window-titlebar');titlebar.tabIndex=0;titlebar.setAttribute('aria-label',title+' · šípky presúvajú okno, Enter minimalizuje');
  titlebar.addEventListener('keydown',event=>{const delta={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]}[event.key];if(!delta||event.target!==titlebar)return;event.preventDefault();event.stopPropagation();entry.x+=delta[0];entry.y+=delta[1];clampGameWindow(entry);saveWindowLayout();});
  $('modal').appendChild(node);gameWindows.set(key,entry);
  const bounds=windowBounds(),saved=windowLayout[key],offset=(gameWindows.size-1)%7*26;
  entry.x=Number.isFinite(saved?.x)?saved.x:key==='inventory'?bounds.width-230:key==='character'?20:Math.max(24,bounds.width*.28)+offset;
  entry.y=Number.isFinite(saved?.y)?saved.y:115+offset;
  // Interact.js ships locally and is bundled into both offline HTML builds.
  entry.drag=interact(node).draggable({allowFrom:'.window-titlebar',ignoreFrom:'button',inertia:false,listeners:{start(){frontGameWindow(entry);},move(event){entry.x+=event.dx;entry.y+=event.dy;clampGameWindow(entry);},end(){saveWindowLayout();}}});
  return entry;
}
function namespaceWindowContent(entry){
  const map=new Map();
  entry.content.querySelectorAll('[id]').forEach(el=>{const id=el.id;map.set(id,entry.serial+'-'+id);el.dataset.uiId=id;el.id=entry.serial+'-'+id;});
  entry.content.querySelectorAll('[for], [aria-controls], [aria-labelledby], [aria-describedby]').forEach(el=>{for(const attr of ['for','aria-controls','aria-labelledby','aria-describedby']){const value=el.getAttribute(attr);if(value)el.setAttribute(attr,value.split(' ').map(id=>map.get(id)||id).join(' '));}});
}
function modal(html,options={}){
  const title=options.title||(html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1]||'Informácie').replace(/<[^>]*>/g,'');
  const key=options.key||'info:'+title;
  let entry=gameWindows.get(key);const same=!!entry;
  if(!entry)entry=createGameWindow(key,title);
  const expanded=[...entry.content.querySelectorAll('details')].map(el=>el.open);
  const feedback=refreshingGameWindows?['inventory-message','smith-message','character-message','skill-message','biology-message'].map(id=>[id,entry.content.querySelector('[data-ui-id="'+id+'"]')?.textContent]):[];
  const scroll=entry.body.scrollTop||0,focus=same&&entry.node.contains(document.activeElement)?modalFocusToken():null;
  activeGameWindow=entry;panelState.key=key;
  entry.refresh=options.refresh||entry.refresh;
  entry.content.innerHTML=html;namespaceWindowContent(entry);
  entry.content.querySelectorAll('details').forEach((el,i)=>{if(expanded[i]!==undefined)el.open=expanded[i];});
  for(const [id,value]of feedback)if(value&&$(id))$(id).textContent=value;
  entry.body.scrollTop=scroll;$('modal').hidden=false;
  $('intro').inert=true;if(!refreshingGameWindows)clearLootPointer();
  // Game windows never pause the world or make neighboring layers inert.
  paused=false;if(!running)setCharacterScreenMode(true);
  if(!refreshingGameWindows){if(entry.minimized)minimizeGameWindow(entry);frontGameWindow(entry,!same);}
  if(focus)restoreModalFocus(focus);
  entry.body.scrollTop=scroll;clampGameWindow(entry);updateHotbarState();
  return entry;
}
function closeModal(key=activeGameWindow?.key){
  const entry=gameWindows.get(key);if(!entry)return;
  if(key==='inventory'&&gameWindows.has('inventory-drop'))closeModal('inventory-drop');
  if(marketSalePending&&(key==='inventory'||key==='market:'+marketSalePending.trader))closeModal('market-sale');
  if(key==='market-sale'){marketSalePending=null;finishInventoryItemDrag();}
  if(key==='inventory-drop'){
    inventoryDropPending=null;finishInventoryItemDrag();
  }
  entry.drag?.unset();entry.node.remove();gameWindows.delete(key);
  if(key==='inventory'){inventoryDropPending=null;finishInventoryItemDrag();}
  const top=[...gameWindows.values()].sort((a,b)=>Number(b.node.style.zIndex)-Number(a.node.style.zIndex))[0];
  activeGameWindow=top||null;panelState.key=top?.key||null;
  $('modal').hidden=!gameWindows.size;paused=false;updateHotbarState();
  if(top)focusWindowClose(top);else{$('intro').inert=false;setCharacterScreenMode(!running);if(running)canvas.focus({preventScroll:true});else $('create-character').focus({preventScroll:true});}
}
function closeAllGameWindows(){for(const key of [...gameWindows.keys()])closeModal(key);}
function toggleGameWindow(key,open){const entry=gameWindows.get(key);if(!entry)return open();if(entry.minimized){minimizeGameWindow(entry);frontGameWindow(entry,true);}else closeModal(key);}
function refreshOpenGameWindows(dt){
  windowRefreshTime+=dt;if(windowRefreshTime<1||!gameWindows.size||inventoryDrag)return;windowRefreshTime=0;
  const focused=document.activeElement;
  // Do not replace a form while a player is editing it or holding a pointer.
  if(windowPointerHeld||focused&&(['INPUT','SELECT','TEXTAREA'].includes(focused.tagName)||focused.isContentEditable))return;
  const previous=activeGameWindow;refreshingGameWindows=true;
  try{for(const entry of [...gameWindows.values()])if(entry.refresh&&!entry.minimized)withGameWindow(entry.key,entry.refresh);}finally{refreshingGameWindows=false;activeGameWindow=previous&&gameWindows.has(previous.key)?previous:activeGameWindow;panelState.key=activeGameWindow?.key||null;}
}
function initializeGameWindows(){
  window.addEventListener('pointerup',()=>windowPointerHeld=false);window.addEventListener('pointercancel',()=>windowPointerHeld=false);window.addEventListener('blur',()=>windowPointerHeld=false);
  for(const [id,icon,key,label]of [['career','◇','P','Progresia'],['spellbook','✧','V','Schopnosti'],['journal','▤','N','Úlohy'],['help','?','H','Pomoc']]){const button=$(id);button.title=label+(key?' · '+key:'');button.setAttribute('aria-label',button.title);button.innerHTML='<span>'+icon+'</span><kbd>'+key+'</kbd>';$('game-toolbar').appendChild(button);}
  const travel=$('travel');travel.className='minimap-travel';travel.innerHTML='↗';travel.title='Cestovanie';travel.setAttribute('aria-label','Cestovanie');document.querySelector('.hud.map').appendChild(travel);
  try{const saved=JSON.parse(localStorage.getItem('grindoria-ui-windows-v1')||'{}');if(saved&&typeof saved==='object')for(const [key,value]of Object.entries(saved))if(!['__proto__','constructor','prototype'].includes(key)&&Number.isFinite(value?.x)&&Number.isFinite(value?.y))windowLayout[key]={x:value.x,y:value.y};}catch{}
  window.addEventListener('resize',()=>{for(const entry of gameWindows.values())clampGameWindow(entry);});
  $('game-shell').addEventListener('dragover',event=>{if(inventoryDrag&&!gameWindows.get('inventory')?.node.contains(event.target))event.preventDefault();});
  $('game-shell').addEventListener('drop',event=>{if(inventoryDrag&&!gameWindows.get('inventory')?.node.contains(event.target))withGameWindow('inventory',()=>handleInventoryOutsideDrop(event));});
}
