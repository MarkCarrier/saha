import Nav from './components/nav'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import AccessPicker from './components/access-picker'
import EntryAccess from './components/entry-access'

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
          <Route path="/a/:accessIdx">
            <header className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Entries</h1>
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
