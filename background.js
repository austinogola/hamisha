chrome.runtime.onMessage.addListener(async(request,sender,sendResponse)=>{
    if(request.state){
        if(request.state=='ON'){
          chrome.action.setBadgeText({text:'ON'})
          chrome.action.setBadgeBackgroundColor({color:'#1A73E8'})
          chrome.storage.local.set({state:'ON'})
          sendResponse('Set it ON')
        }
        else{
          chrome.action.setBadgeText({text:'OFF'})
          chrome.action.setBadgeBackgroundColor({color:'#808080'})
          chrome.storage.local.set({state:'OFF'})
          sendResponse('Set it OFF')
        }
    }

    if(request.createFrame){
      
        openDialog(request)
        sendResponse({message:'Creating Frame'})
          
      }

    if(request.addItem){
      if(file_ids.includes(request.addItem)){
        console.log('This is already added')
        sendResponse({message:'none'})
        console.log(file_ids)
      }
      else{
        file_ids.push(request.addItem)
        console.log(file_ids)
        getFile(request.addItem)
        sendResponse({message:'add'})
      }
    }

    if(request.rmvItem){
      const file_id=request.rmvItem

      if(file_ids.includes(file_id)){
        sendResponse({message:'red'})

        let inx=file_ids.indexOf(file_id)

        file_ids.splice(inx,1)
        console.log('Received valid remove',file_ids)
        // downsArr.forEach((object, i) => {
        //   if (object.file_id==file_id) {
        //     downsArr.splice(i,1)
        //   }
        // });

        // const index = filesArr.indexOf(request.rmvItem);
        // filesArr.splice(index,1)
        // unloadFile(file_id)

      }
      else{
        sendResponse({message:'none'})
      }

    }
    if(request.closeWindow){
      closeWindow()
    }

    if(request.uploadItems){
      sendResponse({message:`Files uploaded`})
      console.log('Received upload request');
      pushFiles()
    }
})

var relevantHeaders={}

function closeWindow(){

  chrome.windows.getAll({populate:true},(window_list)=>{
    let windId=''
    window_list.forEach((window, i) => {
      if (window.type=='popup') {
        windId=window.id
      }
    });
    chrome.windows.remove(windId,()=>{
      console.log('Window removed');
    })

  })
  frameOn=false

}

chrome.storage.local.get(["state"]).then(async(result) => {
  if (result.state) {
    console.log(result.state);
    if(result.state=='OFF'){
      chrome.action.setBadgeText({text:'OFF'})
      chrome.action.setBadgeBackgroundColor({color:'#808080'})

    }else{
      chrome.action.setBadgeText({text:'ON'})
      chrome.action.setBadgeBackgroundColor({color:'#1A73E8'})
    }
  }
})

const pushFiles=async()=>{
  const tabs=await chrome.tabs.query({url:uploadLocation})

  let tabId=tabs[0].id

  const continueToFetch=()=>{
    itemsArr.forEach((obj,indx)=>{
      console.log('This is the object',obj)
      let url=`https://cloudimanage.com/work/web/api/v2/customers/${customer_id}/libraries/${dev_id}/documents/${obj.file_id}/download`
      headers={}
      
      relevantHeaders.forEach(object=>{
        headers[object.name]=object.value
        console.log(object.name,object.value)
      })

      console.log(headers)

      fetch(url,{
        method:'GET',
        headers:headers
      })
      .then(async res=>res.blob())
      .then(async body=>{
        const arrBuff=await body.arrayBuffer()
  
        const newArr=new Uint8Array(arrBuff)
  
        if(indx==itemsArr.length-1){
          let response = await chrome.tabs.sendMessage(tabId, {addFile: "true",array:newArr,name:obj.name,type:obj.ext,last:'true',index:indx});
          closeWindow()
          // let response2=await chrome.tabs.sendMessage(tabId, {promote: "true",files:itemsArr,location:uploadLocation,headers:relevantHeaders,customer_id:customer_id,dev_id:dev_id});
        }else{
          // let response2=await chrome.tabs.sendMessage(frameTabId, {promote: "true",files:itemsArr,location:uploadLocation,headers:relevantHeaders,customer_id:customer_id,dev_id:dev_id});
          let response = await chrome.tabs.sendMessage(tabId, {addFile: "true",array:newArr,name:obj.name,type:obj.ext,index:indx});
        }
      
      })
    })
  }

  if(customer_id){
    continueToFetch()
  }else{
    await setCustomerId()
    continueToFetch()
  }
  
  
}

