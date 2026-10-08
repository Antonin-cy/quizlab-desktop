
'use strict';
const {app, BrowserWindow, ipcMain, shell, dialog} = require('electron');
const {autoUpdater} = require('electron-updater');
const path = require('path');
const fs = require('fs');
const {pathToFileURL} = require('url');
let win;
let updateStatus={state:'idle',message:'Mises à jour non vérifiées'};
const setStatus=(state,message,extra={})=>{updateStatus={state,message,...extra};if(win&&!win.isDestroyed())win.webContents.send('quizlab:update-status',updateStatus);};
function dbPath(){return path.join(app.getPath('userData'),'quizlab-data.json');}
function readDB(){try{return JSON.parse(fs.readFileSync(dbPath(),'utf8'));}catch{return {quizzes:[],base:''};}}
function writeDB(data){
 if(!data||!Array.isArray(data.quizzes)||data.quizzes.length>500)throw Error('Données invalides');
 const json=JSON.stringify({quizzes:data.quizzes,base:String(data.base||'')});
 if(Buffer.byteLength(json)>20*1024*1024)throw Error('Sauvegarde trop volumineuse');
 const dest=dbPath(),tmp=dest+'.tmp';
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(tmp,json,{mode:0o600});fs.renameSync(tmp,dest);
 return true;
}
function configured(){return !String(require('./package.json').build.publish[0].owner).startsWith('CHANGE_ME');}
function checkUpdates(){
 if(!app.isPackaged){setStatus('development','Vérification disponible uniquement dans la version installée');return;}
 if(!configured()){setStatus('unconfigured','Configure le dépôt GitHub des mises à jour avant de publier');return;}
 setStatus('checking','Recherche de mises à jour…');
 autoUpdater.checkForUpdates().catch(e=>setStatus('error','Échec de la vérification : '+e.message));
}
function setupUpdater(){
 autoUpdater.autoDownload=true;
 autoUpdater.autoInstallOnAppQuit=true;
 autoUpdater.on('checking-for-update',()=>setStatus('checking','Recherche de mises à jour…'));
 autoUpdater.on('update-available',info=>setStatus('downloading','Téléchargement de QuizLab '+info.version+'…',{version:info.version}));
 autoUpdater.on('update-not-available',()=>setStatus('current','QuizLab est à jour'));
 autoUpdater.on('download-progress',p=>setStatus('downloading','Téléchargement : '+Math.round(p.percent)+' %',{percent:Math.round(p.percent)}));
 autoUpdater.on('update-downloaded',info=>setStatus('ready','Mise à jour '+info.version+' prête à installer. Clique sur « Redémarrer ».',{version:info.version}));
 autoUpdater.on('error',e=>setStatus('error','Mise à jour indisponible : '+e.message));
}
app.whenReady().then(()=>{
 ipcMain.handle('quizlab:load',()=>readDB());
 ipcMain.handle('quizlab:save',(_event,data)=>writeDB(data));
 ipcMain.handle('quizlab:folder',async()=>shell.openPath(app.getPath('userData')));
 ipcMain.handle('quizlab:update-check',()=>{checkUpdates();return updateStatus;});
 ipcMain.handle('quizlab:update-status',()=>updateStatus);
 ipcMain.handle('quizlab:update-install',()=>{if(updateStatus.state!=='ready')return false;setImmediate(()=>autoUpdater.quitAndInstall(false,true));return true;});
 win=new BrowserWindow({width:1120,height:850,minWidth:750,minHeight:550,autoHideMenuBar:true,icon:path.join(__dirname,'assets','quizlab.png'),webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 win.webContents.setWindowOpenHandler(({url})=>{if(/^https:\/\//i.test(url))shell.openExternal(url);return {action:'deny'};});
 win.webContents.on('will-navigate',(event,url)=>{if(url!==pathToFileURL(path.join(__dirname,'app','index.html')).toString())event.preventDefault();});
 win.loadFile(path.join(__dirname,'app','index.html'));
 setupUpdater();
 if(app.isPackaged)setTimeout(checkUpdates,4500);
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)app.relaunch();});
