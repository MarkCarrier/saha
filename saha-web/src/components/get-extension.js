export default function GetExtension() {
  return (
    <div className="w-full mt-20 text-center">
      <div className="text-3xl font-bold mb-4">
        You can download the Chrome Extension{' '}
        <a className="underline" href="/saha-chrome-extension-0.0.1.zip">
          here
        </a>
        .
      </div>
      <div class="w-96 text-left mx-auto">
        Then:
        <ul>
          <li className="list-disc">Unzip the file content into a folder</li>
          <li className="list-disc">
            Open your chrome extension settings (chrome://extensions/)
          </li>
          <li className="list-disc">
            Enable developer mode (top right corner)
          </li>
          <li className="list-disc">Click "Load unpacked"</li>
          <li className="list-disc">Find the folder the open it</li>
          <li className="list-disc">
            Go to the extension details and open the settings
          </li>
        </ul>
      </div>
    </div>
  )
}