chrome.windows.onRemoved.addListener(()=>{
  frameOn=false
},{windowTypes:['popup']})

const promoteAll=async()=>{
  itemsArr.forEach(obj=>{
    const versObj={
      "version": obj.version,
      "doc_profile": {
         "comment": `Uploaded to ${uploadLocation}`,
      }
    
  }

  headers={}
  
  relevantHeaders.forEach(object=>{
    headers[object.name]=object.value
    console.log(object.name,object.value)
  })

  console.log(headers)

    let curl2=`https://cloudimanage.com/work/web/api/v2/customers/${customer_id}/libraries/${dev_id}/documents/${obj.file_id}/versions/promote`
    fetch(curl2,{
      method:'POST',
      headers:headers,
      body:JSON.stringify(versObj)
    })
    .then(res=>res.json())
    .then(result=>{
      console.log(result)
    })
  })
}


const getFile=(id)=>{
  const url=`https://cloudimanage.com/work/web/api/v2/customers/${customer_id}/libraries/${dev_id}/documents/${id}`
  headers={}
  
  relevantHeaders.forEach(object=>{
    headers[object.name]=object.value
    console.log(object.name,object.value)
  })
  
  fetch(url,{
    method:'GET',
    headers:headers
  })
  .then(res=>res.json())
  .then(result=>{
    let data=result['data']
    
    let name=data['name']+'.'+data['extension']
    let ext=data['extension']
    let version=data['version']
    let file_id=data['id']

    const file_obj={name,ext,version,file_id}
    itemsArr.push(file_obj)
    console.log(itemsArr)
  })
}


chrome.webRequest.onBeforeSendHeaders.addListener((n)=>{
    let relevant=false
    n.requestHeaders.forEach(header=>{
        if(header.name=='X-XSRF-TOKEN'){
            relevant=true
        }
    })

    if(relevant){
        console.log('Setting relevant headers')
        relevantHeaders=n.requestHeaders
    }

},{urls:['https://cloudimanage.com/*']},['requestHeaders','extraHeaders'])

let filesArr=[]
let itemsArr=[]
let downsArr=[]
let file_ids=[]
let frameOn=false
let customer_id
let dev_id

const openDialog=async (request)=>{
    filesArr=[]
    itemsArr=[]
    downsArr=[]
    file_ids=[]

    uploadLocation=request.url
    console.log('Frame created');
    url='https://cloudimanage.com/work/web/r/recent-folders'

    if(!frameOn){
        frameOn=true
        let chromeCreate=await chrome.windows.create({
            focused:true,
            type:'popup',
            //popup??
            height:650,
            width:1100,
            left:60,
            top:70,
            url:url
        })

        // console.log(chromeCreate);
        let frameId=chromeCreate.id

        chrome.windows.onRemoved.addListener(()=>{
          frameOn=false
        },{windowTypes:['popup']})

        frameTabId=chromeCreate.tabs[0].id
        setCustomerId()
    }

}
let frameTabId
const sleep=(ms)=> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const setCustomerId=async()=>{
    // await sleep(1500)
    if(Object.keys(relevantHeaders).length!=0){
      
      console.log('Initiated customer id set up');
      headers={}
      relevantHeaders.forEach(object=>{
        headers[object.name]=object.value
        console.log(object.name,object.value)
      })
      console.log(headers)
      let sessUrl='https://cloudimanage.com/work/web/startup/session-info'
      !customer_id?fetch(sessUrl,{
        method:'GET',
        headers:headers
      })
      .then(res=>res.json())
      .then(result=>{
        let data=result.data
        customer_id=data['customer_id']
        console.log('Succcessfully set customer id',customer_id);
        fetch(`https://cloudimanage.com/work/web/api/v2/customers/${customer_id}/libraries`,{
          method:'GET',
          headers:{
              relevantHeaders
          }
        })
        .then(res=>res.json())
        .then(result=>{
          dev_id=result.data[0].id
          console.log('Succcessfully set dev id',dev_id);
        })
      }):null
    }else{
      await sleep(1000)
      setCustomerId()
    }
    
    
  }

