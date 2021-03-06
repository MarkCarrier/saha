import Nav from './components/nav'
import { HashRouter as Router, Switch, Route, Link } from 'react-router-dom'
import AccessPicker from './components/access-picker'
import EntryAccess from './components/entry-access'
import GetExtension from './components/get-extension'

function App() {
  return (
    <div>
      <Router>
        <Nav />
        <Switch>
          <Route exact path="/">
            <main>
              <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <AccessPicker />
              </div>
            </main>
          </Route>
          <Route exact path="/get-extension">
            <main>
              <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <GetExtension />
              </div>
            </main>
          </Route>
          <Route path="/a/:catalog">
            <header className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <span className="text-3xl font-bold text-gray-900">
                  Entries
                </span>
                <div class="ml-4 bg-red-700 w-8 h-8 rounded p-1 float-right">
                  <Link
                    to="/get-extension"
                    class="text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </header>
            <main>
              <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <EntryAccess />
              </div>
            </main>
          </Route>
        </Switch>
      </Router>
    </div>
  )
}

export default App
