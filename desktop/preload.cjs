const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('grindoriaDesktop', {
  fullscreen: {
    get: () => ipcRenderer.invoke('grindoria:fullscreen:get'),
    set: value => { if (typeof value !== 'boolean') return Promise.reject(new TypeError('Expected boolean')); return ipcRenderer.invoke('grindoria:fullscreen:set', value); },
    onChange: callback => {
      if (typeof callback !== 'function') throw new TypeError('Expected callback');
      const listener = (_event, active) => callback(Boolean(active));
      ipcRenderer.on('grindoria:fullscreen:changed', listener);
      return () => ipcRenderer.removeListener('grindoria:fullscreen:changed', listener);
    }
  }
});
