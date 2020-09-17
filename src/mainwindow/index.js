let {ipcRenderer}=window.get;

const setWithOfProgressbar=(className,number)=>{
document.querySelector(`#${className}`).style.width=`${number}%`
}
const getpercentage=(number,total)=>{
  let result=null;
  result= number/total*100;
  return result;
}
//handle progressbar
const handlecounting=(data)=>{
    let statusZero=0
    let statusOne=0;
    let statusTwo=0;
    const dataLength=data.length;
    for(let i=0;i<data.length;i++){
     if(data[i].status===0){
       statusZero++;
     }
     else if(data[i].status===1){
       statusOne++;
     }
     else{
      statusTwo++;
    } 
}
if(data.length>0){
  setWithOfProgressbar('unactivateprogress1',getpercentage(statusZero,dataLength));
  setWithOfProgressbar('doingprogress1',getpercentage(statusOne,dataLength));
  setWithOfProgressbar('completeprogress1',getpercentage(statusTwo,dataLength));
}
else{
  setWithOfProgressbar('unactivateprogress1',0);
  setWithOfProgressbar('doingprogress1',0);
  setWithOfProgressbar('completeprogress1',0);
}
}
//autogenerateid data
const generateId=(length) =>{
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 // handledisplay
 const display=(items,ulid,status)=>{
    const ul=document.getElementById(ulid);
    let lifilter=items.filter((item)=>item.status===status);
    let li=lifilter.map(item=>{
        switch(item.status){
            case 0:
                return  ` <li>
                <div class="row">
                 <div class="col s6 leftul">${item.task}</div>
                 <div class="col s6 rightul">
                   <i class="material-icons icons checkicon" onclick="handlecomplete('${item.id}')" >check</i>
                   <i class="material-icons icons pauseicon" onclick="handledoing('${item.id}')">pause</i>
                   <i class="material-icons icons clearicon" onclick="handledelete('${item.id}')">clear</i>
                 </div>
                </div>
              </li>`;
              
            case 1:
                return ` <li>
                <div class="row">
                 <div class="col s6 leftul">${item.task}</div>
                 <div class="col s6 rightul">
                 <i class="material-icons icons checkicon" onclick="handlecomplete('${item.id}')" >check</i>
                 <i class="material-icons icons clearicon" onclick="handledelete('${item.id}')">clear</i>
                 </div>
                </div>
              </li>`;
              
            case 2:
                return `<li>
                <div class="row">
                 <div class="col s6 leftul">${item.task}</div>
                 <div class="col s6 rightul">
                   <i class="material-icons icons clearicon" onclick="handledelete('${item.id}')">clear</i>
                 </div>
                </div>
              </li>`;   
        }
    });
    ul.innerHTML=li.join("");
 }
 //communicate between ipcmain and ipcrenderer
ipcRenderer.invoke('data',"").then(result=>{
    //render data to screen 
    display(result,"ulnewtask",0);
    display(result,"doingul",1);
    display(result,"completeul",2);
    //progressbar
    handlecounting(result);
});
const handledelete=async(id)=>{
    let result=  await ipcRenderer.invoke('deleteitem',id);
    display(result,"ulnewtask",0);
    display(result,"doingul",1);
    display(result,"completeul",2);
    //progressbar
    handlecounting(result);
}
const handlecomplete=async(id)=>{
  let result=  await ipcRenderer.invoke('completeitem',id);
    display(result,"ulnewtask",0);
    display(result,"doingul",1);
    display(result,"completeul",2);
    //progressbar
    handlecounting(result);
}
const handledoing=async(id)=>{
  let result=  await ipcRenderer.invoke('doingitem',id);
    display(result,"ulnewtask",0);
    display(result,"doingul",1);
    display(result,"completeul",2);
    //progressbar
    handlecounting(result);}
const handlereset=async()=>{
    let result=  await ipcRenderer.invoke('resetitem',"");
    display(result,"ulnewtask",0);
    display(result,"doingul",1);
    display(result,"completeul",2);
    //progressbar
    handlecounting(result);
  M.toast({html: 'Reseted',outDuration:100,inDuration:100});
}
const sendmail=async()=>{
   await ipcRenderer.invoke('sentmail',"")
    
}
const excelexport=async()=>{
  const res=await ipcRenderer.invoke('excelexport',"");
  if(!res){
    M.toast({html:'vui lòng add dữ liệu để xuất file'});
  }
  
}
//handle click event
document.getElementById('addbutton').addEventListener('click',async(e)=>{
    e.preventDefault();
    let value=document.getElementById('searchinput').value;
    if(!value){
      M.toast({html: 'Xin nhập dữ liệu vào ô input!',outDuration:100,inDuration:100})
    }
    else{
      let result= await ipcRenderer.invoke('adddata',{
        id:generateId(4),
        task:value,
        status:0,
        time:new Date()
    });
    display(result,"ulnewtask",0);
    display(result,"doingul",1);
    display(result,"completeul",2);
    //progressbar
    handlecounting(result);
    }
    document.forms[0].reset();
});
//display time
const displaytime=()=>{
const monthName=["Jan", "Feb", "Mar", "Apr", "May", "Jun",
"July", "Aug", "Sep", "Oct", "Nov", "Dec"];
const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
document.getElementById('divdate').innerHTML=new Date().getDate();
document.getElementById('divmonth').innerHTML=monthName[new Date().getMonth()];
document.getElementById('divyear').innerHTML=new Date().getFullYear();
document.getElementById('divday').innerHTML=weekday[new Date().getDay()];
}
//colapsemenu
const colapsemenufunc=(classname,statusclass,id)=>{
  let coll = document.getElementsByClassName(classname);
for (let i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
      this.classList.toggle("active");
      let content = document.getElementById(statusclass);
      if (content.style.display === "block") {
        document.getElementById(id).style. transform='rotate(-90deg)';
        content.style.display = "none";
      } else {
        content.style.display = "block";
        document.getElementById(id).style. transform='rotate(0deg)';
      }
    });
  }
}
colapsemenufunc('collapsible1','doingul','expand1');
colapsemenufunc('collapsible2','completeul','expand2');
displaytime();