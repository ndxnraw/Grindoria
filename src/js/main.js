initializeCareer();
initializeInventory();
initializeFarming();
initializeLoot();
initializeCharacterAccount();
$('sound').textContent='Zvuk: '+(sound?'zapnutý':'vypnutý');
initializeFullscreen();
initializeCombatAssist();
loadMap(p.mapId,true);
window.addEventListener('resize',resize);resize();

requestAnimationFrame(frame);
document.addEventListener('visibilitychange',()=>{keysClear();if(document.hidden)combatBlur();else combatAssist.focused=typeof document.hasFocus==='function'?document.hasFocus():true;save();});
window.addEventListener('focus',()=>{combatAssist.focused=true;combatAssist.timer=0;});
window.addEventListener('keydown',handleGameKeyDown);
window.addEventListener('keyup',e=>keys[e.key.length===1?e.key.toLowerCase():e.key]=false);

function handleGameKeyDown(e) {
  const key=e.key.length===1?e.key.toLowerCase():e.key;
  if(key==='F10'){e.preventDefault();if(!e.repeat)toggleGameFullscreen();return;}
  if(key==='Escape'){
    keysClear();
    if(fullscreenState.native&&fullscreenState.active){clearCombatTarget();stopCombatAssist();e.preventDefault();setGameFullscreen(false);return;}
    if(!$('modal').hidden)closeModal();else{clearCombatTarget();stopCombatAssist();}
    return;
  }
  // Text fields retain normal editing; focused game buttons never swallow Space.
  if(e.target&&(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)||e.target.isContentEditable))return;
  if(!running||paused)return;
  if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(key))e.preventDefault();
  keys[key]=true;if(e.repeat)return;
  if(key==='y'){e.preventDefault();pickNearbyGroundDrops();return;}
  if(spellKeys.includes(key))castSkill(spellKeys.indexOf(key));
  if(key==='b')useBraveryCape();if(key==='p')careerPanel();if(key==='k')spellbook();if(key==='m')travelMenu();
  if(key==='e')potion();if(key==='i')inventory();if(key==='f')shop();if(key==='j')journal();if(key==='c')combatManual();if(key==='?')help();
}

canvas.addEventListener('pointermove',setCombatPointer);canvas.addEventListener('pointerleave',leaveCombatPointer);window.addEventListener('blur',combatBlur);
canvas.addEventListener('pointerdown',handleCombatClick);canvas.addEventListener('dblclick',handleCombatDoubleClick);
$('attack').onclick=()=>hotbarAction(()=>attack());$('skill').onclick=()=>hotbarAction(()=>castSkill(0));$('potion').onclick=()=>hotbarAction(potion);$('inventory').onclick=()=>hotbarAction(inventory);$('close').onclick=closeModal;$('claim').onclick=()=>{if(p.claimed||p.kills<5||p.stones<3)return;p.claimed=true;p.gold+=150;experience(60);toast('Úloha dokončená.\n+150 zlata · +60 skúseností');updateHUD();save();};
$('sound').onclick=()=>{sound=!sound;$('sound').textContent='Zvuk: '+(sound?'zapnutý':'vypnutý');beep(440);saveGlobalSettings();};document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();keys[b.dataset.key]=true;b.setPointerCapture(e.pointerId);});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys[b.dataset.key]=false);});window.addEventListener('pagehide',save);updateHUD();

$('journal').onclick=journal;updateClassHUD();

for(let i=1;i<6;i++)$('skill'+(i+1)).onclick=()=>hotbarAction(()=>castSkill(i));$('travel').onclick=travelMenu;$('spellbook').onclick=spellbook;updateHUD();

$('help').onclick=help;

$('career').onclick=()=>careerPanel();

$('bravery').onclick=()=>hotbarAction(useBraveryCape);

function startGame() { return playCharacter(); }
$('backup-characters').onclick=()=>{try{downloadCharacterJSON(exportCharacters());toast('Záloha všetkých postáv bola pripravená.');}catch(error){toast(error.message);}};
$('characters').onclick=returnToCharacters;$('character-menu').onclick=returnToCharacters;
renderCharacterScreen();

$('modal').addEventListener('click',event=>{if(event.target===$('modal')&&(event.button===undefined||event.button===0)){event.preventDefault();event.stopPropagation();closeModal();}});
