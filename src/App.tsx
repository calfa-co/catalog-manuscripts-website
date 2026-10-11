import {
  HashRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import AboutPage from './pages/AboutPage'
import CatalogPage from './pages/CatalogPage'
import ManuscriptPage from './pages/ManuscriptPage'

import './App.css'

function App() {
  return (
    <HashRouter>
      <SiteHeader />

      <Routes>
        <Route
          path="/"
          element={<CatalogPage />}
        />

        <Route
          path="/collection/J"
          element={
            <CatalogPage collectionCode="J" />
          }
        />

        <Route
          path="/collection/W"
          element={
            <CatalogPage collectionCode="W" />
          }
        />

        <Route
          path="/collection/V"
          element={<CatalogPage collectionCode="V" />}
        />
        
        <Route
          path="/manuscript/:id"
          element={<ManuscriptPage />}
        />

        <Route
          path="/about"
          element={<AboutPage />}
        />

        <Route
          path="/about/:section"
          element={<AboutPage />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
        
      </Routes>

      <SiteFooter />
    </HashRouter>
  )
}

export default App
