const electron = require('electron');
const XLSX=require('xlsx');
const {app, BrowserWindow, Menu, ipcMain, Tray,nativeImage,dialog} = electron;
const path = require('path');
const url = require('url');
const fs = require('fs-extra');
const nodemailer = require("nodemailer");
const { CANCELLED } = require('dns');
require('dotenv').config();
//mail config
let transporter =  nodemailer.createTransport({ 
  host:"smtp.gmail.com",
  port: 587,
  service: 'gmail',
  auth: {
      user:process.env.USER_MAIL,
      pass:process.env.PASSWORD_MAIL
  }
});
//init
let mailframe;
let frame1;
let tray;
let exportexcel;
let readpath=path.join(__dirname,'./data.json');
//read data from json file
let data=fs.readJSONSync(readpath);
//save data
const saveFile = (data) => {
  let writepath=path.join(__dirname,'/data.json');
  return fs.writeJSONSync(writepath, data);
}
const findindexOfitem = id => {
  let result = null;
  for (var i = 0; i < data.length; i++) {
    if (data[i].id === id) {
      result = i
    }
  }
  return result;
}
app.on('ready', () => {
 const iconPath = path.join(__dirname,'/src/img/tray.ico');
 const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon);
  frame1 = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation:true,
      preload:path.join(__dirname,'/src/preload/mainpreload.js')
    },
    minWidth: 700,
    maxWidth: 700,
    width: 700,
    height: 1000,
    icon: path.join(__dirname, "./src/img/icon.png")
  });

  frame1.loadURL(url.format({
    pathname: path.join(__dirname, '/src/mainwindow/index.html'),
    protocol: 'file',
    slashes: true
  }));
  const TrayMenu = Menu.buildFromTemplate(trayMenu);
  tray.setContextMenu(TrayMenu);
});

//handle create mailframe window
const openMailWindow = () => {
  mailframe = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation:true,
      preload: path.join(__dirname, '/src/preload/mainpreload.js')
    },
    width: 600,
    maxWidth: 600,
    minWidth: 600,
    maxHeight: 710,
    minHeight: 710,
    height: 710,
    show: false,
    parent: frame1,
    // hidden the parrent modal when clicking
    modal: true,
    icon: path.join(__dirname, '/src/img/email.png')

  });

  mailframe.loadURL(url.format({
    pathname: path.join(__dirname, '/src/mailwindow/Mail.html'),
    protocol: 'file',
    slashes: true
  }));
  mailframe.once('ready-to-show', () => {
    mailframe.show();
  })
}
const openexportWindow=()=>{
  exportexcel=new BrowserWindow({
    webPreferences:{
      nodeIntegration: false,
      contextIsolation:true,
      preload: path.join(__dirname, '/src/preload/mainpreload.js')
    },
    minHeight:500,
    minWidth:500,
    icon: path.join(__dirname, '/src/img/export.png'),
    show: false,
    modal: true,
    parent:frame1,


  });
  exportexcel.loadURL(url.format({
    pathname: path.join(__dirname, '/src/excellwindow/index.html'),
    protocol: 'file',
    slashes: true
  }));
  exportexcel.once("ready-to-show", () => {
   exportexcel.show();
});
  
}
//ipcmain
ipcMain.handle("data", () => {
  return data;
});
ipcMain.handle('adddata', (e, item) => {
  data.unshift(item);
  saveFile(data);
  return data;
});
ipcMain.handle('deleteitem', (e, id) => {
  data = data.filter(item => item.id !== id);
  saveFile(data);
  return data;
});
ipcMain.handle('completeitem', (e, id) => {
  let index = findindexOfitem(id);
  data = [
    ...data.slice(0, index), {
      ...data[index],
      status: 2
    },
    ...data.slice(index + 1)
  ];
  saveFile(data);
  return data
})
ipcMain.handle('doingitem', (e, id) => {
  let index = findindexOfitem(id);
  data = [
    ...data.slice(0, index), {
      ...data[index],
      status: 1
    },
    ...data.slice(index + 1)
  ];
  saveFile(data);
  return data;

})
ipcMain.handle('resetitem', () => {
  data.map(item => item.status = 0);
  saveFile(data);
  return data;
});
ipcMain.handle('sentmail', () => {
 return  openMailWindow();
});
ipcMain.handle('excelexport',()=>{
  if(data.length>0){
    openexportWindow();
    return true
  }
  else{
  return false;
  }
})
ipcMain.handle('mailing',async(e,mainOptions)=>{
  try{

    await transporter.sendMail(mainOptions);
    return true;
  }
  catch(err){
    console.log(err);
    return false;
  }
});
ipcMain.handle('opendialog',async(event,workbook)=>{
  
 try{
  const res= await dialog.showSaveDialog({filters:[
    { name: 'file', extensions: ['csv'] }
  ]});
  const {filePath,canceled}=res;
 if(filePath!==undefined){
  XLSX.writeFile(workbook,filePath);
 }
 if(canceled===true){
   return false;
 }

 
 return true;
 }
 catch(err)
{
 return false;
}})

//menu
const trayMenu = [
  {
    label: 'Sent Mail',
    click() {
      openMailWindow();
    }
  }, {
    label: 'Quit',
    click() {
      app.quit();
    }
  }
]
const createMenu=()=>{
  const menuTemplate = [
    {
      label: 'Manage  ',
  
      submenu: [
        {
          label: "Quit",
          //phim tat
          accelerator: process.platform == 'darwin'
            ? 'Command+Q'
            : 'Ctrl+Q', //with mac os ==> command q
          click() {
            app.quit();
          }
        }
      ]
    }, {
      label: 'Send mail(Ctrl+S)',
      accelerator: process.platform == 'darwin'
        ? 'Command+S'
        : 'Ctrl+S',
      click() {
        openMailWindow();
      }
    }
  
  ];
  // product env==> have developertools
  if (process.env.NODE_ENV !== 'production') {
    menuTemplate.push({
      label: 'Developer Tools',
      submenu: [
        {
          label: 'Open Developer Tools',
          accelerator: process.platform == "darwin"
            ? 'Command+f12'
            : 'f12',
          click(item, focusWindow) {
            focusWindow.toggleDevTools();
          }
        }, {
          role: 'reload'
        }
      ]
    })
  }
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
}
createMenu();
