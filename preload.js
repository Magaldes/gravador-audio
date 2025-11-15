const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveAudio: (data) => ipcRenderer.invoke('save-audio', data),
  mergeAudio: (data) => ipcRenderer.invoke('merge-audio', data),
  listRecordings: () => ipcRenderer.invoke('list-recordings')
});
