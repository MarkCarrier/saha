import { useParams, Redirect } from 'react-router-dom'
import EntryList from './entry-list'

const LOCAL_STORAGE_ACCESS_KEY = 'saha-access-list'
function getAccessListFromStorage(catalog) {
  const accessListRaw = localStorage.getItem(LOCAL_STORAGE_ACCESS_KEY)
  if (accessListRaw) {
    try {
      const accessList = JSON.parse(accessListRaw)
      if (Array.isArray(accessList)) {
        let matchedCatalog = accessList.filter((a) => a.catalog === catalog)
        if (matchedCatalog.length > 0) {
          return matchedCatalog[0]
        }
      }
    } catch (err) {
      console.error("Couldn't parse access setting", err)
    }
  }

  return null
}

export default function EntryAccess() {
  let { catalog } = useParams()
  let access = getAccessListFromStorage(catalog)

  if (!access) {
    return <Redirect to="/" />
  }

  return <EntryList access={access} />
}
