chrome.runtime.onMessage.addListener((request,sender,sendResponse)=>{
  if(request.addFile){
    addFileToInput(request)
  }

})


const promoteAll=async(arr,location,headers,customer_id,dev_id)=>{
  arr.forEach(obj=>{
    const versObj={
      "version": obj.version,
      "doc_profile": {
         "comment": `Uploaded to ${location}`,
      }
    
  }

  let heads={}
  
  headers.forEach(object=>{
    heads[object.name]=object.value
    console.log(object.name,object.value)
  })

  console.log(heads)

    let curl2=`https://cloudimanage.com/work/web/api/v2/customers/${customer_id}/libraries/${dev_id}/documents/${obj.file_id}/versions/promote`
    fetch(curl2,{
      method:'POST',
      headers:heads,
      body:JSON.stringify(versObj)
    })
    .then(res=>res.json())
    .then(result=>{
      console.log(result)
    })
  })
}


const addFileToInput=async(request)=>{
  file_input.setAttribute('type','file')
  file_input.style.display = "block"
  const array=request.array
  
  let newArr=[]
  Object.values(array).forEach((item, i) => {
    newArr.push(item)
  });

  const int8=new Uint8Array(newArr)
  let bloB = new Blob([int8],{type:'application/octet-stream'})
  let newD=new Date()

  let fileA=''
  let file_type=request.type
  let file_name=request.name

  console.log(file_type,file_name)


  if(request.type=='pdf' || request.type=='docx'){
    fileA = new File([bloB],file_name,{type:`application/${file_type}`,lastModifiedDate:newD})
  }
  else if (file_type=='ppt') {
    fileA = new File([bloB],file_name,{type:`application/vnd.ms-powerpoint`,lastModifiedDate:newD})
  }
  else if (file_type=='xlsx') {
    fileA = new File([bloB],file_name,{type:`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,lastModifiedDate:newD})
  }
  else if (file_type=='png' || file_type=='jpeg' || file_type=='jpg') {
    fileA = new File([bloB],file_name,{type:`image/${file_type}`,lastModifiedDate:newD})
  }
  else{
    console.log('File type not recognized');
  }

  allFiles.push(fileA)
  console.log(fileA)
  let e = new Event("change");
  await sleep(500)
  dataTransfer.items.add(fileA)
  console.log(dataTransfer.items)
  // file_input.files=dataTransfer.files
  // file_input.dispatchEvent(e);
  if(request.last){
    console.log('This is the last file')
    await sleep(1500)
    file_input.files=dataTransfer.files
    console.log(file_input.files)
    file_input.dispatchEvent(e);
  }
    
}

const sleep=(ms)=> {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const dataTransfer = new DataTransfer();

const file_input=document.querySelector('input[type=file]')

let currenturl=String(window.location.href)

if(file_input){
    file_input.addEventListener('click',()=>{
      if(turnedOn){
        file_input.setAttribute('type','filed')
        file_input.style.display = "none"
        createFrame(currenturl)
        
      }else{
        file_input.setAttribute('type','file')
      }    
        
      })  
  }


  const createFrame=(url)=>{
    console.log('clicked input')
    chrome.runtime.sendMessage({createFrame: 'true',url:url}, function(response) {  
  });
  }

  const allFiles=[]

  const addChecksListener=()=>{
    
    
  }

  if(currenturl.includes('cloudimanage')){
    console.log(typeof(window));
    // addCart()
    // fileTargets()
    console.log('We are on imange');
    // fileTargets()

    window.addEventListener('click',event=>{
      addCart()
      fileTargets()

      let urlNow=String(window.location.href)
    if(urlNow!==currenturl){
      let urlNowArr=urlNow.split('/')
      urlNowArr.splice(-1)
      let currentUrlArr=currenturl.split('/')
      currentUrlArr.splice(-1)
      if(urlNowArr.toString()==currentUrlArr.toString()){
        
      }else{
        // fileTargets()
      }
    }
    })
}


  const addCart=()=>{
    const cartBox=document.querySelector('#cartBox')

    if(cartBox){

    }else{
      const cart=document.createElement('div')
      cart.setAttribute('id','cartBox')
      cart.style.position='fixed'
      cart.style.display='grid'
      cart.style.gridTemplateRows='60% 40%'
      cart.style.bottom='130px'
      cart.style.right='150px'
      cart.style.zIndex='1000'
      cart.style.height='75px'
      cart.style.width='75px'
      cart.style.backgroundColor='white'
      cart.style.border='2px solid #1581EE'
      cart.style.borderRadius='5px'
      number=document.createElement('div')

      number.classList.add("myNum");
      // number.style.backgroundColor='red'
      // number.style.height='40px'
      number.style.color='#1581EE'
      number.style.cursor='pointer'
      number.style.backgroundColor='white'
      number.style.display='flex'
      number.style.justifyContent='center'
      number.style.alignItems='center'
      const h1 = document.createElement("h1");
      const textNode = document.createTextNode("0");
      h1.style.fontSize='30px'
      h1.appendChild(textNode)
      number.appendChild(h1)
      // number.appendChild(textNode)
      const upload=document.createElement('button')
      upload.style.backgroundColor='#1581EE'
      upload.style.color='white'
      upload.style.fontSize='16px'

       // upload.style.height='30px'
      const p = document.createElement("p");
      const textNode2 = document.createTextNode("Upload");
      upload.appendChild(textNode2)
      upload.addEventListener('click',evt=>{
        evt.preventDefault()
        console.log('Uploading');
        uploadItems()
      })

      cart.appendChild(number)
      cart.appendChild(upload)
    
      const pos=document.querySelector('button.btn.btn-plus')
      document.body.appendChild(cart)
    
    }
    
    
  
    
   
    
    
  
  
  
    
   
    // upload.style.display='block'
    // upload.appendChild(textNode)
  
  }


  const addTracking=(elements)=>{
    elements.forEach(item=>{
      item.addEventListener('change',(e)=>{
        
        let id=e.target.id
  
  
        let file_id=id.split('-')[3]
        console.log(file_id);
        
        let nowUrlArr=String(window.location.href).split('/')
        let firstID=nowUrlArr[nowUrlArr.length-1].split('?')
        let folder_id=firstID[0]
  
  
        if (e.target.checked) {
          let curUrl=String(window.location.href)
          addItem(file_id,curUrl,folder_id)
        }else{
          rmvItem(file_id)
        }
      })
    })
    
  }


  const fileTargets=()=>{
    async function  loadSelector(selector) {
      var raf;
      var found = false;
  
      (function check(){
        const el = document.querySelectorAll(selector);
        
        if (el) {
          if(el.length>0){
            console.log('El FOUND',el)
            el.forEach(item=>{
              if(item.id.length>=30){
                found = true;
                cancelAnimationFrame(raf);
                // trackCheckboxes()
                addTracking(el)
              }
            })
          }
          
          if(!found){
            raf = requestAnimationFrame(check);
          }
            
      
        } else {
            raf = requestAnimationFrame(check);
        }
      })();
      return found;
  
      
    }
    // loadSelector('div[ref="eWrapper"] > input[ref="eInput"]')
    loadSelector('input[id^="ws-selector-desktop-DEV!"]')
  }


  function trackCheckboxes(){
    // const viewport=el.querySelector('input')
    // console.log(viewport);
    // const checkboxes=document.querySelectorAll('input[type="checkbox"]')
    const checkboxes=document.querySelectorAll('div[ref="eWrapper"] > input[ref="eInput"]')
    
    let relevant=[]
    checkboxes.forEach(item=>{
      
      if(item.id.length>=30){
        relevant.push(item)
      } 
    })
    
    console.log(relevant.length);
    relevant.forEach(item=>{
      item.addEventListener('change',(e)=>{
        
        let id=e.target.id
  
  
        let file_id=id.split('-')[3]
        console.log(file_id);
        
        let nowUrlArr=String(window.location.href).split('/')
        let firstID=nowUrlArr[nowUrlArr.length-1].split('?')
        let folder_id=firstID[0]
  
  
        if (e.target.checked) {
          let curUrl=String(window.location.href)
          addItem(file_id,curUrl,folder_id)
        }else{
          rmvItem(file_id)
        }
      })
    })
  }
  

  let turnedOn
  
  chrome.storage.local.get('state').then(result=>{
    if(result.state=='OFF'){
      turnedOn=false
    }else{
      turnedOn=true
    }
    
  })
  
  chrome.storage.onChanged.addListener((changes,namespace)=>{
    if(changes.state.newValue=="OFF"){
      turnedOn=false
    }else{
      turnedOn=true
    }
  })
  

  function rmvItem(file_id){
    chrome.runtime.sendMessage({rmvItem:file_id},res=>{
      if(res.message=='red'){
        updateCart('red')
      }
    });
  }
  
  function addItem(file_id,url,folder_id){
    chrome.runtime.sendMessage({addItem:file_id,url:url,folder_id:folder_id},res=>{
      if(res.message=='add'){
        updateCart('add')
      }
    })
  }
  
  
  function uploadItems(f){
    chrome.runtime.sendMessage({uploadItems:'true'},res=>{
      console.log(res);
    });
  }

  cartNum=0
  const updateCart=(sign)=>{

    number=document.querySelector('.myNum')
  
    if(sign=='add'){
      cartNum=cartNum+1
      number.innerHTML=`<h2>${cartNum}</h2>`
    }
    else if(sign=='red'){
      cartNum=cartNum-1
      number.innerHTML=`<h2>${cartNum}</h2>`
    }

    console.log('currnet cart nUMB is ',cartNum)
  }