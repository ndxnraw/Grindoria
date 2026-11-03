const fullscreenState = { active: false, native: false, busy: false };

function nativeFullscreenBridge() {
  const api = window.grindoriaDesktop?.fullscreen;
  return api && typeof api.get === 'function' && typeof api.set === 'function' && typeof api.onChange === 'function' ? api : null;
}

function syncFullscreen(active, native = false) {
  fullscreenState.active = Boolean(active); fullscreenState.native = native;
  document.body.classList.toggle('native-fullscreen', native && fullscreenState.active);
  const button = $('fullscreen');
  button.setAttribute('aria-pressed', String(fullscreenState.active));
  const label = fullscreenState.active ? 'Ukončiť celú obrazovku' : 'Celá obrazovka';
  button.setAttribute('aria-label', label); button.title = label + ' · F10';
  button.textContent = fullscreenState.active ? '⤡' : '⛶';
  keysClear(); clearLootPointer(); resize(); requestAnimationFrame(resize);
}

function syncBrowserFullscreen() { syncFullscreen(document.fullscreenElement === $('game-shell')); }

async function setGameFullscreen(wanted) {
  if (fullscreenState.busy) return false;
  fullscreenState.busy = true;
  try {
    const bridge = nativeFullscreenBridge();
    if (bridge) syncFullscreen(await bridge.set(Boolean(wanted)), true);
    else {
      if (wanted) {
        if (typeof $('game-shell').requestFullscreen !== 'function') throw new Error('Fullscreen nie je dostupný.');
        await $('game-shell').requestFullscreen();
      } else if (document.fullscreenElement) await document.exitFullscreen();
      syncBrowserFullscreen();
    }
    canvas.focus(); return fullscreenState.active === Boolean(wanted);
  } catch {
    toast('Celú obrazovku sa nepodarilo prepnúť. Skús tlačidlo ⛶ v minimape.'); return false;
  } finally { fullscreenState.busy = false; }
}

function toggleGameFullscreen() { return setGameFullscreen(!fullscreenState.active); }

function initializeFullscreen() {
  $('fullscreen').onclick = toggleGameFullscreen;
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
