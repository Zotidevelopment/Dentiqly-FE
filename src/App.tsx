import { AppRouter } from './components/AppRouter'
import { Toaster } from './components/ui/toaster'
import { CookieConsent } from './components/legal/CookieConsent'

function App() {
  return (
    <>
      <AppRouter />
      <Toaster />
      <CookieConsent />
    </>
  )
}

export default App