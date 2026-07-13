import { TableLayoutEditor } from './components/TableLayoutEditor'
import { MenuManager } from './components/MenuManager'
import './App.css'

// TODO(C-3 follow-up): once a login screen exists, source this from real
// Owner auth state instead of a hardcoded null. Until then the layout editor
// and menu manager render read-only, which is the correct default for an
// unauthenticated session.
const OWNER_AUTH_TOKEN: string | null = null

function App() {
  return (
    <main id="center">
      <TableLayoutEditor authToken={OWNER_AUTH_TOKEN} />
      <MenuManager authToken={OWNER_AUTH_TOKEN} />
    </main>
  )
}

export default App
