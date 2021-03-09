import { useState, useEffect } from 'react'

export default function EntryItem({ entryDoc, access }) {
  const [currentEntryDoc, setEntryDoc] = useState(entryDoc)
  const [action, setAction] = useState(null)

  useEffect(() => {
    async function updateEntry(updatedDoc) {
      let url = `https://couch.markcarrier.info/${access.catalog}/${updatedDoc._id}`
      let headers = {
        Authorization: 'Basic ' + btoa(access.name + ':' + access.chiffre),
        'Content-Type': 'application/json'
      }
      const httpResponse = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(updatedDoc)
      })

      if (!httpResponse.ok) {
        alert(`Error: ${httpResponse.status} ${httpResponse.statusText}`)
      }

      const couchResponse = await httpResponse.json()

      setEntryDoc({ ...updatedDoc, _rev: couchResponse._rev })
    }

    if (action === 'delete') {
      updateEntry({
        ...currentEntryDoc,
        deletedOn: new Date().toISOString(),
        deletedBy: access.name
      }).then(() => {
        setAction(null)
      })
    }
  }, [action, access])

  const deleteMe = (e) => {
    if (window.confirm(`Delete ${currentEntryDoc.entry.name}?`)) {
      setAction('delete')
    }
  }

  const isDeleted = currentEntryDoc.deletedOn != undefined

  return (
    <div
      className={`w-full mb-1 ${isDeleted ? 'hidden' : ''} ${
        action === 'delete' ? 'bg-red-300' : ''
      }`}
    >
      <div className="flex flex-col border rounded p-4 mx-4 md:mx-0">
        <div className="flex">
          <div className="flex-grow">
            <div
              className="inline-block mr-2 py-0.25 px-2 bg-yellow-200 rounded"
              title={JSON.stringify(currentEntryDoc.entry, null, ' ')}
            >
              {currentEntryDoc.entry.category}
            </div>
          </div>
          <div className="content-end mr-2">
            <button
              className="hover:bg-yellow-200 p-1 rounded"
              onClick={deleteMe}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                className="h-5 w-5 fill-current text-red-700"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
        <div
          className="font-bold text-lg"
          title={JSON.stringify(currentEntryDoc._id, null, ' ')}
        >
          {currentEntryDoc.entry.name}
        </div>
        <div className="mb-2">
          <a
            className="underline text-sm font-mono"
            href={currentEntryDoc.entry.url}
            target="_blank"
            rel="noreferrer"
          >
            {currentEntryDoc.entry.url}
          </a>
        </div>
        <div className="">
          <span>{currentEntryDoc.entry.shortDescription}</span>
        </div>
        <div className="text-sm">
          <b>Address:</b>&nbsp;&nbsp;
          {currentEntryDoc.entry.address}
        </div>
        <div className="text-sm mt-3">
          {currentEntryDoc.entry.phones
            .filter((p) => !p.duplicate)
            .map((p, pidx) => {
              return (
                <div
                  key={pidx}
                  className="rounded mr-2 py-1 px-2 bg-gray-200 w-auto inline-block"
                >
                  <a className="" href={`tel:${p.number}`}>
                    {p.number}
                  </a>
                  {p.label && (
                    <span className="ml-1 font-bold text-xs">({p.label})</span>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
