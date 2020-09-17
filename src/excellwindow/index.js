
const {ipcRenderer,showToast}=window.get;
let exportbtn=document.getElementById('export');
let table=document.getElementById('table');
const renderstatus=number=>{
    let result=''
    switch(number){
        case 0: 
            result="Chưa làm";
            return result;
           
        case 1:
            result='Đang thực hiện';
            return result;
           
        case 2:
            result='Đã hoàn thành';
            return result;
               
    }
}
const showtable=(data)=>{
    
    table.innerHTML+=`<tbody>${data.map((item,key)=>{
        return `<tr>
        <td>${key}</td>
        <td>${item.task}</td>
        <td>${renderstatus(item.status)}</td>
        <td>${item.time}</td>
      </tr>`
    }).join("")}</tbody>`
}
const displaydata=()=>{
     ipcRenderer.invoke("data","").then(result=>{
        showtable(result);
     });
    
}
exportbtn.addEventListener('click',async()=>{
    var workbook = XLSX.utils.table_to_book(table);
   const res= await ipcRenderer.invoke("opendialog",workbook);
   if(res){
       console.log("ghi thành công");
       showToast({str:'Xuất file thành công, mở file vừa xuất  thử xem nào',time:3000});
   }
   else{
       console.log("ghi thất bại");
       showToast({str:'Bạn vừa hủy xuất file hoặc Bị lỗi gì đó r ;(, xin thử lại, k là bug r',time:3000});
   }

   
   
})
displaydata();