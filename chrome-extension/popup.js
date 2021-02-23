console.log('Süpürge Popup')
let saveButton = document.querySelector('#save-entry-button')
let textarea = document.querySelector('#the-textarea')
let copyButton = document.querySelector('#copy-entry-button')
copyButton.onclick = (event) => {
  let text = document.querySelector('#entry-json').value
  copy(text, 'application/json')
  navigator.clipboard.writeText(text).then(
    () => {},
    () => {
      alert(`Couldn't copy`)
    }
  )
  return true
}

saveButton.onclick = (event) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.runtime.sendMessage({ type: 'bglog', obj: 'Selam!' })
  })
}

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  chrome.tabs.sendMessage(tabs[0].id, { type: 'entry-request' }, handleNewEntry)
})

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name == 'popup') {
    port.onMessage.addListener(handleNewEntry)
  }
})

function otherPhoneToPhone(otherPhoneString) {
  let parts = otherPhoneString.split(' ')
  if (parts.length == 0) {
    return { number: null }
  } else if (parts.length == 1) {
    return {
      number: formatNumber(parts[0]),
      label: ''
    }
  } else if (parts.length == 2) {
    return {
      number: formatNumber(parts[0]),
      label: parts[1]?.replace('(', '').replace(')', '').trim()
    }
  } else {
    throw new Error(`Unexpected other phone format: "${otherPhoneString}"`)
  }
}

function formatNumber(numberString) {
  if (numberString == undefined || numberString.length < 4) {
    return null
  }
  let baseNumber = numberString.replace(/\D/g, '')
  let prefixedNumber
  if (baseNumber.length == 12 && baseNumber.startsWith('90')) {
    prefixedNumber = baseNumber.slice(1)
  } else if (baseNumber.length == 10) {
    prefixedNumber = `0${baseNumber}`
  } else {
    prefixedNumber = baseNumber
  }

  if (prefixedNumber.length == 11) {
    return `${prefixedNumber.slice(0, 4)} ${prefixedNumber.slice(
      4,
      7
    )} ${prefixedNumber.slice(7, 9)} ${prefixedNumber.slice(9, 11)}`
  } else {
    throw new Error(`Unsupported number format: ${prefixedNumber}`)
  }
}

function bulurumEntryToDomainEntry(settings, bulurumEntry) {
  if (!bulurumEntry.bulurumId || !bulurumEntry.name || !bulurumEntry.url) {
    throw new Error('Invalid entry. id, name and url required')
  }

  let otherPhones = bulurumEntry.otherTel.split('\n').map(otherPhoneToPhone)
  let allPhones = [
    { number: formatNumber(bulurumEntry.tel) },
    { number: formatNumber(bulurumEntry.mobile), label: 'cep' },
    { number: formatNumber(bulurumEntry.fax), label: 'fax' },
    ...otherPhones
  ]

  let validPhoneIndex = allPhones.reduce((acc, next) => {
    if (next && next.number && !acc[next.number]) acc[next.number] = next
    return acc
  }, {})

  return {
    id: null,
    inspectedOn: new Date().toISOString(),
    inspectedBy: settings.username,
    entry: {
      sourceId: {
        type: 'bulurum',
        id: bulurumEntry.bulurumId
      },
      name: bulurumEntry.name,
      url: bulurumEntry.url,
      shortDescription: bulurumEntry.shortDescription,
      longDescription: bulurumEntry.longDescription,
      address: bulurumEntry.address,
      category: bulurumEntry.category,
      phones: Object.values(validPhoneIndex),
      other: bulurumEntry.metaProperties
    },
    rawEntry: bulurumEntry
  }
}

function copy(str, mimeType) {
  document.oncopy = function (event) {
    event.clipboardData.setData(mimeType, str)
    event.preventDefault()
  }
  document.execCommand('copy', false, null)
}

function getPhoneId(phoneNumber) {
  return phoneNumber.replace(/\W/g, '')
}

async function handleNewEntry(msg) {
  try {
    const settings = await getSettings()
    const entryDoc = bulurumEntryToDomainEntry(settings, msg)
    //textarea.value = JSON.stringify(msg, null, ' ')
    fillPreviewTable(entryDoc)
    document.querySelector('#loader').style.display = 'none'
    document.querySelector('#preview').style.display = 'block'
    document.querySelector('#entry-json').value = JSON.stringify(
      entryDoc,
      null,
      '  '
    )
    let duplicates = await checkForDuplicateNumbers(entryDoc, settings)
    duplicates.forEach((d) => {
      let duplicateId = `#phone-${getPhoneId(d)}`
      let span = document.querySelector(duplicateId)
      span.style['text-decoration'] = 'line-through'
    })
  } catch (err) {
    document
      .querySelector('body')
      .appendChild(document.createTextNode(err.toString()))
  }
}

function fillPreviewTable(entryDoc) {
  let tbody = document.querySelector('#preview tbody')

  tbody.appendChild(createRow('Name', entryDoc.entry.name))
  if (entryDoc.entry.shortDescription || true)
    tbody.appendChild(createRow('Description', entryDoc.entry.shortDescription))
  if (entryDoc.entry.category)
    tbody.appendChild(createRow('Category', entryDoc.entry.category))
  if (entryDoc.entry.address)
    tbody.appendChild(createRow('Address', entryDoc.entry.address))
  entryDoc.entry.phones.forEach((p) => {
    tbody.appendChild(
      createRow(p.label || 'Phone', p.number, `phone-${getPhoneId(p.number)}`)
    )
  })
}

function createRow(leftColText, rightColText, rightSpanId) {
  let row = document.createElement('tr')
  let leftCol = document.createElement('td')
  leftCol.appendChild(document.createTextNode(leftColText))

  let rightCol = document.createElement('td')
  if (!rightSpanId) {
    rightCol.appendChild(document.createTextNode(rightColText))
  } else {
    let contentSpan = document.createElement('span')
    contentSpan.setAttribute('id', rightSpanId)
    let contentSpanText = document.createTextNode(rightColText)
    contentSpan.appendChild(contentSpanText)
    rightCol.appendChild(contentSpan)
  }

  row.appendChild(leftCol)
  row.appendChild(rightCol)

  return row
}

async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        target: '',
        username: '',
        password: ''
      },
      async (settings) => {
        resolve(settings)
      }
    )
  })
}

async function checkForDuplicateNumbers(entryDoc, settings) {
  //https://couch.markcarrier.info/altinkum-test/_design/views/_view/numbers?keys=[%220242%20248%2088%2066%22,%220242%20247%2098%2085%22]
  const numbersToCheckArray = encodeURIComponent(
    JSON.stringify(entryDoc.entry.phones.map((p) => p.number))
  )
  let url = `https://couch.markcarrier.info/${settings.target}/_design/views/_view/numbers?keys=${numbersToCheckArray}`
  let headers = new Headers()
  headers.set(
    'Authorization',
    'Basic ' + btoa(settings.username + ':' + settings.password)
  )
  const httpResponse = await fetch(url, { method: 'GET', headers: headers })

  if (!httpResponse.ok) {
    throw new Error(
      `Error connecting to the store: ${httpResponse.status} ${httpResponse.statusText}`
    )
  }

  const couchResponse = await httpResponse.json()

  return couchResponse.rows.map((r) => r.key)
}
