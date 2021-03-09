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

// saveButton.onclick = (event) => {
//   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//     chrome.runtime.sendMessage({ type: 'bglog', obj: 'Selam!' })
//   })
// }

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
  } else if (parts.length > 1) {
    return {
      number: formatNumber(parts[0]),
      label: otherPhoneString
        .replace(parts[0], '')
        .replace('(', '')
        .replace(')', '')
        .trim()
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

  let otherPhones = bulurumEntry.otherTel?.split('\n').map(otherPhoneToPhone)
  let allPhones = [
    { number: formatNumber(bulurumEntry.tel) },
    { number: formatNumber(bulurumEntry.mobile), label: 'cep' },
    { number: formatNumber(bulurumEntry.fax), label: 'fax' },
    ...(otherPhones || [])
  ]

  //Remove duplicates and nulls
  let validPhoneIndex = allPhones.reduce((acc, next) => {
    if (next && next.number && !acc[next.number]) acc[next.number] = next
    return acc
  }, {})

  return {
    id: null,
    type: 'entry',
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

function showSmallLoader(show = true) {
  if (show) document.querySelector('#small-loader').style.display = ''
  else document.querySelector('#small-loader').style.display = 'none'
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
    let alreadyDone = await checkForDuplicateEntry(entryDoc, settings)
    if (alreadyDone) {
      displayError('Already saved')
      return
    }
    let duplicates = await checkForDuplicateNumbers(entryDoc, settings)
    duplicates.forEach((d) => {
      let duplicateId = `#phone-${getPhoneId(d)}`
      let span = document.querySelector(duplicateId)
      span.style['text-decoration'] = 'line-through'
    })

    const flaggedPhones = entryDoc.entry.phones.map((p) => {
      if (duplicates.indexOf(p.number) > -1) {
        return {
          ...p,
          duplicate: true
        }
      } else {
        return p
      }
    })

    const entryDocWithDuplicatesFlagged = {
      ...entryDoc,
      entry: {
        ...entryDoc.entry,
        phones: flaggedPhones
      }
    }

    document.querySelector('#entry-json').value = JSON.stringify(
      entryDocWithDuplicatesFlagged,
      null,
      '  '
    )

    enableEntrySubmission(entryDocWithDuplicatesFlagged, settings)
  } catch (err) {
    displayError(err.toString())
  }
}

function displayError(errorMessage) {
  let sections = [
    ...document.querySelectorAll('body > .container > .middle > section')
  ]
  sections.forEach((n) => {
    n.style.display = 'none'
  })

  const errorText = document.createTextNode(errorMessage)
  const errorSection = document.createElement('section')
  errorSection.appendChild(errorText)
  document
    .querySelector('body > .container > .middle')
    .appendChild(errorSection)
}

function displaySuccess(response, settings) {
  let sections = [
    ...document.querySelectorAll('body > .container > .middle > section')
  ]
  sections.forEach((n) => {
    n.style.display = 'none'
  })

  document.querySelector('#success').style.display = ''
  document.querySelector('#view-entries').onclick = (e) => {
    chrome.tabs.create({
      url: `https://saha.markcarrier.info/#/a/${settings.target}`
    })
  }
  // const successText = document.createTextNode('Success! ' + response.id)
  // const successSection = document.createElement('section')
  // successSection.appendChild(successText)
  // document
  //   .querySelector('body > .container > .middle')
  //   .appendChild(successSection)
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
  leftCol.className = 'font-bold'
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

function enableEntrySubmission(entryDoc, settings) {
  saveButton.className = [
    'bg-red-900',
    ...saveButton.className
      .split(' ')
      .filter((c) => c != 'cursor-not-allowed' && c != 'bg-gray-400')
  ].join(' ')
  saveButton.onclick = (e) => {
    disableEntrySubmission()
    saveEntry(entryDoc, settings).catch((err) => {
      throw err
    })
  }
}

function disableEntrySubmission() {
  saveButton.style.display = 'none'
  // saveButton.className = [
  //   'bg-gray-400',
  //   'cursor-not-allowed',
  //   ...saveButton.className.split(' ').filter((c) => c != 'bg-gray-400')
  // ].join(' ')
  // saveButton.onclick = null
}

async function saveEntry(entryDoc, settings) {
  try {
    showSmallLoader(true)
    let url = `https://couch.markcarrier.info/${settings.target}/`
    let headers = {
      Authorization:
        'Basic ' + btoa(settings.username + ':' + settings.password),
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
    const httpResponse = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(entryDoc)
    })

    showSmallLoader(false)
    if (!httpResponse.ok) {
      displayError(
        `Could not save entry. ${httpResponse.status} ${httpResponse.statusText}`
      )
    } else {
      const couchResponse = await httpResponse.json()
      displaySuccess(couchResponse, settings)
    }
  } catch (badError) {
    displayError(badError.toString())
  }
}

async function checkForDuplicateEntry(entryDoc, settings) {
  showSmallLoader(true)
  //https://couch.markcarrier.info/altinkum-test/_design/views/_view/numbers?keys=[%220242%20248%2088%2066%22,%220242%20247%2098%2085%22]
  const externalId = `${entryDoc.entry.sourceId.type}-${entryDoc.entry.sourceId.id}`
  let url = `https://couch.markcarrier.info/${
    settings.target
  }/_design/views/_view/source-id?key="${encodeURIComponent(externalId)}"`
  let headers = {
    Authorization: 'Basic ' + btoa(settings.username + ':' + settings.password)
  }
  const httpResponse = await fetch(url, { method: 'GET', headers: headers })

  showSmallLoader(false)
  if (!httpResponse.ok) {
    throw new Error(
      `Could not connect to the store. Check your settings. ${httpResponse.status} ${httpResponse.statusText}`
    )
  }

  const couchResponse = await httpResponse.json()

  return couchResponse.rows.length > 0
}

async function checkForDuplicateNumbers(entryDoc, settings) {
  showSmallLoader(true)
  //https://couch.markcarrier.info/altinkum-test/_design/views/_view/numbers?keys=[%220242%20248%2088%2066%22,%220242%20247%2098%2085%22]
  const numbersToCheckArray = encodeURIComponent(
    JSON.stringify(entryDoc.entry.phones.map((p) => p.number))
  )
  let url = `https://couch.markcarrier.info/${settings.target}/_design/views/_view/numbers?keys=${numbersToCheckArray}`
  let headers = {
    Authorization: 'Basic ' + btoa(settings.username + ':' + settings.password)
  }
  const httpResponse = await fetch(url, { method: 'GET', headers: headers })

  showSmallLoader(false)
  if (!httpResponse.ok) {
    throw new Error(
      `Could not connect to the store. Check your settings. ${httpResponse.status} ${httpResponse.statusText}`
    )
  }

  const couchResponse = await httpResponse.json()

  return couchResponse.rows.map((r) => r.key)
}
