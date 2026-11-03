initializeCareer();
initializeInventory();
initializeFarming();
initializeLoot();
loadMap(p.mapId,true);
window.addEventListener('resize',resize);resize();

requestAnimationFrame(frame);
document.addEventListener('visibilitychange',()=>{keysClear();save();});
window.addEventListener('keydown',e=>{if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();let key=e.key.length===1?e.key.toLowerCase():e.key;if(key==='Escape'){keysClear();if(!$('modal').hidden)closeModal();else clearCombatTarget();return;}if(!running||paused)return;if(e.target&&['BUTTON','INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)&&key===' ')return;keys[key]=true;if(e.repeat)return;if(key==='y'){e.preventDefault();pickNearbyGroundDrops();return;}if(spellKeys.includes(key))castSkill(spellKeys.indexOf(key));if(key==='b')useBraveryCape();if(key==='p')careerPanel();if(key==='k')spellbook();if(key==='m')travelMenu();if(key==='e')potion();if(key==='i')inventory();if(key==='f')shop();if(key==='j')journal();if(key==='c')combatManual();if(key==='?')help();});window.addEventListener('keyup',e=>keys[e.key.length===1?e.key.toLowerCase():e.key]=false);
canvas.addEventListener('pointermove',setCombatPointer);canvas.addEventListener('pointerleave',leaveCombatPointer);window.addEventListener('blur',combatBlur);
canvas.addEventListener('pointerdown',handleCombatClick);
$('start').onclick=startGame;$('attack').onclick=()=>attack();$('skill').onclick=()=>attack(true);$('potion').onclick=potion;$('inventory').onclick=()=>{if(running)inventory();};$('close').onclick=closeModal;$('claim').onclick=()=>{if(p.claimed||p.kills<5||p.stones<3)return;p.claimed=true;p.gold+=150;experience(60);toast('Údolie je zachránené!\n+150 zlata · +60 skúseností');updateHUD();save();};
$('sound').onclick=()=>{sound=!sound;$('sound').textContent='Zvuk: '+(sound?'zapnutý':'vypnutý');beep(440);};document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();keys[b.dataset.key]=true;b.setPointerCapture(e.pointerId);});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys[b.dataset.key]=false);});window.addEventListener('pagehide',save);updateHUD();

$('journal').onclick=journal;renderClasses();updateClassHUD();

for(let i=1;i<6;i++)$('skill'+(i+1)).onclick=()=>castSkill(i);$('travel').onclick=travelMenu;$('spellbook').onclick=spellbook;updateHUD();

$('help').onclick=help;

$('career').onclick=()=>careerPanel();

$('bravery').onclick=useBraveryCape;

function startGame() {
  if (pendingSaveImports.length) { openSaveImport(); return; }
  running=true; document.body.classList.add('started'); canvas.focus();
  p.hp=Math.min(p.hp,maxHP()); save();
  toast('Vitaj v Grindorii, '+role().name.toLowerCase()+'.');
}
