//var port = chrome.runtime.connect({ name: 'bulurumentry' })

console.log(`Bulurum Entry Süpürge calışıyor`)

let url = window.location.href
let name = document.querySelector('#CompanyNameLbl')?.innerText
let address = document.querySelector('#AddressLbl')?.innerText
let tel = document.querySelector('#phones')?.innerText
let fax = document.querySelector('#FaxContLbl')?.innerText
let mobile = document.querySelector('#MobileContLbl')?.innerText
let category = document.querySelectorAll('.categoryDirPath')[0]?.innerText

let otherTel = document
  .querySelector('.otherPhoneHeader')
  .parentElement.parentElement.querySelector(
    '.tab_cont_descr.tab_cont_descr_content_OnlyFree'
  )?.innerText

let metaProperties = [...document.querySelectorAll('meta')]
  .filter(
    (m) =>
      m.getAttribute('itemprop') != undefined &&
      m.getAttribute('itemprop') != 'position'
  )
  .map((m) => [m.getAttribute('itemprop'), m.getAttribute('content')])
  .reduce((acc, next) => {
    acc[next[0]] = next[1]
    return acc
  }, {})

let shortDescription = document.querySelector('#ProfessionLbl')?.innerText
let longDescription = document
  .querySelector('meta[name="description"]')
  ?.getAttribute('content')

let bulurumId = url.split('?')[0].split('/').slice(-1)[0]

const entry = {
  bulurumId,
  url,
  name,
  address,
  tel,
  fax,
  mobile,
  category,
  otherTel,
  metaProperties,
  shortDescription,
  longDescription
}

console.log(`Entry:`)
console.log(entry)

//port.postMessage({ type: 'entry', payload: entry })

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log(`Sending entry to extension: ${JSON.stringify(entry, null, ' ')}`)
  switch (message.type) {
    case 'entry-request':
      sendResponse(entry)
      break
    default:
      console.error('Unrecognised message: ', message)
  }
})
