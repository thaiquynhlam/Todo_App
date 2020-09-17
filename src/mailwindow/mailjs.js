const{nodemailer,showToast,ipcRenderer}=window.get;

document.getElementById('Subjectsender').value=`[TRAINING_JS_NODEJS] Daily report${new Date().getDate()}/${new Date().getMonth()+1}`;
document.getElementById('textarea').value=`
Em Nguyễn Anh Nhân  báo cáo tiến độ ngày ${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()}  
1.Plan today

 Hoàn thiện Todo list
 
2 .Actual today
  TodoList:100%
3. issue:
    No
`

document.getElementById('submitbutton').addEventListener('click', async(e)=>{
    e.preventDefault();
    let subject=document.getElementById('Subjectsender').value;
    let content=document.getElementById('textarea').value;
    let Tosender=document.getElementById('Tosender').value;
    //config
    let sender="Nhân Nguyễn"
    let mainOptions = { 
        from: sender,
        to: Tosender,
        subject: subject,
        text: `You recieved message from Nhân Nguyễn `,
        html:content
    }
    showToast('Xin vui lòng đợi trong giây lát');
        let result= await ipcRenderer.invoke("mailing",mainOptions);
        if(result){
            showToast('Đã  gửi mail thành công');
        }
        else{
            showToast('có lỗi xảy ra');
        }

})
  