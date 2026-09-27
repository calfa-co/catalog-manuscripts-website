import {
  HashRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import SiteHeader from './components/SiteHeader'
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
          path="/manuscript/:id"
          element={<ManuscriptPage />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </HashRouter>
  )
}

export default App
