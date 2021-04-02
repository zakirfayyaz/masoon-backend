// const public_vapid_Key = 'BJhKHAA48qs0EMv_Aq_wQ1JRSKB7SxEr2t1j4_mUMZCPa84fhApIABXLFmFcmBM3hFPLL27YbgpTU-BGfAKSvkQ'

// if('serviceWorker' in navigator) {
//     send().catch(err => console.error(err))
// }
// async function send() {
//     console.log('Registering service worker')

//     const register = await navigator.serviceWorker.register('./worker.js',{
//         scope: '/'
//     });
//     console.log('Service worker registered')

//     console.log('register push')

//     const subscription = await register.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: urlBase64ToUint8Array(public_vapid_Key)
//     })

//     console.log('push registered')

//     console.log('sending push')

//     await fetch('/subscribe',{
//         method: 'POST',
//         body: JSON.stringify(subscription),
//         headers: {
//             'content-type': 'application/json'
//         }
//     })
//     console.log('Push sent')

// }

// function urlBase64ToUint8Array(base64String) {
//     // console.log(base64String)
//     const padding = '='.repeat((4 - base64String.length % 4) % 4);
//     const base64 = (base64String + padding)
//       .replace(/-/g, '+')
//       .replace(/_/g, '/');
  
//     const rawData = window.atob(base64);
//     const outputArray = new Uint8Array(rawData.length);
  
//     for (let i = 0; i < rawData.length; ++i) {
//       outputArray[i] = rawData.charCodeAt(i);
//     }
//     return outputArray;
//   }