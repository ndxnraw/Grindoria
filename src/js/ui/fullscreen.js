let fullscreenLockRequest=0;
const fullscreenState = { active: false, native: false, busy: false, keyboardLocked: false };

function nativeFullscreenBridge() {
  const api = window.grindoriaDesktop?.fullscreen;
  return api && typeof api.get === 'function' && typeof api.set === 'function' && typeof api.onChange === 'function' ? api : null;
}

function syncFullscreen(active, native = false) {
  fullscreenState.active = Boolean(active); fullscreenState.native = native;
  document.body.classList.toggle('native-fullscreen', native && fullscreenState.active);
  const button = $('fullscreen');
  button.setAttribute('aria-pressed', String(fullscreenState.active));
  const label = fullscreenState.active ? 'Celá obrazovka · ukončiť klávesom F10' : 'Celá obrazovka';
  button.setAttribute('aria-label', label); button.title = label + ' · F10';
  button.textContent = fullscreenState.active ? '⤡' : '⛶';
  keysClear(); clearLootPointer(); resize(); requestAnimationFrame(resize);
}

function syncBrowserFullscreen(){const active=document.fullscreenElement===$('game-shell');if(!active)releaseFullscreenKeys();syncFullscreen(active);}
function releaseFullscreenKeys(){fullscreenLockRequest++;if(typeof navigator!=='undefined')navigator.keyboard?.unlock?.();fullscreenState.keyboardLocked=false;}
async function lockFullscreenKeys(){const request=++fullscreenLockRequest;try{if(typeof navigator==='undefined'||!navigator.keyboard?.lock)return false;await navigator.keyboard.lock(['Escape']);if(request!==fullscreenLockRequest||!fullscreenState.active)return false;fullscreenState.keyboardLocked=true;return true;}catch{return false;}}

async function setGameFullscreen(wanted) {
  if (fullscreenState.busy) return false;
  fullscreenState.busy = true;
  try {
    const bridge = nativeFullscreenBridge();
    if (bridge) syncFullscreen(await bridge.set(Boolean(wanted)), true);
    else {
      if (wanted) {
        if (typeof $('game-shell').requestFullscreen !== 'function') throw new Error('Fullscreen nie je dostupný.');
        await $('game-shell').requestFullscreen({navigationUI:'hide'});void lockFullscreenKeys();
      } else if (document.fullscreenElement){releaseFullscreenKeys();await document.exitFullscreen();}
      syncBrowserFullscreen();
    }
    canvas.focus(); return fullscreenState.active === Boolean(wanted);
  } catch {
    toast('Celú obrazovku sa nepodarilo prepnúť. Skús tlačidlo ⛶ v minimape.'); return false;
  } finally { fullscreenState.busy = false; }
}

function toggleGameFullscreen(source='button'){if(fullscreenState.active&&source!=='F10'){toast('Celú obrazovku ukončíš klávesom F10.');return Promise.resolve(false);}return setGameFullscreen(!fullscreenState.active);}

function initializeFullscreen() {
  $('fullscreen').onclick=()=>toggleGameFullscreen();
  const bridge = nativeFullscreenBridge();
  if (bridge) {
    fullscreenState.native = true;
    let notified = false;
    bridge.onChange(active => { notified = true; syncFullscreen(active, true); });
    Promise.resolve(bridge.get()).then(active => { if (!notified) syncFullscreen(active, true); }).catch(() => {});
  } else {
    document.addEventListener('fullscreenchange', syncBrowserFullscreen);
    document.addEventListener('fullscreenerror', () => toast('Prehliadač nepovolil celú obrazovku.'));
    syncBrowserFullscreen();
  }
}
