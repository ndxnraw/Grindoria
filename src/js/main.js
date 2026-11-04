// Load persisted data only after all data registries and validators are available.
p=createPlayerState(loadPlayerSave()||{});
initializeCareer();
initializeInventory();
initializeFarming();
initializeLoot();
initializeCharacterAccount();
$('sound').textContent='Zvuk: '+(sound?'zapnutý':'vypnutý');
initializeFullscreen();initializeDesktopUpdates();
initializeCombatAssist();initializeGameWindows();
loadMap(p.mapId,true);
window.addEventListener('resize',resize);resize();

requestAnimationFrame(frame);
document.addEventListener('visibilitychange',()=>{keysClear();if(document.hidden)combatBlur();else combatAssist.focused=typeof document.hasFocus==='function'?document.hasFocus():true;save();});
window.addEventListener('focus',()=>{combatAssist.focused=true;combatAssist.timer=0;});
window.addEventListener('keydown',handleGameKeyDown);
window.addEventListener('keyup',e=>keys[e.key.length===1?e.key.toLowerCase():e.key]=false);

function handleGameKeyDown(e) {
  const key=e.key.length===1?e.key.toLowerCase():e.key;
  if(key==='F10'){e.preventDefault();if(!e.repeat)toggleGameFullscreen('F10');return;}
  if(key==='Enter'&&panelState.key==='inventory-drop'){e.preventDefault();if(!e.repeat)confirmPendingInventoryDrop();return;}
  if(key==='Escape'){
    e.preventDefault();keysClear();
    if(gameWindows.size){e.preventDefault();closeModal();return;}

    clearCombatTarget();stopCombatAssist();if(running)systemMenu();
    return;
  }
  // Text fields retain normal editing; focused game buttons never swallow Space.
  if(e.target&&(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)||e.target.isContentEditable))return;
  if(!running||paused)return;
  if(e.ctrlKey||e.metaKey||e.altKey&&key!=='Alt')return;
  if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(key))e.preventDefault();
  if(key==='Alt'){e.preventDefault();keys.Alt=true;return;}
  // Browser/OS shortcuts retain their meaning, and UI focus never starts an attack.
  const windows={c:['character',characterPanel],i:['inventory',inventory],m:['large-map',largeMapPanel],n:['journal',journal],h:['help',help],'?':['help',help],v:['spellbook',spellbook],p:['career:overview',()=>careerPanel('overview')],k:['auto-hunt',autoHuntPanel],Tab:['travel',travelMenu]};
  if(key==='Tab'&&e.shiftKey)return;
  if(windows[key]){e.preventDefault();if(!e.repeat)toggleGameWindow(...windows[key]);return;}
  if(key===' '&&e.target?.closest?.('.game-window')){e.preventDefault();return;}
  if(['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(key))clearCombatTarget();
  keys[key]=true;if(e.repeat)return;
  if(key==='y'){e.preventDefault();pickNearbyGroundDrops();return;}
  const quick=/^(?:Digit|Numpad)([1-8])$/.exec(e.code||'')||/^F([1-8])$/.exec(key),slot=quick?Number(quick[1]):/^[1-8]$/.test(key)?Number(key):0;
  if(slot){e.preventDefault();if(slot<=6)castSkill(slot-1);else if(slot===7)potion();else useBraveryCape();return;}
  if(key==='f')interactNPC();

}

canvas.addEventListener('pointermove',setCombatPointer);canvas.addEventListener('pointerleave',leaveCombatPointer);window.addEventListener('blur',combatBlur);
canvas.addEventListener('pointerdown',handleCombatClick);canvas.addEventListener('dblclick',handleCombatDoubleClick);
$('attack').onclick=()=>hotbarAction(()=>attack());$('skill').onclick=()=>hotbarAction(()=>castSkill(0));$('potion').onclick=()=>hotbarAction(potion);$('inventory').onclick=()=>toggleGameWindow('inventory',inventory);$('claim').onclick=claimTrackedQuest;
$('sound').onclick=()=>{sound=!sound;$('sound').textContent='Zvuk: '+(sound?'zapnutý':'vypnutý');beep(440);saveGlobalSettings();};document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();keys[b.dataset.key]=true;b.setPointerCapture(e.pointerId);});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys[b.dataset.key]=false);});window.addEventListener('pagehide',save);updateHUD();

$('journal').onclick=()=>toggleGameWindow('journal',journal);updateClassHUD();

for(let i=1;i<6;i++)$('skill'+(i+1)).onclick=()=>hotbarAction(()=>castSkill(i));$('travel').onclick=()=>toggleGameWindow('travel',travelMenu);$('spellbook').onclick=()=>toggleGameWindow('spellbook',spellbook);updateHUD();

$('help').onclick=help; // H also toggles this layer.

$('career').onclick=()=>toggleGameWindow('career:overview',()=>careerPanel('overview'));
$('character-status').onclick=()=>toggleGameWindow('character',characterPanel);$('auto-hunt').onclick=()=>toggleGameWindow('auto-hunt',autoHuntPanel);$('system-menu').onclick=()=>toggleGameWindow('system-menu',systemMenu);$('minimap-open').onclick=()=>toggleGameWindow('large-map',largeMapPanel);

$('bravery').onclick=()=>hotbarAction(useBraveryCape);

function startGame() { return playCharacter(); }
$('backup-characters').onclick=()=>{try{downloadCharacterJSON(exportCharacters());toast('Záloha všetkých postáv bola pripravená.');}catch(error){toast(error.message);}};
$('characters').onclick=returnToCharacters;$('character-menu').onclick=returnToCharacters;
renderCharacterScreen();
