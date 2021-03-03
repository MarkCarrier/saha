import { useState } from 'react'
import { Link, Redirect } from 'react-router-dom'

const LOCAL_STORAGE_ACCESS_KEY = 'saha-access-list'
function getAccessListFromStorage() {
  const accessListRaw = localStorage.getItem(LOCAL_STORAGE_ACCESS_KEY)
  if (accessListRaw) {
    try {
      const accessList = JSON.parse(accessListRaw)
      if (Array.isArray(accessList)) {
        return accessList
      }
    } catch (err) {
      console.error("Couldn't parse access setting", err)
    }
  }

  return []
}

export default function AccessPicker() {
  const [accessList] = useState(getAccessListFromStorage())

  // useEffect(() => {
  //   localStorage.setItem(LOCAL_STORAGE_ACCESS_KEY, JSON.stringify(accessList))
  // }, [accessList])

  if (accessList.length === 1)
    return <Redirect to={`/a/${accessList[0].catalog}`} />

  return (
    <div className="px-4 py-6 sm:px-0">
      {accessList.length === 0 && (
        <div className="text-center">
          <span className="text-xl font-bold">
            You have no registered access on this device.
          </span>
          <br />
          <span>Open a registration link (sent to you by Mark)</span>
        </div>
      )}
      {accessList.map((a, idx) => {
        return (
          <Link key={idx} to={`/a/${a.catalog}`}>
            <div className="w-96 mx-auto border p-10 rounded-lg mb-8 bg-yellow-200 hover:bg-yellow-400">
              <span className="text-2xl font-bold">{a.catalog}</span>
              <br />
              <span className="text-lg">{a.name}</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
