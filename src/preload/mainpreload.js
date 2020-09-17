const {ipcRenderer,contextBridge}=require('electron');
const showToast = require("show-toast");
contextBridge.exposeInMainWorld('get',{
  ipcRenderer:ipcRenderer,
  showToast:showToast,
  
})