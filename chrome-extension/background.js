// console.log('Süpürge!')
// let popupPort = chrome.runtime.connect({ name: 'popup' })

chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'www.bulurum.com' }
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ])
  })
})

// chrome.runtime.onConnect.addListener(function (port) {
//   if (port.name == 'bulurumentry') {
//     port.onMessage.addListener(function (msg) {
//       let entry = msg.payload
//       console.log(`Entry found: ${JSON.stringify(entry, null, ' ')}`)
//       popupPort.postMessage({ type: 'entry', payload: entry })
//     })
//   }
// })
