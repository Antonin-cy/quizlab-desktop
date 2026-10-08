'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('quizlabDesktop',{
 load:()=>ipcRenderer.invoke('quizlab:load'),
 save:data=>ipcRenderer.invoke('quizlab:save',data),
 openFolder:()=>ipcRenderer.invoke('quizlab:folder'),
 checkUpdates:()=>ipcRenderer.invoke('quizlab:update-check'),
 updateStatus:()=>ipcRenderer.invoke('quizlab:update-status'),
 installUpdate:()=>ipcRenderer.invoke('quizlab:update-install'),
 onUpdateStatus:fn=>{const handler=(_event,status)=>fn(status);ipcRenderer.on('quizlab:update-status',handler);return ()=>ipcRenderer.removeListener('quizlab:update-status',handler)}
});
