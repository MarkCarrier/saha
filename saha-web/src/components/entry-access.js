import { useParams, Redirect } from 'react-router-dom'
import EntryList from './entry-list'

const LOCAL_STORAGE_ACCESS_KEY = 'saha-access-list'
function getAccessListFromStorage(accessIndex) {
  const accessListRaw = localStorage.getItem(LOCAL_STORAGE_ACCESS_KEY)
  if (accessListRaw) {
    try {
      const accessList = JSON.parse(accessListRaw)
      if (Array.isArray(accessList) && accessList.length >= accessIndex) {
        return accessList[accessIndex]
      }
    } catch (err) {
      console.error("Couldn't parse access setting", err)
    }
  }

  return null
}

export default function EntryAccess() {
  let { accessIdx } = useParams()
  let access = getAccessListFromStorage(parseInt(accessIdx))

  if (!access) {
    return <Redirect to="/" />
  }

  return <EntryList access={access} />
}
