import { useEffect, useState } from 'react'
import BigLoader from './big-loader'
import EntryItem from './entry-item'

export default function EntryList({ access }) {
  const [entries, setEntries] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    async function getLatestEntries() {
      let url = `https://couch.markcarrier.info/${access.catalog}/_design/views/_view/inspection-time?include_docs=true`
      let headers = {
        Authorization: 'Basic ' + btoa(access.name + ':' + access.chiffre)
      }
      const httpResponse = await fetch(url, { method: 'GET', headers: headers })

      if (!httpResponse.ok) {
        setErrorMsg(
          `Could not connect to the store. Check your settings. ${httpResponse.status} ${httpResponse.statusText}`
        )
      }

      const couchResponse = await httpResponse.json()

      setEntries(couchResponse.rows.map((d) => d.doc))
    }
    getLatestEntries()
  }, [access])

  if (entries === null) return <BigLoader />

  if (errorMsg) return <span>{errorMsg}</span>

  return entries.map((entryDoc) => {
    return <EntryItem key={entryDoc.id} entryDoc={entryDoc} />
  })
}
