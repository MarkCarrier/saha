export default function EntryItem({ entryDoc }) {
  return (
    <div className="w-full">
      <div
        className="flex flex-col border rounded p-4 mx-4 md:mx-0"
        title={JSON.stringify(entryDoc.entry, null, ' ')}
      >
        <div className="font-bold text-lg">{entryDoc.entry.name}</div>
        <div className="">
          <div className="inline-block mr-2 py-0.25 px-2 bg-yellow-200 rounded">
            {entryDoc.entry.category}
          </div>
          <span>{entryDoc.entry.shortDescription}</span>
          <a
            className="ml-4 underline"
            href={entryDoc.entry.url}
            target="_blank"
            rel="noreferrer"
          >
            View
          </a>
        </div>
        <div className="text-sm">
          <b>Address:</b>&nbsp;&nbsp;
          {entryDoc.entry.address}
        </div>
        <div className="text-sm mt-3">
          {entryDoc.entry.phones.map((p) => {
            return (
              <div className="rounded mr-2 py-1 px-2 bg-gray-200 w-auto inline-block">
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
