const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('grindoriaDesktop', {
  updates: {
    get:()=>ipcRenderer.invoke('grindoria:updates:get'),
    check:()=>ipcRenderer.invoke('grindoria:updates:check'),
    download:()=>ipcRenderer.invoke('grindoria:updates:download'),
    install:()=>ipcRenderer.invoke('grindoria:updates:install'),
    onChange:callback=>{if(typeof callback!=='function')throw new TypeError('Expected callback');const listener=(_event,state)=>callback(state);ipcRenderer.on('grindoria:updates:changed',listener);return()=>ipcRenderer.removeListener('grindoria:updates:changed',listener);}
  },
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
