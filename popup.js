const toggler=document.querySelector('#toggler')
const title=document.querySelector('h3')
const in_put=document.querySelector('input')

async function checkState(){


    const state=localStorage.getItem('state')
    
    if(state){
        console.log(`State is present.Its ${state}`);
        if (state=='OFF') {
            title.innerHTML='Disconnected'
            console.log('The state is off now');
            chrome.runtime.sendMessage({state: 'OFF',popup:true})
            in_put.checked=false
        }else{
            title.innerHTML='Connected'
            console.log('The state is on now');
            chrome.runtime.sendMessage({state: 'ON',popup:true})
            in_put.checked=true

        }
    }
    else{
        localStorage.setItem('state','ON')
        chrome.runtime.sendMessage({state: 'ON',popup:true},response=>{
            console.log(response);
        })
    }

}

checkState()
// chrome.storage.local.getItem('state',(result)=>{
//     console.log(result);
// })

toggler.addEventListener('click',e=>{

    
    if (e.target.checked){
        title.innerHTML='Connected'
        localStorage.setItem('state','ON')
        console.log('Its on');
        checkState()
        chrome.runtime.sendMessage({state: 'ON',popup:true},response=>{
            console.log(response);
        })
        
    }else{
        title.innerHTML='Disconnected'
        // chrome.storage.local.set('state','OFF')
        localStorage.setItem('state','OFF')
        console.log('Its off');
        checkState()
        chrome.runtime.sendMessage({state: 'OFF',popup:true},response=>{
            console.log(response);
        })
    }
})