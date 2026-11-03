const GET = 'grindoria:fullscreen:get', SET = 'grindoria:fullscreen:set', CHANGE = 'grindoria:fullscreen:changed';

function installFullscreen(win, ipcMain) {
  let pending = null;
  const trusted = event => event.sender === win.webContents && event.senderFrame === win.webContents.mainFrame;
  const sendState = () => {
    const active = win.isFullScreen();
    if (!win.webContents.isDestroyed()) win.webContents.send(CHANGE, active);
    if (pending && active === pending.wanted) { clearTimeout(pending.timer); pending.resolve(active); pending = null; }
  };
  ipcMain.handle(GET, event => { if (!trusted(event)) throw new Error('Invalid sender'); return win.isFullScreen(); });
  ipcMain.handle(SET, (event, wanted) => {
    if (!trusted(event) || typeof wanted !== 'boolean') throw new Error('Invalid fullscreen request');
    if (pending) return Promise.reject(new Error('Fullscreen transition in progress'));
    if (win.isFullScreen() === wanted) return wanted;
    return new Promise((resolve, reject) => {
      pending = { wanted, resolve, reject, timer: setTimeout(() => { pending = null; reject(new Error('Fullscreen transition timed out')); }, 5000) };
      try { win.setFullScreen(wanted); } catch (error) { clearTimeout(pending.timer); pending = null; reject(error); }
    });
  });
  win.on('enter-full-screen', sendState); win.on('leave-full-screen', sendState);
  win.on('closed', () => {
    ipcMain.removeHandler(GET); ipcMain.removeHandler(SET);
    if (pending) { clearTimeout(pending.timer); pending.reject(new Error('Window closed')); pending = null; }
  });
}
module.exports = { installFullscreen };
